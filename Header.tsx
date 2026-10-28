import React from 'react';
import { Volume2, VolumeX, Sparkles, MapPin, Award, Gauge, Trophy, Flame, Lock } from 'lucide-react';
import { CircusTent } from '../types/phonics';

interface HeaderProps {
  currentTent: CircusTent | null;
  isChallengeMode: boolean;
  isWelcomeView: boolean;
  onGoToHub: () => void;
  onGoToWelcome: () => void;
  onOpenTrophies: () => void;
  onOpenLeaderboard: () => void;
  onStartChallenge: () => void;
  onOpenTeacherStudio: () => void;
  tickets: number;
  totalStars: number;
  isMuted: boolean;
  onToggleMute: () => void;
  speechRate: number;
  onToggleSpeechRate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTent,
  isChallengeMode,
  isWelcomeView,
  onGoToHub,
  onGoToWelcome,
  onOpenTrophies,
  onOpenLeaderboard,
  onStartChallenge,
  onOpenTeacherStudio,
  tickets,
  totalStars,
  isMuted,
  onToggleMute,
  speechRate,
  onToggleSpeechRate
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-300 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onGoToWelcome}
            className="flex items-center gap-2 group text-left transition-transform active:scale-95 cursor-pointer"
            aria-label="Go to Year 1 Circus Welcome Entrance"
          >
            <span className="text-2xl select-none" role="img" aria-label="circus balloon">🎈</span>
            <div className="leading-tight">
              <span className="font-fun text-lg sm:text-xl font-bold tracking-tight text-red-600 group-hover:text-red-700 transition-colors whitespace-nowrap block">
                The Great Circus Balloon Pop
              </span>
              <span className="text-[11px] font-medium text-amber-700 hidden sm:block">
                Year 1 Phonics Carnival · Pop & Blend
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation & Status controls */}
        <nav className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Circus Gate / Welcome Entrance Button */}
          <button
            onClick={onGoToWelcome}
            className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 btn-tactile whitespace-nowrap cursor-pointer ${
              isWelcomeView
                ? 'bg-red-600 text-white shadow-xs font-bold'
                : 'text-slate-700 hover:text-red-600 hover:bg-amber-100/60'
            }`}
            title="Go to Year 1 Circus Welcome Entrance"
          >
            <span className="text-sm select-none">🎪</span>
            <span className="hidden sm:inline">Circus Gate</span>
          </button>

          {!isWelcomeView && (currentTent || isChallengeMode ? (
            <button
              onClick={onGoToHub}
              className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-amber-100/60 rounded-xl transition-all flex items-center gap-1.5 btn-tactile whitespace-nowrap cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Hub Map</span>
            </button>
          ) : (
            <button
              onClick={onStartChallenge}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-fun text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-yellow-300" />
              <span>10-Q Challenge</span>
            </button>
          ))}

          {/* Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            title="View Top 35 Classroom Hall of Fame Scores"
            aria-label="View Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>

          {/* Teacher Audio Studio Button (PIN Protected) */}
          <button
            onClick={onOpenTeacherStudio}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
            title="Teacher Audio Studio: Upload custom British phonemes & CVC audio (PIN protected)"
            aria-label="Teacher Audio Studio"
          >
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Teacher Studio</span>
          </button>

          {/* Speech Rate Control */}
          <button
            onClick={onToggleSpeechRate}
            title={speechRate < 0.9 ? 'Speech Speed: Slow for ESL Practice' : 'Speech Speed: Normal'}
            className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            aria-label="Toggle voice speed"
          >
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
            <span className="tabular-nums">{speechRate < 0.9 ? '0.8x' : '1.0x'}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100'
                : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
            }`}
            title={isMuted ? 'Sound muted (click to unmute)' : 'Sound active (click to mute)'}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </nav>

        {/* Zone 3: 1 primary action cluster: Tickets & Star Score & Trophy Booth */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-amber-100/80 px-2.5 py-1.5 rounded-xl border border-amber-300" title="Total Stars Earned">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="font-fun text-xs sm:text-sm font-bold text-amber-900 tabular-nums">
              {totalStars}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-rose-100/80 px-2.5 py-1.5 rounded-xl border border-rose-300" title="Circus Tickets Won">
            <span className="text-sm select-none" role="img" aria-label="ticket">🎟️</span>
            <span className="font-fun text-xs sm:text-sm font-bold text-rose-900 tabular-nums">
              {tickets}
            </span>
          </div>

          <button
            onClick={onOpenTrophies}
            className="px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 btn-tactile whitespace-nowrap cursor-pointer"
          >
            <Award className="w-4 h-4 text-yellow-300" />
            <span className="hidden sm:inline">Prizes</span>
          </button>
        </div>
      </div>
    </header>
  );
};
