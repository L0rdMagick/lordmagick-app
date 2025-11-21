// --- START OF FILE src/app/components/ElectricMagick/RealityPatchSpell.tsx ---
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Fingerprint, 
  Cpu, 
  ShieldAlert, 
  Terminal, 
  Zap, 
  Wifi, 
  Lock, 
  Unlock,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioEngine, useParticleSystem } from './hooks';
import { generateElectricEnsorcellment } from '@/lib/services/geminiService';

// --- GLITCH TEXT COMPONENT ---
const GlitchText = ({ text, active = false }: { text: string, active?: boolean }) => {
  if (!active) return <span className="font-mono">{text}</span>;
  return (
    <div className="relative inline-block">
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 translate-x-[2px] text-red-500 opacity-70 animate-pulse">{text}</span>
      <span className="absolute top-0 left-0 -z-10 -translate-x-[2px] text-cyan-500 opacity-70 animate-pulse delay-75">{text}</span>
    </div>
  );
};

// --- STAGE 1: BIO-AUTHORIZATION ---
const BioAuthStage = ({ onComplete, playTone }: { onComplete: () => void, playTone: any }) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  
  // Reset if user lets go
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      playTone(100 + (scanProgress * 5), 'sawtooth', 0.1, 0.1); // Rising pitch
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            onComplete();
            return 100;
          }
          return prev + 2; // 2.5 seconds to complete
        });
      }, 50);
    } else {
      setScanProgress(0);
    }
    return () => clearInterval(interval);
  }, [isScanning, scanProgress, onComplete, playTone]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 select-none">
      <div className="mb-12 text-center space-y-2">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
        <h2 className="text-red-500 font-mono text-xs tracking-[0.2em]">SECURITY PROTOCOL: ACTIVE</h2>
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase">
          <GlitchText text="REALITY PATCH v9.0" active={true} />
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
            initial={{ top: 0 }}
            animate={{ top: '100%' }}
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

