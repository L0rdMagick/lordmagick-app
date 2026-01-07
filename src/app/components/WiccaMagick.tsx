"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import type { Session, GeneratedWiccanSpell, WiccanDeitySuggestion } from '@/lib/types';
import Link from 'next/link';

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
import { Book, Wand2, Sparkles, Save, Check, AlertTriangle, BookOpen, Coins } from 'lucide-react';

// --- Configuration ---
const ASSET_PATH = "/images/Spells/Wicca Tradition General";
const CHARGE_DURATION_ELEMENT = 5000;
const CHARGE_DURATION_INGREDIENT = 6000;
const CAST_DURATION = 13000;
const SENDING_DURATION = 4000;
const SERVICE_SLUG = 'ai_wicca_magick'; 

// --- Standard Ritual Data ---
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
    
    const play = () => audio.play().catch((e: any) => console.error(`Failed to play sound: ${src}`, e));
    const stop = () => { 
        audio.pause(); 
        audio.currentTime = 0; 
    };
    return { play, stop };
};

// --- Helper Components for Physics/Animation ---

// Restored: SVG Ring Animation for holding items
const InteractionRing = ({ isHolding, isComplete, duration }: { isHolding: boolean, isComplete: boolean, duration: number }) => {
    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg) scale(1.2)' }}>
            {/* Background Track */}
            <circle cx="50" cy="50" r="48" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="transparent" />
            
            {/* Filling Ring */}
            <motion.circle
                cx="50" cy="50" r="48"
                stroke="rgba(168, 85, 247, 1)" // Purple-500
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
};

