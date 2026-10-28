import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Play, Trash2, CheckCircle2, Lock, Volume2, Key, Sparkles, Filter, AlertCircle, Download, FileUp } from 'lucide-react';
import { audioStorage } from '../utils/audioStorage';
import { audioEngine } from '../utils/audioEngine';
import { CIRCUS_TENTS } from '../data/cvcData';
import { CVCWord } from '../types/phonics';

interface TeacherStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AudioItem {
  key: string;
  label: string;
  ipa: string;
  type: 'phoneme' | 'word';
  category?: string;
  charOrWord: string;
}

const ALL_PHONEMES: AudioItem[] = [
  // Short Vowels
  { key: 'phoneme_a', label: 'Short A', ipa: '/æ/ (as in apple)', type: 'phoneme', category: 'Vowel', charOrWord: 'a' },
  { key: 'phoneme_e', label: 'Short E', ipa: '/e/ (as in egg)', type: 'phoneme', category: 'Vowel', charOrWord: 'e' },
  { key: 'phoneme_i', label: 'Short I', ipa: '/ɪ/ (as in igloo)', type: 'phoneme', category: 'Vowel', charOrWord: 'i' },
  { key: 'phoneme_o', label: 'Short O', ipa: '/ɒ/ (as in pot)', type: 'phoneme', category: 'Vowel', charOrWord: 'o' },
  { key: 'phoneme_u', label: 'Short U', ipa: '/ʌ/ (as in umbrella)', type: 'phoneme', category: 'Vowel', charOrWord: 'u' },

  // Consonants
  { key: 'phoneme_b', label: 'Consonant B', ipa: '/b/', type: 'phoneme', category: 'Consonant', charOrWord: 'b' },
  { key: 'phoneme_c', label: 'Consonant C', ipa: '/k/', type: 'phoneme', category: 'Consonant', charOrWord: 'c' },
  { key: 'phoneme_d', label: 'Consonant D', ipa: '/d/', type: 'phoneme', category: 'Consonant', charOrWord: 'd' },
  { key: 'phoneme_f', label: 'Consonant F', ipa: '/f/', type: 'phoneme', category: 'Consonant', charOrWord: 'f' },
  { key: 'phoneme_g', label: 'Consonant G', ipa: '/ɡ/', type: 'phoneme', category: 'Consonant', charOrWord: 'g' },
  { key: 'phoneme_h', label: 'Consonant H', ipa: '/h/', type: 'phoneme', category: 'Consonant', charOrWord: 'h' },
  { key: 'phoneme_j', label: 'Consonant J', ipa: '/dʒ/', type: 'phoneme', category: 'Consonant', charOrWord: 'j' },
  { key: 'phoneme_k', label: 'Consonant K', ipa: '/k/', type: 'phoneme', category: 'Consonant', charOrWord: 'k' },
  { key: 'phoneme_l', label: 'Consonant L', ipa: '/l/', type: 'phoneme', category: 'Consonant', charOrWord: 'l' },
  { key: 'phoneme_m', label: 'Consonant M', ipa: '/m/', type: 'phoneme', category: 'Consonant', charOrWord: 'm' },
  { key: 'phoneme_n', label: 'Consonant N', ipa: '/n/', type: 'phoneme', category: 'Consonant', charOrWord: 'n' },
  { key: 'phoneme_p', label: 'Consonant P', ipa: '/p/', type: 'phoneme', category: 'Consonant', charOrWord: 'p' },
  { key: 'phoneme_r', label: 'Consonant R', ipa: '/r/', type: 'phoneme', category: 'Consonant', charOrWord: 'r' },
  { key: 'phoneme_s', label: 'Consonant S', ipa: '/s/', type: 'phoneme', category: 'Consonant', charOrWord: 's' },
  { key: 'phoneme_t', label: 'Consonant T', ipa: '/t/', type: 'phoneme', category: 'Consonant', charOrWord: 't' },
  { key: 'phoneme_v', label: 'Consonant V', ipa: '/v/', type: 'phoneme', category: 'Consonant', charOrWord: 'v' },
  { key: 'phoneme_w', label: 'Consonant W', ipa: '/w/', type: 'phoneme', category: 'Consonant', charOrWord: 'w' },
  { key: 'phoneme_x', label: 'Consonant X', ipa: '/ks/', type: 'phoneme', category: 'Consonant', charOrWord: 'x' },
  { key: 'phoneme_y', label: 'Consonant Y', ipa: '/j/', type: 'phoneme', category: 'Consonant', charOrWord: 'y' },
  { key: 'phoneme_z', label: 'Consonant Z', ipa: '/z/', type: 'phoneme', category: 'Consonant', charOrWord: 'z' },
];

