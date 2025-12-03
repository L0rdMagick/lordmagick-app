"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Flame, Droplets, Mountain, Wind, Sparkles, 
  Sun, Moon, Star, Skull, Gem, Crown, 
  HelpCircle, Settings, Maximize2, Minimize2 
} from 'lucide-react';
import MagickalBackLink from '@/app/components/MagickalBackLink';

// --- DATA ---

const DECK_STANDARD = [
  { id: 'fire', name: "Fire", icon: Flame, color: '#ef4444', fail: "The flame flickered out." },
  { id: 'water', name: "Water", icon: Droplets, color: '#3b82f6', fail: "The waters were too still." },
  { id: 'earth', name: "Earth", icon: Mountain, color: '#10b981', fail: "The roots did not take hold." },
  { id: 'air', name: "Air", icon: Wind, color: '#fcd34d', fail: "Your intent scattered in the wind." },
  { id: 'spirit', name: "Spirit", icon: Sparkles, color: '#a855f7', fail: "The connection was weak." }
];

const DECK_ADVANCED = [
  ...DECK_STANDARD,
  { id: 'sun', name: "Sun", icon: Sun, color: '#f59e0b', fail: "The light was too blinding." },
  { id: 'moon', name: "Moon", icon: Moon, color: '#94a3b8', fail: "Illusions clouded your mind." },
  { id: 'star', name: "Star", icon: Star, color: '#e2e8f0', fail: "Hope alone is not enough." },
  { id: 'death', name: "Death", icon: Skull, color: '#525252', fail: "You feared the transformation." },
  { id: 'void', name: "Void", icon: Gem, color: '#1e1b4b', fail: "The abyss gazed back." }
];

const RANKS = [
  { lvl: 1, title: "Uninitiated", icon: "🧙‍♂️", req: 0, color: "#7f8c8d" },
  { lvl: 5, title: "Neophyte", icon: "🕯️", req: 500, color: "#3498db" },
  { lvl: 10, title: "Apprentice", icon: "⚡", req: 2000, color: "#9b59b6" },
  { lvl: 25, title: "Adept", icon: "🧿", req: 5000, color: "#e74c3c" },
  { lvl: 50, title: "Grand Magus", icon: "👑", req: 15000, color: "#f1c40f" }
];

// --- AUDIO ENGINE ---
const useAudioEngine = () => {
  const ctxRef = useRef<any>(null);
  const oscRef = useRef<any>(null);
  const gainRef = useRef<any>(null);

  const init = () => {
    const win = (globalThis as any).window;
    if (typeof win !== 'undefined' && !ctxRef.current) {
        const AudioContext = win.AudioContext || win.webkitAudioContext;
        ctxRef.current = new AudioContext();
    }
    if (ctxRef.current?.state === 'suspended') {
        ctxRef.current.resume();
    }
  };

  const playHoldSound = () => {
    init();
    if (!ctxRef.current) return;
    
    // Safety check to prevent double-starting
    if (oscRef.current) return;

    oscRef.current = ctxRef.current.createOscillator();
    gainRef.current = ctxRef.current.createGain();
    
    oscRef.current.type = 'triangle';
    oscRef.current.frequency.setValueAtTime(60, ctxRef.current.currentTime);
    
    oscRef.current.connect(gainRef.current);
    gainRef.current.connect(ctxRef.current.destination);
    
    gainRef.current.gain.setValueAtTime(0, ctxRef.current.currentTime);
    gainRef.current.gain.linearRampToValueAtTime(0.3, ctxRef.current.currentTime + 3);
    oscRef.current.frequency.linearRampToValueAtTime(150, ctxRef.current.currentTime + 3);
    
    oscRef.current.start();
  };

  const stopHoldSound = () => {
    if (oscRef.current && ctxRef.current) {
        const now = ctxRef.current.currentTime;
        gainRef.current.gain.linearRampToValueAtTime(0, now + 0.1);
        oscRef.current.stop(now + 0.1);
        oscRef.current = null;
    }
  };

  const playResultSound = (success: boolean) => {
    init();
    if (!ctxRef.current) return;
    const now = ctxRef.current.currentTime;
    const osc = ctxRef.current.createOscillator();
    const gain = ctxRef.current.createGain();
    
    osc.connect(gain);
    gain.connect(ctxRef.current.destination);
    
    if (success) {
        // Angelic Chord
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.linearRampToValueAtTime(880, now + 0.5); // A5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 2);
        osc.start(now);
        osc.stop(now + 2);
    } else {
        // Dissonant thud
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    }
  };

  return { init, playHoldSound, stopHoldSound, playResultSound };
};

