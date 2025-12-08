// --- START OF FILE src/app/spell-room/love-spells-app/soul-connect-love-spell/page.tsx ---
/// <reference lib="dom" />
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Droplets, RotateCw, Hand, Check, Moon, Volume2, VolumeX, Users, User, Flame, ScrollText, LogOut, Repeat } from 'lucide-react';
import Link from 'next/link';

/**
 * TWO SOULS CONNECTION - LOVE SPELL RITUAL
 * Updates:
 * - Unified SVG Jar (Perfect fit)
 * - Candle SVG (No artifacts)
 * - Incantation Text Size Increased
 * - Final Popup Menu
 * - Audio Pitch Cap (350Hz)
 */

// --- AUDIO ENGINE ---
class MagicAudio {
  ctx: any = null;
  masterGain: any = null;
  isMuted: boolean = false;

  init() {
    const globalAny = globalThis as any;
    if (typeof globalAny.window !== 'undefined' && !this.ctx) {
      const AudioContextClass = globalAny.window.AudioContext || globalAny.window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playDeepDrone() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.value = 55; 
    osc2.type = 'sawtooth';
    osc2.frequency.value = 55.5; 

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 2);
    
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

  playSparkle() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    [0, 0.1, 0.2, 0.3, 0.4].forEach((delay, i) => {
      if(!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const freq = 440 * Math.pow(1.25, i); 
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

  playEtch() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
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

  startCharge() {
    if (this.isMuted || !this.ctx || !this.masterGain) return null;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator(); 
    const lfoGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime); 
    
    lfo.frequency.value = 10;
    lfoGain.gain.value = 500;

    lfo.connect(lfoGain);

    osc.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.5);

    osc.start();
    lfo.start();

    return { osc, gain, lfo, startTime: this.ctx.currentTime };
  }

  updateCharge(node: any, progress: number) { 
    if (!node || !this.ctx) return;
    const now = this.ctx.currentTime;
    // PITCH CAP: 350Hz
    const targetFreq = 110 + (progress * 2.4); 
    node.osc.frequency.setTargetAtTime(targetFreq, now, 0.1);
    node.lfo.frequency.setTargetAtTime(10 + (progress/2), now, 0.1);
  }

  stopCharge(node: any) {
    if (!node || !this.ctx) return;
    const now = this.ctx.currentTime;
    node.gain.gain.setTargetAtTime(0, now, 0.1);
    node.osc.stop(now + 0.2);
    node.lfo.stop(now + 0.2);
  }

  playImpact() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 2);
  }

