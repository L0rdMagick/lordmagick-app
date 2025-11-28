// --- START OF FILE src/app/components/ElectroWand.tsx ---
/// <reference lib="dom" />
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Settings, X, Maximize2, Minimize2, Zap, Heart, CloudRain, Coins, Clover, Volume2 } from 'lucide-react';
import MagickalBackLink from './MagickalBackLink';

// --- TYPES ---
interface Point { x: number; y: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; type: string; shapeType: string; size: number; color: string; }
interface Projectile { x: number; y: number; vx: number; vy: number; life: number; rot: number; rotSpeed: number; type: string; size: number; color: string; state: 'shooting' | 'floating'; }
interface Bolt { segments: {x1:number, y1:number, x2:number, y2:number}[]; life: number; color: string; width: number; }
interface Emanation { x: number; y: number; radius: number; alpha: number; color: string; }

// --- PALETTE ---
const COLOR_PALETTE = [
    '#ffffff', '#9ca3af', '#3e2723', '#000000',
    '#ef4444', '#f97316', '#facc15', '#84cc16',
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
    '#8b5cf6', '#d946ef', '#f43f5e', '#fbbf24'
];

export default function ElectroWand() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvasRef = useRef<any>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showColorModal, setShowColorModal] = useState<{show: boolean, target: string | null, label: string}>({ show: false, target: null, label: '' });
    const [tempColor, setTempColor] = useState("#ffffff");
    
    const [wandName, setWandName] = useState("");
    const [intention, setIntention] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    
    const [, setConfigTick] = useState(0); 

    // --- CONFIG STATE ---
    const config = useRef({
        // Colors
        wandBaseColor: '#3e2723',
        crystalBaseColor: '#8b5cf6', 
        activatedColor: '#d8b4fe',
        internalColor: '#ffffff',
        externalColor: '#fcd34d',
        
        // Shapes
        internalShape: 'lightning', 
        externalShape: 'lightning',
        
        // Physics
        internalSpeed: 3, 
        internalSize: 2,  
        externalSize: 2,  
        screenFillLevel: 0, // 0-5
        wandWidthLevel: 1, // 1-5

        // Audio/Haptics
        intensityMult: 1.0,
        vibrationLevel: 2,
        masterVolume: 1.0, 
        soundProfile: 'hum',
        reverb: false,

        // Visuals
        wandShape: 'classic',
        crystalShape: 'orb',
        activeColor: 'rgba(180, 100, 255, 1)',
    });

    // --- PHYSICS STATE ---
    const state = useRef({
        wand: { tipX: 0, tipY: 0, baseX: 0, baseY: 0, crystalY: 0, tipWidth: 0, baseWidth: 0, length: 0 },
        isCasting: false,
        touchPos: { x: 0, y: 0 },
        energyLevel: 0,
        particles: [] as Particle[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        projectiles: [] as any[], 
        emanations: [] as Emanation[],
        woodGrains: [] as Point[][],
        time: 0,
        initialized: false
    });

    // --- AUDIO REFS ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audio = useRef<{
        ctx: any;
        masterGain: any;
        osc1: any;
        osc2: any;
        lfoOsc: any;
        lfoGain: any;
        filter: any;
        convolver: any;
        reverbGain: any;
    }>({
        ctx: null, masterGain: null, osc1: null, osc2: null, lfoOsc: null, lfoGain: null, filter: null, convolver: null, reverbGain: null
    });

    // --- HELPER FUNCTIONS ---
    const toggleFullscreen = () => {
        const doc = (globalThis as any).document;
        if (!doc) return;

        if (!doc.fullscreenElement) {
            doc.documentElement.requestFullscreen().catch((e: any) => {
                console.error(`Error attempting to enable fullscreen: ${e.message}`);
            });
            setIsFullscreen(true);
        } else {
            if (doc.exitFullscreen) {
                doc.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const getGlowColorFromHex = (hex: string, alpha = 1) => {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt("0x" + hex[1] + hex[1]);
            g = parseInt("0x" + hex[2] + hex[2]);
            b = parseInt("0x" + hex[3] + hex[3]);
        } else if (hex.length === 7) {
            r = parseInt("0x" + hex[1] + hex[2]);
            g = parseInt("0x" + hex[3] + hex[4]);
            b = parseInt("0x" + hex[5] + hex[6]);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const updateCSSVar = () => {
        const doc = (globalThis as any).document;
        if (doc) {
            const color = config.current.activatedColor;
            doc.documentElement.style.setProperty('--wand-color', color);
        }
    };

    const playClickSound = () => {
        if (!audio.current.ctx) return;
        const ctx = audio.current.ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1 * config.current.masterVolume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    };

    // --- AUDIO INIT ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createImpulseResponse = (ctx: any, d: number, dec: number) => {
        const L = ctx.sampleRate * d;
        const I = ctx.createBuffer(2, L, ctx.sampleRate);
        const ch0 = I.getChannelData(0);
        const ch1 = I.getChannelData(1);
        for(let i=0; i<L; i++){ 
            const n = i; 
            const e = Math.pow(1-n/L, dec); 
            ch0[i] = (Math.random()*2-1)*e; 
            ch1[i] = (Math.random()*2-1)*e; 
        }
        return I;
    };

    const applySoundProfile = () => {
        if(!state.current.initialized || !audio.current.ctx) return;
        const now = audio.current.ctx.currentTime;
        const c = config.current;
        let t1 = 'triangle', t2 = 'sine', f1=55, f2=110, lt = 'sine', lf=8, ld=20, fil=800;
        
        if(c.soundProfile==='storm'){ t1='sawtooth'; f1=35; f2=40; lf=12; ld=50; fil=400; }
        else if(c.soundProfile==='ethereal'){ t1='sine'; t2='sine'; f1=220; f2=440; lf=3; ld=5; fil=1200; }
        else if(c.soundProfile==='void'){ t1='sine'; t2='triangle'; f1=30; f2=60; lf=0.2; ld=5; fil=200; }
        else if(c.soundProfile==='dragon'){ t1='sawtooth'; t2='triangle'; f1=50; f2=52; lt='triangle'; lf=20; ld=30; fil=500; }
        else if(c.soundProfile==='theremin'){ t1='sine'; t2='sine'; f1=500; f2=502; lf=6; ld=30; fil=2000; }
        
        if(audio.current.osc1) {
            audio.current.osc1.type=t1; 
            audio.current.osc1.frequency.setTargetAtTime(f1,now,0.2);
        }
        if(audio.current.osc2) {
            audio.current.osc2.type=t2; 
            audio.current.osc2.frequency.setTargetAtTime(f2,now,0.2);
        }
        if(audio.current.lfoOsc && audio.current.lfoGain) {
            audio.current.lfoOsc.type=lt;
            audio.current.lfoOsc.frequency.setTargetAtTime(lf,now,0.2); 
            audio.current.lfoGain.gain.setTargetAtTime(ld,now,0.2);
        }
        if(audio.current.filter) {
            audio.current.filter.frequency.setTargetAtTime(fil,now,0.2);
        }
    };

    const initAudio = () => {
        if(state.current.initialized) return;
        const win = (globalThis as any).window;
        if (!win) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AC = win.AudioContext || win.webkitAudioContext;
        if (!AC) return;

        const ctx = new AC();
        audio.current.ctx = ctx;
        audio.current.masterGain = ctx.createGain(); 
        audio.current.masterGain.gain.value = 0;
        audio.current.convolver = ctx.createConvolver(); 
        audio.current.convolver.buffer = createImpulseResponse(ctx, 4, 4);
        audio.current.reverbGain = ctx.createGain(); 
        audio.current.reverbGain.gain.value = config.current.reverb ? 0.6 : 0;
        audio.current.filter = ctx.createBiquadFilter(); 
        audio.current.filter.type="lowpass"; 
        audio.current.filter.frequency.value=1000;
        
        audio.current.osc1 = ctx.createOscillator(); 
        audio.current.osc2 = ctx.createOscillator(); 
        audio.current.lfoOsc = ctx.createOscillator(); 
        audio.current.lfoGain = ctx.createGain();
        
        applySoundProfile();
        
        audio.current.lfoOsc.connect(audio.current.lfoGain); 
        if (audio.current.osc1) audio.current.lfoGain.connect(audio.current.osc1.frequency);
        
        audio.current.osc1.connect(audio.current.filter); 
        audio.current.osc2.connect(audio.current.filter); 
        audio.current.filter.connect(audio.current.masterGain);
        
        audio.current.masterGain.connect(ctx.destination); 
        audio.current.masterGain.connect(audio.current.reverbGain); 
        audio.current.reverbGain.connect(audio.current.convolver); 
        audio.current.convolver.connect(ctx.destination);
        
        audio.current.osc1.start(); 
        audio.current.osc2.start(); 
        audio.current.lfoOsc.start();
        
        state.current.initialized = true;
        setHasStarted(true);
    };

    const updateAudio = (active: boolean) => {
        if(!state.current.initialized || !audio.current.ctx) return;
        const now = audio.current.ctx.currentTime;
        // Apply Master Volume scaling here
        const baseVol = active ? 0.4 : 0;
        const finalVol = baseVol * config.current.intensityMult * config.current.masterVolume;
        
        audio.current.masterGain.gain.setTargetAtTime(finalVol, now, 0.1);
        
        // Reverb Update
        if (audio.current.reverbGain) {
            audio.current.reverbGain.gain.setTargetAtTime(config.current.reverb ? 0.6 * config.current.masterVolume : 0, now, 0.1);
        }

        if(active) { 
            audio.current.lfoOsc.frequency.linearRampToValueAtTime(audio.current.lfoOsc.frequency.value * 1.5, now + 0.5); 
            audio.current.filter.frequency.linearRampToValueAtTime(audio.current.filter.frequency.value + 500, now + 0.5); 
        } else {
            applySoundProfile();
        }
    };

    // --- DRAWING LOGIC ---
    const generateWoodGrain = () => {
        state.current.woodGrains = [];
        const w = state.current.wand;
        const numGrains = 30;
        const width = Math.max(w.baseWidth, 100);
        
        for(let i=0; i<numGrains; i++) {
            const path: Point[] = [];
            const xOffset = (Math.random() - 0.5) * width * 1.5;
            const freq = (Math.random() * 0.03) + 0.01;
            const amp = (Math.random() * 5) + 2;
            
            for(let y = w.baseY + 50; y > w.tipY - 50; y -= 15) {
                let x = w.baseX + xOffset + Math.sin(y * freq) * amp;
                x += (Math.random() - 0.5) * 1.5;
                path.push({x, y});
            }
            state.current.woodGrains.push(path);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getWandPath = (c: any, offsetX = 0, offsetY = 0) => {
        c.beginPath();
        const w = state.current.wand;
        const bw = w.baseWidth, bx = w.baseX + offsetX, by = w.baseY + offsetY;
        const tx = w.tipX + offsetX, ty = w.tipY + offsetY, tw = w.tipWidth;
        const shape = config.current.wandShape;

        if (shape === 'classic') {
            c.moveTo(bx - bw/2, by);
            c.quadraticCurveTo(bx - bw/2, by - 100, bx - bw*0.3, by - 150);
            c.quadraticCurveTo(bx - bw*0.15, ty + 100, tx - tw/2, ty);
            c.arc(tx, ty, tw/2, Math.PI, 0); 
            c.quadraticCurveTo(bx + bw*0.15, ty + 100, bx + bw*0.3, by - 150);
            c.quadraticCurveTo(bx + bw/2, by - 100, bx + bw/2, by);
            c.arc(bx, by, bw/2, 0, Math.PI); 
        } else if (shape === 'twisted') {
            c.moveTo(bx - bw/2, by);
            const steps = 40;
            for(let i=0; i<=steps; i++) {
                const p = i/steps;
                const currentW = bw/2 * (1-p) + tw/2 * p;
                const x = bx - currentW;
                const y = by - (w.length)*p;
                const wobble = Math.sin(p * Math.PI * 6) * 5; 
                c.lineTo(x + wobble, y);
            }
            c.arc(tx, ty, tw/2, Math.PI, 0);
            for(let i=steps; i>=0; i--) {
                const p = i/steps;
                const currentW = bw/2 * (1-p) + tw/2 * p;
                const x = bx + currentW;
                const y = by - (w.length)*p;
                const wobble = Math.sin(p * Math.PI * 6) * 5;
                c.lineTo(x + wobble, y);
            }
            c.arc(bx, by, bw/2, 0, Math.PI);
        } else if (shape === 'elder') {
            c.moveTo(bx - bw/2, by);
            c.lineTo(bx - bw*0.4, by - w.length * 0.2); 
            c.bezierCurveTo(bx-bw*0.6, by - w.length*0.25, bx-bw*0.3, by - w.length*0.3, bx-bw*0.25, by - w.length*0.4);
            c.lineTo(tx - tw/2, ty);
            c.arc(tx, ty, tw/2, Math.PI, 0);
            c.lineTo(bx + bw*0.25, by - w.length*0.4);
            c.bezierCurveTo(bx+bw*0.3, by - w.length*0.3, bx+bw*0.6, by - w.length*0.25, bx+bw*0.4, by - w.length * 0.2);
            c.lineTo(bx + bw/2, by);
            c.arc(bx, by, bw/2, 0, Math.PI);
        } else if (shape === 'vine') {
            c.moveTo(bx - bw/3, by);
            c.quadraticCurveTo(bx - bw, by - w.length*0.3, tx - tw/2, ty);
            c.arc(tx, ty, tw/2, Math.PI, 0);
            c.quadraticCurveTo(bx + bw, by - w.length*0.3, bx + bw/3, by);
            c.arc(bx, by, bw/3, 0, Math.PI);
        } else if (shape === 'bone') {
            c.moveTo(bx - bw/2, by);
            c.quadraticCurveTo(bx - bw*0.6, by - w.length*0.1, bx - bw*0.2, by - w.length*0.2);
            c.lineTo(tx - tw*1.5, ty + 20);
            c.arc(tx, ty, tw*1.5, Math.PI, 0);
            c.lineTo(bx + bw*0.2, by - w.length*0.2);
            c.quadraticCurveTo(bx + bw*0.6, by - w.length*0.1, bx + bw/2, by);
            c.arc(bx, by, bw/2, 0, Math.PI);
        }
        c.closePath();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drawCrystal = (c: any, x: number, y: number, size: number) => {
        const color = config.current.crystalBaseColor;
        const shape = config.current.crystalShape;

        // 3D Facet Helper
        const drawFacet3D = (points: Point[], colorHex: string, brightness: number) => {
            c.beginPath();
            c.moveTo(points[0].x, points[0].y);
            for(let i=1; i<points.length; i++) c.lineTo(points[i].x, points[i].y);
            c.closePath();
            
            // Simulate lighting
            c.fillStyle = colorHex;
            c.fill();
            
            // Shine/Shadow overlay
            if (brightness > 0) {
                c.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                c.fill();
            } else {
                c.fillStyle = `rgba(0, 0, 0, ${Math.abs(brightness)})`;
                c.fill();
            }
            c.strokeStyle = 'rgba(255,255,255,0.3)';
            c.lineWidth = 0.5;
            c.stroke();
        };

        if (shape === 'orb') {
            // Deep base
            const grad = c.createRadialGradient(x - size*0.3, y - size*0.3, 0, x, y, size);
            grad.addColorStop(0, 'rgba(255,255,255,0.9)'); // Specular Highlight
            grad.addColorStop(0.2, color);
            grad.addColorStop(0.9, '#000000'); // Shadow
            
            c.beginPath();
            c.arc(x, y, size, 0, Math.PI * 2);
            c.fillStyle = grad;
            c.fill();
            
            // Glassy rim
            c.beginPath();
            c.arc(x, y, size, 0, Math.PI * 2);
            c.strokeStyle = 'rgba(255,255,255,0.4)';
            c.lineWidth = 2;
            c.stroke();
        } else {
            // Faceted Shapes with simulated lighting
            // Light comes from Top-Left
            if (shape === 'diamond') {
                drawFacet3D([{x:x, y:y-size*1.2}, {x:x+size, y:y}, {x:x, y:y+size*0.2}, {x:x-size, y:y}], color, 0.4); // Top (Bright)
                drawFacet3D([{x:x-size, y:y}, {x:x, y:y+size*0.2}, {x:x, y:y+size*1.2}], color, -0.2); // Left (Mid)
                drawFacet3D([{x:x+size, y:y}, {x:x, y:y+size*0.2}, {x:x, y:y+size*1.2}], color, -0.5); // Right (Dark)
                drawFacet3D([{x:x, y:y-size*1.2}, {x:x-size, y:y}, {x:x-size*0.5, y:y-size*0.5}], color, 0.8); // Highlight Facet
            } else if (shape === 'shard') {
                drawFacet3D([{x:x, y:y-size*1.2}, {x:x-size*0.6, y:y-size*0.3}, {x:x-size*0.4, y:y+size*0.8}, {x:x, y:y+size}], color, -0.1);
                drawFacet3D([{x:x, y:y-size*1.2}, {x:x+size*0.6, y:y-size*0.3}, {x:x+size*0.4, y:y+size*0.8}, {x:x, y:y+size}], color, 0.3); // Right side hit by light?
                // Actually swap for 3d look
                drawFacet3D([{x:x, y:y-size*1.2}, {x:x-size*0.6, y:y-size*0.3}, {x:x, y:y+size}], color, 0.5);
            } else if (shape === 'hex') {
                drawFacet3D([{x:x-size*0.5, y:y-size*0.8}, {x:x+size*0.5, y:y-size*0.8}, {x:x+size*0.5, y:y+size*0.8}, {x:x-size*0.5, y:y+size*0.8}], color, 0.5); // Top face
                drawFacet3D([{x:x-size*0.5, y:y-size*0.8}, {x:x-size*0.8, y:y-size*0.6}, {x:x-size*0.8, y:y+size*0.6}, {x:x-size*0.5, y:y+size*0.8}], color, -0.2);
                drawFacet3D([{x:x+size*0.5, y:y-size*0.8}, {x:x+size*0.8, y:y-size*0.6}, {x:x+size*0.8, y:y+size*0.6}, {x:x+size*0.5, y:y+size*0.8}], color, -0.5);
            } else if (shape === 'tear') {
                c.beginPath();
                c.moveTo(x, y-size*1.2);
                c.bezierCurveTo(x-size*1.2, y+size*0.2, x-size*0.5, y+size, x, y+size);
                c.bezierCurveTo(x+size*0.5, y+size, x+size*1.2, y+size*0.2, x, y-size*1.2);
                const grad = c.createRadialGradient(x - size*0.2, y + size*0.2, 0, x, y, size*1.2);
                grad.addColorStop(0, 'white');
                grad.addColorStop(0.3, color);
                grad.addColorStop(1, 'black');
                c.fillStyle = grad;
                c.fill();
            }
        }
    };

    // --- EFFECT HOOKS ---

    useEffect(() => {
        const resize = () => {
            const win = (globalThis as any).window;
            if(canvasRef.current && win) {
                canvasRef.current.width = win.innerWidth;
                canvasRef.current.height = win.innerHeight;
                const h = win.innerHeight;
                const w = win.innerWidth;
                
                // Scale Width based on Setting (10% increase per level)
                const widthMult = 1.0 + ((config.current.wandWidthLevel - 1) * 0.1);

                state.current.wand = {
                    baseX: w / 2,
                    baseY: h - 80,
                    tipX: w / 2,
                    tipY: h * 0.15,
                    length: (h - 80) - (h * 0.15),
                    baseWidth: Math.min(w * 0.15, 80) * widthMult,
                    tipWidth: Math.min(w * 0.03, 15) * widthMult,
                    crystalY: (h - 80) - ((h - 80 - h * 0.15) * 0.12)
                };
                generateWoodGrain();
            }
        };
        
        const win = (globalThis as any).window;
        if (win) win.addEventListener('resize', resize);
        resize();
        return () => { if (win) win.removeEventListener('resize', resize); }
    }, []);

    // Update wand when width config changes
    useEffect(() => {
        const win = (globalThis as any).window;
        if (win) win.dispatchEvent(new Event('resize'));
    }, [config.current.wandWidthLevel]); // Reacting to ref change via UI update

    // Main Loop
    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            const c = canvasRef.current?.getContext('2d');
            if (!c || !canvasRef.current) return;

            state.current.time += 0.1;
            const s = state.current;
            const w = s.wand;
            const conf = config.current;

            c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            // WOBBLE (Vibration Logic)
            let wobbleOffset = 0;
            if (s.isCasting) {
                const limitY = w.baseY - (w.length / 3);
                if (s.touchPos.y > limitY) {
                    const distFromBase = w.baseY - s.touchPos.y;
                    const maxDist = w.baseY - limitY;
                    let progress = distFromBase / maxDist;
                    progress = Math.max(0, Math.min(1, progress));
                    
                    const level = conf.vibrationLevel;
                    if (level > 0) {
                        if (level === 1) {
                            wobbleOffset = Math.sin(s.time * 0.5) * 5.0; // Slow hypnotic
                        } else {
                            const vibFreq = [0, 0.5, 2.0, 5.0, 10.0, 20.0]; 
                            const amplitude = 2.0; 
                            const speed = 0.5 + (progress * 2.0);
                            const sway = Math.sin(s.time * 5 * speed) * 2.5;
                            const vibration = Math.sin(s.time * 30 * vibFreq[level]) * amplitude;
                            wobbleOffset = sway + vibration;
                        }
                    }
                }
            }

            c.save();
            c.translate(wobbleOffset, 0);

            // Draw Wand Body
            c.save();
            const hexToHSL = (H: string) => {
                let r = 0, g = 0, b = 0;
                if (H.length == 4) {
                    r = parseInt("0x" + H[1] + H[1]); g = parseInt("0x" + H[2] + H[2]); b = parseInt("0x" + H[3] + H[3]);
                } else if (H.length == 7) {
                    r = parseInt("0x" + H[1] + H[2]); g = parseInt("0x" + H[3] + H[4]); b = parseInt("0x" + H[5] + H[6]);
                }
                r /= 255; g /= 255; b /= 255;
                const cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;
                let h = 0, s = 0, l = 0;
                if (delta == 0) h = 0;
                else if (cmax == r) h = ((g - b) / delta) % 6;
                else if (cmax == g) h = (b - r) / delta + 2;
                else h = (r - g) / delta + 4;
                h = Math.round(h * 60);
                if (h < 0) h += 360;
                l = (cmax + cmin) / 2;
                s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
                return [h, s * 100, l * 100];
            };

            const [h, sat, lum] = hexToHSL(conf.wandBaseColor);
            const minX = w.baseX - w.baseWidth;
            const maxX = w.baseX + w.baseWidth;
            const wandGrad = c.createLinearGradient(minX, 0, maxX, 0);
            wandGrad.addColorStop(0, `hsl(${h}, ${sat}%, ${Math.max(0, lum-15)}%)`);
            wandGrad.addColorStop(0.2, `hsl(${h}, ${sat}%, ${lum}%)`);
            wandGrad.addColorStop(0.5, `hsl(${h}, ${sat}%, ${Math.min(100, lum+10)}%)`);
            wandGrad.addColorStop(0.8, `hsl(${h}, ${sat}%, ${lum}%)`);
            wandGrad.addColorStop(1, `hsl(${h}, ${sat}%, ${Math.max(0, lum-15)}%)`);

            getWandPath(c);
            c.fillStyle = wandGrad;
            c.fill();

            c.save();
            c.clip();
            
            c.save();
            c.strokeStyle = 'rgba(0,0,0,0.4)';
            c.lineWidth = 1.5;
            c.lineCap = 'round';
            for(const grain of s.woodGrains) {
                if(grain.length < 2) continue;
                c.beginPath();
                c.moveTo(grain[0].x, grain[0].y);
                for(let i=1; i<grain.length; i++) c.lineTo(grain[i].x, grain[i].y);
                c.stroke();
            }
            c.restore();

            const rimGradLeft = c.createLinearGradient(minX, 0, minX + 30, 0);
            rimGradLeft.addColorStop(0, 'rgba(255,255,255,0.2)');
            rimGradLeft.addColorStop(1, 'rgba(255,255,255,0)');
            c.fillStyle = rimGradLeft;
            c.fillRect(minX, 0, 30, canvasRef.current.height);

            const rimGradRight = c.createLinearGradient(maxX - 30, 0, maxX, 0);
            rimGradRight.addColorStop(0, 'rgba(0,0,0,0)');
            rimGradRight.addColorStop(1, 'rgba(0,0,0,0.3)');
            c.fillStyle = rimGradRight;
            c.fillRect(maxX-30, 0, 30, canvasRef.current.height);
            c.restore();

            c.strokeStyle = `rgba(255, 255, 255, ${0.1 + s.energyLevel * 0.5})`;
            c.lineWidth = 2;
            c.shadowBlur = s.energyLevel * 15;
            c.shadowColor = conf.activatedColor; 
            getWandPath(c);
            c.stroke();
            c.restore();

            // Crystal
            c.save();
            const pulse = s.isCasting ? Math.sin(s.time*0.5)*5 : 0;
            drawCrystal(c, w.baseX, w.crystalY, 25 + pulse + (s.energyLevel*5));
            c.restore();

            // Emanations
            if(s.isCasting && Math.random() > 0.9) s.emanations.push({x: w.baseX, y: w.crystalY, radius: 1, alpha: 1, color: conf.activatedColor});
            for(let i=s.emanations.length-1; i>=0; i--) {
                s.emanations[i].radius += 2; 
                s.emanations[i].alpha -= 0.02;
                if(s.emanations[i].alpha <= 0) {
                    s.emanations.splice(i,1);
                    continue;
                }
                c.beginPath();
                c.arc(s.emanations[i].x, s.emanations[i].y, s.emanations[i].radius, 0, Math.PI * 2);
                c.strokeStyle = getGlowColorFromHex(s.emanations[i].color, s.emanations[i].alpha * 0.5);
                c.lineWidth = 2;
                c.stroke();
            }

            // Internal Flow
            c.save();
            getWandPath(c);
            c.clip();

            if (s.isCasting) {
                if (s.energyLevel < 1) s.energyLevel += 0.05;
                const grad = c.createLinearGradient(w.baseX, w.baseY, w.tipX, w.tipY);
                grad.addColorStop(0, getGlowColorFromHex(conf.activatedColor, 0.2));
                grad.addColorStop(1, getGlowColorFromHex(conf.activatedColor, 0.8 * s.energyLevel));
                c.fillStyle = grad;
                c.fillRect(0,0,canvasRef.current.width,canvasRef.current.height);

                // Generate Internal Particles
                if (Math.random() > 0.1) {
                    const spawnX = w.baseX + (Math.random() - 0.5) * 20;
                    const spawnY = w.crystalY + (Math.random() - 0.5) * 20;
                    
                    // Internal Speed: Slower base
                    const baseSpeed = 0.5; 
                    const speedRange = 2.5;
                    const speedMult = baseSpeed + ((conf.internalSpeed - 1) / 4) * speedRange;
                    
                    s.particles.push({
                        x: spawnX, y: spawnY, type: 'flow',
                        vx: (Math.random() - 0.5), 
                        vy: (-Math.random()*3 - 2) * speedMult,
                        life: 1.0, 
                        shapeType: conf.internalShape, 
                        size: Math.random()*3+1,
                        color: conf.internalColor 
                    });
                }
                
                c.globalCompositeOperation = 'lighter';
                for (let i = s.particles.length - 1; i >= 0; i--) {
                    const p = s.particles[i];
                    
                    const baseSpeed = 0.5; 
                    const speedRange = 2.5;
                    const speedMult = baseSpeed + ((conf.internalSpeed - 1) / 4) * speedRange;

                    p.x += p.vx + Math.sin(p.y * 0.05 + s.time) * 0.5 * speedMult;
                    p.y += p.vy;
                    if (p.y < w.tipY) p.life -= 0.1;

                    if (p.life <= 0) { s.particles.splice(i, 1); continue; }

                    // FIXED SYNCED SIZING: Matches external logic (1.0 + (level-1)*0.25)
                    const sizeMult = 1.0 + ((conf.internalSize - 1) * 0.25);
                    
                    if (p.shapeType === 'lightning') {
                        // Match width logic for internal lightning
                        const thickness = 2 * (1 + (conf.internalSize - 1) * 0.5);
                        c.beginPath();
                        c.strokeStyle = p.color;
                        c.lineWidth = thickness;
                        c.moveTo(p.x, p.y);
                        c.lineTo(p.x + (Math.random()-0.5)*10, p.y - 15*sizeMult);
                        c.stroke();
                    } else {
                        c.save();
                        c.translate(p.x, p.y);
                        // Base size is 15 (same as external base), scaled by multiplier
                        const scale = (15/10) * p.life * sizeMult * 0.3; // Rendering scale down for inside view
                        c.scale(scale, scale);
                        drawShape(c, p.shapeType, p.color);
                        c.restore();
                    }
                }
            } else {
                if (s.energyLevel > 0) s.energyLevel -= 0.05;
                s.particles = []; 
            }
            c.restore();
            c.restore();

            // External Projectiles
            if (s.isCasting) {
                c.globalCompositeOperation = 'lighter';
                const tipX = w.tipX + wobbleOffset;

                if(s.energyLevel > 0.3) {
                    c.beginPath();
                    c.arc(tipX, w.tipY, 12 * s.energyLevel, 0, Math.PI*2);
                    c.fillStyle = getGlowColorFromHex(conf.activatedColor, 0.8);
                    c.fill();
                }

                // Spawn Probability Logic (Volume Increase +25% per level)
                let spawnRate = 0.25; 
                if (conf.screenFillLevel >= 2) {
                     // Compound 25% increase per level starting at level 2
                     const multiplier = Math.pow(1.25, conf.screenFillLevel - 1);
                     spawnRate *= multiplier;
                }

                if (s.energyLevel > 0.8 && Math.random() < spawnRate * conf.intensityMult) {
                    if (conf.externalShape === 'lightning') {
                        const spreadMap = [30, 50, 75, 90, 110, 150];
                        // Apply Spread Multiplier same as Volume (+25% compound)
                        let spreadDeg = 30;
                        if (conf.screenFillLevel >= 2) {
                            spreadDeg = 30 * Math.pow(1.25, conf.screenFillLevel - 1);
                        } else if (conf.screenFillLevel === 1) {
                            spreadDeg = 30; // Baseline
                        }
                        
                        const angle = (Math.random() - 0.5) * spreadDeg * (Math.PI / 180);
                        const dist = w.tipY + 100; 
                        const endX = tipX + Math.tan(angle) * dist;
                        
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const segments: any[] = [];
                        const generateSegments = (x1: number, y1: number, x2: number, y2: number, disp: number) => {
                            if (disp < 5) { segments.push({x1, y1, x2, y2}); return; }
                            const mx = (x1+x2)/2 + (Math.random()-0.5)*disp;
                            const my = (y1+y2)/2 + (Math.random()-0.5)*disp;
                            generateSegments(x1,y1,mx,my,disp/2);
                            generateSegments(mx,my,x2,y2,disp/2);
                        };
                        generateSegments(tipX, w.tipY, endX, -100, 80);
                        
                        // Use external size for width
                        const width = 2 * (1 + (conf.externalSize - 1) * 0.5);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        s.projectiles.push({ segments, life: 1.0, type: 'lightning', color: conf.externalColor, state: 'shooting', width } as any);
                    } else {
                        let spreadDeg = 30;
                        if (conf.screenFillLevel >= 2) {
                            spreadDeg = 30 * Math.pow(1.25, conf.screenFillLevel - 1);
                        }

                        const angle = (Math.random() - 0.5) * spreadDeg * (Math.PI / 180); 
                        const speed = Math.random() * 5 + 5;
                        s.projectiles.push({
                            x: tipX, y: w.tipY,
                            vx: Math.sin(angle) * speed, vy: -Math.cos(angle) * speed,
                            life: 1.0, rot: Math.random() * Math.PI, rotSpeed: (Math.random() - 0.5) * 0.2,
                            type: conf.externalShape, size: 15, color: conf.externalColor, state: 'shooting'
                        });
                    }
                }
            }

            c.globalCompositeOperation = 'source-over'; 
            if(conf.externalShape === 'lightning' || conf.externalShape === 'rainbow') c.globalCompositeOperation = 'lighter'; 

            for (let i = s.projectiles.length - 1; i >= 0; i--) {
                const p = s.projectiles[i];
                if (p.type === 'lightning') {
                    const bolt = p as Bolt;
                    bolt.life -= 0.1;
                    if(bolt.life <= 0) { s.projectiles.splice(i, 1); continue; }
                    c.beginPath();
                    c.strokeStyle = bolt.color;
                    // Width scaling
                    c.lineWidth = Math.max(0.1, (bolt.width || 2) * bolt.life * conf.intensityMult);
                    c.shadowBlur = 10;
                    c.shadowColor = bolt.color;
                    for(const seg of bolt.segments) { c.moveTo(seg.x1,seg.y1); c.lineTo(seg.x2,seg.y2); }
                    c.stroke();
                    c.shadowBlur = 0;
                } else {
                    if (conf.screenFillLevel > 0) {
                        const distFromTip = Math.abs(p.y - w.tipY);
                        if (p.state === 'shooting' && distFromTip > 200) p.state = 'floating';

                        if (p.state === 'floating') {
                            p.vx *= 0.95; 
                            p.vy *= 0.95;
                            p.y -= 0.2;
                            const decay = 0.01 / (1 + conf.screenFillLevel * 1.5);
                            p.life -= decay;
                        } else {
                            p.x += p.vx; p.y += p.vy;
                            p.life -= 0.01;
                        }
                    } else {
                        p.x += p.vx; p.y += p.vy;
                        p.life -= 0.01;
                    }

                    p.rot += p.rotSpeed;
                    
                    // External Size Scaling (Matches Internal Logic)
                    const sizeMult = 1.0 + ((conf.externalSize - 1) * 0.25);
                    p.size = 15 * p.life * sizeMult;
                    
                    if (p.life <= 0) { s.projectiles.splice(i, 1); continue; }

                    c.save();
                    c.translate(p.x, p.y);
                    c.rotate(p.rot);
                    drawShape(c, p.type, p.color, p.size);
                    c.restore();
                }
            }
            c.globalCompositeOperation = 'source-over';

            const win = (globalThis as any).window;
            if (win) animationFrameId = win.requestAnimationFrame(animate);
        };

        const win = (globalThis as any).window;
        if (win) animationFrameId = win.requestAnimationFrame(animate);
        return () => { if (win) win.cancelAnimationFrame(animationFrameId); };
    }, []);

    // Helper to draw shapes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drawShape = (ctx: any, type: string, color: string, size: number = 10) => {
        if (type === 'hearts') {
            ctx.fillStyle = color;
            ctx.beginPath();
            const topCurveHeight = size * 0.3;
            ctx.moveTo(0, topCurveHeight);
            ctx.bezierCurveTo(0, 0, -size/2, 0, -size/2, topCurveHeight);
            ctx.bezierCurveTo(-size/2, (size+topCurveHeight)/2, 0, (size+topCurveHeight)/2, 0, size);
            ctx.bezierCurveTo(0, (size+topCurveHeight)/2, size/2, (size+topCurveHeight)/2, size/2, topCurveHeight);
            ctx.bezierCurveTo(size/2, 0, 0, 0, 0, topCurveHeight);
            ctx.fill();
        } else if (type === 'coins') {
            ctx.fillStyle = color; 
            ctx.beginPath(); ctx.arc(0,0, size/2, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#b45309'; ctx.lineWidth=2; ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `${size*0.6}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
            ctx.fillText('$', 0, 1);
        } else if (type === 'clovers') {
            ctx.fillStyle = color; 
            for(let k=0; k<4; k++) {
                ctx.rotate(Math.PI/2);
                ctx.beginPath(); ctx.arc(0, -size*0.3, size*0.3, 0, Math.PI*2); ctx.fill();
            }
        } else if (type === 'rainbow') {
            // Vector Arc
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.8, Math.PI, 0); 
            ctx.lineWidth = size * 0.4;
            const grad = ctx.createLinearGradient(-size, 0, size, 0);
            grad.addColorStop(0, "red"); grad.addColorStop(0.2, "orange");
            grad.addColorStop(0.4, "yellow"); grad.addColorStop(0.6, "green");
            grad.addColorStop(0.8, "blue"); grad.addColorStop(1, "violet");
            ctx.strokeStyle = grad; ctx.stroke();
        } else if (type === 'lightning') {
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.arc(0, 0, size/2, 0, Math.PI*2); ctx.fill();
        }
    };

    // --- EVENT HANDLERS ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleStart = (e: any) => {
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const w = state.current.wand;
        if(Math.sqrt(Math.pow(cx-w.baseX,2)+Math.pow(cy-w.crystalY,2)) < 100) {
            if(!state.current.initialized) initAudio();
            state.current.isCasting = true;
            state.current.touchPos = {x:cx, y:cy};
            updateAudio(true);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMove = (e: any) => {
        if(!state.current.isCasting) return;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        state.current.touchPos = {x:cx, y:cy};
    };

    const handleEnd = () => {
        state.current.isCasting = false;
        updateAudio(false);
    };

    // --- UI UPDATERS ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateConfig = (key: string, value: any) => {
        if (!key.toLowerCase().includes('color')) playClickSound();
        // @ts-expect-error - dynamic property access
        config.current[key] = value;
        updateCSSVar();
        if(key === 'wandBaseColor' || key === 'wandShape') generateWoodGrain();
        
        setConfigTick(t => t + 1);
    };
    
    const openColorPicker = (key: string, label: string) => {
        // @ts-expect-error - dynamic access
        setTempColor(config.current[key]);
        setShowColorModal({ show: true, target: key, label });
    }
    
    const applyColorSelection = (c: string) => {
        if (showColorModal.target) updateConfig(showColorModal.target, c);
    }
    
    const confirmColorSelection = () => {
         setShowColorModal({ show: false, target: null, label: '' });
    }

    const activeClass = (isActive: boolean) => 
        isActive 
            ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_#a855f7]" 
            : "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400";
            
    const ColorButton = ({ color, label, onClick }: { color: string, label: string, onClick: () => void }) => (
        <div className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700 cursor-pointer hover:border-purple-500 transition-colors" onClick={onClick}>
            <span className="text-sm text-gray-300 font-medium">{label}</span>
            <div className="w-8 h-8 rounded-full border border-gray-500 shadow-sm" style={{ backgroundColor: color }}></div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black overflow-hidden touch-none select-none font-sans">
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full z-10"
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
            />

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
                
                <div className="absolute top-4 left-4 pointer-events-auto">
                    <MagickalBackLink href="/marketplace/magickal-tools" text="Back" className="text-xs" />
                </div>

                <div className="absolute bottom-4 left-4 pointer-events-auto">
                    <button onClick={() => setShowSettings(true)} className="p-3 rounded-full bg-gray-900/50 border border-purple-500/30 hover:bg-gray-800 text-purple-300 transition-colors backdrop-blur-md">
                        <Settings size={28} />
                    </button>
                </div>

                <div className="absolute bottom-4 right-4 pointer-events-auto">
                    <button onClick={toggleFullscreen} className="p-3 rounded-full bg-gray-900/50 border border-purple-500/30 hover:bg-gray-800 text-purple-300 transition-colors backdrop-blur-md">
                        {isFullscreen ? <Minimize2 size={28} /> : <Maximize2 size={28} />}
                    </button>
                </div>

                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center h-full w-0">
                    <div className="-rotate-90 origin-center whitespace-nowrap opacity-30 mix-blend-screen">
                        <h1 className="text-sm font-bold tracking-[0.6em] font-serif text-purple-300/50" style={{textShadow: '0 0 5px currentColor'}}>
                            LORDMAGICK
                        </h1>
                    </div>
                </div>

                {(wandName || intention) && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center h-full w-0">
                        <div className="rotate-90 origin-center whitespace-nowrap text-center transition-opacity duration-1000">
                            {wandName && (
                                <p className="text-2xl md:text-4xl text-white font-bold tracking-wide uppercase mb-2" style={{textShadow: `0 0 10px var(--wand-color)`}}>
                                    {wandName}
                                </p>
                            )}
                            {intention && (
                                <p className="text-lg md:text-xl text-gray-400 italic font-serif tracking-widest opacity-70">
                                    "{intention}"
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div id="start-hint" className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto transition-opacity duration-500 ${hasStarted ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <p className="text-purple-200 text-lg tracking-widest uppercase mb-4">Initialize Energy</p>
                    <div className="w-20 h-20 border-2 border-purple-400 rounded-full mx-auto animate-pulse flex items-center justify-center mb-6 pointer-events-none">
                        <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    </div>
                    
                    <div className="flex flex-col gap-4 items-center">
                        <p className="text-sm text-gray-400">Touch & Hold Crystal Base</p>
                        <button 
                            onClick={() => { toggleFullscreen(); initAudio(); }}
                            className="px-8 py-3 border border-purple-500/50 rounded bg-purple-900/20 text-purple-300 hover:bg-purple-800/40 text-sm tracking-wider uppercase transition-colors"
                        >
                            Enter Fullscreen & Begin
                        </button>
                    </div>
                </div>
            </div>

            {/* COLOR MODAL */}
            {showColorModal.show && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-md">
                     <div className="w-11/12 max-w-sm bg-gray-900 border border-gray-600 rounded-xl p-6 relative">
                        <h3 className="text-xl font-serif text-white mb-6 text-center">{showColorModal.label}</h3>
                        
                        <div className="grid grid-cols-4 gap-3 mb-6">
                            {COLOR_PALETTE.map(c => (
                                <button 
                                    key={c} 
                                    className="w-10 h-10 rounded-full border border-gray-600 shadow-lg hover:scale-110 transition-transform"
                                    style={{ backgroundColor: c }}
                                    onClick={() => { setTempColor(c); applyColorSelection(c); }}
                                />
                            ))}
                        </div>
                        
                        <div className="mb-6 flex justify-center">
                            <input 
                                type="color" 
                                value={tempColor}
                                // FIX: onInput allows dragging without closing
                                onInput={(e) => { 
                                    const val = (e.target as any).value; 
                                    setTempColor(val); 
                                    applyColorSelection(val);
                                }} 
                                className="w-full h-12 cursor-pointer rounded border border-gray-600"
                            />
                        </div>

                        <button 
                            onClick={confirmColorSelection}
                            className="w-full py-3 bg-purple-600 text-white font-bold rounded hover:bg-purple-500 transition-colors uppercase tracking-wide"
                        >
                            Confirm Color
                        </button>
                     </div>
                </div>
            )}

            {/* MAIN SETTINGS MODAL */}
            {showSettings && !showColorModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="w-11/12 max-w-md bg-gray-950/95 border border-gray-700 rounded-xl p-6 relative max-h-[85vh] overflow-y-auto">
                        <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-serif text-purple-300 mb-4 text-center tracking-widest border-b border-gray-700 pb-2">Grimoire</h2>
                        
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-sm uppercase text-gray-500 tracking-wide font-bold">Identity</h3>
                                <input type="text" value={wandName} onChange={(e) => setWandName((e.target as any).value)} placeholder="Name your Wand..." className="w-full bg-black/30 border border-gray-600 rounded p-3 text-purple-200 text-sm focus:border-purple-500 outline-none" />
                                <input type="text" value={intention} onChange={(e) => setIntention((e.target as any).value)} placeholder="Set your Intention..." className="w-full bg-black/30 border border-gray-600 rounded p-3 text-purple-200 text-sm focus:border-purple-500 outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Shape</label>
                                    <select 
                                        className="w-full bg-gray-800 text-sm border border-gray-600 rounded p-2 text-white" 
                                        value={config.current.wandShape}
                                        onChange={(e) => updateConfig('wandShape', (e.target as any).value)}
                                    >
                                        <option value="classic">Classic</option>
                                        <option value="twisted">Twisted</option>
                                        <option value="elder">Elder</option>
                                        <option value="vine">Vine</option>
                                        <option value="bone">Bone</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Width (1-5)</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(l => (
                                            <button key={l} className={`flex-1 h-8 rounded border text-xs ${activeClass(config.current.wandWidthLevel === l)}`} onClick={() => updateConfig('wandWidthLevel', l)}>{l}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <ColorButton label="Wood Material" color={config.current.wandBaseColor} onClick={() => openColorPicker('wandBaseColor', 'Wood Color')} />

                            <div>
                                <h3 className="text-sm uppercase text-gray-500 mb-2 tracking-wide font-bold">Crystal Core</h3>
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Shape</label>
                                        <select 
                                            className="w-full bg-gray-800 text-sm border border-gray-600 rounded p-2 text-white"
                                            value={config.current.crystalShape}
                                            onChange={(e) => updateConfig('crystalShape', (e.target as any).value)}
                                        >
                                            <option value="orb">Orb</option>
                                            <option value="diamond">Diamond</option>
                                            <option value="shard">Shard</option>
                                            <option value="hex">Hex</option>
                                            <option value="tear">Tear</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col justify-end">
                                        <ColorButton label="Crystal Color" color={config.current.crystalBaseColor} onClick={() => openColorPicker('crystalBaseColor', 'Crystal Color')} />
                                    </div>
                                </div>
                                <ColorButton label="Active Glow (Aura)" color={config.current.activatedColor} onClick={() => openColorPicker('activatedColor', 'Aura Color')} />
                            </div>

                            <div className="p-4 bg-gray-900/50 rounded border border-gray-800 space-y-4">
                                <h3 className="text-sm uppercase text-gray-500 tracking-wide font-bold">Internal Energy</h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {[{id: 'lightning', icon: Zap}, {id: 'hearts', icon: Heart}, {id: 'rainbow', icon: CloudRain}, {id: 'coins', icon: Coins}, {id: 'clovers', icon: Clover}].map(item => (
                                        <button key={item.id} className={`p-2 rounded border flex items-center justify-center transition-all active:scale-90 ${activeClass(config.current.internalShape === item.id)}`} onClick={() => updateConfig('internalShape', item.id)}><item.icon size={18} /></button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Speed</label>
                                        <div className="flex gap-1">{[1, 2, 3, 4, 5].map(l => (<button key={l} className={`flex-1 h-8 rounded border text-xs ${activeClass(config.current.internalSpeed === l)}`} onClick={() => updateConfig('internalSpeed', l)}>{l}</button>))}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Size</label>
                                        <div className="flex gap-1">{[1, 2, 3, 4, 5].map(l => (<button key={l} className={`flex-1 h-8 rounded border text-xs ${activeClass(config.current.internalSize === l)}`} onClick={() => updateConfig('internalSize', l)}>{l}</button>))}</div>
                                    </div>
                                </div>
                                <ColorButton label="Internal Color" color={config.current.internalColor} onClick={() => openColorPicker('internalColor', 'Internal Particles')} />
                            </div>

                            <div className="p-4 bg-gray-900/50 rounded border border-gray-800 space-y-4">
                                <h3 className="text-sm uppercase text-gray-500 tracking-wide font-bold">External Projection</h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {[{id: 'lightning', icon: Zap}, {id: 'hearts', icon: Heart}, {id: 'rainbow', icon: CloudRain}, {id: 'coins', icon: Coins}, {id: 'clovers', icon: Clover}].map(item => (
                                        <button key={item.id} className={`p-2 rounded border flex items-center justify-center transition-all active:scale-90 ${activeClass(config.current.externalShape === item.id)}`} onClick={() => updateConfig('externalShape', item.id)}><item.icon size={18} /></button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Size / Thickness</label>
                                        <div className="flex gap-1">{[1, 2, 3, 4, 5].map(l => (<button key={l} className={`flex-1 h-8 rounded border text-xs ${activeClass(config.current.externalSize === l)}`} onClick={() => updateConfig('externalSize', l)}>{l}</button>))}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Screen Fill (0=Off)</label>
                                        <div className="flex gap-1">{[0, 1, 2, 3, 4, 5].map(l => (<button key={l} className={`flex-1 h-8 rounded border text-xs ${activeClass(config.current.screenFillLevel === l)}`} onClick={() => updateConfig('screenFillLevel', l)}>{l}</button>))}</div>
                                    </div>
                                </div>
                                <ColorButton label="Cast Color" color={config.current.externalColor} onClick={() => openColorPicker('externalColor', 'Projection Color')} />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-700">
                                <h3 className="text-sm uppercase text-gray-500 tracking-wide font-bold">Haptics & Audio</h3>
                                
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Vibration (0=None)</label>
                                    <div className="flex gap-1">{[0, 1, 2, 3, 4].map(l => (<button key={l} className={`flex-1 h-8 rounded border flex items-center justify-center text-xs transition-all active:scale-90 ${activeClass(config.current.vibrationLevel === l)}`} onClick={() => updateConfig('vibrationLevel', l)}>{l}</button>))}</div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Master Volume: {Math.round(config.current.masterVolume * 100)}%</label>
                                    <input 
                                        type="range" 
                                        min="0" max="200" step="10" 
                                        defaultValue={100}
                                        onChange={(e) => updateConfig('masterVolume', parseInt((e.target as any).value) / 100)} 
                                        className="w-full accent-purple-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Sonic Profile</label>
                                    <div className="grid grid-cols-5 gap-1">
                                        {['hum', 'theremin', 'ethereal', 'void', 'dragon'].map(s => (
                                            <button key={s} className={`p-1 text-[10px] rounded border capitalize transition-all active:scale-90 overflow-hidden text-center ${activeClass(config.current.soundProfile === s)}`} onClick={() => updateConfig('soundProfile', s)}>{s.slice(0,3)}</button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 border border-gray-700 p-3 rounded bg-gray-800/50">
                                    <input 
                                        type="checkbox" 
                                        id="reverbToggle"
                                        className="w-5 h-5 accent-purple-500 cursor-pointer"
                                        checked={config.current.reverb}
                                        onChange={(e) => updateConfig('reverb', (e.target as any).checked)} 
                                    />
                                    <label htmlFor="reverbToggle" className="text-sm text-gray-300 flex items-center gap-2 cursor-pointer">
                                        <Volume2 size={16} /> Cathedral Reverb
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}