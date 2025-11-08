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

// THE FIX: Adjusted absolute positioning values to create more space and prevent overlap on wide screens.
const traditions: TraditionInfo[] = [
  {
    name: "Wicca & Witchcraft",
    image: "/images/spell-room/wicca-witchcraft-magick-button.png",
    isAvailable: true,
    positionClasses: "md:absolute md:top-[1%] md:left-1/2 md:-translate-x-1/2",
    widthClasses: "w-4/5 md:w-[28%] lg:w-[24%]"
  },
  {
    name: "Chaos Magick",
    image: "/images/spell-room/chaos-magick-button.png",
    isAvailable: true,
    positionClasses: "md:absolute md:top-[25%] md:left-[1%] lg:left-[5%]",
    widthClasses: "w-4/5 md:w-[26%] lg:w-[22%]"
  },
  {
    name: "Ceremonial Magick",
    image: "/images/spell-room/ceremonial-magick-button.png",
    isAvailable: false,
    positionClasses: "md:absolute md:top-[25%] md:right-[1%] lg:right-[5%]",
    widthClasses: "w-4/5 md:w-[26%] lg:w-[22%]"
  },
  {
    name: "Folk Magick",
    image: "/images/spell-room/folk-magick-button.png",
    isAvailable: false,
    positionClasses: "md:absolute md:bottom-[2%] md:left-[12%] lg:left-[18%]",
    widthClasses: "w-4/5 md:w-[28%] lg:w-[24%]"
  },
  {
    name: "Hoodoo (Rootwork)",
    image: "/images/spell-room/hoodoo-magick-button.png",
    isAvailable: false,
    positionClasses: "md:absolute md:bottom-[2%] md:right-[12%] lg:right-[18%]",
    widthClasses: "w-4/5 md:w-[28%] lg:w-[24%]"
  },
];

interface TraditionButtonProps {
  tradition: TraditionInfo;
  onClick: () => void;
}

const TraditionButton: React.FC<TraditionButtonProps> = ({ tradition, onClick }) => (
  // THE FIX: Added mx-auto for mobile centering, md:mx-0 to reset for desktop absolute positioning.
  <div className={`${tradition.positionClasses} ${tradition.widthClasses} mx-auto md:mx-0`}>
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
       {/* This container handles the responsive layout switch */}
       <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-y-6 py-6 md:h-[85vh] md:relative md:block md:py-0 md:gap-y-0">
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