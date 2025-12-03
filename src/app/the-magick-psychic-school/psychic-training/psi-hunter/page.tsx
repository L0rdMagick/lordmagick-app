"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Target, Shield, Crosshair, Zap, Settings, Play, RotateCcw, Activity, Eye, Brain, Lock, HelpCircle, X } from 'lucide-react';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';

/**
 * UTILITY: CRYPTOGRAPHIC RANDOM NUMBER GENERATOR
 */
const secureRandom = (max: number) => {
  const win = (globalThis as any).window;
  if (win && win.crypto) {
      const array = new Uint32Array(1);
      win.crypto.getRandomValues(array);
      return array[0] % max;
  }
  return Math.floor(Math.random() * max);
};

/**
 * UTILITY: SOUND SYNTHESIS
 */
const playSound = (type: string) => {
  try {
    const win = (globalThis as any).window;
    if (!win) return;
    const AudioContext = win.AudioContext || win.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      gain.gain.setValueAtTime(0.05, now);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'miss') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    console.error("Audio error", e);
  }
};

/**
 * COMPONENT: STATS GRAPH
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ZScoreGraph = ({ history }: { history: any[] }) => {
  if (history.length < 2) return <div className="text-xs text-gray-500 italic">Need more data for graph...</div>;

  const height = 60;
  const width = 200;
  const maxZ = Math.max(3, ...history.map(h => Math.abs(h.zScore))); 
  
  const points = history.map((entry, index) => {
    const x = (index / (history.length - 1)) * width;
    const y = (height / 2) - ((entry.zScore / maxZ) * (height / 2)); 
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full bg-slate-900 border border-slate-700 rounded p-2 mb-4">
      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
        <span>CHANCE DEVIATION (Z-SCORE)</span>
        <span>LATEST: {history[history.length - 1].zScore.toFixed(2)}</span>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#475569" strokeWidth="1" strokeDasharray="4" />
        <polyline
          fill="none"
          stroke={history[history.length - 1].zScore > 0 ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          points={points}
        />
      </svg>
    </div>
  );
};

/**
 * COMPONENT: INSTRUCTION MODAL
 */
const InstructionModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full border border-cyan-500/30 bg-[#0f172a] p-8 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] text-center relative">
          <h2 className="text-3xl font-black text-cyan-400 mb-2 tracking-tighter">PSI-HUNTER</h2>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-[0.2em] mb-6">Intuition Defense System v1.0</p>
          
          <div className="text-left space-y-4 mb-8 bg-black/40 p-4 rounded border border-white/5 text-sm text-slate-300 font-mono">
              <p className="leading-relaxed">
                  <span className="text-red-400 font-bold">MISSION:</span> Identify hidden threats camouflaged as civilians.
              </p>
              <p className="leading-relaxed">
                  <span className="text-yellow-400 font-bold">CONSTRAINT:</span> Visual scanners are offline. Logic is useless. The target is random.
              </p>
              <p className="leading-relaxed">
                  <span className="text-cyan-400 font-bold">PROTOCOL:</span> Use clairsentience. Feel the signal. Bypass the eyes.
              </p>
          </div>
          
          <button 
              onClick={onClose}
              className="w-full py-3 bg-cyan-900/50 hover:bg-cyan-800/80 border border-cyan-500/50 text-cyan-100 font-mono font-bold tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
              Initialize
          </button>
      </div>
    </div>
);

