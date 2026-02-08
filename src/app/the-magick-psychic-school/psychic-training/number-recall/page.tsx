"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Brain, RotateCcw, Settings, X, Check, HelpCircle, 
  ChevronRight, Trophy, Sparkles, Lock, RefreshCw,
  Maximize2, Minimize2, Volume2, VolumeX, Eye
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import { useHaptics } from '@/hooks/useHaptics';
import PsychicStatsModal from '../components/PsychicStatsModal';
import { calculateZScore } from '../utils/psychicStats';
import { RadarCategory } from '../components/ResonanceRadar';

// --- VISUAL ASSETS ---
const CARD_BACKS = [
  { 
    id: 'default', 
    name: 'Stardust', 
    css: "bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" 
  },
  { 
    id: 'stars', 
    name: 'Deep Space', 
    css: "bg-black bg-[radial-gradient(white_1px,transparent_1px)] [background-size:16px_16px]" 
  },
  { 
    id: 'hypnotic', 
    name: 'Hypnotic', 
    css: "bg-[conic-gradient(at_center,red,orange,yellow,green,blue,indigo,violet,red)]" 
  },
  { 
    id: 'gold', 
    name: 'Golden Metal', 
    css: "bg-linear-to-br from-yellow-700 via-yellow-200 to-yellow-800" 
  },
  {
    id: 'classic',
    name: 'Classic',
    css: "bg-zinc-900"
  }
];

// --- AUDIO ENGINE ---
const useAudioEngine = () => {
  const ctxRef = useRef<AudioContext | null>(null);

  const init = () => {
      const win = (globalThis as any).window;
      if (typeof win !== 'undefined' && !ctxRef.current) {
        const AudioContext = win.AudioContext || win.webkitAudioContext;
        if (AudioContext) ctxRef.current = new AudioContext();
      }
      if (ctxRef.current?.state === 'suspended') ctxRef.current.resume();
  };

  const playSound = (type: string) => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'reveal':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'success':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      case 'fail':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'click':
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
    }
  };

  return { init, playSound };
};

// --- INSTRUCTION MODAL ---
const InstructionModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in duration-500">
    <div className="max-w-md w-full border border-indigo-500/30 bg-[#0f172a] p-8 rounded-xl shadow-[0_0_50px_rgba(99,102,241,0.2)] text-center relative">
        <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-indigo-400 mb-2 tracking-tighter font-serif">NUMBER RECALL</h2>
        <p className="text-xs font-mono text-slate-400 uppercase tracking-[0.2em] mb-6">Numerical Intuition Protocol</p>
        
        <div className="text-left space-y-4 mb-8 bg-black/40 p-4 rounded border border-white/5 text-sm text-slate-300 font-mono">
            <p className="leading-relaxed"><strong className="text-indigo-400">OBJECTIVE:</strong> Determine the hidden number behind the card.</p>
            <p className="leading-relaxed"><strong className="text-purple-400">PARAMS:</strong> Use the slider to adjust complexity (1-10 digits).</p>
            <p className="leading-relaxed"><strong className="text-emerald-400">METHOD:</strong> Focus on the card. Let the number appear in your mind's eye.</p>
        </div>

        <button 
          onClick={onClose} 
          className="w-full py-3 bg-indigo-900/50 hover:bg-indigo-800/80 border border-indigo-500/50 text-indigo-100 font-mono font-bold tracking-widest uppercase transition-all duration-300 rounded hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
        >
          Begin Protocol
        </button>
    </div>
  </div>
);

