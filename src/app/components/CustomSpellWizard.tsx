"use client";

import React, { useState } from 'react';
import { saveSpell } from '@/lib/services/geminiService';
import { Spell } from '@/lib/types';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Save, X, Plus } from 'lucide-react';

interface CustomSpellWizardProps {
    userId: string;
    onClose: () => void;
    onComplete: (spell: Spell) => void;
}

type WizardStep = 'TITLE' | 'PURPOSE' | 'INGREDIENTS' | 'INSTRUCTIONS' | 'PREVIEW';

export default function CustomSpellWizard({ userId, onClose, onComplete }: CustomSpellWizardProps) {
    const [step, setStep] = useState<WizardStep>('TITLE');
    const [loading, setLoading] = useState(false);
    
    // Spell Data
    const [title, setTitle] = useState('');
    const [purpose, setPurpose] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState<string[]>([]);
    const [currentInstruction, setCurrentInstruction] = useState('');

    const handleNext = () => {
        if (step === 'TITLE' && title) setStep('PURPOSE');
        else if (step === 'PURPOSE' && purpose) setStep('INGREDIENTS');
        else if (step === 'INGREDIENTS') setStep('INSTRUCTIONS');
        else if (step === 'INSTRUCTIONS') {
             // If there's text in the input, add it before moving on? 
             // Logic handles inside the render
        }
    };

    const handleBack = () => {
        if (step === 'PURPOSE') setStep('TITLE');
        else if (step === 'INGREDIENTS') setStep('PURPOSE');
        else if (step === 'INSTRUCTIONS') setStep('INGREDIENTS');
        else if (step === 'PREVIEW') setStep('INSTRUCTIONS');
    };

    const addInstruction = () => {
        if (currentInstruction.trim()) {
            setInstructions(prev => [...prev, currentInstruction.trim()]);
            setCurrentInstruction('');
        }
    };

    const finishInstructions = () => {
        // Add current if exists
        if (currentInstruction.trim()) {
            setInstructions(prev => [...prev, currentInstruction.trim()]);
            setCurrentInstruction('');
        }
        setStep('PREVIEW');
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const finalSpell = await saveSpell(
                userId,
                {
                    name: title,
                    intention: purpose,
                    incantation: "", // Optional
                    ritual_data: {
                        type: 'CUSTOM', // Important for identification
                        ingredients: ingredients,
                        instructions: instructions
                    },
                    tradition: 'CUSTOM' as any // Force cast if needed
                },
                true // Bypass limit? Or check? Let's assume standard flow for now but maybe free?
            );
            onComplete(finalSpell);
        } catch (e) {
            console.error("Failed to save custom spell", e);
            alert("Failed to inscribe the spell into the Grimoire.");
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERERS ---

    const Wrapper = ({ children, title: stepTitle }: { children: React.ReactNode, title: string }) => (
        <div className="flex flex-col h-full w-full p-6 text-center text-[#3e2c22]">
            <h2 className="text-[3vh] font-serif font-bold mb-6 text-[#5c4033]" style={{ fontFamily: 'Cinzel' }}>{stepTitle}</h2>
            <div className="flex-1 flex flex-col items-center justify-center w-full">
                {children}
            </div>
            
            <div className="mt-auto pt-4 flex justify-between w-full border-t border-[#8b4513]/20">
                <button onClick={step === 'TITLE' ? onClose : handleBack} className="text-[#8b4513] hover:text-black font-serif underline text-sm">
                    {step === 'TITLE' ? 'Cancel' : 'Back'}
                </button>
                {/* Next button rendered conditionally in children if special logic needed */}
            </div>
        </div>
    );

    return (
        <div className="flex items-center justify-center h-full w-full animate-in fade-in duration-500">
             {/* Uses the standard Grimoire Page Look */}
            <div className="relative h-full w-auto aspect-[1529/2048] shadow-2xl max-w-full">
                 <Image 
                    src="/images/grimoire-images/grimoire-page.png" 
                    alt="Grimoire Page" 
                    fill 
                    className="object-fill"
                    priority
                />
                
                {/* Content Overlay */}
                <div 
                    className="absolute inset-0 flex flex-col pt-[20%] pb-[15%] px-[15%]"
                >
                    {step === 'TITLE' && (
                        <Wrapper title="Name Your Spell">
                             <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter Spell Title..."
                                className="w-full bg-transparent border-b-2 border-[#8b4513]/50 text-center text-[2.5vh] font-serif text-[#3e2c22] focus:outline-none focus:border-[#d4af37] placeholder:text-[#8b4513]/30"
                                autoFocus
                            />
                            <button 
                                onClick={handleNext}
                                disabled={!title}
                                className="mt-8 px-8 py-2 bg-[#8b4513] text-[#f4e4bc] rounded font-serif uppercase hover:bg-[#5c4033] disabled:opacity-50 transition-colors"
                            >
                                Next
                            </button>
                        </Wrapper>
                    )}

                    {step === 'PURPOSE' && (
                        <Wrapper title="Spell Purpose">
                            <textarea
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                placeholder="What is the intention of this working?"
                                className="w-full h-[30vh] bg-transparent border border-[#8b4513]/30 p-4 font-serif text-[1.8vh] text-[#3e2c22] focus:outline-none focus:border-[#d4af37] resize-none rounded custom-scrollbar placeholder:text-[#8b4513]/30"
                                autoFocus
                            />
                             <button 
                                onClick={handleNext}
                                disabled={!purpose}
                                className="mt-8 px-8 py-2 bg-[#8b4513] text-[#f4e4bc] rounded font-serif uppercase hover:bg-[#5c4033] disabled:opacity-50 transition-colors"
                            >
                                Next
                            </button>
                        </Wrapper>
                    )}

                    {step === 'INGREDIENTS' && (
                         <Wrapper title="Ingredients">
                            <textarea
                                value={ingredients}
                                onChange={(e) => setIngredients(e.target.value)}
                                placeholder="List required items (candles, herbs, crystals...)"
                                className="w-full h-[30vh] bg-transparent border border-[#8b4513]/30 p-4 font-serif text-[1.8vh] text-[#3e2c22] focus:outline-none focus:border-[#d4af37] resize-none rounded custom-scrollbar placeholder:text-[#8b4513]/30"
                                autoFocus
                            />
                             <button 
                                onClick={handleNext}
                                className="mt-8 px-8 py-2 bg-[#8b4513] text-[#f4e4bc] rounded font-serif uppercase hover:bg-[#5c4033] transition-colors"
                            >
                                Next
                            </button>
                        </Wrapper>
                    )}

                    {step === 'INSTRUCTIONS' && (
                        <Wrapper title={`Step ${instructions.length + 1}`}>
                             <div className="w-full flex-1 flex flex-col gap-4">
                                <div className="text-left text-sm text-[#8b4513]/60 italic mb-2">
                                    Captured Steps: {instructions.length}
                                </div>
                                <textarea
                                    value={currentInstruction}
                                    onChange={(e) => setCurrentInstruction(e.target.value)}
                                    placeholder="Describe this step of the ritual..."
                                    className="w-full flex-1 bg-transparent border border-[#8b4513]/30 p-4 font-serif text-[1.8vh] text-[#3e2c22] focus:outline-none focus:border-[#d4af37] resize-none rounded custom-scrollbar placeholder:text-[#8b4513]/30"
                                    autoFocus
                                />
                                <div className="flex gap-2 w-full">
                                    <button 
                                        onClick={addInstruction}
                                        disabled={!currentInstruction.trim()}
                                        className="flex-1 py-2 border border-[#8b4513] text-[#8b4513] hover:bg-[#8b4513]/10 rounded flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} /> Add Step
                                    </button>
                                     <button 
                                        onClick={finishInstructions}
                                        className="flex-1 py-2 bg-[#8b4513] text-[#f4e4bc] hover:bg-[#5c4033] rounded"
                                    >
                                        Finish
                                    </button>
                                </div>
                             </div>
                        </Wrapper>
                    )}

                    {step === 'PREVIEW' && (
                        <div className="flex flex-col h-full w-full p-4 overflow-hidden text-[#3e2c22]">
                            <h2 className="text-[2.5vh] font-bold text-center mb-2 font-serif uppercase border-b border-[#8b4513]/30 pb-2">{title}</h2>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                                <div>
                                    <h3 className="font-bold text-[#5c4033] text-sm uppercase">Purpose</h3>
                                    <p className="italic text-sm opacity-80">{purpose}</p>
                                </div>
                                {ingredients && (
                                    <div>
                                        <h3 className="font-bold text-[#5c4033] text-sm uppercase">Ingredients</h3>
                                        <p className="text-sm opacity-80 pre-wrap">{ingredients}</p>
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-[#5c4033] text-sm uppercase mb-1">Ritual</h3>
                                    <ol className="list-decimal pl-4 space-y-1">
                                        {instructions.map((inst, idx) => (
                                            <li key={idx} className="text-sm">{inst}</li>
                                        ))}
                                    </ol>
                                </div>
                            </div>

                            <div className="mt-4 pt-2 border-t border-[#8b4513]/30 flex justify-between items-center gap-4">
                                <button onClick={() => setStep('INSTRUCTIONS')} className="text-sm text-[#8b4513] underline">Edit</button>
                                <button 
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex-1 py-2 bg-[#8b4513] text-[#f4e4bc] font-bold uppercase tracking-widest rounded hover:bg-[#5c4033] transition-colors shadow-lg flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Scribing...' : 'Inscribe to Grimoire'} <Save size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
