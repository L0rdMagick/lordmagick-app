// src/app/oracle-room/tarot-reading/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import { Uncial_Antiqua } from 'next/font/google';

const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'] });

const readers = [
  {
    name: "Ambrose",
    title: "The Scholar of Light",
    href: "/oracle-room/tarot-reading/ambrose",
    imageSrc: "https://images.squarespace-cdn.com/content/662b53c5379e5a412f214a15/ce4dd7e2-a21c-47e9-a2f3-ae98693f0da4/A_front-facing_portrait_of_an_attractive%2C_charisma.jpg?content-type=image%2Fjpeg",
    description: "Seek guidance on matters of destiny, purpose, and the grand tapestry of your life's journey.",
    glowColor: "group-hover:[--glow-color:theme(colors.amber.400)]"
  },
  {
    name: "Natalia",
    title: "The Whisper of Shadows",
    href: "/oracle-room/tarot-reading/natalia",
    imageSrc: "https://images.squarespace-cdn.com/content/63ff45f58b2ecb2de4ae9935/56fb4457-d689-43cc-95f8-08c15cc34c4b/Sage+the+Tarot+Reader.jpg?content-type=image%2Fjpeg",
    description: "Explore the hidden currents of the heart, the mysteries of relationships, and the shadows within.",
    glowColor: "group-hover:[--glow-color:theme(colors.purple.400)]"
  }
];

export default function TarotReadingLandingPage() {
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center text-white">
        <header className="mb-12">
          <h1 className={`text-5xl md:text-6xl text-cyan-300 ${uncialAntiqua.className}`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Choose Your Oracle
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-300">
            Two paths diverge in the mists of fate. Select the guide whose energy resonates with your query.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 w-full max-w-4xl">
          {readers.map((reader) => (
            <Link 
              key={reader.name} 
              href={reader.href}
              className={`group block p-6 bg-black/40 rounded-xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-500/80 hover:scale-105 hover:bg-black/60 ${reader.glowColor}`}
              style={{ '--glow-color': 'transparent', boxShadow: '0 0 35px -5px var(--glow-color)' } as React.CSSProperties}
            >
              <div className="relative w-full h-80 mb-4 overflow-hidden rounded-lg">
                <Image 
                  src={reader.imageSrc} 
                  alt={`Image of ${reader.name}`} 
                  fill 
                  style={{ objectFit: 'cover', objectPosition: 'center' }} 
                  className="transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h2 className={`text-3xl text-white ${uncialAntiqua.className}`}>{reader.name}</h2>
              <p className="text-sm text-gray-400 mb-2">{reader.title}</p>
              <p className="text-gray-300">{reader.description}</p>
            </Link>
          ))}
        </div>
        
        <div className="mt-16">
            <Link href="/oracle-room" className="text-gray-300 hover:text-amber-300 transition-colors" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
              &larr; Return to the Oracle Room
            </Link>
        </div>
      </div>
    </main>
  );
}