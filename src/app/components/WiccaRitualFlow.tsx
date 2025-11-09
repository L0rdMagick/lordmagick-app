// --- START OF FILE src/app/components/WiccaRitualFlow.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session, GeneratedWiccanSpell, WiccanIngredient } from '@/lib/types';
import { generateWiccanSpell } from '@/lib/services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { PentagramIcon } from './icons';
import { Sprite } from './Sprite';
import { findSprite } from '@/lib/spriteLibrary';

// --- Integrated Sound Manager ---
const audioManager = {
    audioCtx: null as AudioContext | null,
    init() {
        if (!this.audioCtx && typeof window !== 'undefined') {
            try {
                this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser.", e);
            }
        }
    },
    playActivateSound() {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, this.audioCtx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.5);
    },
    playCompletionSound() {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, this.audioCtx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 1);
    },
};

// --- Reusable Hold-to-Interact Component ---
const HoldButton: React.FC<{
    onComplete: () => void;
    holdTime?: number;
    isComplete: boolean;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}> = ({ onComplete, holdTime = 5000, isComplete, children, className, style }) => {
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const progressRef = useRef(0);

    const handleHoldStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (isComplete) return;
        audioManager.init();
        intervalRef.current = setInterval(() => {
            progressRef.current += 50; // Update interval
            const newProgress = (progressRef.current / holdTime) * 100;
            setProgress(newProgress);
            if (progressRef.current >= holdTime) {
                handleHoldEnd(true);
            }
        }, 50);
    };

    const handleHoldEnd = (completed = false) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (completed) {
            setProgress(100);
            audioManager.playCompletionSound();
            onComplete();
        } else {
            setProgress(0);
        }
        progressRef.current = 0;
    };

    const circumference = 2 * Math.PI * 45; // For a 100x100 SVG
    const strokeDashoffset = circumference * (1 - progress / 100);

    return (
        <div 
            onMouseDown={handleHoldStart} onMouseUp={() => handleHoldEnd(false)} onMouseLeave={() => handleHoldEnd(false)}
            onTouchStart={handleHoldStart} onTouchEnd={() => handleHoldEnd(false)}
            className={`relative flex items-center justify-center cursor-pointer select-none ${className}`} style={style}
        >
            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="transparent" />
                <motion.circle
                    cx="50" cy="50" r="45" stroke="white" strokeWidth="4" fill="transparent"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                />
            </svg>
            {children}
        </div>
    );
};


const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="absolute inset-0 flex flex-col items-center justify-center p-4"
    >
        {children}
    </motion.div>
);

const RitualButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; disabled?: boolean; }> = ({ onClick, children, className, disabled }) => (
    <button
        onClick={() => { audioManager.init(); audioManager.playActivateSound(); onClick(); }}
        disabled={disabled}
        className={`px-8 py-3 bg-black/40 text-white font-serif rounded-lg border-2 border-purple-400/50 backdrop-blur-sm hover:bg-purple-900/50 hover:border-purple-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

// --- Main Component ---

export const WiccaRitualFlow: React.FC<{ session: Session; isSubscribed: boolean; onBack: () => void; }> = ({ onBack }) => {
    const [ritualStep, setRitualStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [intention, setIntention] = useState('');
    const [generatedSpell, setGeneratedSpell] = useState<GeneratedWiccanSpell | null>(null);
    const [invokedElements, setInvokedElements] = useState<string[]>([]);
    const [selectedDeity, setSelectedDeity] = useState<string | null>(null);
    const [chargedIngredients, setChargedIngredients] = useState<string[]>([]);
    const [isCasting, setIsCasting] = useState(false);
    const castTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const ASSET_PATH = "/images/Spells/Wicca Tradition General";

    useEffect(() => {
        return () => {
            if (castTimeoutRef.current) clearTimeout(castTimeoutRef.current);
        };
    }, []);

    const handleGenerateSpell = async () => {
        if (!intention) { setError("Please inscribe your intention first."); return; }
        setLoading(true); setError(null);
        try {
            const spell = await generateWiccanSpell({ intention, focalPoint: selectedDeity || 'The Divine', moonPhase: 'Current' });
            setGeneratedSpell(spell);
            setRitualStep(prev => prev + 1);
        } catch (err: any) {
            setError(err.message || "The spirits are busy. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleElementInvoke = (element: string) => {
        if (!invokedElements.includes(element)) {
            setInvokedElements(prev => [...prev, element]);
        }
    };

    const handleIngredientCharge = (ingredientName: string) => {
        if (!chargedIngredients.includes(ingredientName)) {
            setChargedIngredients(prev => [...prev, ingredientName]);
        }
    };

    const handleCastHold = () => {
        setIsCasting(true);
        castTimeoutRef.current = setTimeout(() => {
            setIsCasting(false);
            setRitualStep(prev => prev + 1);
            audioManager.playCompletionSound();
        }, 13000);
    };

    const handleCastRelease = () => {
        setIsCasting(false);
        if (castTimeoutRef.current) clearTimeout(castTimeoutRef.current);
    };

    const renderContent = () => {
        if (loading) return <LoadingSpinner customMessage="Consulting the energies..." />;
        if (error) return (
            <div className="text-center text-red-400 p-4 bg-red-500/10 rounded-lg">
                <p>{error}</p>
                <button onClick={() => { setError(null); setRitualStep(1); }} className="mt-4 text-white underline">Try Again</button>
            </div>
        );

        return (
            <AnimatePresence mode="wait">
                <div key={ritualStep} className="relative w-full h-full flex flex-col">
                    {ritualStep === 0 && (
                        <Stage>
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <div className="relative w-full grow max-h-[80vh]">
                                    <Image src={`${ASSET_PATH}/wicca_intro_instructions.png`} fill style={{ objectFit: 'contain' }} alt="Wicca Instructions" priority />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] max-w-md text-center pointer-events-none">
                                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-purple-200 mb-4 sm:mb-6" style={{ textShadow: '0 0 10px rgba(192, 132, 252, 0.5)' }}>Wiccan Spellcraft</h2>
                                        <p className="text-base sm:text-lg text-gray-300 leading-relaxed">Work with nature, the moon, and ancient energies to manifest your will. Follow the steps to craft your spell.</p>
                                    </div>
                                </div>
                                <RitualButton onClick={() => setRitualStep(1)} className="shrink-0 mt-4">Continue</RitualButton>
                            </div>
                        </Stage>
                    )}
                    {ritualStep === 1 && (
                        <Stage>
                             <Image src={`${ASSET_PATH}/wicca_scroll_intention.png`} fill style={{ objectFit: 'contain' }} alt="Inscribe Intention" />
                            <textarea value={intention} onChange={(e) => setIntention(e.target.value)} placeholder="e.g. To find clarity on my career path" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[35%] h-[15%] bg-transparent text-center text-[#4a2e1c] text-xl font-serif focus:outline-none resize-none" />
                            <RitualButton onClick={() => setRitualStep(2)} disabled={!intention} className="absolute bottom-[20%]">Seal My Intention</RitualButton>
                        </Stage>
                    )}
                    {ritualStep === 2 && (
                        <Stage>
                            <div className="text-center mb-4">
                                <h3 className="text-2xl font-serif text-amber-200">Invoke the Elements</h3>
                                <p className="text-gray-400">Hold each element to call it forth.</p>
                            </div>
                            <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                                {['Spirit', 'Air', 'Fire', 'Water', 'Earth'].map((el, i) => {
                                    const angle = (i * 72) - 90;
                                    const radius = window.innerWidth < 640 ? 100 : 120;
                                    const x = radius * Math.cos(angle * Math.PI / 180);
                                    const y = radius * Math.sin(angle * Math.PI / 180);
                                    const isInvoked = invokedElements.includes(el);
                                    return (
                                        <HoldButton key={el} onComplete={() => handleElementInvoke(el)} isComplete={isInvoked} className="absolute w-24 h-24 rounded-full" style={{ top: `calc(50% + ${y}px - 48px)`, left: `calc(50% + ${x}px - 48px)`}}>
                                            <div className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-300 ${isInvoked ? 'bg-purple-500/50 ring-2 ring-white shadow-lg shadow-purple-500/50' : 'bg-white/10'}`}>
                                                <span className="text-white font-serif">{el}</span>
                                            </div>
                                        </HoldButton>
                                    );
                                })}
                            </div>
                            {invokedElements.length === 5 && <RitualButton onClick={() => setRitualStep(3)} className="mt-6 animate-pulse">Continue</RitualButton>}
                        </Stage>
                    )}
                    {ritualStep === 3 && (
                        <Stage>
                            <Image src={`${ASSET_PATH}/wicca_invoke_deity.png`} fill style={{ objectFit: 'contain' }} alt="Invoke Deity"/>
                            <div className="absolute top-[55%] w-[60%] h-[20%] flex justify-around">
                                {['Triple Goddess', 'Horned God', 'Divine Source'].map(deity => (<button key={deity} onClick={() => { setSelectedDeity(deity); audioManager.playActivateSound(); }} className={`w-1/3 h-full rounded-lg transition-all duration-300 ${selectedDeity === deity ? 'bg-purple-500/30 ring-2 ring-white' : 'bg-transparent hover:bg-white/10'}`} />))}
                            </div>
                            <RitualButton onClick={handleGenerateSpell} disabled={!selectedDeity} className="absolute bottom-[10%]">Confirm Invocation</RitualButton>
                        </Stage>
                    )}
                    {ritualStep === 4 && generatedSpell && (
                        <Stage>
                            <div className='text-center'>
                                <h3 className="text-2xl font-serif text-amber-200 mb-2">Charge the Components</h3>
                                <p className="text-gray-400 mb-6">Hold each component for 5 seconds to imbue it.</p>
                                <div className="grid grid-cols-5 gap-2 sm:gap-4 bg-black/30 p-4 rounded-lg">
                                    {generatedSpell.symbolic_ingredients.map(ingredient => {
                                        const spriteData = findSprite(ingredient.name);
                                        const isCharged = chargedIngredients.includes(ingredient.name);
                                        if (!spriteData) return <div key={ingredient.name} className="w-20 h-20 sm:w-24 sm:h-24 text-xs text-center text-gray-400">Missing:<br/>{ingredient.name}</div>;
                                        return (
                                            <div key={ingredient.name} className="flex flex-col items-center gap-2">
                                                <HoldButton onComplete={() => handleIngredientCharge(ingredient.name)} isComplete={isCharged} className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg">
                                                    <div className={`w-full h-full bg-white/5 rounded-lg p-1 transition-all duration-300 ${isCharged ? 'opacity-50' : 'opacity-100'}`}>
                                                        <Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} />
                                                    </div>
                                                </HoldButton>
                                                <p className="text-xs sm:text-sm font-semibold text-purple-300">{ingredient.name}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                                {chargedIngredients.length === 5 && <RitualButton onClick={() => setRitualStep(5)} className="mt-8 animate-pulse">Continue to Incantation</RitualButton>}
                            </div>
                        </Stage>
                    )}
                    {ritualStep === 5 && generatedSpell && (
                        <Stage>
                            <Image src={`${ASSET_PATH}/wicca_incantation_scroll.png`} fill style={{ objectFit: 'contain' }} alt="Incantation" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[#4a2e1c] font-serif text-xl sm:text-2xl w-1/2 whitespace-pre-line">{generatedSpell.incantation}</div>
                            <RitualButton onClick={() => setRitualStep(6)} className="absolute bottom-[20%]">Ready to Cast</RitualButton>
                        </Stage>
                    )}
                    {ritualStep === 6 && generatedSpell && (
                        <Stage>
                           <div onMouseDown={handleCastHold} onMouseUp={handleCastRelease} onMouseLeave={handleCastRelease} onTouchStart={handleCastHold} onTouchEnd={handleCastRelease} className="relative w-80 h-80 sm:w-96 sm:h-96 cursor-pointer flex items-center justify-center">
                                <Image src={`${ASSET_PATH}/wicca_pentagram_ready_to_cast.png`} fill style={{ objectFit: 'contain' }} alt="Cast the Spell" />
                                <PentagramIcon className="absolute w-full h-full text-white pointer-events-none" isTracing={isCasting} />
                                {generatedSpell.symbolic_ingredients.map((ing, i) => {
                                    const spriteData = findSprite(ing.name);
                                    if(!spriteData) return null;
                                    const positions = [
                                        { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' }, { top: '34.5%', left: '97.5%', transform: 'translate(-50%, -50%)' },
                                        { top: '90.4%', left: '79.3%', transform: 'translate(-50%, -50%)' }, { top: '90.4%', left: '20.6%', transform: 'translate(-50%, -50%)' },
                                        { top: '34.5%', left: '2.5%', transform: 'translate(-50%, -50%)' },
                                    ];
                                    return (
                                        <div key={i} className="absolute w-12 h-12 sm:w-16 sm:h-16 pointer-events-none" style={positions[i]}>
                                            <Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} />
                                        </div>
                                    )
                                })}
                            </div>
                            <p className="font-serif text-xl pointer-events-none text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[50%]">Hold to Focus<br/>Your Will</p>
                        </Stage>
                    )}
                    {ritualStep === 7 && generatedSpell && (
                         <Stage>
                             <Image src={`${ASSET_PATH}/wicca_spell_manifestation.png`} fill style={{ objectFit: 'contain' }} alt="Spell Manifestation" />
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white font-serif text-3xl sm:text-4xl w-1/2">{generatedSpell.affirmation}</div>
                            <RitualButton onClick={onBack} className="absolute bottom-[25%]">Return to Spell Room</RitualButton>
                         </Stage>
                    )}
                </div>
            </AnimatePresence>
        );
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            {renderContent()}
        </div>
    );
};