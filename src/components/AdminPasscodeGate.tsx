import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, ArrowRight, Delete } from 'lucide-react';

interface AdminPasscodeGateProps {
  onAuthenticated: () => void;
}

export const AdminPasscodeGate: React.FC<AdminPasscodeGateProps> = ({ onAuthenticated }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmitPin = async (codeToSubmit: string) => {
    if (codeToSubmit.length < 4) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: codeToSubmit }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('shaadi_admin_auth', '1');
        onAuthenticated();
      } else {
        setError(data.error || 'Incorrect Host PIN');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setPin('');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      if (nextPin.length === 4) {
        handleSubmitPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  // Capture physical keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter' && pin.length >= 4) {
        handleSubmitPin(pin);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Lock Card */}
      <div className={`w-full max-w-sm bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center relative z-10 ${shake ? 'animate-bounce' : ''}`}>
        
        {/* Monogram Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-100 text-neutral-950 flex items-center justify-center font-serif text-2xl font-black shadow-xl ring-4 ring-amber-400/20 mb-4">
          A&amp;R
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest mb-2">
            <Lock className="w-3 h-3" />
            <span>Host &amp; Banquet Portal</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Security Passcode Required
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-[260px] leading-relaxed">
            Enter your 4-digit Wedding Host PIN to view confidential banquet financials &amp; Taj Palace guest rosters.
          </p>
        </div>

        {/* 4-Dot Passcode Display */}
        <div className="flex items-center justify-center gap-4 my-3">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-amber-400 scale-110 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                    : 'bg-neutral-800 border border-neutral-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {error ? (
          <div className="text-xs text-red-400 font-semibold mb-3 text-center animate-fade-in">
            {error}
          </div>
        ) : (
          <div className="h-5 mb-2" />
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px] mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-neutral-800/80 hover:bg-neutral-700/80 active:scale-95 text-xl font-bold text-white transition border border-neutral-700/50 flex items-center justify-center shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-neutral-800/40 hover:bg-neutral-700/60 active:scale-95 text-neutral-400 hover:text-white transition border border-neutral-700/30 flex items-center justify-center"
            title="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-neutral-800/80 hover:bg-neutral-700/80 active:scale-95 text-xl font-bold text-white transition border border-neutral-700/50 flex items-center justify-center shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleSubmitPin(pin)}
            disabled={pin.length < 4 || loading}
            className={`h-14 rounded-2xl transition border flex items-center justify-center ${
              pin.length >= 4
                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold border-amber-400 active:scale-95 shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/40 text-neutral-600 border-neutral-700/30 cursor-not-allowed'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Helper Button */}
        <div className="w-full pt-3 border-t border-neutral-800 text-center">
          <button
            type="button"
            onClick={() => {
              setPin('2026');
              handleSubmitPin('2026');
            }}
            className="text-[11px] text-neutral-400 hover:text-amber-300 font-medium transition inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-neutral-800/60"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Click to Fill Default PIN (<strong>2026</strong>)</span>
          </button>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-[10px] tracking-widest text-neutral-500 uppercase font-semibold">
        ShaadiSync Enterprise • Realtime Banquet Architecture
      </div>
    </div>
  );
};
