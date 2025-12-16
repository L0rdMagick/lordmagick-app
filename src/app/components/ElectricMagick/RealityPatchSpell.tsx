// --- START OF FILE src/app/components/ElectricMagick/RealityPatchSpell.tsx ---
/// <reference lib="dom" />
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Heart, DollarSign, Sun, Shield, Star, Fingerprint, Check, Eye, X, Sparkles, Lock, Save, Zap, ArrowDown, Database, Infinity
} from 'lucide-react';
import { generateRealityPatchRitual, saveSpell, deductUserCredits, RealityPatchRitualData } from '@/lib/services/geminiService';
import type { Session } from '@/lib/types';

// --- CONSTANTS & DATA ---
const COST_TO_BREACH = 10;
const COST_TO_SAVE = 5;

const ARCHETYPES = {
  LOVE: { color: 'text-rose-500', border: 'border-rose-500', bg: 'bg-rose-500', icon: Heart, theme: 'VENUS' },
  MONEY: { color: 'text-emerald-400', border: 'border-emerald-400', bg: 'bg-emerald-400', icon: DollarSign, theme: 'JUPITER' },
  POWER: { color: 'text-amber-500', border: 'border-amber-500', bg: 'bg-amber-500', icon: Sun, theme: 'SOL' },
  PROTECT: { color: 'text-blue-500', border: 'border-blue-500', bg: 'bg-blue-500', icon: Shield, theme: 'MARS' },
  UNK: { color: 'text-cyan-400', border: 'border-cyan-400', bg: 'bg-cyan-400', icon: Star, theme: 'AETHER' }
};

const detectArchetype = (text: string) => {
  const t = text.toUpperCase();
  if (t.includes('LOVE') || t.includes('HEART') || t.includes('PARTNER') || t.includes('SOULMATE')) return ARCHETYPES.LOVE;
  if (t.includes('MONEY') || t.includes('WEALTH') || t.includes('CASH') || t.includes('RICH')) return ARCHETYPES.MONEY;
  if (t.includes('POWER') || t.includes('CONTROL') || t.includes('WIN') || t.includes('SUCCESS')) return ARCHETYPES.POWER;
  if (t.includes('PROTECT') || t.includes('SAFE') || t.includes('GUARD') || t.includes('SHIELD')) return ARCHETYPES.PROTECT;
  return ARCHETYPES.UNK;
};

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

// --- UTILITY: SIGIL TEXT SCATTER ---
const getScatteredChars = (text: string) => {
    if (!text) return [];
    const consonants = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/[AEIOU]/g, '');
    const unique = Array.from(new Set(consonants.split('')));
    return unique;
};