export const TeacherStudioModal: React.FC<TeacherStudioModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'phonemes' | 'words' | 'settings'>('phonemes');
  const [selectedTentFilter, setSelectedTentFilter] = useState<string>('a');
  const [customAudioKeys, setCustomAudioKeys] = useState<Set<string>>(new Set());

  // PIN settings state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeMessage, setPinChangeMessage] = useState<string | null>(null);
  const [packFeedbackMessage, setPackFeedbackMessage] = useState<string | null>(null);

  // Hidden file input for audio upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importPackInputRef = useRef<HTMLInputElement | null>(null);
  const targetUploadKeyRef = useRef<string | null>(null);

  const handleExportAudioPack = async () => {
    try {
      const pack = await audioStorage.exportAudioPack();
      const keysCount = Object.keys(pack).length;
      if (keysCount === 0) {
        setPackFeedbackMessage('No custom audio recorded yet to export.');
        return;
      }
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pack));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'circus_phonics_custom_audio_pack.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setPackFeedbackMessage(`Exported ${keysCount} custom audio clip(s) successfully!`);
    } catch {
      setPackFeedbackMessage('Failed to export audio pack.');
    }
  };

  const handleImportAudioPackFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const content = evt.target?.result as string;
          const parsed = JSON.parse(content);
          if (typeof parsed === 'object' && parsed !== null) {
            const count = await audioStorage.importAudioPack(parsed);
            await loadCustomKeys();
            setPackFeedbackMessage(`Imported ${count} custom audio clip(s) successfully! All playable now.`);
          }
        } catch {
          setPackFeedbackMessage('Invalid audio pack file.');
        }
      };
      reader.readAsText(file);
    } catch {
      setPackFeedbackMessage('Error reading file.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCustomKeys();
    }
  }, [isOpen]);

  const loadCustomKeys = async () => {
    const keys = await audioStorage.getAllCustomAudioKeys();
    setCustomAudioKeys(new Set(keys));
  };

  if (!isOpen) return null;

  // --- File Upload Handlers ---
  const handleUploadClick = (key: string) => {
    targetUploadKeyRef.current = key;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = targetUploadKeyRef.current;
    if (!file || !key) return;

    await audioStorage.saveCustomAudio(key, file);
    await loadCustomKeys();
  };

  const handleDeleteAudio = async (key: string) => {
    await audioStorage.deleteCustomAudio(key);
    await loadCustomKeys();
  };

  const handleTestPlay = async (item: AudioItem) => {
    if (item.type === 'phoneme') {
      await audioEngine.speakPhoneme(item.charOrWord, 'vowel');
    } else {
      await audioEngine.speakWord(item.charOrWord);
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = audioStorage.getTeacherPIN();
    if (currentPinInput !== storedPin) {
      setPinChangeMessage('Current PIN is incorrect.');
      return;
    }
    if (newPinInput.length !== 4 || !/^\d{4}$/.test(newPinInput)) {
      setPinChangeMessage('New PIN must be exactly 4 digits.');
      return;
    }

    audioStorage.setTeacherPIN(newPinInput);
    setPinChangeMessage('Teacher PIN successfully updated!');
    setCurrentPinInput('');
    setNewPinInput('');
  };

  const wordsForSelectedTent: CVCWord[] =
    CIRCUS_TENTS.find(t => t.id === selectedTentFilter)?.words || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs select-none animate-fadeIn">
      {/* Hidden File Input for Audio Files */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Hidden File Input for Audio Pack JSON Import */}
      <input
        ref={importPackInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportAudioPackFile}
      />

      <div className="relative w-full max-w-4xl bg-gradient-to-b from-white via-amber-50/50 to-orange-50 rounded-3xl p-5 sm:p-7 border-4 border-yellow-400 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer z-10"
          aria-label="Close Teacher Studio"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/30 rounded-full border border-yellow-400 text-xs font-bold text-amber-900 mb-1">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Teacher Audio Studio · British Phonics Customizer</span>
          </div>
          <h2 className="font-fun text-2xl sm:text-3xl font-black text-red-600">
            Audio Recording & Upload Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Record your own voice or upload audio files for individual phonemes and words. Falls back to British English (en-GB).
          </p>

          {/* Tab Selector */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab('phonemes')}
              className={`px-4 py-2 rounded-xl font-fun text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'phonemes'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white hover:bg-amber-100 text-slate-700 border border-amber-200'
              }`}
            >
              1. Individual Phonemes (22)
            </button>
            <button
              onClick={() => setActiveTab('words')}
              className={`px-4 py-2 rounded-xl font-fun text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'words'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white hover:bg-amber-100 text-slate-700 border border-amber-200'
              }`}
            >
              2. CVC Words (40)
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl font-fun text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white hover:bg-amber-100 text-slate-700 border border-amber-200'
              }`}
            >
              3. PIN & Reset
            </button>
          </div>
        </div>

        {/* Tab 1: Individual Phonemes */}
        {activeTab === 'phonemes' && (
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="bg-amber-100/60 p-3 rounded-2xl border border-amber-300 text-xs text-amber-900 mb-3 flex items-center justify-between">
              <span>
                💡 <strong>Teacher Tip:</strong> All phonemes play pure British Received Pronunciation by default. You can upload custom audio files (.mp3, .wav) if desired.
              </span>
              <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-md text-amber-800 text-[11px]">
                {customAudioKeys.size} custom clips active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {ALL_PHONEMES.map(item => {
                const hasCustom = customAudioKeys.has(item.key);

                return (
                  <div
                    key={item.key}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      hasCustom
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                        : 'bg-white border-amber-200'
                    }`}
                  >
                    {/* Item Information */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white font-fun text-xl font-bold flex items-center justify-center shadow-xs">
                        {item.charOrWord}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-fun font-bold text-slate-900 text-sm">
                            {item.label}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {item.ipa}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold block ${hasCustom ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {hasCustom ? '✨ Custom Teacher Audio Active' : '🇬🇧 Pure British Phonics Sound'}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1.5">
                      {/* Play Test Button */}
                      <button
                        onClick={() => handleTestPlay(item)}
                        className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer flex items-center gap-1 text-xs font-bold"
                        title={hasCustom ? 'Play Your Custom Audio' : 'Play Built-in Pure British Phonics'}
                      >
                        <Play className="w-4 h-4" />
                        <span className="hidden sm:inline">{hasCustom ? 'Custom' : 'British'}</span>
                      </button>

                      {/* File Upload Button */}
                      <button
                        onClick={() => handleUploadClick(item.key)}
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer"
                        title="Upload Audio File (MP3, WAV)"
                      >
                        <Upload className="w-4 h-4" />
                      </button>

                      {/* Delete / Revert Button */}
                      {hasCustom && (
                        <button
                          onClick={() => handleDeleteAudio(item.key)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Reset to British System Voice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: CVC Words */}
        {activeTab === 'words' && (
          <div className="flex-1 overflow-y-auto pr-1">
            {/* Tent Selector */}
            <div className="flex items-center justify-between gap-2 mb-3 bg-white p-2 rounded-2xl border border-amber-200">
              <span className="text-xs font-bold text-slate-500">Filter Tent:</span>
              <div className="flex items-center gap-1">
                {CIRCUS_TENTS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTentFilter(t.id)}
                    className={`px-3 py-1.5 rounded-xl font-fun text-xs font-bold transition-all cursor-pointer ${
                      selectedTentFilter === t.id
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-amber-50 hover:bg-amber-100 text-slate-700'
                    }`}
                  >
                    Tent {t.vowel.toUpperCase()} ({t.ipa})
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {wordsForSelectedTent.map(word => {
                const itemKey = `word_${word.word.toLowerCase()}`;
                const hasCustom = customAudioKeys.has(itemKey);

                return (
                  <div
                    key={word.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      hasCustom
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                        : 'bg-white border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{word.correctPicture.emoji}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-fun font-bold text-slate-900 text-base">
                            {word.word}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            {word.fullIPA}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold block ${hasCustom ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {hasCustom ? '✨ Custom Teacher Audio Active' : '🇬🇧 Natural British Word'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => audioEngine.speakWord(word.word)}
                        className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer flex items-center gap-1 text-xs font-bold"
                        title={hasCustom ? 'Play Your Custom Audio' : 'Play Natural British Word Pronunciation'}
                      >
                        <Play className="w-4 h-4" />
                        <span className="hidden sm:inline">{hasCustom ? 'Custom' : 'British'}</span>
                      </button>

                      <button
                        onClick={() => handleUploadClick(itemKey)}
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer"
                        title="Upload Audio File (MP3, WAV)"
                      >
                        <Upload className="w-4 h-4" />
                      </button>

                      {hasCustom && (
                        <button
                          onClick={() => handleDeleteAudio(itemKey)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Reset to British System Voice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: PIN & Settings */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full pt-4">
            <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-5 h-5 text-amber-600" />
                <h3 className="font-fun text-lg font-bold text-slate-900">
                  Change Teacher Security PIN
                </h3>
              </div>

              <form onSubmit={handleChangePin} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Current PIN:
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={currentPinInput}
                    onChange={e => setCurrentPinInput(e.target.value)}
                    placeholder="Enter current 4 digits"
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 text-sm font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    New 4-Digit PIN:
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={newPinInput}
                    onChange={e => setNewPinInput(e.target.value)}
                    placeholder="e.g. 5678"
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 text-sm font-mono font-bold"
                  />
                </div>

                {pinChangeMessage && (
                  <div className="text-xs font-bold text-amber-900 p-2 bg-amber-50 rounded-xl border border-amber-200">
                    {pinChangeMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-fun text-sm font-bold shadow-md cursor-pointer"
                >
                  Update Teacher PIN
                </button>
              </form>
            </div>

            {/* Export & Import Audio Pack */}
            <div className="mt-4 bg-white rounded-3xl p-5 border-2 border-indigo-200 shadow-sm text-center">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <Download className="w-5 h-5 text-indigo-600" />
                <h4 className="font-fun text-base font-bold text-slate-900">
                  Share & Backup Custom Audio Pack
                </h4>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Download your custom audio clips to a single file, or load them onto student tablets & classroom smartboards.
              </p>

              {packFeedbackMessage && (
                <div className="mb-3 text-xs font-bold text-indigo-900 p-2 bg-indigo-50 rounded-xl border border-indigo-200">
                  {packFeedbackMessage}
                </div>
              )}

              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportAudioPack}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-fun text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Audio Pack (.json)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (importPackInputRef.current) {
                      importPackInputRef.current.value = '';
                      importPackInputRef.current.click();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-fun text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Import Audio Pack</span>
                </button>
              </div>
            </div>

            {/* Clear All Custom Audio Action */}
            <div className="mt-4 p-4 bg-rose-50 rounded-2xl border border-rose-200 text-center">
              <span className="text-xs text-rose-700 font-bold block mb-2">
                Need to reset all teacher audio back to pure British English fallbacks?
              </span>
              <button
                onClick={async () => {
                  if (window.confirm('Delete all custom audio clips and return to British English system voices?')) {
                    await audioStorage.clearAllCustomAudio();
                    await loadCustomKeys();
                    alert('All custom audio cleared.');
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-fun text-xs font-bold rounded-xl cursor-pointer"
              >
                Clear All Custom Audio Clips
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-amber-200 mt-4 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Audio saved locally on device in IndexedDB. Fully offline.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-fun text-sm font-bold cursor-pointer"
          >
            Done & Save
          </button>
        </div>
      </div>
    </div>
  );
};
