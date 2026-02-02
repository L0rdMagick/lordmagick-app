"use client";

import React, { useState } from 'react';
import { saveSpell, updateSpell } from '@/lib/services/geminiService';
import { Spell } from '@/lib/types';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Save, X, Plus } from 'lucide-react';

interface CustomSpellWizardProps {
    userId: string;
    onClose: () => void;
    onComplete: (spell: Spell) => void;
    initialData?: Spell;
    onPlaySound: (key: 'PAGE_TURN' | 'SAVE_SUCCESS' | 'SCRIBE') => void;
}

type WizardStep = 'TITLE' | 'PURPOSE' | 'INGREDIENTS' | 'INSTRUCTIONS' | 'PREVIEW';

// Moved outside to prevent re-renders losing focus
// --- LAYOUT CONSTANTS ---
const PAGE_LAYOUT = {
    TITLE_ZONE: {
        left: '25.40%', 
        top: '18.33%', 
        width: '55.07%', 
        height: '11.13%',
        position: 'absolute' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    BODY_ZONE: {
        left: '25.40%', 
        top: '29.46%', 
        width: '55.07%', 
        height: '50.02%',
        position: 'absolute' as const,
        overflow: 'hidden'
    }
};

const Wrapper = ({ 
    children, 
    title, 
    onBack, 
    isFirstStep 
}: { 
    children: React.ReactNode, 
    title: string, 
    onBack: () => void, 
    isFirstStep: boolean 
}) => (
    <>
        {/* Title Zone */}
        <div style={PAGE_LAYOUT.TITLE_ZONE} className="text-center z-10">
            <h2 className="text-[3vh] font-serif font-bold text-[#5c4033]" style={{ fontFamily: 'Cinzel' }}>{title}</h2>
        </div>

        {/* Body Zone */}
        <div style={PAGE_LAYOUT.BODY_ZONE} className="z-10 flex flex-col">
            <div className="flex-1 w-full flex flex-col items-center overflow-hidden">
                {children}
            </div>
            
            <div className="mt-auto pt-4 flex justify-between w-full border-t border-[#8b4513]/20 shrink-0">
                <button onClick={onBack} className="text-[#8b4513] hover:text-black font-serif underline text-sm pointer-events-auto">
                    {isFirstStep ? 'Cancel' : 'Back'}
                </button>
            </div>
        </div>
    </>
);

export default function CustomSpellWizard({ userId, onClose, onComplete, initialData, onPlaySound }: CustomSpellWizardProps) {
    const [step, setStep] = useState<WizardStep>('TITLE');
    const [loading, setLoading] = useState(false);
    
    // Spell Data - Initialize from initialData if present
    const [title, setTitle] = useState(() => initialData?.name || '');
    const [purpose, setPurpose] = useState(() => initialData?.intention || '');
    // Need to parse ritual_data for ingredients/instructions
    const [ingredients, setIngredients] = useState(() => {
        if (initialData?.ritual_data) {
             const data = typeof initialData.ritual_data === 'string' ? JSON.parse(initialData.ritual_data) : initialData.ritual_data;
             return data.ingredients || '';
        }
        return '';
    });
    const [instructions, setInstructions] = useState<string[]>(() => {
         if (initialData?.ritual_data) {
             const data = typeof initialData.ritual_data === 'string' ? JSON.parse(initialData.ritual_data) : initialData.ritual_data;
             return data.instructions || ['']; // Start with one empty if none
        }
        return [''];
    });
    // Pagination Index for Instructions
    const [editIndex, setEditIndex] = useState(0);

    const handleNext = () => {
        onPlaySound('PAGE_TURN'); // Transition sound
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
        else if (step === 'INSTRUCTIONS') {
            if (editIndex > 0) {
                setEditIndex(prev => prev - 1);
            } else {
                setStep('INGREDIENTS');
            }
        }
        else if (step === 'PREVIEW') setStep('INSTRUCTIONS');
    };

    const handleNextInstruction = (currentVal: string) => {
        if (!currentVal.trim()) return;
        
        const newInst = [...instructions];
        // If editing existing
        if (editIndex < newInst.length) {
            newInst[editIndex] = currentVal;
            setInstructions(newInst);
        } else {
            // Append new
            setInstructions([...newInst, currentVal]);
        }
        setEditIndex(prev => prev + 1);
    };

    const handleDeleteStep = () => {
        const newInst = instructions.filter((_, i) => i !== editIndex);
        setInstructions(newInst);
        // Adjust index if needed (stay on same index unless it was last)
        if (editIndex >= newInst.length && editIndex > 0) {
            setEditIndex(editIndex - 1);
        }
    };

    const handleFinish = (currentVal: string) => {
        let finalInst = [...instructions];
        // Save current if valid
        if (currentVal.trim()) {
            if (editIndex < finalInst.length) {
                finalInst[editIndex] = currentVal;
            } else {
                finalInst.push(currentVal);
            }
        }

        // Clean empty
        finalInst = finalInst.map(i => i.trim()).filter(i => i.length > 0);
        
        if (finalInst.length === 0) {
            alert("Please add at least one instruction step.");
            return;
        }

        setInstructions(finalInst);
        setStep('PREVIEW');
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (initialData?.id) {
                // Update
                const updatedSpell = await updateSpell(
                    userId,
                    initialData.id,
                    {
                        name: title,
                        intention: purpose,
                        ritual_data: {
                            type: 'CUSTOM', // Important for identification
                            ingredients: ingredients,
                            instructions: instructions
                        }
                    }
                );
                onComplete(updatedSpell);
            } else {
                // Create New
                const finalSpell = await saveSpell(
                    userId,
                    {
                        name: title,
                        intention: purpose,
                        incantation: "", 
                        ritual_data: {
                            type: 'CUSTOM', 
                            ingredients: ingredients,
                            instructions: instructions
                        },
                        tradition: 'CUSTOM' as any 
                    },
                    true 
                );
                // Play sound in parent via onComplete or here? Parent handles it better for consistency, but we can do it here. 
                // Actually parent does it in handleSpellCreated. So just onComplete here.
                // But wait, user asked for specific sounds. GrimoirePage uses SAVE_SUCCESS on handleSpellCreated.
                // So we rely on parent callback chain.
                onComplete(finalSpell);
            }
        } catch (e) {
            console.error("Failed to save custom spell", e);
            alert("Failed to inscribe the spell into the Grimoire.");
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERERS ---

    // Removed inner Wrapper logic
    // const Wrapper = ...
    // ... replaced by external definition

    return (
        <div className="flex items-center justify-center h-full w-full animate-in fade-in duration-500">
             {/* Uses the standard Grimoire Page Look */}
            <div className="relative h-full w-full shadow-2xl">
                 <Image 
                    src="/images/grimoire-images/grimoire-page.png" 
                    alt="Grimoire Page" 
                    fill 
                    className="object-fill"
                    priority
                />
                
                {/* Content Overlay */}
                
                {/* Content Overlay - Now using specific zones via Wrapper */}
                <div className="absolute inset-0">
                    {step === 'TITLE' && (
                        <Wrapper title="Name Your Spell" onBack={onClose} isFirstStep={true}>
                             <input 
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    onPlaySound('SCRIBE');
                                }}
                                placeholder="Enter Spell Title..."
                                className="w-full bg-transparent border-b-2 border-[#8b4513]/50 text-left pl-2 text-[2.5vh] font-serif text-[#3e2c22] focus:outline-none focus:border-[#d4af37] placeholder:text-[#8b4513]/30"
                                autoFocus
                            />
                            <button 
                                onClick={handleNext}
                                disabled={!title}
                                className="mt-8 px-8 py-2 bg-[#8b4513] text-[#f4e4bc] rounded font-serif uppercase hover:bg-[#5c4033] disabled:opacity-50 transition-colors pointer-events-auto relative z-10"
                            >
                                Next
                            </button>
                        </Wrapper>
                    )}

                    {step === 'PURPOSE' && (
                         <Wrapper title="Spell Purpose" onBack={handleBack} isFirstStep={false}>
                            <textarea
                                value={purpose}
                                onChange={(e) => {
                                    setPurpose(e.target.value);
                                    onPlaySound('SCRIBE');
                                }}
                                placeholder="What is the intention of this working?"
                                className="w-full h-[30vh] bg-transparent border border-[#8b4513]/30 p-4 font-serif text-[1.8vh] text-[#3e2c22] focus:outline-none focus:border-[#d4af37] resize-none rounded custom-scrollbar placeholder:text-[#8b4513]/30"
                                autoFocus
                            />
                             <button 
                                onClick={handleNext}
                                disabled={!purpose}
                                className="mt-8 px-8 py-2 bg-[#8b4513] text-[#f4e4bc] rounded font-serif uppercase hover:bg-[#5c4033] disabled:opacity-50 transition-colors pointer-events-auto relative z-10"
                            >
                                Next
                            </button>
                        </Wrapper>
                    )}

                    {step === 'INGREDIENTS' && (
                          <Wrapper title="Ingredients" onBack={handleBack} isFirstStep={false}>
                            <textarea
                                value={ingredients}
                                onChange={(e) => {
                                    setIngredients(e.target.value);
                                    onPlaySound('SCRIBE');
                                }}
                                placeholder="List required items (candles, herbs, crystals...)"
                                className="w-full h-[30vh] bg-transparent border border-[#8b4513]/30 p-4 font-serif text-[1.8vh] text-[#3e2c22] focus:outline-none focus:border-[#d4af37] resize-none rounded custom-scrollbar placeholder:text-[#8b4513]/30"
                                autoFocus
                            />
                             <button 
                                onClick={handleNext}
                                className="mt-8 px-8 py-2 bg-[#8b4513] text-[#f4e4bc] rounded font-serif uppercase hover:bg-[#5c4033] transition-colors pointer-events-auto relative z-10"
                            >
                                Next
                            </button>
                        </Wrapper>
                    )}

                    {step === 'INSTRUCTIONS' && (
                         <Wrapper title={`Step ${editIndex + 1}`} onBack={handleBack} isFirstStep={false}>
                             {(() => {
                                 // Local render logic for current step
                                 const currentVal = instructions[editIndex] || '';
                                 const isNew = editIndex === instructions.length;

                                 return (
                                     <div className="w-full h-full flex flex-col items-center">
                                         <textarea
                                            value={currentVal}
                                            onChange={(e) => {
                                                // Live update state to prevent loss if clicking Finish vs Next
                                                const val = e.target.value;
                                                const newInst = [...instructions];
                                                // If new, ensure array is big enough or just local? 
                                                // Better to just update local array state immediately
                                                if (editIndex < newInst.length) {
                                                    newInst[editIndex] = val;
                                                    setInstructions(newInst);
                                                } else {
                                                    // For "New" step, we might need to append immediately to let typing happen?
                                                    // Actually, if we type in "New" step, we should probably append an empty string first?
                                                    // Let's rely on controlled input. 
                                                    // Use `setInstructions` to grow array if typing in new slot?
                                                    setInstructions([...newInst, val]);
                                                }
                                            }}
                                            placeholder="Describe this step of the ritual..."
                                            className="w-full h-[30vh] bg-transparent border border-[#8b4513]/30 p-4 font-serif text-[2vh] text-[#3e2c22] focus:outline-none focus:border-[#d4af37] resize-none rounded custom-scrollbar placeholder:text-[#8b4513]/30"
                                            autoFocus
                                        />
                                        
                                        <div className="mt-4 flex gap-4 w-full justify-center">
                                            {/* Delete Button (only if existing step or typing) */}
                                            {instructions.length > 0 && (
                                                <button 
                                                    onClick={handleDeleteStep}
                                                    className="p-2 text-[#8b4513]/50 hover:text-red-500 transition-colors"
                                                    title="Delete Page"
                                                >
                                                    <X size={24} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="mt-8 flex gap-4 w-full">
                                            <button 
                                                onClick={() => handleNextInstruction(currentVal)}
                                                disabled={!currentVal.trim()}
                                                className="flex-1 py-2 px-4 bg-[#8b4513] text-[#f4e4bc] rounded font-serif uppercase hover:bg-[#5c4033] disabled:opacity-50 transition-colors pointer-events-auto shadow-md"
                                            >
                                                Next Page
                                            </button>
                                             <button 
                                                onClick={() => handleFinish(currentVal)}
                                                className="py-2 px-6 border border-[#8b4513] text-[#8b4513] rounded font-serif uppercase hover:bg-[#8b4513]/10 pointer-events-auto"
                                            >
                                                Finish
                                            </button>
                                        </div>
                                     </div>
                                 );
                             })()}
                        </Wrapper>
                    )}

                    {step === 'PREVIEW' && (
                        <>
                            <div style={PAGE_LAYOUT.TITLE_ZONE} className="text-center z-10 flex items-center justify-center border-b border-[#8b4513]/30">
                                <h2 className="text-[2.5vh] font-bold font-serif uppercase text-[#3e2c22]">{title}</h2>
                            </div>
                            
                            <div style={PAGE_LAYOUT.BODY_ZONE} className="flex flex-col z-10">
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

                                <div className="mt-4 pt-2 border-t border-[#8b4513]/30 flex justify-between items-center gap-4 shrink-0">
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
