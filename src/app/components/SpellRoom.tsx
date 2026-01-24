import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Expanded type to allow arbitrary strings or specific known types
type Tradition = "Chaos Magick" | "Wicca Magick" | "Ceremonial Magick" | "Folk Magick" | "Hoodoo (Rootwork)" | "Electric Magick" | "Love" | "Grimoire of Magickal Servitors" | "Servitors of the Wild Unknown";

interface TraditionInfo {
  name: Tradition;
  image: string;
  isAvailable: boolean;
  customHref?: string;
  caption: string;
  category: string;
  visualTags: string; // Specific visual description for alt text
}

// REORDERED LIST based on request with NEW SEO DATA & CAPTIONS
const traditions: TraditionInfo[] = [
  {
    name: "Wicca Magick",
    image: "/images/spell-room/wicca-witchcraft-magick-button.png",
    isAvailable: true,
    caption: "Interactive Wiccan altar for circle casting, deity invocation, and elemental spellwork.",
    category: "Wiccan",
    visualTags: "Glowing pentacle and ritual candles on a wooden altar"
  },
  {
    name: "Hoodoo (Rootwork)",
    image: "/images/spell-room/hoodoo-magick-button.png",
    isAvailable: true,
    caption: "Traditional Rootwork and Voodoo Lwa service with Psalm divination and jar fixing.",
    category: "Hoodoo",
    visualTags: "Antique mojo bag, burning candles, and petition paper"
  },
  {
    name: "Grimoire of Magickal Servitors",
    image: "/images/spell-room/servitor-magick.png", 
    isAvailable: true,
    customHref: "/spell-room/grimoire-of-digital-servitors",
    caption: "Design, program, and bind custom digital spirit servitors to do your bidding.",
    category: "Chaos",
    visualTags: "Glowing cybernetic spirit construct in a digital containment field"
  },
  {
    name: "Servitors of the Wild Unknown",
    image: "/images/spell-room/servitors-of-the-wild-unknown.png", 
    isAvailable: true,
    customHref: "/spell-room/servitors-of-the-wild-unknown",
    caption: "Summon specialized chaotic entities from deep dimensions for complex tasks.",
    category: "Dimensional",
    visualTags: "Abstract otherworldly creature emerging from a portal"
  },
  {
    name: "Love",
    image: "/images/spell-room/love-spells-app-page.png", 
    isAvailable: true,
    caption: "Soul Connect spells and honey jar rituals to sweeten relationships and attract love.",
    category: "Love",
    visualTags: "Radiant pink heart energy with rose petals and soft light"
  },
  {
    name: "Electric Magick",
    image: "/images/spell-room/electric-magick-button.png", 
    isAvailable: true,
    caption: "Cyber-sorcery using digital chaos magick, neural linking, and reality patching.",
    category: "Techno-pagan",
    visualTags: "Neon circuit board sigils and data streams"
  },
  {
    name: "Chaos Magick",
    image: "/images/spell-room/chaos-magick-button.png",
    isAvailable: true,
    caption: "Generate and charge unique sigils with primal chaos energy and gnosis.",
    category: "Chaos",
    visualTags: "Chaosphere symbol pulsating with purple entropy energy"
  },
  {
    name: "Ceremonial Magick",
    image: "/images/spell-room/ceremonial-magick-button.png",
    isAvailable: false, 
    caption: "High ritual invocation, banishing, and communion with the divine. (Coming Soon)",
    category: "High Magick",
    visualTags: "Golden ritual chalice and solomonic circle"
  },
  {
    name: "Folk Magick",
    image: "/images/spell-room/folk-magick-button.png",
    isAvailable: false, 
    caption: "Ancient earth-based practices using herbs, stones, and simple charms. (Coming Soon)",
    category: "Folk",
    visualTags: "Bundles of dried herbs, crystals, and natural stones"
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
    const [isTouched, setIsTouched] = useState(false); // State for mobile tap interaction
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showMessage) {
            const timer = setTimeout(() => setShowMessage(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showMessage]);
    
    // Mobile: Close overlay when scrolled away
    useEffect(() => {
        if (!isTouched || !containerRef.current) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) {
                setIsTouched(false);
            }
        }, { threshold: 0.1 }); // Trigger when mostly out of view

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [isTouched]);

    const handleClick = (e: React.MouseEvent) => {
        // ... (this is largely superseded by handleInteraction but kept for safety/legacy)
        if (!tradition.isAvailable) {
            e.preventDefault();
            setShowMessage(true);
        }
    };
    
    const handleInteraction = (e: React.MouseEvent) => {
         if (!tradition.isAvailable) {
            e.preventDefault();
            setShowMessage(true);
            return;
        }

        // Check for hover capability
        const hasHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
        
        // On mobile (no hover), if not yet touched, prevent nav and show overlay
        if (!hasHover && !isTouched) {
            e.preventDefault();
            setIsTouched(true);
        }
        // If hasHover (Desktop), or already touched, let Link navigation proceed naturally
    };
    
    const handleMouseLeave = () => {
        // Only reset on hover devices. 
        // Logic: On mobile, 'mouseleave' can fire erratically or not at all, 
        // but we want 'Scroll Away' to handle the close, NOT this event.
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
            setIsTouched(false);
        }
    };

    const href = tradition.customHref || `/spell-room/${slugifyTradition(tradition.name)}`;

    // SEO Alt Text Formulas
    const thumbnailAlt = `${tradition.visualTags} for ${tradition.name} ritual - ${tradition.category} Witchcraft - LordMagick App`;
    const buttonAlt = `Magickal sigil button to initiate the ${tradition.name} - Cast ${tradition.category} ritual now`;

    return (
        <div 
            ref={containerRef}
            className="relative w-full max-w-sm mx-auto flex flex-col items-center"
            onMouseLeave={handleMouseLeave}
        >
            <Link 
                href={href} 
                onClick={handleInteraction}
                className={`group relative block w-full overflow-hidden rounded-xl bg-transparent transition-all duration-300 ${!tradition.isAvailable ? 'cursor-not-allowed grayscale opacity-70' : 'cursor-pointer hover:scale-105 hover:drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]'}`}
                role="button"
                aria-expanded={isTouched} 
                aria-label={`Open ${tradition.name} Ritual`}
            >
                {/* Image Container */}
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <Image
                        src={tradition.image}
                        alt={thumbnailAlt}
                        fill
                        className={`object-cover transition-all duration-700 ease-in-out ${tradition.isAvailable ? (isTouched ? 'opacity-0' : 'group-hover:opacity-0') : ''}`}
                    />
                    
                    {/* BINDING OF ISAAC STYLE OVERLAY (Bottom Sheet) */}
                    {/* BINDING OF ISAAC STYLE OVERLAY (Bottom Sheet) */}
                    {tradition.isAvailable && (
                        <div 
                            className={`
                                absolute inset-[1%] rounded-xl
                                transition-transform duration-500 ease-out 
                                z-20 flex flex-col items-center justify-start pointer-events-none 
                                ${isTouched ? 'translate-y-0 pointer-events-auto' : 'translate-y-full group-hover:translate-y-0 group-hover:pointer-events-auto'}
                            `}
                        >
                            
                            {/* Parchment Caption Container */}
                            <div className="relative w-full h-full flex flex-col items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" style={{ opacity: isTouched ? 1 : undefined }}>
                                {/* Parchment Image Background */}
                                <div className="absolute inset-0 z-0">
                                    <Image
                                        src="/images/spell-room/magick-overlay-caption.png"
                                        alt="" 
                                        fill
                                        className="object-fill drop-shadow-xl rounded-xl"
                                    />
                                </div>
                                
                                {/* Caption Text - Adjusted for wide button */}
                                {/* Button is w-70% aspect-3/1 -> height is ~23%. Bottom 5%. Space needed ~30% */}
                                <div className="relative z-10 w-[80%] h-full flex items-center justify-center pb-[40%] mt-4">
                                    <p className="text-[#3c2f2f] text-center font-serif text-xl md:text-lg leading-snug font-semibold mix-blend-multiply overflow-y-auto max-h-full scrollbar-hide break-words">
                                        {tradition.caption}
                                    </p>
                                </div>
                            </div>

                             {/* Floating Sigil Button - Wide Aspect Ratio (1024x335) */}
                            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 z-30 w-[70%] transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                                <div className="relative w-full aspect-[3/1]">
                                    <Image
                                        src="/images/spell-room/magick-button.png"
                                        alt={buttonAlt}
                                        fill
                                        className="object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* LOCKED STATE OVERLAY */}
                {!tradition.isAvailable && !showMessage && (
                    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 opacity-80 z-10 w-full text-center">
                         <span className="text-gray-400 text-xs uppercase tracking-widest font-serif border-b border-gray-600 pb-1 bg-black/80 px-3 py-1 rounded-full">Locked</span>
                    </div>
                )}
            </Link>

             {/* LABEL BENEATH IMAGE */}
             <div className="mt-3 text-center z-10 relative group-hover:text-purple-300 transition-colors duration-300">
                 <h3 className={`font-serif text-lg tracking-wide ${tradition.isAvailable ? 'text-purple-200' : 'text-gray-600'}`} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                     {tradition.name}
                 </h3>
             </div>

            {/* ERROR TOAST */}
            {showMessage && (
                <div className="absolute inset-0 z-50 flex items-center justify-center animate-fade-in pointer-events-none">
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
    <div className="w-full h-full animate-fade-in p-4 md:p-8 pb-20">
       <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-start justify-center">
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