// --- START OF FILE src/app/components/WiccaMagick.tsx ---
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import type { Session, GeneratedWiccanSpell, WiccanDeity } from '@/lib/types';

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
import { Wand2, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';

// --- Configuration ---
const ASSET_PATH = "/images/Spells/Wicca Tradition General";
const CHARGE_DURATION_ELEMENT = 2000;
const CHARGE_DURATION_INGREDIENT = 3000;
const CAST_DURATION = 13000;
const SERVICE_SLUG = 'ai_wicca_magick'; 

// --- Standard Ritual Data (Free Tier) ---
const STANDARD_WICCAN_SPELL: GeneratedWiccanSpell = {
    title: "Circle of Elemental Balance",
    central_chant: "Eko Eko Azarak, Eko Eko Zomelak.\nBy Earth and Water, Fire and Air,\nI cast this spell with love and care.",
    affirmation: "The Circle is Open, but Unbroken.",
    transitional_incantations: {
        sanctification: "By my will and by my word,\nlet my true intent be heard.",
        circle_casting: "I cast this Circle, a shield deep and wide,\nto keep the power safe inside.",
        invocation: "Lord and Lady, join this rite,\nlend to me your sacred might.",
        closing: "The Circle is open, but unbroken.\nMerry meet, and merry part, and merry meet again."
    },
    suggested_deities: [
        { name: "Triple Goddess", title: "Mother of All", pantheon: "Wiccan", description: "The Maiden, Mother, and Crone." },
        { name: "Horned God", title: "Lord of the Wild", pantheon: "Wiccan", description: "The Hunter and the Sun." },
        { name: "Divine Source", title: "The All-One", pantheon: "Universal", description: "The energy connecting all things." }
    ],
    symbolic_ingredients: [
        { name: "Salt", incantation: "Salt of Earth, purify this space." },
        { name: "Chalice", incantation: "Water of Life, cleanse my spirit." },
        { name: "Athame", incantation: "Air of Intellect, direct my will." },
        { name: "Candle", incantation: "Fire of Passion, ignite my soul." },
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
    if (typeof window === 'undefined') return { play: () => {}, stop: () => {} };
    const AudioCtor = (window as any).Audio;
    const audio = new AudioCtor(src);
    audio.volume = volume;
    audio.loop = loop;
    const play = () => audio.play().catch((e: any) => console.error(`Failed to play sound: ${src}`, e));
    const stop = () => { audio.pause(); audio.currentTime = 0; };
    return { play, stop };
};

// --- Helper Components ---

const SpriteFromKey = ({ sheet, index }: { sheet: string, index: number }) => {
    // A simplification. Ideally, findSprite would accept an index or we map the suggested names to keys.
    // For now, we will try to find a sprite using a generic name if passed, or just render a placeholder.
    return <div className="w-full h-full bg-white/10 rounded-full border border-white/20" />; 
};

const ChargingButton = ({ sprite, isCharged, onComplete }: { sprite: any, isCharged: boolean, onComplete: () => void }) => {
    const [holding, setHolding] = useState(false);
    
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (holding && !isCharged) {
            timer = setTimeout(onComplete, 2000); 
        }
        return () => clearTimeout(timer);
    }, [holding, isCharged, onComplete]);

    return (
        <div 
            onMouseDown={() => setHolding(true)} onMouseUp={() => setHolding(false)}
            onMouseLeave={() => setHolding(false)}
            onTouchStart={() => setHolding(true)} onTouchEnd={() => setHolding(false)}
            className={`w-20 h-20 rounded-full transition-all duration-300 cursor-pointer ${holding ? 'scale-110 shadow-[0_0_20px_gold]' : ''} ${isCharged ? 'opacity-50 grayscale' : 'opacity-100 hover:scale-105'}`}
        >
            {sprite ? (
                <Sprite sheetPath={sprite.sheet.path} x={sprite.itemInfo.x} y={sprite.itemInfo.y} spriteWidth={256} spriteHeight={256} sheetWidth={1024} sheetHeight={1024} />
            ) : (
                <div className="w-full h-full bg-gray-500 rounded-full" />
            )}
        </div>
    );
};

// --- New Component: Incantation Overlay ---
const IncantationOverlay = ({ text, onConfirm }: { text: string; onConfirm: () => void }) => (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
        <div className="relative w-full max-w-md aspect-[3/4]">
            <Image src={`${ASSET_PATH}/wicca_incantation_scroll.png`} alt="Scroll" layout="fill" objectFit="contain" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center gap-6">
                <p className="font-serif text-[#4a2e1c] text-lg md:text-xl leading-relaxed whitespace-pre-line" style={{ textShadow: '0 0 1px rgba(74,46,28,0.3)' }}>
                    {text}
                </p>
                <button 
                    onClick={() => { playSound('/audio/sfx-chaos-activate.mp3', 0.3).play(); onConfirm(); }}
                    className="px-6 py-2 bg-[#4a2e1c] text-[#e8d5b5] font-serif rounded shadow-lg hover:bg-[#2e1d11] transition-colors"
                >
                    So Mote It Be
                </button>
            </div>
        </div>
    </motion.div>
);

