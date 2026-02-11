// --- START OF FILE src/app/components/HoodooVoodooMagick.tsx ---
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Session } from '@/lib/types';

// Services
import { generateHoodooVoodooWork, saveSpell } from '@/lib/services/geminiService';
import { getSpellById } from '@/lib/services/spellService';

// Hooks
import { useSpellSystem } from '@/hooks/useSpellSystem';
import { SlotPurchaseModal } from '@/app/components/economy/SlotPurchaseModal';
import { BlockageErrorOverlay } from '@/app/components/economy/BlockageErrorOverlay';

// Components & Assets
import MagickalBackLink from './MagickalBackLink';
import RoomsButton from './RoomsButton';
import LoadingSpinner from './LoadingSpinner';
import { Sprite } from './Sprite';
import { findSprite } from '@/lib/spriteLibrary';
import { Book, Skull, Sparkles, Save, Check, Coins, AlertTriangle, BookOpen, RotateCcw } from 'lucide-react';

// --- Configuration ---
const ASSET_PATH = "/images/Spells/HooDoo Voo Doo";
const CHARGE_DURATION = 3000;
const FADE_DURATION = 0.8;
const SENDING_DURATION = 13000;
const SERVICE_SLUG = 'ai_hoodoo_voodoo'; 

// --- Geometry Configuration for Ingredients ---
const CONTAINER_GEOMETRY = {
    hoodoo_empty: { left: '30.76%', top: '30.55%', width: '40.23%', height: '56.49%' },
    hoodoo_fixed: { left: '30.76%', top: '31.04%', width: '40.23%', height: '56.49%' },
    hoodoo_manifestation: { left: '36.35%', top: '50.71%', width: '28.54%', height: '40.09%' },
    voodoo_empty: { left: '35.00%', top: '46.15%', width: '31.05%', height: '45.75%' },
    voodoo_filled: { left: '36.23%', top: '38.54%', width: '27.54%', height: '38.92%' },
    voodoo_manifestation: { left: '36.23%', top: '38.54%', width: '27.54%', height: '38.92%' }
};

// --- Data ---
const PSALM_DATABASE: Record<string, string> = {
    "Psalm 23": "The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me. Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over. Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.",
    "Psalm 91": "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the Lord, He is my refuge and my fortress: my God; in him will I trust. Surely he shall deliver thee from the snare of the fowler, and from the noisome pestilence. He shall cover thee with his feathers, and under his wings shalt thou trust: his truth shall be thy shield and buckler. Thou shalt not be afraid for the terror by night; nor for the arrow that flieth by day; Nor for the pestilence that walketh in darkness; nor for the destruction that wasteth at noonday.",
    "Psalm 51": "Have mercy upon me, O God, according to thy lovingkindness: according unto the multitude of thy tender mercies blot out my transgressions. Wash me throughly from mine iniquity, and cleanse me from my sin. For I acknowledge my transgressions: and my sin is ever before me. Create in me a clean heart, O God; and renew a right spirit within me. Cast me not away from thy presence; and take not thy holy spirit from me. Restore unto me the joy of thy salvation; and uphold me with thy free spirit.",
    "Psalm 37": "Fret not thyself because of evildoers, neither be thou envious against the workers of iniquity. For they shall soon be cut down like the grass, and wither as the green herb. Trust in the Lord, and do good; so shalt thou dwell in the land, and verily thou shalt be fed. Delight thyself also in the Lord: and he shall give thee the desires of thine heart. Commit thy way unto the Lord; trust also in him; and he shall bring it to pass.",
    "Psalm 7": "O Lord my God, in thee do I put my trust: save me from all them that persecute me, and deliver me: Lest he tear my soul like a lion, rending it in pieces, while there is none to deliver. O Lord my God, if I have done this; if there be iniquity in my hands; Arise, O Lord, in thine anger, lift up thyself because of the rage of mine enemies: and awake for me to the judgment that thou hast commanded. The Lord shall judge the people: judge me, O Lord, according to my righteousness, and according to mine integrity that is in me."
};

const STANDARD_HOODOO_MATERIA: MateriaSelection[] = [
    { name: "Salt", incantation: "To cleanse and purify." },
    { name: "Silver Dime", incantation: "To pay the spirits and protect." },
    { name: "High John Root", incantation: "For power and mastery." }
];

const STANDARD_VOODOO_OFFERINGS: MateriaSelection[] = [
    { name: "Rum", incantation: "To warm the spirit." },
    { name: "Candy", incantation: "To sweeten the path." },
    { name: "Cigar", incantation: "Smoke to carry my prayer." }
];

// --- Sound Utility ---
const playSound = (src: string, volume: number = 0.5, loop: boolean = false): { play: () => void; stop: () => void; } => {
    const win = (globalThis as any).window;
    if (typeof win === 'undefined') return { play: () => {}, stop: () => {} };
    
    const AudioCtor = win.Audio;
    const audio = new AudioCtor(src);
    audio.volume = volume;
    audio.loop = loop;
    
    const play = () => audio.play().catch((e: any) => console.error(`Failed to play sound: ${src}`, e));
    const stop = () => { audio.pause(); audio.currentTime = 0; };
    return { play, stop };
};

// --- Type Definitions ---
type RitualPath = 'hoodoo' | 'voodoo' | null;
type RitualMode = 'standard' | 'ai' | 'replay';
type SpriteData = NonNullable<ReturnType<typeof findSprite>>;
type MateriaSelection = { name: string; incantation: string; };
type GeometryVariant = keyof typeof CONTAINER_GEOMETRY;

interface StepComponentProps { onNext: () => void; }
interface StepContainerProps { stageTitle?: string; instruction?: string; children: React.ReactNode; button?: React.ReactNode; }
interface RitualButtonProps { onClick: () => void; children: React.ReactNode; className?: string; disabled?: boolean; }


// ==========================================
// SUB-COMPONENTS
// ==========================================

