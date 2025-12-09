/// <reference lib="dom" />
"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, MouseEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sparkle from '../components/Sparkle';

interface SparkleState { key: number; x: number; y: number; }

const portals = [
    {
    title: "Spell Room",
    href: "/spell-room", 
    imageSrc: "/images/portal-spell.png",
    signImageSrc: "/images/spell-room-sign.png",
    // UPDATED GLOW: Using explicit drop-shadow classes to match the school page style
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
    title: "Magickal Tools", // RENAMED
    href: "/magickal-tools", // UPDATED LINK
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portalSoundsRef = useRef<{[key: string]: any}>({});

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
        
        <div className="relative z-20 flex flex-col items-center w-full max-w-7xl">
            <header className="text-center text-white">
                <div 
                  className="relative w-full mx-auto aspect-3/1 h-[10vh] md:h-[18vh]"
                  style={{ 
                    filter: 'drop-shadow(2px 2px 8px rgba(0,0,0,0.8))',
                    maxWidth: 'min(480px, 80vw)',
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