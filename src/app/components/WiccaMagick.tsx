// --- START OF FILE src/app/components/WiccaMagick.tsx ---
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import type { Session, GeneratedWiccanSpell, WiccanDeitySuggestion, WiccanIngredient } from '@/lib/types';

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
import { Sprite } from './Sprite';
import { findSprite } from '@/lib/spriteLibrary';
import { Save, Check, BookOpen, ArrowRight, Lock } from 'lucide-react';

// --- Configuration ---
const ASSET_PATH = "/images/Spells/Wicca Tradition General";
const CHARGE_DURATION_ELEMENT = 7000;
const CHARGE_DURATION_INGREDIENT = 6000;
const CAST_DURATION = 13000;
const SENDING_DURATION = 4000;
const SERVICE_SLUG = 'ai_wicca_magick'; 

// --- Audio Paths ---
const AUDIO = {
    AMBIENCE: '/audio/bg-ritual-ambience.mp3',
    FIRE: '/audio/sfx-element-fire.mp3',
    AIR: '/audio/sfx-element-air.mp3',
    EARTH: '/audio/sfx-element-earth.mp3',
    WATER: '/audio/sfx-element-water.mp3',
    SPIRIT: '/audio/sfx-element-spirit.mp3',
    WHOOSH: '/audio/sfx-energy-whoosh.mp3',
    SCRIBING: '/audio/sfx-scribing.mp3',
    SHIMMER: '/audio/sfx-shimmer.mp3',
    HUM: '/audio/sfx-energy-hum.mp3',
    PARCHMENT: '/audio/sfx-parchment-open.mp3',
    MATCH: '/audio/sfx-match-strike.mp3',
    THUD: '/audio/sfx-stone-thud.mp3',
    BELL: '/audio/sfx-ritual-bell.mp3',
    RISER: '/audio/sfx-power-riser.mp3',
};

// --- Data Types Extended ---
interface ExtendedWiccanDeitySuggestion extends WiccanDeitySuggestion {
    invocation?: string;
}

interface ExtendedGeneratedWiccanSpell extends GeneratedWiccanSpell {
    suggested_deities: ExtendedWiccanDeitySuggestion[];
    tool_consecration?: string;
}

// --- Standard Ritual Data ---
const STANDARD_WICCAN_SPELL: ExtendedGeneratedWiccanSpell = {
    title: "Circle of Elemental Balance",
    transitional_incantations: {
        sanctification: "By my will and by my word,\nLet this sacred space be heard.",
        circle_casting: "I cast this Circle, a shield deep and wide,\nTo keep the magick safe inside.",
        invocation: "Lord and Lady, spirits near,\nWelcome to this circle here.",
        closing: "The Circle is Open, but Unbroken,\nPeace and love be the token."
    },
    tool_consecration: "With these tools and sacred art,\nI weave the magic from my heart.",
    central_chant: "Eko Eko Azarak, Eko Eko Zomelak.\nBy Earth and Water, Fire and Air,\nI cast this spell with love and care.",
    affirmation: "So mote it be.",
    suggested_deities: [
        { 
            name: "Triple Moon", 
            title: "Mother of All", 
            pantheon: "Wiccan", 
            description: "The Maiden, Mother, and Crone.",
            invocation: "Maiden, Mother, Crone so bright,\nBless this circle with your light."
        },
        { 
            name: "Horned God", 
            title: "Lord of the Wild", 
            pantheon: "Wiccan", 
            description: "The protector of nature and cycle.",
            invocation: "Stag and Hunter, Lord of Green,\nWalk among us, unseen."
        },
        { 
            name: "Hecate", 
            title: "Queen of Witches", 
            pantheon: "Greek", 
            description: "Goddess of magic, crossroads, and ghosts.",
            invocation: "Queen of Shadows, Torch in hand,\nGuide us through the spirit land."
        }
    ],
    symbolic_ingredients: [
        { name: "Salt", incantation: "Salt of Earth, purify this space." },
        { name: "Chalice", incantation: "Water of Life, cleanse my spirit." },
        { name: "Athame", incantation: "Air of Intellect, direct my will." },
        { name: "White Candle", incantation: "Fire of Passion, ignite my soul." },
        { name: "Pentacle", incantation: "Spirit of All, bind this work." }
    ],
    elemental_chants: {
        Spirit: "I call the Spirit, the cosmic sea\nNow bind this magic and make it be.",
        Air: "I command the subtle Air\nto carry this spell everywhere.",
        Fire: "I call vibrant Fire\nTo charge this spell with pure desire.",
        Earth: "I command the ancient Earth\nto give my magic solid worth.",
        Water: "I call the fertile Water\nto make my magic flow and grow."
    }
};

// --- Sound Utility ---
const playSound = (src: string, volume: number = 0.5, loop: boolean = false): { play: () => void; stop: () => void; } => {
    const win = (globalThis as any).window;
    if (typeof win === 'undefined') return { play: () => {}, stop: () => {} };
    const AudioCtor = win.Audio;
    const audio = new AudioCtor(src);
    audio.volume = volume;
    audio.loop = loop;
    const play = () => audio.play().catch((e: any) => console.error(`Failed to play: ${src}`, e));
    const stop = () => { audio.pause(); audio.currentTime = 0; };
    return { play, stop };
};

// --- Helper Components ---

const PentagramSVG = ({ isTracing, duration }: { isTracing: boolean, duration: number }) => {
    return (
        <svg viewBox="0 0 100 100" className={`absolute inset-0 w-full h-full ${isTracing ? 'text-amber-400 drop-shadow-[0_0_25px_gold]' : 'text-purple-900'} transition-colors duration-1000 overflow-visible`}>
             <path 
                d="M 50 5 L 63 40 L 98 40 L 70 60 L 80 95 L 50 75 L 20 95 L 30 60 L 2 40 L 37 40 Z"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1" 
                className="opacity-20"
             />
             <motion.path
                d="M 50 5 L 80 95 L 2 40 L 98 40 L 20 95 L 50 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: isTracing ? 1 : 0 }}
                transition={{ duration: isTracing ? (duration - 1000) / 1000 : 0, ease: "linear" }}
             />
        </svg>
    );
};

const InteractionRing = ({ isHolding, isComplete, duration }: { isHolding: boolean, isComplete: boolean, duration: number }) => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg) scale(1.0)' }}>
        <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="transparent" />
        <motion.circle
            cx="50" cy="50" r="46"
            stroke="rgba(168, 85, 247, 1)"
            strokeWidth="3"
            fill="transparent"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            initial={{ strokeDashoffset: 1 }}
            animate={{ strokeDashoffset: isComplete ? 0 : (isHolding ? 0 : 1) }}
            transition={{ duration: isComplete ? 0 : duration / 1000, ease: 'linear' }}
            className="drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
        />
    </svg>
);

