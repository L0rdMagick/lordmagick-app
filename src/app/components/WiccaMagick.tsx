// --- START OF  FILE src/app/components/WiccaMagick.tsx ---
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import type { Session, GeneratedWiccanSpell, WiccanDeitySuggestion } from '@/lib/types';

// Services
import { generateWiccanSpell, saveSpell } from '@/lib/services/geminiService';
import { getSpellById } from '@/lib/services/spellService';

// Hooks
import { useAetherEconomy } from '@/hooks/useAetherEconomy';

// UI Components
import MagickalBackLink from './MagickalBackLink';
import RoomsButton from './RoomsButton';
import LoadingSpinner from './LoadingSpinner';
import { PentagramIcon } from './icons';
import { Sprite } from './Sprite';
import { findSprite } from '@/lib/spriteLibrary';
import { Wand2, Save, Check, BookOpen, ArrowRight, Lock } from 'lucide-react';

// --- Configuration ---
const ASSET_PATH = "/images/Spells/Wicca Tradition General";
const CHARGE_DURATION_ELEMENT = 7000;
const CHARGE_DURATION_INGREDIENT = 6000;
const CAST_DURATION = 13000;
const SENDING_DURATION = 4000;
const SERVICE_SLUG = 'ai_wicca_magick'; 

// --- Standard Ritual Data (Fallback Only) ---
const STANDARD_WICCAN_SPELL: GeneratedWiccanSpell = {
    title: "Circle of Elemental Balance",
    transitional_incantations: {
        sanctification: "By my will and by my word,\nLet this sacred space be heard.",
        circle_casting: "I cast this Circle, a shield deep and wide,\nTo keep the magick safe inside.",
        invocation: "Lord and Lady, spirits near,\nWelcome to this circle here.",
        closing: "The Circle is Open, but Unbroken,\nPeace and love be the token."
    },
    central_chant: "Eko Eko Azarak, Eko Eko Zomelak.\nBy Earth and Water, Fire and Air,\nI cast this spell with love and care.",
    affirmation: "So mote it be.",
    suggested_deities: [
        { name: "The Triple Goddess", title: "Mother of All", pantheon: "Wiccan", description: "The Maiden, Mother, and Crone." },
        { name: "The Horned God", title: "Lord of the Wild", pantheon: "Wiccan", description: "The protector of nature and cycle." },
        { name: "Universal Spirit", title: "The Source", pantheon: "Universal", description: "Pure energy of the cosmos." }
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

const InteractionRing = ({ isHolding, isComplete, duration }: { isHolding: boolean, isComplete: boolean, duration: number }) => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg) scale(1.2)' }}>
        <circle cx="50" cy="50" r="48" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="transparent" />
        <motion.circle
            cx="50" cy="50" r="48"
            stroke="rgba(168, 85, 247, 1)"
            strokeWidth="4"
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

const IncantationOverlay = ({ text, onConfirm, isVisible }: { text: string, onConfirm: () => void, isVisible: boolean }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
                    className="relative max-w-md w-full aspect-[3/4]"
                >
                    <Image src={`${ASSET_PATH}/wicca_incantation_scroll.png`} alt="Incantation" layout="fill" objectFit="contain" priority />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                        <h3 className="font-serif text-[#4a2e1c]/70 text-sm mb-6 uppercase tracking-widest">Spoken Word</h3>
                        <p className="font-serif text-[#4a2e1c] text-xl md:text-2xl leading-relaxed whitespace-pre-line drop-shadow-sm">{text}</p>
                        <button 
                            onClick={() => { playSound('/audio/sfx-chaos-activate.mp3', 0.3).play(); onConfirm(); }}
                            className="mt-10 px-8 py-2 border-y-2 border-[#4a2e1c] text-[#4a2e1c] hover:bg-[#4a2e1c]/10 font-serif font-bold uppercase tracking-widest transition-all hover:scale-105"
                        >
                            So Mote It Be
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

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

    // Data State
    const [intention, setIntention] = useState('');
    const [situation, setSituation] = useState('');
    const [generatedSpell, setGeneratedSpell] = useState<GeneratedWiccanSpell | null>(null);
    
    // Ritual State
    const [chargedElements, setChargedElements] = useState<string[]>([]);
    const [selectedDeity, setSelectedDeity] = useState<WiccanDeitySuggestion | null>(null);
    const [chargingIndex, setChargingIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isReplayMode, setIsReplayMode] = useState(false);

    // --- Hydration (Restore Exact State) ---
    useEffect(() => {
        if (loadId) {
            const load = async () => {
                setLoading(true);
                setLoadingMessage("Restoring the Ritual...");
                try {
                    const s = await getSpellById(loadId);
                    if (s) {
                        const d = typeof s.ritual_data === 'string' ? JSON.parse(s.ritual_data) : s.ritual_data;
                        
                        // RESTORE STATE EXACTLY AS SAVED
                        setIntention(s.intention);
                        setSituation(d.situation || '');
                        
                        // Strict Restore: Use the saved deity. 
                        // If one exists, the Step4 component will detect it and lock the UI.
                        if (d.selectedDeity) {
                            setSelectedDeity(d.selectedDeity);
                        }

                        // Strict Restore: Use the saved spell object exactly.
                        // Do not merge with Standard here, assume saved data is the source of truth.
                        if (d.spell) {
                            setGeneratedSpell(d.spell);
                        } else {
                            // Only fallback if data is corrupted/missing
                            setGeneratedSpell(STANDARD_WICCAN_SPELL);
                        }
                        
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
                const s = await generateWiccanSpell({ intention, focalPoint: 'The Divine', moonPhase: 'Current', situation });
                
                // Construct the spell object CAREFULLY.
                const mergedSpell: GeneratedWiccanSpell = {
                    title: s.title || STANDARD_WICCAN_SPELL.title,
                    central_chant: s.central_chant || STANDARD_WICCAN_SPELL.central_chant,
                    affirmation: s.affirmation || STANDARD_WICCAN_SPELL.affirmation,
                    
                    // Critical: Use AI ingredients list if it exists and has items. Don't merge with default.
                    symbolic_ingredients: (s.symbolic_ingredients && s.symbolic_ingredients.length > 0) 
                        ? s.symbolic_ingredients 
                        : STANDARD_WICCAN_SPELL.symbolic_ingredients,
                    
                    // Critical: Use AI deities list if it exists.
                    suggested_deities: (s.suggested_deities && s.suggested_deities.length > 0)
                        ? s.suggested_deities
                        : STANDARD_WICCAN_SPELL.suggested_deities,

                    // Critical: Use logical OR fallback instead of spread merge to maintain object structure
                    transitional_incantations: s.transitional_incantations || STANDARD_WICCAN_SPELL.transitional_incantations,
                    elemental_chants: s.elemental_chants || STANDARD_WICCAN_SPELL.elemental_chants,
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
        if ([5, 7, 8, 10].includes(next)) setSubStep('action');
        else setSubStep('incantation');
    };

    const handleIncantationConfirm = () => setSubStep('action');

    // --- Handlers ---
    const handleElementCharge = (name: string) => {
        if (!chargedElements.includes(name)) {
            setChargedElements(prev => [...prev, name]);
            playSound('/audio/sfx-chaos-activate.mp3', 0.5).play();
        }
    };

    const handleIngredientComplete = () => {
        playSound('/audio/sfx-spell-room-portal.mp3', 0.3).play();
        if (generatedSpell && chargingIndex < generatedSpell.symbolic_ingredients.length - 1) {
            setChargingIndex(prev => prev + 1);
            setSubStep('incantation');
        } else {
            nextStep();
        }
    };

    const handleSave = async () => {
        if (!generatedSpell || isSaved) return;
        setIsSaving(true);
        try {
            // STRICT SAVE: We save exactly what is in 'generatedSpell'.
            const ritualData = { 
                intention, 
                situation, 
                selectedDeity, 
                spell: generatedSpell // Save the full text/ingredients object
            };

            await saveSpell(session?.user?.id || 'anon', {
                name: `Wicca: ${intention.substring(0,20)}`,
                intention,
                incantation: generatedSpell.central_chant,
                tradition: 'WICCA',
                ritual_data: ritualData 
            });
            setIsSaved(true);
            playSound('/audio/sfx-chaos-activate.mp3', 0.5).play();
        } catch (e: any) {
            if (e.message === 'GRIMOIRE_FULL') setShowSlotModal(true);
            else setError("Failed to scribe.");
        } finally { setIsSaving(false); }
    };

    const getCurrentIncantation = () => {
        if (!generatedSpell) return "";
        const trans = generatedSpell.transitional_incantations || STANDARD_WICCAN_SPELL.transitional_incantations;
        switch (ritualStep) {
            case 2: return trans?.sanctification || "By my will, I begin.";
            case 3: return "Guardians of the Watchtowers,\nHail and Welcome!";
            case 4: return trans?.invocation || "Spirits of Light, draw near.";
            case 6: return generatedSpell.symbolic_ingredients[chargingIndex]?.incantation || "I charge this item.";
            case 9: return trans?.closing || "The Circle is open.";
            default: return "";
        }
    };

    const renderContent = () => {
        if (loading) return <LoadingSpinner title={loadingMessage} />;
        if (error || paymentError) return <div className="text-center p-8 text-red-300">{error || paymentError} <button onClick={() => { setError(null); clearPaymentError(); }} className="block mx-auto mt-4 underline">Dismiss</button></div>;

        if (subStep === 'incantation' && generatedSpell) {
            return <IncantationOverlay text={getCurrentIncantation()} onConfirm={handleIncantationConfirm} isVisible={true} />;
        }

        switch (ritualStep) {
            case 0: return <Step0_Intro onNext={() => setRitualStep(1)} />;
            case 1: return <Step1_Intention intention={intention} setIntention={setIntention} situation={situation} setSituation={setSituation} onBegin={handleBegin} isReplay={isReplayMode} cost={cost} />;
            case 2: return <Step2_CastCircle onComplete={nextStep} />;
            case 3: return <Step3_Quarters spell={generatedSpell} charged={chargedElements} onCharge={handleElementCharge} onNext={nextStep} />;
            case 4: return <Step4_Deities suggestions={generatedSpell?.suggested_deities || []} onSelect={(d) => { setSelectedDeity(d); nextStep(); }} isReplay={isReplayMode} savedDeity={selectedDeity} />;
            case 5: return <Step5_Summary spell={generatedSpell!} onNext={nextStep} />;
            case 6: return <Step6_Ingredients spell={generatedSpell!} index={chargingIndex} onComplete={handleIngredientComplete} />;
            case 7: return <Step7_Cone spell={generatedSpell!} onNext={nextStep} />;
            case 8: return <Step8_Sending onNext={nextStep} />;
            case 9: return <Step9_Closing onComplete={nextStep} />;
            case 10: return <Step10_Result spell={generatedSpell!} onSave={handleSave} isSaving={isSaving} isSaved={isSaved} onReset={() => window.location.reload()} />;
            default: return null;
        }
    };

    return (
        <main className="relative h-screen w-screen bg-black overflow-hidden flex flex-col font-sans select-none">
            <div className="absolute inset-0 z-0">
                <Image src="/images/spell-room/spell-room-background.png" layout="fill" objectFit="cover" alt="Background" className="opacity-50" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
            <header className="relative z-20 w-full p-4 flex justify-between items-center text-purple-200">
                <MagickalBackLink href="/spell-room" text="Exit" />
                <h1 className="font-serif text-xl md:text-3xl text-purple-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">Wicca Magick</h1>
                <RoomsButton />
            </header>
            <div className="relative z-10 grow w-full flex flex-col p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={ritualStep + subStep}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
            {showSlotModal && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">Grimoire Full.</div>}
        </main>
    );
};

// --- STEP COMPONENTS ---

const Step0_Intro = ({ onNext }: { onNext: () => void }) => (
    <div className="flex flex-col items-center justify-center h-full gap-8 text-center animate-in fade-in duration-1000">
        <div className="relative w-72 h-72 md:w-96 md:h-96">
            <Image src={`${ASSET_PATH}/wicca_intro_instructions.png`} layout="fill" objectFit="contain" alt="Intro" priority />
        </div>
        <div>
            <h2 className="text-3xl md:text-4xl font-serif text-purple-100 mb-3 drop-shadow-lg">The High Ritual</h2>
            <p className="text-purple-300/80 max-w-sm mx-auto font-serif italic text-lg">"Speak the words to unlock the path.<br/>Trace the signs to bind the will."</p>
        </div>
        <button onClick={onNext} className="px-10 py-4 bg-purple-900/40 border border-purple-400/50 rounded-full text-purple-100 hover:bg-purple-800/60 transition-all font-serif uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.3)]">Enter the Circle</button>
    </div>
);

const Step1_Intention = ({ intention, setIntention, situation, setSituation, onBegin, isReplay, cost }: any) => (
    <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-2xl font-serif text-amber-100/90">Inscribe Your Will</h2>
        <div className="relative w-full max-w-md aspect-square">
            <Image src={`${ASSET_PATH}/wicca_scroll_intention.png`} layout="fill" objectFit="contain" alt="Scroll" priority />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-14 gap-4">
                <input 
                    value={intention} onChange={e => setIntention(e.target.value)}
                    placeholder="My Intention..." readOnly={isReplay}
                    className="w-full bg-transparent border-b-2 border-[#4a2e1c]/50 text-center text-[#4a2e1c] placeholder-[#4a2e1c]/40 font-serif text-xl outline-none py-2"
                />
                <textarea 
                    value={situation} onChange={e => setSituation(e.target.value)}
                    placeholder="Describe the situation..." readOnly={isReplay}
                    className="w-full h-24 bg-transparent text-center text-[#4a2e1c] placeholder-[#4a2e1c]/40 font-serif text-sm outline-none resize-none pt-2"
                />
            </div>
        </div>
        {!isReplay ? (
            <div className="flex gap-4 mt-2">
                 <button onClick={() => onBegin('standard')} className="px-6 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-slate-300 font-serif">Standard (Free)</button>
                 <button onClick={() => onBegin('ai')} className="px-6 py-3 bg-purple-900/80 border border-purple-500 rounded-lg text-purple-100 font-serif shadow-[0_0_15px_rgba(168,85,247,0.3)]">High Ritual ({cost} Aether)</button>
            </div>
        ) : (
             <button onClick={() => onBegin('standard')} className="px-8 py-3 bg-purple-900/90 border border-purple-400 rounded-lg text-purple-100 font-serif shadow-[0_0_15px_rgba(168,85,247,0.6)] animate-pulse">Begin Saved Ritual</button>
        )}
    </div>
);

// --- TRUE TRACING COMPONENT (No Holding) ---
const Step2_CastCircle = ({ onComplete }: { onComplete: () => void }) => {
    const [lastAngle, setLastAngle] = useState<number | null>(null);
    const [totalRotation, setTotalRotation] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const soundRef = useRef<any>(null);

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
            if (diff < -300) diff += 360; 
            if (diff > 300) diff -= 360;

            if (diff > 0) {
                const newTotal = totalRotation + diff;
                setTotalRotation(newTotal);

                if (!soundRef.current) {
                    soundRef.current = playSound('/audio/sfx-chaos-hold.mp3', 0.2, true);
                    soundRef.current.play();
                }

                if (newTotal >= 360) {
                    if(soundRef.current) soundRef.current.stop();
                    playSound('/audio/sfx-spell-room-portal.mp3', 0.5).play();
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
        <div className="flex flex-col items-center justify-center h-full gap-8">
            <div className="text-center">
                <h2 className="text-3xl font-serif text-purple-100 drop-shadow-md">Cast the Circle</h2>
                <p className="text-purple-300/60 italic mt-2">Physically trace the circle clockwise to seal the space.</p>
            </div>
            
            <div 
                ref={containerRef}
                className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center touch-none select-none cursor-crosshair"
                onMouseMove={handleMove} onTouchMove={handleMove}
                onMouseUp={handleEnd} onMouseLeave={handleEnd} onTouchEnd={handleEnd}
            >
                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="4 2" />
                    <motion.circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="#a855f7" 
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (Math.min(totalRotation, 360) / 360) * 283}
                        className="drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                    />
                </svg>
                {totalRotation < 10 && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-purple-500/50 animate-bounce">
                        <ArrowRight className="rotate-90" />
                    </div>
                )}
            </div>
        </div>
    );
};

const Step3_Quarters = ({ spell, charged, onCharge, onNext }: { spell: GeneratedWiccanSpell | null, charged: string[], onCharge: (n: string) => void, onNext: () => void }) => {
    const [activeElement, setActiveElement] = useState<string | null>(null);
    const quarters = [
        { name: "Air", sprite: "Air Sigil", pos: { top: '15%', left: '50%' }, chant: spell?.elemental_chants?.Air },
        { name: "Fire", sprite: "Fire Sigil", pos: { top: '40%', left: '85%' }, chant: spell?.elemental_chants?.Fire },
        { name: "Water", sprite: "Water Sigil", pos: { top: '85%', left: '75%' }, chant: spell?.elemental_chants?.Water },
        { name: "Earth", sprite: "Earth Sigil", pos: { top: '85%', left: '25%' }, chant: spell?.elemental_chants?.Earth },
        { name: "Spirit", sprite: "Spirit Sigil", pos: { top: '40%', left: '15%' }, chant: spell?.elemental_chants?.Spirit }
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full relative">
            <h2 className="absolute top-4 text-2xl font-serif text-purple-200 text-center w-full">
                {activeElement ? activeElement : "Call the Guardians"}
            </h2>
            <div className="absolute top-16 w-full text-center px-4 h-12 flex items-center justify-center z-20 pointer-events-none">
                 {activeElement && (
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-amber-200 font-serif italic text-sm md:text-lg drop-shadow-md whitespace-pre-line">
                        {quarters.find(q => q.name === activeElement)?.chant || `Hail, Watchtower of the ${activeElement}!`}
                    </motion.p>
                 )}
            </div>
            <div className="relative w-full max-w-md aspect-square mt-8">
                {quarters.map(q => (
                    <div key={q.name} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={q.pos}>
                         <RestoredChargingSigil 
                            name={q.name} spriteName={q.sprite} isCharged={charged.includes(q.name)} 
                            onComplete={() => onCharge(q.name)} onStartHold={() => setActiveElement(q.name)} onEndHold={() => setActiveElement(null)}
                        />
                    </div>
                ))}
            </div>
            {charged.length === 5 && (
                <button onClick={onNext} className="absolute bottom-10 px-10 py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg animate-bounce shadow-[0_0_20px_orange]">Seal the Quarters</button>
            )}
        </div>
    );
};

const RestoredChargingSigil = ({ name, spriteName, isCharged, onComplete, onStartHold, onEndHold }: any) => {
    const [isHolding, setIsHolding] = useState(false);
    const soundRef = useRef<any>(null);
    const sprite = findSprite(spriteName);
    const soundFile = `/audio/${name.toLowerCase()}.mp3`; 

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isHolding && !isCharged) {
            soundRef.current = playSound(soundFile, 0.4, true); 
            timer = setTimeout(onComplete, CHARGE_DURATION_ELEMENT);
        }
        return () => { clearTimeout(timer); if(soundRef.current) soundRef.current.stop(); };
    }, [isHolding, isCharged, onComplete, soundFile]);

    const handleDown = () => { setIsHolding(true); onStartHold(); };
    const handleUp = () => { setIsHolding(false); onEndHold(); };

    if (!sprite) return null;

    return (
        <div 
            className="w-24 h-24 relative"
            onMouseDown={handleDown} onMouseUp={handleUp} onMouseLeave={handleUp} onTouchStart={handleDown} onTouchEnd={handleUp}
        >
             <div className={`w-full h-full transition-all duration-500 ${isCharged ? 'scale-110 brightness-150 saturate-150' : 'grayscale brightness-75'} ${isHolding ? 'scale-105' : ''}`}>
                 <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={sprite.sheet.spriteSize.width} spriteHeight={sprite.sheet.spriteSize.height} sheetWidth={sprite.sheet.sheetSize.width} sheetHeight={sprite.sheet.sheetSize.height} />
             </div>
             <InteractionRing isHolding={isHolding} isComplete={isCharged} duration={CHARGE_DURATION_ELEMENT} />
        </div>
    );
};


// --- STEP 4 WITH STRICT REPLAY LOCKING ---
const Step4_Deities = ({ suggestions, onSelect, isReplay, savedDeity }: { suggestions: WiccanDeitySuggestion[], onSelect: (d: WiccanDeitySuggestion) => void, isReplay: boolean, savedDeity: WiccanDeitySuggestion | null }) => {
    // Replay Mode: Locked to saved deity
    if (isReplay && savedDeity) {
        let icon = "Triple Moon"; 
        if (savedDeity.name.includes("Horned") || savedDeity.name.includes("Pan")) icon = "Horned God";
        if (savedDeity.name.includes("Aphrodite") || savedDeity.name.includes("Love")) icon = "Pink Heart";
        if (savedDeity.name.includes("Zeus") || savedDeity.name.includes("Thor")) icon = "Lightning Bolt";
        const sprite = findSprite(icon) || findSprite("Triple Moon")!;

        return (
            <div className="flex flex-col items-center justify-center h-full gap-8 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-500 bg-amber-900/20 px-4 py-1 rounded-full border border-amber-500/50">
                    <Lock size={14} /> <span className="text-xs uppercase tracking-widest">Ritual Lock Active</span>
                </div>
                <h2 className="text-2xl font-serif text-purple-200">Invoking {savedDeity.name}</h2>
                <div className="bg-black/40 border border-purple-500/30 p-8 rounded-xl flex flex-col items-center">
                    <div className="w-32 h-32 mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                        <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={sprite.sheet.spriteSize.width} spriteHeight={sprite.sheet.spriteSize.height} sheetWidth={sprite.sheet.sheetSize.width} sheetHeight={sprite.sheet.sheetSize.height} />
                    </div>
                    <p className="text-gray-300 italic text-center max-w-sm">"{savedDeity.description}"</p>
                </div>
                <button onClick={() => onSelect(savedDeity)} className="px-8 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded shadow-lg font-serif">
                    Proceed with Invocation
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full gap-6">
            <h2 className="text-2xl font-serif text-purple-200">Invoke the Divine</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl px-4">
                {suggestions.map((deity, i) => {
                    let icon = "Triple Moon";
                    if (deity.name.includes("Horned") || deity.name.includes("Pan")) icon = "Horned God";
                    if (deity.name.includes("Aphrodite") || deity.name.includes("Love")) icon = "Pink Heart";
                    if (deity.name.includes("Zeus") || deity.name.includes("Thor")) icon = "Lightning Bolt";
                    const sprite = findSprite(icon) || findSprite("Triple Moon")!;

                    return (
                        <button key={i} onClick={() => onSelect(deity)} className="bg-black/40 border border-purple-500/30 p-6 rounded-xl flex flex-col items-center hover:bg-purple-900/20 hover:border-purple-400 transition-all group hover:-translate-y-1 duration-300">
                            <div className="w-24 h-24 mb-4 opacity-70 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={sprite.sheet.spriteSize.width} spriteHeight={sprite.sheet.spriteSize.height} sheetWidth={sprite.sheet.sheetSize.width} sheetHeight={sprite.sheet.sheetSize.height} />
                            </div>
                            <h3 className="text-xl font-serif text-amber-100">{deity.name}</h3>
                            <p className="text-xs text-purple-300 uppercase tracking-wider mb-3">{deity.title}</p>
                            <p className="text-sm text-gray-400 text-center italic leading-relaxed">"{deity.description}"</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const Step5_Summary = ({ spell, onNext }: { spell: GeneratedWiccanSpell, onNext: () => void }) => (
    <div className="flex flex-col items-center justify-center h-full gap-6 max-w-2xl mx-auto">
        <h2 className="text-3xl font-serif text-purple-100 mb-4">The Workings</h2>
        <p className="text-purple-300 text-center mb-6">Gather these items in your mind's eye.</p>
        <div className="grid grid-cols-5 gap-4">
            {spell.symbolic_ingredients.map((ing, i) => {
                const sprite = findSprite(ing.name) || findSprite("White Candle")!;
                return (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-white/5 rounded-lg p-2 border border-white/10">
                            <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={sprite.sheet.spriteSize.width} spriteHeight={sprite.sheet.spriteSize.height} sheetWidth={sprite.sheet.sheetSize.width} sheetHeight={sprite.sheet.sheetSize.height} />
                        </div>
                        <p className="text-[10px] text-center text-gray-400 font-serif">{ing.name}</p>
                    </div>
                )
            })}
        </div>
        <button onClick={onNext} className="mt-8 flex items-center gap-2 px-8 py-3 bg-purple-900 border border-purple-500 rounded text-purple-100 hover:bg-purple-800 transition-colors font-serif uppercase tracking-widest">
            Proceed <ArrowRight size={16} />
        </button>
    </div>
);

const Step6_Ingredients = ({ spell, index, onComplete }: { spell: GeneratedWiccanSpell, index: number, onComplete: () => void }) => {
    const item = spell.symbolic_ingredients[index];
    const sprite = findSprite(item.name) || findSprite("White Candle")!;
    const [holding, setHolding] = useState(false);
    const [complete, setComplete] = useState(false);
    const soundRef = useRef<any>(null);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (holding && !complete) {
            soundRef.current = playSound('/audio/sfx-chaos-hold.mp3', 0.3, true);
            timer = setTimeout(() => {
                setComplete(true);
                setTimeout(onComplete, 500); 
            }, CHARGE_DURATION_INGREDIENT);
        }
        return () => { clearTimeout(timer); if(soundRef.current) soundRef.current.stop(); };
    }, [holding, complete, onComplete]);

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8">
            <h2 className="text-2xl font-serif text-purple-200">Consecrate the Components</h2>
            <div className="relative w-64 h-64 flex items-center justify-center">
                <div 
                    onMouseDown={() => setHolding(true)} onMouseUp={() => setHolding(false)}
                    onTouchStart={() => setHolding(true)} onTouchEnd={() => setHolding(false)}
                    className={`relative z-10 w-48 h-48 transition-all duration-300 ${holding ? 'scale-105' : 'scale-100'} cursor-pointer`}
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
            <div className="text-center space-y-2">
                <p className="text-purple-300 text-xl font-serif">{item.name}</p>
                <p className="text-gray-400 text-sm animate-pulse">Hold to imbue with your will.</p>
            </div>
        </div>
    );
};

const Step7_Cone = ({ spell, onNext }: { spell: GeneratedWiccanSpell, onNext: () => void }) => {
    const [castProgress, setCastProgress] = useState(0);
    const [isCasting, setIsCasting] = useState(false);
    const soundRef = useRef<any>(null);
    const count = Math.min(13, Math.ceil((castProgress / 100) * 13));

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isCasting) {
             soundRef.current = playSound('/audio/sfx-chaos-hold.mp3', 0.4, true);
            interval = setInterval(() => {
                setCastProgress(p => {
                    if (p >= 100) {
                        if(soundRef.current) soundRef.current.stop();
                        playSound('/audio/sfx-chaos-explosion.mp3', 0.6).play();
                        onNext();
                        return 100;
                    }
                    return p + (100 / (CAST_DURATION / 50)); 
                });
            }, 50);
        } else {
            if(soundRef.current) soundRef.current.stop();
        }
        return () => { clearInterval(interval); if(soundRef.current) soundRef.current.stop(); };
    }, [isCasting, onNext]);

    return (
        <div className="flex flex-col items-center justify-center h-full relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none select-none">
                 <p className="text-center font-serif text-3xl md:text-5xl text-purple-500/50 leading-loose whitespace-pre-line px-8 blur-[1px]">
                     {spell.central_chant}
                 </p>
            </div>
            <div 
                className="relative z-10 w-64 h-64 md:w-80 md:h-80 cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
                onMouseDown={() => setIsCasting(true)} onMouseUp={() => setIsCasting(false)}
                onTouchStart={() => setIsCasting(true)} onTouchEnd={() => setIsCasting(false)}
            >
                <PentagramIcon className={`absolute inset-0 w-full h-full ${isCasting ? 'text-amber-400 drop-shadow-[0_0_25px_gold]' : 'text-purple-900'} transition-colors duration-1000`} isTracing={isCasting} />
                {isCasting && count > 0 && (
                    <div className="relative z-20 text-8xl font-serif text-white font-bold drop-shadow-[0_0_15px_black] animate-pulse">
                        {count}
                    </div>
                )}
            </div>
            <div className="mt-12 text-center relative z-20">
                <p className="text-2xl text-amber-100 font-serif mb-2">
                    {isCasting ? "RAISING POWER..." : "Hold the Pentagram"}
                </p>
            </div>
        </div>
    );
};

const Step8_Sending = ({ onNext }: { onNext: () => void }) => {
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
            <h1 className="text-4xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-purple-300 animate-pulse drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]">RELEASED</h1>
        </div>
    );
};

const Step9_Closing = ({ onComplete }: { onComplete: () => void }) => {
    const sprite = findSprite("Grounding Roots");
    return (
        <div className="flex flex-col items-center justify-center h-full gap-8">
            <h2 className="text-2xl font-serif text-purple-200">Ground the Energy</h2>
            <button onClick={() => { playSound('/audio/earth.mp3', 0.5).play(); onComplete(); }} className="w-64 h-64 relative group cursor-pointer">
                <div className="absolute inset-0 bg-green-900/20 rounded-full blur-2xl group-hover:bg-green-800/40 transition-colors duration-700" />
                <div className="relative w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-100 group-hover:scale-105">
                     {sprite ? (
                         <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={sprite.sheet.spriteSize.width} spriteHeight={sprite.sheet.spriteSize.height} sheetWidth={sprite.sheet.sheetSize.width} sheetHeight={sprite.sheet.sheetSize.height} />
                     ) : <div className="w-full h-full bg-green-500/50 rounded-full" />}
                </div>
            </button>
            <p className="text-gray-400 font-serif italic text-lg">Touch the Earth to open the circle.</p>
        </div>
    );
};

const Step10_Result = ({ spell, onSave, isSaving, isSaved, onReset }: any) => (
    <div className="flex flex-col items-center justify-center h-full gap-8 text-center max-w-lg mx-auto animate-in fade-in zoom-in duration-700">
        <BookOpen size={64} className="text-amber-200 mb-4 drop-shadow-[0_0_15px_gold]" />
        <h2 className="text-3xl md:text-4xl font-serif text-amber-100 leading-tight drop-shadow-md">{spell.affirmation}</h2>
        <p className="text-purple-300 text-lg">The ritual is woven into the tapestry of fate.</p>
        <div className="flex flex-col gap-4 w-full px-8 mt-4">
            <button onClick={onSave} disabled={isSaved || isSaving} className="w-full py-4 bg-indigo-900/80 border border-indigo-500 rounded-lg text-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-800 transition-colors font-serif text-lg">
                {isSaved ? <Check /> : <Save />} {isSaved ? "Recorded in Grimoire" : "Save Record (1 Credit)"}
            </button>
            <button onClick={onReset} className="w-full py-4 bg-gray-800/60 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors font-serif">Return to Altar</button>
        </div>
    </div>
);

export default WiccaMagick;