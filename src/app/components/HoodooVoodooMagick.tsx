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
const SENDING_DURATION = 13000; // 13 seconds for the sending animation

// --- Data ---
const PSALM_DATABASE: Record<string, string> = {
    "Psalm 23": "The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me. Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over. Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.",
    "Psalm 91": "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the Lord, He is my refuge and my fortress: my God; in him will I trust. Surely he shall deliver thee from the snare of the fowler, and from the noisome pestilence. He shall cover thee with his feathers, and under his wings shalt thou trust: his truth shall be thy shield and buckler. Thou shalt not be afraid for the terror by night; nor for the arrow that flieth by day; Nor for the pestilence that walketh in darkness; nor for the destruction that wasteth at noonday.",
    "Psalm 51": "Have mercy upon me, O God, according to thy lovingkindness: according unto the multitude of thy tender mercies blot out my transgressions. Wash me throughly from mine iniquity, and cleanse me from my sin. For I acknowledge my transgressions: and my sin is ever before me. Create in me a clean heart, O God; and renew a right spirit within me. Cast me not away from thy presence; and take not thy holy spirit from me. Restore unto me the joy of thy salvation; and uphold me with thy free spirit.",
    "Psalm 37": "Fret not thyself because of evildoers, neither be thou envious against the workers of iniquity. For they shall soon be cut down like the grass, and wither as the green herb. Trust in the Lord, and do good; so shalt thou dwell in the land, and verily thou shalt be fed. Delight thyself also in the Lord: and he shall give thee the desires of thine heart. Commit thy way unto the Lord; trust also in him; and he shall bring it to pass.",
    "Psalm 7": "O Lord my God, in thee do I put my trust: save me from all them that persecute me, and deliver me: Lest he tear my soul like a lion, rending it in pieces, while there is none to deliver. O Lord my God, if I have done this; if there be iniquity in my hands; Arise, O Lord, in thine anger, lift up thyself because of the rage of mine enemies: and awake for me to the judgment that thou hast commanded. The Lord shall judge the people: judge me, O Lord, according to my righteousness, and according to mine integrity that is in me."
};

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
type SpriteData = NonNullable<ReturnType<typeof findSprite>>;
type MateriaSelection = { name: string; incantation: string; };

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
    const [isPsalmLit, setIsPsalmLit] = useState(false);
    const [hoodooMateriaSelections, setHoodooMateriaSelections] = useState<MateriaSelection[]>([]);
    const [selectedLwa, setSelectedLwa] = useState<string>('');
    const [voodooOfferingSelections, setVoodooOfferingSelections] = useState<MateriaSelection[]>([]);
    const [finalAffirmation, setFinalAffirmation] = useState('');
    const [chargingIndex, setChargingIndex] = useState(0);
    
    const [psalmReaderOpen, setPsalmReaderOpen] = useState(false);

    const handleOpenPsalmReader = (psalm: string) => {
        setSelectedPsalm(psalm);
        setIsPsalmLit(false);
        setPsalmReaderOpen(true);
    };

    const resetState = () => {
        setStep(0); setPath(null); setPetition(''); setHoodooPsalmSelections([]);
        setSelectedPsalm(''); setIsPsalmLit(false); setHoodooMateriaSelections([]); setSelectedLwa('');
        setVoodooOfferingSelections([]); setFinalAffirmation(''); setChargingIndex(0);
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
        if (!selectedPsalm || !isPsalmLit) { setError("You must select and fix a Psalm verse."); return; }
        setLoading(true); setLoadingMessage("Gathering your materia...");
        try {
            const result = await generateHoodooVoodooWork('hoodoo', 4, { petition });
            setHoodooMateriaSelections(result.selections);
            advanceStep();
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };
    
    const handleHoodooFinalStep = async () => {
        setLoading(true); setLoadingMessage("Sealing the Work...");
        try {
            const result = await generateHoodooVoodooWork('hoodoo', 7, { petition });
            setFinalAffirmation(result.affirmation);
            advanceStep();
        } catch(err: any) { setError(err.message); } finally { setLoading(false); }
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

    const handleVoodooFinalStep = async () => {
        setLoading(true); setLoadingMessage("Presenting the offering...");
        try {
            const result = await generateHoodooVoodooWork('voodoo', 7, { petition, lwa: selectedLwa });
            setFinalAffirmation(result.affirmation);
            advanceStep();
        } catch(err: any) { setError(err.message); } finally { setLoading(false); }
    };

    const handleChargeNext = () => {
        const limit = path === 'hoodoo' ? hoodooMateriaSelections.length : voodooOfferingSelections.length;
        if (chargingIndex < limit - 1) {
            setChargingIndex(prev => prev + 1);
        } else {
            advanceStep();
        }
    };

    const renderContent = () => {
        if (loading) return <div className="flex items-center justify-center h-full"><LoadingSpinner title={loadingMessage || "Consulting the Spirits..."} /></div>;
        if (error) return <div className="flex items-center justify-center h-full text-center text-red-400 p-4 bg-red-900/50 rounded-lg"><p>{error}</p><button onClick={() => setError(null)} className="mt-2 underline font-bold">Try Again</button></div>;

        if (step === 0) return <Step0_Crossroads onSelectPath={selectPath} />;

        if (path === 'hoodoo') {
            switch (step) {
                case 1: return <HoodooStep1_Ancestors onNext={advanceStep} />;
                case 2: return <HoodooStep2_Petition petition={petition} setPetition={setPetition} onNext={handleHoodooPsalmSearch} />;
                case 3: return <HoodooStep3_FindVerse onOpenReader={handleOpenPsalmReader} selections={hoodooPsalmSelections} selectedPsalm={selectedPsalm} isPsalmLit={isPsalmLit} onNext={handleHoodooMateriaSearch} />;
                case 4: return <HoodooStep4_GatherMateria selections={hoodooMateriaSelections} onNext={advanceStep} />;
                case 5: return <HoodooStep5_FixJar key={`charge-hoodoo-${chargingIndex}`} onNext={handleChargeNext} selections={hoodooMateriaSelections} index={chargingIndex} />;
                case 6: return <HoodooStep6_SetLight onNext={advanceStep} petition={petition} selections={hoodooMateriaSelections} />;
                case 7: return <Step7_Sending onNext={handleHoodooFinalStep} petition={petition} />;
                case 8: return <Step8_Manifestation affirmation={finalAffirmation} path={path} onFinish={resetState} />;
                default: return <div onClick={resetState}>Invalid Step</div>;
            }
        }
        
        if (path === 'voodoo') {
            switch (step) {
                case 1: return <VoodooStep1_OpenGate onNext={advanceStep} />;
                case 2: return <VoodooStep2_StateNeed petition={petition} setPetition={setPetition} onNext={advanceStep} />;
                case 3: return <VoodooStep3_ServeLwa selectedLwa={selectedLwa} onSelect={setSelectedLwa} onNext={handleVoodooOfferingSearch} />;
                case 4: return <VoodooStep4_PrepareOffering selections={voodooOfferingSelections} onNext={advanceStep} />;
                case 5: return <VoodooStep5_MakeOffering key={`charge-voodoo-${chargingIndex}`} onNext={handleChargeNext} selections={voodooOfferingSelections} index={chargingIndex} />;
                case 6: return <VoodooStep6_PresentOffering onNext={handleVoodooFinalStep} lwa={selectedLwa} selections={voodooOfferingSelections} />;
                case 7: return <Step8_Manifestation affirmation={finalAffirmation} path={path} onFinish={resetState} />;
                default: return <div onClick={resetState}>Invalid Step</div>;
            }
        }
    };

    const currentBackground = step === 0 
        ? `${ASSET_PATH}/ui-crossroads-backdrop.png` 
        : `${ASSET_PATH}/background-shack-interior.png`;

    return (
        <>
            <PsalmReader 
                isOpen={psalmReaderOpen} 
                onClose={() => setPsalmReaderOpen(false)} 
                psalmName={selectedPsalm} 
                psalmText={PSALM_DATABASE[selectedPsalm] || ""} 
                onBless={() => { setIsPsalmLit(true); setPsalmReaderOpen(false); }}
            />
            <main className="relative h-screen w-screen bg-black bg-cover bg-center flex flex-col transition-all duration-1000" style={{ backgroundImage: `url('${currentBackground}')` }}>
                <div className="absolute inset-0 bg-black/40" />
                <header className={`relative z-20 w-full p-4 md:p-6 shrink-0 transition-opacity duration-500 ${psalmReaderOpen ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex justify-between items-center flex-wrap w-full max-w-7xl mx-auto">
                        <div className="order-1"><MagickalBackLink href="/spell-room" text="All Traditions" /></div>
                        <div className="order-2 md:order-3"><RoomsButton /></div>
                        <h1 className="w-full text-center order-3 md:w-auto md:order-2 text-4xl md:text-5xl font-serif text-amber-300 mt-2 md:mt-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                            Ache
                        </h1>
                    </div>
                </header>
                <div className={`relative z-10 grow w-full flex flex-col items-center justify-center overflow-hidden p-4 transition-opacity duration-500 ${psalmReaderOpen ? 'opacity-0' : 'opacity-100'}`}>
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
        </>
    );
};

// --- Reusable UI Building Blocks ---
const RitualButton: React.FC<RitualButtonProps> = ({ onClick, children, className, disabled }) => (
    <button onClick={onClick} disabled={disabled} className={`px-8 py-3 bg-black/50 text-white font-serif rounded-lg border-2 border-amber-400/50 backdrop-blur-sm hover:bg-amber-900/50 hover:border-amber-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

const StepContainer: React.FC<StepContainerProps> = ({ stageTitle, instruction, children, button }) => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 py-1">
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

// --- CHARGING COMPONENT ---
const ChargingComponent: React.FC<{
    onCharge: () => void, 
    children: React.ReactNode, 
    isCharged: boolean, 
    duration?: number,
    onHoldStart?: () => void,
    onHoldEnd?: () => void
}> = ({ onCharge, children, isCharged, duration = CHARGE_DURATION, onHoldStart, onHoldEnd }) => {
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout|null>(null);
    const soundRef = useRef(playSound('/audio/sfx-chaos-hold.mp3', 0.2, true));

    const handleHoldStart = () => {
        if (isCharged) return;
        if (onHoldStart) onHoldStart();
        soundRef.current.play();
        const startTime = Date.now();
        intervalRef.current = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const currentProgress = Math.min((elapsedTime / duration) * 100, 100);
            setProgress(currentProgress);
            if (currentProgress >= 100) {
                clearInterval(intervalRef.current!);
                soundRef.current.stop();
                playSound('/audio/sfx-chaos-activate.mp3', 0.3).play();
                onCharge();
            }
        }, 50);
    };
    const handleHoldEnd = () => {
        if (onHoldEnd) onHoldEnd();
        if (intervalRef.current) clearInterval(intervalRef.current);
        soundRef.current.stop();
        if (!isCharged) setProgress(0);
    };

    return (
        <div 
            onMouseDown={handleHoldStart} 
            onMouseUp={handleHoldEnd} 
            onMouseLeave={handleHoldEnd} 
            onTouchStart={handleHoldStart} 
            onTouchEnd={handleHoldEnd} 
            onContextMenu={(e) => e.preventDefault()}
            className="relative grid place-items-center cursor-pointer select-none"
        >
            <div className={`transition-transform duration-300 ${progress > 0 || isCharged ? 'scale-110' : ''}`}>{children}</div>
            <svg className="absolute w-full h-full" viewBox="0 0 100 100" style={{transform: 'rotate(-90deg) scale(1.2)'}}>
                <motion.circle cx="50" cy="50" r="48" stroke="rgba(251, 191, 36, 1)" strokeWidth="4" fill="transparent" strokeLinecap="round" pathLength="1" strokeDasharray="1" initial={{strokeDashoffset: 1}} animate={{strokeDashoffset: isCharged ? 0 : 1 - (progress/100)}} transition={{duration: 0.05}}/>
            </svg>
        </div>
    );
};


// --- Step 0: Path Selection ---
const Step0_Crossroads: React.FC<{ onSelectPath: (path: RitualPath) => void }> = ({ onSelectPath }) => (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
        <div className="relative z-10 flex flex-row items-center justify-center gap-4 md:gap-16">
            <button onClick={() => onSelectPath('hoodoo')} className="relative w-40 h-56 md:w-64 md:h-80 transition-transform duration-300 hover:scale-105 active:scale-95">
                <Image src={`${ASSET_PATH}/ui-button-hoodoo-path.png`} alt="Hoodoo Rootwork Path" layout="fill" objectFit="contain" />
            </button>
            <button onClick={() => onSelectPath('voodoo')} className="relative w-40 h-56 md:w-64 md:h-80 transition-transform duration-300 hover:scale-105 active:scale-95">
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
    const incantation = "I call to my ancestors, known and unknown, to witness and bless this sacred working.";

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
            }
        }, 50);
    };
    const handleHoldEnd = () => {
        if (holdInterval.current) clearInterval(holdInterval.current);
        fireSound.stop();
        if(!isLit) setHoldProgress(0);
    };

    return (
        <StepContainer stageTitle="Honor the Ancestors" instruction={holdProgress > 0 || isLit ? incantation : "Press and hold the candle to light it, and say the conjuration on the screen as you do."} button={isLit && <RitualButton onClick={onNext} className="animate-pulse">Continue</RitualButton>}>
            <div onMouseDown={handleHoldStart} onMouseUp={handleHoldEnd} onMouseLeave={handleHoldEnd} onTouchStart={handleHoldStart} onTouchEnd={handleHoldEnd} onContextMenu={(e) => e.preventDefault()} className="relative w-64 h-80 mx-auto cursor-pointer select-none">
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

const HoodooStep3_FindVerse: React.FC<{ onOpenReader: (psalm: string) => void; selections: string[]; selectedPsalm: string; isPsalmLit: boolean; onNext: () => void; }> = ({ onOpenReader, selections, selectedPsalm, isPsalmLit, onNext }) => {
    return (
        <StepContainer 
            stageTitle="Find Your Verse" 
            instruction="The spirits have guided you to these scriptures. Choose one to read and fix for your Work." 
            button={<RitualButton onClick={onNext} disabled={!isPsalmLit}>Gather Your Materia</RitualButton>}
        >
            <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-start md:justify-around gap-4 h-full max-h-[50vh] md:max-h-none overflow-y-auto md:overflow-visible p-4">
                {selections.map(psalm => (
                    <div key={psalm} onClick={() => onOpenReader(psalm)} className={`relative w-64 aspect-4/3 cursor-pointer group transition-all duration-300 shrink-0 ${selectedPsalm === psalm ? 'scale-105' : 'scale-100'}`}>
                        <Image src={`${ASSET_PATH}/ui-psalm-book.png`} alt="Book of Psalms" layout="fill" objectFit="contain" />
                        <div className={`absolute inset-0 flex items-center justify-center p-8 rounded-lg transition-colors ${selectedPsalm === psalm ? 'bg-amber-300/20' : ''}`}>
                            <p className={`text-center font-serif text-xl group-hover:text-black ${selectedPsalm === psalm ? 'text-black font-bold' : 'text-gray-800'}`}>{psalm}</p>
                        </div>
                        {isPsalmLit && selectedPsalm === psalm && <div className="absolute top-2 right-2 w-8 h-8 bg-red-800 rounded-full flex items-center justify-center text-yellow-300 text-xs font-bold ring-2 ring-yellow-300">✓</div>}
                    </div>
                ))}
            </div>
        </StepContainer>
    );
};

const HoodooStep4_GatherMateria: React.FC<{ selections: MateriaSelection[]; onNext: () => void; }> = ({ selections, onNext }) => (
     <StepContainer stageTitle="Gather Your Materia" instruction="These ingredients have been chosen for your petition." button={<RitualButton onClick={onNext}>Fix the Jar</RitualButton>}>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 bg-black/30 p-4 rounded-lg">
            {selections.map(item => {
                const spriteData = findSprite(item.name);
                if (!spriteData) return <div key={item.name} className="text-xs text-red-400">Missing:<br/>{item.name}</div>;
                return (
                    <div key={item.name} className="flex flex-col items-center gap-2">
                        <div className="w-20 h-20 bg-white/5 rounded-lg p-1"><Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} /></div>
                        <p className="text-xs text-center font-semibold text-amber-200">{item.name}</p>
                    </div>
                );
            })}
        </div>
    </StepContainer>
);