// --- MAIN APP ---
export default function NumberRecallApp() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  // State
  const [numDigits, setNumDigits] = useState(1);
  const [targetNumber, setTargetNumber] = useState<string>('');
  const [userGuess, setUserGuess] = useState('');
  const [gameState, setGameState] = useState<'WAITING' | 'REVEALED'>('WAITING');
  const [history, setHistory] = useState<any[]>([]);
  const [cardBack, setCardBack] = useState('stars');
  const [showSettings, setShowSettings] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const haptics = useHaptics();
  const audio = useAudioEngine();

  // Initialization
  useEffect(() => {
    audio.init();
    startNewRound(numDigits);
  }, []); // Run once on mount

  // Generators
  const generateNumber = (digits: number) => {
    // Cryptographically secure RNG for 'digits' length number
    // Max safe integer is 9e15, so 15 digits is safe for JS number.
    // For string based (up to 10 digits as requested), we can just use Math.random or crypto.
    // For strict 1 to 10 digits:
    // 1 digit: 0-9
    // 2 digits: 0-99
    
    // Using crypto for better randomness
    const maxVal = Math.pow(10, digits);
    const buffer = new Uint32Array(1);
    const win = (globalThis as any).window;
    
    let randomVal = 0;
    if (win && win.crypto) {
        win.crypto.getRandomValues(buffer);
        // Normalize to 0-1
        const r = buffer[0] / (0xFFFFFFFF + 1);
        randomVal = Math.floor(r * maxVal);
    } else {
        randomVal = Math.floor(Math.random() * maxVal);
    }
    
    // We want to represent it as a string, potentially with leading zeros?
    // The prompt says "if they choose number 2, then they will be offered a number that will be between 0 and 99"
    // So 5 is "5", not "05" necessarily, unless strictly 2 digits.
    // "Size of the number will be in how many digits it has"
    // "0-99" implies standard number representation.
    return randomVal.toString();
  };

  const startNewRound = (digits = numDigits) => {
    // 1. Start Flip Back
    setGameState('WAITING');
    
    // 2. Clear Guess immediately
    setUserGuess('');

    // 3. Generate new number ONLY after card is edge-on (approx 300ms)
    // This prevents the user from seeing the next number during the flip back animation
    setTimeout(() => {
        const newTarget = generateNumber(digits);
        setTargetNumber(newTarget);
    }, 300);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userGuess || gameState === 'REVEALED') return;

    const isCorrect = userGuess === targetNumber;
    
    // Play Effects
    if (isCorrect) {
        audio.playSound('success');
        haptics.triggerHeavy();
    } else {
        audio.playSound('fail');
        haptics.triggerLight();
    }

    setGameState('REVEALED');

    // Record Stats
    const newRecord = {
      trial: history.length + 1,
      target: targetNumber,
      guess: userGuess,
      digits: numDigits,
      correct: isCorrect,
      timestamp: Date.now()
    };
    
    const updatedHistory = [...history, newRecord];
    setHistory(updatedHistory);
  };

  const handleDigitChange = (val: number) => {
    setNumDigits(val);
    startNewRound(val);
  };

  const handleResetSession = () => {
    setHistory([]);
    startNewRound(numDigits);
    setShowSettings(false);
  };

  // Stats derivations
  const stats = useMemo(() => {
    const hits = history.filter(h => h.correct).length;
    const trials = history.length;
    
    // Max Streak
    let max = 0;
    let current = 0;
    history.forEach(h => {
        if (h.correct) {
            current++;
            if (current > max) max = current;
        } else {
            current = 0;
        }
    });

    return { hits, trials, maxStreak: max };
  }, [history]);

  // Radar Data - Group by Digits
  const radarData: RadarCategory[] = useMemo(() => {
     // We want to show performance per digit count.
     // Categories like "1 Digit", "2 Digits", etc. might be too many for radar (max 6 usually good).
     // Let's group: "Low (1-3)", "Mid (4-6)", "High (7-10)"?
     // Or just top 5 most played digit counts?
     // Let's stick to simple grouping for now or just standard categories.
     // The prompt asked: "for the soul resonance information, we can just use % success that is categorized by the number of digits tested."
     
     // Let's dynamically create categories for digits present in history.
     const digitGroups: Record<number, { hits: number, total: number }> = {};
     history.forEach(h => {
        if (!digitGroups[h.digits]) digitGroups[h.digits] = { hits: 0, total: 0 };
        digitGroups[h.digits].total++;
        if (h.correct) digitGroups[h.digits].hits++;
     });

     const categories: RadarCategory[] = Object.keys(digitGroups).map(d => {
        const digits = parseInt(d);
        const { hits, total } = digitGroups[digits];
        return {
            id: `D${digits}`,
            label: `${digits} ${digits === 1 ? 'Digit' : 'Digits'}`,
            value: total > 0 ? (hits / total) * 100 : 0,
            fullMark: 100,
            color: digits <= 3 ? '#22d3ee' : digits <= 6 ? '#a78bfa' : '#f472b6'
        };
     }).sort((a,b) => parseInt(a.id.substring(1)) - parseInt(b.id.substring(1)));

     // If empty, provide placeholders
     if (categories.length === 0) {
        return [
            { id: 'D1', label: '1 Digit', value: 0, color: '#22d3ee' },
            { id: 'D2', label: '2 Digits', value: 0, color: '#22d3ee' },
            { id: 'D3', label: '3 Digits', value: 0, color: '#22d3ee' }
        ];
     }
     
     // Limit to top 6 to prevent overcrowding? or just show all if user tested all.
     return categories;
  }, [history]);

  // Calculate current chance for modal
  // This is tricky because chance changes per trial. 
  // We can pass the "current" chance (1 / 10^digits).
  const currentChance = 1 / Math.pow(10, numDigits);

  return (
    <main className="relative h-dvh w-full bg-slate-950 text-slate-100 font-sans flex flex-col overflow-hidden" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0" />
      
      {showInstructions && <InstructionModal onClose={() => setShowInstructions(false)} />}

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      {/* HEADER */}
      <header className="shrink-0 z-30 px-4 py-[3px] border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex justify-between items-center min-h-[54px]">
        {/* Left */}
        <div className="flex items-center gap-4 relative z-10 pointer-events-auto shrink-0">
             <div className="md:hidden">
                <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="" className="text-xs text-slate-400 hover:text-white" />
            </div>
            <div className="hidden md:block">
                <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit" className="text-xs text-slate-400 hover:text-white" />
            </div>
        </div>

         {/* Center Title */}
         <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-2 pointer-events-none z-0">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">
                Number Recall
            </h1>
        </div>

        {/* Right Stats */}
        <div className="flex items-center gap-1 md:gap-2 z-10 pointer-events-auto flex-1 justify-end min-w-0">
            <PsychicStatsModal 
               hits={stats.hits} 
               trials={stats.trials} 
               chance={currentChance} // Note: This is imperfect for mixed history, but good for current context
               appName="Number Recall"
               maxStreak={stats.maxStreak}
               radarData={radarData}
               className="static transform-none z-30 w-full max-w-[230px] md:w-64 md:max-w-none shrink"
            />
            <button onClick={() => setShowInstructions(true)} className="hidden md:block p-2 hover:bg-slate-800 rounded text-slate-400 shrink-0"><HelpCircle size={18} /></button>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-slate-800 rounded text-slate-400 shrink-0"><Settings size={18} /></button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-2 min-h-0 overflow-y-auto">
        
        {/* CARD AREA - Compacted */}
        <div className="relative w-40 h-60 md:w-64 md:h-96 perspective-1000 my-2 md:my-6 shrink-0">
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${gameState === 'REVEALED' ? 'rotate-y-180' : ''}`}>
               {/* FRONT (HIDDEN) */}
               <div className={`absolute inset-0 w-full h-full backface-hidden rounded-xl border-2 border-indigo-500/30 shadow-2xl ${CARD_BACKS.find(cb => cb.id === cardBack)?.css || 'bg-slate-900'} flex items-center justify-center`}>
                    <div className="w-16 h-16 rounded-full bg-slate-950/50 flex items-center justify-center backdrop-blur-sm border border-white/10">
                         <span className="text-2xl font-black text-indigo-500/50">?</span>
                    </div>
               </div>

               {/* BACK (REVEALED) */}
               <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-slate-900 rounded-xl border-2 border-indigo-400 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)]">
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">Target Signal</span>
                    <div className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-lg text-center break-all px-2">
                        {targetNumber}
                    </div>
                    {userGuess && (
                        <div className={`mt-6 px-4 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${userGuess === targetNumber ? 'bg-green-900/50 text-green-300 border border-green-500/50' : 'bg-red-900/50 text-red-300 border border-red-500/50'}`}>
                           {userGuess === targetNumber ? <Check size={14} /> : <X size={14} />}
                           You Saw: {userGuess}
                        </div>
                    )}
               </div>
            </div>
        </div>

        {/* CONTROLS AREA - Compacted */}
        <div className="w-full max-w-md space-y-3 md:space-y-6">
            
            {/* INPUT & SUBMIT */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="number" 
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  disabled={gameState === 'REVEALED'}
                  placeholder="?"
                  className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 text-center text-xl font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  autoFocus
                />
                {gameState === 'WAITING' ? (
                  <button 
                    type="submit"
                    disabled={!userGuess}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95"
                  >
                    Reveal
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => startNewRound()}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-6 rounded-lg font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={18} /> Next
                  </button>
                )}
            </form>

            {/* SLIDER */}
            <div className="bg-slate-900/50 rounded-xl p-3 md:p-4 border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Complexity</span>
                    <span className="text-xs text-indigo-400 font-mono">{numDigits} {numDigits === 1 ? 'Digit' : 'Digits'} (0-{Math.pow(10, numDigits)-1})</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1"
                  value={numDigits}
                  onChange={(e) => handleDigitChange(parseInt(e.target.value))}
                  disabled={gameState === 'REVEALED'}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between mt-1 px-1">
                    <span className="text-[10px] text-slate-600">Easy</span>
                    <span className="text-[10px] text-slate-600">Impossible</span>
                </div>
            </div>

        </div>

      </div>

      {/* SETTINGS DRAWER */}
       {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
            <div 
                className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-indigo-500/20 shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-serif text-xl text-indigo-100">Configuration</h3>
                    <button onClick={() => setShowSettings(false)}><X className="text-slate-500 hover:text-white" /></button>
                </div>

                <div className="space-y-6">
                    {/* Card Backs */}
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-3">Card Design</label>
                        <div className="grid grid-cols-2 gap-3">
                            {CARD_BACKS.map(cb => (
                                <button 
                                    key={cb.id}
                                    onClick={() => setCardBack(cb.id)}
                                    className={`relative h-20 rounded-lg border-2 transition-all overflow-hidden group ${cardBack === cb.id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-600'}`}
                                >
                                    <div className={`absolute inset-0 ${cb.css}`} />
                                    {cardBack === cb.id && (
                                        <div className="absolute top-1 right-1 bg-indigo-500 text-black rounded-full p-0.5">
                                            <Check size={10} strokeWidth={4} />
                                        </div>
                                    )}
                                    <span className="absolute bottom-0 w-full bg-black/60 backdrop-blur-xs text-[9px] py-1 text-center text-slate-300 font-bold uppercase tracking-wider">
                                        {cb.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 space-y-3">
                        <button onClick={handleResetSession} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center justify-center gap-2 text-xs font-bold tracking-widest">
                            <RotateCcw size={14} /> RESET PROTOCOL
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </main>
  );
}
