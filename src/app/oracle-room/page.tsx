// src/app/oracle-room/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import { Uncial_Antiqua } from 'next/font/google';

const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'] });

export default function OracleRoomPage() {
  return (
    <main 
      className="relative min-h-screen w-full bg-black bg-cover bg-center p-8 flex items-center justify-center" 
      style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center text-center text-white max-w-4xl mx-auto">
        
        <header className="mb-12">
          <h1 className={`text-5xl md:text-6xl text-cyan-300 ${uncialAntiqua.className}`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            The Oracle's Chamber
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-300">
            Here, the veils between worlds are thin. Gaze into the mists and choose your method of divination.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
          {/* Portal to Tarot Reading */}
          <Link
            href="/oracle-room/tarot-reading"
            // THE FIX: Updated to canonical CSS variable for glow color
            className="group block p-6 bg-black/40 rounded-xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/80 hover:scale-105 hover:bg-black/60 hover:[--glow-color:var(--color-cyan-400)]"
            style={{ '--glow-color': 'transparent', boxShadow: '0 0 45px -10px var(--glow-color)' } as React.CSSProperties}
          >
            <div className="relative w-full h-64 mb-4 overflow-hidden rounded-lg">
              <Image
                src="/images/portal-oracle.png"
                alt="Portal to Tarot Reading"
                fill
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <h2 className={`text-3xl text-white ${uncialAntiqua.className}`}>AI Tarot Reading</h2>
            <p className="text-gray-300 mt-2">
              Consult the digital ether and receive guidance from our resident oracles.
            </p>
          </Link>

          {/* NEW: Portal to Human Design */}
          <a
            href="https://humandesign.lordmagick.com/"
            target="_blank"
            rel="noopener noreferrer"
            // THE FIX: Updated to canonical CSS variable for glow color
            className="group block p-6 bg-black/40 rounded-xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:border-purple-400/80 hover:scale-105 hover:bg-black/60 hover:[--glow-color:var(--color-purple-400)]"
            style={{ '--glow-color': 'transparent', boxShadow: '0 0 45px -10px var(--glow-color)' } as React.CSSProperties}
          >
            <div className="relative w-full h-64 mb-4 overflow-hidden rounded-lg">
              <Image
                src="/images/portal-spell.png" 
                alt="Portal to Human Design Analysis"
                fill
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <h2 className={`text-3xl text-white ${uncialAntiqua.className}`}>Human Design Analysis</h2>
            <p className="text-gray-300 mt-2">
              Generate a personalized report to understand your unique energetic blueprint.
            </p>
          </a>
        </div>
        
      </div>
    </main>
  );
}