"use client";

import React from 'react';
import Link from 'next/link';
import { Eye, Brain, Lock, Activity } from 'lucide-react';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';

export default function PsychicTrainingPage() {
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
                    Psychic Training
                </h1>
            </div>
            <p className="text-center text-gray-300 mt-4 max-w-2xl mx-auto">
                Hone your extrasensory perception. Exercises designed to awaken the dormant faculties of the mind.
            </p>
        </header>

        {/* APPS GRID */}
        <div className="relative z-10 grow flex items-start justify-center pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4">
                
                {/* APP 1: THE GAZE */}
                <Link href="/the-magick-psychic-school/psychic-training/the-gaze" className="group relative bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:-translate-y-1">
                    <div className="h-48 w-full bg-linear-to-b from-gray-900 to-black relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1),transparent)] group-hover:opacity-100 transition-opacity opacity-50" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full border-2 border-cyan-500/50 flex items-center justify-center bg-black/50 group-hover:scale-110 transition-transform duration-500">
                                <Eye size={48} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                            </div>
                            <div className="absolute -bottom-4 w-32 h-1 bg-cyan-500/50 blur-md rounded-full group-hover:w-40 transition-all duration-500"></div>
                        </div>
                    </div>
                    <div className="p-6">
                        <h2 className="text-2xl font-serif text-white mb-2 group-hover:text-purple-300 transition-colors">The Gaze</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Train your Scopaesthesia—the psychic ability to detect being stared at. A digital tool to sharpen your sensory awareness and gut instinct.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-cyan-500 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Active Training
                        </div>
                    </div>
                </Link>

                {/* APP 2: VERITAS */}
                <Link href="/the-magick-psychic-school/psychic-training/veritas" className="group relative bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden hover:border-cyan-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:-translate-y-1">
                    <div className="h-48 w-full bg-zinc-950 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                             <div className="w-full h-1 bg-cyan-500 rotate-12 blur-sm group-hover:rotate-0 transition-all duration-500"></div>
                             <div className="w-full h-1 bg-fuchsia-500 -rotate-12 blur-sm group-hover:rotate-0 transition-all duration-500"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-sm border-2 border-cyan-500/50 flex items-center justify-center bg-black/50 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                                <Activity size={48} className="text-cyan-400" />
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <h2 className="text-2xl font-serif text-white mb-2 group-hover:text-cyan-300 transition-colors">Veritas</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            The Intuition Polygraph. Train your subconscious to detect truth versus deception through energetic sensitivity, not logic.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-cyan-500 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Active Training
                        </div>
                    </div>
                </Link>

                {/* APP 3: REMOTE VIEWING (Placeholder) */}
                <div className="group relative bg-black/20 border border-gray-800 rounded-xl overflow-hidden opacity-70 grayscale cursor-not-allowed">
                    <div className="h-48 w-full bg-gray-900 relative flex items-center justify-center">
                        <Brain size={64} className="text-gray-700" />
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)] opacity-20"></div>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-serif text-gray-500 mb-2">Remote Viewing</h2>
                            <Lock size={16} className="text-gray-600 mt-1" />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Project your consciousness to distant coordinates. Coordinate Remote Viewing (CRV) training protocols coming soon.
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