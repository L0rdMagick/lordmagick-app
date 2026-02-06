"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Uncial_Antiqua } from 'next/font/google';
import RoomsButton from '../../components/RoomsButton';
import MagickalBackLink from '../../components/MagickalBackLink';

const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'] });

const readers = [
  {
    name: "Ambrose",
    slug: "ambrose",
    title: "The Scholar of Light",
    imageSrc: "https://images.squarespace-cdn.com/content/662b53c5379e5a412f214a15/ce4dd7e2-a21c-47e9-a2f3-ae98693f0da4/A_front-facing_portrait_of_an_attractive%2C_charisma.jpg?content-type=image%2Fjpeg",
    description: "Seek guidance on matters of destiny, purpose, and the grand tapestry of your life's journey.",
    glowColor: "group-hover:[--glow-color:theme(colors.amber.400)]",
    options: [
      { duration: 5, label: "5 Minute Reading" },
      { duration: 10, label: "10 Minute Reading" },
      { duration: 20, label: "20 Minute Reading" },
    ]
  },
  {
    name: "Natalia",
    slug: "natalia",
    title: "The Whisper of Shadows",
    imageSrc: "https://images.squarespace-cdn.com/content/63ff45f58b2ecb2de4ae9935/56fb4457-d689-43cc-95f8-08c15cc34c4b/Sage+the+Tarot+Reader.jpg?content-type=image%2Fjpeg",
    description: "Explore the hidden currents of the heart, the mysteries of relationships, and the shadows within.",
    glowColor: "group-hover:[--glow-color:theme(colors.purple.400)]",
    options: [
      { duration: 5, label: "5 Minute Reading" },
      { duration: 10, label: "10 Minute Reading" },
      { duration: 20, label: "20 Minute Reading" },
    ]
  }
];

export default function TarotReadingLandingPage() {
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white w-full">
        
        {/* UPDATED HEADER */}
        <header className="mb-12 w-full max-w-5xl shrink-0">
            <div className="flex justify-between items-center flex-wrap w-full">
                <div className="order-1">
                    <MagickalBackLink href="/oracle-room" text="Oracle Room" />
                </div>
                <div className="order-2 md:order-3">
                    <RoomsButton />
                </div>
                <h1 className={`w-full text-center order-3 md:w-auto md:order-2 text-4xl md:text-6xl text-cyan-300 ${uncialAntiqua.className} mt-2 md:mt-0`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    Choose Your Oracle
                </h1>
            </div>
            <p className="mt-4 text-lg text-gray-300 text-center">
                Select the guide and the duration of the reading that resonates with your query.
            </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 w-full max-w-5xl">
          {readers.map((reader) => (
            <div 
              key={reader.name} 
              className={`group flex flex-col p-6 bg-black/40 rounded-xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-500/80 hover:bg-black/60 ${reader.glowColor}`}
              style={{ '--glow-color': 'transparent', boxShadow: '0 0 35px -5px var(--glow-color)' } as React.CSSProperties}
            >
              <div className="relative w-full h-80 mb-4 overflow-hidden rounded-lg">
                <Image 
                  src={reader.imageSrc} 
                  alt={`${reader.name} - ${reader.title}`} 
                  fill 
                  style={{ objectFit: 'cover', objectPosition: 'center' }} 
                />
              </div>
              <h2 className={`text-3xl text-white ${uncialAntiqua.className}`}>{reader.name}</h2>
              <p className="text-sm text-gray-400 mb-2">{reader.title}</p>
              <p className="text-gray-300 grow">{reader.description}</p>

              <div className="mt-6 flex flex-col space-y-3">
                {reader.options.map(option => (
                  <Link 
                    key={option.duration}
                    href={`/oracle-room/tarot-reading/${reader.slug}-${option.duration}`}
                    className="block w-full py-3 px-4 bg-gray-800/50 text-gray-200 rounded-lg border border-gray-600 hover:bg-gray-700 hover:text-white transition-colors text-center"
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}