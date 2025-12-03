"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Play, RotateCcw, HelpCircle, X, Trophy } from 'lucide-react';
import MagickalBackLink from '@/app/components/MagickalBackLink';

// --- Assets & Data ---
const SUBJECTS = [
  { id: 'man', name: 'Man', stare: '👨', noStare: '👤' },
  { id: 'woman', name: 'Woman', stare: '👩', noStare: '👤' },
  { id: 'cat', name: 'Cat', stare: '🐱', noStare: '🐈' },
  { id: 'dog', name: 'Dog', stare: '🐶', noStare: '🐕' },
  { id: 'alien', name: 'Visitor', stare: '👽', noStare: '🛸' },
];

const PHRASES = [
  "Can you feel eyes on you?",
  "Tune into the gaze...",
  "Sense the presence...",
  "Are they looking?",
  "Trust your neck sensation..."
];

const TIMER_DURATION = 5000;

// --- Components ---

const InstructionModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-in fade-in duration-300">
    <div className="bg-gray-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-purple-900/20 relative animate-in zoom-in duration-300">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
        <X size={24} />
      </button>
      
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/50">
          <Eye className="text-purple-400" size={32} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-linear-to-r from-purple-200 to-cyan-200 mb-4 font-serif">
        Protocol: Scopaesthesia
      </h2>
      
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>
          <strong className="text-white">The Goal:</strong> Detect if a hidden subject is staring at you using only your psychic sense (The Sense of Being Stared At).
        </p>
        <div>
          <strong className="text-white">The Process:</strong>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400">
            <li>Focus on the <span className="text-cyan-300">Black Circle</span>.</li>
            <li>Watch the <span className="text-cyan-300">Glowing White Line</span> trace the edge.</li>
            <li>While the timer runs, the app will randomly decide to make the subject <strong>STARE</strong> (Eye Contact) or <strong>LOOK AWAY</strong> (Profile/Back).</li>
            <li>When the timer ends, trust your gut: Is it looking at you?</li>
          </ul>
        </div>
      </div>

      <button 
        onClick={onClose}
        className="w-full mt-8 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-purple-900/50"
      >
        Begin Session
      </button>
    </div>
  </div>
);

const CircularTimer = ({ duration, onComplete, isActive }: { duration: number, onComplete: () => void, isActive: boolean }) => {
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const timeElapsed = time - startTimeRef.current;
      const newProgress = Math.min((timeElapsed / duration) * 100, 100);

      setProgress(newProgress);

      if (timeElapsed < duration) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, duration, onComplete]);

  const size = 280;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = size / 2 - strokeWidth * 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute w-60 h-60 rounded-full bg-black shadow-[inset_0_0_60px_rgba(0,0,0,1)] border border-gray-800/50" />

      <svg width={size} height={size} className="transform -rotate-90 z-10">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#1f2937"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#ffffff"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-75 ease-linear"
        />
      </svg>
      
      {isActive && (
        <div className="absolute w-full h-full flex items-center justify-center animate-pulse">
           <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
        </div>
      )}
    </div>
  );
};