// --- PARTICLE SYSTEM HOOK ---
const useParticleSystem = () => {
  const canvasRef = useRef<any>(null);
  const particlesRef = useRef<any[]>([]);

  const spawnExplosion = useCallback((x: number, y: number, color = '#a855f7', count = 30) => {
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
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const globalAny = globalThis as any;

    const resize = () => {
      if (typeof globalAny.window !== 'undefined') {
        canvas.width = globalAny.window.innerWidth;
        canvas.height = globalAny.window.innerHeight;
      }
    };
    
    if (typeof globalAny.window !== 'undefined') {
      globalAny.window.addEventListener('resize', resize);
      resize();
    }

    let animationFrame: number;
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.vx *= 0.95;
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
      
        if (typeof globalAny.window !== 'undefined') {
            animationFrame = globalAny.window.requestAnimationFrame(animate);
        }
    };
    animate();
    return () => {
      if (typeof globalAny.window !== 'undefined') {
        globalAny.window.removeEventListener('resize', resize);
        globalAny.window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return { canvasRef, spawnExplosion };
};

// --- ADVANCED AUDIO ENGINE ---
const useAudioEngine = () => {
  const ctxRef = useRef<any>(null);
  const masterGainRef = useRef<any>(null);
  const reverbNodeRef = useRef<any>(null);
  
  const activeNodes = useRef<{
    sources?: any[];
    gain?: any;
    filter?: any;
    panner?: any;
    lfo?: any;
    lfoGain?: any;
    extraGains?: any[]; 
    type?: string;
  } | null>(null);

  const createPinkNoise = (ctx: any) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; 
        b6 = white * 0.115926;
    }
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    node.loop = true;
    return node;
  };

  const createBrownNoise = (ctx: any) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; 
    }
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    node.loop = true;
    return node;
  };

  const createImpulseResponse = (ctx: any) => {
    const duration = 2.0;
    const decay = 2.0;
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
    return impulse;
  };

  const initAudio = useCallback(() => {
    const globalAny = globalThis as any;
    if (typeof globalAny.window !== 'undefined' && !ctxRef.current) {
      const AudioContextClass = globalAny.window.AudioContext || globalAny.window.webkitAudioContext;
      if (AudioContextClass) {
          const ctx = new AudioContextClass();
          ctxRef.current = ctx;

          const masterGain = ctx.createGain();
          masterGainRef.current = masterGain;
          masterGain.gain.value = 0.8;

          const limiter = ctx.createDynamicsCompressor();
          limiter.threshold.value = -5;
          
          const reverb = ctx.createConvolver();
          reverb.buffer = createImpulseResponse(ctx);
          reverbNodeRef.current = reverb;
          const reverbGain = ctx.createGain();
          reverbGain.gain.value = 0.3;

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

  const stopLoop = useCallback(() => {
    if (activeNodes.current && activeNodes.current.gain && ctxRef.current) {
      const t = ctxRef.current.currentTime;
      const nodesToStop = activeNodes.current;
      activeNodes.current = null;

      try {
        nodesToStop.gain.gain.cancelScheduledValues(t);
        nodesToStop.gain.gain.setValueAtTime(nodesToStop.gain.gain.value, t);
        nodesToStop.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      } catch (e) { /**/ }
      
      setTimeout(() => {
          if (nodesToStop.sources) nodesToStop.sources.forEach((s: any) => { try { s.stop(); s.disconnect(); } catch(e){} });
          if (nodesToStop.lfo) { try { nodesToStop.lfo.stop(); nodesToStop.lfo.disconnect(); } catch(e){} }
          try { nodesToStop.gain.disconnect(); } catch(e){}
          if (nodesToStop.extraGains) nodesToStop.extraGains.forEach((g: any) => { try { g.disconnect(); } catch(e){} });
      }, 350);
    }
  }, []);

  const startLoop = useCallback((type: string) => {
    if (!ctxRef.current) initAudio();
    if (!ctxRef.current || !masterGainRef.current) return;
    
    stopLoop();

    const ctx = ctxRef.current;
    const t = ctx.currentTime;
    const loopMaster = ctx.createGain();
    loopMaster.connect(masterGainRef.current);
    if(reverbNodeRef.current) loopMaster.connect(reverbNodeRef.current);

    const nodes: any = { gain: loopMaster, type };

    if (type === 'drone') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();

        osc1.type = 'sawtooth'; 
        osc1.frequency.value = 130; 
        osc2.type = 'square'; 
        osc2.frequency.value = 65; 

        filter.type = 'lowpass';
        filter.frequency.value = 800; 
        filter.Q.value = 5;

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(loopMaster);

        osc1.start();
        osc2.start();

        nodes.sources = [osc1, osc2];
        nodes.filter = filter;
        loopMaster.gain.setValueAtTime(0.0, t);
        loopMaster.gain.linearRampToValueAtTime(0.3, t + 0.2); 

    } else if (type === 'void_enter') {
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(60, t); 

        const osc2 = ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(65, t); 

        const noise = createPinkNoise(ctx);
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.2;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, t); 
        filter.Q.value = 6; 

        osc1.connect(filter);
        osc2.connect(filter);
        noise.connect(noiseGain);
        noiseGain.connect(filter);
        filter.connect(loopMaster);

        osc1.start();
        osc2.start();
        noise.start();

        nodes.sources = [osc1, osc2, noise];
        nodes.filter = filter;
        loopMaster.gain.setValueAtTime(0, t);
        loopMaster.gain.linearRampToValueAtTime(0.6, t + 0.5);

    } else if (type === 'breath') {
        const noise = createBrownNoise(ctx);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        filter.Q.value = 2; 

        const droneOsc = ctx.createOscillator();
        droneOsc.type = 'sine';
        droneOsc.frequency.value = 150; 
        const droneGain = ctx.createGain();
        droneGain.gain.value = 0; 

        noise.connect(filter);
        filter.connect(loopMaster);
        droneOsc.connect(droneGain);
        droneGain.connect(loopMaster);

        noise.start();
        droneOsc.start();

        nodes.sources = [noise, droneOsc];
        nodes.filter = filter;
        nodes.extraGains = [droneGain]; 
        loopMaster.gain.value = 1.0; 

    } else if (type === 'consulting') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 750;

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 2; 

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 50; 

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        const ampLfo = ctx.createOscillator();
        ampLfo.type = 'triangle';
        ampLfo.frequency.value = 4;
        const ampGain = ctx.createGain();
        ampGain.gain.value = 0.1;
        
        osc.connect(ampGain);
        ampGain.connect(loopMaster);
        
        const scaler = ctx.createGain();
        scaler.gain.value = 0.05;
        ampLfo.connect(scaler);
        scaler.connect(ampGain.gain);

        osc.start();
        lfo.start();
        ampLfo.start();

        nodes.sources = [osc, lfo, ampLfo];
        loopMaster.gain.setValueAtTime(0, t);
        loopMaster.gain.linearRampToValueAtTime(0.15, t + 0.5);

    } else if (type === 'etching') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 4000; 

        const noise = createPinkNoise(ctx);
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.3;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 10; 
        filter.frequency.value = 2000;

        osc.connect(filter);
        noise.connect(noiseGain);
        noiseGain.connect(filter);
        filter.connect(loopMaster);

        osc.start();
        noise.start();

        nodes.sources = [osc, noise];
        nodes.filter = filter;
        loopMaster.gain.setValueAtTime(0, t);
        loopMaster.gain.linearRampToValueAtTime(0.4, t + 0.1);

    } else if (type === 'chant') {
        const rootFreq = 130.81; 
        const freqs = [rootFreq, rootFreq * 1.25, rootFreq * 1.5]; 
        const sources: any[] = [];

        freqs.forEach(f => {
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = f;
            osc.connect(loopMaster);
            osc.start();
            sources.push(osc);
        });

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.2; 
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.2;
        lfo.connect(lfoGain);
        lfoGain.connect(loopMaster.gain);
        lfo.start();

        nodes.sources = sources;
        nodes.lfo = lfo;
        
        loopMaster.gain.setValueAtTime(0, t);
        loopMaster.gain.linearRampToValueAtTime(0.3, t+1);

    } else if (type === 'charge') {
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth'; 
        osc1.frequency.value = 60; 

        const osc2 = ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.value = 62; 

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400; 
        filter.Q.value = 8; 

        const lfo = ctx.createOscillator();
        lfo.type = 'square'; 
        lfo.frequency.value = 5; 
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 10; 
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(loopMaster);
        
        osc1.start();
        osc2.start();
        lfo.start();

        nodes.sources = [osc1, osc2];
        nodes.lfo = lfo; 
        nodes.lfoGain = lfoGain; 
        nodes.filter = filter;

        loopMaster.gain.setValueAtTime(0, t);
        loopMaster.gain.linearRampToValueAtTime(0.6, t+0.5); 
    }

    activeNodes.current = nodes;
  }, [initAudio, stopLoop]);

  const updateLoop = useCallback((progress: any, type: string) => {
    if (!ctxRef.current || !activeNodes.current || activeNodes.current.type !== type) return;
    const ctx = ctxRef.current;
    const nodes = activeNodes.current;
    const t = ctx.currentTime;

    if (type === 'drone') {
        if(nodes.sources && nodes.sources.length === 2) {
            nodes.sources[0].frequency.setTargetAtTime(130 - (progress * 0.9), t, 0.1);
            nodes.sources[1].frequency.setTargetAtTime(65 - (progress * 0.35), t, 0.1);
        }
        if(nodes.filter) nodes.filter.frequency.setTargetAtTime(800 + (progress * 40), t, 0.1);
        if(nodes.gain) nodes.gain.gain.setTargetAtTime(0.3 + (progress * 0.002), t, 0.1);

    } else if (type === 'void_enter') {
        const p = typeof progress === 'number' ? progress : 0;
        const normalized = p / 100;

        if (nodes.sources && nodes.sources.length >= 2) {
            nodes.sources[0].frequency.linearRampToValueAtTime(60 + (normalized * 240), t + 0.1);
            nodes.sources[1].frequency.linearRampToValueAtTime(65 + (normalized * 245), t + 0.1);
        }
        if (nodes.filter) {
            nodes.filter.frequency.exponentialRampToValueAtTime(100 + (normalized * 4900), t + 0.1);
        }
        nodes.gain.gain.setTargetAtTime(0.2 + (normalized * 0.6), t, 0.1);

    } else if (type === 'breath') {
        if (progress === 'INHALE') {
            if(nodes.filter) {
                nodes.filter.frequency.cancelScheduledValues(t);
                nodes.filter.frequency.linearRampToValueAtTime(1500, t + 4); 
            }
            if(nodes.gain) {
                nodes.gain.gain.cancelScheduledValues(t);
                nodes.gain.gain.linearRampToValueAtTime(0.8, t + 4); 
            }
            if(nodes.extraGains) {
                nodes.extraGains[0].gain.cancelScheduledValues(t);
                nodes.extraGains[0].gain.linearRampToValueAtTime(0.3, t + 4); 
            }

        } else if (progress === 'HOLD') {
            if(nodes.filter) nodes.filter.frequency.setTargetAtTime(1500, t, 0.1); 
            if(nodes.gain) nodes.gain.gain.setTargetAtTime(0.8, t, 0.1); 
            if(nodes.extraGains) nodes.extraGains[0].gain.setTargetAtTime(0.3, t, 0.1);

        } else if (progress === 'EXHALE') {
            if(nodes.filter) {
                nodes.filter.frequency.cancelScheduledValues(t);
                nodes.filter.frequency.setValueAtTime(600, t); 
                nodes.filter.frequency.exponentialRampToValueAtTime(50, t + 3.5); 
            }
            if(nodes.gain) {
                nodes.gain.gain.cancelScheduledValues(t);
                nodes.gain.gain.setValueAtTime(0.4, t); 
                nodes.gain.gain.linearRampToValueAtTime(0, t + 4); 
            }
            if(nodes.extraGains) {
                nodes.extraGains[0].gain.linearRampToValueAtTime(0, t + 2); 
            }
        }

    } else if (type === 'etching') {
        const p = typeof progress === 'number' ? progress : 0;
        if(nodes.filter) {
            const randomFreq = 500 + Math.random() * 4000;
            nodes.filter.frequency.setTargetAtTime(randomFreq, t, 0.05);
        }
        if(nodes.gain) {
            nodes.gain.gain.setTargetAtTime(0.3 + (Math.random() * 0.2), t, 0.05);
        }
    } else if (type === 'charge') {
        const p = typeof progress === 'number' ? progress : 0;
        const normalized = p / 100;
        
        if(nodes.sources) {
            nodes.sources[0].frequency.setTargetAtTime(60 + (normalized * 740), t, 0.1);
            nodes.sources[1].frequency.setTargetAtTime(62 + (normalized * 740), t, 0.1);
        }
        if(nodes.filter) {
            nodes.filter.frequency.setTargetAtTime(400 + (normalized * 14600), t, 0.1);
        }
        if(nodes.lfo) {
            nodes.lfo.frequency.setTargetAtTime(5 + (normalized * 55), t, 0.1);
        }
        if(nodes.lfoGain) {
            nodes.lfoGain.gain.setTargetAtTime(10 + (normalized * 100), t, 0.1);
        }
        if(nodes.gain) {
            nodes.gain.gain.setTargetAtTime(0.6 + (normalized * 0.4), t, 0.1);
        }
    }
  }, []);

  const playOneShot = useCallback((type: string) => {
      if (!ctxRef.current) initAudio();
      if (!ctxRef.current || !masterGainRef.current) return;
      const ctx = ctxRef.current;
      const t = ctx.currentTime;

      if (type === 'water') {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.frequency.setValueAtTime(800, t);
          osc.frequency.exponentialRampToValueAtTime(200, t + 0.2);
          g.gain.setValueAtTime(0.3, t);
          g.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
          osc.connect(g); g.connect(masterGainRef.current);
          osc.start(); osc.stop(t + 0.3);
      } else if (type === 'type') {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.frequency.setValueAtTime(1000 + Math.random()*500, t);
          g.gain.setValueAtTime(0.05, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          osc.connect(g); g.connect(masterGainRef.current);
          osc.start(); osc.stop(t + 0.1);
      } else if (type === 'boom') {
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(120, t);
          subOsc.frequency.exponentialRampToValueAtTime(30, t + 1.0); 
          subGain.gain.setValueAtTime(1.0, t);
          subGain.gain.exponentialRampToValueAtTime(0.01, t + 3.0); 
          subOsc.connect(subGain);
          subGain.connect(masterGainRef.current);
          subOsc.start(t);
          subOsc.stop(t + 3.1);

          const shimmer = ctx.createOscillator();
          const shimmerGain = ctx.createGain();
          shimmer.type = 'triangle';
          shimmer.frequency.setValueAtTime(800, t);
          shimmer.frequency.linearRampToValueAtTime(4000, t + 2.0);
          shimmerGain.gain.setValueAtTime(0.2, t);
          shimmerGain.gain.linearRampToValueAtTime(0, t + 2.0);
          
          shimmer.connect(shimmerGain);
          if (reverbNodeRef.current) shimmerGain.connect(reverbNodeRef.current);
          else shimmerGain.connect(masterGainRef.current);
          
          shimmer.start(t);
          shimmer.stop(t + 2.1);

      } else if (type === 'spark') {
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(2000 + Math.random()*3000, t);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.1, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
          osc.connect(g); g.connect(masterGainRef.current);
          osc.start(); osc.stop(t + 0.15);
      } else if (type === 'drop') {
          // Descending tone for dropping
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, t);
          osc.frequency.exponentialRampToValueAtTime(50, t + 1.5);
          g.gain.setValueAtTime(0.5, t);
          g.gain.linearRampToValueAtTime(0, t + 1.5);
          osc.connect(g);
          g.connect(masterGainRef.current);
          osc.start(t);
          osc.stop(t + 1.5);
      }
  }, [initAudio]);

  return { initAudio, startLoop, updateLoop, stopLoop, playOneShot };
};


