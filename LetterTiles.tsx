import React, { useState } from 'react';
import { Volume2, Sparkles, ChevronLeft, ChevronRight, HelpCircle, Lightbulb, X } from 'lucide-react';
import { CVCWord } from '../types/phonics';
import { audioEngine } from '../utils/audioEngine';

interface LetterTilesProps {
  word: CVCWord;
  activeTile: 'onset' | 'vowel' | 'rime' | 'all' | null;
  onTapTile: (type: 'onset' | 'vowel' | 'rime') => void;
  onListenPhonemes: () => void;
  onBlendWord: () => void;
  isPlayingPhonemes: boolean;
  isBlending: boolean;
  onPrevWord: () => void;
  onNextWord: () => void;
  currentIndex: number;
  totalWords: number;
  allWords: CVCWord[];
  onSelectWord: (index: number) => void;
}

export const LetterTiles: React.FC<LetterTilesProps> = ({
  word,
  activeTile,
  onTapTile,
  onListenPhonemes,
  onBlendWord,
  isPlayingPhonemes,
  isBlending,
  onPrevWord,
  onNextWord,
  currentIndex,
  totalWords,
  allWords,
  onSelectWord
}) => {
  const [showClueModal, setShowClueModal] = useState<boolean>(false);

  const handleOpenClue = () => {
    setShowClueModal(true);
    audioEngine.speakClue(`Ringleader clue: ${word.clueText}`);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Top Word Navigation Bar & Word Selector Carousel */}
      <div className="w-full flex items-center justify-between gap-3 mb-3 bg-white/90 rounded-2xl p-2.5 border border-amber-200 shadow-xs">
        <button
          onClick={onPrevWord}
          className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-all btn-tactile cursor-pointer"
          title="Previous Word"
          aria-label="Previous Word"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Word Chips Carousel Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar">
          {allWords.map((w, idx) => (
            <button
              key={w.id}
              onClick={() => onSelectWord(idx)}
              className={`px-3 py-1.5 rounded-xl font-fun text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                idx === currentIndex
                  ? 'bg-red-600 text-white shadow-sm scale-105 ring-2 ring-red-400'
                  : 'bg-amber-50 hover:bg-amber-100 text-slate-700 border border-amber-200'
              }`}
            >
              {w.word}
            </button>
          ))}
        </div>

        <button
          onClick={onNextWord}
          className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-all btn-tactile cursor-pointer"
          title="Next Word"
          aria-label="Next Word"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Header with Title and "Ringleader Clue" Button */}
      <div className="w-full flex items-center justify-between mb-2 px-1">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Word {currentIndex + 1} of {totalWords}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{word.fullIPA}</span>
          </div>
          <h2 className="font-fun text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-wide mt-0.5">
            Tap the 3 Sound Buttons!
          </h2>
        </div>

        {/* Interactive Ringleader Clue Button */}
        <button
          onClick={handleOpenClue}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-fun text-xs sm:text-sm font-extrabold shadow-md border-2 border-yellow-200 flex items-center gap-1.5 btn-tactile cursor-pointer"
          title="Need a hint? Ask the Ringleader!"
          aria-label="Ask Ringleader Clue"
        >
          <Lightbulb className="w-4 h-4 text-white fill-yellow-200 animate-pulse" />
          <span>Ringleader Clue</span>
        </button>
      </div>

      {/* 3 Red Carnival Push Buttons with Glowing Lights and Ripples */}
      <div className="grid grid-cols-3 gap-3 sm:gap-5 w-full my-3">
        {/* Onset Sound Push Button */}
        <button
          onClick={() => onTapTile('onset')}
          className={`group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl border-4 transition-all duration-150 btn-tactile cursor-pointer select-none overflow-hidden ${
            activeTile === 'onset' || activeTile === 'all'
              ? 'bg-gradient-to-b from-red-500 via-rose-600 to-red-800 text-white border-yellow-300 shadow-2xl scale-105 ring-4 ring-yellow-400 translate-y-1'
              : 'bg-gradient-to-b from-rose-500 to-red-700 text-white border-red-300 shadow-lg hover:brightness-105'
          }`}
          title={`Beginning Sound: /${word.onsetIPA}/`}
          aria-label={`Beginning sound: ${word.onset}`}
        >
          {/* Glowing Ripple Ring */}
          {(activeTile === 'onset' || activeTile === 'all') && (
            <div className="absolute inset-0 bg-yellow-300/25 rounded-3xl animate-ping pointer-events-none" />
          )}

          {/* Concentric Carnival Push Light Ring */}
          <div className="w-4 h-4 rounded-full bg-yellow-300 shadow-xs mb-1 border border-yellow-500 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${activeTile === 'onset' || activeTile === 'all' ? 'bg-red-600 animate-ping' : 'bg-yellow-100'}`} />
          </div>

          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-yellow-200">
            Onset
          </span>
          <span className="font-fun text-5xl sm:text-7xl font-black leading-none drop-shadow-md text-white my-1">
            {word.onset}
          </span>
          <div className="flex items-center gap-1 text-xs font-mono font-bold bg-black/30 px-2.5 py-0.5 rounded-full text-yellow-200">
            <span>{word.onsetIPA}</span>
            <Volume2 className="w-3 h-3" />
          </div>
        </button>

        {/* Vowel Sound Push Button */}
        <button
          onClick={() => onTapTile('vowel')}
          className={`group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl border-4 transition-all duration-150 btn-tactile cursor-pointer select-none overflow-hidden ${
            activeTile === 'vowel' || activeTile === 'all'
              ? 'bg-gradient-to-b from-amber-500 via-red-600 to-red-800 text-white border-yellow-300 shadow-2xl scale-105 ring-4 ring-yellow-400 translate-y-1'
              : 'bg-gradient-to-b from-rose-600 to-red-800 text-white border-red-300 shadow-lg hover:brightness-105'
          }`}
          title={`Short Vowel Sound: /${word.vowelIPA}/`}
          aria-label={`Short vowel sound: ${word.vowel}`}
        >
          {(activeTile === 'vowel' || activeTile === 'all') && (
            <div className="absolute inset-0 bg-yellow-300/25 rounded-3xl animate-ping pointer-events-none" />
          )}

          <div className="w-4 h-4 rounded-full bg-yellow-300 shadow-xs mb-1 border border-yellow-500 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${activeTile === 'vowel' || activeTile === 'all' ? 'bg-amber-600 animate-ping' : 'bg-yellow-100'}`} />
          </div>

          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-yellow-300">
            Vowel
          </span>
          <span className="font-fun text-5xl sm:text-7xl font-black leading-none drop-shadow-md text-yellow-200 my-1">
            {word.vowel}
          </span>
          <div className="flex items-center gap-1 text-xs font-mono font-bold bg-black/30 px-2.5 py-0.5 rounded-full text-yellow-200">
            <span>{word.vowelIPA}</span>
            <Volume2 className="w-3 h-3" />
          </div>
        </button>

        {/* Rime Sound Push Button */}
        <button
          onClick={() => onTapTile('rime')}
          className={`group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl border-4 transition-all duration-150 btn-tactile cursor-pointer select-none overflow-hidden ${
            activeTile === 'rime' || activeTile === 'all'
              ? 'bg-gradient-to-b from-red-500 via-rose-600 to-red-800 text-white border-yellow-300 shadow-2xl scale-105 ring-4 ring-yellow-400 translate-y-1'
              : 'bg-gradient-to-b from-rose-500 to-red-700 text-white border-red-300 shadow-lg hover:brightness-105'
          }`}
          title={`Ending Sound: /${word.rimeIPA}/`}
          aria-label={`Ending sound: ${word.rime}`}
        >
          {(activeTile === 'rime' || activeTile === 'all') && (
            <div className="absolute inset-0 bg-yellow-300/25 rounded-3xl animate-ping pointer-events-none" />
          )}

          <div className="w-4 h-4 rounded-full bg-yellow-300 shadow-xs mb-1 border border-yellow-500 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${activeTile === 'rime' || activeTile === 'all' ? 'bg-red-600 animate-ping' : 'bg-yellow-100'}`} />
          </div>

          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-yellow-200">
            Rime
          </span>
          <span className="font-fun text-5xl sm:text-7xl font-black leading-none drop-shadow-md text-white my-1">
            {word.rime}
          </span>
          <div className="flex items-center gap-1 text-xs font-mono font-bold bg-black/30 px-2.5 py-0.5 rounded-full text-yellow-200">
            <span>{word.rimeIPA}</span>
            <Volume2 className="w-3 h-3" />
          </div>
        </button>
      </div>

      {/* Articulation & Phoneme Hint Box */}
      <div className="w-full bg-amber-100/80 rounded-2xl p-3 border border-amber-300 text-left my-2 flex items-start gap-2.5">
        <HelpCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Sound Breakdown: </span>
          <span>
            {activeTile === 'onset' && word.onsetAudioHint}
            {activeTile === 'vowel' && word.vowelAudioHint}
            {activeTile === 'rime' && word.rimeAudioHint}
            {(!activeTile || activeTile === 'all') && (
              <>
                Beginning: <strong className="text-blue-800">{word.onsetIPA}</strong> + Short Vowel:{' '}
                <strong className="text-red-800">{word.vowelIPA}</strong> + Ending:{' '}
                <strong className="text-teal-800">{word.rimeIPA}</strong>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Action Buttons: Listen to Phonemes & Blend Word */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-3">
        {/* Listen to Phonemes Button */}
        <button
          onClick={onListenPhonemes}
          disabled={isPlayingPhonemes || isBlending}
          className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-fun text-base sm:text-lg font-bold shadow-md border-b-4 border-amber-700 btn-tactile cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Volume2 className={`w-5 h-5 ${isPlayingPhonemes ? 'animate-bounce text-yellow-200' : ''}`} />
          <span>{isPlayingPhonemes ? 'Playing Sounds...' : 'Listen to Phonemes'}</span>
        </button>

        {/* Blend Word Button (Hits the High Striker Bell!) */}
        <button
          onClick={onBlendWord}
          disabled={isBlending || isPlayingPhonemes}
          className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-fun text-base sm:text-lg font-bold shadow-md border-b-4 border-red-900 btn-tactile cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Sparkles className={`w-5 h-5 ${isBlending ? 'animate-spin text-yellow-300' : 'text-yellow-300'}`} />
          <span>{isBlending ? 'Blending Word!' : 'Blend Word & Ring Bell!'}</span>
        </button>
      </div>

      {/* Ringleader Clue Popup Modal */}
      {showClueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-6 border-4 border-yellow-400 shadow-2xl text-center">
            <button
              onClick={() => setShowClueModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900"
              aria-label="Close Clue"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-4xl block mb-1">🎪 🎩 🎪</span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-800">
              Circus Ringleader Whisper
            </span>
            <h3 className="font-fun text-2xl font-black text-slate-900 mt-1">
              "Here is your secret clue!"
            </h3>

            {/* Picture Hint Card */}
            <div className="my-4 p-4 bg-white rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col items-center">
              <span className="text-6xl mb-2">{word.correctPicture.emoji}</span>
              <p className="font-fun text-lg font-bold text-slate-800 italic">
                "{word.clueText}"
              </p>
            </div>

            <button
              onClick={() => audioEngine.speakClue(word.clueText)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-fun text-xs font-bold flex items-center justify-center gap-1.5 mx-auto mb-3 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Hear Clue Again</span>
            </button>

            <button
              onClick={() => setShowClueModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-fun text-sm font-bold cursor-pointer"
            >
              Got it, let's blend!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
