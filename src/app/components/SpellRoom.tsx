import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Expanded type to allow arbitrary strings or specific known types
type Tradition = "Chaos Magick" | "Wicca Magick" | "Ceremonial Magick" | "Folk Magick" | "Hoodoo (Rootwork)" | "Electric Magick" | "Love" | "Grimoire of Magickal Servitors" | "Servitors of the Wild Unknown";

interface TraditionInfo {
  name: Tradition;
  image: string;
  isAvailable: boolean;
  customHref?: string; 
}

// REORDERED LIST based on request
const traditions: TraditionInfo[] = [
  {
    name: "Wicca Magick",
    image: "/images/spell-room/wicca-witchcraft-magick-button.png",
    isAvailable: true,
  },
  {
    name: "Hoodoo (Rootwork)",
    image: "/images/spell-room/hoodoo-magick-button.png",
    isAvailable: true,
  },
  {
    name: "Grimoire of Magickal Servitors",
    image: "/images/spell-room/servitor-magick.png", 
    isAvailable: true,
    customHref: "/spell-room/grimoire-of-digital-servitors"
  },
  {
      name: "Servitors of the Wild Unknown",
      image: "/images/spell-room/servitors-of-the-wild-unknown.png", 
      isAvailable: true,
      customHref: "/spell-room/servitors-of-the-wild-unknown"
  },
  {
    name: "Love",
    image: "/images/spell-room/love-spells-app-page.png", 
    isAvailable: true,
  },
  {
    name: "Electric Magick",
    image: "/images/spell-room/electric-magick-button.png", 
    isAvailable: true,
  },
  {
    name: "Chaos Magick",
    image: "/images/spell-room/chaos-magick-button.png",
    isAvailable: true,
  },
  {
    name: "Ceremonial Magick",
    image: "/images/spell-room/ceremonial-magick-button.png",
    isAvailable: false, 
  },
  {
    name: "Folk Magick",
    image: "/images/spell-room/folk-magick-button.png",
    isAvailable: false, 
  },
];

const slugifyTradition = (name: string): string => {
  return name.toLowerCase()
    .replace(/ & /g, '-')
    .replace(/ /g, '-')
    .replace(/\(|\)/g, '') + '-spells-app';
};

interface TraditionButtonProps {
  tradition: TraditionInfo;
}

const TraditionButton: React.FC<TraditionButtonProps> = ({ tradition }) => {
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        if (showMessage) {
            const timer = setTimeout(() => setShowMessage(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showMessage]);

    const handleClick = (e: React.MouseEvent) => {
        if (!tradition.isAvailable) {
            e.preventDefault();
            setShowMessage(true);
        }
    };

    const href = tradition.customHref || `/spell-room/${slugifyTradition(tradition.name)}`;

    return (
        <div className="relative w-full max-w-sm mx-auto">
            <Link 
                href={href} 
                onClick={handleClick}
                className={`group relative block w-full transition-all duration-300 ${!tradition.isAvailable ? 'cursor-pointer' : ''}`}
            >
                {/* Image Container */}
                <div
                    className={`
                        transition-transform duration-300 ease-in-out overflow-hidden rounded-lg
                        ${tradition.isAvailable ? 'group-hover:scale-105 active:scale-95' : 'grayscale opacity-70 group-hover:scale-100'}
                    `}
                    style={{ filter: tradition.isAvailable ? 'drop-shadow(5px 8px 15px rgba(0,0,0,0.7))' : 'none' }}
                >
                    <Image
                        src={tradition.image}
                        alt={tradition.name}
                        width={500}
                        height={700}
                        className={`w-full h-auto object-cover aspect-[3/4] ${tradition.isAvailable ? 'group-hover:brightness-110' : ''}`}
                    />
                     {/* Label Overlay for Clarity */}
                     <div className="absolute bottom-0 left-0 w-full bg-black/60 p-2 text-center">
                        <span className="text-white font-serif text-sm tracking-widest uppercase">{tradition.name}</span>
                     </div>
                </div>

                {!tradition.isAvailable && !showMessage && (
                    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 opacity-80 z-10">
                         <span className="text-gray-400 text-xs uppercase tracking-widest font-serif border-b border-gray-600 pb-1 bg-black/50 px-2">Locked</span>
                    </div>
                )}
            </Link>

            {showMessage && (
                <div className="absolute inset-0 z-20 flex items-center justify-center animate-fade-in">
                    <div className="bg-black/90 border border-purple-500/50 p-4 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] backdrop-blur-sm text-center transform scale-110 transition-all">
                        <p className="text-purple-200 font-serif text-sm md:text-base italic tracking-wide" style={{ textShadow: '0 0 10px rgba(168,85,247,0.8)' }}>
                            This Ritual is in Preparation
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const SpellRoom: React.FC = () => {
  return (
    <div className="w-full h-full animate-fade-in p-4 md:p-8">
       <div className="w-full max-w-360 mx-auto grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 items-start justify-center">
        {traditions.map((tradition) => (
          <TraditionButton 
            key={tradition.name}
            tradition={tradition}
          />
        ))}
      </div>
    </div>
  );
}

export default SpellRoom;