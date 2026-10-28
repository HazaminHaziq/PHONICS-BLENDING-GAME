import React, { useState } from 'react';
import { Lock, X, Check, Delete } from 'lucide-react';
import { audioStorage } from '../utils/audioStorage';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMessage(null);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage(null);
  };

  const verifyPin = (enteredPin: string) => {
    const correctPin = audioStorage.getTeacherPIN();
    if (enteredPin === correctPin) {
      setPin('');
      setErrorMessage(null);
      onSuccess();
    } else {
      setErrorShake(true);
      setErrorMessage('Incorrect PIN. Default is 1234');
      setTimeout(() => {
        setErrorShake(false);
        setPin('');
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-fadeIn">
      <div
        className={`relative w-full max-w-sm bg-gradient-to-b from-white to-amber-50 rounded-3xl p-6 border-4 border-yellow-400 shadow-2xl text-center ${
          errorShake ? 'animate-bounce' : ''
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
          aria-label="Close PIN Pad"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="font-fun text-xl font-bold text-slate-900">
          Teacher Audio Studio
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter 4-digit teacher PIN to edit & insert audio (Default: <strong className="text-amber-800">1234</strong>)
        </p>

        {/* PIN Dots Indicator */}
        <div className="flex items-center justify-center gap-3 my-4">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? 'bg-red-600 border-red-700 scale-110 shadow-xs'
                  : 'bg-white border-amber-300'
              }`}
            />
          ))}
        </div>

        {errorMessage && (
          <div className="text-xs font-bold text-rose-600 mb-2">
            {errorMessage}
          </div>
        )}

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto my-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-12 rounded-2xl bg-white hover:bg-amber-100 text-slate-800 font-fun text-xl font-bold border-2 border-amber-200 shadow-xs btn-tactile cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold border border-slate-200 btn-tactile cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-2xl bg-white hover:bg-amber-100 text-slate-800 font-fun text-xl font-bold border-2 border-amber-200 shadow-xs btn-tactile cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border border-slate-200 btn-tactile cursor-pointer"
            aria-label="Delete last digit"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
