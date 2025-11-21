// --- START OF FILE src/app/components/ElectricMagick/RealityPatchSpell.tsx ---
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Heart, DollarSign, Sun, Shield, Star, Fingerprint, Activity, Check, Eye, X,
  Moon, Triangle, Hexagon 
} from 'lucide-react';

// --- AUDIO ENGINE (Original Implementation) ---
const useAudioEngine = () => {
  const ctxRef = useRef<AudioContext | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const oscRef = useRef<any>(null); 
  const gainRef = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (typeof window !== 'undefined' && !ctxRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) ctxRef.current = new AudioContext();
    }
    if (ctxRef.current && ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
  }, []);

  // 1. CLICK / INTERACT SOUNDS
  const playClick = useCallback((type = 'standard') => {
    if (!ctxRef.current) initAudio();
    const ctx = ctxRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'heavy') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'metallic') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2000, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  }, [initAudio]);

  // 2. CONTINUOUS LOOPS
  const startLoop = useCallback((type: string) => {
    if (!ctxRef.current) initAudio();
    const ctx = ctxRef.current!;

    if (oscRef.current) {
      try { 
          if(oscRef.current.stop) oscRef.current.stop(); 
      } catch(e){ /**/ }
      oscRef.current = null;
    }

    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    if (type === 'drone') {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(40, ctx.currentTime);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, ctx.currentTime);

      osc.connect(filter);
      filter.connect(masterGain);
      
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1); 
      
      osc.start();
      oscRef.current = osc;
    } 
    else if (type === 'breath') {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 5;
      filter.frequency.setValueAtTime(200, ctx.currentTime); 

      noise.connect(filter);
      filter.connect(masterGain);
      
      masterGain.gain.value = 0.15;
      noise.start();
      
      oscRef.current = { stop: () => noise.stop(), filter: filter };
    }
    else if (type === 'burn') {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, ctx.currentTime);
      
      const lfo = ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 20; 
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 500;
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(masterGain);
      masterGain.gain.setValueAtTime(0.1, ctx.currentTime);
      
      osc.start();
      oscRef.current = { stop: () => { osc.stop(); lfo.stop(); } };
    }
    else if (type === 'chant') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine'; osc2.type = 'triangle';
      osc1.frequency.value = 100; osc2.frequency.value = 200; 

      const tremolo = ctx.createOscillator();
      tremolo.frequency.value = 4; 
      const tremoloGain = ctx.createGain();
      tremoloGain.gain.value = 0.5;
      tremolo.connect(tremoloGain);
      tremoloGain.connect(masterGain.gain);
      
      osc1.connect(masterGain);
      osc2.connect(masterGain);
      
      osc1.start(); osc2.start(); tremolo.start();
      masterGain.gain.setValueAtTime(0.1, ctx.currentTime);
      
      oscRef.current = { stop: () => { osc1.stop(); osc2.stop(); tremolo.stop(); } };
    }
    else if (type === 'charge') {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime); 
      
      osc.connect(masterGain);
      masterGain.gain.value = 0.1;
      osc.start();
      
      oscRef.current = osc;
    }
  }, [initAudio]);

  // 3. MODULATE LOOPS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateLoop = useCallback((progress: any, type: string) => {
    if (!ctxRef.current || !oscRef.current) return;
    const ctx = ctxRef.current;

    if (type === 'drone') {
      if (oscRef.current.frequency) {
        oscRef.current.frequency.setTargetAtTime(40 + (progress * 2), ctx.currentTime, 0.1);
      }
    }
    else if (type === 'breath') {
       let freq;
       if (progress === 'INHALE') freq = 800;
       else if (progress === 'HOLD') freq = 800;
       else freq = 200;
       
       oscRef.current.filter.frequency.setTargetAtTime(freq, ctx.currentTime, 2);
    }
    else if (type === 'charge') {
       if (oscRef.current.frequency) {
           oscRef.current.frequency.setTargetAtTime(100 + (progress * 10), ctx.currentTime, 0.1);
           if(gainRef.current) gainRef.current.gain.setTargetAtTime(0.1 + (progress/200), ctx.currentTime, 0.1);
       }
    }
  }, []);

  const stopLoop = useCallback(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.1);
      setTimeout(() => {
        if (oscRef.current) {
            try { 
                if(oscRef.current.stop) oscRef.current.stop(); 
            } catch(e){ /**/ }
            oscRef.current = null;
        }
      }, 200);
    }
  }, []);

  // 4. ONE-SHOT FX
  const playSuccess = useCallback(() => {
      if (!ctxRef.current) initAudio();
      const ctx = ctxRef.current!;
      
      [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1 + (i*0.05));
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
          
          osc.start();
          osc.stop(ctx.currentTime + 3.5);
      });
  }, [initAudio]);

  const playCastBoom = useCallback(() => {
      if (!ctxRef.current) initAudio();
      const ctx = ctxRef.current!;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1);
      
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);

      const bufferSize = ctx.sampleRate * 1.5; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();
  }, [initAudio]);

  return { playClick, startLoop, updateLoop, stopLoop, playSuccess, playCastBoom };
};