// New: Speak First Overlay
const IncantationOverlay = ({ text, onConfirm, isVisible }: { text: string, onConfirm: () => void, isVisible: boolean }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative max-w-md w-full aspect-[3/4]"
                >
                    <Image src={`${ASSET_PATH}/wicca_incantation_scroll.png`} alt="Incantation" layout="fill" objectFit="contain" priority />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                        <h3 className="font-serif text-[#4a2e1c]/70 text-sm mb-6 uppercase tracking-widest">Spoken Word</h3>
                        <p className="font-serif text-[#4a2e1c] text-xl md:text-2xl leading-relaxed whitespace-pre-line drop-shadow-sm">
                            {text}
                        </p>
                        <button 
                            onClick={() => { playSound('/audio/sfx-chaos-activate.mp3', 0.3).play(); onConfirm(); }}
                            className="mt-10 px-8 py-2 border-y-2 border-[#4a2e1c] text-[#4a2e1c] hover:bg-[#4a2e1c]/10 font-serif font-bold uppercase tracking-widest transition-all scale-100 hover:scale-105"
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

    // 0:Intro -> 1:Intention -> 2:Circle -> 3:Quarters -> 4:Deities -> 5:Ingredients -> 6:Cone -> 7:Sending -> 8:Closing -> 9:Result
    const [ritualStep, setRitualStep] = useState(0);
    const [subStep, setSubStep] = useState<'incantation' | 'action'>('action'); // Default to action for Intro/Intention steps

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

    // --- Hydration ---
    useEffect(() => {
        if (loadId) {
            const load = async () => {
                setLoading(true);
                setLoadingMessage("Consulting the Grimoire...");
                try {
                    const s = await getSpellById(loadId);
                    if (s) {
                        const d = typeof s.ritual_data === 'string' ? JSON.parse(s.ritual_data) : s.ritual_data;
                        setIntention(s.intention);
                        setSituation(d.situation || '');
                        setSelectedDeity(d.selectedDeity || null);
                        setGeneratedSpell(d.spell || STANDARD_WICCAN_SPELL);
                        setIsReplayMode(true);
                        setIsSaved(true);
                        setRitualStep(1);
                    }
                } catch { setError("Spell not found."); } finally { setLoading(false); }
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
            setLoadingMessage("Weaving the Spell...");
            try {
                const s = await generateWiccanSpell({ intention, focalPoint: 'The Divine', moonPhase: 'Current', situation });
                // Fallbacks
                if (!s.transitional_incantations) s.transitional_incantations = STANDARD_WICCAN_SPELL.transitional_incantations;
                if (!s.elemental_chants) s.elemental_chants = STANDARD_WICCAN_SPELL.elemental_chants;
                if (!s.suggested_deities) s.suggested_deities = STANDARD_WICCAN_SPELL.suggested_deities;
                
                setGeneratedSpell(s);
                setRitualStep(2);
                setSubStep('incantation');
            } catch (e: any) { setError(e.message); } finally { setLoading(false); }
        }
    };

    const nextStep = () => {
        const next = ritualStep + 1;
        setRitualStep(next);
        // Steps 7 (Sending) and 9 (Result) have no incantation overlay. Step 6 (Cone) has intrinsic chant.
        if ([6, 7, 9].includes(next)) setSubStep('action');
        else setSubStep('incantation');
    };

    const handleIncantationConfirm = () => setSubStep('action');

    // --- Complex Interaction Handlers ---

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
            setSubStep('incantation'); // Trigger speak for next item
        } else {
            nextStep();
        }
    };

    const handleSave = async () => {
        if (!generatedSpell || isSaved) return;
        setIsSaving(true);
        try {
            await saveSpell(session?.user?.id || 'anon', {
                name: `Wicca: ${intention.substring(0,20)}`,
                intention,
                incantation: generatedSpell.central_chant,
                tradition: 'WICCA',
                ritual_data: { intention, situation, selectedDeity, spell: generatedSpell }
            });
            setIsSaved(true);
            playSound('/audio/sfx-chaos-activate.mp3', 0.5).play();
        } catch (e: any) {
            if (e.message === 'GRIMOIRE_FULL') setShowSlotModal(true);
            else setError("Failed to save.");
        } finally { setIsSaving(false); }
    };

    // --- View Resolver ---
    const getCurrentIncantation = () => {
        if (!generatedSpell) return "";
        const trans = generatedSpell.transitional_incantations || STANDARD_WICCAN_SPELL.transitional_incantations;
        switch (ritualStep) {
            case 2: return trans?.sanctification || "By my will, I begin.";
            case 3: return "Guardians of the Watchtowers,\nHail and Welcome!";
            case 4: return trans?.invocation || "Spirits of Light, draw near.";
            case 5: return generatedSpell.symbolic_ingredients[chargingIndex]?.incantation || "I charge this item.";
            case 8: return trans?.closing || "The Circle is open.";
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
            case 3: return <Step3_Quarters charged={chargedElements} onCharge={handleElementCharge} onNext={nextStep} />;
            case 4: return <Step4_Deities suggestions={generatedSpell?.suggested_deities || []} onSelect={(d) => { setSelectedDeity(d); nextStep(); }} />;
            case 5: return <Step5_Ingredients spell={generatedSpell!} index={chargingIndex} onComplete={handleIngredientComplete} />;
            case 6: return <Step6_Cone spell={generatedSpell!} onNext={nextStep} />;
            case 7: return <Step7_Sending onNext={nextStep} />;
            case 8: return <Step8_Closing onComplete={nextStep} />;
            case 9: return <Step9_Result spell={generatedSpell!} onSave={handleSave} isSaving={isSaving} isSaved={isSaved} onReset={() => window.location.reload()} />;
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
            
            {showSlotModal && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">Grimoire Full. Purchase slots logic goes here.</div>}
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
            <p className="text-purple-300/80 max-w-sm mx-auto font-serif italic text-lg">
                "Speak the words to unlock the path.<br/>Trace the signs to bind the will."
            </p>
        </div>
        <button onClick={onNext} className="px-10 py-4 bg-purple-900/40 border border-purple-400/50 rounded-full text-purple-100 hover:bg-purple-800/60 transition-all font-serif uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]">
            Enter the Circle
        </button>
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
                    className="w-full bg-transparent border-b-2 border-[#4a2e1c]/50 text-center text-[#4a2e1c] placeholder-[#4a2e1c]/40 font-serif text-xl outline-none py-2 focus:border-[#4a2e1c] transition-colors"
                />
                <textarea 
                    value={situation} onChange={e => setSituation(e.target.value)}
                    placeholder="Describe the situation (Optional)..." readOnly={isReplay}
                    className="w-full h-24 bg-transparent text-center text-[#4a2e1c] placeholder-[#4a2e1c]/40 font-serif text-sm outline-none resize-none pt-2"
                />
            </div>
        </div>
        <div className="flex gap-4 mt-2">
             <button onClick={() => onBegin('standard')} className="px-6 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-slate-300 font-serif hover:bg-slate-700">Standard (Free)</button>
             <button onClick={() => onBegin('ai')} className="px-6 py-3 bg-purple-900/80 border border-purple-500 rounded-lg text-purple-100 font-serif hover:bg-purple-800 shadow-[0_0_15px_rgba(168,85,247,0.3)]">High Ritual ({cost} Aether)</button>
        </div>
    </div>
);

const Step2_CastCircle = ({ onComplete }: { onComplete: () => void }) => {
    const [progress, setProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const soundRef = useRef<any>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isHolding && progress < 100) {
            soundRef.current = playSound('/audio/sfx-chaos-hold.mp3', 0.3, true);
            interval = setInterval(() => {
                setProgress(p => {
                    const newP = p + 1.5;
                    if (newP >= 100) {
                        if(soundRef.current) soundRef.current.stop();
                        playSound('/audio/sfx-spell-room-portal.mp3', 0.5).play();
                        onComplete();
                        return 100;
                    }
                    return newP;
                });
            }, 20);
        } else {
             if(soundRef.current) soundRef.current.stop();
        }
        return () => { clearInterval(interval); if(soundRef.current) soundRef.current.stop(); };
    }, [isHolding, progress, onComplete]);

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8">
            <div className="text-center">
                <h2 className="text-3xl font-serif text-purple-100 drop-shadow-md">Cast the Circle</h2>
                <p className="text-purple-300/60 italic mt-2">Hold to trace the boundary between worlds.</p>
            </div>
            <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
                {/* Visual Circle */}
                <svg className="absolute w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="4 2" />
                    <motion.circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="#a855f7" 
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * progress) / 100}
                        className="drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                    />
                </svg>
                {/* Interaction Button */}
                <button
                    onMouseDown={() => setIsHolding(true)}
                    onMouseUp={() => setIsHolding(false)}
                    onMouseLeave={() => setIsHolding(false)}
                    onTouchStart={() => setIsHolding(true)}
                    onTouchEnd={() => setIsHolding(false)}
                    className="absolute z-10 w-28 h-28 rounded-full bg-purple-900/20 border border-purple-500/50 backdrop-blur-sm flex flex-col items-center justify-center text-purple-200 animate-pulse active:scale-95 transition-transform hover:bg-purple-900/40"
                >
                    <Wand2 size={32} className="mb-1 text-purple-300" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-purple-100">Cast</span>
                </button>
            </div>
        </div>
    );
};