interface OverlayProps {
    text: string;
    onConfirm: () => void;
    isVisible: boolean;
    ingredient?: WiccanIngredient;
}

const IncantationOverlay = ({ text, onConfirm, isVisible, ingredient }: OverlayProps) => {
    const sprite = ingredient ? (findSprite(ingredient.name) || findSprite("White Candle")) : null;

    useEffect(() => {
        if(isVisible) playSound(AUDIO.PARCHMENT, 0.5).play();
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center p-2"
                >
                    <motion.div 
                        initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
                        // Fixed aspect ratio syntax warnings by using standard or arbitrary correctly (arbitrary is kept as per design)
                        className="relative w-full max-w-md h-auto aspect-[958/860] flex flex-col items-center justify-center filter drop-shadow-2xl"
                    >
                        <Image src={`${ASSET_PATH}/wicca_incantation_scroll.png`} alt="Incantation" layout="fill" objectFit="contain" priority />
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12 text-center">
                            {/* Lowered Text using mt-6 */}
                            <h3 className="font-serif text-[#4a2e1c]/70 text-[10px] md:text-xs mb-2 uppercase tracking-widest mt-6">Spoken Word</h3>
                            
                            {/* Larger Icon (+30%) */}
                            {ingredient && sprite && (
                                <div className="w-14 h-14 md:w-20 md:h-20 my-2 opacity-90 shrink-0">
                                     <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={sprite.sheet.spriteSize.width} spriteHeight={sprite.sheet.spriteSize.height} sheetWidth={sprite.sheet.sheetSize.width} sheetHeight={sprite.sheet.sheetSize.height} />
                                </div>
                            )}

                            <div className="w-full px-4 flex items-center justify-center grow overflow-y-auto scrollbar-hide py-2">
                                <p className="font-serif text-[#4a2e1c] text-lg md:text-xl leading-tight whitespace-pre-line drop-shadow-xs">
                                    {text}
                                </p>
                            </div>

                            <button 
                                onClick={() => { playSound(AUDIO.THUD, 0.6).play(); onConfirm(); }}
                                className="mt-2 px-6 py-2 border-y-2 border-[#4a2e1c] text-[#4a2e1c] hover:bg-[#4a2e1c]/10 font-serif font-bold uppercase tracking-widest transition-all hover:scale-105 text-xs md:text-sm mb-4"
                            >
                                So Mote It Be
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
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

// --- Main Component ---
const WiccaMagick = ({ session, onBack }: { session: Session, isSubscribed: boolean, onBack?: () => void }) => {
    const searchParams = useSearchParams();
    const loadId = searchParams.get('loadId');

    const [ritualStep, setRitualStep] = useState(0);
    const [subStep, setSubStep] = useState<'incantation' | 'action'>('action'); 

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    const { cost, spendAether, paymentError, clearPaymentError } = useAetherEconomy(SERVICE_SLUG);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [slotLoading, setSlotLoading] = useState(false);

    // Data State
    const [intention, setIntention] = useState('');
    const [situation, setSituation] = useState('');
    const [generatedSpell, setGeneratedSpell] = useState<ExtendedGeneratedWiccanSpell | null>(null);
    
    // Ritual State
    const [chargedElements, setChargedElements] = useState<string[]>([]);
    const [selectedDeity, setSelectedDeity] = useState<ExtendedWiccanDeitySuggestion | null>(null);
    const [chargingIndex, setChargingIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isReplayMode, setIsReplayMode] = useState(false);

    // Ambience
    useEffect(() => {
        const ambience = playSound(AUDIO.AMBIENCE, 0.2, true);
        ambience.play();
        return () => ambience.stop();
    }, []);

    // --- Hydration ---
    useEffect(() => {
        if (loadId) {
            const load = async () => {
                setLoading(true);
                setLoadingMessage("Restoring the Ritual...");
                try {
                    const s = await getSpellById(loadId);
                    if (s) {
                        const d = typeof s.ritual_data === 'string' ? JSON.parse(s.ritual_data) : s.ritual_data;
                        setIntention(s.intention);
                        setSituation(d.situation || '');
                        if (d.selectedDeity) setSelectedDeity(d.selectedDeity);
                        // CRITICAL: Load saved spell data if available, do not default to standard if saved
                        if (d.spell) setGeneratedSpell(d.spell);
                        else setGeneratedSpell(STANDARD_WICCAN_SPELL);
                        
                        setIsReplayMode(true);
                        setIsSaved(true);
                        setRitualStep(1);
                    }
                } catch { setError("Could not restore ritual."); } finally { setLoading(false); }
            };
            load();
        }
    }, [loadId]);

    const handleBegin = async (mode: 'standard' | 'ai') => {
        if (!intention) { setError("Intention is required."); return; }
        setError(null); clearPaymentError();
        playSound(AUDIO.THUD, 0.5).play();

        if (mode === 'standard') {
            setGeneratedSpell(STANDARD_WICCAN_SPELL);
            setRitualStep(2);
            setSubStep('incantation');
        } else {
            if (!session?.user?.id) { setError("Sign in required."); return; }
            const paid = await spendAether(session.user.id);
            if (!paid) return;
            
            setLoading(true);
            setLoadingMessage("Communing with the Spirits...");
            try {
                const s: any = await generateWiccanSpell({ intention, focalPoint: 'The Divine', moonPhase: 'Current', situation });
                
                const mergedSpell: ExtendedGeneratedWiccanSpell = {
                    title: s.title || STANDARD_WICCAN_SPELL.title,
                    central_chant: s.central_chant || STANDARD_WICCAN_SPELL.central_chant,
                    affirmation: s.affirmation || STANDARD_WICCAN_SPELL.affirmation,
                    symbolic_ingredients: (s.symbolic_ingredients && s.symbolic_ingredients.length > 0) ? s.symbolic_ingredients : STANDARD_WICCAN_SPELL.symbolic_ingredients,
                    suggested_deities: (s.suggested_deities && s.suggested_deities.length > 0) ? s.suggested_deities : STANDARD_WICCAN_SPELL.suggested_deities,
                    transitional_incantations: s.transitional_incantations || STANDARD_WICCAN_SPELL.transitional_incantations,
                    elemental_chants: s.elemental_chants || STANDARD_WICCAN_SPELL.elemental_chants,
                    tool_consecration: s.tool_consecration || STANDARD_WICCAN_SPELL.tool_consecration
                };
                
                setGeneratedSpell(mergedSpell);
                setRitualStep(2);
                setSubStep('incantation');
            } catch (e: any) { setError(e.message); } finally { setLoading(false); }
        }
    };

    const nextStep = () => {
        const next = ritualStep + 1;
        setRitualStep(next);
        if ([5, 8, 9, 11].includes(next)) setSubStep('action');
        else setSubStep('incantation');
    };

    const handleIncantationConfirm = () => setSubStep('action');

    const handleElementCharge = (name: string) => {
        if (!chargedElements.includes(name)) {
            setChargedElements(prev => [...prev, name]);
            playSound('/audio/sfx-chaos-activate.mp3', 0.5).play();
        }
    };

    const handleIngredientComplete = () => {
        playSound(AUDIO.BELL, 0.4).play();
        if (generatedSpell && chargingIndex < generatedSpell.symbolic_ingredients.length - 1) {
            setChargingIndex(prev => prev + 1);
            setSubStep('incantation');
        } else {
            nextStep();
        }
    };

    const handleSave = async () => {
        if (!generatedSpell || isSaved) return;
        playSound(AUDIO.SCRIBING, 0.5).play();
        
        if (session?.user?.id && !isReplayMode) {
             const paid = await spendAether(session.user.id);
             if (!paid) return;
        }

        setIsSaving(true);
        try {
            const ritualData = { intention, situation, selectedDeity, spell: generatedSpell };
            await saveSpell(session?.user?.id || 'anon', {
                name: `Wicca: ${intention.substring(0,20)}`,
                intention,
                incantation: generatedSpell.central_chant,
                tradition: 'WICCA',
                ritual_data: ritualData 
            });
            setIsSaved(true);
            playSound(AUDIO.BELL, 0.6).play();
        } catch (e: any) {
            if (e.message === 'GRIMOIRE_FULL') setShowSlotModal(true);
            else setError("Failed to scribe.");
        } finally { setIsSaving(false); }
    };

    const handleBuySlots = async () => {
        if (!session?.user?.id) return;
        setSlotLoading(true);
        const success = await buySpellSlots(session.user.id);
        setSlotLoading(false);
        if (success) {
            setShowSlotModal(false);
            handleSave();
        } else {
            setError("Insufficient Aether to expand Grimoire.");
            setShowSlotModal(false);
        }
    };

    const getCurrentIncantation = () => {
        if (!generatedSpell) return "";
        const trans = generatedSpell.transitional_incantations || STANDARD_WICCAN_SPELL.transitional_incantations;
        switch (ritualStep) {
            case 2: return trans?.sanctification || "By my will, I begin.";
            case 3: return "Guardians of the Watchtowers,\nHail and Welcome!";
            case 4: return trans?.invocation || "Spirits of Light, draw near.";
            // Step 5 is Candles (handled inside component)
            // Step 6: Tool Consecration Scroll (After Candles)
            case 6: return generatedSpell.tool_consecration || "With these tools and sacred art,\nI weave the magic from my heart.";
            case 7: return generatedSpell.symbolic_ingredients[chargingIndex]?.incantation || "I charge this item.";
            case 10: return trans?.closing || "The Circle is open.";
            default: return "";
        }
    };

    const getCurrentIngredient = () => {
        if (ritualStep === 7 && generatedSpell) {
            return generatedSpell.symbolic_ingredients[chargingIndex];
        }
        return undefined;
    }

    const renderContent = () => {
        if (loading) return <LoadingSpinner title={loadingMessage} />;
        if (error || paymentError) return <div className="text-center p-8 text-red-300">{error || paymentError} <button onClick={() => { setError(null); clearPaymentError(); }} className="block mx-auto mt-4 underline">Dismiss</button></div>;

        if (subStep === 'incantation' && generatedSpell) {
            return <IncantationOverlay text={getCurrentIncantation()} onConfirm={handleIncantationConfirm} isVisible={true} ingredient={getCurrentIngredient()} />;
        }

        switch (ritualStep) {
            case 0: return <Step0_Intro onNext={() => { playSound(AUDIO.THUD, 0.5).play(); setRitualStep(1); }} />;
            case 1: return <Step1_Intention intention={intention} setIntention={setIntention} situation={situation} setSituation={setSituation} onBegin={handleBegin} isReplay={isReplayMode} cost={cost} />;
            case 2: return <Step2_CastCircle onComplete={nextStep} />;
            case 3: return <Step3_Quarters spell={generatedSpell} charged={chargedElements} onCharge={handleElementCharge} onNext={nextStep} />;
            case 4: return <Step4_Deities suggestions={generatedSpell?.suggested_deities || []} onSelect={(d) => { playSound(AUDIO.THUD, 0.5).play(); setSelectedDeity(d); nextStep(); }} isReplay={isReplayMode} savedDeity={selectedDeity} />;
            case 5: return <Step5_DeityCandles deity={selectedDeity} onComplete={nextStep} />;
            case 6: return <Step6_Summary spell={generatedSpell!} onNext={() => { playSound(AUDIO.THUD, 0.5).play(); nextStep(); }} />;
            case 7: return <Step7_Ingredients spell={generatedSpell!} index={chargingIndex} onComplete={handleIngredientComplete} />;
            case 8: return <Step8_Cone spell={generatedSpell!} onNext={nextStep} />;
            case 9: return <Step9_Sending onNext={nextStep} />;
            case 10: return <Step10_Closing onComplete={nextStep} />;
            case 11: return <Step11_Result spell={generatedSpell!} onSave={handleSave} isSaving={isSaving} isSaved={isSaved} onReset={() => { playSound(AUDIO.THUD, 0.5).play(); window.location.reload(); }} />;
            default: return null;
        }
    };

    return (
        <main className="relative h-dvh w-screen bg-black flex flex-col font-sans select-none overflow-hidden">
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(168, 85, 247, 0.3);
                    border-radius: 20px;
                }
            `}</style>

            {ritualStep === 11 && (
                 <div className="absolute inset-0 z-0 animate-in fade-in duration-1000">
                    <Image src={`${ASSET_PATH}/wicca_spell_manifestation.png`} layout="fill" objectFit="cover" alt="Manifestation" />
                    <div className="absolute inset-0 bg-black/40" />
                 </div>
            )}
            
            {ritualStep !== 11 && (
                <div className="absolute inset-0 z-0">
                    <Image 
                        src="/images/spell-room/spell-room-background.png" 
                        layout="fill" 
                        objectFit="cover" 
                        alt="Background" 
                        className="opacity-50" 
                        priority 
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
                </div>
            )}
            
            <header className="relative z-20 w-full px-4 h-16 md:h-24 shrink-0 flex items-center justify-between pt-2 md:pt-4">
                <div className="relative z-30 w-16 flex justify-start">
                    <MagickalBackLink href="/spell-room" text="Exit" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 pt-2 md:pt-4">
                    <h1 className="font-serif text-base md:text-3xl text-purple-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide text-center">
                        Wicca Magick
                    </h1>
                </div>
                <div className="relative z-30 w-16 flex justify-end origin-right transform scale-50 md:scale-100">
                    <RoomsButton />
                </div>
            </header>
            
            <div className="relative z-10 grow w-full flex flex-col px-4 pb-2 min-h-0 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={ritualStep + subStep}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full flex flex-col min-h-0"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <SlotPurchaseModal 
                isOpen={showSlotModal} 
                onClose={() => setShowSlotModal(false)}
                onPurchase={handleBuySlots}
                isProcessing={slotLoading}
            />
        </main>
    );
};

const Step0_Intro = ({ onNext }: { onNext: () => void }) => (
    <div className="flex flex-col items-center justify-between h-full text-center animate-in fade-in duration-1000 min-h-0 py-6 md:py-8 md:justify-center md:gap-8">
        <div className="shrink-0 space-y-1 md:space-y-4">
             <h2 className="text-3xl md:text-5xl font-serif text-purple-100 drop-shadow-lg leading-tight">The High Ritual</h2>
             <p className="text-purple-300/80 font-serif italic text-sm md:text-xl">"Speak the words to unlock the path."</p>
        </div>
        <div className="relative w-full max-w-lg flex-1 min-h-[150px] my-2">
            <Image src={`${ASSET_PATH}/wicca_intro_instructions.png`} layout="fill" objectFit="contain" alt="Intro" priority />
        </div>
        <div className="shrink-0 mb-2 md:mb-6">
            <button onClick={onNext} className="px-10 py-4 bg-purple-900/40 border border-purple-400/50 rounded-full text-purple-100 hover:bg-purple-800/60 transition-all font-serif uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.3)] text-lg md:text-xl">
                Enter the Circle
            </button>
        </div>
    </div>
);

const Step1_Intention = ({ intention, setIntention, situation, setSituation, onBegin, isReplay, cost }: any) => (
    <div className="flex flex-col items-center justify-between h-full min-h-0 w-full py-2 md:justify-center md:gap-8">
        <h2 className="text-xl md:text-3xl font-serif text-amber-100/90 drop-shadow-md shrink-0 text-center">Inscribe Your Will</h2>
        <div className="relative w-full max-w-md aspect-[958/860] shrink min-h-0 flex items-center justify-center">
            <Image 
                src={`${ASSET_PATH}/wicca_scroll_intention.png`} 
                layout="fill"
                objectFit="contain"
                alt="Scroll" 
                priority
                className="drop-shadow-xl"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-[25%] py-[18%] gap-3 z-10">
                <input 
                    value={intention} onChange={e => setIntention(e.target.value)}
                    placeholder="My Intention..." readOnly={isReplay}
                    className="w-full bg-transparent border-b-2 border-[#4a2e1c]/50 text-center text-[#4a2e1c] placeholder-[#4a2e1c]/40 font-serif text-lg md:text-2xl outline-none py-1"
                />
                <textarea 
                    value={situation} onChange={e => setSituation(e.target.value)}
                    placeholder="Describe the situation..." readOnly={isReplay}
                    // Applied no-scrollbar class here specifically
                    className="w-full h-20 md:h-32 bg-transparent text-center text-[#4a2e1c] placeholder-[#4a2e1c]/40 font-serif text-lg md:text-2xl outline-none resize-none pt-1 overflow-y-auto no-scrollbar"
                />
            </div>
        </div>
        <div className="shrink-0 w-full max-w-md px-2 pb-2">
            {!isReplay ? (
                <div className="flex flex-col gap-3">
                     <button onClick={() => onBegin('standard')} className="w-full py-4 bg-slate-800/80 border border-slate-600 rounded-xl text-slate-300 font-serif text-base font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-transform">Standard (Free)</button>
                     <button onClick={() => onBegin('ai')} className="w-full py-4 bg-purple-900/80 border border-purple-500 rounded-xl text-purple-100 font-serif shadow-[0_0_15px_rgba(168,85,247,0.3)] text-base font-bold uppercase tracking-widest active:scale-95 transition-transform">High Ritual ({cost} Aether)</button>
                </div>
            ) : (
                 <button onClick={() => onBegin('standard')} className="w-full py-4 bg-purple-900/90 border border-purple-400 rounded-xl text-purple-100 font-serif shadow-[0_0_15px_rgba(168,85,247,0.6)] animate-pulse text-lg font-bold uppercase tracking-widest">Begin Saved Ritual</button>
            )}
        </div>
    </div>
);

const Step2_CastCircle = ({ onComplete }: { onComplete: () => void }) => {
    const [lastAngle, setLastAngle] = useState<number | null>(null);
    const [totalRotation, setTotalRotation] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const soundRef = useRef<any>(null);

    useEffect(() => {
        return () => {
            if (soundRef.current) soundRef.current.stop();
        };
    }, []);

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;
        let deg = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90; 
        if (deg < 0) deg += 360;

        if (lastAngle !== null) {
            let diff = deg - lastAngle;
            if (diff < -300) diff += 360; if (diff > 300) diff -= 360;
            if (diff > 0) {
                const newTotal = totalRotation + (diff * 0.35); 
                setTotalRotation(newTotal);
                // Trigger sound on movement
                if (!soundRef.current) { 
                    soundRef.current = playSound(AUDIO.HUM, 0.3, true); 
                    soundRef.current.play(); 
                }
                
                if (newTotal >= 360) {
                    if(soundRef.current) soundRef.current.stop();
                    playSound(AUDIO.BELL, 0.5).play();
                    onComplete();
                }
            }
        }
        setLastAngle(deg);
    };

    const handleEnd = () => { 
        if (soundRef.current) { 
            soundRef.current.stop(); 
            soundRef.current = null; 
        } 
        setLastAngle(null); 
    };

    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 min-h-0">
            <div className="text-center shrink-0">
                <h2 className="text-2xl font-serif text-purple-100 drop-shadow-md">Cast the Circle</h2>
                <p className="text-purple-300/60 italic text-sm mt-1">Trace the circle clockwise.</p>
            </div>
            <div 
                ref={containerRef} 
                className="relative w-full max-w-[300px] aspect-square flex items-center justify-center touch-none select-none cursor-crosshair shrink-0 bg-transparent"
                style={{ WebkitTapHighlightColor: 'transparent', backgroundColor: 'transparent', boxShadow: 'none' }}
                onMouseMove={handleMove} onTouchMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd} onTouchEnd={handleEnd}
            >
                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="4 2" />
                    <motion.circle cx="50" cy="50" r="45" fill="none" stroke="#a855f7" strokeWidth="6" strokeLinecap="round" strokeDasharray="283"
                        strokeDashoffset={283 - (Math.min(totalRotation, 360) / 360) * 283} className="drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                </svg>
                {totalRotation < 10 && <div className="absolute top-2 left-1/2 -translate-x-1/2 text-purple-500/50 animate-bounce"><ArrowRight className="rotate-90" /></div>}
            </div>
        </div>
    );
};

const Step3_Quarters = ({ spell, charged, onCharge, onNext }: { spell: GeneratedWiccanSpell | null, charged: string[], onCharge: (n: string) => void, onNext: () => void }) => {
    const [displayChant, setDisplayChant] = useState<string | null>(null);
    // Ensure we use the passed spell data for the chants
    const chants = spell?.elemental_chants || STANDARD_WICCAN_SPELL.elemental_chants;
    
    // Add optional chaining to chants properties to fix TypeScript error
    const quarters = [
        { name: "Spirit", sound: AUDIO.SPIRIT, sprite: "Spirit Sigil", pos: { top: '15%', left: '50%' }, color: "shadow-[0_0_50px_rgba(168,85,247,0.9)]", chant: chants?.Spirit },
        { name: "Air", sound: AUDIO.AIR, sprite: "Air Sigil", pos: { top: '40%', left: '90%' }, color: "shadow-[0_0_50px_rgba(234,179,8,0.9)]", chant: chants?.Air },
        { name: "Fire", sound: AUDIO.FIRE, sprite: "Fire Sigil", pos: { top: '85%', left: '75%' }, color: "shadow-[0_0_50px_rgba(239,68,68,0.9)]", chant: chants?.Fire },
        { name: "Earth", sound: AUDIO.EARTH, sprite: "Earth Sigil", pos: { top: '85%', left: '25%' }, color: "shadow-[0_0_50px_rgba(34,197,94,0.9)]", chant: chants?.Earth }, 
        { name: "Water", sound: AUDIO.WATER, sprite: "Water Sigil", pos: { top: '40%', left: '10%' }, color: "shadow-[0_0_50px_rgba(59,130,246,0.9)]", chant: chants?.Water },
    ];

    useEffect(() => {
        if (charged.length === 5) {
            setDisplayChant("The Guardians have been Called!");
        }
    }, [charged]);

    const handleStartHold = (name: string, chant: string | undefined) => {
        setDisplayChant(chant || `Hail, Watchtower of the ${name}!`);
    };

    return (
        <div className="flex flex-col items-center h-full w-full relative min-h-0">
            <h2 className="text-xl font-serif text-purple-200 text-center w-full shrink-0 relative z-20 mt-1">Call the Guardians</h2>
            
            <div className="w-full h-24 shrink-0 flex items-center justify-center z-20 pointer-events-none px-4 mb-0">
                 {displayChant ? (
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-amber-200 font-serif italic text-sm md:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-pre-line bg-black/60 p-2 rounded-lg backdrop-blur-md border border-amber-500/20">
                        {displayChant}
                    </motion.p>
                 ) : (
                    <p className="text-amber-200 font-serif italic text-sm md:text-lg opacity-70">Hold each seal to invoke its power.</p>
                 )}
            </div>

            <div className="relative w-full max-w-sm flex-1 min-h-0 aspect-square flex items-center justify-center overflow-visible my-0">
                <div className="relative w-full h-full">
                    {quarters.map(q => (
                        <div key={q.name} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10" style={q.pos}>
                             <RestoredChargingSigil 
                                name={q.name} sound={q.sound} spriteName={q.sprite} isCharged={charged.includes(q.name)} glowColor={q.color}
                                onComplete={() => onCharge(q.name)} 
                                onStartHold={() => handleStartHold(q.name, q.chant)} 
                                onEndHold={() => {}} 
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full h-10 flex items-center justify-center shrink-0 mb-1">
                 {charged.length === 5 && (
                    <button onClick={onNext} className="px-8 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg animate-bounce shadow-[0_0_20px_orange] z-30 relative text-xs md:text-sm uppercase">
                        Seal the Quarters
                    </button>
                )}
            </div>
        </div>
    );
};

const RestoredChargingSigil = ({ name, sound, spriteName, isCharged, glowColor, onComplete, onStartHold, onEndHold }: any) => {
    const [isHolding, setIsHolding] = useState(false);
    const soundRef = useRef<any>(null);
    const sprite = findSprite(spriteName);
    const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Use direct event handlers instead of useEffect for reliable audio triggering
    const handleDown = (e: React.SyntheticEvent) => { 
        e.preventDefault(); 
        if (isCharged) return;

        setIsHolding(true); 
        onStartHold();
        
        soundRef.current = playSound(sound, 0.4, true); 
        soundRef.current.play();

        holdTimeoutRef.current = setTimeout(() => {
            if(soundRef.current) soundRef.current.stop();
            onComplete();
        }, CHARGE_DURATION_ELEMENT);
    };
    
    const handleUp = (e: React.SyntheticEvent) => { 
        e.preventDefault();
        if (isCharged) return;

        setIsHolding(false); 
        onEndHold();
        
        if(soundRef.current) soundRef.current.stop();
        if(holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    };

    if (!sprite) return null;

    const fillStyle = isCharged 
        ? `radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)` 
        : (isHolding ? `radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)` : 'none');
    
    return (
        <div className="w-24 h-24 relative flex items-center justify-center cursor-pointer select-none touch-none overflow-visible">
             <div 
                onMouseDown={handleDown} onMouseUp={handleUp} onMouseLeave={handleUp} 
                onTouchStart={handleDown} onTouchEnd={handleUp} onTouchCancel={handleUp}
                className={`w-20 h-20 relative transition-all duration-700 rounded-full flex items-center justify-center overflow-hidden 
                    ${isCharged ? `scale-110 brightness-125 saturate-150 animate-pulse ${glowColor}` : 'grayscale brightness-75'} 
                    ${isHolding ? 'scale-105 brightness-110' : ''}`}
             >
                 <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={sprite.sheet.spriteSize.width} spriteHeight={sprite.sheet.spriteSize.height} sheetWidth={sprite.sheet.sheetSize.width} sheetHeight={sprite.sheet.sheetSize.height} />
                 {(isCharged || isHolding) && (
                     <div className="absolute inset-0 rounded-full pointer-events-none mix-blend-overlay" style={{ background: fillStyle, boxShadow: isCharged ? 'inset 0 0 20px rgba(255,255,255,0.8)' : 'none' }} />
                 )}
             </div>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-24 h-24 relative">
                    <InteractionRing isHolding={isHolding} isComplete={isCharged} duration={CHARGE_DURATION_ELEMENT} />
                 </div>
             </div>
        </div>
    );
};

const getDeityIconName = (name: string) => {
    const n = name.trim(); 
    const knownDeities = [
        "Triple Moon", "Horned God", "Pink Heart", "Owl", "Stag", "Sun Wheel", "Triskele", "Ankh",
        "Lightning Bolt", "Crescent Moon", "Raven", "Hammer", "Snake", "Dove", "Cornucopia", "Skull",
        "Hecate", "Cernunnos", "Aphrodite", "Thor", "Brigid", "Ganesha", "Pan", "Isis", 
        "Odin", "Freya", "Morrigan", "Gaia", "Apollo", "Selene", "Lakshmi", "Thoth"
    ];
    if (knownDeities.includes(n)) return n;
    const lower = n.toLowerCase();
    if (lower.includes("hecate")) return "Hecate";
    if (lower.includes("cernunnos")) return "Cernunnos";
    if (lower.includes("aphrodite") || lower.includes("love")) return "Aphrodite";
    if (lower.includes("thor")) return "Thor";
    if (lower.includes("brigid")) return "Brigid";
    if (lower.includes("ganesha")) return "Ganesha";
    if (lower.includes("pan")) return "Pan";
    if (lower.includes("isis")) return "Isis";
    if (lower.includes("odin")) return "Odin";
    if (lower.includes("freya")) return "Freya";
    if (lower.includes("morrigan")) return "Morrigan";
    if (lower.includes("gaia")) return "Gaia";
    if (lower.includes("apollo") || lower.includes("sun")) return "Apollo";
    if (lower.includes("selene") || lower.includes("moon")) return "Selene";
    if (lower.includes("lakshmi") || lower.includes("abundance")) return "Lakshmi";
    if (lower.includes("thoth")) return "Thoth";
    if (lower.includes("horned")) return "Horned God";
    return "Triple Moon"; 
};

const Step4_Deities = ({ suggestions, onSelect, isReplay, savedDeity }: { suggestions: ExtendedWiccanDeitySuggestion[], onSelect: (d: ExtendedWiccanDeitySuggestion) => void, isReplay: boolean, savedDeity: ExtendedWiccanDeitySuggestion | null }) => {
    
    const displaySuggestions = useMemo(() => {
        if (isReplay && savedDeity) return [savedDeity];
        const combined = [...suggestions];
        const defaults = STANDARD_WICCAN_SPELL.suggested_deities || [];
        for (const def of defaults) {
            if (combined.length < 3 && !combined.find(d => d.name === def.name)) {
                combined.push(def);
            }
        }
        return combined.slice(0, 3);
    }, [suggestions, isReplay, savedDeity]);

    if (isReplay && savedDeity) {
        const iconName = getDeityIconName(savedDeity.name);
        const sprite = findSprite(iconName) || findSprite("Triple Moon")!;
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 animate-in fade-in min-h-0">
                <div className="flex items-center gap-2 text-amber-500 bg-amber-900/20 px-4 py-1 rounded-full border border-amber-500/50">
                    <Lock size={14} /> <span className="text-xs uppercase tracking-widest">Ritual Lock Active</span>
                </div>
                <h2 className="text-xl font-serif text-purple-200">Invoking {savedDeity.name}</h2>
                <div className="bg-black/40 border border-purple-500/30 p-6 rounded-xl flex flex-col items-center">
                    <div className="w-32 h-32 mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                        <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={sprite.sheet.spriteSize.width} spriteHeight={sprite.sheet.spriteSize.height} sheetWidth={sprite.sheet.sheetSize.width} sheetHeight={sprite.sheet.sheetSize.height} />
                    </div>
                    <p className="text-gray-300 italic text-center max-w-sm text-sm">"{savedDeity.description}"</p>
                </div>
                <button onClick={() => onSelect(savedDeity)} className="px-8 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded shadow-lg font-serif text-sm">Proceed with Invocation</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center h-full gap-4 py-2 min-h-0">
            <h2 className="text-xl font-serif text-purple-200 shrink-0">Choose a Deity to Invoke</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-5xl px-2 py-6 overflow-y-auto custom-scrollbar min-h-0 pb-2">
                {displaySuggestions.map((deity, i) => {
                    const iconName = getDeityIconName(deity.name);
                    const sprite = findSprite(iconName) || findSprite("Triple Moon")!;
                    return (
                        <button key={i} onClick={() => onSelect(deity)} className="bg-black/40 border border-purple-500/30 p-4 rounded-xl flex flex-col items-center hover:bg-purple-900/20 hover:border-purple-400 transition-all group hover:-translate-y-1 duration-300">
                            <div className="w-[80%] aspect-square mb-4 opacity-70 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] flex items-center justify-center">
                                <div className="relative w-full h-full">
                                     <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={sprite.sheet.spriteSize.width} spriteHeight={sprite.sheet.spriteSize.height} sheetWidth={sprite.sheet.sheetSize.width} sheetHeight={sprite.sheet.sheetSize.height} />
                                </div>
                            </div>
                            <h3 className="text-lg font-serif text-amber-100">{deity.name}</h3>
                            <p className="text-[10px] text-purple-300 uppercase tracking-wider mb-2">{deity.title}</p>
                            <p className="text-xs text-gray-400 text-center italic leading-relaxed line-clamp-2">"{deity.description}"</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const Step5_DeityCandles = ({ deity, onComplete }: { deity: ExtendedWiccanDeitySuggestion | null, onComplete: () => void }) => {
    const [litCandles, setLitCandles] = useState<boolean[]>(Array(7).fill(false));
    const candleSprite = findSprite("White Candle");
    const iconName = deity ? getDeityIconName(deity.name) : "Triple Moon";
    const deitySprite = findSprite(iconName) || findSprite("Triple Moon")!;

    const handleLight = (index: number) => {
        if (!litCandles[index]) {
            const newLit = [...litCandles];
            newLit[index] = true;
            setLitCandles(newLit);
            playSound(AUDIO.MATCH, 0.6).play();
            
            if (newLit.every(Boolean)) {
                setTimeout(() => {
                    playSound(AUDIO.BELL, 0.5).play();
                    onComplete();
                }, 1000);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-between h-full min-h-0 py-2 w-full max-w-lg mx-auto">
            {/* Top: Deity Image - 50% width */}
            <div className="shrink-0 flex flex-col items-center gap-2 mt-2 w-full">
                <h2 className="text-xl font-serif text-purple-200">Invoke {deity?.name}</h2>
                <div className="w-1/2 aspect-square drop-shadow-[0_0_30px_rgba(168,85,247,0.4)] relative">
                     <Sprite sheetPath={deitySprite.sheet.path} x={deitySprite.itemInfo.x} y={deitySprite.itemInfo.y} spriteWidth={deitySprite.sheet.spriteSize.width} spriteHeight={deitySprite.sheet.spriteSize.height} sheetWidth={deitySprite.sheet.sheetSize.width} sheetHeight={deitySprite.sheet.sheetSize.height} />
                </div>
            </div>

            {/* Middle: Incantation Text */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <p className="text-center font-serif text-amber-100 text-lg md:text-2xl leading-relaxed whitespace-pre-line drop-shadow-md">
                    {deity?.invocation || "Ancient spirit, hear my call,\nGrant me strength to rise and not fall."}
                </p>
            </div>

            {/* Bottom: Instruction & 7 Candles */}
            <div className="shrink-0 w-full flex flex-col items-center">
                {/* Instruction above candles */}
                <p className="text-xs text-purple-400/50 animate-pulse pointer-events-none mb-2">Touch each wick to light the path.</p>
                
                <div className="flex justify-center gap-2 md:gap-4 mb-4 h-24 items-end px-2">
                    {litCandles.map((isLit, i) => (
                        <div 
                            key={i} 
                            onClick={() => handleLight(i)}
                            className={`relative w-10 h-24 md:w-12 md:h-32 cursor-pointer transition-all duration-500 ${isLit ? 'brightness-125' : 'brightness-[0.4] grayscale'}`}
                        >
                            {candleSprite && (
                                <div className="w-full h-full relative">
                                    <Sprite sheetPath={candleSprite.sheet.path} x={candleSprite.itemInfo.x} y={candleSprite.itemInfo.y} spriteWidth={candleSprite.sheet.spriteSize.width} spriteHeight={candleSprite.sheet.spriteSize.height} sheetWidth={candleSprite.sheet.sheetSize.width} sheetHeight={candleSprite.sheet.sheetSize.height} />
                                </div>
                            )}
                            {isLit && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-6 bg-orange-400 rounded-full blur-[2px] animate-pulse shadow-[0_0_20px_orange]">
                                    <div className="absolute inset-0 bg-yellow-200 rounded-full blur-[1px] scale-50 animate-ping" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Step6_Summary = ({ spell, onNext }: { spell: GeneratedWiccanSpell, onNext: () => void }) => (
    <div className="flex flex-col items-center justify-center h-full gap-4 max-w-2xl mx-auto min-h-0 py-2">
        <h2 className="text-2xl font-serif text-purple-100">The Workings</h2>
        <p className="text-purple-300 text-center text-sm">Gather these items in your mind's eye.</p>
        <div className="grid grid-cols-5 gap-2 md:gap-4 shrink-0">
            {spell.symbolic_ingredients.map((ing, i) => {
                const sprite = findSprite(ing.name) || findSprite("White Candle")!;
                return (
                    <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 bg-white/5 rounded-lg p-2 border border-white/10">
                            <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={sprite.sheet.spriteSize.width} spriteHeight={sprite.sheet.spriteSize.height} sheetWidth={sprite.sheet.sheetSize.width} sheetHeight={sprite.sheet.sheetSize.height} />
                        </div>
                        <p className="text-[9px] text-center text-gray-400 font-serif">{ing.name}</p>
                    </div>
                )
            })}
        </div>
        <button onClick={onNext} className="mt-4 flex items-center gap-2 px-8 py-3 bg-purple-900 border border-purple-500 rounded text-purple-100 hover:bg-purple-800 transition-colors font-serif uppercase tracking-widest text-sm">
            Proceed <ArrowRight size={16} />
        </button>
    </div>
);

const Step7_Ingredients = ({ spell, index, onComplete }: { spell: GeneratedWiccanSpell, index: number, onComplete: () => void }) => {
    const item = spell.symbolic_ingredients[index];
    const sprite = findSprite(item.name) || findSprite("White Candle")!;
    const [holding, setHolding] = useState(false);
    const [complete, setComplete] = useState(false);
    const soundRef = useRef<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Direct event handlers for audio reliability
    const handleDown = () => {
        if (complete) return;
        setHolding(true);
        soundRef.current = playSound(AUDIO.SHIMMER, 0.3, true);
        soundRef.current.play();
        
        timerRef.current = setTimeout(() => {
            setComplete(true);
            if(soundRef.current) soundRef.current.stop();
            setTimeout(onComplete, 500); 
        }, CHARGE_DURATION_INGREDIENT);
    };

    const handleUp = () => {
        if (complete) return;
        setHolding(false);
        if(soundRef.current) soundRef.current.stop();
        if(timerRef.current) clearTimeout(timerRef.current);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 min-h-0">
            <h2 className="text-xl font-serif text-purple-200">Consecrate the Components</h2>
            <div className="relative w-56 h-56 flex items-center justify-center">
                <div 
                    onMouseDown={handleDown} onMouseUp={handleUp} onMouseLeave={handleUp}
                    onTouchStart={(e) => { e.preventDefault(); handleDown(); }} onTouchEnd={(e) => { e.preventDefault(); handleUp(); }}
                    className={`relative z-10 w-40 h-40 transition-all duration-300 ${holding ? 'scale-105' : 'scale-100'} cursor-pointer`}
                >
                     <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={sprite.sheet.spriteSize.width} spriteHeight={sprite.sheet.spriteSize.height} sheetWidth={sprite.sheet.sheetSize.width} sheetHeight={sprite.sheet.sheetSize.height} />
                </div>
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg) scale(1.1)' }}>
                    <circle cx="50" cy="50" r="48" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="transparent" />
                    <motion.circle
                        cx="50" cy="50" r="48"
                        stroke="rgba(168, 85, 247, 1)" strokeWidth="3" fill="transparent" strokeLinecap="round"
                        pathLength="1" strokeDasharray="1"
                        initial={{ strokeDashoffset: 1 }}
                        animate={{ strokeDashoffset: complete ? 0 : (holding ? 0 : 1) }}
                        transition={{ duration: complete ? 0 : CHARGE_DURATION_INGREDIENT / 1000, ease: 'linear' }}
                        className="drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                    />
                </svg>
                {complete && <div className="absolute inset-0 bg-purple-500/30 rounded-full animate-ping z-0" />}
            </div>
            <div className="text-center space-y-1">
                <p className="text-purple-300 text-lg font-serif">{item.name}</p>
                <p className="text-gray-400 text-xs animate-pulse">Hold to imbue with your will.</p>
            </div>
        </div>
    );
};

const Step8_Cone = ({ spell, onNext }: { spell: GeneratedWiccanSpell, onNext: () => void }) => {
    const [castProgress, setCastProgress] = useState(0);
    const [isCasting, setIsCasting] = useState(false);
    const soundRef = useRef<any>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const count = Math.min(13, Math.ceil((castProgress / 100) * 13));

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isCasting) {
             soundRef.current = playSound(AUDIO.RISER, 0.4, true);
            // Count up logic
            interval = setInterval(() => {
                setCastProgress(p => {
                    if (p >= 100) {
                        if(soundRef.current) soundRef.current.stop();
                        playSound(AUDIO.WHOOSH, 0.6).play();
                        onNext();
                        return 100;
                    }
                    // Sync count with duration
                    return p + (100 / (CAST_DURATION / 50)); 
                });
            }, 50);
        } else {
            if(soundRef.current) soundRef.current.stop();
        }
        return () => { clearInterval(interval); if(soundRef.current) soundRef.current.stop(); };
    }, [isCasting, onNext]);

    return (
        <div className="flex flex-col items-center justify-center h-full relative min-h-0">
            <div className="absolute top-4 left-0 right-0 text-center z-30 pointer-events-none">
                <p className="text-xl text-amber-100 font-serif drop-shadow-md">
                    {isCasting ? "RAISING POWER..." : "Hold the Pentagram"}
                </p>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none select-none z-0 mt-8">
                 {/* Star Wars Style Scrolling Text Effect */}
                 {isCasting && (
                     <div className="absolute inset-0 z-0 flex justify-center items-end overflow-hidden" style={{ perspective: '400px' }}>
                        <motion.div
                            initial={{ top: '100%', opacity: 0 }}
                            animate={{
                                top: `${80 - castProgress}%`, // Scrolls up as progress increases
                                opacity: Math.min(1, castProgress / 20) // Fades in quickly
                            }}
                            className="text-center font-serif text-amber-200 text-3xl md:text-5xl leading-loose whitespace-pre-line px-8 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                            style={{ 
                                position: 'absolute',
                                transform: 'rotateX(25deg)', // The Star Wars tilt
                                transformOrigin: 'bottom',
                                width: '100%'
                            }}
                        >
                            {spell.central_chant}
                        </motion.div>
                     </div>
                 )}
            </div>
            
            <div 
                className="relative z-10 w-64 h-64 md:w-80 md:h-80 cursor-pointer active:scale-95 transition-transform flex items-center justify-center mt-8"
                onMouseDown={() => setIsCasting(true)} onMouseUp={() => setIsCasting(false)}
                onTouchStart={() => setIsCasting(true)} onTouchEnd={() => setIsCasting(false)}
            >
                <PentagramSVG isTracing={isCasting} duration={CAST_DURATION} />
                
                {isCasting && count > 0 && (
                    <div className="relative z-20 text-7xl md:text-8xl font-serif text-white font-bold drop-shadow-[0_0_15px_black] animate-pulse">
                        {count}
                    </div>
                )}
            </div>
        </div>
    );
};

const Step9_Sending = ({ onNext }: { onNext: () => void }) => {
    useEffect(() => { const timer = setTimeout(onNext, SENDING_DURATION); return () => clearTimeout(timer); }, [onNext]);
    return (
        <div className="w-full h-full flex items-center justify-center bg-white/5 relative overflow-hidden">
             {[...Array(20)].map((_, i) => (
                 <motion.div key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{ x: (Math.random() - 0.5) * 800, y: (Math.random() - 0.5) * 800, opacity: 0, scale: Math.random() * 2 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute w-4 h-4 bg-amber-200 rounded-full blur-sm"
                 />
             ))}
            <h1 className="text-4xl md:text-7xl font-serif text-transparent bg-clip-text bg-linear-to-r from-amber-100 to-purple-300 animate-pulse drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]">RELEASED</h1>
        </div>
    );
};

const Step10_Closing = ({ onComplete }: { onComplete: () => void }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-6 min-h-0">
            <h2 className="text-xl font-serif text-purple-200">Ground the Energy</h2>
            <button onClick={() => { playSound(AUDIO.EARTH, 0.5).play(); onComplete(); }} className="w-56 h-56 relative group cursor-pointer rounded-full overflow-hidden border-4 border-transparent hover:border-green-500/50 transition-all">
                <div className="absolute inset-0 bg-green-900/20 rounded-full blur-2xl group-hover:bg-green-800/40 transition-colors duration-700" />
                <div className="relative w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-100 group-hover:scale-105">
                     <Image 
                        src="/images/Spells/Wicca Tradition General/the_earth.png" 
                        layout="fill" 
                        objectFit="cover" 
                        alt="Mother Earth" 
                     />
                </div>
            </button>
            <p className="text-gray-400 font-serif italic text-base">Touch the Earth to open the circle.</p>
        </div>
    );
};

const Step11_Result = ({ spell, onSave, isSaving, isSaved, onReset }: any) => (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center max-w-lg mx-auto animate-in fade-in zoom-in duration-700 relative min-h-0">
        <div className="relative z-10 bg-black/40 p-6 rounded-xl backdrop-blur-md border border-purple-500/30 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <BookOpen size={48} className="text-amber-200 mb-2 drop-shadow-[0_0_15px_gold] mx-auto" />
            <h2 className="text-2xl md:text-3xl font-serif text-amber-100 leading-tight drop-shadow-md">{spell.affirmation}</h2>
            <p className="text-purple-300 text-sm mt-2">The ritual is woven into the tapestry of fate.</p>
        </div>

        <div className="flex flex-col gap-2 w-full px-8 relative z-10 pb-4">
            <button onClick={onSave} disabled={isSaved || isSaving} className="w-full py-3 bg-indigo-900/80 border border-indigo-500 rounded-lg text-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-800 transition-colors font-serif text-base backdrop-blur-sm">
                {isSaved ? <Check /> : <Save />} {isSaved ? "Recorded in Grimoire" : "Save Spell to Grimoire"}
            </button>
            <button onClick={onReset} className="w-full py-3 bg-gray-800/60 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors font-serif backdrop-blur-sm text-sm">Return to Altar</button>
        </div>
    </div>
);

export default WiccaMagick;
// --- END OF FILE src/app/components/WiccaMagick.tsx ---