// --- START OF FILE src/components/SpellRoom.tsx ---

import React, { useState } from 'react';
import type { Session } from '@/lib/types';
import SpellGenerator from './SpellGenerator';
import WiccaSpellGenerator from './WiccaSpellGenerator';
import { WandIcon } from './icons';

interface SpellRoomProps {
  session: Session;
  isSubscribed: boolean;
  onBack: () => void;
}

type Tradition = "Chaos Magick" | "Wicca & Witchcraft" | "Ceremonial Magick" | "Folk Magick" | "Hoodoo (Rootwork)";

const traditions: { name: Tradition; description: string; image: string; isAvailable: boolean; }[] = [
  {
    name: "Chaos Magick",
    description: "A modern, results-based system that borrows from any tradition and emphasizes the power of belief.",
    image: "/images/magickal-traditions-art/chaos-magick.png",
    isAvailable: true,
  },
  {
    name: "Wicca & Witchcraft",
    description: "Nature-based traditions working with deities, the elements, lunar cycles, and herbalism.",
    image: "/images/magickal-traditions-art/wicca.png",
    isAvailable: true, 
  },
  {
    name: "Ceremonial Magick",
    description: "A highly structured system rooted in Hermeticism and Kabbalah, involving intricate rituals.",
    image: "/images/magickal-traditions-art/ceremonial-magick.png",
    isAvailable: false,
  },
  {
    name: "Folk Magick",
    description: "Practical, earth-based magic using common household items, natural curios, and regional folklore.",
    image: "/images/magickal-traditions-art/folk-magick.png",
    isAvailable: false,
  },
  {
    name: "Hoodoo (Rootwork)",
    description: "African American folk magic focused on practical goals like drawing love, money, or luck.",
    image: "/images/magickal-traditions-art/hoodoo.png",
    isAvailable: false,
  },
];

const SpellRoom: React.FC<SpellRoomProps> = ({ session, isSubscribed, onBack }) => {
  const [activeTradition, setActiveTradition] = useState<Tradition | null>(null);

  // --- RENDER LOGIC ---
  if (activeTradition === 'Chaos Magick') {
    return <SpellGenerator session={session} isSubscribed={isSubscribed} onBack={() => setActiveTradition(null)} />;
  }
  
  if (activeTradition === 'Wicca & Witchcraft') {
    return <WiccaSpellGenerator session={session} isSubscribed={isSubscribed} onBack={() => setActiveTradition(null)} />;
  }
  // --- END RENDER LOGIC ---

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="text-purple-400 hover:text-purple-300 text-sm">&larr; Back to Dashboard</button>
        <h2 className="text-3xl font-bold font-serif text-gray-100">The Spell Room</h2>
      </div>
      <p className="text-center text-gray-400 mb-10">Select a tradition to begin your work.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {traditions.map((tradition) => (
          <div
            key={tradition.name}
            onClick={() => tradition.isAvailable && setActiveTradition(tradition.name)}
            className={`
              rounded-lg p-6 flex flex-col items-center text-center border border-white/10
              transition-all duration-300 transform group
              ${tradition.isAvailable 
                ? 'bg-white/5 hover:bg-purple-900/20 hover:border-purple-400/50 hover:-translate-y-1 cursor-pointer' 
                : 'bg-black/20 filter grayscale cursor-not-allowed'
              }
            `}
          >
            <img 
              src={tradition.image} 
              alt={tradition.name} 
              className="w-24 h-24 object-cover rounded-full mb-4 border-2 border-white/20 group-hover:border-purple-400 transition-colors" 
            />
            <h3 className="text-xl font-serif font-bold text-purple-300">{tradition.name}</h3>
            {/* THE FIX: Changed flex-grow to grow */}
            <p className="text-gray-400 text-sm mt-2 grow">{tradition.description}</p>
            {!tradition.isAvailable && (
              <p className="mt-4 text-xs font-bold text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded-full">COMING SOON</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpellRoom;