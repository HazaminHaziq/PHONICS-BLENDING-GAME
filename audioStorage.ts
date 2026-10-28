// Persistent IndexedDB & LocalStorage Audio Storage for Teacher Phonics Audio

const DB_NAME = 'circus_phonics_audio_db';
const STORE_NAME = 'custom_audio_clips';
const DB_VERSION = 1;
const PIN_STORAGE_KEY = 'circus_teacher_pin_v1';
const DEFAULT_PIN = '1234';

class AudioStorageManager {
  private db: IDBDatabase | null = null;
  private memoryCache: Map<string, string> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
    }
  }

  public initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = event => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = event => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  public async saveCustomAudio(key: string, audioData: Blob | string): Promise<void> {
    const db = await this.initDB();
    let dataUrl: string;

    if (audioData instanceof Blob) {
      dataUrl = await this.blobToDataURL(audioData);
    } else {
      dataUrl = audioData;
    }

    this.memoryCache.set(key, dataUrl);

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataUrl, key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getCustomAudio(key: string): Promise<string | null> {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key) || null;
    }

    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          const res = req.result as string | undefined;
          if (res) {
            this.memoryCache.set(key, res);
            resolve(res);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  public async getAllCustomAudioKeys(): Promise<string[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAllKeys();

        req.onsuccess = () => {
          resolve((req.result as string[]) || []);
        };

        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  public async deleteCustomAudio(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // ignore
    }
  }

  public async clearAllCustomAudio(): Promise<void> {
    this.memoryCache.clear();
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();

        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
  }

  public async exportAudioPack(): Promise<Record<string, string>> {
    const keys = await this.getAllCustomAudioKeys();
    const pack: Record<string, string> = {};
    for (const key of keys) {
      const audio = await this.getCustomAudio(key);
      if (audio) {
        pack[key] = audio;
      }
    }
    return pack;
  }

  public async importAudioPack(pack: Record<string, string>): Promise<number> {
    let count = 0;
    for (const [key, audioData] of Object.entries(pack)) {
      if (key && typeof audioData === 'string' && audioData.startsWith('data:audio')) {
        await this.saveCustomAudio(key, audioData);
        count++;
      }
    }
    return count;
  }

  // --- Teacher PIN Management ---

  public getTeacherPIN(): string {
    if (typeof window === 'undefined') return DEFAULT_PIN;
    try {
      return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
    } catch {
      return DEFAULT_PIN;
    }
  }

  public setTeacherPIN(pin: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PIN_STORAGE_KEY, pin);
    } catch {
      // ignore
    }
  }

  public blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const audioStorage = new AudioStorageManager();
