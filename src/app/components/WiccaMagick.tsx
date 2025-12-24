// --- START OF FILE src/app/components/WiccaMagick.tsx ---
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import type { Session, GeneratedWiccanSpell } from '@/lib/types';
import Link from 'next/link'; // Ensured Import

// Services
import { generateWiccanSpell, saveSpell } from '@/lib/services/geminiService';
import { getSpellById } from '@/lib/services/spellService';
import { buySpellSlots } from '@/lib/services/economyService';

// Hooks
import { useAetherEconomy } from '@/hooks/useAetherEconomy';

// UI Components
import MagickalBackLink from './MagickalBackLink';
import RoomsButton from './RoomsButton';
import LoadingSpinner from './LoadingSpinner';
import { PentagramIcon } from './icons';
import { Sprite } from './Sprite';
import { findSprite } from '@/lib/spriteLibrary';
import { Book, Wand2, Sparkles, Save, Check, RotateCcw, AlertTriangle, BookOpen, Coins } from 'lucide-react';

// --- Configuration ---
const ASSET_PATH = "/images/Spells/Wicca Tradition General";
const CHARGE_DURATION_ELEMENT = 7000;
const CHARGE_DURATION_INGREDIENT = 7000;
const CAST_DURATION = 13000;
const SENDING_DURATION = 4000;
const SERVICE_SLUG = 'ai_wicca_magick'; 

