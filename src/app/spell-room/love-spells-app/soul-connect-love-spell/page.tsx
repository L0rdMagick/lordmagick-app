// --- START OF FILE src/app/spell-room/love-spells-app/soul-connect-love-spell/page.tsx ---
/// <reference lib="dom" />
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Droplets, RotateCw, Hand, Check, Moon, Volume2, VolumeX, Users, User, Flame, LogOut, Repeat, Star, ArrowDown } from 'lucide-react';
import Link from 'next/link';

/**
 * TWO SOULS CONNECTION - LOVE SPELL RITUAL
 * Updates:
 * - AUDIO: Global 300Hz LowPass Filter (Submarine/Deep vibe).
 * - AUDIO: Charging is now a swelling Pad (Detuned Saws).
 * - VISUAL: Ingredients float down like leaves (CSS Keyframes).
 * - TIMING: Charging and Pouring slowed by 50%.
 * - FIXED: Jar Overflow Logic retained.
 */

// --- AUDIO ENGINE ---
class MagicAudio {
  ctx: any = null;
  masterGain: any = null;
  globalFilter: any = null;
  isMuted: boolean = false;

  init() {
    const globalAny = globalThis as any;
    if (typeof globalAny.window !== 'undefined' && !this.ctx) {
      const AudioContextClass = globalAny.window.AudioContext || globalAny.window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.4;
        
        // GLOBAL LOW PASS FILTER (The "Veil")
        // STRICT UPPER LIMIT: 600Hz
        this.globalFilter = this.ctx.createBiquadFilter();
        this.globalFilter.type = 'lowpass';
        this.globalFilter.frequency.value = 800; 
        
        // Chain: Source -> Master -> Filter -> Destination
        this.masterGain.connect(this.globalFilter);
        this.globalFilter.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Helper to ensure we don't blow speakers with low freq energy
  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  playDeepDrone() {
    this.ensureContext();
    if (this.isMuted) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Very low drone
    osc1.type = 'sine'; // Sine works best for sub-bass
    osc1.frequency.value = 45; 
    osc2.type = 'triangle';
    osc2.frequency.value = 45.5; // Slight beating

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 4); // Slow fade in
    
    osc1.start();
    osc2.start();

    return { 
      stop: () => {
        if(!this.ctx) return;
        const stopTime = this.ctx.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 3);
        osc1.stop(stopTime + 3);
        osc2.stop(stopTime + 3);
      }
    };
  }

  playSparkle() {
    this.ensureContext();
    if (this.isMuted) return;
    const now = this.ctx.currentTime;
    
    // Low frequency "bubbles" instead of high sparkles due to 300Hz limit
    [0, 0.15, 0.3].forEach((delay, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      // Frequencies must be audible within <300Hz window
      // 100Hz - 200Hz range
      const freq = 100 + (i * 40); 
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.8);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + delay);
      osc.stop(now + delay + 0.8);
    });
  }

  playEtch() {
    this.ensureContext();
    if (this.isMuted) return;
    // A low scratch/thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // CHANGED: From Sine/Triangle to Detuned Saws (Pad)
  startCharge() {
    this.ensureContext();
    if (this.isMuted) return null;
    
    const now = this.ctx.currentTime;
    
    // Oscillator 1
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, now); // Low A

    // Oscillator 2 (Detuned)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(55.5, now);

    const gain = this.ctx.createGain();
    
    // LowPass specific to this sound to smooth the saws before the global filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150; // Start very muffled

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 1);

    osc1.start();
    osc2.start();

    return { osc1, osc2, filter, gain };
  }

  updateCharge(node: any, progress: number) { 
    if (!node || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Pad Rising Effect
    // Freq: 55Hz -> 110Hz (Octave)
    // Filter: 150Hz -> 280Hz (Opening up, but staying under global 300Hz)
    
    const targetFreq = 55 + (progress * 0.55); 
    const targetFilter = 150 + (progress * 1.3);

    node.osc1.frequency.setTargetAtTime(targetFreq, now, 0.2);
    node.osc2.frequency.setTargetAtTime(targetFreq * 1.01, now, 0.2); // Keep detune
    node.filter.frequency.setTargetAtTime(targetFilter, now, 0.2);
    
    // Slight volume swell
    node.gain.gain.setTargetAtTime(0.2 + (progress * 0.001), now, 0.1);
  }

  stopCharge(node: any) {
    if (!node || !this.ctx) return;
    const now = this.ctx.currentTime;
    try {
        node.gain.gain.cancelScheduledValues(now);
        node.gain.gain.setTargetAtTime(0, now, 0.5); // Long release
        node.osc1.stop(now + 1);
        node.osc2.stop(now + 1);
    } catch(e) {}
  }

  playImpact() {
    this.ensureContext();
    if (this.isMuted) return;
    
    // Deep Thud (Kick drum like)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.5);
  }

  startSwirl() {
    this.ensureContext();
    if (this.isMuted) return null;
    
    // Noise is naturally full spectrum, heavily filtered
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 100; // Deep rumble
    filter.Q.value = 5;
    
    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
    gain.gain.setTargetAtTime(0.15, this.ctx.currentTime, 1);

    // LFO to modulate filter for "swirling"
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.5;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 50; // Modulate +/- 50Hz
    
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    return { noise, gain, lfo, stop: () => {
        if(!this.ctx) return;
        const now = this.ctx.currentTime;
        gain.gain.setTargetAtTime(0, now, 0.5);
        noise.stop(now + 1);
        lfo.stop(now + 1);
    }};
  }
}

