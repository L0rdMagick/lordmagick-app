// --- START OF FILE src/app/components/ElectricMagick.tsx ---
/// <reference lib="dom" />
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, Flame, Droplets, Wind, Mountain, 
  ArrowUp, Sun, Moon, Orbit, Zap, Activity, 
  Triangle, Eye, X, Grid, Globe, Binary 
} from 'lucide-react';
// THE FIX: Import the new production-ready service functions
import { generateElectricEnsorcellment, generateElectricOracle, saveSpell } from '@/lib/services/geminiService';
import { useSpellSystem } from '@/hooks/useSpellSystem';
import type { Session } from '@/lib/types';
import { SlotPurchaseModal } from '@/app/components/economy/SlotPurchaseModal';
import { BlockageErrorOverlay } from '@/app/components/economy/BlockageErrorOverlay';

// ==========================================
// 1. THE "VOID GATE" SPELL
// ==========================================

/**
 * UTILS
 */
const getMagickalNumber = (min: number, max: number): number => {
  const sacredNumbers = [3, 7, 9, 11, 13, 21, 23, 33, 42, 72, 93, 108];
  const valid = sacredNumbers.filter(n => n >= min && n <= max);
  return valid.length > 0 
    ? valid[Math.floor(Math.random() * valid.length)] 
    : Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * AUDIO ENGINE
 */
const useAudioEngine = () => {
  // FIX: Use 'any' to bypass missing AudioContext type
  const audioCtxRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const oscillatorsRef = useRef<any[]>([]);

  const initAudio = useCallback(() => {
    // FIX: Safe window access
    const win = (globalThis as any).window;
    if (typeof win !== 'undefined' && !audioCtxRef.current) {
      // Fix: Cast window to any to allow webkitAudioContext
      const AudioContextClass = win.AudioContext || (win as any).webkitAudioContext;
      if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  // FIX: Use 'string' for type instead of OscillatorType
  const playTone = useCallback((freq: number, type: string = 'sine', duration = 1, volume = 0.1) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // FIX: Cast type
    osc.type = type as any;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, []);

  const playDrone = useCallback((active: boolean) => {
    if (!audioCtxRef.current) return;
    
    if (active && oscillatorsRef.current.length === 0) {
      const ctx = audioCtxRef.current;
      const freqs = [55, 59, 110, 112]; // Deeper, more dissonant drone
      
      freqs.forEach(f => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = f;
        gain.gain.value = 0.03;
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorsRef.current.push({osc, gain});
      });
    } else if (!active) {
      oscillatorsRef.current.forEach(o => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          o.gain.gain.setTargetAtTime(0, audioCtxRef.current!.currentTime, 1);
          setTimeout(() => o.osc.stop(), 1500);
        } catch (e) { console.log(e) }
      });
      oscillatorsRef.current = [];
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
    };
  }, []);

  return { initAudio, playTone, playDrone };
};

/**
 * PARTICLE SYSTEM HOOK
 */
const useParticleSystem = () => {
  // FIX: Use 'any' to avoid HTMLCanvasElement type issues
  const canvasRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const particlesRef = useRef<any[]>([]);

  const spawnExplosion = (x: number, y: number, color = '#a855f7', count = 30) => {
    if (!canvasRef.current) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
        size: Math.random() * 3 + 1
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // FIX: Safe window access
    const win = (globalThis as any).window;

    const resize = () => {
      if (win) {
        canvas.width = win.innerWidth;
        canvas.height = win.innerHeight;
      }
    };
    if (win) {
      win.addEventListener('resize', resize);
      resize();
    }

    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update & Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Gravity
        p.vx *= 0.95; // Friction
        p.life -= 0.02;
        
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
      
      // FIX: Safe requestAnimationFrame access
      if (typeof (globalThis as any).window !== 'undefined') {
        animationFrame = (globalThis as any).window.requestAnimationFrame(animate);
      }
    };
    animate();
    
    return () => {
      if (typeof (globalThis as any).window !== 'undefined') {
        (globalThis as any).window.removeEventListener('resize', resize);
        (globalThis as any).window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return { canvasRef, spawnExplosion };
};

// The Wrapped Component
const VoidGateSpell = ({ onExit, spellSystem, session }: { onExit: () => void, spellSystem: any, session: Session | null }) => {
  const [stage, setStage] = useState(0);
  const [intention, setIntention] = useState('');
  const [mode, setMode] = useState<'standard' | 'ai'>('standard');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { initAudio, playTone, playDrone } = useAudioEngine();
  const { canvasRef, spawnExplosion } = useParticleSystem();
  
  // STAGE 1: INITIATION
  const StartScreen = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in relative z-20">
      <div className="relative group cursor-pointer">
        <div className="absolute inset-0 bg-purple-600 blur-[100px] opacity-20 rounded-full animate-pulse"></div>
        <Orbit size={80} className="text-purple-300 animate-[spin_10s_linear_infinite] relative z-10" />
      </div>
      <h1 className="text-5xl font-serif text-center text-transparent bg-clip-text bg-linear-to-r from-purple-200 via-white to-purple-200 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
        The Void<br/>Gate
      </h1>
      <p className="text-center text-gray-400 max-w-md px-6 font-light italic tracking-wide">
        &quot;The numbers are the keys. The gestures are the lock.&quot;
      </p>
      
      <div className="flex flex-col gap-4 mt-8 w-full max-w-sm px-4">
        {/* Standard (Free) Mode */}
        <button 
          onClick={async (e) => {
            // FIX: Cast target to any to access getBoundingClientRect
            const target = e.target as any;
            const rect = target.getBoundingClientRect();
            spawnExplosion(rect.x + rect.width/2, rect.y + rect.height/2, '#ffffff', 20);
            initAudio();
            playDrone(true);
            playTone(110, 'sawtooth', 3, 0.2);
            setMode('standard');
            setStage(1);
          }}
          className="px-8 py-4 border border-purple-500/30 bg-purple-900/10 backdrop-blur-sm text-purple-200 rounded-sm hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300 tracking-[0.2em] uppercase text-xs"
        >
          Standard Ritual (Free)
        </button>

        {/* AI Enhanced Mode */}
        <button 
          onClick={async (e) => {
            if (!session?.user?.id) { 
                // Using alert for now as a fallback if no overlay available at this level, but the parent should handle auth
                // Ideally this button shouldn't be reachable without auth if the page enforces it.
                // But let's check spellSystem too.
                return; 
            }
            
            // Check Economy
            // Force 3 Faestones cost explicitly
            const paid = await spellSystem.genEconomy.spendAether(session.user.id, 3);
            if (!paid) return;

            // FIX: Cast target to any
            const target = e.target as any;
            const rect = target.getBoundingClientRect();
            spawnExplosion(rect.x + rect.width/2, rect.y + rect.height/2, '#d8b4fe', 40);
            initAudio();
            playDrone(true);
            playTone(110, 'sawtooth', 3, 0.2);
            setMode('ai');
            setStage(1);
          }}
          className="px-8 py-4 border border-purple-400 bg-purple-900/40 backdrop-blur-md text-white rounded-sm hover:bg-purple-800/60 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 tracking-[0.2em] uppercase text-xs font-bold"
        >
          High Ritual (AI Enhanced)
        </button>
        <div className="text-center text-[10px] text-gray-500 font-mono">
             High Ritual cost: {spellSystem.genEconomy.cost} Aether
        </div>
      </div>

      <p className="text-[10px] text-gray-600 absolute bottom-8 uppercase tracking-widest">Audio & Touch Required</p>
    </div>
  );

  // STAGE 2: BANISHING
  const BanishingStage = () => {
    const [cleared, setCleared] = useState(0);
    const [target] = useState(() => getMagickalNumber(80, 150)); 
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMove = (e: any) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const newVal = cleared + 1;
      if (newVal <= target) {
        setCleared(newVal);
        if (newVal % 10 === 0) {
           spawnExplosion(clientX, clientY, '#fef08a', 5); 
           playTone(200 + (newVal * 2), 'triangle', 0.05, 0.05);
        }
      } else if (newVal === target + 1) {
        playTone(880, 'sine', 2, 0.2);
        // FIX: Safe window access
        const win = (globalThis as any).window;
        if (win) spawnExplosion(win.innerWidth/2, win.innerHeight/2, '#ffffff', 100);
        setTimeout(() => setStage(2), 1500);
      }
    };

    const progress = Math.min(100, (cleared / target) * 100);

    return (
      <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden"
           onTouchMove={handleMove} onMouseMove={handleMove}>
        <h2 className="text-2xl font-serif text-gray-400 mb-12 tracking-[0.3em] z-20">I. THE CLEARING</h2>
        <div className="relative w-[80vw] h-[80vw] max-w-[400px] max-h-[400px] flex items-center justify-center">
          <div 
            className="absolute inset-0 rounded-full z-10 transition-all duration-300"
            style={{ 
              opacity: 1 - (progress / 100),
              transform: `scale(${1 + (100-progress)/100})`,
              background: `radial-gradient(circle, rgba(0,0,0,0) 20%, rgba(0,0,0,0.9) 100%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`
            }} 
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`transition-all duration-1000 ${progress >= 100 ? 'opacity-100 scale-100' : 'opacity-20 scale-50'}`}>
                <div className="w-48 h-48 rounded-full bg-white blur-[50px] animate-pulse"></div>
                <Sun size={120} className="text-yellow-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_20s_linear_infinite]" />
            </div>
          </div>
          <div className="absolute inset-0 border border-white/10 rounded-full scale-150 animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute inset-0 border border-white/5 rounded-full scale-125 animate-[spin_40s_linear_infinite_reverse]"></div>
        </div>
        <p className="mt-16 text-gray-500 text-xs font-mono tracking-widest animate-pulse z-20">
          {progress < 100 ? "SCRUB THE ETHER UNTIL IT SHINES" : "THE VOID IS CLEANSED"}
        </p>
      </div>
    );
  };

  // STAGE 3: THE CIRCLE
  const CircleStage = () => {
    const [rotation, setRotation] = useState(0);
    const [laps, setLaps] = useState(0);
    const [targetLaps] = useState(() => getMagickalNumber(2, 4));
    const lastAngle = useRef(0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePan = (e: any) => {
        e.preventDefault();
        // FIX: Safe window access via globalThis
        const win = (globalThis as any).window;
        if (!win) return;

        const cx = win.innerWidth / 2;
        const cy = win.innerHeight / 2;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
        
        if (lastAngle.current > 150 && angle < -150) {
             const newLaps = laps + 1;
             setLaps(newLaps);
             spawnExplosion(clientX, clientY, '#a855f7', 20);
             playTone(220 * (newLaps + 1), 'sine', 0.5, 0.2);
        }
        lastAngle.current = angle;
        setRotation(angle);

        if (laps >= targetLaps) {
            playTone(523.25, 'sawtooth', 2, 0.3);
            setTimeout(() => setStage(3), 1000);
        }
    };

    return (
      <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden"
        onTouchMove={handlePan} onMouseMove={(e) => e.buttons === 1 && handlePan(e)}>
        <h2 className="text-2xl font-serif text-gray-300 mb-8 tracking-widest z-20">II. THE BINDING</h2>
        <div className="relative w-72 h-72 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(168,85,247,0.5)_360deg)] blur-xl opacity-50 animate-[spin_4s_linear_infinite]" 
                 style={{ animationDuration: `${4 - laps}s` }} />
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/30" 
                 style={{ transform: `rotate(${rotation}deg)` }}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-purple-500 rounded-full shadow-[0_0_20px_#a855f7] cursor-grab active:cursor-grabbing">
                    <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                </div>
            </div>
            <div className="text-4xl font-serif text-purple-200 mix-blend-screen">
                {laps} / {targetLaps}
            </div>
        </div>
        <p className="mt-12 text-gray-500 text-xs font-mono z-20">
            {laps < targetLaps ? "SPIN THE WHEEL CLOCKWISE" : "THE VORTEX IS OPEN"}
        </p>
      </div>
    );
  };

  // STAGE 4: INVOCATION
  const InvocationStage = () => {
    const [activeElements, setActiveElements] = useState<string[]>([]);
    const [dragging, setDragging] = useState<string | null>(null);
    const portalRef = useRef(null);

    const positions = useRef([
      { id: 'air', icon: Wind, color: '#fef08a', label: 'RAPHAEL', x: 50, y: 10 }, 
      { id: 'fire', icon: Flame, color: '#f87171', label: 'MICHAEL', x: 85, y: 50 },
      { id: 'water', icon: Droplets, color: '#60a5fa', label: 'GABRIEL', x: 50, y: 90 },
      { id: 'earth', icon: Mountain, color: '#4ade80', label: 'URIEL', x: 15, y: 50 },
    ]).current;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDragStart = (e: any, id: string) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(id);
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDragEnd = (e: any, el: any) => {
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) { /**/ }
        setDragging(null);
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        
        // FIX: Safe window access via globalThis
        const win = (globalThis as any).window;
        if (!win) return;

        const centerX = win.innerWidth / 2;
        const centerY = win.innerHeight / 2;
        const dist = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));

        if (dist < 120) { 
            if (!activeElements.includes(el.id)) {
                setActiveElements(prev => {
                    const next = [...prev, el.id];
                    if (next.length === 4) setTimeout(() => setStage(4), 2000);
                    return next;
                });
                spawnExplosion(centerX, centerY, el.color, 60);
                playTone(300 + (activeElements.length * 150), 'square', 1, 0.1);
            }
        }
    };

    return (
      <div className="relative h-full w-full overflow-hidden touch-none">
        <div className="absolute top-8 w-full text-center">
            <h2 className="text-2xl font-serif text-gray-300 tracking-widest">III. THE OFFERING</h2>
            <p className="text-xs text-gray-600 mt-2 font-mono">DRAG THE SIGILS INTO THE VORTEX</p>
        </div>
        <div ref={portalRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full flex items-center justify-center">
             <div className="absolute inset-0 bg-black border-4 border-purple-900 rounded-full shadow-[0_0_50px_#581c87] animate-pulse"></div>
             <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-[spin_3s_linear_infinite]"></div>
        </div>
        {positions.map((el) => {
            if (activeElements.includes(el.id)) return null;
            const Icon = el.icon;
            return (
                <div 
                    key={el.id}
                    className="absolute p-4 cursor-grab active:cursor-grabbing active:scale-125 transition-transform touch-none"
                    style={{ left: `${el.x}%`, top: `${el.y}%`, transform: 'translate(-50%, -50%)' }}
                    onPointerDown={(e) => handleDragStart(e, el.id)}
                    onPointerUp={(e) => handleDragEnd(e, el)}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onPointerMove={(e: any) => {
                        if (dragging === el.id) {
                            e.currentTarget.style.left = `${e.clientX}px`;
                            e.currentTarget.style.top = `${e.clientY}px`;
                            e.currentTarget.style.position = 'fixed'; 
                        }
                    }}
                >
                    <div className={`p-4 rounded-full bg-gray-900 border border-gray-700 shadow-[0_0_15px_${el.color}] pointer-events-none`}>
                        <Icon size={32} style={{ color: el.color }} />
                    </div>
                </div>
            );
        })}
      </div>
    );
  };

  // STAGE 5: INTENTION
  const IntentionStage = () => {
    const [isEnhancing, setIsEnhancing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (intention.length > 0) {
        playTone(440, 'sine', 1);
        setStage(5);
      }
    };

    // THE FIX: Use the real backend function for Ensorcelling
    const handleEnsorcell = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!intention || isEnhancing) return;
      setIsEnhancing(true);
      playTone(880, 'sine', 0.5, 0.05);
      
      try {
          const enhancedText = await generateElectricEnsorcellment(intention);
          if (enhancedText) {
            setIntention(enhancedText);
            // FIX: Safe window access via globalThis
            const win = (globalThis as any).window;
            if (win) spawnExplosion(win.innerWidth/2, win.innerHeight/2, '#d8b4fe', 30);
            playTone(523.25, 'sine', 1, 0.2);
          }
      } catch (error) {
          console.error(error);
      }
      
      setIsEnhancing(false);
    };

    const sigilize = (text: string) => {
        if(!text) return "";
        const vowels = ['a','e','i','o','u', ' '];
        const unique = [...new Set(text.toLowerCase().split(''))];
        return unique.filter(c => !vowels.includes(c)).join('').toUpperCase();
    }

    return (
      <div className="flex flex-col items-center justify-center h-full px-6 z-20 relative">
        <h2 className="text-2xl font-serif text-gray-300 mb-8 tracking-widest">IV. THE WORD</h2>
        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col items-center space-y-8">
          <div className="w-full relative group">
             <input 
                type="text" 
                value={intention}
                // FIX: Cast target to 'any' to bypass input type checking
                onChange={(e) => setIntention((e.target as any).value)}
                placeholder="I WILL..."
                className="w-full bg-transparent border-b border-purple-900/50 text-center text-xl p-4 text-purple-100 focus:outline-none focus:border-purple-500 font-serif tracking-wide uppercase placeholder:text-gray-800 transition-all focus:bg-purple-900/10"
                autoFocus
             />
             <button
                type="button"
                onClick={handleEnsorcell}
                disabled={!intention || isEnhancing || mode === 'standard'}
                className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${mode === 'standard' ? 'text-gray-600 cursor-not-allowed' : 'text-purple-600 hover:text-purple-300'}`}
                title={mode === 'standard' ? "Only available in High Ritual" : "Enhance with AI"}
             >
                <Sparkles size={20} className={isEnhancing ? "animate-spin" : ""} />
             </button>
          </div>
          <div className="h-32 flex items-center justify-center">
             {intention && (
                 <div className="text-5xl font-serif tracking-[0.5em] opacity-80 text-purple-300 blur-[0.5px] animate-pulse text-center break-all shadow-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                     {sigilize(intention)}
                 </div>
             )}
          </div>
          <button 
            type="submit"
            disabled={!intention}
            className="px-8 py-3 border border-gray-800 text-gray-500 rounded hover:border-purple-500 hover:text-purple-300 disabled:opacity-30 transition-all uppercase tracking-[0.3em] text-xs"
          >
            Solidify
          </button>
        </form>
      </div>
    );
  };

  // STAGE 6: CONSECRATION
  const ConsecrationStage = () => {
    const [charge, setCharge] = useState(0);
    const [target] = useState(() => getMagickalNumber(100, 200));
    // FIX: Ref type is 'any' to allow bypassing strict type checks for styles
    const containerRef = useRef<any>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleCharge = (e: any) => {
      const boost = Math.random() * 3 + 5; 
      const newCharge = Math.min(target, charge + boost);
      setCharge(newCharge);
      const freq = 100 + ((newCharge/target) * 800);
      playTone(freq, 'triangle', 0.1, 0.1);
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      spawnExplosion(clientX, clientY, '#a855f7', 5);

      // FIX: Access style property on the any-typed ref
      if (containerRef.current) {
        const intensity = (newCharge / target) * 20;
        containerRef.current.style.transform = `translate(${Math.random()*intensity - intensity/2}px, ${Math.random()*intensity - intensity/2}px)`;
      }

      if (newCharge >= target) {
        playTone(1000, 'sawtooth', 4, 0.5);
        // FIX: Safe window access via globalThis
        const win = (globalThis as any).window;
        if (win) spawnExplosion(win.innerWidth/2, win.innerHeight/2, '#ffffff', 200);
        setTimeout(() => setStage(6), 1000);
      }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCharge(c => Math.max(0, c - 1)); 
        }, 60); 
        return () => clearInterval(interval);
    }, []);

    const sigilText = intention.toUpperCase().replace(/[AEIOU ]/g, '').split('').filter((v,i,a) => a.indexOf(v)===i).join('');

    return (
      <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden select-none" ref={containerRef}>
        <h2 className="text-2xl font-serif text-gray-300 mb-4 tracking-widest z-20">V. THE CHARGE</h2>
        <div 
            className="relative w-80 h-80 flex items-center justify-center cursor-pointer active:scale-95 transition-transform duration-75 touch-manipulation"
            onPointerDown={handleCharge}
        >
            <div className="absolute inset-0 rounded-full transition-all duration-100 bg-purple-900/20"
                 style={{ 
                     boxShadow: `0 0 ${charge/2}px rgba(168, 85, 247, ${charge/target})`,
                     opacity: 0.2 + (charge/target)
                 }}
            />
            <div className="absolute inset-0 border-2 border-dashed border-purple-500/20 rounded-full animate-[spin_2s_linear_infinite]" 
                 style={{ animationDuration: `${2 - (charge/target)}s`}}/>
            <div className="text-7xl font-serif text-transparent bg-clip-text bg-linear-to-b from-purple-100 to-purple-900 tracking-widest z-10 text-center break-all max-w-[250px] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                 style={{ filter: `blur(${Math.max(0, 2 - (charge/target)*2)}px)` }}>
                {sigilText}
            </div>
        </div>
        <p className="mt-16 text-red-300/70 text-xs font-mono animate-pulse tracking-widest z-20">
            TAP RHYTHMICALLY TO FEED THE FLAME
        </p>
        <div className="w-64 h-2 bg-gray-900 mt-4 rounded-full overflow-hidden border border-gray-800">
            <div className="h-full bg-linear-to-r from-purple-900 to-purple-400 transition-all duration-75 ease-linear" 
                 style={{ width: `${(charge/target)*100}%` }}></div>
        </div>
      </div>
    );
  };

  // STAGE 7: RELEASE
  const ReleaseStage = () => {
    const [released, setReleased] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const triggerRelease = (e: any) => {
        if(released) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setReleased(true);
        spawnExplosion(clientX, clientY, '#ffffff', 100); 
        playTone(100, 'sawtooth', 0.2, 0.5);
        setTimeout(() => playTone(300, 'square', 0.2, 0.5), 100);
        setTimeout(() => playTone(600, 'sine', 0.2, 0.5), 200);
        setTimeout(() => playTone(1200, 'sine', 3, 0.2), 300);
        setTimeout(() => playDrone(false), 4000);
    };

    if (released) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-white transition-all duration-4000 opacity-0 pointer-events-none">
                <div className="absolute inset-0 bg-[conic-gradient(at_center,var(--tw-gradient-stops))] from-purple-900 via-black to-purple-900 animate-spin speed-fast opacity-50"></div>
            </div>
        );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full w-full cursor-pointer" onClick={triggerRelease}>
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="w-[200vw] h-[200vw] bg-[conic-gradient(from_0deg,transparent,rgba(168,85,247,0.1))] animate-[spin_10s_linear_infinite]"></div>
        </div>
        <h2 className="text-2xl font-serif text-gray-300 mb-32 tracking-[0.5em] z-20">VI. THE APEX</h2>
        <div className="relative group">
            <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative z-10 bg-black border border-purple-500/50 p-8 rounded-full shadow-[0_0_50px_rgba(168,85,247,0.4)] hover:scale-110 transition-transform duration-300">
                <ArrowUp size={48} className="text-purple-200 animate-bounce" />
            </div>
        </div>
        <div className="mt-24 text-center space-y-4 z-20 px-4">
             <p className="text-xl font-serif text-white tracking-[0.2em] uppercase border-b border-purple-500/30 pb-4">{intention}</p>
             <p className="text-[10px] text-gray-500 font-mono">TOUCH THE SIGIL TO SEVER THE ANCHOR</p>
        </div>
      </div>
    );
  };

  // STAGE 8: FINAL
  const FinalStage = () => {
    const [oracleMessage, setOracleMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOracle = async () => {
             if (mode === 'standard') {
                  setOracleMessage("The void accepts your command.");
                  setLoading(false);
                  return;
             }
            // THE FIX: Use the real backend function for the Oracle message
            const response = await generateElectricOracle(intention);
            setOracleMessage(response);
            setLoading(false);
        };
        fetchOracle();
    }, [intention]);

    const handleSave = async () => {
        if (!session?.user?.id || isSaved || isSaving) return;

        // Check Economy
        // Force 2 Faestones cost explicitly
        const paid = await spellSystem.saveEconomy.spendAether(session.user.id, 2);
        if (!paid) return;

        setIsSaving(true);
        try {
            await saveSpell(session.user.id, {
                name: `Void Gate: ${intention.substring(0, 20)}`,
                intention: intention,
                incantation: oracleMessage, // Using the oracle message as the 'incantation' result
                tradition: 'CHAOS', // Electric magick aligns closely with Chaos magick concepts
                ritual_data: { type: 'electric_void_gate', mode, oracleMessage }
            }, true); // Bypass limit logic since paid
            setIsSaved(true);
            playTone(880, 'sine', 1, 0.5);
            const win = (globalThis as any).window;
            if (win) spawnExplosion(win.innerWidth/2, win.innerHeight/2, '#a855f7', 80);
        } catch (e: any) {
            spellSystem.handleSaveError(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in px-8 text-center relative z-20">
        <Moon className="text-purple-300/50 mb-8 animate-pulse" size={64} />
        <p className="text-2xl font-serif text-gray-200 mb-4 tracking-widest">It is done.</p>
        <div className="max-w-md my-8 min-h-[100px] flex items-center justify-center w-full">
            {loading ? (
                <div className="flex flex-col items-center gap-4 text-purple-400/50">
                    <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <span className="text-xs tracking-[0.3em] uppercase">Consulting the Aether...</span>
                </div>
            ) : (
                <div className="relative p-8 border border-purple-500/20 bg-black/50 backdrop-blur-md w-full">
                    <p className="text-xl font-serif text-purple-100 italic leading-relaxed animate-fade-in drop-shadow-lg">
                        &quot;{oracleMessage}&quot;
                    </p>
                </div>
            )}
        </div>
        <div className="flex flex-col gap-4 mt-8 w-full max-w-sm">
             <button 
                onClick={handleSave}
                disabled={isSaved || isSaving}
                className={`py-3 border ${isSaved ? 'border-green-500/50 text-green-400' : 'border-purple-500/30 text-purple-300'} bg-gray-900/50 backdrop-blur-sm rounded uppercase tracking-widest text-xs hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2`}
             >
                {isSaved ? "Saved to Grimoire" : isSaving ? "Saving..." : "Save to Grimoire"}
                {isSaved && <span className="text-green-400">✓</span>}
             </button>
             
             <button 
                onClick={onExit}
                className="text-[10px] text-gray-600 hover:text-white uppercase tracking-[0.4em] transition-colors border-b border-transparent hover:border-white pb-1"
             >
                Close The Circle
             </button>
        </div>
    </div>
    );
  };

  const renderStage = () => {
    const handleReleaseComplete = () => {
        setTimeout(() => setStage(7), 4000);
    };
    switch(stage) {
      case 0: return <StartScreen />;
      case 1: return <BanishingStage />;
      case 2: return <CircleStage />;
      case 3: return <InvocationStage />;
      case 4: return <IntentionStage />;
      case 5: return <ConsecrationStage />;
      case 6: return <div onClick={handleReleaseComplete} className="h-full w-full"><ReleaseStage /></div>;
      case 7: return <FinalStage />;
      default: return <StartScreen />;
    }
  };

  const styles = `
    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 1s ease-out forwards; }
    .speed-fast { animation-duration: 0.5s; }
  `;

  return (
    <div className="fixed inset-0 bg-black text-gray-100 overflow-hidden select-none font-sans touch-none z-50">
        <button 
          onClick={onExit} 
          className="absolute top-6 right-6 z-50 p-2 text-gray-600 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" style={{ mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.1)_0%,rgba(0,0,0,1)_90%)] pointer-events-none z-0" />
        <div className="absolute inset-0 opacity-20 pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />
        <div className="relative z-20 h-full w-full flex flex-col">
            <div className="h-16 flex items-center justify-between px-6 opacity-30">
                <div className="flex gap-2">
                    {[1,2,3,4,5,6].map(s => (
                        <div key={s} className={`h-0.5 w-4 rounded-full transition-colors duration-700 ${stage >= s ? 'bg-purple-400 shadow-[0_0_10px_#a855f7]' : 'bg-gray-900'}`} />
                    ))}
                </div>
            </div>
            <div className="flex-1 relative">{renderStage()}</div>
        </div>
        <style>{styles}</style>
    </div>
  );
};

// ==========================================
// 3. NEW SPELLS (Pattern Logic)
// ==========================================

const GenericElectricSpell = ({ 
    title, 
    cost, 
    onExit, 
    spellSystem, 
    session,
    stages,
    color,
    icon: Icon
}: any) => {
    const [started, setStarted] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [intention, setIntention] = useState('');
    const [oracleMessage, setOracleMessage] = useState('');
    
    // Audio/Visual Hooks
    const { initAudio, playTone, playDrone } = useAudioEngine();
    const { spawnExplosion } = useParticleSystem();

    const handleStart = async (e: any) => {
        if (!session?.user?.id) return;
        
        // CHECK 3 FAESTONE COST
        const paid = await spellSystem.genEconomy.spendAether(session.user.id, cost);
        if (!paid) return;

        // Visuals
        const win = (globalThis as any).window;
        if (win) spawnExplosion(win.innerWidth/2, win.innerHeight/2, color, 50);
        initAudio();
        playTone(110, 'sawtooth', 2, 0.2);
        setStarted(true);
    };

    const handleComplete = async () => {
        setCompleted(true);
        // Generate Oracle
        const response = await generateElectricOracle(intention || "The machine speaks.");
        setOracleMessage(response);
    };

    const handleSave = async () => {
        if (!session?.user?.id || isSaved || isSaving) return;
        
        // CHECK 2 FAESTONE SAVE COST
        // Explicitly passing 2 to override any potential hook race conditions
        const paid = await spellSystem.saveEconomy.spendAether(session.user.id, 2); 

        if (!paid) return;

        setIsSaving(true);
        try {
             await saveSpell(session.user.id, {
                name: `${title}: ${intention.substring(0, 20)}`,
                intention: intention || "Digital Manifestation",
                incantation: oracleMessage,
                tradition: 'CHAOS',
                ritual_data: { type: title.toLowerCase().replace(/ /g, '_'), oracleMessage }
            }, true);
            setIsSaved(true);
            playTone(880, 'sine', 1, 0.5);
        } catch (e: any) {
            spellSystem.handleSaveError(e);
        } finally {
            setIsSaving(false);
        }
    };

    if (!started) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in relative z-20">
                <Icon size={80} className="text-purple-300 animate-pulse relative z-10" style={{ color }} />
                <h1 className="text-4xl md:text-5xl font-serif text-center text-transparent bg-clip-text bg-linear-to-r from-gray-200 via-white to-gray-200 tracking-widest uppercase">
                    {title}
                </h1>
                <p className="text-center text-gray-400 max-w-md px-6 font-mono text-xs tracking-widest">
                    COST: {cost} FAESTONES
                </p>
                <button 
                    onClick={handleStart}
                    className="px-12 py-4 border border-purple-500/50 bg-purple-900/20 hover:bg-purple-500/30 transition-all uppercase tracking-[0.3em] text-sm"
                    style={{ borderColor: color, color: 'white' }}
                >
                    INITIALIZE PROTOCOL
                </button>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in px-8 text-center relative z-20">
                 <div className="mb-8 p-6 border border-white/10 bg-black/40 backdrop-blur-sm max-w-lg">
                    <p className="font-serif text-lg text-purple-100 italic">
                        "{oracleMessage || "Processing complete. The ether patterns have been rewritten."}"
                    </p>
                 </div>
                 <div className="flex flex-col gap-4 w-full max-w-xs">
                     <button 
                        onClick={handleSave}
                        disabled={isSaved || isSaving}
                        className={`py-3 border ${isSaved ? 'border-green-500/50 text-green-400' : 'border-purple-500/30 text-purple-300'} bg-gray-900/50 backdrop-blur-sm rounded uppercase tracking-widest text-xs hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2`}
                     >
                        {isSaved ? "SAVED (2 FS)" : isSaving ? "SAVING..." : "SAVE RESULT (2 FS)"}
                     </button>
                     <button onClick={onExit} className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest mt-4">TerminatE Session</button>
                 </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full w-full relative z-20">
             <div className="absolute top-8 text-center">
                 <h2 className="text-2xl font-serif tracking-widest text-gray-300">{title.toUpperCase()}</h2>
                 <p className="text-[10px] font-mono text-gray-500 mt-2">SEQUENCE ACTIVE</p>
             </div>
             
             {/* Simplified Interaction Layer for Generic Spells */}
             <div className="w-full max-w-md space-y-8 px-8 text-center">
                 <input 
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="ENTER PARAMETERS..."
                    className="w-full bg-transparent border-b border-gray-700 text-center text-xl p-2 text-white font-mono focus:border-purple-500 focus:outline-none uppercase"
                 />
                 <div className="h-64 flex items-center justify-center border border-white/5 bg-black/30 rounded-lg relative overflow-hidden group cursor-pointer"
                      onClick={() => {
                          spawnExplosion(window.innerWidth/2, window.innerHeight/2, color, 20);
                          playTone(Math.random()*500 + 200, 'square', 0.1);
                      }}
                 >
                     <Icon size={120} className="text-gray-800 group-hover:text-white/20 transition-colors duration-500" />
                     <div className="absolute inset-0 flex items-center justify-center">
                         <button 
                            onClick={handleComplete}
                            disabled={!intention}
                            className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-30 backdrop-blur-md uppercase tracking-widest text-xs transition-all"
                         >
                            EXECUTE COMPILE
                         </button>
                     </div>
                 </div>
             </div>
        </div>
    );
};

// ==========================================
// 4. THE ELECTRIC MAGICK MENU
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpellCard = ({ title, desc, icon: Icon, onClick, disabled }: { title: string, desc: string, icon: any, onClick?: () => void, disabled?: boolean }) => (
  <div 
    onClick={!disabled ? onClick : undefined}
    className={`relative group p-6 border border-purple-900/50 bg-gray-950/50 backdrop-blur-sm rounded-lg transition-all duration-300 overflow-hidden ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500 cursor-pointer hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]'}`}
  >
    <div className={`absolute inset-0 bg-linear-to-br from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
      <div className={`p-3 rounded-full bg-gray-900 border border-gray-800 group-hover:border-purple-500/50 transition-colors duration-300`}>
        <Icon size={32} className={disabled ? "text-gray-600" : "text-purple-400 group-hover:text-purple-200"} />
      </div>
      <div>
        <h3 className="text-lg font-serif tracking-widest text-gray-200 group-hover:text-white uppercase">{title}</h3>
        <p className="text-xs text-gray-500 mt-2 font-light">{desc}</p>
      </div>
      {disabled && <span className="text-[10px] uppercase tracking-widest text-gray-700 border border-gray-800 px-2 py-1 rounded">Locked</span>}
    </div>
  </div>
);

export default function ElectricMagickPage({ session, isSubscribed, onBack }: { session: Session, isSubscribed: boolean, onBack?: () => void }) {
  const [activeSpell, setActiveSpell] = useState<string | null>(null);

  const spellSystem = useSpellSystem({
      serviceSlugGen: 'ai_electric_magick', // Adjust slug if needed
      serviceSlugSave: 'save_spell_electric',
      baseRedirectPath: '/spell-room/electric-magick-spells-app'
  });
  
  const handleGoToStore = () => {
      spellSystem.goToStoreForSlots(null, 'electric_spell_save_temp'); // Temp key not really used here yet but required by sig
  };

  // If a spell is active, render that component instead of the menu
  
  const renderActiveSpell = () => {
      const commonProps = { onExit: () => setActiveSpell(null), spellSystem, session };
      
      switch(activeSpell) {
          case 'void-gate': 
              return <VoidGateSpell {...commonProps} />;
          case 'data-scrying':
              return <GenericElectricSpell {...commonProps} title="Data Scrying" cost={3} color="#3b82f6" icon={Eye} />;
          case 'neural-link':
              return <GenericElectricSpell {...commonProps} title="Neural Link" cost={3} color="#ec4899" icon={Activity} />;
          case 'light-prism':
              return <GenericElectricSpell {...commonProps} title="Light Prism" cost={3} color="#f59e0b" icon={Triangle} />;
          case 'reality-patch':
              return <GenericElectricSpell {...commonProps} title="Reality Patch" cost={3} color="#10b981" icon={Grid} />;
          case 'zero-point-net':
              return <GenericElectricSpell {...commonProps} title="Zero Point Net" cost={3} color="#6366f1" icon={Globe} />;
          default:
              return null;
      }
  };

  if (activeSpell) {
    return (
        <>
            {renderActiveSpell()}
            {/* Overlays must still be rendered at top level if component takes full screen */}
            {spellSystem.activeError && (
                <BlockageErrorOverlay 
                    error={spellSystem.activeError}
                    onDismiss={spellSystem.clearErrors}
                    redirectPath="/spell-room/electric-magick-spells-app"
                />
            )}
             <SlotPurchaseModal 
                isOpen={spellSystem.modalState.isOpen} 
                onClose={spellSystem.modalState.close} 
                onPurchase={() => spellSystem.buySlots(session?.user?.id)} 
                isProcessing={spellSystem.modalState.isLoading}
                showAetherWarning={spellSystem.modalState.showWarning}
                showSuccess={spellSystem.modalState.showSuccess}
                onGoToStore={handleGoToStore}
            />
        </>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-purple-900 selection:text-white relative overflow-hidden">
      {/* Background Noise & Ambient Light */}
      <div className="fixed inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="flex items-center justify-center gap-2 text-purple-500 mb-4">
             <Zap size={20} className="animate-pulse" />
             <span className="text-xs uppercase tracking-[0.5em]">Digital Sorcery</span>
             <Zap size={20} className="animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-linear-to-b from-white to-gray-600 uppercase tracking-widest drop-shadow-2xl">
            Electric Magick
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto font-light tracking-wide text-sm">
            Rituals forged in silicon. Sigils burned into pixels. 
            Choose a current to ride.
          </p>
        </div>

        {/* Spell Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Spell 1: The Void Gate */}
          <SpellCard 
            title="The Void Gate"
            desc="A chaos magick ritual involving gestures, numeric alignments, and sigil crafting to open a digital wormhole."
            icon={Orbit}
            onClick={() => setActiveSpell('void-gate')}
          />

          <SpellCard 
            title="Data Scrying"
            desc="Gaze into the static of the machine god to divine future timelines. (3 FS)"
            icon={Eye}
            onClick={() => setActiveSpell('data-scrying')}
          />

          <SpellCard 
            title="Neural Link"
            desc="Bind two minds across the network through synchronized frequency modulation. (3 FS)"
            icon={Activity}
            onClick={() => setActiveSpell('neural-link')}
          />

          <SpellCard 
            title="Light Prism"
            desc="Refract your intention through digital spectrums to manifest color magick. (3 FS)"
            icon={Triangle}
            onClick={() => setActiveSpell('light-prism')}
          />
           
           <SpellCard 
            title="Reality Patch"
            desc="Inject a code correction into the fabric of your local probability field. (3 FS)"
            icon={Grid}
            onClick={() => setActiveSpell('reality-patch')}
          />

           <SpellCard 
            title="Zero Point Net"
            desc="Cast a digital net into the quantum foam to capture resonance. (3 FS)"
            icon={Globe}
            onClick={() => setActiveSpell('zero-point-net')}
          />
          
        </div>

        <div className="mt-20 text-center">
            <p className="text-[10px] text-gray-700 font-mono">SYSTEM STATUS: ONLINE // AETHER: STABLE</p>
        </div>
      </div>
    </div>
  );
}