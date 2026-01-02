// --- START OF FILE src/app/spell-room/love-spells-app/soul-connect-love-spell/page.tsx ---
/// <reference lib="dom" />
"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Sparkles, Droplets, RotateCw, Hand, Check, Moon, Volume2, VolumeX, Users, User, Flame, LogOut, Repeat, Star, ArrowDown, Scroll, Wand2, Book, Save, Skull, AlertTriangle, BookOpen, RotateCcw, Coins } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { generateLoveSpell, saveSpell } from '@/lib/services/geminiService';
import { getSpellById } from '@/lib/services/spellService';
import { buySpellSlots } from '@/lib/services/economyService';
import { useAetherEconomy } from '@/hooks/useAetherEconomy';
import type { Session } from '@/lib/types';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import LoadingSpinner from '@/app/components/LoadingSpinner';

// --- CONFIGURATION ---
const SERVICE_SLUG_GEN = 'ai_love_spell';
const SERVICE_SLUG_SAVE = 'save_spell_love';

// --- AUDIO ENGINE ---
class MagicAudio {
  ctx: any = null;
  masterGain: any = null;
  reverbNode: any = null;
  isMuted: boolean = false;
  
  scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; 

  init() {
    const globalAny = globalThis as any;
    if (typeof globalAny.window !== 'undefined' && !this.ctx) {
      const AudioContextClass = globalAny.window.AudioContext || globalAny.window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.45;

        this.reverbNode = this.ctx.createConvolver();
        this.reverbNode.buffer = this.createImpulseResponse(2.5, 2.0); 
        
        const wetGain = this.ctx.createGain();
        wetGain.gain.value = 0.35; 
        
        this.masterGain.connect(this.reverbNode);
        this.reverbNode.connect(wetGain);
        wetGain.connect(this.ctx.destination);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  createImpulseResponse(duration: number, decay: number) {
    const rate = this.ctx.sampleRate;
    const length = rate * duration;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        const n = length - i;
        const multi = Math.pow(n / length, decay);
        left[i] = (Math.random() * 2 - 1) * 0.05 * multi;
        right[i] = (Math.random() * 2 - 1) * 0.05 * multi;
    }
    return impulse;
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  playClick(level: 'soft' | 'medium' | 'magick') {
    this.ensureContext();
    if (this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);

    if (level === 'soft') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (level === 'medium') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5); 
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (level === 'magick') {
        this.playSparkle(); 
        const thump = this.ctx.createOscillator();
        const thumpGain = this.ctx.createGain();
        thump.type = 'triangle';
        thump.frequency.setValueAtTime(150, now);
        thump.frequency.exponentialRampToValueAtTime(60, now + 0.3);
        thumpGain.gain.setValueAtTime(0, now);
        thumpGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        thump.connect(thumpGain);
        thumpGain.connect(this.masterGain);
        thump.start(now);
        thump.stop(now + 0.5);
    }
  }

  playSparkle() {
    this.ensureContext();
    if (this.isMuted) return;
    const now = this.ctx.currentTime;
    [0, 0.08, 0.16, 0.24].forEach((delay) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const freq = this.scale[Math.floor(Math.random() * this.scale.length)] * 2; 
      osc.frequency.setValueAtTime(freq, now + delay);
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.08, now + delay + 0.05); 
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.8); 
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + delay);
      osc.stop(now + delay + 0.8);
    });
  }

  playTraceTone() {
    this.ensureContext();
    if (this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const freq = this.scale[Math.floor(Math.random() * this.scale.length)];
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(now + 0.8);
  }

  createChargeNodes(mainGain: any) {
    const nodes: any[] = [];
    const now = this.ctx.currentTime;
    const padOsc = this.ctx.createOscillator();
    padOsc.type = 'triangle';
    padOsc.frequency.value = 261.63; 
    const padFilter = this.ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 600; 
    padOsc.connect(padFilter);
    padFilter.connect(mainGain);
    padOsc.start(now);
    nodes.push({ osc: padOsc, filter: padFilter, type: 'pad' });

    const shimmerOsc = this.ctx.createOscillator();
    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.value = 523.25; 
    const shimmerGain = this.ctx.createGain();
    shimmerGain.gain.value = 0.1; 
    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(mainGain);
    shimmerOsc.start(now);
    nodes.push({ osc: shimmerOsc, gain: shimmerGain, type: 'shimmer' });
    return nodes;
  }

  startCharge() {
    this.ensureContext();
    if (this.isMuted) return null;
    const now = this.ctx.currentTime;
    const mainGain = this.ctx.createGain();
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.4, now + 0.05); 
    mainGain.connect(this.masterGain);
    const nodes = this.createChargeNodes(mainGain);
    return { nodes, mainGain, type: 'steady' };
  }

  startHighPassCharge() {
    this.ensureContext();
    if (this.isMuted) return null;
    const now = this.ctx.currentTime;
    const mainGain = this.ctx.createGain();
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.4, now + 0.05);
    const hpf = this.ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 300;
    mainGain.connect(hpf);
    hpf.connect(this.masterGain);
    const nodes = this.createChargeNodes(mainGain);
    return { nodes, mainGain, type: 'hpf' };
  }

  updateCharge(node: any, progress: number) { 
    if (!node || !this.ctx) return;
    const now = this.ctx.currentTime;
    const p = Math.max(0, Math.min(1, progress / 100)); 
    node.nodes.forEach((n: any) => {
        if (n.type === 'pad') {
            const targetFreq = 600 + (p * 600);
            n.filter.frequency.setTargetAtTime(targetFreq, now, 0.1);
        } else if (n.type === 'shimmer') {
            n.gain.gain.setTargetAtTime(0.1 + (p * 0.3), now, 0.1);
        }
    });
    const vol = 0.4 + (p * 0.4);
    node.mainGain.gain.setTargetAtTime(vol, now, 0.1);
  }

  stopCharge(node: any) {
    if (!node || !this.ctx) return;
    const now = this.ctx.currentTime;
    try {
        node.mainGain.gain.cancelScheduledValues(now);
        node.mainGain.gain.setTargetAtTime(0, now, 0.3); 
        node.nodes.forEach((n: any) => n.osc.stop(now + 0.5));
    } catch(e) {}
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
    @keyframes leaf-sway {
        0% { transform: translateX(0px) rotate(0deg); }
        25% { transform: translateX(10px) rotate(5deg); }
        50% { transform: translateX(-10px) rotate(-5deg); }
        75% { transform: translateX(5px) rotate(2deg); }
        100% { transform: translateX(0px) rotate(0deg); }
    }
    .leaf-motion {
        animation: leaf-sway 4s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
    }
    @keyframes glow-pulse {
        0%, 100% { filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.5)); }
        50% { filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.8)); }
    }
    .glow-active { animation: glow-pulse 2s infinite ease-in-out; }
  `}</style>
);

// --- RHYMING INCANTATION GENERATOR ---
const getIncantation = (type: string, isForSelf: boolean, data: any) => {
    // 1. Check for AI Custom Override first
    // Note: AI might return 'chant', 'incantation', or 'customChant'
    if (data.customChant) {
        let btn = "I Speak The Words";
        if (type === 'charge') btn = `I Charge This ${data.item || 'Item'}`;
        if (type === 'honey') btn = "I Pour The Sweetness";
        if (type === 'mix') btn = "I Stir The Bond"; 
        if (type === 'candle') btn = "I Light The Flame";
        if (type === 'release') btn = "I Release The Spell";
        
        return { text: data.customChant, btn };
    }

    // 2. Fallback to Standard
    const target = data.target || "my love";
    const item = data.item || "this charm";
    
    const INCANTATIONS: any = {
        sigil: {
            self: { text: "I trace this sign to open the way,\nFor my true love to come and stay.", btn: "I Open The Way" },
            couple: { text: "I trace this sign to open the way,\nFor their true love to come and stay.", btn: "I Open The Way" }
        },
        petition: {
             self: { text: "My written will, I place inside,\nWith open arms and nothing to hide.", btn: "I Place My Will" },
             couple: { text: "Their names written, I place inside,\nWith open arms and nothing to hide.", btn: "I Place The Petition" }
        },
        charge: {
            self: { text: `I wake this ${item} with power so bright,\nTo bring my heart its true delight.`, btn: `I Charge This ${item}` },
            couple: { text: `I wake this ${item} with power so bright,\nTo guide them to the loving light.`, btn: `I Charge This ${item}` }
        },
        drop: {
            self: { text: `Into the vessel, this ${item} I cast,\nTo make a love that's built to last.`, btn: `I Cast It In` },
            couple: { text: `Into the vessel, this ${item} I cast,\nTo bind their love and hold it fast.`, btn: `I Cast It In` }
        },
        honey: {
            self: { text: "I pour this sweetness, thick and gold,\nTo keep my love from growing cold.", btn: "I Pour The Sweetness" },
            couple: { text: "I pour this sweetness, thick and gold,\nTo keep their love from growing cold.", btn: "I Pour The Sweetness" }
        },
        mix: {
            self: { text: "Round and round, the energies blend,\nMy loneliness comes to an end.", btn: "I Stir The Bond" },
            couple: { text: "Round and round, the energies blend,\nA broken bond, I aim to mend.", btn: "I Stir The Bond" }
        },
        candle: {
            self: { text: `I light this flame, a beacon bright,\nTo draw ${target} through the night.`, btn: "I Light The Flame" },
            couple: { text: `I light this flame, a beacon bright,\nTo warm their hearts with loving light.`, btn: "I Light The Flame" }
        },
        release: {
            self: { text: "I send this spell into the air,\nTo find my love and bring them there.", btn: "I Release The Spell" },
            couple: { text: "I send this spell into the air,\nTo bind this couple, pair to pair.", btn: "I Release The Spell" }
        }
    };
    return INCANTATIONS[type][isForSelf ? 'self' : 'couple'];
};