// --- SUB-COMPONENTS ---

// 0. INTRO / PAYWALL / INTENTION
const IntroBreach = ({ setIntention, setArchetype, setPhase, setAiData, audio, session }: any) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!input || input.length < 3) return;
        setLoading(true);
        setError('');
        
        try {
            audio.initAudio();
            
            // 1. Process Payment
            if (session?.user?.id) {
                const success = await deductUserCredits(session.user.id, COST_TO_BREACH);
                if (!success) {
                    setError('INSUFFICIENT AETHER. RECHARGE REQUIRED.');
                    setLoading(false);
                    return;
                }
            }
            
            audio.playOneShot('boom');

            // 2. AI Generation
            const arch = detectArchetype(input);
            setArchetype(arch);
            setIntention(input);

            const ritualData = await generateRealityPatchRitual(input);
            setAiData(ritualData);
            
            setPhase('CONSECRATE');
        } catch (e) {
            console.error(e);
            setError('SIGNAL LOST. TRY AGAIN.');
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full px-8 space-y-8 relative z-20 animate-in fade-in text-center">
            <div className="border border-red-500/50 bg-black/80 p-8 max-w-lg shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                <h1 className="text-3xl font-serif text-red-500 tracking-[0.2em] mb-2">REALITY BREACH</h1>
                <p className="text-red-900/80 font-mono text-[10px] mb-8">ADMIN ACCESS REQUIRED // COST: {COST_TO_BREACH} AETHER</p>
                
                <p className="text-slate-400 font-mono text-xs leading-relaxed mb-6">
                    You are attempting to overwrite the base code of your current timeline. 
                    This protocol utilizes subatomic linguistic programming to force a dimensional shift.
                </p>

                <div className="space-y-4">
                    <label className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                        Define Target Reality (Intention)
                    </label>
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        placeholder="e.g. I am fully healed and wealthy..."
                        className="w-full h-24 bg-slate-900/50 border border-slate-700 p-4 text-white text-center font-serif italic focus:border-red-500 focus:outline-none transition-colors resize-none"
                    />
                </div>

                {error && <p className="text-red-500 font-mono text-xs mt-4 animate-pulse">{error}</p>}

                {loading ? (
                    <div className="mt-8 flex flex-col items-center space-y-2">
                        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-red-500 font-mono text-[10px] animate-pulse">GENERATING BREACH PROTOCOLS...</span>
                    </div>
                ) : (
                    <button 
                        onClick={handleSubmit}
                        disabled={!input}
                        className="mt-8 w-full py-4 border border-red-900 text-red-500 hover:bg-red-900/20 hover:text-red-400 hover:border-red-500 transition-all font-mono text-xs tracking-[0.2em] uppercase"
                    >
                        Initialize Ritual (-{COST_TO_BREACH} Aether)
                    </button>
                )}
            </div>
        </div>
    );
};