// --- COMPONENTS ---

const InstructionModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in duration-500">
    <div className="max-w-md w-full border border-purple-500/30 bg-[#0f0f1a] p-8 rounded-xl shadow-[0_0_50px_rgba(147,51,234,0.2)] text-center relative">
        <h2 className="text-3xl font-serif text-amber-400 mb-2 tracking-widest">AETHER PROTOCOL</h2>
        <p className="text-xs font-mono text-purple-300 uppercase tracking-[0.2em] mb-6">Quantum Entropy Generator</p>
        
        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            You are interfacing with a mathematically random system. It cannot be predicted by logic. It can only be influenced by <strong>Will</strong>.
        </p>

        <div className="text-left space-y-4 mb-8 bg-black/40 p-4 rounded border border-white/5">
            <div className="flex gap-3">
                <span className="text-amber-500 font-bold">1.</span>
                <p className="text-sm text-gray-400"><strong className="text-gray-200">The Anchor:</strong> Select a symbol. Burn its image into your mind.</p>
            </div>
            <div className="flex gap-3">
                <span className="text-amber-500 font-bold">2.</span>
                <p className="text-sm text-gray-400"><strong className="text-gray-200">The Void:</strong> When the ritual begins, project that symbol into the static. Pour your intent into the machine.</p>
            </div>
            <div className="flex gap-3">
                <span className="text-amber-500 font-bold">3.</span>
                <p className="text-sm text-gray-400"><strong className="text-gray-200">The Collapse:</strong> When time stops, reality is chosen. If your Will is strong, the machine will yield.</p>
            </div>
        </div>
        
        <button 
            onClick={onClose}
            className="w-full py-3 bg-purple-900/50 hover:bg-purple-800 border border-purple-500/50 text-purple-100 font-serif tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        >
            I Am Ready
        </button>
    </div>
  </div>
);

