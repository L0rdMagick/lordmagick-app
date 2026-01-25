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
            <div className="relative h-full w-auto aspect-[1433/1909] shadow-2xl animate-in zoom-in-95 duration-500 max-w-full">
                <Image 
                    src="/images/grimoire-images/grimoire-page.png" 
                    alt="Grimoire Page" 
                    fill 
                    className="object-fill"
                    priority
                    sizes="(max-height: 100vh) 100vw, 50vw"
                />

                {/* Content Area */}
                <div className="absolute inset-[10%] flex flex-col overflow-hidden">
                   {content}
                </div>

                {/* Navigation */}
                <button 
                    onClick={handlePrev}
                    className="absolute -left-12 md:-left-16 top-1/2 -translate-y-1/2 z-20 p-2 text-[#d4af37] hover:text-[#fff] hover:scale-110 transition-all opacity-70 hover:opacity-100 disabled:opacity-0 drop-shadow-md"
                    disabled={viewMode === 'COVER'}
                >
                    <ArrowLeft size={40} className="md:w-16 md:h-16" strokeWidth={1.5} />
                </button>
                <button 
                    onClick={handleNext}
                    className="absolute -right-12 md:-right-16 top-1/2 -translate-y-1/2 z-20 p-2 text-[#d4af37] hover:text-[#fff] hover:scale-110 transition-all opacity-70 hover:opacity-100 drop-shadow-md"
                >
                    <ArrowRight size={40} className="md:w-16 md:h-16" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );

    // ... (renderTOC and renderSection remain mostly the same, ensuring they fill flex parents)

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