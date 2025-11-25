// --- START OF FILE src/app/spell-room/love-spells-app/page.tsx ---
"use client";

import Link from 'next/link';
import Image from 'next/image';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';

export default function LoveSpellsPage() {
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/spell-room/spell-room-background.png')" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <header className="relative z-20 w-full p-4 md:p-6 shrink-0">
        <div className="flex justify-between items-center flex-wrap w-full max-w-7xl mx-auto">
          <div className="order-1">
            <MagickalBackLink href="/spell-room" text="All Traditions" />
          </div>
          <div className="order-2 md:order-3">
            <RoomsButton />
          </div>
          <h1 className="w-full text-center order-3 md:w-auto md:order-2 text-4xl md:text-5xl font-serif text-pink-300 mt-2 md:mt-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Love Magick
          </h1>
        </div>
      </header>

      <div className="relative z-10 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
        
        {/* Soul Connect Spell Button */}
        <Link href="/spell-room/love-spells-app/soul-connect-love-spell" className="group flex flex-col items-center">
            <div className="relative w-full max-w-[300px] aspect-3/4 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-2 filter drop-shadow-2xl">
                <Image 
                    src="/images/spell-room/soul-connect-love-spell.png" 
                    alt="Soul Connect Love Spell"
                    fill
                    className="object-contain"
                />
            </div>
            <h2 className="mt-6 text-2xl font-serif text-amber-100 group-hover:text-pink-300 transition-colors">Soul Connect Spell</h2>
            <p className="text-sm text-gray-400 mt-2 text-center max-w-xs">A honey jar ritual to sweeten connection and bind hearts.</p>
        </Link>

        {/* Placeholder for future spells */}
        <div className="group flex flex-col items-center opacity-50 grayscale">
            <div className="relative w-full max-w-[300px] aspect-3/4 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center bg-black/30">
                <span className="text-gray-500 font-serif text-xl">Coming Soon</span>
            </div>
            <h2 className="mt-6 text-2xl font-serif text-gray-600">Passion Igniter</h2>
        </div>

      </div>
    </main>
  );
}