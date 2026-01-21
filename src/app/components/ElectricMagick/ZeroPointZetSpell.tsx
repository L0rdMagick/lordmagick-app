// --- START OF FILE src/app/components/ElectricMagick/ZeroPointZetSpell.tsx ---
/// <reference lib="dom" />
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, 
  ShieldAlert, 
  Terminal, 
  Activity,
  X,
  Lock,
  Zap,
  Save,
  Cpu,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAudioEngine, useParticleSystem } from './hooks';
import { saveSpell } from '@/lib/services/geminiService';
import { useSpellPersistence } from '@/hooks/useSpellPersistence';
import type { Session } from '@/lib/types';

// --- CONSTANTS ---
const COST_TO_ENTER = 10;
const COST_TO_SAVE = 5;

// --- GLITCH TEXT COMPONENT ---
const GlitchText = ({ text, active = false }: { text: string, active?: boolean }) => {
  if (!active) return <span className="font-mono">{text}</span>;
  return (
    <div className="relative inline-block">
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 translate-x-0.5 text-red-500 opacity-70 animate-pulse">{text}</span>
      <span className="absolute top-0 left-0 -z-10 -translate-x-0.5 text-cyan-500 opacity-70 animate-pulse delay-75">{text}</span>
    </div>
  );
};

// --- STAGE 0: INTRO & PAYWALL ---
const IntroStage = ({ onComplete, playTone, initAudio, session, spellSystem }: { onComplete: () => void, playTone: any, initAudio: any, session: Session | undefined, spellSystem: any }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUnlock = async () => {
        setLoading(true);
        setError('');
        initAudio(); // Now defined
        
        try {
            playTone(200, 'square', 0.1);

            // 1. Check for Session (Paid Mode)
            if (session?.user?.id) {
                const paid = await spellSystem.genEconomy.spendAether(session.user.id, 3);
                
                if (!paid) {
                    playTone(100, 'sawtooth', 0.5);
                    // spellSystem should handle the overlay, but we can also show a local error if needed.
                    // For now, adhere to returning early.
                    setLoading(false);
                    return; 
                }
            } else {
                // 2. No Session (Test/Dev Mode)
                console.log("Dev Mode: Bypassing Credit Check");
            }
            
            // 3. Success - Proceed
            playTone(600, 'sawtooth', 0.2);
            onComplete();

        } catch (e) {
            console.error("Initialization Error:", e);
            setError('CONNECTION TO AETHER FAILED.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-6 text-center select-none overflow-y-auto animate-in fade-in duration-700">
            <div className="max-w-md w-full space-y-8 py-10">
                
                {/* Header */}
                <div className="space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse" />
                        <Cpu className="w-16 h-16 text-cyan-400 relative z-10" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
                        <GlitchText text="ZERO POINT ZET" active={true} />
                    </h1>
                    <div className="flex justify-center items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <p className="text-red-500 font-mono text-[10px] tracking-[0.3em]">REALITY INJECTION PROTOCOL</p>
                    </div>
                </div>

                {/* Manual / Instructions */}
                <div className="bg-black/80 border border-gray-800 p-6 rounded text-left space-y-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-cyan-900 to-transparent" />
                    
                    <p className="text-gray-300 font-mono text-xs leading-relaxed">
                        You are accessing the <span className="text-cyan-400">Zero Point Field</span>—the static gap between moments. This tool allows you to inject a specific intention directly into the kernel of your local reality matrix.
                    </p>
                    
                    <div className="space-y-3 pt-2">
                        <h3 className="text-white font-bold font-mono text-xs uppercase border-b border-gray-700 pb-2 flex items-center gap-2">
                            <Info size={12} className="text-cyan-500" />
                            Operational Guide
                        </h3>
                        <ul className="text-gray-400 font-mono text-[10px] space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="text-cyan-500 font-bold">01.</span> 
                                <span><strong className="text-gray-300">Bio-Auth:</strong> Sync your physical energy signature via touch to bridge the digital gap.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-cyan-500 font-bold">02.</span> 
                                <span><strong className="text-gray-300">Injection:</strong> Define your parameter (Intention) clearly. Ambiguity causes signal decay.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-cyan-500 font-bold">03.</span> 
                                <span><strong className="text-gray-300">Stabilization:</strong> Manually lock the frequency. The system will resist.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-cyan-500 font-bold">04.</span> 
                                <span><strong className="text-gray-300">Entropy:</strong> Break the resistance of the old timeline using force.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    {error && (
                        <div className="flex items-center justify-center gap-2 text-red-500 font-mono text-xs animate-pulse bg-red-900/10 p-2 border border-red-900/50 rounded">
                            <AlertTriangle size={14} />
                            {error}
                        </div>
                    )}
                    
                    <button 
                        onClick={handleUnlock}
                        disabled={loading}
                        className="w-full py-5 bg-cyan-950/30 border border-cyan-500 text-cyan-400 font-mono text-xs tracking-[0.2em] hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                    >
                        {loading ? (
                            <span className="animate-pulse">ESTABLISHING UPLINK...</span>
                        ) : (
                            <>
                                <Lock size={14} className="group-hover:hidden text-cyan-600" />
                                <Zap size={14} className="hidden group-hover:block" />
                                <span className="font-bold">INITIALIZE {session?.user ? `(-3 AETHER)` : '(TEST MODE)'}</span>
                            </>
                        )}
                    </button>
                    
                    <p className="text-gray-600 text-[9px] font-mono tracking-widest uppercase">
                        WARNING: Reality edits are permanent.
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- STAGE 1: BIO-AUTHORIZATION (The Handshake) ---
const BioAuthStage = ({ onComplete, playTone }: { onComplete: () => void, playTone: any }) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      playTone(100 + (scanProgress * 5), 'sawtooth', 0.1, 0.1);
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            onComplete();
            return 100;
          }
          return prev + 1.5; 
        });
      }, 50);
    } else {
      setScanProgress(0);
    }
    return () => clearInterval(interval);
  }, [isScanning, scanProgress, onComplete, playTone]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 select-none animate-in fade-in zoom-in duration-500">
      <div className="mb-12 text-center space-y-2">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
        <h2 className="text-red-500 font-mono text-xs tracking-[0.2em]">SECURITY PROTOCOL: ACTIVE</h2>
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase">
          <GlitchText text="ZER0 P0INT ZET v1.0" active={true} />
        </h1>
      </div>

      <div 
        className="relative w-64 h-64 border border-gray-800 bg-black/50 rounded-lg overflow-hidden cursor-pointer active:border-red-500 transition-colors duration-300 group"
        onMouseDown={() => setIsScanning(true)}
        onMouseUp={() => setIsScanning(false)}
        onMouseLeave={() => setIsScanning(false)}
        onTouchStart={(e) => { e.preventDefault(); setIsScanning(true); }}
        onTouchEnd={() => setIsScanning(false)}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* Fingerprint Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Fingerprint 
            size={100} 
            className={`transition-all duration-200 ${isScanning ? 'text-red-500 scale-110' : 'text-gray-700 scale-100'}`} 
          />
        </div>

        {/* Scanning Beam */}
        {isScanning && (
          <motion.div 
            className="absolute left-0 right-0 h-2 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] z-10"
            initial={{ top: 0 } as any}
            animate={{ top: '100%' } as any}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Progress Overlay */}
        <div className="absolute bottom-0 left-0 h-1 bg-red-600 transition-all duration-75 ease-linear" style={{ width: `${scanProgress}%` }} />
      </div>

      <p className="mt-8 text-gray-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
        {isScanning ? "VERIFYING BIO-SIGNATURE..." : "TOUCH AND HOLD TO AUTHORIZE"}
      </p>
    </div>
  );
};