// 1. CONSECRATION & VOID ENTRY
const Consecration = ({ setPhase, archetype, audio, spawnExplosion, aiData }: any) => {
  const [progress, setProgress] = useState(0);
  const [voidProgress, setVoidProgress] = useState(0);
  const [stage, setStage] = useState<'consecrate' | 'growing'>('consecrate');
  const [isHolding, setIsHolding] = useState(false);

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
      // Sparks on holding
      if (Math.random() > 0.8) {
          const win = (globalThis as any).window;
          if (win) spawnExplosion(win.innerWidth / 2, win.innerHeight / 2, '#06b6d4', 5);
      }

      interval = setInterval(() => {
        if (stage === 'consecrate') {
            setProgress(prev => {
                const next = prev + 0.8; 
                audio.updateLoop(next, 'drone');
                if (next >= 100) {
                    setStage('growing');
                    return 100;
                }
                return next;
            });
        } else if (stage === 'growing') {
            setVoidProgress(prev => {
                const next = prev + 0.3; 
                audio.updateLoop(next, 'void_enter'); 
                if (next >= 100) {
                    clearInterval(interval);
                    audio.stopLoop();
                    audio.playOneShot('boom');
                    setPhase('GROUNDING');
                    return 100;
                }
                return next;
            });
        }
      }, 20);
    } else {
        if (stage === 'consecrate' && progress > 0) {
            setProgress(0);
        }
        if (stage === 'growing') {
            setVoidProgress(0); 
        }
    }
    return () => clearInterval(interval);
  }, [isHolding, stage, setPhase, audio, progress, spawnExplosion]);

  const ArchetypeIcon = archetype.icon;
  const growSize = 10 + (voidProgress / 100) * 300; 

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-1000 relative z-10 select-none">
      
      {/* AI Text Display */}
      <div className="max-w-md bg-black/40 p-6 border-l-2 border-slate-800 backdrop-blur-sm text-center mb-4">
        <p className={`${archetype.color} font-serif text-lg italic leading-relaxed`}>
            "{aiData.consecration}"
        </p>
      </div>

      <div className="relative w-80 h-80 flex items-center justify-center">
        {stage === 'consecrate' ? (
            <>
                <div className={`absolute inset-0 border-2 border-dashed ${archetype.border} rounded-full opacity-50 transition-transform duration-75 ease-linear`}
                     style={{ transform: `rotate(${progress * 10}deg) scale(${1 - (progress / 100)})`, opacity: 1 - (progress/100) }} />
                <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-linear`}
                     style={{ transform: `scale(${1 - (progress/100)})` }}>
                    <ArchetypeIcon className={`w-16 h-16 ${archetype.color}`} />
                </div>
            </>
        ) : (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute -inset-5 rounded-full bg-linear-to-tr from-purple-600 via-cyan-500 to-purple-600 blur-md opacity-60 animate-spin-slow" />
                
                <div className="bg-black rounded-full z-30 transition-all duration-75 border border-gray-900 relative" 
                     style={{ width: `${growSize}px`, height: `${growSize}px`, boxShadow: '0 0 30px #000' }}
                >
                    <div className="absolute inset-0 rounded-full bg-black z-20" />
                </div>
                
                <div className="absolute rounded-full border-2 border-white/30 animate-ping z-40"
                     style={{ width: `${growSize}px`, height: `${growSize}px`, animationDuration: '1.5s' }} />
            </div>
        )}
      </div>

      <div className="text-center space-y-4 relative z-40 h-24 mix-blend-difference">
        <h2 className="text-white font-serif italic text-xl tracking-[0.2em] drop-shadow-md">
            {stage === 'consecrate' ? "CONSECRATE" : "OPEN THE GATE"}
        </h2>
        <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">
            {stage === 'consecrate' ? "Hold to collapse reality" : "Do not release. The void is hungry."}
        </p>
      </div>

      <button 
        className={`w-32 h-32 rounded-full bg-white/5 border-2 border-double ${archetype.border} shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-95 transition-all flex items-center justify-center group z-40 animate-pulse`}
        onMouseDown={() => { setIsHolding(true); audio.initAudio(); }}
        onMouseUp={() => setIsHolding(false)}
        onMouseLeave={() => setIsHolding(false)}
        onTouchStart={(e) => { e.preventDefault(); setIsHolding(true); audio.initAudio(); }}
        onTouchEnd={() => setIsHolding(false)}
      >
        <Fingerprint className={`${archetype.color} w-12 h-12 group-hover:scale-110 transition-transform`} />
      </button>
    </div>
  );
};

// 2. GROUNDING
const Grounding = ({ setPhase, audio, aiData, archetype }: any) => {
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
            audio.stopLoop(); 
            audio.playOneShot('type');
            setTimeout(() => setPhase('AGREEMENT'), 1000);
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
      return "EXHALE THE MUNDANE";
  }

  const guideStyle = {
    transform: breathState === 'INHALE' ? 'scale(1.5)' : breathState === 'EXHALE' ? 'scale(0.5)' : 'scale(1.5)',
    opacity: breathState === 'INHALE' ? 1 : breathState === 'EXHALE' ? 0.4 : 0.8,
    transition: breathState === 'HOLD' ? 'none' : 'all 4s ease-in-out',
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 relative z-10 text-center">
       
       <p className={`${archetype.color} font-serif text-lg max-w-md animate-pulse px-6`}>
         "{aiData.grounding}"
       </p>

      <div className="relative">
        <div className="w-32 h-32 bg-cyan-900/20 border border-cyan-500/30 rounded-full blur-xl absolute inset-0 transition-all duration-4000" 
             style={guideStyle} />
        <div className="w-32 h-32 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-4000" 
             style={guideStyle}>
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

// 4. AGREEMENT
const Agreement = ({ setPhase, audio }: any) => {
    return (
        <div className="flex flex-col items-center justify-center h-full px-8 text-center space-y-8 animate-in fade-in">
            <h2 className="text-white font-serif text-2xl">The Covenant</h2>
            <p className="text-slate-400 leading-relaxed max-w-md font-mono text-xs">
                You are about to etch your will into the Seed of Creation. 
                <br/><br/>
                As the sigil burns, custom incantations will appear. 
                <br/>
                <span className="text-white font-bold">You must read these words aloud or project them loudly in your mind to break the locks of reality.</span>
            </p>
            <button 
                onClick={() => { audio.playOneShot('water'); setPhase('ETCHING'); }}
                className="mt-8 px-8 py-4 bg-slate-900 border-2 border-double border-slate-600 text-white font-mono text-xs tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
                I AGREE TO SPEAK THE WORDS
            </button>
        </div>
    )
}

// 5. ETCHING
const Etching = ({ setPhase, archetype, audio, aiData, intention, spawnExplosion }: any) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [sparks, setSparks] = useState<{x: number, y: number, id: number}[]>([]);
  
  const duration = 13000; 
  const colorPalette = ['#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  const colorIndex = Math.floor((progress / 100) * colorPalette.length * 3) % colorPalette.length;
  const currentColor = colorPalette[colorIndex];

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
              
              if (Math.random() > 0.5) {
                  const win = (globalThis as any).window;
                  if(win) {
                      const cx = win.innerWidth / 2;
                      const cy = win.innerHeight / 2;
                      const ox = (Math.random() - 0.5) * 200; 
                      const oy = (Math.random() - 0.5) * 200;
                      spawnExplosion(cx + ox, cy + oy, currentColor, 3);
                  }
                  const newSpark = {
                      id: Date.now() + Math.random(),
                      x: 50 + (Math.random() * 60 - 30),
                      y: 50 + (Math.random() * 60 - 30)
                  };
                  setSparks(prev => [...prev.slice(-10), newSpark]);

                  if (Math.random() > 0.8) audio.playOneShot('spark');
              }

          }, 20);
      }
      return () => clearInterval(interval);
  }, [isHolding, hasFinished, progress, audio, duration, currentColor, spawnExplosion]);

  const sigilPath = useMemo(() => generateSigilPath(intention), [intention]);
  const scatteredLetters = useMemo(() => getScatteredChars(intention), [intention]);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 relative z-10 overflow-hidden text-center">
      <div className="absolute top-10 w-full px-6 pointer-events-none">
          <p className={`font-serif text-lg leading-relaxed transition-all duration-300 whitespace-pre-wrap ${isHolding ? 'opacity-100 blur-0' : 'opacity-30 blur-sm'}`} 
             style={{ color: currentColor, textShadow: `0 0 15px ${currentColor}` }}>
              "{aiData.etching}"
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
        
        {sparks.map(s => (
            <div key={s.id} 
                 className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                 style={{ left: `${s.x}%`, top: `${s.y}%`, boxShadow: `0 0 10px ${currentColor}` }} />
        ))}

        <div className="absolute inset-0 pointer-events-none">
            {scatteredLetters.map((char, i) => (
                <div key={i} className="absolute text-xs font-mono opacity-50 transition-colors duration-75"
                     style={{
                         color: currentColor,
                         top: `${50 + Math.sin(i * 1.5) * 40}%`,
                         left: `${50 + Math.cos(i * 1.5) * 40}%`,
                         transform: `rotate(${i * 30}deg)`
                     }}>
                    {char}
                </div>
            ))}
        </div>
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
            onClick={() => { audio.stopLoop(); audio.playOneShot('water'); setPhase('INTEGRATION'); }}
            className="w-full max-w-xs py-8 border-2 border-double border-white text-white bg-white/10 text-xs font-mono tracking-widest animate-pulse"
          >
            [ PROCEED TO DROP ]
          </button>
      )}
    </div>
  );
};

// 6. VOID INTEGRATION (SIGIL DROP)
const VoidIntegration = ({ setPhase, archetype, audio, aiData, intention, spawnExplosion }: any) => {
    const [dragY, setDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [integrated, setIntegrated] = useState(false);
    
    // Sigil Path for Visual
    const sigilPath = useMemo(() => generateSigilPath(intention), [intention]);

    const handleStart = (e: any) => {
        setIsDragging(true);
    };

    const handleMove = (e: any) => {
        if (!isDragging || integrated) return;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const winH = (globalThis as any).window.innerHeight;
        // Normalize roughly to center
        const startY = winH / 3;
        const offset = Math.max(0, clientY - startY);
        setDragY(offset);

        // Threshold to drop
        if (offset > 250) {
            completeDrop();
        }
    };

    const handleEnd = () => {
        if (!integrated) {
            setIsDragging(false);
            setDragY(0); // Snap back
        }
    };

    const completeDrop = () => {
        setIntegrated(true);
        setIsDragging(false);
        audio.playOneShot('drop');
        audio.playOneShot('boom');
        
        // Explosion Effect
        const win = (globalThis as any).window;
        if(win) {
            spawnExplosion(win.innerWidth/2, win.innerHeight - 100, '#ffffff', 50);
            spawnExplosion(win.innerWidth/2, win.innerHeight - 100, archetype.theme === 'VENUS' ? '#f43f5e' : '#22d3ee', 30);
        }

        setTimeout(() => {
            setPhase('SPIRAL'); // Transition to Spiral
        }, 3000);
    };

    return (
        <div 
            className="flex flex-col items-center h-full relative z-10 w-full overflow-hidden"
            onTouchMove={handleMove} onMouseMove={handleMove}
            onTouchEnd={handleEnd} onMouseUp={handleEnd}
        >
            <div className="mt-16 text-center px-6">
                <h2 className="text-slate-500 font-mono text-[10px] tracking-[0.3em] uppercase mb-4">Phase 5: Core Integration</h2>
                <p className={`${archetype.color} font-serif text-xl animate-pulse`}>
                    "{aiData.integration}"
                </p>
            </div>

            {/* The Void Pit */}
            <div className="absolute bottom-0 w-full h-1/3 bg-linear-to-t from-white/10 to-transparent flex items-end justify-center pb-12">
                <div className="w-full h-1 bg-white/50 blur-xl animate-pulse" />
                <div className="absolute bottom-10 animate-bounce text-slate-500 font-mono text-[10px]">
                    THE CORE CODE
                </div>
            </div>

            {/* Draggable Sigil */}
            <div 
                className={`absolute w-40 h-40 bg-black border-2 ${archetype.border} flex items-center justify-center cursor-grab active:cursor-grabbing backdrop-blur-md transition-transform duration-75`}
                style={{ 
                    top: '30%',
                    transform: `translateY(${dragY}px) scale(${1 - (dragY/500)}) rotate(${dragY/5}deg)`,
                    opacity: integrated ? 0 : 1
                }}
                onMouseDown={handleStart} onTouchStart={handleStart}
            >
                 <svg viewBox="0 0 200 200" className="w-32 h-32 opacity-80">
                    <path d={sigilPath} stroke="white" strokeWidth="2" fill="none" />
                </svg>
                <div className="absolute -bottom-8 text-[10px] font-mono text-slate-400">
                    DRAG TO DROP
                </div>
                <ArrowDown className="absolute -bottom-16 animate-bounce text-white opacity-50" />
            </div>

            {integrated && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-4xl font-black italic text-white tracking-widest animate-ping">
                        INTEGRATED
                    </div>
                </div>
            )}
        </div>
    );
};

// 7. SPIRAL ACTIVATION (WAS VOCAL CHANT)
const SpiralActivation = ({ setPhase, archetype, audio, aiData, intention }: any) => {
    const [charge, setCharge] = useState(0);
    const [chanting, setChanting] = useState(false);

    // Generate Spiral Text from Intention
    const spiralChars = useMemo(() => {
        const clean = intention.toUpperCase().replace(/\s/g, '') + intention.toUpperCase().replace(/\s/g, ''); 
        const chars = clean.split('');
        return chars.map((char: string, i: number) => {
           // Archimedean spiral: r = a + b * theta
           const theta = i * 0.3; 
           const r = 10 + (3 * theta); 
           // Center at 150,150
           const x = 150 + r * Math.cos(theta);
           const y = 150 + r * Math.sin(theta);
           const rot = theta * (180/Math.PI) + 90;
           return { char, x, y, rot };
        });
    }, [intention]);

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
            }, 30);
        } else if (!chanting && charge > 0) {
            setCharge(0); 
        }

        if (charge >= 100) {
            audio.stopLoop();
            audio.playOneShot('boom');
            setTimeout(() => setPhase('CHARGE'), 1000);
        }
        return () => clearInterval(interval);
    }, [chanting, charge, setPhase, audio]);

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-16 relative z-10 text-center animate-in fade-in zoom-in duration-500">
            <div className="h-32 flex flex-col items-center justify-center px-4">
                <h2 className="text-slate-500 font-mono text-[10px] tracking-[0.3em] uppercase mb-4">Phase 6: Spiral Activation</h2>
                <h1 className={`text-2xl md:text-3xl font-serif italic text-white tracking-widest transition-all duration-300 ${chanting ? 'scale-110 blur-[1px]' : ''}`}>
                    "{aiData.ancientTongue}"
                </h1>
                <p className="text-slate-500 mt-4 font-mono text-xs">SPEAK THE INTENTION INTO THE CORE</p>
            </div>

            <div className="relative w-[300px] h-[300px] flex items-center justify-center">
                 {/* Spiral of Intention */}
                 <div className={`absolute inset-0 transition-transform duration-[10s] ease-linear ${chanting ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                     {spiralChars.map((c: any, i: number) => (
                         i < 180 && ( 
                             <span key={i} className="absolute text-[9px] font-mono text-slate-400"
                                   style={{
                                     left: c.x, top: c.y,
                                     transform: `translate(-50%, -50%) rotate(${c.rot}deg)`,
                                     color: chanting ? 'white' : '#94a3b8',
                                     textShadow: chanting ? '0 0 5px white' : 'none'
                                   }}>
                                 {c.char}
                             </span>
                         )
                     ))}
                 </div>
                 
                 <button
                    className={`w-32 h-32 rounded-full border-2 ${archetype.border} flex items-center justify-center relative overflow-hidden bg-black z-20 backdrop-blur-md`}
                    onMouseDown={() => setChanting(true)}
                    onMouseUp={() => setChanting(false)}
                    onMouseLeave={() => setChanting(false)}
                    onTouchStart={(e) => { e.preventDefault(); setChanting(true); }}
                    onTouchEnd={() => setChanting(false)}
                 >
                     <div className={`absolute bottom-0 left-0 w-full bg-white/20 transition-all duration-75`} 
                          style={{ height: `${charge}%` }} />
                     <Infinity className={`${archetype.color} w-10 h-10 ${chanting ? 'animate-spin' : ''}`} />
                 </button>
            </div>
        </div>
    );
};

// 8. CHARGE & CAST
const ChargeAndCast = ({ setPhase, setGlitchActive, archetype, audio, spawnExplosion, aiData }: any) => {
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
       
       if (Math.random() > 0.7) {
           const win = (globalThis as any).window;
           if(win) spawnExplosion(win.innerWidth/2, win.innerHeight/2, '#ffffff', 5);
       }

       interval = setInterval(() => {
         setCharge(c => {
            const next = c >= 100 ? 100 : c + 0.4;
            audio.updateLoop(next, 'charge'); 
            return next;
         });
       }, 20);
     } else if (!shaking && charge > 0 && charge < 100) {
       interval = setInterval(() => {
         setCharge(c => Math.max(0, c - 2));
       }, 30);
     }
     return () => clearInterval(interval);
   }, [shaking, charge, audio, spawnExplosion]);

   useEffect(() => {
     if (charge >= 100) {
        audio.stopLoop();
        audio.playOneShot('boom'); 
        setGlitchActive(true);
        const timeout = setTimeout(() => setPhase('CAST'), 5500);
        return () => clearTimeout(timeout);
     }
   }, [charge, setPhase, setGlitchActive, audio]);

   const IconComponent = archetype.icon;

   return (
       <div className={`flex flex-col items-center justify-center h-full space-y-12 relative z-10 text-center`}
            style={{ 
                transform: shaking ? `translate(${Math.random()*10 - 5}px, ${Math.random()*10 - 5}px)` : 'none' 
            }}
       >
           <h2 className="text-slate-500 font-mono text-[10px] tracking-[0.3em] uppercase">Phase 7: Power Injection</h2>

           <p className={`${archetype.color} font-serif text-xl animate-pulse px-4`}>
                "{aiData.charge}"
           </p>

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
                   {charge < 100 ? 'PENETRATING SUBATOMIC PROGRAMMING' : 'REALITY BREACH'}
               </p>
           </div>
           
           <button className="w-full h-full absolute inset-0 opacity-0 cursor-pointer z-30"
              onMouseDown={() => setShaking(true)} onMouseUp={() => setShaking(false)} onMouseLeave={() => setShaking(false)}
              onTouchStart={(e) => { e.preventDefault(); setShaking(true); }} onTouchEnd={() => setShaking(false)}
           />
       </div>
   );
};