const audio = new MagicAudio();

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
    
    .font-magical { font-family: 'Cinzel', serif; }
    .font-scroll { font-family: 'Crimson Text', serif; }
    
    ::-webkit-scrollbar { display: none; }
    
    .magical-glow {
      box-shadow: 0 0 25px rgba(251, 191, 36, 0.2), inset 0 0 20px rgba(251, 191, 36, 0.1);
    }
    
    /* Disable Callouts/Selection for immersive feel */
    .no-select {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
    }
    
    input, textarea {
        -webkit-user-select: text !important;
        user-select: text !important;
    }

    /* LEAF DROP ANIMATION */
    /* Simulates a falling leaf with X-axis sway and Y-axis gravity */
    @keyframes leaf-drop {
        0% { transform: translate(0px, 0px) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        25% { transform: translate(15px, 60px) rotate(15deg); }
        50% { transform: translate(-15px, 140px) rotate(-10deg); }
        75% { transform: translate(10px, 200px) rotate(5deg); }
        100% { transform: translate(0px, 260px) rotate(0deg); opacity: 1; }
    }

    .falling-leaf {
        animation: leaf-drop 4s ease-in-out forwards;
        transform-box: fill-box;
        transform-origin: center;
    }
  `}</style>
);

// --- HELPER LOGIC ---

const HERB_DATABASE: Record<string, any[]> = {
  blockage: [
    { name: 'Lemon Balm', icon: '🌿', desc: 'Clears away confusion.', color: 'text-yellow-300' },
    { name: 'Chilli Flakes', icon: '🌶️', desc: 'Burns away obstacles.', color: 'text-red-500' },
    { name: 'Sea Salt', icon: '🧂', desc: 'Neutralizes the past.', color: 'text-white' },
    { name: 'Black Pepper', icon: '⚫', desc: 'Banishes jealousy.', color: 'text-gray-400' }
  ],
  attract: [
    { name: 'Rose Petals', icon: '🌹', desc: 'Invites soft romance.', color: 'text-pink-400' },
    { name: 'Cinnamon Stick', icon: '🪵', desc: 'Ignites passion.', color: 'text-orange-500' },
    { name: 'Lavender', icon: '🪻', desc: 'Brings understanding.', color: 'text-purple-400' },
    { name: 'Sugar Crystals', icon: '✨', desc: 'Sweetens thoughts.', color: 'text-blue-200' }
  ],
  bind: [
    { name: 'Licorice Root', icon: '🎋', desc: 'For commanding control.', color: 'text-slate-400' },
    { name: 'Ivy Leaf', icon: '🍃', desc: 'To cling faithfully.', color: 'text-green-500' },
    { name: 'Red String', icon: '🧶', desc: 'To tie fates together.', color: 'text-red-600' },
    { name: 'Magnetite', icon: '🧲', desc: 'Magnetic attraction.', color: 'text-gray-500' }
  ]
};

const determineIngredients = (text: string) => {
  const t = text.toLowerCase();
  let b = HERB_DATABASE.blockage[0]; 
  let a = HERB_DATABASE.attract[0];
  let bind = HERB_DATABASE.bind[1];

  if (t.includes('ex') || t.includes('stop') || t.includes('fight')) b = HERB_DATABASE.blockage[1];
  if (t.includes('sad') || t.includes('cry')) b = HERB_DATABASE.blockage[0];
  if (t.includes('protect')) b = HERB_DATABASE.blockage[3];

  if (t.includes('sex') || t.includes('hot')) a = HERB_DATABASE.attract[1];
  if (t.includes('marriage')) a = HERB_DATABASE.attract[3];
  if (t.includes('talk')) a = HERB_DATABASE.attract[2];

  if (t.includes('forever')) bind = HERB_DATABASE.bind[2];
  if (t.includes('obey')) bind = HERB_DATABASE.bind[0];

  return [b, a, bind];
};

const generateIncantation = (names: { user: string, target: string }, isForSelf: boolean) => {
  if (isForSelf) {
    return [
      `By earth and air, by fire and sea,`,
      `I clear the path to ${names.target} and me.`,
      `No wall stands high, no gate remains,`,
      `Love flows freely through our veins.`,
      `As I stir, the honey binds,`,
      `Two hearts, two souls, two tangled minds.`,
      `I seal this spell, so mote it be,`,
      `${names.target} loves only me.`
    ];
  } else {
    return [
      `By earth and air, by fire and sea,`,
      `I clear the path for ${names.target} and ${names.user}.`,
      `No wall stands high, no gate remains,`,
      `Love flows freely through their veins.`,
      `As I stir, the honey binds,`,
      `Two hearts, two souls, two tangled minds.`,
      `I seal this spell, so mote it be,`,
      `${names.target} loves only ${names.user}.`
    ];
  }
};

// --- COMPONENT: BACKGROUND ---
const StarField = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0f0a1e]">
    {Array.from({ length: 15 }).map((_, i) => (
      <div key={i} className="absolute rounded-full bg-amber-100 opacity-20 animate-pulse"
        style={{
          top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
          width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
          animationDuration: `${Math.random() * 3 + 2}s`
        }}
      />
    ))}
    <div className="absolute top-10 right-10 opacity-10 text-amber-100"><Moon size={64} /></div>
    <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
  </div>
);

// --- COMPONENT: POPUP MODAL ---
const MagickPopup = ({ message, buttonText = "Continue", onContinue }: { message: string, buttonText?: string, onContinue: () => void }) => (
  <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 no-select">
     <div className="bg-[#1a1528] border border-amber-600/50 p-6 rounded-lg max-w-xs w-full text-center shadow-[0_0_50px_rgba(251,191,36,0.3)] transform scale-100 mx-4">
        <div className="w-12 h-12 mx-auto bg-amber-900/20 rounded-full flex items-center justify-center mb-4 border border-amber-500/30">
            <Sparkles className="text-amber-200 w-6 h-6" />
        </div>
        <h3 className="text-lg font-magical text-amber-100 mb-4">{message}</h3>
        <button 
            onClick={onContinue}
            className="w-full bg-amber-900/40 hover:bg-amber-800/40 border border-amber-600 text-amber-100 py-3 uppercase tracking-widest font-magical text-sm transition-colors active:scale-95"
        >
            {buttonText}
        </button>
     </div>
  </div>
);

// --- COMPONENT: FINAL MODAL ---
const FinalPopup = ({ onExit }: { onExit: () => void }) => {
  const router = typeof window !== 'undefined' ? (window as any).location : { reload: () => {} };
  
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in zoom-in duration-500 no-select">
       <div className="bg-[#1a1528] border border-amber-500/50 p-8 rounded-xl max-w-sm w-full text-center shadow-[0_0_60px_rgba(251,191,36,0.2)] mx-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-10"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
                <Check className="w-10 h-10 text-amber-200" />
            </div>
            <h2 className="text-2xl font-magical text-amber-100 mb-2">It is Done</h2>
            <p className="text-amber-400/60 font-scroll italic mb-8">The energy has been released.</p>
            
            <div className="flex flex-col gap-4">
                <button 
                    onClick={() => router.reload()}
                    className="w-full flex items-center justify-center gap-2 bg-amber-900/30 border border-amber-600/50 text-amber-100 py-3 uppercase tracking-widest font-magical text-xs hover:bg-amber-800/40 transition-colors"
                >
                    <Repeat size={14} /> Cast Another Spell
                </button>
                <Link 
                    href="/spell-room/love-spells-app"
                    className="w-full flex items-center justify-center gap-2 bg-slate-900/50 border border-slate-600/50 text-slate-300 py-3 uppercase tracking-widest font-magical text-xs hover:bg-slate-800/50 transition-colors"
                >
                    <LogOut size={14} /> Exit Room
                </Link>
            </div>
          </div>
       </div>
    </div>
  );
};

// --- COMPONENT: MAIN PAGE ---

export default function SoulConnectSpellPage() {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [step, setStep] = useState(1);
  const [names, setNames] = useState({ user: '', target: '' });
  const [intention, setIntention] = useState('');
  const [isForSelf, setIsForSelf] = useState(true);
  
  const [activeIngredients, setActiveIngredients] = useState<any[]>([]);
  const [addedIngredients, setAddedIngredients] = useState<any[]>([]);
  const [generatedChant, setGeneratedChant] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState<{msg: string, btn?: string} | null>(null);
  
  const bgDroneRef = useRef<any>(null);

  const startRitual = () => {
    audio.init();
    bgDroneRef.current = audio.playDeepDrone();
    audio.playSparkle();
    setStarted(true);
  };

  const toggleMute = () => {
    setMuted(!muted);
    audio.isMuted = !muted;
  };
  
  const handleStageComplete = (msg: string, btnText: string = "Continue") => {
    setShowSuccess({ msg, btn: btnText });
  };

  const nextStep = () => {
    setShowSuccess(null);
    audio.playSparkle();
    setStep(s => s + 1);
  };

  // --- FLOW LOGIC ---
  // Step 1: Intention -> Set Names/Intention -> goto 2
  // Step 2: Jar Mode: 'petition' -> Insert Petition -> goto 3
  // Step 3: Consecrate Ing 0 -> goto 4
  // Step 4: Jar Mode: 'drop' Ing 0 -> goto 5
  // Step 5: Consecrate Ing 1 -> goto 6
  // Step 6: Jar Mode: 'drop' Ing 1 -> goto 7
  // Step 7: Consecrate Ing 2 -> goto 8
  // Step 8: Jar Mode: 'drop' Ing 2 -> goto 9
  // Step 9: Jar Mode: 'honey' -> Fill Honey -> goto 10
  // Step 10: Incantation -> goto 11
  // Step 11: Mixing -> goto 12
  // Step 12: Candle -> goto 13
  // Step 13: Release -> goto 14 (Final)

  const handlePetitionDone = () => {
      setActiveIngredients(determineIngredients(intention));
      setGeneratedChant(generateIncantation(names, isForSelf));
      handleStageComplete("The Sigil is active. The path is open.");
  };

  const handleIngredientDrop = (ing: any) => {
    setAddedIngredients([...addedIngredients, ing]);
    nextStep();
  };

  if (!started) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0a1e] text-amber-50 flex flex-col items-center justify-center p-6 font-magical text-center cursor-pointer overflow-hidden no-select" onClick={startRitual}>
        <GlobalStyles />
        <StarField />
        
        <Link href="/spell-room/love-spells-app" className="absolute top-6 left-6 text-amber-500/50 hover:text-amber-200 z-50 transition-colors flex items-center gap-2 font-sans text-xs uppercase tracking-wider font-bold">
            &larr; Exit
        </Link>

        <div className="z-10 animate-in zoom-in duration-700 flex flex-col items-center">
           <div className="w-24 h-24 rounded-full border border-amber-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(251,191,36,0.2)] animate-pulse">
             <Sparkles size={40} className="text-amber-200" />
           </div>
           <h1 className="text-3xl md:text-4xl mb-4 tracking-widest drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">Two Souls Connection</h1>
           <p className="text-amber-200/50 font-scroll text-lg max-w-md mb-8">
             A ritual to bind, heal, and attract.
           </p>
           <span className="text-xs uppercase tracking-widest border border-amber-500/30 px-6 py-3 rounded hover:bg-amber-900/20 transition-colors">
               Enter the Circle
           </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#0f0a1e] text-amber-50 overflow-hidden flex flex-col relative no-select touch-none">
      <GlobalStyles />
      <StarField />
      
      {/* Navbar */}
      <div className="flex justify-between items-center p-4 z-50 shrink-0 h-16">
        <Link href="/spell-room/love-spells-app" className="text-amber-500/50 hover:text-amber-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          &larr; Exit
        </Link>
        <div className="text-amber-200/60 text-[10px] tracking-[0.2em] uppercase font-magical flex items-center gap-2">
            <Sparkles size={10} /> Step {step > 9 ? step - 5 : step} / 9
        </div>
        <button onClick={toggleMute} className="text-amber-500/50 hover:text-amber-200">
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Main Content Area - Justify Evenly to avoid scroll */}
      <div className="flex-grow relative z-10 flex flex-col items-center justify-evenly p-4 w-full max-w-md mx-auto h-full max-h-[calc(100dvh-4rem)]">
          {/* STEP 1: PETITION */}
          {step === 1 && (
            <StageOneIntention 
              names={names} setNames={setNames} 
              intention={intention} setIntention={setIntention} 
              isForSelf={isForSelf} setIsForSelf={setIsForSelf}
              onComplete={handlePetitionDone} 
            />
          )}

          {/* STEP 2: JAR - INSERT PETITION */}
          {step === 2 && (
            <StageTwoJar 
                mode="petition" 
                names={names} 
                filledIngredients={addedIngredients}
                onComplete={() => handleStageComplete("Petition Placed.")} 
            />
          )}

          {/* LOOPS FOR INGREDIENTS */}
          {/* Ing 1 */}
          {step === 3 && <StageThreeConsecrate ingredient={activeIngredients[0]} index={0} total={3} onComplete={() => handleStageComplete("The herb is charged.")} />}
          {step === 4 && <StageTwoJar mode="drop" droppingItem={activeIngredients[0]} filledIngredients={addedIngredients} names={names} onComplete={() => handleIngredientDrop(activeIngredients[0])} />}

          {/* Ing 2 */}
          {step === 5 && <StageThreeConsecrate ingredient={activeIngredients[1]} index={1} total={3} onComplete={() => handleStageComplete("The ingredient is charged.")} />}
          {step === 6 && <StageTwoJar mode="drop" droppingItem={activeIngredients[1]} filledIngredients={addedIngredients} names={names} onComplete={() => handleIngredientDrop(activeIngredients[1])} />}

          {/* Ing 3 */}
          {step === 7 && <StageThreeConsecrate ingredient={activeIngredients[2]} index={2} total={3} onComplete={() => handleStageComplete("The binding is charged.")} />}
          {step === 8 && <StageTwoJar mode="drop" droppingItem={activeIngredients[2]} filledIngredients={addedIngredients} names={names} onComplete={() => handleIngredientDrop(activeIngredients[2])} />}

          {/* STEP 9: JAR - POUR HONEY */}
          {step === 9 && (
             <StageTwoJar 
                mode="honey" 
                filledIngredients={addedIngredients} 
                names={names} 
                onComplete={() => handleStageComplete("The Vessel is sweetened and sealed.")} 
             />
          )}
          
          {/* STEP 10: INCANTATION */}
          {step === 10 && <StageFourIncantation chant={generatedChant} onComplete={() => handleStageComplete("The words have been spoken.")} />}
          
          {/* STEP 11: MIXING */}
          {step === 11 && <StageFiveMixing ingredients={activeIngredients} names={names} onComplete={() => handleStageComplete("The spell is bound.")} />}
          
          {/* STEP 12: CANDLE */}
          {step === 12 && <StageSixCandle onComplete={() => handleStageComplete("The spell is sealed in fire.")} />}
          
          {/* STEP 13: RELEASE */}
          {step === 13 && <StageSevenRelease onComplete={() => setStep(14)} />}

          {/* FINAL */}
          {step === 14 && <FinalPopup onExit={() => {}} />}
      </div>

      {showSuccess && <MagickPopup message={showSuccess.msg} buttonText={showSuccess.btn} onContinue={nextStep} />}
    </div>
  );
}

// --- STAGE 1: INTENTION ---
const StageOneIntention = ({ names, setNames, intention, setIntention, isForSelf, setIsForSelf, onComplete }: any) => {
  const [mode, setMode] = useState('form'); 
  const [traceProgress, setTraceProgress] = useState(0);

  const handleTrace = () => {
    if (Math.random() > 0.8) audio.playEtch(); 
    setTraceProgress(prev => Math.min(prev + 1, 100));
  };

  if (mode === 'form') {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative flex flex-col h-full justify-center">
        <div className="absolute inset-0 bg-amber-600/10 blur-3xl animate-pulse rounded-full pointer-events-none"></div>

        <h2 className="text-2xl text-center text-amber-100 mb-2 font-magical drop-shadow-md shrink-0">The Petition</h2>
        
        <div className="flex justify-center mb-2 shrink-0">
            <div className="flex bg-slate-900/80 rounded-full border border-amber-800/50 p-1">
                <button 
                    onClick={() => setIsForSelf(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] uppercase tracking-wider transition-all ${isForSelf ? 'bg-amber-700 text-white shadow-lg' : 'text-slate-400 hover:text-amber-200'}`}
                >
                    <User size={12} /> For Me
                </button>
                <button 
                    onClick={() => setIsForSelf(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] uppercase tracking-wider transition-all ${!isForSelf ? 'bg-amber-700 text-white shadow-lg' : 'text-slate-400 hover:text-amber-200'}`}
                >
                    <Users size={12} /> For Couple
                </button>
            </div>
        </div>

        <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-amber-900/50 shadow-xl backdrop-blur-md relative z-10 shrink-0">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-amber-500 mb-1 font-magical">
                {isForSelf ? "Your Name" : "First Person's Name"}
            </label>
            <input 
              value={names.user}
              onChange={(e) => setNames({...names, user: e.target.value})}
              className="w-full bg-slate-950/50 border-b border-amber-700/50 p-2 text-amber-100 font-scroll text-base focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-700 rounded-none"
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-amber-500 mb-1 font-magical">
                {isForSelf ? "Target Name" : "Second Person's Name"}
            </label>
            <input 
              value={names.target}
              onChange={(e) => setNames({...names, target: e.target.value})}
              className="w-full bg-slate-950/50 border-b border-amber-700/50 p-2 text-amber-100 font-scroll text-base focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-700 rounded-none"
              placeholder="Whom to bind?"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-amber-500 mb-1 font-magical">Intention</label>
            <textarea 
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              className="w-full bg-slate-950/50 border border-amber-700/30 p-2 text-amber-100 font-scroll text-sm focus:outline-none focus:border-amber-400 transition-colors h-16 resize-none placeholder:text-slate-700 rounded-sm"
              placeholder="e.g. Faithful love, Return to me..."
            />
          </div>
          <button 
            disabled={!names.user || !names.target || !intention}
            onClick={() => { audio.playImpact(); setMode('sigil'); }}
            className="w-full mt-2 bg-gradient-to-r from-amber-900/40 to-amber-800/40 border border-amber-600/50 text-amber-100 py-3 uppercase tracking-[0.2em] font-magical text-sm hover:bg-amber-800/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          >
            Create Petition
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center animate-in zoom-in duration-500 w-full h-full flex flex-col items-center justify-center">
      <h2 className="text-xl text-amber-100 mb-2 font-magical">Activate the Sigil</h2>
      <p className="text-xs text-amber-400/60 mb-6 font-scroll italic">Trace the symbol to lock your intention.</p>
      
      <div 
        className="relative w-64 h-64 mx-auto flex items-center justify-center cursor-crosshair touch-none select-none"
        onMouseMove={(e) => { if(e.buttons === 1) handleTrace(); }}
        onTouchMove={handleTrace}
      >
        <div className="absolute inset-0 border-2 border-amber-900/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute inset-2 border border-amber-900/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

        {/* Venus Sigil Background */}
        <svg viewBox="0 0 100 100" className="w-40 h-40 absolute stroke-amber-800/50 fill-none stroke-2 pointer-events-none">
           <circle cx="50" cy="35" r="25" />
           <line x1="50" y1="60" x2="50" y2="95" />
           <line x1="35" y1="80" x2="65" y2="80" />
        </svg>

        {/* Venus Sigil Foreground */}
        <svg viewBox="0 0 100 100" className="w-40 h-40 absolute stroke-amber-200 fill-none stroke-[3px] drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] pointer-events-none" style={{ clipPath: `inset(${100 - traceProgress}% 0 0 0)` }}>
           <circle cx="50" cy="35" r="25" />
           <line x1="50" y1="60" x2="50" y2="95" />
           <line x1="35" y1="80" x2="65" y2="80" />
        </svg>

        {traceProgress < 100 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Hand className="w-6 h-6 text-amber-500/50 animate-bounce" />
          </div>
        )}
      </div>

      <div className="mt-6 h-1 w-32 mx-auto bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-amber-500 transition-all duration-75" style={{ width: `${traceProgress}%` }}></div>
      </div>

      {traceProgress >= 100 && (
         <button onClick={onComplete} className="mt-8 bg-amber-700/80 text-white font-magical px-8 py-2 uppercase tracking-widest animate-pulse rounded border border-amber-500 shadow-lg text-sm active:scale-95">
           Confirm Sigil
         </button>
      )}
    </div>
  );
};

// --- STAGE 2: JAR (Complex State Machine) ---
interface JarProps {
    mode: 'petition' | 'drop' | 'honey';
    names: any;
    filledIngredients: any[];
    droppingItem?: any;
    onComplete: () => void;
}

const StageTwoJar = ({ mode, names, filledIngredients, droppingItem, onComplete }: JarProps) => {
  const [actionProgress, setActionProgress] = useState(0); 
  const [isPouring, setIsPouring] = useState(false);
  const [animState, setAnimState] = useState<'idle' | 'dropping' | 'done'>('idle');
  const [failed, setFailed] = useState(false);
  
  const progressRef = useRef(0);
  const soundRef = useRef<any>(null);

  // Sync ref with state
  useEffect(() => { progressRef.current = actionProgress; }, [actionProgress]);

  // SVG Coordinate System: 0 0 200 300
  const bottlePath = "M70,20 C70,10 75,0 100,0 C125,0 130,10 130,20 L130,60 C130,70 170,80 180,120 C190,160 195,200 170,260 C145,300 55,300 30,260 C5,200 10,160 20,120 C30,80 70,70 70,60 Z";

  // Handle Honey Pouring Logic with Ref-based Interval
  useEffect(() => {
    let interval: any;
    
    if (isPouring && !failed && mode === 'honey') {
        if (!soundRef.current) soundRef.current = audio.startCharge();

        interval = setInterval(() => {
            const current = progressRef.current;
            if (current >= 280) {
                // Overflow Logic
                setFailed(true);
                setIsPouring(false);
                if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
                audio.playImpact();
            } else {
                // Pouring - SLOWER 50%
                const next = current + 1.2; // Was 2
                setActionProgress(next);
                if(soundRef.current) audio.updateCharge(soundRef.current, next/2);
            }
        }, 30); 
    } else {
        if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
    }
    return () => { 
        clearInterval(interval); 
        if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
    };
  }, [isPouring, failed, mode]);

  const resetHoney = () => { setActionProgress(0); setFailed(false); audio.playSparkle(); };

  // Handle Dropping Logic - VISUAL UPDATE
  const triggerDrop = () => {
      setAnimState('dropping');
      audio.playSparkle();
      // Drop takes 4 seconds now (leaf drop)
      setTimeout(() => {
          setAnimState('done');
      }, 4000);
  };

  const handlePetitionInsert = () => {
    triggerDrop();
  };

  return (
    <div className="flex flex-col items-center w-full h-full justify-center">
      <h2 className="text-xl text-amber-100 mb-1 font-magical">
          {mode === 'petition' && "The Vessel"}
          {mode === 'drop' && "Add Ingredient"}
          {mode === 'honey' && "Sweeten the Jar"}
      </h2>
      <p className="text-xs text-amber-400/60 mb-6 text-center font-scroll h-4">
        {mode === 'petition' && (animState !== 'done' ? "Tap to place petition." : "Petition added.")}
        {mode === 'drop' && (animState !== 'done' ? `Tap to add ${droppingItem.name}.` : "Added.")}
        {mode === 'honey' && "Hold button to pour honey."}
      </p>

      {/* JAR VISUAL */}
      <div className="relative w-56 h-[40vh] max-h-80 mb-6 shrink-0">
         <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,0,0,0.6)]">
            <defs>
               <clipPath id="bottleClip">
                  <path d={bottlePath} />
               </clipPath>
               <linearGradient id="honeyGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="50%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#78350f" />
               </linearGradient>
            </defs>
            
            {/* Background Glass Tint */}
            <path d={bottlePath} fill="rgba(255,255,255,0.03)" stroke="none" />

            {/* Content Group (Clipped) */}
            <g clipPath="url(#bottleClip)">
                
                {/* Honey (Only visible if pouring or done) */}
                {mode === 'honey' && (
                    <rect 
                        x="0" 
                        y={300 - actionProgress} 
                        width="200" 
                        height={actionProgress} 
                        fill="url(#honeyGrad)" 
                        opacity="0.9"
                    />
                )}
                
                {/* 1. Petition (If inserted) */}
                {(mode !== 'petition' || animState !== 'idle') && (
                    <g 
                       className={mode === 'petition' && animState === 'dropping' ? "falling-leaf" : ""}
                       transform={mode === 'petition' && animState === 'dropping' 
                         ? "" // Animation handles transform
                         : `translate(100, 250)` // Static pos
                       }
                    >
                       {/* If animating, position at 0,0 relative to parent and let keyframes move it. 
                           If done, parent g is translated to 100,250. 
                           Wait, mixing transform and animation can be tricky in SVG.
                           Strategy: Use inner group for shape, outer group for static pos.
                       */}
                       {mode === 'petition' && animState === 'dropping' ? (
                            // Animating Element - Start at top
                           <g transform="translate(100, 50)"> 
                               <rect x="-30" y="-40" width="60" height="80" fill="#f3e5ab" stroke="#78350f" strokeWidth="0.5" />
                               <text x="0" y="-10" fontSize="6" textAnchor="middle" fill="#000" fontFamily="serif">{names.user}</text>
                               <text x="0" y="5" fontSize="6" textAnchor="middle" fill="#b91c1c" fontFamily="serif">&</text>
                               <text x="0" y="20" fontSize="6" textAnchor="middle" fill="#000" fontFamily="serif">{names.target}</text>
                           </g>
                       ) : (
                           // Static Element
                           <g transform="rotate(-10)">
                               <rect x="-30" y="-40" width="60" height="80" fill="#f3e5ab" stroke="#78350f" strokeWidth="0.5" />
                               <text x="0" y="-10" fontSize="6" textAnchor="middle" fill="#000" fontFamily="serif">{names.user}</text>
                               <text x="0" y="5" fontSize="6" textAnchor="middle" fill="#b91c1c" fontFamily="serif">&</text>
                               <text x="0" y="20" fontSize="6" textAnchor="middle" fill="#000" fontFamily="serif">{names.target}</text>
                           </g>
                       )}
                    </g>
                )}

                {/* 2. Previously Added Ingredients */}
                {filledIngredients.map((ing, i) => (
                    <text key={i} x={100 + (Math.sin(i)*40)} y={240 - (i*20)} fontSize="30" textAnchor="middle" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.5))">
                        {ing.icon}
                    </text>
                ))}

                {/* 3. Currently Dropping Item (Leaf Drop Animation) */}
                {mode === 'drop' && animState === 'dropping' && (
                    <g transform="translate(100, 50)" className="falling-leaf">
                         <text fontSize="30" textAnchor="middle">{droppingItem.icon}</text>
                    </g>
                )}

                {/* Target Line for Honey */}
                {mode === 'honey' && (
                    <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 2" />
                )}
            </g>

            {/* Glass Outline Overlay */}
            <path d={bottlePath} fill="none" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5" />
            <path d="M40,140 Q60,140 60,180" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
         </svg>
      </div>

      {/* CONTROLS */}
      {mode === 'petition' && (
          animState === 'done' ? (
            <button onClick={onComplete} className="px-8 py-2 bg-amber-800 text-amber-100 font-magical font-bold text-sm rounded shadow-lg animate-in zoom-in">
                Next Step
            </button>
          ) : (
            <button onClick={handlePetitionInsert} className={`px-8 py-2 bg-[#f3e5ab] text-slate-900 font-magical font-bold text-sm shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:scale-105 transition-transform active:scale-95 ${animState === 'dropping' ? 'opacity-50 pointer-events-none' : ''}`}>
                {animState === 'dropping' ? "Placing..." : "Insert Petition"}
            </button>
          )
      )}

      {mode === 'drop' && (
          animState === 'done' ? (
            <button onClick={onComplete} className="px-8 py-2 bg-amber-800 text-amber-100 font-magical font-bold text-sm rounded shadow-lg animate-in zoom-in">
                Confirm
            </button>
          ) : (
             <button onClick={triggerDrop} className={`group flex items-center gap-2 px-8 py-2 border border-amber-500/50 text-amber-100 font-magical text-sm hover:bg-amber-900/30 transition-all active:scale-95 ${animState === 'dropping' ? 'opacity-50 pointer-events-none' : ''}`}>
                {animState === 'dropping' ? "Dropping..." : `Drop ${droppingItem.name}`} {animState !== 'dropping' && <ArrowDown size={14} />}
             </button>
          )
      )}

      {mode === 'honey' && (
          failed ? (
            <div className="flex flex-col items-center z-50">
                <div className="text-red-400 text-xs mb-2 font-magical bg-red-900/20 px-4 py-1 rounded">Overflow!</div>
                <button onClick={resetHoney} className="px-6 py-2 border border-red-500 text-red-400 font-magical text-xs uppercase tracking-wider active:scale-95 hover:bg-red-900/20 transition-colors">Clean Jar</button>
            </div>
          ) : (
            <>
              {(actionProgress / 230) * 100 > 80 && (actionProgress / 230) * 100 < 100 && !isPouring ? (
                 <button onClick={onComplete} className="bg-green-900/40 border border-green-500 text-green-200 px-8 py-2 uppercase tracking-[0.2em] font-magical text-sm animate-pulse active:scale-95">
                   Seal Vessel
                 </button>
              ) : (
                <button 
                  onMouseDown={() => setIsPouring(true)}
                  onMouseUp={() => setIsPouring(false)}
                  onTouchStart={() => setIsPouring(true)}
                  onTouchEnd={() => setIsPouring(false)}
                  className="group relative w-20 h-20 rounded-full bg-slate-800 border border-amber-500/30 flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
                >
                   <div className={`absolute inset-0 bg-amber-600 transition-transform duration-300 ${isPouring ? 'translate-y-0' : 'translate-y-full'}`}></div>
                   <div className="relative z-10 flex flex-col items-center pointer-events-none">
                     <Droplets className={`w-6 h-6 ${isPouring ? 'text-white' : 'text-amber-500'}`} />
                     <span className="text-[8px] uppercase font-bold mt-1 text-amber-200/70">(Hold)</span>
                   </div>
                </button>
              )}
            </>
          )
      )}
    </div>
  );
};

