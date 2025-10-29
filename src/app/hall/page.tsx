"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, MouseEvent, useEffect } from 'react';
import Sparkle from '../components/Sparkle';

// (Interface and portal data remain the same)
interface SparkleState {
  key: number;
  x: number;
  y: number;
}
const portals = [
  {
    title: "Spell Room",
    href: "/spell-room",
    imageSrc: "/images/portal-spell.png",
    signImageSrc: "/images/spell-room-sign.png",
    interactiveGlow: "group-hover:[--glow-color:theme(colors.purple.500)] active:[--glow-color:theme(colors.purple.500)]",
    soundSrc: "/audio/sfx-spell-room-portal.mp3",
  },
  {
    title: "Oracle Room",
    href: "/oracle-room",
    imageSrc: "/images/portal-oracle.png",
    signImageSrc: "/images/oracle-room-sign.png",
    interactiveGlow: "group-hover:[--glow-color:theme(colors.cyan.500)] active:[--glow-color:theme(colors.cyan.500)]",
    soundSrc: "/audio/sfx-oracle-room-portal.mp3",
  },
  {
    title: "The Library",
    href: "/library",
    imageSrc: "/images/portal-library.png",
    signImageSrc: "/images/the-library-sign.png",
    interactiveGlow: "group-hover:[--glow-color:theme(colors.orange.500)] active:[--glow-color:theme(colors.orange.500)]",
    soundSrc: "/audio/sfx-library-portal.mp3",
  },
  {
    title: "Marketplace",
    href: "/marketplace",
    imageSrc: "/images/portal-marketplace.png",
    signImageSrc: "/images/marketplace-sign.png",
    interactiveGlow: "group-hover:[--glow-color:theme(colors.green.500)] active:[--glow-color:theme(colors.green.500)]",
    soundSrc: "/audio/sfx-marketplace-portal.mp3",
  },
];

const MASTER_VOLUME = 0.25;

export default function HallPage() {
  const router = useRouter();
  const [sparkle, setSparkle] = useState<SparkleState | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const portalSoundsRef = useRef<{[key: string]: HTMLAudioElement}>({});

  useEffect(() => {
    const droneSound = new Audio('/audio/sfx-drone-main-hall.mp3');
    droneSound.loop = true;
    droneSound.volume = .5;
    droneSound.play().catch(error => console.error("Drone audio failed to play:", error));

    portals.forEach(portal => {
      const audio = new Audio(portal.soundSrc);
      audio.volume = MASTER_VOLUME;
      portalSoundsRef.current[portal.soundSrc] = audio;
    });

    return () => {
      droneSound.pause();
      droneSound.currentTime = 0;
    };
  }, []);

  const handlePortalClick = (e: MouseEvent<HTMLAnchorElement>, href: string, soundSrc: string) => {
    e.preventDefault();
    if (navigatingTo) return;

    setNavigatingTo(href);
    
    const clickSound = portalSoundsRef.current[soundSrc];
    if (clickSound) {
      clickSound.currentTime = 0;
      clickSound.play();
    }

    setSparkle({ key: Date.now(), x: e.clientX, y: e.clientY });
  };

  const handleAnimationComplete = () => {
    if (navigatingTo) {
      router.push(navigatingTo);
    }
    setSparkle(null);
    setNavigatingTo(null);
  };

  return (
    <>
      <main className="relative min-h-screen w-full bg-black">
        {/* Background Layer */}
        <div className="fixed inset-0 z-0"><Image src="/images/grand-hall-bg.png" alt="The Grand Hall" fill style={{ objectFit: 'cover' }} quality={100} /><div className="absolute inset-0 bg-black/40" /></div>

        {/* 
          MOBILE FIX 1: Reduced horizontal padding on the smallest screens.
          Changed `px-4` to `px-2` to give the grid more space.
        */}
        <div className="relative z-20 flex flex-col items-center w-full px-2 sm:px-8 pt-8 pb-16 sm:pb-24">
            <header className="text-center mb-12 text-white"><div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto mb-4" style={{ filter: 'drop-shadow(2px 2px 8px rgba(0,0,0,0.8))' }}><Image src="/images/logo-lordmagick.com.png" alt="LordMagick.com Logo" width={600} height={200} priority style={{ width: '100%', height: 'auto' }} /></div><p className="text-lg md:text-xl text-amber-300" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>Unlock Ancient Secrets. Master Your Craft.</p></header>

            {/* 
              MOBILE FIX 2: Reduced the gap between columns on the smallest screens.
              Changed `gap-4` to `gap-x-2 gap-y-4` to make the horizontal gap smaller.
            */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-4 sm:gap-8 w-full max-w-7xl">
                {portals.map((portal) => (
                    <div key={portal.title} className="flex flex-col items-center gap-y-2">
                        {/* The sign will automatically grow with its container */}
                        <div className="relative w-full max-w-[200px] aspect-3/1" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.6))' }}><Image src={portal.signImageSrc} alt={`${portal.title} Sign`} fill style={{ objectFit: 'contain' }} /></div>
                        
                        {/* The portal will automatically grow with its container */}
                        <a 
                          href={portal.href} 
                          onClick={(e) => handlePortalClick(e, portal.href, portal.soundSrc)} 
                          className={`relative w-full aspect-3/4 group block cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${portal.interactiveGlow}`} style={{ '--glow-color': 'transparent', filter: 'drop-shadow(8px 12px 20px rgba(0,0,0,0.8)) drop-shadow(0 0 15px var(--glow-color))' } as React.CSSProperties}
                        >
                            <Image src={portal.imageSrc} alt={`${portal.title} Portal`} fill style={{ objectFit: 'contain' }} className="transition-transform duration-300 group-hover:scale-110" />
                        </a>
                    </div>
                ))}
            </div>
        </div>
      </main>

      {/* Sparkle effect (no changes) */}
      {sparkle && (
        <div
          key={sparkle.key}
          className="fixed z-50 pointer-events-none"
          style={{ left: sparkle.x, top: sparkle.y }}
        >
          <Sparkle onAnimationComplete={handleAnimationComplete} />
        </div>
      )}
    </>
  );
}