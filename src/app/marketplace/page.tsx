// --- START OF FILE src/app/marketplace/page.tsx ---

import RoomsButton from '../components/RoomsButton';
import { tarotProducts } from '@/lib/marketplaceData';
import Image from 'next/image';
import Link from 'next/link';

export default function MarketplacePage() {
  return (
    <div className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <header className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <h1 className="text-5xl md:text-6xl font-serif text-green-400">The Marketplace</h1>
            <RoomsButton className="ml-0 md:ml-8" />
        </div>
      </header>
      
      <section className="relative z-10 mt-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Link to Magickal Tools */}
            <Link href="/marketplace/magickal-tools" className="group relative h-64 rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-400 transition-all shadow-2xl">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                <div className="absolute inset-0 bg-linear-to-br from-purple-900 to-black"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <h2 className="text-4xl font-serif text-purple-300 group-hover:text-white transition-colors drop-shadow-md">Magickal Tools</h2>
                    <p className="text-gray-300 mt-2 font-light tracking-wide">Wands, Mirrors & Athames</p>
                </div>
            </Link>

            {/* Link to Decks */}
            <div className="relative h-64 rounded-xl overflow-hidden border border-amber-500/30 hover:border-amber-400 transition-all shadow-2xl cursor-default">
                 <div className="absolute inset-0 bg-black/40 z-10"></div>
                 <div className="absolute inset-0 bg-linear-to-br from-amber-900 to-black"></div>
                 <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <h2 className="text-4xl font-serif text-amber-300 drop-shadow-md">Tarot Decks</h2>
                    <p className="text-gray-300 mt-2 font-light tracking-wide">Scroll down to browse</p>
                </div>
            </div>
        </div>

        <h2 className="text-3xl font-serif text-amber-300 text-center mb-8">Mystical Tarot & Oracle Decks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {tarotProducts.map((product) => (
                <Link key={product.slug} href={`/marketplace/tarot/${product.slug}`} className="group block">
                    <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg shadow-2xl shadow-black/50 transform transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
                        <Image 
                            src={product.coverImage}
                            alt={`${product.name} cover`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            style={{ objectFit: 'cover' }}
                        />
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-white text-lg font-bold border-2 border-white px-4 py-2 rounded-md">View Deck</span>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <h3 className="text-xl font-bold font-serif text-gray-200">{product.name}</h3>
                        <p className="text-md text-green-400">{product.tagline}</p>
                        <p className="text-lg font-semibold text-gray-300 mt-1">${product.price.toFixed(2)}</p>
                    </div>
                </Link>
            ))}
        </div>
      </section>

    </div>
  );
}