// --- STAGE 3: CONSECRATE (One Ingredient) ---
const StageThreeConsecrate = ({ ingredient, index, total, onComplete }: any) => {
  const [charge, setCharge] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [success, setSuccess] = useState(false); 
  const soundRef = useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCharging && !success) {
      if (!soundRef.current) soundRef.current = audio.startCharge(); 
      interval = setInterval(() => {
        setCharge(prev => {
            // SLOWER CHARGE 50%
            const next = Math.min(prev + 1.5, 100); // Was 3.0
            if(soundRef.current) audio.updateCharge(soundRef.current, next);
            return next;
        }); 
      }, 50);
    } else {
        if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
        if (!success) setCharge(0); 
    }
    return () => { clearInterval(interval); if(soundRef.current) audio.stopCharge(soundRef.current); };
  }, [isCharging, success]);

  useEffect(() => {
      if(charge >= 100 && !success) {
        setIsCharging(false);
        audio.playSparkle();
        setSuccess(true); 
        setTimeout(onComplete, 1500); // Auto advance slightly faster
      }
  }, [charge, success, onComplete]);

  return (
    <div className="flex flex-col items-center text-center w-full relative h-full justify-center">
      <h2 className="text-xl text-amber-100 mb-1 font-magical">Consecrate Herb</h2>
      <p className="text-xs text-amber-400/60 mb-6 font-scroll italic">Hold to imbue energy.</p>

      {/* Ingredient Display with Glitter Fill */}
      <div className="w-56 h-56 bg-slate-900/40 border border-amber-900/50 rounded-full flex flex-col items-center justify-center mb-8 relative overflow-hidden backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)] group shrink-0">
         <div 
            className="absolute inset-0 bg-amber-500/20 transition-all duration-100 ease-linear rounded-full"
            style={{ 
                clipPath: `circle(${charge}% at 50% 100%)`, 
            }}
         >
            <div className="absolute inset-0 animate-[pulse_0.5s_infinite] opacity-50 bg-[url('/images/noise.png')] mix-blend-overlay"></div>
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
            <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-amber-200 rounded-full animate-ping delay-100"></div>
         </div>

         <div className={`relative z-10 text-6xl mb-4 filter drop-shadow-lg transition-transform duration-300 ${isCharging ? 'scale-125' : 'scale-100'}`}>
            {ingredient.icon}
         </div>
         <h3 className={`relative z-10 text-2xl font-magical ${ingredient.color} mb-1`}>{ingredient.name}</h3>
         <p className="relative z-10 text-sm text-slate-400 font-scroll italic px-4">"{ingredient.desc}"</p>
         <div className="absolute top-4 text-[10px] text-slate-600 font-bold tracking-widest">Item {index + 1} of {total}</div>
      </div>

      <button
        onMouseDown={() => setIsCharging(true)}
        onMouseUp={() => setIsCharging(false)}
        onTouchStart={() => setIsCharging(true)}
        onTouchEnd={() => setIsCharging(false)}
        className={`w-24 h-24 rounded-full border border-amber-500/40 flex flex-col items-center justify-center relative overflow-hidden active:scale-95 transition-all bg-slate-900 ${success ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="absolute bottom-0 w-full bg-amber-600/30 transition-all duration-75" style={{ height: `${charge}%` }}></div>
        <Sparkles className="w-6 h-6 text-amber-200 mb-1" />
        <span className="relative z-10 text-[9px] font-magical uppercase tracking-widest text-amber-100 pointer-events-none">(Hold)</span>
      </button>
    </div>
  );
};

// --- STAGE 4: INCANTATION ---
const StageFourIncantation = ({ chant, onComplete }: any) => {
  const [lineIdx, setLineIdx] = useState(0);

  const handleTap = () => {
    audio.playImpact();
    if (lineIdx < chant.length - 1) setLineIdx(p => p + 1);
    else onComplete();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer touch-manipulation" onClick={handleTap}>
      <h2 className="text-base md:text-xl font-magical uppercase tracking-[0.2em] text-amber-200/80 mb-2 text-center leading-tight max-w-xs shrink-0">
          REPEAT THE CHANT, ALOUD OR INTERNALLY WITH POWER
      </h2>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-12">TAP TO ADVANCE</p>
      
      <div className="relative w-full text-center px-4 min-h-[200px] flex items-center justify-center">
         <div key={lineIdx} className="animate-in zoom-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl md:text-3xl font-magical text-amber-50 leading-relaxed drop-shadow-md">"{chant[lineIdx]}"</h3>
            <div className="mt-6 flex justify-center">
                <div className="w-12 h-1 bg-amber-900/30 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-full animate-[ping_1.5s_infinite]"></div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- STAGE 5: MIXING ---
const StageFiveMixing = ({ ingredients, names, onComplete }: any) => {
  const [progress, setProgress] = useState(0);
  const [isStirring, setIsStirring] = useState(false);
  const soundRef = useRef<any>(null);

  const PetitionIcon = () => (
      <div className="w-8 h-10 bg-[#f3e5ab] border border-amber-900 flex flex-col items-center justify-center text-[3px] leading-tight shadow-sm text-black font-serif">
         <span>{names.user}</span>
         <span className="text-red-800">&</span>
         <span>{names.target}</span>
      </div>
  );

  const mixItems = [...ingredients, { component: <PetitionIcon />, type: 'petition' }];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStirring) {
      if (!soundRef.current) soundRef.current = audio.startSwirl();
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) { if(soundRef.current) soundRef.current.stop(); return 100; }
          return prev + 0.8; 
        });
      }, 50);
    } else {
      if(soundRef.current) { soundRef.current.stop(); soundRef.current = null; }
      if(progress < 100) setProgress(0); 
    }
    return () => { clearInterval(interval); if(soundRef.current) soundRef.current.stop(); };
  }, [isStirring, progress]);

  return (
    <div className="flex flex-col items-center text-center w-full h-full justify-center">
      <h2 className="text-xl text-amber-100 mb-1 font-magical">Bind the Energy</h2>
      <p className="text-xs text-amber-400/60 mb-8 font-scroll italic">Hold to stir the ingredients.</p>

      <div className="relative w-56 h-56 mb-8 flex items-center justify-center shrink-0">
        <div className="absolute inset-0 border border-slate-700 rounded-full bg-black/40"></div>
        
        <div 
          className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-900 to-black flex items-center justify-center shadow-inner overflow-hidden relative"
          style={{ transform: `rotate(${progress * 15}deg)`, transition: isStirring ? 'transform 0.1s linear' : 'transform 1s ease-out' }}
        >
           <div className="absolute w-full h-full opacity-30 bg-[url('/images/noise.png')]"></div>
           
           {mixItems.map((item: any, i: number) => {
             const angle = (i / mixItems.length) * 2 * Math.PI;
             const r = 60; 
             return (
               <div 
                 key={i} 
                 className="absolute text-2xl filter blur-[0.5px] animate-pulse"
                 style={{
                    top: `calc(50% + ${Math.sin(angle) * r}px)`,
                    left: `calc(50% + ${Math.cos(angle) * r}px)`,
                    transform: `rotate(${-progress * 15}deg) translate(-50%, -50%)` // Center the item
                 }}
               >
                 {item.type === 'petition' ? item.component : item.icon}
               </div>
             );
           })}
           
           <div className="absolute w-full h-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent animate-spin duration-700 opacity-50"></div>
        </div>

        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
          <circle cx="112" cy="112" r="105" stroke="#1e293b" strokeWidth="2" fill="none" />
          <circle cx="112" cy="112" r="105" stroke="#f59e0b" strokeWidth="4" fill="none" strokeDasharray="660" strokeDashoffset={660 - (660 * progress) / 100} strokeLinecap="round" />
        </svg>
      </div>

      {progress >= 100 ? (
        <button onClick={onComplete} className="px-8 py-2 bg-amber-600 text-white font-magical uppercase tracking-widest text-sm rounded shadow-lg animate-bounce active:scale-95">
          Mixture Bound
        </button>
      ) : (
        <button
          onMouseDown={() => setIsStirring(true)}
          onMouseUp={() => setIsStirring(false)}
          onTouchStart={() => setIsStirring(true)}
          onTouchEnd={() => setIsStirring(false)}
          className="w-20 h-20 rounded-full bg-slate-800 border border-slate-600 flex flex-col items-center justify-center active:bg-amber-900/20 active:border-amber-500 transition-colors active:scale-95"
        >
          <RotateCw className={`w-6 h-6 text-amber-100 mb-1 ${isStirring ? 'animate-spin' : ''}`} />
          <span className="text-[8px] uppercase font-bold text-amber-200/70 pointer-events-none">(Hold)</span>
        </button>
      )}
    </div>
  );
};

// --- STAGE 6: CANDLE (Fixed Wick & Touch Area) ---
const StageSixCandle = ({ onComplete }: any) => {
  const [lit, setLit] = useState(false);
  const [timeLeft, setTimeLeft] = useState(142); // 2:22 = 142s
  const maxTime = 142;
  
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const secs = s % 60;
    return `${m}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lit && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } 
    return () => clearInterval(interval);
  }, [lit, timeLeft]);

  // Calculate wax height reduction.
  const initialHeight = 160;
  const waxHeight = 20 + ((initialHeight - 20) * (timeLeft / maxTime));

  return (
    <div className="flex flex-col items-center w-full h-full justify-center">
      <h2 className="text-xl text-amber-100 mb-1 font-magical">Seal with Fire</h2>
      <p className="text-xs text-amber-400/60 mb-8 font-scroll italic">
          {lit ? "Focus on your desire..." : "Tap the wick to light the candle."}
      </p>

      {/* SVG Candle */}
      <div className="relative h-72 w-40 flex flex-col items-center justify-end mb-6 shrink-0">
        
        {/* Flame SVG */}
        {lit && timeLeft > 0 && (
          <div className="absolute z-20 mix-blend-screen animate-in fade-in duration-500" style={{ bottom: `${waxHeight + 5}px`, transition: 'bottom 1s linear' }}>
             <svg width="40" height="60" viewBox="0 0 40 60">
                <path d="M20,0 Q35,30 20,60 Q5,30 20,0" fill="orange" className="animate-[pulse_0.1s_infinite]" />
                <path d="M20,10 Q28,35 20,50 Q12,35 20,10" fill="#fef3c7" className="blur-[1px]" />
             </svg>
             <div className="absolute -top-10 -left-6 w-24 h-24 bg-orange-600/20 rounded-full blur-2xl animate-pulse"></div>
          </div>
        )}

        {/* Wax SVG Body & Visible Wick */}
        <svg width="80" height="200" viewBox="0 0 80 200" className="drop-shadow-lg overflow-visible">
             {/* Gradient Def */}
             <defs>
                <linearGradient id="candleGrad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#f9a8d4" />
                    <stop offset="50%" stopColor="#fce7f3" />
                    <stop offset="100%" stopColor="#f9a8d4" />
                </linearGradient>
             </defs>

             {/* Wick - Always visible at top of wax */}
             <rect x="38" y={200 - waxHeight - 15} width="4" height="15" fill="#333" style={{ transition: 'y 1s linear' }}/>
             
             {/* Body */}
             <rect 
                x="10" 
                y={200 - waxHeight} 
                width="60" 
                height={waxHeight} 
                fill="url(#candleGrad)" 
                rx="4"
                style={{ transition: 'all 1s linear' }}
             />
        </svg>

        {/* Interaction Layer for Lighting (Invisible Box over wick area) */}
        {!lit && (
             <div 
               className="absolute z-50 w-24 h-24 cursor-pointer flex items-center justify-center"
               style={{ bottom: `${waxHeight - 20}px` }}
               onClick={() => { setLit(true); audio.playEtch(); }}
             >
                 {/* Visual Hint */}
                 <div className="w-6 h-6 rounded-full border border-orange-500/50 animate-ping opacity-50"></div>
             </div>
        )}
      </div>

      {!lit ? (
        <div className="text-xs uppercase tracking-widest text-pink-300 animate-pulse border-b border-pink-500/50 pb-1">Tap wick to light</div>
      ) : (
        <>
            {timeLeft > 0 ? (
                <div className="text-2xl font-magical text-amber-200 animate-pulse">
                   {formatTime(timeLeft)}
                </div>
            ) : (
                <button onClick={onComplete} className="px-8 py-2 bg-pink-700 text-white font-magical uppercase tracking-widest text-sm rounded shadow-[0_0_20px_rgba(236,72,153,0.5)] animate-in zoom-in active:scale-95">
                    Seal Completed
                </button>
            )}
        </>
      )}
    </div>
  );
};

