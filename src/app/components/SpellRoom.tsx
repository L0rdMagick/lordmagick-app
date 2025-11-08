// --- START OF FILE src/components/SpellRoom.tsx ---

import React, { useState } from 'react';
import type { Session } from '@/lib/types';
import SpellGenerator from './SpellGenerator';
import WiccaSpellGenerator from './WiccaSpellGenerator';
import Image from 'next/image';

interface SpellRoomProps {
  session: Session;
  isSubscribed: boolean;
}

type Tradition = "Chaos Magick" | "Wicca & Witchcraft" | "Ceremonial Magick" | "Folk Magick" | "Hoodoo (Rootwork)";

interface TraditionInfo {
  name: Tradition;
  image: string;
  isAvailable: boolean;
  positionClasses: string;
  widthClasses: string;
}

const traditions: TraditionInfo[] = [
  {
    name: "Wicca & Witchcraft",
    image: "/images/spell-room/wicca-witchcraft-magick-button.png",
    isAvailable: true,
    positionClasses: "top-[2%] left-1/2 -translate-x-1/2",
    widthClasses: "w-[30%] md:w-[25%] lg:w-[22%]"
  },
  {
    name: "Chaos Magick",
    image: "/images/spell-room/chaos-magick-button.png",
    isAvailable: true,
    positionClasses: "top-[15%] left-[2%] md:left-[8%]",
    widthClasses: "w-[28%] md:w-[22%] lg:w-[20%]"
  },
  {
    name: "Ceremonial Magick",
    image: "/images/spell-room/ceremonial-magick-button.png",
    isAvailable: false,
    positionClasses: "top-[15%] right-[2%] md:right-[8%]",
    widthClasses: "w-[28%] md:w-[22%] lg:w-[20%]"
  },
  {
    name: "Folk Magick",
    image: "/images/spell-room/folk-magick-button.png",
    isAvailable: false,
    positionClasses: "bottom-[5%] left-[10%] md:left-[15%]",
    widthClasses: "w-[28%] md:w-[24%] lg:w-[22%]"
  },
  {
    name: "Hoodoo (Rootwork)",
    image: "/images/spell-room/hoodoo-magick-button.png",
    isAvailable: false,
    positionClasses: "bottom-[5%] right-[10%] md:right-[15%]",
    widthClasses: "w-[28%] md:w-[24%] lg:w-[22%]"
  },
];

interface TraditionButtonProps {
  tradition: TraditionInfo;
  onClick: () => void;
}

const TraditionButton: React.FC<TraditionButtonProps> = ({ tradition, onClick }) => (
  <div className={`absolute ${tradition.positionClasses} ${tradition.widthClasses}`}>
      <div className="relative">
          <button
              onClick={onClick}
              disabled={!tradition.isAvailable}
              className="transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95 disabled:cursor-not-allowed group"
              style={{ filter: 'drop-shadow(5px 8px 15px rgba(0,0,0,0.7))' }}
          >
              <Image 
                  src={tradition.image} 
                  alt={tradition.name}
                  width={500}
                  height={700}
                  className={`w-full h-auto ${!tradition.isAvailable ? 'grayscale' : 'group-hover:brightness-110'}`}
              />
          </button>
          {!tradition.isAvailable && (
              <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 bg-black/70 text-yellow-400 text-xs md:text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Coming Soon
              </div>
          )}
      </div>
  </div>
);


const SpellRoom: React.FC<SpellRoomProps> = ({ session, isSubscribed }) => {
  const [activeTradition, setActiveTradition] = useState<Tradition | null>(null);

  const handleBackToSelection = () => setActiveTradition(null);

  if (activeTradition) {
    return (
      <div className="w-full max-w-2xl bg-black/60 backdrop-blur-md p-8 rounded-lg border border-white/10">
        {activeTradition === 'Chaos Magick' && (
          <SpellGenerator session={session} isSubscribed={isSubscribed} onBack={handleBackToSelection} />
        )}
        {activeTradition === 'Wicca & Witchcraft' && (
          <WiccaSpellGenerator session={session} isSubscribed={isSubscribed} onBack={handleBackToSelection} />
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full animate-fade-in">
       <div className="w-full h-[85vh] max-w-7xl mx-auto relative">
        {traditions.map((tradition) => (
          <TraditionButton 
            key={tradition.name}
            tradition={tradition}
            onClick={() => tradition.isAvailable && setActiveTradition(tradition.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default SpellRoom;