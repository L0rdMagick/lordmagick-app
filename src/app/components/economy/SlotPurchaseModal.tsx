import React, { useState, useEffect } from 'react';
import { BookOpen, Check } from 'lucide-react';
import Image from 'next/image';

interface SlotPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchase: () => void;
    isProcessing: boolean;
    showAetherWarning: boolean;
    showSuccess: boolean;
    onGoToStore: () => void;
}

export const SlotPurchaseModal = ({ 
    isOpen, 
    onClose, 
    onPurchase, 
    isProcessing, 
    showAetherWarning, 
    showSuccess,
    onGoToStore 
}: SlotPurchaseModalProps) => {
    
    // Internal mount check to prevent heavy hydration issues if needed, but simple return null is fine
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in">
            <div className="bg-[#1a1a2e] border border-amber-500/50 rounded-xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(251,191,36,0.2)]">
                {showSuccess ? (
                     <>
                        <div className="w-16 h-16 mx-auto mb-4 relative drop-shadow-[0_0_15px_rgba(168,85,247,0.6)] animate-bounce">
                             <BookOpen size={64} className="text-purple-300" />
                             <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1"><Check size={16} className="text-black" /></div>
                        </div>
                        <h3 className="text-xl font-serif text-purple-100 mb-2">Grimoire Expanded</h3>
                        <p className="text-purple-200/80 text-sm mb-6 leading-relaxed">
                            Payment accepted. New pages have been bound to your Book of Shadows. You may now scribe your ritual.
                        </p>
                        <button onClick={onClose} className="w-full flex items-center justify-center gap-2 py-3 bg-purple-900 border border-purple-500 hover:bg-purple-800 text-purple-100 font-bold rounded uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(88,28,135,0.4)]">
                            Resume Scribing
                        </button>
                    </>
                ) : showAetherWarning ? (
                    <>
                        <div className="w-16 h-16 mx-auto mb-4 relative drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse">
                            <Image src="/images/faestones.png" alt="Faestone" layout="fill" objectFit="contain" />
                        </div>
                        <h3 className="text-xl font-serif text-amber-100 mb-2">Your pouch is empty…</h3>
                        <p className="text-purple-200 text-sm mb-6 leading-relaxed">
                            To expand your grimoire, more Faestones are required. Manifest more?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={onGoToStore} className="w-full flex items-center justify-center gap-2 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded uppercase tracking-wider text-xs transition-colors shadow-[0_0_15px_rgba(180,83,9,0.4)]">
                                <div className="w-4 h-4 relative">
                                    <Image src="/images/faestones.png" alt="Token" layout="fill" objectFit="contain" />
                                </div> 
                                Manifest Faestones
                            </button>
                            <button onClick={onClose} className="text-gray-400 hover:text-white text-xs font-serif italic tracking-wide">
                                Close the Portal
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <BookOpen size={48} className="text-purple-400 mx-auto mb-4 drop-shadow-[0_0_10px_purple]" />
                        <h3 className="text-xl font-serif text-purple-100 mb-2">Your Grimoire is Full…</h3>
                        <p className="text-purple-200/80 text-sm mb-6 leading-relaxed">
                            Would you like to bind more pages to your Grimoire?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={onPurchase} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 py-3 bg-purple-900 border border-purple-500 hover:bg-purple-800 text-purple-100 font-bold rounded uppercase tracking-wider text-xs transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(88,28,135,0.4)]">
                                {isProcessing ? "Weaving Pages..." : (
                                    <span className="flex items-center gap-2">Add Pages (10 <div className="w-3 h-3 relative inline-block align-middle"><Image src="/images/faestones.png" alt="FS" layout="fill" objectFit="contain" /></div>)</span>
                                )}
                            </button>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xs font-serif italic">
                                Close this Portal
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
