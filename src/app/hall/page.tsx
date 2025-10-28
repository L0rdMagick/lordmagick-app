import Image from 'next/image';
import Link from 'next/link';

// We'll define our portal data in an array. This makes the code clean and easy to manage.
const portals = [
  {
    title: "Spell Room",
    href: "/spell-room",
    imageSrc: "/images/portal-spell.png",
    hoverColor: "hover:shadow-purple-500/50",
  },
  {
    title: "Oracle Room",
    href: "/oracle-room",
    imageSrc: "/images/portal-oracle.png",
    hoverColor: "hover:shadow-cyan-500/50",
  },
  {
    title: "The Library",
    href: "/library",
    imageSrc: "/images/portal-library.png",
    hoverColor: "hover:shadow-orange-500/50",
  },
  {
    title: "Marketplace",
    href: "/marketplace",
    imageSrc: "/images/portal-marketplace.png",
    hoverColor: "hover:shadow-green-500/50",
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
      {/* Black overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Content Layer */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
        {/* Header Text */}
        <header className="text-center mb-8 text-white">
          <h1 className="text-5xl md:text-7xl font-serif" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
            LordMagick.com
          </h1>
          <p className="text-lg md:text-xl mt-2 text-gray-300" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
            Unlock Ancient Secrets. Master Your Craft.
          </p>
        </header>

        {/* Responsive Portal Grid */}
        {/* This is the core of the responsive logic. */}
        {/* It's a 2-column grid on small screens, and a 4-column grid on medium screens and up. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 w-full max-w-7xl">
          {portals.map((portal) => (
            <Link
              key={portal.title}
              href={portal.href}
              // 'group' allows us to style child elements on hover
              className={`group flex flex-col items-center p-4 bg-black/20 rounded-lg backdrop-blur-sm border border-white/10 shadow-lg transition-all duration-300 hover:bg-black/40 hover:scale-105 hover:shadow-2xl ${portal.hoverColor}`}
            >
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src={portal.imageSrc}
                  alt={`${portal.title} Portal`}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="mt-4 text-center font-semibold text-white text-md sm:text-lg">
                {portal.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}