  startSwirl() {
    if (this.isMuted || !this.ctx || !this.masterGain) return null;
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
    filter.type = 'bandpass';
    filter.Q.value = 10;
    
    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
    gain.gain.setTargetAtTime(0.15, this.ctx.currentTime, 1);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.5;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 1000;
    
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    filter.frequency.value = 600;
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
      `${names.target} returns, only to me.`
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
      `${names.target} returns to ${names.user}, faithfully.`
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
  <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
     <div className="bg-[#1a1528] border border-amber-600/50 p-6 rounded-lg max-w-xs w-full text-center shadow-[0_0_50px_rgba(251,191,36,0.3)] transform scale-100 mx-4">
        <div className="w-12 h-12 mx-auto bg-amber-900/20 rounded-full flex items-center justify-center mb-4 border border-amber-500/30">
            <Sparkles className="text-amber-200 w-6 h-6" />
        </div>
        <h3 className="text-lg font-magical text-amber-100 mb-4">{message}</h3>
        <button 
            onClick={onContinue}
            className="w-full bg-amber-900/40 hover:bg-amber-800/40 border border-amber-600 text-amber-100 py-3 uppercase tracking-widest font-magical text-sm transition-colors"
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
    <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in zoom-in duration-500">
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

  if (!started) {
    return (
      <div className="min-h-screen bg-[#0f0a1e] text-amber-50 flex flex-col items-center justify-center p-6 font-magical text-center cursor-pointer overflow-hidden" onClick={startRitual}>
        <GlobalStyles />
        <StarField />
        
        {/* Exit Link on Opening Page */}
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

  // STAGE MAPPING:
  // 1: Petition
  // 2: Jar
  // 3: Herbs
  // 4: Incantation 
  // 5: Mixing 
  // 6: Candle
  // 7: Release

  return (
    <div className="h-screen w-full bg-[#0f0a1e] text-amber-50 overflow-hidden flex flex-col relative">
      <GlobalStyles />
      <StarField />
      
      {/* Navbar with Exit Link */}
      <div className="flex justify-between items-center p-4 z-50 shrink-0">
        <Link href="/spell-room/love-spells-app" className="text-amber-500/50 hover:text-amber-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          &larr; Exit
        </Link>
        <div className="text-amber-200/60 text-[10px] tracking-[0.2em] uppercase font-magical flex items-center gap-2">
            <Sparkles size={10} /> Step {step} / 7
        </div>
        <button onClick={toggleMute} className="text-amber-500/50 hover:text-amber-200">
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grow relative z-10 flex flex-col items-center justify-evenly p-4 w-full max-w-md mx-auto">
          {step === 1 && (
            <StageOneIntention 
              names={names} setNames={setNames} 
              intention={intention} setIntention={setIntention} 
              isForSelf={isForSelf} setIsForSelf={setIsForSelf}
              onComplete={() => {
                setActiveIngredients(determineIngredients(intention));
                setGeneratedChant(generateIncantation(names, isForSelf));
                handleStageComplete("The Sigil is active. The path is open.");
              }} 
            />
          )}

          {step === 2 && <StageTwoJar names={names} onComplete={() => handleStageComplete("The Vessel is sweetened and sealed.")} />}
          {step === 3 && <StageThreeHerbs ingredients={activeIngredients} onComplete={() => handleStageComplete("All ingredients are consecrated.")} />}
          
          {step === 4 && <StageFourIncantation chant={generatedChant} onComplete={() => handleStageComplete("The words have been spoken.")} />}
          
          {step === 5 && <StageFiveMixing ingredients={activeIngredients} names={names} onComplete={() => handleStageComplete("The spell is bound.")} />}
          
          {step === 6 && <StageSixCandle onComplete={() => handleStageComplete("The spell is sealed in fire.")} />}
          {step === 7 && <StageSevenRelease onComplete={() => setStep(8)} />}

          {step === 8 && <FinalPopup onExit={() => {}} />}
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
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
        <div className="absolute inset-0 bg-amber-600/10 blur-3xl animate-pulse rounded-full pointer-events-none"></div>

        <h2 className="text-2xl text-center text-amber-100 mb-4 font-magical drop-shadow-md">The Petition</h2>
        
        <div className="flex justify-center mb-4">
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

        <div className="space-y-4 bg-slate-900/60 p-5 rounded-xl border border-amber-900/50 shadow-xl backdrop-blur-md relative z-10">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-amber-500 mb-1 font-magical">
                {isForSelf ? "Your Name" : "First Person's Name"}
            </label>
            <input 
              value={names.user}
              onChange={(e) => setNames({...names, user: e.target.value})}
              className="w-full bg-slate-950/50 border-b border-amber-700/50 p-2 text-amber-100 font-scroll text-base focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-700"
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
              className="w-full bg-slate-950/50 border-b border-amber-700/50 p-2 text-amber-100 font-scroll text-base focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-700"
              placeholder="Whom to bind?"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-amber-500 mb-1 font-magical">Intention</label>
            <textarea 
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              className="w-full bg-slate-950/50 border border-amber-700/30 p-2 text-amber-100 font-scroll text-sm focus:outline-none focus:border-amber-400 transition-colors h-20 resize-none placeholder:text-slate-700 rounded-sm"
              placeholder="e.g. Faithful love, Return to me..."
            />
          </div>
          <button 
            disabled={!names.user || !names.target || !intention}
            onClick={() => { audio.playImpact(); setMode('sigil'); }}
            className="w-full mt-2 bg-linear-to-r from-amber-900/40 to-amber-800/40 border border-amber-600/50 text-amber-100 py-3 uppercase tracking-[0.2em] font-magical text-sm hover:bg-amber-800/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Create Petition
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center animate-in zoom-in duration-500 w-full">
      <h2 className="text-xl text-amber-100 mb-2 font-magical">Activate the Sigil</h2>
      <p className="text-xs text-amber-400/60 mb-6 font-scroll italic">Trace the symbol to lock your intention.</p>
      
      <div 
        className="relative w-64 h-64 mx-auto flex items-center justify-center cursor-crosshair touch-none"
        onMouseMove={(e) => { if(e.buttons === 1) handleTrace(); }}
        onTouchMove={handleTrace}
      >
        <div className="absolute inset-0 border-2 border-amber-900/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute inset-2 border border-amber-900/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

        <svg viewBox="0 0 100 100" className="w-40 h-40 absolute stroke-amber-800/50 fill-none stroke-2">
           <path d="M50 10 L90 90 L10 90 Z" />
           <circle cx="50" cy="55" r="15" />
        </svg>

        <svg viewBox="0 0 100 100" className="w-40 h-40 absolute stroke-amber-200 fill-none stroke-[3px] drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" style={{ clipPath: `inset(${100 - traceProgress}% 0 0 0)` }}>
           <path d="M50 10 L90 90 L10 90 Z" />
           <circle cx="50" cy="55" r="15" />
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
         <button onClick={onComplete} className="mt-8 bg-amber-700/80 text-white font-magical px-8 py-2 uppercase tracking-widest animate-pulse rounded border border-amber-500 shadow-lg text-sm">
           Confirm Sigil
         </button>
      )}
    </div>
  );
};

// --- STAGE 2: JAR (Unified SVG for Perfect Fit) ---
const StageTwoJar = ({ names, onComplete }: any) => {
  const [honeyLevel, setHoneyLevel] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [parchmentIn, setParchmentIn] = useState(false);
  const [failed, setFailed] = useState(false);
  const soundRef = useRef<any>(null);

  // SVG Coordinate System: 0 0 200 300
  // Bottle Path Definition
  const bottlePath = "M70,20 C70,10 75,0 100,0 C125,0 130,10 130,20 L130,60 C130,70 170,80 180,120 C190,160 195,200 170,260 C145,300 55,300 30,260 C5,200 10,160 20,120 C30,80 70,70 70,60 Z";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPouring && parchmentIn && !failed) {
      if (!soundRef.current) soundRef.current = audio.startCharge();
      interval = setInterval(() => {
        setHoneyLevel(prev => {
          if (prev >= 280) { // SVG Height check approx
            setFailed(true); setIsPouring(false);
            if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
            audio.playImpact();
            return prev;
          }
          if(soundRef.current) audio.updateCharge(soundRef.current, prev/2);
          return prev + 2; // Pixel growth
        });
      }, 30); 
    } else {
        if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
    }
    return () => { clearInterval(interval); if(soundRef.current) audio.stopCharge(soundRef.current); };
  }, [isPouring, parchmentIn, failed]);

  const reset = () => { setHoneyLevel(0); setFailed(false); audio.playSparkle(); };

  // Calculate percentage for progress check
  const pct = (honeyLevel / 230) * 100;

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-xl text-amber-100 mb-1 font-magical">The Sweetening Jar</h2>
      <p className="text-xs text-amber-400/60 mb-6 text-center font-scroll h-4">
        {!parchmentIn ? "Tap to place petition." : "Hold button to pour honey."}
      </p>

      {/* Unified SVG Jar */}
      <div className="relative w-56 h-80 mb-6">
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

            {/* Liquid Group (Clipped) */}
            <g clipPath="url(#bottleClip)">
                {/* Honey Rect - Y grows from bottom (300) upwards */}
                <rect 
                    x="0" 
                    y={300 - honeyLevel} 
                    width="200" 
                    height={honeyLevel} 
                    fill="url(#honeyGrad)" 
                    opacity="0.9"
                />
                
                {/* Target Line (at y=100 roughly) */}
                <line x1="0" y1="100" x2="200" y2="100" stroke={pct > 75 && pct < 100 ? "lime" : "rgba(255,255,255,0.2)"} strokeWidth="1" strokeDasharray="4 2" />

                {/* Parchment Logic inside SVG */}
                <g transform={`translate(100, ${parchmentIn ? 180 : -50})`} opacity={parchmentIn ? 1 : 0} style={{ transition: 'all 1s ease-in-out' }}>
                    <rect x="-30" y="-40" width="60" height="80" fill="#f3e5ab" stroke="#78350f" strokeWidth="0.5" />
                    <text x="0" y="-10" fontSize="6" textAnchor="middle" fill="#000" fontFamily="serif">{names.user}</text>
                    <text x="0" y="5" fontSize="6" textAnchor="middle" fill="#b91c1c" fontFamily="serif">&</text>
                    <text x="0" y="20" fontSize="6" textAnchor="middle" fill="#000" fontFamily="serif">{names.target}</text>
                </g>
            </g>

            {/* Glass Outline Overlay */}
            <path d={bottlePath} fill="none" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5" />
            
            {/* Highlights */}
            <path d="M40,140 Q60,140 60,180" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
         </svg>
      </div>

      {failed && <div className="text-red-400 text-xs mb-4 font-magical bg-red-900/20 px-3 py-1 rounded">Overflow. Try again.</div>}

      {!parchmentIn ? (
        <button onClick={() => { setParchmentIn(true); audio.playSparkle(); }} className="px-8 py-2 bg-[#f3e5ab] text-slate-900 font-magical font-bold text-sm shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:scale-105 transition-transform">
          Insert Petition
        </button>
      ) : (
        <>
          {failed ? (
            <button onClick={reset} className="px-6 py-2 border border-red-500 text-red-400 font-magical text-xs uppercase tracking-wider">Clean Jar</button>
          ) : (
            <>
              {pct > 80 && pct < 100 && !isPouring ? (
                 <button onClick={onComplete} className="bg-green-900/40 border border-green-500 text-green-200 px-8 py-2 uppercase tracking-[0.2em] font-magical text-sm animate-pulse">
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
                   <div className="relative z-10 flex flex-col items-center">
                     <Droplets className={`w-6 h-6 ${isPouring ? 'text-white' : 'text-amber-500'}`} />
                     <span className="text-[8px] uppercase font-bold mt-1 text-amber-200/70">(Hold)</span>
                   </div>
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

// --- STAGE 3: HERBS ---
const StageThreeHerbs = ({ ingredients, onComplete }: any) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [charge, setCharge] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [herbSuccess, setHerbSuccess] = useState(false); 
  const soundRef = useRef<any>(null);
  const currentHerb = ingredients[currentIdx];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCharging && !herbSuccess) {
      if (!soundRef.current) soundRef.current = audio.startCharge(); 
      interval = setInterval(() => {
        setCharge(prev => {
            const next = Math.min(prev + 2.5, 100); 
            if(soundRef.current) audio.updateCharge(soundRef.current, next);
            return next;
        }); 
      }, 50);
    } else {
        if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
        if (!herbSuccess) setCharge(0); 
    }
    return () => { clearInterval(interval); if(soundRef.current) audio.stopCharge(soundRef.current); };
  }, [isCharging, herbSuccess]);

  useEffect(() => {
      if(charge >= 100 && !herbSuccess) {
        setIsCharging(false);
        audio.playSparkle();
        setHerbSuccess(true); 
      }
  }, [charge, herbSuccess]);

  const nextHerb = () => {
    setHerbSuccess(false);
    setCharge(0);
    if(currentIdx < ingredients.length - 1) {
        setCurrentIdx(p => p + 1);
    } else {
        onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center text-center w-full relative">
      <h2 className="text-xl text-amber-100 mb-1 font-magical">Consecrate Herbs</h2>
      <p className="text-xs text-amber-400/60 mb-6 font-scroll italic">Hold to imbue energy.</p>

      {/* Ingredient Display with Glitter Fill */}
      <div className="w-64 h-64 bg-slate-900/40 border border-amber-900/50 rounded-full flex flex-col items-center justify-center mb-8 relative overflow-hidden backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)] group">
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
            {currentHerb.icon}
         </div>
         <h3 className={`relative z-10 text-2xl font-magical ${currentHerb.color} mb-1`}>{currentHerb.name}</h3>
         <p className="relative z-10 text-sm text-slate-400 font-scroll italic px-4">"{currentHerb.desc}"</p>
         <div className="absolute top-4 text-[10px] text-slate-600 font-bold tracking-widest">{currentIdx + 1} / 3</div>
      </div>

      <button
        onMouseDown={() => setIsCharging(true)}
        onMouseUp={() => setIsCharging(false)}
        onTouchStart={() => setIsCharging(true)}
        onTouchEnd={() => setIsCharging(false)}
        className="w-24 h-24 rounded-full border border-amber-500/40 flex flex-col items-center justify-center relative overflow-hidden active:scale-95 transition-all bg-slate-900"
      >
        <div className="absolute bottom-0 w-full bg-amber-600/30 transition-all duration-75" style={{ height: `${charge}%` }}></div>
        <Sparkles className="w-6 h-6 text-amber-200 mb-1" />
        <span className="relative z-10 text-[9px] font-magical uppercase tracking-widest text-amber-100">(Hold)</span>
      </button>

      {herbSuccess && (
          <MagickPopup 
            message={`${currentHerb.name} is Consecrated.`} 
            buttonText={currentIdx < ingredients.length - 1 ? "Next Ingredient" : "Finish Herbs"} 
            onContinue={nextHerb} 
          />
      )}
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
    <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer" onClick={handleTap}>
      {/* Updated Text Header */}
      <h2 className="text-base md:text-xl font-magical uppercase tracking-[0.2em] text-amber-200/80 mb-2 text-center leading-tight max-w-xs">
          REPEAT THE CHANT, ALOUD OR INTERNALLY WITH POWER
      </h2>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-12">TAP WHEN DONE</p>
      
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

  const mixItems = [...ingredients, { icon: <ScrollText size={32} className="text-amber-100" />, name: 'Petition' }];

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
    <div className="flex flex-col items-center text-center w-full">
      <h2 className="text-xl text-amber-100 mb-1 font-magical">Bind the Energy</h2>
      <p className="text-xs text-amber-400/60 mb-8 font-scroll italic">Hold to stir the ingredients.</p>

      <div className="relative w-56 h-56 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 border border-slate-700 rounded-full bg-black/40"></div>
        
        <div 
          className="w-48 h-48 rounded-full bg-linear-to-br from-amber-900 to-black flex items-center justify-center shadow-inner overflow-hidden relative"
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
                    transform: `rotate(${-progress * 15}deg)` 
                 }}
               >
                 {item.icon}
               </div>
             );
           })}
           
           <div className="absolute w-full h-full bg-linear-to-r from-transparent via-amber-500/10 to-transparent animate-spin duration-700 opacity-50"></div>
        </div>

        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
          <circle cx="112" cy="112" r="105" stroke="#1e293b" strokeWidth="2" fill="none" />
          <circle cx="112" cy="112" r="105" stroke="#f59e0b" strokeWidth="4" fill="none" strokeDasharray="660" strokeDashoffset={660 - (660 * progress) / 100} strokeLinecap="round" />
        </svg>
      </div>

      {progress >= 100 ? (
        <button onClick={onComplete} className="px-8 py-2 bg-amber-600 text-white font-magical uppercase tracking-widest text-sm rounded shadow-lg animate-bounce">
          Mixture Bound
        </button>
      ) : (
        <button
          onMouseDown={() => setIsStirring(true)}
          onMouseUp={() => setIsStirring(false)}
          onTouchStart={() => setIsStirring(true)}
          onTouchEnd={() => setIsStirring(false)}
          className="w-20 h-20 rounded-full bg-slate-800 border border-slate-600 flex flex-col items-center justify-center active:bg-amber-900/20 active:border-amber-500 transition-colors"
        >
          <RotateCw className={`w-6 h-6 text-amber-100 mb-1 ${isStirring ? 'animate-spin' : ''}`} />
          <span className="text-[8px] uppercase font-bold text-amber-200/70">(Hold)</span>
        </button>
      )}
    </div>
  );
};

