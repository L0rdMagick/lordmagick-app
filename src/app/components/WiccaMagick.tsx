// --- START OF FILE src/app/components/WiccaMagick.tsx ---

"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session, GeneratedWiccanSpell } from '@/lib/types';
import { generateWiccanSpell } from '@/lib/services/geminiService';
import MagickalBackLink from './MagickalBackLink';
import RoomsButton from './RoomsButton';
import LoadingSpinner from './LoadingSpinner';
import { PentagramIcon } from './icons';
import { Sprite } from './Sprite';
import { findSprite } from '@/lib/spriteLibrary';

// --- Configuration ---
const ASSET_PATH = "/images/Spells/Wicca Tradition General";
const CHARGE_DURATION_ELEMENT = 5000; // Increased to 5 seconds
const CHARGE_DURATION_INGREDIENT = 3000;
const CAST_DURATION = 10000;

// --- Sound Utility ---
const playSound = (src: string, volume: number = 0.5, loop: boolean = false): HTMLAudioElement | null => {
    if (typeof window === 'undefined') return null;
    const audio = new Audio(src);
    audio.volume = volume;
    audio.loop = loop;
    audio.play().catch(e => console.error(`Failed to play sound: ${src}`, e));
    return audio;
};

// --- Type Definitions for Component Props ---
interface WiccaMagickProps {
    session: Session;
    isSubscribed: boolean;
}

interface RitualButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

interface StepContainerProps {
    stageTitle?: string;
    stageSubtitle?: string;
    instruction?: string;
    children: React.ReactNode;
    button?: React.ReactNode;
}

interface StepProps {
    onNext: () => void;
}

interface Step1Props extends StepProps {
    intention: string;
    setIntention: (val: string) => void;
}

interface Step2Props extends StepProps {
    chargedElements: string[];
    onChargeComplete: (name: string) => void;
}

interface Step3Props extends StepProps {
    selectedDeities: string[];
    onToggle: (name: string) => void;
}

interface SpellStepProps extends StepProps {
    spell: GeneratedWiccanSpell;
}

interface Step5Props extends StepProps {
    spell: GeneratedWiccanSpell;
    chargingIndex: number;
}

type SpriteData = NonNullable<ReturnType<typeof findSprite>>;

interface ChargingElementProps {
    name: string;
    isCharged: boolean;
    onChargeComplete: (name: string) => void;
    style: React.CSSProperties;
    spriteData: SpriteData;
    soundSrc: string;
}

interface IngredientChargerProps {
    children: React.ReactNode;
    onChargeComplete: () => void;
    isComplete: boolean;
}


