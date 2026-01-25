"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getSpells, deleteSpell } from '@/lib/services/geminiService';
import type { Spell } from '@/lib/types';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Calendar, X, RotateCcw, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// --- TYPES ---
type ViewMode = 'COVER' | 'TOC' | 'SECTION';

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

// --- ASSETS & RANDOMIZATION ---




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
    if (spell.tradition === 'HOODOO' || spell.tradition === 'VOODOO' || nameLower.includes('hoodoo')) {
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


export default function GrimoirePage() {
    // --- STATE ---
    const [spells, setSpells] = useState<Spell[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    
    // Manifestation Book State
    const [viewMode, setViewMode] = useState<ViewMode>('COVER');
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [pageOffset, setPageOffset] = useState(0); // 0-indexed page within a section
    
    const [selectedSpell, setSelectedSpell] = useState<{ spell: Spell, image: string } | null>(null);

    const [supabase] = useState(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ));

    // Load Data
    useEffect(() => {
        const load = async () => {
            console.log("Grimoire: Starting loading process...");
            try {
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

    // Derived Data: Sections
    const sections = useMemo(() => {
        const map = new Map<string, SpellSection>();
        
        spells.forEach(spell => {
            const { sectionId, sectionTitle } = getSpellMetadata(spell);
            if (!map.has(sectionId)) {
                map.set(sectionId, { id: sectionId, title: sectionTitle, spells: [] });
            }
            map.get(sectionId)!.spells.push(spell);
        });

        return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
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
    
    const handleNext = () => {
        if (viewMode === 'COVER') {
            setViewMode('TOC');
        } else if (viewMode === 'TOC') {
            if (sections.length > 0) {
                setActiveSectionId(sections[0].id);
                setPageOffset(0);
                setViewMode('SECTION');
            }
        } else if (viewMode === 'SECTION') {
            // Check if more pages in this section
            if (currentPage < totalPages) {
                setPageOffset(prev => prev + 1);
            } else {
                // Determine next section
                const currentIndex = sections.findIndex(s => s.id === activeSectionId);
                if (currentIndex >= 0 && currentIndex < sections.length - 1) {
                    setActiveSectionId(sections[currentIndex + 1].id);
                    setPageOffset(0);
                } else {
                    setViewMode('TOC');
                    setActiveSectionId(null);
                }
            }
        }
    };

    const handlePrev = () => {
        if (viewMode === 'COVER') return;
        if (viewMode === 'TOC') {
            setViewMode('COVER');
        } else if (viewMode === 'SECTION') {
            if (pageOffset > 0) {
                setPageOffset(prev => prev - 1);
            } else {
                // Go to previous section's last page
                const currentIndex = sections.findIndex(s => s.id === activeSectionId);
                if (currentIndex > 0) {
                    const prevSection = sections[currentIndex - 1];
                    setActiveSectionId(prevSection.id);
                    const prevPages = Math.ceil(prevSection.spells.length / itemsPerPage);
                    setPageOffset(Math.max(0, prevPages - 1));
                } else {
                    setViewMode('TOC');
                    setActiveSectionId(null);
                }
            }
        }
    };

    const jumpToSection = (sectionId: string) => {
        setActiveSectionId(sectionId);
        setPageOffset(0);
        setViewMode('SECTION');
    };

    // --- RENDERERS ---

    // --- RENDERERS ---

    // Layout Constants (Calculated from 1529x2048)
    const HEADER_ZONE = {
        left: '25.11%',
        top: '11.18%', // 229px
        width: '57.75%',
        height: '11.12%', // 227.7px
    };

    const BODY_ZONE = {
        left: '25.11%',
        top: '22.30%',
        width: '57.75%',
        height: '60.30%',
    };

    const renderCover = () => (
        <div className="flex items-center justify-center h-full w-full">
            <div className="relative h-full w-auto aspect-[1529/2048] shadow-2xl animate-in fade-in duration-700 max-w-full">
                <Image 
                    src="/images/grimoire-images/grimoire-cover.png" 
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
                    <h1 className="text-[5vh] lg:text-[6vh] leading-tight font-serif text-[#d4af37] tracking-wider mb-[4vh] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: 'Cinzel, serif' }}>
                        Book of<br/>Magick
                    </h1>
                    <button 
                        onClick={() => setViewMode('TOC')}
                        className="px-6 py-[1.5vh] bg-black/60 border border-[#d4af37] text-[#d4af37] text-[2vh] font-serif uppercase tracking-widest hover:bg-[#d4af37] hover:text-black transition-all duration-300 backdrop-blur-sm whitespace-nowrap"
                    >
                        Open Book
                    </button>
                </div>
            </div>
        </div>
    );

    const renderBookPage = (content: React.ReactNode) => {
        // Hooks removed from here to prevent violation
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="relative h-full w-auto aspect-[1529/2048] shadow-2xl animate-in zoom-in-95 duration-500 max-w-full">
                    <Image 
                        src="/images/grimoire-images/grimoire-page.png" 
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
                    {viewMode !== 'COVER' && (
                        <button 
                            onClick={handlePrev}
                            className="absolute left-[2%] top-1/2 -translate-y-1/2 z-20 group transition-all duration-300 focus:outline-none"
                        >
                            <div className="p-2 rounded-full border-2 border-[#8b4513]/60 bg-[#1a120b]/80 text-[#8b4513] group-hover:text-[#d4af37] group-hover:border-[#d4af37] group-hover:bg-black/90 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all backdrop-blur-[2px]">
                                <ChevronLeft size={24} className="md:w-6 md:h-6" strokeWidth={2} />
                            </div>
                        </button>
                    )}
                    
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
            </div>
        );
    };

   const renderTOC = () => (
        <>
            {/* Header Zone */}
            <div className="absolute flex flex-col justify-center items-center text-center z-10" style={HEADER_ZONE}>
                 <header className="border-b-2 border-[#8b4513]/30 pb-2 w-full">
                    <h2 className="text-[3vh] font-serif text-[#5c4033] mb-1" style={{ fontFamily: 'Cinzel, serif' }}>Table of Contents</h2>
                    <div className="text-[1.5vh] italic font-serif text-[#8b4513]/60">Index of Workings</div>
                </header>
            </div>

            {/* Body Zone */}
            <div className="absolute z-10 overflow-hidden" style={BODY_ZONE}>
                <div className="flex flex-col h-full text-[#3e2c22] p-2">
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
                                    <span className="font-serif text-[2vh] group-hover:pl-2 transition-all font-bold text-[#5c4033]">
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
            <div className="absolute z-10 grid grid-cols-[3fr_1fr] items-start pt-2 px-4 overflow-hidden gap-2" style={HEADER_ZONE}>
                {/* Title & Page Number (75% Width Strict) */}
                <div className="flex flex-col items-start justify-start pr-2 h-full overflow-hidden">
                    <h2 
                        className={`w-full ${activeSection?.title && activeSection.title.length > 25 ? 'text-[1.6vh]' : 'text-[2vh]'} leading-[1.1] font-serif text-[#5c4033] mb-1 text-left break-words line-clamp-3`} 
                        style={{ fontFamily: 'Cinzel, serif' }}
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
                        onClick={() => setViewMode('TOC')} 
                        className="text-[1.6vh] font-serif font-bold text-[#3e2c22] underline decoration-[#8b4513]/40 underline-offset-4 hover:text-[#8b4513] transition-colors text-right leading-tight"
                    >
                        Return to Index
                    </button>
                </div>
            </div>

            {/* Body Zone */}
             <div className="absolute z-10" style={BODY_ZONE}>
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

                        return (
                            <div key={idx} className="relative w-full h-full flex items-center justify-center overflow-hidden">
                                {spell ? (
                                    <button 
                                        onClick={() => setSelectedSpell({ spell, image: cardImage })}
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
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <h3 className={`font-serif font-bold ${cardTitleSize} leading-tight text-[#3e2c22] drop-shadow-sm text-balance line-clamp-4`}>
                                                        {spell.name}
                                                    </h3>
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

    // --- ENLARGED CARD MODAL ---
    const SpellDetailModal = ({ data, onClose, onDelete }: { data: { spell: Spell, image: string }, onClose: () => void, onDelete: (id: string) => void }) => {
        const { spell, image } = data;
        const { replayUrl } = getSpellMetadata(spell);
        const [showConfirm, setShowConfirm] = useState(false);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                {/* 
                    Constraint: Dimensions match CUSTOM IMAGE (947/1681)
                    Sizing: Fit both 90vw (mobile) and 85vh (desktop) constraints while keeping aspect ratio.
                    This ensures the DIV exactly matches the size of the rendered image.
                */}
                <div 
                    className="relative shadow-2xl"
                    style={{
                        aspectRatio: '947/1681',
                        width: 'min(90vw, 85vh * 0.5633)' // 947/1681 approx 0.5633
                    }}
                >
                    {/* Close Button Outside or Corner */}
                    {!showConfirm && (
                        <>
                            <button 
                                onClick={onClose} 
                                className="absolute -top-12 -right-4 md:-right-12 z-50 p-2 text-white/50 hover:text-white transition-colors"
                            >
                                <X size={32} />
                            </button>
                             {/* Delete Button - Top Left - Matching Style */}
                             <button 
                                onClick={() => setShowConfirm(true)}
                                className="absolute -top-12 -left-4 md:-left-12 z-50 p-2 text-white/50 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={24} />
                            </button>
                        </>
                    )}
                    
                    {/* Background Card Image - CUSTOM */}
                    <Image 
                        src="/images/grimoire-images/detailed-spell-info.png"
                        alt={spell.name} 
                        fill 
                        className="object-cover rounded-sm" 
                    />
                    
                    {/* Content Area - Adjusted to fit strictly inside the parchment graphic */}
                    <div 
                        className="absolute flex flex-col items-center text-center z-10 overflow-hidden px-[5px]"
                        style={{
                           left: '22%',
                           top: '18%',
                           width: '63%',
                           height: '64%'
                        }}
                    >
                        {showConfirm ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
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
                            <div className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar scrollbar-thin scrollbar-thumb-[#5c4033]/50 p-2">
                                {/* Scaled Text for Detail View */}
                                <h2 className="font-serif font-bold text-[2.5vh] mb-4 text-[#3e2c22] shrink-0 leading-tight">{spell.name}</h2>
                                
                                {/* Intention - Using Medieval font now per user request for "esoteric" body */}
                                <p className="font-medieval italic text-[2vh] text-[#5c4033] mb-6 whitespace-pre-wrap shrink-0 leading-snug">
                                    "{spell.intention}"
                                </p>
                                
                                {spell.incantation && (
                                    <div className="font-medieval text-[1.8vh] text-[#8b4513] mb-6 text-center w-full border-t border-[#8b4513]/20 pt-4 shrink-0 font-medium leading-normal">
                                        {spell.incantation}
                                    </div>
                                )}

                                {/* Push button to bottom */}
                                <div className="mt-auto pt-2 w-full shrink-0 sticky bottom-0 bg-transparent pb-1">
                                    {replayUrl && (
                                        <Link 
                                            href={replayUrl}
                                            className="block w-full py-[1.5vh] bg-[#5c4033] text-[#d4af37] border border-[#d4af37]/30 font-serif uppercase tracking-widest text-[1.2vh] rounded hover:bg-[#3e2c22] transition-colors shadow-lg"
                                        >
                                            Open Ritual
                                        </Link>
                                    )}
                                </div>
                            </div>
                         )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <main className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
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
            
            {/* Header - Completely Transparent & Non-Intrusive */}
            <header className="relative z-20 w-full p-2 md:p-4 flex justify-between items-center bg-transparent flex-none">
                <MagickalBackLink href="/hall" text="Grand Hall" />
                <RoomsButton />
            </header>

            {/* Main Content - Flex-1 ensures it strictly fills remaining space without scrolling */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden">
                {loading ? (
                    <LoadingSpinner title="Retrieving the Ancient Tomes..." />
                ) : (
                    <>
                        {viewMode === 'COVER' && renderCover()}
                        {viewMode === 'TOC' && renderBookPage(renderTOC())}
                        {viewMode === 'SECTION' && renderBookPage(renderSection())}
                    </>
                )}
            </div>

            {selectedSpell && <SpellDetailModal data={selectedSpell} onClose={() => setSelectedSpell(null)} onDelete={handleSpellDelete} />}
        </main>
    );
}