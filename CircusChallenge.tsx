import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Timer, Sparkles, Volume2, Trophy, Lightbulb, X, Play, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CVCWord, LeaderboardEntry, VowelCategory } from '../types/phonics';
import { CIRCUS_TENTS } from '../data/cvcData';
import { audioEngine } from '../utils/audioEngine';

interface CircusChallengeProps {
  onBackToHub: () => void;
  onFinishChallenge: (entry: LeaderboardEntry) => void;
}

interface FloatingBalloon {
  id: VowelCategory;
  vowel: VowelCategory;
  ipa: string;
  x: number;
  y: number;
  speed: number;
  swayOffset: number;
  color: string;
  borderColor: string;
  textColor: string;
  knotColor: string;
}

const VOWEL_CONFIGS: { vowel: VowelCategory; ipa: string; color: string; borderColor: string; textColor: string; knotColor: string }[] = [
  { vowel: 'a', ipa: '/æ/', color: 'from-rose-500 to-red-600', borderColor: 'border-rose-400', textColor: 'text-white', knotColor: 'bg-red-700' },
  { vowel: 'e', ipa: '/e/', color: 'from-amber-400 to-orange-500', borderColor: 'border-amber-300', textColor: 'text-amber-950', knotColor: 'bg-orange-700' },
  { vowel: 'i', ipa: '/i/', color: 'from-emerald-400 to-teal-600', borderColor: 'border-emerald-300', textColor: 'text-white', knotColor: 'bg-teal-700' },
  { vowel: 'o', ipa: '/o/', color: 'from-sky-400 to-blue-600', borderColor: 'border-sky-300', textColor: 'text-white', knotColor: 'bg-blue-700' },
  { vowel: 'u', ipa: '/u/', color: 'from-purple-500 to-indigo-600', borderColor: 'border-purple-300', textColor: 'text-white', knotColor: 'bg-purple-800' },
];