export default function TheGazeApp() {
  const [gameState, setGameState] = useState('IDLE');
  const [showInstructions, setShowInstructions] = useState(true);
  const [stats, setStats] = useState({ hits: 0, total: 0, streak: 0 });
  const [currentSubject, setCurrentSubject] = useState(SUBJECTS[0]);
  const [isStaring, setIsStaring] = useState(false);
  const [userGuess, setUserGuess] = useState<string | null>(null);
  const [phrase, setPhrase] = useState(PHRASES[0]);

  const startFocus = () => {
    setGameState('FOCUSING');
    setUserGuess(null);
    setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
    setCurrentSubject(SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]);

    // Cryptographic RNG for psychic testing integrity
    const array = new Uint32Array(1);
    const win = (globalThis as any).window;
    if (win && win.crypto) {
        win.crypto.getRandomValues(array);
        const truth = array[0] % 2 === 0;
        setIsStaring(truth);
    } else {
        // Fallback
        setIsStaring(Math.random() > 0.5);
    }
  };

  const handleTimerComplete = () => {
    setGameState('DECIDING');
  };

  const handleGuess = (guess: string) => {
    setUserGuess(guess);
    setGameState('REVEAL');
    const isCorrect = (guess === 'STARE' && isStaring) || (guess === 'AWAY' && !isStaring);
    setStats(prev => ({
      hits: isCorrect ? prev.hits + 1 : prev.hits,
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0
    }));
  };

  const getAccuracy = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.hits / stats.total) * 100);
  };

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center overflow-hidden flex flex-col font-sans" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-0" />

      {/* Header */}
      <header className="relative z-20 px-6 py-4 flex justify-between items-center border-b border-gray-800/50 bg-[#0a0a0a]/50">
        <div className="flex items-center gap-4">
          <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit Training" className="text-sm" />
        </div>
        <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl tracking-wider text-transparent bg-clip-text bg-linear-to-r from-cyan-200 to-purple-200 hidden md:block">
                THE GAZE
            </h1>
            <button 
            onClick={() => setShowInstructions(true)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
            title="Instructions"
            >
            <HelpCircle size={20} />
            </button>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        
        {/* Stats HUD */}
        <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
           <div className="flex items-center gap-6 px-6 py-2 bg-gray-900/80 rounded-full border border-gray-800 shadow-xl backdrop-blur-sm pointer-events-auto">
             <div className="flex flex-col items-center">
               <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Accuracy</span>
               <span className={`text-lg font-mono font-bold ${getAccuracy() > 50 ? 'text-green-400' : 'text-gray-400'}`}>
                 {getAccuracy()}%
               </span>
             </div>
             <div className="w-px h-8 bg-gray-800"></div>
             <div className="flex flex-col items-center">
               <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Streak</span>
               <span className="text-lg font-mono font-bold text-yellow-400 flex items-center gap-1">
                 <Trophy size={14} /> {stats.streak}
               </span>
             </div>
           </div>
        </div>

        {/* Central Stage */}
        <div className="relative w-full max-w-md flex flex-col items-center justify-center min-h-[400px]">
          
          {/* IDLE STATE */}
          {gameState === 'IDLE' && (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className="mb-8 relative group cursor-pointer" onClick={startFocus}>
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl group-hover:bg-cyan-500/30 transition-all duration-500"></div>
                <div className="relative w-48 h-48 rounded-full border-2 border-cyan-500/30 flex items-center justify-center bg-black hover:scale-105 transition-transform duration-300">
                  <Play size={48} className="text-cyan-400 ml-2" />
                </div>
              </div>
              <h2 className="text-2xl font-light text-gray-300 mb-2">Ready to Tune In?</h2>
              <p className="text-gray-500 text-sm">Clear your mind. Trust your instinct.</p>
            </div>
          )}

          {/* FOCUSING STATE */}
          {gameState === 'FOCUSING' && (
            <div className="flex flex-col items-center animate-in fade-in duration-700">
              <CircularTimer 
                duration={TIMER_DURATION} 
                isActive={true} 
                onComplete={handleTimerComplete} 
              />
              <p className="mt-8 text-cyan-200/70 text-lg font-light tracking-wide animate-pulse">
                {phrase}
              </p>
            </div>
          )}

          {/* DECIDING STATE */}
          {gameState === 'DECIDING' && (
            <div className="flex flex-col items-center w-full animate-in slide-in-from-bottom-10 fade-in duration-300">
              <div className="w-64 h-64 bg-black rounded-full border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,1)] flex items-center justify-center mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-gray-900 to-black opacity-90 z-10 flex items-center justify-center">
                    <span className="text-6xl animate-pulse text-gray-700">?</span>
                </div>
              </div>

              <h3 className="text-xl text-white mb-6 font-medium">Is {currentSubject.name} staring?</h3>

              <div className="flex gap-4 w-full max-w-sm">
                <button 
                  onClick={() => handleGuess('AWAY')}
                  className="flex-1 py-4 px-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all flex flex-col items-center gap-2 group"
                >
                  <EyeOff size={24} className="text-gray-400 group-hover:text-white" />
                  <span className="text-sm font-bold text-gray-400 group-hover:text-white uppercase">Looking Away</span>
                </button>
                
                <button 
                  onClick={() => handleGuess('STARE')}
                  className="flex-1 py-4 px-4 bg-linear-to-b from-cyan-900 to-blue-900 hover:from-cyan-800 hover:to-blue-800 rounded-xl border border-cyan-700/50 transition-all flex flex-col items-center gap-2 group shadow-lg shadow-cyan-900/20"
                >
                  <Eye size={24} className="text-cyan-300 group-hover:text-white" />
                  <span className="text-sm font-bold text-cyan-200 group-hover:text-white uppercase">Staring</span>
                </button>
              </div>
            </div>
          )}

          {/* REVEAL STATE */}
          {gameState === 'REVEAL' && (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
              <div className={`
                relative w-72 h-72 rounded-3xl flex items-center justify-center mb-8 shadow-2xl transition-all duration-500 border-4
                ${((userGuess === 'STARE' && isStaring) || (userGuess === 'AWAY' && !isStaring)) 
                  ? 'border-green-500 shadow-green-900/40 bg-gray-900' 
                  : 'border-red-500 shadow-red-900/40 bg-gray-900'}
              `}>
                <div className="text-[140px] leading-none filter drop-shadow-2xl transform transition-transform duration-700 hover:scale-110">
                  {isStaring ? currentSubject.stare : currentSubject.noStare}
                </div>
                <div className="absolute -bottom-4 bg-gray-900 px-4 py-1 rounded-full border border-gray-700 shadow-xl">
                  <span className={`text-sm font-bold uppercase tracking-wider ${isStaring ? 'text-cyan-400' : 'text-gray-400'}`}>
                    {isStaring ? 'Staring' : 'Looking Away'}
                  </span>
                </div>
              </div>

              <div className="text-center mb-8">
                {((userGuess === 'STARE' && isStaring) || (userGuess === 'AWAY' && !isStaring)) ? (
                  <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-green-400">Correct!</h2>
                    <p className="text-green-200/60 text-sm">Your sensitivity was accurate.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-red-500">Missed</h2>
                    <p className="text-red-200/60 text-sm">They were {isStaring ? 'staring at you' : 'looking away'}.</p>
                  </div>
                )}
              </div>

              <button 
                onClick={startFocus}
                className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <RotateCcw size={18} />
                Next Subject
              </button>
            </div>
          )}

        </div>
      </div>

      {showInstructions && <InstructionModal onClose={() => setShowInstructions(false)} />}
    </main>
  );
}