// --- STAGE 2: CODE INJECTION (The Word) ---
const InjectionStage = ({ onComplete, playTone, setIntention }: { onComplete: () => void, playTone: any, setIntention: (s: string) => void }) => {
  const [input, setInput] = useState("");
  const [hexStream, setHexStream] = useState<string[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHexStream(prev => {
        const next = [Math.random().toString(16).substr(2, 8).toUpperCase(), ...prev];
        if (next.length > 12) next.pop();
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.length > 3) {
      playTone(800, 'square', 0.5);
      setIntention(input);
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-4 relative overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="absolute inset-0 pointer-events-none opacity-10 flex justify-between text-[10px] font-mono text-green-500">
        {Array.from({length: 6}).map((_, i) => (
          <div key={i} className="flex flex-col">
            {hexStream.map((h, j) => <span key={j}>{h}</span>)}
          </div>
        ))}
      </div>

      <div className="z-10 w-full max-w-md bg-black/80 border border-green-900 p-6 rounded-sm backdrop-blur-md shadow-[0_0_30px_rgba(22,163,74,0.1)]">
        <div className="flex items-center gap-2 mb-6 border-b border-green-900/50 pb-2">
          <Terminal size={16} className="text-green-500" />
          <span className="text-green-500 font-mono text-xs">ROOT_ACCESS_GRANTED</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-green-700 font-mono text-[10px] tracking-[0.2em]">DEFINE PARAMETER CHANGE</label>
            <input 
              autoFocus
              type="text" 
              value={input}
              // FIX: Cast currentTarget to any to safely access value
              onChange={(e) => {
                const val = (e.currentTarget as any).value;
                setInput(val);
                playTone(400 + (val.length * 20), 'sine', 0.05);
              }}
              className="w-full bg-transparent border-b-2 border-green-800 text-green-400 font-mono text-xl py-2 focus:outline-none focus:border-green-400 transition-colors placeholder:text-green-900 uppercase"
              placeholder="ENTER COMMAND..."
            />
          </div>
          
          <button 
            type="submit"
            disabled={input.length < 3}
            className="w-full py-4 bg-green-900/20 border border-green-800 text-green-500 font-mono text-xs tracking-[0.3em] hover:bg-green-500 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span className="group-hover:hidden">&gt; INJECT_CODE</span>
            <span className="hidden group-hover:inline font-bold">EXECUTE</span>
          </button>
        </form>
      </div>
    </div>
  );
};

// --- STAGE 3: SIGNAL STABILIZATION (The Focus) ---
const StabilizationStage = ({ onComplete, playTone, modulateFilter }: { onComplete: () => void, playTone: any, modulateFilter: any }) => {
    const [stability, setStability] = useState(50);
    const [target, setTarget] = useState(50);
    const [lockedTime, setLockedTime] = useState(0);
    const [noise, setNoise] = useState(0);
    
    const trackRef = useRef<HTMLDivElement>(null);

    // Generate erratic target movement (The Universe resisting)
    useEffect(() => {
        const interval = setInterval(() => {
            const jitter = (Math.random() - 0.5) * 40; 
            setTarget(prev => Math.min(90, Math.max(10, prev + jitter)));
            setNoise(Math.random() * 10);
        }, 50); 
        return () => clearInterval(interval);
    }, []);

    // Check lock status
    useEffect(() => {
        const dist = Math.abs(stability - target);
        modulateFilter(100 + (100 - dist) * 10); 

        if (dist < 15) {
            setLockedTime(prev => {
                const next = prev + 1.1;
                if (next > 100) onComplete();
                return next;
            });
            if (Math.random() > 0.8) playTone(880, 'sine', 0.1, 0.05);
        } else {
            setLockedTime(prev => Math.max(0, prev - 1)); 
        }
    }, [stability, target, onComplete, playTone, modulateFilter]);

    const handleSlide = (e: any) => {
        if (!trackRef.current) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const rect = (trackRef.current as any).getBoundingClientRect();
        
        let relativeX = clientX - rect.left;
        relativeX = Math.max(0, Math.min(relativeX, rect.width));
        
        const percent = (relativeX / rect.width) * 100;
        setStability(percent);
    };

    return (
        <div 
            className="flex flex-col items-center justify-center h-full w-full bg-black select-none touch-none p-4 animate-in fade-in"
            onTouchMove={handleSlide}
            onMouseMove={(e) => e.buttons === 1 && handleSlide(e)}
            onMouseDown={handleSlide}
        >
            <h2 className="text-cyan-500 font-mono text-xs tracking-[0.3em] mb-12 animate-pulse text-center">
                MANUAL OVERRIDE: STABILIZE SIGNAL
            </h2>

            <div 
                ref={trackRef}
                className="relative w-full max-w-md h-48 border-x border-cyan-900/50 bg-cyan-950/10 cursor-crosshair"
            >
                <div 
                    className="absolute top-0 bottom-0 w-16 bg-cyan-900/30 border-x border-cyan-500/50 transition-all duration-75 ease-linear"
                    style={{ left: `calc(${target}% - 32px)` }}
                >
                    <div className="absolute top-0 left-0 w-full h-full animate-pulse opacity-20 bg-cyan-400"></div>
                </div>

                <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_20px_white] transition-transform duration-0"
                    style={{ left: `${stability}%` }}
                />

                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                    <Activity size={64} className="text-cyan-700" style={{ transform: `scaleY(${1 + noise/5})` }} />
                </div>
                
                <div className="absolute inset-0 pointer-events-none flex justify-between opacity-20">
                    {[0, 25, 50, 75, 100].map(p => (
                        <div key={p} className="h-full w-px bg-cyan-500" />
                    ))}
                </div>
            </div>

            <div className="w-64 h-2 bg-gray-900 mt-8 rounded-full overflow-hidden border border-gray-800">
                <div 
                    className="h-full bg-cyan-400 transition-all duration-75"
                    style={{ width: `${lockedTime}%`, boxShadow: '0 0 10px #22d3ee' }}
                />
            </div>
            <p className="text-cyan-800 font-mono text-[10px] mt-4">
                {lockedTime > 0 ? `LOCKING: ${Math.floor(lockedTime)}%` : "SEARCHING..."}
            </p>
        </div>
    );
};

// --- STAGE 4: ENTROPY BATTLE (The Force) ---
const EntropyStage = ({ onComplete, playTone, spawnExplosion, intention }: { onComplete: () => void, playTone: any, spawnExplosion: any, intention: string }) => {
  const [integrity, setIntegrity] = useState(15); 
  const [decayRate, setDecayRate] = useState(0.6);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIntegrity(prev => {
        const currentDecay = decayRate + (prev / 150); 
        return Math.max(0, prev - currentDecay);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [decayRate]);

  useEffect(() => {
    if (integrity > 85) setGlitchActive(true);
    else setGlitchActive(false);
  }, [integrity]);

  const handleStabilize = (e: any) => {
    e.preventDefault(); 
    
    const boost = 7; 
    setIntegrity(prev => {
      const next = Math.min(100, prev + boost);
      
      const freq = 150 + (next * 6); 
      playTone(freq, 'sawtooth', 0.1, 0.2);
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const win = (globalThis as any).window;
      const winW = win ? win.innerWidth : 1000;
      const winH = win ? win.innerHeight : 1000;

      spawnExplosion(clientX || winW/2, clientY || winH/2, '#a855f7', 5);

      if (next >= 100) {
        onComplete();
        playTone(100, 'square', 2, 0.5); // Boom
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full select-none touch-none overflow-hidden relative animate-in fade-in">
      {/* Chaos Background */}
      <div className={`absolute inset-0 bg-purple-900/10 transition-all duration-100 ${glitchActive ? 'bg-white/10 invert' : ''}`} />
      
      <div className="z-10 text-center space-y-8 w-full max-w-md px-6">
        <div className="space-y-2">
          <h2 className="text-purple-400 font-mono text-xs tracking-widest animate-pulse">REALITY INTEGRITY CRITICAL</h2>
          <div className="font-mono text-white text-sm border border-purple-500/30 p-2 bg-black/50 backdrop-blur truncate">
            TARGET: {intention}
          </div>
        </div>

        {/* The Meter */}
        <div className="relative w-full h-64 bg-black border-2 border-purple-900 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(88,28,135,0.3)]">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-4 px-2 opacity-30 pointer-events-none">
            {[...Array(5)].map((_, i) => <div key={i} className="w-full h-px bg-purple-500" />)}
          </div>

          {/* The Fill */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-purple-600 transition-all duration-75 ease-linear shadow-[0_0_50px_rgba(168,85,247,0.8)]"
            style={{ height: `${integrity}%` }}
          />
          
          {/* The Percentage */}
          <div className="absolute inset-0 flex items-center justify-center mix-blend-difference">
            <span className="text-6xl font-black text-white font-mono">
              {Math.floor(integrity)}%
            </span>
          </div>
        </div>

        {/* The Button */}
        <button
          className="w-full h-24 bg-purple-900/20 border-2 border-purple-500 text-purple-300 font-black text-2xl tracking-[0.2em] hover:bg-purple-500 hover:text-white transition-all active:scale-95 active:bg-white active:text-black shadow-[0_0_30px_rgba(168,85,247,0.2)]"
          onMouseDown={handleStabilize}
          onTouchStart={handleStabilize}
        >
          OVERWRITE
        </button>
        
        <p className="text-purple-500/50 font-mono text-[10px] uppercase text-center">
          RAPIDLY TAP TO OVERCOME RESISTANCE
        </p>
      </div>
    </div>
  );
};

// --- STAGE 5: REBOOT (Success & Save) ---
const RebootStage = ({ intention, onExit, session, spellSystem }: { intention: string, onExit: () => void, session: Session | undefined, spellSystem: any }) => {
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const logs = [
      "STOPPING DAEMONS...",
      "FLUSHING CACHE...",
      "REWRITING KERNEL...",
      `INJECTING: ${intention}...`,
      "SUCCESS.",
      "REBOOTING REALITY..."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setBootLog(prev => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [intention]);

    const handleSaveSpell = async () => {
         if (isSaved || isSaving) return;
         const userId = session?.user?.id;
         if (!userId) return;

         setIsSaving(true);
         try {
             const gemini = await import('@/lib/services/geminiService');
             
             // 1. Check Limits
             const isFull = await gemini.checkGrimoireLimit(userId);
             if (isFull) throw new Error("GRIMOIRE_FULL");

             // 2. Pay Credits
             const paid = await spellSystem.saveEconomy.spendAether(userId, 2);
             if (!paid) throw new Error("INSUFFICIENT_FUNDS");

             // 3. Save
             await gemini.saveSpell(userId, {
                 name: `Zero Point Zet: ${intention.substring(0, 15)}...`,
                 intention: intention,
                 incantation: "REALITY_HACK_COMPLETE",
                 element: "Aether"
             }, true);

             setIsSaved(true);
         } catch (error: any) {
             console.error("Save failed:", error);
             if (error.message === "INSUFFICIENT_FUNDS") {
                 // handled
             } else {
                 spellSystem.handleSaveError(error);
             }
         } finally {
             setIsSaving(false);
         }
    };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black text-green-500 font-mono text-sm p-8">
      <div className="w-full max-w-lg space-y-2">
        {bootLog.map((log, i) => (
          <div key={i} className="border-b border-green-900/30 pb-1">
            <span className="mr-4 opacity-50">[{new Date().toLocaleTimeString()}]</span>
            {log}
          </div>
        ))}
        {bootLog.length >= 6 && (
          <motion.div 
            initial={{ opacity: 0 } as any} 
            animate={{ opacity: 1 } as any} 
            className="mt-12 text-center"
          >
            <div className="text-4xl mb-4 text-white font-bold animate-pulse">OK</div>
            <p className="text-gray-500 text-xs mb-8">PATCH APPLIED SUCCESSFULLY</p>
            
            <div className="flex flex-col gap-4">
                <button 
                    onClick={handleSaveSpell}
                    disabled={isSaved || isSaving || !session?.user}
                    className={`w-full py-4 border border-green-700 bg-green-900/20 text-green-400 hover:text-white font-mono text-xs tracking-widest hover:border-green-400 transition-all flex items-center justify-center gap-2 ${isSaved || !session?.user ? 'opacity-50 cursor-default' : ''}`}
                >
                    <Save size={14} /> 
                    {isSaved ? "LOG SAVED" : !session?.user ? "LOG IN TO SAVE" : `SAVE TO GRIMOIRE (-2 AETHER)`}
                </button>
                {isSaving && <div className="text-center text-xs text-green-500 animate-pulse">SAVING TO ETHER...</div>}

                <button 
                onClick={onExit}
                className="w-full py-3 border border-gray-800 text-gray-500 hover:text-white hover:bg-white/5 transition-colors uppercase text-xs tracking-widest"
                >
                Return to System
                </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// --- MAIN ORCHESTRATOR ---
const ZeroPointZetSpell = ({ onExit, session, spellSystem }: { onExit: () => void, session?: Session, spellSystem: any }) => {
  // Persistent State
  const { state: spellState, setState: setSpellState, clearState } = useSpellPersistence('zero_point_zet_spell_state', {
      stage: 0,
      intention: '',
      isSaved: false
  });

  const setStage = (s: number | ((prev: number) => number)) => setSpellState(prev => ({ ...prev, stage: typeof s === 'function' ? s(prev.stage) : s }));
  const setIntention = (i: string) => setSpellState(prev => ({ ...prev, intention: i }));
  const setIsSaved = (s: boolean) => setSpellState(prev => ({ ...prev, isSaved: s }));

  const { stage, intention, isSaved } = spellState;

  const handleExit = () => {
      clearState();
      onExit();
  };

  const { initAudio, playTone, playDrone, modulateFilter } = useAudioEngine();
  const { canvasRef, spawnExplosion } = useParticleSystem();

  useEffect(() => {
    initAudio();
    playDrone(true, 50); // Low rumble start
    return () => playDrone(false);
  }, [initAudio, playDrone]);

  const renderStage = () => {
    switch (stage) {
      case 0: return <IntroStage onComplete={() => setStage(1)} playTone={playTone} initAudio={initAudio} session={session} spellSystem={spellSystem} />;
      case 1: return <BioAuthStage onComplete={() => setStage(2)} playTone={playTone} />;
      case 2: return <InjectionStage onComplete={() => setStage(3)} playTone={playTone} setIntention={setIntention} />;
      case 3: return <StabilizationStage onComplete={() => setStage(4)} playTone={playTone} modulateFilter={modulateFilter} />;
      case 4: return <EntropyStage onComplete={() => setStage(5)} playTone={playTone} spawnExplosion={spawnExplosion} intention={intention} />;
      case 5: return <RebootStage intention={intention} onExit={onExit} session={session} spellSystem={spellSystem} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden font-sans z-50">
      <button onClick={handleExit} className="absolute top-6 right-6 z-50 text-gray-700 hover:text-white transition-colors"><X size={24}/></button>
      
      {/* Global Particle Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" style={{ mixBlendMode: 'screen' }} />
      
      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-10 bg-[url('https://media.giphy.com/media/3o7qE1YN7aQfV9k1So/giphy.gif')] bg-cover mix-blend-overlay" />
      <div className="absolute inset-0 pointer-events-none z-50 bg-linear-to-b from-transparent via-white/5 to-transparent h-1 w-full animate-[scan_2s_linear_infinite]" />

      <div className="relative z-10 h-full w-full">
        {renderStage()}
      </div>

      <style jsx global>{`
        @keyframes scan {
          from { top: -10%; }
          to { top: 110%; }
        }
      `}</style>
    </div>
  );
};

export default ZeroPointZetSpell;
// --- END OF FILE src/app/components/ElectricMagick/ZeroPointZetSpell.tsx ---