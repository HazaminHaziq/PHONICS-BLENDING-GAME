import React, { useState } from 'react';
import { X, Award, Sparkles, Check, RotateCcw, Printer } from 'lucide-react';
import { CARNIVAL_TROPHIES } from '../data/cvcData';
import { LearnerProgress } from '../types/phonics';

interface TrophyModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: LearnerProgress;
  onResetProgress: () => void;
}

export const TrophyModal: React.FC<TrophyModalProps> = ({
  isOpen,
  onClose,
  progress,
  onResetProgress
}) => {
  const [studentName, setStudentName] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);

  if (!isOpen) return null;

  const totalWordsPracticed = progress.completedWords.length;
  const totalStars = Object.values(progress.starsByWord).reduce((a, b) => a + b, 0);

  // Check achievements dynamically
  const isFirstWord = totalWordsPracticed >= 1;
  const isMasterStriker = progress.tickets >= 5;
  const isTentExplorer = totalWordsPracticed >= 8;
  const isPictureChampion = totalStars >= 10;
  const isGrandRingmaster = progress.tickets >= 25;

  const unlockedMap: Record<string, boolean> = {
    first_word: isFirstWord,
    striker_ace: isMasterStriker,
    tent_explorer: isTentExplorer,
    quiz_master: isPictureChampion,
    ticket_collector: isGrandRingmaster
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-300 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          aria-label="Close Prize Booth"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <span className="text-4xl" role="img" aria-label="carnival booth">🎪</span>
          <h2 className="font-fun text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Carnival Prize Booth & Trophies
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Celebrate your phonics reading achievements at the fairground!
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-center">
            <span className="text-2xl">⭐</span>
            <span className="font-fun text-xl sm:text-2xl font-bold text-amber-900 block tabular-nums">
              {totalStars}
            </span>
            <span className="text-[11px] font-semibold text-amber-700">Stars Earned</span>
          </div>

          <div className="bg-rose-50 rounded-2xl p-3 border border-rose-200 text-center">
            <span className="text-2xl">🎟️</span>
            <span className="font-fun text-xl sm:text-2xl font-bold text-rose-900 block tabular-nums">
              {progress.tickets}
            </span>
            <span className="text-[11px] font-semibold text-rose-700">Golden Tickets</span>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 text-center">
            <span className="text-2xl">📖</span>
            <span className="font-fun text-xl sm:text-2xl font-bold text-emerald-900 block tabular-nums">
              {totalWordsPracticed}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700">Words Blended</span>
          </div>
        </div>

        {/* Trophies Grid */}
        <div className="mb-6">
          <h3 className="font-fun text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Circus Honor Badges</span>
          </h3>

          <div className="space-y-2.5">
            {CARNIVAL_TROPHIES.map(trophy => {
              const unlocked = unlockedMap[trophy.id];
              return (
                <div
                  key={trophy.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                    unlocked
                      ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{trophy.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-fun font-bold text-slate-900 text-sm">
                          {trophy.title}
                        </h4>
                        {unlocked && (
                          <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            <span>Unlocked</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{trophy.desc}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-400">
                    {unlocked ? '✨ Achieved' : '🔒 In Progress'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate Generator */}
        <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl p-4 border border-amber-300 my-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-fun text-sm font-bold text-red-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Personalized Circus Reader Certificate</span>
            </h4>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <input
              type="text"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="Enter Student / Learner Name..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-amber-300 bg-white text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-red-400"
            />
            <button
              onClick={() => setShowCertificate(true)}
              disabled={!studentName.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-fun text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <span>View Certificate</span>
            </button>
          </div>
        </div>

        {/* Digital Certificate Preview Modal */}
        {showCertificate && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
            <div className="relative w-full max-w-lg bg-amber-50 rounded-3xl p-6 sm:p-8 border-8 border-yellow-400 shadow-2xl text-center">
              <button
                onClick={() => setShowCertificate(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-amber-200 text-amber-900"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-4xl mb-1">🎪 🌟 🎪</div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-700">
                Official Fairground Honor
              </span>
              <h2 className="font-fun text-2xl sm:text-3xl font-black text-red-950 mt-1">
                Grand Circus Ringmaster
              </h2>
              <p className="text-xs text-amber-800 italic mt-0.5">
                CVC Phonics Blending Award
              </p>

              <div className="my-5 py-4 border-y-2 border-dashed border-amber-300 bg-white/60 rounded-xl">
                <span className="text-xs text-slate-500 block">Proudly Awarded To:</span>
                <span className="font-fun text-3xl font-black text-red-600 block mt-1 underline decoration-yellow-400">
                  {studentName}
                </span>
                <p className="text-xs text-slate-600 mt-2 px-4">
                  For successfully striking the High Striker bell and blending 3-letter CVC words with short vowels (/æ/, /e/, /ɪ/, /ɒ/, /ʌ/)!
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-amber-900 font-bold px-4">
                <span>⭐ Stars: {totalStars}</span>
                <span>🎟️ Tickets: {progress.tickets}</span>
                <span>🎪 Fairground Certified</span>
              </div>

              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-fun text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="px-4 py-2 bg-amber-200 text-amber-900 rounded-xl font-fun text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
          <button
            onClick={() => {
              if (window.confirm('Reset fairground progress for a new learner?')) {
                onResetProgress();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Learner Progress</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-fun text-sm font-bold cursor-pointer"
          >
            Back to Fun
          </button>
        </div>
      </div>
    </div>
  );
};
