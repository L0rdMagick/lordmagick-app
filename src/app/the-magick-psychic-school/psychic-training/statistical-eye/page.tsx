"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Brain, Activity, RotateCcw, Lock } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';
import { useHaptics } from '@/hooks/useHaptics';

// --- Zener Card Symbols ---
const ZenerSymbol = ({ type }: { type: string }) => {
  const commonProps = {
    stroke: "currentColor",
    strokeWidth: "2",
    fill: "none",
    vectorEffect: "non-scaling-stroke"
  };

  const getPath = () => {
    switch (type) {
      case 'circle': return <circle cx="50" cy="50" r="35" {...(commonProps as any)} />;
      case 'cross': return <path d="M50 15V85M15 50H85" {...(commonProps as any)} />;
      case 'waves': return <path d="M20 35Q35 20 50 35T80 35M20 50Q35 35 50 50T80 50M20 65Q35 50 50 65T80 65" {...(commonProps as any)} />;
      case 'square': return <rect x="20" y="20" width="60" height="60" {...(commonProps as any)} />;
      case 'star': return <polygon points="50,15 61,35 85,35 65,50 73,75 50,60 27,75 35,50 15,35 39,35" {...(commonProps as any)} />;
      default: return null;
    }
  };

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_3px_rgba(255,255,255,0.6)]">
      {getPath()}
    </svg>
  );
};

// --- Custom Pure SVG Line Chart ---
const SimpleLineChart = ({ data }: { data: any[] }) => {
  if (!data || data.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs tracking-widest uppercase">
        NEED MORE DATA POINTS
      </div>
    );
  }

  const height = 150;
  const width = 600;
  const padding = 20;
  
  const maxX = data.length;
  const maxY = 100; // Percentage
  
  const getX = (index: number) => padding + (index / (maxX - 1)) * (width - padding * 2);
  const getY = (val: number) => height - padding - (val / maxY) * (height - padding * 2);

  const points = data.map((d, i) => `${getX(i)},${getY(d.accuracy)}`).join(' ');
  const chanceY = getY(20);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#333" strokeWidth="1" />
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#333" strokeWidth="1" />
      
      <line x1={padding} y1={chanceY} x2={width - padding} y2={chanceY} stroke="#444" strokeDasharray="4 4" strokeWidth="1" />
      <text x={width - padding} y={chanceY - 5} fill="#666" fontSize="10" textAnchor="end">CHANCE (20%)</text>

      <polyline points={points} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      
      {data.map((d, i) => (
        <circle key={i} cx={getX(i)} cy={getY(d.accuracy)} r="2" fill="#fff" />
      ))}
    </svg>
  );
};

// --- Main App Component ---
const SYMBOLS = ['circle', 'cross', 'waves', 'square', 'star'];
const CHANCE_PROBABILITY = 0.20;

