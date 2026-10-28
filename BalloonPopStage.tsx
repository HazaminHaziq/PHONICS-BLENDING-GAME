import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Sparkles, HelpCircle, Lightbulb, ChevronLeft, ChevronRight, X, ArrowRight, RotateCcw, Play, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CircusTent, CVCWord, VowelCategory } from '../types/phonics';
import { audioEngine } from '../utils/audioEngine';

interface BalloonPopStageProps {
  tent: CircusTent;
  onBackToHub: () => void;
  onNextTent: () => void;
  onPrevTent: () => void;
  onWordMastered: (wordId: string) => void;
  allTents: CircusTent[];
  onSelectTentById: (id: string) => void;
}

interface FloatingBalloon {
  id: VowelCategory;
  vowel: VowelCategory;
  ipa: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage from bottom (0 = bottom, 100 = top)
  speed: number;
  swayOffset: number;
  color: string;
  borderColor: string;
  textColor: string;
  knotColor: string;
  isPopping: boolean;
}

const VOWEL_CONFIGS: { vowel: VowelCategory; ipa: string; color: string; borderColor: string; textColor: string; knotColor: string }[] = [
  { vowel: 'a', ipa: '/æ/', color: 'from-rose-500 to-red-600', borderColor: 'border-rose-400', textColor: 'text-white', knotColor: 'bg-red-700' },
  { vowel: 'e', ipa: '/e/', color: 'from-amber-400 to-orange-500', borderColor: 'border-amber-300', textColor: 'text-amber-950', knotColor: 'bg-orange-700' },
  { vowel: 'i', ipa: '/i/', color: 'from-emerald-400 to-teal-600', borderColor: 'border-emerald-300', textColor: 'text-white', knotColor: 'bg-teal-700' },
  { vowel: 'o', ipa: '/o/', color: 'from-sky-400 to-blue-600', borderColor: 'border-sky-300', textColor: 'text-white', knotColor: 'bg-blue-700' },
  { vowel: 'u', ipa: '/u/', color: 'from-purple-500 to-indigo-600', borderColor: 'border-purple-300', textColor: 'text-white', knotColor: 'bg-purple-800' },
];

