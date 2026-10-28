import React, { useState, useEffect } from 'react';
import { CIRCUS_TENTS, INITIAL_LEADERBOARD } from './data/cvcData';
import { CircusTent, LearnerProgress, LeaderboardEntry } from './types/phonics';
import { Header } from './components/Header';
import { HubMap } from './components/HubMap';
import { BalloonPopStage } from './components/BalloonPopStage';
import { CircusChallenge } from './components/CircusChallenge';
import { LeaderboardModal } from './components/LeaderboardModal';
import { TrophyModal } from './components/TrophyModal';
import { PinModal } from './components/PinModal';
import { TeacherStudioModal } from './components/TeacherStudioModal';
import { WelcomePage } from './components/WelcomePage';
import { audioEngine } from './utils/audioEngine';

const PROGRESS_STORAGE_KEY = 'circus_cvc_progress_v2';
const LEADERBOARD_STORAGE_KEY = 'circus_cvc_leaderboard_v2';

const defaultProgress: LearnerProgress = {
  starsByWord: {},
  completedWords: [],
  tickets: 0,
  unlockedTrophies: []
};

export default function App() {
  const [isWelcomeView, setIsWelcomeView] = useState<boolean>(true);
  const [currentTent, setCurrentTent] = useState<CircusTent | null>(null);
  const [isChallengeMode, setIsChallengeMode] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isTrophyModalOpen, setIsTrophyModalOpen] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isTeacherStudioOpen, setIsTeacherStudioOpen] = useState<boolean>(false);

  // Persistent progress
  const [progress, setProgress] = useState<LearnerProgress>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return defaultProgress;
  });

  // Persistent leaderboard (top 5 locally stored)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_LEADERBOARD;
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.85);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // quota
    }
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboard));
    } catch {
      // quota
    }
  }, [leaderboard]);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMuted(nextMuted);
  };

  const handleToggleSpeechRate = () => {
    const nextRate = speechRate < 0.9 ? 1.0 : 0.85;
    setSpeechRate(nextRate);
    audioEngine.setRate(nextRate);
  };

  const handleGoToWelcome = () => {
    setIsWelcomeView(true);
    setCurrentTent(null);
    setIsChallengeMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterCircus = (tentId?: string) => {
    setIsWelcomeView(false);
    if (tentId) {
      const target = CIRCUS_TENTS.find(t => t.id === tentId);
      if (target) {
        setCurrentTent(target);
        setIsChallengeMode(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    setCurrentTent(null);
    setIsChallengeMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTent = (tent: CircusTent) => {
    setIsWelcomeView(false);
    setIsChallengeMode(false);
    setCurrentTent(tent);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    audioEngine.playTilePop(440);
  };

  const handleSelectTentById = (id: string) => {
    const target = CIRCUS_TENTS.find(t => t.id === id);
    if (target) {
      setIsWelcomeView(false);
      setIsChallengeMode(false);
      setCurrentTent(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextTent = () => {
    if (!currentTent) return;
    const currentIndex = CIRCUS_TENTS.findIndex(t => t.id === currentTent.id);
    const nextIndex = (currentIndex + 1) % CIRCUS_TENTS.length;
    setCurrentTent(CIRCUS_TENTS[nextIndex]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevTent = () => {
    if (!currentTent) return;
    const currentIndex = CIRCUS_TENTS.findIndex(t => t.id === currentTent.id);
    const prevIndex = (currentIndex - 1 + CIRCUS_TENTS.length) % CIRCUS_TENTS.length;
    setCurrentTent(CIRCUS_TENTS[prevIndex]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartChallenge = () => {
    setIsWelcomeView(false);
    setCurrentTent(null);
    setIsChallengeMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishChallenge = (newEntry: LeaderboardEntry) => {
    // Insert new score, sort by score descending, then time ascending, keep top 35 pupils in class
    setLeaderboard(prev => {
      const updated = [...prev, newEntry].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeSeconds - b.timeSeconds;
      }).slice(0, 35);
      return updated;
    });

    // Also award ticket bonus to progress
    setProgress(prev => ({
      ...prev,
      tickets: prev.tickets + Math.floor(newEntry.score / 10)
    }));

    setIsChallengeMode(false);
    setIsLeaderboardOpen(true);
  };

  const handleResetLeaderboard = () => {
    setLeaderboard(INITIAL_LEADERBOARD);
    try {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(INITIAL_LEADERBOARD));
    } catch {
      // ignore
    }
  };

  const handleWordMastered = (wordId: string) => {
    setProgress(prev => {
      const currentStars = prev.starsByWord[wordId] || 0;
      const isAlreadyCompleted = prev.completedWords.includes(wordId);

      const newStars = Math.min(3, currentStars + 1);
      const newCompleted = isAlreadyCompleted ? prev.completedWords : [...prev.completedWords, wordId];
      const newTickets = prev.tickets + (isAlreadyCompleted ? 1 : 2);

      return {
        ...prev,
        starsByWord: {
          ...prev.starsByWord,
          [wordId]: newStars
        },
        completedWords: newCompleted,
        tickets: newTickets
      };
    });
  };

  const handleResetProgress = () => {
    setProgress(defaultProgress);
    try {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const totalStars = Object.values(progress.starsByWord).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-circus-fairground text-slate-800 flex flex-col justify-between selection:bg-red-500 selection:text-white relative">
      {/* Decorative Circus Canopy Top Border Strip */}
      <div className="w-full h-3 bg-circus-stripes border-b border-amber-300 shadow-sm" />

      {/* Fixed Header */}
      <Header
        currentTent={currentTent}
        isChallengeMode={isChallengeMode}
        isWelcomeView={isWelcomeView}
        onGoToHub={() => {
          setIsWelcomeView(false);
          setCurrentTent(null);
          setIsChallengeMode(false);
        }}
        onGoToWelcome={handleGoToWelcome}
        onOpenTrophies={() => setIsTrophyModalOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onStartChallenge={handleStartChallenge}
        onOpenTeacherStudio={() => setIsPinModalOpen(true)}
        tickets={progress.tickets}
        totalStars={totalStars}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        speechRate={speechRate}
        onToggleSpeechRate={handleToggleSpeechRate}
      />

      {/* Main Content: Year 1 Welcome Page, Hub Map, 10-Question Challenge, or Tent Practice */}
      <main className="flex-1 flex flex-col justify-center py-4 relative z-10">
        {isWelcomeView ? (
          <WelcomePage
            tents={CIRCUS_TENTS}
            onEnterCircus={handleEnterCircus}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onStartChallenge={handleStartChallenge}
            totalStars={totalStars}
            tickets={progress.tickets}
          />
        ) : isChallengeMode ? (
          <CircusChallenge
            onBackToHub={() => setIsChallengeMode(false)}
            onFinishChallenge={handleFinishChallenge}
          />
        ) : currentTent ? (
          <BalloonPopStage
            tent={currentTent}
            onBackToHub={() => setCurrentTent(null)}
            onNextTent={handleNextTent}
            onPrevTent={handlePrevTent}
            onWordMastered={handleWordMastered}
            allTents={CIRCUS_TENTS}
            onSelectTentById={handleSelectTentById}
          />
        ) : (
          <HubMap
            tents={CIRCUS_TENTS}
            progress={progress}
            onSelectTent={handleSelectTent}
            onOpenTrophies={() => setIsTrophyModalOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onStartChallenge={handleStartChallenge}
            onOpenTeacherStudio={() => setIsPinModalOpen(true)}
          />
        )}
      </main>

      {/* Footer with Circus Fairground styling */}
      <footer className="border-t-2 border-amber-300/80 bg-amber-950/90 text-amber-100 py-4 px-6 text-center text-xs backdrop-blur-md relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-fun font-bold text-yellow-300 text-sm">
            🎪 The Great Circus Balloon Pop · Year 1 Phonics Carnival
          </span>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-amber-200/90">
            <span>Synthetic Phonics (Onset · Vowel · Rime)</span>
            <span aria-hidden="true">·</span>
            <span>Pure British Phonics</span>
            <span aria-hidden="true">·</span>
            <span>Classroom Hall of Fame (35 Pupils)</span>
          </div>
        </div>
      </footer>

      {/* Leaderboard Hall of Fame Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        leaderboard={leaderboard}
        onResetLeaderboard={handleResetLeaderboard}
        onStartChallenge={handleStartChallenge}
      />

      {/* Trophy Booth Modal */}
      <TrophyModal
        isOpen={isTrophyModalOpen}
        onClose={() => setIsTrophyModalOpen(false)}
        progress={progress}
        onResetProgress={handleResetProgress}
      />

      {/* Teacher Security PIN Gate Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setIsPinModalOpen(false);
          setIsTeacherStudioOpen(true);
        }}
      />

      {/* Teacher Audio Studio: Custom Recording & File Upload Modal */}
      <TeacherStudioModal
        isOpen={isTeacherStudioOpen}
        onClose={() => setIsTeacherStudioOpen(false)}
      />
    </div>
  );
}
