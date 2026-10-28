import React, { useState } from 'react';
import { X, Trophy, Medal, Timer, RotateCcw, Search, Printer, Users, Sparkles } from 'lucide-react';
import { LeaderboardEntry } from '../types/phonics';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: LeaderboardEntry[];
  onResetLeaderboard: () => void;
  onStartChallenge?: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  leaderboard,
  onResetLeaderboard,
  onStartChallenge
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Sort by highest score first, then fastest completion time (up to 35 pupils)
  const sorted = [...leaderboard].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSeconds - b.timeSeconds;
  }).slice(0, 35);

  const filtered = searchQuery.trim()
    ? sorted.filter(entry => entry.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : sorted;

  const top1 = sorted[0];
  const top2 = sorted[1];
  const top3 = sorted[2];
  const restList = sorted.slice(3); // Ranks 4 to 35

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Class statistics
  const totalPupils = sorted.length;
  const avgScore = totalPupils > 0
    ? Math.round(sorted.reduce((acc, curr) => acc + curr.score, 0) / totalPupils)
    : 0;
  const fastestTime = totalPupils > 0
    ? Math.min(...sorted.map(e => e.timeSeconds))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-amber-50 via-white to-orange-50 rounded-3xl p-5 sm:p-7 border-4 border-yellow-400 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer z-10"
          aria-label="Close Leaderboard"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/30 rounded-full border border-yellow-400 text-xs font-bold text-amber-900 mb-1">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Classroom Hall of Fame · Full Class Roster (Up to 35 Pupils)</span>
          </div>
          <h2 className="font-fun text-2xl sm:text-4xl font-black text-red-600 mt-0.5">
            The Grand Circus Class Podium
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Tracks all pupils in class who participate in the 10-Question Challenge!
          </p>

          {/* Classroom Statistics Quick Strip */}
          <div className="grid grid-cols-3 gap-2 mt-3 max-w-lg mx-auto bg-amber-100/70 p-2 rounded-2xl border border-amber-300 text-center text-xs">
            <div>
              <span className="text-[10px] text-amber-800 font-bold block uppercase">Pupils Ranked</span>
              <span className="font-fun text-base font-black text-amber-950 tabular-nums">
                {totalPupils} <span className="text-xs font-semibold text-amber-700">/ 35</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-amber-800 font-bold block uppercase">Class Average</span>
              <span className="font-fun text-base font-black text-red-600 tabular-nums">
                {avgScore} <span className="text-xs font-semibold text-red-400">pts</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-amber-800 font-bold block uppercase">Fastest Time</span>
              <span className="font-fun text-base font-black text-emerald-800 tabular-nums">
                {totalPupils > 0 ? formatTime(fastestTime) : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2 mb-4 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search pupil name in class..."
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-amber-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-red-400"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Clear
            </button>
          )}
        </div>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Top 3 Podium (Only shown when not filtering or when top 3 match) */}
          {!searchQuery && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end mb-6 pt-2">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                {top2 ? (
                  <div className="text-center mb-1.5">
                    <span className="text-3xl block">🥈</span>
                    <span className="font-fun font-bold text-xs sm:text-sm text-slate-800 truncate max-w-[90px] sm:max-w-[120px] block">
                      {top2.name}
                    </span>
                    <span className="text-xs font-black text-slate-600 block tabular-nums">
                      {top2.score} pts
                    </span>
                    <span className="text-[10px] text-slate-400 block tabular-nums">
                      ⏱ {formatTime(top2.timeSeconds)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 mb-2">Slot 2 Empty</span>
                )}
                <div className="w-full h-24 bg-gradient-to-t from-slate-400 to-slate-200 rounded-t-2xl border-t-4 border-slate-300 shadow-md flex items-center justify-center">
                  <span className="font-fun text-xl sm:text-2xl font-black text-slate-600">2nd</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                {top1 ? (
                  <div className="text-center mb-1.5">
                    <span className="text-4xl block animate-bounce">🥇</span>
                    <span className="font-fun font-black text-sm sm:text-base text-red-600 truncate max-w-[100px] sm:max-w-[140px] block">
                      {top1.name}
                    </span>
                    <span className="text-sm font-black text-amber-600 block tabular-nums">
                      {top1.score} pts
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 block tabular-nums">
                      ⏱ {formatTime(top1.timeSeconds)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 mb-2">Slot 1 Empty</span>
                )}
                <div className="w-full h-32 bg-gradient-to-t from-yellow-500 via-amber-400 to-yellow-300 rounded-t-2xl border-t-4 border-yellow-200 shadow-lg flex items-center justify-center">
                  <span className="font-fun text-2xl sm:text-3xl font-black text-amber-950">1st</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                {top3 ? (
                  <div className="text-center mb-1.5">
                    <span className="text-3xl block">🥉</span>
                    <span className="font-fun font-bold text-xs sm:text-sm text-slate-800 truncate max-w-[90px] sm:max-w-[120px] block">
                      {top3.name}
                    </span>
                    <span className="text-xs font-black text-amber-800 block tabular-nums">
                      {top3.score} pts
                    </span>
                    <span className="text-[10px] text-slate-400 block tabular-nums">
                      ⏱ {formatTime(top3.timeSeconds)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 mb-2">Slot 3 Empty</span>
                )}
                <div className="w-full h-20 bg-gradient-to-t from-amber-700 to-amber-500 rounded-t-2xl border-t-4 border-amber-400 shadow-md flex items-center justify-center">
                  <span className="font-fun text-xl sm:text-2xl font-black text-amber-100">3rd</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Classroom Roster (Ranks 4 to 35, or all if searching) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2 pb-1 border-b border-slate-200">
              <span>Pupil & Rank ({searchQuery ? `Filtered (${filtered.length})` : `Ranks 4 – ${sorted.length}`})</span>
              <div className="flex items-center gap-6">
                <span>Accuracy</span>
                <span>Time</span>
              </div>
            </div>

            {(searchQuery ? filtered : restList).map((entry, idx) => {
              const rank = searchQuery
                ? sorted.findIndex(e => e.id === entry.id) + 1
                : idx + 4;

              const isTopThree = rank <= 3;

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all ${
                    isTopThree
                      ? 'bg-amber-100/60 border-amber-300 font-bold'
                      : 'bg-white hover:bg-amber-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-400 w-6 text-right tabular-nums">
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`}
                    </span>
                    <span className="font-fun text-sm font-bold text-slate-800">
                      {entry.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-5 sm:gap-8 text-xs font-mono font-bold">
                    <div className="flex items-center gap-1.5">
                      <div className="w-14 sm:w-20 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${entry.score}%` }}
                        />
                      </div>
                      <span className="text-amber-900 tabular-nums">{entry.score} pts</span>
                    </div>

                    <span className="text-slate-500 tabular-nums flex items-center gap-1 w-12 text-right">
                      <Timer className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTime(entry.timeSeconds)}</span>
                    </span>
                  </div>
                </div>
              );
            })}

            {sorted.length < 35 && !searchQuery && (
              <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <span>{35 - sorted.length} open slots remaining on the classroom leaderboard!</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-amber-200 mt-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm('Clear all classroom scores to start fresh for a new class?')) {
                  onResetLeaderboard();
                }
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Class Scores</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-amber-100 px-3 py-1.5 rounded-xl cursor-pointer"
              title="Print Classroom Hall of Fame Roster"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Roster</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onStartChallenge && (
              <button
                onClick={() => {
                  onClose();
                  onStartChallenge();
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-fun text-sm font-bold shadow-md btn-tactile cursor-pointer"
              >
                Take Challenge
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-fun text-sm font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
