// Enhanced Audio Engine with Custom Audio Storage & Strict British English (en-GB) Fallback
import { audioStorage } from './audioStorage';

class PhonicsAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private speechRate: number = 0.85;
  private selectedBritishVoice: SpeechSynthesisVoice | null = null;
  private activeAudioElement: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initBritishVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => this.initBritishVoices();
      }

      // Automatically unlock AudioContext on first tap/click anywhere (iOS, Android, Smartboards)
      const unlock = () => {
        const ctx = this.getAudioContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('pointerdown', unlock);
      };
      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
      window.addEventListener('pointerdown', unlock, { passive: true });
    }
  }

  // Prioritize authentic British English (en-GB) voices
  public initBritishVoices(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. First priority: Strict en-GB British natural / premium voices
    const britishVoices = voices.filter(v => {
      const lang = (v.lang || '').toLowerCase().replace('_', '-');
      const name = (v.name || '').toLowerCase();
      return (
        lang === 'en-gb' ||
        lang.startsWith('en-gb') ||
        name.includes('united kingdom') ||
        name.includes('uk english') ||
        name.includes('british') ||
        name.includes('great britain') ||
        name.includes('daniel') ||
        name.includes('oliver') ||
        name.includes('serena') ||
        name.includes('stephanie') ||
        name.includes('hazel') ||
        name.includes('george')
      );
    });

    const preferredBritish = britishVoices.find(v => {
      const name = (v.name || '').toLowerCase();
      return (
        name.includes('natural') ||
        name.includes('google uk english female') ||
        name.includes('google uk english male') ||
        name.includes('daniel') ||
        name.includes('oliver') ||
        name.includes('serena')
      );
    }) || britishVoices[0];

    if (preferredBritish) {
      this.selectedBritishVoice = preferredBritish;
      return preferredBritish;
    }

    // 2. Secondary Commonwealth fallback (Australian, Irish, New Zealand)
    const commonwealth = voices.find(v => {
      const lang = (v.lang || '').toLowerCase().replace('_', '-');
      return lang.startsWith('en-au') || lang.startsWith('en-ie') || lang.startsWith('en-nz');
    });

    if (commonwealth) {
      this.selectedBritishVoice = commonwealth;
      return commonwealth;
    }

    return null;
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAllPlayback();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setRate(rate: number) {
    this.speechRate = Math.max(0.6, Math.min(1.2, rate));
  }

  public getRate(): number {
    return this.speechRate;
  }

  // Helper to play custom audio file/blob from IndexedDB
  private async playCustomAudio(dataUrl: string): Promise<void> {
    if (this.isMuted) return;
    this.stopAllPlayback();

    // 1. Try standard HTMLAudioElement
    try {
      await new Promise<void>((resolve, reject) => {
        const audio = new Audio();
        this.activeAudioElement = audio;
        audio.onended = () => {
          this.activeAudioElement = null;
          resolve();
        };
        audio.onerror = () => {
          this.activeAudioElement = null;
          reject();
        };
        audio.src = dataUrl;
        audio.play().catch(reject);
      });
      return;
    } catch {
      // 2. Fallback: decode via AudioContext for Safari / mobile WebKit support
      try {
        const ctx = this.getAudioContext();
        if (ctx) {
          const resp = await fetch(dataUrl);
          const arrayBuf = await resp.arrayBuffer();
          const audioBuf = await ctx.decodeAudioData(arrayBuf);
          const src = ctx.createBufferSource();
          src.buffer = audioBuf;
          src.connect(ctx.destination);
          src.start();
          await new Promise(r => setTimeout(r, Math.max(200, audioBuf.duration * 1000 + 40)));
          return;
        }
      } catch {
        // ignore
      }
    }
  }

  // --- Primary Phonics Vocalization (Custom Audio First -> Pure British Acoustic Synthesis) ---

  /**
   * Generates pure isolated British English phonemes using acoustic formant and noise synthesis.
   * Completely avoids letter names (e.g. "ay", "bee", "see") and avoids intrusive schwas (e.g. "buh", "kuh").
   */
  public playPureBritishPhonemeAcoustic(char: string, type: 'onset' | 'vowel' | 'rime'): Promise<void> {
    return new Promise((resolve) => {
      if (this.isMuted) {
        resolve();
        return;
      }

      const ctx = this.getAudioContext();
      if (!ctx) {
        resolve();
        return;
      }

      this.stopAllPlayback();

      const c = char.toLowerCase();
      const t = ctx.currentTime;

      // Helper to generate a buffer of white noise
      const createNoiseBuffer = (durationSec: number) => {
        const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1);
        }
        return buffer;
      };

      // Vowels: British RP Formant Synthesis (/æ/, /e/, /ɪ/, /ɒ/, /ʌ/)
      if (type === 'vowel' || ['a', 'e', 'i', 'o', 'u'].includes(c)) {
        let f1 = 700;
        let f2 = 1500;
        let f3 = 2450;
        let f0 = 145; // Natural British friendly child/teacher pitch

        switch (c) {
          case 'a': // /æ/ open front unrounded (apple, cat, bag)
            f1 = 720; f2 = 1520; f3 = 2450; f0 = 145; break;
          case 'e': // /e/ mid front unrounded (egg, bed, red)
            f1 = 530; f2 = 1840; f3 = 2550; f0 = 150; break;
          case 'i': // /ɪ/ near-close front unrounded (igloo, pin, sit)
            f1 = 390; f2 = 2100; f3 = 2750; f0 = 155; break;
          case 'o': // /ɒ/ open back rounded (octopus, pot, dog)
            f1 = 570; f2 = 920;  f3 = 2400; f0 = 138; break;
          case 'u': // /ʌ/ open-mid back unrounded (umbrella, cup, sun)
            f1 = 640; f2 = 1250; f3 = 2400; f0 = 142; break;
        }

        const duration = 0.28;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f0, t);
        osc.frequency.linearRampToValueAtTime(f0 * 0.96, t + duration);

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(3200, t);

        const bp1 = ctx.createBiquadFilter();
        bp1.type = 'bandpass';
        bp1.frequency.setValueAtTime(f1, t);
        bp1.Q.value = 5.5;

        const bp2 = ctx.createBiquadFilter();
        bp2.type = 'bandpass';
        bp2.frequency.setValueAtTime(f2, t);
        bp2.Q.value = 7.0;

        const bp3 = ctx.createBiquadFilter();
        bp3.type = 'bandpass';
        bp3.frequency.setValueAtTime(f3, t);
        bp3.Q.value = 8.0;

        const gain1 = ctx.createGain(); gain1.gain.value = 0.5;
        const gain2 = ctx.createGain(); gain2.gain.value = 0.35;
        const gain3 = ctx.createGain(); gain3.gain.value = 0.15;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, t);
        masterGain.gain.linearRampToValueAtTime(0.42, t + 0.02);
        masterGain.gain.setValueAtTime(0.42, t + duration - 0.07);
        masterGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(lowpass);
        lowpass.connect(bp1); bp1.connect(gain1); gain1.connect(masterGain);
        lowpass.connect(bp2); bp2.connect(gain2); gain2.connect(masterGain);
        lowpass.connect(bp3); bp3.connect(gain3); gain3.connect(masterGain);
        masterGain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + duration);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: s (pure alveolar sibilant hiss, no "ess", no "suh")
      if (c === 's') {
        const duration = 0.24;
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(duration);

        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(4500, t);

        const peak = ctx.createBiquadFilter();
        peak.type = 'peaking';
        peak.frequency.setValueAtTime(6500, t);
        peak.gain.value = 8;
        peak.Q.value = 3.0;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
        gain.gain.setValueAtTime(0.35, t + duration - 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        noise.connect(hp);
        hp.connect(peak);
        peak.connect(gain);
        gain.connect(ctx.destination);

        noise.start(t);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: t (pure crisp unvoiced alveolar burst, no "tuh")
      if (c === 't') {
        const duration = 0.035;
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(duration);

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(4200, t);
        bp.Q.value = 3.5;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.65, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        noise.connect(bp);
        bp.connect(gain);
        gain.connect(ctx.destination);

        noise.start(t);
        setTimeout(resolve, (duration + 0.06) * 1000);
        return;
      }

      // Consonant: p (pure soft voiceless bilabial plosive, no "puh")
      if (c === 'p') {
        const duration = 0.04;
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(duration);

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(750, t);
        bp.Q.value = 1.8;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        noise.connect(bp);
        bp.connect(gain);
        gain.connect(ctx.destination);

        noise.start(t);
        setTimeout(resolve, (duration + 0.06) * 1000);
        return;
      }

      // Consonant: c / k (pure unvoiced velar burst, no "kuh")
      if (c === 'c' || c === 'k') {
        const duration = 0.045;
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(duration);

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(1950, t);
        bp.Q.value = 3.2;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.58, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        noise.connect(bp);
        bp.connect(gain);
        gain.connect(ctx.destination);

        noise.start(t);
        setTimeout(resolve, (duration + 0.06) * 1000);
        return;
      }

      // Consonant: b (pure voiced bilabial transient, no "buh")
      if (c === 'b') {
        const duration = 0.06;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(125, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + duration);

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(400, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.65, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(lp);
        lp.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + duration);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: d (pure voiced alveolar transient, no "duh")
      if (c === 'd') {
        const duration = 0.055;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(95, t + duration);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + duration);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: g (pure voiced velar transient, no "guh")
      if (c === 'g') {
        const duration = 0.06;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(135, t);
        osc.frequency.exponentialRampToValueAtTime(85, t + duration);

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(1500, t);
        bp.Q.value = 2.0;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.55, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + duration);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: m (pure bilabial nasal hum, "mmmm", no "em", no "muh")
      if (c === 'm') {
        const duration = 0.28;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(132, t);

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(450, t);

        const peak = ctx.createBiquadFilter();
        peak.type = 'peaking';
        peak.frequency.setValueAtTime(260, t);
        peak.gain.value = 7.0;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.48, t + 0.03);
        gain.gain.setValueAtTime(0.48, t + duration - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(lp);
        lp.connect(peak);
        peak.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + duration);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: n (pure alveolar nasal hum, "nnnn", no "en", no "nuh")
      if (c === 'n') {
        const duration = 0.28;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(138, t);

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(650, t);

        const peak = ctx.createBiquadFilter();
        peak.type = 'peaking';
        peak.frequency.setValueAtTime(320, t);
        peak.gain.value = 6.0;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.46, t + 0.03);
        gain.gain.setValueAtTime(0.46, t + duration - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(lp);
        lp.connect(peak);
        peak.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + duration);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: f (pure labiodental friction, no "eff", no "fuh")
      if (c === 'f') {
        const duration = 0.22;
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(duration);

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(2600, t);
        bp.Q.value = 1.2;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.36, t + 0.03);
        gain.gain.setValueAtTime(0.36, t + duration - 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        noise.connect(bp);
        bp.connect(gain);
        gain.connect(ctx.destination);

        noise.start(t);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: h (pure glottal whisper breath, no "aitch", no "huh")
      if (c === 'h') {
        const duration = 0.20;
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(duration);

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(1150, t);
        bp.Q.value = 1.0;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.38, t + 0.03);
        gain.gain.setValueAtTime(0.38, t + duration - 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        noise.connect(bp);
        bp.connect(gain);
        gain.connect(ctx.destination);

        noise.start(t);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: l (lateral approximant, "llll", no "el", no "luh")
      if (c === 'l') {
        const duration = 0.26;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, t);

        const bp1 = ctx.createBiquadFilter();
        bp1.type = 'bandpass';
        bp1.frequency.setValueAtTime(360, t);
        bp1.Q.value = 5.0;

        const bp2 = ctx.createBiquadFilter();
        bp2.type = 'bandpass';
        bp2.frequency.setValueAtTime(1150, t);
        bp2.Q.value = 6.0;

        const gain1 = ctx.createGain(); gain1.gain.value = 0.5;
        const gain2 = ctx.createGain(); gain2.gain.value = 0.4;

        const master = ctx.createGain();
        master.gain.setValueAtTime(0.001, t);
        master.gain.linearRampToValueAtTime(0.45, t + 0.03);
        master.gain.setValueAtTime(0.45, t + duration - 0.05);
        master.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(bp1); bp1.connect(gain1); gain1.connect(master);
        osc.connect(bp2); bp2.connect(gain2); gain2.connect(master);
        master.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + duration);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: r (British non-rhotic postalveolar approximant, "rrr", no "ar")
      if (c === 'r') {
        const duration = 0.26;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(126, t);

        const bp1 = ctx.createBiquadFilter();
        bp1.type = 'bandpass';
        bp1.frequency.setValueAtTime(360, t);
        bp1.Q.value = 5.0;

        const bp2 = ctx.createBiquadFilter();
        bp2.type = 'bandpass';
        bp2.frequency.setValueAtTime(1250, t);
        bp2.Q.value = 6.0;

        const gain1 = ctx.createGain(); gain1.gain.value = 0.5;
        const gain2 = ctx.createGain(); gain2.gain.value = 0.35;

        const master = ctx.createGain();
        master.gain.setValueAtTime(0.001, t);
        master.gain.linearRampToValueAtTime(0.42, t + 0.03);
        master.gain.setValueAtTime(0.42, t + duration - 0.05);
        master.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(bp1); bp1.connect(gain1); gain1.connect(master);
        osc.connect(bp2); bp2.connect(gain2); gain2.connect(master);
        master.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + duration);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: w (labial-velar approximant, "w", no "double-u")
      if (c === 'w') {
        const duration = 0.24;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.linearRampToValueAtTime(138, t + duration);

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(320, t);
        bp.frequency.linearRampToValueAtTime(800, t + duration);
        bp.Q.value = 4.0;

        const master = ctx.createGain();
        master.gain.setValueAtTime(0.001, t);
        master.gain.linearRampToValueAtTime(0.45, t + 0.03);
        master.gain.setValueAtTime(0.45, t + duration - 0.05);
        master.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(bp);
        bp.connect(master);
        master.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + duration);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: j (voiced affricate /dʒ/, "dj", no "jay")
      if (c === 'j') {
        const duration = 0.16;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(135, t);
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.06);

        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(duration);

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(2800, t);
        bp.Q.value = 2.5;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.001, t);
        noiseGain.gain.linearRampToValueAtTime(0.45, t + 0.02);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.5, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        osc.connect(oscGain); oscGain.connect(ctx.destination);
        noise.connect(bp); bp.connect(noiseGain); noiseGain.connect(ctx.destination);

        osc.start(t); osc.stop(t + 0.06);
        noise.start(t);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: v (voiced labiodental, "vvvv", no "vee")
      if (c === 'v') {
        const duration = 0.22;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(125, t);

        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(duration);

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(2400, t);
        bp.Q.value = 1.5;

        const master = ctx.createGain();
        master.gain.setValueAtTime(0.001, t);
        master.gain.linearRampToValueAtTime(0.38, t + 0.02);
        master.gain.setValueAtTime(0.38, t + duration - 0.04);
        master.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(master);
        noise.connect(bp); bp.connect(master);
        master.connect(ctx.destination);

        osc.start(t); osc.stop(t + duration);
        noise.start(t);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: z (voiced alveolar sibilant, "zzzz", no "zed")
      if (c === 'z') {
        const duration = 0.24;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130, t);

        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(duration);

        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(4500, t);

        const master = ctx.createGain();
        master.gain.setValueAtTime(0.001, t);
        master.gain.linearRampToValueAtTime(0.36, t + 0.02);
        master.gain.setValueAtTime(0.36, t + duration - 0.04);
        master.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(master);
        noise.connect(hp); hp.connect(master);
        master.connect(ctx.destination);

        osc.start(t); osc.stop(t + duration);
        noise.start(t);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: x (/ks/ - rapid k into sharp s)
      if (c === 'x') {
        const duration = 0.22;
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(duration);

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(2000, t);
        bp.frequency.linearRampToValueAtTime(5500, t + 0.04);
        bp.Q.value = 3.0;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.55, t);
        gain.gain.setValueAtTime(0.35, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        noise.connect(bp); bp.connect(gain); gain.connect(ctx.destination);
        noise.start(t);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Consonant: y (palatal approximant /j/, "y", no "wy")
      if (c === 'y') {
        const duration = 0.24;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(138, t);

        const bp1 = ctx.createBiquadFilter();
        bp1.type = 'bandpass';
        bp1.frequency.setValueAtTime(280, t);
        bp1.Q.value = 5.0;

        const bp2 = ctx.createBiquadFilter();
        bp2.type = 'bandpass';
        bp2.frequency.setValueAtTime(2200, t);
        bp2.Q.value = 6.0;

        const gain1 = ctx.createGain(); gain1.gain.value = 0.5;
        const gain2 = ctx.createGain(); gain2.gain.value = 0.4;

        const master = ctx.createGain();
        master.gain.setValueAtTime(0.001, t);
        master.gain.linearRampToValueAtTime(0.42, t + 0.03);
        master.gain.setValueAtTime(0.42, t + duration - 0.05);
        master.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(bp1); bp1.connect(gain1); gain1.connect(master);
        osc.connect(bp2); bp2.connect(gain2); gain2.connect(master);
        master.connect(ctx.destination);

        osc.start(t); osc.stop(t + duration);
        setTimeout(resolve, (duration + 0.05) * 1000);
        return;
      }

      // Default fallback chime
      this.playTilePop(440);
      setTimeout(resolve, 200);
    });
  }

  public async speakPhoneme(char: string, type: 'onset' | 'vowel' | 'rime'): Promise<void> {
    if (this.isMuted) return;

    // 1. Check for custom recorded/uploaded audio in IndexedDB
    const customKey = `phoneme_${char.toLowerCase()}`;
    const customAudio = await audioStorage.getCustomAudio(customKey);
    if (customAudio) {
      await this.playCustomAudio(customAudio);
      return;
    }

    // 2. Play pure isolated British acoustic phoneme (zero letter names, zero schwa)
    await this.playPureBritishPhonemeAcoustic(char, type);
  }

  public async speakWord(word: string, emphasis: boolean = false): Promise<void> {
    if (this.isMuted) return;

    // 1. Check for custom recorded/uploaded audio in IndexedDB
    const customKey = `word_${word.toLowerCase()}`;
    const customAudio = await audioStorage.getCustomAudio(customKey);
    if (customAudio) {
      await this.playCustomAudio(customAudio);
      return;
    }

    // Refresh voice list in case voices loaded asynchronously
    if (!this.selectedBritishVoice) {
      this.initBritishVoices();
    }

    // 2. If SpeechSynthesis has an authentic British / UK voice
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.selectedBritishVoice) {
      return new Promise(resolve => {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(word);
        utter.voice = this.selectedBritishVoice;
        utter.lang = this.selectedBritishVoice?.lang || 'en-GB';
        utter.rate = emphasis ? this.speechRate : this.speechRate * 0.95;
        utter.pitch = 1.05;

        utter.onend = () => resolve();
        utter.onerror = () => resolve();

        window.speechSynthesis.speak(utter);
        setTimeout(resolve, 1100);
      });
    }

    // 3. Perfect Acoustic Consistency:
    // If no British voice exists on this device/operating system (e.g. mobile devices with US default),
    // synthesize the pure British acoustic blend of the letters so the sound is identical across all devices!
    const cleanWord = word.trim().toLowerCase();
    if (cleanWord.length === 3) {
      const onset = cleanWord[0];
      const vowel = cleanWord[1];
      const rime = cleanWord[2];
      await this.playPureBritishPhonemeAcoustic(onset, 'onset');
      await new Promise(r => setTimeout(r, 60));
      await this.playPureBritishPhonemeAcoustic(vowel, 'vowel');
      await new Promise(r => setTimeout(r, 60));
      await this.playPureBritishPhonemeAcoustic(rime, 'rime');
      return;
    }

    // Fallback for longer phrases
    return new Promise(resolve => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setTimeout(resolve, 500);
        return;
      }

      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = 'en-GB';
      utter.rate = this.speechRate;
      utter.pitch = 1.05;

      utter.onend = () => resolve();
      utter.onerror = () => resolve();

      window.speechSynthesis.speak(utter);
      setTimeout(resolve, 1100);
    });
  }

  public speakClue(clue: string): Promise<void> {
    if (!this.selectedBritishVoice) {
      this.initBritishVoices();
    }
    return new Promise(resolve => {
      if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setTimeout(resolve, 500);
        return;
      }

      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(clue);
      utter.lang = 'en-GB';
      if (this.selectedBritishVoice) {
        utter.voice = this.selectedBritishVoice;
      }
      utter.rate = this.speechRate;
      utter.pitch = 1.05;

      utter.onend = () => resolve();
      utter.onerror = () => resolve();

      window.speechSynthesis.speak(utter);
      setTimeout(resolve, 2000);
    });
  }

  public stopAllPlayback() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.activeAudioElement) {
      this.activeAudioElement.pause();
      this.activeAudioElement = null;
    }
  }

  public stopAllSpeech() {
    this.stopAllPlayback();
  }

  // ==========================================
  // CARNIVAL SOUND EFFECTS (PRESERVED IN FULL)
  // ==========================================

  public playBalloonPop() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.Q.value = 3.0;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  public playBalloonWobble() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(220, t + 0.12);
    osc.frequency.linearRampToValueAtTime(280, t + 0.24);
    osc.frequency.linearRampToValueAtTime(180, t + 0.35);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.38);
  }

  public playDingPerfectBlend() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Victory fanfare arpeggio: C5 - E5 - G5 - C6 - E6
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, idx) => {
      const start = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.24, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.52);
    });
  }

  public playSuccessFanfare() {
    this.playDingPerfectBlend();
  }

  public playHighStrikerBell() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const harmonics = [1046.5, 2093, 3135.9, 4186];
    const t = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.5, t);
    master.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
    master.connect(ctx.destination);

    harmonics.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.4 / (idx + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (1.8 - idx * 0.3));
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + 2.0);
    });
  }

  public playAnvilHit(powerMultiplier: number = 1) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const power = Math.max(0.5, Math.min(1.8, powerMultiplier));

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(260, t);
    osc1.frequency.exponentialRampToValueAtTime(50, t + 0.22);
    gain1.gain.setValueAtTime(0.6 * power, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.25);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1200, t);
    gain2.gain.setValueAtTime(0.35 * power, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.15);
  }

  public playPuckWhoosh() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.28);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.42);
  }

  public playPuckSlideClick() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(700 + Math.random() * 300, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  public playGentleBoing() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(190, ctx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  public playTicketSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  public playTilePop(freq: number = 440) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }
}

export const audioEngine = new PhonicsAudioEngine();
