"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, MouseEvent, useEffect } from 'react'; // Import useEffect
import Sparkle from '../components/Sparkle';

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
    soundSrc: "/audio/sfx-spell-room-portal.mp3", // NEW: Unique sound for this portal
  },
  {
    title: "Oracle Room",
    href: "/oracle-room",
    imageSrc: "/images/portal-oracle.png",
    signImageSrc: "/images/oracle-room-sign.png",
    interactiveGlow: "group-hover:[--glow-color:theme(colors.cyan.500)] active:[--glow-color:theme(colors.cyan.500)]",
    soundSrc: "/audio/sfx-oracle-room-portal.mp3", // NEW: Unique sound for this portal
  },
  {
    title: "The Library",
    href: "/library",
    imageSrc: "/images/portal-library.png",
    signImageSrc: "/images/the-library-sign.png",
    interactiveGlow: "group-hover:[--glow-color:theme(colors.orange.500)] active:[--glow-color:theme(colors.orange.500)]",
    soundSrc: "/audio/sfx-library-portal.mp3", // NEW: Unique sound for this portal
  },
  {
    title: "Marketplace",
    href: "/marketplace",
    imageSrc: "/images/portal-marketplace.png",
    signImageSrc: "/images/marketplace-sign.png",
    interactiveGlow: "group-hover:[--glow-color:theme(colors.green.500)] active:[--glow-color:theme(colors.green.500)]",
    soundSrc: "/audio/sfx-marketplace-portal.mp3", // NEW: Unique sound for this portal
  },
];


export default function HallPage() {
  const router = useRouter();
  const [sparkle, setSparkle] = useState<SparkleState | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // NEW: This useEffect hook manages the looping background drone sound
  useEffect(() => {
    // Create the audio object
    const droneSound = new Audio('/audio/sfx-drone-main-hall.mp3');
    droneSound.loop = true; // Set it to loop
    droneSound.volume = 0.3; // Set a comfortable volume

    // Play the sound (catch is for browser autoplay policies)
    droneSound.play().catch(error => console.error("Audio autoplay failed:", error));

    // CRUCIAL: Cleanup function to stop the sound when you leave the page
    return () => {
      droneSound.pause();
      droneSound.currentTime = 0;
    };
  }, []); // The empty array ensures this effect runs only once when the page loads

  const handlePortalClick = (e: MouseEvent<HTMLAnchorElement>, href: string, soundSrc: string) => {
    e.preventDefault();
    if (navigatingTo) return;

    setNavigatingTo(href);

    // NEW: Play the unique one-shot sound for the clicked portal
    const clickSound = new Audio(soundSrc);
    clickSound.play();

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
        {/* All other page content remains the same... */}
        <div className="fixed inset-0 z-0"><Image src="/images/grand-hall-bg.png" alt="The Grand Hall" fill style={{ objectFit: 'cover' }} quality={100} /><div className="absolute inset-0 bg-black/40" /></div>
        <div className="relative z-20 flex flex-col items-center w-full px-4 pt-8 pb-16 sm:px-8 sm:pb-24">
            <header className="text-center mb-12 text-white"><div className="relative w-full max-w-sm md-max-w-md lg-max-w-lg mx-auto mb-4" style={{ filter: 'drop-shadow(2px 2px 8px rgba(0,0,0,0.8))' }}><Image src="/images/logo-lordmagick.com.png" alt="LordMagick.com Logo" width={600} height={200} priority style={{ width: '100%', height: 'auto' }} /></div><p className="text-lg md:text-xl text-amber-300" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>Unlock Ancient Secrets. Master Your Craft.</p></header>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 w-full max-w-7xl">
                {portals.map((portal) => (
                    <div key={portal.title} className="flex flex-col items-center gap-y-2">
                        <div className="relative w-full max-w-[200px] aspect-3/1" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.6))' }}><Image src={portal.signImageSrc} alt={`${portal.title} Sign`} fill style={{ objectFit: 'contain' }} /></div>
                        <a 
                          href={portal.href} 
                          // NEW: Pass the unique sound source to the handler
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