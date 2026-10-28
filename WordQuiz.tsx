import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, RotateCcw, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CVCWord, PictureOption } from '../types/phonics';
import { audioEngine } from '../utils/audioEngine';

interface WordQuizProps {
  word: CVCWord;
  onCorrectAnswer: () => void;
  onNextWord: () => void;
  isLastWord: boolean;
  onReturnToHub: () => void;
}

export const WordQuiz: React.FC<WordQuizProps> = ({
  word,
  onCorrectAnswer,
  onNextWord,
  isLastWord,
  onReturnToHub
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<PictureOption[]>([]);
  const [isAnsweredCorrect, setIsAnsweredCorrect] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [shakeOptionId, setShakeOptionId] = useState<string | null>(null);

  // Shuffle the correct picture with distractors whenever word changes
  useEffect(() => {
    setSelectedOptionId(null);
    setIsAnsweredCorrect(false);
    setFeedbackMessage(null);
    setShakeOptionId(null);

    const all = [word.correctPicture, ...word.distractors];
    // Deterministic or playful shuffle
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
  }, [word]);

  const handleSelectOption = (option: PictureOption) => {
    setSelectedOptionId(option.id);

    if (option.id === word.correctPicture.id) {
      // Correct!
      setIsAnsweredCorrect(true);
      setFeedbackMessage(`Super! You found the ${option.label}!`);
      audioEngine.playSuccessFanfare();
      audioEngine.playTicketSound();
      audioEngine.speakWord(`Yes! ${word.word}`);

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']
        });
      } catch {
        // ignore if canvas unavailable
      }

      onCorrectAnswer();
    } else {
      // Incorrect (gentle, non-punitive feedback)
      setShakeOptionId(option.id);
      audioEngine.playGentleBoing();
      setFeedbackMessage(`That's the ${option.label}. Listen again for "${word.word}"!`);
      setTimeout(() => setShakeOptionId(null), 600);
    }
  };

  const handleReplayPrompt = () => {
    audioEngine.speakWord(`Can you find the picture for: ${word.word}?`);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-b from-white to-amber-50 rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-lg mt-6 select-none">
      {/* Quiz Header & Prompt */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            Self-Checking Station
          </span>
          <h3 className="font-fun text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Can you find the picture?
          </h3>
        </div>

        {/* Audio Prompt Button */}
        <button
          onClick={handleReplayPrompt}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-fun text-sm font-bold shadow-xs btn-tactile cursor-pointer"
          title="Listen to the target word prompt"
          aria-label={`Listen to prompt for word ${word.word}`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Say "{word.word}"</span>
        </button>
      </div>

      {/* 3 Visual Choice Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 my-4">
        {shuffledOptions.map(option => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = option.id === word.correctPicture.id;
          const isShaking = shakeOptionId === option.id;

          let cardStyle = 'bg-white hover:bg-amber-50/80 border-slate-200 text-slate-800';
          if (isSelected) {
            if (isCorrect) {
              cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-4 ring-emerald-300 scale-105';
            } else {
              cardStyle = 'bg-rose-50 border-rose-400 text-rose-900';
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option)}
              disabled={isAnsweredCorrect}
              className={`relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-3 shadow-md transition-all btn-tactile cursor-pointer select-none ${cardStyle} ${
                isShaking ? 'animate-bounce' : ''
              }`}
              aria-label={`Picture choice: ${option.label}`}
            >
              {/* Giant Visual Emoji / Icon */}
              <span className="text-5xl sm:text-6xl drop-shadow-xs mb-2 transition-transform group-hover:scale-110">
                {option.emoji}
              </span>

              {/* Text Label */}
              <span className="font-fun text-base sm:text-lg font-bold tracking-tight">
                {option.label}
              </span>

              {/* Status Badge */}
              {isSelected && isCorrect && (
                <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm font-semibold transition-all my-3 ${
            isAnsweredCorrect
              ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
              : 'bg-rose-100 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {isAnsweredCorrect ? (
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage}</span>
          </div>

          {!isAnsweredCorrect && (
            <button
              onClick={() => {
                setSelectedOptionId(null);
                setFeedbackMessage(null);
              }}
              className="text-xs font-bold underline flex items-center gap-1 hover:text-rose-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Post-Answer Action: Advance to Next Station or Next Word */}
      {isAnsweredCorrect && (
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 mt-4 pt-3 border-t border-amber-200">
          <button
            onClick={onReturnToHub}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-900 font-fun text-sm font-bold btn-tactile cursor-pointer"
          >
            Back to Fairground Map
          </button>

          {!isLastWord ? (
            <button
              onClick={onNextWord}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-fun text-sm sm:text-base font-bold shadow-md btn-tactile cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Next Word</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onReturnToHub}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-fun text-sm sm:text-base font-bold shadow-md btn-tactile cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Tent Completed! Celebrate!</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
