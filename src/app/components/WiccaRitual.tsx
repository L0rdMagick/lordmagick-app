// --- START OF FILE src/components/WiccaRitual.tsx ---

import React, { useState, useRef, useEffect } from 'react';
import type { GeneratedWiccanSpell, WiccanIngredient } from '../types';
import { SparklesIcon, StoneTabletButton, PentagramIcon } from './icons';
import { Sprite } from './Sprite';
import { findSprite } from '../lib/spriteLibrary';

// --- Web Audio API Sound Manager ---
const audioManager = {
    audioCtx: null as AudioContext | null,
    holdSoundNodes: null as { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null,
    convolverNode: null as ConvolverNode | null,
    wetGain: null as GainNode | null,
    dryGain: null as GainNode | null,

    _createImpulseResponse(audioCtx: AudioContext): AudioBuffer {
        const sampleRate = audioCtx.sampleRate;
        const duration = 2;
        const decay = 2.5;
        const length = sampleRate * duration;
        const impulse = audioCtx.createBuffer(2, length, sampleRate);
        for (let i = 0; i < length; i++) {
            const n = length - i;
            impulse.getChannelData(0)[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
            impulse.getChannelData(1)[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
        }
        return impulse;
    },

    init() {
        if (this.audioCtx || typeof window === 'undefined' || !(window.AudioContext || (window as any).webkitAudioContext)) return;
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.audioCtx = audioCtx;
        this.convolverNode = audioCtx.createConvolver();
        this.wetGain = audioCtx.createGain();
        this.dryGain = audioCtx.createGain();
        this.convolverNode.buffer = this._createImpulseResponse(audioCtx);
        this.convolverNode.connect(this.wetGain);
        this.wetGain.connect(audioCtx.destination);
        this.dryGain.connect(audioCtx.destination);
        this.wetGain.gain.value = 0.6;
        this.dryGain.gain.value = 0.4;
    },

    playHoldSound() {
        if (!this.audioCtx || this.holdSoundNodes) return;
        const { audioCtx, convolverNode, dryGain } = this;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.connect(gain);
        osc2.connect(gain);
        if (convolverNode && dryGain) { gain.connect(convolverNode); gain.connect(dryGain); } 
        else { gain.connect(audioCtx.destination); }
        osc1.frequency.setValueAtTime(80, audioCtx.currentTime); 
        osc1.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 13);
        osc2.frequency.setValueAtTime(120, audioCtx.currentTime);
        osc2.frequency.linearRampToValueAtTime(225, audioCtx.currentTime + 13);
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 1);
        osc1.start();
        osc2.start();
        this.holdSoundNodes = { osc1, osc2, gain };
    },

    stopHoldSound() {
        if (!this.audioCtx || !this.holdSoundNodes) return;
        const { osc1, osc2, gain } = this.holdSoundNodes;
        gain.gain.cancelScheduledValues(this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.2);
        osc1.stop(this.audioCtx.currentTime + 0.25);
        osc2.stop(this.audioCtx.currentTime + 0.25);
        this.holdSoundNodes = null;
    },
    
    playActivateSound() {
        if (!this.audioCtx) return;
        const { audioCtx, convolverNode, dryGain } = this;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        if (convolverNode && dryGain) { gain.connect(convolverNode); gain.connect(dryGain); }
        else { gain.connect(audioCtx.destination); }
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880.00, audioCtx.currentTime);
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    },
    
    playCompletionSound() {
        if (!this.audioCtx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((note, i) => {
            const osc = this.audioCtx!.createOscillator();
            const gain = this.audioCtx!.createGain();
            osc.connect(gain);
            if (this.convolverNode && this.dryGain) { gain.connect(this.convolverNode); gain.connect(this.dryGain); }
            else { gain.connect(this.audioCtx!.destination); }
            osc.type = 'sine';
            osc.frequency.value = note;
            gain.gain.setValueAtTime(0, this.audioCtx!.currentTime + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.2, this.audioCtx!.currentTime + i * 0.08 + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx!.currentTime + i * 0.08 + 1.2);
            osc.start(this.audioCtx!.currentTime + i * 0.08);
            osc.stop(this.audioCtx!.currentTime + i * 0.08 + 1.2);
        });
    }
};


interface WiccaRitualProps {
  spell: GeneratedWiccanSpell;
  onComplete: () => void;
}

const pentagramPoints = [
  { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' },
  { top: '34.5%', left: '97.5%', transform: 'translate(-50%, -50%)' },
  { top: '90.4%', left: '79.3%', transform: 'translate(-50%, -50%)' },
  { top: '90.4%', left: '20.6%', transform: 'translate(-50%, -50%)' },
  { top: '34.5%', left: '2.5%', transform: 'translate(-50%, -50%)' },
];

const InstructionCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-black/40 backdrop-blur-sm border border-purple-400/30 p-4 rounded-lg w-full max-w-md mx-auto ${className}`}>
        <h4 className="font-bold text-purple-300 font-serif mb-2">{title}</h4>
        <div className="text-sm text-gray-300 space-y-2">{children}</div>
    </div>
);

export const WiccaRitual: React.FC<WiccaRitualProps> = ({ spell, onComplete }) => {
  const [ritualStep, setRitualStep] = useState(0);
  const [placedIngredients, setPlacedIngredients] = useState<Record<number, WiccanIngredient | null>>({ 0: null, 1: null, 2: null, 3: null, 4: null });
  const [selectedIngredient, setSelectedIngredient] = useState<WiccanIngredient | null>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [traceTimer, setTraceTimer] = useState<number | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  
  const draggedIngredientRef = useRef<WiccanIngredient | null>(null);
  const traceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const traceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
      audioManager.init();
      return () => {
        if (traceTimeoutRef.current) clearTimeout(traceTimeoutRef.current);
        if (traceIntervalRef.current) clearInterval(traceIntervalRef.current);
      };
  }, []);

  const allIngredientsPlaced = Object.values(placedIngredients).every(item => item !== null);

  const handleDragStart = (ingredient: WiccanIngredient) => {
    draggedIngredientRef.current = ingredient;
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, pointIndex: number) => {
    e.preventDefault();
    audioManager.playActivateSound();
    const ingredient = draggedIngredientRef.current;
    if (ingredient && !placedIngredients[pointIndex]) {
      setPlacedIngredients(prev => ({ ...prev, [pointIndex]: ingredient }));
      draggedIngredientRef.current = null;
    }
  };

  const handleSelectIngredient = (ingredient: WiccanIngredient) => {
    audioManager.playActivateSound();
    setSelectedIngredient(prev => prev?.name === ingredient.name ? null : ingredient);
  };
  const handlePlaceIngredient = (pointIndex: number) => {
    if (selectedIngredient && !placedIngredients[pointIndex]) {
        audioManager.playActivateSound();
        setPlacedIngredients(prev => ({ ...prev, [pointIndex]: selectedIngredient }));
        setSelectedIngredient(null);
    }
  };
  
  const handleHoldStart = () => {
    if (isTracing) return;
    audioManager.playHoldSound();
    setIsTracing(true);
    setTraceTimer(1);
    
    traceIntervalRef.current = setInterval(() => {
        setTraceTimer(t => (t ? t + 1 : 1));
    }, 1000);

    traceTimeoutRef.current = setTimeout(() => {
        if(traceIntervalRef.current) clearInterval(traceIntervalRef.current);
        audioManager.stopHoldSound(); // <-- THIS IS THE FIX for the sound
        audioManager.playCompletionSound();
        setRitualStep(2);
        setTimeout(() => setShowFinale(true), 500);
    }, 13000);
  };
  const handleHoldEnd = () => {
    audioManager.stopHoldSound();
    if (traceTimeoutRef.current) clearTimeout(traceTimeoutRef.current);
    if (traceIntervalRef.current) clearInterval(traceIntervalRef.current);
    setIsTracing(false);
    setTraceTimer(null);
  };

  const renderInstructions = () => {
    switch(ritualStep) {
        case 1: 
            if (!allIngredientsPlaced) return (
                <InstructionCard title="Instructions" className="mt-8">
                    <p>Speak each ingredient's activation phrase.</p>
                    <p>Tap an ingredient to select it, then tap an empty pentagram point to place it.</p>
                </InstructionCard>
            );
            return (
                 <InstructionCard title="Instructions" className="mt-8">
                    <p>Read the central chant that has appeared.</p>
                    <p>Press and HOLD the pentagram for 13 seconds to cast the spell.</p>
                </InstructionCard>
            )
        default: return null;
    }
  };
  
  if (ritualStep === 2) {
    return (
      <div className="text-center flex flex-col items-center justify-center min-h-[500px] w-full h-full relative inset-0 bg-black animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a092d] to-black animate-smoke-in" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(49, 26, 90, 0.5) 0%, rgba(10, 9, 45, 0) 70%)' }}></div>
        {showFinale && (
          <div className="relative w-full max-w-4xl flex flex-col items-center justify-center animate-fade-in-glow p-4">
            <SparklesIcon />
            <div className="my-8 w-full max-w-2xl px-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-yellow-200 tracking-widest text-center flex flex-wrap justify-center items-center">
                {spell.affirmation.split(' ').map((word, wordIndex) => (
                  <span key={wordIndex} className="mr-4 inline-block">
                    {word.split('').map((char, charIndex) => (
                      <span key={charIndex} className="trace-letter" style={{ animationDelay: `${1 + (wordIndex * 0.3) + (charIndex * 0.05)}s` }}>
                        {char}
                      </span>
                    ))}
                  </span>
                ))}
              </h2>
            </div>
            <StoneTabletButton onClick={onComplete} className="w-48 h-16 mt-8 font-serif text-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '3s' }}>
              Done
            </StoneTabletButton>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-[600px] w-full flex flex-col items-center justify-center text-center animate-fade-in-up p-4">
      <h2 className="text-3xl font-serif text-purple-300 mb-4">{spell.title}</h2>
      
      {ritualStep === 0 && (
        <div className="flex flex-col items-center">
          <p className="font-serif text-2xl text-gray-200 whitespace-pre-line my-6 leading-loose tracking-wider max-w-lg" style={{textShadow: '0 0 5px rgba(253, 224, 71, 0.3)'}}>{spell.incantation}</p>
          <button onClick={() => { setRitualStep(1); audioManager.playActivateSound(); }} className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg mt-4 transition-transform hover:scale-105">
            Begin the Ritual
          </button>
           <InstructionCard title="Instructions" className="mt-8">
                <p>Read the incantation aloud or in your mind.</p>
                <p>Focus on your goal and press "Begin the Ritual" when you are ready.</p>
          </InstructionCard>
        </div>
      )}

      {ritualStep === 1 && (
        <div className="w-full flex flex-col items-center justify-center">
            <div className="relative w-[320px] h-[320px] sm:w-96 sm:h-96 flex items-center justify-center my-6">
                <PentagramIcon className="absolute w-full h-full text-purple-400/50" isTracing={isTracing} />
                {pentagramPoints.map((style, index) => {
                    const placedIngredient = placedIngredients[index];
                    return (
                    <div key={index} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)} onClick={() => handlePlaceIngredient(index)} className="absolute w-16 h-16 sm:w-20 sm:h-20" style={style}>
                        {placedIngredient && (
                        <div className="w-full h-full animate-fade-in flex items-center justify-center">
                            {(() => {
                                const spriteData = findSprite(placedIngredient.name);
                                if (!spriteData) return null;
                                const { sheet, itemInfo } = spriteData;
                                // --- THIS IS THE FIX for the images ---
                                return <Sprite 
                                            className="w-full h-full"
                                            sheetPath={sheet.path}
                                            x={itemInfo.x}
                                            y={itemInfo.y}
                                            spriteWidth={sheet.spriteSize.width}
                                            spriteHeight={sheet.spriteSize.height}
                                            sheetWidth={sheet.sheetSize.width}
                                            sheetHeight={sheet.sheetSize.height}
                                        />;
                            })()}
                        </div>
                        )}
                    </div>
                    );
                })}
                {allIngredientsPlaced && (
                    <div onMouseDown={handleHoldStart} onMouseUp={handleHoldEnd} onMouseLeave={handleHoldEnd} onTouchStart={handleHoldStart} onTouchEnd={handleHoldEnd} className="absolute w-full h-full flex flex-col items-center justify-center cursor-pointer select-none">
                        {traceTimer ? (<span className="text-6xl font-bold text-white pointer-events-none" style={{ textShadow: '0 0 15px rgba(255,255,255,0.7)' }}>{traceTimer}</span>) 
                        : (<div className="text-center animate-pulse"><p className="font-serif text-2xl text-yellow-200 whitespace-pre-line leading-loose tracking-wider max-w-xs" style={{textShadow: '0 0 5px #fde047'}}>{spell.central_chant}</p><p className="text-xs text-gray-400 mt-4">(Press and Hold to Cast)</p></div>)}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
                {spell.symbolic_ingredients.map(ingredient => {
                    const placedIngredientNames = Object.values(placedIngredients).filter((p): p is WiccanIngredient => p !== null).map(p => p.name);
                    const isPlaced = placedIngredientNames.includes(ingredient.name);
                    const isSelected = selectedIngredient?.name === ingredient.name;
                    const spriteData = findSprite(ingredient.name);
                    if (!spriteData) return null;
                    const { sheet, itemInfo } = spriteData;
                    return (
                        <div key={ingredient.name} draggable={!isPlaced} onDragStart={() => handleDragStart(ingredient)} onClick={() => !isPlaced && handleSelectIngredient(ingredient)} className={`flex flex-col items-center gap-2 transition-opacity ${isPlaced ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <div className={`bg-black/30 rounded-lg p-1 border border-white/20 w-20 h-20 flex items-center justify-center transition-all ${isSelected ? 'ring-2 ring-purple-400 shadow-lg' : ''}`}>
                                <Sprite 
                                    className="w-16 h-16"
                                    sheetPath={sheet.path}
                                    x={itemInfo.x}
                                    y={itemInfo.y}
                                    spriteWidth={sheet.spriteSize.width}
                                    spriteHeight={sheet.spriteSize.height}
                                    sheetWidth={sheet.sheetSize.width}
                                    sheetHeight={sheet.sheetSize.height}
                                />
                            </div>
                            <p className="text-xs text-purple-300 font-bold">{ingredient.name}</p>
                            <p className="text-xs text-gray-400 italic max-w-[80px]">"{ingredient.activation_phrase}"</p>
                        </div>
                    );
                })}
            </div>
            {renderInstructions()}
        </div>
      )}
    </div>
  );
};