export default function AetherApp() {
  // --- STATE ---
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Persistence
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  
  // Game Config
  const [deckType, setDeckType] = useState<'standard' | 'advanced'>('standard');
  const [channelTime, setChannelTime] = useState(5);
  
  // Session State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'SELECTION' | 'COUNTDOWN' | 'MANIFEST' | 'VOID' | 'RESULT'>('SELECTION');
  const [holdProgress, setHoldProgress] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [voidProgress, setVoidProgress] = useState(0);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audio = useAudioEngine();

  const currentDeck = deckType === 'standard' ? DECK_STANDARD : DECK_ADVANCED;
  const currentCard = currentDeck[currentIndex];

  // --- LIFECYCLE ---
  useEffect(() => {
    // Load saved progress
    const savedXp = localStorage.getItem('aether_xp');
    const savedStreak = localStorage.getItem('aether_streak');
    if (savedXp) setXp(parseInt(savedXp));
    if (savedStreak) setStreak(parseInt(savedStreak));
  }, []);

  // --- ACTIONS ---

  const handleNextCard = () => {
    if (targetId) return; // Locked
    setCurrentIndex((prev) => (prev + 1) % currentDeck.length);
  };

  const handlePrevCard = () => {
    if (targetId) return; // Locked
    setCurrentIndex((prev) => (prev - 1 + currentDeck.length) % currentDeck.length);
  };

  const toggleLock = () => {
    if (targetId) {
        setTargetId(null);
    } else {
        setTargetId(currentCard.id);
    }
  };

  const startHold = (e: React.SyntheticEvent) => {
    if (!targetId || phase !== 'SELECTION') return;
    e.preventDefault();
    
    audio.playHoldSound();
    const startTime = Date.now();
    
    holdIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / 2500, 1) * 100; // 2.5s hold to start
        setHoldProgress(p);
        
        if (p >= 100) {
            completeHold();
        }
    }, 16);
  };

  const endHold = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    audio.stopHoldSound();
    setHoldProgress(0);
  };

  const completeHold = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    audio.stopHoldSound();
    setHoldProgress(0);
    startRitual();
  };

  const startRitual = () => {
    setPhase('COUNTDOWN');
    setCountdown(3);
    
    let c = 3;
    const interval = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
            clearInterval(interval);
            setPhase('MANIFEST');
            setTimeout(() => {
                enterVoid();
            }, 1500);
        }
    }, 1000);
  };

  const enterVoid = () => {
    setPhase('VOID');
    const durationMs = channelTime * 1000;
    const startTime = Date.now();
    
    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / durationMs, 1);
        setVoidProgress(p * 100);
        
        if (p >= 1) {
            clearInterval(interval);
            collapseWavefunction();
        }
    }, 16);
  };

  const collapseWavefunction = () => {
    // Crypto RNG
    const buf = new Uint32Array(1);
    const win = (globalThis as any).window;
    let randIndex = 0;
    if (win && win.crypto) {
        win.crypto.getRandomValues(buf);
        randIndex = buf[0] % currentDeck.length;
    } else {
        randIndex = Math.floor(Math.random() * currentDeck.length);
    }
    
    const resultCard = currentDeck[randIndex];
    const isSuccess = resultCard.id === targetId;
    
    // Calc Rewards
    let newXp = xp;
    let newStreak = streak;
    
    if (isSuccess) {
        newStreak++;
        const multiplier = deckType === 'advanced' ? 1.5 : 1;
        const gain = Math.floor(100 * (1 + (newStreak * 0.2)) * multiplier);
        newXp += gain;
        audio.playResultSound(true);
    } else {
        newStreak = 0;
        newXp += 10; // Pity XP
        audio.playResultSound(false);
    }
    
    setXp(newXp);
    setStreak(newStreak);
    localStorage.setItem('aether_xp', newXp.toString());
    localStorage.setItem('aether_streak', newStreak.toString());
    
    // Set view to result
    // We actually just change the card to the result and show overlay
    setCurrentIndex(randIndex); 
    setPhase('RESULT');
  };

  const resetGame = () => {
    setPhase('SELECTION');
    setTargetId(null);
    setVoidProgress(0);
  };

  // --- CANVAS STATIC EFFECT ---
  useEffect(() => {
    if (phase !== 'VOID' || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animId: number;
    
    const draw = () => {
        const w = canvas.width;
        const h = canvas.height;
        const idata = ctx.createImageData(w, h);
        const buffer = new Uint32Array(idata.data.buffer);
        
        for (let i = 0; i < buffer.length; i++) {
            if (Math.random() < 0.9) {
                buffer[i] = 0xff000000; // Black
            } else {
                buffer[i] = 0xff202020; // Dark grey noise
            }
        }
        ctx.putImageData(idata, 0, 0);
        animId = requestAnimationFrame(draw);
    };
    
    draw();
    return () => cancelAnimationFrame(animId);
  }, [phase]);

  // --- RENDER HELPERS ---
  const currentRank = RANKS.slice().reverse().find(r => xp >= r.req) || RANKS[0];
  const nextRank = RANKS.find(r => r.lvl > currentRank.lvl);
  const xpProgress = nextRank ? ((xp - currentRank.req) / (nextRank.req - currentRank.req)) * 100 : 100;

  const ActiveIcon = currentCard.icon;

  return (
    <main className="relative min-h-screen w-full bg-[#050505] text-gray-200 font-sans overflow-hidden flex flex-col selection:bg-purple-500/30 selection:text-white">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a0b1f_0%,#000000_100%)] z-0 pointer-events-none" />
      
      {showInstructions && <InstructionModal onClose={() => { setShowInstructions(false); audio.init(); }} />}

      {/* HEADER: STATUS BAR */}
      <header className="relative z-10 p-4">
        <div className="flex items-center gap-4">
            <MagickalBackLink href="/the-magick-psychic-school/magick-training" text="Exit" className="text-xs opacity-50 hover:opacity-100" />
        </div>
        
        <div className="mt-4 mx-auto max-w-md bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-black border-2 border-purple-500 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                {currentRank.icon}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">{currentRank.title}</span>
                    <span className="text-[10px] text-gray-500 font-mono">LVL {currentRank.lvl}</span>
                </div>
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-purple-600 to-amber-500 transition-all duration-500" style={{ width: `${xpProgress}%` }} />
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-gray-600 font-mono">
                    <span>WILL: {xp}</span>
                    <span>RESONANCE: {streak}</span>
                </div>
            </div>
            <button onClick={() => setShowInstructions(true)} className="p-2 text-gray-500 hover:text-white"><HelpCircle size={18}/></button>
        </div>
      </header>

      {/* MAIN STAGE */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        
        {/* PHASE: SELECTION */}
        {phase === 'SELECTION' && (
            <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-6">
                    <button onClick={handlePrevCard} disabled={!!targetId} className={`p-2 rounded-full border border-purple-500/50 text-purple-400 hover:bg-purple-900/20 transition-all ${targetId ? 'opacity-0' : 'opacity-100'}`}>&larr;</button>
                    
                    <div className={`relative w-48 h-72 rounded-xl border-2 flex flex-col items-center justify-center bg-linear-to-br from-[#1a1a2e] to-[#0f0f1a] transition-all duration-500
                        ${targetId ? 'border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.3)] scale-105' : 'border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.15)]'}
                    `}>
                        <ActiveIcon size={64} style={{ color: currentCard.color }} className="drop-shadow-lg mb-4" />
                        <span className="font-serif text-xl tracking-[0.2em] text-purple-200 uppercase">{currentCard.name}</span>
                    </div>

                    <button onClick={handleNextCard} disabled={!!targetId} className={`p-2 rounded-full border border-purple-500/50 text-purple-400 hover:bg-purple-900/20 transition-all ${targetId ? 'opacity-0' : 'opacity-100'}`}>&rarr;</button>
                </div>

                <button 
                    onClick={toggleLock}
                    className={`px-8 py-2 rounded-full border font-serif text-xs tracking-widest transition-all
                        ${targetId 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                            : 'bg-transparent border-white/20 text-gray-400 hover:border-purple-400'}
                    `}
                >
                    {targetId ? "INTENT ANCHORED" : "ANCHOR THIS INTENT"}
                </button>
            </div>
        )}

        {/* PHASE: COUNTDOWN & MANIFEST CMD */}
        {(phase === 'COUNTDOWN' || phase === 'MANIFEST') && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-50 animate-in fade-in duration-300">
                {phase === 'COUNTDOWN' ? (
                    <span key={countdown} className="text-9xl font-serif font-black text-transparent bg-clip-text bg-linear-to-b from-white to-purple-900 animate-[ping_1s_ease-in-out]">{countdown}</span>
                ) : (
                    <div className="text-center animate-pulse">
                        <h1 className="text-6xl font-black font-serif text-white tracking-widest drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">MANIFEST</h1>
                        <h2 className="text-4xl font-serif text-amber-500 tracking-[0.5em] mt-4">NOW</h2>
                    </div>
                )}
            </div>
        )}

        {/* PHASE: VOID */}
        <div className={`absolute inset-0 flex items-center justify-center bg-black z-40 transition-opacity duration-500 ${phase === 'VOID' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="relative w-64 h-96 rounded-lg overflow-hidden border-4 border-purple-900/50">
                <canvas ref={canvasRef} width={256} height={384} className="w-full h-full opacity-80" />
                {/* SVG Stroke Animation */}
                <svg className="absolute inset-0 w-full h-full">
                    <rect 
                        x="2" y="2" width="98%" height="98%" rx="8" 
                        fill="none" stroke="#a855f7" strokeWidth="4"
                        strokeDasharray="1000"
                        strokeDashoffset={1000 * (1 - voidProgress / 100)}
                        style={{ filter: 'drop-shadow(0 0 10px #a855f7)' }}
                    />
                </svg>
            </div>
        </div>

        {/* PHASE: RESULT */}
        {phase === 'RESULT' && (
            <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500 z-50">
                <h2 className={`text-4xl font-serif tracking-widest ${targetId === currentCard.id ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]' : 'text-gray-500'}`}>
                    {targetId === currentCard.id ? "MANIFESTED" : "CONNECTION LOST"}
                </h2>
                
                <div className={`relative w-48 h-72 rounded-xl border-2 flex flex-col items-center justify-center bg-linear-to-br from-[#1a1a2e] to-[#0f0f1a]
                    ${targetId === currentCard.id ? 'border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.4)]' : 'border-gray-700 grayscale opacity-70'}
                `}>
                    <ActiveIcon size={64} style={{ color: currentCard.color }} className="drop-shadow-lg mb-4" />
                    <span className="font-serif text-xl tracking-[0.2em] text-purple-200 uppercase">{currentCard.name}</span>
                </div>

                <p className="text-sm font-mono text-gray-400 max-w-xs text-center">
                    {targetId === currentCard.id ? "Your will has shaped reality." : currentCard.fail}
                </p>
                
                <button onClick={resetGame} className="mt-4 px-12 py-3 bg-white text-black font-serif font-bold tracking-widest hover:bg-gray-200 transition-colors">
                    RESET RITUAL
                </button>
            </div>
        )}

      </div>

      {/* CONTROLS (Only in Selection) */}
      <div className={`relative z-20 bg-[#0f0f1a]/80 backdrop-blur-md border-t border-white/10 p-6 rounded-t-3xl transition-transform duration-500 ${phase !== 'SELECTION' ? 'translate-y-full opacity-50' : 'translate-y-0'}`}>
         
         <div className="flex justify-between items-center mb-6 text-xs font-mono text-gray-400">
            <span>CHANNEL WINDOW</span>
            <span className="text-purple-400">{channelTime}s</span>
         </div>
         <input 
            type="range" min="3" max="60" value={channelTime} 
            onChange={(e) => setChannelTime(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500 mb-8"
         />

         <div className="flex justify-between items-center mb-8">
            <span className="text-xs font-mono text-gray-400">ENTROPY SCALE</span>
            <button 
                onClick={() => { setDeckType(prev => prev === 'standard' ? 'advanced' : 'standard'); setTargetId(null); setCurrentIndex(0); }}
                className="text-xs font-mono border border-purple-500/50 px-3 py-1 rounded text-purple-300 hover:bg-purple-900/30"
            >
                {deckType === 'standard' ? 'STANDARD (1:5)' : 'ADVANCED (1:10)'}
            </button>
         </div>

         <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            disabled={!targetId}
            className={`w-full h-16 relative overflow-hidden border transition-all duration-300 group
                ${targetId 
                    ? 'border-purple-500 text-white cursor-pointer hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                    : 'border-gray-800 text-gray-600 cursor-not-allowed'}
            `}
         >
            <div className="absolute inset-0 bg-purple-600/20 w-full h-full transform -translate-x-full group-active:translate-x-0 transition-transform duration-75" style={{ transform: `translateX(${holdProgress - 100}%)`, transition: 'transform 0.05s linear' }} />
            <span className="relative z-10 font-serif font-bold tracking-widest text-sm">
                {targetId ? "BEGIN MANIFESTATION RITUAL" : "ANCHOR INTENT FIRST"}
            </span>
         </button>
      </div>

    </main>
  );
}