// 9. FINAL CAST & SAVE (PREMIUM)
const FinalCast = ({ intention, archetype, audio, onExit, session, aiData }: any) => {
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if(!session?.user) return;
        setSaving(true);
        try {
            const success = await deductUserCredits(session.user.id, COST_TO_SAVE);
            if (!success) {
                alert("Insufficient Aether to save.");
                return;
            }

            await saveSpell(session.user.id, {
                 name: `Reality Breach: ${new Date().toLocaleDateString()}`,
                 intention: intention,
                 incantation: `${aiData.consecration}\n${aiData.etching}\n${aiData.ancientTongue}\n${aiData.integration}`,
                 element: archetype.theme
             });
             setSaved(true);
        } catch(e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-3000 relative z-10 text-center px-4">
            <div className="relative mb-12">
                <div className={`absolute inset-0 ${archetype.bg} blur-[100px] opacity-40 animate-pulse`} />
                <Check className={`w-48 h-48 ${archetype.color} drop-shadow-[0_0_50px_currentColor]`} />
            </div>
            <h1 className="text-4xl font-serif italic text-white tracking-widest mb-6 drop-shadow-lg">SO MOTE IT BE</h1>
            <div className="w-full max-w-md px-4">
                <p className={`${archetype.color} font-mono text-xs tracking-[0.2em] uppercase text-center whitespace-pre-wrap`}>Target: {intention}</p>
            </div>
            <p className="text-slate-600 font-mono text-[10px] mt-12 animate-pulse">The universe has been recompiled.</p>
            
            <div className="flex flex-col gap-4 w-full max-w-xs mt-12">
                 <button 
                    onClick={handleSave}
                    disabled={saved || saving}
                    className={`w-full py-4 border border-slate-700 bg-slate-900/50 text-white font-mono text-[10px] tracking-widest hover:border-white transition-all flex items-center justify-center gap-2 ${saved ? 'opacity-50 cursor-default' : ''}`}
                 >
                    <Save size={14} /> {saved ? "LOG SAVED" : `SAVE TO GRIMOIRE (-${COST_TO_SAVE} AETHER)`}
                 </button>
                 
                 <button 
                    onClick={() => { audio.stopLoop(); audio.playOneShot('water'); onExit(); }}
                    className="w-full py-4 text-slate-600 hover:text-white font-mono text-[10px] transition-colors"
                 >
                    [ CLOSE SESSION ]
                 </button>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

export default function RealityPatchSpell({ onExit, session }: { onExit: () => void, session?: Session }) {
  const [phase, setPhase] = useState('INTRO'); 
  const [intention, setIntention] = useState('');
  const [archetype, setArchetype] = useState(ARCHETYPES.UNK);
  const [glitchActive, setGlitchActive] = useState(false);
  // Store AI generated text for all phases
  const [aiData, setAiData] = useState<RealityPatchRitualData>({
      consecration: "",
      grounding: "",
      etching: "",
      ancientTongue: "",
      integration: "",
      charge: ""
  });
  
  const audio = useAudioEngine();
  const { spawnExplosion } = useParticleSystem(); 

  const getWarpIntensity = () => {
      switch(phase) {
          case 'INTRO': return 0;
          case 'CONSECRATE': return 10;
          case 'GROUNDING': return 20;
          case 'AGREEMENT': return 25;
          case 'ETCHING': return 40;
          case 'INTEGRATION': return 60;
          case 'SPIRAL': return 100;
          case 'CHARGE': return 150;
          case 'CAST': return 500;
          default: return 0;
      }
  };

  // Background Effects
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

  const styles = `
    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-spin-slow { animation: spin-slow 20s linear infinite; }
  `;

  return (
    <div className="fixed inset-0 w-full h-screen bg-black text-slate-200 overflow-hidden select-none touch-none font-sans z-50">
      <style>{styles}</style>
      <button onClick={() => { audio.stopLoop(); onExit(); }} className="absolute top-6 right-6 z-50 text-slate-600 hover:text-white transition-colors cursor-pointer">
        <X size={24}/>
      </button>

      <WarpBackground intensity={getWarpIntensity()} />
      <GlitchOverlay active={glitchActive} />
      
      <div className="relative z-10 w-full h-full max-w-md mx-auto flex flex-col">
        {phase !== 'INTRO' && (
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start opacity-50 z-20 pointer-events-none">
                <div className="flex flex-col font-mono text-[10px] text-slate-500">
                    <span>{new Date().toLocaleTimeString()}</span>
                    <span className={archetype.color}>TYPE: {archetype.theme}</span>
                </div>
                <div className="flex flex-col font-mono text-[10px] text-right text-slate-500">
                    <span>PHASE: {phase}</span>
                    <span>STABILITY: {Math.floor(Math.random() * 30) + 70}%</span>
                </div>
            </div>
        )}
        
        <main className="w-full h-full relative z-10">
            {phase === 'INTRO' && <IntroBreach setIntention={setIntention} setArchetype={setArchetype} setPhase={setPhase} setAiData={setAiData} audio={audio} session={session} />}
            {phase === 'CONSECRATE' && <Consecration setPhase={setPhase} archetype={archetype} audio={audio} spawnExplosion={spawnExplosion} aiData={aiData} />}
            {phase === 'GROUNDING' && <Grounding setPhase={setPhase} audio={audio} aiData={aiData} archetype={archetype} />}
            {phase === 'AGREEMENT' && <Agreement setPhase={setPhase} audio={audio} />}
            {phase === 'ETCHING' && <Etching setPhase={setPhase} archetype={archetype} audio={audio} aiData={aiData} intention={intention} spawnExplosion={spawnExplosion} />}
            {phase === 'INTEGRATION' && <VoidIntegration setPhase={setPhase} archetype={archetype} audio={audio} aiData={aiData} intention={intention} spawnExplosion={spawnExplosion} />}
            {phase === 'SPIRAL' && <SpiralActivation setPhase={setPhase} archetype={archetype} audio={audio} aiData={aiData} intention={intention} />}
            {phase === 'CHARGE' && <ChargeAndCast setPhase={setPhase} setGlitchActive={setGlitchActive} archetype={archetype} audio={audio} spawnExplosion={spawnExplosion} aiData={aiData} />}
            {phase === 'CAST' && <FinalCast intention={intention} archetype={archetype} audio={audio} onExit={onExit} session={session} aiData={aiData} />}
        </main>
      </div>
    </div>
  );
}
// --- END OF FILE src/app/components/ElectricMagick/RealityPatchSpell.tsx ---