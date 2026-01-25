"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getSpells } from '@/lib/services/geminiService';
import type { Spell } from '@/lib/types';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Calendar, X, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
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
    
    const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Load Data
    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                try {
                    const data = await getSpells(user.id);
                    setSpells(data);
                } catch (e) {
                    console.error("Failed to load Grimoire", e);
                }
            }
            setLoading(false);
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

        // Convert to array and sort (maybe alphabetically or by fixed order)
        // Let's sort alphabetically for now
        return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
    }, [spells]);

    const activeSection = sections.find(s => s.id === activeSectionId);
    
    // Pagination Logic
    const itemsPerPage = 6;
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
                    // End of book? Cycle back to TOC or stay?
                    // User said "go to next page... continue on to the next section"
                    // If last page of last section, maybe go back to cover or stay? 
                    // Let's go back to TOC for closure
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
            <div className="relative h-full w-auto aspect-[1433/1909] shadow-2xl animate-in fade-in duration-700 max-w-full">
                <Image 
                    src="/images/grimoire-images/grimoire-cover.png" 
                    alt="Grimoire Cover" 
                    fill 
                    className="object-contain"
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

    const renderBookPage = (content: React.ReactNode) => (
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

                {/* 
                    Content Area 
                    Source: 1529x2048
                    Area: 1105x1697 at (253, 176)
                    
                    Left: 253/1529 = 16.55%
                    Top: 176/2048 = 8.59%
                    Width: 1105/1529 = 72.27%
                    Height: 1697/2048 = 82.86%
                */}
                <div 
                    className="absolute flex flex-col overflow-hidden"
                    style={{
                        left: '16.55%',
                        top: '8.59%',
                        width: '72.27%',
                        height: '82.86%'
                    }}
                >
                   {content}
                </div>

                {/* Navigation - Placed inside margins to prevent cutoff */}
                <button 
                    onClick={handlePrev}
                    className="absolute left-[2%] top-1/2 -translate-y-1/2 z-20 p-2 text-[#5c4033] hover:text-[#8b4513] hover:scale-110 transition-all opacity-60 hover:opacity-100 disabled:opacity-0 drop-shadow-md"
                    disabled={viewMode === 'COVER'}
                >
                    <ArrowLeft size={32} className="md:w-12 md:h-12" strokeWidth={1.5} />
                </button>
                <button 
                    onClick={handleNext}
                    className="absolute right-[2%] top-1/2 -translate-y-1/2 z-20 p-2 text-[#5c4033] hover:text-[#8b4513] hover:scale-110 transition-all opacity-60 hover:opacity-100 drop-shadow-md"
                >
                    <ArrowRight size={32} className="md:w-12 md:h-12" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );

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
             <header className="flex justify-between items-end border-b border-[#8b4513]/20 pb-2 mb-4 shrink-0">
                <div>
                    <h2 className="text-[2.5vh] leading-none font-serif text-[#5c4033]" style={{ fontFamily: 'Cinzel, serif' }}>{activeSection?.title}</h2>
                    <p className="text-[1.2vh] font-mono text-[#8b4513]/60 uppercase tracking-widest mt-1">Page {currentPage} of {totalPages}</p>
                </div>
                <button onClick={() => setViewMode('TOC')} className="text-[1.5vh] font-serif underline hover:text-[#8b4513] text-[#5c4033]/70">
                    Return to Index
                </button>
            </header>

            {/* Grid expands to fill available space, respecting card ratios */}
            <div className="flex-grow grid grid-cols-2 grid-rows-3 gap-2 md:gap-4 w-full min-h-0">
                {/* Always render 6 slots, empty ones invoke no action */}
                {Array.from({ length: 6 }).map((_, idx) => {
                    const spell = currentSpells[idx]; // May be undefined
                    const cardImage = `/images/grimoire-images/spell-card-${idx + 1}.png`; // 1 to 6

                    return (
                        <div key={idx} className="relative w-full h-full flex items-center justify-center min-h-0">
                            {spell ? (
                                <button 
                                    onClick={() => setSelectedSpell(spell)}
                                    className="relative h-full w-auto aspect-[2/3] hover:scale-105 transition-transform duration-300"
                                >
                                    <div className="relative w-full h-full">
                                        <Image 
                                            src={cardImage} 
                                            alt={spell.name} 
                                            fill 
                                            className="object-contain drop-shadow-md"
                                            sizes="15vw"
                                        />
                                        
                                        {/* Content Overlay on Card */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center opacity-0 hover:opacity-100 transition-opacity bg-black/60 text-white rounded-lg backdrop-blur-[2px]">
                                            <h3 className="font-serif font-bold text-[1.5vh] mb-1 leading-tight">{spell.name}</h3>
                                            <p className="text-[1vh] line-clamp-3 italic">"{spell.intention}"</p>
                                        </div>
                                    </div>
                                    
                                    {/* Small label below card */}
                                    <div className="absolute -bottom-4 left-0 right-0 text-center text-[#5c4033] text-[1.2vh] font-serif font-bold truncate opacity-80">
                                        {spell.name}
                                    </div>
                                </button>
                            ) : (
                                <div className="h-full w-auto aspect-[2/3] opacity-20 border border-[#8b4513]/20 rounded-md" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // --- MODAL (Adapted) ---
    const SpellDetailModal = ({ spell, onClose }: { spell: Spell, onClose: () => void }) => {
        const { replayUrl } = getSpellMetadata(spell);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                <div className="relative bg-[#0f0a1e] border border-amber-900/50 w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col"
                     style={{ backgroundImage: "url('/images/grimoire-images/grimoire-page.png')", backgroundSize: 'cover' }}
                >
                    {/* Dark overlay to make text readable on the page texture */}
                    <div className="absolute inset-0 bg-[#0f0a1e]/90" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                         {/* Header */}
                        <div className="sticky top-0 bg-[#0f0a1e]/95 border-b border-white/10 p-6 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-serif text-amber-100">{spell.name}</h2>
                                <div className="flex items-center gap-4 mt-2 text-xs font-mono text-gray-400">
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(spell.created_at).toLocaleDateString()}</span>
                                    <span className="uppercase border border-gray-700 px-2 rounded text-amber-500">{spell.element || 'Universal'}</span>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} className="text-amber-500" /></button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6 font-serif text-gray-300 overflow-y-auto">
                            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/5">
                                <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest mb-3">Intention</h3>
                                <p className="text-lg italic text-white leading-relaxed">"{spell.intention}"</p>
                            </div>

                            {spell.incantation && (
                                <div>
                                    <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-1">Incantation</h3>
                                    <div className="whitespace-pre-wrap leading-loose text-amber-50/90 pl-4 border-l-2 border-amber-900/50">
                                        {spell.incantation}
                                    </div>
                                </div>
                            )}
                            
                            {spell.sigil_url && (
                                <div className="flex justify-center pt-4 border-t border-white/5">
                                    <div className="text-center">
                                        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Bound Sigil</h3>
                                        <div className="relative w-40 h-40 mx-auto">
                                            <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                                            <img src={spell.sigil_url} alt="Sigil" className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* REPLAY BUTTON */}
                            {replayUrl && (
                                <div className="pt-8 border-t border-white/10 flex justify-center">
                                    <Link 
                                        href={replayUrl}
                                        className="flex items-center gap-3 px-8 py-4 bg-amber-900/40 border border-amber-500/50 text-amber-100 rounded hover:bg-amber-800/60 hover:border-amber-400 transition-all group w-full justify-center"
                                    >
                                        <RotateCcw className="group-hover:-rotate-180 transition-transform duration-500" size={20} />
                                        <div className="text-left">
                                            <div className="font-serif font-bold tracking-wide uppercase text-sm">Perform Ritual Again</div>
                                        </div>
                                        <ArrowRight size={16} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            )}
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
                {/* No overlay to prevent blur/darkening */}
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

            {selectedSpell && <SpellDetailModal spell={selectedSpell} onClose={() => setSelectedSpell(null)} />}
        </main>
    );
}