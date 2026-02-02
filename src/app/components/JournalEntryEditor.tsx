"use client";

import React, { useState, useRef } from 'react';
import { saveSpell, updateSpell } from '@/lib/services/geminiService';
import { Spell } from '@/lib/types';
import Image from 'next/image';
import { Save } from 'lucide-react';

interface JournalEntryEditorProps {
    userId: string;
    onClose: () => void;
    onComplete: (spell: Spell) => void;
    initialData?: Spell;
    onPlaySound: (key: 'SCRIBE' | 'SAVE_SUCCESS') => void;
    fontFamily: string;
}

// --- LAYOUT CONSTANTS ---
const PAGE_LAYOUT = {
    TITLE_ZONE: {
        left: '25.40%', 
        top: '18.33%', 
        width: '55.07%', 
        height: '11.13%',
        position: 'absolute' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center'
    },
    BODY_ZONE: {
        left: '25.40%', 
        top: '29.46%', 
        width: '55.07%', 
        height: '50.02%',
        position: 'absolute' as const,
        display: 'flex',
        flexDirection: 'column' as const
    }
};

export default function JournalEntryEditor({ userId, onClose, onComplete, initialData, onPlaySound, fontFamily }: JournalEntryEditorProps) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    
    // Initialize date from existing data or current date
    const [dateStr, setDateStr] = useState(() => {
        if (initialData?.ritual_data) {
             const data = typeof initialData.ritual_data === 'string' ? JSON.parse(initialData.ritual_data) : initialData.ritual_data;
             return data.timestamp || new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
        return new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    });

    // Load initial data
    React.useEffect(() => {
        if (initialData) {
            setTitle(initialData.name);
            const data = typeof initialData.ritual_data === 'string' ? JSON.parse(initialData.ritual_data) : initialData.ritual_data;
            setContent(data.content || '');
            if (data.timestamp) setDateStr(data.timestamp);
        }
    }, [initialData]);
    
    // Audio removed - delegated to onPlaySound

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        onPlaySound('SCRIBE');
    };

    const handleSave = async () => {
        if (!title || !content) return;
        setLoading(true);
        try {
            if (initialData?.id) {
                // Update Existing
                 const updatedSpell = await updateSpell(
                    userId,
                    initialData.id,
                    {
                        name: title,
                        ritual_data: {
                            type: 'JOURNAL',
                            content: content,
                            timestamp: dateStr
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
                        intention: "Journal Entry",
                        incantation: "", 
                        ritual_data: {
                            type: 'JOURNAL', 
                            content: content,
                            timestamp: dateStr // User manual date
                        },
                        tradition: 'CUSTOM' as any 
                    },
                    true 
                );
                onComplete(finalSpell);
            }
        } catch (e) {
            console.error("Failed to save journal entry", e);
            alert("Failed to save your thoughts.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-full w-full animate-in fade-in duration-500">
             <div className="relative h-full w-full shadow-2xl">
                 <Image 
                    src="/images/grimoire-images/grimoire-page.png" 
                    alt="Grimoire Page" 
                    fill 
                    className="object-fill"
                    priority
                />
                
                {/* Content Overlay */}
                {/* Content Overlay */}
                
                {/* Title Zone */}
                <div style={PAGE_LAYOUT.TITLE_ZONE} className="z-10">
                    <div className="w-full h-full flex flex-col justify-end pb-2 border-b border-[#8b4513]/30">
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                onPlaySound('SCRIBE');
                            }}
                            placeholder="Entry Title..."
                            className="w-full bg-transparent font-bold text-[2.2vh] text-[#3e2c22] placeholder:text-[#8b4513]/40 focus:outline-none text-center"
                            style={{ fontFamily }}
                        />
                         <input
                            type="text"
                            value={dateStr}
                            onChange={(e) => setDateStr(e.target.value)}
                            className="w-full bg-transparent text-[1.8vh] text-[#5c4033] italic mt-1 focus:outline-none focus:text-[#3e2c22] text-center"
                            placeholder="Date..."
                            style={{ fontFamily }}
                        />
                    </div>
                </div>

                {/* Body Zone */}
                <div style={PAGE_LAYOUT.BODY_ZONE} className="z-10">
                    <textarea 
                        value={content}
                        onChange={handleTextChange}
                        placeholder="Write your thoughts..."
                        // Increased font size by ~50% (1.8vh -> 2.7vh)
                        className="flex-1 w-full bg-transparent resize-none focus:outline-none text-[2.7vh] leading-relaxed text-[#2a1f18] placeholder:text-[#8b4513]/30 custom-scrollbar p-2"
                        style={{ fontFamily }} 
                    />

                    {/* Footer Actions */}
                    <div className="mt-2 flex justify-between items-center pt-2 border-t border-[#8b4513]/20 shrink-0 gap-2">
                        <button onClick={onClose} className="text-[#8b4513] hover:text-red-900 underline text-xs md:text-sm" style={{ fontFamily }}>Discard</button>
                        <button 
                            onClick={handleSave}
                            disabled={loading || !title || !content}
                            className="flex items-center gap-1 px-3 py-2 bg-[#8b4513] text-[#f4e4bc] rounded uppercase text-xs md:text-sm hover:bg-[#5c4033] shadow-md transition-all disabled:opacity-50"
                            style={{ fontFamily }}
                        >
                            {loading ? 'Inscribing...' : 'Save Entry'} <Save size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
