"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';
import { tarotProducts } from '@/lib/marketplaceData';

export default function TarotDecksPage() {
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <header className="relative z-20 w-full p-4 md:p-6 shrink-0">
        <div className="flex justify-between items-center flex-wrap w-full max-w-7xl mx-auto">
          <div className="order-1">
            <MagickalBackLink href="/magickal-tools" text="Magickal Tools" />
          </div>
          <div className="order-2 md:order-3">
            <RoomsButton />
          </div>
          <h1 className="w-full text-center order-3 md:w-auto md:order-2 text-4xl md:text-5xl font-serif text-amber-300 mt-2 md:mt-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Tarot Decks
          </h1>
        </div>
      </header>

      <div className="relative z-10 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {tarotProducts.map((product) => (
            <Link key={product.slug} href={`/magickal-tools/tarot-decks/${product.slug}`} className="group block">
                <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg shadow-2xl shadow-black/50 transform transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2 border border-white/10 group-hover:border-amber-400/50">
                    <Image 
                        src={product.coverImage}
                        alt={`${product.name} cover`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        style={{ objectFit: 'cover' }}
                    />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                        <span className="text-white text-lg font-serif font-bold border-2 border-white px-6 py-2 rounded-full tracking-widest uppercase hover:bg-white hover:text-black transition-colors">View Deck</span>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <h3 className="text-xl font-bold font-serif text-gray-200 group-hover:text-amber-300 transition-colors">{product.name}</h3>
                    <p className="text-sm text-amber-500/80 font-mono uppercase tracking-widest">{product.tagline}</p>
                    <p className="text-lg font-semibold text-gray-400 mt-1">${product.price.toFixed(2)}</p>
                </div>
            </Link>
        ))}
      </div>
    </main>
  );
}