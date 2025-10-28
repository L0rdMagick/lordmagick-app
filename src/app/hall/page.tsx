import Image from 'next/image';
import Link from 'next/link';

// Portal data remains the same.
const portals = [
  {
    title: "Spell Room",
    href: "/spell-room",
    imageSrc: "/images/portal-spell.png",
    hoverGlow: "group-hover:[--glow-color:theme(colors.purple.500)]",
  },
  {
    title: "Oracle Room",
    href: "/oracle-room",
    imageSrc: "/images/portal-oracle.png",
    hoverGlow: "group-hover:[--glow-color:theme(colors.cyan.500)]",
  },
  {
    title: "The Library",
    href: "/library",
    imageSrc: "/images/portal-library.png",
    hoverGlow: "group-hover:[--glow-color:theme(colors.orange.500)]",
  },
  {
    title: "Marketplace",
    href: "/marketplace",
    imageSrc: "/images/portal-marketplace.png",
    hoverGlow: "group-hover:[--glow-color:theme(colors.green.500)]",
  },
];

export default function HallPage() {
  return (
    <main className="relative h-screen w-screen overflow-y-auto">
      {/* Background Image Layer */}
      <Image
        src="/images/grand-hall-bg.png"
        alt="The Grand Hall of LordMagick.com"
        fill
        style={{ objectFit: 'cover' }}
        className="z-0"
      />
      {/* Black overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Content Layer */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
        {/* Header Section */}
        <header className="text-center mb-8 text-white">
          {/* UPDATED: Replaced H1 text with your logo image */}
          <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto mb-4" style={{ filter: 'drop-shadow(2px 2px 8px rgba(0,0,0,0.8))' }}>
            <Image
              src="/images/logo-lordmagick.com.png"
              alt="LordMagick.com Logo"
              width={600} // The native width of your logo image
              height={200} // The native height of your logo image
              style={{ width: '100%', height: 'auto' }} // Makes the image responsive
            />
          </div>
          {/* UPDATED: Styled the sub-header with the new font and gold color */}
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
              // UPDATED: Removed background, blur, and border. Kept hover effects.
              className={`group flex flex-col items-center transition-all duration-300 hover:scale-105 ${portal.hoverGlow}`}
              // We define a CSS variable for the glow color, which is used in the filter below.
              style={{ '--glow-color': 'transparent', filter: 'drop-shadow(0 0 15px var(--glow-color))' } as React.CSSProperties}
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
              <span className="mt-4 text-center font-semibold text-white text-md sm:text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}>
                {portal.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}