// --- Standard Ritual Data (Free Tier) ---
const STANDARD_WICCAN_SPELL: GeneratedWiccanSpell = {
    title: "Circle of Elemental Balance",
    central_chant: "Eko Eko Azarak, Eko Eko Zomelak.\nBy Earth and Water, Fire and Air,\nI cast this spell with love and care.",
    affirmation: "The Circle is Open, but Unbroken.",
    symbolic_ingredients: [
        { name: "Salt", incantation: "Salt of Earth, purify this space." },
        { name: "Chalice", incantation: "Water of Life, cleanse my spirit." },
        { name: "Athame", incantation: "Air of Intellect, direct my will." },
        { name: "Candle", incantation: "Fire of Passion, ignite my soul." },
        { name: "Pentacle", incantation: "Spirit of All, bind this work." }
    ]
};

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
interface WiccaMagickProps {
    session: Session;
    isSubscribed: boolean;
    onBack?: () => void;
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
    situation: string;
    setSituation: (val: string) => void;
    onBegin: (mode: 'standard' | 'ai') => void;
    isReplay: boolean;
    cost: number; // Added cost prop
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

interface Step9Props {
    spell: GeneratedWiccanSpell;
    onSave: () => void;
    isSaving: boolean;
    isSaved: boolean;
    onReturn: () => void;
}

type SpriteData = NonNullable<ReturnType<typeof findSprite>>;

interface ChargingElementProps {
    name: string;
    isCharged: boolean;
    onChargeComplete: (name: string) => void;
    style: React.CSSProperties;
    spriteData: SpriteData;
    soundSrc: string;
    onHoldStart: () => void;
    onHoldEnd: () => void;
}

interface IngredientChargerProps {
    children: React.ReactNode;
    onChargeComplete: () => void;
    isComplete: boolean;
    onHoldStart: () => void;
    onHoldEnd: () => void;
    isHolding: boolean;
}

// --- Main Component ---
const WiccaMagick: React.FC<WiccaMagickProps> = ({ session, onBack }) => {
    const searchParams = useSearchParams();
    const loadId = searchParams.get('loadId');

    const [ritualStep, setRitualStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    // Economy
    const { 
        cost, 
        spendAether, 
        paymentError, 
        clearPaymentError, 
        showStoreLink, 
        isProcessingPayment 
    } = useAetherEconomy(SERVICE_SLUG);

    const [showSlotModal, setShowSlotModal] = useState(false);
    const [slotLoading, setSlotLoading] = useState(false);

    // Data State
    const [intention, setIntention] = useState('');
    const [situation, setSituation] = useState('');
    const [chargedElements, setChargedElements] = useState<string[]>([]);
    const [selectedDeities, setSelectedDeities] = useState<string[]>([]);
    const [generatedSpell, setGeneratedSpell] = useState<GeneratedWiccanSpell | null>(null);
    const [chargingIndex, setChargingIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isReplayMode, setIsReplayMode] = useState(false);

    // --- REPLAY / HYDRATION LOGIC ---
    useEffect(() => {
        if (loadId) {
            const loadSpell = async () => {
                setLoading(true);
                setLoadingMessage("Opening the Book of Shadows...");
                try {
                    const spell = await getSpellById(loadId);
                    if (spell) {
                        const data = typeof spell.ritual_data === 'string' ? JSON.parse(spell.ritual_data) : spell.ritual_data;
                        
                        // Hydrate
                        setIntention(spell.intention);
                        setSituation(data.situation || '');
                        setSelectedDeities(data.selectedDeities || []);
                        setGeneratedSpell(data.spell || STANDARD_WICCAN_SPELL);
                        
                        setIsReplayMode(true);
                        setIsSaved(true);
                        
                        // Jump to Step 2 (Elements)
                        setRitualStep(2); 
                    }
                } catch (e) {
                    console.error("Failed to load spell", e);
                    setError("Could not retrieve spell data from the Grimoire.");
                } finally {
                    setLoading(false);
                }
            };
            loadSpell();
        }
    }, [loadId]);


    const handleBeginRitual = async (mode: 'standard' | 'ai') => {
        // Replay Bypass
        if (isReplayMode) {
             setRitualStep(2);
             return;
        }

        if (!intention) { setError("An intention must be inscribed to proceed."); return; }
        setError(null);
        clearPaymentError();
        
        if (mode === 'standard') {
            setGeneratedSpell(STANDARD_WICCAN_SPELL);
            setRitualStep(2); 
        } else {
            // AI Mode
            if (!session?.user?.id) {
                setError("You must be logged in to perform High Rituals.");
                return;
            }

            // 1. Charge User
            const paid = await spendAether(session.user.id);
            if (!paid) return; // Hook handles UI

            // 2. Generate
            setLoading(true);
            setLoadingMessage("Communing with the Divine...");
            try {
                const focalPoint = selectedDeities.length > 0 ? selectedDeities.join(', ') : 'The Divine';
                const spell = await generateWiccanSpell({ 
                    intention, 
                    focalPoint, 
                    moonPhase: 'Current',
                    situation: situation 
                });
                setGeneratedSpell(spell);
                setRitualStep(2);
            } catch (err: any) {
                setError(err.message || "The spirits are silent. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleElementChargeComplete = (elementName: string) => {
        if (!chargedElements.includes(elementName)) {
            playSound('/audio/sfx-chaos-activate.mp3', 0.4).play();
            setChargedElements(prev => [...prev, elementName]);
        }
    };
    
    const handleDeityToggle = (deityName: string) => {
        playSound('/audio/sfx-library-portal.mp3', 0.2).play();
        setSelectedDeities(prev => 
            prev.includes(deityName) 
                ? [] 
                : [deityName]
        );
    };

    const handleAdvanceAfterCharge = () => {
        playSound('/audio/sfx-spell-room-portal.mp3', 0.2).play();
        if (generatedSpell && chargingIndex < generatedSpell.symbolic_ingredients.length - 1) {
            setChargingIndex(prev => prev + 1);
        } else {
            setRitualStep(6);
        }
    };

    const handleSaveToGrimoire = async () => {
        if (!generatedSpell || isSaved) return;
        setIsSaving(true);
        setError(null);
        
        try {
             // Save full state for replay
             const ritualData = {
                 intention,
                 situation,
                 selectedDeities,
                 spell: generatedSpell,
                 timestamp: new Date().toISOString()
             };

             await saveSpell(session?.user?.id || 'anon', {
                 name: `Wiccan Spell: ${intention.substring(0, 30)}...`,
                 intention: intention,
                 incantation: generatedSpell.central_chant,
                 element: "Spirit",
                 tradition: 'WICCA', // Critical for routing
                 ritual_data: ritualData
             });

             setIsSaved(true);
             playSound('/audio/sfx-chaos-activate.mp3', 0.5).play();
        } catch (e: any) {
            console.error(e);
            if (e.message === 'GRIMOIRE_FULL') {
                setShowSlotModal(true);
            } else {
                setError("Failed to scribe into Grimoire.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleBuySlots = async () => {
        if (!session?.user?.id) return;
        setSlotLoading(true);
        const success = await buySpellSlots(session.user.id);
        setSlotLoading(false);
        if (success) {
            setShowSlotModal(false);
            handleSaveToGrimoire();
        } else {
            setError("Insufficient Aether to expand Grimoire.");
            setShowSlotModal(false);
        }
    };
    
    const resetState = () => {
        setRitualStep(0);
        setIntention('');
        setSituation('');
        setChargedElements([]);
        setSelectedDeities([]);
        setGeneratedSpell(null);
        setChargingIndex(0);
        setIsSaved(false);
        setIsReplayMode(false);
        setError(null);
        clearPaymentError();

        // Clear URL
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('loadId');
            window.history.replaceState({}, '', url.toString());
        }
    };

    const renderError = () => {
        const msg = paymentError || error;
        const reset = paymentError ? clearPaymentError : () => setError(null);

        return (
            <div className="flex items-center justify-center h-full animate-in fade-in zoom-in">
                <div className="text-center text-red-400 p-6 bg-red-900/50 rounded-lg max-w-sm border border-red-500/50 shadow-xl">
                    <div className="flex justify-center mb-2"><AlertTriangle size={32} /></div>
                    <p className="font-bold text-lg mb-2 uppercase tracking-wider">Ritual Interrupted</p>
                    <p className="mb-6 text-sm text-red-200">{msg}</p>
                    
                    {showStoreLink ? (
                        <div className="flex flex-col gap-3">
                            <Link href="/store" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded transition-colors uppercase tracking-wider text-xs">
                                <Coins size={16} /> Purchase Aether
                            </Link>
                            <button onClick={reset} className="text-xs text-red-300 hover:text-white underline">
                                Dismiss
                            </button>
                        </div>
                    ) : (
                        <button onClick={reset} className="px-6 py-2 border border-red-500 rounded hover:bg-red-900/50 transition-colors uppercase tracking-widest text-xs">
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        );
    };
    
    const renderStep = () => {
        if (loading || isProcessingPayment) return <div className="flex items-center justify-center h-full"><LoadingSpinner title={isProcessingPayment ? "Offering Aether..." : loadingMessage} /></div>;
        if (paymentError || error) return renderError();

        switch (ritualStep) {
            case 0: return <Step0_Intro onNext={() => setRitualStep(1)} />;
            case 1: return <Step1_Intention intention={intention} setIntention={setIntention} situation={situation} setSituation={setSituation} onBegin={handleBeginRitual} onNext={() => {}} isReplay={isReplayMode} cost={cost} />;
            case 2: return <Step2_Elements chargedElements={chargedElements} onChargeComplete={handleElementChargeComplete} onNext={() => setRitualStep(3)} />;
            case 3: return <Step3_Deities selectedDeities={selectedDeities} onToggle={handleDeityToggle} onNext={() => setRitualStep(4)} />;
            case 4: return generatedSpell && <Step4_Components spell={generatedSpell} onNext={() => setRitualStep(5)} />;
            case 5: return generatedSpell && <Step5_ChargeComponent key={`charge-${chargingIndex}`} spell={generatedSpell} chargingIndex={chargingIndex} onNext={handleAdvanceAfterCharge} />;
            case 6: return generatedSpell && <Step6_Incantation spell={generatedSpell} onNext={() => setRitualStep(7)} />;
            case 7: return generatedSpell && <Step7_Cast spell={generatedSpell} onNext={() => setRitualStep(8)} />;
            case 8: return <Step8_Sending onNext={() => setRitualStep(9)} />;
            case 9: return generatedSpell && <Step9_Manifestation spell={generatedSpell} onSave={handleSaveToGrimoire} isSaving={isSaving} isSaved={isSaved} onReturn={resetState} />;
            default: return <Step0_Intro onNext={() => setRitualStep(1)} />;
        }
    };

    return (
        <main className="relative h-screen w-screen bg-black bg-cover bg-center flex flex-col" style={{ backgroundImage: "url('/images/spell-room/spell-room-background.png')" }}>
            <div className="absolute inset-0 bg-black/50" />
            
            <SlotPurchaseModal 
                isOpen={showSlotModal} 
                onClose={() => setShowSlotModal(false)}
                onPurchase={handleBuySlots}
                isProcessing={slotLoading}
            />

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
             {instruction && <p className="text-base text-purple-200/80 mt-2 italic font-light max-w-2xl leading-tight whitespace-pre-line" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>{instruction}</p>}
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
        <div className="relative w-full h-full max-w-md aspect-square @container mx-auto">
            <Image src={`${ASSET_PATH}/wicca_intro_instructions.png`} alt="Instructions" layout="fill" objectFit="contain" priority />
            <div 
                className="absolute flex flex-col items-center justify-center text-center pointer-events-none gap-2 p-2"
                style={{ left: '29.7%', top: '14.8%', width: '42.2%', height: '68.8%' }}
            >
                <h3 className="font-serif text-gray-200" style={{ textShadow: '0 0 8px black', fontSize: 'clamp(0.8rem, 6cqw, 2.25rem)' }}>
                    Wiccan Spellcraft
                </h3>
                <p className="text-gray-300 leading-relaxed" style={{ fontSize: 'clamp(0.6rem, 3.5cqw, 1.1rem)' }}>
                    Enter this realm to do a Wicca-influenced magick spell.
                </p>
            </div>
        </div>
    </StepContainer>
);

const Step1_Intention: React.FC<Step1Props> = ({ intention, setIntention, situation, setSituation, onBegin, isReplay, cost }) => (
    <StepContainer 
        stageTitle="State Your True Will" 
        instruction="Inscribe your deepest desire. For High Rituals, describe your situation to guide the spirits."
    >
        <div className="relative w-full h-full max-w-md mx-auto flex flex-col items-center justify-center gap-4">
            <div className="relative w-full aspect-square @container">
                <Image src={`${ASSET_PATH}/wicca_scroll_intention.png`} alt="Inscribe your intention" layout="fill" objectFit="contain" />
                <div 
                    className="absolute p-4 flex flex-col gap-2"
                    style={{ left: '19.5%', top: '25.9%', width: '59.8%', height: '55.0%' }}
                >
                    <input 
                        value={intention} 
                        onChange={(e) => setIntention(e.target.value)} 
                        readOnly={isReplay}
                        placeholder="Intention (e.g. Find Peace)" 
                        className="w-full bg-transparent border-b border-[#4a2e1c]/50 text-center text-[#4a2e1c] font-serif focus:outline-none placeholder:text-[#4a2e1c]/50" 
                    />
                    <textarea 
                        value={situation} 
                        onChange={(e) => setSituation(e.target.value)} 
                        readOnly={isReplay}
                        placeholder="Details (Optional for Standard, Required for AI)" 
                        className="w-full grow bg-transparent text-center text-[#4a2e1c] font-serif focus:outline-none resize-none text-sm placeholder:text-[#4a2e1c]/50" 
                    />
                </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full max-w-xs">
                {isReplay ? (
                     <button type="button" onClick={() => onBegin('standard')} className="flex items-center justify-center gap-3 p-4 bg-purple-900 border border-purple-500 rounded-lg hover:bg-purple-800 text-white shadow-lg animate-pulse">
                        <RotateCcw className="w-5 h-5" />
                        <div className="font-serif tracking-widest text-sm uppercase">Begin Replay (Free)</div>
                    </button>
                ) : (
                    <>
                        <button type="button" onClick={() => onBegin('standard')} disabled={!intention} className="flex items-center gap-3 p-3 bg-slate-800/80 border border-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50 text-slate-200">
                            <Book className="w-5 h-5 text-slate-300" />
                            <div className="text-left">
                                <div className="text-amber-100 font-serif">Standard Ritual</div>
                                <div className="text-xs text-slate-400">Traditional components. Free.</div>
                            </div>
                        </button>
                        
                        <button type="button" onClick={() => onBegin('ai')} disabled={!intention} className="flex items-center gap-3 p-3 bg-purple-900/60 border border-purple-500 rounded-lg hover:bg-purple-800 disabled:opacity-50 relative overflow-hidden group text-purple-100">
                             <div className="absolute inset-0 bg-purple-500/10 animate-pulse group-hover:bg-purple-500/20"></div>
                            <Wand2 className="w-5 h-5 text-purple-300" />
                            <div className="text-left relative z-10">
                                <div className="text-purple-100 font-serif flex items-center gap-2">High Ritual <Sparkles size={12}/></div>
                                <div className="text-xs text-purple-300">AI-woven spellcraft. {cost} Credits.</div>
                            </div>
                        </button>
                    </>
                )}
            </div>
        </div>
    </StepContainer>
);

const Step2_Elements: React.FC<Step2Props> = ({ chargedElements, onChargeComplete, onNext }) => {
    const elementsData = useMemo(() => [
        { name: 'Spirit', spriteName: 'Wand', sound: '/audio/spirit.mp3', incantation: "I call the Spirit, the cosmic sea\nNow bind this magic and make it be." },
        { name: 'Air', spriteName: 'Athame', sound: '/audio/air.mp3', incantation: "I command the subtle Air\nto carry this spell everywhere." },
        { name: 'Fire', spriteName: 'Bowl of Fire', sound: '/audio/fire.mp3', incantation: "I call vibrant Fire\nTo charge this spell with pure desire." },
        { name: 'Earth', spriteName: 'Sacred Stone', sound: '/audio/earth.mp3', incantation: "I command the ancient Earth\nto give my magic solid worth." },
        { name: 'Water', spriteName: 'Amethyst', sound: '/audio/water.mp3', incantation: "I call the fertile Water\nto make my magic flow and grow." },
    ], []);

    const [activeIncantation, setActiveIncantation] = useState<string | null>(null);

    const getInstructionText = () => {
        const defaultInstruction = "Summon the ancient guardians. Press, hold, and speak the incantation to awaken each sigil's power.";
        const finalInstruction = "The circle is cast. The guardians have answered your call.";

        if (activeIncantation) return activeIncantation;
        if (chargedElements.length === 5) return finalInstruction;
        
        if (chargedElements.length > 0) {
            const lastChargedName = chargedElements[chargedElements.length - 1];
            const lastChargedElementData = elementsData.find(el => el.name === lastChargedName);
            return lastChargedElementData?.incantation || defaultInstruction;
        }
        return defaultInstruction;
    };

    return (
        <StepContainer stageTitle="Call the Elemental Guardians" instruction={getInstructionText()} button={chargedElements.length === 5 ? <RitualButton onClick={onNext} className="animate-pulse">Continue</RitualButton> : <div/>}>
            <div className="relative w-full h-full flex items-center justify-center p-2">
                <div className="relative h-full aspect-square max-w-full">
                    {elementsData.map((el, i) => {
                        const spriteData = findSprite(el.spriteName);
                        if (!spriteData) return <div key={el.name} className="absolute text-xs text-red-400">Missing: {el.spriteName}</div>;
                        const positions = [ { top: '10%', left: '50%'}, { top: '45%', left: '90%'}, { top: '90%', left: '75%'},  { top: '90%', left: '25%'}, { top: '45%', left: '10%'} ];
                        return ( <ChargingElement 
                                    key={el.name} 
                                    name={el.name} 
                                    isCharged={chargedElements.includes(el.name)} 
                                    onChargeComplete={onChargeComplete} 
                                    style={{...positions[i], transform: 'translate(-50%, -50%)'}} 
                                    spriteData={spriteData} 
                                    soundSrc={el.sound} 
                                    onHoldStart={() => setActiveIncantation(el.incantation)}
                                    onHoldEnd={() => setActiveIncantation(null)}
                                /> );
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
    const [isHolding, setIsHolding] = useState(false);

    const handleChargeComplete = () => {
        setIsComplete(true);
        setIsHolding(false); 
    };

    const currentIngredient = spell.symbolic_ingredients[chargingIndex];
    const spriteData = findSprite(currentIngredient.name);

    const getInstruction = () => {
        const incantation = currentIngredient.incantation || spriteData?.itemInfo.incantation || "Charge this item.";
        if (isComplete) return "Charged. " + incantation;
        if (isHolding) return incantation;
        return `Press, hold, and speak the incantation to imbue the ${currentIngredient.name} with your will.`;
    };

    return (
        <StepContainer 
            stageTitle="Imbue with Aether"
            instruction={getInstruction()}
            button={isComplete ? <RitualButton onClick={onNext} className="animate-pulse">{chargingIndex < spell.symbolic_ingredients.length - 1 ? "Charge Next Component" : "Continue to Incantation"}</RitualButton> : <div/>}
        >
            <div className="relative w-full h-full max-w-lg aspect-square mx-auto">
                <Image src={`${ASSET_PATH}/wicca_charge_ingredient_template.png`} alt="Charge Component" layout="fill" objectFit="contain" />
                 <IngredientCharger 
                    onChargeComplete={handleChargeComplete} 
                    isComplete={isComplete}
                    onHoldStart={() => setIsHolding(true)}
                    onHoldEnd={() => setIsHolding(false)}
                    isHolding={isHolding}
                >
                    {spriteData && (
                        <div className="w-40 h-40">
                            <Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} />
                        </div>
                    )}
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
        <div className="relative w-full h-full max-w-md aspect-square @container mx-auto">
            <Image src={`${ASSET_PATH}/wicca_incantation_scroll.png`} alt="Incantation Scroll" layout="fill" objectFit="contain" />
            <div 
                className="absolute flex items-center justify-center p-4"
                style={{ left: '19.5%', top: '25.9%', width: '59.8%', height: '55.0%' }}
            >
                <p className="font-serif text-[#4a2e1c] text-center whitespace-pre-line leading-relaxed" style={{fontSize: 'clamp(0.6rem, 4cqw, 1.75rem)'}}>{spell.central_chant}</p>
            </div>
        </div>
    </StepContainer>
);

const Step7_Cast: React.FC<SpellStepProps> = ({ spell, onNext }) => {
    const [isCasting, setIsCasting] = useState(false);
    const [count, setCount] = useState(0);
    const castSoundRef = useRef<any>(null);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        let counter: NodeJS.Timeout;
        if (isCasting) {
            castSoundRef.current = playSound('/audio/sfx-chaos-hold.mp3', 0.4, true);
            setCount(1);
            counter = setInterval(() => setCount(prev => prev < 13 ? prev + 1 : 13), 1000);
            timer = setTimeout(() => {
                onNext();
            }, CAST_DURATION);
        }
        return () => {
            clearTimeout(timer);
            clearInterval(counter);
            setCount(0);
            if(castSoundRef.current) castSoundRef.current.pause();
        };
    }, [isCasting, onNext]);

    const interactionStyle: React.CSSProperties = {
        WebkitTouchCallout: 'none',
    };

    return (
        <StepContainer 
            stageTitle="Unleash the Magick" 
            instruction="The moment is now. Gather your will and release the spell into the aether."
            button={<div/>}
        >
            <div className="relative w-full max-w-2xl h-full flex items-center justify-center">
                <div 
                    onMouseDown={() => setIsCasting(true)} 
                    onMouseUp={() => setIsCasting(false)} 
                    onMouseLeave={() => setIsCasting(false)} 
                    onTouchStart={() => setIsCasting(true)} 
                    onTouchEnd={() => setIsCasting(false)} 
                    onContextMenu={(e) => e.preventDefault()}
                    style={interactionStyle}
                    className="relative w-full max-w-full max-h-full aspect-square cursor-pointer select-none"
                >
                    <Image src={`${ASSET_PATH}/wicca_pentagram_ready_to_cast.png`} layout="fill" objectFit="contain" alt="Cast the Spell" />
                    <PentagramIcon className="absolute w-full h-full text-white pointer-events-none" isTracing={isCasting} />
                    {spell.symbolic_ingredients.map((ing, i) => {
                        const spriteData = findSprite(ing.name);
                        if(!spriteData) return null;
                        const positions = [ { top: '0%', left: '50%'}, { top: '34.5%', left: '97.5%'}, { top: '90.4%', left: '79.3%'}, { top: '90.4%', left: '20.6%'}, { top: '34.5%', left: '2.5%'} ];
                        return <div key={i} className="absolute w-16 h-16 pointer-events-none" style={{...positions[i], transform: 'translate(-50%, -50%)'}}> <Sprite sheetPath={spriteData.sheet.path} x={spriteData.itemInfo.x} y={spriteData.itemInfo.y} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} /> </div>
                    })}
                    
                    <AnimatePresence>
                    {isCasting && count > 0 ? (
                        <motion.div 
                            key="counter"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <span className="font-serif text-8xl text-white" style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 25px rgba(192, 132, 252, 0.6)' }}>
                                {count}
                            </span>
                        </motion.div>
                    ) : (
                        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-2xl pointer-events-none text-center text-white" style={{ textShadow: '0 0 10px black' }}>Hold to Focus Your Will and<br/>Cast the Spell</p>
                    )}
                    </AnimatePresence>
                </div>
            </div>
        </StepContainer>
    );
};

const Step8_Sending: React.FC<StepProps> = ({ onNext }) => {
    useEffect(() => {
        playSound('/audio/sfx-chaos-explosion.mp3', 0.5);
        const timer = setTimeout(onNext, SENDING_DURATION);
        return () => clearTimeout(timer);
    }, [onNext]);

    const particles = useMemo(() => Array.from({ length: 150 }).map((_, i) => {
        const angle = Math.random() * 2 * Math.PI;
        const radius = 300 + Math.random() * 400;
        const duration = 2 + Math.random() * 2;
        const delay = Math.random() * 1;
        const size = 3 + Math.random() * 4;
        const colors = ['#FFFFFF', '#FFD700', '#C0C0C0'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        return {
            id: i,
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
            size,
            duration,
            delay,
            color,
            rotate: Math.random() * 360,
        };
    }), []);

    return (
        <StepContainer>
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: [0, 1, 1, 0], y: 0 }}
                    transition={{ duration: SENDING_DURATION / 1000, times: [0, 0.2, 0.8, 1] }}
                    className="text-3xl font-serif text-amber-200/90 z-10"
                >
                    The Spell is Sent
                </motion.p>
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full"
                        style={{
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                        }}
                        initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1, 0.8, 0],
                            x: [0, p.x * 0.3, p.x],
                            y: [0, p.y * 0.5, p.y],
                            rotate: p.rotate,
                        }}
                        transition={{
                            duration: p.duration,
                            delay: p.delay,
                            ease: "easeOut",
                        }}
                    />
                ))}
            </div>
        </StepContainer>
    );
};

const Step9_Manifestation: React.FC<Step9Props & { onReturn: () => void }> = ({ spell, onSave, isSaving, isSaved, onReturn }) => (
     <StepContainer 
        stageTitle="Witness the Manifestation" 
        instruction="So mote it be. Your will is in motion. Trust in the magick you have woven."
    >
        <div className="relative w-full h-full max-w-2xl aspect-square @container mx-auto flex flex-col items-center">
            <div className="relative w-full grow">
                 <Image src={`${ASSET_PATH}/wicca_spell_manifestation.png`} alt="Spell Manifestation" layout="fill" objectFit="contain" />
                <div 
                    className="absolute flex items-center justify-center p-4"
                    style={{ left: '31.8%', top: '28.0%', width: '36.4%', height: '58.0%' }}
                >
                    <p className="text-center text-white font-serif" style={{fontSize: 'clamp(0.5rem, 2.5cqw, 2rem)'}}>{spell.affirmation}</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-4 w-full max-w-xs">
                <button onClick={onSave} disabled={isSaved || isSaving} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-900/60 border border-indigo-400 text-indigo-100 font-serif rounded hover:bg-indigo-800 disabled:opacity-50 transition-colors">
                    {isSaved ? <Check size={18} /> : <Save size={18} />}
                    {isSaved ? "Saved to Grimoire" : isSaving ? "Saving..." : "Save to Grimoire (1 Credit)"}
                </button>
                <RitualButton onClick={onReturn} className="w-full">
                    Return to Altar
                </RitualButton>
            </div>
        </div>
    </StepContainer>
);

// --- Helper components for complex interactions ---

const IngredientCharger: React.FC<IngredientChargerProps> = ({ children, onChargeComplete, isComplete, onHoldStart, onHoldEnd, isHolding }) => {
    const chargeSoundRef = useRef<any>(null);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if(isHolding && !isComplete) {
            chargeSoundRef.current = playSound('/audio/sfx-chaos-hold.mp3', 0.3, true);
            timer = setTimeout(() => {
                onChargeComplete();
            }, CHARGE_DURATION_INGREDIENT)
        }
        return () => {
            clearTimeout(timer);
            if(chargeSoundRef.current) chargeSoundRef.current.pause();
        }
    }, [isHolding, isComplete, onChargeComplete]);
    
    const interactionStyle: React.CSSProperties = { WebkitTouchCallout: 'none' };
    const circleVariants = { hidden: { strokeDashoffset: 1 }, visible: { strokeDashoffset: 0 } };

    return (
        <div 
            onMouseDown={onHoldStart} 
            onMouseUp={onHoldEnd} 
            onMouseLeave={onHoldEnd} 
            onTouchStart={onHoldStart} 
            onTouchEnd={onHoldEnd} 
            onContextMenu={(e) => e.preventDefault()}
            style={interactionStyle}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] grid place-items-center cursor-pointer select-none"
        >
            <div className={`relative transition-transform duration-300 ${isHolding || isComplete ? 'scale-110' : 'scale-100'}`}>
                {children}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg) scale(1.2)' }}>
                    <motion.circle
                        cx="50" cy="50" r="48"
                        stroke="rgba(255, 255, 255, 1)"
                        strokeWidth="4"
                        fill="transparent"
                        strokeLinecap="round"
                        pathLength="1"
                        strokeDasharray="1"
                        variants={circleVariants}
                        initial="hidden"
                        animate={isComplete || (isHolding && !isComplete) ? "visible" : "hidden"}
                        transition={{ duration: isComplete ? 0 : CHARGE_DURATION_INGREDIENT / 1000, ease: 'linear' }}
                    />
                </svg>
                {isComplete && <div className="absolute inset-0 rounded-full bg-purple-900/30 animate-pulse" />}
            </div>
        </div>
    );
};

