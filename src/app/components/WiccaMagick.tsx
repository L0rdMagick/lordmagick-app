// --- START OF FILE src/app/components/WiccaMagick.tsx ---

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// --- Asset Configuration ---
const ASSET_PATH = "/images/Spells/Wicca Tradition General";

// --- Main Component ---
const WiccaMagick: React.FC<{ session: Session; isSubscribed: boolean }> = ({ session, isSubscribed }) => {
    const [ritualStep, setRitualStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form & Spell Data
    const [intention, setIntention] = useState('');
    const [chargedElements, setChargedElements] = useState<string[]>([]);
    const [selectedDeities, setSelectedDeities] = useState<string[]>([]);
    const [generatedSpell, setGeneratedSpell] = useState<GeneratedWiccanSpell | null>(null);
    const [chargingIndex, setChargingIndex] = useState(0);

    // --- Core Logic (Adapted from previous flow) ---

    const handleGenerateSpell = async () => {
        if (!intention) { setError("An intention must be inscribed."); return; }
        setLoading(true);
        setError(null);
        try {
            const focalPoint = selectedDeities.length > 0 ? selectedDeities.join(', ') : 'The Divine';
            const spell = await generateWiccanSpell({ intention, focalPoint, moonPhase: 'Current' });
            setGeneratedSpell(spell);
            setRitualStep(prev => prev + 1);
        } catch (err: any) {
            setError(err.message || "The spirits are busy. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleElementChargeComplete = (elementName: string) => {
        if (!chargedElements.includes(elementName)) {
            setChargedElements(prev => [...prev, elementName]);
        }
    };
    
    const handleDeityToggle = (deityName: string) => {
        setSelectedDeities(prev => 
            prev.includes(deityName) 
                ? prev.filter(d => d !== deityName)
                : [...prev, deityName]
        );
    };

    const handleAdvanceAfterCharge = () => {
        if (chargingIndex < 4) {
            setChargingIndex(prev => prev + 1);
        } else {
            setRitualStep(prev => prev + 1);
        }
    };
    
    // --- Render Logic ---

    const renderStep = () => {
        if (loading) return <div className="flex items-center justify-center h-full"><LoadingSpinner title="Weaving the Spell..." /></div>;
        if (error) return <div className="text-center text-red-400 p-4"><p>{error}</p><button onClick={() => setError(null)} className="mt-2 underline">Try Again</button></div>;

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
        <main className="relative min-h-screen w-full bg-black bg-cover bg-center flex flex-col" style={{ backgroundImage: "url('/images/spell-room/spell-room-background.png')" }}>
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
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="w-full h-full"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
};

// --- Step Components ---

const StepContainer: React.FC<{ stageTitle: string; children: React.ReactNode; buttonText?: string; onButtonClick?: () => void; buttonDisabled?: boolean; showButton?: boolean; }> = 
({ stageTitle, children, buttonText, onButtonClick, buttonDisabled = false, showButton = true }) => (
    <div className="w-full h-full flex flex-col items-center justify-between gap-4">
        <h2 className="text-3xl font-serif text-amber-200/90 text-center shrink-0">{stageTitle}</h2>
        <div className="w-full grow min-h-0 flex items-center justify-center">
            {children}
        </div>
        <div className="h-[52px] shrink-0">
            {showButton && buttonText && onButtonClick && (
                <button onClick={onButtonClick} disabled={buttonDisabled} className="px-8 py-3 bg-black/40 text-white font-serif rounded-lg border-2 border-purple-400/50 backdrop-blur-sm hover:bg-purple-900/50 hover:border-purple-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    {buttonText}
                </button>
            )}
        </div>
    </div>
);

const Step0_Intro: React.FC<{ onNext: () => void }> = ({ onNext }) => (
    <StepContainer stageTitle="" buttonText="Continue" onButtonClick={onNext}>
        <div className="relative w-full max-w-md h-full">
            <Image src={`${ASSET_PATH}/wicca_intro_instructions.png`} alt="Wiccan Spellcraft Instructions" layout="fill" objectFit="contain" priority />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <h3 className="text-3xl font-serif text-gray-200" style={{ textShadow: '0 0 8px black', transform: 'translateY(-200%)' }}>Wiccan Spellcraft</h3>
                <p className="w-3/4 text-lg text-gray-300 leading-relaxed" style={{transform: 'translateY(-10%)'}}>
                    Enter this realm to do a Wicca-influenced magick spell.
                </p>
            </div>
        </div>
    </StepContainer>
);

const Step1_Intention: React.FC<{ intention: string; setIntention: (val: string) => void; onNext: () => void }> = ({ intention, setIntention, onNext }) => (
    <StepContainer stageTitle="State Your True Will" buttonText="Seal My Intention" onButtonClick={onNext} buttonDisabled={!intention}>
        <div className="relative w-full max-w-md h-full">
            <Image src={`${ASSET_PATH}/wicca_scroll_intention.png`} alt="Inscribe your intention" layout="fill" objectFit="contain" />
            <div className="absolute w-[60%] h-[40%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <textarea value={intention} onChange={(e) => setIntention(e.target.value)} placeholder="e.g., To find clarity on my career path" className="w-full h-full bg-transparent text-center text-[#4a2e1c] text-xl font-serif focus:outline-none resize-none" />
            </div>
        </div>
    </StepContainer>
);

const Step2_Elements: React.FC<{ chargedElements: string[], onChargeComplete: (name: string) => void, onNext: () => void }> = ({ chargedElements, onChargeComplete, onNext }) => (
     <StepContainer stageTitle="Call the Elemental Guardians" buttonText="Continue" onButtonClick={onNext} showButton={chargedElements.length === 5}>
        <div className="relative w-full max-w-md aspect-square">
            {['Spirit', 'Air', 'Fire', 'Earth', 'Water'].map((el, i) => {
                const positions = [ { top: '10%', left: '50%'}, { top: '45%', left: '90%'}, { top: '85%', left: '75%'},  { top: '85%', left: '25%'}, { top: '45%', left: '10%'} ];
                return ( <ChargingElement key={el} name={el} isCharged={chargedElements.includes(el)} onChargeComplete={onChargeComplete} style={{...positions[i], transform: 'translate(-50%, -50%)'}} /> );
            })}
        </div>
    </StepContainer>
);

const Step3_Deities: React.FC<{ selectedDeities: string[], onToggle: (name: string) => void, onNext: () => void }> = ({ selectedDeities, onToggle, onNext }) => (
    <div className="w-full h-full flex flex-col items-center justify-between gap-6 p-4">
        <h2 className="text-3xl font-serif text-amber-200/90 text-center shrink-0">Summon a Divine Guide</h2>
        <div className="w-full grow min-h-0 flex items-center justify-center">
             <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                {[{ name: 'Triple Goddess', img: 'wicca_deity_triple_goddess.png' }, { name: 'Horned God', img: 'wicca_deity_horned_god.png' }, { name: 'Divine Source', img: 'wicca_deity_divine_source.png' }].map(deity => {
                    const isSelected = selectedDeities.includes(deity.name);
                    return (
                        <div key={deity.name} onClick={() => onToggle(deity.name)} className="text-center cursor-pointer group">
                            <div className={`relative w-36 h-36 sm:w-48 sm:h-48 transition-all duration-300 transform ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                                <Image src={`${ASSET_PATH}/${deity.img}`} layout="fill" objectFit="contain" alt={deity.name} className={`transition-all duration-300 ${isSelected ? 'brightness-110' : 'brightness-75 group-hover:brightness-100'}`} />
                                <div className={`absolute inset-0 rounded-full ring-2 transition-all duration-300 ${isSelected ? 'ring-purple-400 ring-offset-4 ring-offset-black/20' : 'ring-transparent'}`} />
                            </div>
                            <p className={`mt-2 text-lg font-serif transition-colors duration-300 ${isSelected ? 'text-purple-300' : 'text-gray-400 group-hover:text-white'}`}>{deity.name}</p>
                        </div>
                    )
                })}
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <button onClick={onNext} className="px-8 py-3 bg-black/40 text-white font-serif rounded-lg border-2 border-purple-400/50 backdrop-blur-sm hover:bg-purple-900/50 hover:border-purple-300">Confirm Invocation</button>
            <button onClick={onNext} className="px-8 py-3 bg-black/20 text-white font-serif rounded-lg border-2 border-gray-600/50 backdrop-blur-sm hover:bg-gray-800/50">Continue without Deity</button>
        </div>
    </div>
);

const Step4_Components: React.FC<{ spell: GeneratedWiccanSpell, onNext: () => void }> = ({ spell, onNext }) => (
    <StepContainer stageTitle="The Fated Components" buttonText="Prepare Components" onButtonClick={onNext}>
        <div className='text-center'>
            <p className="text-gray-300 mb-6">These items have been chosen for your intention.</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 bg-black/30 p-4 rounded-lg">
                {spell.symbolic_ingredients.map(ingredient => {
                    const spriteData = findSprite(ingredient.name);
                    if (!spriteData) return null;
                    return (
                        <div key={ingredient.name} className="flex flex-col items-center gap-2">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-lg p-1">
                                <Sprite {...spriteData.itemInfo} sheetPath={spriteData.sheet.path} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} />
                            </div>
                            <p className="text-sm text-center font-semibold text-purple-300">{ingredient.name}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    </StepContainer>
);

const Step5_ChargeComponent: React.FC<{ spell: GeneratedWiccanSpell, chargingIndex: number, onNext: () => void }> = ({ spell, chargingIndex, onNext }) => {
    // This is a simplified version. The full charging logic can be re-integrated here.
    return (
        <StepContainer stageTitle="Imbue with Aether" buttonText={chargingIndex < 4 ? "Charge Next" : "Continue"} onButtonClick={onNext}>
            <div className="relative w-full max-w-md h-full">
                <Image src={`${ASSET_PATH}/wicca_charge_ingredient_template.png`} alt="Charge Component" layout="fill" objectFit="contain" />
                <p className="absolute top-[22%] left-1/2 -translate-x-1/2 w-full text-center font-serif text-2xl text-amber-200">Charge the {spell.symbolic_ingredients[chargingIndex].name}</p>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 grid place-items-center">
                    {(() => {
                        const ingredient = spell.symbolic_ingredients[chargingIndex];
                        const spriteData = findSprite(ingredient.name);
                        if (!spriteData) return null;
                        return <Sprite {...spriteData.itemInfo} sheetPath={spriteData.sheet.path} spriteWidth={spriteData.sheet.spriteSize.width} spriteHeight={spriteData.sheet.spriteSize.height} sheetWidth={spriteData.sheet.sheetSize.width} sheetHeight={spriteData.sheet.sheetSize.height} />;
                    })()}
                </div>
            </div>
        </StepContainer>
    );
};

const Step6_Incantation: React.FC<{ spell: GeneratedWiccanSpell, onNext: () => void }> = ({ spell, onNext }) => (
    <StepContainer stageTitle="Speak the Words of Power" buttonText="Ready to Cast" onButtonClick={onNext}>
        <div className="relative w-full max-w-md h-full">
            <Image src={`${ASSET_PATH}/wicca_incantation_scroll.png`} alt="Incantation Scroll" layout="fill" objectFit="contain" />
            <div className="absolute w-[65%] h-[50%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <p className="font-serif text-2xl text-[#4a2e1c] text-center whitespace-pre-line leading-relaxed">{spell.central_chant}</p>
            </div>
        </div>
    </StepContainer>
);

const Step7_Cast: React.FC<{ spell: GeneratedWiccanSpell, onNext: () => void }> = ({ spell, onNext }) => {
    // Simplified version. Full hold-to-cast logic can be added here.
    return (
        <StepContainer stageTitle="Unleash the Magick" showButton={false}>
            <div className="relative w-full max-w-2xl aspect-square cursor-pointer" onClick={onNext}>
                <Image src={`${ASSET_PATH}/wicca_pentagram_ready_to_cast.png`} layout="fill" objectFit="contain" alt="Cast the Spell" />
                <PentagramIcon className="absolute w-full h-full text-white pointer-events-none" isTracing={false} />
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 font-serif text-2xl pointer-events-none text-center text-white" style={{ textShadow: '0 0 10px black' }}> 
                    Hold to Focus Your Will and<br/>Cast the Spell
                </p>
            </div>
        </StepContainer>
    );
};

const Step8_Manifestation: React.FC<{ spell: GeneratedWiccanSpell }> = ({ spell }) => (
     <StepContainer stageTitle="Witness the Manifestation" buttonText="Return to Spell Room" onButtonClick={() => window.location.href = '/spell-room'}>
        <div className="relative w-full max-w-2xl h-full">
            <Image src={`${ASSET_PATH}/wicca_spell_manifestation.png`} alt="Spell Manifestation" layout="fill" objectFit="contain" />
            <div className="absolute w-[45%] h-[40%] top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <p className="text-4xl text-center text-white font-serif">{spell.affirmation}</p>
            </div>
        </div>
    </StepContainer>
);


// --- Helper components for complex interactions like charging (can be re-integrated) ---

const ChargingElement: React.FC<{ name: string, isCharged: boolean, onChargeComplete: (name: string) => void, style: React.CSSProperties }> = ({ name, isCharged, onChargeComplete, style }) => {
    const [isHolding, setIsHolding] = useState(false);
    // Dummy charging logic for demonstration
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isHolding && !isCharged) {
            timer = setTimeout(() => {
                onChargeComplete(name);
            }, 2000);
        }
        return () => clearTimeout(timer);
    }, [isHolding, isCharged, name, onChargeComplete]);

    return (
        <div className="absolute grid place-items-center" style={style}>
            <button
                onMouseDown={() => setIsHolding(true)} onMouseUp={() => setIsHolding(false)} onMouseLeave={() => setIsHolding(false)}
                onTouchStart={() => setIsHolding(true)} onTouchEnd={() => setIsHolding(false)}
                className={`relative w-24 h-24 rounded-full transition-all duration-300 flex items-center justify-center ${isCharged ? 'bg-purple-500/50 ring-2 ring-white' : 'bg-white/10 hover:bg-white/20'}`}
            >
                <span className="text-white font-serif text-lg">{name}</span>
            </button>
        </div>
    );
};

export default WiccaMagick;