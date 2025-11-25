// --- START OF FILE src/app/spell-room/love-spells-app/soul-connect-love-spell/page.tsx ---
/// <reference lib="dom" />
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Droplets, RotateCw, Hand, Check, Moon, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';

/**
 * THE DIGITAL HONEY JAR - LOVE SPELL RITUAL (AUDIO-ENCHANTED EDITION)
 * * Features: Real-time Web Audio Synthesis for immersive, non-repetitive soundscapes.
 */

// --- AUDIO ENGINE ---
// A self-contained synthesizer for magical effects
class MagicAudio {
  ctx: any = null;
  masterGain: any = null;
  isMuted: boolean = false;

  init() {
    // FIX: Safe global access
    const globalAny = globalThis as any;
    if (typeof globalAny.window !== 'undefined' && !this.ctx) {
      const AudioContextClass = globalAny.window.AudioContext || globalAny.window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Safe volume
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Helper to create an oscillator with envelope
  playTone({ freq = 440, type = 'sine', duration = 1, vol = 1, slideTo = null }: { freq?: number, type?: string, duration?: number, vol?: number, slideTo?: number | null }) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type as any;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // 1. DEEP DRONE (For intros/waiting)
  playDeepDrone() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Detuned low saws for texture
    osc1.type = 'sawtooth';
    osc1.frequency.value = 55; // Low A
    osc2.type = 'sawtooth';
    osc2.frequency.value = 55.5; // Slight detune

    // Lowpass filter to make it dark and mysterious
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 2); // Slow fade in
    
    osc1.start();
    osc2.start();

    return { 
      stop: () => {
        if(!this.ctx) return;
        const stopTime = this.ctx.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 2);
        osc1.stop(stopTime + 2);
        osc2.stop(stopTime + 2);
      }
    };
  }

  // 2. SPARKLES (For success/magic)
  playSparkle() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    // Play a cascade of high bells
    [0, 0.1, 0.2, 0.3, 0.4].forEach((delay, i) => {
      if(!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      // Pentatonic high notes
      const freq = 880 * Math.pow(1.5, i); // Fifths stacking up
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.1, now + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.5);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + delay);
      osc.stop(now + delay + 1.5);
    });
  }

  // 3. ETCHING (For Sigil)
  playEtch() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    // Harsh, electrical buzzing sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100 + Math.random() * 50, this.ctx.currentTime);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // 4. CHARGING UP (Continuous rising pitch)
  startCharge() {
    if (this.isMuted || !this.ctx || !this.masterGain) return null;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator(); // Tremolo
    const lfoGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime); // Start low
    
    lfo.frequency.value = 10; // 10Hz shake
    lfoGain.gain.value = 500;

    lfo.connect(lfoGain);
    // lfoGain.connect(osc.frequency); // Vibrato effect

    osc.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.5);

    osc.start();
    lfo.start();

    return { osc, gain, lfo, startTime: this.ctx.currentTime };
  }

  updateCharge(node: any, progress: number) { // progress 0 to 100
    if (!node || !this.ctx) return;
    const now = this.ctx.currentTime;
    // Pitch rises from 110Hz to 880Hz
    const targetFreq = 110 + (progress * 8); 
    node.osc.frequency.setTargetAtTime(targetFreq, now, 0.1);
    // Tremolo speed increases
    node.lfo.frequency.setTargetAtTime(10 + (progress/2), now, 0.1);
  }

  stopCharge(node: any) {
    if (!node || !this.ctx) return;
    const now = this.ctx.currentTime;
    node.gain.gain.setTargetAtTime(0, now, 0.1);
    node.osc.stop(now + 0.2);
    node.lfo.stop(now + 0.2);
  }

  // 5. DEEP IMPACT (For Chant Taps)
  playImpact() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.5); // Pitch drop

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2); // Long tail

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 2);
  }

  // 6. SWIRL (For stirring)
  startSwirl() {
    if (this.isMuted || !this.ctx || !this.masterGain) return null;
    // Filtered noise sweep
    const bufferSize = this.ctx.sampleRate * 2; // 2 sec buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 10; // Narrow resonance
    
    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
    gain.gain.setTargetAtTime(0.15, this.ctx.currentTime, 1);

    // Auto sweep the filter
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.5; // 1 cycle every 2 sec
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 1000; // Range of sweep
    
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    filter.frequency.value = 600; // Center freq
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


// --- GOOGLE FONTS & GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
    
    .font-magical { font-family: 'Cinzel', serif; }
    .font-scroll { font-family: 'Crimson Text', serif; }
    
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    
    .animate-float { animation: float 6s ease-in-out infinite; }
    
    .magical-glow {
      box-shadow: 0 0 15px rgba(251, 191, 36, 0.3), inset 0 0 20px rgba(251, 191, 36, 0.1);
    }

    .ingredient-aura {
      background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0) 70%);
    }
  `}</style>
);

// --- DATA & MAGIC ASSETS ---

const HERB_DATABASE: Record<string, any[]> = {
  blockage: [
    { name: 'Lemon Balm', icon: '🌿', desc: 'Clears away confusion and bitter feelings.', color: 'text-yellow-300', glow: 'shadow-yellow-500/50' },
    { name: 'Chilli Flakes', icon: '🌶️', desc: 'Burns away obstacles and third parties.', color: 'text-red-500', glow: 'shadow-red-500/50' },
    { name: 'Sea Salt', icon: '🧂', desc: 'Neutralizes past negativity.', color: 'text-white', glow: 'shadow-white/50' },
    { name: 'Black Pepper', icon: '⚫', desc: 'Banishes jealousy and the evil eye.', color: 'text-gray-400', glow: 'shadow-gray-500/50' }
  ],
  attract: [
    { name: 'Rose Petals', icon: '🌹', desc: 'Invites soft, romantic love.', color: 'text-pink-400', glow: 'shadow-pink-500/50' },
    { name: 'Cinnamon Stick', icon: '🪵', desc: 'Speeds up contact and heats up passion.', color: 'text-orange-500', glow: 'shadow-orange-500/50' },
    { name: 'Lavender', icon: '🪻', desc: 'Brings peace and understanding.', color: 'text-purple-400', glow: 'shadow-purple-500/50' },
    { name: 'Sugar Crystals', icon: '✨', desc: 'Sweetens their thoughts of you.', color: 'text-blue-200', glow: 'shadow-blue-200/50' }
  ],
  bind: [
    { name: 'Licorice Root', icon: '🎋', desc: 'Domination and commanding control.', color: 'text-slate-400', glow: 'shadow-slate-500/50' },
    { name: 'Ivy Leaf', icon: '🍃', desc: 'Makes them cling to you faithfully.', color: 'text-green-500', glow: 'shadow-green-500/50' },
    { name: 'Red String', icon: '🧶', desc: 'Ties their fate to yours eternally.', color: 'text-red-600', glow: 'shadow-red-600/50' },
    { name: 'Magnetite', icon: '🧲', desc: 'Magnetic attraction that cannot be broken.', color: 'text-gray-500', glow: 'shadow-gray-500/50' }
  ]
};

// --- HELPER LOGIC ---

const determineIngredients = (text: string) => {
  const t = text.toLowerCase();
  let b = HERB_DATABASE.blockage[0]; 
  let a = HERB_DATABASE.attract[0];
  let bind = HERB_DATABASE.bind[1];

  if (t.includes('ex') || t.includes('stop') || t.includes('fight')) b = HERB_DATABASE.blockage[1];
  if (t.includes('sad') || t.includes('cry') || t.includes('hurt')) b = HERB_DATABASE.blockage[0];
  if (t.includes('protect') || t.includes('safe')) b = HERB_DATABASE.blockage[3];

  if (t.includes('sex') || t.includes('hot') || t.includes('now') || t.includes('fast')) a = HERB_DATABASE.attract[1];
  if (t.includes('marriage') || t.includes('wife') || t.includes('husband')) a = HERB_DATABASE.attract[3];
  if (t.includes('talk') || t.includes('message')) a = HERB_DATABASE.attract[2];

  if (t.includes('forever') || t.includes('always')) bind = HERB_DATABASE.bind[2];
  if (t.includes('obey') || t.includes('listen')) bind = HERB_DATABASE.bind[0];

  return [b, a, bind];
};

const generateIncantation = (targetName: string) => {
  return [
    `By earth and air, by fire and sea,`,
    `I clear the path to ${targetName} and me.`,
    `No wall stands high, no gate remains,`,
    `Love flows freely through our veins.`,
    `As I stir, the honey binds,`,
    `Two hearts, two souls, two tangled minds.`,
    `I seal this spell, so mote it be,`,
    `${targetName} returns, only to me.`
  ];
};

// --- VISUAL COMPONENTS ---

const StarField = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-amber-100 opacity-20 animate-pulse"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
      <div className="absolute top-10 right-10 opacity-10 text-amber-100">
        <Moon size={64} />
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function SoulConnectSpellPage() {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [step, setStep] = useState(1);
  const [names, setNames] = useState({ user: '', target: '' });
  const [intention, setIntention] = useState('');
  const [activeIngredients, setActiveIngredients] = useState<any[]>([]);
  const [generatedChant, setGeneratedChant] = useState<string[]>([]);
  const bgDroneRef = useRef<any>(null);

  // Initializer to bypass browser audio restrictions
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
  
  const nextStep = () => {
    // FIX: Safe window access
    const globalAny = globalThis as any;
    if (typeof globalAny.window !== 'undefined') {
        globalAny.window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    audio.playSparkle(); // Transition sound
    setStep(s => s + 1);
  };

  // Intro Screen
  if (!started) {
    return (
      <div className="min-h-screen bg-[#0f0a1e] text-amber-50 flex flex-col items-center justify-center p-6 font-magical text-center selection:bg-amber-900 cursor-pointer" onClick={startRitual}>
        <Link href="/spell-room/love-spells-app" className="absolute top-6 left-6 text-amber-500/50 hover:text-amber-200 z-50 transition-colors flex items-center gap-2 font-sans text-sm">
            &larr; Exit Spell
        </Link>
        <GlobalStyles />
        <StarField />
        <div className="z-10 animate-in zoom-in duration-700 flex flex-col items-center">
           <div className="w-24 h-24 rounded-full border border-amber-500/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(251,191,36,0.2)] animate-pulse">
             <Sparkles size={48} className="text-amber-200" />
           </div>
           <h1 className="text-4xl mb-4 tracking-widest">The Digital Grimoire</h1>
           <p className="text-amber-200/50 font-scroll text-lg max-w-md mb-12">
             A sound-immersive ritual for love and connection.
             <br/><br/>
             <span className="text-sm uppercase tracking-widest border border-amber-500/30 px-4 py-2 rounded hover:bg-amber-900/20 transition-colors">
               Click to Enter the Temple
             </span>
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0a1e] text-amber-50 selection:bg-amber-900 overflow-x-hidden font-scroll">
      <GlobalStyles />
      <StarField />
      
      {/* Back Link */}
      <Link href="/spell-room/love-spells-app" className="fixed top-6 left-6 z-50 text-amber-500/50 hover:text-amber-200 transition-colors flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-wider">
        &larr; Leave
      </Link>

      {/* Mute Toggle */}
      <button 
        onClick={toggleMute} 
        className="fixed top-6 right-6 z-50 text-amber-500/50 hover:text-amber-200 transition-colors"
      >
        {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      {/* Vignette & Texture */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-0"></div>
      
      {/* Main Container */}
      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6">
        
        {/* Header */}
        <header className="absolute top-6 w-full flex justify-center items-center opacity-60 text-xs tracking-[0.2em] uppercase font-magical text-amber-200 border-b border-amber-900/30 pb-2">
          <span className="flex items-center gap-2"><Sparkles size={12} /> Ritual {step} / 7</span>
        </header>

        {/* STAGE RENDERER */}
        <div className="w-full mt-12">
          {step === 1 && (
            <StageOneIntention 
              names={names} 
              setNames={setNames} 
              intention={intention} 
              setIntention={setIntention} 
              onComplete={() => {
                setActiveIngredients(determineIngredients(intention));
                setGeneratedChant(generateIncantation(names.target));
                nextStep();
              }} 
            />
          )}

          {step === 2 && <StageTwoJar names={names} onComplete={nextStep} />}
          {step === 3 && <StageThreeHerbs ingredients={activeIngredients} onComplete={nextStep} />}
          {step === 4 && <StageFourStir onComplete={nextStep} />}
          {step === 5 && <StageFiveIncantation chant={generatedChant} onComplete={nextStep} />}
          {step === 6 && <StageSixCandle targetName={names.target} onComplete={nextStep} />}
          {step === 7 && <StageSevenRelease onComplete={() => setStep(8)} />}

          {step === 8 && (
            <div className="text-center animate-pulse flex flex-col items-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <Check className="w-12 h-12 text-amber-200" />
              </div>
              <h1 className="text-4xl mb-4 text-amber-200 font-magical">It is Done</h1>
              <p className="opacity-70 font-scroll text-lg max-w-xs mx-auto">The spell is woven into the fabric of reality. Trust the process.</p>
              <button 
                onClick={() => {
                    // FIX: Safe global access
                    const globalAny = globalThis as any;
                    if (typeof globalAny.window !== 'undefined') globalAny.window.location.reload();
                }} 
                className="mt-12 text-xs border border-amber-900/50 px-6 py-3 rounded hover:bg-amber-900/20 uppercase tracking-widest font-magical text-amber-400"
              >
                Cast Another Spell
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- STAGE 1: INTENTION & SIGIL ---

const StageOneIntention = ({ names, setNames, intention, setIntention, onComplete }: any) => {
  const [mode, setMode] = useState('form'); 
  const [isDrawing, setIsDrawing] = useState(false);
  const [traceProgress, setTraceProgress] = useState(0);

  const handleStart = () => setIsDrawing(true);
  const handleEnd = () => setIsDrawing(false);
  
  const handleMove = () => {
    if (!isDrawing) return;
    if (Math.random() > 0.7) audio.playEtch(); 
    setTraceProgress(prev => Math.min(prev + 0.5, 100));
  };

  if (mode === 'form') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-3xl text-center text-amber-100 mb-8 font-magical drop-shadow-md">The Petition</h2>
        <div className="space-y-8 bg-slate-900/40 p-6 rounded-xl border border-amber-900/30 shadow-xl backdrop-blur-sm">
          <div>
            <label className="block text-xs uppercase tracking-wider text-amber-500 mb-2 font-magical">Your Name</label>
            <input 
              value={names.user}
              // FIX: Cast e.target to any to access value safely
              onChange={(e) => setNames({...names, user: (e.target as any).value})}
              className="w-full bg-slate-950 border-b border-amber-700/50 p-3 text-amber-100 font-scroll text-lg focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-700"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-amber-500 mb-2 font-magical">Target Name</label>
            <input 
              value={names.target}
              // FIX: Cast e.target to any to access value safely
              onChange={(e) => setNames({...names, target: (e.target as any).value})}
              className="w-full bg-slate-950 border-b border-amber-700/50 p-3 text-amber-100 font-scroll text-lg focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-700"
              placeholder="Who do you desire?"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-amber-500 mb-2 font-magical">Your Intention</label>
            <textarea 
              value={intention}
              // FIX: Cast e.target to any to access value safely
              onChange={(e) => setIntention((e.target as any).value)}
              className="w-full bg-slate-950 border border-amber-700/30 p-3 text-amber-100 font-scroll text-lg focus:outline-none focus:border-amber-400 transition-colors h-32 resize-none placeholder:text-slate-700 rounded-sm"
              placeholder="Be specific. Speak from the heart."
            />
          </div>
          <button 
            disabled={!names.user || !names.target || !intention}
            onClick={() => {
                audio.playImpact(); 
                setMode('sigil');
            }}
            // FIX: bg-linear-to-r syntax
            className="w-full mt-4 bg-linear-to-r from-amber-900/20 to-amber-800/20 border border-amber-600/50 text-amber-100 py-4 uppercase tracking-[0.2em] font-magical hover:bg-amber-800/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            Seal the Petition
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center animate-in zoom-in duration-500">
      <h2 className="text-2xl text-amber-100 mb-4 font-magical">Activate the Sigil</h2>
      <p className="text-sm text-amber-400/60 mb-8 font-scroll italic">Trace the symbol of Venus to lock your intention.</p>
      
      <div 
        className="relative w-72 h-72 mx-auto border-2 border-amber-900/30 rounded-full flex items-center justify-center bg-slate-900/30 touch-none select-none cursor-crosshair shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseMove={handleMove}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onTouchMove={handleMove}
      >
        {/* Background Sigil (Dim) */}
        <svg viewBox="0 0 100 100" className="w-48 h-48 absolute opacity-20 stroke-amber-800 fill-none stroke-2">
           <circle cx="50" cy="35" r="25" />
           <line x1="50" y1="60" x2="50" y2="95" />
           <line x1="35" y1="80" x2="65" y2="80" />
        </svg>

        {/* Foreground Sigil (Fills up) */}
        <svg viewBox="0 0 100 100" className="w-48 h-48 absolute stroke-amber-200 fill-none stroke-[3px] drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" style={{ clipPath: `inset(${100 - traceProgress}% 0 0 0)` }}>
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

      <div className="mt-8 h-1 w-48 mx-auto bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div className="h-full bg-amber-500 transition-all duration-75 shadow-[0_0_10px_#f59e0b]" style={{ width: `${traceProgress}%` }}></div>
      </div>

      {traceProgress >= 100 && (
         <button 
         onClick={onComplete}
         // FIX: bg-linear-to-r syntax
         className="w-full mt-10 bg-linear-to-r from-amber-700 to-amber-600 text-white font-magical font-bold py-4 uppercase tracking-[0.2em] animate-pulse rounded border border-amber-400 shadow-lg"
       >
         Sigil Activated
       </button>
      )}
    </div>
  );
};

// --- STAGE 2: THE JAR ---

const StageTwoJar = ({ names, onComplete }: any) => {
  const [honeyLevel, setHoneyLevel] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [parchmentIn, setParchmentIn] = useState(false);
  const [failed, setFailed] = useState(false);
  const soundRef = useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPouring && parchmentIn && !failed) {
      // Start sound if not playing
      if (!soundRef.current) soundRef.current = audio.startCharge();
      
      interval = setInterval(() => {
        setHoneyLevel(prev => {
          if (prev >= 110) { 
            setFailed(true);
            setIsPouring(false);
            // Stop sound
            if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
            // Play fail sound
            audio.playImpact();
            return prev;
          }
          // Update Sound Pitch
          if(soundRef.current) audio.updateCharge(soundRef.current, prev);
          return prev + 1;
        });
      }, 50); 
    } else {
        // Stop sound if we let go
        if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
    }
    return () => {
        clearInterval(interval);
        if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
    };
  }, [isPouring, parchmentIn, failed]);

  const reset = () => {
    setHoneyLevel(0);
    setFailed(false);
    audio.playSparkle();
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl text-amber-100 mb-2 font-magical">The Vessel</h2>
      <p className="text-sm text-amber-400/60 mb-10 text-center max-w-xs font-scroll">
        {!parchmentIn 
          ? "Tap the parchment to place your petition." 
          : "Hold the button to pour the honey. Stop at the line."}
      </p>

      {/* The Jar Visual */}
      <div className="relative w-40 h-56 border-4 border-slate-600 rounded-b-3xl bg-slate-900/30 backdrop-blur-sm overflow-hidden mb-12 border-t-0 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-600/50"></div>
        
        {/* Target Line */}
        <div className={`absolute top-[15%] left-0 right-0 h-0.5 z-20 transition-all duration-300 ${honeyLevel > 80 && honeyLevel < 95 ? 'bg-green-400 shadow-[0_0_15px_lime] h-1' : 'bg-amber-500/50'}`}></div>

        {/* Honey */}
        <div 
          // FIX: bg-linear-to-t syntax
          className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-amber-800 to-amber-600/90 transition-all duration-100 ease-linear flex items-center justify-center"
          style={{ height: `${honeyLevel}%` }}
        >
          <div className="absolute w-2 h-2 bg-amber-200/30 rounded-full bottom-4 left-4 animate-ping"></div>
          <div className="absolute w-1 h-1 bg-amber-200/30 rounded-full bottom-10 right-8 animate-ping delay-300"></div>
        </div>

        {/* Parchment inside */}
        <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ${parchmentIn ? 'top-[40%] rotate-12' : '-top-[120px]'}`}>
          <div className="w-20 h-24 bg-[#f3e5ab] text-slate-900 text-[8px] p-2 shadow-lg writing-vertical text-center border border-amber-300 font-magical flex flex-col items-center justify-center leading-tight">
            <span>{names.user}</span>
            <span className="text-red-800 text-xs my-1">❤</span>
            <span>{names.target}</span>
          </div>
        </div>
      </div>

      {failed && (
        <div className="text-red-400 text-sm mb-6 animate-bounce font-magical bg-red-900/20 px-4 py-2 rounded border border-red-800">
          The honey spilled. The flow must be precise.
        </div>
      )}

      {/* Controls */}
      {!parchmentIn ? (
        <button 
          onClick={() => {
              setParchmentIn(true);
              audio.playSparkle(); // Drop sound
          }}
          className="px-10 py-4 bg-[#f3e5ab] text-slate-900 rounded-sm font-magical font-bold shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:scale-105 transition-transform border-4 border-double border-amber-600"
        >
          Place Petition
        </button>
      ) : (
        <>
          {failed ? (
            <button onClick={reset} className="px-8 py-3 border border-red-500 text-red-400 font-magical rounded hover:bg-red-900/20 uppercase tracking-wider">Clean & Reset</button>
          ) : (
            <>
              {honeyLevel > 80 && honeyLevel < 95 && !isPouring ? (
                 <button 
                 onClick={onComplete}
                 className="w-full bg-green-900/30 border border-green-500 text-green-200 py-4 uppercase tracking-[0.2em] font-magical animate-in fade-in"
               >
                 Jar Sweetened
               </button>
              ) : (
                <button 
                  onMouseDown={() => setIsPouring(true)}
                  onMouseUp={() => setIsPouring(false)}
                  onTouchStart={() => setIsPouring(true)}
                  onTouchEnd={() => setIsPouring(false)}
                  className="group relative w-24 h-24 rounded-full bg-slate-800 border-2 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)] active:scale-95 transition-all flex items-center justify-center overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-amber-600 transition-transform duration-300 ${isPouring ? 'translate-y-0' : 'translate-y-full'}`}></div>
                  <Droplets className={`w-8 h-8 relative z-10 transition-colors ${isPouring ? 'text-amber-100' : 'text-amber-500'}`} />
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

// --- STAGE 3: THE HERBS ---

const StageThreeHerbs = ({ ingredients, onComplete }: any) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [charge, setCharge] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const soundRef = useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCharging) {
      if (!soundRef.current) soundRef.current = audio.startCharge(); // Rising Pitch
      interval = setInterval(() => {
        setCharge(prev => {
            const next = Math.min(prev + 2, 100);
            if(soundRef.current) audio.updateCharge(soundRef.current, next);
            return next;
        }); 
      }, 50);
    } else {
        if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
        interval = setInterval(() => {
            setCharge(prev => Math.max(prev - 5, 0)); 
        }, 50);
    }
    return () => {
        clearInterval(interval);
        if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
    };
  }, [isCharging]);

  const handleChargeComplete = () => {
    if (currentIdx < ingredients.length - 1) {
      setCurrentIdx(p => p + 1);
      setCharge(0);
      setIsCharging(false);
      audio.playSparkle(); // Success per herb
    } else {
      onComplete();
    }
  };

  const currentHerb = ingredients[currentIdx];

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-2xl text-amber-100 mb-2 font-magical">Consecrate Ingredients</h2>
      <p className="text-sm text-amber-400/60 mb-8 font-scroll italic">
        Press and hold to imbue the ingredient with your will.
      </p>

      {/* Ingredient Card */}
      <div className="w-full bg-slate-900/60 border border-amber-900/50 p-8 rounded-xl mb-10 relative overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="absolute top-4 right-4 text-xs font-magical text-amber-500/50">
          {currentIdx + 1} / 3
        </div>
        
        {/* Ingredient Icon Display */}
        <div className={`mx-auto w-32 h-32 mb-6 flex items-center justify-center text-7xl rounded-full bg-black/30 border border-white/5 ingredient-aura transition-all duration-300 ${isCharging ? 'scale-110 ' + currentHerb.glow : ''}`}>
          <span className="drop-shadow-lg filter">{currentHerb.icon}</span>
        </div>

        <h3 className={`text-3xl font-magical mb-2 ${currentHerb.color} drop-shadow-md`}>{currentHerb.name}</h3>
        <p className="text-lg text-slate-300 font-scroll leading-relaxed">"{currentHerb.desc}"</p>
        
        {/* Visual Charge Overlay */}
        <div 
            // FIX: bg-linear-to-t syntax
            className="absolute inset-0 bg-linear-to-t from-amber-500/20 to-transparent pointer-events-none transition-opacity duration-100 mix-blend-overlay"
            style={{ opacity: charge / 100 }}
        ></div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs h-1 bg-slate-800 rounded-full mb-12 overflow-hidden">
        <div 
          // FIX: bg-linear-to-r syntax
          className="h-full bg-linear-to-r from-purple-500 via-amber-400 to-white transition-all duration-75 shadow-[0_0_10px_white]"
          style={{ width: `${charge}%` }}
        ></div>
      </div>

      {charge >= 100 ? (
        <button 
          onClick={handleChargeComplete}
          className="px-10 py-3 bg-white text-slate-900 font-magical font-bold uppercase tracking-widest animate-pulse shadow-[0_0_30px_rgba(255,255,255,0.5)] rounded-sm"
        >
          Add to Jar
        </button>
      ) : (
        <button
          onMouseDown={() => setIsCharging(true)}
          onMouseUp={() => setIsCharging(false)}
          onTouchStart={() => setIsCharging(true)}
          onTouchEnd={() => setIsCharging(false)}
          className="w-28 h-28 rounded-full border-2 border-amber-500/30 flex items-center justify-center relative overflow-hidden active:border-amber-200 active:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all"
        >
          <div className="absolute inset-0 bg-amber-600/20 scale-0 transition-transform duration-1000 rounded-full" style={{ transform: isCharging ? 'scale(1.5)' : 'scale(0)' }}></div>
          <span className="relative z-10 text-xs font-magical uppercase tracking-widest text-amber-200">Charge</span>
        </button>
      )}
    </div>
  );
};

// --- STAGE 4: THE STIR ---

const StageFourStir = ({ onComplete }: any) => {
  const [progress, setProgress] = useState(0);
  const [isStirring, setIsStirring] = useState(false);
  const [message, setMessage] = useState("Hold to Stir");
  const soundRef = useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStirring) {
      if (!soundRef.current) soundRef.current = audio.startSwirl();
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if(soundRef.current) { soundRef.current.stop(); soundRef.current = null; }
            return 100;
          }
          return prev + 0.5; 
        });
      }, 50);
    } else {
      if(soundRef.current) { soundRef.current.stop(); soundRef.current = null; }
      if (progress > 0 && progress < 100) {
        setProgress(0);
        audio.playImpact(); // Fail sound
        setMessage("The circle broke. Begin again.");
        setTimeout(() => setMessage("Hold to Stir"), 2000);
      }
    }
    return () => {
        clearInterval(interval);
        if(soundRef.current) { soundRef.current.stop(); soundRef.current = null; }
    };
  }, [isStirring, progress]);

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-2xl text-amber-100 mb-2 font-magical">Awaken the Mixture</h2>
      <p className="text-sm text-amber-400/60 mb-10 font-scroll italic">
        Create a vortex of energy. Do not stop until the circle closes.
      </p>

      {/* Visual Mixer */}
      <div className="relative w-72 h-72 mb-10 flex items-center justify-center">
        {/* Jar Rim */}
        <div className="absolute w-56 h-56 border border-slate-600/50 rounded-full"></div>
        
        {/* Spinning Ingredients */}
        <div 
          // FIX: bg-linear-to-br syntax
          className="w-48 h-48 rounded-full bg-linear-to-br from-amber-900 via-amber-950 to-black flex items-center justify-center transition-transform duration-100 ease-linear shadow-inner"
          style={{ transform: `rotate(${progress * 15}deg)` }}
        >
          <div className="absolute top-6 left-12 text-2xl opacity-70 filter blur-xs">🌹</div>
          <div className="absolute bottom-8 right-12 text-xl opacity-70 filter blur-xs">🌶️</div>
          <div className="absolute top-1/2 left-6 w-8 h-1 bg-amber-200/20 rotate-45 blur-sm"></div>
          <div className="text-amber-500/20 text-8xl font-magical">🍯</div>
        </div>

        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
          <circle cx="144" cy="144" r="130" stroke="#1e293b" strokeWidth="2" fill="none" />
          <circle 
            cx="144" cy="144" r="130" 
            stroke="#f59e0b" 
            strokeWidth="3" 
            fill="none" 
            strokeDasharray="816"
            strokeDashoffset={816 - (816 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-100 ease-linear"
          />
        </svg>
      </div>

      <div className={`h-6 text-sm font-magical uppercase tracking-widest mb-6 ${message.includes("broke") ? "text-red-400" : "text-amber-500/50"}`}>{message}</div>

      {progress >= 100 ? (
        <button 
          onClick={onComplete}
          className="px-10 py-3 bg-amber-500 text-slate-900 font-magical font-bold uppercase tracking-widest animate-bounce shadow-[0_0_30px_rgba(245,158,11,0.6)] rounded-sm"
        >
          It is Mixed
        </button>
      ) : (
        <button
          onMouseDown={() => setIsStirring(true)}
          onMouseUp={() => setIsStirring(false)}
          onTouchStart={() => setIsStirring(true)}
          onTouchEnd={() => setIsStirring(false)}
          className="p-8 rounded-full bg-slate-900 border border-slate-700 active:bg-amber-900/30 active:border-amber-500/50 transition-colors shadow-2xl"
        >
          <RotateCw className={`w-10 h-10 text-amber-100 ${isStirring ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};

// --- STAGE 5: THE INCANTATION ---

const StageFiveIncantation = ({ chant, onComplete }: any) => {
  const [lineIdx, setLineIdx] = useState(0);

  const handleTap = () => {
    audio.playImpact(); // Deep Drum/Bell Sound
    if (lineIdx < chant.length - 1) {
      setLineIdx(p => p + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] cursor-pointer" onClick={handleTap}>
      <h2 className="text-xs font-magical uppercase tracking-[0.3em] text-slate-500 mb-16">Tap rhythmically to Chant</h2>
      
      <div className="relative w-full text-center px-6 min-h-[250px] flex items-center justify-center">
        {chant.map((line: string, idx: number) => {
          if (idx !== lineIdx) return null;
          return (
            <div key={idx} className="animate-in zoom-in slide-in-from-bottom-8 duration-700">
               <h3 className="text-3xl md:text-4xl font-magical text-amber-50 leading-relaxed drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                 "{line}"
               </h3>
               <div className="mt-8 flex justify-center">
                 <div className="w-16 h-1 bg-amber-900/30 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-full animate-[ping_2s_infinite]"></div>
                 </div>
               </div>
            </div>
          )
        })}
      </div>
      
      <p className="mt-12 text-xs text-amber-500/30 font-magical uppercase tracking-widest">(Tap to speak)</p>
    </div>
  );
};

// --- STAGE 6: THE CANDLE SEAL ---

const StageSixCandle = ({ targetName, onComplete }: any) => {
  const [lit, setLit] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); 
  const [waxHeight, setWaxHeight] = useState(0);
  
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (lit && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(t => t - 1);
        setWaxHeight(prev => prev + 0.83); 
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lit, timeLeft]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl text-amber-100 mb-2 font-magical">Seal with Fire</h2>
      <p className="text-sm text-amber-400/60 mb-10 text-center font-scroll max-w-xs">
        Light the wick. Gaze into the flame until the work is finished.
      </p>

      {/* Candle Visual */}
      <div className="relative w-full h-72 flex flex-col items-center justify-end mb-8">
        
        {/* Flame */}
        {lit && timeLeft > 0 && (
          <div className="absolute bottom-[180px] z-20 mix-blend-screen" style={{ marginBottom: `-${waxHeight * 1.5}px` }}>
            <div className="w-6 h-16 bg-orange-500 rounded-full blur-xs animate-[pulse_0.1s_infinite]"></div>
            <div className="absolute top-4 left-1.5 w-3 h-10 bg-yellow-100 rounded-full blur-[2px]"></div>
            <div className="absolute -top-10 -left-6 w-20 h-20 bg-orange-600/20 rounded-full blur-2xl animate-pulse"></div>
          </div>
        )}

        {/* Candle Body */}
        <div 
          // FIX: bg-linear-to-r syntax
          className="w-20 bg-linear-to-r from-pink-300 via-pink-200 to-pink-300 rounded-t-lg relative transition-all duration-1000 overflow-hidden shadow-[inset_-10px_0_20px_rgba(0,0,0,0.3)]"
          style={{ height: `${180 - (waxHeight * 1.5)}px` }}
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-1.5 h-6 bg-slate-900"></div>
          
          {!lit && (
             <div 
               className="absolute inset-0 z-50 cursor-ew-resize"
               onMouseEnter={() => {
                   setLit(true);
                   audio.playEtch(); // Igniting sound
               }}
               onTouchMove={() => {
                   setLit(true);
                   audio.playEtch(); 
               }}
             >
                <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 text-[10px] text-white font-bold font-magical tracking-widest backdrop-blur-sm">SWIPE TO LIGHT</div>
             </div>
          )}
        </div>

        {/* Melted Wax Pool */}
        <div className="w-40 h-6 bg-pink-400/30 rounded-full mt-1 blur-md transition-all duration-1000" style={{ width: `${80 + waxHeight}px`, opacity: waxHeight/100 }}></div>
      </div>

      <div className="text-4xl font-magical text-amber-500 mb-8 drop-shadow-lg">
        {timeLeft === 0 ? "SEALED" : formatTime(timeLeft)}
      </div>

      {timeLeft === 0 ? (
         <button 
         onClick={onComplete}
         className="px-10 py-3 bg-pink-700 text-pink-100 font-magical font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(236,72,153,0.5)] animate-pulse rounded-sm border border-pink-500"
       >
         Complete Seal
       </button>
      ) : (
        <div className="h-12 flex items-center justify-center text-xs text-slate-500 font-magical uppercase tracking-widest">
           {lit ? "Focus on your desire..." : "Swipe across wick"}
        </div>
      )}
    </div>
  );
};

// --- STAGE 7: THE RELEASE ---

const StageSevenRelease = ({ onComplete }: any) => {
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const soundRef = useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCharging) {
      // FIX: Safe global access for navigator
      const globalAny = globalThis as any;
      if (typeof globalAny.navigator !== 'undefined' && globalAny.navigator.vibrate) {
          globalAny.navigator.vibrate(50); 
      }
      if (!soundRef.current) soundRef.current = audio.startCharge();
      interval = setInterval(() => {
        setPower(prev => {
            const next = Math.min(prev + 1, 100); 
            if(soundRef.current) audio.updateCharge(soundRef.current, next);
            return next;
        }); 
      }, 60); 
    } else {
      setPower(0);
      if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
    }
    return () => {
        clearInterval(interval);
        if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
    };
  }, [isCharging]);

  useEffect(() => {
    if (power >= 100) {
      audio.playSparkle();
      setTimeout(onComplete, 1000);
    }
  }, [power, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <div 
        className="transition-all duration-100 text-center mb-16"
        style={{ 
          opacity: 1 - (power / 100), 
          transform: `scale(${1 + (power/200)}) translateY(-${power}px)` 
        }}
      >
        <div className="text-7xl mb-6 filter drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">🕯️</div>
        <h2 className="text-3xl text-amber-100 font-magical">The Work is Done</h2>
        <p className="text-amber-500/50 mt-4 font-scroll italic">Release your intention to the universe.</p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {power > 20 && <div className="w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>}
        {power > 50 && <div className="w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-75"></div>}
        {power > 80 && <div className="w-full h-full bg-white/20 blur-3xl transition-opacity duration-1000"></div>}
      </div>

      <button
        onMouseDown={() => setIsCharging(true)}
        onMouseUp={() => setIsCharging(false)}
        onTouchStart={() => setIsCharging(true)}
        onTouchEnd={() => setIsCharging(false)}
        disabled={power >= 100}
        className="relative z-50 w-48 h-48 rounded-full border border-amber-500/30 flex flex-col items-center justify-center overflow-hidden group active:border-amber-200 transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-slate-900/50 backdrop-blur-sm"
      >
        <div 
          className="absolute bottom-0 left-0 right-0 bg-amber-100 transition-all duration-75 ease-linear mix-blend-overlay"
          style={{ height: `${power}%` }}
        ></div>
        <span className="relative z-10 text-amber-100 font-magical font-bold tracking-[0.2em] uppercase text-sm">
          {power >= 100 ? "RELEASED" : "MANIFEST"}
        </span>
      </button>
      
      <p className="mt-10 text-xs text-amber-500/40 animate-pulse font-magical uppercase tracking-widest">
        {isCharging ? "Sending Energy..." : "Hold to Release"}
      </p>
    </div>
  );
};