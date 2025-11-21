// --- START OF FILE src/app/components/ElectricMagick/RealityPatchSpell.tsx ---
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Heart, DollarSign, Sun, Shield, Star, Fingerprint, Activity, Check, Eye, X,
  Moon, Triangle, Hexagon, Sparkles 
} from 'lucide-react';
import { useAudioEngine } from './hooks'; 
import { generateElectricEnsorcellment } from '@/lib/services/geminiService';

// --- UTILITY & CONSTANTS ---

const ARCHETYPES = {
  LOVE: { color: 'text-rose-500', border: 'border-rose-500', bg: 'bg-rose-500', icon: Heart, theme: 'VENUS' },
  MONEY: { color: 'text-emerald-400', border: 'border-emerald-400', bg: 'bg-emerald-400', icon: DollarSign, theme: 'JUPITER' },
  POWER: { color: 'text-amber-500', border: 'border-amber-500', bg: 'bg-amber-500', icon: Sun, theme: 'SOL' },
  PROTECT: { color: 'text-blue-500', border: 'border-blue-500', bg: 'bg-blue-500', icon: Shield, theme: 'MARS' },
  UNK: { color: 'text-cyan-400', border: 'border-cyan-400', bg: 'bg-cyan-400', icon: Star, theme: 'AETHER' }
};

