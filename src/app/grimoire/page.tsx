"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getSpells } from '@/lib/services/geminiService';
import type { Spell } from '@/lib/types';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Calendar, X, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
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
        sectionTitle = 'Servitors of the Wild Unknown';
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

                    {/* Content Area */}
                    <div 
                        className="absolute flex flex-col overflow-hidden"
                        style={{
                            left: '16.55%',
                            top: '8.59%',
                            width: '72.27%',
                            height: '82.86%'
                        }}
                    >


                       {/* Actual Content */}
                       <div className="relative z-10 w-full h-full flex flex-col">
                           {content}
                       </div>
                    </div>

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
        <div className="flex flex-col h-full text-[#3e2c22] p-4">
            <header className="text-center border-b-2 border-[#8b4513]/30 pb-4 mb-4 shrink-0">
                <h2 className="text-[3vh] font-serif text-[#5c4033] mb-1" style={{ fontFamily: 'Cinzel, serif' }}>Table of Contents</h2>
                <div className="text-[1.5vh] italic font-serif text-[#8b4513]/60">Index of Workings</div>
            </header>
            
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
            
            <div className="mt-auto pt-4 text-center shrink-0">
                 <p className="text-[1.2vh] font-serif italic text-[#8b4513]/40">Select a chapter to begin...</p>
            </div>
        </div>
    );

    const renderSection = () => (
        <div className="flex flex-col h-full w-full">
             <header className="flex justify-between items-end border-b border-[#8b4513]/20 pb-1 mb-2 shrink-0">
                <div>
                    <h2 className="text-[2.5vh] leading-none font-serif text-[#5c4033]" style={{ fontFamily: 'Cinzel, serif' }}>{activeSection?.title}</h2>
                    <p className="text-[1.2vh] font-mono text-[#8b4513]/60 uppercase tracking-widest mt-1">Page {currentPage} of {totalPages}</p>
                </div>
                <button onClick={() => setViewMode('TOC')} className="text-[1.5vh] font-serif underline hover:text-[#8b4513] text-[#5c4033]/70">
                    Return to Index
                </button>
            </header>

            {/* Grid expands to fill available space. 1 column, 2 rows. Maximize cards. */}
            <div className="flex-grow grid grid-cols-1 grid-rows-2 gap-[2vh] w-full h-full justify-items-center items-center overflow-hidden">
                {Array.from({ length: 2 }).map((_, idx) => {
                    const spell = currentSpells[idx]; 
                    // Cycle images 1-6
                    const imageIndex = ((pageOffset * itemsPerPage + idx) % 6) + 1;
                    const cardImage = `/images/grimoire-images/spell-card-${imageIndex}.png`;

                    return (
                        <div key={idx} className="relative w-full h-full flex items-center justify-center">
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
                                            className="absolute flex flex-col items-center justify-center text-center p-2 z-10 overflow-hidden"
                                            style={{
                                                left: '19.25%',
                                                top: '19.25%',
                                                width: '61.5%',
                                                height: '61.5%'
                                            }}
                                        >
                                            <h3 className="font-serif font-bold text-[2vh] md:text-[2.5vh] leading-snug text-[#3e2c22] drop-shadow-sm text-balance max-h-full overflow-hidden">
                                                {spell.name}
                                            </h3>
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
    );

    // --- ENLARGED CARD MODAL ---
    const SpellDetailModal = ({ data, onClose }: { data: { spell: Spell, image: string }, onClose: () => void }) => {
        const { spell, image } = data;
        const { replayUrl } = getSpellMetadata(spell);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                {/* 
                    Constraint: 
                    Mobile: 90% width (w-[90vw]).
                    Desktop: 80% height of available area (approx h-[80vh]).
                */}
                <div className="relative w-[90vw] md:w-auto md:h-[80vh] aspect-square shadow-2xl">
                    {/* Close Button Outside or Corner */}
                    <button 
                        onClick={onClose} 
                        className="absolute -top-12 md:-right-12 right-0 z-50 p-2 text-white/50 hover:text-white transition-colors"
                    >
                        <X size={32} />
                    </button>
                    
                    {/* Background Card Image */}
                    <Image 
                        src={image} 
                        alt={spell.name} 
                        fill 
                        className="object-contain drop-shadow-2xl" 
                    />
                    
                    {/* Content Area - Same Constraints as Small Card */}
                    <div 
                        className="absolute flex flex-col items-center text-center p-2 z-10 overflow-hidden"
                        style={{
                           left: '19.25%',
                           top: '19.25%',
                           width: '61.5%',
                           height: '61.5%'
                        }}
                    >
                        <div className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar scrollbar-thin scrollbar-thumb-[#5c4033]/50 pr-1">
                            <h2 className="font-serif font-bold text-2xl md:text-3xl lg:text-4xl mb-4 text-[#3e2c22] shrink-0">{spell.name}</h2>
                            
                            <p className="font-serif italic text-sm md:text-base lg:text-lg text-[#5c4033] mb-6 whitespace-pre-wrap shrink-0">
                                "{spell.intention}"
                            </p>
                            
                            {spell.incantation && (
                                 <div className="text-xs md:text-sm text-[#8b4513] mb-6 text-left w-full border-t border-[#8b4513]/20 pt-4 shrink-0 font-mono">
                                    {spell.incantation}
                                 </div>
                            )}

                            {/* Push button to bottom if space inside scroll view, or just at end */}
                            <div className="mt-auto pt-4 w-full shrink-0 sticky bottom-0 bg-transparent pb-1">
                                {replayUrl && (
                                    <Link 
                                        href={replayUrl}
                                        className="block w-full py-3 bg-[#5c4033] text-[#d4af37] border border-[#d4af37]/30 font-serif uppercase tracking-widest text-xs md:text-sm rounded hover:bg-[#3e2c22] transition-colors shadow-lg"
                                    >
                                        Open Ritual
                                    </Link>
                                )}
                            </div>
                        </div>
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

            {selectedSpell && <SpellDetailModal data={selectedSpell} onClose={() => setSelectedSpell(null)} />}
        </main>
    );
}