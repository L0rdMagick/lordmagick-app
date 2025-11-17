// --- START OF FILE src/app/components/HoodooVoodooMagick.tsx ---

"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session } from '@/lib/types';
import { generateHoodooVoodooWork } from '@/lib/services/geminiService'; 
import MagickalBackLink from './MagickalBackLink';
import RoomsButton from './RoomsButton';
import LoadingSpinner from './LoadingSpinner';
import { Sprite } from './Sprite';
import { findSprite } from '@/lib/spriteLibrary';

// --- Configuration ---
const ASSET_PATH = "/images/Spells/HooDoo Voo Doo";
const CHARGE_DURATION = 3000; // 3 seconds
const FADE_DURATION = 0.8;

// --- Sound Utility ---
const playSound = (src: string, volume: number = 0.5, loop: boolean = false): { play: () => void; stop: () => void; } => {
    if (typeof window === 'undefined') return { play: () => {}, stop: () => {} };
    const audio = new Audio(src);
    audio.volume = volume;
    audio.loop = loop;
    const play = () => audio.play().catch(e => console.error(`Failed to play sound: ${src}`, e));
    const stop = () => {
        audio.pause();
        audio.currentTime = 0;
    };
    return { play, stop };
};

// --- Type Definitions ---
type RitualPath = 'hoodoo' | 'voodoo' | null;
interface StepComponentProps { onNext: () => void; }
interface StepContainerProps { stageTitle?: string; instruction?: string; children: React.ReactNode; button?: React.ReactNode; }
interface RitualButtonProps { onClick: () => void; children: React.ReactNode; className?: string; disabled?: boolean; }