const ChargingElement: React.FC<ChargingElementProps> = ({ name, isCharged, onChargeComplete, style, spriteData, soundSrc, onHoldStart, onHoldEnd }) => {
    const [isHolding, setIsHolding] = useState(false);
    const chargeSoundRef = useRef<any>(null);

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
            if(chargeSoundRef.current) chargeSoundRef.current.pause();
        };
    }, [isHolding, isCharged, name, onChargeComplete, soundSrc]);

    const { sheet, itemInfo } = spriteData;
    const containerSize = 96; // Corresponds to w-24/h-24
    const scale = containerSize / sheet.spriteSize.width;

    const spriteStyle: React.CSSProperties = {
        backgroundImage: `url(${sheet.path})`,
        backgroundSize: `${sheet.sheetSize.width * scale}px ${sheet.sheetSize.height * scale}px`,
        backgroundPosition: `${itemInfo.x * scale}px ${itemInfo.y * scale}px`,
        WebkitTouchCallout: 'none',
    };

    const circleVariants = {
        hidden: { strokeDashoffset: 1 },
        visible: { strokeDashoffset: 0 }
    };

    const handlePress = () => {
        if (!isCharged) {
            setIsHolding(true);
            onHoldStart();
        }
    };

    const handleRelease = () => {
        if (isHolding) {
            setIsHolding(false);
            onHoldEnd();
        }
    };

    return (
        <div className="absolute grid place-items-center" style={style}>
            <div
                onMouseDown={handlePress}
                onMouseUp={handleRelease}
                onMouseLeave={handleRelease}
                onTouchStart={(e) => { e.preventDefault(); handlePress(); }}
                onTouchEnd={handleRelease}
                onContextMenu={(e) => e.preventDefault()}
                aria-label={`Charge ${name}`}
                role="button"
                aria-pressed={isHolding}
                style={spriteStyle}
                className={`relative w-24 h-24 cursor-pointer transition-all duration-500 group overflow-hidden rounded-full select-none ${isCharged ? 'pointer-events-none' : ''}`}
            >
                {/* Overlay for brightness/saturation effects */}
                <div className={`absolute inset-0 w-full h-full transition-all duration-500 ${isCharged ? 'brightness-125 saturate-150' : 'brightness-75 group-hover:brightness-100'}`} />
                
                {/* SVG on top for tracing animation */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="48" stroke="rgba(255,255,255,0.15)" strokeWidth="3" fill="transparent" />
                    <motion.circle
                        cx="50" cy="50" r="48"
                        stroke="rgba(255, 255, 255, 1)"
                        strokeWidth="4"
                        fill="transparent"
                        strokeLinecap="round"
                        pathLength="1"
                        strokeDasharray="1"
                        variants={circleVariants}
                        initial="hidden"
                        animate={isCharged || isHolding ? "visible" : "hidden"}
                        transition={{ duration: isCharged ? 0 : CHARGE_DURATION_ELEMENT / 1000, ease: 'linear' }}
                    />
                </svg>

                {isCharged && <div className="absolute inset-0 rounded-full bg-purple-900/30 animate-pulse" />}
            </div>
        </div>
    );
};

const SlotPurchaseModal = ({ isOpen, onClose, onPurchase, isProcessing }: { isOpen: boolean, onClose: () => void, onPurchase: () => void, isProcessing: boolean }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in">
            <div className="bg-[#1a1a2e] border border-amber-500/50 rounded-xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(251,191,36,0.2)]">
                <BookOpen size={48} className="text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-serif text-amber-100 mb-2">Grimoire Full</h3>
                <p className="text-gray-400 text-sm mb-6">
                    Your book of shadows has reached its capacity. Expand your grimoire by 5 slots to continue saving your workings.
                </p>
                <div className="flex flex-col gap-3">
                    <button onClick={onPurchase} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded uppercase tracking-wider text-xs transition-colors disabled:opacity-50">
                        {isProcessing ? "Expanding..." : "Expand Storage (-10 Aether)"}
                    </button>
                    <button onClick={onClose} className="text-gray-500 hover:text-white text-xs underline">Cancel</button>
                </div>
            </div>
        </div>
    );
};


export default WiccaMagick;
// --- END OF FILE src/app/components/WiccaMagick.tsx ---