// --- UTILITY & CONSTANTS ---

const ARCHETYPES = {
  LOVE: { color: 'text-rose-500', border: 'border-rose-500', glow: 'shadow-rose-500', icon: Heart, theme: 'VENUS' },
  MONEY: { color: 'text-emerald-400', border: 'border-emerald-400', glow: 'shadow-emerald-400', icon: DollarSign, theme: 'JUPITER' },
  POWER: { color: 'text-amber-500', border: 'border-amber-500', glow: 'shadow-amber-500', icon: Sun, theme: 'SOL' },
  PROTECT: { color: 'text-blue-500', border: 'border-blue-500', glow: 'shadow-blue-500', icon: Shield, theme: 'MARS' },
  UNK: { color: 'text-cyan-400', border: 'border-cyan-400', glow: 'shadow-cyan-400', icon: Star, theme: 'AETHER' }
};

const detectArchetype = (text: string) => {
  const t = text.toUpperCase();
  if (t.includes('LOVE') || t.includes('HEART') || t.includes('PARTNER')) return ARCHETYPES.LOVE;
  if (t.includes('MONEY') || t.includes('WEALTH') || t.includes('JOB')) return ARCHETYPES.MONEY;
  if (t.includes('POWER') || t.includes('CONTROL') || t.includes('STRENGTH')) return ARCHETYPES.POWER;
  if (t.includes('PROTECT') || t.includes('SAFE') || t.includes('GUARD')) return ARCHETYPES.PROTECT;
  return ARCHETYPES.UNK;
};

// --- BACKGROUND EFFECTS ---

const WarpBackground = ({ intensity }: { intensity: number }) => (
  <div className="fixed inset-0 z-0 bg-black overflow-hidden pointer-events-none">
    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-screen">
      <filter id="warpFilter">
        <feTurbulence type="fractalNoise" baseFrequency={0.01 + (intensity / 5000)} numOctaves="2" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale={intensity} />
      </filter>
      <rect width="100%" height="100%" filter="url(#warpFilter)" fill="indigo" />
    </svg>
    <div className="absolute inset-0 bg-linear-to-b from-black via-transparent to-slate-950 opacity-90" />
  </div>
);

const GlitchOverlay = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-50 pointer-events-none mix-blend-difference animate-pulse bg-white/10">
      <div className="absolute top-1/4 left-0 w-full h-2 bg-cyan-500/50 blur-sm transform -skew-x-12" />
      <div className="absolute bottom-1/3 left-0 w-full h-4 bg-purple-500/50 blur-md transform skew-x-12" />
    </div>
  );
};

