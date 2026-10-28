import React, { useState } from 'react';
import { Play, Sparkles, Volume2, Trophy, HelpCircle, ArrowRight, Award, Flame, CheckCircle2 } from 'lucide-react';
import { CircusTent } from '../types/phonics';
import { audioEngine } from '../utils/audioEngine';

interface WelcomePageProps {
  tents: CircusTent[];
  onEnterCircus: (tentId?: string) => void;
  onOpenLeaderboard: () => void;
  onStartChallenge: () => void;
  totalStars: number;
  tickets: number;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  tents,
  onEnterCircus,
  onOpenLeaderboard,
  onStartChallenge,
  totalStars,
  tickets
}) => {
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);

  const handlePlayGreeting = () => {
    setIsPlayingGreeting(true);
    audioEngine.playTilePop(523.25);
    audioEngine.speakClue(
      "Roll up, roll up! Welcome to Year 1 Circus Phonics! Listen to the sound, pop the floating vowel balloon, and blend words together! Step right up and have fun!"
    );
    setTimeout(() => {
      setIsPlayingGreeting(false);
    }, 4500);
  };

  const handleStartGame = () => {
    audioEngine.playDingPerfectBlend();
    onEnterCircus();
  };

  const handleSelectTent = (tentId: string) => {
    audioEngine.playTilePop(440);
    onEnterCircus(tentId);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center">
      {/* Carnival Light Bulbs & Scallop Bunting Header */}
      <div className="w-full flex items-center justify-center gap-2 sm:gap-4 mb-2 overflow-hidden py-1">
        {['🔴', '🟡', '🟢', '🔵', '🟣', '🔴', '🟡', '🟢', '🔵', '🟣', '🔴', '🟡'].map((bulb, i) => (
          <span
            key={i}
            className="text-lg sm:text-2xl animate-pulse"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            {bulb}
          </span>
        ))}
      </div>

      {/* Main Grand Circus Marquee Frame */}
      <div className="w-full bg-gradient-to-b from-red-700 via-red-800 to-amber-950 rounded-3xl sm:rounded-[36px] p-6 sm:p-10 border-4 sm:border-8 border-yellow-400 shadow-2xl relative overflow-hidden text-center text-white mb-6">
        {/* Striped Canopy Top Accent */}
        <div className="absolute top-0 inset-x-0 h-4 bg-circus-stripes opacity-90 border-b-2 border-yellow-300" />

        {/* Glow ambient background lights */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-yellow-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-red-400/20 blur-3xl pointer-events-none" />

        {/* Year 1 Grade Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-300 text-amber-950 font-fun text-xs sm:text-sm font-black px-4 py-1.5 rounded-full shadow-md border-2 border-yellow-100 uppercase tracking-wider mb-4 animate-bounce">
          <Sparkles className="w-4 h-4 text-red-600 fill-red-600" />
          <span>Year 1 English Phonics Carnival</span>
          <Sparkles className="w-4 h-4 text-red-600 fill-red-600" />
        </div>

        {/* Grand Marquee Title */}
        <h1 className="font-fun text-4xl sm:text-6xl md:text-7xl font-black text-yellow-300 tracking-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] uppercase leading-none">
          The Great Circus
        </h1>
        <div className="font-fun text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-normal drop-shadow-md mt-1 mb-3">
          Balloon Pop!
        </div>

        <p className="font-fun text-base sm:text-xl text-yellow-100 font-bold max-w-2xl mx-auto drop-shadow-sm mb-6">
          Pop floating short vowel balloons, listen to pure British phonemes, and blend 3-letter CVC words to win tickets!
        </p>

        {/* Ringmaster Welcome Greeting Callout */}
        <div className="max-w-xl mx-auto bg-amber-950/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border-2 border-yellow-400/80 shadow-lg mb-8 flex flex-col sm:flex-row items-center gap-4 text-left">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-200 border-2 border-white shadow-md flex items-center justify-center text-4xl sm:text-5xl select-none">
              🎪
            </div>
            <span className="absolute -bottom-1 -right-1 text-xl select-none" role="img" aria-label="top hat">
              🎩
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="font-fun text-sm sm:text-base font-black text-yellow-300">
                The Circus Ringmaster
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full">
                British Phonics
              </span>
            </div>
            <p className="text-xs sm:text-sm text-yellow-100 font-medium leading-relaxed italic">
              "Roll up, roll up! Welcome to Year 1 Circus Phonics! Listen to the sound, pop the matching vowel balloon, and blend words!"
            </p>

            <button
              onClick={handlePlayGreeting}
              disabled={isPlayingGreeting}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-amber-950 font-fun text-xs font-black flex items-center justify-center sm:justify-start gap-1.5 shadow-md cursor-pointer transition-all border border-yellow-100"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingGreeting ? 'animate-bounce text-red-600' : ''}`} />
              <span>{isPlayingGreeting ? 'Listening to Ringmaster...' : 'Hear Ringmaster Voice 🔊'}</span>
            </button>
          </div>
        </div>

        {/* GIANT PLAY BUTTON for Year 1 Learners */}
        <div className="flex flex-col items-center justify-center gap-3">
          <button
            onClick={handleStartGame}
            className="group relative px-8 sm:px-14 py-4 sm:py-6 rounded-3xl bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 active:scale-95 text-amber-950 font-fun text-2xl sm:text-4xl font-black shadow-[0_12px_28px_rgba(245,158,11,0.5)] border-4 border-white flex items-center gap-3 cursor-pointer transition-all hover:scale-105"
            aria-label="Enter the Circus and Start Playing"
          >
            <span className="text-3xl sm:text-5xl group-hover:rotate-12 transition-transform select-none">
              🎪
            </span>
            <span className="tracking-wide drop-shadow-xs">
              STEP RIGHT UP! ENTER CIRCUS
            </span>
            <span className="text-3xl sm:text-5xl group-hover:-rotate-12 transition-transform select-none">
              🎈
            </span>
          </button>
          <span className="text-xs sm:text-sm font-bold text-yellow-200 uppercase tracking-widest">
            ✨ Tap above to explore all 5 Vowel Tents! ✨
          </span>
        </div>
      </div>

      {/* 3-Step Visual Picture Guide for Year 1 Pupils */}
      <div className="w-full mb-8">
        <div className="text-center mb-4">
          <span className="font-fun text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-900 bg-amber-100/90 px-3.5 py-1 rounded-full border border-amber-300">
            How To Play in 3 Fun Steps
          </span>
          <h2 className="font-fun text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Easy as 1, 2, 3!
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 Card */}
          <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-5 border-3 border-amber-300 shadow-lg flex flex-col items-center text-center hover:scale-[1.02] transition-transform">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-3xl mb-3 shadow-inner">
              👂
            </div>
            <span className="font-fun text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 mb-1">
              Step 1: Look & Listen
            </span>
            <h3 className="font-fun text-lg sm:text-xl font-black text-slate-900 mb-1">
              Consonant Frame
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Look at the missing middle vowel slot: <strong className="text-rose-600 font-mono text-sm">b [ ? ] g</strong>. Listen to the picture clue!
            </p>
          </div>

          {/* Step 2 Card */}
          <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-5 border-3 border-amber-300 shadow-lg flex flex-col items-center text-center hover:scale-[1.02] transition-transform">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl mb-3 shadow-inner">
              🎈
            </div>
            <span className="font-fun text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 mb-1">
              Step 2: Pop Balloon
            </span>
            <h3 className="font-fun text-lg sm:text-xl font-black text-slate-900 mb-1">
              Tap Floating Vowel
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Watch 5 colorful balloons drift up (a, e, i, o, u). Tap the correct vowel to pop it into the slot!
            </p>
          </div>

          {/* Step 3 Card */}
          <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-5 border-3 border-amber-300 shadow-lg flex flex-col items-center text-center hover:scale-[1.02] transition-transform">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-3xl mb-3 shadow-inner">
              🎟️
            </div>
            <span className="font-fun text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
              Step 3: Blend & Win
            </span>
            <h3 className="font-fun text-lg sm:text-xl font-black text-slate-900 mb-1">
              Blend British Sounds
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Hear <strong className="text-emerald-700">/b/ - /æ/ - /ɡ/ = bag!</strong> Celebrate with fanfare and earn circus tickets!
            </p>
          </div>
        </div>
      </div>

      {/* Direct Vowel Tent Shortcuts */}
      <div className="w-full bg-white/90 backdrop-blur-xs rounded-3xl p-6 border-2 border-amber-300 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-fun text-lg sm:text-xl font-black text-slate-900">
              🎪 Choose a Vowel Tent Directly
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Year 1 Short Vowel Sounds (8 CVC Words per Tent)
            </p>
          </div>
          <button
            onClick={() => onEnterCircus()}
            className="text-xs font-fun font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <span>See Fairground Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {tents.map(tent => (
            <button
              key={tent.id}
              onClick={() => handleSelectTent(tent.id)}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-50 to-orange-50/80 hover:from-amber-100 hover:to-orange-100 border-2 border-amber-300 hover:border-red-400 shadow-xs hover:shadow-md transition-all flex flex-col items-center cursor-pointer group text-center active:scale-95"
            >
              <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform mb-1 select-none">
                ⛺
              </span>
              <span className="font-fun text-base sm:text-lg font-black text-red-700">
                Tent {tent.vowel.toUpperCase()}
              </span>
              <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md mt-0.5">
                {tent.ipa}
              </span>
              <span className="text-[10px] text-slate-500 font-bold mt-1">
                {tent.words.length} Words
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Classroom Features Banner (35 Pupils Leaderboard & 10-Q Challenge) */}
      <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-100/90 rounded-2xl p-4 border border-amber-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
            🏆
          </div>
          <div className="text-left">
            <span className="font-fun text-sm font-black text-amber-950 block">
              Classroom Hall of Fame Active
            </span>
            <span className="text-xs text-amber-800 font-medium">
              Tracks up to 35 pupils in your class! Ready for fun phonics competitions.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenLeaderboard}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-fun text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={onStartChallenge}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-fun text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-yellow-300" />
            <span>10-Q Challenge</span>
          </button>
        </div>
      </div>
    </div>
  );
};