// --- Main Component ---
const WiccaMagick: React.FC<WiccaMagickProps> = ({ session }) => {
    const [ritualStep, setRitualStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [intention, setIntention] = useState('');
    const [chargedElements, setChargedElements] = useState<string[]>([]);
    const [selectedDeities, setSelectedDeities] = useState<string[]>([]);
    const [generatedSpell, setGeneratedSpell] = useState<GeneratedWiccanSpell | null>(null);
    const [chargingIndex, setChargingIndex] = useState(0);

    const handleGenerateSpell = async () => {
        if (!intention) { setError("An intention must be inscribed to proceed."); return; }
        setLoading(true);
        setError(null);
        try {
            const focalPoint = selectedDeities.length > 0 ? selectedDeities.join(', ') : 'The Divine';
            const spell = await generateWiccanSpell({ intention, focalPoint, moonPhase: 'Current' });
            setGeneratedSpell(spell);
            setRitualStep(4);
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
                ? [] 
                : [deityName]
        );
    };

    const handleAdvanceAfterCharge = () => {
        playSound('/audio/sfx-spell-room-portal.mp3', 0.2);
        if (chargingIndex < 4) {
            setChargingIndex(prev => prev + 1);
        } else {
            setRitualStep(6);
        }
    };
    
    const renderStep = () => {
        if (loading) return <div className="flex items-center justify-center h-full"><LoadingSpinner title="Weaving the Magick..." /></div>;
        if (error) return <div className="flex items-center justify-center h-full"><div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg"><p>{error}</p><button onClick={() => setError(null)} className="mt-2 underline font-bold">Try Again</button></div></div>;

        switch (ritualStep) {
            case 0: return <Step0_Intro onNext={() => setRitualStep(1)} />;
            case 1: return <Step1_Intention intention={intention} setIntention={setIntention} onNext={() => setRitualStep(2)} />;
            case 2: return <Step2_Elements chargedElements={chargedElements} onChargeComplete={handleElementChargeComplete} onNext={() => setRitualStep(3)} />;
            case 3: return <Step3_Deities selectedDeities={selectedDeities} onToggle={handleDeityToggle} onNext={handleGenerateSpell} />;
            case 4: return generatedSpell && <Step4_Components spell={generatedSpell} onNext={() => setRitualStep(5)} />;
            case 5: return generatedSpell && <Step5_ChargeComponent spell={generatedSpell} chargingIndex={chargingIndex} onNext={handleAdvanceAfterCharge} />;
            case 6: return generatedSpell && <Step6_Incantation spell={generatedSpell} onNext={() => setRitualStep(7)} />;
            case 7: return generatedSpell && <Step7_Cast spell={generatedSpell} onNext={() => setRitualStep(8)} />;
            case 8: return generatedSpell && <Step8_Manifestation spell={generatedSpell} />;
            default: return <Step0_Intro onNext={() => setRitualStep(1)} />;
        }
    };

    return (
        <main className="relative h-screen w-screen bg-black bg-cover bg-center flex flex-col" style={{ backgroundImage: "url('/images/spell-room/spell-room-background.png')" }}>
            <div className="absolute inset-0 bg-black/50" />
            <header className="relative z-20 w-full p-4 md:p-6 shrink-0">
                <div className="flex justify-between items-center flex-wrap w-full max-w-7xl mx-auto">
                    <div className="order-1"><MagickalBackLink href="/spell-room" text="All Traditions" /></div>
                    <div className="order-2 md:order-3"><RoomsButton /></div>
                    <h1 className="w-full text-center order-3 md:w-auto md:order-2 text-4xl md:text-5xl font-serif text-purple-300 mt-2 md:mt-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                        Wicca Magick
                    </h1>
                </div>
            </header>
            <div className="relative z-10 grow w-full flex flex-col overflow-hidden p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={ritualStep}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.7, ease: 'easeInOut' }}
                        className="w-full h-full"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
};

// --- Step Building Blocks ---

const RitualButton: React.FC<RitualButtonProps> = ({ onClick, children, className, disabled }) => (
    <button onClick={onClick} disabled={disabled} className={`px-8 py-3 bg-black/40 text-white font-serif rounded-lg border-2 border-purple-400/50 backdrop-blur-sm hover:bg-purple-900/50 hover:border-purple-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

const StepContainer: React.FC<StepContainerProps> = ({ stageTitle, stageSubtitle, instruction, children, button }) => (
    <div className="w-full h-full flex flex-col items-center justify-between gap-2 py-1">
        <div className="shrink-0 flex flex-col items-center justify-center text-center px-4 min-h-24 h-auto py-2 z-20 relative">
             {stageTitle && <h2 className="text-3xl font-serif text-amber-200/90">{stageTitle}</h2>}
             {stageSubtitle && <h3 className="text-xl font-serif text-amber-100/80 mt-1">{stageSubtitle}</h3>}
             {instruction && <p className="text-base text-purple-200/80 mt-2 italic font-light max-w-2xl leading-tight" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>{instruction}</p>}
        </div>
        <div className="w-full grow min-h-0 relative flex items-center justify-center z-10">
            {children}
        </div>
        <div className="h-[60px] shrink-0 flex items-center justify-center z-20">
            {button}
        </div>
    </div>
);

// --- Individual Step Components ---

const Step0_Intro: React.FC<StepProps> = ({ onNext }) => (
    <StepContainer instruction="Cross the threshold and begin your journey into the craft." button={<RitualButton onClick={onNext}>Begin</RitualButton>}>
        <div className="relative w-full h-full max-w-md @container">
            <Image src={`${ASSET_PATH}/wicca_intro_instructions.png`} alt="Instructions" layout="fill" objectFit="contain" priority />
            <div className="absolute w-[55cqmin] h-[45cqmin] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] flex flex-col items-center justify-center text-center pointer-events-none gap-2 p-4">
                <h3 className="font-serif text-gray-200" style={{ textShadow: '0 0 8px black', fontSize: 'clamp(1.5rem, 4.5cqmin, 2.25rem)' }}>
                    Wiccan Spellcraft
                </h3>
                <p className="text-gray-300 leading-relaxed" style={{ fontSize: 'clamp(0.9rem, 2.5cqmin, 1.1rem)' }}>
                    Enter this realm to do a Wicca-influenced magick spell.
                </p>
            </div>
        </div>
    </StepContainer>
);

const Step1_Intention: React.FC<Step1Props> = ({ intention, setIntention, onNext }) => (
    <StepContainer 
        stageTitle="State Your True Will" 
        instruction="Inscribe your deepest desire upon this sacred scroll. What is it you truly seek?"
        button={<RitualButton onClick={onNext} disabled={!intention}>Seal My Intention</RitualButton>}
    >
        <div className="relative w-full h-full max-w-md @container">
            <Image src={`${ASSET_PATH}/wicca_scroll_intention.png`} alt="Inscribe your intention" layout="fill" objectFit="contain" />
            <div className="absolute w-[60%] h-[40%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] p-2">
                <textarea value={intention} onChange={(e) => setIntention(e.target.value)} placeholder="e.g., To find clarity on my career path" className="w-full h-full bg-transparent text-center text-[#4a2e1c] font-serif focus:outline-none resize-none" style={{ fontSize: 'clamp(0.9rem, 4cqmin, 1.5rem)' }} />
            </div>
        </div>
    </StepContainer>
);

const Step2_Elements: React.FC<Step2Props> = ({ chargedElements, onChargeComplete, onNext }) => {
    // Mapping Elements to Sprites as requested:
    // Spirit -> Wand, Air -> Athame, Fire -> Bowl of Fire, Earth -> Sacred Stone, Water -> Amethyst
    const elementsData = [
        { name: 'Spirit', spriteName: 'Wand', sound: '/audio/spirit.mp3' },
        { name: 'Air', spriteName: 'Athame', sound: '/audio/air.mp3' },
        { name: 'Fire', spriteName: 'Bowl of Fire', sound: '/audio/fire.mp3' },
        { name: 'Earth', spriteName: 'Sacred Stone', sound: '/audio/earth.mp3' },
        { name: 'Water', spriteName: 'Amethyst', sound: '/audio/water.mp3' },
    ];
    const instructionText = "Summon the ancient guardians. Press and hold each sigil to awaken its power.";

    return (
        <StepContainer stageTitle="Call the Elemental Guardians" instruction={instructionText} button={chargedElements.length === 5 ? <RitualButton onClick={onNext} className="animate-pulse">Continue</RitualButton> : <div/>}>
            <div className="relative w-full h-full flex items-center justify-center p-2">
                <div className="relative h-full aspect-square max-w-full">
                    {elementsData.map((el, i) => {
                        const spriteData = findSprite(el.spriteName);
                        if (!spriteData) {
                            console.warn(`Sprite for element '${el.name}' (mapped to ${el.spriteName}) not found.`);
                            return <div key={el.name} className="absolute text-xs text-red-400">Missing: {el.spriteName}</div>;
                        }
                        // Positions in a pentagram shape
                        const positions = [ { top: '10%', left: '50%'}, { top: '45%', left: '90%'}, { top: '90%', left: '75%'},  { top: '90%', left: '25%'}, { top: '45%', left: '10%'} ];
                        return ( <ChargingElement key={el.name} name={el.name} isCharged={chargedElements.includes(el.name)} onChargeComplete={onChargeComplete} style={{...positions[i], transform: 'translate(-50%, -50%)'}} spriteData={spriteData} soundSrc={el.sound} /> );
                    })}
                </div>
            </div>
        </StepContainer>
    );
};

const Step3_Deities: React.FC<Step3Props> = ({ selectedDeities, onToggle, onNext }) => (
    <StepContainer 
        stageTitle="Invoke a Guiding Deity or Force"
        instruction="Choose a divine presence to guide your work, or proceed with the universal energies."
        button={
            <div className="flex flex-col sm:flex-row gap-4">
                <RitualButton onClick={onNext}>Confirm Invocation</RitualButton>
                <RitualButton onClick={onNext} className="bg-black/20 border-gray-600/50 hover:bg-gray-800/50">Continue without Deity</RitualButton>
            </div>
        }
    >
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-around gap-4 overflow-y-auto max-h-full py-4">
            {[{ name: 'Triple Goddess', img: 'wicca_deity_triple_goddess.png' }, { name: 'Horned God', img: 'wicca_deity_horned_god.png' }, { name: 'Divine Source', img: 'wicca_deity_divine_source.png' }].map(deity => {
                const isSelected = selectedDeities.includes(deity.name);
                return (
                    <div key={deity.name} onClick={() => onToggle(deity.name)} className="text-center cursor-pointer group p-2 flex flex-col items-center shrink-0">
                        <div className={`relative w-28 h-28 md:w-36 md:h-36 lg:w-48 lg:h-48 transition-all duration-300 transform ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                            <Image src={`${ASSET_PATH}/${deity.img}`} layout="fill" objectFit="contain" alt={deity.name} className={`transition-all duration-300 ${isSelected ? 'brightness-125 drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]' : 'brightness-75 group-hover:brightness-100'}`} />
                        </div>
                        <p className={`mt-2 text-lg font-serif transition-colors duration-300 ${isSelected ? 'text-purple-300' : 'text-gray-400 group-hover:text-white'}`}>{deity.name}</p>
                    </div>
                );
            })}
        </div>
    </StepContainer>
);