// --- SUB-COMPONENTS ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Consecration = ({ setPhase, archetype, audio }: any) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    if (isHolding) {
      audio.startLoop('drone');
    } else {
      audio.stopLoop();
    }
    return () => audio.stopLoop();
  }, [isHolding, audio]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding && progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev >= 100 ? 100 : prev + 0.5;
          audio.updateLoop(next, 'drone'); 
          return next;
        });
        if (navigator.vibrate) navigator.vibrate(5);
      }, 30);
    } else if (!isHolding && progress > 0 && progress < 100) {
      setProgress(0); 
    }
    
    if (progress >= 100) {
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      audio.stopLoop();
      audio.playSuccess(); 
      const timeout = setTimeout(() => setPhase('GROUNDING'), 1000);
      return () => clearTimeout(timeout);
    }
    
    return () => clearInterval(interval);
  }, [isHolding, progress, setPhase, audio]);

  const ArchetypeIcon = archetype.icon;

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-1000 relative z-10">
      <div className="relative w-72 h-72 flex items-center justify-center">
        <div className={`absolute inset-0 border border-dashed ${archetype.border} rounded-full opacity-30 ${isHolding ? 'animate-spin-slow' : ''}`} />
        <div className={`absolute inset-4 border border-dotted ${archetype.border} rounded-full opacity-50 ${isHolding ? 'animate-spin-reverse-slower' : ''}`} />
        <svg className="w-full h-full -rotate-90 transform drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-slate-800" />
          <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="2" fill="transparent" 
            strokeDasharray={816} strokeDashoffset={816 - (816 * progress) / 100}
            className={`${archetype.color} transition-all duration-75 ease-linear`}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isHolding ? 'opacity-100' : 'opacity-30'}`}>
            <ArchetypeIcon className={`w-16 h-16 ${archetype.color}`} />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className={`${archetype.color} font-serif italic text-xl tracking-[0.2em] drop-shadow-md`}>
            {progress >= 100 ? "SEALED." : "CONSECRATE"}
        </h2>
        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Hold to banish mundane forces</p>
      </div>
      <button 
        className={`w-32 h-32 rounded-full bg-black/50 border ${archetype.border} shadow-[0_0_30px_rgba(0,0,0,0.5)] active:scale-95 transition-all flex items-center justify-center group`}
        onMouseDown={() => setIsHolding(true)}
        onMouseUp={() => setIsHolding(false)}
        onMouseLeave={() => setIsHolding(false)}
        onTouchStart={(e) => { e.preventDefault(); setIsHolding(true); }}
        onTouchEnd={() => setIsHolding(false)}
      >
        <Fingerprint className={`${archetype.color} w-12 h-12 group-hover:scale-110 transition-transform`} />
      </button>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Grounding = ({ setPhase, audio }: any) => {
  const [cycle, setCycle] = useState(0);
  const [breathState, setBreathState] = useState('INHALE');
  const TOTAL_CYCLES = 3;

  useEffect(() => {
      audio.startLoop('breath');
      return () => audio.stopLoop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;
    const runBreathCycle = async () => {
      if (cycle >= TOTAL_CYCLES) {
        if (isMounted) {
            audio.playSuccess();
            setTimeout(() => setPhase('INTENTION'), 1000);
        }
        return;
      }
      
      if (!isMounted) return;
      setBreathState('INHALE');
      audio.updateLoop('INHALE', 'breath'); 
      await new Promise(r => setTimeout(r, 4000));
      
      if (!isMounted) return;
      setBreathState('HOLD');
      audio.updateLoop('HOLD', 'breath');
      await new Promise(r => setTimeout(r, 2000));
      
      if (!isMounted) return;
      setBreathState('EXHALE');
      audio.updateLoop('EXHALE', 'breath'); 
      await new Promise(r => setTimeout(r, 4000));
      
      if (isMounted) setCycle(c => c + 1);
    };
    runBreathCycle();
    return () => { isMounted = false; };
  }, [cycle, setPhase, audio]);

  const guideStyle = {
    transform: breathState === 'INHALE' ? 'scale(1.5)' : breathState === 'EXHALE' ? 'scale(0.8)' : 'scale(1.5)',
    opacity: breathState === 'INHALE' ? 1 : breathState === 'EXHALE' ? 0.4 : 0.8,
    transition: breathState === 'HOLD' ? 'none' : 'all 4s ease-in-out',
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 relative z-10">
      <h2 className="text-cyan-500 font-mono text-sm tracking-widest animate-pulse">
        {cycle >= TOTAL_CYCLES ? 'BIO-SYNC COMPLETE' : 'SYNCHRONIZE BREATH'}
      </h2>
      <div className="relative">
        <div className="w-32 h-32 bg-cyan-900/20 border border-cyan-500/30 rounded-full blur-xl absolute inset-0" style={guideStyle} />
        <div className="w-32 h-32 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)]" style={guideStyle}>
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      </div>
      <div className="font-mono text-cyan-200 text-xl tracking-widest">{breathState}</div>
      <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-cyan-600 transition-all duration-1000" style={{ width: `${(cycle / TOTAL_CYCLES) * 100}%` }} />
      </div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Inscription = ({ setIntention, setArchetype, setPhase, archetype, audio }: any) => {
  const [text, setText] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [burnProgress, setBurnProgress] = useState(0);
  const [isInscribing, setIsInscribing] = useState(false);
  const [sigilPath, setSigilPath] = useState("");
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (isLocked) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
        const points = [];
        for (let i = 0; i < 5; i++) {
            const x = 50 + Math.abs((hash * (i + 1)) % 100);
            const y = 50 + Math.abs((hash * (i + 2)) % 100);
            points.push(`${x},${y}`);
        }
        setSigilPath(`M100,20 L${points.join(' L')} Z M50,100 L150,100 M100,50 L100,150`);
    }
  }, [isLocked, text]);

  useEffect(() => {
      if (isInscribing && !hasCompleted) {
          audio.startLoop('burn');
      } else {
          audio.stopLoop();
      }
  }, [isInscribing, hasCompleted, audio]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (burnProgress >= 100 && !hasCompleted) {
        setHasCompleted(true);
        audio.playSuccess();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        setTimeout(() => setPhase('SYMBOLISM'), 1500);
        return;
    }

    if (!hasCompleted) {
        if (isInscribing && burnProgress < 100) {
            interval = setInterval(() => {
                setBurnProgress(p => {
                    if (p >= 100) return 100;
                    return p + 0.5;
                });
                if (navigator.vibrate) navigator.vibrate(10);
            }, 20);
        } else if (!isInscribing && burnProgress > 0 && burnProgress < 100) {
            setBurnProgress(0); 
        }
    }
    return () => clearInterval(interval);
  }, [isInscribing, burnProgress, setPhase, hasCompleted, audio]);

  if (!isLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 space-y-8 relative z-10 animate-in slide-in-from-bottom duration-1000">
         <Eye className="w-12 h-12 text-slate-700 animate-pulse mb-4" />
         <h2 className="text-slate-400 font-mono text-xs tracking-[0.5em]">DECLARE INTENTION</h2>
         <input 
           type="text" 
           value={text}
           onChange={(e) => setText(e.target.value.toUpperCase())}
           placeholder="I DESIRE..."
           className="w-full bg-transparent border-b border-slate-800 text-center text-3xl font-serif italic text-white focus:outline-none focus:border-white transition-colors placeholder-slate-800 pb-4"
         />
         {text.length > 3 && (
           <button 
             onClick={() => { 
                audio.playClick('heavy');
                const arch = detectArchetype(text);
                setArchetype(arch);
                setIntention(text); 
                setIsLocked(true); 
             }}
             className="mt-12 px-8 py-3 border border-slate-700 text-slate-400 font-mono text-[10px] tracking-widest hover:bg-white hover:text-black transition-all"
           >
             [ CRYSTALLIZE ]
           </button>
         )}
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 relative z-10">
      <div className="relative w-72 h-72 bg-black/50 border border-slate-800 backdrop-blur-sm">
        <svg viewBox="0 0 200 200" className="w-full h-full p-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
           <defs>
             <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
               <feGaussianBlur stdDeviation="2" result="blur" />
               <feComposite in="SourceGraphic" in2="blur" operator="over" />
             </filter>
           </defs>
           <path d={sigilPath} stroke="#334155" strokeWidth="2" fill="none" />
           <path d={sigilPath} stroke={archetype?.color ? "currentColor" : "white"} strokeWidth="3" fill="none"
            className={`${archetype.color} transition-all duration-100`}
            strokeDasharray="1000" strokeDashoffset={1000 - (1000 * burnProgress) / 100}
            filter="url(#glow)"
          />
        </svg>
      </div>
      <div className="text-center space-y-2">
         <h2 className={`${archetype.color} font-mono text-xs tracking-widest`}>
           {hasCompleted ? "SIGIL BOUND." : "ETCHING SIGIL INTO AETHER..."}
         </h2>
      </div>
      <button
        className={`w-full max-w-xs py-8 border text-xs font-mono tracking-widest transition-all select-none ${hasCompleted ? 'border-white text-white bg-white/10' : 'border-slate-800 text-slate-500 hover:text-white hover:border-white active:bg-white/10'}`}
        onMouseDown={() => setIsInscribing(true)}
        onMouseUp={() => setIsInscribing(false)}
        onMouseLeave={() => setIsInscribing(false)}
        onTouchStart={(e) => { e.preventDefault(); setIsInscribing(true); }}
        onTouchEnd={() => setIsInscribing(false)}
        disabled={hasCompleted}
      >
        {hasCompleted ? "[ COMPLETE ]" : "[ HOLD TO BURN ]"}
      </button>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SymbolicAlignment = ({ setPhase, archetype, audio }: any) => {
    const [alignedCount, setAlignedCount] = useState(0);
    const [positions, setPositions] = useState([0, 0, 0, 0]); 
    
    const toggleRune = (index: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((positions as any)[index] === 'LOCKED') return;
        audio.playClick('metallic'); 
        setPositions(prev => {
            const newPos = [...prev] as any;
            newPos[index] = 'LOCKED';
            return newPos;
        });
        setAlignedCount(c => c + 1);
        if (navigator.vibrate) navigator.vibrate(50);
    };

    useEffect(() => {
        if (alignedCount >= 4) {
            audio.playSuccess(); 
            setTimeout(() => setPhase('CHANT'), 1000);
        }
    }, [alignedCount, setPhase, audio]);

    const Runes = [Star, Moon, Triangle, Hexagon];

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-12 relative z-10">
            <h2 className={`${archetype.color} font-serif italic text-2xl tracking-widest animate-pulse`}>
                Align the Constants
            </h2>
            
            <div className="flex gap-4 h-64 items-center relative">
                <div className="absolute w-full h-16 border-y border-dashed border-slate-700 bg-white/5 top-1/2 -translate-y-1/2 pointer-events-none" />
                
                {Runes.map((Rune, i) => (
                    <button 
                        key={i}
                        onClick={() => toggleRune(i)}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        disabled={(positions as any)[i] === 'LOCKED'}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        className={`w-16 h-32 flex items-center justify-center transition-all duration-1000 relative border ${(positions as any)[i] === 'LOCKED' ? archetype.border : 'border-slate-800'}`}
                    >
                         <Rune 
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            className={`w-8 h-8 ${(positions as any)[i] === 'LOCKED' ? archetype.color + ' drop-shadow-[0_0_10px_currentColor]' : 'text-slate-600'} transition-all`}
                            style={{
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                transform: (positions as any)[i] === 'LOCKED' ? 'scale(1.5)' : `translateY(${Math.sin(Date.now() / 200 + i) * 20}px)`
                            }}
                         />
                         {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                         {(positions as any)[i] !== 'LOCKED' && (
                             <div className="absolute inset-0 animate-pulse bg-white/5" />
                         )}
                    </button>
                ))}
            </div>
            
            <p className="font-mono text-[10px] text-slate-500">
                TAP SYMBOLS TO LOCK FREQUENCY
            </p>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VocalChant = ({ setPhase, archetype, audio }: any) => {
    const [charge, setCharge] = useState(0);
    const [chanting, setChanting] = useState(false);

    useEffect(() => {
        if (chanting) {
            audio.startLoop('chant');
        } else {
            audio.stopLoop();
        }
        return () => audio.stopLoop();
    }, [chanting, audio]);

    const getChant = () => {
        if (archetype.theme === 'VENUS') return ["AMOR", "VINCIT", "OMNIA", "ET", "NOS", "CEDAMUS", "AMORI"];
        if (archetype.theme === 'JUPITER') return ["ABUNDANTIA", "FLUIT", "AD", "ME", "SICUT", "FLUMEN", "AUREUM"];
        if (archetype.theme === 'MARS') return ["SCUTUM", "FERREUM", "CUSTODIT", "ANIMAM", "MEAM", "IN", "AETERNUM"];
        return ["IGNIS", "AER", "AQUA", "TERRA", "SPIRITUS", "SANCTUS", "EST"];
    };
    
    const words = useMemo(() => getChant(), [archetype]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (chanting && charge < words.length * 100) {
            interval = setInterval(() => {
                setCharge(c => c + 2);
                if (navigator.vibrate && charge % 50 === 0) navigator.vibrate(20);
            }, 50);
        } else if (!chanting && charge > 0) {
            setCharge(0); 
        }

        if (charge >= words.length * 100) {
            audio.playSuccess();
            if (navigator.vibrate) navigator.vibrate([100, 100, 100]);
            setTimeout(() => setPhase('CHARGE'), 1000);
        }
        return () => clearInterval(interval);
    }, [chanting, charge, setPhase, words, audio]);

    const currentWordIndex = Math.min(Math.floor(charge / 100), words.length - 1);

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-16 relative z-10">
            <div className="h-32 flex flex-col items-center justify-center">
                {words.map((word, i) => (
                    <h1 key={i} 
                        className={`text-3xl font-black tracking-[0.5em] transition-all duration-300 ${
                            i === currentWordIndex && chanting 
                            ? `${archetype.color} scale-150 blur-[1px] translate-x-${Math.random()*4} translate-y-${Math.random()*4}` 
                            : i < currentWordIndex ? 'text-slate-800 scale-75' : 'text-slate-900 blur-sm'
                        }`}
                        style={{ display: Math.abs(i - currentWordIndex) > 1 ? 'none' : 'block' }}
                    >
                        {word}
                    </h1>
                ))}
            </div>

            <div className="relative w-48 h-48">
                 {chanting && (
                    <>
                        <div className={`absolute inset-0 rounded-full border ${archetype.border} opacity-20 animate-ping`} />
                        <div className={`absolute inset-4 rounded-full border ${archetype.border} opacity-40 animate-ping animation-delay-200`} />
                        <div className={`absolute inset-8 rounded-full border ${archetype.border} opacity-60 animate-ping animation-delay-500`} />
                    </>
                 )}
                 
                 <button
                    className={`w-full h-full rounded-full border-2 ${archetype.border} flex items-center justify-center relative overflow-hidden bg-black`}
                    onMouseDown={() => setChanting(true)}
                    onMouseUp={() => setChanting(false)}
                    onMouseLeave={() => setChanting(false)}
                    onTouchStart={(e) => { e.preventDefault(); setChanting(true); }}
                    onTouchEnd={() => setChanting(false)}
                 >
                     <div className={`absolute bottom-0 left-0 w-full bg-white/10 transition-all duration-75`} 
                          style={{ height: `${(charge / (words.length * 100)) * 100}%` }} />
                     <Activity className={`${archetype.color} w-12 h-12 ${chanting ? 'animate-bounce' : ''}`} />
                 </button>
            </div>
            
            <p className="font-mono text-[10px] text-slate-500 uppercase">
                Hold and Recite the Incantation
            </p>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChargeAndCast = ({ setPhase, setGlitchActive, archetype, audio }: any) => {
   const [charge, setCharge] = useState(0);
   const [shaking, setShaking] = useState(false);

   useEffect(() => {
       if (shaking && charge < 100) {
           audio.startLoop('charge');
       } else {
           audio.stopLoop();
       }
       return () => audio.stopLoop();
   }, [shaking, charge, audio]);

   useEffect(() => {
     let interval: NodeJS.Timeout;
     if (shaking && charge < 100) {
       interval = setInterval(() => {
         setCharge(c => {
            const next = c >= 100 ? 100 : c + 0.2;
            audio.updateLoop(next, 'charge'); 
            return next;
         });
         if (navigator.vibrate && Math.random() > 0.7) navigator.vibrate(10); 
       }, 20);
     } else if (!shaking && charge > 0 && charge < 100) {
       interval = setInterval(() => {
         setCharge(c => Math.max(0, c - 2));
       }, 30);
     }
     return () => clearInterval(interval);
   }, [shaking, charge, audio]);

   useEffect(() => {
     if (charge >= 100) {
        audio.playCastBoom(); 
        if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 1000]);
        setGlitchActive(true);
        const timeout = setTimeout(() => setPhase('CAST'), 3000);
        return () => clearTimeout(timeout);
     }
   }, [charge, setPhase, setGlitchActive, audio]);

   return (
       <div className={`flex flex-col items-center justify-center h-full space-y-12 relative z-10`}
            style={{ 
                transform: shaking ? `translate(${Math.random()*10 - 5}px, ${Math.random()*10 - 5}px)` : 'none' 
            }}
       >
           <div className="relative w-80 h-80">
               <div className={`absolute inset-0 rounded-full bg-linear-to-tr from-black via-transparent to-${archetype.theme === 'VENUS' ? 'rose' : 'cyan'}-900 animate-spin-slow blur-xl opacity-80`} />
               
               <div className="absolute inset-0 flex items-center justify-center">
                   <archetype.icon 
                      className={`text-white drop-shadow-[0_0_30px_currentColor] transition-all duration-100`}
                      style={{ 
                          width: `${60 + charge}px`, 
                          height: `${60 + charge}px`,
                          opacity: 0.5 + (charge/200),
                          filter: `blur(${shaking ? 0 : 5}px)`
                      }} 
                   />
               </div>
               
               {shaking && (
                  <>
                   {[...Array(6)].map((_, i) => (
                      <div key={i} className={`absolute w-1 h-1 bg-white shadow-[0_0_20px_white] rounded-full top-1/2 left-1/2`}
                           style={{
                               transform: `rotate(${i * 60}deg) translateX(${150 - charge}px)`
                           }}
                      />
                   ))}
                  </>
               )}
           </div>
           
           <div className="w-64 space-y-4 z-20">
               <div className="h-1 bg-slate-900 w-full mx-auto overflow-hidden">
                   <div className={`h-full bg-white shadow-[0_0_20px_white] transition-all duration-75 ease-linear`} style={{ width: `${charge}%` }} />
               </div>
               <p className={`${archetype.color} text-center font-serif italic text-xl tracking-widest animate-pulse`}>
                   {charge < 100 ? 'CHANNEL THE SOURCE' : 'REALITY BREACH'}
               </p>
           </div>
           
           <button className="w-full h-full absolute inset-0 opacity-0 cursor-pointer z-30"
              onMouseDown={() => setShaking(true)} onMouseUp={() => setShaking(false)} onMouseLeave={() => setShaking(false)}
              onTouchStart={(e) => { e.preventDefault(); setShaking(true); }} onTouchEnd={() => setShaking(false)}
           />
       </div>
   );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FinalCast = ({ intention, archetype, audio, onExit }: any) => (
    <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-[3000ms] relative z-10">
        <div className="relative mb-12">
            <div className={`absolute inset-0 ${archetype.color.replace('text', 'bg')} blur-[100px] opacity-40 animate-pulse`} />
            <Check className={`w-48 h-48 ${archetype.color} drop-shadow-[0_0_50px_currentColor]`} />
        </div>
        <h1 className="text-4xl font-serif italic text-white tracking-widest mb-6 drop-shadow-lg">SO MOTE IT BE</h1>
        <p className={`${archetype.color} font-mono text-xs tracking-[0.5em] uppercase`}>Target: {intention}</p>
        <p className="text-slate-600 font-mono text-[10px] mt-24 animate-pulse">The universe has been recompiled.</p>
        <button 
          onClick={onExit}
          onMouseEnter={() => audio.playClick('standard')}
          className="mt-12 text-slate-600 hover:text-white font-mono text-xs border-b border-transparent hover:border-white transition-all">
          [ CLOSE SESSION ]
        </button>
    </div>
);

// --- MAIN COMPONENT ---

export default function RealityPatchSpell({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState('CONSECRATE'); 
  const [intention, setIntention] = useState('');
  const [archetype, setArchetype] = useState(ARCHETYPES.UNK);
  const [glitchActive, setGlitchActive] = useState(false);
  
  const audio = useAudioEngine();

  const getWarpIntensity = () => {
      switch(phase) {
          case 'CONSECRATE': return 10;
          case 'GROUNDING': return 20;
          case 'INTENTION': return 30;
          case 'SYMBOLISM': return 50;
          case 'CHANT': return 80;
          case 'CHARGE': return 150;
          case 'CAST': return 500;
          default: return 0;
      }
  };

  const styles = `
    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-spin-slow { animation: spin-slow 20s linear infinite; }
    @keyframes spin-reverse-slower { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
    .animate-spin-reverse-slower { animation: spin-reverse-slower 30s linear infinite; }
  `;

  return (
    <div className="fixed inset-0 w-full h-screen bg-black text-slate-200 overflow-hidden select-none touch-none font-sans z-50">
      <style>{styles}</style>
      <button onClick={onExit} className="absolute top-6 right-6 z-50 text-slate-600 hover:text-white transition-colors">
        <X size={24}/>
      </button>

      <WarpBackground intensity={getWarpIntensity()} />
      <GlitchOverlay active={glitchActive} />
      
      <div className="relative z-10 w-full h-full max-w-md mx-auto">
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start opacity-50 z-20">
            <div className="flex flex-col font-mono text-[10px] text-slate-500">
                <span>{new Date().toLocaleTimeString()}</span>
                <span className={archetype.color}>TYPE: {archetype.theme}</span>
            </div>
            <div className="flex flex-col font-mono text-[10px] text-right text-slate-500">
                <span>PHASE: {phase}</span>
                <span>STABILITY: {Math.floor(Math.random() * 30) + 70}%</span>
            </div>
        </div>
        
        <main className="w-full h-full relative z-10">
            {phase === 'CONSECRATE' && <Consecration setPhase={setPhase} archetype={archetype} audio={audio} />}
            {phase === 'GROUNDING' && <Grounding setPhase={setPhase} audio={audio} />}
            {phase === 'INTENTION' && <Inscription setIntention={setIntention} setArchetype={setArchetype} setPhase={setPhase} archetype={archetype} audio={audio} />}
            {phase === 'SYMBOLISM' && <SymbolicAlignment setPhase={setPhase} archetype={archetype} audio={audio} />}
            {phase === 'CHANT' && <VocalChant setPhase={setPhase} archetype={archetype} audio={audio} />}
            {phase === 'CHARGE' && <ChargeAndCast setPhase={setPhase} setGlitchActive={setGlitchActive} archetype={archetype} audio={audio} />}
            {phase === 'CAST' && <FinalCast intention={intention} archetype={archetype} audio={audio} onExit={onExit} />}
        </main>
      </div>
    </div>
  );
}