export const BalloonPopStage: React.FC<BalloonPopStageProps> = ({
  tent,
  onBackToHub,
  onNextTent,
  onPrevTent,
  onWordMastered,
  allTents,
  onSelectTentById,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [placedVowel, setPlacedVowel] = useState<string | null>(null);
  const [isWordBlended, setIsWordBlended] = useState(false);
  const [activeSoundButton, setActiveSoundButton] = useState<'onset' | 'vowel' | 'rime' | 'all' | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [showClueModal, setShowClueModal] = useState(false);
  const [balloons, setBalloons] = useState<FloatingBalloon[]>([]);
  const [balloonSpeedMultiplier, setBalloonSpeedMultiplier] = useState<number>(0.85); // Gentle speed for young learners
  const [isPaused, setIsPaused] = useState(false);
  const [animatingFallingVowel, setAnimatingFallingVowel] = useState<string | null>(null);
  const [poppedBalloonId, setPoppedBalloonId] = useState<string | null>(null);

  const currentWord: CVCWord = tent.words[currentWordIndex] || tent.words[0];
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Initialize Balloons on word switch or mount
  useEffect(() => {
    setPlacedVowel(null);
    setIsWordBlended(false);
    setActiveSoundButton(null);
    setFeedbackText(null);
    setAnimatingFallingVowel(null);
    setPoppedBalloonId(null);

    // Spread the 5 balloons across horizontal tracks with staggered heights
    const initialBalloons: FloatingBalloon[] = VOWEL_CONFIGS.map((cfg, idx) => ({
      id: cfg.vowel,
      vowel: cfg.vowel,
      ipa: cfg.ipa,
      x: 10 + idx * 19, // 10%, 29%, 48%, 67%, 86%
      y: (idx * 18) % 70, // Staggered initial heights
      speed: 14 + (idx % 3) * 3, // Gentle drift speeds
      swayOffset: idx * 1.5,
      color: cfg.color,
      borderColor: cfg.borderColor,
      textColor: cfg.textColor,
      knotColor: cfg.knotColor,
      isPopping: false,
    }));

    setBalloons(initialBalloons);
  }, [currentWordIndex, tent.id]);

  // Balloon Floating Loop
  useEffect(() => {
    if (isWordBlended || isPaused) return;

    const animate = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      setBalloons(prev =>
        prev.map(b => {
          if (b.isPopping) return b;
          // Float upward
          let newY = b.y + b.speed * balloonSpeedMultiplier * dt;
          // Loop back to bottom when passing top of booth
          if (newY > 96) {
            newY = -12;
          }
          return {
            ...b,
            y: newY,
          };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isWordBlended, isPaused, balloonSpeedMultiplier]);

  // Handle Balloon Pop Interaction
  const handleBalloonClick = async (clickedVowel: VowelCategory) => {
    if (isWordBlended || animatingFallingVowel) return;

    if (clickedVowel === currentWord.vowel) {
      // CORRECT BALLOON POPPED!
      audioEngine.playBalloonPop();
      setPoppedBalloonId(clickedVowel);

      // Trigger particle burst from the popped balloon
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });
      } catch {
        // canvas fallback
      }

      // Vowel falls into middle slot
      setAnimatingFallingVowel(clickedVowel);
      setFeedbackText(`POP! You got short /${currentWord.vowelIPA}/!`);

      await new Promise(r => setTimeout(r, 450));
      setPlacedVowel(clickedVowel);
      setAnimatingFallingVowel(null);
      setIsWordBlended(true);

      // Sequenced phoneme playback: Onset -> Vowel -> Rime
      await playBlendingSequence();

      // Master word
      onWordMastered(currentWord.id);
    } else {
      // INCORRECT BALLOON (Gentle wobble, no penalty)
      audioEngine.playBalloonWobble();
      const wrongConfig = VOWEL_CONFIGS.find(v => v.vowel === clickedVowel);
      setFeedbackText(`That's ${clickedVowel.toUpperCase()} (${wrongConfig?.ipa}). Listen for /${currentWord.vowelIPA}/ like in "${currentWord.word}"!`);
      audioEngine.speakPhoneme(clickedVowel, 'vowel');
    }
  };

  // Automated 3-Button Phonics Blending Sequence
  const playBlendingSequence = async () => {
    try {
      // 1. Onset button
      setActiveSoundButton('onset');
      await audioEngine.speakPhoneme(currentWord.onset, 'onset');
      await new Promise(r => setTimeout(r, 220));

      // 2. Vowel button
      setActiveSoundButton('vowel');
      await audioEngine.speakPhoneme(currentWord.vowel, 'vowel');
      await new Promise(r => setTimeout(r, 220));

      // 3. Rime button
      setActiveSoundButton('rime');
      await audioEngine.speakPhoneme(currentWord.rime, 'rime');
      await new Promise(r => setTimeout(r, 250));

      // 4. All buttons glow & word is blended with victory fanfare!
      setActiveSoundButton('all');
      audioEngine.playDingPerfectBlend();

      try {
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.4 },
          colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#fbbf24'],
        });
      } catch {
        // ignore
      }

      await audioEngine.speakWord(currentWord.word, true);
      setFeedbackText(`Perfect Blend! "${currentWord.word.toUpperCase()}!"`);
    } finally {
      // leave active for manual exploration
    }
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

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-3 select-none">
      {/* Station Navigation Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-3xl p-3 sm:p-4 border-2 border-amber-200 shadow-sm mb-4">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-fun text-xs sm:text-sm font-bold transition-all btn-tactile cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
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

        {/* Tent Name and Balloon Booth Theme Indicator */}
        <div className="text-center sm:text-right">
          <div className="inline-flex items-center gap-2">
            <span className="font-fun text-xl font-extrabold text-red-600">
              The Great Circus Balloon Pop
            </span>
            <span className="text-xs font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-300">
              Tent {tent.vowel.toUpperCase()} · {tent.ipa}
            </span>
          </div>
          <span className="text-xs text-slate-500 block">
            Pop the drifting vowel balloon to complete and blend the word!
          </span>
        </div>

        {/* Next / Prev Word Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWord}
            disabled={currentWordIndex === 0}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 btn-tactile disabled:opacity-40 cursor-pointer"
            title="Previous Word"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-600 px-2 tabular-nums">
            {currentWordIndex + 1} / {tent.words.length}
          </span>
          <button
            onClick={handleNextWord}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-fun text-xs font-bold btn-tactile cursor-pointer"
            title="Next Word"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Target Word Frame & Clue Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 rounded-3xl p-4 sm:p-5 text-white shadow-xl border-4 border-yellow-300 mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Circus Cannon / Clown Presenter Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-4xl shadow-inner border border-white/40">
            🎪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-yellow-300">
                Target Consonant Frame
              </span>
              <span className="text-xs font-mono bg-black/30 px-2 py-0.5 rounded-md text-yellow-200 font-bold">
                Word: {currentWord.word}
              </span>
            </div>
            <h3 className="font-fun text-xl sm:text-2xl font-black text-white mt-0.5">
              Can you pop the missing vowel?
            </h3>
          </div>
        </div>

        {/* Visual Picture Hint & Audio Cue */}
        <div className="flex items-center gap-3 bg-black/25 backdrop-blur-xs px-4 py-2 rounded-2xl border border-yellow-300/40">
          <span className="text-4xl drop-shadow-md">{currentWord.correctPicture.emoji}</span>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-200 block">
              Picture Clue:
            </span>
            <span className="font-fun text-base font-bold text-white block">
              {currentWord.correctPicture.label}
            </span>
          </div>
          <button
            onClick={() => audioEngine.speakWord(currentWord.word)}
            className="p-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-amber-950 font-bold transition-all shadow-xs cursor-pointer ml-1"
            title={`Hear spoken word: ${currentWord.word}`}
            aria-label="Hear spoken word"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Ringleader Clue Button */}
        <button
          onClick={() => {
            setShowClueModal(true);
            audioEngine.speakClue(currentWord.clueText);
          }}
          className="px-3.5 py-2.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-amber-950 font-fun text-xs sm:text-sm font-black shadow-md btn-tactile cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Lightbulb className="w-4 h-4 text-red-600 fill-red-500 animate-pulse" />
          <span>Ringleader Clue</span>
        </button>
      </div>

      {/* Main Interactive Stage: The Balloon Pop Arena */}
      <div className="relative w-full h-[380px] sm:h-[420px] rounded-3xl overflow-hidden border-4 border-yellow-400 shadow-2xl bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100 mb-4 select-none">
        {/* Fairground Background Awning and Lights */}
        <div className="absolute top-0 inset-x-0 h-10 bg-circus-stripes opacity-95 shadow-md border-b-2 border-yellow-400 z-10 flex justify-around items-center px-4">
          <span className="text-sm select-none">💡</span>
          <span className="text-sm select-none">💡</span>
          <span className="text-sm select-none">💡</span>
          <span className="text-sm select-none">💡</span>
          <span className="text-sm select-none">💡</span>
          <span className="text-sm select-none">💡</span>
          <span className="text-sm select-none">💡</span>
          <span className="text-sm select-none">💡</span>
        </div>

        {/* Ambient carnival clouds */}
        <div className="absolute top-12 left-10 text-white/50 text-4xl pointer-events-none">☁️</div>
        <div className="absolute top-20 right-14 text-white/50 text-5xl pointer-events-none">☁️</div>

        {/* Instruction overlay watermark */}
        <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none z-10 opacity-70">
          <span className="font-fun text-xs font-bold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300">
            🎈 Tap or click the matching floating vowel balloon!
          </span>
        </div>

        {/* Falling animated vowel if popped */}
        {animatingFallingVowel && (
          <div className="absolute left-1/2 -translate-x-1/2 top-16 z-30 animate-bounce">
            <div className="w-16 h-16 rounded-2xl bg-red-600 text-white font-fun text-4xl font-black flex items-center justify-center shadow-2xl border-4 border-yellow-300">
              {animatingFallingVowel}
            </div>
          </div>
        )}

        {/* 5 Floating Helium Balloons */}
        {!isWordBlended &&
          balloons.map(b => {
            const isPopped = poppedBalloonId === b.id;
            if (isPopped) return null;

            // Compute subtle sinusoidal sway
            const sway = Math.sin((b.y + b.swayOffset) * 0.1) * 8;

            return (
              <div
                key={b.id}
                onClick={() => handleBalloonClick(b.vowel)}
                style={{
                  left: `calc(${b.x}% + ${sway}px)`,
                  bottom: `${b.y}%`,
                  transform: 'translate(-50%, 0)',
                }}
                className="absolute z-20 cursor-pointer group active:scale-95 transition-transform"
                title={`Vowel Balloon: ${b.vowel.toUpperCase()} (${b.ipa})`}
                aria-label={`Pop vowel balloon ${b.vowel}`}
              >
                {/* 3D Glossy Helium Balloon Body */}
                <div
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] bg-gradient-to-tr ${b.color} border-2 ${b.borderColor} shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-transform select-none`}
                >
                  {/* Glossy specular highlight glare */}
                  <div className="absolute top-2 left-3 w-4 h-7 rounded-full bg-white/40 transform -rotate-25 pointer-events-none" />

                  {/* Vowel Letter Printed on Balloon */}
                  <span className={`font-fun text-3xl sm:text-4xl font-black ${b.textColor} drop-shadow-md leading-none`}>
                    {b.vowel}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-white/90 bg-black/20 px-1.5 py-0.2 rounded-md mt-1">
                    {b.ipa}
                  </span>

                  {/* Balloon Knot at Bottom */}
                  <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-2 rounded-b-sm ${b.knotColor} border-t border-black/20`} />

                  {/* Balloon String swaying */}
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-500/80 rounded-full origin-top transform rotate-6 pointer-events-none" />
                </div>
              </div>
            );
          })}

        {/* Word Blended Success Fireworks State */}
        {isWordBlended && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/20 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 rounded-3xl p-6 border-4 border-yellow-300 shadow-2xl text-center text-white max-w-md transform animate-bounce">
              <span className="text-5xl block mb-2">🎉 🎈 🎪</span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-yellow-200">
                Balloon Popped & Blended!
              </span>
              <h3 className="font-fun text-3xl sm:text-4xl font-black text-white mt-1 drop-shadow-md">
                "{currentWord.word.toUpperCase()}!"
              </h3>
              <p className="text-xs text-yellow-100 font-semibold mt-1">
                {currentWord.meaning}
              </p>

              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={playBlendingSequence}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-amber-950 rounded-xl font-fun text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Replay Sound</span>
                </button>
                <button
                  onClick={handleNextWord}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-fun text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Next Word</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Consonant Slot Frame & The 3 Red Push Sound Buttons */}
      <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-lg mb-4 flex flex-col items-center">
        <div className="w-full max-w-lg flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            3-Letter Blending Frame: Onset · Vowel · Rime
          </span>
          <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Tap any button to hear British sound</span>
          </span>
        </div>

        {/* The 3 Frame Push Buttons */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-lg mb-3">
          {/* Onset Button */}
          <button
            onClick={() => {
              setActiveSoundButton('onset');
              audioEngine.speakPhoneme(currentWord.onset, 'onset');
            }}
            className={`relative flex flex-col items-center justify-center p-3 sm:p-5 rounded-3xl border-4 transition-all duration-150 btn-tactile cursor-pointer select-none ${
              activeSoundButton === 'onset' || activeSoundButton === 'all'
                ? 'bg-gradient-to-b from-red-500 via-rose-600 to-red-800 text-white border-yellow-300 shadow-2xl scale-105 ring-4 ring-yellow-400'
                : 'bg-gradient-to-b from-rose-500 to-red-700 text-white border-red-300 shadow-md hover:scale-[1.02]'
            }`}
            title={`Tap to hear British phoneme /${currentWord.onsetIPA}/`}
            aria-label={`Hear Onset sound ${currentWord.onset}`}
          >
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-yellow-200">
              Onset
            </span>
            <span className="font-fun text-4xl sm:text-6xl font-black leading-none drop-shadow-md text-white my-1">
              {currentWord.onset}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold bg-black/30 px-2.5 py-0.5 rounded-full text-yellow-200 shadow-inner">
              <span>{currentWord.onsetIPA}</span>
              <Volume2 className="w-3 h-3 text-yellow-300" />
            </div>
          </button>

          {/* Vowel Slot (The Landing Slot) */}
          <button
            onClick={() => {
              if (placedVowel) {
                setActiveSoundButton('vowel');
                audioEngine.speakPhoneme(currentWord.vowel, 'vowel');
              } else {
                audioEngine.speakPhoneme(currentWord.vowel, 'vowel');
              }
            }}
            className={`relative flex flex-col items-center justify-center p-3 sm:p-5 rounded-3xl border-4 transition-all duration-150 btn-tactile cursor-pointer select-none ${
              placedVowel
                ? activeSoundButton === 'vowel' || activeSoundButton === 'all'
                  ? 'bg-gradient-to-b from-amber-500 via-red-600 to-red-800 text-white border-yellow-300 shadow-2xl scale-105 ring-4 ring-yellow-400'
                  : 'bg-gradient-to-b from-rose-600 to-red-800 text-white border-red-300 shadow-md hover:scale-[1.02]'
                : 'bg-amber-100 border-dashed border-amber-400 text-amber-700 hover:bg-amber-200/80 animate-pulse'
            }`}
            title={placedVowel ? `Tap to hear British vowel /${currentWord.vowelIPA}/` : 'Pop a floating balloon to place vowel'}
            aria-label={`Vowel slot ${placedVowel || 'empty'}`}
          >
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-yellow-300">
              Vowel
            </span>
            <span className="font-fun text-4xl sm:text-6xl font-black leading-none drop-shadow-md my-1">
              {placedVowel ? placedVowel : '?'}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold bg-black/30 px-2.5 py-0.5 rounded-full text-yellow-200 shadow-inner">
              <span>{placedVowel ? currentWord.vowelIPA : 'Pop Balloon'}</span>
              <Volume2 className="w-3 h-3 text-yellow-300" />
            </div>
          </button>

          {/* Rime Button */}
          <button
            onClick={() => {
              setActiveSoundButton('rime');
              audioEngine.speakPhoneme(currentWord.rime, 'rime');
            }}
            className={`relative flex flex-col items-center justify-center p-3 sm:p-5 rounded-3xl border-4 transition-all duration-150 btn-tactile cursor-pointer select-none ${
              activeSoundButton === 'rime' || activeSoundButton === 'all'
                ? 'bg-gradient-to-b from-red-500 via-rose-600 to-red-800 text-white border-yellow-300 shadow-2xl scale-105 ring-4 ring-yellow-400'
                : 'bg-gradient-to-b from-rose-500 to-red-700 text-white border-red-300 shadow-md hover:scale-[1.02]'
            }`}
            title={`Tap to hear British phoneme /${currentWord.rimeIPA}/`}
            aria-label={`Hear Rime sound ${currentWord.rime}`}
          >
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-yellow-200">
              Rime
            </span>
            <span className="font-fun text-4xl sm:text-6xl font-black leading-none drop-shadow-md text-white my-1">
              {currentWord.rime}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold bg-black/30 px-2.5 py-0.5 rounded-full text-yellow-200 shadow-inner">
              <span>{currentWord.rimeIPA}</span>
              <Volume2 className="w-3 h-3 text-yellow-300" />
            </div>
          </button>
        </div>

        {/* Dynamic Feedback Banner */}
        {feedbackText && (
          <div className="w-full max-w-lg mt-2 p-3 bg-amber-100 rounded-2xl border border-amber-300 text-xs sm:text-sm font-bold text-amber-950 text-center flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{feedbackText}</span>
          </div>
        )}

        {/* Balloon Speed Slider / Controls for Accessibility */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-semibold">Balloon Float Speed:</span>
          <button
            onClick={() => setBalloonSpeedMultiplier(0.5)}
            className={`px-2.5 py-1 rounded-lg font-bold ${
              balloonSpeedMultiplier === 0.5 ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Gentle (0.5x)
          </button>
          <button
            onClick={() => setBalloonSpeedMultiplier(0.85)}
            className={`px-2.5 py-1 rounded-lg font-bold ${
              balloonSpeedMultiplier === 0.85 ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Normal (1.0x)
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-2.5 py-1 rounded-lg font-bold bg-amber-100 text-amber-900 border border-amber-300 cursor-pointer"
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>
      </div>

      {/* Ringleader Clue Modal */}
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

            <span className="text-4xl block mb-1">🎪 🎈 🎪</span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-800">
              Circus Ringleader Whisper
            </span>
            <h3 className="font-fun text-2xl font-black text-slate-900 mt-1">
              "Here is your secret clue!"
            </h3>

            <div className="my-4 p-4 bg-white rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col items-center">
              <span className="text-6xl mb-2">{currentWord.correctPicture.emoji}</span>
              <p className="font-fun text-lg font-bold text-slate-800 italic">
                "{currentWord.clueText}"
              </p>
            </div>

            <button
              onClick={() => audioEngine.speakClue(currentWord.clueText)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-fun text-xs font-bold flex items-center justify-center gap-1.5 mx-auto mb-3 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Hear Clue Again</span>
            </button>

            <button
              onClick={() => setShowClueModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-fun text-sm font-bold cursor-pointer"
            >
              Got it, let's pop!
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
