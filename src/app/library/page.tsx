"use client"; // NEW: Convert this to a client component to use hooks.

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react'; // NEW: Import useEffect
import { libraryBooks } from './content';

export default function LibraryPage() {
  
  // THE FIX: This useEffect hook runs every time you navigate to the bookshelf.
  // It forcefully resets the body's overflow style, guaranteeing the scrollbar returns.
  useEffect(() => {
    document.body.style.overflow = 'auto';
  }, []); // The empty array ensures this runs once when the component mounts.

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="relative z-10 text-center text-white">
        <h1 className="text-5xl md:text-6xl text-amber-300" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          The Library
        </h1>
        <p className="mt-4 text-lg text-gray-300">Select a tome to begin your studies.</p>
      </div>

      {/* The Bookshelf */}
      <div className="relative z-10 mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {libraryBooks.map((book) => (
          <Link
            key={book.slug}
            href={`/library/${book.slug}`}
            className="group flex flex-col items-center text-center transition-all duration-300 hover:scale-105! active:scale-95"
          >
            <div 
              className="relative w-full aspect-2/3 rounded-lg shadow-2xl shadow-black/50 overflow-hidden transform transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-3"
              style={{ filter: 'drop-shadow(4px 8px 15px rgba(0,0,0,0.7))' }}
            >
              <Image
                src={book.coverImage}
                alt={`${book.title} cover`}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <h2 className="mt-4 font-semibold text-gray-200 group-hover:text-amber-300">
              {book.title}
            </h2>
          </Link>
        ))}
      </div>
    </main>
  );
}