const detectArchetype = (text: string) => {
  const t = text.toUpperCase();
  if (t.includes('LOVE') || t.includes('HEART') || t.includes('PARTNER') || t.includes('RELATIONSHIP')) return ARCHETYPES.LOVE;
  if (t.includes('MONEY') || t.includes('WEALTH') || t.includes('JOB') || t.includes('RICH')) return ARCHETYPES.MONEY;
  if (t.includes('POWER') || t.includes('CONTROL') || t.includes('STRENGTH') || t.includes('WIN')) return ARCHETYPES.POWER;
  if (t.includes('PROTECT') || t.includes('SAFE') || t.includes('GUARD') || t.includes('SHIELD')) return ARCHETYPES.PROTECT;
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

// 1. CONSECRATION & VOID ENTRY
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Consecration = ({ setPhase, archetype, audio }: any) => {
  const [progress, setProgress] = useState(0);
  const [voidProgress, setVoidProgress] = useState(0); // 0 to 100 for widening black hole
  const [stage, setStage] = useState<'consecrate' | 'void'>('consecrate');
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    if (isHolding) {
        // Different drone for void stage
       audio.startLoop(stage === 'consecrate' ? 'drone' : 'charge'); 
    } else {
       audio.stopLoop();
    }
    return () => audio.stopLoop();
  }, [isHolding, audio, stage]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isHolding) {
      interval = setInterval(() => {
        if (stage === 'consecrate') {
            // Stage 1: Shrink to Zero
            setProgress(prev => {
                const next = prev + 1;
                audio.updateLoop(next, 'drone');
                if (next >= 100) {
                    // Switch to void stage immediately
                    setStage('void');
                    audio.playSuccess(); // Transition sound
                    if (navigator.vibrate) navigator.vibrate([50, 50]);
                    return 100;
                }
                return next;
            });
        } else {
            // Stage 2: Widen the Void
            setVoidProgress(prev => {
                const next = prev + 0.5; // Slower expansion
                audio.updateLoop(next * 1.5, 'charge'); // High intensity audio
                if (next >= 100) {
                    clearInterval(interval);
                    audio.playCastBoom();
                    if (navigator.vibrate) navigator.vibrate([200, 100, 500]);
                    setPhase('GROUNDING');
                    return 100;
                }
                return next;
            });
        }
        if (navigator.vibrate) navigator.vibrate(stage === 'consecrate' ? 5 : 15);
      }, 20);
    } else {
        // Decay if let go
        if (stage === 'void' && voidProgress > 0) {
             setVoidProgress(prev => Math.max(0, prev - 5)); // Reverses quickly
        } else if (stage === 'consecrate' && progress > 0) {
             setProgress(0);
        }
    }
    
    return () => clearInterval(interval);
  }, [isHolding, progress, voidProgress, stage, setPhase, audio]);

  const ArchetypeIcon = archetype.icon;

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-1000 relative z-10 select-none">
      <div className="relative w-80 h-80 flex items-center justify-center">
        
        {stage === 'consecrate' ? (
            <>
                {/* Spiral intensifies as progress increases */}
                <div className={`absolute inset-0 border-2 border-dashed ${archetype.border} rounded-full opacity-50 transition-all duration-75`}
                     style={{ 
                         transform: `rotate(${progress * 10}deg) scale(${1 - (progress / 100)})`,
                         opacity: 1 - (progress/100) 
                     }} 
                />
                {/* Outer Spiral */}
                <div className={`absolute -inset-4 border border-dotted ${archetype.border} rounded-full opacity-30 transition-all duration-75`}
                     style={{ 
                         transform: `rotate(${progress * -5}deg) scale(${1 - (progress / 120)})` 
                     }} 
                />
                
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-75`}
                     style={{ transform: `scale(${1 - (progress/100)})`, opacity: 1 - (progress/100) }}>
                    <ArchetypeIcon className={`w-16 h-16 ${archetype.color}`} />
                </div>
            </>
        ) : (
            /* THE BLACK HOLE */
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-black rounded-full shadow-[0_0_50px_rgba(0,0,0,1)] z-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
                     style={{ 
                         transform: `scale(${1 + (voidProgress * 60)})`, // Expands to fill screen
                         transition: 'transform 0.1s linear'
                     }}
                />
                {/* The Event Horizon Ring */}
                <div className="w-32 h-32 rounded-full border-4 border-white/80 blur-md animate-[spin_2s_linear_infinite] z-10 mix-blend-exclusion"
                     style={{
                         width: `${10 + (voidProgress * 5)}%`,
                         height: `${10 + (voidProgress * 5)}%`,
                         opacity: 1 - (voidProgress / 100)
                     }}
                />
            </div>
        )}
      </div>

      <div className="text-center space-y-2 relative z-30 mix-blend-difference">
        <h2 className={`${archetype.color} font-serif italic text-xl tracking-[0.2em] drop-shadow-md`}>
            {stage === 'consecrate' ? "CONSECRATE" : "ZERO VOID DIMENSION"}
        </h2>
        <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest max-w-xs mx-auto">
            {stage === 'consecrate' 
                ? "Hold to shrink the ego to a single point" 
                : "Hold to reprogram the Chaos Potential Substance Sphere"}
        </p>
      </div>

      <button 
        className={`w-32 h-32 rounded-full bg-white/5 border ${archetype.border} shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95 transition-all flex items-center justify-center group z-30`}
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

// 2. GROUNDING (Breathing)
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
      setBreathState('INHALE'); // Inhale Magick
      audio.updateLoop('INHALE', 'breath'); 
      await new Promise(r => setTimeout(r, 4000));
      
      if (!isMounted) return;
      setBreathState('HOLD'); // Hold Power
      audio.updateLoop('HOLD', 'breath');
      await new Promise(r => setTimeout(r, 3000));
      
      if (!isMounted) return;
      setBreathState('EXHALE'); // Exhale Demons
      audio.updateLoop('EXHALE', 'breath'); 
      await new Promise(r => setTimeout(r, 4000));
      
      if (isMounted) setCycle(c => c + 1);
    };
    runBreathCycle();
    return () => { isMounted = false; };
  }, [cycle, setPhase, audio]);

  const getMessage = () => {
      if (breathState === 'INHALE') return "INHALE THE MAGICK";
      if (breathState === 'HOLD') return "HOLD THE POWER";
      return "EXHALE DEMONS";
  }

  // Fix: Circle starts small on inhale and grows
  const guideStyle = {
    transform: breathState === 'INHALE' ? 'scale(1.5)' : breathState === 'EXHALE' ? 'scale(0.5)' : 'scale(1.5)',
    opacity: breathState === 'INHALE' ? 1 : breathState === 'EXHALE' ? 0.4 : 0.8,
    transition: breathState === 'HOLD' ? 'none' : 'all 4s ease-in-out',
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 relative z-10">
      <div className="relative">
        <div className="w-32 h-32 bg-cyan-900/20 border border-cyan-500/30 rounded-full blur-xl absolute inset-0 transition-all duration-[4000ms]" style={guideStyle} />
        <div className="w-32 h-32 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-[4000ms]" style={guideStyle}>
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      </div>
      <div className="font-mono text-cyan-200 text-xl tracking-widest animate-pulse">{getMessage()}</div>
      <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-cyan-600 transition-all duration-1000" style={{ width: `${(cycle / TOTAL_CYCLES) * 100}%` }} />
      </div>
    </div>
  );
};

// 3. INSCRIPTION (Custom AI Generation)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Inscription = ({ setIntention, setArchetype, setPhase, archetype, audio, setAiData }: any) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value.toUpperCase());
      // Audio feedback on every keystroke (simulated reverb blip)
      audio.playClick('metallic'); 
  };

  const handleSubmit = async () => {
      if (text.length < 3) return;
      setIsLoading(true);
      audio.playClick('heavy');
      
      const arch = detectArchetype(text);
      setArchetype(arch);
      setIntention(text);

      try {
          // Generate custom poetry and latin based on the user's desire
          // Note: Assuming generateElectricEnsorcellment can handle a custom prompt or we use a generic one.
          // We will format the prompt to ask for specific structure.
          const prompt = `For a chaos magick spell regarding "${text}", write two things separated by a pipe symbol (|). 
          1. A short, cryptic, mystical poem (4 lines max) about this desire manifesting. 
          2. A short Latin incantation command for this desire. 
          Example Output: The shadows bend to light | Fiat Lux`;
          
          const result = await generateElectricEnsorcellment(prompt); 
          const [poetry, latin] = result.split('|');
          
          setAiData({
              poetry: poetry?.trim() || "The gears of fate grind in your favor.",
              latin: latin?.trim() || "Fiat Voluntas Tua"
          });

          setPhase('AGREEMENT');
      } catch (e) {
          console.error(e);
          // Fallback if AI fails
          setAiData({
              poetry: "The ether shifts to accommodate the will.",
              latin: "Fiat Voluntas Tua"
          });
          setPhase('AGREEMENT');
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 space-y-8 relative z-10 animate-in slide-in-from-bottom duration-1000">
         <Eye className="w-12 h-12 text-slate-700 animate-pulse mb-4" />
         <h2 className="text-slate-400 font-mono text-xs tracking-[0.5em]">DECLARE INTENTION</h2>
         <input 
           type="text" 
           value={text}
           onChange={handleType}
           placeholder="I DESIRE..."
           disabled={isLoading}
           className="w-full bg-transparent border-b border-slate-800 text-center text-3xl font-serif italic text-white focus:outline-none focus:border-white transition-colors placeholder-slate-800 pb-4"
         />
         {isLoading ? (
             <p className="text-cyan-500 animate-pulse font-mono text-xs">CONSULTING THE AETHER...</p>
         ) : (
             text.length > 3 && (
               <button 
                 onClick={handleSubmit}
                 className="mt-12 px-8 py-3 border border-slate-700 text-slate-400 font-mono text-[10px] tracking-widest hover:bg-white hover:text-black transition-all"
               >
                 [ CRYSTALLIZE ]
               </button>
             )
         )}
    </div>
  );
};

// 4. AGREEMENT (Pre-Etching)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Agreement = ({ setPhase, audio }: any) => {
    return (
        <div className="flex flex-col items-center justify-center h-full px-8 text-center space-y-8 animate-in fade-in">
            <h2 className="text-white font-serif text-2xl">The Covenant</h2>
            <p className="text-slate-400 leading-relaxed">
                You are about to etch your will into the Seed of Creation. 
                <br/><br/>
                As the sigil burns, obscure poetry will appear. 
                <br/>
                <span className="text-white font-bold">You must read these words aloud or project them loudly in your mind.</span>
            </p>
            <button 
                onClick={() => { audio.playClick('heavy'); setPhase('ETCHING'); }}
                className="mt-8 px-8 py-4 bg-slate-900 border border-slate-600 text-white font-mono text-xs tracking-widest hover:bg-white hover:text-black transition-all"
            >
                I AGREE TO SPEAK THE WORDS
            </button>
        </div>
    )
}

// 5. ETCHING (The 13 Seconds)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Etching = ({ setPhase, archetype, audio, aiData }: any) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  
  // Derived visuals based on progress
  const duration = 13000; // 13 seconds
  const colorPalette = ['#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  
  // Calculate dynamic properties
  const colorIndex = Math.floor((progress / 100) * colorPalette.length * 2) % colorPalette.length;
  const currentColor = colorPalette[colorIndex];
  const rotationSpeed = 2 + (progress / 100) * 10; // Speed increases

  useEffect(() => {
      if (isHolding && !hasFinished) {
          audio.startLoop('burn');
      } else {
          audio.stopLoop();
      }
      return () => audio.stopLoop();
  }, [isHolding, hasFinished, audio]);

  useEffect(() => {
      let startTime: number;
      let animFrame: number;

      const animate = (time: number) => {
          if (!startTime) startTime = time;
          // If we were pausing (not holding), we need to adjust logic to resume, 
          // but for simplicity in this React effect, we'll just increment a state counter in a setInterval 
          // to match previous patterns, but scale it to 13s.
      };
      
      // Using interval for consistent state updates matching the requested 13s
      let interval: NodeJS.Timeout;
      
      if (isHolding && !hasFinished) {
          const step = 100 / (duration / 20); // progress per 20ms tick
          interval = setInterval(() => {
              setProgress(p => {
                  const next = p + step;
                  if (next >= 100) {
                      setHasFinished(true);
                      return 100;
                  }
                  return next;
              });
              // Audio modulation based on speed
              audio.updateLoop(progress, 'burn');
          }, 20);
      }

      return () => clearInterval(interval);
  }, [isHolding, hasFinished, progress, audio]);

  // Generate a sigil path
  const sigilPath = "M100,20 L150,120 L50,120 Z M100,150 L100,50 M50,80 L150,80";

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 relative z-10">
      {/* Magickal Poetry Display */}
      <div className="absolute top-10 w-full px-4 text-center pointer-events-none">
          <p className={`font-serif text-lg md:text-2xl leading-relaxed transition-all duration-300 ${isHolding ? 'opacity-100 blur-0' : 'opacity-30 blur-sm'}`} 
             style={{ color: currentColor, textShadow: `0 0 10px ${currentColor}` }}>
              {aiData.poetry}
          </p>
      </div>

      <div className="relative w-72 h-72 bg-black/50 border border-slate-800 backdrop-blur-sm mt-20">
        <svg viewBox="0 0 200 200" className="w-full h-full p-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
           <path d={sigilPath} stroke="#334155" strokeWidth="2" fill="none" />
           <path d={sigilPath} stroke={currentColor} strokeWidth="3" fill="none"
            className="transition-all duration-75"
            strokeDasharray="1000" 
            strokeDashoffset={1000 - (1000 * ((progress * 5) % 100) / 100)} // Loops the tracing
            style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}
          />
        </svg>
        
        {/* Spinning overlay to show velocity */}
        <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full"
             style={{ animation: `spin-slow ${15 / rotationSpeed}s linear infinite` }} />
      </div>

      <div className="text-center space-y-2">
         <h2 className={`${archetype.color} font-mono text-xs tracking-widest`}>
           {hasFinished ? "SIGIL ETCHED." : "ETCHING INTO SEED OF CREATION..."}
         </h2>
      </div>

      {!hasFinished ? (
          <button
            className={`w-full max-w-xs py-8 border text-xs font-mono tracking-widest transition-all select-none border-slate-800 text-slate-500 hover:text-white hover:border-white active:bg-white/10`}
            onMouseDown={() => setIsHolding(true)}
            onMouseUp={() => setIsHolding(false)}
            onMouseLeave={() => setIsHolding(false)}
            onTouchStart={(e) => { e.preventDefault(); setIsHolding(true); }}
            onTouchEnd={() => setIsHolding(false)}
          >
            [ HOLD TO ETCH ]
          </button>
      ) : (
          <button 
            onClick={() => setPhase('CHANT')}
            className="w-full max-w-xs py-8 border border-white text-white bg-white/10 text-xs font-mono tracking-widest animate-pulse"
          >
            [ PROCEED TO CHANT ]
          </button>
      )}
    </div>
  );
};

// 6. CHANT (Latin)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VocalChant = ({ setPhase, archetype, audio, aiData }: any) => {
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

    // Use AI Latin
    const words = useMemo(() => aiData.latin.toUpperCase().split(' '), [aiData.latin]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (chanting && charge < 100) {
            interval = setInterval(() => {
                setCharge(c => c + 0.5); // Slower build up
                if (navigator.vibrate && charge % 20 === 0) navigator.vibrate(20);
            }, 30);
        } else if (!chanting && charge > 0) {
            setCharge(0); 
        }

        if (charge >= 100) {
            audio.playSuccess();
            if (navigator.vibrate) navigator.vibrate([100, 100, 100]);
            setTimeout(() => setPhase('CHARGE'), 1000);
        }
        return () => clearInterval(interval);
    }, [chanting, charge, setPhase, audio]);

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-16 relative z-10">
            <div className="h-32 flex flex-col items-center justify-center text-center">
                <h1 className={`text-3xl md:text-4xl font-serif italic text-white tracking-widest transition-all duration-300 ${chanting ? 'scale-110 blur-[1px]' : ''}`}>
                    "{aiData.latin}"
                </h1>
                <p className="text-slate-500 mt-4 font-mono text-xs">SPEAK THE ANCIENT TONGUE</p>
            </div>

            <div className="relative w-64 h-64 flex items-center justify-center">
                 {/* Unique Visual: Pulsating Rune Ring */}
                 <div className={`absolute inset-0 rounded-full border-4 border-double ${archetype.border} opacity-50`} 
                      style={{ transform: `scale(${1 + (charge/200)})` }} />
                 
                 {chanting && (
                    <div className={`absolute inset-0 rounded-full border-t-4 ${archetype.border} animate-spin`} />
                 )}
                 
                 <button
                    className={`w-40 h-40 rounded-full border-2 ${archetype.border} flex items-center justify-center relative overflow-hidden bg-black z-20`}
                    onMouseDown={() => setChanting(true)}
                    onMouseUp={() => setChanting(false)}
                    onMouseLeave={() => setChanting(false)}
                    onTouchStart={(e) => { e.preventDefault(); setChanting(true); }}
                    onTouchEnd={() => setChanting(false)}
                 >
                     <div className={`absolute bottom-0 left-0 w-full bg-white/20 transition-all duration-75`} 
                          style={{ height: `${charge}%` }} />
                     <Sparkles className={`${archetype.color} w-12 h-12 ${chanting ? 'animate-spin' : ''}`} />
                 </button>
            </div>
        </div>
    );
};

// 7. CHARGE & CAST
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
            const next = c >= 100 ? 100 : c + 0.4;
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
                   {/* Center figure matches archetype */}
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
           </div>
           
           <div className="w-64 space-y-4 z-20">
               <div className="h-1 bg-slate-900 w-full mx-auto overflow-hidden">
                   <div className={`h-full bg-white shadow-[0_0_20px_white] transition-all duration-75 ease-linear`} style={{ width: `${charge}%` }} />
               </div>
               <p className={`${archetype.color} text-center font-serif italic text-lg tracking-widest animate-pulse uppercase`}>
                   {charge < 100 ? 'PENETRATING SUBATOMIC PROGRAMMING WITH YOUR MAGICK SEED' : 'REALITY BREACH'}
               </p>
           </div>
           
           <button className="w-full h-full absolute inset-0 opacity-0 cursor-pointer z-30"
              onMouseDown={() => setShaking(true)} onMouseUp={() => setShaking(false)} onMouseLeave={() => setShaking(false)}
              onTouchStart={(e) => { e.preventDefault(); setShaking(true); }} onTouchEnd={() => setShaking(false)}
           />
       </div>
   );
};

// 8. FINAL CAST
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FinalCast = ({ intention, archetype, audio, onExit }: any) => (
    <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-[3000ms] relative z-10">
        <div className="relative mb-12">
            <div className={`absolute inset-0 ${archetype.bg} blur-[100px] opacity-40 animate-pulse`} />
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
  const [aiData, setAiData] = useState({ poetry: '', latin: '' });
  
  const audio = useAudioEngine();

  const getWarpIntensity = () => {
      switch(phase) {
          case 'CONSECRATE': return 10;
          case 'GROUNDING': return 20;
          case 'INTENTION': return 30;
          case 'ETCHING': return 40;
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
            {phase === 'INTENTION' && <Inscription setIntention={setIntention} setArchetype={setArchetype} setPhase={setPhase} archetype={archetype} audio={audio} setAiData={setAiData} />}
            {phase === 'AGREEMENT' && <Agreement setPhase={setPhase} audio={audio} />}
            {phase === 'ETCHING' && <Etching setPhase={setPhase} archetype={archetype} audio={audio} aiData={aiData} />}
            {phase === 'CHANT' && <VocalChant setPhase={setPhase} archetype={archetype} audio={audio} aiData={aiData} />}
            {phase === 'CHARGE' && <ChargeAndCast setPhase={setPhase} setGlitchActive={setGlitchActive} archetype={archetype} audio={audio} />}
            {phase === 'CAST' && <FinalCast intention={intention} archetype={archetype} audio={audio} onExit={onExit} />}
        </main>
      </div>
    </div>
  );
}