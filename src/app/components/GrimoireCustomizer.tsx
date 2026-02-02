"use client";

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import Image from 'next/image';

// --- TYPES ---
export interface GrimoireCustomization {
    coverImage: string;
    coverTitle: string;
    pageStyle: string;
    fontFamily: string;
    cardStyle: string;
    detailPageStyle: string;
}

const DEFAULT_CUSTOMIZATION: GrimoireCustomization = {
    coverImage: '/images/grimoire-images/grimoire-cover.png',
    coverTitle: 'Book of Magick',
    pageStyle: '/images/grimoire-images/grimoire-page.png',
    fontFamily: 'Cinzel',
    cardStyle: 'default',
    detailPageStyle: 'default'
};

const FONTS = [
    { name: 'Cinzel', value: 'Cinzel' },
    { name: 'EB Garamond', value: '"EB Garamond"' },
    { name: 'Playfair Display', value: '"Playfair Display"' },
    { name: 'IM Fell English SC', value: '"IM Fell English SC"' },
    { name: 'UnifrakturMaguntia', value: 'UnifrakturMaguntia' },
    { name: 'MedievalSharp', value: '"MedievalSharp"' }
];

interface GrimoireCustomizerProps {
    current: GrimoireCustomization;
    onSave: (newSettings: GrimoireCustomization) => void;
    onClose: () => void;
}

export default function GrimoireCustomizer({ current, onSave, onClose }: GrimoireCustomizerProps) {
    const [settings, setSettings] = useState<GrimoireCustomization>(current);

    // Mock options for images - assuming we will have numbered variants as requested
    // Logic: original name + number (e.g., grimoire-cover2.png)
    const coverOptions = [
        '/images/grimoire-images/grimoire-cover.png',
        '/images/grimoire-images/grimoire-cover2.png',
        '/images/grimoire-images/grimoire-cover3.png',
        '/images/grimoire-images/grimoire-cover4.png',
        '/images/grimoire-images/grimoire-cover5.png',
        '/images/grimoire-images/grimoire-cover6.png',
    ];

    const pageOptions = [
        '/images/grimoire-images/grimoire-page.png',
        '/images/grimoire-images/grimoire-page2.png',
        '/images/grimoire-images/grimoire-page3.png',
        '/images/grimoire-images/grimoire-page4.png',
        '/images/grimoire-images/grimoire-page5.png',
        '/images/grimoire-images/grimoire-page6.png',
    ];

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a120b] border border-[#8b4513] rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#8b4513]/30 bg-[#0f0a06]">
                    <h2 className="text-[#d4af37] font-serif text-2xl" style={{ fontFamily: 'Cinzel' }}>Customize Grimoire</h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-[#8b4513] hover:text-[#d4af37] transition-colors pointer-events-auto z-[110] cursor-pointer relative"
                        aria-label="Close Customizer"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* 1. Cover Image */}
                    <section>
                        <h3 className="text-[#f4e4bc] font-serif text-xl mb-4 border-b border-[#8b4513]/20 pb-2">Grimoire Cover</h3>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            {coverOptions.map((src, idx) => (
                                <button 
                                    key={src} 
                                    onClick={() => setSettings(s => ({ ...s, coverImage: src }))}
                                    className={`relative aspect-[1529/2048] rounded overflow-hidden border-2 transition-all ${settings.coverImage === src ? 'border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.3)] scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    {/* Placeholder for missing assets - fail gracefully */}
                                    <div className="absolute inset-0 bg-[#2a1f18] flex items-center justify-center text-[#8b4513] text-xs">
                                        Cover {idx + 1}
                                    </div>
                                    <Image src={src} alt={`Option ${idx + 1}`} fill className="object-cover" onError={(e) => {
                                        // Fallback if image doesn't exist yet
                                        (e.target as HTMLImageElement).src = '/images/grimoire-images/grimoire-cover.png';
                                    }}/>
                                    {settings.coverImage === src && (
                                        <div className="absolute top-2 right-2 bg-[#d4af37] text-black rounded-full p-1">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* 2. Cover Title */}
                    <section>
                        <h3 className="text-[#f4e4bc] font-serif text-xl mb-4 border-b border-[#8b4513]/20 pb-2">Cover Title</h3>
                        <input 
                            type="text" 
                            value={settings.coverTitle}
                            onChange={(e) => setSettings(s => ({ ...s, coverTitle: e.target.value }))}
                            className="w-full bg-[#0f0a06] border border-[#8b4513] text-[#d4af37] px-4 py-3 rounded focus:outline-none focus:border-[#d4af37] font-serif text-lg tracking-wider text-center"
                            style={{ fontFamily: settings.fontFamily }}
                        />
                    </section>

                    {/* 3. Page Style */}
                    <section>
                        <h3 className="text-[#f4e4bc] font-serif text-xl mb-4 border-b border-[#8b4513]/20 pb-2">Page Parchment</h3>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            {pageOptions.map((src, idx) => (
                                <button 
                                    key={src} 
                                    onClick={() => setSettings(s => ({ ...s, pageStyle: src }))}
                                    className={`relative aspect-[1529/2048] rounded overflow-hidden border-2 transition-all ${settings.pageStyle === src ? 'border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.3)] scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                     <div className="absolute inset-0 bg-[#f4e4bc] flex items-center justify-center text-[#8b4513] text-xs">
                                        Page {idx + 1}
                                    </div>
                                    <Image src={src} alt={`Page ${idx + 1}`} fill className="object-cover" onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/images/grimoire-images/grimoire-page.png';
                                    }}/>
                                     {settings.pageStyle === src && (
                                        <div className="absolute top-2 right-2 bg-[#d4af37] text-black rounded-full p-1">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* 4. Font Selection */}
                    <section>
                        <h3 className="text-[#f4e4bc] font-serif text-xl mb-4 border-b border-[#8b4513]/20 pb-2">Sacred Script (Font)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {FONTS.map((font) => (
                                <button 
                                    key={font.name} 
                                    onClick={() => setSettings(s => ({ ...s, fontFamily: font.value }))}
                                    className={`p-4 rounded border transition-all text-center text-lg ${settings.fontFamily === font.value ? 'bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37]' : 'bg-[#0f0a06] border-[#8b4513]/40 text-[#8b4513] hover:bg-[#8b4513]/10'}`}
                                    style={{ fontFamily: font.value.replace(/"/g, '') }}
                                >
                                    {font.name}
                                </button>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#8b4513]/30 bg-[#0f0a06] flex justify-end gap-4">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 border border-[#8b4513] text-[#8b4513] hover:text-[#f4e4bc] hover:bg-[#8b4513]/20 rounded transition-colors font-serif uppercase tracking-widest text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-8 py-2 bg-[#8b4513] text-[#f4e4bc] hover:bg-[#5c4033] rounded transition-colors font-serif uppercase tracking-widest text-sm shadow-[0_0_10px_rgba(139,69,19,0.4)]"
                    >
                        Enchant Grimoire
                    </button>
                </div>
            </div>
        </div>
    );
}
