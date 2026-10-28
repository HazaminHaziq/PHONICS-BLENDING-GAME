import React, { useState, useEffect, useRef } from 'react';
import { Bell, Sparkles, Zap } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface HighStrikerProps {
  level: number; // 0 to 100
  isStriking: boolean;
  isBellRinging: boolean;
  word: string;
  activeSoundLabel?: string;
  onTriggerStrike?: () => void;
  showDingSplash?: boolean;
}

export const HighStriker: React.FC<HighStrikerProps> = ({
  level,
  isStriking,
  isBellRinging,
  word,
  activeSoundLabel,
  onTriggerStrike,
  showDingSplash = false
}) => {
  const [visualHeight, setVisualHeight] = useState(10);
  const [dragProgress, setDragProgress] = useState(0); // 0 to 1 (pull distance)
  const [isDragging, setIsDragging] = useState(false);
  const [anvilRecoil, setAnvilRecoil] = useState(false);
  const dragStartY = useRef<number>(0);

  // Update visual puck height with smooth mechanical sound clicks
  useEffect(() => {
    const target = Math.max(6, Math.min(94, level));
    setVisualHeight(target);

    if (level > 20) {
      // Mechanical ratchet clicks as puck rises
      const timer1 = setTimeout(() => audioEngine.playPuckSlideClick(), 80);
      const timer2 = setTimeout(() => audioEngine.playPuckSlideClick(), 180);
      const timer3 = setTimeout(() => audioEngine.playPuckSlideClick(), 280);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [level]);

  // Handle Drag-and-Release on Mallet
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStartY.current;
    // Pulling down charges tension (0 to 100px)
    const pull = Math.max(0, Math.min(100, deltaY));
    const normalized = pull / 100;
    setDragProgress(normalized);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // If pulled at least 30%, trigger strike!
    if (dragProgress >= 0.25 || !onTriggerStrike) {
      triggerStrikePhysics(dragProgress);
    } else {
      setDragProgress(0);
    }
  };

  const triggerStrikePhysics = (power: number = 0.8) => {
    setDragProgress(0);
    setAnvilRecoil(true);
    audioEngine.playAnvilHit(Math.max(0.6, power * 1.5));
    setTimeout(() => setAnvilRecoil(false), 250);

    if (onTriggerStrike) {
      onTriggerStrike();
    }
  };

  // Mallet dynamic rotation:
  // When dragging: rotate backward -20deg to -70deg
  // When striking: snap down to +30deg
  let malletRotation = 0;
  if (isDragging) {
    malletRotation = -20 - dragProgress * 50;
  } else if (isStriking) {
    malletRotation = 35;
  }

  return (
    <div className="relative flex flex-col items-center bg-gradient-to-b from-amber-100/90 via-amber-50 to-orange-100/80 rounded-3xl p-5 border-2 border-amber-300 shadow-xl w-full max-w-[300px] mx-auto select-none overflow-hidden">
      {/* "Ding! Perfect Blend!" Splash Badge Overlay */}
      {showDingSplash && (
        <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 rounded-3xl p-5 border-4 border-yellow-300 shadow-2xl text-center text-white transform animate-bounce">
            <span className="text-4xl block mb-1">🔔 🌟 🎪</span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-yellow-200">
              High Striker Champion!
            </span>
            <h3 className="font-fun text-2xl font-black drop-shadow-md text-white mt-0.5">
              Ding! Perfect Blend!
            </h3>
            <div className="my-2 bg-white/20 rounded-xl py-1 px-3">
              <span className="font-fun text-3xl font-black text-yellow-200 uppercase tracking-widest">
                {word}
              </span>
            </div>
            <p className="text-xs text-yellow-100 font-semibold">
              Top bell struck with full power!
            </p>
          </div>
        </div>
      )}

      {/* Decorative Circus Flags Bunting */}
      <div className="w-full flex justify-between px-2 -mt-1 mb-2 text-xs opacity-75">
        <span>🚩</span>
        <span>🎪</span>
        <span>🚩</span>
        <span>🎪</span>
        <span>🚩</span>
      </div>

      <div className="text-center mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300">
          Strength Slider
        </span>
        <h3 className="font-fun text-lg font-bold text-slate-800 mt-0.5 leading-none">
          High Striker Tower
        </h3>
      </div>

      {/* Golden Bell at the Top */}
      <div className="relative mb-2 flex flex-col items-center">
        <div
          className={`relative p-3 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-100 shadow-md border-2 border-yellow-600 transition-transform duration-300 ${
            isBellRinging ? 'animate-bell scale-110 shadow-yellow-400/60 ring-4 ring-yellow-300' : 'hover:scale-105'
          }`}
        >
          <Bell className="w-8 h-8 text-amber-900 fill-yellow-400" />
          {isBellRinging && (
            <span className="absolute -top-3 -right-2 bg-red-600 text-white font-fun text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs animate-bounce">
              DING!
            </span>
          )}
        </div>

        {/* Golden Sparks Burst */}
        {isBellRinging && (
          <div className="absolute -top-4 inset-x-0 flex justify-center items-center pointer-events-none">
            <Sparkles className="w-12 h-12 text-yellow-400 fill-yellow-300 animate-spin" />
          </div>
        )}
      </div>

      {/* The Tower Column / Graduated Rail */}
      <div className="relative w-22 h-72 sm:h-80 bg-gradient-to-b from-red-600 via-amber-500 to-red-700 rounded-2xl border-4 border-yellow-400 shadow-inner flex flex-col justify-between py-4 items-center">
        {/* Metal guide track down the center */}
        <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-2 bg-slate-300/80 rounded-full border border-slate-500/50 shadow-xs" />

        {/* Graduated Level Tick Marks */}
        <div className="w-full flex justify-between px-2 text-[10px] font-bold text-white z-10">
          <span className="bg-red-800/80 px-1 rounded-sm">100</span>
          <span className="text-[9px] text-yellow-200">BELL</span>
        </div>
        <div className="w-full flex justify-between px-2 text-[10px] font-bold text-white/90 z-10">
          <span className="bg-red-800/80 px-1 rounded-sm">75</span>
          <span className="text-[9px] text-yellow-100">BLEND</span>
        </div>
        <div className="w-full flex justify-between px-2 text-[10px] font-bold text-white/90 z-10">
          <span className="bg-red-800/80 px-1 rounded-sm">50</span>
          <span className="text-[9px] text-yellow-100">RIME</span>
        </div>
        <div className="w-full flex justify-between px-2 text-[10px] font-bold text-white/90 z-10">
          <span className="bg-red-800/80 px-1 rounded-sm">25</span>
          <span className="text-[9px] text-yellow-100">ONSET</span>
        </div>
        <div className="w-full flex justify-between px-2 text-[10px] font-bold text-white/90 z-10">
          <span className="bg-red-800/80 px-1 rounded-sm">0</span>
          <span className="text-[9px] text-yellow-100">ANVIL</span>
        </div>

        {/* The Animated Yellow Striker Puck */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-20 transition-all duration-400 cubic-bezier(0.18, 0.89, 0.32, 1.28)"
          style={{ bottom: `${visualHeight}%` }}
        >
          <div className="relative">
            {/* Yellow Puck Disc */}
            <div className="w-14 h-7 rounded-lg bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 border-2 border-yellow-100 shadow-lg flex items-center justify-center">
              <div className="w-9 h-1.5 bg-yellow-100 rounded-full" />
            </div>
            {visualHeight > 55 && (
              <div className="absolute inset-0 rounded-lg bg-yellow-300 blur-xs -z-10 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* The Interactive Anvil & Drag-and-Release 3D Mallet */}
      <div className="relative w-full mt-3 flex flex-col items-center">
        {/* Anvil Plate with Recoil Animation */}
        <div
          className={`w-28 h-8 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-900 rounded-lg border-2 border-slate-950 shadow-md flex items-center justify-center text-[10px] font-bold text-slate-300 transition-transform duration-100 ${
            anvilRecoil ? 'scale-y-75 translate-y-1' : ''
          }`}
        >
          <span>LAUNCHER PAD</span>
        </div>

        {/* Tension Meter Indicator when Dragging */}
        <div className="w-full mt-2">
          {isDragging ? (
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden border border-amber-400">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 transition-all duration-75"
                style={{ width: `${dragProgress * 100}%` }}
              />
            </div>
          ) : (
            <div className="text-[10px] font-bold text-amber-800 text-center flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-amber-600" />
              <span>Pull & Release Mallet to Strike!</span>
            </div>
          )}
        </div>

        {/* 3D Wooden Mallet with Drag Handler */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            transform: `rotate(${malletRotation}deg)`,
            transformOrigin: 'bottom right'
          }}
          className={`cursor-grab active:cursor-grabbing p-2 mt-1 transition-transform ${
            !isDragging && !isStriking ? 'duration-200' : ''
          }`}
          title="Drag down to pull back, release to hit the anvil!"
          aria-label="Interactive 3D Mallet. Drag to pull back and release."
        >
          {/* Mallet Visual Construction */}
          <div className="flex items-center">
            {/* Wooden Mallet Head */}
            <div className="w-12 h-7 rounded-md bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 border-2 border-yellow-600 shadow-md flex items-center justify-center text-xs text-yellow-300 font-bold select-none">
              🔨
            </div>
            {/* Wooden Handle */}
            <div className="w-16 h-3 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 rounded-r-full border-t border-b border-amber-800 shadow-xs" />
          </div>
        </div>

        {/* Accessibility Quick Hit Button */}
        <button
          onClick={() => triggerStrikePhysics(0.9)}
          className="mt-1 px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-[11px] font-bold border border-amber-300 transition-colors btn-tactile cursor-pointer"
        >
          ⚡ Tap to Strike
        </button>
      </div>

      {/* Active Sound / Blending Indicator */}
      <div className="mt-3 w-full bg-white/95 rounded-xl p-2 border border-amber-200 text-center">
        <span className="text-[10px] text-slate-500 block">Sound Height:</span>
        <span className="font-fun text-xs sm:text-sm font-bold text-red-600 block truncate">
          {activeSoundLabel || (level >= 90 ? `Blended: "${word.toUpperCase()}!"` : 'Pull mallet or tap sound buttons')}
        </span>
      </div>
    </div>
  );
};
