import Image from 'next/image';
import Link from 'next/link';

export default function HallPage() {
  // NOTE: The 'd' attribute for each SVG path is a placeholder.
  // You will need to generate the real path data using a vector editor (see explanation below).
  const portalPaths = {
    spellRoom: "M250,150 L350,150 L350,450 L250,450 Z", // Placeholder Path
    oracleRoom: "M450,150 L550,150 L550,450 L450,450 Z", // Placeholder Path
    library: "M650,150 L750,150 L750,450 L650,450 Z", // Placeholder Path
    marketplace: "M850,150 L950,150 L950,450 L850,450 Z", // Placeholder Path
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Background Image of the Grand Hall */}
      <Image
        src="/images/grand-hall.png"
        alt="The Grand Hall with four magical portals."
        fill
        style={{ objectFit: 'cover' }}
        className="z-0"
      />

      {/* Interactive SVG Overlay */}
      {/* This SVG sits invisibly on top of the image. Its viewBox should match your image's native resolution. */}
      {/* I'm using a common 1920x1080 resolution as an example. CHANGE THIS to match your image. */}
      <svg
        className="absolute inset-0 z-10 w-full h-full"
        viewBox="0 0 1920 1080"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Spell Room Portal Link */}
        <Link href="/spell-room" className="cursor-pointer group">
          <path
            d={portalPaths.spellRoom}
            className="fill-transparent group-hover:fill-purple-500/30 transition-colors"
          />
        </Link>

        {/* Oracle Room Portal Link */}
        <Link href="/oracle-room" className="cursor-pointer group">
          <path
            d={portalPaths.oracleRoom}
            className="fill-transparent group-hover:fill-cyan-500/30 transition-colors"
          />
        </Link>

        {/* The Library Portal Link */}
        <Link href="/library" className="cursor-pointer group">
          <path
            d={portalPaths.library}
            className="fill-transparent group-hover:fill-orange-500/30 transition-colors"
          />
        </Link>
        
        {/* Marketplace Portal Link */}
        <Link href="/marketplace" className="cursor-pointer group">
          <path
            d={portalPaths.marketplace}
            className="fill-transparent group-hover:fill-green-500/30 transition-colors"
          />
        </Link>
      </svg>
    </main>
  );
}