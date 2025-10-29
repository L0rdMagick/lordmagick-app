"use client"; // This must be the very first line

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Define the shape of our sparkle state
interface SparkleState {
  active: boolean;
  x: number;
  y: number;
}

const portals = [
  // ... (portal data remains the same)
  {
    title: "Spell Room",
    href: "/spell-room",
    imageSrc: "/images/portal-spell.png",
    interactiveGlow: "group-hover:[--glow-color:theme(colors.purple.500)] active:[--glow-color:theme(colors.purple.500)]",
  },
  {
    title: "Oracle Room",
    href: "/oracle-room",
    imageSrc: "/images/portal-oracle.png",
    interactiveGlow: "group-hover:[--glow-color:theme(colors.cyan.500)] active:[--glow-color:theme(colors.cyan.500)]",
  },
  {
    title: "The Library",
    href: "/library",
    imageSrc: "/images/portal-library.png",
    interactiveGlow: "group-hover:[--glow-color:theme(colors.orange.500)] active:[--glow-color:theme(colors.orange.500)]",
  },
  {
    title: "Marketplace",
    href: "/marketplace",
    imageSrc: "/images/portal-marketplace.png",
    interactiveGlow: "group-hover:[--glow-color:theme(colors.green.500)] active:[--glow-color:theme(colors.green.500)]",
  },
];

export default function HallPage() {
  const router = useRouter();
  const [sparkle, setSparkle] = useState<SparkleState>({ active: false, x: 0, y: 0 });

  const handlePortalClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Prevent the link from navigating immediately
    e.preventDefault();

    // Show the sparkle animation at the click coordinates
    setSparkle({ active: true, x: e.clientX, y: e.clientY });

    // After the sparkle animation finishes (700ms), navigate to the new page
    setTimeout(() => {
      router.push(href);
    }, 700);
  };

  return (
    <>
      <main className="relative min-h-screen w-full bg-black">
        {/* Background Image Layer (no changes) */}
        <div className="fixed inset-0 z-0">
          <Image
            src="/images/grand-hall-bg.png"
            alt="The Grand Hall of LordMagick.com"
            fill
            style={{ objectFit: 'cover' }}
            quality={100}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content Layer (no changes) */}
        <div className="relative z-20 flex flex-col items-center w-full px-4 pt-8 pb-16 sm:px-8 sm:pb-24">
          <header className="text-center mb-12 text-white">
            <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto mb-4" style={{ filter: 'drop-shadow(2px 2px 8px rgba(0,0,0,0.8))' }}>
              <Image
                src="/images/logo-lordmagick.com.png"
                alt="LordMagick.com Logo"
                width={600}
                height={200}
                priority
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <p className="text-lg md:text-xl text-amber-300" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
              Unlock Ancient Secrets. Master Your Craft.
            </p>
          </header>

          {/* Responsive Portal Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 w-full max-w-7xl">
            {portals.map((portal) => (
              <Link
                key={portal.title}
                href={portal.href}
                onClick={(e) => handlePortalClick(e, portal.href)}
                className={`group flex flex-col items-center transition-all duration-300 hover:scale-105 active:scale-95 ${portal.interactiveGlow}`}
                style={{
                  '--glow-color': 'transparent',
                  filter: 'drop-shadow(8px 12px 20px rgba(0,0,0,0.8)) drop-shadow(0 0 15px var(--glow-color))'
                } as React.CSSProperties}
              >
                <div className="relative w-full aspect-3/4">
                  <Image
                    src={portal.imageSrc}
                    alt={`${portal.title} Portal`}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                {/* NEW: Stone Plaque for the title */}
                <div className="mt-4 w-4/5 py-2 px-4 bg-[url('/images/stone-plaque-bg.png')] bg-cover bg-center rounded-md border-2 border-black/50 shadow-lg">
                  <span 
                    className="block text-center text-md sm:text-lg text-gray-300 font-semibold tracking-wider"
                    // This CSS creates the engraved/carved text effect
                    style={{ textShadow: '-1px -1px 1px rgba(255,255,255,0.15), 1px 1px 1px rgba(0,0,0,0.8)' }}
                  >
                    {portal.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* NEW: Conditionally rendered sparkle effect */}
      {sparkle.active && (
        <div
          className="fixed pointer-events-none z-50 w-32 h-32 bg-[url('/images/sparkle-sprite.png')] bg-no-repeat"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            // Center the animation on the cursor
            transform: 'translate(-50%, -50%)',
            // This animation plays once and stops, lasting 0.7 seconds
            animation: 'play-sparkle 0.7s steps(24) forwards',
          }}
          // Hide the element after the animation is done
          onAnimationEnd={() => setSparkle({ active: false, x: 0, y: 0 })}
        />
      )}
    </>
  );
}