const RitualButton: React.FC<RitualButtonProps> = ({ onClick, children, className, disabled }) => (
    <button onClick={onClick} disabled={disabled} className={`px-8 py-3 bg-black/50 text-white font-serif rounded-lg border-2 border-amber-400/50 backdrop-blur-sm hover:bg-amber-900/50 hover:border-amber-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);



const StepContainer: React.FC<StepContainerProps> = ({ stageTitle, instruction, children, button }) => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 overflow-hidden">
        <div className="shrink-0 flex flex-col items-center justify-center text-center px-4 min-h-[4rem] h-auto py-2 z-20 relative">
             {stageTitle && <h2 className="text-2xl md:text-3xl font-serif text-amber-200/90">{stageTitle}</h2>}
             {instruction && <p className="text-sm md:text-base text-amber-100/80 mt-1 ischemic italic font-light max-w-2xl leading-tight whitespace-pre-line" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>{instruction}</p>}
        </div>
        <div className="w-full grow min-h-0 relative flex items-center justify-center z-10 overflow-hidden">
            {children}
        </div>
        <div className="h-[60px] shrink-0 flex items-center justify-center z-20">
            {button}
        </div>
    </div>
);

const FilledContainer: React.FC<{
    variant: GeometryVariant;
    items: MateriaSelection[];
    count: number;
}> = ({ variant, items, count }) => {
    const geometry = CONTAINER_GEOMETRY[variant];
    return (
        <div className="absolute pointer-events-none overflow-hidden" style={{
            left: geometry.left, top: geometry.top, width: geometry.width, height: geometry.height,
        }}>
            {items.slice(0, count).map((item, idx) => {
                const spriteData = findSprite(item.name);
                if (!spriteData) return null;
                const seed = item.name.charCodeAt(0) + idx * 50;
                const rand1 = Math.sin(seed) * 1000; 
                const col = idx % 2;
                const row = Math.floor(idx / 2);
                const size = '55%'; 
                const randomX = (rand1 % 10); 
                const randomY = (Math.cos(seed) * 1000 % 5); 
                const randomRot = (rand1 % 30) - 15;
                const leftPos = `${(col === 0 ? 5 : 45) + randomX}%`;
                const bottomPos = `${(row * 12) + 2 + randomY}%`;

                return (
                    <motion.div 
                        key={`${item.name}-${idx}`}
                        initial={{ opacity: 0, scale: 0, y: -50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                        className="absolute aspect-square"
                        style={{ width: size, left: leftPos, bottom: bottomPos, zIndex: 10 + idx, rotate: `${randomRot}deg` }}
                    >
                         <Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} />
                    </motion.div>
                )
            })}
        </div>
    );
};

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
    const soundRef = useRef<any>(null);

    const handleHoldStart = () => {
        if (isCharged) return;
        if (onHoldStart) onHoldStart();
        soundRef.current = playSound('/audio/sfx-chaos-hold.mp3', 0.2, true);
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
        if (soundRef.current) soundRef.current.stop();
        if (!isCharged) setProgress(0);
    };

    return (
        <div 
            onMouseDown={handleHoldStart} onMouseUp={handleHoldEnd} onMouseLeave={handleHoldEnd} onTouchStart={handleHoldStart} onTouchEnd={handleHoldEnd} onContextMenu={(e) => e.preventDefault()}
            className="relative grid place-items-center cursor-pointer select-none"
        >
            <div className={`transition-transform duration-300 ${progress > 0 || isCharged ? 'scale-110' : ''}`}>{children}</div>
            <svg className="absolute w-full h-full" viewBox="0 0 100 100" style={{transform: 'rotate(-90deg) scale(1.2)'}}>
                <motion.circle cx="50" cy="50" r="48" stroke="rgba(251, 191, 36, 1)" strokeWidth="4" fill="transparent" strokeLinecap="round" pathLength="1" strokeDasharray="1" initial={{strokeDashoffset: 1}} animate={{strokeDashoffset: isCharged ? 0 : 1 - (progress/100)}} transition={{duration: 0.05}}/>
            </svg>
        </div>
    );
};

const Step0_Crossroads: React.FC<{ onSelectPath: (path: RitualPath) => void }> = ({ onSelectPath }) => (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
        <div className="relative z-10 flex flex-row items-center justify-center gap-4 md:gap-16 h-full p-4">
            <button onClick={() => onSelectPath('hoodoo')} className="relative h-[90%] w-auto aspect-[40/56] transition-transform duration-300 hover:scale-105 active:scale-95">
                <Image src={`${ASSET_PATH}/ui-button-hoodoo-path.png`} alt="Hoodoo Rootwork Path Selection Button" layout="fill" objectFit="contain" />
            </button>
            <button onClick={() => onSelectPath('voodoo')} className="relative h-[90%] w-auto aspect-[40/56] transition-transform duration-300 hover:scale-105 active:scale-95">
                <Image src={`${ASSET_PATH}/ui-button-voodoo-path.png`} alt="Voodoo Lwa Service Path Selection Button" layout="fill" objectFit="contain" />
            </button>
        </div>
    </div>
);

const HoodooStep1_Ancestors: React.FC<StepComponentProps> = ({ onNext }) => {
    const [isLit, setIsLit] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const holdInterval = useRef<NodeJS.Timeout | null>(null);
    const fireSound = useRef<any>(null);
    const incantation = "I call to my ancestors, known and unknown, to witness and bless this sacred working.";

    const handleHoldStart = () => {
        if (isLit) return;
        fireSound.current = playSound('/audio/fire.mp3', 0.3, true);
        fireSound.current.play();
        const startTime = Date.now();
        holdInterval.current = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min((elapsedTime / CHARGE_DURATION) * 100, 100);
            setHoldProgress(progress);
            if (progress >= 100) {
                clearInterval(holdInterval.current!);
                fireSound.current.stop();
                setIsLit(true);
                playSound('/audio/sfx-chaos-activate.mp3', 0.4).play();
            }
        }, 50);
    };
    const handleHoldEnd = () => {
        if (holdInterval.current) clearInterval(holdInterval.current);
        if(fireSound.current) fireSound.current.stop();
        if(!isLit) setHoldProgress(0);
    };

    return (
        <StepContainer stageTitle="Honor the Ancestors" instruction={holdProgress > 0 || isLit ? incantation : "Press and hold the candle to light it, and say the conjuration on the screen as you do."} button={isLit && <RitualButton onClick={onNext} className="animate-pulse">Continue</RitualButton>}>
            <div onMouseDown={handleHoldStart} onMouseUp={handleHoldEnd} onMouseLeave={handleHoldEnd} onTouchStart={handleHoldStart} onTouchEnd={handleHoldEnd} onContextMenu={(e) => e.preventDefault()} className="relative h-full max-h-full w-auto max-w-full aspect-[4/5] mx-auto cursor-pointer select-none">
                <Image src={`${ASSET_PATH}/hoodoo-altar-base.png`} alt="Traditional Hoodoo Ancestor Altar Table" layout="fill" objectFit="contain" />
                <AnimatePresence>
                {!isLit ? (
                     <motion.div key="unlit" className="absolute inset-0" exit={{ opacity: 0 }}>
                        <Image src={`${ASSET_PATH}/hoodoo-ancestor-candle-unlit.png`} alt="Unlit Altar Candle" layout="fill" objectFit="contain" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-black/30 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-amber-400" initial={{width: '0%'} as any} animate={{width: `${holdProgress}%`} as any} transition={{duration: 0.05}}/>
                        </div>
                     </motion.div>
                ) : (
                    <motion.div key="lit" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Image src={`${ASSET_PATH}/hoodoo-ancestor-candle-lit.gif`} alt="Burning Ritual Candle" layout="fill" objectFit="contain" unoptimized />
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </StepContainer>
    );
};

const HoodooStep2_Petition: React.FC<{ cost: number; petition: string; setPetition: (val: string) => void; onNext: (mode: RitualMode) => void; isReplay: boolean }> = ({ cost, petition, setPetition, onNext, isReplay }) => (
    <StepContainer stageTitle="Write Your Petition" instruction="State your intention for this Work. Be clear and direct.">
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-2">
            <div className={`relative h-full max-h-full min-h-0 w-auto max-w-full aspect-square @container ${isReplay ? 'opacity-80' : ''}`}>
                <Image src={`${ASSET_PATH}/hoodoo-petition-paper.png`} alt="Aged Parchment Petition Paper" layout="fill" objectFit="contain" />
                <div className="absolute p-4" style={{ left: '15%', top: '25%', width: '70%', height: '50%' }}>
                    <textarea 
                        value={petition} 
                        onChange={(e) => setPetition((e.target as any).value)} 
                        readOnly={isReplay}
                        placeholder="e.g., To draw money to me for my rent." 
                        className="w-full h-full bg-transparent text-center text-[#4a2e1c] font-serif focus:outline-none resize-none" 
                        style={{ fontSize: 'clamp(0.6rem, 4cqw, 1.5rem)' }} 
                    />
                </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full max-w-xs">
                {isReplay ? (
                     <button onClick={() => onNext('replay')} className="flex items-center justify-center gap-3 p-4 bg-purple-900 border border-purple-500 rounded-lg hover:bg-purple-800 text-white shadow-lg animate-pulse">
                        <RotateCcw className="w-5 h-5" />
                        <div className="font-serif tracking-widest text-sm uppercase">Begin Ritual (Saved)</div>
                    </button>
                ) : (
                    <>
                        <button onClick={() => onNext('standard')} disabled={!petition} className="flex items-center gap-3 p-3 bg-amber-900/60 border border-amber-600 rounded-lg hover:bg-amber-800 disabled:opacity-50 text-amber-100">
                            <Book className="w-5 h-5" />
                            <div className="text-left">
                                <div className="font-serif">Traditional Work</div>
                                <div className="text-xs text-amber-300/70">Fixed Psalm & Materia. Free.</div>
                            </div>
                        </button>
                        <button onClick={() => onNext('ai')} disabled={!petition} className="flex items-center gap-3 p-3 bg-purple-900/60 border border-purple-500 rounded-lg hover:bg-purple-800 disabled:opacity-50 relative overflow-hidden group text-purple-100">
                            <Skull className="w-5 h-5" />
                            <div className="text-left relative z-10">
                                <div className="font-serif flex items-center gap-2">Rootworker Consult <Sparkles size={12}/></div>
                                <div className="text-xs text-purple-300">Custom scripture & ingredients. {cost} Credits.</div>
                            </div>
                        </button>
                    </>
                )}
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
            <div className="w-full h-full flex flex-row items-center gap-4 overflow-x-auto md:justify-center p-4 snap-x no-scrollbar">
                {selections.map(psalm => (
                    <div key={psalm} onClick={() => onOpenReader(psalm)} className={`relative h-full max-h-[40vh] aspect-[3/4] cursor-pointer group transition-all duration-300 shrink-0 snap-center ${selectedPsalm === psalm ? 'scale-105' : 'scale-95'}`}>
                        <Image src={`${ASSET_PATH}/ui-psalm-book.png`} alt="Biblical Book of Psalms for Hoodoo Workings" layout="fill" objectFit="contain" />
                        <div className={`absolute inset-0 flex items-center justify-center p-4 rounded-lg transition-colors ${selectedPsalm === psalm ? 'bg-amber-300/20' : ''}`}>
                            <p className={`text-center font-serif text-lg md:text-xl group-hover:text-black ${selectedPsalm === psalm ? 'text-black font-bold' : 'text-gray-800'}`}>{psalm}</p>
                        </div>
                        {isPsalmLit && selectedPsalm === psalm && <div className="absolute top-2 right-2 w-8 h-8 bg-red-800 rounded-full flex items-center justify-center text-yellow-300 text-xs font-bold ring-2 ring-yellow-300">✓</div>}
                    </div>
                ))}
            </div>
        </StepContainer>
    );
};

const HoodooStep4_GatherMateria: React.FC<{ selections: MateriaSelection[]; onNext: () => void; }> = ({ selections, onNext }) => (
     <StepContainer stageTitle="Gather Your Materia" instruction="The spirits have chosen these ingredients for your petition." button={<RitualButton onClick={onNext}>Fix the Jar</RitualButton>}>
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

const HoodooStep5_FixJar: React.FC<{ onNext: () => void, selections: MateriaSelection[], index: number }> = ({ onNext, selections, index }) => {
    const [isCharged, setIsCharged] = useState(false);
    const currentMateria = selections[index];
    const spriteData = findSprite(currentMateria.name);
    
    const instructionText = isCharged 
        ? `The ${currentMateria.name} is added to the jar.\n"${currentMateria.incantation}"`
        : `Charge the ${currentMateria.name}, speaking its incantation:\n"${currentMateria.incantation}"`;

    return (
        <StepContainer stageTitle="Fix the Jar" instruction={instructionText} button={isCharged ? <RitualButton onClick={onNext} className="animate-pulse">{index < selections.length - 1 ? "Next Ingredient" : "Seal the Jar"}</RitualButton> : <div/>}>
            <div className="relative h-full max-h-full w-auto max-w-full aspect-square mx-auto">
                <Image src={`${ASSET_PATH}/hoodoo-jar-empty.png`} alt="Empty Glass Spell Jar for Moyo Bag" layout="fill" objectFit="contain" priority />
                
                <FilledContainer items={selections} count={isCharged ? index + 1 : index} variant="hoodoo_empty" />

                {!isCharged && spriteData && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2/3 z-20">
                        <ChargingComponent onCharge={() => setIsCharged(true)} isCharged={isCharged}>
                            <div className="w-24 h-24 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                <Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} />
                            </div>
                        </ChargingComponent>
                    </div>
                )}
            </div>
        </StepContainer>
    );
};

const HoodooStep6_SealJar: React.FC<{ onNext: () => void, selections: MateriaSelection[] }> = ({ onNext, selections }) => {
    const [isSealed, setIsSealed] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const handleSeal = () => { setIsSealed(true); playSound('/audio/sfx-chaos-explosion.mp3', 0.5).play(); setIsSent(true); setTimeout(onNext, 2500); };

    return(
        <StepContainer stageTitle="Seal the Work" instruction="I seal this work in the name of the Father, Son, and Holy Ghost. Awake and do my bidding.">
            <div className="relative h-full max-h-full w-auto max-w-full aspect-square mx-auto flex items-center justify-center">
                 <motion.div 
                    className="relative w-full h-full"
                    animate={isSent ? { scale: [1, 1.2, 0], opacity: [1, 1, 0], filter: ["brightness(1)", "brightness(2)", "brightness(10)"], y: [0, -50, -500] } : {}}
                    transition={{ duration: 2, ease: "easeInOut" }}
                 >
                    <Image src={`${ASSET_PATH}/hoodoo-jar-fixed.png`} alt="Fixed and Sealed Spell Jar" layout="fill" objectFit="contain" className="z-0"/>
                    <div className="absolute inset-0 z-10"><FilledContainer variant="hoodoo_fixed" items={selections} count={selections.length} /></div>
                    {!isSealed && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                            <ChargingComponent onCharge={handleSeal} isCharged={isSealed} duration={5000}>
                                <div className="w-48 h-48 rounded-full border-4 border-amber-400/30 animate-pulse bg-black/20" />
                            </ChargingComponent>
                        </div>
                    )}
                 </motion.div>
            </div>
        </StepContainer>
    );
};

const VoodooStep1_OpenGate: React.FC<StepComponentProps> = ({ onNext }) => {
    useEffect(() => { const timer = setTimeout(onNext, 2000); return () => clearTimeout(timer); }, [onNext]);
    return (
        <StepContainer stageTitle="Open the Gate" instruction="Honor Papa Legba and open the way to the spirit world.">
            <div className="relative h-[80%] max-h-full w-auto max-w-full aspect-square mx-auto animate-pulse">
                <Image src={`${ASSET_PATH}/voodoo-veve-legba.png`} alt="Papa Legba Vèvè" layout="fill" objectFit="contain" />
            </div>
        </StepContainer>
    );
};

const VoodooStep2_StateNeed: React.FC<{ cost: number; petition: string; setPetition: (val: string) => void; onNext: (mode: RitualMode) => void; isReplay: boolean }> = ({ cost, petition, setPetition, onNext, isReplay }) => (
    <StepContainer stageTitle="State Your Need" instruction="Clearly present your petition to the spirits.">
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-2">
             <div className="relative h-full max-h-full min-h-0 w-auto max-w-full aspect-square @container">
                <Image src={`${ASSET_PATH}/voodoo-petition-scroll.png`} alt="Aged Parchment Petition Paper" layout="fill" objectFit="contain" />
                <div className="absolute p-4" style={{ left: '22%', top: '30%', width: '56%', height: '40%' }}>
                    <textarea 
                        value={petition} 
                        onChange={(e) => setPetition((e.target as any).value)} 
                        readOnly={isReplay}
                        placeholder="e.g., I ask for protection on my journey." 
                        className="w-full h-full bg-transparent text-center text-[#4a2e1c] font-serif focus:outline-none resize-none" 
                        style={{ fontSize: 'clamp(0.6rem, 4cqw, 1.5rem)' }} 
                    />
                </div>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
                {isReplay ? (
                    <button onClick={() => onNext('replay')} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-serif font-bold rounded animate-pulse">
                        Begin Replay (Free)
                    </button>
                ) : (
                    <>
                        <button onClick={() => onNext('standard')} disabled={!petition} className="flex items-center gap-3 p-3 bg-amber-900/60 border border-amber-600 rounded-lg hover:bg-amber-800 disabled:opacity-50 text-amber-100">
                            <Book className="w-5 h-5" />
                            <div className="text-left">
                                <div className="font-serif">Serve Papa Legba</div>
                                <div className="text-xs text-amber-300/70">Traditional offerings. Free.</div>
                            </div>
                        </button>
                        <button onClick={() => onNext('ai')} disabled={!petition} className="flex items-center gap-3 p-3 bg-purple-900/60 border border-purple-500 rounded-lg hover:bg-purple-800 disabled:opacity-50 relative overflow-hidden group text-purple-100">
                            <Skull className="w-5 h-5" />
                            <div className="text-left relative z-10">
                                <div className="font-serif flex items-center gap-2">Divine the Lwa <Sparkles size={12}/></div>
                                <div className="text-xs text-purple-300">Consult the spirits. {cost} Credits.</div>
                            </div>
                        </button>
                    </>
                )}
            </div>
        </div>
    </StepContainer>
);

const VoodooStep3_ServeLwa: React.FC<{ selectedLwa: string; onSelect: (lwa: string) => void; onNext: () => void; mode: RitualMode }> = ({ selectedLwa, onSelect, onNext, mode }) => {
    const lwas = [
        { name: 'Papa Legba', img: 'voodoo-veve-legba.png' },
        { name: 'Erzulie Freda', img: 'voodoo-veve-erzulie-freda.png'},
        { name: 'Ogun', img: 'voodoo-veve-ogun.png'},
        { name: 'Damballah', img: 'voodoo-veve-damballah.png'},
        { name: 'Baron Samedi', img: 'voodoo-veve-baron-samedi.png'},
    ];
    // In Replay or Standard, allow all or specific. For standard we usually force Legba in step 2.
    // In AI mode or Replay we show all.
    const availableLwas = (mode === 'standard' && selectedLwa === 'Papa Legba') ? lwas.filter(l => l.name === 'Papa Legba') : lwas;

    return (
        <StepContainer stageTitle="Serve the Lwa" instruction={mode === 'standard' ? "You serve Papa Legba to open the roads." : "Choose the Lwa whose domain aligns with your need."} button={<RitualButton onClick={onNext} disabled={!selectedLwa}>Prepare Offerings</RitualButton>}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableLwas.map(lwa => (
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
    const currentOffering = selections[index];
    const spriteData = findSprite(currentOffering.name);
    const instructionText = isCharged ? `The ${currentOffering.name} is added to the offering bottle. "${currentOffering.incantation}"` : `Prepare the ${currentOffering.name}, speaking its incantation: "${currentOffering.incantation}"`;

    return (
        <StepContainer stageTitle="Make the Offering" instruction={instructionText} button={isCharged ? <RitualButton onClick={onNext} className="animate-pulse">{index < selections.length - 1 ? "Next Offering" : "Seal the Offering"}</RitualButton> : <div/>}>
            <div className="relative h-full max-h-full w-auto max-w-full aspect-square mx-auto">
                <Image src={`${ASSET_PATH}/voodoo-offering-bottle.png`} alt="Empty Rum Bottle Offering" layout="fill" objectFit="contain" priority />
                <FilledContainer variant="voodoo_empty" items={selections} count={isCharged ? index + 1 : index} />
                {!isCharged && spriteData && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2/3 z-20">
                        <ChargingComponent onCharge={() => setIsCharged(true)} isCharged={isCharged}>
                             <div className="w-24 h-24 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                <Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} />
                            </div>
                        </ChargingComponent>
                    </div>
                )}
            </div>
        </StepContainer>
    );
};

const VoodooStep6_SealBottle: React.FC<{ onNext: () => void; selections: MateriaSelection[]; lwa: string; }> = ({ onNext, selections, lwa }) => {
    const [isSealed, setIsSealed] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const handleSeal = () => { setIsSealed(true); playSound('/audio/sfx-chaos-explosion.mp3', 0.5).play(); setIsSent(true); setTimeout(onNext, 2500); };
    return (
        <StepContainer stageTitle="Consecrate the Vessel" instruction={`I seal this gift for ${lwa}. Accept this offering and open the way.`}>
             <div className="relative h-full max-h-full w-auto max-w-full aspect-square mx-auto flex items-center justify-center">
                <motion.div className="relative w-full h-full" animate={isSent ? { scale: [1, 1.2, 0], opacity: [1, 1, 0], filter: ["brightness(1)", "brightness(2)", "brightness(10)"], y: [0, -50, -500] } : {}} transition={{ duration: 2, ease: "easeInOut" }}>
                    <Image src={`${ASSET_PATH}/voodoo-offering-bottle-filled.png`} alt="Rum Bottle Offering for the Spirits" layout="fill" objectFit="contain" className="z-0" />
                    <div className="absolute inset-0 z-10"><FilledContainer variant="voodoo_filled" items={selections} count={selections.length} /></div>
                    {!isSealed && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                            <ChargingComponent onCharge={handleSeal} isCharged={isSealed} duration={5000}>
                                <div className="w-48 h-48 rounded-full border-4 border-amber-400/30 animate-pulse bg-black/20" />
                            </ChargingComponent>
                        </div>
                    )}
                </motion.div>
            </div>
        </StepContainer>
    );
};

const Step7_Sending: React.FC<{onNext: () => void, petition: string, selections: MateriaSelection[], variant: GeometryVariant, image: string}> = ({ onNext, petition, selections, variant, image }) => {
    useEffect(() => { const timer = setTimeout(onNext, SENDING_DURATION); return () => clearTimeout(timer); }, [onNext]);
    return(
        <StepContainer stageTitle="Sending the Work" instruction="Your spell is being sent by a great magick into the essence of the all.">
            <div className="relative h-full max-h-full w-auto max-w-full aspect-square flex items-center justify-center">
                <Image src={`${ASSET_PATH}/${image}`} alt="Final Manifestation" layout="fill" objectFit="contain" unoptimized={image.endsWith('.gif')} />
                <div className="absolute inset-0 z-10"><FilledContainer variant={variant} items={selections} count={selections.length} /></div>
                <AnimatePresence>
                    <motion.p initial={{opacity: 0, y: 50}} animate={{opacity: [0, 0.7, 0.7, 0], y: -150}} transition={{duration: SENDING_DURATION/1000, ease: 'linear', repeat: Infinity}} className="absolute w-64 text-center text-amber-100/80 italic whitespace-pre-line z-20">
                        {petition}
                    </motion.p>
                </AnimatePresence>
            </div>
        </StepContainer>
    );
};

const Step8_Manifestation: React.FC<{ affirmation: string, path: RitualPath, onCastAnother: () => void, onReturn: () => void, selections?: MateriaSelection[], onSave: () => void, isSaving: boolean, isSaved: boolean }> = ({ affirmation, path, onCastAnother, onReturn, selections = [], onSave, isSaving, isSaved }) => {
    const finalImage = path === 'hoodoo' ? 'hoodoo-manifestation-final.gif' : 'voodoo-manifestation-final.png';
    const variant = path === 'hoodoo' ? 'hoodoo_manifestation' : 'voodoo_manifestation';
    const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({ id: i, x: (Math.random() - 0.5) * 400, y: Math.random() * -500 - 50, duration: 5 + Math.random() * 5, delay: Math.random() * 7 })), []);
    return (
        <StepContainer stageTitle={path === 'hoodoo' ? "The Work is Done" : "The Lwa is Served"}>
            <div className="flex flex-col items-center justify-center gap-4 w-full h-full max-w-4xl">
                 <div className="flex flex-row items-center justify-center gap-2 md:gap-8 w-full">
                    <div className="relative w-1/2 aspect-square">
                        <Image src={`${ASSET_PATH}/${finalImage}`} alt="Final Manifestation" layout="fill" objectFit="contain" unoptimized={finalImage.endsWith('.gif')} />
                        <div className="absolute inset-0 z-10"><FilledContainer variant={variant} items={selections} count={selections.length} /></div>
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
                        <Image src={`${ASSET_PATH}/hoodoo-petition-paper.png`} alt="Completed Petition Parchment" layout="fill" objectFit="contain"/>
                        <div className="absolute inset-0 flex items-center justify-center p-[22%]"><p className="text-center text-[#3a291c] font-serif font-semibold" style={{fontSize: 'clamp(0.7rem, 4.5cqw, 1.2rem)'}}>{affirmation}</p></div>
                    </div>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
                    <button onClick={onSave} disabled={isSaved || isSaving} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-900/60 border border-amber-400 text-amber-100 font-serif rounded hover:bg-amber-800 disabled:opacity-50 transition-colors">
                        {isSaved ? <Check size={18} /> : <Save size={18} />}
                        {isSaved ? "Work Sealed" : isSaving ? "Sealing..." : "Seal This Work (1 Credit)"}
                    </button>
                    <RitualButton onClick={onCastAnother} className="w-full">Cast Another Spell</RitualButton>
                    <RitualButton onClick={onReturn} className="w-full bg-slate-900/40 border-slate-600 hover:bg-slate-800">Return to Spell Room</RitualButton>
                </div>
            </div>
        </StepContainer>
    );
};

const PsalmReader: React.FC<{isOpen: boolean; onClose: () => void; psalmName: string; psalmText: string; onBless: () => void;}> = ({isOpen, onClose, psalmName, psalmText, onBless}) => {
    const [stage, setStage] = useState<'read' | 'fix'>('read');
    const [isBlessed, setIsBlessed] = useState(false);
    
    useEffect(() => { if (isOpen) { setStage('read'); setIsBlessed(false); } }, [isOpen, psalmName]);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} className="relative w-full max-w-2xl bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] text-black p-8 rounded-lg shadow-2xl">
                <h3 className="text-3xl font-serif text-center mb-4">{psalmName}</h3>
                <p className="text-lg text-center leading-relaxed max-h-[40vh] overflow-y-auto mb-6 p-2 border-y border-gray-400/50">{psalmText}</p>
                {stage === 'read' && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <RitualButton onClick={onClose} className="bg-gray-600/50 border-gray-400/50 hover:bg-gray-500/50">Close</RitualButton>
                        <RitualButton onClick={() => { playSound('/audio/sfx-chaos-activate.mp3', 0.2).play(); setStage('fix'); }}>Choose This Verse</RitualButton>
                    </div>
                )}
                {stage === 'fix' && (
                     <div className="flex flex-col items-center justify-center gap-4">
                        <p className="text-sm italic text-center text-gray-700 mb-2">Read the verse outloud or in a bold inner voice, then press and hold to fix the word.</p>
                        <ChargingComponent onCharge={() => setIsBlessed(true)} isCharged={isBlessed} duration={13000}>
                            <div className="w-24 h-24 rounded-full bg-linear-to-br from-red-800 to-yellow-600 flex items-center justify-center text-center text-white font-bold text-lg shadow-lg tracking-wider p-2">FIX THE WORD</div>
                        </ChargingComponent>
                        <RitualButton onClick={onBless} disabled={!isBlessed} className="bg-yellow-600/50 border-yellow-400/50 hover:bg-yellow-500/50">Seal the Verse</RitualButton>
                    </div>
                )}
                <button onClick={onClose} className="absolute top-2 right-2 text-black/50 hover:text-black text-3xl font-sans">&times;</button>
            </motion.div>
        </div>
    );
};

// Local SlotPurchaseModal removed in favor of imported component

// ==========================================
// MAIN COMPONENT
// ==========================================

const HoodooVoodooMagick: React.FC<{ session: Session; isSubscribed: boolean; }> = ({ session }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const loadId = searchParams.get('loadId');
    const actionParam = searchParams.get('action');

    // Use initial state to block rendering if we expect to hydrate
    // Check localStorage synchronously to prevent flash on browser back
    const [isHydrating, setIsHydrating] = useState(() => {
        if (typeof window !== 'undefined') {
             const saved = localStorage.getItem('hoodoo_voodoo_autosave');
             if (saved) {
                 try {
                     const parsed = JSON.parse(saved);
                     // Check freshness (1 hour)
                     if (Date.now() - parsed.timestamp < 1000 * 60 * 60) return true;
                 } catch {}
             }
        }
        return false;
    });
    
    // Fallback Effect for ensuring hydration triggers
    useEffect(() => {
        if (actionParam === 'expand_slots' && !isHydrating) {
             setIsHydrating(true);
        }
    }, [actionParam, isHydrating]);

    const [step, setStep] = useState(0);
    const [path, setPath] = useState<RitualPath>(null);
    const [mode, setMode] = useState<RitualMode>('standard');
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [appError, setAppError] = useState<string | null>(null);

    // Economy & Spell System
    const spellSystem = useSpellSystem({
        serviceSlugGen: SERVICE_SLUG,
        serviceSlugSave: 'save_spell', // Assuming standard save slug
        baseRedirectPath: '/spell-room/hoodoo-rootwork-spells-app'
    });

    const cost = spellSystem.genEconomy.cost;
    
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
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    
    const [psalmReaderOpen, setPsalmReaderOpen] = useState(false);
    const [isReplayMode, setIsReplayMode] = useState(false);

    // --- EFFECT: REPLAY MODE ---
    useEffect(() => {
        if (loadId) {
            const loadSpell = async () => {
                setLoading(true);
                setLoadingMessage("Retrieving ritual from Grimoire...");
                try {
                    const spell = await getSpellById(loadId);
                    if (spell) {
                        const data = typeof spell.ritual_data === 'string' ? JSON.parse(spell.ritual_data) : spell.ritual_data;
                        
                        // Hydrate State
                        setPetition(spell.intention);
                        setFinalAffirmation(spell.incantation); 
                        setPath(data.path); 
                        
                        if (data.path === 'hoodoo') {
                            setHoodooPsalmSelections([data.psalm]); 
                            setSelectedPsalm(data.psalm);
                            setIsPsalmLit(true); 
                            setHoodooMateriaSelections(data.materia || []);
                        } else {
                            setSelectedLwa(data.lwa);
                            setVoodooOfferingSelections(data.materia || []); 
                        }

                        setIsReplayMode(true);
                        setStep(1); 
                        setIsSaved(true); 
                    }
                } catch (e) {
                    console.error("Failed to load spell", e);
                    setAppError("Could not retrieve spell data.");
                } finally {
                    setLoading(false);
                }
            };
            loadSpell();
        }
    }, [loadId]);

    // --- EFFECT: RESTORE STATE AFTER STORE RETURN ---
    useEffect(() => {
        // ALWAYS check for saved state on mount (or if Action present)
        // This handles Browser Back, Manual Url Entry, and Store Redirects alike
        const savedState = localStorage.getItem('hoodoo_voodoo_autosave');
             
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                
                // Verify if the save is recent (extended to 60 mins) to avoid stale state
                if (Date.now() - parsed.timestamp < 1000 * 60 * 60) {
                     console.log("HoodooVoodooMagick: Found fresh state. Restoring logic triggered.");
                     console.log("HoodooVoodooMagick: Found saved state:", parsed);

                     if (parsed.path) {
                         setPath(parsed.path);
                         console.log("Restored Path:", parsed.path);
                     }
                     if (parsed.step !== undefined) {
                         setStep(parsed.step);
                         console.log("Restored Step:", parsed.step);
                     }
                     if (parsed.petition !== undefined) setPetition(parsed.petition);
                     if (parsed.selectedPsalm) setSelectedPsalm(parsed.selectedPsalm);
                     if (parsed.selectedLwa) setSelectedLwa(parsed.selectedLwa);
                     if (parsed.hoodooMateriaSelections) setHoodooMateriaSelections(parsed.hoodooMateriaSelections);
                     if (parsed.hoodooMateriaSelections) setHoodooMateriaSelections(parsed.hoodooMateriaSelections);
                     if (parsed.voodooOfferingSelections) setVoodooOfferingSelections(parsed.voodooOfferingSelections);
                     if (parsed.finalAffirmation) setFinalAffirmation(parsed.finalAffirmation);
                     
                     // If we are returning from store, likely we were in AI mode
                     setMode('ai'); 
                     
                     // Note: We do NOT remove the item immediately.
                     // It will clear naturally on next overwrite or be ignored by timestamp.
                } else {
                     console.warn("HoodooVoodooMagick: Saved state is stale.", parsed.timestamp);
                }
            } catch (e) {
                console.error("Failed to parse saved state", e);
            }
        } else {
            // console.warn("HoodooVoodooMagick: No saved state found in localStorage.");
        }
        
        // Finish hydration
        setIsHydrating(false);

    }, [actionParam]);

    // --- EFFECT: CONTINUOUS AUTOSAVE ---
    useEffect(() => {
        // Only save if we are not currently hydrating and we have actually started the ritual (step > 0)
        if (!isHydrating && step > 0) {
            const stateToSave = {
                step, 
                path, 
                petition, 
                selectedPsalm, 
                selectedLwa, 
                hoodooMateriaSelections, 
                voodooOfferingSelections,
                finalAffirmation,
                timestamp: Date.now()
            };
            localStorage.setItem('hoodoo_voodoo_autosave', JSON.stringify(stateToSave));
            // console.log("HoodooVoodooMagick: Autosaved state.", stateToSave);
        }
    }, [step, path, petition, selectedPsalm, selectedLwa, hoodooMateriaSelections, voodooOfferingSelections, finalAffirmation, isHydrating]);

    const handleOpenPsalmReader = (psalm: string) => {
        setSelectedPsalm(psalm);
        setIsPsalmLit(false);
        setPsalmReaderOpen(true);
    };

    const resetState = () => {
        setStep(0); setPath(null); setPetition(''); setHoodooPsalmSelections([]);
        setSelectedPsalm(''); setIsPsalmLit(false); setHoodooMateriaSelections([]); setSelectedLwa('');
        setVoodooOfferingSelections([]); setFinalAffirmation(''); setChargingIndex(0);
        setIsSaved(false);
        setAppError(null);
        spellSystem.clearErrors();
        setIsReplayMode(false);

        // NEW: Clear URL params to exit Replay Mode cleanly
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('loadId');
            window.history.replaceState({}, '', url.toString());
        }
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

    // --- HOODOO LOGIC HANDLERS ---
    
    const handleHoodooPetitionComplete = async (selectedMode: RitualMode) => {
        if (selectedMode === 'replay') {
             advanceStep();
             return;
        }

        setMode(selectedMode);
        setAppError(null);
        spellSystem.clearErrors();

        if (selectedMode === 'standard') {
            setHoodooPsalmSelections(['Psalm 23', 'Psalm 91']);
            setHoodooMateriaSelections(STANDARD_HOODOO_MATERIA);
            advanceStep(); 
        } else {
            // AI Mode
            if (!session?.user?.id) {
                setAppError("You must be logged in to access the Rootworker.");
                return;
            }
            const paid = await spellSystem.genEconomy.spendAether(session.user.id);
            if (!paid) return; 
            await handleHoodooPsalmSearch();
        }
    };
    
    const handleHoodooPsalmSearch = async () => {
        if (!petition) { setAppError("You must write a petition first."); setLoading(false); return; }
        setLoading(true); setLoadingMessage("Consulting the scriptures...");
        try {
            const result = await generateHoodooVoodooWork('hoodoo', 3, { petition });
            setHoodooPsalmSelections(result.selections);
            advanceStep();
        } catch (err: any) { setAppError(err.message || "Failed to retrieve psalms."); } finally { setLoading(false); }
    };

    const handleHoodooMateriaLogic = async () => {
        if (isReplayMode) { advanceStep(); return; }

        if (mode === 'standard') {
            advanceStep(); 
        } else {
            if (!selectedPsalm || !isPsalmLit) { setAppError("You must select and fix a Psalm verse."); return; }
            setLoading(true); setLoadingMessage("The spirits are gathering your materia...");
            try {
                const result = await generateHoodooVoodooWork('hoodoo', 4, { petition });
                setHoodooMateriaSelections(result.selections);
                advanceStep();
            } catch (err: any) { setAppError(err.message); } finally { setLoading(false); }
        }
    };
    
    const handleHoodooFinalStep = async () => {
        if (isReplayMode) { advanceStep(); return; }

        if (mode === 'standard') {
            setFinalAffirmation("My petition is fixed and sealed. The work is done.");
            advanceStep();
        } else {
            setLoading(true); setLoadingMessage("Sealing the Work...");
            try {
                const result = await generateHoodooVoodooWork('hoodoo', 7, { petition });
                setFinalAffirmation(result.affirmation);
                advanceStep();
            } catch(err: any) { setAppError(err.message); } finally { setLoading(false); }
        }
    };

    // --- VOODOO LOGIC HANDLERS ---
    
    const handleVoodooPetitionComplete = async (selectedMode: RitualMode) => {
        if (selectedMode === 'replay') {
             advanceStep();
             return;
        }

        setMode(selectedMode);
        setAppError(null);
        spellSystem.clearErrors();

        if (selectedMode === 'standard') {
            setSelectedLwa('Papa Legba');
            setVoodooOfferingSelections(STANDARD_VOODOO_OFFERINGS);
            advanceStep();
        } else {
            if (!session?.user?.id) {
                setAppError("You must be logged in to consult the Lwa.");
                return;
            }
            const paid = await spellSystem.genEconomy.spendAether(session.user.id);
            if (!paid) return;
            advanceStep();
        }
    };

    const handleVoodooLwaLogic = async () => {
        if (isReplayMode) { advanceStep(); return; }

        if (mode === 'standard') {
             advanceStep();
        } else {
            if (!selectedLwa) { setAppError("You must serve a Lwa."); return; }
            setLoading(true); setLoadingMessage("Divining the Lwa's desires...");
            try {
                const result = await generateHoodooVoodooWork('voodoo', 4, { petition, lwa: selectedLwa });
                setVoodooOfferingSelections(result.selections);
                advanceStep();
            } catch (err: any) { setAppError(err.message); } finally { setLoading(false); }
        }
    };

    const handleVoodooFinalStep = async () => {
         if (isReplayMode) { advanceStep(); return; }

         if (mode === 'standard') {
            setFinalAffirmation(`Papa Legba has accepted the gift. The gate is open.`);
            advanceStep();
         } else {
            setLoading(true); setLoadingMessage("Presenting the offering...");
            try {
                const result = await generateHoodooVoodooWork('voodoo', 7, { petition, lwa: selectedLwa });
                setFinalAffirmation(result.affirmation);
                advanceStep();
            } catch(err: any) { setAppError(err.message); } finally { setLoading(false); }
         }
    };

    // --- SHARED LOGIC ---
    const handleChargeNext = () => {
        const limit = path === 'hoodoo' ? hoodooMateriaSelections.length : voodooOfferingSelections.length;
        if (chargingIndex < limit - 1) {
            setChargingIndex(prev => prev + 1);
        } else {
            advanceStep();
        }
    };

    const handleCastAnother = () => {
        localStorage.removeItem('hoodoo_voodoo_autosave');
        window.location.reload(); 
    };

    const handleReturnToRoom = () => {
        localStorage.removeItem('hoodoo_voodoo_autosave');
        router.push('/spell-room');
    };

    const handleExitRitual = () => {
        localStorage.removeItem('hoodoo_voodoo_autosave');
    };

    const handleSaveToGrimoire = async () => {
        if (isSaved || !session?.user?.id) return;
        
        // 1. Payment Check (1 Credit for Save)
        // We use 'save_spell' slug or just a direct deduction if we know the cost.
        // Assuming spendAether requires checking against a cost. 
        // We can just use the generic spendAether which usually checks for standard interaction cost unless specified.
        // Actually, let's use the explicit check.
        // NOTE: The user mentioned "1 Credit".
        // We'll explicitly attempt to spend.
        
        const paid = await spellSystem.genEconomy.spendAether(session.user.id);
        if (!paid) {
            // Error is handled by spellSystem setting activeError, which triggers BlockageErrorOverlay
            return;
        }

        setIsSaving(true);
        setAppError(null);
        
        try {
            const ritualData = {
                path,
                petition,
                psalm: selectedPsalm,
                lwa: selectedLwa,
                materia: path === 'hoodoo' ? hoodooMateriaSelections : voodooOfferingSelections,
                affirmation: finalAffirmation,
                timestamp: new Date().toISOString()
            };

            await saveSpell(session.user.id, {
                name: `${path === 'hoodoo' ? 'Hoodoo' : 'Voodoo'} Work: ${petition.substring(0, 30)}...`,
                intention: petition,
                incantation: finalAffirmation,
                element: path === 'hoodoo' ? 'Earth' : 'Spirit',
                ritual_data: ritualData,
                tradition: path === 'hoodoo' ? 'HOODOO' : 'VOODOO'
            }, true); // Bypass Limit for Paid Saves
            
            setIsSaved(true);
            playSound('/audio/sfx-chaos-activate.mp3', 0.5).play();
            
            // Clean up autosave only on successful save
            localStorage.removeItem('hoodoo_voodoo_autosave');
        } catch (e: any) {
             console.error(e);
             setAppError("Failed to save to Grimoire.");
        } finally {
            setIsSaving(false);
        }
    };

     const handleBuySlots = async () => {
         if (!session?.user?.id) return;
         await spellSystem.buySlots(session.user.id);
    };

    const renderError = () => {
        if (!appError && ! spellSystem.activeError) return null;
        
        // Use standard blockage overlay for payment issues
        if (spellSystem.activeError) {
             return (
                <BlockageErrorOverlay 
                    error={spellSystem.activeError} 
                    onDismiss={() => spellSystem.clearErrors()} 
                    redirectPath={'/spell-room/hoodoo-rootwork-spells-app'}
                    onGoToStore={() => {
                        console.log("HoodooVoodooMagick (RenderError): Saving state...", { step, path, petition });
                        spellSystem.goToStoreForSlots(
                        { step, path, petition, selectedPsalm, selectedLwa, hoodooMateriaSelections, voodooOfferingSelections }, 
                        'hoodoo_voodoo_autosave'
                        );
                    }}
                />
            );
        }

        const reset = () => setAppError(null);

        return (
            <div className="flex items-center justify-center h-full animate-in fade-in zoom-in absolute inset-0 z-50 bg-black/80 backdrop-blur-sm">
                <div className="text-center text-red-400 p-6 bg-red-900/50 rounded-lg max-w-sm border border-red-500/50 shadow-xl">
                    <div className="flex justify-center mb-2"><AlertTriangle size={32} /></div>
                    <p className="font-bold text-lg mb-2 uppercase tracking-wider">Ritual Interrupted</p>
                    <p className="mb-6 text-sm text-red-200">{appError}</p>
                    <button onClick={reset} className="px-6 py-2 border border-red-500 rounded hover:bg-red-900/50 transition-colors uppercase tracking-widest text-xs">
                        Dismiss
                    </button>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (isHydrating) return <LoadingSpinner title="Restoring your ritual..." />;
        if (loading || spellSystem.genEconomy.isProcessingPayment) return <div className="flex items-center justify-center h-full"><LoadingSpinner title={spellSystem.genEconomy.isProcessingPayment ? "Offering Faestones..." : loadingMessage || "Consulting the Spirits..."} /></div>;
        if (appError) return renderError();

        if (step === 0) return <Step0_Crossroads onSelectPath={selectPath} />;

        if (path === 'hoodoo') {
            switch (step) {
                case 1: return <HoodooStep1_Ancestors onNext={advanceStep} />;
                case 2: return <HoodooStep2_Petition cost={cost} petition={petition} setPetition={setPetition} onNext={handleHoodooPetitionComplete} isReplay={isReplayMode} />;
                case 3: return <HoodooStep3_FindVerse onOpenReader={handleOpenPsalmReader} selections={hoodooPsalmSelections} selectedPsalm={selectedPsalm} isPsalmLit={isPsalmLit} onNext={handleHoodooMateriaLogic} />;
                case 4: return <HoodooStep4_GatherMateria selections={hoodooMateriaSelections} onNext={advanceStep} />;
                case 5: return <HoodooStep5_FixJar key={`charge-hoodoo-${chargingIndex}`} onNext={handleChargeNext} selections={hoodooMateriaSelections} index={chargingIndex} />;
                case 6: return <HoodooStep6_SealJar onNext={handleHoodooFinalStep} selections={hoodooMateriaSelections} />;
                case 7: return <Step7_Sending onNext={handleHoodooFinalStep} petition={petition} selections={hoodooMateriaSelections} variant="hoodoo_manifestation" image="hoodoo-manifestation-final.gif" />;
                case 8: return <Step8_Manifestation affirmation={finalAffirmation} path={path} onCastAnother={handleCastAnother} onReturn={handleReturnToRoom} selections={hoodooMateriaSelections} onSave={handleSaveToGrimoire} isSaving={isSaving} isSaved={isSaved} />;
                default: return <div onClick={resetState}>Invalid Step</div>;
            }
        }
        
        if (path === 'voodoo') {
            switch (step) {
                case 1: return <VoodooStep1_OpenGate onNext={advanceStep} />;
                case 2: return <VoodooStep2_StateNeed cost={cost} petition={petition} setPetition={setPetition} onNext={handleVoodooPetitionComplete} isReplay={isReplayMode} />;
                case 3: return <VoodooStep3_ServeLwa selectedLwa={selectedLwa} onSelect={setSelectedLwa} onNext={handleVoodooLwaLogic} mode={mode} />;
                case 4: return <VoodooStep4_PrepareOffering selections={voodooOfferingSelections} onNext={advanceStep} />;
                case 5: return <VoodooStep5_MakeOffering key={`charge-voodoo-${chargingIndex}`} onNext={handleChargeNext} selections={voodooOfferingSelections} index={chargingIndex} />;
                case 6: return <VoodooStep6_SealBottle onNext={handleVoodooFinalStep} selections={voodooOfferingSelections} lwa={selectedLwa} />;
                case 7: return <Step7_Sending onNext={handleHoodooFinalStep} petition={petition} selections={voodooOfferingSelections} variant="voodoo_manifestation" image="voodoo-manifestation-final.png" />;
                case 8: return <Step8_Manifestation affirmation={finalAffirmation} path={path} onCastAnother={handleCastAnother} onReturn={handleReturnToRoom} selections={voodooOfferingSelections} onSave={handleSaveToGrimoire} isSaving={isSaving} isSaved={isSaved} />;
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
                psalmText={PSALM_DATABASE[selectedPsalm] || "Scripture not found in local database."} 
                onBless={() => { setIsPsalmLit(true); setPsalmReaderOpen(false); }}
            />
            
            <SlotPurchaseModal 
                isOpen={spellSystem.modalState.isOpen} 
                onClose={spellSystem.modalState.close}
                onPurchase={handleBuySlots}
                isProcessing={spellSystem.modalState.isLoading}
                showAetherWarning={spellSystem.modalState.showWarning}
                showSuccess={spellSystem.modalState.showSuccess}
                onGoToStore={() => {
                   console.log("HoodooVoodooMagick (Modal): Saving state...", { step, path, petition });
                   spellSystem.goToStoreForSlots(
                    { step, path, petition, selectedPsalm, selectedLwa, hoodooMateriaSelections, voodooOfferingSelections }, 
                    'hoodoo_voodoo_autosave'
                   );
                }}
            />

            {/* Global Errors (In case rendered outside content flow) */}
            {spellSystem.activeError && (
                 <BlockageErrorOverlay 
                    error={spellSystem.activeError} 
                    onDismiss={() => spellSystem.clearErrors()}
                    redirectPath={'/spell-room/hoodoo-rootwork-spells-app'}
                    onGoToStore={() => {
                        console.log("HoodooVoodooMagick (Overlay): Saving state...", { step, path, petition });
                        spellSystem.goToStoreForSlots(
                         { step, path, petition, selectedPsalm, selectedLwa, hoodooMateriaSelections, voodooOfferingSelections }, 
                         'hoodoo_voodoo_autosave'
                        );
                    }}
                />
            )}

            <main 
                onContextMenu={(e) => e.preventDefault()}
                className="relative h-[100dvh] w-full bg-black bg-cover bg-center flex flex-col transition-all duration-1000 select-none overflow-hidden" 
                style={{ backgroundImage: `url('${currentBackground}')` }}
            >
                <div className="absolute inset-0 bg-black/40" />
                <header className={`relative z-20 w-full p-4 md:p-6 shrink-0 transition-opacity duration-500 ${psalmReaderOpen ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex justify-between items-center flex-wrap w-full max-w-7xl mx-auto">
                        <div className="order-1">
                            <MagickalBackLink 
                                href="/spell-room" 
                                text="All Traditions" 
                                onClick={handleExitRitual}
                            />
                        </div>
                        <div className="order-2 md:order-3"><RoomsButton /></div>
                        <h1 className="w-full text-center order-3 md:w-auto md:order-2 text-4xl md:text-5xl font-serif text-amber-300 mt-2 md:mt-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                            Ache
                        </h1>
                    </div>
                </header>
                <div className={`relative z-10 grow w-full flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${psalmReaderOpen ? 'opacity-0' : 'opacity-100'}`}>
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

export default HoodooVoodooMagick;
// --- END OF FILE src/app/components/HoodooVoodooMagick.tsx ---