// --- STAGE 7: RELEASE ---
const StageSevenRelease = ({ onComplete }: any) => {
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const soundRef = useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCharging) {
      if (!soundRef.current) soundRef.current = audio.startCharge();
      interval = setInterval(() => {
        setPower(prev => {
            // SLOWER CHARGE 50%
            const next = Math.min(prev + 0.8, 100); // Was 1.5
            if(soundRef.current) audio.updateCharge(soundRef.current, next);
            return next;
        }); 
      }, 50); 
    } else {
      if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
      if(power < 100) setPower(0);
    }
    return () => { clearInterval(interval); if(soundRef.current) audio.stopCharge(soundRef.current); };
  }, [isCharging, power]);

  useEffect(() => {
      if(power >= 100) {
          audio.playSparkle();
          setTimeout(onComplete, 1200); 
      }
  }, [power, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden">
      <div 
        className="text-center mb-12" 
        style={{ 
            opacity: power >= 100 ? 0 : 1 - (power/100), 
            transform: power >= 100 ? `scale(0.5) translateY(-500px)` : `scale(${1+(power/200)})`,
            filter: power >= 100 ? 'blur(10px)' : 'none',
            transition: 'all 0.5s ease-in' 
        }}
      >
        <div className="text-6xl mb-4">🕯️</div>
        <h2 className="text-2xl text-amber-100 font-magical mb-2">Manifestation</h2>
        <p className="text-amber-500/50 font-scroll italic">Release your will into the universe.</p>
      </div>

      <button
        onMouseDown={() => setIsCharging(true)}
        onMouseUp={() => setIsCharging(false)}
        onTouchStart={() => setIsCharging(true)}
        onTouchEnd={() => setIsCharging(false)}
        className={`relative w-40 h-40 rounded-full border border-amber-500/30 flex flex-col items-center justify-center overflow-hidden bg-slate-900/50 backdrop-blur-sm group active:border-amber-200 transition-all active:scale-95 ${power >= 100 ? 'opacity-0 duration-500' : ''}`}
      >
        <div className="absolute bottom-0 left-0 right-0 bg-amber-100 mix-blend-overlay transition-all duration-75" style={{ height: `${power}%` }}></div>
        <span className="relative z-10 text-amber-100 font-magical font-bold tracking-widest uppercase text-xs pointer-events-none">
          RELEASE
        </span>
        <span className="relative z-10 text-[8px] text-amber-500/70 mt-1 uppercase font-bold pointer-events-none">(Hold)</span>
      </button>

      {/* Glittering Star Effect */}
      {power >= 100 && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
             <div className="relative animate-in zoom-in duration-500 fade-out-0 fill-mode-forwards">
                <Star size={64} className="text-white fill-white animate-spin-slow drop-shadow-[0_0_50px_white]" />
                <div className="absolute inset-0 bg-white blur-xl animate-pulse"></div>
             </div>
          </div>
      )}
    </div>
  );
};