const Step4_Components: React.FC<SpellStepProps> = ({ spell, onNext }) => (
    <StepContainer 
        stageTitle="The Fated Components" 
        instruction="The universe provides. These are the catalysts for your magick."
        button={<RitualButton onClick={onNext}>Prepare Components</RitualButton>}
    >
        <div className='text-center'>
            <p className="text-gray-300 mb-6">These items have been chosen for your intention.</p>
            <div className="grid grid-cols-5 gap-2 sm:gap-4 bg-black/30 p-4 rounded-lg">
                {spell.symbolic_ingredients.map(ingredient => {
                    const spriteData = findSprite(ingredient.name);
                    if (!spriteData) return <div key={ingredient.name} className="w-16 h-16 sm:w-24 sm:h-24 border border-dashed border-gray-600 rounded-md flex items-center justify-center text-xs text-center text-gray-400">Missing:<br/>{ingredient.name}</div>;
                    return (
                        <div key={ingredient.name} className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/5 rounded-lg p-1"><Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} /></div>
                            <p className="text-xs sm:text-sm text-center font-semibold text-purple-300">{ingredient.name}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    </StepContainer>
);

const Step5_ChargeComponent: React.FC<Step5Props> = ({ spell, chargingIndex, onNext }) => {
    const [isComplete, setIsComplete] = useState(false);
    useEffect(() => { setIsComplete(false); }, [chargingIndex]);
    const handleChargeComplete = () => setIsComplete(true);
    const currentIngredient = spell.symbolic_ingredients[chargingIndex];

    return (
        <StepContainer 
            stageTitle="Imbue with Aether"
            stageSubtitle={isComplete ? "Component Charged!" : `Hold to Charge the ${currentIngredient.name}`}
            instruction="Focus your will. Press and hold the component to imbue it with your personal energy."
            button={isComplete ? <RitualButton onClick={onNext} className="animate-pulse">{chargingIndex < 4 ? "Charge Next Component" : "Continue to Incantation"}</RitualButton> : <div/>}
        >
            <div className="relative w-full max-w-lg h-full">
                <Image src={`${ASSET_PATH}/wicca_charge_ingredient_template.png`} alt="Charge Component" layout="fill" objectFit="contain" />
                 <IngredientCharger onChargeComplete={handleChargeComplete} isComplete={isComplete}>
                    {(() => {
                        const spriteData = findSprite(currentIngredient.name);
                        if (!spriteData) return null;
                        return <div className="w-40 h-40"><Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} /></div>;
                    })()}
                </IngredientCharger>
            </div>
        </StepContainer>
    );
};

const Step6_Incantation: React.FC<SpellStepProps> = ({ spell, onNext }) => (
    <StepContainer 
        stageTitle="Speak the Words of Power" 
        instruction="Read aloud or in your heart. Let these words resonate with your soul's intent."
        button={<RitualButton onClick={onNext}>Ready to Cast</RitualButton>}
    >
        <div className="relative w-full h-full max-w-md @container">
            <Image src={`${ASSET_PATH}/wicca_incantation_scroll.png`} alt="Incantation Scroll" layout="fill" objectFit="contain" />
            <div className="absolute w-[70%] h-[55%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-4">
                <p className="font-serif text-[#4a2e1c] text-center whitespace-pre-line leading-relaxed" style={{fontSize: 'clamp(0.9rem, 4.5cqmin, 1.75rem)'}}>{spell.central_chant}</p>
            </div>
        </div>
    </StepContainer>
);

const Step7_Cast: React.FC<SpellStepProps> = ({ spell, onNext }) => {
    const [isCasting, setIsCasting] = useState(false);
    const castSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isCasting) {
            castSoundRef.current = playSound('/audio/sfx-chaos-hold.mp3', 0.4, true);
            timer = setTimeout(() => {
                playSound('/audio/sfx-chaos-explosion.mp3', 0.5);
                onNext();
            }, CAST_DURATION);
        }
        return () => {
            clearTimeout(timer);
            castSoundRef.current?.pause();
        };
    }, [isCasting, onNext]);

    return (
        <StepContainer 
            stageTitle="Unleash the Magick" 
            instruction="The moment is now. Gather your will and release the spell into the aether."
            button={<div/>}
        >
            <div className="relative w-full max-w-2xl h-full flex items-center justify-center">
                <div onMouseDown={() => setIsCasting(true)} onMouseUp={() => setIsCasting(false)} onMouseLeave={() => setIsCasting(false)} onTouchStart={() => setIsCasting(true)} onTouchEnd={() => setIsCasting(false)} className="relative w-full max-w-full max-h-full aspect-square cursor-pointer">
                    <Image src={`${ASSET_PATH}/wicca_pentagram_ready_to_cast.png`} layout="fill" objectFit="contain" alt="Cast the Spell" />
                    <PentagramIcon className="absolute w-full h-full text-white pointer-events-none" isTracing={isCasting} />
                    {spell.symbolic_ingredients.map((ing, i) => {
                        const spriteData = findSprite(ing.name);
                        if(!spriteData) return null;
                        const positions = [ { top: '0%', left: '50%'}, { top: '34.5%', left: '97.5%'}, { top: '90.4%', left: '79.3%'}, { top: '90.4%', left: '20.6%'}, { top: '34.5%', left: '2.5%'} ];
                        return <div key={i} className="absolute w-16 h-16 pointer-events-none" style={{...positions[i], transform: 'translate(-50%, -50%)'}}> <Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} /> </div>
                    })}
                    <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-2xl pointer-events-none text-center text-white" style={{ textShadow: '0 0 10px black' }}>Hold to Focus Your Will and<br/>Cast the Spell</p>
                </div>
            </div>
        </StepContainer>
    );
};

