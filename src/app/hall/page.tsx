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
    interactiveGlow: "group-hover:[--glow-color:theme(colors.purple.500)] active:[--glow-color:theme(colors.purple.500)]",
    soundSrc: "/audio/sfx-spell-room-portal.mp3",
    isExternal: false,
  },
  {
    title: "Oracle Room",
    href: "/oracle-room",
    imageSrc: "/images/portal-oracle.png",
    signImageSrc: "/images/oracle-room-sign.png",
    interactiveGlow: "group-hover:[--glow-color:theme(colors.cyan.500)] active:[--glow-color:theme(colors.cyan.500)]",
    soundSrc: "/audio/sfx-oracle-room-portal.mp3",
    isExternal: false,
  },
  {
    title: "The Library",
    href: "/library",
    imageSrc: "/images/portal-library.png",
    signImageSrc: "/images/the-library-sign.png",
    interactiveGlow: "group-hover:[--glow-color:theme(colors.orange.500)] active:[--glow-color:theme(colors.orange.500)]",
    soundSrc: "/audio/sfx-library-portal.mp3",
    isExternal: false,
  },
  {
    title: "Marketplace",
    href: "/marketplace",
    imageSrc: "/images/portal-marketplace.png",
    signImageSrc: "/images/marketplace-sign.png",
    interactiveGlow: "group-hover:[--glow-color:theme(colors.green.500)] active:[--glow-color:theme(colors.green.500)]",
    soundSrc: "/audio/sfx-marketplace-portal.mp3",
    isExternal: false,
  },
];

const SFX_VOLUME = 0.2;

export default function HallPage() {
  const router = useRouter();
  const [sparkle, setSparkle] = useState<SparkleState | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<{ href: string; isExternal: boolean } | null>(null);
  const portalSoundsRef = useRef<{[key: string]: HTMLAudioElement}>({});

  useEffect(() => {
    portals.forEach(portal => {
      const audio = new Audio(portal.soundSrc);
      audio.volume = SFX_VOLUME;
      portalSoundsRef.current[portal.soundSrc] = audio;
    });
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
        window.open(navigatingTo.href, '_blank', 'noopener,noreferrer');
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
        className="relative h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ease: 'easeInOut', duration: 2.0 }}
      >
        <div className="fixed inset-0 z-0">
            <Image src="/images/grand-hall-bg.png" alt="The Grand Hall" fill style={{ objectFit: 'cover' }} quality={100} />
            <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-20 flex flex-col items-center w-full max-w-7xl">
            {/* THE FIX: Header margins are now responsive to viewport height (vh) */}
            <header className="text-center mb-[2vh] text-white">
                <div 
                  className="relative w-full mx-auto mb-[1vh]" 
                  // THE FIX: Logo's max-width AND max-height scale with viewport, ensuring it shrinks to fit.
                  style={{ 
                    filter: 'drop-shadow(2px 2px 8px rgba(0,0,0,0.8))',
                    maxWidth: 'min(512px, 80vw)', // Cap the width on mobile
                    maxHeight: '15vh' // The key change: limits height based on screen height
                  }}
                >
                    <Image src="/images/logo-lordmagick.com.png" alt="LordMagick.com Logo" fill style={{ objectFit: 'contain' }} priority />
                </div>
                <p 
                  className="text-amber-300" 
                  // THE FIX: Font size scales with viewport width/height for a balanced look.
                  style={{ 
                    textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                    fontSize: 'clamp(1rem, 2.5vh, 1.25rem)' // Responsive font size
                  }}
                >
                    Unlock Ancient Secrets. Master Your Craft.
                </p>
            </header>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 sm:gap-x-8 w-full">
                {portals.map((portal) => (
                    <div key={portal.title} className="flex flex-col items-center gap-y-1">
                        <div className="relative w-full max-w-[200px] aspect-3/1" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.6))' }}>
                            <Image src={portal.signImageSrc} alt={`${portal.title} Sign`} fill style={{ objectFit: 'contain' }} />
                        </div>
                        <a 
                          href={portal.href} 
                          onClick={(e) => handlePortalClick(e, portal.href, portal.soundSrc, portal.isExternal)} 
                          className={`relative w-full aspect-3/4 group block cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${portal.interactiveGlow}`} 
                          style={{ '--glow-color': 'transparent', filter: 'drop-shadow(8px 12px 20px rgba(0,0,0,0.8)) drop-shadow(0 0 15px var(--glow-color))' } as React.CSSProperties}
                        >
                            <Image src={portal.imageSrc} alt={`${portal.title} Portal`} fill style={{ objectFit: 'contain' }} className="transition-transform duration-300 group-hover:scale-110" />
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