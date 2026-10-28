import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CircusTent, CVCWord } from '../types/phonics';
import { HighStriker } from './HighStriker';
import { LetterTiles } from './LetterTiles';
import { WordQuiz } from './WordQuiz';
import { audioEngine } from '../utils/audioEngine';

interface PracticeStageProps {
  tent: CircusTent;
  onBackToHub: () => void;
  onNextTent: () => void;
  onPrevTent: () => void;
  onWordMastered: (wordId: string) => void;
  allTents: CircusTent[];
  onSelectTentById: (id: string) => void;
}

export const PracticeStage: React.FC<PracticeStageProps> = ({
  tent,
  onBackToHub,
  onNextTent,
  onPrevTent,
  onWordMastered,
  allTents,
  onSelectTentById
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [activeTile, setActiveTile] = useState<'onset' | 'vowel' | 'rime' | 'all' | null>(null);
  const [strikerLevel, setStrikerLevel] = useState<number>(10);
  const [isStriking, setIsStriking] = useState<boolean>(false);
  const [isBellRinging, setIsBellRinging] = useState<boolean>(false);
  const [showDingSplash, setShowDingSplash] = useState<boolean>(false);
  const [isPlayingPhonemes, setIsPlayingPhonemes] = useState<boolean>(false);
  const [isBlending, setIsBlending] = useState<boolean>(false);
  const [activeSoundLabel, setActiveSoundLabel] = useState<string>('');

  const currentWord: CVCWord = tent.words[currentWordIndex] || tent.words[0];

  useEffect(() => {
    setCurrentWordIndex(0);
    setStrikerLevel(10);
    setActiveTile(null);
    setIsStriking(false);
    setIsBellRinging(false);
    setShowDingSplash(false);
    setActiveSoundLabel('');
  }, [tent.id]);

  useEffect(() => {
    setStrikerLevel(10);
    setActiveTile(null);
    setIsStriking(false);
    setIsBellRinging(false);
    setShowDingSplash(false);
    setActiveSoundLabel('');
  }, [currentWordIndex]);

  const handleTapTile = async (type: 'onset' | 'vowel' | 'rime') => {
    if (isPlayingPhonemes || isBlending) return;
    setActiveTile(type);

    let char = '';
    let level = 25;
    let label = '';

    if (type === 'onset') {
      char = currentWord.onset;
      level = 25;
      label = `Onset: /${currentWord.onsetIPA}/`;
    } else if (type === 'vowel') {
      char = currentWord.vowel;
      level = 50;
      label = `Short Vowel: /${currentWord.vowelIPA}/`;
    } else {
      char = currentWord.rime;
      level = 75;
      label = `Rime: /${currentWord.rimeIPA}/`;
    }

    setStrikerLevel(level);
    setActiveSoundLabel(label);
    await audioEngine.speakPhoneme(char, type);
  };

  const handleListenPhonemes = async () => {
    if (isPlayingPhonemes || isBlending) return;
    setIsPlayingPhonemes(true);
    setIsBellRinging(false);
    setShowDingSplash(false);

    try {
      // Step 1: Onset
      setActiveTile('onset');
      setStrikerLevel(25);
      setActiveSoundLabel(`1. Onset: /${currentWord.onsetIPA}/`);
      await audioEngine.speakPhoneme(currentWord.onset, 'onset');
      await new Promise(r => setTimeout(r, 220));

      // Step 2: Vowel
      setActiveTile('vowel');
      setStrikerLevel(50);
      setActiveSoundLabel(`2. Short Vowel: /${currentWord.vowelIPA}/`);
      await audioEngine.speakPhoneme(currentWord.vowel, 'vowel');
      await new Promise(r => setTimeout(r, 220));

      // Step 3: Rime
      setActiveTile('rime');
      setStrikerLevel(75);
      setActiveSoundLabel(`3. Rime: /${currentWord.rimeIPA}/`);
      await audioEngine.speakPhoneme(currentWord.rime, 'rime');
      await new Promise(r => setTimeout(r, 300));

      setActiveTile(null);
      setActiveSoundLabel(`Now pull mallet to blend "${currentWord.word}"!`);
    } finally {
      setIsPlayingPhonemes(false);
    }
  };

  const handleBlendWord = async () => {
    if (isBlending || isPlayingPhonemes) return;
    setIsBlending(true);
    setActiveTile('all');
    setActiveSoundLabel('Striking the Anvil!');

    setIsStriking(true);
    audioEngine.playAnvilHit(1.2);
    await new Promise(r => setTimeout(r, 160));
    setIsStriking(false);

    audioEngine.playPuckWhoosh();
    setStrikerLevel(98);
    setActiveSoundLabel(`Blending... "${currentWord.word.toUpperCase()}!"`);

    await new Promise(r => setTimeout(r, 320));
    setIsBellRinging(true);
    setShowDingSplash(true);
    audioEngine.playHighStrikerBell();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.45 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#fbbf24']
      });
    } catch {
      // ignore
    }

    await audioEngine.speakWord(currentWord.word, true);

    await new Promise(r => setTimeout(r, 1400));
    setIsBellRinging(false);
    setShowDingSplash(false);
    setIsBlending(false);
  };

  const handleNextWord = () => {
    if (currentWordIndex < tent.words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      onNextTent();
    }
  };

  const handlePrevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
    }
  };

  const handleSelectWord = (index: number) => {
    if (index >= 0 && index < tent.words.length) {
      setCurrentWordIndex(index);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 select-none">
      {/* Station Navigation Bar with Tent Thumbnail & Station Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-3xl p-3 sm:p-4 border-2 border-amber-200 shadow-sm mb-5">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-fun text-xs sm:text-sm font-bold transition-all btn-tactile cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Hub Map</span>
          </button>

          {/* Station Switcher Tabs */}
          <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-2xl border border-amber-200">
            {allTents.map(t => (
              <button
                key={t.id}
                onClick={() => onSelectTentById(t.id)}
                className={`w-8 h-8 rounded-xl font-fun text-xs font-bold transition-all cursor-pointer ${
                  t.id === tent.id
                    ? 'bg-red-600 text-white shadow-xs scale-105'
                    : 'text-slate-600 hover:bg-amber-200/60'
                }`}
                title={`${t.name} (${t.ipa})`}
              >
                {t.vowel.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Tent Badge with mini 3D tent visual */}
        <div className="flex items-center gap-3 text-center sm:text-right">
          <img
            src={tent.imagePath}
            alt={tent.name}
            className="w-12 h-12 rounded-xl object-cover border-2 border-amber-300 shadow-xs hidden sm:block"
          />
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="font-fun text-xl font-extrabold text-red-600">
                {tent.name}
              </span>
              <span className="text-xs font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-300">
                {tent.ipa}
              </span>
            </div>
            <span className="text-xs text-slate-500 block">
              {tent.subTitle} · Short {tent.vowel.toUpperCase()} Practice
            </span>
          </div>
        </div>

        {/* Next Station Shortcut */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevTent}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 btn-tactile cursor-pointer"
            title="Previous Tent Station"
            aria-label="Previous Tent Station"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextTent}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-fun text-xs font-bold btn-tactile cursor-pointer"
            title="Next Tent Station"
            aria-label="Next Tent Station"
          >
            <span>Next Tent</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mouth articulation guidance strip */}
      <div className="bg-amber-100/70 border border-amber-300 rounded-2xl px-4 py-2.5 mb-5 flex items-center justify-between text-xs text-amber-950">
        <div className="flex items-center gap-2">
          <span className="text-lg">👄</span>
          <span>
            <strong>Phonics Tip for {tent.ipa}: </strong>
            {tent.mouthGuide}
          </span>
        </div>
        <button
          onClick={() => audioEngine.speakPhoneme(tent.vowel, 'vowel')}
          className="shrink-0 ml-2 px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg font-bold text-amber-900 flex items-center gap-1 cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Hear /{tent.vowel}/</span>
        </button>
      </div>

      {/* Main Two-Zone Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: The Animated High Striker Tower with Drag Mallet & Ding Splash */}
        <div className="lg:col-span-4 flex justify-center w-full">
          <HighStriker
            level={strikerLevel}
            isStriking={isStriking}
            isBellRinging={isBellRinging}
            word={currentWord.word}
            activeSoundLabel={activeSoundLabel}
            onTriggerStrike={handleBlendWord}
            showDingSplash={showDingSplash}
          />
        </div>

        {/* Right Zone: Letter Tiles & Self-Checking Quiz Card */}
        <div className="lg:col-span-8 flex flex-col items-center w-full">
          <LetterTiles
            word={currentWord}
            activeTile={activeTile}
            onTapTile={handleTapTile}
            onListenPhonemes={handleListenPhonemes}
            onBlendWord={handleBlendWord}
            isPlayingPhonemes={isPlayingPhonemes}
            isBlending={isBlending}
            onPrevWord={handlePrevWord}
            onNextWord={handleNextWord}
            currentIndex={currentWordIndex}
            totalWords={tent.words.length}
            allWords={tent.words}
            onSelectWord={handleSelectWord}
          />

          <WordQuiz
            word={currentWord}
            onCorrectAnswer={() => onWordMastered(currentWord.id)}
            onNextWord={handleNextWord}
            isLastWord={currentWordIndex === tent.words.length - 1}
            onReturnToHub={onBackToHub}
          />
        </div>
      </div>
    </div>
  );
};