const Step8_Manifestation: React.FC<{ spell: GeneratedWiccanSpell }> = ({ spell }) => (
     <StepContainer 
        stageTitle="Witness the Manifestation" 
        instruction="So mote it be. Your will is in motion. Trust in the magick you have woven."
        button={<RitualButton onClick={() => window.location.href = '/spell-room'}>Return to Spell Room</RitualButton>}
    >
        <div className="relative w-full h-full max-w-2xl @container">
            <Image src={`${ASSET_PATH}/wicca_spell_manifestation.png`} alt="Spell Manifestation" layout="fill" objectFit="contain" />
            <div className="absolute w-[48cqmin] h-[60cqmin] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-4">
                <p className="text-center text-white font-serif" style={{fontSize: 'clamp(1.1rem, 3cqmin, 2rem)'}}>{spell.affirmation}</p>
            </div>
        </div>
    </StepContainer>
);

// --- Helper components for complex interactions ---

const IngredientCharger: React.FC<IngredientChargerProps> = ({ children, onChargeComplete, isComplete }) => {
    const [isHolding, setIsHolding] = useState(false);
    const chargeSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if(isHolding && !isComplete) {
            chargeSoundRef.current = playSound('/audio/sfx-chaos-hold.mp3', 0.3, true);
            timer = setTimeout(() => {
                onChargeComplete();
                playSound('/audio/sfx-chaos-activate.mp3', 0.4);
            }, CHARGE_DURATION_INGREDIENT)
        }
        return () => {
            clearTimeout(timer);
            chargeSoundRef.current?.pause();
        }
    }, [isHolding, isComplete, onChargeComplete]);
    
    return (
        <div onMouseDown={() => setIsHolding(true)} onMouseUp={() => setIsHolding(false)} onMouseLeave={() => setIsHolding(false)} onTouchStart={() => setIsHolding(true)} onTouchEnd={() => setIsHolding(false)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] grid place-items-center cursor-pointer">
            <div className={`transition-transform duration-300 ${isHolding || isComplete ? 'scale-110' : 'scale-100'}`}>{children}</div>
        </div>
    );
};