export default function PsiHunterApp() {
  const [gameState, setGameState] = useState('MENU'); 
  const [difficulty, setDifficulty] = useState(4); 
  const [visualMode, setVisualMode] = useState('ABSTRACT'); 
  const [timerMode, setTimerMode] = useState('INSTINCT'); 
  
  // Show instructions on load
  const [showInstructions, setShowInstructions] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>({
    trials: 0,
    hits: 0,
    streak: 0,
    bestStreak: 0,
    history: [] 
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [grid, setGrid] = useState<any[]>([]); 
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [roundActive, setRoundActive] = useState(false);

  const generateGrid = useCallback(() => {
    const newTargetIndex = secureRandom(difficulty);
    setTargetIndex(newTargetIndex);

    const newGrid = Array.from({ length: difficulty }, (_, i) => ({
      id: i,
      seed: Math.random().toString(36).substring(7), 
      isTarget: i === newTargetIndex 
    }));

    setGrid(newGrid);
    setRevealed(false);
    setSelectedIndex(null);
    setRoundActive(true);

    if (timerMode === 'INSTINCT') {
      setTimeLeft(3.0);
    } else {
      setTimeLeft(null);
    }
    
    playSound('start');
  }, [difficulty, timerMode]);

  useEffect(() => {
    if (!roundActive || timerMode !== 'INSTINCT' || revealed) return;

    if (timeLeft !== null && timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? Math.max(0, parseFloat((prev - 0.1).toFixed(1))) : 0));
    }, 100);

    return () => clearInterval(interval);
  }, [timeLeft, roundActive, revealed, timerMode]);

  const calculateZScore = (hits: number, trials: number, prob: number) => {
    if (trials < 5) return 0;
    const expected = trials * prob;
    const stdDev = Math.sqrt(trials * prob * (1 - prob));
    return (hits - expected) / stdDev;
  };

  const handleTimeout = () => {
    setRevealed(true);
    setRoundActive(false);
    playSound('miss');
    updateStats(false);
  };

  const handleSelection = (index: number) => {
    if (revealed) return;

    setSelectedIndex(index);
    setRevealed(true);
    setRoundActive(false);

    const isHit = index === targetIndex;
    
    if (isHit) {
      playSound('hit');
    } else {
      playSound('miss');
    }

    updateStats(isHit);
  };

  const updateStats = (isHit: boolean) => {
    setStats((prev: any) => {
      const newHits = isHit ? prev.hits + 1 : prev.hits;
      const newTrials = prev.trials + 1;
      const newStreak = isHit ? prev.streak + 1 : 0;
      const prob = 1 / difficulty;
      const z = calculateZScore(newHits, newTrials, prob);

      return {
        trials: newTrials,
        hits: newHits,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        history: [...prev.history, { trial: newTrials, zScore: z }]
      };
    });
  };

  // --- COMPONENT: AVATAR CELL ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AvatarCell = ({ item, index, onClick }: { item: any, index: number, onClick: (i: number) => void }) => {
    let borderClass = "border-slate-700 hover:border-cyan-400";
    let bgClass = "bg-slate-800";
    let content = null;
    let effectClass = "";

    if (revealed) {
      if (item.id === targetIndex) {
        borderClass = "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]";
        bgClass = "bg-green-900/20";
        effectClass = "animate-pulse";
      } else if (index === selectedIndex) {
        borderClass = "border-red-500";
        bgClass = "bg-red-900/20";
        effectClass = "opacity-50 grayscale";
      } else {
        effectClass = "opacity-20 grayscale";
      }
    } else {
       effectClass = "transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-crosshair";
    }

    if (visualMode === 'ABSTRACT') {
      const shapes = [<Activity key="1" />, <Lock key="2" />, <Shield key="3" />, <Target key="4" />, <Zap key="5" />, <Brain key="6" />, <Eye key="7" />, <Crosshair key="8" />];
      const shapeIndex = item.seed.charCodeAt(0) % shapes.length;
      content = (
        <div className={`w-12 h-12 ${revealed && item.id === targetIndex ? 'text-green-400' : 'text-slate-400'}`}>
          {shapes[shapeIndex]}
        </div>
      );
    } else if (visualMode === 'SILHOUETTES') {
      content = (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-16 h-16 ${revealed && item.id === targetIndex ? 'text-green-500' : 'text-slate-900 drop-shadow-lg'}`}>
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      );
    } else if (visualMode === 'FACES') {
      content = (
        <img 
          src={`https://robohash.org/${item.seed}?set=set1&size=150x150`} 
          alt="Subject"
          className="w-full h-full object-cover rounded"
          draggable="false"
        />
      );
    }

    return (
      <div 
        onClick={() => onClick(index)}
        className={`
          relative aspect-square rounded-lg border-2 flex items-center justify-center overflow-hidden
          ${borderClass} ${bgClass} ${effectClass}
        `}
      >
        {content}
        {revealed && item.id === targetIndex && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
             <span className="text-green-500 font-bold text-xs md:text-sm tracking-widest uppercase animate-bounce">
               Threat
             </span>
           </div>
        )}
        {revealed && index === selectedIndex && item.id !== targetIndex && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/40">
             <span className="text-red-500 font-bold text-xs md:text-sm tracking-widest uppercase">
               Civilian
             </span>
           </div>
        )}
      </div>
    );
  };

  // --- MENU SCREEN ---
  if (gameState === 'MENU') {
    return (
      <div className="min-h-screen bg-slate-950 text-cyan-500 font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="z-10 max-w-md w-full space-y-8 text-center">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
              PSI-HUNTER
            </h1>
            <p className="text-slate-400 tracking-widest text-xs uppercase">Intuition Defense System v1.0</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl backdrop-blur-sm">
             <p className="text-sm text-slate-300 mb-6 leading-relaxed font-mono">
               <strong className="text-cyan-400">Protocol Initiated.</strong><br/>
               Establish neural link. Identify targets without visual confirmation.
             </p>
            <button 
              onClick={() => setGameState('PLAYING')}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-6 rounded shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> INITIATE
            </button>
          </div>

          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => setGameState('SETTINGS')}
              className="text-slate-500 hover:text-cyan-400 flex items-center gap-2 text-sm transition-colors"
            >
              <Settings className="w-4 h-4" /> CONFIGURATION
            </button>
            <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit" className="text-sm text-slate-500 hover:text-white" />
          </div>
        </div>
      </div>
    );
  }

  // --- SETTINGS SCREEN ---
  if (gameState === 'SETTINGS') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 font-mono p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-6 bg-slate-900/50 p-8 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-cyan-400">SYSTEM CONFIG</h2>
            <button onClick={() => setGameState('MENU')} className="text-xs hover:text-white"><X /></button>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-slate-500 uppercase tracking-widest font-bold">Crowd Density</label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 4, 8].map(n => (
                <button key={n} onClick={() => setDifficulty(n)} className={`p-3 rounded border text-sm font-bold transition-all ${difficulty === n ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                  {n === 2 ? 'BINARY (2)' : n === 4 ? 'SQUAD (4)' : 'CROWD (8)'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-slate-500 uppercase tracking-widest font-bold">Optical Feed</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'ABSTRACT', label: 'ABSTRACT (Geometric)', desc: 'Pure shape recognition.' },
                { id: 'SILHOUETTES', label: 'SILHOUETTES (Shadows)', desc: 'Human form without features.' },
                { id: 'FACES', label: 'REALISTIC (Simulation)', desc: 'High noise environment.' },
              ].map(mode => (
                <button key={mode.id} onClick={() => setVisualMode(mode.id)} className={`p-3 rounded border text-left flex flex-col transition-all ${visualMode === mode.id ? 'bg-cyan-900/50 border-cyan-500' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}>
                  <span className={`text-sm font-bold ${visualMode === mode.id ? 'text-cyan-400' : 'text-slate-400'}`}>{mode.label}</span>
                  <span className="text-[10px] text-slate-600">{mode.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-slate-500 uppercase tracking-widest font-bold">Engagement Window</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'INSTINCT', label: 'INSTINCT (3s)', desc: 'Force subconscious reaction.' },
                { id: 'MEDITATION', label: 'MEDITATION (∞)', desc: 'Remote viewing protocol.' },
              ].map(mode => (
                <button key={mode.id} onClick={() => setTimerMode(mode.id)} className={`p-3 rounded border text-left flex flex-col transition-all ${timerMode === mode.id ? 'bg-cyan-900/50 border-cyan-500' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}>
                  <span className={`text-sm font-bold ${timerMode === mode.id ? 'text-cyan-400' : 'text-slate-400'}`}>{mode.label}</span>
                  <span className="text-[10px] text-slate-600">{mode.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- GAMEPLAY SCREEN ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono flex flex-col max-w-lg mx-auto border-x border-slate-900 shadow-2xl overflow-hidden">
      
      {showInstructions && <InstructionModal onClose={() => setShowInstructions(false)} />}

      <header className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-lg font-black text-cyan-500 flex items-center gap-2">
              <Crosshair className="w-5 h-5" /> PSI-HUNTER
            </h1>
            <div className="flex gap-4 text-[10px] text-slate-400 mt-1">
              <span>TRIALS: {stats.trials}</span>
              <span>HITS: {stats.hits}</span>
              <span>ACC: {stats.trials > 0 ? ((stats.hits / stats.trials) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] text-slate-500 uppercase">Z-SCORE</div>
             <div className={`text-xl font-bold ${
               stats.history.length > 0 && stats.history[stats.history.length -1].zScore >= 1.96 ? 'text-green-400' :
               stats.history.length > 0 && stats.history[stats.history.length -1].zScore <= -1.96 ? 'text-red-400' : 'text-slate-300'
             }`}>
               {stats.history.length > 0 ? stats.history[stats.history.length -1].zScore.toFixed(2) : '0.00'}
             </div>
          </div>
        </div>
        {stats.trials > 4 && <ZScoreGraph history={stats.history} />}
        {timerMode === 'INSTINCT' && (
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full transition-all duration-100 ease-linear ${timeLeft !== null && timeLeft < 1 ? 'bg-red-500' : 'bg-cyan-500'}`}
              style={{ width: `${((timeLeft || 0) / 3) * 100}%` }}
            />
          </div>
        )}
      </header>

      <main className="flex-grow p-4 flex flex-col justify-center relative">
        <div className="text-center mb-6 min-h-[40px]">
          {!roundActive && !revealed && (
             <button 
               onClick={generateGrid}
               className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_15px_rgba(8,145,178,0.5)] animate-pulse"
             >
               SCAN SECTOR
             </button>
          )}
          {roundActive && <div className="text-cyan-400 font-bold tracking-[0.2em] animate-pulse">TUNING IN...</div>}
          {revealed && (
            <div className={`text-lg font-black tracking-wider ${selectedIndex === targetIndex ? 'text-green-500' : 'text-red-500'}`}>
              {selectedIndex === targetIndex ? 'TARGET NEUTRALIZED' : selectedIndex === null ? 'TARGET LOST' : 'INNOCENT HARMED'}
            </div>
          )}
        </div>

        {roundActive || revealed ? (
          <div className={`grid gap-4 w-full aspect-square transition-all duration-300 ${revealed ? '' : 'hover:scale-[1.01]'}`} style={{ gridTemplateColumns: `repeat(${difficulty === 2 ? 2 : Math.ceil(Math.sqrt(difficulty))}, 1fr)` }}>
            {grid.map((item, idx) => (
              <AvatarCell key={item.id} item={item} index={idx} onClick={handleSelection} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-lg text-slate-600">AWAITING INPUT</div>
        )}
      </main>

      <footer className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex justify-between items-center">
          <button onClick={() => { setStats({ trials: 0, hits: 0, streak: 0, bestStreak: 0, history: [] }); setGrid([]); setRoundActive(false); setRevealed(false); }} className="p-2 text-slate-500 hover:text-white rounded hover:bg-slate-800 transition-colors" title="Reset Stats"><RotateCcw className="w-5 h-5" /></button>
          <div className="flex gap-2">
            <button onClick={() => setGameState('SETTINGS')} className="p-2 text-slate-500 hover:text-white rounded hover:bg-slate-800 transition-colors"><Settings className="w-5 h-5" /></button>
            <button onClick={() => setGameState('MENU')} className="p-2 text-slate-500 hover:text-white rounded hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>
      </footer>
    </div>
  );
}