// --- HELPER LOGIC ---
const HERB_DATABASE: Record<string, any[]> = {
  blockage: [
    { name: 'Lemon Balm', icon: '🌿', desc: 'Clears away confusion.', color: 'text-yellow-300' },
    { name: 'Chilli Flakes', icon: '🌶️', desc: 'Burns away obstacles.', color: 'text-red-500' },
    { name: 'Sea Salt', icon: '🧂', desc: 'Neutralizes the past.', color: 'text-white' },
    { name: 'Black Pepper', icon: '⚫', desc: 'Banishes jealousy.', color: 'text-gray-400' }
  ],
  attract: [
    { name: 'Rose', icon: '🌹', desc: 'Invites soft romance.', color: 'text-pink-400' },
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

// --- COMPONENT: PRE-STEP INCANTATION ---
const PreStepIncantation = ({ type, isForSelf, data, onNext }: any) => {
    const content = getIncantation(type, isForSelf, data);
    let visual = <Scroll className="text-amber-200 w-8 h-8" />;
    if (type === 'sigil') visual = <Hand className="text-amber-200 w-8 h-8" />;
    else if (type === 'petition') visual = <Scroll className="text-amber-200 w-8 h-8" />;
    else if (type === 'honey') visual = <Droplets className="text-amber-400 w-8 h-8" />;
    else if (type === 'mix') visual = <RotateCw className="text-amber-200 w-8 h-8" />;
    else if (type === 'candle') visual = <Flame className="text-orange-400 w-8 h-8" />;
    else if (type === 'release') visual = <Star className="text-white w-8 h-8" />;
    else if ((type === 'charge' || type === 'drop') && data.icon) {
        visual = <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">{data.icon}</span>;
    }

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-500 p-6 no-select">
            <div className="flex flex-col items-center text-center max-w-sm w-full">
                <div className="w-20 h-20 bg-amber-900/20 rounded-full flex items-center justify-center mb-6 border border-amber-500/30 shadow-[0_0_30px_rgba(251,191,36,0.2)] animate-pulse">
                     {visual}
                </div>
                <p className="text-lg text-amber-300 uppercase tracking-[0.2em] mb-6 font-bold font-magical">Repeat this Incantation</p>
                <h3 className="text-xl md:text-2xl font-magical text-amber-50 mb-8 leading-relaxed whitespace-pre-line drop-shadow-lg">
                    "{content.text}"
                </h3>
                <button 
                    onClick={() => {
                        const globalAny = globalThis as any;
                        audio.playClick('magick');
                        onNext();
                    }}
                    className="w-full bg-amber-900/40 hover:bg-amber-800/40 border border-amber-600 text-amber-50 py-4 uppercase tracking-[0.2em] font-magical text-base transition-colors active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                >
                    {content.btn}
                </button>
            </div>
        </div>
    );
};

// --- COMPONENT: POPUP MODAL ---
const MagickPopup = ({ message, buttonText = "Continue", onContinue }: { message: string, buttonText?: string, onContinue: () => void }) => (
  <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 no-select">
     <div className="bg-[#1a1528] border border-amber-600/50 p-6 rounded-lg max-w-xs w-full text-center shadow-[0_0_50px_rgba(251,191,36,0.3)] transform scale-100 mx-4">
        <div className="w-12 h-12 mx-auto bg-amber-900/20 rounded-full flex items-center justify-center mb-4 border border-amber-500/30">
            <Sparkles className="text-amber-200 w-6 h-6" />
        </div>
        <h3 className="text-lg font-magical text-amber-100 mb-4">{message}</h3>
        <button 
            onClick={() => {
                const globalAny = globalThis as any;
                audio.playClick('medium');
                onContinue();
            }}
            className="w-full bg-amber-900/40 hover:bg-amber-800/40 border border-amber-600 text-amber-50 py-3 uppercase tracking-widest font-magical text-base transition-colors active:scale-95"
        >
            {buttonText}
        </button>
     </div>
  </div>
);

// --- COMPONENT: FINAL MODAL ---
const FinalPopup = ({ onExit, onSave, isSaving, isSaved, saveCost }: { onExit: () => void, onSave: () => void, isSaving: boolean, isSaved: boolean, saveCost: number }) => {
  const router = typeof window !== 'undefined' ? (window as any).location : { reload: () => {} };
  const [hasSaved, setHasSaved] = useState(false);

  const handleSave = () => {
    if (hasSaved || isSaved) return;
    audio.playClick('magick');
    onSave();
    setHasSaved(true);
  };
  
  return (
    <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in zoom-in duration-500 no-select">
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
                    disabled={isSaved || isSaving}
                    onClick={handleSave}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-900/40 border border-indigo-500/50 text-indigo-100 py-3 uppercase tracking-widest font-magical text-xs hover:bg-indigo-800/50 transition-colors disabled:opacity-50"
                >
                    {isSaving ? (
                        <>Saving...</>
                    ) : isSaved ? (
                        <><Check size={14} /> Saved</>
                    ) : (
                        <><Save size={14} /> Save to Grimoire ({saveCost} Credits)</>
                    )}
                </button>
                <button 
                    onClick={() => { audio.playClick('medium'); router.reload(); }}
                    className="w-full flex items-center justify-center gap-2 bg-amber-900/30 border border-amber-600/50 text-amber-50 py-3 uppercase tracking-widest font-magical text-xs hover:bg-amber-800/40 transition-colors"
                >
                    <Repeat size={14} /> Cast Another Spell
                </button>
                <Link 
                    href="/spell-room/love-spells-app"
                    onClick={() => audio.playClick('medium')}
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

// --- COMPONENT: SLOT PURCHASE MODAL ---
const SlotPurchaseModal = ({ isOpen, onClose, onPurchase, isProcessing }: { isOpen: boolean, onClose: () => void, onPurchase: () => void, isProcessing: boolean }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in">
            <div className="bg-[#1a1a2e] border border-amber-500/50 rounded-xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(251,191,36,0.2)]">
                <BookOpen size={48} className="text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-serif text-amber-100 mb-2">Grimoire Full</h3>
                <p className="text-gray-400 text-sm mb-6">
                    Your book of shadows has reached its capacity. Expand your grimoire by 5 slots to continue saving your workings.
                </p>
                <div className="flex flex-col gap-3">
                    <button onClick={onPurchase} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded uppercase tracking-wider text-xs transition-colors disabled:opacity-50">
                        {isProcessing ? "Expanding..." : "Expand Storage (-10 Aether)"}
                    </button>
                    <button onClick={onClose} className="text-gray-500 hover:text-white text-xs underline">Cancel</button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: MAIN PAGE CONTENT ---

function SoulConnectContent() {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [step, setStep] = useState(1);
  const [names, setNames] = useState({ user: '', target: '' });
  const [intention, setIntention] = useState('');
  const [isForSelf, setIsForSelf] = useState(true);
  
  const [activeIngredients, setActiveIngredients] = useState<any[]>([]);
  const [addedIngredients, setAddedIngredients] = useState<any[]>([]);
  const [generatedChant, setGeneratedChant] = useState<string[]>([]);
  const [stepChants, setStepChants] = useState<{ honey?: string, mix?: string, candle?: string, release?: string }>({});

  const [showSuccess, setShowSuccess] = useState<{msg: string, btn?: string} | null>(null);

  // New State for Deep Weaving & Replay
  const [isAI, setIsAI] = useState(false);
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  
  // Aether Balance
  const [aetherBalance, setAetherBalance] = useState<number | null>(null);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  // Economy
  const { 
    cost: genCost, 
    spendAether: spendGenCredits, 
    paymentError: genPaymentError, 
    clearPaymentError: clearGenError,
    showStoreLink: showGenStoreLink,
    isProcessingPayment: isGenProcessing
  } = useAetherEconomy(SERVICE_SLUG_GEN);

  const {
      cost: saveCost,
      spendAether: spendSaveCredits,
      paymentError: savePaymentError,
      clearPaymentError: clearSaveError,
      showStoreLink: showSaveStoreLink,
      isProcessingPayment: isSaveProcessing
  } = useAetherEconomy(SERVICE_SLUG_SAVE);

  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const loadId = searchParams.get('loadId');

  // Fetch Balance
  useEffect(() => {
      const fetchBalance = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const { data } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
              if (data) setAetherBalance(data.credits);
          }
      };
      fetchBalance();
  }, []);

  // --- REPLAY HYDRATION ---
  useEffect(() => {
      if (loadId) {
          const loadSpell = async () => {
              try {
                  const spell = await getSpellById(loadId);
                  if (spell && spell.ritual_data) {
                      const data = typeof spell.ritual_data === 'string' 
                          ? JSON.parse(spell.ritual_data) 
                          : spell.ritual_data;
                      
                      if(data) {
                          setNames(data.names || { user: '', target: '' });
                          setIntention(data.intention || spell.intention || '');
                          setIsForSelf(data.isForSelf ?? true);
                          setActiveIngredients(data.ingredients || []);
                          setGeneratedChant(data.incantation || []);
                          setStepChants(data.stepChants || {});

                          setIsReplayMode(true);
                          setIsSaved(true); 
                          setIsAI(true); // Flag to use custom data, not to re-run AI
                          setStarted(true); 
                          setStep(1);
                      } else {
                          setAppError("Saved spell data is corrupted and cannot be replayed.");
                      }
                  } else if (spell) {
                       setAppError("This spell was saved with an older version and cannot be replayed.");
                  }
              } catch (e) {
                  console.error("Failed to load spell:", e);
                  setAppError("Could not load the saved spell from your Grimoire.");
              }
          };
          loadSpell();
      }
  }, [loadId]);

  const startRitual = () => {
    audio.init();
    audio.playClick('magick'); // Start is a major event
    setStarted(true);
  };

  const toggleMute = () => {
    audio.playClick('soft');
    setMuted(!muted);
    audio.isMuted = !muted;
  };
  
  const handleStageComplete = (msg: string, btnText: string = "Continue") => {
    setShowSuccess({ msg, btn: btnText });
  };

  const nextStep = () => {
    setShowSuccess(null);
    audio.playClick('medium');
    setStep(s => s + 1);
  };

  const handlePetitionDone = (mode: 'standard' | 'ai' | 'replay', data?: any) => {
      // Replay Bypass: State is already hydrated, just proceed.
      if (mode === 'replay') {
          handleStageComplete("The Scroll is unsealed. The path re-opens.");
          return;
      }

      setIsAI(mode === 'ai');
      
      if (mode === 'ai' && data) {
          const aiIngredients = data.ingredients.map((ing: any) => ({
             ...ing,
             color: ing.color || 'text-amber-300',
             // ROBUST MAPPING: Check multiple possible AI return keys
             chant: ing.chant || ing.incantation || ing.description || "I charge this component with my will."
          }));
          setActiveIngredients(aiIngredients);
          setGeneratedChant(data.incantation);
          
          // ROBUST MAPPING: Check multiple keys for step chants
          const steps = data.step_chants || data.stepChants || {};
          setStepChants(steps);

      } else {
          // Standard Mode Logic
          setActiveIngredients(determineIngredients(intention));
          setGeneratedChant(generateIncantation(names, isForSelf));
          // Reset step chants to empty so defaults are used
          setStepChants({});
      }

      // Update Balance in UI after spend
      if (mode === 'ai') {
         setAetherBalance(prev => (prev !== null ? prev - genCost : null));
      }

      handleStageComplete(mode === 'ai' ? "The spirits have spoken. The path is set." : "The Sigil is active. The path is open.");
  };

  const handleIngredientDrop = (ing: any) => {
    setAddedIngredients([...addedIngredients, ing]);
    nextStep();
  };

  const handleBuySlots = async () => {
        const { data: { user } } = await createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        ).auth.getUser();

        if (!user) return;
        setSlotLoading(true);
        const success = await buySpellSlots(user.id);
        setSlotLoading(false);
        if (success) {
            setShowSlotModal(false);
            saveToGrimoire(); // Retry save
        } else {
            setAppError("Insufficient Aether to expand Grimoire.");
            setShowSlotModal(false);
        }
    };

  const saveToGrimoire = async () => {
     if (isSaved) return;

     const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     );
     
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) {
         setAppError("You must be logged in.");
         return;
     }

     setIsSaving(true);
     setAppError(null);
     clearSaveError();

     try {
         // 1. Deduct Credits using Save Cost if applicable
         if (!isReplayMode) { // Do not charge for re-saving
            const paid = await spendSaveCredits(user.id);
            if (!paid) {
                setIsSaving(false);
                return;
            }
            setAetherBalance(prev => (prev !== null ? prev - saveCost : null));
         }

         // 2. Save
         const finalIncantation = generatedChant.join('\n');
         
         // Store full data for hydration including chants and intention
         const ritualData = {
             intention: intention,
             ingredients: activeIngredients,
             incantation: generatedChant, 
             names,
             isForSelf,
             stepChants,
             timestamp: new Date().toISOString()
         };

         await saveSpell(user.id, {
             name: `Love Spell for ${names.target}`,
             intention: intention,
             incantation: finalIncantation,
             element: "love",
             tradition: 'LOVE',
             ritual_data: ritualData
         });

         setIsSaved(true);
         audio.playClick('magick');
     } catch (e: any) {
         console.error("Failed to save", e);
         if (e.message === 'GRIMOIRE_FULL') {
             setShowSlotModal(true);
         } else {
             setAppError("Failed to save to Grimoire.");
         }
     } finally {
         setIsSaving(false);
     }
  };

  // Error Rendering
  if (genPaymentError || savePaymentError || appError) {
      const errorMsg = genPaymentError || savePaymentError || appError;
      const reset = () => { clearGenError(); clearSaveError(); setAppError(null); };
      const showLink = showGenStoreLink || showSaveStoreLink;

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
                <div className="bg-[#1a1a2e] border border-red-500/50 rounded-xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-magical text-red-100 mb-2">Ritual Interrupted</h3>
                    <p className="text-gray-400 text-sm mb-6">{errorMsg}</p>
                    <div className="flex flex-col gap-3">
                        {showLink && (
                            <Link href="/store" className="w-full bg-amber-600 hover:bg-amber-500 text-black py-3 uppercase tracking-widest font-magical text-xs rounded transition-colors flex items-center justify-center gap-2">
                                <Coins size={14} /> Get Aether
                            </Link>
                        )}
                        <button onClick={reset} className="w-full border border-red-500/50 text-red-300 py-3 uppercase tracking-widest font-magical text-xs hover:bg-red-900/20 transition-colors">
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
      );
  }

  if (!started) {
    return (
      <div className="min-h-dvh bg-[#0f0a1e] text-amber-50 flex flex-col items-center justify-center p-6 font-magical text-center cursor-pointer overflow-hidden no-select" onClick={startRitual}>
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
    <div className="h-dvh w-full bg-[#0f0a1e] text-amber-50 overflow-hidden flex flex-col relative no-select touch-none">
      <GlobalStyles />
      <StarField />
      
      <SlotPurchaseModal 
            isOpen={showSlotModal} 
            onClose={() => setShowSlotModal(false)}
            onPurchase={handleBuySlots}
            isProcessing={slotLoading}
      />

      {/* Navbar */}
      <div className="flex justify-between items-center p-4 z-50 shrink-0 h-16">
        <Link href="/spell-room/love-spells-app" onClick={() => audio.playClick('medium')} className="text-amber-500/50 hover:text-amber-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          &larr; Exit
        </Link>
        <div className="flex items-center gap-4">
             {aetherBalance !== null && (
                 <div className="hidden md:flex items-center gap-2 text-xs text-amber-500 font-mono border border-amber-500/30 px-3 py-1 rounded bg-black/40">
                     <Coins size={12} /> {aetherBalance}
                 </div>
             )}
             <div className="text-amber-200/60 text-[10px] tracking-[0.2em] uppercase font-magical flex items-center gap-2">
                <Sparkles size={10} /> Step {step > 9 ? step - 5 : step} / 9
             </div>
        </div>
        <div className="flex gap-2">
             <button onClick={toggleMute} className="text-amber-500/50 hover:text-amber-200">
                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
             </button>
             {aetherBalance !== null && (
                 <Link href="/store" className="md:hidden flex items-center text-amber-500 hover:text-white">
                     <Coins size={20} />
                 </Link>
             )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grow relative z-10 flex flex-col items-center justify-evenly p-4 w-full max-w-md mx-auto h-full max-h-[calc(100dvh-4rem)]">
          {/* STEP 1: PETITION */}
          {step === 1 && (
            <StageOneIntention 
              names={names} setNames={setNames} 
              intention={intention} setIntention={setIntention} 
              isForSelf={isForSelf} setIsForSelf={setIsForSelf}
              onComplete={handlePetitionDone} 
              // Pass Economy Props
              genCost={genCost}
              spendGenCredits={spendGenCredits}
              isGenProcessing={isGenProcessing}
              // Replay
              isReplay={isReplayMode}
            />
          )}

          {/* STEP 2: JAR - INSERT PETITION */}
          {step === 2 && (
            <StageTwoJar 
                mode="petition" 
                names={names} 
                isForSelf={isForSelf}
                filledIngredients={addedIngredients}
                onComplete={() => handleStageComplete("Petition Placed.")} 
            />
          )}

          {/* LOOPS FOR INGREDIENTS */}
          {/* Ing 1 */}
          {step === 3 && activeIngredients[0] && <StageThreeConsecrate ingredient={activeIngredients[0]} index={0} total={activeIngredients.length} isForSelf={isForSelf} names={names} onComplete={() => handleStageComplete(`The ${activeIngredients[0].name.toLowerCase()} is charged.`)} />}
          {step === 4 && activeIngredients[0] && <StageTwoJar mode="drop" droppingItem={activeIngredients[0]} isForSelf={isForSelf} filledIngredients={addedIngredients} names={names} onComplete={() => handleIngredientDrop(activeIngredients[0])} />}

          {/* Ing 2 */}
          {step === 5 && activeIngredients[1] && <StageThreeConsecrate ingredient={activeIngredients[1]} index={1} total={activeIngredients.length} isForSelf={isForSelf} names={names} onComplete={() => handleStageComplete(`The ${activeIngredients[1].name.toLowerCase()} is charged.`)} />}
          {step === 6 && activeIngredients[1] && <StageTwoJar mode="drop" droppingItem={activeIngredients[1]} isForSelf={isForSelf} filledIngredients={addedIngredients} names={names} onComplete={() => handleIngredientDrop(activeIngredients[1])} />}

          {/* Ing 3 */}
          {step === 7 && activeIngredients[2] && <StageThreeConsecrate ingredient={activeIngredients[2]} index={2} total={activeIngredients.length} isForSelf={isForSelf} names={names} onComplete={() => handleStageComplete("The binding is charged.")} />}
          {step === 8 && activeIngredients[2] && <StageTwoJar mode="drop" droppingItem={activeIngredients[2]} isForSelf={isForSelf} filledIngredients={addedIngredients} names={names} onComplete={() => handleIngredientDrop(activeIngredients[2])} />}

           {/* Support for extra AI ingredients if needed, can iterate later. For now fixed to 3 slots for visual simplicity */}

          {/* STEP 9: JAR - POUR HONEY */}
          {step === 9 && (
             <StageTwoJar 
                mode="honey" 
                isForSelf={isForSelf}
                filledIngredients={addedIngredients} 
                names={names} 
                customChant={stepChants.honey} // Pass custom honey chant
                onComplete={() => handleStageComplete("The Vessel is sweetened and sealed.")} 
             />
          )}
          
          {/* STEP 10: INCANTATION */}
          {step === 10 && <StageFourIncantation chant={generatedChant} onComplete={() => handleStageComplete("The words have been spoken.")} />}
          
          {/* STEP 11: MIXING */}
          {step === 11 && <StageFiveMixing ingredients={activeIngredients} names={names} isForSelf={isForSelf} customChant={stepChants.mix} onComplete={() => handleStageComplete("The spell is bound.")} />}
          
          {/* STEP 12: CANDLE */}
          {step === 12 && <StageSixCandle isForSelf={isForSelf} names={names} customChant={stepChants.candle} onComplete={() => handleStageComplete("The spell is sealed in fire.")} />}
          
          {/* STEP 13: RELEASE */}
          {step === 13 && <StageSevenRelease isForSelf={isForSelf} names={names} customChant={stepChants.release} onComplete={() => setStep(14)} />}

          {/* FINAL */}
          {step === 14 && <FinalPopup onExit={() => {}} onSave={saveToGrimoire} isSaving={isSaving} isSaved={isSaved} saveCost={saveCost} />}
      </div>

      {showSuccess && <MagickPopup message={showSuccess.msg} buttonText={showSuccess.btn} onContinue={nextStep} />}
    </div>
  );
}

// --- STAGE 1: INTENTION (Upgraded with Dual Workflow) ---
interface StageOneProps {
    names: any; setNames: any;
    intention: string; setIntention: any;
    isForSelf: boolean; setIsForSelf: any;
    onComplete: (mode: 'standard'|'ai'|'replay', data?: any) => void;
    // Economy
    genCost: number;
    spendGenCredits: (id: string) => Promise<boolean>;
    isGenProcessing: boolean;
    // Replay
    isReplay: boolean;
}

const StageOneIntention = ({ names, setNames, intention, setIntention, isForSelf, setIsForSelf, onComplete, genCost, spendGenCredits, isGenProcessing, isReplay }: StageOneProps) => {
  const [mode, setMode] = useState<'form' | 'choice' | 'sigil'>('form'); 
  const [traceProgress, setTraceProgress] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const handleTrace = () => {
    if (Math.random() > 0.5) audio.playTraceTone(); 
    setTraceProgress(prev => Math.min(prev + 1, 100));
  };

  const handleFormSubmit = () => {
      audio.playClick('medium'); 
      setMode('choice');
  };

  const chooseWorkflow = async (workflow: 'standard' | 'ai' | 'replay') => {
      audio.playClick(workflow === 'ai' ? 'magick' : 'medium');
      
      if (workflow === 'replay') {
          // Replay Mode: Skip generation
          onComplete('replay');
          return;
      }

      if (workflow === 'standard') {
          setMode('sigil');
          setShowIntro(true);
      } else {
          // AI Workflow
          setIsLoading(true);
          try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error("Login Required for Deep Weaving");

              // 1. Pay
              const paid = await spendGenCredits(user.id);
              if (!paid) {
                  setIsLoading(false);
                  return; // Economy hook shows error
              }

              // 2. Generate
              const aiResult = await generateLoveSpell(
                  intention, 
                  names.target, 
                  isForSelf ? `${names.user} seeking ${names.target}` : `Couple ${names.user} and ${names.target}`
              );

              setIsLoading(false);
              onComplete('ai', aiResult);
          } catch (e) {
              console.error(e);
              setIsLoading(false);
              // Failures handled by parent typically, but here we might alert or fallback
              alert("The spirits are silent. Please try again or use Standard mode.");
              setMode('choice');
          }
      }
  };

  if (mode === 'form') {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative flex flex-col h-full justify-center">
        <div className="absolute inset-0 bg-amber-600/10 blur-3xl animate-pulse rounded-full pointer-events-none"></div>

        <h2 className="text-2xl text-center text-amber-100 mb-2 font-magical drop-shadow-md shrink-0">The Petition</h2>
        
        <div className="flex justify-center mb-2 shrink-0">
            <div className="flex bg-slate-900/80 rounded-full border border-amber-800/50 p-1">
                <button 
                    onClick={() => { if(!isReplay) { audio.playClick('soft'); setIsForSelf(true); }}}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] uppercase tracking-wider transition-all ${isForSelf ? 'bg-amber-700 text-white shadow-lg' : 'text-slate-400 hover:text-amber-200'}`}
                >
                    <User size={12} /> For Me
                </button>
                <button 
                    onClick={() => { if(!isReplay) { audio.playClick('soft'); setIsForSelf(false); }}}
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
              readOnly={isReplay}
              onChange={(e) => setNames({...names, user: e.target.value})}
              className={`w-full bg-slate-950/50 border-b border-amber-700/50 p-2 text-amber-100 font-scroll text-base focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-700 rounded-none ${isReplay ? 'cursor-not-allowed opacity-80' : ''}`}
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-amber-500 mb-1 font-magical">
                {isForSelf ? "Target Name" : "Second Person's Name"}
            </label>
            <input 
              value={names.target}
              readOnly={isReplay}
              onChange={(e) => setNames({...names, target: e.target.value})}
              className={`w-full bg-slate-950/50 border-b border-amber-700/50 p-2 text-amber-100 font-scroll text-base focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-700 rounded-none ${isReplay ? 'cursor-not-allowed opacity-80' : ''}`}
              placeholder="Whom to bind?"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-amber-500 mb-1 font-magical">Intention</label>
            <textarea 
              value={intention}
              readOnly={isReplay}
              onChange={(e) => setIntention(e.target.value)}
              className={`w-full bg-slate-950/50 border border-amber-700/30 p-2 text-amber-100 font-scroll text-sm focus:outline-none focus:border-amber-400 transition-colors h-16 resize-none placeholder:text-slate-700 rounded-sm ${isReplay ? 'cursor-not-allowed opacity-80' : ''}`}
              placeholder="e.g. Faithful love, Return to me..."
            />
          </div>
          <button 
            disabled={!names.user || !names.target || !intention}
            onClick={handleFormSubmit}
            className="w-full mt-2 bg-linear-to-r from-amber-900/40 to-amber-800/40 border border-amber-600/50 text-amber-100 py-3 uppercase tracking-[0.2em] font-magical text-sm hover:bg-amber-800/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          >
            Review & Cast
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'choice') {
      if (isLoading || isGenProcessing) {
          return (
              <div className="flex flex-col items-center justify-center animate-in fade-in">
                  <div className="w-24 h-24 relative mb-8">
                      <div className="absolute inset-0 border-t-2 border-purple-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-r-2 border-amber-500 rounded-full animate-spin direction-reverse duration-200"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="text-purple-200 animate-pulse" />
                      </div>
                  </div>
                  <h3 className="text-amber-100 font-magical text-xl animate-pulse">Consulting Venus...</h3>
                  <p className="text-purple-300/60 font-scroll italic mt-2">Weaving your fate</p>
              </div>
          );
      }

      // Replay Mode Choice
      if (isReplay) {
          return (
             <div className="w-full animate-in zoom-in duration-300 flex flex-col items-center justify-center space-y-4">
                 <h2 className="text-xl text-amber-100 font-magical mb-4">Saved Ritual</h2>
                 <button 
                    onClick={() => chooseWorkflow('replay')}
                    className="w-full bg-linear-to-br from-amber-900/50 to-amber-700/50 border border-amber-500 hover:border-amber-300 p-8 rounded-xl flex flex-col items-center gap-3 group transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                  >
                      <RotateCcw className="w-10 h-10 text-amber-200 group-hover:rotate-180 transition-transform duration-700" />
                      <h3 className="text-amber-100 font-magical uppercase tracking-widest text-lg">Perform Ritual Again</h3>
                      <p className="text-xs text-amber-200/60 font-scroll">Uses previously generated ingredients & chant.</p>
                      <span className="mt-2 text-[10px] bg-amber-900/80 px-3 py-1 rounded-full text-amber-200 border border-amber-500/30">Free Replay</span>
                  </button>
             </div>
          );
      }

      return (
          <div className="w-full animate-in zoom-in duration-300 flex flex-col items-center justify-center space-y-4">
              <h2 className="text-xl text-amber-100 font-magical mb-4">Choose Your Path</h2>
              
              {/* Standard Card */}
              <button 
                onClick={() => chooseWorkflow('standard')}
                className="w-full bg-slate-900/50 border border-slate-600 hover:border-amber-500/50 p-6 rounded-xl flex flex-col items-center gap-2 group transition-all hover:bg-slate-800/50"
              >
                  <Book className="w-8 h-8 text-slate-400 group-hover:text-amber-200 transition-colors" />
                  <h3 className="text-amber-100 font-magical uppercase tracking-widest text-sm">Standard Ritual</h3>
                  <p className="text-xs text-slate-500 font-scroll">Traditional methods. Fixed incantations.</p>
                  <span className="mt-2 text-[10px] bg-slate-800 px-3 py-1 rounded-full text-slate-300">Free</span>
              </button>

              {/* AI Card */}
              <button 
                onClick={() => chooseWorkflow('ai')}
                className="w-full bg-linear-to-br from-indigo-900/30 to-purple-900/30 border border-purple-500/30 hover:border-purple-400 p-6 rounded-xl flex flex-col items-center gap-2 group transition-all hover:bg-purple-900/20 shadow-[0_0_20px_rgba(168,85,247,0.1)] relative overflow-hidden"
              >
                  <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                  <Wand2 className="w-8 h-8 text-purple-300 group-hover:text-white transition-colors" />
                  <h3 className="text-purple-100 font-magical uppercase tracking-widest text-sm text-shadow-purple">Deep Weaving</h3>
                  <p className="text-xs text-purple-300/60 font-scroll">AI-Generated custom ingredients & chant.</p>
                  <span className="mt-2 text-[10px] bg-purple-900/60 border border-purple-500/50 px-3 py-1 rounded-full text-purple-200 flex items-center gap-1">
                      <Sparkles size={10} /> {genCost} Credits
                  </span>
              </button>
          </div>
      );
  }

  if (showIntro) {
      return <PreStepIncantation type="sigil" isForSelf={isForSelf} data={{}} onNext={() => setShowIntro(false)} />;
  }

  return (
    <div className="text-center animate-in zoom-in duration-500 w-full h-full flex flex-col items-center justify-center">
      <h2 className="text-xl text-amber-100 mb-2 font-magical">Activate the Sigil</h2>
      <p className="text-[10px] text-amber-400/60 mb-6 font-scroll italic uppercase tracking-wider">Trace to lock intention</p>
      
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
         <button onClick={() => { audio.playClick('magick'); onComplete('standard'); }} className="mt-8 bg-amber-700/80 text-white font-magical px-8 py-2 uppercase tracking-widest animate-pulse rounded border border-amber-500 shadow-lg text-sm active:scale-95">
           Confirm Sigil
         </button>
      )}
    </div>
  );
};

// ... (KEEP OTHER COMPONENTS AS IS: StageTwoJar, StageThreeConsecrate, StageFourIncantation, StageFiveMixing, StageSixCandle, StageSevenRelease, IngredientCharger, PreStepIncantation, MagickPopup)

const StageTwoJar = ({ mode, names, filledIngredients, droppingItem, onComplete, isForSelf, customChant }: any) => {
  const [actionProgress, setActionProgress] = useState(0); 
  const [isPouring, setIsPouring] = useState(false);
  const [animState, setAnimState] = useState<'idle' | 'dropping' | 'done'>('idle');
  const [showIntro, setShowIntro] = useState(true);
  
  const [honeyDone, setHoneyDone] = useState(false);
  const [showSealBtn, setShowSealBtn] = useState(false);
  
  const [dropY, setDropY] = useState(30); 
  const progressRef = useRef(0);
  const soundRef = useRef<any>(null);

  useEffect(() => { progressRef.current = actionProgress; }, [actionProgress]);

  const bottlePath = "M70,20 C70,10 75,0 100,0 C125,0 130,10 130,20 L130,60 C130,70 170,80 180,120 C190,160 195,200 170,260 C145,300 55,300 30,260 C5,200 10,160 20,120 C30,80 70,70 70,60 Z";
  const stackIndex = filledIngredients.length + (mode === 'petition' ? 0 : 1);
  const targetY = 250 - (stackIndex * 30);
  const honeyMax = 200;

  useEffect(() => {
    let interval: any;
    
    if (isPouring && !honeyDone && mode === 'honey') {
        if (!soundRef.current) soundRef.current = audio.startCharge();

        interval = setInterval(() => {
            const current = progressRef.current;
            if (current >= honeyMax) {
                setActionProgress(honeyMax);
                setIsPouring(false);
                setHoneyDone(true);
                if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
                audio.playClick('magick');
                setTimeout(() => setShowSealBtn(true), 3000);
            } else {
                const next = current + 1.2; 
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
  }, [isPouring, honeyDone, mode]);

  const triggerDrop = () => {
      setAnimState('dropping');
      audio.playClick('medium'); 
      requestAnimationFrame(() => setDropY(targetY));
      setTimeout(() => setAnimState('done'), 4000);
  };

  const handlePetitionInsert = () => { triggerDrop(); };

  if (showIntro) {
      let type = mode;
      let data: any = { target: names.target };
      if (mode === 'drop' && droppingItem) {
          data.item = droppingItem.name.toLowerCase();
          data.icon = droppingItem.icon;
          // IMPORTANT: Check droppingItem.chant as well
          if (droppingItem.chant) data.customChant = droppingItem.chant;
      }
      // Pass custom chant if available (mainly for honey)
      if (customChant) data.customChant = customChant;

      return <PreStepIncantation type={type} isForSelf={isForSelf} data={data} onNext={() => setShowIntro(false)} />;
  }

  return (
    <div className="flex flex-col items-center w-full h-full justify-center">
      <h2 className="text-xl text-amber-100 mb-1 font-magical">
          {mode === 'petition' && "The Vessel"}
          {mode === 'drop' && "Add Ingredient"}
          {mode === 'honey' && "Sweeten the Jar"}
      </h2>
      <p className="text-[10px] text-amber-400/60 mb-6 text-center font-scroll h-4 animate-in fade-in uppercase tracking-wider">
        {mode === 'petition' && (animState !== 'done' ? "Tap to place petition." : "Petition added.")}
        {mode === 'drop' && (animState !== 'done' ? `Tap to add ${droppingItem.name}.` : "Added.")}
        {mode === 'honey' && !honeyDone && "Hold button to pour honey."}
        {mode === 'honey' && honeyDone && "Ingredients have been sweetened."}
      </p>
      <div className={`relative w-56 h-[40vh] max-h-80 mb-6 shrink-0 transition-all duration-1000 ${honeyDone ? 'scale-110' : ''}`}>
         {honeyDone && (
             <div className="absolute inset-0 bg-amber-500/60 blur-[60px] animate-pulse rounded-full z-0 transition-opacity duration-1000"></div>
         )}
         {honeyDone && (
             <div className="absolute inset-0 flex items-center justify-center z-50 animate-in zoom-in duration-700">
                 <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-amber-500/50 shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                     <span className="text-amber-100 font-magical uppercase tracking-widest text-xs font-bold drop-shadow-md">
                         Ingredients Sweetened
                     </span>
                 </div>
             </div>
         )}
         <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,0,0,0.6)] relative z-10">
            <defs>
               <clipPath id="bottleClip"><path d={bottlePath} /></clipPath>
               <linearGradient id="honeyGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="50%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#78350f" />
               </linearGradient>
            </defs>
            <path d={bottlePath} fill="rgba(255,255,255,0.03)" stroke="none" />
            <g clipPath="url(#bottleClip)">
                {mode === 'honey' && (
                    <rect x="0" y={300 - actionProgress} width="200" height={actionProgress} fill="url(#honeyGrad)" opacity="0.9" />
                )}
                {(mode !== 'petition' || animState !== 'idle') && (
                    <g style={{ transition: mode === 'petition' && animState === 'dropping' ? 'transform 4s ease-in-out' : 'none', transform: mode === 'petition' && animState === 'dropping' ? `translate(100px, ${dropY}px)` : `translate(100px, 250px)` }}>
                       <g className={mode === 'petition' && animState === 'dropping' ? "leaf-motion" : ""}>
                           <g transform="rotate(-10)">
                               <rect x="-25" y="-35" width="50" height="70" fill="#f3e5ab" stroke="#78350f" strokeWidth="0.5" />
                               <text x="0" y="-8" fontSize="5" textAnchor="middle" fill="#000" fontFamily="serif">{names.user}</text>
                               <text x="0" y="4" fontSize="5" textAnchor="middle" fill="#b91c1c" fontFamily="serif">&</text>
                               <text x="0" y="16" fontSize="5" textAnchor="middle" fill="#000" fontFamily="serif">{names.target}</text>
                           </g>
                       </g>
                    </g>
                )}
                {filledIngredients.map((ing: any, i: number) => (
                    <g key={i} transform={`translate(100, ${250 - ((i+1) * 30)})`}>
                        <text fontSize="28" textAnchor="middle" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.5))">
                            {ing.icon}
                        </text>
                    </g>
                ))}
                {mode === 'drop' && animState !== 'idle' && (
                    <g style={{ transition: animState === 'dropping' ? 'transform 4s ease-in-out' : 'none', transform: `translate(100px, ${dropY}px)` }}>
                        <g className={animState === 'dropping' ? "leaf-motion" : ""}>
                             <text fontSize="28" textAnchor="middle">{droppingItem.icon}</text>
                        </g>
                    </g>
                )}
                {mode === 'honey' && (
                    <rect x="0" y={300 - actionProgress} width="200" height={actionProgress} fill="url(#honeyGrad)" opacity="0.5" style={{ pointerEvents: 'none' }} />
                )}
                {mode === 'honey' && (
                    <line x1="0" y1="100" x2="200" y2="100" stroke={honeyDone ? "#fbbf24" : "rgba(255,255,255,0.2)"} strokeWidth={honeyDone ? "3" : "1"} strokeDasharray={honeyDone ? "" : "4 2"} className={honeyDone ? "glow-active" : ""} />
                )}
            </g>
            <path d={bottlePath} fill="none" stroke={honeyDone ? "rgba(251,191,36,0.8)" : "rgba(251,191,36,0.5)"} strokeWidth="1.5" />
            <path d="M40,140 Q60,140 60,180" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
         </svg>
      </div>
      <div className="h-24 flex items-center justify-center w-full">
        {mode === 'petition' && (
            animState === 'done' ? (
                <button onClick={() => { audio.playClick('medium'); onComplete(); }} className="px-8 py-2 bg-amber-800 text-amber-100 font-magical font-bold text-sm rounded shadow-lg animate-in zoom-in">
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
                <button onClick={() => { audio.playClick('magick'); onComplete(); }} className="px-8 py-2 bg-amber-800 text-amber-100 font-magical font-bold text-sm rounded shadow-lg animate-in zoom-in">
                    Confirm
                </button>
            ) : (
                <button onClick={triggerDrop} className={`group flex items-center gap-2 px-8 py-2 border border-amber-500/50 text-amber-100 font-magical text-sm hover:bg-amber-900/30 transition-all active:scale-95 ${animState === 'dropping' ? 'opacity-50 pointer-events-none' : ''}`}>
                    {animState === 'dropping' ? "Dropping..." : `Drop ${droppingItem.name}`} {animState !== 'dropping' && <ArrowDown size={14} />}
                </button>
            )
        )}
        {mode === 'honey' && (
            showSealBtn ? (
                <button onClick={() => { audio.playClick('magick'); onComplete(); }} className="bg-green-900/40 border border-green-500 text-green-200 px-8 py-2 uppercase tracking-[0.2em] font-magical text-sm animate-in zoom-in active:scale-95">
                   Seal Vessel
                 </button>
            ) : (
                !honeyDone && (
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
                )
            )
        )}
      </div>
    </div>
  );
};

const StageThreeConsecrate = ({ ingredient, index, total, onComplete, isForSelf, names }: any) => {
  const [charge, setCharge] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [success, setSuccess] = useState(false); 
  const [showIntro, setShowIntro] = useState(true);
  const soundRef = useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCharging && !success) {
      if (!soundRef.current) soundRef.current = audio.startCharge(); 
      interval = setInterval(() => {
        setCharge(prev => {
            const next = Math.min(prev + 1.5, 100); 
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
        audio.playClick('magick');
        setSuccess(true); 
        setTimeout(onComplete, 1500); 
      }
  }, [charge, success, onComplete]);

  if (showIntro) {
      // NEW: Pass custom chant if exists
      const data = { item: ingredient.name.toLowerCase(), target: names.target, icon: ingredient.icon, customChant: ingredient.chant };
      return <PreStepIncantation type="charge" isForSelf={isForSelf} data={data} onNext={() => setShowIntro(false)} />;
  }

  return (
    <div className="flex flex-col items-center text-center w-full relative h-full justify-center">
      <h2 className="text-xl text-amber-100 mb-1 font-magical">Consecrate Herb</h2>
      <p className="text-[10px] text-amber-400/60 mb-6 font-scroll italic uppercase tracking-wider">Hold to imbue energy</p>
      <div className="w-56 h-56 bg-slate-900/40 border border-amber-900/50 rounded-full flex flex-col items-center justify-center mb-8 relative overflow-hidden backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)] group shrink-0">
         <div className="absolute inset-0 bg-amber-500/20 transition-all duration-100 ease-linear rounded-full" style={{ clipPath: `circle(${charge}% at 50% 100%)` }}>
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

const StageFourIncantation = ({ chant, onComplete }: any) => {
  const [lineIdx, setLineIdx] = useState(0);

  const handleTap = () => {
    if (lineIdx < chant.length - 1) {
        audio.playClick('medium');
        setLineIdx(p => p + 1);
    } else {
        audio.playClick('magick');
        onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer touch-manipulation" onClick={handleTap}>
      <h2 className="text-base md:text-xl font-magical uppercase tracking-[0.2em] text-amber-200/80 mb-2 text-center leading-tight max-w-xs shrink-0">REPEAT THE CHANT, ALOUD OR INTERNALLY WITH POWER</h2>
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

const StageFiveMixing = ({ ingredients, names, onComplete, isForSelf, customChant }: any) => {
  const [progress, setProgress] = useState(0);
  const [isStirring, setIsStirring] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [mixedDone, setMixedDone] = useState(false);
  const [showBindBtn, setShowBindBtn] = useState(false);
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
    if (isStirring && !mixedDone) {
      if (!soundRef.current) soundRef.current = audio.startHighPassCharge(); 
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) { 
              if(soundRef.current) audio.stopCharge(soundRef.current); 
              setMixedDone(true);
              audio.playClick('magick');
              setTimeout(() => setShowBindBtn(true), 3000);
              return 100; 
          }
          if(soundRef.current) audio.updateCharge(soundRef.current, prev + 0.8);
          return prev + 0.8; 
        });
      }, 50);
    } else {
      if(soundRef.current) { audio.stopCharge(soundRef.current); soundRef.current = null; }
      if(progress < 100) setProgress(0); 
    }
    return () => { clearInterval(interval); if(soundRef.current) audio.stopCharge(soundRef.current); };
  }, [isStirring, progress, mixedDone]);

  if (showIntro) {
      // NEW: Pass custom chant
      const data: any = {};
      if (customChant) data.customChant = customChant;
      return <PreStepIncantation type="mix" isForSelf={isForSelf} data={data} onNext={() => setShowIntro(false)} />;
  }

  return (
    <div className="flex flex-col items-center text-center w-full h-full justify-center">
      <h2 className="text-xl text-amber-100 mb-1 font-magical">Bind the Energy</h2>
      <p className="text-[10px] text-amber-400/60 mb-8 font-scroll italic animate-in fade-in uppercase tracking-wider">{mixedDone ? " " : "Hold to stir the ingredients"}</p>
      <div className="relative w-56 h-56 mb-8 flex items-center justify-center shrink-0">
        <div className={`absolute inset-0 border border-slate-700 rounded-full bg-black/40 transition-all duration-1000 ${mixedDone ? 'shadow-[0_0_80px_rgba(251,191,36,0.5)] scale-110' : ''}`}></div>
        {mixedDone && (
             <div className="absolute inset-0 flex items-center justify-center z-50 animate-in zoom-in duration-700">
                 <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-amber-500/50 shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                     <span className="text-amber-100 font-magical uppercase tracking-widest text-xs font-bold drop-shadow-md">Energies Merged</span>
                 </div>
             </div>
        )}
        <div className="w-48 h-48 rounded-full bg-linear-to-br from-amber-900 to-black flex items-center justify-center shadow-inner overflow-hidden relative" style={{ transform: `rotate(${progress * 15}deg)`, transition: isStirring ? 'transform 0.1s linear' : 'transform 1s ease-out' }}>
           <div className="absolute w-full h-full opacity-30 bg-[url('/images/noise.png')]"></div>
           {mixItems.map((item: any, i: number) => {
             const angle = (i / mixItems.length) * 2 * Math.PI;
             const r = 60; 
             return (
               <div key={i} className="absolute text-2xl filter blur-[0.5px] animate-pulse" style={{ top: `calc(50% + ${Math.sin(angle) * r}px)`, left: `calc(50% + ${Math.cos(angle) * r}px)`, transform: `rotate(${-progress * 15}deg) translate(-50%, -50%)` }}>
                 {item.type === 'petition' ? item.component : item.icon}
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
      <div className="h-24 flex items-center justify-center w-full">
        {showBindBtn ? (
            <button onClick={() => { audio.playClick('magick'); onComplete(); }} className="px-8 py-2 bg-amber-600 text-white font-magical uppercase tracking-widest text-sm rounded shadow-lg animate-in zoom-in active:scale-95">Bind Energy</button>
        ) : (
            !mixedDone && (
                <button onMouseDown={() => setIsStirring(true)} onMouseUp={() => setIsStirring(false)} onTouchStart={() => setIsStirring(true)} onTouchEnd={() => setIsStirring(false)} className="w-20 h-20 rounded-full bg-slate-800 border border-slate-600 flex flex-col items-center justify-center active:bg-amber-900/20 active:border-amber-500 transition-colors active:scale-95">
                <RotateCw className={`w-6 h-6 text-amber-100 mb-1 ${isStirring ? 'animate-spin' : ''}`} />
                <span className="text-[8px] uppercase font-bold text-amber-200/70 pointer-events-none">(Hold)</span>
                </button>
            )
        )}
      </div>
    </div>
  );
};

const StageSixCandle = ({ onComplete, isForSelf, names, customChant }: any) => {
  const [lit, setLit] = useState(false);
  const [timeLeft, setTimeLeft] = useState(142); 
  const maxTime = 142;
  const [showIntro, setShowIntro] = useState(true);
  
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

  const initialHeight = 160;
  const waxHeight = 20 + ((initialHeight - 20) * (timeLeft / maxTime));

  if (showIntro) {
      // NEW: Pass custom chant
      const data: any = { target: names.target };
      if (customChant) data.customChant = customChant;
      return <PreStepIncantation type="candle" isForSelf={isForSelf} data={data} onNext={() => setShowIntro(false)} />;
  }

  return (
    <div className="flex flex-col items-center w-full h-full justify-center">
      <h2 className="text-xl text-amber-100 mb-1 font-magical">Seal with Fire</h2>
      <p className="text-[10px] text-amber-400/60 mb-8 font-scroll italic uppercase tracking-wider">{lit ? "Focus on your desire..." : "Tap the wick to light the candle"}</p>
      <div className="relative h-72 w-40 flex flex-col items-center justify-end mb-6 shrink-0">
        {lit && timeLeft > 0 && (
          <div className="absolute z-20 mix-blend-screen animate-in fade-in duration-500" style={{ bottom: `${waxHeight + 5}px`, transition: 'bottom 1s linear' }}>
             <svg width="40" height="60" viewBox="0 0 40 60">
                <path d="M20,0 Q35,30 20,60 Q5,30 20,0" fill="orange" className="animate-[pulse_0.1s_infinite]" />
                <path d="M20,10 Q28,35 20,50 Q12,35 20,10" fill="#fef3c7" className="blur-[1px]" />
             </svg>
             <div className="absolute -top-10 -left-6 w-24 h-24 bg-orange-600/20 rounded-full blur-2xl animate-pulse"></div>
          </div>
        )}
        <svg width="80" height="200" viewBox="0 0 80 200" className="drop-shadow-lg overflow-visible">
             <defs>
                <linearGradient id="candleGrad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#f9a8d4" />
                    <stop offset="50%" stopColor="#fce7f3" />
                    <stop offset="100%" stopColor="#f9a8d4" />
                </linearGradient>
             </defs>
             <rect x="38" y={200 - waxHeight - 15} width="4" height="15" fill="#333" style={{ transition: 'y 1s linear' }}/>
             <rect x="10" y={200 - waxHeight} width="60" height={waxHeight} fill="url(#candleGrad)" rx="4" style={{ transition: 'all 1s linear' }} />
        </svg>
        {!lit && (
             <div className="absolute z-50 w-24 h-24 cursor-pointer flex items-center justify-center" style={{ bottom: `${waxHeight - 20}px` }} onClick={() => { setLit(true); audio.playClick('medium'); }}>
                 <div className="w-6 h-6 rounded-full border border-orange-500/50 animate-ping opacity-50"></div>
             </div>
        )}
      </div>
      {!lit ? (
        <div className="text-xs uppercase tracking-widest text-pink-300 animate-pulse border-b border-pink-500/50 pb-1">Tap wick to light</div>
      ) : (
        <>
            {timeLeft > 0 ? (
                <div className="text-2xl font-magical text-amber-200 animate-pulse">{formatTime(timeLeft)}</div>
            ) : (
                <button onClick={() => { audio.playClick('magick'); onComplete(); }} className="px-8 py-2 bg-pink-700 text-white font-magical uppercase tracking-widest text-sm rounded shadow-[0_0_20px_rgba(236,72,153,0.5)] animate-in zoom-in active:scale-95">Seal Completed</button>
            )}
        </>
      )}
    </div>
  );
};

const StageSevenRelease = ({ onComplete, isForSelf, names, customChant }: any) => {
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const soundRef = useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCharging) {
      if (!soundRef.current) soundRef.current = audio.startHighPassCharge(); 
      interval = setInterval(() => {
        setPower(prev => {
            const next = Math.min(prev + 0.8, 100); 
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
          audio.playClick('magick');
          setTimeout(onComplete, 5000); 
      }
  }, [power, onComplete]);

  if (showIntro) {
      // NEW: Pass custom chant
      const data: any = {};
      if (customChant) data.customChant = customChant;
      return <PreStepIncantation type="release" isForSelf={isForSelf} data={data} onNext={() => setShowIntro(false)} />;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden">
      <div className="text-center mb-12" style={{ opacity: power >= 100 ? 0 : 1 - (power/100), transform: power >= 100 ? `scale(0.5) translateY(-500px)` : `scale(${1+(power/200)})`, filter: power >= 100 ? 'blur(10px)' : 'none', transition: 'all 0.5s ease-in' }}>
        <div className="text-6xl mb-4">🕯️</div>
        <h2 className="text-2xl text-amber-100 font-magical mb-2">Manifestation</h2>
        <p className="text--[10px] text-amber-500/50 font-scroll italic uppercase tracking-wider">Release your will into the universe</p>
      </div>
      <button
        onMouseDown={() => setIsCharging(true)}
        onMouseUp={() => setIsCharging(false)}
        onTouchStart={() => setIsCharging(true)}
        onTouchEnd={() => setIsCharging(false)}
        className={`relative w-40 h-40 rounded-full border border-amber-500/30 flex flex-col items-center justify-center overflow-hidden bg-slate-900/50 backdrop-blur-sm group active:border-amber-200 transition-all active:scale-95 ${power >= 100 ? 'opacity-0 duration-500' : ''}`}
      >
        <div className="absolute bottom-0 left-0 right-0 bg-amber-100 mix-blend-overlay transition-all duration-75" style={{ height: `${power}%` }}></div>
        <span className="relative z-10 text-amber-100 font-magical font-bold tracking-widest uppercase text-xs pointer-events-none">RELEASE</span>
        <span className="relative z-10 text-[8px] text-amber-500/70 mt-1 uppercase font-bold pointer-events-none">(Hold)</span>
      </button>
      {power >= 100 && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
             <div className="relative animate-in zoom-in duration-1000">
                <div className="absolute inset-0 bg-white/80 blur-[80px] scale-150 animate-pulse"></div>
                <Star size={80} className="relative z-10 text-white fill-white animate-[spin_3s_linear_infinite] drop-shadow-[0_0_60px_rgba(255,255,255,1)]" />
                <div className="absolute inset-0 bg-white blur-md animate-pulse z-0"></div>
             </div>
          </div>
      )}
    </div>
  );
};

// Only export the Page component as Default
export default function SoulConnectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-amber-500">Loading Ritual...</div>}>
      <SoulConnectContent />
    </Suspense>
  );
}