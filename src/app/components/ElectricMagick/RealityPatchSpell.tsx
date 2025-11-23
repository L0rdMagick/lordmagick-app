// --- START OF FILE src/app/components/ElectricMagick/RealityPatchSpell.tsx ---
/// <reference lib="dom" />
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Heart, DollarSign, Sun, Shield, Star, Fingerprint, Activity, Check, Eye, X,
  Moon, Triangle, Hexagon, Sparkles, Droplets
} from 'lucide-react';
import { generateElectricEnsorcellment } from '@/lib/services/geminiService';

// --- UTILITY: SIGIL GENERATOR ---
const generateSigilPath = (input: string): string => {
  if (!input) return "M100,100 L100,100";
  
  let seed = 0;
  for (let i = 0; i < input.length; i++) {
    seed = (seed << 5) - seed + input.charCodeAt(i);
    seed |= 0;
  }
  
  const rng = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const numPoints = Math.floor(rng() * 4) + 5;
  const points: {x: number, y: number}[] = [];
  
  for(let i = 0; i < numPoints; i++) {
    points.push({
      x: Math.floor(rng() * 160) + 20,
      y: Math.floor(rng() * 160) + 20
    });
  }

  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L${points[i].x},${points[i].y}`;
  }
  
  if (rng() > 0.5) d += " Z";
  
  const last = points[points.length - 1];
  d += ` M${last.x - 10},${last.y} L${last.x + 10},${last.y} M${last.x},${last.y - 10} L${last.x},${last.y + 10}`;

  return d;
};

// --- ADVANCED AUDIO ENGINE ---

const useAudioEngine = () => {
  // FIX: Use 'any' to bypass missing AudioContext types
  const ctxRef = useRef<any>(null);
  const masterGainRef = useRef<any>(null);
  const reverbNodeRef = useRef<any>(null);
  const ambientNodeRef = useRef<any>(null);
  
  // Cache the impulse response to prevent crashing memory
  const impulseBufferRef = useRef<any>(null);

  // Store references to active nodes for the current loop
  const activeNodes = useRef<{
    sources?: any[];
    gain?: any;
    filter?: any;
    panner?: any;
    panners?: any[];
    lfo?: any;
    lfoGain?: any;
    extraGains?: any[]; 
    osc?: any;      // Added
    osc2?: any;     // Added
    source?: any;   // Added
  } | null>(null);

  // --- SYNTHESIS UTILITIES ---

  const createImpulseResponse = (ctx: any) => {
    if (impulseBufferRef.current) return impulseBufferRef.current;

    const duration = 3.0;
    const decay = 3.0;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        const n = i / length;
        const env = Math.pow(1 - n, decay);
        impulseL[i] = (Math.random() * 2 - 1) * env;
        impulseR[i] = (Math.random() * 2 - 1) * env;
    }
    impulseBufferRef.current = impulse;
    return impulse;
  };

  const makeDistortionCurve = (amount: number) => {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  };

  const initAudio = useCallback(() => {
    const globalAny = globalThis as any;
    if (typeof globalAny.window !== 'undefined' && !ctxRef.current) {
      const AudioContextClass = globalAny.window.AudioContext || globalAny.window.webkitAudioContext;
      if (AudioContextClass) {
          const ctx = new AudioContextClass();
          ctxRef.current = ctx;

          // Master Chain: MasterGain -> Limiter -> Destination
          const masterGain = ctx.createGain();
          masterGainRef.current = masterGain;
          masterGain.gain.value = 0.8;

          const limiter = ctx.createDynamicsCompressor();
          limiter.threshold.value = -10;
          limiter.ratio.value = 12;
          limiter.attack.value = 0.003;

          // Reverb Setup
          const reverb = ctx.createConvolver();
          reverb.buffer = createImpulseResponse(ctx);
          reverbNodeRef.current = reverb;
          
          const reverbGain = ctx.createGain();
          reverbGain.gain.value = 0.5; // Lovely reverb mix

          masterGain.connect(limiter);
          limiter.connect(ctx.destination);

          masterGain.connect(reverb);
          reverb.connect(reverbGain);
          reverbGain.connect(ctx.destination);
      }
    }
    if (ctxRef.current && ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch((e: any) => console.error("Audio resume failed", e));
    }
  }, []);

  // --- AMBIENT DRONE (The "Occultish Wizardry" Bed) ---
  const startAmbient = useCallback(() => {
      if (!ctxRef.current) initAudio();
      if (!ctxRef.current || ambientNodeRef.current) return; // Don't double up
      const ctx = ctxRef.current;

      // Brown Noise for a deep, cavernous rumble
      const bufferSize = ctx.sampleRate * 4; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // Compensate for gain loss
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 120; // Very muffled

      const gain = ctx.createGain();
      gain.gain.value = 0.15; // Subtle background

      noise.connect(filter);
      filter.connect(gain);
      
      // Send to reverb for space
      if (reverbNodeRef.current) {
          gain.connect(reverbNodeRef.current);
      } else {
          gain.connect(masterGainRef.current);
      }

      noise.start();
      ambientNodeRef.current = noise;
  }, [initAudio]);

  // --- UI SOUNDS ---

  // THE WATER DROPLET SOUND
  const playWaterDroplet = useCallback(() => {
    if (!ctxRef.current) initAudio();
    if (!ctxRef.current || !masterGainRef.current) return;
    const ctx = ctxRef.current;
    const t = ctx.currentTime;

    // High pitch sine drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.15); // Fast chirping drop

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    // CRITICAL: Connect to reverb for "droplet in cave" feel
    if (reverbNodeRef.current) {
        gain.connect(reverbNodeRef.current);
    }
    gain.connect(masterGainRef.current); // And dry signal

    osc.start(t);
    osc.stop(t + 0.25);
  }, [initAudio]);

  const playTypingBlip = useCallback(() => {
    if (!ctxRef.current) initAudio();
    if (!ctxRef.current || !masterGainRef.current) return;
    const ctx = ctxRef.current;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200 + Math.random() * 500, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.05);

    gain.gain.setValueAtTime(0.02, t); // Quieter typing
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    if (reverbNodeRef.current) gain.connect(reverbNodeRef.current);
    gain.connect(masterGainRef.current);

    osc.start(t);
    osc.stop(t + 0.1);
  }, [initAudio]);

  const playHeartbeat = useCallback(() => {
    if (!ctxRef.current || !masterGainRef.current) return;
    const ctx = ctxRef.current;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(50, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);
    
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(masterGainRef.current);
    if (reverbNodeRef.current) gain.connect(reverbNodeRef.current);
    
    osc.start(t);
    osc.stop(t + 0.4);
  }, []);

  // --- LOOP ENGINE ---

  const startLoop = useCallback((type: string) => {
    if (!ctxRef.current) initAudio();
    if (!ctxRef.current || !masterGainRef.current) return;
    const ctx = ctxRef.current;
    
    // Ensure ambient is running
    startAmbient();

    if (activeNodes.current?.gain) {
       activeNodes.current.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.1); 
       const oldNodes = activeNodes.current;
       setTimeout(() => {
         try { 
             if(oldNodes.sources) oldNodes.sources.forEach((s: any) => s.stop());
             if(oldNodes.osc) oldNodes.osc.stop();
             if(oldNodes.osc2) oldNodes.osc2.stop();
             if(oldNodes.lfo) oldNodes.lfo.stop();
             if(oldNodes.source) oldNodes.source.stop(); 
         } catch(e){ /**/ }
       }, 200);
    }

    const master = ctx.createGain();
    master.connect(masterGainRef.current);
    // Connect to reverb for atmosphere
    if (reverbNodeRef.current) master.connect(reverbNodeRef.current);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodes: any = { gain: master };

    if (type === 'drone') {
        // PHASE 1a: CONSECRATION (Warp Drive / Turbine)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();

        osc1.type = 'sawtooth'; 
        osc1.frequency.value = 130; 
        
        osc2.type = 'square'; 
        osc2.frequency.value = 65; 

        filter.type = 'lowpass';
        filter.frequency.value = 800; 
        filter.Q.value = 5; // High resonance for turbine whistle

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(master);

        osc1.start();
        osc2.start();

        nodes.osc = osc1;
        nodes.osc2 = osc2;
        nodes.filter = filter;
        
        master.gain.setValueAtTime(0.0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.2); 

    } else if (type === 'void_enter') {
        // PHASE 1b: GROWING VOID (Ascension + Depth)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator(); 
        const filter = ctx.createBiquadFilter();

        // Sub-bass (The Abyss)
        osc1.type = 'sawtooth';
        osc1.frequency.value = 40; 
        
        // Rising tone (Magickal Ascension)
        osc2.type = 'sine';
        osc2.frequency.value = 200; 

        filter.type = 'lowpass';
        filter.frequency.value = 100; 

        osc1.connect(filter);
        osc2.connect(master); 
        filter.connect(master);

        osc1.start();
        osc2.start();

        nodes.osc = osc1;
        nodes.osc2 = osc2;
        nodes.filter = filter;
        
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2);

    } else if (type === 'etching') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        osc.connect(filter);
        filter.connect(master);
        osc.start();
        nodes.osc = osc;
        nodes.filter = filter;
        master.gain.setValueAtTime(0.1, ctx.currentTime);

    } else if (type === 'breath') {
        // Use brown noise instead of creating new buffer for breath to save CPU
        const osc = ctx.createOscillator();
        osc.type = 'sine'; // Simple carrier
        osc.frequency.value = 100;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 1;
        
        const panner = ctx.createStereoPanner();

        osc.connect(filter);
        filter.connect(panner);
        panner.connect(master);
        osc.start();

        nodes.osc = osc;
        nodes.filter = filter;
        nodes.panner = panner;
        master.gain.setValueAtTime(0.1, ctx.currentTime);

    } else if (type === 'charge') {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.connect(master);
      master.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      nodes.osc = osc;

    } else if (type === 'chant') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.connect(master);
      master.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      nodes.osc = osc;
    }

    activeNodes.current = nodes;
  }, [initAudio, startAmbient]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateLoop = useCallback((progress: any, type: string) => {
    if (!ctxRef.current || !activeNodes.current) return;
    const ctx = ctxRef.current;
    const nodes = activeNodes.current;
    const t = ctx.currentTime;

    if (type === 'drone') {
        // SINKING SOUND (Consecrate)
        if(nodes.osc) nodes.osc.frequency.setTargetAtTime(130 - (progress * 0.9), t, 0.1);
        if(nodes.osc2) nodes.osc2.frequency.setTargetAtTime(65 - (progress * 0.35), t, 0.1);
        if(nodes.filter) nodes.filter.frequency.setTargetAtTime(800 + (progress * 40), t, 0.1);
        if(nodes.gain) nodes.gain.gain.setTargetAtTime(0.4 + (progress * 0.002), t, 0.1);

    } else if (type === 'void_enter') {
        // VOID GROWTH (Ascension + Depth)
        const p = typeof progress === 'number' ? progress : 0;
        // Filter opens on sub-bass (Deepening)
        if (nodes.filter) nodes.filter.frequency.setTargetAtTime(100 + (p * 4), t, 0.1);
        // Sine wave pitches UP (Ascending Magick)
        if (nodes.osc2) nodes.osc2.frequency.setTargetAtTime(200 + (p * 6), t, 0.1);
        // Volume increases
        if (nodes.gain) nodes.gain.gain.setTargetAtTime(0.5 + (p * 0.005), t, 0.1);

    } else if (type === 'etching') {
         const p = typeof progress === 'number' ? progress : 0;
         if(nodes.filter) nodes.filter.frequency.setTargetAtTime(200 + (p * 50), t, 0.1);
         if(nodes.osc) nodes.osc.frequency.setTargetAtTime(50 + (p * 2), t, 0.1);

    } else if (type === 'breath') {
        if(nodes.filter) {
            if (progress === 'INHALE') {
                nodes.filter.frequency.setTargetAtTime(400, t, 2);
                if(nodes.panner) nodes.panner.pan.linearRampToValueAtTime(0.8, t + 4);
            } else if (progress === 'HOLD') {
                nodes.filter.frequency.setTargetAtTime(400, t, 0.1);
            } else {
                nodes.filter.frequency.setTargetAtTime(100, t, 2);
                if(nodes.panner) nodes.panner.pan.linearRampToValueAtTime(-0.8, t + 4);
            }
        }
    } else if (type === 'charge') {
       if(nodes.osc) nodes.osc.frequency.setTargetAtTime(100 + (progress * 10), t, 0.1);
    }
  }, []);

  const stopLoop = useCallback(() => {
    if (activeNodes.current && activeNodes.current.gain && ctxRef.current) {
      // Fast cut
      activeNodes.current.gain.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.05);
      setTimeout(() => {
          if (activeNodes.current?.osc) activeNodes.current.osc.stop();
          if (activeNodes.current?.osc2) activeNodes.current.osc2.stop();
          if (activeNodes.current?.lfo) activeNodes.current.lfo.stop();
          if (activeNodes.current?.source) activeNodes.current.source.stop();
          activeNodes.current = null;
      }, 100);
    }
  }, []);

  const playCastBoom = useCallback(() => {
      if (!ctxRef.current) initAudio();
      if (!ctxRef.current || !masterGainRef.current) return;
      const ctx = ctxRef.current;
      const t = ctx.currentTime;

      // Optimized Boom: Just 2 Oscillators (Sub + Crackle) to prevent crash
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(150, t);
      subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.8); 
      subGain.gain.setValueAtTime(1.0, t);
      subGain.gain.exponentialRampToValueAtTime(0.01, t + 2.5); 
      subOsc.connect(subGain);
      subGain.connect(masterGainRef.current);
      subOsc.start(t);
      subOsc.stop(t + 2.6);

      // High frequency shimmer (Replacing heavy noise buffer)
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'triangle';
      shimmer.frequency.setValueAtTime(800, t);
      shimmer.frequency.exponentialRampToValueAtTime(5000, t + 1.5); // Ascending spark
      shimmerGain.gain.setValueAtTime(0.3, t);
      shimmerGain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
      
      shimmer.connect(shimmerGain);
      if (reverbNodeRef.current) shimmerGain.connect(reverbNodeRef.current);
      else shimmerGain.connect(masterGainRef.current);
      
      shimmer.start(t);
      shimmer.stop(t + 1.6);

  }, [initAudio]);

  const playSuccess = useCallback(() => {
     if (!ctxRef.current) initAudio();
     if (!ctxRef.current || !masterGainRef.current) return;
     const ctx = ctxRef.current;
     const t = ctx.currentTime;
     
     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     osc.type = 'sine';
     osc.frequency.setValueAtTime(440, t);
     osc.frequency.exponentialRampToValueAtTime(880, t + 0.2);
     gain.gain.setValueAtTime(0.1, t);
     gain.gain.exponentialRampToValueAtTime(0.001, t + 1);
     
     osc.connect(gain);
     if (reverbNodeRef.current) gain.connect(reverbNodeRef.current);
     gain.connect(masterGainRef.current);
     osc.start();
     osc.stop(t + 1.1);
  }, [initAudio]);

  return { playWaterDroplet, playTypingBlip, startLoop, updateLoop, stopLoop, playCastBoom, playSuccess, playHeartbeat, initAudio, startAmbient };
};

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
  const [voidProgress, setVoidProgress] = useState(0);
  const [pulseTime, setPulseTime] = useState(0); 
  const [stage, setStage] = useState<'consecrate' | 'growing' | 'pulsing'>('consecrate');
  const [isHolding, setIsHolding] = useState(false);
  const [scalePulse, setScalePulse] = useState(1);

  // Initialize Ambient Drone on first interaction
  const handleInteraction = useCallback((e: React.SyntheticEvent) => {
      e.preventDefault();
      audio.initAudio(); 
      audio.startAmbient();
      setIsHolding(true);
  }, [audio]);

  const handleHoldEnd = useCallback((e: React.SyntheticEvent) => {
      e.preventDefault();
      setIsHolding(false);
  }, []);

  useEffect(() => {
    if (isHolding) {
       if (stage === 'consecrate') audio.startLoop('drone');
       if (stage === 'growing') audio.startLoop('void_enter');
    } else {
       audio.stopLoop();
    }
    return () => audio.stopLoop();
  }, [isHolding, stage, audio]); 

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isHolding) {
      interval = setInterval(() => {
        
        // --- STAGE 1: CONSECRATE (Shrink to Dot) ---
        if (stage === 'consecrate') {
            setProgress(prev => {
                const next = prev + 0.5; // 4 seconds duration
                audio.updateLoop(next, 'drone');
                if (next >= 100) {
                    setStage('growing');
                    audio.stopLoop(); 
                    setTimeout(() => audio.startLoop('void_enter'), 50); 
                    const nav = (globalThis as any).navigator;
                    if (typeof nav !== 'undefined' && nav.vibrate) nav.vibrate(50);
                    return 100;
                }
                return next;
            });

        // --- STAGE 2: GROWING (13 Seconds to Full Size) ---
        } else if (stage === 'growing') {
            setVoidProgress(prev => {
                const next = prev + 0.153; 
                audio.updateLoop(next, 'void_enter'); 
                if (next >= 100) {
                    setStage('pulsing');
                    const nav = (globalThis as any).navigator;
                    if (typeof nav !== 'undefined' && nav.vibrate) nav.vibrate(100);
                    return 100;
                }
                return next;
            });

        // --- STAGE 3: PULSING (7 Seconds Heartbeat) ---
        } else if (stage === 'pulsing') {
            setPulseTime(prev => {
                const next = prev + 20; 
                const beat = (Math.sin(next * 0.006) + 1) / 2; 
                setScalePulse(1 + (beat * 0.1)); 

                if (next % 1000 < 25 && next > 50) {
                    audio.playHeartbeat();
                    const nav = (globalThis as any).navigator;
                    if (typeof nav !== 'undefined' && nav.vibrate) nav.vibrate(20);
                }

                if (next >= 7000) {
                    clearInterval(interval);
                    audio.stopLoop();
                    audio.playCastBoom(); 
                    const nav = (globalThis as any).navigator;
                    if (typeof nav !== 'undefined' && nav.vibrate) nav.vibrate([200, 100, 500, 100, 1000]);
                    setPhase('GROUNDING');
                    return 7000;
                }
                return next;
            });
        }
      }, 20);

    } else {
        if (stage !== 'consecrate' || progress > 0) {
             setStage('consecrate');
             setProgress(0);
             setVoidProgress(0);
             setPulseTime(0);
             setScalePulse(1);
             audio.stopLoop();
        }
    }
    return () => clearInterval(interval);
  }, [isHolding, stage, setPhase, audio]); 

  const ArchetypeIcon = archetype.icon;
  const getVoidMessage = () => {
      if (stage === 'growing') return "OPENING THE GATE...";
      if (stage === 'pulsing') return "ALIGNING HEARTBEAT...";
      return "";
  };
  const growSize = 10 + (voidProgress / 100) * 260; 

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-1000 relative z-10 select-none">
      
      <div className="relative w-80 h-80 flex items-center justify-center">
        {stage === 'consecrate' ? (
            <>
                <div className={`absolute inset-0 border-2 border-dashed ${archetype.border} rounded-full opacity-50 transition-transform duration-75 ease-linear`}
                     style={{ transform: `rotate(${progress * 10}deg) scale(${1 - (progress / 100)})`, opacity: 1 - (progress/100) }} />
                <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-linear`}
                     style={{ transform: `scale(${1 - (progress/100)}) translate(${isHolding ? (Math.random() * 2 - 1) + 'px' : '0'}, ${isHolding ? (Math.random() * 2 - 1) + 'px' : '0'})`, opacity: 1 - (progress/100) }}>
                    <ArchetypeIcon className={`w-16 h-16 ${archetype.color}`} />
                </div>
            </>
        ) : (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black rounded-full shadow-[0_0_60px_rgba(255,255,255,0.2)] z-30 transition-all duration-75" 
                     style={{ width: `${growSize}px`, height: `${growSize}px`, transform: stage === 'pulsing' ? `scale(${scalePulse})` : 'scale(1)' }}
                />
                {stage === 'growing' && (
                    <div className="absolute rounded-full border border-cyan-500/30 opacity-50 animate-ping"
                         style={{ width: `${growSize}px`, height: `${growSize}px`, animationDuration: '3s' }} />
                )}
                {stage === 'pulsing' && (
                    <div className="absolute rounded-full border-2 border-purple-500/50"
                         style={{ width: `${growSize}px`, height: `${growSize}px`, transform: `scale(${scalePulse + 0.2})`, opacity: 0.5 }} />
                )}
            </div>
        )}
      </div>

      <div className="text-center space-y-4 relative z-40 mix-blend-difference h-24">
        <h2 className={`text-white font-serif italic text-xl tracking-[0.2em] drop-shadow-md transition-all duration-500`}>
            {stage === 'consecrate' ? "CONSECRATE" : getVoidMessage()}
        </h2>
        <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest max-w-xs mx-auto">
            {stage === 'consecrate' ? "Hold to collapse reality to a single point" : "Do not release the connection"}
        </p>
      </div>

      <button 
        className={`w-32 h-32 rounded-full bg-white/5 border-2 border-double ${archetype.border} shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-95 transition-all flex items-center justify-center group z-40 animate-pulse`}
        onMouseDown={handleInteraction}
        onMouseUp={handleHoldEnd}
        onMouseLeave={handleHoldEnd}
        onTouchStart={handleInteraction}
        onTouchEnd={handleHoldEnd}
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
      await new Promise(r => setTimeout(r, 3000));
      
      if (!isMounted) return;
      setBreathState('EXHALE');
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

  const guideStyle = {
    transform: breathState === 'INHALE' ? 'scale(1.5)' : breathState === 'EXHALE' ? 'scale(0.5)' : 'scale(1.5)',
    opacity: breathState === 'INHALE' ? 1 : breathState === 'EXHALE' ? 0.4 : 0.8,
    transition: breathState === 'HOLD' ? 'none' : 'all 4s ease-in-out',
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 relative z-10">
      <div className="relative">
        <div className="w-32 h-32 bg-cyan-900/20 border border-cyan-500/30 rounded-full blur-xl absolute inset-0 transition-all duration-4000" style={guideStyle} />
        <div className="w-32 h-32 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-4000" style={guideStyle}>
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

// 3. INSCRIPTION
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Inscription = ({ setIntention, setArchetype, setPhase, archetype, audio, setAiData }: any) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleType = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value.toUpperCase());
      audio.playTypingBlip(); 
  };

  const handleSubmit = async () => {
      if (text.length < 3) return;
      setIsLoading(true);
      audio.playWaterDroplet(); // Magickal droplet sound on submit
      
      const arch = detectArchetype(text);
      setArchetype(arch);
      setIntention(text);

      try {
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
         
         {/* CHANGED TO TEXTAREA FOR VISIBILITY */}
         <textarea 
           value={text}
           onChange={handleType}
           placeholder="I DESIRE..."
           disabled={isLoading}
           className="w-full h-32 bg-transparent border-2 border-double border-slate-700 rounded-lg p-4 text-center text-2xl font-serif italic text-white focus:outline-none focus:border-white transition-colors placeholder-slate-800 resize-none whitespace-pre-wrap"
         />
         
         {isLoading ? (
             <p className="text-cyan-500 animate-pulse font-mono text-xs">CONSULTING THE AETHER...</p>
         ) : (
             text.length > 3 && (
               <button 
                 onClick={handleSubmit}
                 className="mt-12 px-12 py-4 border-2 border-double border-slate-700 text-slate-300 font-serif tracking-[0.2em] uppercase bg-black hover:bg-slate-900 hover:text-white hover:border-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
               >
                 Crystallize
               </button>
             )
         )}
    </div>
  );
};