const Step3_Quarters = ({ charged, onCharge, onNext }: { charged: string[], onCharge: (n: string) => void, onNext: () => void }) => {
    // We restore the "Hold to Charge" logic individually for each quarter
    const quarters = [
        { name: "Air", sprite: "Air Sigil", pos: { top: '15%', left: '50%' } },
        { name: "Fire", sprite: "Fire Sigil", pos: { top: '40%', left: '85%' } },
        { name: "Water", sprite: "Water Sigil", pos: { top: '85%', left: '75%' } },
        { name: "Earth", sprite: "Earth Sigil", pos: { top: '85%', left: '25%' } },
        { name: "Spirit", sprite: "Spirit Sigil", pos: { top: '40%', left: '15%' } }
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full relative">
            <h2 className="absolute top-4 text-2xl font-serif text-purple-200 text-center w-full">Call the Guardians</h2>
            <div className="relative w-full max-w-md aspect-square mt-8">
                {quarters.map(q => (
                    <div key={q.name} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={q.pos}>
                         <RestoredChargingSigil 
                            name={q.name} 
                            spriteName={q.sprite} 
                            isCharged={charged.includes(q.name)} 
                            onComplete={() => onCharge(q.name)} 
                        />
                    </div>
                ))}
            </div>
            {charged.length === 5 && (
                <button onClick={onNext} className="absolute bottom-10 px-10 py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg animate-bounce shadow-[0_0_20px_orange]">
                    Seal the Quarters
                </button>
            )}
        </div>
    );
};

