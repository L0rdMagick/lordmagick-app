// --- START OF FILE src/app/components/WiccaRitualFlow.tsx ---

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session, GeneratedWiccanSpell } from '@/lib/types';
import { generateWiccanSpell } from '@/lib/services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { PentagramIcon } from './icons';
import { Sprite } from './Sprite';
import { findSprite } from '@/lib/spriteLibrary';

// --- Configuration ---
const ASSET_PATH = "/images/Spells/Wicca Tradition General";
const CHARGE_DURATION_ELEMENT = 5000;
const CHARGE_DURATION_INGREDIENT = 5000;
const CAST_DURATION = 13000;

// --- Sound Utility ---
const playSound = (src: string, volume: number = 0.5, loop: boolean = false) => {
    if (typeof window === 'undefined') return null;
    const audio = new Audio(src);
    audio.volume = volume;
    audio.loop = loop;
    audio.play().catch(e => console.error(`Failed to play sound: ${src}`, e));
    return audio;
};

// --- Helper & Sub-Components ---

const Stage: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className={`absolute inset-0 flex flex-col items-center p-4 ${className}`}
    >
        {children}
    </motion.div>
);

const RitualButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; disabled?: boolean; }> = ({ onClick, children, className, disabled }) => {
    // THE FIX: Corrected the arrow function syntax from "().=>" to "() =>"
    const handleClick = () => {
        if (!disabled) {
            playSound('/audio/sfx-spell-room-portal.mp3', 0.2);
            onClick();
        }
    };
    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`px-8 py-3 bg-black/40 text-white font-serif rounded-lg border-2 border-purple-400/50 backdrop-blur-sm hover:bg-purple-900/50 hover:border-purple-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    );
};


interface ChargingElementProps {
  name: string;
  isCharged: boolean;
  onChargeComplete: (name: string) => void;
  style: React.CSSProperties;
}

const ChargingElement: React.FC<ChargingElementProps> = ({ name, isCharged, onChargeComplete, style }) => {
    const [progress, setProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const animationFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const soundRef = useRef<HTMLAudioElement | null>(null);

    const animateCharge = useCallback((timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsedTime = timestamp - startTimeRef.current;
        const chargeProgress = Math.min(elapsedTime / CHARGE_DURATION_ELEMENT, 1);
        setProgress(chargeProgress);

        if (chargeProgress < 1) {
            animationFrameRef.current = requestAnimationFrame(animateCharge);
        } else {
            soundRef.current?.pause();
            onChargeComplete(name);
        }
    }, [name, onChargeComplete]);

    const handleHoldStart = () => {
        if (isCharged) return;
        setIsHolding(true);
        soundRef.current = playSound('/audio/sfx-chaos-hold.mp3', 0.3, true);
    };

    const handleHoldEnd = () => {
        if (isCharged || !isHolding) return;
        setIsHolding(false);
        soundRef.current?.pause();
    };

    useEffect(() => {
        if (isHolding && !isCharged) {
            startTimeRef.current = performance.now();
            animationFrameRef.current = requestAnimationFrame(animateCharge);
        } else {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            startTimeRef.current = null;
            setProgress(0);
        }
        return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); soundRef.current?.pause(); };
    }, [isHolding, isCharged, animateCharge]);

    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="absolute grid place-items-center" style={style}>
            <button
                onMouseDown={handleHoldStart} onMouseUp={handleHoldEnd} onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart} onTouchEnd={handleHoldEnd}
                className={`relative w-24 h-24 rounded-full transition-all duration-300 backdrop-blur-sm flex items-center justify-center ${isCharged ? 'bg-purple-500/50 ring-2 ring-white shadow-lg shadow-purple-500/50 cursor-default' : 'bg-white/10 hover:bg-white/20'}`}
            >
                <span className="text-white font-serif capitalize text-lg">{name}</span>
            </button>
            {isHolding && !isCharged && (
                 <svg width="100" height="100" className="absolute pointer-events-none transform -rotate-90">
                    <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="transparent" />
                    <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"/>
                </svg>
            )}
        </div>
    );
};


// --- Main Component ---

export const WiccaRitualFlow: React.FC<{ session: Session; isSubscribed: boolean; onBack: () => void; }> = ({ onBack }) => {
    const [ritualStep, setRitualStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [intention, setIntention] = useState('');
    const [generatedSpell, setGeneratedSpell] = useState<GeneratedWiccanSpell | null>(null);
    
    const [chargedElements, setChargedElements] = useState<string[]>([]);
    const [selectedDeities, setSelectedDeities] = useState<string[]>([]);
    
    const [chargingIndex, setChargingIndex] = useState(0);
    const [isCharging, setIsCharging] = useState(false);
    const [chargeProgress, setChargeProgress] = useState(0);
    const [isChargeComplete, setIsChargeComplete] = useState(false);
    const chargeAnimationFrameRef = useRef<number | null>(null);
    const chargeStartTimeRef = useRef<number | null>(null);
    const chargingSoundRef = useRef<HTMLAudioElement | null>(null);

    const [isCasting, setIsCasting] = useState(false);
    const [castCountdown, setCastCountdown] = useState(0);
    const castAnimationFrameRef = useRef<number | null>(null);
    const castStartTimeRef = useRef<number | null>(null);
    
    useEffect(() => {
        return () => {
            if (chargeAnimationFrameRef.current) cancelAnimationFrame(chargeAnimationFrameRef.current);
            if (castAnimationFrameRef.current) cancelAnimationFrame(castAnimationFrameRef.current);
            chargingSoundRef.current?.pause();
        };
    }, []);
    
    useEffect(() => {
        setIsCharging(false);
        setIsChargeComplete(false);
        setChargeProgress(0);
        if (chargeAnimationFrameRef.current) cancelAnimationFrame(chargeAnimationFrameRef.current);
        chargingSoundRef.current?.pause();
    }, [chargingIndex, ritualStep]);

    const animateIngredientCharge = useCallback((timestamp: number) => {
        if (!chargeStartTimeRef.current) chargeStartTimeRef.current = timestamp;
        const elapsedTime = timestamp - chargeStartTimeRef.current;
        const progress = Math.min(elapsedTime / CHARGE_DURATION_INGREDIENT, 1);
        setChargeProgress(progress * 100);

        if (progress < 1) {
            chargeAnimationFrameRef.current = requestAnimationFrame(animateIngredientCharge);
        } else {
            setChargeProgress(100);
            setIsChargeComplete(true);
            setIsCharging(false);
            chargingSoundRef.current?.pause();
            playSound('/audio/sfx-chaos-activate.mp3', 0.4);
        }
    }, []);

    useEffect(() => {
        if (isCharging && !isChargeComplete) {
            chargeStartTimeRef.current = performance.now();
            chargeAnimationFrameRef.current = requestAnimationFrame(animateIngredientCharge);
        } else {
            if (chargeAnimationFrameRef.current) {
                cancelAnimationFrame(chargeAnimationFrameRef.current);
                chargeAnimationFrameRef.current = null;
            }
            chargeStartTimeRef.current = null;
        }
        return () => { if (chargeAnimationFrameRef.current) cancelAnimationFrame(chargeAnimationFrameRef.current); };
    }, [isCharging, isChargeComplete, animateIngredientCharge]);
    
    const handleChargeStart = () => {
        if (isChargeComplete || isCharging) return;
        setIsCharging(true);
        chargingSoundRef.current = playSound('/audio/sfx-chaos-hold.mp3', 0.3, true);
    };

    const handleChargeEnd = () => {
        if (isCharging && !isChargeComplete) {
            setIsCharging(false);
            setChargeProgress(0); 
            chargingSoundRef.current?.pause();
        }
    };
    
    const handleAdvanceAfterCharge = () => {
        playSound('/audio/sfx-spell-room-portal.mp3', 0.2);
        
        setIsChargeComplete(false);
        setChargeProgress(0);
        setIsCharging(false);

        if (chargingIndex < 4) {
            setChargingIndex(prev => prev + 1);
        } else {
            setRitualStep(prev => prev + 1);
        }
    };

    const handleGenerateSpell = async () => {
        if (!intention) { setError("Please inscribe your intention first."); return; }
        setLoading(true);
        setError(null);
        try {
            const focalPoint = selectedDeities.length > 0 ? selectedDeities.join(', ') : 'The Divine';
            const spell = await generateWiccanSpell({ intention, focalPoint, moonPhase: 'Current' });
            setGeneratedSpell(spell);
            setRitualStep(prev => prev + 1);
        } catch (err: any) {
            setError(err.message || "The spirits are busy. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleElementChargeComplete = (elementName: string) => {
        if (!chargedElements.includes(elementName)) {
            playSound('/audio/sfx-chaos-activate.mp3', 0.4); 
            setChargedElements(prev => [...prev, elementName]);
        }
    };
    
    const handleDeityToggle = (deityName: string) => {
        playSound('/audio/sfx-library-portal.mp3', 0.2);
        setSelectedDeities(prev => 
            prev.includes(deityName) 
                ? prev.filter(d => d !== deityName)
                : [...prev, deityName]
        );
    };

    const animateCast = useCallback((timestamp: number) => {
        if (!castStartTimeRef.current) castStartTimeRef.current = timestamp;
        const elapsedTime = timestamp - castStartTimeRef.current;
        
        const currentSecond = Math.min(13, Math.floor(elapsedTime / 1000) + 1);
        setCastCountdown(currentSecond);

        if (elapsedTime < CAST_DURATION) {
            castAnimationFrameRef.current = requestAnimationFrame(animateCast);
        } else {
            setCastCountdown(13);
            chargingSoundRef.current?.pause();
            playSound('/audio/sfx-chaos-explosion.mp3', 0.5);
            setRitualStep(prev => prev + 1);
            setIsCasting(false);
        }
    }, []);

    const handleCastHold = () => {
        if (isCasting) return;
        setIsCasting(true);
        chargingSoundRef.current = playSound('/audio/sfx-chaos-hold.mp3', 0.4, true);
        castStartTimeRef.current = performance.now();
        castAnimationFrameRef.current = requestAnimationFrame(animateCast);
    };

    const handleCastRelease = () => {
        if (!isCasting) return;
        setIsCasting(false);
        setCastCountdown(0);
        chargingSoundRef.current?.pause();
        if (castAnimationFrameRef.current) {
            cancelAnimationFrame(castAnimationFrameRef.current);
            castAnimationFrameRef.current = null;
        }
        castStartTimeRef.current = null;
    };
    
    const SVG_SIZE = 160;
    const STROKE_WIDTH = 8;
    const RADIUS = (SVG_SIZE / 2) - (STROKE_WIDTH / 2);
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    const strokeDashoffset = CIRCUMFERENCE * (1 - chargeProgress / 100);

    const renderContent = () => {
        if (loading) return <LoadingSpinner title="Weaving the Spell..." customMessage="Gathering ancient energies for your ritual..." />;
        if (error) return (
            <div className="text-center text-red-400 p-4 bg-red-500/10 rounded-lg">
                <p>{error}</p>
                <button onClick={() => { setError(null); setRitualStep(1); }} className="mt-4 text-white underline">Try Again</button>
            </div>
        );

        return (
            <AnimatePresence mode="wait">
                <div key={ritualStep} className="relative w-full h-full">
                    {/* THE FIX: Updated entire block for step 0 to match visual target */}
                    {ritualStep === 0 && (
                        <Stage className="justify-between pt-10 sm:pt-4">
                            <div className="w-full flex flex-col items-center">
                                <div className="relative w-full max-w-lg aspect-4/5">
                                    <Image src={`${ASSET_PATH}/wicca_intro_instructions.png`} fill style={{ objectFit: 'contain' }} alt="Wicca Instructions" priority />
                                    <div
                                        className="absolute flex items-center justify-center text-center pointer-events-none"
                                        style={{
                                            left: '50%', top: '28%', width: '55%', height: '15%', transform: 'translateX(-50%)'
                                        }}
                                    >
                                        <h2 className="text-2xl sm:text-3xl font-serif text-gray-200" style={{ textShadow: '0 0 8px rgba(0, 0, 0, 0.5)' }}>
                                            Wiccan Spellcraft
                                        </h2>
                                    </div>
                                    <div
                                        className="absolute text-center pointer-events-none flex items-center justify-center p-4"
                                        style={{
                                            left: '50%', top: '60%', width: '60%', height: '45%', transform: 'translate(-50%, -50%)'
                                        }}
                                    >
                                        <p className="text-base md:text-lg text-gray-200 leading-relaxed">
                                            Work with nature, the moon, and ancient energies to manifest your will. Follow the steps to craft your spell.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <RitualButton onClick={() => setRitualStep(1)} className="shrink-0 mb-10 relative z-10">Continue</RitualButton>
                        </Stage>
                    )}
                    {ritualStep === 1 && (
                        <Stage className="justify-start pt-8 md:justify-center md:pt-0">
                            <div className="w-full grow flex flex-col items-center justify-center">
                                <div className="relative w-full max-w-lg aspect-4/5">
                                    <Image src={`${ASSET_PATH}/wicca_scroll_intention.png`} fill style={{ objectFit: 'contain' }} alt="Inscribe Intention" />
                                    <div 
                                        className="absolute flex flex-col items-center justify-center text-center p-4"
                                        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60%', height: '55%' }}
                                    >
                                        <h3 className="font-serif text-xl md:text-2xl text-[#4a2e1c] mb-2 md:mb-4">Inscribe Your Intention</h3>
                                        <textarea
                                            value={intention}
                                            onChange={(e) => setIntention(e.target.value)}
                                            placeholder="e.g. To find clarity on my career path"
                                            className="w-full h-3/5 bg-transparent text-center text-[#4a2e1c] text-base sm:text-lg md:text-xl font-serif focus:outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <RitualButton onClick={() => setRitualStep(2)} disabled={!intention} className="shrink-0 mb-4 relative z-10">Seal My Intention</RitualButton>
                        </Stage>
                    )}
                     {ritualStep === 2 && (
                        <Stage className="justify-center">
                            <h3 className="text-2xl font-serif text-amber-200 mb-4">Hold Each Symbol to Invoke</h3>
                            <div className="relative w-full max-w-md aspect-square">
                                {['Spirit', 'Air', 'Fire', 'Earth', 'Water'].map((el, i) => {
                                    const positions = [
                                        { top: '5%', left: '50%', transform: 'translate(-50%, -50%)' }, { top: '40%', left: '95%', transform: 'translate(-50%, -50%)' },
                                        { top: '90%', left: '80%', transform: 'translate(-50%, -50%)' }, { top: '90%', left: '20%', transform: 'translate(-50%, -50%)' },
                                        { top: '40%', left: '5%', transform: 'translate(-50%, -50%)' },
                                    ];
                                    return (
                                        <ChargingElement 
                                            key={el} name={el} isCharged={chargedElements.includes(el)}
                                            onChargeComplete={handleElementChargeComplete} style={positions[i]}
                                        />
                                    );
                                })}
                            </div>
                             {chargedElements.length === 5 && <RitualButton onClick={() => setRitualStep(3)} className="mt-8 animate-pulse">Continue</RitualButton>}
                        </Stage>
                    )}
                    {ritualStep === 3 && (
                        <Stage className="justify-center">
                            <h3 className="text-3xl font-serif text-amber-200 mb-8">Invoke a Guiding Deity or Force</h3>
                            <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-8">
                                {[
                                    { name: 'Triple Goddess', img: 'wicca_deity_triple_goddess.png' }, { name: 'Horned God', img: 'wicca_deity_horned_god.png' },
                                    { name: 'Divine Source', img: 'wicca_deity_divine_source.png' }
                                ].map(deity => {
                                    const isSelected = selectedDeities.includes(deity.name);
                                    return (
                                        <div key={deity.name} onClick={() => handleDeityToggle(deity.name)} className="text-center cursor-pointer group">
                                            <div className={`relative w-48 h-48 transition-all duration-300 transform ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                                                <Image src={`${ASSET_PATH}/${deity.img}`} fill style={{ objectFit: 'contain' }} alt={deity.name} className={`transition-all duration-300 ${isSelected ? 'brightness-110' : 'brightness-75 group-hover:brightness-100'}`} />
                                                <div className={`absolute inset-0 rounded-full ring-2 transition-all duration-300 ${isSelected ? 'ring-purple-400 ring-offset-4 ring-offset-black/20' : 'ring-transparent'}`} />
                                            </div>
                                            <p className={`mt-2 text-lg font-serif transition-colors duration-300 ${isSelected ? 'text-purple-300' : 'text-gray-400 group-hover:text-white'}`}>{deity.name}</p>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="mt-12 flex flex-col sm:flex-row gap-4">
                                <RitualButton onClick={handleGenerateSpell}>
                                    Confirm Invocation
                                </RitualButton>
                                <RitualButton onClick={handleGenerateSpell} className="bg-black/20 border-gray-600/50 hover:bg-gray-800/50">
                                    Continue without Deity
                                </RitualButton>
                            </div>
                        </Stage>
                    )}
                    {ritualStep === 4 && generatedSpell && (
                        <Stage className="justify-center">
                            <div className='text-center'>
                                <h3 className="text-2xl font-serif text-amber-200 mb-2">The Spirits Guide Your Choice</h3>
                                <p className="text-gray-300 mb-6">These components have been chosen for your intention.</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 bg-black/30 p-4 rounded-lg">
                                    {generatedSpell.symbolic_ingredients.map(ingredient => {
                                        const spriteData = findSprite(ingredient.name);
                                        if (!spriteData) return <div key={ingredient.name} className="w-24 h-24 border border-dashed border-gray-600 rounded-md flex items-center justify-center text-xs text-center text-gray-400">Missing: <br/>{ingredient.name}</div>;
                                        return (
                                            <div key={ingredient.name} className="flex flex-col items-center gap-2">
                                                <div className="w-24 h-24 bg-white/5 rounded-lg p-1">
                                                    <Sprite 
                                                        sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y}
                                                        spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height}
                                                        sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height}
                                                    />
                                                </div>
                                                <p className="text-sm text-center font-semibold text-purple-300">{ingredient.name}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <RitualButton onClick={() => setRitualStep(5)} className="mt-8">Prepare Components</RitualButton>
                            </div>
                        </Stage>
                    )}
                    {ritualStep === 5 && generatedSpell && (
                         <Stage className="justify-center">
                            <div className="relative w-full h-full">
                                <Image src={`${ASSET_PATH}/wicca_charge_ingredient_template.png`} fill style={{ objectFit: 'contain' }} alt="Charge Ingredient" />
                                <p className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full text-center font-serif text-2xl">
                                    {isChargeComplete ? 'Component Charged!' : `Hold to Charge the ${generatedSpell.symbolic_ingredients[chargingIndex].name}`}
                                </p>
                                
                                <div
                                    onMouseDown={handleChargeStart} onMouseUp={handleChargeEnd} onMouseLeave={handleChargeEnd}
                                    onTouchStart={handleChargeStart} onTouchEnd={handleChargeEnd}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 grid place-items-center cursor-pointer select-none"
                                >
                                    <div className={`absolute inset-0 w-full h-full transition-transform duration-300 ${isCharging ? 'scale-110' : 'scale-100'}`}>
                                        {(() => {
                                            const ingredient = generatedSpell.symbolic_ingredients[chargingIndex];
                                            const spriteData = findSprite(ingredient.name);
                                            if (!spriteData) return null;
                                            return <Sprite 
                                                sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y}
                                                spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height}
                                                sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height}
                                            />;
                                        })()}
                                    </div>
                                    <svg width={SVG_SIZE} height={SVG_SIZE} className="absolute inset-0 transform -rotate-90 pointer-events-none">
                                        <circle cx={SVG_SIZE/2} cy={SVG_SIZE/2} r={RADIUS} stroke="rgba(192, 132, 252, 0.2)" strokeWidth={STROKE_WIDTH} fill="transparent" />
                                        <circle cx={SVG_SIZE/2} cy={SVG_SIZE/2} r={RADIUS} stroke="white" strokeWidth={STROKE_WIDTH} fill="transparent" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={`transition-opacity duration-300 ${isChargeComplete || !isCharging ? 'opacity-0' : 'opacity-100'}`}/>
                                    </svg>
                                </div>
                                
                                {isChargeComplete && (
                                    <RitualButton onClick={handleAdvanceAfterCharge} className="absolute bottom-[15%] left-1/2 -translate-x-1/2 animate-pulse">
                                        {chargingIndex < 4 ? 'Charge Next Component' : 'Continue to Incantation'}
                                    </RitualButton>
                                )}
                            </div>
                        </Stage>
                    )}
                    {ritualStep === 6 && generatedSpell && (
                        <Stage className="justify-center">
                            <div className="w-full grow flex flex-col items-center justify-center">
                                <div className="relative w-full max-w-lg aspect-4/5">
                                    <Image src={`${ASSET_PATH}/wicca_incantation_scroll.png`} fill style={{ objectFit: 'contain' }} alt="Incantation" />
                                    <div 
                                        className="absolute text-center flex flex-col justify-center items-center p-4"
                                        style={{
                                            top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '65%', height: '50%',
                                        }}
                                    >
                                        <h3 className="font-serif text-xl sm:text-2xl text-[#4a2e1c] mb-4">Recite the Incantation</h3>
                                        <p className="font-serif text-base sm:text-xl text-[#4a2e1c] whitespace-pre-line leading-relaxed">{generatedSpell.central_chant}</p>
                                    </div>
                                </div>
                            </div>
                            <RitualButton onClick={() => setRitualStep(7)} className="shrink-0 mb-4 relative z-10">Ready to Cast</RitualButton>
                        </Stage>
                    )}
                    {ritualStep === 7 && generatedSpell && (
                        <Stage className="justify-center">
                            <div className="w-full grow flex flex-col items-center justify-center">
                               <div
                                    onMouseDown={handleCastHold} onMouseUp={handleCastRelease} onMouseLeave={handleCastRelease}
                                    onTouchStart={handleCastHold} onTouchEnd={handleCastRelease}
                                    className="relative w-full max-w-md aspect-square cursor-pointer flex items-center justify-center"
                                >
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
                                        return <div key={i} className="absolute w-16 h-16 pointer-events-none" style={positions[i]}>
                                            <Sprite 
                                                sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y}
                                                spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height}
                                                sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height}
                                            />
                                        </div>
                                    })}
                                    {isCasting && castCountdown > 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-7xl font-bold text-white animate-ping" style={{ textShadow: '0 0 20px white', animationIterationCount: '1', animationDelay: `${(castCountdown - 1) % 1}s` }}>
                                                {castCountdown}
                                            </span>
                                        </div>
                                    )}
                                    <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-5 font-serif text-xl pointer-events-none text-center">Hold to Focus Your Will and Cast the Spell</p>
                                </div>
                            </div>
                        </Stage>
                    )}
                    {ritualStep === 8 && generatedSpell && (
                         <Stage className="justify-center">
                             <div className="w-full grow flex flex-col items-center justify-center">
                                <div className="relative w-full max-w-2xl aspect-square">
                                    <Image src={`${ASSET_PATH}/wicca_spell_manifestation.png`} fill style={{ objectFit: 'contain' }} alt="Spell Manifestation" />
                                    <div 
                                        className="absolute text-center text-white font-serif flex items-center justify-center p-4"
                                        style={{
                                            left: '50%', top: '55%', width: '45%', height: '40%', transform: 'translate(-50%, -50%)'
                                        }}
                                    >
                                        <p className="text-2xl sm:text-3xl md:text-4xl">
                                         {generatedSpell.affirmation}
                                        </p>
                                    </div>
                                </div>
                             </div>
                            <RitualButton onClick={onBack} className="shrink-0 mb-4 relative z-10">Return to Spell Room</RitualButton>
                         </Stage>
                    )}
                </div>
            </AnimatePresence>
        );
    };

    return (
        <div className="w-full h-full">
            {renderContent()}
        </div>
    );
};