export default function StatisticalEyeApp() {
  const [mode, setMode] = useState('clairvoyance');
  const [history, setHistory] = useState<any[]>([]);
  const [currentHiddenCard, setCurrentHiddenCard] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [streak, setStreak] = useState(0);
  
  // Monetization State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const haptics = useHaptics();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkSubscription = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('profiles').select('is_subscribed').eq('id', user.id).single();
            if (data?.is_subscribed) setIsSubscribed(true);
        }
        setLoadingProfile(false);
    };
    checkSubscription();
  }, [supabase]);

  const generateCard = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

  const prepareNextCard = (selectedMode: string) => {
    if (selectedMode === 'clairvoyance') {
      setCurrentHiddenCard(generateCard());
    } else {
      setCurrentHiddenCard(null);
    }
  };

  useEffect(() => {
    prepareNextCard(mode);
  }, []);

  const resetGame = () => {
    haptics.triggerLight();
    setHistory([]);
    setStreak(0);
    setLastResult(null);
    setIsRevealing(false);
    prepareNextCard(mode);
  };

  const toggleMode = (newMode: string) => {
    haptics.triggerMedium();
    setMode(newMode);
    setHistory([]); 
    setStreak(0);
    setLastResult(null);
    prepareNextCard(newMode);
  };
  
  const playSound = (type: string) => {
      const win = (globalThis as any).window;
      if (typeof win === 'undefined') return;
      const AudioContext = win.AudioContext || win.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'hit') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
      } else {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
      }
  };

  const handleGuess = (guessSymbol: string) => {
    if (isRevealing) return;
    haptics.triggerMedium(); // Selection haptic

    let actualSymbol = currentHiddenCard;
    if (mode === 'precognition') {
      actualSymbol = generateCard();
    }

    const isCorrect = guessSymbol === actualSymbol;

    if (isCorrect) {
        setStreak(prev => prev + 1);
        playSound('hit');
        haptics.triggerHeavy(); // Success haptic
    } else {
        setStreak(0);
        playSound('miss');
        haptics.triggerLight(); // Failure haptic
    }

    const newResult = {
      trial: history.length + 1,
      guess: guessSymbol,
      actual: actualSymbol,
      correct: isCorrect,
      timestamp: Date.now(),
    };

    setHistory(prev => [...prev, newResult]);
    setLastResult(newResult);
    setIsRevealing(true);

    setTimeout(() => {
      setIsRevealing(false);
      setLastResult(null);
      prepareNextCard(mode);
    }, 1500);
  };

  const calculateStats = (data: any[]) => {
    const total = data.length;
    if (total === 0) return { accuracy: 0, zScore: 0, hits: 0, total: 0 };
    const hits = data.filter(r => r.correct).length;
    const accuracy = (hits / total) * 100;
    const p = CHANCE_PROBABILITY;
    const mean = total * p;
    const stdDev = Math.sqrt(total * p * (1 - p));
    const zScore = stdDev === 0 ? 0 : (hits - mean) / stdDev;
    return { total, hits, accuracy, zScore };
  };

  const currentStats = calculateStats(history);

  const chartData = useMemo(() => {
    let hits = 0;
    return history.map((entry, index) => {
      if (entry.correct) hits++;
      const cumulativeAccuracy = (hits / (index + 1)) * 100;
      return { trial: index + 1, accuracy: cumulativeAccuracy };
    });
  }, [history]);

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8 flex flex-col" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-[#09090b]/95 backdrop-blur-sm z-0" />
      
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      {/* Header */}
      <header className="relative z-10 w-full max-w-4xl mx-auto border-b border-zinc-800 pb-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
            <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit" className="text-xs text-zinc-500 hover:text-zinc-300" />
            <div className="flex items-center gap-2">
                <div className="text-cyan-400"><Eye /></div>
                <h1 className="text-xl tracking-widest font-bold uppercase text-zinc-300">
                    The Statistical Eye
                </h1>
            </div>
        </div>
        <div className="flex items-center gap-2"><RoomsButton /></div>
      </header>
      
      <div className="relative z-10 w-full max-w-4xl mx-auto grid grid-cols-4 gap-6 text-sm mb-8">
          <div className="flex flex-col items-center">
            <span className="text-zinc-500 text-xs uppercase tracking-wider">Trials</span>
            <span className="text-xl font-bold text-white">{currentStats.total}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-zinc-500 text-xs uppercase tracking-wider">Accuracy</span>
            <span className={`${currentStats.accuracy > 20 ? 'text-green-400' : 'text-zinc-300'} text-xl font-bold`}>
              {currentStats.accuracy.toFixed(1)}%
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-zinc-500 text-xs uppercase tracking-wider">Streak</span>
            <span className="text-xl font-bold text-yellow-400">{streak}</span>
          </div>
          <div className="flex flex-col items-center relative">
            <span className="text-zinc-500 text-xs uppercase tracking-wider border-b border-dotted border-zinc-600">Z-Score</span>
            <span className={`text-xl font-bold ${Math.abs(currentStats.zScore) > 1.96 ? 'text-cyan-400' : 'text-zinc-400'}`}>
              {currentStats.zScore > 0 ? '+' : ''}{currentStats.zScore.toFixed(2)}
            </span>
          </div>
      </div>

      {/* Main Area */}
      <div className="relative z-10 flex-1 w-full max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Mode Selector */}
        <div className="flex justify-center gap-4 text-xs">
          <button onClick={() => toggleMode('clairvoyance')} className={`flex items-center gap-2 px-4 py-2 border transition-all duration-300 ${mode === 'clairvoyance' ? 'border-cyan-500 bg-cyan-950/30 text-cyan-400' : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}>
            <div style={{ width: 14 }}><Eye size={14} /></div> CLAIRVOYANCE
          </button>
          <button onClick={() => toggleMode('precognition')} className={`flex items-center gap-2 px-4 py-2 border transition-all duration-300 ${mode === 'precognition' ? 'border-purple-500 bg-purple-950/30 text-purple-400' : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}>
            <div style={{ width: 14 }}><Brain size={14} /></div> PRECOGNITION
          </button>
        </div>

        {/* Card Stage */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
          <div className="relative w-48 h-72 perspective-1000">
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isRevealing ? 'rotate-y-180' : ''}`}>
              {/* Back */}
              <div className="absolute w-full h-full backface-hidden bg-zinc-900 border-2 border-zinc-700 rounded-lg flex items-center justify-center shadow-2xl">
                <div className="w-40 h-64 border border-zinc-800 rounded flex items-center justify-center opacity-50 bg-zinc-900">
                   <div className="w-16 h-16 border border-zinc-600 rounded-full flex items-center justify-center">
                     <span className="text-zinc-600 text-2xl font-bold">?</span>
                   </div>
                </div>
              </div>
              {/* Front (Result) */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-zinc-900 border-2 border-white rounded-lg flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                {lastResult && (
                  <>
                    <div className="w-32 h-32 text-white">
                      <ZenerSymbol type={lastResult.actual} />
                    </div>
                    <div className="mt-6 text-center">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Status</div>
                        {lastResult.correct ? (
                            <span className="text-green-400 font-bold text-lg tracking-wider">MATCH</span>
                        ) : (
                            <div className="flex flex-col">
                                <span className="text-red-500 font-bold text-lg tracking-wider">MISS</span>
                                <span className="text-zinc-600 text-xs mt-1">Guessed: {lastResult.guess.toUpperCase()}</span>
                            </div>
                        )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-5 gap-2 sm:gap-4 w-full max-w-2xl mx-auto">
          {SYMBOLS.map((symbol) => (
            <button
              key={symbol}
              onClick={() => handleGuess(symbol)}
              disabled={isRevealing}
              className={`
                group relative aspect-square border border-zinc-700 rounded bg-zinc-900/50 
                hover:border-white hover:bg-zinc-800 transition-all duration-200
                disabled:opacity-30 disabled:cursor-not-allowed
                flex flex-col items-center justify-center text-zinc-500 hover:text-white
              `}
            >
              <div className="w-1/2 h-1/2">
                <ZenerSymbol type={symbol} />
              </div>
              <span className="absolute bottom-2 text-[10px] uppercase text-zinc-600 tracking-widest group-hover:text-zinc-400">
                {symbol}
              </span>
            </button>
          ))}
        </div>

        {/* Analytics (Monetized) */}
        <div className="w-full mt-8 border-t border-zinc-800 pt-8 flex flex-col gap-6 relative">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-zinc-500 flex items-center gap-2">
              <div style={{ width: 16 }}><Activity size={16} /></div> Performance Variance
            </h3>
            <button onClick={resetGame} className="text-xs text-zinc-600 hover:text-white flex items-center gap-1 transition-colors">
              <div style={{ width: 12 }}><RotateCcw size={12} /></div> RESET DATA
            </button>
          </div>
          
          <div className="relative h-48 w-full bg-zinc-900/50 border border-zinc-800 rounded p-4 overflow-hidden">
            {loadingProfile ? (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-500 animate-pulse text-xs tracking-widest">
                    CALIBRATING SOUL SIGNATURE...
                </div>
            ) : isSubscribed ? (
                <SimpleLineChart data={chartData} />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md bg-black/40 z-10">
                    <Lock className="text-amber-400 mb-2 w-8 h-8" />
                    <p className="text-amber-200 font-serif text-sm tracking-widest mb-4">LIFETIME DATA LOCKED</p>
                    <button className="px-6 py-2 bg-amber-900/30 border border-amber-500/50 text-amber-300 text-xs font-bold uppercase tracking-wider hover:bg-amber-800/40 transition-all rounded">
                        Unlock Adept Analysis
                    </button>
                </div>
            )}
            {/* Render blurred chart for visual effect behind lock if needed, or just keep it hidden */}
            {!isSubscribed && !loadingProfile && (
                <div className="opacity-20 blur-sm pointer-events-none w-full h-full">
                    <SimpleLineChart data={chartData} />
                </div>
            )}
          </div>
        </div>

      </div>

      <footer className="mt-8 text-zinc-700 text-[10px] text-center max-w-2xl mx-auto pb-4 relative z-10">
        <p className="mb-2">THE STATISTICAL EYE v1.2 • ZERO-DEPENDENCY BUILD</p>
      </footer>
    </main>
  );
}