// --- STAGE 6: CANDLE (SVG to prevent artifacts) ---
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
    <div className="flex flex-col items-center w-full">
      <h2 className="text-xl text-amber-100 mb-1 font-magical">Seal with Fire</h2>
      <p className="text-xs text-amber-400/60 mb-8 font-scroll italic">
          {lit ? "Focus on your desire..." : "Tap the wick to light the candle."}
      </p>

      {/* SVG Candle to avoid lines */}
      <div className="relative h-64 w-32 flex flex-col items-center justify-end mb-6">
        
        {/* Flame SVG */}
        {lit && timeLeft > 0 && (
          <div className="absolute z-20 mix-blend-screen animate-in fade-in duration-500" style={{ bottom: `${waxHeight}px`, transition: 'bottom 1s linear' }}>
             <svg width="40" height="60" viewBox="0 0 40 60">
                <path d="M20,0 Q35,30 20,60 Q5,30 20,0" fill="orange" className="animate-[pulse_0.1s_infinite]" />
                <path d="M20,10 Q28,35 20,50 Q12,35 20,10" fill="#fef3c7" className="blur-[1px]" />
             </svg>
             <div className="absolute -top-10 -left-6 w-24 h-24 bg-orange-600/20 rounded-full blur-2xl animate-pulse"></div>
          </div>
        )}

        {/* Wax SVG Body */}
        <svg width="80" height="180" viewBox="0 0 80 180" className="drop-shadow-lg">
             {/* Wick */}
             <rect x="38" y={180 - waxHeight - 10} width="4" height="10" fill="black" />
             
             {/* Body */}
             <rect 
                x="10" 
                y={180 - waxHeight} 
                width="60" 
                height={waxHeight} 
                fill="url(#candleGrad)" 
                rx="4"
                style={{ transition: 'all 1s linear' }}
             />
             
             {/* Gradient Def */}
             <defs>
                <linearGradient id="candleGrad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#f9a8d4" />
                    <stop offset="50%" stopColor="#fce7f3" />
                    <stop offset="100%" stopColor="#f9a8d4" />
                </linearGradient>
             </defs>
        </svg>

        {/* Tap Area for Lighting */}
        {!lit && (
             <div 
               className="absolute z-50 w-20 h-20 -mt-32 cursor-pointer flex items-center justify-center"
               onClick={() => { setLit(true); audio.playEtch(); }}
             >
                 <div className="w-8 h-8 rounded-full bg-white/10 animate-ping"></div>
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
                <button onClick={onComplete} className="px-8 py-2 bg-pink-700 text-white font-magical uppercase tracking-widest text-sm rounded shadow-[0_0_20px_rgba(236,72,153,0.5)] animate-in zoom-in">
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
            const next = Math.min(prev + 1.5, 100); 
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
          setTimeout(onComplete, 1500); 
      }
  }, [power, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden">
      <div 
        className="text-center mb-12 transition-all duration-1000 ease-in-out" 
        style={{ 
            opacity: power >= 100 ? 0 : 1 - (power/100), 
            transform: power >= 100 ? `scale(0.5) translateY(-500px)` : `scale(${1+(power/200)})`,
            filter: power >= 100 ? 'blur(10px)' : 'none'
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
        className={`relative w-40 h-40 rounded-full border border-amber-500/30 flex flex-col items-center justify-center overflow-hidden bg-slate-900/50 backdrop-blur-sm group active:border-amber-200 transition-all ${power >= 100 ? 'opacity-0 duration-1000' : ''}`}
      >
        <div className="absolute bottom-0 left-0 right-0 bg-amber-100 mix-blend-overlay transition-all duration-75" style={{ height: `${power}%` }}></div>
        <span className="relative z-10 text-amber-100 font-magical font-bold tracking-widest uppercase text-xs">
          RELEASE
        </span>
        <span className="relative z-10 text-[8px] text-amber-500/70 mt-1 uppercase font-bold">(Hold)</span>
      </button>

      {/* Floating particles on release */}
      {power >= 100 && (
          <div className="absolute inset-0 z-0">
             <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full animate-[ping_1s_ease-out_infinite]"></div>
             <div className="absolute top-1/2 left-1/2 w-1 h-50 bg-amber-200/50 animate-[pulse_0.5s_infinite]"></div>
          </div>
      )}
    </div>
  );
};