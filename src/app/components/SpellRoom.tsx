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

    useEffect(() => {
        if (showMessage) {
            const timer = setTimeout(() => setShowMessage(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showMessage]);

    const handleClick = (e: React.MouseEvent) => {
        // If locked, prevent default and show message
        if (!tradition.isAvailable) {
            e.preventDefault();
            setShowMessage(true);
            return;
        }

        // Mobile/Touch logic: First tap opens overlay, second tap navigates
        // We can use the presence of the 'hover' media query to distinguish primary input mechanism roughly,
        // or just rely on state. A simple robust way is:
        // If the overlay is NOT visible (tracked by isTouched here for logic, though CSS uses group-hover),
        // we prevent default.
        // NOTE: On desktop, group-hover handles visuals. On mobile, we need this state.
        // However, checking "is hover active" via JS is faulty.
        // Strategy: If window width is small (mobile assumption) or touch event inferred.
        // Simpler: If we are not 'touched', we prevent default. BUT this forces double click on desktop too if we aren't careful.
        // Refined Strategy: Use a CSS media query check or just rely on the user tapping again.
        // Let's implement active state toggle.
        
        // If we haven't flagged it as touched/active, and we are in a context where hover might not have triggered (implied by click without hover intent?):
        // Actually, easiest way for "Mobile":
        // Users expect: Tap -> Active.
        // We can just check active state.
        if (!isTouched) {
             // For desktop users who hover, isTouched is false, but they see the overlay regardless.
             // If they click, they want to go.
             // For mobile users, they see nothing. They tap.
             // We need to differentiate.
             // Using a specialized functional approach: 
             // On mobile, the first tap acts like hover.
             // We can use onTouchStart to set a flag? 
             // Let's try: simple toggle. behavior.
        }
    };
    
    // Better Mobile Handler: Use onTouchStart/End logic or just treat 'onClick' with a "prevent first" logic strictly for touch devices logic?
    // Let's try a strict 'isTouched' state that is toggled by onClick.
    // AND: We only preventDefault if !isTouched.
    // Desktop nuance: Desktop users hover first. The visual is there. They click. 
    // If we preventDefault on desktop, it's annoying.
    // Fix: We reset isTouched on MouseLeave.
    // On Desktop: MouseEnter -> (visuals show) -> Click -> Navigate. (isTouched is false, but we shouldn't block desktop).
    // On Mobile: No MouseEnter. Tap -> Click.
    
    // We can use a simple trick: The overlay itself (the button inside) can be the link trigger?
    // No, the whole card is the link.
    
    // Proposed Solution:
    // 1. Desktop: Hover shows overlay. Link click works.
    // 2. Mobile: Tap shows overlay (via CSS focus-within or JS). Link click blocked first time.
    
    const handleTouchStart = () => {
        // This marks that we are interacting via touch
        // preventing the "double click on desktop" issue if we used click only
    };

    const handleMobileClick = (e: React.MouseEvent) => {
         if (!tradition.isAvailable) {
            e.preventDefault();
            setShowMessage(true);
            return;
        }
        
        // If overlay is not showing (simulated logic), prevent nav.
        // We rely on 'isTouched' to represent "Overlay is Open via Tap".
        if (!isTouched) {
            e.preventDefault();
            setIsTouched(true);
            // On desktop this logic would force a double click unless we skip it.
            // But we can't easily detect desktop vs mobile in click event without heuristics.
            // Check CSS hover ability?
            // window.matchMedia('(hover: hover)').matches
            if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                 // It IS a desktop/hover device. Allow navigation immediately?
                 // But what if they haven't hovered yet? (Unlikely).
                 // Actually, if it's desktop, click means go.
                 // So we manually un-prevent default? No, we just don't prevent it.
                 // Re-running the logic:
                 // if (hasHover) return; // Navigate
                 // else { e.preventDefault(); setIsTouched(true); }
                 
                 // However, we can't conditional return inside the PreventDefault block easily.
            }
        }
    };

    // Let's refine the handler for the View
    const handleInteraction = (e: React.MouseEvent) => {
         if (!tradition.isAvailable) {
            e.preventDefault();
            setShowMessage(true);
            return;
        }

        // Check for hover capability
        const hasHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
        
        if (!hasHover && !isTouched) {
            e.preventDefault();
            setIsTouched(true);
        }
        // If hasHover (Desktop), we assume hover handled the preview, so click navigates.
        // If !hasHover (Mobile) and isTouched is true, we allow navigation.
    };

    const href = tradition.customHref || `/spell-room/${slugifyTradition(tradition.name)}`;

    // SEO Alt Text Formulas
    const thumbnailAlt = `${tradition.visualTags} for ${tradition.name} ritual - ${tradition.category} Witchcraft - LordMagick App`;
    const buttonAlt = `Magickal sigil button to initiate the ${tradition.name} - Cast ${tradition.category} ritual now`;

    return (
        <div 
            className="relative w-full max-w-sm mx-auto flex flex-col items-center"
            onMouseLeave={() => setIsTouched(false)} // Reset on mouse leave
        >
            <Link 
                href={href} 
                onClick={handleInteraction}
                className={`group relative block w-full overflow-hidden rounded-xl bg-black/40 border border-white/10 transition-all duration-300 ${!tradition.isAvailable ? 'cursor-not-allowed grayscale opacity-70' : 'cursor-pointer hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'}`}
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
                        className={`object-cover transition-transform duration-700 ease-in-out ${tradition.isAvailable ? 'group-hover:scale-110' : ''}`}
                    />
                    
                    {/* BINDING OF ISAAC STYLE OVERLAY (Bottom Sheet) */}
                    {tradition.isAvailable && (
                        <div 
                            className={`
                                absolute inset-0 
                                transition-transform duration-500 ease-out 
                                z-20 flex flex-col items-center justify-center pointer-events-none 
                                ${isTouched ? 'translate-y-0 pointer-events-auto' : 'translate-y-full group-hover:translate-y-0 group-hover:pointer-events-auto'}
                            `}
                        >
                            
                            {/* Parchment Caption Container */}
                            <div className="relative w-full h-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" style={{ opacity: isTouched ? 1 : undefined }}>
                                {/* Parchment Image Background */}
                                <div className="absolute inset-0 z-0">
                                    <Image
                                        src="/images/spell-room/magick-overlay-caption.png"
                                        alt="" 
                                        fill
                                        className="object-cover drop-shadow-xl"
                                        style={{ objectPosition: 'center bottom' }} // Ensure bottom isn't weirdly cropped
                                    />
                                </div>
                                
                                {/* Caption Text - 80% Width */}
                                <div className="relative z-10 w-[80%] flex items-center justify-center mb-8">
                                    <p className="text-[#3c2f2f] text-center font-serif text-base leading-relaxed font-semibold mix-blend-multiply">
                                        {tradition.caption}
                                    </p>
                                </div>
                            </div>

                             {/* Floating Sigil Button - 70% Width */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[70%] transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                                <div className="relative w-full aspect-square">
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