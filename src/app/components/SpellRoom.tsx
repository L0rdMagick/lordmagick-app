// --- START OF FILE src/components/SpellRoom.tsx ---

import React, { useState } from 'react';
import type { Session } from '../types';
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
  // ... (traditions array remains unchanged)
];

const SpellRoom: React.FC<SpellRoomProps> = ({ session, isSubscribed, onBack }) => {
  const [activeTradition, setActiveTradition] = useState<Tradition | null>(null);

  if (activeTradition === 'Chaos Magick') {
    return <SpellGenerator session={session} isSubscribed={isSubscribed} onBack={() => setActiveTradition(null)} />;
  }
  
  if (activeTradition === 'Wicca & Witchcraft') {
    return <WiccaSpellGenerator session={session} isSubscribed={isSubscribed} onBack={() => setActiveTradition(null)} />;
  }

  return (
    <div className="animate-fade-in">
      {/* THE FIX: The header block with the back button has been removed */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-serif text-gray-100">The Spell Room</h2>
        <p className="text-center text-gray-400 mb-10">Select a tradition to begin your work.</p>
      </div>
      
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
            <p className="text-gray-400 text-sm mt-2 flex-grow">{tradition.description}</p>
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