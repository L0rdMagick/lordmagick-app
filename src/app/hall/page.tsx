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
        className="relative h-screen w-screen overflow-hidden flex flex-col items-center justify-start md:justify-center pt-6 pb-4 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ease: 'easeInOut', duration: 2.0 }}
      >
        <div className="fixed inset-0 z-0">
            <Image src="/images/grand-hall-bg.png" alt="The Grand Hall" fill style={{ objectFit: 'cover' }} quality={100} />
            <div className="absolute inset-0 bg-black/40" />
        </div>
        
        {/* -- NEW: CREDIT DISPLAY (TOP RIGHT) -- */}
        {credits !== null && (
            <div className="absolute top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="flex flex-col items-center gap-1 bg-gradient-to-br from-stone-900 to-stone-950 border-2 border-amber-700/60 rounded-xl px-4 py-2 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md group hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all">
                     <span className="text-xs text-amber-500 font-medieval tracking-widest leading-none drop-shadow-sm">Faestones</span>
                     <span className="text-xl md:text-2xl font-cinzel text-amber-100 font-bold leading-none py-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{credits}</span>
                    <Link href="/store" className="p-1 mt-1 bg-amber-900/30 rounded-full border border-amber-800/50 hover:bg-amber-700/50 hover:border-amber-500 hover:text-amber-200 text-stone-400 transition-all transform hover:scale-110" title="Get More Faestones">
                        <Plus size={14} />
                    </Link>
                </div>
            </div>
        )}

        <div className="relative z-20 flex flex-col items-center w-full max-w-7xl">
            <header className="text-center text-white">
                <div 
                  className="relative w-full mx-auto aspect-3/1 h-[10vh] md:h-[18vh]"
                  style={{ 
                    filter: 'drop-shadow(2px 2px 8px rgba(0,0,0,0.8))',
                    maxWidth: 'min(480px, calc(100vw - 230px))', // Ensure space for Music Player (Left) and Balance (Right)
                  }}
                >
                    <Image src="/images/logo-lordmagick.com.png" alt="LordMagick.com Logo" fill style={{ objectFit: 'contain' }} priority />
                </div>
                <p 
                  className="text-amber-300" 
                  style={{ 
                    textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                    fontSize: 'clamp(0.9rem, 2.2vh, 1.2rem)'
                  }}
                >
                    Unlock Ancient Secrets. Master Your Craft.
                </p>
            </header>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 md:gap-x-8 w-full mt-4 md:mt-[4vh]">
                {portals.map((portal) => (
                    <div key={portal.title} className="flex flex-col items-center gap-y-1">
                        <div className="relative w-full max-w-[150px] md:max-w-[200px] aspect-3/1" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.6))' }}>
                            <Image src={portal.signImageSrc} alt={`${portal.title} Sign`} fill style={{ objectFit: 'contain' }} />
                        </div>
                        <a 
                          href={portal.href} 
                          onClick={(e) => handlePortalClick(e, portal.href, portal.soundSrc, portal.isExternal)} 
                          className={`relative w-full aspect-3/4 group block cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95`} 
                        >
                            <div className={`w-full h-full transition-all duration-300 ${portal.glowClass}`}>
                                <Image 
                                    src={portal.imageSrc} 
                                    alt={`${portal.title} Portal`} 
                                    fill 
                                    style={{ objectFit: 'contain' }} 
                                    className="transition-transform duration-300 group-hover:scale-110" 
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