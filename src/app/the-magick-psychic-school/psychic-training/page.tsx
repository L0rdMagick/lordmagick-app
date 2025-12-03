"use client";

import React from 'react';
import Link from 'next/link';
import { Eye, Brain, Lock, Activity, DoorOpen, Heart, Crosshair, AudioWaveform, Zap } from 'lucide-react';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';

export default function PsychicTrainingPage() {
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8 flex flex-col" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        
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
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%]" />
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

                {/* APP 3: THE THRESHOLD */}
                <Link href="/the-magick-psychic-school/psychic-training/the-threshold" className="group relative bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden hover:border-yellow-600 transition-all duration-300 hover:shadow-[0_0_30px_rgba(202,138,4,0.2)] hover:-translate-y-1">
                    <div className="h-48 w-full bg-neutral-900 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(250,204,21,0.1),transparent)] opacity-50" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-32 h-40 bg-neutral-950 border-4 border-yellow-900/60 rounded-t-full relative flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-700">
                                <div className="absolute inset-0 border-r border-black/50 w-1/2 h-full"></div>
                                <div className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] opacity-30"></div>
                                <DoorOpen size={48} className="text-yellow-600/80 drop-shadow-[0_0_10px_rgba(202,138,4,0.5)]" />
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <h2 className="text-2xl font-serif text-white mb-2 group-hover:text-yellow-500 transition-colors">The Threshold</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Remote Viewing Trainer. Project your consciousness through barriers to perceive hidden targets. A foundational CRV exercise.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-yellow-600 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Active Training
                        </div>
                    </div>
                </Link>

                {/* APP 4: EMPATHY */}
                <Link href="/the-magick-psychic-school/psychic-training/empathy" className="group relative bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden hover:border-pink-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.2)] hover:-translate-y-1">
                    <div className="h-48 w-full bg-neutral-950 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.1),transparent)] group-hover:opacity-80 transition-opacity opacity-40" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full border-2 border-pink-500/50 flex items-center justify-center bg-black/50 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                                <Heart size={48} className="text-pink-500 drop-shadow-lg" />
                            </div>
                            <div className="absolute -bottom-6 w-32 h-1 bg-pink-500/50 blur-md rounded-full group-hover:w-40 transition-all duration-500"></div>
                        </div>
                    </div>
                    <div className="p-6">
                        <h2 className="text-2xl font-serif text-white mb-2 group-hover:text-pink-400 transition-colors">Empathy</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Emotional Resonance Trainer. Calibrate your ability to sense non-local emotional signatures through card-based intuition tests.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-pink-500 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Active Training
                        </div>
                    </div>
                </Link>

                {/* APP 5: PSI-HUNTER */}
                <Link href="/the-magick-psychic-school/psychic-training/psi-hunter" className="group relative bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden hover:border-green-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:-translate-y-1">
                    <div className="h-48 w-full bg-slate-950 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 flex items-center justify-center bg-black/50 border-2 border-cyan-500/50 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-transform duration-500">
                                <Crosshair size={48} className="text-cyan-400 animate-pulse" />
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <h2 className="text-2xl font-serif text-white mb-2 group-hover:text-cyan-400 transition-colors">Psi-Hunter</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Intuition Defense System. Locate hidden threats using clairsentience in a logic-defying simulation.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-cyan-500 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Active Training
                        </div>
                    </div>
                </Link>
                
                {/* APP 6: SENSES */}
                <Link href="/the-magick-psychic-school/psychic-training/senses" className="group relative bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden hover:border-indigo-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:-translate-y-1">
                    <div className="h-48 w-full bg-neutral-950 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,#4f46e5_20px,#4f46e5_21px)]" />
                        <div className="relative z-10 flex flex-col items-center">
                             <div className="w-32 h-20 flex items-center justify-center gap-1">
                                 {[1,2,3,4,5].map(i => (
                                     <div key={i} className="w-3 bg-indigo-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 60 + 20}%`, animationDelay: `${i*0.1}s` }}></div>
                                 ))}
                             </div>
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <AudioWaveform size={48} className="text-white drop-shadow-lg" />
                             </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <h2 className="text-2xl font-serif text-white mb-2 group-hover:text-indigo-400 transition-colors">Senses</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Sensory ESP Trainer. Develop your ability to intuit smells, tastes, and textures of hidden objects through non-local perception.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-indigo-500 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Active Training
                        </div>
                    </div>
                </Link>
                
                {/* APP 7: THE STATISTICAL EYE */}
                <Link href="/the-magick-psychic-school/psychic-training/statistical-eye" className="group relative bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden hover:border-zinc-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,212,216,0.2)] hover:-translate-y-1">
                    <div className="h-48 w-full bg-neutral-950 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#ffffff,transparent)]" />
                        <div className="relative z-10 flex flex-col items-center">
                             <div className="w-24 h-32 bg-zinc-900 border-2 border-zinc-700 rounded-lg flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                 <div className="w-16 h-16 border-2 border-zinc-600 rounded-full flex items-center justify-center">
                                     <span className="text-2xl font-bold text-zinc-500">?</span>
                                 </div>
                             </div>
                             <Zap size={24} className="absolute top-2 -right-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                        </div>
                    </div>
                    <div className="p-6">
                        <h2 className="text-2xl font-serif text-white mb-2 group-hover:text-zinc-300 transition-colors">The Statistical Eye</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Classic Zener Card training. Measure your Psi ability against mathematical chance. Track your deviation from the mean.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Active Training
                        </div>
                    </div>
                </Link>

                {/* APP 8: PSI-TRAINER */}
                <Link href="/the-magick-psychic-school/psychic-training/psi-trainer" className="group relative bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden hover:border-indigo-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(129,140,248,0.2)] hover:-translate-y-1">
                    <div className="h-48 w-full bg-slate-950 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[conic-gradient(at_bottom_left,var(--tw-gradient-stops))] from-slate-900 via-indigo-900 to-slate-900 opacity-50" />
                        <div className="relative z-10 flex flex-col items-center">
                             <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-110 transition-transform duration-500">
                                 <Brain size={48} className="text-indigo-400 drop-shadow-lg" />
                             </div>
                             <div className="absolute -top-2 right-10 w-4 h-4 bg-yellow-400 rounded-full animate-bounce shadow-[0_0_10px_#facc15]"></div>
                        </div>
                    </div>
                    <div className="p-6">
                        <h2 className="text-2xl font-serif text-white mb-2 group-hover:text-indigo-300 transition-colors">Psi-Trainer</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Dual-Mode Intuition Training. Detect threats (The Devil) or sense safety (The Angel) to calibrate your gut instinct for danger and trust.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Active Training
                        </div>
                    </div>
                </Link>

                {/* APP 9: REMOTE VIEWING (Placeholder) */}
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
                             Project your consciousness to specific coordinate sets. Coordinate Remote Viewing (CRV) protocols coming soon.
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