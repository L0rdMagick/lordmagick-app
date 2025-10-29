import Image from 'next/image';
import Link from 'next/link';

const portals = [
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
  return (
    <main className="relative min-h-screen w-full bg-black">
      {/* Background Image Layer */}
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

      {/* Content Layer */}
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
              <span className="mt-2 sm:mt-4 text-center font-semibold text-white text-md sm:text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}>
                {portal.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}