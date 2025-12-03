"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';

export default function MagickalToolsPage() {
  return (
    <main 
      className="relative min-h-screen w-full bg-black bg-cover bg-center p-4 md:p-8" 
      style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}
    >
      {/* Background Overlay - Blur removed */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* HEADER - Layout matched to School Page for symmetry */}
      <header className="relative z-20 w-full shrink-0">
        <div className="flex justify-between items-center flex-wrap w-full max-w-7xl mx-auto">
          <div className="order-1">
            <MagickalBackLink href="/hall" text="Grand Hall" />
          </div>
          <div className="order-2 md:order-3">
            <RoomsButton />
          </div>
          <h1 className="w-full text-center order-3 md:w-auto md:order-2 text-3xl md:text-5xl font-serif text-green-400 mt-2 md:mt-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Magickal Tools
          </h1>
        </div>
        <p className="relative z-20 text-center text-gray-200 mt-2 max-w-2xl mx-auto font-medium text-sm md:text-base" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}>
            Digital instruments of power. Consult the cards, wield the wand, and tune your energetic frequency.
        </p>
      </header>

      <div className="relative z-10 mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
        
        {/* Electro Magickal Wand */}
        <Link href="/magickal-tools/electro-magickal-wands" className="group flex flex-col items-center">
            <div className="relative w-full max-w-[300px] aspect-square rounded-xl overflow-hidden border-2 border-purple-500/30 group-hover:border-purple-400 transition-colors shadow-lg shadow-purple-900/20">
                <div className="absolute inset-0 bg-linear-to-br from-gray-900 to-black flex items-center justify-center">
                    <div className="w-2 h-3/4 bg-linear-to-b from-purple-400 to-amber-700 rounded-full shadow-[0_0_20px_#a855f7]"></div>
                    <div className="absolute top-1/4 w-12 h-12 bg-purple-500/20 rounded-full blur-md animate-pulse"></div>
                </div>
            </div>
            <h2 className="mt-6 text-2xl font-serif text-purple-200 group-hover:text-white transition-colors">Electro Magickal Wands</h2>
            <p className="text-sm text-gray-400 mt-2 text-center max-w-xs">A digital conduit for focusing intention.</p>
        </Link>

        {/* Tarot Decks */}
        <Link href="/magickal-tools/tarot-decks" className="group flex flex-col items-center">
            <div className="relative w-full max-w-[300px] aspect-square rounded-xl overflow-hidden border-2 border-amber-500/30 group-hover:border-amber-400 transition-colors shadow-lg shadow-amber-900/20">
                <div className="absolute inset-0 bg-black">
                    <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                         <div className="relative w-32 h-48 bg-neutral-900 border border-amber-500/50 rounded rotate-6 shadow-2xl group-hover:rotate-12 transition-transform duration-500"></div>
                         <div className="absolute w-32 h-48 bg-neutral-800 border border-amber-500/50 rounded -rotate-6 shadow-2xl group-hover:-rotate-12 transition-transform duration-500"></div>
                         <div className="absolute w-32 h-48 bg-[url('/images/marketplace/tarot-decks/cats-of-the-crown/cover.png')] bg-cover bg-center rounded border-2 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)] z-10 group-hover:scale-105 transition-transform duration-500"></div>
                    </div>
                </div>
            </div>
            <h2 className="mt-6 text-2xl font-serif text-amber-200 group-hover:text-white transition-colors">Tarot Decks</h2>
            <p className="text-sm text-gray-400 mt-2 text-center max-w-xs">Browse our collection of mystical decks.</p>
        </Link>

        {/* Energy Work */}
        <Link href="/magickal-tools/energy-work" className="group flex flex-col items-center">
            <div className="relative w-full max-w-[300px] aspect-square rounded-xl overflow-hidden border-2 border-cyan-500/30 group-hover:border-cyan-400 transition-colors shadow-lg shadow-cyan-900/20">
                 <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <div className="absolute inset-0 bg-linear-to-t from-cyan-900/20 to-transparent"></div>
                    <div className="w-32 h-32 rounded-full border-4 border-cyan-500/50 animate-[spin_10s_linear_infinite] group-hover:border-cyan-400 transition-colors"></div>
                    <div className="absolute w-24 h-24 rounded-full border-2 border-white/30 animate-[spin_15s_linear_infinite_reverse]"></div>
                    <div className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] animate-pulse"></div>
                 </div>
            </div>
            <h2 className="mt-6 text-2xl font-serif text-cyan-200 group-hover:text-white transition-colors">Energy Work</h2>
            <p className="text-sm text-gray-400 mt-2 text-center max-w-xs">Tools to focus, cleanse, and recharge.</p>
        </Link>

      </div>
    </main>
  );
}