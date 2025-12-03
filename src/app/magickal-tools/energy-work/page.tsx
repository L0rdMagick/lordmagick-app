"use client";

import React from 'react';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';
import { Zap, Activity, Sun } from 'lucide-react';

export default function EnergyWorkPage() {
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <header className="relative z-20 w-full p-4 md:p-6 shrink-0">
        <div className="flex justify-between items-center flex-wrap w-full max-w-7xl mx-auto">
          <div className="order-1">
            <MagickalBackLink href="/magickal-tools" text="Magickal Tools" />
          </div>
          <div className="order-2 md:order-3">
            <RoomsButton />
          </div>
          <h1 className="w-full text-center order-3 md:w-auto md:order-2 text-4xl md:text-5xl font-serif text-cyan-300 mt-2 md:mt-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Energy Work
          </h1>
        </div>
      </header>

      <div className="relative z-10 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto text-center">
         {/* Placeholder Apps */}
         <div className="group relative bg-black/40 border border-cyan-500/30 rounded-xl p-8 flex flex-col items-center hover:border-cyan-400 transition-colors cursor-not-allowed opacity-70 grayscale">
            <Zap size={48} className="text-cyan-500 mb-4" />
            <h2 className="text-2xl font-serif text-gray-300">Auric Cleanse</h2>
            <p className="text-gray-500 text-sm mt-2">Digital frequency sweep to clear stagnant energy.</p>
            <span className="mt-4 text-xs border border-gray-700 px-2 py-1 rounded">Coming Soon</span>
         </div>

         <div className="group relative bg-black/40 border border-cyan-500/30 rounded-xl p-8 flex flex-col items-center hover:border-cyan-400 transition-colors cursor-not-allowed opacity-70 grayscale">
            <Activity size={48} className="text-cyan-500 mb-4" />
            <h2 className="text-2xl font-serif text-gray-300">Focus Alignment</h2>
            <p className="text-gray-500 text-sm mt-2">Binaural beats for deep concentration.</p>
            <span className="mt-4 text-xs border border-gray-700 px-2 py-1 rounded">Coming Soon</span>
         </div>

         <div className="group relative bg-black/40 border border-cyan-500/30 rounded-xl p-8 flex flex-col items-center hover:border-cyan-400 transition-colors cursor-not-allowed opacity-70 grayscale">
            <Sun size={48} className="text-cyan-500 mb-4" />
            <h2 className="text-2xl font-serif text-gray-300">Solar Charge</h2>
            <p className="text-gray-500 text-sm mt-2">Visual meditation to increase vitality.</p>
            <span className="mt-4 text-xs border border-gray-700 px-2 py-1 rounded">Coming Soon</span>
         </div>
      </div>
    </main>
  );
}