export const CircusChallenge: React.FC<CircusChallengeProps> = ({
  onBackToHub,
  onFinishChallenge,
}) => {
  const [questions, setQuestions] = useState<CVCWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [placedVowel, setPlacedVowel] = useState<string | null>(null);
  const [isWordBlended, setIsWordBlended] = useState(false);
  const [activeSoundButton, setActiveSoundButton] = useState<'onset' | 'vowel' | 'rime' | 'all' | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [balloons, setBalloons] = useState<FloatingBalloon[]>([]);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pupilName, setPupilName] = useState('');
  const [showClueModal, setShowClueModal] = useState(false);
  const [animatingFallingVowel, setAnimatingFallingVowel] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Pick 10 random questions sampled across all 5 vowel categories
  useEffect(() => {
    const allWords = CIRCUS_TENTS.flatMap(t => t.words);
    const shuffled = [...allWords].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setTimeSeconds(0);
    setIsActive(true);
  }, []);

  // Timer loop
  useEffect(() => {
    if (isActive && !showNamePrompt) {
      timerRef.current = setInterval(() => {
        setTimeSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, showNamePrompt]);

  const currentWord = questions[currentIndex];

  // Reset balloon states per question
  useEffect(() => {
    if (!currentWord) return;
    setPlacedVowel(null);
    setIsWordBlended(false);
    setActiveSoundButton(null);
    setFeedbackText(null);
    setAnimatingFallingVowel(null);

    const initialBalloons: FloatingBalloon[] = VOWEL_CONFIGS.map((cfg, idx) => ({
      id: cfg.vowel,
      vowel: cfg.vowel,
      ipa: cfg.ipa,
      x: 10 + idx * 19,
      y: (idx * 20) % 65,
      speed: 15 + (idx % 2) * 3,
      swayOffset: idx * 1.5,
      color: cfg.color,
      borderColor: cfg.borderColor,
      textColor: cfg.textColor,
      knotColor: cfg.knotColor,
    }));

    setBalloons(initialBalloons);
  }, [currentIndex, currentWord]);

  // Balloon Floating Loop
  useEffect(() => {
    if (isWordBlended || showNamePrompt || !currentWord) return;

    const animate = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      setBalloons(prev =>
        prev.map(b => {
          let newY = b.y + b.speed * 0.9 * dt;
          if (newY > 96) newY = -12;
          return { ...b, y: newY };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isWordBlended, showNamePrompt, currentWord]);

  if (!currentWord) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center font-fun text-xl font-bold text-amber-800">
          🎪 Preparing the Grand Circus Balloon Pop Challenge...
        </div>
      </div>
    );
  }

  // Handle Balloon Pop
  const handleBalloonClick = async (clickedVowel: VowelCategory) => {
    if (isWordBlended || animatingFallingVowel) return;

    if (clickedVowel === currentWord.vowel) {
      audioEngine.playBalloonPop();
      setAnimatingFallingVowel(clickedVowel);
      setFeedbackText(`POP! Perfect! You got /${currentWord.vowelIPA}/!`);

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });
      } catch {
        // canvas fallback
      }

      await new Promise(r => setTimeout(r, 400));
      setPlacedVowel(clickedVowel);
      setAnimatingFallingVowel(null);
      setIsWordBlended(true);
      setScore(prev => prev + 10);

      // Play 3 button phoneme blend
      await playBlendingSequence();
    } else {
      audioEngine.playBalloonWobble();
      const wrongConfig = VOWEL_CONFIGS.find(v => v.vowel === clickedVowel);
      setFeedbackText(`That's /${wrongConfig?.ipa}/! Listen for /${currentWord.vowelIPA}/ in "${currentWord.word}"!`);
      audioEngine.speakPhoneme(clickedVowel, 'vowel');
    }
  };

  const playBlendingSequence = async () => {
    setActiveSoundButton('onset');
    await audioEngine.speakPhoneme(currentWord.onset, 'onset');
    await new Promise(r => setTimeout(r, 200));

    setActiveSoundButton('vowel');
    await audioEngine.speakPhoneme(currentWord.vowel, 'vowel');
    await new Promise(r => setTimeout(r, 200));

    setActiveSoundButton('rime');
    await audioEngine.speakPhoneme(currentWord.rime, 'rime');
    await new Promise(r => setTimeout(r, 220));

    setActiveSoundButton('all');
    audioEngine.playDingPerfectBlend();

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.4 },
      });
    } catch {
      // ignore
    }

    await audioEngine.speakWord(currentWord.word, true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < 9) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsActive(false);
      setShowNamePrompt(true);
      audioEngine.playSuccessFanfare();
    }
  };

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = pupilName.trim() || 'Circus Acrobat';
    const entry: LeaderboardEntry = {
      id: Date.now().toString(),
      name: finalName,
      score: score,
      totalQuestions: 10,
      timeSeconds: timeSeconds,
      date: 'Today',
      stars: Math.floor(score / 10),
      rankBadge: score >= 90 ? '🥇' : score >= 70 ? '🥈' : '🥉',
    };
    onFinishChallenge(entry);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-3 select-none">
      {/* Top Challenge Status Strip */}
      <div className="flex items-center justify-between gap-3 bg-white rounded-3xl p-3 sm:p-4 border-2 border-amber-300 shadow-sm mb-4">
        <button
          onClick={onBackToHub}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-fun text-xs sm:text-sm font-bold transition-all btn-tactile cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Round
            </span>
            <span className="font-fun text-base sm:text-lg font-black text-red-600 tabular-nums">
              Q{currentIndex + 1} of 10
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Timer
            </span>
            <div className="flex items-center gap-1 font-mono font-bold text-slate-700 text-sm sm:text-base tabular-nums">
              <Timer className="w-4 h-4 text-amber-600" />
              <span>{formatTimer(timeSeconds)}</span>
            </div>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Score
            </span>
            <span className="font-fun text-base sm:text-lg font-black text-amber-600 tabular-nums">
              {score} pts
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setShowClueModal(true);
            audioEngine.speakClue(currentWord.clueText);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-fun text-xs font-extrabold btn-tactile cursor-pointer"
        >
          <Lightbulb className="w-4 h-4 text-white fill-yellow-200 animate-pulse" />
          <span className="hidden sm:inline">Ringleader Clue</span>
          <span className="sm:hidden">Clue</span>
        </button>
      </div>

      {/* Target Word Frame & Clue Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 rounded-3xl p-4 text-white shadow-xl border-4 border-yellow-300 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shadow-inner border border-white/40">
            🎪
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-yellow-300 block">
              Question {currentIndex + 1} · Balloon Pop Challenge
            </span>
            <h3 className="font-fun text-xl sm:text-2xl font-black text-white leading-tight">
              Pop the vowel to spell: "{currentWord.word}"
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-black/30 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl border border-yellow-300/40">
          <span className="text-3xl drop-shadow-sm">{currentWord.correctPicture.emoji}</span>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-200 block">
              Clue Picture:
            </span>
            <span className="font-fun text-sm font-bold text-white block">
              {currentWord.correctPicture.label}
            </span>
          </div>
          <button
            onClick={() => audioEngine.speakWord(currentWord.word)}
            className="p-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-amber-950 font-bold ml-1 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Balloon Pop Arena */}
      <div className="relative w-full h-[340px] sm:h-[380px] rounded-3xl overflow-hidden border-4 border-yellow-400 shadow-2xl bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100 mb-4 select-none">
        {/* Awning Lights */}
        <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-r from-red-600 via-white to-red-600 bg-[length:35px_35px] opacity-90 shadow-xs border-b-2 border-yellow-400 z-10 flex justify-around items-center px-4">
          <span className="text-[10px]">💡</span>
          <span className="text-[10px]">💡</span>
          <span className="text-[10px]">💡</span>
          <span className="text-[10px]">💡</span>
          <span className="text-[10px]">💡</span>
          <span className="text-[10px]">💡</span>
        </div>

        {/* Falling animated vowel if popped */}
        {animatingFallingVowel && (
          <div className="absolute left-1/2 -translate-x-1/2 top-14 z-30 animate-bounce">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white font-fun text-3xl font-black flex items-center justify-center shadow-2xl border-4 border-yellow-300">
              {animatingFallingVowel}
            </div>
          </div>
        )}

        {/* Floating Helium Balloons */}
        {!isWordBlended &&
          balloons.map(b => {
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
              >
                <div
                  className={`relative w-16 h-20 sm:w-18 sm:h-22 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] bg-gradient-to-tr ${b.color} border-2 ${b.borderColor} shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-transform select-none`}
                >
                  <div className="absolute top-2 left-3 w-3 h-6 rounded-full bg-white/40 transform -rotate-25 pointer-events-none" />
                  <span className={`font-fun text-3xl sm:text-4xl font-black ${b.textColor} drop-shadow-md leading-none`}>
                    {b.vowel}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-white/90 bg-black/20 px-1.5 py-0.2 rounded-md mt-0.5">
                    {b.ipa}
                  </span>
                  <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-2 rounded-b-sm ${b.knotColor}`} />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-slate-500/80 rounded-full" />
                </div>
              </div>
            );
          })}

        {/* Word Blended Modal inside Arena */}
        {isWordBlended && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/25 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 rounded-3xl p-5 border-4 border-yellow-300 shadow-2xl text-center text-white max-w-sm transform animate-bounce">
              <span className="text-4xl block mb-1">🎈 🎪 🌟</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-yellow-200">
                Word Blended +10 Pts!
              </span>
              <h3 className="font-fun text-3xl font-black text-white mt-1 drop-shadow-md">
                "{currentWord.word.toUpperCase()}!"
              </h3>

              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={playBlendingSequence}
                  className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-amber-950 rounded-xl font-fun text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>Replay Sound</span>
                </button>
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-fun text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>{currentIndex < 9 ? 'Next Balloon' : 'View Podium'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Consonant Slot Frame & The 3 Red Push Sound Buttons */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-lg flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          3-Letter Blending Frame: Onset · Vowel · Rime
        </span>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-md mb-2">
          {/* Onset Button */}
          <button
            onClick={() => {
              setActiveSoundButton('onset');
              audioEngine.speakPhoneme(currentWord.onset, 'onset');
            }}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-3 transition-all btn-tactile cursor-pointer ${
              activeSoundButton === 'onset' || activeSoundButton === 'all'
                ? 'bg-gradient-to-b from-red-500 via-rose-600 to-red-800 text-white border-yellow-300 shadow-xl scale-105 ring-4 ring-yellow-400'
                : 'bg-gradient-to-b from-rose-500 to-red-700 text-white border-red-300 shadow-md'
            }`}
          >
            <span className="text-[10px] font-extrabold uppercase text-yellow-200">Onset</span>
            <span className="font-fun text-3xl sm:text-5xl font-black text-white">{currentWord.onset}</span>
            <span className="text-[10px] font-mono text-yellow-200">{currentWord.onsetIPA}</span>
          </button>

          {/* Vowel Slot Button */}
          <button
            onClick={() => {
              if (placedVowel) {
                setActiveSoundButton('vowel');
                audioEngine.speakPhoneme(currentWord.vowel, 'vowel');
              }
            }}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-3 transition-all btn-tactile cursor-pointer ${
              placedVowel
                ? activeSoundButton === 'vowel' || activeSoundButton === 'all'
                  ? 'bg-gradient-to-b from-amber-500 via-red-600 to-red-800 text-white border-yellow-300 shadow-xl scale-105 ring-4 ring-yellow-400'
                  : 'bg-gradient-to-b from-rose-600 to-red-800 text-white border-red-300 shadow-md'
                : 'bg-amber-100 border-dashed border-amber-400 text-amber-700 animate-pulse'
            }`}
          >
            <span className="text-[10px] font-extrabold uppercase text-yellow-300">Vowel</span>
            <span className="font-fun text-3xl sm:text-5xl font-black">{placedVowel || '?'}</span>
            <span className="text-[10px] font-mono text-yellow-200">{placedVowel ? currentWord.vowelIPA : 'Pop!'}</span>
          </button>

          {/* Rime Button */}
          <button
            onClick={() => {
              setActiveSoundButton('rime');
              audioEngine.speakPhoneme(currentWord.rime, 'rime');
            }}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-3 transition-all btn-tactile cursor-pointer ${
              activeSoundButton === 'rime' || activeSoundButton === 'all'
                ? 'bg-gradient-to-b from-red-500 via-rose-600 to-red-800 text-white border-yellow-300 shadow-xl scale-105 ring-4 ring-yellow-400'
                : 'bg-gradient-to-b from-rose-500 to-red-700 text-white border-red-300 shadow-md'
            }`}
          >
            <span className="text-[10px] font-extrabold uppercase text-yellow-200">Rime</span>
            <span className="font-fun text-3xl sm:text-5xl font-black text-white">{currentWord.rime}</span>
            <span className="text-[10px] font-mono text-yellow-200">{currentWord.rimeIPA}</span>
          </button>
        </div>

        {feedbackText && (
          <div className="w-full max-w-md mt-1 p-2.5 bg-amber-100 rounded-xl border border-amber-300 text-xs font-bold text-amber-950 text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{feedbackText}</span>
          </div>
        )}
      </div>

      {/* Ringleader Clue Modal */}
      {showClueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-amber-50 rounded-3xl p-6 border-4 border-yellow-400 shadow-2xl text-center">
            <span className="text-4xl block mb-1">🎪 🎩 🎪</span>
            <h3 className="font-fun text-xl font-bold text-slate-900">
              Ringleader Hint
            </h3>
            <p className="my-3 text-sm text-slate-700 font-semibold italic bg-white p-3 rounded-xl border border-amber-200">
              "{currentWord.clueText}"
            </p>
            <button
              onClick={() => setShowClueModal(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl font-fun text-xs font-bold"
            >
              Back to Question
            </button>
          </div>
        </div>
      )}

      {/* Name Input Prompt at End of Q10 */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
          <div className="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-6 sm:p-8 border-4 border-yellow-400 shadow-2xl text-center animate-fadeIn">
            <span className="text-5xl block mb-2">🎪 🏆 🎈</span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-600">
              Challenge Completed!
            </span>
            <h2 className="font-fun text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Save Your Balloon Pop Score!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Final Score: <strong className="text-red-600 text-base">{score} pts</strong> · Time: <strong className="text-amber-800">{formatTimer(timeSeconds)}</strong>
            </p>

            <form onSubmit={handleSubmitScore} className="mt-5 text-left">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pupil Name or Initials:
              </label>
              <input
                type="text"
                required
                autoFocus
                maxLength={20}
                value={pupilName}
                onChange={e => setPupilName(e.target.value)}
                placeholder="e.g. Maya Ringmaster"
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-300 bg-white font-fun text-base font-bold text-slate-800 focus:outline-hidden focus:border-red-500 shadow-inner"
              />

              <button
                type="submit"
                className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-fun text-base font-bold shadow-md btn-tactile cursor-pointer flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span>Save to Class Podium & View Leaderboard</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
