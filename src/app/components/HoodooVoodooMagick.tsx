// --- START OF FILE src/app/components/HoodooVoodooMagick.tsx ---

"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session } from '@/lib/types';
// NOTE: We will create and import `generateHoodooVoodooSpell` and the new types later.
// import { generateHoodooVoodooSpell } from '@/lib/services/geminiService'; 
import MagickalBackLink from './MagickalBackLink';
import RoomsButton from './RoomsButton';
import LoadingSpinner from './LoadingSpinner';
import { Sprite } from './Sprite';
import { findSprite } from '@/lib/spriteLibrary';

// --- Configuration ---
const ASSET_PATH = "/images/Spells/HooDoo Voo Doo";
const CHARGE_DURATION = 5000; // 5 seconds for charging items
const FADE_DURATION = 0.7;

// --- Sound Utility ---
const playSound = (src: string, volume: number = 0.5, loop: boolean = false): HTMLAudioElement | null => {
    if (typeof window === 'undefined') return null;
    const audio = new Audio(src);
    audio.volume = volume;
    audio.loop = loop;
    audio.play().catch(e => console.error(`Failed to play sound: ${src}`, e));
    return audio;
};

// --- Type Definitions ---
type RitualPath = 'hoodoo' | 'voodoo' | null;
type StepComponentProps = { onNext: () => void; };

