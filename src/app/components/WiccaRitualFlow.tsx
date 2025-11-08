// --- START OF FILE src/app/components/WiccaRitualFlow.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session, GeneratedWiccanSpell, WiccanIngredient } from '@/lib/types';
import { generateWiccanSpell } from '@/lib/services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { PentagramIcon } from './icons';

// --- Helper Components for UI Stages ---

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="absolute inset-0 flex flex-col items-center justify-center"
    >
        {children}
    </motion.div>
);

const RitualButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; disabled?: boolean; }> = ({ onClick, children, className, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-8 py-3 bg-black/40 text-white font-serif rounded-lg border-2 border-purple-400/50 backdrop-blur-sm hover:bg-purple-900/50 hover:border-purple-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

// --- Main Component ---

export const WiccaRitualFlow: React.FC<{ session: Session; isSubscribed: boolean; onBack: () => void; }> = ({ onBack }) => {
    const [ritualStep, setRitualStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [intention, setIntention] = useState('');
    const [generatedSpell, setGeneratedSpell] = useState<GeneratedWiccanSpell | null>(null);
    const [clickedElements, setClickedElements] = useState<string[]>([]);
    const [selectedDeity, setSelectedDeity] = useState<string | null>(null);
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [chargingIndex, setChargingIndex] = useState(0);
    const [placedIngredients, setPlacedIngredients] = useState<WiccanIngredient[]>([]);
    const [isCasting, setIsCasting] = useState(false);
    const castTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const ASSET_PATH = "/images/Spells/Wicca Tradition General";

    useEffect(() => {
        return () => {
            if (castTimeoutRef.current) clearTimeout(castTimeoutRef.current);
        };
    }, []);

    const handleGenerateSpell = async () => {
        if (!intention) {
            setError("Please inscribe your intention first.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const spell = await generateWiccanSpell({ intention, focalPoint: selectedDeity || 'The Divine', moonPhase: 'Current' });
            setGeneratedSpell(spell);
            setRitualStep(prev => prev + 1);
        } catch (err: any) {
            setError(err.message || "The spirits are busy. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleElementClick = (element: string) => {
        if (!clickedElements.includes(element)) {
            setClickedElements(prev => [...prev, element]);
        }
    };

    const handleIngredientSelect = (ingredientName: string) => {
        const requiredIngredients = generatedSpell?.symbolic_ingredients.map(i => i.name) || [];
        if (requiredIngredients.includes(ingredientName) && !selectedIngredients.includes(ingredientName)) {
            setSelectedIngredients(prev => [...prev, ingredientName]);
        }
    };

    const handleCharge = () => {
        const ingredientToPlace = generatedSpell?.symbolic_ingredients[chargingIndex];
        if (ingredientToPlace) {
            setPlacedIngredients(prev => [...prev, ingredientToPlace]);
            if (chargingIndex < 4) {
                setChargingIndex(prev => prev + 1);
            } else {
                setRitualStep(prev => prev + 1);
            }
        }
    };

    const handleCastHold = () => {
        setIsCasting(true);
        castTimeoutRef.current = setTimeout(() => {
            setIsCasting(false);
            setRitualStep(prev => prev + 1);
        }, 13000);
    };

    const handleCastRelease = () => {
        setIsCasting(false);
        if (castTimeoutRef.current) clearTimeout(castTimeoutRef.current);
    };

    const renderContent = () => {
        if (loading) return <LoadingSpinner customMessage="Consulting the energies..." />;
        if (error) return (
            <div className="text-center text-red-400 p-4 bg-red-500/10 rounded-lg">
                <p>{error}</p>
                <button onClick={() => { setError(null); setRitualStep(1); }} className="mt-4 text-white underline">Try Again</button>
            </div>
        );

        return (
            <AnimatePresence mode="wait">
                <div key={ritualStep} className="relative w-full h-[70vh] max-h-[800px]">
                    {ritualStep === 0 && (
                        <Stage>
                            <Image src={`${ASSET_PATH}/wicca_intro_instructions.png`} fill style={{ objectFit: 'contain' }} alt="Wicca Instructions" priority />
                            <RitualButton onClick={() => setRitualStep(1)} className="absolute bottom-[15%]">Continue</RitualButton>
                        </Stage>
                    )}
                    {ritualStep === 1 && (
                        <Stage>
                            <Image src={`${ASSET_PATH}/wicca_scroll_intention.png`} fill style={{ objectFit: 'contain' }} alt="Inscribe Intention" />
                            <textarea
                                value={intention}
                                onChange={(e) => setIntention(e.target.value)}
                                placeholder="e.g. To find clarity on my career path"
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[15%] bg-transparent text-center text-[#4a2e1c] text-xl font-serif focus:outline-none resize-none"
                            />
                            <RitualButton onClick={() => setRitualStep(2)} disabled={!intention} className="absolute bottom-[20%]">Seal My Intention</RitualButton>
                        </Stage>
                    )}
                     {ritualStep === 2 && (
                        <Stage>
                            <Image src={`${ASSET_PATH}/wicca_invoke_elements.png`} fill style={{ objectFit: 'contain' }} alt="Invoke Elements" />
                            {['air', 'fire', 'water', 'earth'].map((el, i) => {
                                const positions = [
                                    { top: '15%', left: '50%', transform: 'translateX(-50%)' }, // Top
                                    { top: '50%', right: '15%', transform: 'translateY(-50%)' }, // Right
                                    { bottom: '15%', left: '50%', transform: 'translateX(-50%)' },// Bottom
                                    { top: '50%', left: '15%', transform: 'translateY(-50%)' } // Left
                                ];
                                const isClicked = clickedElements.includes(el);
                                
                                // THE FIX: Buttons are now visible with a glowing effect and clear feedback on click.
                                return (
                                    <button 
                                        key={el} 
                                        onClick={() => handleElementClick(el)} 
                                        className={`absolute w-20 h-20 rounded-full transition-all duration-300 backdrop-blur-sm
                                            ${isClicked 
                                                ? 'bg-purple-500/50 ring-2 ring-white shadow-lg shadow-purple-500/50' 
                                                : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                        style={positions[i]}
                                    >
                                        <span className="text-white font-serif capitalize">{el}</span>
                                    </button>
                                );
                            })}
                             {clickedElements.length === 4 && (
                                <RitualButton 
                                    onClick={() => setRitualStep(3)} 
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"
                                >
                                    Continue
                                </RitualButton>
                             )}
                        </Stage>
                    )}
                    {ritualStep === 3 && (
                        <Stage>
                            <Image src={`${ASSET_PATH}/wicca_invoke_deity.png`} fill style={{ objectFit: 'contain' }} alt="Invoke Deity"/>
                            <div className="absolute top-[55%] w-[60%] h-[20%] flex justify-around">
                                {['Triple Goddess', 'Horned God', 'Divine Source'].map(deity => (
                                    <button 
                                        key={deity} 
                                        onClick={() => setSelectedDeity(deity)} 
                                        className={`w-1/3 h-full rounded-lg transition-all duration-300
                                        ${selectedDeity === deity 
                                            ? 'bg-purple-500/30 ring-2 ring-white' 
                                            : 'bg-transparent hover:bg-white/10'
                                        }`} 
                                    />
                                ))}
                            </div>
                            <RitualButton onClick={handleGenerateSpell} disabled={!selectedDeity} className="absolute bottom-[10%]">Confirm Invocation</RitualButton>
                        </Stage>
                    )}
                    {ritualStep === 4 && generatedSpell && (
                        <Stage>
                             <Image src={`${ASSET_PATH}/wicca_ingredient_selection.png`} fill style={{ objectFit: 'contain' }} alt="Select Ingredients" />
                             <p className="absolute top-[18%] text-center text-amber-100 font-serif w-1/2">
                                Select your 5 ritual components. The spirits guide you to choose: {generatedSpell.symbolic_ingredients.map(i => i.name).join(', ')}.
                             </p>
                            {/* NOTE: This stage requires a more complex UI to map and select ingredients. This is a simplified representation for now. */}
                            <RitualButton onClick={() => setRitualStep(5)} className="absolute bottom-[15%]">Prepare Components</RitualButton>
                        </Stage>
                    )}
                    {ritualStep === 5 && generatedSpell && (
                         <Stage>
                            <Image src={`${ASSET_PATH}/wicca_charge_ingredient_template.png`} fill style={{ objectFit: 'contain' }} alt="Charge Ingredient" />
                            <p className="absolute top-[25%] font-serif text-2xl">Hold to Charge the {generatedSpell.symbolic_ingredients[chargingIndex].name}</p>
                             {/* This would be a dynamic image based on the ingredient */}
                            <div className="absolute top-1/2 -translate-y-1/2 w-32 h-32 bg-white/20 rounded-full animate-pulse" />
                            <RitualButton onClick={handleCharge} className="absolute bottom-[15%]">
                                {chargingIndex < 4 ? 'Charge Next Component' : 'Continue to Incantation'}
                            </RitualButton>
                        </Stage>
                    )}
                    {ritualStep === 6 && generatedSpell && (
                        <Stage>
                            <Image src={`${ASSET_PATH}/wicca_incantation_scroll.png`} fill style={{ objectFit: 'contain' }} alt="Incantation" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[#4a2e1c] font-serif text-2xl w-1/2 whitespace-pre-line">
                                {generatedSpell.incantation}
                            </div>
                            <RitualButton onClick={() => setRitualStep(7)} className="absolute bottom-[20%]">Ready to Cast</RitualButton>
                        </Stage>
                    )}
                    {ritualStep === 7 && generatedSpell && (
                        <Stage>
                            <Image src={`${ASSET_PATH}/wicca_pentagram_ready_to_cast.png`} fill style={{ objectFit: 'contain' }} alt="Cast the Spell" />
                            <div
                                onMouseDown={handleCastHold} onMouseUp={handleCastRelease} onMouseLeave={handleCastRelease}
                                onTouchStart={handleCastHold} onTouchEnd={handleCastRelease}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 cursor-pointer"
                            >
                                <PentagramIcon className="w-full h-full text-white" isTracing={isCasting} />
                            </div>
                            <p className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-xl">Hold to Focus Your Will and Cast the Spell</p>
                        </Stage>
                    )}
                    {ritualStep === 8 && generatedSpell && (
                         <Stage>
                             <Image src={`${ASSET_PATH}/wicca_spell_manifestation.png`} fill style={{ objectFit: 'contain' }} alt="Spell Manifestation" />
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white font-serif text-4xl w-1/2">
                                 {generatedSpell.affirmation}
                             </div>
                            <RitualButton onClick={onBack} className="absolute bottom-[25%]">Return to Spell Room</RitualButton>
                         </Stage>
                    )}
                </div>
            </AnimatePresence>
        );
    };

    return (
        <div className="w-full h-full">
            {renderContent()}
        </div>
    );
};