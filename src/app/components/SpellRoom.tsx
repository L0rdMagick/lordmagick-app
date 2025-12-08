import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Expanded type to allow arbitrary strings or specific known types
type Tradition = "Chaos Magick" | "Wicca Magick" | "Ceremonial Magick" | "Folk Magick" | "Hoodoo (Rootwork)" | "Electric Magick" | "Love" | "Grimoire of Magickal Servitors";

interface TraditionInfo {
  name: Tradition;
  image: string;
  isAvailable: boolean;
  customHref?: string; 
}

const traditions: TraditionInfo[] = [
  {
    name: "Hoodoo (Rootwork)",
    image: "/images/spell-room/hoodoo-magick-button.png",
    isAvailable: true,
  },
  {
    name: "Chaos Magick",
    image: "/images/spell-room/chaos-magick-button.png",
    isAvailable: true,
  },
  {
    name: "Wicca Magick",
    image: "/images/spell-room/wicca-witchcraft-magick-button.png",
    isAvailable: true,
  },
  {
    name: "Ceremonial Magick",
    image: "/images/spell-room/ceremonial-magick-button.png",
    isAvailable: true,
  },
  {
    name: "Folk Magick",
    image: "/images/spell-room/folk-magick-button.png",
    isAvailable: true,
  },
  {
    name: "Electric Magick",
    image: "/images/spell-room/electric-magick-button.png", 
    isAvailable: true,
  },
  {
    name: "Love",
    image: "/images/spell-room/love-spells-app-page.png", 
    isAvailable: true,
  },
  // NEW ENTRY: Servitor Magick
  {
    name: "Grimoire of Magickal Servitors",
    image: "/images/spell-room/servitor-magick.png", 
    isAvailable: true,
    customHref: "/spell-room/grimoire-of-digital-servitors"
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
    // Use customHref if present, otherwise generate slug
    // FIXED: Added backticks around the string template below
    const href = tradition.customHref || `/spell-room/${slugifyTradition(tradition.name)}`;

    return (
        <Link href={href} className="group relative block w-full max-w-sm mx-auto">
            <div
                className={`transition-transform duration-300 ease-in-out ${tradition.isAvailable ? 'group-hover:scale-105 active:scale-95' : ''}`}
                style={{ filter: 'drop-shadow(5px 8px 15px rgba(0,0,0,0.7))' }}
            >
                <Image
                    src={tradition.image}
                    alt={tradition.name}
                    width={500}
                    height={700}
                    className="w-full h-auto group-hover:brightness-110"
                />
            </div>
            {!tradition.isAvailable && (
                <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 bg-black/70 text-yellow-400 text-xs md:text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Coming Soon
                </div>
            )}
        </Link>
    );
};


const SpellRoom: React.FC = () => {
  return (
    <div className="w-full h-full animate-fade-in p-4 md:p-8">
       {/* 
         Responsive Grid Layout:
         - Mobile: 1 column
         - Medium: 2 columns
         - Large: 3 columns
       */}
       <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start justify-center">
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