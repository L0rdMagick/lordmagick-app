"use client";

import React from 'react';
import Link from 'next/link';
import { Orbit, Sparkles, Zap } from 'lucide-react';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';

export default function MagickTrainingPage() {
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8 flex flex-col" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        
        {/* HEADER */}
        <header className="relative z-20 mb-10 w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center flex-wrap w-full">
                <div className="order-1">
                    <MagickalBackLink href="/the-magick-psychic-school" text="The School" />
                </div>
                <div className="order-2 md:order-3">
                    <RoomsButton />
                </div>
                <h1 className="w-full text-center order-3 md:w-auto md:order-2 text-3xl md:text-5xl font-serif text-amber-300 mt-4 md:mt-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    Magick Training
                </h1>
            </div>
            <p className="text-center text-gray-300 mt-4 max-w-2xl mx-auto">
                Master the arts of manifestation and ritual. Tools designed to focus the will and shape reality.
            </p>
        </header>

        {/* APPS GRID */}
        <div className="relative z-10 grow flex items-start justify-center pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4">
                
                {/* APP 1: AETHER */}
                <Link href="/the-magick-psychic-school/magick-training/aether" className="group relative bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden hover:border-amber-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:-translate-y-1">
                    <div className="h-48 w-full bg-[#0f0f1a] relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent)] group-hover:opacity-100 transition-opacity opacity-60" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full border-2 border-amber-500/50 flex items-center justify-center bg-black/50 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                <Orbit size={48} className="text-purple-400 group-hover:text-amber-300 transition-colors" />
                            </div>
                            <div className="absolute -bottom-6 w-40 h-1 bg-purple-500/50 blur-md rounded-full"></div>
                        </div>
                    </div>
                    <div className="p-6">
                        <h2 className="text-2xl font-serif text-white mb-2 group-hover:text-amber-300 transition-colors">Aether</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            The Manifestation Engine. A quantum entropy generator designed to test the power of your Will against mathematical probability.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            Active Protocol
                        </div>
                    </div>
                </Link>

                {/* APP 2: ELEMENTAL ALIGNMENT (Placeholder) */}
                <div className="group relative bg-black/20 border border-gray-800 rounded-xl overflow-hidden opacity-70 grayscale cursor-not-allowed">
                    <div className="h-48 w-full bg-gray-900 relative flex items-center justify-center">
                        <Flame size={64} className="text-gray-700" />
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)] opacity-20"></div>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-serif text-gray-500 mb-2">Elemental Alignment</h2>
                            <Sparkles size={16} className="text-gray-600 mt-1" />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Balance your internal energies with the four cardinal elements. Visualization and breathwork tools coming soon.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-gray-600 uppercase tracking-widest">
                            In Development
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </main>
  );
}