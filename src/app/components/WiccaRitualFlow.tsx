// --- START OF FILE src/app/components/WiccaRitualFlow.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session, GeneratedWiccanSpell, WiccanIngredient } from '@/lib/types';
import { generateWiccanSpell } from '@/lib/services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { PentagramIcon } from './icons';
import { Sprite } from './Sprite';
import { findSprite } from '@/lib/spriteLibrary';

// --- Helper Components for UI Stages ---

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="absolute inset-0 flex flex-col items-center justify-center p-4"
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
    const [chargingIndex, setChargingIndex] = useState(0);
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

    const handleCharge = () => {
        if (chargingIndex < 4) {
            setChargingIndex(prev => prev + 1);
        } else {
            setRitualStep(prev => prev + 1);
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
                    {/* --- THIS IS THE CORRECTED INTRO STAGE --- */}
                    {ritualStep === 0 && (
                        <Stage>
                            <Image src={`${ASSET_PATH}/wicca_intro_instructions.png`} fill style={{ objectFit: 'contain' }} alt="Wicca Instructions" priority />
                            
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] max-w-md text-center pointer-events-none">
                                <h2 className="text-4xl lg:text-5xl font-serif text-purple-200 mb-6" style={{ textShadow: '0 0 10px rgba(192, 132, 252, 0.5)' }}>
                                    Wiccan Spellcraft
                                </h2>
                                <p className="text-lg lg:text-xl text-gray-300 leading-relaxed">
                                    Work with nature, the moon, and ancient energies to manifest your will. Follow the steps to craft your spell.
                                </p>
                            </div>
                            
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
                                    { top: '15%', left: '50%', transform: 'translateX(-50%)' },
                                    { top: '50%', right: '15%', transform: 'translateY(-50%)' },
                                    { bottom: '15%', left: '50%', transform: 'translateX(-50%)' },
                                    { top: '50%', left: '15%', transform: 'translateY(-50%)' }
                                ];
                                const isClicked = clickedElements.includes(el);
                                return (
                                    <button 
                                        key={el} 
                                        onClick={() => handleElementClick(el)} 
                                        className={`absolute w-20 h-20 rounded-full transition-all duration-300 backdrop-blur-sm ${isClicked ? 'bg-purple-500/50 ring-2 ring-white shadow-lg shadow-purple-500/50' : 'bg-white/10 hover:bg-white/20'}`}
                                        style={positions[i]}
                                    >
                                        <span className="text-white font-serif capitalize">{el}</span>
                                    </button>
                                );
                            })}
                             {clickedElements.length === 4 && <RitualButton onClick={() => setRitualStep(3)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse">Continue</RitualButton>}
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
                                        className={`w-1/3 h-full rounded-lg transition-all duration-300 ${selectedDeity === deity ? 'bg-purple-500/30 ring-2 ring-white' : 'bg-transparent hover:bg-white/10'}`} 
                                    />
                                ))}
                            </div>
                            <RitualButton onClick={handleGenerateSpell} disabled={!selectedDeity} className="absolute bottom-[10%]">Confirm Invocation</RitualButton>
                        </Stage>
                    )}
                    {ritualStep === 4 && generatedSpell && (
                        <Stage>
                            <div className='text-center'>
                                <h3 className="text-2xl font-serif text-amber-200 mb-2">The Spirits Guide You</h3>
                                <p className="text-gray-300 mb-6">These components have been chosen for your intention.</p>
                                <div className="grid grid-cols-5 gap-4 bg-black/30 p-4 rounded-lg">
                                    {generatedSpell.symbolic_ingredients.map(ingredient => {
                                        const spriteData = findSprite(ingredient.name);
                                        if (!spriteData) return <div key={ingredient.name} className="w-24 h-24 border border-dashed border-gray-600 rounded-md flex items-center justify-center text-xs text-center text-gray-400">Missing: <br/>{ingredient.name}</div>;
                                        return (
                                            <div key={ingredient.name} className="flex flex-col items-center gap-2">
                                                <div className="w-24 h-24 bg-white/5 rounded-lg p-1">
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
                                                <p className="text-sm font-semibold text-purple-300">{ingredient.name}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <RitualButton onClick={() => setRitualStep(5)} className="mt-8">Prepare Components</RitualButton>
                            </div>
                        </Stage>
                    )}
                    {ritualStep === 5 && generatedSpell && (
                         <Stage>
                            <Image src={`${ASSET_PATH}/wicca_charge_ingredient_template.png`} fill style={{ objectFit: 'contain' }} alt="Charge Ingredient" />
                            <p className="absolute top-[25%] font-serif text-2xl text-center">Hold to Charge the<br/>{generatedSpell.symbolic_ingredients[chargingIndex].name}</p>
                            <div className="absolute top-1/2 -translate-y-1/2 w-32 h-32 animate-pulse cursor-pointer">
                                {(() => {
                                    const ingredient = generatedSpell.symbolic_ingredients[chargingIndex];
                                    const spriteData = findSprite(ingredient.name);
                                    if (!spriteData) return null;
                                    return (
                                        <Sprite 
                                            sheetPath={spriteData.sheet.path}
                                            x={spriteData.itemInfo.x}
                                            y={spriteData.itemInfo.y}
                                            spriteWidth={spriteData.sheet.spriteSize.width}
                                            spriteHeight={spriteData.sheet.spriteSize.height}
                                            sheetWidth={spriteData.sheet.sheetSize.width}
                                            sheetHeight={spriteData.sheet.sheetSize.height}
                                        />
                                    );
                                })()}
                            </div>
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
                           <div
                                onMouseDown={handleCastHold} onMouseUp={handleCastRelease} onMouseLeave={handleCastRelease}
                                onTouchStart={handleCastHold} onTouchEnd={handleCastRelease}
                                className="relative w-96 h-96 cursor-pointer flex items-center justify-center"
                            >
                                <Image src={`${ASSET_PATH}/wicca_pentagram_ready_to_cast.png`} fill style={{ objectFit: 'contain' }} alt="Cast the Spell" />
                                <PentagramIcon className="absolute w-full h-full text-white pointer-events-none" isTracing={isCasting} />
                                {generatedSpell.symbolic_ingredients.map((ing, i) => {
                                    const spriteData = findSprite(ing.name);
                                    if(!spriteData) return null;
                                    const positions = [
                                        { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' },
                                        { top: '34.5%', left: '97.5%', transform: 'translate(-50%, -50%)' },
                                        { top: '90.4%', left: '79.3%', transform: 'translate(-50%, -50%)' },
                                        { top: '90.4%', left: '20.6%', transform: 'translate(-50%, -50%)' },
                                        { top: '34.5%', left: '2.5%', transform: 'translate(-50%, -50%)' },
                                    ];
                                    return (
                                        <div key={i} className="absolute w-16 h-16 pointer-events-none" style={positions[i]}>
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
                                    )
                                })}
                            </div>
                            <p className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-xl pointer-events-none">Hold to Focus Your Will and Cast the Spell</p>
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