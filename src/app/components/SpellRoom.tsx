// --- START OF FILE src/app/components/SpellRoom.tsx ---

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Tradition = "Chaos Magick" | "Wicca Magick" | "Ceremonial Magick" | "Folk Magick" | "Hoodoo (Rootwork)";

interface TraditionInfo {
  name: Tradition;
  image: string;
  isAvailable: boolean;
  positionClasses: string;
  widthClasses: string;
}

const traditions: TraditionInfo[] = [
  {
    name: "Hoodoo (Rootwork)", // THE FIX: Added the new tradition
    image: "/images/spell-room/hoodoo-magick-button.png",
    isAvailable: true,
    positionClasses: "md:absolute md:top-[1%] md:left-1/2 md:-translate-x-1/2",
    widthClasses: "w-4/5 md:w-[26%] lg:w-[22%]",
  },
  {
    name: "Chaos Magick",
    image: "/images/spell-room/chaos-magick-button.png",
    isAvailable: true,
    positionClasses: "md:absolute md:top-[33%] md:left-[1%] lg:left-[4%]",
    widthClasses: "w-4/5 md:w-[25%] lg:w-[21%]",
  },
  {
    name: "Wicca Magick",
    image: "/images/spell-room/wicca-witchcraft-magick-button.png",
    isAvailable: true,
    positionClasses: "md:absolute md:top-[33%] md:right-[1%] lg:right-[4%]",
    widthClasses: "w-4/5 md:w-[25%] lg:w-[21%]",
  },
  {
    name: "Ceremonial Magick",
    image: "/images/spell-room/ceremonial-magick-button.png",
    isAvailable: true, // Assuming it's available for selection
    positionClasses: "md:absolute md:bottom-[1%] md:left-[15%] lg:left-[22%]",
    widthClasses: "w-4/5 md:w-[26%] lg:w-[23%]",
  },
  {
    name: "Folk Magick", // THE FIX: Replaced old Hoodoo with Folk Magick
    image: "/images/spell-room/folk-magick-button.png",
    isAvailable: true,
    positionClasses: "md:absolute md:bottom-[1%] md:right-[15%] lg:right-[22%]",
    widthClasses: "w-4/5 md:w-[26%] lg:w-[23%]",
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
    const slug = slugifyTradition(tradition.name);
    const href = `/spell-room/${slug}`;

    const buttonContent = (
        <div className="relative">
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
        </div>
    );

    const wrapperClasses = `${tradition.positionClasses} ${tradition.widthClasses} mx-auto md:mx-0 group`;
    
    return (
        <Link href={href} className={wrapperClasses}>
            {buttonContent}
        </Link>
    );
};


const SpellRoom: React.FC = () => {
  return (
    <div className="w-full h-full animate-fade-in">
       <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-y-6 py-6 md:h-[85vh] md:relative md:block md:py-0 md:gap-y-0">
        {traditions.map((tradition) => (
          <TraditionButton 
            key={tradition.name}
            tradition={tradition}
          />
        ))}
      </div>
    </div>
  );
};

export default SpellRoom;
// --- END OF FILE ---