const RestoredChargingSigil = ({ name, spriteName, isCharged, onComplete }: any) => {
    const [isHolding, setIsHolding] = useState(false);
    const soundRef = useRef<any>(null);
    const sprite = findSprite(spriteName);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isHolding && !isCharged) {
            soundRef.current = playSound('/audio/sfx-chaos-hold.mp3', 0.3, true);
            timer = setTimeout(onComplete, CHARGE_DURATION_ELEMENT);
        }
        return () => { clearTimeout(timer); if(soundRef.current) soundRef.current.stop(); };
    }, [isHolding, isCharged, onComplete]);

    if (!sprite) return null;

    return (
        <div 
            className="w-24 h-24 relative"
            onMouseDown={() => setIsHolding(true)}
            onMouseUp={() => setIsHolding(false)}
            onMouseLeave={() => setIsHolding(false)}
            onTouchStart={() => setIsHolding(true)}
            onTouchEnd={() => setIsHolding(false)}
        >
             <div className={`w-full h-full transition-all duration-500 ${isCharged ? 'scale-110 brightness-150 saturate-150' : 'grayscale brightness-75'} ${isHolding ? 'scale-105' : ''}`}>
                 <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={sprite.sheet.spriteSize.width} spriteHeight={sprite.sheet.spriteSize.height} sheetWidth={sprite.sheet.sheetSize.width} sheetHeight={sprite.sheet.sheetSize.height} />
             </div>
             {/* The Restored Ring Animation */}
             <InteractionRing isHolding={isHolding} isComplete={isCharged} duration={CHARGE_DURATION_ELEMENT} />
        </div>
    );
};


const Step4_Deities = ({ suggestions, onSelect }: { suggestions: WiccanDeitySuggestion[], onSelect: (d: WiccanDeitySuggestion) => void }) => (
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

const Step5_Ingredients = ({ spell, index, onComplete }: { spell: GeneratedWiccanSpell, index: number, onComplete: () => void }) => {
    const item = spell.symbolic_ingredients[index];
    const sprite = findSprite(item.name) || findSprite("White Candle")!;
    const [holding, setHolding] = useState(false);
    const [complete, setComplete] = useState(false);
    const soundRef = useRef<any>(null);

    // Restored complex charge logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (holding && !complete) {
            soundRef.current = playSound('/audio/sfx-chaos-hold.mp3', 0.3, true);
            timer = setTimeout(() => {
                setComplete(true);
                setTimeout(onComplete, 500); // Slight delay after completion to show effect
            }, CHARGE_DURATION_INGREDIENT);
        }
        return () => { clearTimeout(timer); if(soundRef.current) soundRef.current.stop(); };
    }, [holding, complete, onComplete]);

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8">
            <h2 className="text-2xl font-serif text-purple-200">Consecrate the Components</h2>
            <div className="relative w-64 h-64 flex items-center justify-center">
                 {/* Main Ingredient Sprite */}
                <div 
                    onMouseDown={() => setHolding(true)}
                    onMouseUp={() => setHolding(false)}
                    onTouchStart={() => setHolding(true)}
                    onTouchEnd={() => setHolding(false)}
                    className={`relative z-10 w-48 h-48 transition-all duration-300 ${holding ? 'scale-105' : 'scale-100'} cursor-pointer`}
                >
                     <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={sprite.sheet.spriteSize.width} spriteHeight={sprite.sheet.spriteSize.height} sheetWidth={sprite.sheet.sheetSize.width} sheetHeight={sprite.sheet.sheetSize.height} />
                </div>
                
                {/* Restored Interaction Ring */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg) scale(1.1)' }}>
                    <circle cx="50" cy="50" r="48" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="transparent" />
                    <motion.circle
                        cx="50" cy="50" r="48"
                        stroke="rgba(168, 85, 247, 1)"
                        strokeWidth="3"
                        fill="transparent"
                        strokeLinecap="round"
                        pathLength="1"
                        strokeDasharray="1"
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