// --- New Component: Circle Trace ---
const CircleTrace = ({ onComplete }: { onComplete: () => void }) => {
    const [progress, setProgress] = useState(0);
    const svgRef = useRef<SVGSVGElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = (clientX: number, clientY: number) => {
        if (!isDragging || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; 
        if (angle < 0) angle += 360;

        const currentProgress = angle / 360;
        
        if (currentProgress > progress && (currentProgress - progress) < 0.2) {
             setProgress(currentProgress);
        } else if (progress > 0.9 && currentProgress < 0.1) {
             setProgress(1);
             playSound('/audio/sfx-chaos-activate.mp3', 0.5).play();
             onComplete();
             setIsDragging(false);
        }
    };

    return (
        <div className="relative w-64 h-64 md:w-80 md:h-80 touch-none">
            <svg 
                ref={svgRef}
                viewBox="0 0 100 100" 
                className="w-full h-full transform -rotate-90"
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => setIsDragging(false)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
            >
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <motion.circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#60a5fa" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    style={{ pathLength: progress, filter: "drop-shadow(0 0 8px #3b82f6)" }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-blue-200/50 font-serif text-sm">Trace the Circle</p>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const WiccaMagick = ({ session, onBack }: { session: Session; isSubscribed: boolean; onBack?: () => void }) => {
    const searchParams = useSearchParams();
    const loadId = searchParams.get('loadId');

    // Steps: 0=Intro, 1=Intention, 2=Circle, 3=Quarters, 4=Deity, 5=Ingredients, 6=ConeOfPower, 7=Sending, 8=Closing, 9=Manifest
    const [ritualStep, setRitualStep] = useState(0);
    
    // State for "Speak First" Model
    const [showIncantation, setShowIncantation] = useState(false);
    const [incantationText, setIncantationText] = useState('');
    const [stepLocked, setStepLocked] = useState(false);

    // Data State
    const [intention, setIntention] = useState('');
    const [situation, setSituation] = useState('');
    const [generatedSpell, setGeneratedSpell] = useState<GeneratedWiccanSpell | null>(null);
    const [selectedDeity, setSelectedDeity] = useState<WiccanDeity | null>(null);
    const [chargedElements, setChargedElements] = useState<string[]>([]);
    const [chargingIndex, setChargingIndex] = useState(0);
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    const { cost, spendAether, paymentError, clearPaymentError } = useAetherEconomy(SERVICE_SLUG);

    // --- Loading Logic ---
    useEffect(() => {
        if (loadId) {
            const load = async () => {
                setLoading(true);
                const spellData = await getSpellById(loadId);
                if (spellData) {
                    const data = typeof spellData.ritual_data === 'string' ? JSON.parse(spellData.ritual_data) : spellData.ritual_data;
                    setIntention(spellData.intention);
                    setSituation(data.situation || '');
                    setGeneratedSpell(data.spell || STANDARD_WICCAN_SPELL);
                    if (data.selectedDeity) setSelectedDeity(data.selectedDeity);
                    setIsSaved(true);
                    setRitualStep(1);
                }
                setLoading(false);
            };
            load();
        }
    }, [loadId]);

    // --- Workflow Handlers ---

    const startStandardRitual = () => {
        setGeneratedSpell(STANDARD_WICCAN_SPELL);
        triggerStep(2, STANDARD_WICCAN_SPELL.transitional_incantations?.circle_casting || "I cast this circle...");
    };

    const startAIRitual = async () => {
        if (!session?.user) { setError("Login required."); return; }
        const paid = await spendAether(session.user.id);
        if (!paid) return;

        setLoading(true);
        try {
            const spell = await generateWiccanSpell({ intention, situation, focalPoint: 'Divine', moonPhase: 'Current' });
            setGeneratedSpell(spell);
            setLoading(false);
            triggerStep(2, spell.transitional_incantations?.circle_casting || "I cast this circle...");
        } catch (e: any) {
            setError(e.message);
            setLoading(false);
        }
    };

    const triggerStep = (stepIndex: number, text: string) => {
        setRitualStep(stepIndex);
        setIncantationText(text);
        setShowIncantation(true);
        setStepLocked(true);
    };

    const unlockStep = () => {
        setShowIncantation(false);
        setStepLocked(false);
    };

    // --- Step Renderers ---

    const renderStepContent = () => {
        switch (ritualStep) {
            case 0: // Intro
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="relative w-64 h-64 mb-6">
                            <Image src={`${ASSET_PATH}/wicca_intro_instructions.png`} layout="fill" objectFit="contain" alt="Intro" />
                        </div>
                        <h1 className="text-3xl font-serif text-amber-100 mb-4">Wicca Magick</h1>
                        <button onClick={() => setRitualStep(1)} className="px-8 py-3 bg-purple-900 border border-purple-500 rounded text-purple-100 font-serif hover:bg-purple-800 transition-colors">
                            Enter the Temple
                        </button>
                    </div>
                );

            case 1: // Intention
                return (
                    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto relative">
                         <div className="relative w-full aspect-square">
                            <Image src={`${ASSET_PATH}/wicca_scroll_intention.png`} layout="fill" objectFit="contain" alt="Scroll" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 pt-24 gap-4">
                                <input 
                                    value={intention} onChange={e => setIntention(e.target.value)} 
                                    placeholder="My Intention..." 
                                    className="bg-transparent border-b border-[#4a2e1c] text-center font-serif text-[#4a2e1c] w-3/4 outline-none placeholder:text-[#4a2e1c]/50"
                                />
                                <textarea 
                                    value={situation} onChange={e => setSituation(e.target.value)}
                                    placeholder="Context..." 
                                    className="bg-transparent text-center font-serif text-[#4a2e1c] w-3/4 h-20 outline-none resize-none text-sm placeholder:text-[#4a2e1c]/50"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button onClick={() => {
                                setGeneratedSpell(STANDARD_WICCAN_SPELL);
                                triggerStep(1, STANDARD_WICCAN_SPELL.transitional_incantations?.sanctification || "By my will...");
                            }} className="px-4 py-2 bg-slate-800 text-slate-200 rounded border border-slate-600">Standard</button>
                            <button onClick={async () => {
                                setIncantationText("By my will and by my word,\nlet my true intent be heard.");
                                setShowIncantation(true);
                                setStepLocked(true); 
                            }} className="px-4 py-2 bg-purple-900 text-purple-100 rounded border border-purple-500 flex items-center gap-2">High Ritual <Sparkles size={14}/></button>
                        </div>
                    </div>
                );

            case 2: // Cast Circle
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <h2 className="text-2xl font-serif text-blue-200 mb-8">Cast the Circle</h2>
                        <CircleTrace onComplete={() => {
                            triggerStep(3, generatedSpell?.transitional_incantations?.invocation || "Guardians hail!"); 
                        }} />
                    </div>
                );

            case 3: // Call Quarters
                return (
                    <div className="flex flex-col items-center justify-center h-full relative">
                        <h2 className="text-2xl font-serif text-amber-100 mb-4">Call the Quarters</h2>
                        <div className="relative w-full max-w-sm aspect-square">
                            {['Spirit', 'Air', 'Fire', 'Earth', 'Water'].map((el, i) => {
                                const pos = [
                                    { top: '10%', left: '50%' },
                                    { top: '40%', left: '85%' },
                                    { top: '85%', left: '75%' },
                                    { top: '85%', left: '25%' },
                                    { top: '40%', left: '15%' }
                                ][i];
                                const spriteName = `${el} Sigil`; 
                                const sprite = findSprite(spriteName) || findSprite("Spirit Sigil");
                                const isCharged = chargedElements.includes(el);

                                return (
                                    <div key={el} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={pos}>
                                        <ChargingButton 
                                            sprite={sprite} 
                                            isCharged={isCharged}
                                            onComplete={() => {
                                                const newCharged = [...chargedElements, el];
                                                setChargedElements(newCharged);
                                                if (newCharged.length === 5) {
                                                    triggerStep(4, generatedSpell?.transitional_incantations?.invocation || "Lord and Lady...");
                                                }
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case 4: // Invocation
                return (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                         <h2 className="text-2xl font-serif text-purple-200 mb-6">Select Your Patron</h2>
                         <div className="flex flex-wrap justify-center gap-4">
                            {(generatedSpell?.suggested_deities || STANDARD_WICCAN_SPELL.suggested_deities)?.map((deity, i) => (
                                <div key={i} onClick={() => {
                                    setSelectedDeity(deity);
                                    setChargingIndex(0);
                                    const firstIng = generatedSpell?.symbolic_ingredients[0];
                                    triggerStep(5, `I charge this ${firstIng?.name || 'Item'}...`);
                                }} className="bg-black/40 border border-purple-500/30 p-4 rounded-lg cursor-pointer hover:bg-purple-900/30 w-40 text-center">
                                    <h3 className="text-purple-100 font-serif">{deity.name}</h3>
                                    <p className="text-xs text-purple-300">{deity.title}</p>
                                </div>
                            ))}
                         </div>
                    </div>
                );

            case 5: // Charging Ingredients
                const ingredient = generatedSpell?.symbolic_ingredients[chargingIndex];
                if (!ingredient) return null;
                
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                         <h2 className="text-xl font-serif text-amber-100 mb-8">Charge the {ingredient.name}</h2>
                         <div className="relative w-64 h-64">
                             <Image src={`${ASSET_PATH}/wicca_charge_ingredient_template.png`} layout="fill" alt="Background"/>
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <ChargingButton 
                                    sprite={findSprite(ingredient.name)} 
                                    isCharged={false} 
                                    onComplete={() => {
                                        if (chargingIndex < 4) {
                                            const nextIng = generatedSpell?.symbolic_ingredients[chargingIndex + 1];
                                            setChargingIndex(prev => prev + 1);
                                            triggerStep(5, `I charge this ${nextIng?.name}...`); 
                                        } else {
                                            setRitualStep(6);
                                        }
                                    }}
                                 />
                             </div>
                         </div>
                    </div>
                );

            case 6: // Cone of Power
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center relative">
                        <div className="absolute top-10 w-full px-4 pointer-events-none">
                            <p className="font-serif text-xl text-amber-100 whitespace-pre-line drop-shadow-lg animate-pulse">
                                {generatedSpell?.central_chant}
                            </p>
                        </div>
                        <div className="mt-20 relative w-64 h-64">
                             <PentagramIcon className="text-white w-full h-full" isTracing={true} />
                             <button 
                                onMouseDown={() => { /* Start Timer logic would go here in prod */ }}
                                onMouseUp={() => { setRitualStep(7); }}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                             >Hold to Cast</button>
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                 <p className="text-xs text-white">HOLD FOR 13 SECONDS</p>
                             </div>
                        </div>
                    </div>
                );
            
            case 7: // Sending
                 setTimeout(() => triggerStep(8, generatedSpell?.transitional_incantations?.closing || "The circle is open..."), 4000);
                 return <div className="flex items-center justify-center h-full text-4xl text-white font-serif animate-pulse">The Spell Is Sent</div>;

            case 8: // Closing
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <h2 className="text-2xl text-green-200 font-serif mb-8">Ground & Close</h2>
                        <div onClick={() => setRitualStep(9)} className="cursor-pointer hover:scale-105 transition-transform">
                             <div className="w-32 h-32 relative">
                                 {/* Assuming 'Grounding Roots' is the 5th item in ritual_framework1 */}
                                 <SpriteFromKey sheet="ritual_framework1" index={5} /> 
                             </div>
                             <p className="text-center mt-2 text-green-100">Touch Earth</p>
                        </div>
                    </div>
                );
            
            case 9: // Manifestation
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <h1 className="text-3xl font-serif text-white mb-4">So Mote It Be</h1>
                        <p className="text-amber-100 italic mb-8">"{generatedSpell?.affirmation}"</p>
                        <button onClick={() => {
                            saveSpell(session?.user?.id || 'anon', {
                                name: generatedSpell?.title || "Spell",
                                intention,
                                incantation: generatedSpell?.central_chant || "",
                                ritual_data: { spell: generatedSpell, selectedDeity }
                            });
                            setIsSaved(true);
                        }} className="px-6 py-3 bg-indigo-900 text-white rounded mb-4">
                            {isSaved ? "Saved" : "Save to Grimoire"}
                        </button>
                        <button onClick={onBack} className="text-gray-400">Return</button>
                    </div>
                );
            
            default: return null;
        }
    };

    return (
        <main className="relative h-screen w-screen bg-black overflow-hidden" style={{ backgroundImage: "url('/images/spell-room/spell-room-background.png')", backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 w-full h-full flex flex-col">
                <header className="p-4 flex justify-between items-center text-amber-500/50">
                    <MagickalBackLink href="/spell-room" text="Exit" />
                    <div>{session && <div className="text-xs">Credits: {cost}</div>}</div>
                </header>
                <div className="flex-grow relative">
                    {loading ? <LoadingSpinner title="Weaving Magic..." /> : renderStepContent()}
                </div>
            </div>
            <AnimatePresence>
                {showIncantation && (
                    <IncantationOverlay 
                        text={incantationText} 
                        onConfirm={() => {
                             if (ritualStep === 1 && generatedSpell === null) {
                                 startAIRitual();
                                 setShowIncantation(false); 
                             } else {
                                 unlockStep();
                             }
                        }} 
                    />
                )}
            </AnimatePresence>
            {error && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 text-white p-4 rounded border border-red-500 z-50 text-center">
                    {error} <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>
                </div>
            )}
        </main>
    );
};

export default WiccaMagick;
// --- END OF FILE src/app/components/WiccaMagick.tsx ---