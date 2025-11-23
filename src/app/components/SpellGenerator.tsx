// --- START OF FILE src/app/components/SpellGenerator.tsx ---
/// <reference lib="dom" />
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Session, SpellFormData, GeneratedSpell, Spell } from '@/lib/types';
import { generateSpellAndSigil, saveSpell, getSpells, uploadBase64Image } from '@/lib/services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { WandIcon, GrimoireFlourish, GrimoireDecoration, StoneTabletButton } from './icons';

interface SpellGeneratorProps {
  session: Session;
  isSubscribed: boolean;
  onBack: () => void;
}

type SpellView = 'form' | 'ritual' | 'book';

// --- Web Audio API Sound Manager ---
const audioManager = {
    // FIX: Use 'any' to bypass strict type checks for AudioContext and nodes
    audioCtx: null as any,
    holdSoundNodes: null as { osc1: any; osc2: any; gain: any } | null,
    convolverNode: null as any,
    wetGain: null as any,
    dryGain: null as any,

    _createImpulseResponse(audioCtx: any): any {
        const sampleRate = audioCtx.sampleRate;
        const duration = 4;
        const decay = 5;
        const length = sampleRate * duration;
        const impulse = audioCtx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = length - i;
            left[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
            right[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
        }
        return impulse;
    },

    init() {
        // FIX: Use safe window access
        const win = (globalThis as any).window;
        if (typeof win === 'undefined') return;

        if (!this.audioCtx) {
            const AudioContextClass = win.AudioContext || (win as any).webkitAudioContext;
            if (AudioContextClass) {
                const audioCtx = new AudioContextClass();
                this.audioCtx = audioCtx;
                this.convolverNode = audioCtx.createConvolver();
                this.wetGain = audioCtx.createGain();
                this.dryGain = audioCtx.createGain();
                this.convolverNode.buffer = this._createImpulseResponse(audioCtx);
                this.convolverNode.connect(this.wetGain);
                this.wetGain.connect(audioCtx.destination);
                this.dryGain.connect(audioCtx.destination);
                this.wetGain.gain.value = 0.7;
                this.dryGain.gain.value = 0.4;
            }
        }
    },

    playHoldSound() {
        const win = (globalThis as any).window;
        if (typeof win === 'undefined') return;
        if (!this.audioCtx || this.holdSoundNodes) return;
        const audioCtx = this.audioCtx;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.connect(gain);
        osc2.connect(gain);
        if (this.convolverNode && this.dryGain && this.wetGain) {
            gain.connect(this.convolverNode);
            gain.connect(this.dryGain);
        } else {
            gain.connect(audioCtx.destination);
        }
        osc1.frequency.setValueAtTime(40, audioCtx.currentTime); 
        osc1.frequency.linearRampToValueAtTime(125, audioCtx.currentTime + 7);
        osc2.frequency.setValueAtTime(60, audioCtx.currentTime);
        osc2.frequency.linearRampToValueAtTime(187.5, audioCtx.currentTime + 7);
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 1);
        osc1.start(audioCtx.currentTime);
        osc2.start(audioCtx.currentTime);
        this.holdSoundNodes = { osc1, osc2, gain };
    },

    stopHoldSound() {
        const win = (globalThis as any).window;
        if (typeof win === 'undefined') return;
        if (!this.audioCtx || !this.holdSoundNodes) return;
        const { osc1, osc2, gain } = this.holdSoundNodes;
        const audioCtx = this.audioCtx;
        gain.gain.cancelScheduledValues(audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
        osc1.stop(audioCtx.currentTime + 0.25);
        osc2.stop(audioCtx.currentTime + 0.25);
        this.holdSoundNodes = null;
    },
    
    playActivateSound() {
        const win = (globalThis as any).window;
        if (typeof win === 'undefined') return;
        if (!this.audioCtx) return;
        const audioCtx = this.audioCtx;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        if (this.convolverNode && this.dryGain && this.wetGain) {
            gain.connect(this.convolverNode);
            gain.connect(this.dryGain);
        } else {
            gain.connect(audioCtx.destination);
        }
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime);
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.5);
    },

    playExplosionSound() {
        const win = (globalThis as any).window;
        if (typeof win === 'undefined') return;
        if (!this.audioCtx) return;
        const audioCtx = this.audioCtx;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        if (this.convolverNode && this.dryGain && this.wetGain) {
            gain.connect(this.convolverNode);
            gain.connect(this.dryGain);
        } else {
            gain.connect(audioCtx.destination);
        }
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.35);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
    },
    
    playCompletionSound() {
        const win = (globalThis as any).window;
        if (typeof win === 'undefined') return;
        if (!this.audioCtx) return;
        const audioCtx = this.audioCtx;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((note, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            if (this.convolverNode && this.dryGain && this.wetGain) {
                gain.connect(this.convolverNode);
                gain.connect(this.dryGain);
            } else {
                gain.connect(audioCtx.destination);
            }
            osc.type = 'sine';
            osc.frequency.value = note;
            gain.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + i * 0.08 + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + i * 0.08 + 1.2);
            osc.start(audioCtx.currentTime + i * 0.08);
            osc.stop(audioCtx.currentTime + i * 0.08 + 1.2);
        });
    }
};