// --- Main Component ---
const HoodooVoodooMagick: React.FC<{ session: Session; isSubscribed: boolean; }> = ({ session }) => {
    const [step, setStep] = useState(0);
    const [path, setPath] = useState<RitualPath>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // ... other state variables for petition, selections, etc. will be added here

    const selectPath = (chosenPath: RitualPath) => {
        playSound('/audio/sfx-spell-room-portal.mp3', 0.3);
        setPath(chosenPath);
        setStep(1);
    };

    const advanceStep = () => {
        playSound('/audio/sfx-library-portal.mp3', 0.2);
        setStep(prev => prev + 1);
    };
    
    const renderContent = () => {
        if (loading) return <div className="flex items-center justify-center h-full"><LoadingSpinner title="Consulting the Spirits..." /></div>;
        if (error) return <div className="flex items-center justify-center h-full text-center text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>;

        if (step === 0) return <Step0_Crossroads onSelectPath={selectPath} />;

        if (path === 'hoodoo') {
            switch (step) {
                case 1: return <HoodooStep1_Ancestors onNext={advanceStep} />;
                // ... other hoodoo steps will go here
                default: return <div>Hoodoo Path Step {step}</div>;
            }
        }
        
        if (path === 'voodoo') {
            switch (step) {
                case 1: return <VoodooStep1_OpenGate onNext={advanceStep} />;
                // ... other voodoo steps will go here
                default: return <div>Voodoo Path Step {step}</div>;
            }
        }
    };

    return (
        <main className="relative h-screen w-screen bg-black bg-cover bg-center flex flex-col" style={{ backgroundImage: `url('${ASSET_PATH}/background-shack-interior.png')` }}>
            <div className="absolute inset-0 bg-black/40" />
            <header className="relative z-20 w-full p-4 md:p-6 shrink-0">
                 <div className="flex justify-between items-center flex-wrap w-full max-w-7xl mx-auto">
                    <div className="order-1"><MagickalBackLink href="/spell-room" text="All Traditions" /></div>
                    <div className="order-2 md:order-3"><RoomsButton /></div>
                    <h1 className="w-full text-center order-3 md:w-auto md:order-2 text-4xl md:text-5xl font-serif text-amber-300 mt-2 md:mt-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                        Ache
                    </h1>
                </div>
            </header>
            <div className="relative z-10 grow w-full flex flex-col items-center justify-center overflow-hidden p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${path}-${step}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: FADE_DURATION, ease: 'easeInOut' }}
                        className="w-full h-full flex flex-col items-center justify-center"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
};


// --- Step 0: Path Selection ---
const Step0_Crossroads: React.FC<{ onSelectPath: (path: RitualPath) => void }> = ({ onSelectPath }) => (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ backgroundImage: `url('${ASSET_PATH}/ui-crossroads-backdrop.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <button onClick={() => onSelectPath('hoodoo')} className="w-48 h-64 md:w-64 md:h-80 transition-transform duration-300 hover:scale-105 active:scale-95">
                <Image src={`${ASSET_PATH}/ui-button-hoodoo-path.png`} alt="Hoodoo Rootwork Path" layout="fill" objectFit="contain" />
            </button>
            <button onClick={() => onSelectPath('voodoo')} className="w-48 h-64 md:w-64 md:h-80 transition-transform duration-300 hover:scale-105 active:scale-95">
                <Image src={`${ASSET_PATH}/ui-button-voodoo-path.png`} alt="Voodoo Lwa Service Path" layout="fill" objectFit="contain" />
            </button>
        </div>
    </div>
);


// --- Hoodoo Path Components ---
const HoodooStep1_Ancestors: React.FC<StepComponentProps> = ({ onNext }) => {
    const [isLit, setIsLit] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const holdInterval = useRef<NodeJS.Timeout | null>(null);

    const handleHoldStart = () => {
        if (isLit) return;
        playSound('/audio/fire.mp3', 0.3, true);
        holdInterval.current = setInterval(() => {
            setHoldProgress(prev => {
                const next = prev + 5;
                if (next >= 100) {
                    clearInterval(holdInterval.current!);
                    setIsLit(true);
                    playSound('/audio/sfx-chaos-activate.mp3', 0.4);
                    setTimeout(onNext, 1500);
                    return 100;
                }
                return next;
            });
        }, 100);
    };

    const handleHoldEnd = () => {
        if (holdInterval.current) {
            clearInterval(holdInterval.current);
            holdInterval.current = null;
        }
         // Find a way to stop the looping fire sound
        setHoldProgress(0);
    };
    
    return (
        <div className="text-center">
            <h2 className="text-2xl font-serif text-amber-200 mb-2">Honor the Ancestors</h2>
            <p className="text-gray-300 mb-6">Press and hold the candle to light it, asking for their guidance and protection.</p>
            <div 
                className="relative w-64 h-80 mx-auto cursor-pointer select-none"
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
            >
                <Image src={`${ASSET_PATH}/hoodoo-altar-base.png`} alt="Ancestor Altar" layout="fill" objectFit="contain" />
                <AnimatePresence>
                {!isLit ? (
                     <motion.div key="unlit" className="absolute inset-0" exit={{ opacity: 0 }}>
                        <Image src={`${ASSET_PATH}/hoodoo-ancestor-candle-unlit.png`} alt="Unlit Candle" layout="fill" objectFit="contain" />
                        <div className="absolute bottom-4 left-0 w-full h-2 bg-black/30 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-amber-400" initial={{width: '0%'}} animate={{width: `${holdProgress}%`}} />
                        </div>
                     </motion.div>
                ) : (
                    <motion.div key="lit" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Image src={`${ASSET_PATH}/hoodoo-ancestor-candle-lit.gif`} alt="Lit Candle" layout="fill" objectFit="contain" unoptimized />
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </div>
    );
};


// --- Voodoo Path Components ---
const VoodooStep1_OpenGate: React.FC<StepComponentProps> = ({ onNext }) => {
    // Logic for tracing/glowing veve will go here
    useEffect(() => {
        // Placeholder to auto-advance
        const timer = setTimeout(onNext, 2000);
        return () => clearTimeout(timer);
    }, [onNext]);

    return (
        <div className="text-center">
            <h2 className="text-2xl font-serif text-amber-200 mb-2">Open the Gate</h2>
            <p className="text-gray-300 mb-6">Press and hold the vèvè to honor Papa Legba and open the way.</p>
             <div className="relative w-80 h-80 mx-auto">
                <Image src={`${ASSET_PATH}/voodoo-veve-legba.png`} alt="Papa Legba Vèvè" layout="fill" objectFit="contain" />
                {/* Add glowing/tracing animation overlay here */}
            </div>
        </div>
    );
};


export default HoodooVoodooMagick;
// --- END OF FILE ---