const useIngredientPositions = (itemCount: number, itemsPerRow: number = 3) => {
    return useMemo(() => {
        const positions = [];
        for (let i = 0; i < itemCount; i++) {
            const row = Math.floor(i / itemsPerRow);
            const col = i % itemsPerRow;

            let left = (col + 0.5) * (100 / itemsPerRow);
            let bottom = (row * 15) + 5; 

            left += (Math.random() - 0.5) * 10;
            bottom += (Math.random() - 0.5) * 5;
            
            left = Math.max(10, Math.min(90, left));
            bottom = Math.max(5, Math.min(80, bottom));

            positions.push({
                left: `${left}%`,
                bottom: `${bottom}%`,
                transform: `translateX(-50%) rotate(${(Math.random() - 0.5) * 30}deg)`,
                zIndex: i,
            });
        }
        return positions;
    }, [itemCount, itemsPerRow]);
};

const HOODOO_CONTAINER_STYLE = {
    width: '24.22%', height: '38.38%', left: '35.84%', top: '35.55%',
};

const HoodooStep5_FixJar: React.FC<{ onNext: () => void, selections: MateriaSelection[], index: number }> = ({ onNext, selections, index }) => {
    const [isCharged, setIsCharged] = useState(false);
    const currentMateria = selections[index];
    const spriteData = findSprite(currentMateria.name);
    
    const chargedItems = useMemo(() => selections.slice(0, index), [selections, index]);
    const itemPositions = useIngredientPositions(selections.length);

    const instructionText = isCharged 
        ? `The ${currentMateria.name} is charged.\n"${currentMateria.incantation}"`
        : `Charge the ${currentMateria.name}, speaking its incantation:\n"${currentMateria.incantation}"`;

    return (
        <StepContainer stageTitle="Fix the Jar" instruction={instructionText} button={isCharged ? <RitualButton onClick={onNext} className="animate-pulse">{index < selections.length - 1 ? "Next Ingredient" : "Set the Light"}</RitualButton> : <div/>}>
            <div className="relative w-full h-full max-w-md aspect-square mx-auto">
                <div className="absolute pointer-events-none z-10" style={HOODOO_CONTAINER_STYLE}>
                    {chargedItems.map((item, i) => {
                        const itemSprite = findSprite(item.name);
                        if (!itemSprite) return null;
                        return (
                            <div key={`charged-${i}`} className="absolute w-[35%]" style={itemPositions[i]}>
                                <Sprite sheetPath={itemSprite.sheet.path} x={itemSprite.itemInfo.x} y={itemSprite.itemInfo.y} spriteWidth={itemSprite.sheet.spriteSize.width} spriteHeight={itemSprite.sheet.spriteSize.height} sheetWidth={itemSprite.sheet.sheetSize.width} sheetHeight={itemSprite.sheet.sheetSize.height} />
                            </div>
                        );
                    })}
                    <AnimatePresence>
                        {isCharged && (
                            <motion.div
                                key={`current-${index}`}
                                className="absolute w-[35%]"
                                style={itemPositions[index]}
                                initial={{ y: -200, opacity: 0, scale: 1.5 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                            >
                                {spriteData && <Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} />}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <Image src={`${ASSET_PATH}/hoodoo-jar-empty.png`} alt="Empty Spell Jar" layout="fill" objectFit="contain" className="relative z-0 pointer-events-none" />
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2/3 z-20">
                    <AnimatePresence>
                    {!isCharged && (
                        <motion.div exit={{ scale: 0.5, opacity: 0 }}>
                            <ChargingComponent onCharge={() => setIsCharged(true)} isCharged={isCharged}>
                                {spriteData && <div className="w-24 h-24"><Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} /></div>}
                            </ChargingComponent>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            </div>
        </StepContainer>
    );
};

const HoodooStep6_SetLight: React.FC<{ onNext: () => void; petition: string; selections: MateriaSelection[] }> = ({ onNext, petition, selections }) => {
    const [isLit, setIsLit] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const incantation = "With this flame, I set the light; make my work burn ever bright.";
    const itemPositions = useIngredientPositions(selections.length);
    
    const instructionText = (isHolding || isLit) ? incantation : "Light the candle to activate the spell and send your intention.";
    
    return(
        <StepContainer stageTitle="Set the Light" instruction={instructionText} button={isLit && <RitualButton onClick={onNext} className="animate-pulse">Set the Work in Motion</RitualButton>}>
            <div className="relative w-72 h-96">
                <ChargingComponent 
                    onCharge={() => setIsLit(true)} 
                    isCharged={isLit}
                    onHoldStart={() => setIsHolding(true)}
                    onHoldEnd={() => setIsHolding(false)}
                >
                    <div className="relative w-72 h-96">
                        <div className="absolute pointer-events-none z-10" style={HOODOO_CONTAINER_STYLE}>
                             {selections.map((item, i) => {
                                const itemSprite = findSprite(item.name);
                                if (!itemSprite) return null;
                                return (
                                    <div key={`final-charged-${i}`} className="absolute w-[35%]" style={itemPositions[i]}>
                                        <Sprite sheetPath={itemSprite.sheet.path} x={itemSprite.itemInfo.x} y={itemSprite.itemInfo.y} spriteWidth={itemSprite.sheet.spriteSize.width} spriteHeight={itemSprite.sheet.spriteSize.height} sheetWidth={itemSprite.sheet.sheetSize.width} sheetHeight={itemSprite.sheet.sheetSize.height} />
                                    </div>
                                );
                            })}
                        </div>
                        
                        <Image src={`${ASSET_PATH}/hoodoo-jar-fixed.png`} alt="Fixed Jar" layout="fill" objectFit="contain" className="relative z-0 pointer-events-none"/>
                        
                        <div className="absolute inset-0 z-20 pointer-events-none">
                            {!isLit ? 
                                <Image src={`${ASSET_PATH}/hoodoo-vigil-candle-unlit.png`} alt="Unlit Vigil Candle" layout="fill" objectFit="contain" /> :
                                <Image src={`${ASSET_PATH}/hoodoo-vigil-candle-lit.gif`} alt="Lit Vigil Candle" layout="fill" objectFit="contain" unoptimized />
                            }
                        </div>
                    </div>
                </ChargingComponent>
            </div>
        </StepContainer>
    );
};


// --- Voodoo Path Components ---

const VOODOO_CONTAINER_STYLE = {
    width: '29.98%', height: '41.50%', left: '31.64%', top: '39.75%',
};

const VoodooStep1_OpenGate: React.FC<StepComponentProps> = ({ onNext }) => {
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

const VoodooStep3_ServeLwa: React.FC<{ selectedLwa: string; onSelect: (lwa: string) => void; onNext: () => void; }> = ({ selectedLwa, onSelect, onNext }) => {
    const lwas = [
        { name: 'Erzulie Freda', img: 'voodoo-veve-erzulie-freda.png'},
        { name: 'Ogun', img: 'voodoo-veve-ogun.png'},
        { name: 'Damballah', img: 'voodoo-veve-damballah.png'},
        { name: 'Baron Samedi', img: 'voodoo-veve-baron-samedi.png'},
    ];
    return (
        <StepContainer stageTitle="Serve the Lwa" instruction="Choose the Lwa whose domain aligns with your need." button={<RitualButton onClick={onNext} disabled={!selectedLwa}>Prepare Offerings</RitualButton>}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lwas.map(lwa => (
                    <div key={lwa.name} onClick={() => onSelect(lwa.name)} className="flex flex-col items-center gap-2 cursor-pointer group p-2">
                        <div className={`relative w-28 h-28 md:w-36 md:h-36 bg-black/20 p-2 rounded-full border-2 transition-colors ${selectedLwa === lwa.name ? 'border-amber-300' : 'border-transparent group-hover:border-amber-300/50'}`}>
                             <Image src={`${ASSET_PATH}/${lwa.img}`} alt={lwa.name} layout="fill" objectFit="contain" className={`transition-all ${selectedLwa === lwa.name ? 'brightness-125' : 'brightness-75 group-hover:brightness-110'}`}/>
                        </div>
                        <p className={`font-serif transition-colors ${selectedLwa === lwa.name ? 'text-amber-200' : 'text-gray-300 group-hover:text-white'}`}>{lwa.name}</p>
                    </div>
                ))}
            </div>
        </StepContainer>
    );
};

const VoodooStep4_PrepareOffering: React.FC<{ selections: MateriaSelection[]; onNext: () => void; }> = ({ selections, onNext }) => (
     <StepContainer stageTitle="Prepare the Offering" instruction="These gifts have been chosen for the Lwa you serve." button={<RitualButton onClick={onNext}>Make the Offering</RitualButton>}>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 bg-black/30 p-4 rounded-lg">
            {selections.map(item => {
                const spriteData = findSprite(item.name);
                if (!spriteData) return <div key={item.name} className="text-xs text-red-400">Missing:<br/>{item.name}</div>;
                return (
                    <div key={item.name} className="flex flex-col items-center gap-2">
                        <div className="w-20 h-20 bg-white/5 rounded-lg p-1"><Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} /></div>
                        <p className="text-xs text-center font-semibold text-amber-200">{item.name}</p>
                    </div>
                );
            })}
        </div>
    </StepContainer>
);

const VoodooStep5_MakeOffering: React.FC<{ onNext: () => void, selections: MateriaSelection[], index: number }> = ({ onNext, selections, index }) => {
    const [isCharged, setIsCharged] = useState(false);
    const currentMateria = selections[index];
    const spriteData = findSprite(currentMateria.name);
    
    const chargedItems = useMemo(() => selections.slice(0, index), [selections, index]);
    const itemPositions = useIngredientPositions(selections.length);

    const instructionText = isCharged
        ? `The ${currentMateria.name} is prepared.\n"${currentMateria.incantation}"`
        : `Prepare the ${currentMateria.name}, speaking its incantation:\n"${currentMateria.incantation}"`;

    return (
        <StepContainer stageTitle="Make the Offering" instruction={instructionText} button={isCharged ? <RitualButton onClick={onNext} className="animate-pulse">{index < selections.length - 1 ? "Next Offering" : "Present to Lwa"}</RitualButton> : <div/>}>
            <div className="relative w-full h-full max-w-md aspect-square mx-auto">
                <div className="absolute pointer-events-none z-10" style={VOODOO_CONTAINER_STYLE}>
                    {chargedItems.map((item, i) => {
                        const itemSprite = findSprite(item.name);
                        if (!itemSprite) return null;
                        return (
                            <div key={`charged-voodoo-${i}`} className="absolute w-[35%]" style={itemPositions[i]}>
                                <Sprite sheetPath={itemSprite.sheet.path} x={itemSprite.itemInfo.x} y={itemSprite.itemInfo.y} spriteWidth={itemSprite.sheet.spriteSize.width} spriteHeight={itemSprite.sheet.spriteSize.height} sheetWidth={itemSprite.sheet.sheetSize.width} sheetHeight={itemSprite.sheet.sheetSize.height} />
                            </div>
                        );
                    })}
                    <AnimatePresence>
                        {isCharged && (
                            <motion.div
                                key={`current-voodoo-${index}`}
                                className="absolute w-[35%]"
                                style={itemPositions[index]}
                                initial={{ y: -200, opacity: 0, scale: 1.5 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                            >
                                {spriteData && <Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} />}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <Image src={`${ASSET_PATH}/voodoo-offering-bottle.png`} alt="Empty Offering Bottle" layout="fill" objectFit="contain" className="relative z-0 pointer-events-none" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2/3 z-20">
                     <AnimatePresence>
                    {!isCharged && (
                        <motion.div exit={{ scale: 0.5, opacity: 0 }}>
                            <ChargingComponent onCharge={() => setIsCharged(true)} isCharged={isCharged}>
                                {spriteData && <div className="w-24 h-24"><Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} /></div>}
                            </ChargingComponent>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            </div>
        </StepContainer>
    );
};

const VoodooStep6_PresentOffering: React.FC<{ onNext: () => void; lwa: string; selections: MateriaSelection[] }> = ({ onNext, lwa, selections }) => {
    const [isPresented, setIsPresented] = useState(false);
    const itemPositions = useIngredientPositions(selections.length);
    
    if (!lwa) {
        return <StepContainer stageTitle="Error"><p className="text-red-400">No Lwa was selected. Please restart the ritual.</p></StepContainer>;
    }

    const lwaVeveImg = `voodoo-veve-${lwa.toLowerCase().replace(' ', '-')}.png`;
    
    return (
        <StepContainer stageTitle="Present the Offering" instruction="Present your gifts and petition to the Lwa.">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="relative w-64 h-64">
                    <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute" style={VOODOO_CONTAINER_STYLE}>
                            {selections.map((item, i) => {
                                const itemSprite = findSprite(item.name);
                                if (!itemSprite) return null;
                                return (
                                    <div key={`final-voodoo-${i}`} className="absolute w-[35%]" style={itemPositions[i]}>
                                        <Sprite sheetPath={itemSprite.sheet.path} x={itemSprite.itemInfo.x} y={itemSprite.itemInfo.y} spriteWidth={itemSprite.sheet.spriteSize.width} spriteHeight={itemSprite.sheet.spriteSize.height} sheetWidth={itemSprite.sheet.sheetSize.width} sheetHeight={itemSprite.sheet.sheetSize.height} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <Image src={`${ASSET_PATH}/voodoo-offering-bottle-filled.png`} alt="Filled Offering Bottle" layout="fill" objectFit="contain" className="relative z-0" />
                </div>
                <ChargingComponent onCharge={() => { setIsPresented(true); setTimeout(onNext, 2000); }} isCharged={isPresented}>
                     <div className="relative w-48 h-48">
                        <Image src={`${ASSET_PATH}/${lwaVeveImg}`} alt={`${lwa} Vèvè`} layout="fill" objectFit="contain" className="brightness-75" />
                        {isPresented && <Image src={`${ASSET_PATH}/ui-veve-glow.gif`} alt="Vèvè Glowing" layout="fill" objectFit="contain" unoptimized />}
                    </div>
                </ChargingComponent>
            </div>
        </StepContainer>
    );
};

const Step7_Sending: React.FC<{onNext: () => void, petition: string}> = ({ onNext, petition }) => {
    useEffect(() => {
        const timer = setTimeout(onNext, SENDING_DURATION);
        return () => clearTimeout(timer);
    }, [onNext]);
    
    return(
        <StepContainer stageTitle="Sending the Work" instruction="Your spell is being sent by a great magick into the essence of the all.">
            <div className="w-96 h-96 relative flex items-center justify-center">
                <Image src={`${ASSET_PATH}/hoodoo-manifestation-final.png`} alt="Final Manifestation" layout="fill" objectFit="contain" />
                <AnimatePresence>
                    <motion.p initial={{opacity: 0, y: 50}} animate={{opacity: [0, 0.7, 0.7, 0], y: -150}} transition={{duration: SENDING_DURATION/1000, ease: 'linear', repeat: Infinity}} className="absolute w-64 text-center text-amber-100/80 italic whitespace-pre-line z-20">
                        {petition}
                    </motion.p>
                </AnimatePresence>
            </div>
        </StepContainer>
    );
};

const Step8_Manifestation: React.FC<{ affirmation: string, path: RitualPath, onFinish: () => void }> = ({ affirmation, path, onFinish }) => {
    const finalImage = path === 'hoodoo' ? 'hoodoo-manifestation-final.png' : 'voodoo-manifestation-final.png';
    const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 400,
        y: Math.random() * -500 - 50,
        duration: 5 + Math.random() * 5,
        delay: Math.random() * 7
    })), []);

    return (
        <StepContainer stageTitle={path === 'hoodoo' ? "The Work is Done" : "The Lwa is Served"} button={<RitualButton onClick={onFinish}>Return</RitualButton>}>
            <div className="flex flex-row items-center justify-center gap-2 md:gap-8 w-full max-w-4xl">
                <div className="relative w-1/2 aspect-square">
                    <Image src={`${ASSET_PATH}/${finalImage}`} alt="Final Manifestation" layout="fill" objectFit="contain" />
                    {path === 'voodoo' && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {particles.map(p => (
                                <motion.div key={p.id} initial={{opacity: 0, y: 0}} animate={{opacity: [0, 0.8, 0], y: p.y}} transition={{duration: p.duration, delay: p.delay, repeat: Infinity, repeatType: "loop"}} style={{x: p.x}} className="absolute top-1/2 left-1/2 w-12 h-12">
                                <Image src={`${ASSET_PATH}/ui-particle-spirit.png`} alt="spirit particle" layout="fill" />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="relative w-1/2 aspect-square @container">
                    <Image src={`${ASSET_PATH}/hoodoo-petition-paper.png`} alt="Affirmation Parchment" layout="fill" objectFit="contain"/>
                    <div className="absolute inset-0 flex items-center justify-center p-[22%]">
                        <p className="text-center text-[#3a291c] font-serif font-semibold" style={{fontSize: 'clamp(0.7rem, 4.5cqw, 1.2rem)'}}>{affirmation}</p>
                    </div>
                </div>
            </div>
        </StepContainer>
    );
};


const PsalmReader: React.FC<{isOpen: boolean; onClose: () => void; psalmName: string; psalmText: string; onBless: () => void;}> = ({isOpen, onClose, psalmName, psalmText, onBless}) => {
    const [stage, setStage] = useState<'read' | 'fix'>('read');
    const [isBlessed, setIsBlessed] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            setStage('read');
            setIsBlessed(false);
        }
    }, [isOpen, psalmName]);

    if (!isOpen) return null;

    const handleChooseVerse = () => {
        playSound('/audio/sfx-chaos-activate.mp3', 0.2).play();
        setStage('fix');
    };

    const handleSealVerse = () => {
        onBless();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} className="relative w-full max-w-2xl bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] text-black p-8 rounded-lg shadow-2xl">
                <h3 className="text-3xl font-serif text-center mb-4">{psalmName}</h3>
                
                <p className="text-lg text-center leading-relaxed max-h-[40vh] overflow-y-auto mb-6 p-2 border-y border-gray-400/50">{psalmText}</p>
                
                {stage === 'read' && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <RitualButton onClick={onClose} className="bg-gray-600/50 border-gray-400/50 hover:bg-gray-500/50">Close</RitualButton>
                        <RitualButton onClick={handleChooseVerse}>Choose This Verse</RitualButton>
                    </div>
                )}
                
                {stage === 'fix' && (
                     <div className="flex flex-col items-center justify-center gap-4">
                        <p className="text-sm italic text-center text-gray-700 mb-2">Read the verse outloud or in a bold inner voice, then press and hold to fix the word.</p>
                        <ChargingComponent onCharge={() => setIsBlessed(true)} isCharged={isBlessed} duration={13000}>
                            <div className="w-24 h-24 rounded-full bg-linear-to-br from-red-800 to-yellow-600 flex items-center justify-center text-center text-white font-bold text-lg shadow-lg tracking-wider p-2">
                                FIX THE WORD
                            </div>
                        </ChargingComponent>
                        <RitualButton onClick={handleSealVerse} disabled={!isBlessed} className="bg-yellow-600/50 border-yellow-400/50 hover:bg-yellow-500/50">
                            Seal the Verse
                        </RitualButton>
                    </div>
                )}

                <button onClick={onClose} className="absolute top-2 right-2 text-black/50 hover:text-black text-3xl font-sans">&times;</button>
            </motion.div>
        </div>
    );
};

export default HoodooVoodooMagick;
// --- END OF FILE ---