// --- Main Component ---
const HoodooVoodooMagick: React.FC<{ session: Session; isSubscribed: boolean; }> = ({ session }) => {
    const [step, setStep] = useState(0);
    const [path, setPath] = useState<RitualPath>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    // State for ritual data
    const [petition, setPetition] = useState('');
    const [hoodooPsalmSelections, setHoodooPsalmSelections] = useState<string[]>([]);
    const [selectedPsalm, setSelectedPsalm] = useState<string>('');
    const [hoodooMateriaSelections, setHoodooMateriaSelections] = useState<string[]>([]);
    const [selectedLwa, setSelectedLwa] = useState<string>('');
    const [voodooOfferingSelections, setVoodooOfferingSelections] = useState<string[]>([]);
    const [finalAffirmation, setFinalAffirmation] = useState('');

    const resetState = () => {
        setStep(0);
        setPath(null);
        setPetition('');
        setHoodooPsalmSelections([]);
        setSelectedPsalm('');
        setHoodooMateriaSelections([]);
        setSelectedLwa('');
        setVoodooOfferingSelections([]);
        setFinalAffirmation('');
    };

    const selectPath = (chosenPath: RitualPath) => {
        playSound('/audio/sfx-spell-room-portal.mp3', 0.3).play();
        setPath(chosenPath);
        setStep(1);
    };

    const advanceStep = () => {
        playSound('/audio/sfx-library-portal.mp3', 0.2).play();
        setStep(prev => prev + 1);
    };

    const handleHoodooPsalmSearch = async () => {
        if (!petition) { setError("You must write a petition first."); return; }
        setLoading(true); setLoadingMessage("Consulting the scriptures...");
        try {
            const result = await generateHoodooVoodooWork('hoodoo', 3, { petition });
            setHoodooPsalmSelections(result.selections);
            advanceStep();
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    const handleHoodooMateriaSearch = async () => {
        if (!selectedPsalm) { setError("You must select a Psalm verse."); return; }
        setLoading(true); setLoadingMessage("Gathering your materia...");
        try {
            const result = await generateHoodooVoodooWork('hoodoo', 4, { petition });
            setHoodooMateriaSelections(result.selections);
            advanceStep();
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    const handleVoodooOfferingSearch = async () => {
        if (!selectedLwa) { setError("You must serve a Lwa."); return; }
        setLoading(true); setLoadingMessage("Preparing your offerings...");
        try {
            const result = await generateHoodooVoodooWork('voodoo', 4, { petition, lwa: selectedLwa });
            setVoodooOfferingSelections(result.selections);
            advanceStep();
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    const renderContent = () => {
        if (loading) return <div className="flex items-center justify-center h-full"><LoadingSpinner title={loadingMessage || "Consulting the Spirits..."} /></div>;
        if (error) return <div className="flex items-center justify-center h-full text-center text-red-400 p-4 bg-red-900/50 rounded-lg"><p>{error}</p><button onClick={() => setError(null)} className="mt-2 underline font-bold">Try Again</button></div>;

        if (step === 0) return <Step0_Crossroads onSelectPath={selectPath} />;

        if (path === 'hoodoo') {
            switch (step) {
                case 1: return <HoodooStep1_Ancestors onNext={advanceStep} />;
                case 2: return <HoodooStep2_Petition petition={petition} setPetition={setPetition} onNext={handleHoodooPsalmSearch} />;
                case 3: return <HoodooStep3_FindVerse selections={hoodooPsalmSelections} onSelect={setSelectedPsalm} onNext={handleHoodooMateriaSearch} />;
                case 4: return <HoodooStep4_GatherMateria selections={hoodooMateriaSelections} onNext={advanceStep} />;
                case 5: return <div>Hoodoo Step 5: Fix the Jar</div>;
                case 6: return <div>Hoodoo Step 6: Set the Light</div>;
                case 7: return <div>Hoodoo Step 7: The Work is Done</div>;
                default: return <div onClick={resetState}>Invalid Step</div>;
            }
        }
        
        if (path === 'voodoo') {
            switch (step) {
                case 1: return <VoodooStep1_OpenGate onNext={advanceStep} />;
                case 2: return <VoodooStep2_StateNeed petition={petition} setPetition={setPetition} onNext={advanceStep} />;
                case 3: return <VoodooStep3_ServeLwa onSelect={setSelectedLwa} onNext={handleVoodooOfferingSearch} />;
                case 4: return <VoodooStep4_PrepareOffering selections={voodooOfferingSelections} onNext={advanceStep} />;
                case 5: return <div>Voodoo Step 5: Make the Offering</div>;
                case 6: return <div>Voodoo Step 6: Present the Offering</div>;
                case 7: return <div>Voodoo Step 7: The Lwa is Served</div>;
                default: return <div onClick={resetState}>Invalid Step</div>;
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

// --- Reusable UI Building Blocks ---
const RitualButton: React.FC<RitualButtonProps> = ({ onClick, children, className, disabled }) => (
    <button onClick={onClick} disabled={disabled} className={`px-8 py-3 bg-black/50 text-white font-serif rounded-lg border-2 border-amber-400/50 backdrop-blur-sm hover:bg-amber-900/50 hover:border-amber-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

const StepContainer: React.FC<StepContainerProps> = ({ stageTitle, instruction, children, button }) => (
    <div className="w-full h-full flex flex-col items-center justify-between gap-2 py-1">
        <div className="shrink-0 flex flex-col items-center justify-center text-center px-4 min-h-24 h-auto py-2 z-20 relative">
             {stageTitle && <h2 className="text-3xl font-serif text-amber-200/90">{stageTitle}</h2>}
             {instruction && <p className="text-base text-amber-100/80 mt-2 italic font-light max-w-2xl leading-tight whitespace-pre-line" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>{instruction}</p>}
        </div>
        <div className="w-full grow min-h-0 relative flex items-center justify-center z-10">
            {children}
        </div>
        <div className="h-[60px] shrink-0 flex items-center justify-center z-20">
            {button}
        </div>
    </div>
);


// --- Step 0: Path Selection ---
const Step0_Crossroads: React.FC<{ onSelectPath: (path: RitualPath) => void }> = ({ onSelectPath }) => (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ backgroundImage: `url('${ASSET_PATH}/ui-crossroads-backdrop.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <button onClick={() => onSelectPath('hoodoo')} className="relative w-48 h-64 md:w-64 md:h-80 transition-transform duration-300 hover:scale-105 active:scale-95">
                <Image src={`${ASSET_PATH}/ui-button-hoodoo-path.png`} alt="Hoodoo Rootwork Path" layout="fill" objectFit="contain" />
            </button>
            <button onClick={() => onSelectPath('voodoo')} className="relative w-48 h-64 md:w-64 md:h-80 transition-transform duration-300 hover:scale-105 active:scale-95">
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
    const fireSound = useMemo(() => playSound('/audio/fire.mp3', 0.3, true), []);

    const handleHoldStart = () => {
        if (isLit) return;
        fireSound.play();
        const startTime = Date.now();
        holdInterval.current = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min((elapsedTime / CHARGE_DURATION) * 100, 100);
            setHoldProgress(progress);
            if (progress >= 100) {
                clearInterval(holdInterval.current!);
                fireSound.stop();
                setIsLit(true);
                playSound('/audio/sfx-chaos-activate.mp3', 0.4).play();
                setTimeout(onNext, 1500);
            }
        }, 50);
    };
    const handleHoldEnd = () => {
        if (holdInterval.current) clearInterval(holdInterval.current);
        fireSound.stop();
        setHoldProgress(0);
    };

    return (
        <StepContainer stageTitle="Honor the Ancestors" instruction="Press and hold the candle to light it, asking for their guidance and protection.">
            <div onMouseDown={handleHoldStart} onMouseUp={handleHoldEnd} onMouseLeave={handleHoldEnd} onTouchStart={handleHoldStart} onTouchEnd={handleHoldEnd} className="relative w-64 h-80 mx-auto cursor-pointer select-none">
                <Image src={`${ASSET_PATH}/hoodoo-altar-base.png`} alt="Ancestor Altar" layout="fill" objectFit="contain" />
                <AnimatePresence>
                {!isLit ? (
                     <motion.div key="unlit" className="absolute inset-0" exit={{ opacity: 0 }}>
                        <Image src={`${ASSET_PATH}/hoodoo-ancestor-candle-unlit.png`} alt="Unlit Candle" layout="fill" objectFit="contain" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-black/30 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-amber-400" initial={{width: '0%'}} animate={{width: `${holdProgress}%`}} transition={{duration: 0.05}}/>
                        </div>
                     </motion.div>
                ) : (
                    <motion.div key="lit" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Image src={`${ASSET_PATH}/hoodoo-ancestor-candle-lit.gif`} alt="Lit Candle" layout="fill" objectFit="contain" unoptimized />
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </StepContainer>
    );
};

const HoodooStep2_Petition: React.FC<{ petition: string; setPetition: (val: string) => void; onNext: () => void; }> = ({ petition, setPetition, onNext }) => (
    <StepContainer stageTitle="Write Your Petition" instruction="State your intention for this Work. Be clear and direct." button={<RitualButton onClick={onNext} disabled={!petition}>Find a Verse</RitualButton>}>
        <div className="relative w-full max-w-md aspect-square @container mx-auto">
            <Image src={`${ASSET_PATH}/hoodoo-petition-paper.png`} alt="Petition Paper" layout="fill" objectFit="contain" />
            <div className="absolute p-4" style={{ left: '15%', top: '25%', width: '70%', height: '50%' }}>
                <textarea value={petition} onChange={(e) => setPetition(e.target.value)} placeholder="e.g., To draw money to me for my rent." className="w-full h-full bg-transparent text-center text-[#4a2e1c] font-serif focus:outline-none resize-none" style={{ fontSize: 'clamp(0.6rem, 4cqw, 1.5rem)' }} />
            </div>
        </div>
    </StepContainer>
);

const HoodooStep3_FindVerse: React.FC<{ selections: string[]; onSelect: (val: string) => void; onNext: () => void; }> = ({ selections, onSelect, onNext }) => (
    <StepContainer stageTitle="Find Your Verse" instruction="The spirits have guided you to these scriptures. Choose one to anchor your Work." button={<RitualButton onClick={onNext}>Gather Your Materia</RitualButton>}>
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-around gap-4">
            {selections.map(psalm => (
                <div key={psalm} onClick={() => onSelect(psalm)} className="relative w-64 aspect-4/3 cursor-pointer group">
                    <Image src={`${ASSET_PATH}/ui-psalm-book.png`} alt="Book of Psalms" layout="fill" objectFit="contain" />
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <p className="text-center font-serif text-xl text-gray-800 group-hover:text-black">{psalm}</p>
                    </div>
                </div>
            ))}
        </div>
    </StepContainer>
);

const HoodooStep4_GatherMateria: React.FC<{ selections: string[]; onNext: () => void; }> = ({ selections, onNext }) => (
     <StepContainer stageTitle="Gather Your Materia" instruction="These ingredients have been chosen for your petition." button={<RitualButton onClick={onNext}>Fix the Jar</RitualButton>}>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 bg-black/30 p-4 rounded-lg">
            {selections.map(item => {
                const spriteData = findSprite(item);
                if (!spriteData) return <div key={item} className="text-xs text-red-400">Missing:<br/>{item}</div>;
                return (
                    <div key={item} className="flex flex-col items-center gap-2">
                        <div className="w-20 h-20 bg-white/5 rounded-lg p-1"><Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} /></div>
                        <p className="text-xs text-center font-semibold text-amber-200">{item}</p>
                    </div>
                );
            })}
        </div>
    </StepContainer>
);

// --- Voodoo Path Components ---
const VoodooStep1_OpenGate: React.FC<StepComponentProps> = ({ onNext }) => {
    // Placeholder - will add tracing/glowing logic later
    useEffect(() => { const timer = setTimeout(onNext, 2000); return () => clearTimeout(timer); }, [onNext]);
    return (
        <StepContainer stageTitle="Open the Gate" instruction="Honor Papa Legba and open the way to the spirit world.">
            <div className="relative w-80 h-80 mx-auto animate-pulse">
                <Image src={`${ASSET_PATH}/voodoo-veve-legba.png`} alt="Papa Legba Vèvè" layout="fill" objectFit="contain" />
            </div>
        </StepContainer>
    );
};

const VoodooStep2_StateNeed: React.FC<{ petition: string; setPetition: (val: string) => void; onNext: () => void; }> = ({ petition, setPetition, onNext }) => (
    <StepContainer stageTitle="State Your Need" instruction="Clearly present your petition to the spirits." button={<RitualButton onClick={onNext} disabled={!petition}>Serve the Lwa</RitualButton>}>
        <div className="relative w-full max-w-md aspect-square @container mx-auto">
            <Image src={`${ASSET_PATH}/voodoo-petition-scroll.png`} alt="Petition Scroll" layout="fill" objectFit="contain" />
            <div className="absolute p-4" style={{ left: '22%', top: '30%', width: '56%', height: '40%' }}>
                <textarea value={petition} onChange={(e) => setPetition(e.target.value)} placeholder="e.g., I ask for protection on my journey." className="w-full h-full bg-transparent text-center text-[#4a2e1c] font-serif focus:outline-none resize-none" style={{ fontSize: 'clamp(0.6rem, 4cqw, 1.5rem)' }} />
            </div>
        </div>
    </StepContainer>
);

const VoodooStep3_ServeLwa: React.FC<{ onSelect: (lwa: string) => void; onNext: () => void; }> = ({ onSelect, onNext }) => {
    const lwas = [
        { name: 'Erzulie Freda', img: 'voodoo-veve-erzulie-freda.png'},
        { name: 'Ogun', img: 'voodoo-veve-ogun.png'},
        { name: 'Damballah', img: 'voodoo-veve-damballah.png'},
        { name: 'Baron Samedi', img: 'voodoo-veve-baron-samedi.png'},
    ];
    return (
        <StepContainer stageTitle="Serve the Lwa" instruction="Choose the Lwa whose domain aligns with your need." button={<RitualButton onClick={onNext}>Prepare Offerings</RitualButton>}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lwas.map(lwa => (
                    <div key={lwa.name} onClick={() => onSelect(lwa.name)} className="flex flex-col items-center gap-2 cursor-pointer group p-2">
                        <div className="relative w-28 h-28 md:w-36 md:h-36 bg-black/20 p-2 rounded-full border-2 border-transparent group-hover:border-amber-300 transition-colors">
                             <Image src={`${ASSET_PATH}/${lwa.img}`} alt={lwa.name} layout="fill" objectFit="contain" className="brightness-75 group-hover:brightness-125 transition-all"/>
                        </div>
                        <p className="font-serif text-gray-300 group-hover:text-amber-200">{lwa.name}</p>
                    </div>
                ))}
            </div>
        </StepContainer>
    );
};

const VoodooStep4_PrepareOffering: React.FC<{ selections: string[]; onNext: () => void; }> = ({ selections, onNext }) => (
     <StepContainer stageTitle="Prepare the Offering" instruction="These gifts have been chosen for the Lwa you serve." button={<RitualButton onClick={onNext}>Make the Offering</RitualButton>}>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 bg-black/30 p-4 rounded-lg">
            {selections.map(item => {
                const spriteData = findSprite(item);
                if (!spriteData) return <div key={item} className="text-xs text-red-400">Missing:<br/>{item}</div>;
                return (
                    <div key={item} className="flex flex-col items-center gap-2">
                        <div className="w-20 h-20 bg-white/5 rounded-lg p-1"><Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} /></div>
                        <p className="text-xs text-center font-semibold text-amber-200">{item}</p>
                    </div>
                );
            })}
        </div>
    </StepContainer>
);

export default HoodooVoodooMagick;
// --- END OF FILE ---