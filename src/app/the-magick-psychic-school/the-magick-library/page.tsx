"use client";

import { getAllBooks } from '@/lib/library';
import BookshelfClient from '@/app/components/BookshelfClient';
import RoomsButton from '@/app/components/RoomsButton';
import MagickalBackLink from '@/app/components/MagickalBackLink';

export default function LibraryPage() {
  const allBooks = getAllBooks();
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* UPDATED HEADER */}
      <header className="relative z-20 w-full shrink-0 mb-12">
        <div className="flex justify-between items-center flex-wrap w-full max-w-7xl mx-auto">
          <div className="order-1">
            <MagickalBackLink href="/the-magick-psychic-school" text="The School" />
          </div>
          <div className="order-2 md:order-3">
            <RoomsButton />
          </div>
          <h1 className="w-full text-center order-3 md:w-auto md:order-2 text-4xl md:text-5xl font-serif text-amber-300 mt-2 md:mt-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            The Magick Library
          </h1>
        </div>
        <p className="relative z-20 text-center text-gray-200 mt-2 max-w-2xl mx-auto font-medium text-sm md:text-base" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}>
            Ancient tomes and arcane knowledge await. Peruse the shelves for wisdom lost to time.
        </p>
      </header>

      <BookshelfClient books={allBooks} />
    </main>
  );
}