interface RitualDisplayProps {
    generatedSpell: GeneratedSpell;
    onComplete: () => void;
}

const RitualDisplay: React.FC<RitualDisplayProps> = ({ generatedSpell, onComplete }) => {
    const [ritualStep, setRitualStep] = useState(0);
    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const [countdown, setCountdown] = useState(7);
    const [isComplete, setIsComplete] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [pressedElements, setPressedElements] = useState<string[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const HOLD_DURATION = 7000;

    const animate = useCallback((timestamp: number) => {
        // FIX: Safe window access
        if (typeof (globalThis as any).window === 'undefined') return;
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsedTime = timestamp - startTimeRef.current;
        const progress = Math.min(elapsedTime / HOLD_DURATION, 1);
        setHoldProgress(progress * 100);
        setCountdown(Math.max(1, 7 - Math.floor(elapsedTime / 1000)));

        if (progress < 1) {
            // FIX: Use globalThis for requestAnimationFrame
            animationFrameRef.current = (globalThis as any).window.requestAnimationFrame(animate);
        } else {
            setHoldProgress(100);
            setCountdown(1);
            setIsComplete(true);
            audioManager.stopHoldSound();
            audioManager.playExplosionSound();
            setTimeout(() => setRitualStep(1), 800);
        }
    }, []);

    useEffect(() => {
        // FIX: Safe window access
        if (typeof (globalThis as any).window === 'undefined') return;
        if (isHolding && !isComplete) {
            startTimeRef.current = performance.now();
            // FIX: Use globalThis for requestAnimationFrame
            animationFrameRef.current = (globalThis as any).window.requestAnimationFrame(animate);
        } else {
            if (animationFrameRef.current) {
                (globalThis as any).window.cancelAnimationFrame(animationFrameRef.current);
            }
            startTimeRef.current = null;
            if(!isComplete) setHoldProgress(0);
            setCountdown(7);
        }
        return () => { 
            if (typeof (globalThis as any).window !== 'undefined' && animationFrameRef.current) {
                (globalThis as any).window.cancelAnimationFrame(animationFrameRef.current); 
            }
        };
    }, [isHolding, isComplete, animate]);
    
    const handleHoldStart = (e: React.MouseEvent | React.TouchEvent) => {
        audioManager.init();
        if (!isComplete) { e.preventDefault(); setIsHolding(true); audioManager.playHoldSound(); }
    };
    const handleHoldEnd = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isComplete) { e.preventDefault(); setIsHolding(false); audioManager.stopHoldSound(); }
    };

    const elements = ['Fire', 'Water', 'Air', 'Earth', 'Spirit'];
    const elementStyles: Record<string, { base: string; shadow: string; border: string; text: string; }> = {
      Fire:   { base: 'bg-linear-to-br from-red-500 to-orange-600', shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.7)]',   border: 'border-red-300', text: 'text-white' },
      Water:  { base: 'bg-linear-to-br from-blue-500 to-cyan-600',   shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.7)]',  border: 'border-blue-300', text: 'text-white' },
      Air:    { base: 'bg-linear-to-br from-yellow-300 to-amber-400', shadow: 'shadow-[0_0_15px_rgba(252,211,77,0.7)]', border: 'border-yellow-100', text: 'text-black/80' },
      Earth:  { base: 'bg-linear-to-br from-green-600 to-emerald-700', shadow: 'shadow-[0_0_15px_rgba(22,163,74,0.7)]',  border: 'border-green-400', text: 'text-white' },
      Spirit: { base: 'bg-linear-to-br from-indigo-500 to-purple-700', shadow: 'shadow-[0_0_15px_rgba(139,92,246,0.7)]', border: 'border-indigo-300', text: 'text-white' }
    };

    const handleElementPress = (el: string) => {
        if (pressedElements.includes(el)) return;
        audioManager.playActivateSound();
        const newPressed = [...pressedElements, el];
        setPressedElements(newPressed);
        if (newPressed.length === 5) {
            audioManager.playCompletionSound();
            setTimeout(() => {
                setRitualStep(3);
                setTimeout(() => setShowButton(true), 4500);
            }, 1000);
        }
    };
    
    const SVG_SIZE = 256;
    const STROKE_WIDTH = 8;
    const RADIUS = (SVG_SIZE / 2) - (STROKE_WIDTH / 2);
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    const strokeDashoffset = CIRCUMFERENCE * (1 - holdProgress / 100);
    
    if(ritualStep === 3) {
        const completionText = "It is done.";
        return (
            <div className="text-center flex flex-col items-center justify-center min-h-[400px] w-full h-full absolute inset-0 bg-black">
                <div className="absolute inset-0 bg-linear-to-br from-[#0a092d] to-black animate-smoke-in" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(49, 26, 90, 0.5) 0%, rgba(10, 9, 45, 0) 70%)' }}></div>
                <div className="relative flex flex-col items-center justify-center animate-fade-in-glow">
                    <GrimoireDecoration className="w-[450px] h-auto text-yellow-400/70" />
                    <div className="my-8">
                        <h2 className="text-6xl font-elven text-yellow-200 tracking-widest" style={{ textShadow: '0 0 10px #fde047' }}>
                            {completionText.split('').map((char, index) => (
                                <span key={index} className="trace-letter" style={{ animationDelay: `${2.5 + index * 0.2}s` }}>
                                    {char === ' ' ? '\u00A0' : char}
                                </span>
                            ))}
                        </h2>
                    </div>
                     <GrimoireDecoration className="w-[450px] h-auto text-yellow-400/70 transform scale-y-[-1]" />
                </div>
                <div className={`transition-opacity duration-1000 ${showButton ? 'opacity-100' : 'opacity-0'}`}>
                    <StoneTabletButton onClick={onComplete} className="w-48 h-16 mt-16 font-serif text-lg text-purple-200">
                        Return
                    </StoneTabletButton>
                </div>
            </div>
        )
    }

    return (
      <div className="text-center animate-fade-in min-h-[500px] flex flex-col justify-center items-center overflow-hidden">
        <div className={`transition-opacity duration-500 ${ritualStep > 0 ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}`}>
            <p className="mb-4 text-lg text-gray-300 font-serif italic">Press and hold the sigil to awaken its power.</p>
            <div className="relative grid place-items-center w-64 h-64 mx-auto cursor-pointer select-none" onMouseDown={handleHoldStart} onMouseUp={handleHoldEnd} onMouseLeave={handleHoldEnd} onTouchStart={handleHoldStart} onTouchEnd={handleHoldEnd}>
                <img src={`data:image/png;base64,${generatedSpell.sigilBase64}`} alt="Generated Sigil" className={`col-start-1 row-start-1 w-full h-full rounded-full ${isComplete ? 'sigil-exploding' : ''}`} style={{ filter: `drop-shadow(0 0 5px #a855f7)` }}/>
                <svg width={SVG_SIZE} height={SVG_SIZE} className="col-start-1 row-start-1 transform -rotate-90">
                    <circle cx={SVG_SIZE/2} cy={SVG_SIZE/2} r={RADIUS} stroke="rgba(255, 255, 255, 0.2)" strokeWidth={STROKE_WIDTH} fill="transparent" />
                    <circle cx={SVG_SIZE/2} cy={SVG_SIZE/2} r={RADIUS} stroke="white" strokeWidth={STROKE_WIDTH} fill="transparent" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={`transition-opacity duration-300 ${isComplete ? 'opacity-0' : 'opacity-100'}`}/>
                </svg>
                {isHolding && !isComplete && (
                    <span className="col-start-1 row-start-1 flex items-center justify-center text-6xl font-bold text-white pointer-events-none animate-fade-in" style={{ textShadow: '0 0 15px rgba(255,255,255,0.7)' }}>
                        {countdown}
                    </span>
                )}
            </div>
        </div>
        <div className={`absolute transition-opacity duration-500 ${ritualStep === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <div className="text-center my-6 p-6 border-y-2 border-purple-400/30 max-w-md mx-auto relative">
                <GrimoireFlourish className="absolute -top-1 left-2 w-8 h-8 text-purple-400/50" />
                <GrimoireFlourish className="absolute -top-1 right-2 w-8 h-8 text-purple-400/50 transform scale-x-[-1]" />
                <h3 className="text-2xl font-bold text-purple-300 font-serif tracking-wide">{generatedSpell.title}</h3>
                <p className="text-lg italic text-gray-400 my-4">"{generatedSpell.intention}"</p>
                <p className="font-serif text-2xl text-gray-200 whitespace-pre-line my-6 leading-loose tracking-wider" style={{textShadow: '0 0 5px rgba(253, 224, 71, 0.3)'}}>{generatedSpell.incantation}</p>
                <GrimoireFlourish className="absolute -bottom-1 left-2 w-8 h-8 text-purple-400/50 transform scale-y-[-1]" />
                <GrimoireFlourish className="absolute -bottom-1 right-2 w-8 h-8 text-purple-400/50 transform scale-x-[-1] scale-y-[-1]" />
             </div>
             <button onClick={() => setRitualStep(2)} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg mt-4">Continue</button>
        </div>
        <div className={`absolute transition-opacity duration-500 flex flex-col items-center justify-center ${ritualStep === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <p className="mb-2 text-lg text-gray-300 font-serif italic">Seal the spell.</p>
            <p className="mb-6 text-md text-gray-400">Press each element to complete the ritual.</p>
            <div className="relative w-72 h-72 my-4 mx-auto flex items-center justify-center">
                <img src={`data:image/png;base64,${generatedSpell.sigilBase64}`} alt="Fading Sigil" className={`w-48 h-48 mx-auto rounded-full transition-all duration-1000 ${pressedElements.length === 5 ? 'opacity-0 scale-150 blur-md' : 'opacity-30'}`}/>
                {elements.map((el, index) => {
                    const angleDeg = (index * 72) - 90;
                    const angleRad = (angleDeg * Math.PI) / 180;
                    const radius = 110;
                    const style = { position: 'absolute' as const, left: `calc(50% + ${radius * Math.cos(angleRad)}px)`, top: `calc(50% + ${radius * Math.sin(angleRad)}px)`, transform: 'translate(-50%, -50%)', transitionDelay: `${index * 100}ms` };
                    const elementStyle = elementStyles[el];
                    return (
                        <button key={el} style={style} onClick={() => handleElementPress(el)} disabled={pressedElements.includes(el)} className={`w-20 h-20 rounded-full font-bold transition-all duration-500 border-2 flex items-center justify-center text-sm ${elementStyle.base} ${elementStyle.shadow} ${elementStyle.border} ${elementStyle.text} ${ritualStep === 2 ? 'opacity-80 scale-100' : 'opacity-0 scale-50'} disabled:cursor-not-allowed ${pressedElements.includes(el) ? 'opacity-100 scale-110 ring-4 ring-offset-2 ring-offset-[#1a1a3d] ring-white' : 'hover:opacity-100 hover:scale-105'}`}>
                            {el}
                        </button>
                    );
                })}
            </div>
        </div>
      </div>
    );
};

const SpellGenerator: React.FC<SpellGeneratorProps> = ({ session, isSubscribed, onBack }) => {
  const [view, setView] = useState<SpellView>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookOfShadows, setBookOfShadows] = useState<Spell[]>([]);
  const [formData, setFormData] = useState<SpellFormData>({ outcome: '', target: 'Self', feeling: 'Hopeful', element: 'Spirit', timing: 'In divine timing', action: 'attract', name: '', });
  const [generatedSpell, setGeneratedSpell] = useState<GeneratedSpell | null>(null);

  const fetchData = useCallback(async () => {
    if (!isSubscribed) return;
    setLoading(true);
    try {
      const spells = await getSpells(session.user.id);
      setBookOfShadows(spells);
    } catch (err: any) {
      setError(err.message || 'Could not load your Book of Shadows.');
    } finally {
      setLoading(false);
    }
  }, [session.user.id, isSubscribed]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    // FIX: Cast target to any to safely access name and value properties without type conflicts
    const { name, value } = e.currentTarget as any; 
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateSpell = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const spell = await generateSpellAndSigil(formData);
      setGeneratedSpell(spell);

      if (isSubscribed) {
        const sigilPath = `${session.user.id}/${new Date().toISOString()}.png`;
        const sigilUrl = await uploadBase64Image(spell.sigilBase64, sigilPath);

        await saveSpell(session.user.id, {
          name: spell.title,
          intention: spell.intention,
          incantation: spell.incantation,
          sigil_url: sigilUrl,
          element: formData.element
        });
      }
      
      setView('ritual');
    } catch (err: any) {
      setError(err.message || "The ethereal planes are busy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRitualComplete = () => {
      fetchData();
      setGeneratedSpell(null);
      setFormData(prev => ({...prev, outcome: '', name: ''}));
      setView('form');
  }

  const renderForm = () => (
      <div className="animate-fade-in-up max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="text-purple-400 hover:text-purple-300">&larr; Back to Traditions</button>
            {isSubscribed && bookOfShadows.length > 0 && (
                <button onClick={() => setView('book')} className="text-purple-400 hover:text-purple-300">View Book of Shadows &rarr;</button>
            )}
        </div>
        <form onSubmit={handleGenerateSpell} className="space-y-6 bg-white/5 p-6 rounded-lg border border-white/10">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">What is your desired outcome?</label>
                <textarea name="outcome" value={formData.outcome} onChange={handleFormChange} required className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500" placeholder="e.g., Attract a new creative opportunity"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Who or what is this spell for?</label>
                <select name="target" value={formData.target} onChange={handleFormChange} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500">
                    <option className="bg-[#1a1a3d]">Self</option><option className="bg-[#1a1a3d]">Another person</option><option className="bg-[#1a1a3d]">A situation</option><option className="bg-[#1a1a3d]">An object</option><option className="bg-[#1a1a3d]">An energy</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">How do you feel about this intention?</label>
                <select name="feeling" value={formData.feeling} onChange={handleFormChange} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500">
                    <option className="bg-[#1a1a3d]">Hopeful</option><option className="bg-[#1a1a3d]">Determined</option><option className="bg-[#1a1a3d]">Passionate</option><option className="bg-[#1a1a3d]">Calm</option><option className="bg-[#1a1a3d]">Anxious</option><option className="bg-[#1a1a3d]">Wounded</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Which element feels most aligned?</label>
                <select name="element" value={formData.element} onChange={handleFormChange} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500">
                    <option className="bg-[#1a1a3d]">Spirit</option><option className="bg-[#1a1a3d]">Fire</option><option className="bg-[#1a1a3d]">Water</option><option className="bg-[#1a1a3d]">Air</option><option className="bg-[#1a1a3d]">Earth</option>
                </select>
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg">
                <WandIcon /> Generate Spell
            </button>
        </form>
      </div>
  );
    
  const renderBook = () => (
      <div className="animate-fade-in">
         <button onClick={() => setView('form')} className="mb-6 text-purple-400 hover:text-purple-300">&larr; Back to Spellcraft</button>
         <h2 className="text-3xl font-bold font-serif text-center mb-8 text-purple-300">Your Book of Shadows</h2>
         {bookOfShadows.length === 0 ? (
            <p className="text-center text-gray-400">Your Book of Shadows is empty. Cast and save spells to fill its pages.</p>
         ) : (
            <div className="space-y-6">
                {bookOfShadows.map(spell => (
                    <div key={spell.id} className="bg-white/5 p-4 rounded-lg flex items-center gap-4 border border-white/10">
                        <img src={spell.sigil_url} alt="Sigil" className="w-24 h-24 rounded-md bg-black" />
                        <div>
                            <h3 className="text-xl font-bold font-serif text-gray-200">{spell.name}</h3>
                            <p className="text-sm text-gray-400">{new Date(spell.created_at).toLocaleDateString()}</p>
                            <p className="italic text-purple-300 mt-2">"{spell.intention}"</p>
                        </div>
                    </div>
                ))}
            </div>
         )}
      </div>
  );

  const renderContent = () => {
    if (loading) return <LoadingSpinner title="Conjuring Magick..." customMessage="Focusing your intention into form..." />;
    if (error) return <div className="text-center text-red-400 p-4 bg-red-500/10 rounded-lg">{error}</div>;
    
    switch(view) {
        case 'form': return renderForm();
        case 'ritual': 
            if (!generatedSpell) return <div>Something went wrong.</div>;
            return <RitualDisplay generatedSpell={generatedSpell} onComplete={handleRitualComplete} />;
        case 'book': return renderBook();
        default: return renderForm();
    }
  }

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default SpellGenerator;