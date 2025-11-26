// --- START OF FILE src/app/marketplace/magickal-tools/page.tsx ---
"use client";

import React from 'react';
import Link from 'next/link';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';

export default function MagickalToolsPage() {
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <header className="relative z-20 w-full p-4 md:p-6 shrink-0">
        <div className="flex justify-between items-center flex-wrap w-full max-w-7xl mx-auto">
          <div className="order-1">
            <MagickalBackLink href="/marketplace" text="Marketplace" />
          </div>
          <div className="order-2 md:order-3">
            <RoomsButton />
          </div>
          <h1 className="w-full text-center order-3 md:w-auto md:order-2 text-4xl md:text-5xl font-serif text-amber-300 mt-2 md:mt-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Magickal Tools
          </h1>
        </div>
      </header>

      <div className="relative z-10 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
        
        {/* Electro Magickal Wand */}
        <Link href="/marketplace/magickal-tools/electro-magickal-wands" className="group flex flex-col items-center">
            <div className="relative w-full max-w-[300px] aspect-square rounded-xl overflow-hidden border-2 border-purple-500/30 group-hover:border-purple-400 transition-colors shadow-lg shadow-purple-900/20">
                <div className="absolute inset-0 bg-linear-to-br from-gray-900 to-black flex items-center justify-center">
                    <div className="w-2 h-3/4 bg-linear-to-b from-purple-400 to-amber-700 rounded-full shadow-[0_0_20px_#a855f7]"></div>
                    <div className="absolute top-1/4 w-12 h-12 bg-purple-500/20 rounded-full blur-md animate-pulse"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-full bg-black/60 p-2 text-center backdrop-blur-sm">
                    <span className="text-purple-300 text-xs font-mono tracking-widest">INTERACTIVE</span>
                </div>
            </div>
            <h2 className="mt-6 text-2xl font-serif text-purple-200 group-hover:text-white transition-colors">Electro Magickal Wand</h2>
            <p className="text-sm text-gray-400 mt-2 text-center max-w-xs">A digital conduit for focusing intention. Customizable core, wood, and resonance.</p>
        </Link>

        {/* Coming Soon Placeholder */}
        <div className="group flex flex-col items-center opacity-50 grayscale cursor-not-allowed">
            <div className="relative w-full max-w-[300px] aspect-square border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center bg-black/30">
                <span className="text-gray-500 font-serif text-xl">Coming Soon</span>
            </div>
            <h2 className="mt-6 text-2xl font-serif text-gray-600">Scrying Mirrors</h2>
        </div>

      </div>
    </main>
  );
}