// --- STAGE 2: CODE INJECTION ---
const InjectionStage = ({ onComplete, playTone, setIntention }: { onComplete: () => void, playTone: any, setIntention: (s: string) => void }) => {
  const [input, setInput] = useState("");
  const [hexStream, setHexStream] = useState<string[]>([]);
  
  // Generate random hex noise
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
    <div className="flex flex-col items-center justify-center h-full w-full px-4 relative overflow-hidden">
      {/* Background Matrix Rain (Simplified) */}
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
              onChange={(e) => {
                setInput(e.target.value);
                playTone(400 + (e.target.value.length * 20), 'sine', 0.05);
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

// --- STAGE 3: ENTROPY BATTLE (The Climax) ---
const EntropyStage = ({ onComplete, playTone, spawnExplosion, intention }: { onComplete: () => void, playTone: any, spawnExplosion: any, intention: string }) => {
  const [integrity, setIntegrity] = useState(20); // Start low
  const [decayRate, setDecayRate] = useState(0.5);
  const [glitchActive, setGlitchActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // The Decay Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setIntegrity(prev => {
        // Decay gets stronger as you get closer to 100%
        const currentDecay = decayRate + (prev / 200); 
        return Math.max(0, prev - currentDecay);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [decayRate]);

  // Visual Glitch Effect based on progress
  useEffect(() => {
    if (integrity > 80) setGlitchActive(true);
    else setGlitchActive(false);
  }, [integrity]);

  const handleStabilize = (e: any) => {
    // Allow multi-touch or rapid clicking
    e.preventDefault(); 
    
    // Calculate boost
    const boost = 8; // Standard tap boost
    setIntegrity(prev => {
      const next = Math.min(100, prev + boost);
      
      // Audio Feedback
      const freq = 200 + (next * 8); // Pitch rises with integrity
      playTone(freq, 'sawtooth', 0.1, 0.2);
      
      // Visual Feedback
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      spawnExplosion(clientX || window.innerWidth/2, clientY || window.innerHeight/2, '#a855f7', 5);

      if (next >= 100) {
        onComplete();
        playTone(150, 'square', 1.5, 0.5); // Bass drop success
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full select-none touch-none overflow-hidden relative">
      {/* Chaos Background */}
      <div className={`absolute inset-0 bg-purple-900/10 transition-all duration-100 ${glitchActive ? 'bg-white/10 invert' : ''}`} />
      
      <div className="z-10 text-center space-y-8 w-full max-w-md px-6">
        <div className="space-y-2">
          <h2 className="text-purple-400 font-mono text-xs tracking-widest animate-pulse">SYSTEM INSTABILITY DETECTED</h2>
          <div className="font-mono text-white text-sm border border-purple-500/30 p-2 bg-black/50 backdrop-blur">
            TARGET: &quot;{intention}&quot;
          </div>
        </div>

        {/* The Meter */}
        <div className="relative w-full h-64 bg-black border-2 border-purple-900 rounded-lg overflow-hidden">
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
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-black text-white mix-blend-difference font-mono">
              {Math.floor(integrity)}%
            </span>
          </div>
        </div>

        {/* The Button */}
        <button
          className="w-full h-24 bg-purple-900/20 border-2 border-purple-500 text-purple-300 font-black text-2xl tracking-[0.2em] hover:bg-purple-500 hover:text-white transition-all active:scale-95 active:bg-white active:text-black"
          onMouseDown={handleStabilize}
          onTouchStart={handleStabilize}
        >
          STABILIZE
        </button>
        
        <p className="text-purple-500/50 font-mono text-[10px] uppercase text-center">
          RAPIDLY TAP TO OVERCOME ENTROPY
        </p>
      </div>
    </div>
  );
};

// --- STAGE 4: REBOOT (Success) ---
const RebootStage = ({ intention, onExit }: { intention: string, onExit: () => void }) => {
  const [bootLog, setBootLog] = useState<string[]>([]);

  useEffect(() => {
    const logs = [
      "STOPPING SERVICES...",
      "FLUSHING CACHE...",
      "REWRITING KERNEL...",
      `INJECTING: ${intention}...`,
      "SUCCESS.",
      "REBOOTING SYSTEM..."
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
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="mt-12 text-center"
          >
            <div className="text-4xl mb-4 text-white">OK</div>
            <p className="text-gray-500 text-xs mb-8">PATCH APPLIED SUCCESSFULLY</p>
            <button 
              onClick={onExit}
              className="px-8 py-3 border border-green-800 text-green-500 hover:bg-green-900/20 transition-colors uppercase text-xs"
            >
              Exit Terminal
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// --- MAIN ORCHESTRATOR ---
const RealityPatchSpell = ({ onExit }: { onExit: () => void }) => {
  const [stage, setStage] = useState(0); // 0: Auth, 1: Inject, 2: Entropy, 3: Reboot
  const [intention, setIntention] = useState("");
  const { initAudio, playTone, playDrone } = useAudioEngine();
  const { canvasRef, spawnExplosion } = useParticleSystem();

  useEffect(() => {
    initAudio();
    playDrone(true, 50); // Low rumble start
    return () => playDrone(false);
  }, [initAudio, playDrone]);

  const renderStage = () => {
    switch (stage) {
      case 0: return <BioAuthStage onComplete={() => setStage(1)} playTone={playTone} />;
      case 1: return <InjectionStage onComplete={() => setStage(2)} playTone={playTone} setIntention={setIntention} />;
      case 2: return <EntropyStage onComplete={() => setStage(3)} playTone={playTone} spawnExplosion={spawnExplosion} intention={intention} />;
      case 3: return <RebootStage intention={intention} onExit={onExit} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden font-sans z-50">
      <button onClick={onExit} className="absolute top-6 right-6 z-50 text-gray-700 hover:text-white transition-colors"><X size={24}/></button>
      
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

export default RealityPatchSpell;
// --- END OF FILE ---