const Step6_Cone = ({ spell, onNext }: { spell: GeneratedWiccanSpell, onNext: () => void }) => {
    const [castProgress, setCastProgress] = useState(0);
    const [isCasting, setIsCasting] = useState(false);
    const soundRef = useRef<any>(null);

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
            {/* Background Chant */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none select-none">
                 <p className="text-center font-serif text-3xl md:text-5xl text-purple-500/50 leading-loose whitespace-pre-line px-8 blur-[1px]">
                     {spell.central_chant}
                 </p>
            </div>
            
            <div 
                className="relative z-10 w-64 h-64 md:w-80 md:h-80 cursor-pointer active:scale-95 transition-transform"
                onMouseDown={() => setIsCasting(true)}
                onMouseUp={() => setIsCasting(false)}
                onTouchStart={() => setIsCasting(true)}
                onTouchEnd={() => setIsCasting(false)}
            >
                <PentagramIcon className={`w-full h-full ${isCasting ? 'text-amber-400 drop-shadow-[0_0_25px_gold]' : 'text-purple-900'} transition-colors duration-1000`} isTracing={isCasting} />
                
                {/* Visual Feedback for Power Building */}
                {isCasting && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse"
                    />
                )}
            </div>
            
            <div className="mt-12 text-center relative z-20">
                <p className="text-2xl text-amber-100 font-serif mb-2">
                    {isCasting ? "RAISING THE CONE OF POWER..." : "Hold the Pentagram"}
                </p>
                <p className="text-sm text-purple-300">Channel your energy into the center.</p>
            </div>
        </div>
    );
};

const Step7_Sending = ({ onNext }: { onNext: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onNext, SENDING_DURATION);
        return () => clearTimeout(timer);
    }, [onNext]);
    
    return (
        <div className="w-full h-full flex items-center justify-center bg-white/5 relative overflow-hidden">
             {/* Simple Particle Effect Mockup */}
             {[...Array(20)].map((_, i) => (
                 <motion.div 
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{ 
                        x: (Math.random() - 0.5) * 800, 
                        y: (Math.random() - 0.5) * 800, 
                        opacity: 0, 
                        scale: Math.random() * 2 
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute w-4 h-4 bg-amber-200 rounded-full blur-sm"
                 />
             ))}
            <h1 className="text-4xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-purple-300 animate-pulse drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]">
                RELEASED
            </h1>
        </div>
    );
};

const Step8_Closing = ({ onComplete }: { onComplete: () => void }) => {
    const sprite = findSprite("Grounding Roots");
    return (
        <div className="flex flex-col items-center justify-center h-full gap-8">
            <h2 className="text-2xl font-serif text-purple-200">Ground the Energy</h2>
            <button onClick={() => { playSound('/audio/earth.mp3', 0.5).play(); onComplete(); }} className="w-64 h-64 relative group cursor-pointer">
                <div className="absolute inset-0 bg-green-900/20 rounded-full blur-2xl group-hover:bg-green-800/40 transition-colors duration-700" />
                <div className="relative w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-100 group-hover:scale-105">
                     {sprite ? (
                         <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={sprite.sheet.spriteSize.width} spriteHeight={sprite.sheet.spriteSize.height} sheetWidth={sprite.sheet.sheetSize.width} sheetHeight={sprite.sheet.sheetSize.height} />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center"><Sparkles size={64} className="text-green-500" /></div>
                     )}
                </div>
            </button>
            <p className="text-gray-400 font-serif italic text-lg">Touch the Earth to open the circle.</p>
        </div>
    );
};

const Step9_Result = ({ spell, onSave, isSaving, isSaved, onReset }: any) => (
    <div className="flex flex-col items-center justify-center h-full gap-8 text-center max-w-lg mx-auto animate-in fade-in zoom-in duration-700">
        <BookOpen size={64} className="text-amber-200 mb-4 drop-shadow-[0_0_15px_gold]" />
        <h2 className="text-3xl md:text-4xl font-serif text-amber-100 leading-tight drop-shadow-md">{spell.affirmation}</h2>
        <p className="text-purple-300 text-lg">The ritual is woven into the tapestry of fate.</p>
        <div className="flex flex-col gap-4 w-full px-8 mt-4">
            <button onClick={onSave} disabled={isSaved || isSaving} className="w-full py-4 bg-indigo-900/80 border border-indigo-500 rounded-lg text-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-800 transition-colors font-serif text-lg">
                {isSaved ? <Check /> : <Save />} {isSaved ? "Recorded in Grimoire" : "Save Record (1 Credit)"}
            </button>
            <button onClick={onReset} className="w-full py-4 bg-gray-800/60 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors font-serif">
                Return to Altar
            </button>
        </div>
    </div>
);

export default WiccaMagick;