// 4. AGREEMENT
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Agreement = ({ setPhase, audio }: any) => {
    return (
        <div className="flex flex-col items-center justify-center h-full px-8 text-center space-y-8 animate-in fade-in">
            <h2 className="text-white font-serif text-2xl">The Covenant</h2>
            <p className="text-slate-400 leading-relaxed max-w-md">
                You are about to etch your will into the Seed of Creation. 
                <br/><br/>
                As the sigil burns, obscure poetry will appear. 
                <br/>
                <span className="text-white font-bold">You must read these words aloud or project them loudly in your mind.</span>
            </p>
            <button 
                onClick={() => { audio.playWaterDroplet(); setPhase('ETCHING'); }}
                className="mt-8 px-8 py-4 bg-slate-900 border border-slate-600 text-white font-mono text-xs tracking-widest hover:bg-white hover:text-black transition-all"
            >
                I AGREE TO SPEAK THE WORDS
            </button>
        </div>
    )
}

// 5. ETCHING (The 13 Seconds)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Etching = ({ setPhase, archetype, audio, aiData, intention }: any) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  
  const duration = 13000; 
  const colorPalette = ['#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  const colorIndex = Math.floor((progress / 100) * colorPalette.length * 3) % colorPalette.length;
  const currentColor = colorPalette[colorIndex];
  const rotationSpeed = 2 + (progress / 100) * 10; 

  useEffect(() => {
      if (isHolding && !hasFinished) {
          audio.startLoop('etching');
      } else {
          audio.stopLoop();
      }
      return () => audio.stopLoop();
  }, [isHolding, hasFinished, audio]);

  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isHolding && !hasFinished) {
          const step = 100 / (duration / 20); 
          interval = setInterval(() => {
              setProgress(p => {
                  const next = p + step;
                  if (next >= 100) {
                      setHasFinished(true);
                      return 100;
                  }
                  return next;
              });
              audio.updateLoop(progress, 'etching');
          }, 20);
      }
      return () => clearInterval(interval);
  }, [isHolding, hasFinished, progress, audio, duration]);

  const sigilPath = useMemo(() => generateSigilPath(intention), [intention]);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 relative z-10">
      {/* Magickal Poetry Display */}
      <div className="absolute top-10 w-full px-6 text-center pointer-events-none">
          <p className={`font-serif text-xl leading-relaxed transition-all duration-300 whitespace-pre-wrap ${isHolding ? 'opacity-100 blur-0' : 'opacity-30 blur-sm'}`} 
             style={{ color: currentColor, textShadow: `0 0 15px ${currentColor}` }}>
              {aiData.poetry}
          </p>
      </div>

      <div className="relative w-72 h-72 bg-black/50 border border-slate-800 backdrop-blur-sm mt-20">
        <svg viewBox="0 0 200 200" className="w-full h-full p-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
           <path d={sigilPath} stroke="#334155" strokeWidth="2" fill="none" />
           <path d={sigilPath} stroke={currentColor} strokeWidth="3" fill="none"
            className="transition-all duration-75"
            strokeDasharray="1000" 
            strokeDashoffset={1000 - (1000 * ((progress * 5) % 100) / 100)} 
            style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}
          />
        </svg>
        
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
            onClick={() => { audio.playWaterDroplet(); setPhase('CHANT'); }}
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

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (chanting && charge < 100) {
            interval = setInterval(() => {
                setCharge(c => c + 0.5); 
                const nav = (globalThis as any).navigator;
                if (typeof nav !== 'undefined' && nav.vibrate && charge % 20 === 0) nav.vibrate(20);
            }, 30);
        } else if (!chanting && charge > 0) {
            setCharge(0); 
        }

        if (charge >= 100) {
            audio.playSuccess();
            const nav = (globalThis as any).navigator;
            if (typeof nav !== 'undefined' && nav.vibrate) nav.vibrate([100, 100, 100]);
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
         const nav = (globalThis as any).navigator;
         if (typeof nav !== 'undefined' && nav.vibrate && Math.random() > 0.7) nav.vibrate(10); 
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
        audio.stopLoop();
        audio.playCastBoom(); 
        const nav = (globalThis as any).navigator;
        if (typeof nav !== 'undefined' && nav.vibrate) nav.vibrate([500, 200, 500, 200, 1000]);
        setGlitchActive(true);
        const timeout = setTimeout(() => setPhase('CAST'), 5500);
        return () => clearTimeout(timeout);
     }
   }, [charge, setPhase, setGlitchActive, audio]);

   const IconComponent = archetype.icon;

   return (
       <div className={`flex flex-col items-center justify-center h-full space-y-12 relative z-10`}
            style={{ 
                transform: shaking ? `translate(${Math.random()*10 - 5}px, ${Math.random()*10 - 5}px)` : 'none' 
            }}
       >
           <div className="relative w-80 h-80">
               <div className={`absolute inset-0 rounded-full bg-linear-to-tr from-black via-transparent to-${archetype.theme === 'VENUS' ? 'rose' : 'cyan'}-900 animate-spin-slow blur-xl opacity-80`} />
               
               <div className="absolute inset-0 flex items-center justify-center">
                   <IconComponent 
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
const FinalCast = ({ intention, archetype, audio, onExit }: any) => (
    <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-3000 relative z-10">
        <div className="relative mb-12">
            <div className={`absolute inset-0 ${archetype.bg} blur-[100px] opacity-40 animate-pulse`} />
            <Check className={`w-48 h-48 ${archetype.color} drop-shadow-[0_0_50px_currentColor]`} />
        </div>
        <h1 className="text-4xl font-serif italic text-white tracking-widest mb-6 drop-shadow-lg">SO MOTE IT BE</h1>
        <div className="w-full max-w-md px-4">
            <p className={`${archetype.color} font-mono text-xs tracking-[0.2em] uppercase text-center whitespace-pre-wrap`}>Target: {intention}</p>
        </div>
        <p className="text-slate-600 font-mono text-[10px] mt-12 animate-pulse">The universe has been recompiled.</p>
        <button 
          onClick={() => { audio.playWaterDroplet(); onExit(); }}
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
            {phase === 'ETCHING' && <Etching setPhase={setPhase} archetype={archetype} audio={audio} aiData={aiData} intention={intention} />}
            {phase === 'CHANT' && <VocalChant setPhase={setPhase} archetype={archetype} audio={audio} aiData={aiData} />}
            {phase === 'CHARGE' && <ChargeAndCast setPhase={setPhase} setGlitchActive={setGlitchActive} archetype={archetype} audio={audio} />}
            {phase === 'CAST' && <FinalCast intention={intention} archetype={archetype} audio={audio} onExit={onExit} />}
        </main>
      </div>
    </div>
  );
}