const ChargingElement: React.FC<ChargingElementProps> = ({ name, isCharged, onChargeComplete, style, spriteData, soundSrc }) => {
    const [isHolding, setIsHolding] = useState(false);
    const chargeSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isHolding && !isCharged) {
            chargeSoundRef.current = playSound(soundSrc, 0.4, true);
            timer = setTimeout(() => {
                onChargeComplete(name);
            }, CHARGE_DURATION_ELEMENT);
        }
        return () => {
            clearTimeout(timer);
            chargeSoundRef.current?.pause();
        };
    }, [isHolding, isCharged, name, onChargeComplete, soundSrc]);

    // Scale factor calculation:
    // Sprite sheet items are 256x256.
    // Button container is w-24 h-24 (96px).
    // 96 / 256 = 0.375. We use 0.38 to be safe and fill nicely.
    const scaleStyle = { transform: 'scale(0.38)', transformOrigin: 'center' };

    return (
        <div className="absolute grid place-items-center" style={style}>
            <div
                onMouseDown={() => { if (!isCharged) setIsHolding(true); }}
                onMouseUp={() => setIsHolding(false)}
                onMouseLeave={() => setIsHolding(false)}
                onTouchStart={(e) => { if (!isCharged) { e.preventDefault(); setIsHolding(true); } }}
                onTouchEnd={() => setIsHolding(false)}
                aria-label={`Charge ${name}`}
                role="button"
                aria-pressed={isHolding}
                className={`relative w-24 h-24 cursor-pointer transition-all duration-500 group ${isCharged ? 'pointer-events-none' : ''}`}
            >
                <div className={`w-full h-full flex items-center justify-center transition-all duration-500 ${isCharged ? 'brightness-125 saturate-150 drop-shadow-[0_0_10px_rgba(192,132,252,0.7)]' : 'brightness-75 group-hover:brightness-100'}`}>
                    <div style={scaleStyle}>
                        <Sprite
                            sheetPath={spriteData.sheet.path}
                            x={spriteData.itemInfo.x}
                            y={spriteData.itemInfo.y}
                            spriteWidth={spriteData.sheet.spriteSize.width}
                            spriteHeight={spriteData.sheet.spriteSize.height}
                            sheetWidth={spriteData.sheet.sheetSize.width}
                            sheetHeight={spriteData.sheet.sheetSize.height}
                        />
                    </div>
                </div>
                
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg) scale(1.05)' }}>
                    <circle cx="50" cy="50" r="48" stroke="rgba(255,255,255,0.15)" strokeWidth="3" fill="transparent" />
                    <motion.circle
                        cx="50" cy="50" r="48"
                        stroke="rgba(255, 255, 255, 1)"
                        strokeWidth="4"
                        fill="transparent"
                        pathLength="1"
                        strokeDasharray="1"
                        strokeDashoffset="1"
                        strokeLinecap="round"
                        initial={{ pathLength: 1, strokeDashoffset: 1 }}
                        animate={{ strokeDashoffset: isHolding && !isCharged ? 0 : 1 }}
                        transition={{ duration: CHARGE_DURATION_ELEMENT / 1000, ease: 'linear' }}
                    />
                </svg>
                {isCharged && <div className="absolute inset-0 rounded-full bg-purple-900/30 animate-pulse" />}
            </div>
        </div>
    );
};


export default WiccaMagick;