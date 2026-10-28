import React from 'react';
import { Star, Sparkles, ArrowRight, CheckCircle2, Trophy, Volume2, Flame, Lock } from 'lucide-react';
import { CircusTent, LearnerProgress } from '../types/phonics';
import { audioEngine } from '../utils/audioEngine';

interface HubMapProps {
  tents: CircusTent[];
  progress: LearnerProgress;
  onSelectTent: (tent: CircusTent) => void;
  onOpenTrophies: () => void;
  onOpenLeaderboard: () => void;
  onStartChallenge: () => void;
  onOpenTeacherStudio?: () => void;
}

export const HubMap: React.FC<HubMapProps> = ({
  tents,
  progress,
  onSelectTent,
  onOpenTrophies,
  onOpenLeaderboard,
  onStartChallenge,
  onOpenTeacherStudio
}) => {
  const getTentStars = (tent: CircusTent) => {
    return tent.words.reduce((acc, w) => acc + (progress.starsByWord[w.id] || 0), 0);
  };

  const getTentCompletedCount = (tent: CircusTent) => {
    return tent.words.filter(w => progress.completedWords.includes(w.id)).length;
  };

  const playTentWelcome = (tent: CircusTent, e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.speakPhoneme(tent.vowel, 'vowel');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 select-none">
      {/* Fairground Hero Lockup with Balloon Pop Booth Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white p-6 sm:p-10 shadow-2xl border-4 border-yellow-300 mb-8 sm:mb-10">
        {/* Decorative Fairground Pennants */}
        <div className="absolute top-0 inset-x-0 flex justify-around text-lg opacity-85 select-none py-1 pointer-events-none">
          <span>🎈</span>
          <span>🎪</span>
          <span>🚩</span>
          <span>🎈</span>
          <span>⭐</span>
          <span>🚩</span>
          <span>🎈</span>
          <span>🎪</span>
          <span>🚩</span>
        </div>

        {/* Striped Canopy Top Accent */}
        <div className="absolute top-0 inset-x-0 h-3 bg-circus-stripes border-b border-yellow-300 opacity-90" />

        <div className="relative z-10 max-w-3xl pt-2">
          <div className="inline-flex items-center gap-2 bg-yellow-400/25 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-yellow-300 text-xs sm:text-sm font-black text-yellow-100 mb-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>⭐ Year 1 English Phonics Carnival · Pop & Blend Station ⭐</span>
          </div>

          <h1 className="font-fun text-3xl sm:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
            The Great Circus Balloon Pop!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-yellow-100 font-medium leading-relaxed max-w-2xl">
            A vibrant carnival booth with floating helium balloons! Look at the consonant frame (e.g. <strong className="text-white underline decoration-yellow-400">b [ ? ] g</strong>). Pop the drifting vowel balloon (<strong className="text-white">a</strong>) to hear the pure British phonemes and blend the word with fanfare!
          </p>

          {/* Action CTAs: 10-Question Challenge + Leaderboard + Free Practice */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartChallenge}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-300 to-amber-400 hover:from-yellow-400 hover:to-amber-500 text-red-950 font-fun text-base font-black shadow-lg shadow-black/20 transition-all btn-tactile cursor-pointer flex items-center gap-2 border-2 border-yellow-100"
            >
              <Flame className="w-5 h-5 text-red-600 fill-red-500 animate-pulse" />
              <span>Start 10-Q Balloon Pop Challenge!</span>
            </button>

            <button
              onClick={onOpenLeaderboard}
              className="px-4 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-fun text-sm font-bold backdrop-blur-xs transition-all btn-tactile cursor-pointer flex items-center gap-2 border border-white/40"
            >
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span>Class Leaderboard (35 Pupils)</span>
            </button>

            <button
              onClick={onOpenTrophies}
              className="px-4 py-3.5 rounded-2xl bg-black/20 hover:bg-black/30 text-yellow-200 font-fun text-sm font-bold backdrop-blur-xs transition-all btn-tactile cursor-pointer"
            >
              <span>Prize Booth</span>
            </button>

            {onOpenTeacherStudio && (
              <button
                onClick={onOpenTeacherStudio}
                className="px-4 py-3.5 rounded-2xl bg-indigo-950/40 hover:bg-indigo-950/60 text-indigo-100 font-fun text-sm font-bold backdrop-blur-xs transition-all btn-tactile cursor-pointer flex items-center gap-2 border border-indigo-300/40 shadow-xs"
                title="Teacher Audio Studio: Record or upload custom phonics audio (PIN: 1234)"
              >
                <Lock className="w-4 h-4 text-indigo-300" />
                <span>Teacher Studio</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient Balloon Booth graphic preview */}
        <div className="absolute -right-10 -bottom-10 w-72 h-48 opacity-25 sm:opacity-35 rounded-2xl overflow-hidden pointer-events-none">
          <img
            src="/src/assets/images/balloon_carnival_booth_1792858302995.jpg"
            alt="Carnival Balloon Booth"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 5 Distinct Themed Short Vowel Modules with Real 3D Tent Pictures */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="font-fun text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Select Your Circus Tent Station
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Real big-top stages for each vowel sound. Tap any tent to enter!
            </p>
          </div>

          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-fun text-xs font-bold transition-all border border-amber-300 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Circus High Scores</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tents.map(tent => {
            const stars = getTentStars(tent);
            const completedCount = getTentCompletedCount(tent);
            const totalWords = tent.words.length;
            const isFullyCompleted = completedCount === totalWords;

            return (
              <div
                key={tent.id}
                onClick={() => onSelectTent(tent)}
                className="group relative flex flex-col justify-between bg-white rounded-3xl border-3 border-amber-200 hover:border-red-500 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer btn-tactile overflow-hidden"
              >
                {/* Completed Master Ribbon Badge */}
                {isFullyCompleted && (
                  <div className="absolute top-3 right-3 z-20 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mastered!</span>
                  </div>
                )}

                <div>
                  {/* Real 3D Illustrated Circus Big Top Tent Picture */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={tent.imagePath}
                      alt={`${tent.name} - ${tent.themeTitle}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Contrast scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Vowel & IPA Target Badge on Top Left */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                      <button
                        onClick={e => playTentWelcome(tent, e)}
                        className="w-11 h-11 rounded-2xl bg-white text-red-600 font-fun text-2xl font-black shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-2 border-yellow-400"
                        title={`Listen to short vowel ${tent.vowel}`}
                        aria-label={`Listen to short vowel ${tent.vowel}`}
                      >
                        {tent.vowel.toUpperCase()}
                      </button>
                      <span className="font-mono text-sm font-bold bg-black/60 backdrop-blur-xs text-yellow-300 px-2 py-0.5 rounded-lg border border-yellow-400/40">
                        {tent.ipa}
                      </span>
                    </div>

                    {/* Tent Title Lockup at Bottom of Image */}
                    <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-yellow-300 block drop-shadow-xs">
                        Short Vowel Module
                      </span>
                      <h3 className="font-fun text-2xl font-black leading-tight drop-shadow-md">
                        {tent.name} · {tent.subTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <p className="text-xs text-slate-600 leading-snug">
                      {tent.description}
                    </p>
                    <div className="mt-2 text-[11px] font-medium text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200">
                      👄 <strong>Mouth: </strong> {tent.mouthGuide}
                    </div>

                    {/* Target Words Badges */}
                    <div className="my-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Practice Words:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tent.words.slice(0, 5).map(w => (
                          <span
                            key={w.id}
                            className="px-2 py-0.5 bg-slate-100 group-hover:bg-amber-100 rounded-lg text-xs font-fun font-bold text-slate-700 transition-colors"
                          >
                            {w.word}
                          </span>
                        ))}
                        {tent.words.length > 5 && (
                          <span className="text-xs text-slate-400 font-semibold self-center">
                            +{tent.words.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Progress Bar & Enter Action */}
                <div className="px-5 pb-5 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <div className="flex items-center gap-1 text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{stars} Stars</span>
                    </div>
                    <span>{completedCount} / {totalWords} words</span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-500"
                      style={{ width: `${(completedCount / totalWords) * 100}%` }}
                    />
                  </div>

                  <button
                    onClick={() => onSelectTent(tent)}
                    className="w-full mt-3 py-2.5 rounded-xl bg-slate-900 group-hover:bg-red-600 text-white font-fun text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Enter {tent.name}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
