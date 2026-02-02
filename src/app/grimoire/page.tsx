"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { saveSpell, getSpells, deleteSpell } from '@/lib/services/geminiService';
import type { Spell } from '@/lib/types';
// Imports removed
import LoadingSpinner from '@/app/components/LoadingSpinner';
import GrimoireCustomizer, { GrimoireCustomization } from '@/app/components/GrimoireCustomizer';
import CustomSpellWizard from '@/app/components/CustomSpellWizard';
import JournalEntryEditor from '@/app/components/JournalEntryEditor';
import { Calendar, X, RotateCcw, ChevronLeft, ChevronRight, Trash2, Settings, PenTool, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// --- TYPES ---
type ViewMode = 'COVER' | 'TOC' | 'SECTION' | 'THE_END' | 'CUSTOMIZER' | 'CREATE_SPELL' | 'CREATE_JOURNAL';

interface SpellSection {
    id: string; // unique key, e.g., 'electric-magick'
    title: string; // Display name, e.g., "Electric Magick"
    spells: Spell[];
}

interface SpellMetadata {
    sectionId: string;
    sectionTitle: string;
    replayUrl: string | null;
}

const DEFAULT_CUSTOMIZATION: GrimoireCustomization = {
    coverImage: '/images/grimoire-images/grimoire-cover.png',
    coverTitle: 'Book of Magick',
    pageStyle: '/images/grimoire-images/grimoire-page.png',
    fontFamily: 'Cinzel',
    cardStyle: 'default',
    detailPageStyle: 'default'
};

// --- HELPER LOGIC ---
const getSpellMetadata = (spell: Spell): SpellMetadata => {
    // Helper to format title from ID
    const formatTitle = (id: string) => id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    // Default
    let sectionId = 'misc-spells';
    let sectionTitle = 'Miscellaneous Spells';
    let replayUrl: string | null = null;
    let url = '';

    const nameLower = spell.name.toLowerCase();
    const ritualData = typeof spell.ritual_data === 'string' 
        ? JSON.parse(spell.ritual_data || '{}') 
        : (spell.ritual_data || {});

    // 1. Explicit Tradition/Tag Checks
    if (spell.tradition === 'CUSTOM' as any || ritualData.type === 'CUSTOM') {
        sectionId = 'custom-spells';
        sectionTitle = 'My Custom Spells';
        replayUrl = null; // Custom spells open in modal details
    } else if (spell.tradition === 'CUSTOM' as any || ritualData.type === 'JOURNAL') { // Using 'CUSTOM' as tradition placeholder for journal too if needed, but better separable
        sectionId = 'journal-entries';
        sectionTitle = 'Journal Entries';
        replayUrl = null;
    } else if (spell.tradition === 'HOODOO' || spell.tradition === 'VOODOO' || nameLower.includes('hoodoo')) {
        sectionId = 'hoodoo-rootwork';
        sectionTitle = 'Hoodoo Rootwork';
        replayUrl = `/spell-room/hoodoo-rootwork-spells-app?loadId=${spell.id}`;
    } else if (spell.tradition === 'WICCA' || nameLower.includes('wicca') || nameLower.includes('elemental')) {
        sectionId = 'wicca-magick';
        sectionTitle = 'Wicca Magick';
        replayUrl = `/spell-room/wicca-magick-spells-app?loadId=${spell.id}`;
    } else if (spell.tradition === 'CHAOS' || ritualData.type === 'CHAOS') {
        sectionId = 'chaos-magick';
        sectionTitle = 'Chaos Magick';
        replayUrl = `/spell-room/chaos-magick-spells-app?loadId=${spell.id}`;
    } else if (spell.tradition === 'LOVE' || nameLower.includes('love spell') || nameLower.includes('soul connect')) {
        sectionId = 'love-spells';
        sectionTitle = 'Love Spells';
        replayUrl = `/spell-room/love-spells-app/soul-connect-love-spell?loadId=${spell.id}`;
    } else if (spell.element === 'Servitor') {
        sectionId = 'servitors';
        sectionTitle = 'Servitors: Wild Unknown';
        replayUrl = `/spell-room/servitors-of-the-wild-unknown?loadId=${spell.id}`;
    } else if (nameLower.includes('reality') || nameLower.includes('neural') || nameLower.includes('data') || nameLower.includes('void') || nameLower.includes('light prism')) {
        sectionId = 'electric-magick';
        sectionTitle = 'Electric Magick';
        // Precise URL mapping for Electric Magick
        let spellType = '';
        if (nameLower.includes('reality')) spellType = 'reality-patch';
        else if (nameLower.includes('neural')) spellType = 'neural-link';
        else if (nameLower.includes('data')) spellType = 'data-scry';
        else if (nameLower.includes('zero')) spellType = 'zero-point-zet';
        else if (nameLower.includes('void')) spellType = 'void-gate';
        else if (nameLower.includes('light')) spellType = 'light-prism';
        
        replayUrl = `/spell-room/electric-magick-spells-app?spell=${spellType}&loadId=${spell.id}`;
    }

    return { sectionId, sectionTitle, replayUrl };
};


// --- AUDIO CONFIGURATION ---
// User Volume Control (1-10)
const SOUND_CONFIG = {
    PAGE_TURN: { 
        path: '/audio/sfx-parchment-open.mp3', 
        volume: 2, 
        description: "Flipping pages, Next/Back buttons" 
    },
    BOOK_CLOSE_OPEN: { 
        path: '/audio/book-close-open.mp3', 
        volume: 7, 
        description: "Opening or closing the Grimoire" 
    },
    SELECT: { 
        path: '/audio/sfx-parchment-open.mp3', 
        volume: 2, 
        description: "Selecting a spell card (Parchment sound)" 
    },
    OPEN_RITUAL: { 
        path: '/audio/sfx-finding-something-2.mp3', 
        volume: 2, 
        description: "Opening a specific ritual detail view" 
    },
    WRITE_SPELL: { 
        path: '/audio/sfx-parchment-open.mp3', 
        volume: 3, 
        description: "Clicking 'Write Spell' or 'Journal Entry' buttons" 
    },
    SAVE_SUCCESS: { 
        path: '/audio/OG - sfx-shimmer.mp3', 
        volume: 1, 
        description: "Successfully saving a spell or journal entry" 
    },
    SCRIBE: { 
        path: '/audio/grimoire-writing.mp3', 
        volume: 2, 
        description: "Writing/Typing sound effect (looping or per stroke)" 
    }
};

export type SoundKey = keyof typeof SOUND_CONFIG;

export default function GrimoirePage() {
    // --- STATE ---
    const [spells, setSpells] = useState<Spell[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [customization, setCustomization] = useState<GrimoireCustomization>(DEFAULT_CUSTOMIZATION);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const router = useRouter();
    
    // Manifestation Book State
    const [viewMode, setViewMode] = useState<ViewMode>('COVER');
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [pageOffset, setPageOffset] = useState(0); // 0-indexed page within a section
    
    const [selectedSpell, setSelectedSpell] = useState<{ spell: Spell, image: string } | null>(null);
    const [editingSpell, setEditingSpell] = useState<Spell | null>(null);
    const [transitioning, setTransitioning] = useState(false); // Deprecated but kept to avoid breaking other refs if any

    const [supabase] = useState(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ));

    // Audio Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const scribeAudioRef = useRef<HTMLAudioElement | null>(null);

    // Helper: Play Sound
    // Helper: Play Sound
    // Centralized audio handler using SOUND_CONFIG
    const playSound = (key: SoundKey) => {
        const config = SOUND_CONFIG[key];
        if (!config) return;

        // Debounce SCRIBE trigger: Strict "1 at a time"
        if (key === 'SCRIBE') {
            if (scribeAudioRef.current && !scribeAudioRef.current.paused) {
                return; // Currently playing, ignore new stroke
            }
        }

        const audio = new Audio(config.path);
        // Map 1-10 volume to 0.1-1.0
        audio.volume = Math.min(Math.max(config.volume / 10, 0), 1);
        
        if (key === 'SCRIBE') {
            scribeAudioRef.current = audio;
        }
        
        audio.play().catch(e => console.warn(`Audio play failed for ${key}`, e));
    };

    // Load Data
    useEffect(() => {
        const load = async () => {
            console.log("Grimoire: Starting loading process...");
            try {
                // Load Customization
                const savedCustomization = localStorage.getItem('grimoire_customization');
                if (savedCustomization) {
                    setCustomization(JSON.parse(savedCustomization));
                }

                const { data: { user }, error: authError } = await supabase.auth.getUser();
                
                if (authError) {
                    console.error("Grimoire: Auth Error", authError);
                }

                if (user) {
                    console.log("Grimoire: User found", user.id);
                    setCurrentUserId(user.id);
                    console.log("Grimoire: Fetching spells...");
                    const data = await getSpells(user.id);
                    console.log("Grimoire: Spells fetched", data?.length);
                    setSpells(data || []);
                } else {
                    console.log("Grimoire: No user session found.");
                }
            } catch (e) {
                console.error("Grimoire: Failed to load Grimoire", e);
            } finally {
                console.log("Grimoire: Loading complete. Setting loading to false.");
                setLoading(false);
            }
        };
        load();
    }, [supabase]);

    const handleSpellDelete = async (spellId: string) => {
        if (!currentUserId) return;
        const success = await deleteSpell(currentUserId, spellId);
        if (success) {
            setSpells(prev => prev.filter(s => s.id !== spellId));
            setSelectedSpell(null);
        }
    };

    const handleCustomizationSave = (newSettings: GrimoireCustomization) => {
        setCustomization(newSettings);
        localStorage.setItem('grimoire_customization', JSON.stringify(newSettings));
    };

    const handleSpellCreated = (newSpell: Spell) => {
        setSpells(prev => {
            const exists = prev.find(s => s.id === newSpell.id);
            if (exists) {
                return prev.map(s => s.id === newSpell.id ? newSpell : s);
            }
            return [newSpell, ...prev];
        });
        setEditingSpell(null);
        setViewMode('TOC'); // Go back to TOC to see it
        playSound('SAVE_SUCCESS');
    };

    // Derived Data: Sections
    const sections = useMemo(() => {
        const map = new Map<string, SpellSection>();
        
        spells.forEach(spell => {
            const { sectionId, sectionTitle } = getSpellMetadata(spell);
            // Consolidated journal logic (in case tradition varies)
            const isJournal = sectionId === 'journal-entries' || spell.name === 'Journal Entry';
            const finalSectionId = isJournal ? 'journal-entries' : sectionId;
            const finalSectionTitle = isJournal ? 'Journal Entries' : sectionTitle;

            if (!map.has(finalSectionId)) {
                map.set(finalSectionId, { id: finalSectionId, title: finalSectionTitle, spells: [] });
            }
            map.get(finalSectionId)!.spells.push(spell);
        });

        // Sort: Custom Spells last in list before Journal? User asked for Custom Spells last in index list.
        // Let's sort alphabetically first, then force Custom/Journal to end.
        let sorted = Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
        
        const custom = sorted.find(s => s.id === 'custom-spells');
        const journal = sorted.find(s => s.id === 'journal-entries');
        
        sorted = sorted.filter(s => s.id !== 'custom-spells' && s.id !== 'journal-entries');
        
        if (custom) sorted.push(custom);
        if (journal) sorted.push(journal);

        return sorted;
    }, [spells]);

    const activeSection = sections.find(s => s.id === activeSectionId);
    
    // Pagination Logic (2 Cards per page)
    const itemsPerPage = 2;
    const currentSpells = activeSection 
        ? activeSection.spells.slice(pageOffset * itemsPerPage, (pageOffset + 1) * itemsPerPage)
        : [];
    
    const totalPages = activeSection ? Math.ceil(activeSection.spells.length / itemsPerPage) : 0;
    const currentPage = pageOffset + 1;



    // --- NAVIGATION HANDLERS ---
    
    const triggerTransition = (nextStateFn: () => void) => {
        // Instant transition, sound only
        playSound('PAGE_TURN');
        nextStateFn();
    };

    // Special Transition for Book Open/Close
    const triggerBookAction = (opening: boolean, nextStateFn: () => void) => {
        // Instant transition, sound only
        playSound('BOOK_CLOSE_OPEN');
        nextStateFn();
    };

    const handleNext = () => {
        if (viewMode === 'COVER') {
            triggerBookAction(true, () => setViewMode('TOC'));
        } else if (viewMode === 'TOC') {
             if (sections.length > 0) {
                triggerTransition(() => {
                    setActiveSectionId(sections[0].id);
                    setPageOffset(0);
                    setViewMode('SECTION');
                });
            } else {
                 triggerTransition(() => setViewMode('THE_END'));
            }
        } else if (viewMode === 'SECTION') {
            // Check if more pages in this section
            if (currentPage < totalPages) {
                 triggerTransition(() => setPageOffset(prev => prev + 1));
            } else {
                // Determine next section
                const currentIndex = sections.findIndex(s => s.id === activeSectionId);
                if (currentIndex >= 0 && currentIndex < sections.length - 1) {
                    triggerTransition(() => {
                        setActiveSectionId(sections[currentIndex + 1].id);
                        setPageOffset(0);
                    });
                } else {
                    // Start of 'The End' Logic
                    triggerTransition(() => setViewMode('THE_END'));
                }
            }
        } else if (viewMode === 'THE_END') {
             triggerBookAction(false, () => setViewMode('COVER'));
        }
    };

    const handlePrev = () => {
        if (viewMode === 'COVER') return;
        
        if (viewMode === 'TOC') {
            triggerBookAction(false, () => setViewMode('COVER'));
        } else if (viewMode === 'SECTION') {
            if (pageOffset > 0) {
                 triggerTransition(() => setPageOffset(prev => prev - 1));
            } else {
                // Go to previous section's last page
                const currentIndex = sections.findIndex(s => s.id === activeSectionId);
                if (currentIndex > 0) {
                     triggerTransition(() => {
                        const prevSection = sections[currentIndex - 1];
                        setActiveSectionId(prevSection.id);
                        const prevPages = Math.ceil(prevSection.spells.length / itemsPerPage);
                        setPageOffset(Math.max(0, prevPages - 1));
                     });
                } else {
                     triggerTransition(() => {
                        setViewMode('TOC');
                        setActiveSectionId(null);
                     });
                }
            }
        } else if (viewMode === 'THE_END') {
            // Go back to last page of last section
            if (sections.length > 0) {
                 triggerTransition(() => {
                    const lastSection = sections[sections.length - 1];
                    setActiveSectionId(lastSection.id);
                    const lastPages = Math.ceil(lastSection.spells.length / itemsPerPage);
                    setPageOffset(Math.max(0, lastPages - 1));
                    setViewMode('SECTION');
                 });
            } else {
                 triggerTransition(() => setViewMode('TOC'));
            }
        }
    };

    const jumpToSection = (sectionId: string) => {
        triggerTransition(() => {
            setActiveSectionId(sectionId);
            setPageOffset(0);
            setViewMode('SECTION');
        });
    };

    // --- RENDERERS ---

    // --- LAYOUT CONSTANTS ---
    // Based on 1529px x 2048px original
    const PAGE_LAYOUT = {
        TITLE_ZONE: {
            left: '25.40%', 
            top: '18.33%', 
            width: '55.07%', 
            height: '11.13%',
            // debug: '1px solid red' 
        },
        BODY_ZONE: {
            left: '25.40%', 
            top: '29.46%', 
            width: '55.07%', 
            height: '50.02%',
            // debug: '1px solid blue'
        }
    };

    const renderCover = () => (
        <div className="relative h-full w-full md:w-auto max-w-[90vh] aspect-[1529/2048] shadow-2xl shrink-0">
            <Image 
                src={customization.coverImage}
                alt="Grimoire Cover" 
                fill 
                className="object-fill"
                priority
                sizes="(max-height: 100vh) 100vw, 50vw"
            />
            
            {/* Content Overlay */}
            <div 
                className="absolute flex flex-col items-center justify-center text-center z-10"
                style={{
                    left: '27.42%',
                    top: '20.37%',
                    width: '52.96%',
                    height: '57.00%',
                }}
            >
                <h1 
                    className="text-[5vh] lg:text-[6vh] leading-tight text-[#d4af37] tracking-wider mb-[4vh] [text-shadow:0px_0px_1px_rgba(0,0,0,1),_0px_0px_3px_rgba(0,0,0,1),_0px_0px_5px_rgba(0,0,0,0.5)] opacity-95" 
                    style={{ fontFamily: `${customization.fontFamily}, serif` }}
                >
                    {customization.coverTitle.split(' ').map((word, i) => (
                        <span key={i} className="block">{word}</span>
                    ))}
                </h1>
                    <button 
                    onClick={() => triggerBookAction(true, () => setViewMode('TOC'))}
                    className="px-6 py-[1.5vh] bg-black/60 border border-[#d4af37] text-[#d4af37] text-[2vh] font-serif uppercase tracking-widest hover:bg-[#d4af37] hover:text-black transition-all duration-300 backdrop-blur-sm whitespace-nowrap mb-4"
                    style={{ fontFamily: customization.fontFamily }}
                >
                    Open Book
                </button>

                {/* Customization Trigger */}
                <button 
                        onClick={() => setViewMode('CUSTOMIZER')}
                        className="flex items-center gap-2 text-[#d4af37]/60 hover:text-[#d4af37] transition-colors text-xs font-serif uppercase tracking-widest"
                >
                    <Settings size={14} /> Customize
                </button>
                
            </div>
        </div>
    );

    const renderBookPage = (content: React.ReactNode) => {
        return (
            <div className="relative h-full w-full md:w-auto max-w-[90vh] aspect-[1529/2048] shadow-2xl shrink-0">
                <Image 
                    src={customization.pageStyle} 
                    alt="Grimoire Page" 
                    fill 
                    className="object-fill"
                    priority
                    sizes="(max-height: 100vh) 100vw, 50vw"
                />

                {/* Content is now responsible for its own positioning within the page */}
                {content}

                {/* Navigation - Ornate & Smaller */}
                {/* Left Arrow (Prev) */}
                <button 
                    onClick={handlePrev}
                    className="absolute left-[2%] top-1/2 -translate-y-1/2 z-20 group transition-all duration-300 focus:outline-none"
                >
                    <div className="p-2 rounded-full border-2 border-[#8b4513]/60 bg-[#1a120b]/80 text-[#8b4513] group-hover:text-[#d4af37] group-hover:border-[#d4af37] group-hover:bg-black/90 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all backdrop-blur-[2px]">
                        <ChevronLeft size={24} className="md:w-6 md:h-6" strokeWidth={2} />
                    </div>
                </button>
                
                {/* Right Arrow (Next) */}
                <button 
                    onClick={handleNext}
                    className="absolute right-[2%] top-1/2 -translate-y-1/2 z-20 group transition-all duration-300 focus:outline-none"
                >
                    <div className="p-2 rounded-full border-2 border-[#8b4513]/60 bg-[#1a120b]/80 text-[#8b4513] group-hover:text-[#d4af37] group-hover:border-[#d4af37] group-hover:bg-black/90 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all backdrop-blur-[2px]">
                        <ChevronRight size={24} className="md:w-6 md:h-6" strokeWidth={2} />
                    </div>
                </button>
            </div>
        );
    };

   const renderTOC = () => (
        <>
            {/* Header Zone */}
            <div className="absolute flex flex-col justify-center items-center text-center z-10" style={PAGE_LAYOUT.TITLE_ZONE}>
                 <header className="border-b-2 border-[#8b4513]/30 pb-2 w-full">
                    <h2 className="text-[3vh] font-serif text-[#5c4033] mb-1" style={{ fontFamily: customization.fontFamily }}>Table of Contents</h2>
                    <div className="text-[1.5vh] italic font-serif text-[#8b4513]/60">Index of Workings</div>
                </header>
            </div>

            {/* Body Zone */}
            <div className="absolute z-10 overflow-hidden" style={PAGE_LAYOUT.BODY_ZONE}>
                <div className="flex flex-col h-full text-[#3e2c22] p-2">
                     {/* Creation Buttons */}
                     <div className="flex gap-2 mb-4 shrink-0">
                        <button 
                            onClick={() => {
                                playSound('WRITE_SPELL');
                                setViewMode('CREATE_SPELL');
                            }} 
                            className="flex-1 py-2 border border-[#8b4513]/40 bg-[#8b4513]/5 hover:bg-[#8b4513]/10 text-[#5c4033] rounded flex flex-col items-center justify-center gap-1 transition-all"
                        >
                            <PenTool size={16} />
                            <span className="text-[1.2vh] uppercase font-bold tracking-wider">Write Spell</span>
                        </button>
                        <button 
                            onClick={() => {
                                playSound('WRITE_SPELL');
                                setViewMode('CREATE_JOURNAL');
                            }} 
                            className="flex-1 py-2 border border-[#8b4513]/40 bg-[#8b4513]/5 hover:bg-[#8b4513]/10 text-[#5c4033] rounded flex flex-col items-center justify-center gap-1 transition-all"
                        >
                            <BookOpen size={16} />
                            <span className="text-[1.2vh] uppercase font-bold tracking-wider">Journal Entry</span>
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-2">
                        {sections.length === 0 ? (
                            <div className="text-center italic opacity-50 mt-10">The Grimoire is empty.</div>
                        ) : (
                            sections.map((section, idx) => (
                                <button
                                    key={section.id}
                                    onClick={() => jumpToSection(section.id)}
                                    className="w-full group flex items-center justify-between p-2 border-b border-[#8b4513]/10 hover:bg-[#8b4513]/5 transition-colors text-left"
                                >
                                    <span className="font-serif text-[2vh] group-hover:pl-2 transition-all font-bold text-[#5c4033]" style={{ fontFamily: customization.fontFamily }}>
                                        {section.title}
                                    </span>
                                    <span className="font-mono text-sm text-[#8b4513]/50">
                                        {idx + 1}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    const renderSection = () => (
        <>
            {/* Header Zone */}
            {/* Header Zone */}
            <div className="absolute z-10 grid grid-cols-[3fr_1fr] items-start pt-2 px-4 overflow-hidden gap-2" style={PAGE_LAYOUT.TITLE_ZONE}>
                {/* Title & Page Number (75% Width Strict) */}
                <div className="flex flex-col items-start justify-start pr-2 h-full overflow-hidden">
                    <h2 
                        className={`w-full ${activeSection?.title && activeSection.title.length > 25 ? 'text-[1.6vh]' : 'text-[2vh]'} leading-[1.1] font-serif text-[#5c4033] mb-1 text-left break-words line-clamp-3`} 
                        style={{ fontFamily: customization.fontFamily }}
                    >
                        {activeSection?.title}
                    </h2>
                     <p className="text-[1.4vh] italic font-serif text-[#8b4513]/60 w-full text-left">
                        Page {currentPage} of {totalPages}
                    </p>
                </div>

                 {/* Return Button (25% Width Strict) */}
                <div className="flex items-start justify-end pl-1 h-full pt-1">
                    <button 
                        onClick={() => triggerBookAction(false, () => setViewMode('TOC'))} 
                        className="text-[1.6vh] font-serif font-bold text-[#3e2c22] underline decoration-[#8b4513]/40 underline-offset-4 hover:text-[#8b4513] transition-colors text-right leading-tight"
                    >
                        Return to Index
                    </button>
                </div>
            </div>

            {/* Body Zone */}
            {/* Body Zone */}
             <div className="absolute z-10" style={PAGE_LAYOUT.BODY_ZONE}>
                {/* Grid expands to fill available space. 1 column, 2 rows. Reduced gap. */}
                <div className="grid grid-cols-1 grid-rows-2 gap-1 w-full h-full justify-items-center items-center p-0">
                    {Array.from({ length: 2 }).map((_, idx) => {
                        const spell = currentSpells[idx]; 
                        // Cycle images 1-6
                        const imageIndex = ((pageOffset * itemsPerPage + idx) % 6) + 1;
                        const cardImage = `/images/grimoire-images/spell-card-${imageIndex}.png`;
                        
                        // Font scaling heuristic
                        const isLongTitle = spell ? spell.name.length > 25 : false;
                        const cardTitleSize = isLongTitle
                             ? "text-[1.5vh] md:text-[1.8vh]" 
                             : "text-[1.8vh] md:text-[2.2vh]";
                        
                        // Safe parsing for ritual data
                        const ritualData = spell && (typeof spell.ritual_data === 'string' ? JSON.parse(spell.ritual_data) : (spell.ritual_data || {}));
                        const isJournal = spell && (spell.tradition === 'CUSTOM' as any && ritualData.type === 'JOURNAL');

                        return (
                            <div key={idx} className="relative w-full h-full flex items-center justify-center overflow-hidden">
                                {spell ? (
                                    <button 
                                        onClick={() => {
                                            playSound('SELECT');
                                            setSelectedSpell({ spell, image: cardImage });
                                        }}
                                        className="relative h-full w-auto aspect-square hover:scale-[1.02] transition-transform duration-300 transform-gpu"
                                    >
                                        <div className="relative w-full h-full">
                                            <Image 
                                                src={cardImage} 
                                                alt={spell.name} 
                                                fill 
                                                className="object-contain drop-shadow-md"
                                                sizes="(max-width: 768px) 60vw, 30vw"
                                            />
                                            
                                            {/* Writable Area - Title Only, Sized to fit */}
                                            <div 
                                                className="absolute flex flex-col items-center justify-center text-center p-4 z-10 overflow-hidden"
                                                style={{
                                                    left: '19.25%',
                                                    top: '19.25%',
                                                    width: '61.5%',
                                                    height: '61.5%'
                                                }}
                                            >
                                                {/* Text scale reduced and clamped according to length */}
                                                <div className="w-full h-full flex flex-col items-center justify-center">
                                                    <h3 
                                                        className={`font-serif font-bold ${cardTitleSize} leading-tight text-[#3e2c22] drop-shadow-sm text-balance line-clamp-4`}
                                                        style={{ fontFamily: customization.fontFamily }}
                                                    >
                                                        {spell.name}
                                                    </h3>
                                                    
                                                    {/* Date for Journal Entries - Color High Contrast */}
                                                    {isJournal && (ritualData.date || ritualData.timestamp) && (
                                                         <div 
                                                            className="text-[1.6vh] text-[#3e2c22] font-bold italic mt-2 z-20 relative drop-shadow-sm"
                                                            style={{ fontFamily: customization.fontFamily }}
                                                         >
                                                            {ritualData.date || ritualData.timestamp}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ) : (
                                    <div className="h-full w-auto aspect-square" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );

    const renderTheEnd = () => (
        <div className="relative h-full w-full md:w-auto max-w-[90vh] aspect-[1529/2048] shadow-2xl shrink-0">
            {/* Clean Page for The End */}
            <Image 
                src={customization.pageStyle} 
                alt="The End" 
                fill 
                className="object-fill"
                priority
            />
                {/* Navigation - Ornate & Smaller */}
                {/* Left Arrow (Prev) */}
                <button 
                onClick={handlePrev}
                className="absolute left-[2%] top-1/2 -translate-y-1/2 z-20 group transition-all duration-300 focus:outline-none"
            >
                <div className="p-2 rounded-full border-2 border-[#8b4513]/60 bg-[#1a120b]/80 text-[#8b4513] group-hover:text-[#d4af37] group-hover:border-[#d4af37] group-hover:bg-black/90 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all backdrop-blur-[2px]">
                    <ChevronLeft size={24} className="md:w-6 md:h-6" strokeWidth={2} />
                </div>
            </button>
            
            {/* Right Arrow (Next) */}
            <button 
                onClick={handleNext}
                className="absolute right-[2%] top-1/2 -translate-y-1/2 z-20 group transition-all duration-300 focus:outline-none"
            >
                <div className="p-2 rounded-full border-2 border-[#8b4513]/60 bg-[#1a120b]/80 text-[#8b4513] group-hover:text-[#d4af37] group-hover:border-[#d4af37] group-hover:bg-black/90 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all backdrop-blur-[2px]">
                    <ChevronRight size={24} className="md:w-6 md:h-6" strokeWidth={2} />
                </div>
            </button>

            <div 
                className="absolute z-10 flex items-center justify-center flex-col"
                style={PAGE_LAYOUT.BODY_ZONE}
            >
                <h1 
                    className="text-[8vh] text-[#3e2c22] drop-shadow-sm text-center leading-none" 
                    style={{ fontFamily: '"IM Fell English SC", serif' }}
                >
                    Finis
                </h1>
                    <button 
                    onClick={() => setViewMode('COVER')}
                    className="mt-8 px-6 py-2 border-b border-[#3e2c22] text-[#3e2c22] font-serif hover:text-[#8b4513] hover:border-[#8b4513] transition-colors"
                >
                    Return to Cover
                </button>
            </div>
        </div>
    );

    // --- ENLARGED CARD MODAL ---
    const SpellDetailModal = ({ data, onClose, onDelete }: { data: { spell: Spell, image: string }, onClose: () => void, onDelete: (id: string) => void }) => {
        const { spell, image } = data;
        const { replayUrl } = getSpellMetadata(spell);
        const [showConfirm, setShowConfirm] = useState(false);

        // Parse ritual data for Custom Spells / Journals
        const ritualData = typeof spell.ritual_data === 'string' ? JSON.parse(spell.ritual_data) : (spell.ritual_data || {});
        // Logic to show wizard-like pages for Custom Spells
        const [detailPage, setDetailPage] = useState(0); 
        
        // Is it custom with multiple pages?
        const isJournal = ritualData.type === 'JOURNAL';
        const isCustom = (spell.tradition === 'CUSTOM' as any || ritualData.type === 'CUSTOM') && !isJournal;

        const customPages = isCustom && ritualData.instructions ? [
            { type: 'INTRO', content: { purpose: spell.intention, ingredients: ritualData.ingredients } },
            ...ritualData.instructions.map((inst: string, i: number) => ({ type: 'STEP', step: i + 1, content: inst })),
        ] : [];

        // Determine view based on page
        const currentCustomContent = customPages[detailPage];

        const handleDetailNext = () => {
             if (detailPage < customPages.length - 1) {
                 playSound('PAGE_TURN');
                 setDetailPage(p => p + 1);
             }
        };
        const handleDetailPrev = () => {
            if (detailPage > 0) {
                 playSound('PAGE_TURN');
                 setDetailPage(p => p - 1);
            }
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-2 py-[10vh] md:px-8 md:py-[5vh] bg-black/90 backdrop-blur-md">
                <div 
                    className="relative shadow-2xl"
                    style={{
                        aspectRatio: '947/1681',
                        width: 'min(90vw, 85vh * 0.5633)'
                    }}
                >
                    {!showConfirm && (
                        <>
                            <button 
                                onClick={onClose} 
                                className="absolute -top-12 -right-4 md:-right-12 z-50 p-2 text-white/50 hover:text-white transition-colors"
                            >
                                <X size={32} />
                            </button>
                             <button 
                                onClick={() => setShowConfirm(true)}
                                className="absolute -top-12 -left-4 md:-left-12 z-50 p-2 text-white/50 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={24} />
                            </button>
                        </>
                    )}
                    
                    <Image 
                        src="/images/grimoire-images/detailed-spell-info.png"
                        alt={spell.name} 
                        fill 
                        className="object-cover rounded-sm" 
                    />

                    {/* Navigation Arrows for Custom Spells - Styled Identical to Main Navigation */ }
                    {isCustom && (
                        <>
                             {/* Left Arrow */}
                             <button
                                onClick={handleDetailPrev}
                                disabled={detailPage === 0}
                                className={`absolute left-[-20px] md:left-[-40px] top-1/2 -translate-y-1/2 z-50 group transition-all duration-300 focus:outline-none ${detailPage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            >
                                <div className="p-2 rounded-full border-2 border-[#8b4513]/60 bg-[#1a120b]/80 text-[#8b4513] group-hover:text-[#d4af37] group-hover:border-[#d4af37] group-hover:bg-black/90 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all backdrop-blur-[2px]">
                                    <ChevronLeft size={24} className="md:w-6 md:h-6" strokeWidth={2} />
                                </div>
                            </button>
                            
                             {/* Right Arrow */}
                             <button
                                onClick={handleDetailNext}
                                disabled={detailPage === customPages.length - 1}
                                className={`absolute right-[-20px] md:right-[-40px] top-1/2 -translate-y-1/2 z-50 group transition-all duration-300 focus:outline-none ${detailPage === customPages.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            >
                                <div className="p-2 rounded-full border-2 border-[#8b4513]/60 bg-[#1a120b]/80 text-[#8b4513] group-hover:text-[#d4af37] group-hover:border-[#d4af37] group-hover:bg-black/90 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all backdrop-blur-[2px]">
                                    <ChevronRight size={24} className="md:w-6 md:h-6" strokeWidth={2} />
                                </div>
                            </button>
                        </>
                    )}
                    
                    <div 
                        className="absolute flex flex-col items-center text-center z-10 overflow-hidden px-[5px]"
                        style={{
                           left: '20%',
                           top: '18%',
                           width: '65%',
                           height: '64%'
                        }}
                    >
                        {showConfirm ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                <h3 className="font-medieval font-bold text-[#3e2c22] text-[2.5vh] mb-4 leading-tight">Burn this Spell?</h3>
                                <p className="font-medieval italic text-[1.8vh] text-[#5c4033] mb-6 text-balance">
                                    "This action cannot be undone. The pages will be burned from the Grimoire forever."
                                </p>
                                <div className="flex flex-col gap-3 w-full">
                                    <button 
                                        onClick={() => onDelete(spell.id)}
                                        className="w-full py-[1vh] bg-[#8b4513] text-[#f4e4bc] font-medieval uppercase tracking-widest text-[1.5vh] rounded hover:bg-[#5c4033] transition-colors shadow-lg"
                                    >
                                        Yes, Burn It
                                    </button>
                                    <button 
                                        onClick={() => setShowConfirm(false)}
                                        className="w-full py-[1vh] border border-[#8b4513]/40 text-[#5c4033] font-medieval uppercase tracking-widest text-[1.4vh] rounded hover:bg-[#8b4513]/10 transition-colors"
                                    >
                                        Keep It
                                    </button>
                                </div>
                            </div>
                         ) : (
                            <div className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar scrollbar-thin scrollbar-thumb-[#5c4033]/50 p-2 relative">
                                {/* Regular Spell View */}
                                {/* Regular Spell View - Fallback */}
                                {!isCustom && !isJournal && (
                                    <>
                                        <div className="flex justify-between items-start w-full">
                                            <h2 className="font-serif font-bold text-[2.5vh] mb-4 text-[#3e2c22] shrink-0 leading-tight" style={{ fontFamily: customization.fontFamily }}>{spell.name}</h2>
                                            <button 
                                                onClick={() => {
                                                    setEditingSpell(spell);
                                                    onClose(); 
                                                    setViewMode('CREATE_SPELL');
                                                }}
                                                className="text-[#8b4513] hover:text-[#d4af37] p-2 transition-colors z-[60]"
                                                title="Edit Spell"
                                            >
                                                <PenTool size={16} />
                                            </button>
                                        </div>
                                        <p className="font-medieval italic text-[2vh] text-[#5c4033] mb-6 whitespace-pre-wrap shrink-0 leading-snug">"{spell.intention}"</p>
                                        {spell.incantation && (
                                            <div className="font-medieval text-[1.8vh] text-[#8b4513] mb-6 text-center w-full border-t border-[#8b4513]/20 pt-4 shrink-0 font-medium leading-normal">
                                                {spell.incantation}
                                            </div>
                                        )}
                                        <div className="mt-auto pt-2 w-full shrink-0 sticky bottom-0 bg-transparent pb-1">
                                            {replayUrl && (
                                                <Link 
                                                    href={replayUrl}
                                                    onClick={() => playSound('OPEN_RITUAL')}
                                                    className="block w-full py-[1.5vh] bg-[#5c4033] text-[#d4af37] border border-[#d4af37]/30 font-serif uppercase tracking-widest text-[1.2vh] rounded hover:bg-[#3e2c22] transition-colors shadow-lg"
                                                >
                                                    Open Ritual
                                                </Link>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Journal View */}
                                {isJournal && (
                                    <>
                                        <div 
                                            className="text-[2.2vh] text-[#5c4033] mb-2 italic"
                                            style={{ fontFamily: customization.fontFamily }}
                                        >
                                            {ritualData.day && ritualData.date ? `${ritualData.day}, ${ritualData.date}` : ritualData.timestamp}
                                        </div>
                                        <div className="flex justify-between items-start w-full">
                                            <h2 className="font-serif font-bold text-[2.5vh] mb-4 text-[#3e2c22] shrink-0 leading-tight" style={{ fontFamily: customization.fontFamily }}>{spell.name}</h2>
                                            {/* Edit Button for ALL Custom Spells (Generic or Journal) */}
                                            <button 
                                                onClick={() => {
                                                    setEditingSpell(spell);
                                                    onClose(); 
                                                    // Determine mode based on type
                                                    if (isJournal) {
                                                        setViewMode('CREATE_JOURNAL');
                                                    } else {
                                                        setViewMode('CREATE_SPELL');
                                                    }
                                                }}
                                                className="text-[#8b4513] hover:text-[#d4af37] p-2 transition-colors z-[60]"
                                                title="Edit Entry"
                                            >
                                                <PenTool size={16} />
                                            </button>
                                        </div>
                                        <div 
                                            className="text-[2vh] text-[#3e2c22] whitespace-pre-wrap text-left leading-relaxed"
                                            style={{ fontFamily: customization.fontFamily }}
                                        >
                                            {ritualData.content}
                                        </div>
                                    </>
                                )}

                                {/* Custom Spell View (Paginated) */}
                                {isCustom && currentCustomContent && (
                                    <div className="flex flex-col h-full"> 
                                        {currentCustomContent.type === 'INTRO' && (
                                            <>
                                                <div className="flex justify-between items-start w-full">
                                                    <h2 className="font-serif font-bold text-[2.5vh] mb-4 text-[#3e2c22] leading-tight" style={{ fontFamily: customization.fontFamily }}>{spell.name}</h2>
                                                    <button 
                                                        onClick={() => {
                                                            setEditingSpell(spell);
                                                            onClose(); 
                                                            setViewMode('CREATE_SPELL');
                                                        }}
                                                        className="text-[#8b4513] hover:text-[#d4af37] p-2 transition-colors z-[60]"
                                                        title="Edit Spell"
                                                    >
                                                        <PenTool size={16} />
                                                    </button>
                                                </div>
                                                <h3 className="text-[1.5vh] text-[#8b4513] uppercase font-bold mb-2" style={{ fontFamily: customization.fontFamily }}>Purpose</h3>
                                                <p className="italic text-[1.8vh] text-[#5c4033] mb-4" style={{ fontFamily: customization.fontFamily }}>"{currentCustomContent.content.purpose}"</p>
                                                
                                                <h3 className="text-[1.5vh] text-[#8b4513] uppercase font-bold mb-2" style={{ fontFamily: customization.fontFamily }}>Ingredients</h3>
                                                <p className="text-[1.8vh] text-[#5c4033] whitespace-pre-wrap" style={{ fontFamily: customization.fontFamily }}>{currentCustomContent.content.ingredients}</p>
                                            </>
                                        )}
                                        {currentCustomContent.type === 'STEP' && (
                                             <div className="flex flex-col h-full justify-center">
                                                <h3 className="text-[2vh] text-[#8b4513] uppercase font-bold mb-4 border-b border-[#8b4513]/20 pb-2" style={{ fontFamily: customization.fontFamily }}>Step {currentCustomContent.step}</h3>
                                                <p className="text-[2.2vh] text-[#3e2c22] leading-relaxed italic" style={{ fontFamily: customization.fontFamily }}>
                                                    {currentCustomContent.content}
                                                </p>
                                             </div>
                                        )}
                                        
                                         <div className="mt-auto text-xs text-[#8b4513]/40 text-center">
                                            Page {detailPage + 1} of {customPages.length}
                                        </div>
                                    </div>
                                )}
                            </div>
                         )}
                    </div>
                </div>
            </div>
        );
    };
    
    // --- EXIT CONFIRMATION MODAL ---
    const ExitConfirmationModal = () => (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
             <div 
                className="relative bg-[#1a120b] border-2 border-[#8b4513] p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(139,69,19,0.3)]"
                style={{ fontFamily: customization.fontFamily }}
            >
                <h3 className="text-[3vh] text-[#d4af37] mb-6 uppercase tracking-widest font-bold">Depart the <br/>Sanctuary?</h3>
                <p className="text-[#f4e4bc] text-lg mb-8 leading-relaxed italic">
                    "The threads of fate separate. Are you certain you wish to leave this sanctuary and return to the Grand Hall?"
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => router.push('/hall')}
                        className="w-full py-3 bg-[#8b4513] text-[#f4e4bc] border border-[#d4af37]/50 hover:bg-[#5c4033] hover:border-[#d4af37] transition-all uppercase tracking-widest text-sm font-bold shadow-lg"
                    >
                        Depart
                    </button>
                    <button 
                        onClick={() => setShowExitConfirm(false)}
                        className="w-full py-3 border border-[#8b4513]/50 text-[#8b4513] hover:text-[#d4af37] hover:border-[#d4af37] transition-all uppercase tracking-widest text-sm font-bold"
                    >
                        Stay Spoken
                    </button>
                </div>
            </div>
        </div>
    );
    
    return (
        // Changed overflow-hidden to overflow-y-auto for failsafe scrolling
        // Used min-h-screen (or h-[100dvh]) to ensure full viewport coverage
        <main className="relative h-[100dvh] w-full bg-black overflow-y-auto flex flex-col">
            {showExitConfirm && <ExitConfirmationModal />}

            {/* Background Image - Fixed & Clean */}
            <div className="absolute inset-0 z-0">
                <Image 
                    src="/images/grimoire-images/grimoire-background.jpeg" 
                    alt="Sanctuary of Knowledge" 
                    fill 
                    quality={100}
                    className="object-cover"
                    priority
                />
            </div>
            
            {/* Exit Button - Fixed Top Right - Resized 50% Smaller */}
            <button 
                onClick={() => setShowExitConfirm(true)}
                className="fixed top-4 right-4 z-50 transition-transform hover:scale-105 focus:outline-none"
            >
                <div className="relative w-8 h-8 md:w-10 md:h-10 drop-shadow-lg">
                    <Image
                        src="/images/grimoire-images/exit-grimoire-button.png"
                        alt="Close Grimoire"
                        fill
                        className="object-contain"
                    />
                </div>
            </button>

            {/* Main Content - Centered flex container similar to JournalEntryEditor */}
            {/* Added min-h-full to ensure it fills screen but allows scrolling if content pushes it */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-2 py-[10vh] md:px-8 md:py-[5vh] min-h-full">
                {loading ? (
                    <LoadingSpinner title="Retrieving the Ancient Tomes..." />
                ) : (
                    <>
                        {viewMode === 'COVER' && renderCover()}
                        {viewMode === 'TOC' && renderBookPage(renderTOC())}
                        {viewMode === 'SECTION' && renderBookPage(renderSection())}
                        {viewMode === 'THE_END' && renderTheEnd()}
                    </>
                )}
            </div>

            {/* Modals moved to root to avoid stacking context issues */}
            {!loading && viewMode === 'CUSTOMIZER' && (
                <GrimoireCustomizer 
                    current={customization} 
                    onSave={handleCustomizationSave} 
                    onClose={() => setViewMode('COVER')} 
                />
            )}

            {!loading && viewMode === 'CREATE_SPELL' && currentUserId && (
                <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center pointer-events-auto px-2 py-[10vh] md:px-8 md:py-[5vh]">
                    <div className="relative h-full w-full md:w-auto max-w-[90vh] aspect-[1529/2048]">
                        <CustomSpellWizard
                            userId={currentUserId}
                            onClose={() => {
                                playSound('PAGE_TURN');
                                setEditingSpell(null);
                                setViewMode('TOC');
                            }}
                            onComplete={(s) => {
                                // playSound('SAVE_SUCCESS'); // Handled by handleSpellCreated
                                handleSpellCreated(s);
                            }}
                            initialData={editingSpell || undefined}
                            onPlaySound={playSound}
                            fontFamily={customization.fontFamily}
                        />
                    </div>
                </div>
            )}

            {!loading && viewMode === 'CREATE_JOURNAL' && currentUserId && (
                <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center pointer-events-auto px-2 py-[10vh] md:px-8 md:py-[5vh]">
                    <div className="relative h-full w-full md:w-auto max-w-[90vh] aspect-[1529/2048]">
                        <JournalEntryEditor 
                            userId={currentUserId}
                            onClose={() => {
                                playSound('PAGE_TURN');
                                setEditingSpell(null);
                                setViewMode('TOC');
                            }}
                            onComplete={(s) => {
                                    playSound('SAVE_SUCCESS');
                                    handleSpellCreated(s);
                            }}
                            initialData={editingSpell || undefined}
                            onPlaySound={playSound}
                            fontFamily={customization.fontFamily}
                        />
                    </div>
                </div>
            )}

            {selectedSpell && <SpellDetailModal data={selectedSpell} onClose={() => setSelectedSpell(null)} onDelete={handleSpellDelete} />}
        </main>
    );
}