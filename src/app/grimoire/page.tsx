"use client";

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getSpells } from '@/lib/services/geminiService';
import type { Spell } from '@/lib/types';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Book, Calendar, Scroll, Search, X, RotateCcw, ArrowRight } from 'lucide-react'; // Added Icons
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GrimoirePage() {
    const [spells, setSpells] = useState<Spell[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
    const [filter, setFilter] = useState('');
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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

    const filteredSpells = spells.filter(s => 
        s.name.toLowerCase().includes(filter.toLowerCase()) || 
        s.intention.toLowerCase().includes(filter.toLowerCase())
    );

    // HELPER: Determine App URL based on Spell Data
    const getReplayUrl = (spell: Spell) => {
        // 1. Check Tradition
        if (spell.tradition === 'HOODOO' || spell.tradition === 'VOODOO') {
            return `/spell-room/hoodoo-rootwork-spells-app?loadId=${spell.id}`;
        }
        if (spell.tradition === 'WICCA') {
            return `/spell-room/wicca-magick-spells-app?loadId=${spell.id}`;
        }
        if (spell.tradition === 'CHAOS') {
            return `/spell-room/chaos-magick-spells-app?loadId=${spell.id}`;
        }
        if (spell.tradition === 'LOVE') {
            return `/spell-room/love-spells-app/soul-connect-love-spell?loadId=${spell.id}`;
        }
        
        // 2. Fallback for Electric Magick (checking name since tradition might be generic)
        if (spell.name.includes('Reality Breach')) {
            return `/spell-room/electric-magick-spells-app?spell=reality-patch&loadId=${spell.id}`;
        }
        if (spell.name.includes('Neural Link')) {
            return `/spell-room/electric-magick-spells-app?spell=neural-link&loadId=${spell.id}`;
        }
        
        return null; // Unknown type
    };

    const SpellDetailModal = ({ spell, onClose }: { spell: Spell, onClose: () => void }) => {
        const ritualData = typeof spell.ritual_data === 'string' ? JSON.parse(spell.ritual_data) : spell.ritual_data;
        const replayUrl = getReplayUrl(spell);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-[#0f0a1e] border border-amber-900/50 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl relative flex flex-col">
                    
                    {/* Header */}
                    <div className="sticky top-0 bg-[#0f0a1e] border-b border-white/10 p-6 flex justify-between items-start z-10">
                        <div>
                            <h2 className="text-2xl font-serif text-amber-100">{spell.name}</h2>
                            <div className="flex items-center gap-4 mt-2 text-xs font-mono text-gray-500">
                                <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(spell.created_at).toLocaleDateString()}</span>
                                <span className="uppercase border border-gray-700 px-2 rounded">{spell.element || 'Universal'}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8 font-serif text-gray-300">
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

                         {/* Ritual Data Display */}
                        {ritualData && (
                            <div className="space-y-6">
                                {/* Hoodoo/Voodoo Specifics */}
                                {ritualData.psalm && (
                                    <div>
                                        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Scripture</h3>
                                        <p className="text-sm italic">"{ritualData.psalm}"</p>
                                    </div>
                                )}
                                {ritualData.lwa && (
                                    <div>
                                        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Spirit Served</h3>
                                        <p className="text-sm font-bold text-purple-300">{ritualData.lwa}</p>
                                    </div>
                                )}
                                {ritualData.materia && Array.isArray(ritualData.materia) && (
                                    <div>
                                        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Ingredients Used</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {ritualData.materia.map((m: any, i: number) => (
                                                <div key={i} className="bg-black p-2 rounded border border-gray-800 text-sm">
                                                    <span className="text-amber-200">{m.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {spell.sigil_url && (
                            <div className="flex justify-center pt-4 border-t border-white/5">
                                <div className="text-center">
                                    <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Bound Sigil</h3>
                                    <div className="relative w-32 h-32 mx-auto">
                                        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                                        <img src={spell.sigil_url} alt="Sigil" className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* REPLAY BUTTON */}
                        {replayUrl && (
                            <div className="pt-8 border-t border-white/10 flex justify-center">
                                <Link 
                                    href={replayUrl}
                                    className="flex items-center gap-3 px-8 py-4 bg-amber-900/40 border border-amber-500/50 text-amber-100 rounded hover:bg-amber-800/60 hover:border-amber-400 transition-all group"
                                >
                                    <RotateCcw className="group-hover:-rotate-180 transition-transform duration-500" size={20} />
                                    <div className="text-left">
                                        <div className="font-serif font-bold tracking-wide uppercase text-sm">Perform Ritual Again</div>
                                        <div className="text-[10px] text-amber-400/70 font-mono">Use saved components • No Aether Cost</div>
                                    </div>
                                    <ArrowRight size={16} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-4 md:p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            
            <header className="relative z-20 w-full max-w-7xl mx-auto mb-8">
                <div className="flex justify-between items-center mb-6">
                    <MagickalBackLink href="/hall" text="Grand Hall" />
                    <RoomsButton />
                </div>
                <div className="text-center">
                    <h1 className="text-3xl md:text-5xl font-serif text-amber-200 tracking-wide text-shadow-lg">My Grimoire</h1>
                    <p className="text-gray-400 mt-2 font-mono text-xs uppercase tracking-widest">Archive of Workings & Manifestations</p>
                </div>
            </header>

            <div className="relative z-20 max-w-7xl mx-auto min-h-[500px]">
                {loading ? (
                    <LoadingSpinner title="Opening the Archives..." />
                ) : (
                    <>
                        <div className="mb-8 flex justify-center">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search spells by name or intent..." 
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
                                />
                            </div>
                        </div>

                        {filteredSpells.length === 0 ? (
                            <div className="text-center text-gray-500 py-20 flex flex-col items-center">
                                <Book size={48} className="mb-4 opacity-20" />
                                <p>No spells found in your Grimoire.</p>
                                <p className="text-xs mt-2">Visit the Spell Room to begin your work.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredSpells.map(spell => (
                                    <div 
                                        key={spell.id}
                                        onClick={() => setSelectedSpell(spell)}
                                        className="group bg-[#0a0a0a] border border-gray-800 hover:border-amber-500/50 rounded-lg p-6 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(251,191,36,0.1)] hover:-translate-y-1 flex flex-col h-full"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-white/5 rounded-full text-amber-500 group-hover:text-amber-200 transition-colors">
                                                <Scroll size={20} />
                                            </div>
                                            <span className="text-[10px] font-mono text-gray-600 border border-gray-800 px-2 py-1 rounded group-hover:border-gray-600">
                                                {new Date(spell.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-xl font-serif text-gray-200 group-hover:text-white mb-2 line-clamp-1">{spell.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 grow italic">"{spell.intention}"</p>
                                        
                                        <div className="mt-auto pt-4 border-t border-gray-900 flex justify-between items-center text-xs">
                                            <span className="text-purple-400 font-medium">{spell.element || 'Spirit'}</span>
                                            <span className="text-gray-600 uppercase tracking-wider group-hover:text-amber-500/80 transition-colors">Open Entry &rarr;</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedSpell && <SpellDetailModal spell={selectedSpell} onClose={() => setSelectedSpell(null)} />}
        </main>
    );
}