// ... imports
import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Brain, Activity, RotateCcw } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';
import { useHaptics } from '@/hooks/useHaptics';
import PsychicStatsModal from '../components/PsychicStatsModal';
import { RadarCategory } from '../components/ResonanceRadar';

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

// --- Main App Component ---
const SYMBOLS = ['circle', 'cross', 'waves', 'square', 'star'];
const CHANCE_PROBABILITY = 0.20;

const SYMBOL_COLORS: Record<string, string> = {
    circle: '#FACC15', // Yellow
    cross: '#22D3EE',  // Cyan
    waves: '#818CF8',  // Indigo
    square: '#A78BFA', // Purple
    star: '#FB7185'    // Rose
};

export default function StatisticalEyeApp() {
  const [mode, setMode] = useState('clairvoyance');
  const [history, setHistory] = useState<any[]>([]);
  const [currentHiddenCard, setCurrentHiddenCard] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [streak, setStreak] = useState(0);
  
  const haptics = useHaptics();

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

  // Derive Stats for Modal
  const stats = useMemo(() => {
      const hits = history.filter(h => h.correct).length;
      return { hits, trials: history.length };
  }, [history]);

  const radarData: RadarCategory[] = useMemo(() => {
      return SYMBOLS.map(sym => {
          const symTrials = history.filter(h => h.actual === sym);
          const symHits = symTrials.filter(h => h.correct).length;
          const attempts = symTrials.length;
          
          return {
              id: sym,
              label: sym.charAt(0).toUpperCase() + sym.slice(1),
              value: attempts > 0 ? (symHits / attempts) * 100 : 0,
              hits: symHits,
              total: attempts,
              color: SYMBOL_COLORS[sym]
          };
      });
  }, [history]);

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8 flex flex-col overflow-hidden" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-[#09090b]/95 backdrop-blur-sm z-0" />
      
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
      
      <PsychicStatsModal 
        hits={stats.hits} 
        trials={stats.trials} 
        chance={CHANCE_PROBABILITY}
        appName={`Statistical Eye (${mode})`}
        radarData={radarData}
      />

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
        <div className="flex items-center gap-2">
             <button onClick={resetGame} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center gap-2">
                <RotateCcw size={12} /> Reset
             </button>
            <RoomsButton />
        </div>
      </header>
      
      {/* Mode Selector */}
      <div className="relative z-10 flex justify-center gap-4 text-xs mb-8">
          <button onClick={() => toggleMode('clairvoyance')} className={`flex items-center gap-2 px-4 py-2 border transition-all duration-300 ${mode === 'clairvoyance' ? 'border-cyan-500 bg-cyan-950/30 text-cyan-400' : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}>
            <div style={{ width: 14 }}><Eye size={14} /></div> CLAIRVOYANCE
          </button>
          <button onClick={() => toggleMode('precognition')} className={`flex items-center gap-2 px-4 py-2 border transition-all duration-300 ${mode === 'precognition' ? 'border-purple-500 bg-purple-950/30 text-purple-400' : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}>
            <div style={{ width: 14 }}><Brain size={14} /></div> PRECOGNITION
          </button>
      </div>

      {/* Main Area */}
      <div className="relative z-10 flex-1 w-full max-w-4xl mx-auto flex flex-col gap-8 justify-center">
        
        {/* Card Stage - Centered and Larger */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
          <div className="relative w-64 h-96 perspective-1000">
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isRevealing ? 'rotate-y-180' : ''}`}>
              {/* Back */}
              <div className="absolute w-full h-full backface-hidden bg-zinc-900 border-2 border-zinc-700 rounded-lg flex items-center justify-center shadow-2xl cursor-default">
                <div className="w-56 h-80 border border-zinc-800 rounded flex items-center justify-center opacity-50 bg-zinc-900">
                   <div className="w-24 h-24 border border-zinc-600 rounded-full flex items-center justify-center">
                     <span className="text-zinc-600 text-4xl font-bold">?</span>
                   </div>
                </div>
              </div>
              {/* Front (Result) */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-zinc-900 border-2 border-white rounded-lg flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                {lastResult && (
                  <>
                    <div className="w-40 h-40 text-white animate-in zoom-in duration-300">
                      <ZenerSymbol type={lastResult.actual} />
                    </div>
                    <div className="mt-8 text-center space-y-2">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest">Outcome</div>
                        {lastResult.correct ? (
                            <span className="text-emerald-400 font-black text-2xl tracking-widest drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">MATCH!</span>
                        ) : (
                            <div className="flex flex-col">
                                <span className="text-rose-500 font-black text-2xl tracking-widest drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">MISS</span>
                                <span className="text-zinc-500 text-[10px] uppercase mt-1">You picked {lastResult.guess.toUpperCase()}</span>
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
        <div className="grid grid-cols-5 gap-3 md:gap-6 w-full max-w-3xl mx-auto pb-12">
          {SYMBOLS.map((symbol) => (
            <button
              key={symbol}
              onClick={() => handleGuess(symbol)}
              disabled={isRevealing}
              className={`
                group relative aspect-square border border-zinc-700 rounded-xl bg-zinc-900/50 
                hover:border-white hover:bg-zinc-800 transition-all duration-200
                disabled:opacity-30 disabled:cursor-not-allowed
                flex flex-col items-center justify-center text-zinc-500 hover:text-white
                shadow-lg active:scale-95
              `}
            >
              <div className="w-1/2 h-1/2 transition-transform group-hover:scale-110" style={{ color: SYMBOL_COLORS[symbol] }}>
                <ZenerSymbol type={symbol} />
              </div>
              <span className="absolute bottom-3 text-[9px] md:text-[10px] uppercase text-zinc-600 tracking-widest group-hover:text-zinc-400 font-bold">
                {symbol}
              </span>
            </button>
          ))}
        </div>

      </div>

      <footer className="mt-auto text-zinc-800 text-[9px] text-center max-w-2xl mx-auto pb-4 relative z-10 font-bold tracking-[0.2em] uppercase">
        <p>Zero-Dependency Build • Scientific Protocol</p>
      </footer>
    </main>
  );
}