"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, MouseEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sparkle from '../components/Sparkle';
// ADD IMPORTS
import { createBrowserClient } from '@supabase/ssr';
import { Coins, Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';

interface SparkleState { key: number; x: number; y: number; }

const portals = [
    {
    title: "Spell Room",
    href: "/spell-room", 
    imageSrc: "/images/portal-spell.png",
    signImageSrc: "/images/spell-room-sign.png",
    glowClass: "group-hover:drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]",
    soundSrc: "/audio/sfx-spell-room-portal.mp3",
    isExternal: false,
  },
  {
    title: "Oracle Room",
    href: "/oracle-room",
    imageSrc: "/images/portal-oracle.png",
    signImageSrc: "/images/oracle-room-sign.png",
    glowClass: "group-hover:drop-shadow-[0_0_25px_rgba(34,211,238,0.6)]",
    soundSrc: "/audio/sfx-oracle-room-portal.mp3",
    isExternal: false,
  },
  {
    title: "The School",
    href: "/the-magick-psychic-school",
    imageSrc: "/images/the-magick-psychic-school.png", 
    signImageSrc: "/images/the-magick-school-sign.png", 
    glowClass: "group-hover:drop-shadow-[0_0_25px_rgba(251,146,60,0.6)]",
    soundSrc: "/audio/sfx-library-portal.mp3",
    isExternal: false,
  },
  {
    title: "Magickal Tools", 
    href: "/magickal-tools", 
    imageSrc: "/images/portal-tools.png",
    signImageSrc: "/images/tools-sign.png",
    glowClass: "group-hover:drop-shadow-[0_0_25px_rgba(74,222,128,0.6)]",
    soundSrc: "/audio/sfx-marketplace-portal.mp3",
    isExternal: false,
  },
];

const SFX_VOLUME = 0.2;

// ... imports
import { MusicPlayerTrigger } from '../components/MusicPlayer';

// ... (keep Portal interface and data)

export default function HallPage() {
  const router = useRouter();
  const [sparkle, setSparkle] = useState<SparkleState | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<{ href: string; isExternal: boolean } | null>(null);
  
  // -- NEW STATE FOR CREDITS --
  const [credits, setCredits] = useState<number | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const portalSoundsRef = useRef<{[key: string]: any}>({});

  // -- NEW EFFECT: FETCH CREDITS --
  useEffect(() => {
    const fetchCredits = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('credits')
                .eq('id', user.id)
                .single();
            
            if (data) setCredits(data.credits);
        }
    };
    fetchCredits();
  }, [supabase]);

  useEffect(() => {
    const win = (globalThis as any).window;
    if (typeof win !== 'undefined') {
        const AudioCtor = win.Audio;
        portals.forEach(portal => {
          const audio = new AudioCtor(portal.soundSrc);
          audio.volume = SFX_VOLUME;
          portalSoundsRef.current[portal.soundSrc] = audio;
        });
    }
  }, []);

  const handlePortalClick = (e: MouseEvent<HTMLAnchorElement>, href: string, soundSrc: string, isExternal: boolean) => {
    e.preventDefault();
    if (navigatingTo) return;
    setNavigatingTo({ href, isExternal });
    
    const clickSound = portalSoundsRef.current[soundSrc];
    if (clickSound) {
      clickSound.currentTime = 0;
      clickSound.play();
    }
    setSparkle({ key: Date.now(), x: e.clientX, y: e.clientY });
  };

  const handleAnimationComplete = () => {
    if (navigatingTo) {
      if (navigatingTo.isExternal) {
        const win = (globalThis as any).window;
        if (win) {
            win.open(navigatingTo.href, '_blank', 'noopener,noreferrer');
        }
        setNavigatingTo(null);
        setSparkle(null);
      } else {
        router.push(navigatingTo.href);
      }
    }
  };

  return (
    <>
      <motion.main 
        className="relative h-screen w-screen overflow-hidden flex flex-col items-center justify-start pt-6 pb-4 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ease: 'easeInOut', duration: 2.0 }}
      >
        <div className="fixed inset-0 z-0">
            <Image src="/images/grand-hall-bg.png" alt="The Grand Hall" fill style={{ objectFit: 'fill' }} quality={100} />
            <div className="absolute inset-0 bg-black/40" />
        </div>
        
        {/* === HEADER CONTAINER === 
         * Left: 1.5%, Top: 1.15%, Width: 97%, Height: 16.3%
         * Fixed grid cols to ensure Logo center column always has space 
         */}
        <div className="absolute z-50 grid grid-cols-3 items-center"
             style={{ 
                 left: '1.5%', 
                 top: '1.15%', 
                 width: '97%', 
                 height: '16.3%',
             }}>
            
            {/* LEFT: Music Player Button */}
            <div className="flex items-center justify-start p-2">
                <MusicPlayerTrigger className="relative !fixed-none !top-auto !left-auto pointer-events-auto" />
            </div>

            {/* CENTER: Logo - Maximized & Centered */}
            <div className="flex items-center justify-center h-full w-full">
                 <div className="relative w-full h-[90%] max-w-[800px]">
                    <Image 
                        src="/images/logo-lordmagick.com.png" 
                        alt="LordMagick.com Logo" 
                        fill 
                        style={{ objectFit: 'contain' }} 
                        priority 
                        className="drop-shadow-[2px_2px_8px_rgba(0,0,0,0.8)]"
                    />
                 </div>
            </div>

            {/* RIGHT: Faestones - Custom Stacked Mobile Layout */}
            <div className="flex items-center justify-end p-2 min-w-0">
                {credits !== null && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-1000 shrink-0">
                        <div className="flex flex-col md:flex-row-reverse items-center justify-center gap-0.5 md:gap-3 bg-gradient-to-br from-stone-900 to-stone-950 border-2 border-amber-700/60 rounded-3xl md:rounded-full px-3 md:px-4 py-0 md:py-0 h-12 md:h-14 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md group hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all min-w-fit">
                             
                             {/* Number & Plus */}
                             <div className="flex items-center gap-1.5 md:gap-2">
                                <span className="text-sm md:text-2xl font-cinzel text-amber-100 font-bold leading-none param-font drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{credits}</span>
                                <Link href="/store" className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-amber-900/40 rounded-full border border-amber-600/50 hover:bg-amber-600 hover:text-white text-amber-400 transition-all transform hover:scale-110" title="Get More Faestones">
                                    <Plus size={12} className="md:w-[14px] md:h-[14px]" strokeWidth={3} />
                                </Link>
                             </div>

                             {/* Label - Below on Mobile, Left on Desktop */}
                             <span className="text-[0.5rem] md:text-xs text-amber-500 font-medieval tracking-widest leading-none drop-shadow-sm opacity-90 md:opacity-100 uppercase mt-0.5 md:mt-0 md:translate-y-0">Faestones</span>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* === BODY CONTAINER ===
         * Left: 4.5%, Top: 24.3%, Width: 91%, Height: 66.2%
         */}
        <div className="absolute z-20 flex flex-col justify-center items-center"
             style={{ 
                 left: '4.5%', 
                 top: '24.3%', 
                 width: '91%', 
                 height: '66.2%',
             }}>
             
             {/* TOP: Subheader - Moved from Header */}
             <div className="w-full text-center flex-none mb-1 md:mb-2 z-30">
                 <p className="text-amber-300 text-center drop-shadow-[1px_1px_4px_rgba(0,0,0,0.8)] whitespace-nowrap overflow-hidden text-ellipsis w-full font-medieval tracking-wide" 
                    style={{ fontSize: 'clamp(0.8rem, 2vh, 1.2rem)' }}>
                     Unlock Ancient Secrets. Master Your Craft.
                 </p>
             </div>
            
             {/* BOTTOM: Buttons Grid */}
             {/* Overflow visible to allow hover expansion */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full flex-grow items-center justify-center min-h-0">
                {portals.map((portal) => (
                    <div key={portal.title} className="flex flex-col items-center gap-y-1 h-full max-h-[98%] justify-center relative z-10 hover:z-50">
                        {/* Sign Image - Z-index lower than button on hover */}
                        <div className="relative w-full max-w-[160px] md:max-w-[200px] aspect-3/1 drop-shadow-[2px_4px_6px_rgba(0,0,0,0.6)] shrink-0 z-10 pointer-events-none">
                            <Image src={portal.signImageSrc} alt={`${portal.title} Sign`} fill style={{ objectFit: 'contain' }} />
                        </div>
                        <a 
                          href={portal.href} 
                          onClick={(e) => handlePortalClick(e, portal.href, portal.soundSrc, portal.isExternal)} 
                          className={`relative w-full h-full flex-1 min-h-0 group block cursor-pointer transition-all duration-300 z-20 hover:scale-110 hover:z-50`} 
                        >
                            <div className={`w-full h-full transition-all duration-300 ${portal.glowClass}`}>
                                <Image 
                                    src={portal.imageSrc} 
                                    alt={`${portal.title} Portal`} 
                                    fill 
                                    style={{ objectFit: 'contain' }} 
                                    className="transition-transform duration-300" // Removed group-hover:scale logic as parent scales
                                />
                            </div>
                        </a>
                    </div>
                ))}
            </div>

        </div>
      </motion.main>

      {sparkle && ( <div key={sparkle.key} className="fixed z-50 pointer-events-none" style={{ left: sparkle.x, top: sparkle.y }}><Sparkle onAnimationComplete={handleAnimationComplete} /></div> )}
    </>
  );
}