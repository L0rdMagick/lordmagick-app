/// <reference lib="dom" />
"use client";

// --- START OF FILE src/app/library/BookshelfClient.tsx ---

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { BookSummary } from '@/lib/library';

interface BookshelfClientProps {
  books: BookSummary[];
}

export default function BookshelfClient({ books }: BookshelfClientProps) {
  useEffect(() => {
    // FIX: Safe access to document via globalThis to prevent SSR build errors
    const doc = (globalThis as any).document;
    if (doc) {
        doc.body.style.overflow = 'auto';
    }
  }, []);
  return (
    <div className="relative z-10 mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
      {books.map((book) => (
        <Link key={book.slug} href={`/library/${book.slug}`} className="group flex flex-col items-center text-center transition-all duration-300 hover:scale-105 active:scale-95">
          <div className="relative w-full aspect-2/3 rounded-lg shadow-2xl shadow-black/50 overflow-hidden transform transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-3" style={{ filter: 'drop-shadow(4px 8px 15px rgba(0,0,0,0.7))' }}>
            <Image src={book.coverImage} alt={`${book.title} cover`} fill style={{ objectFit: 'cover' }} sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" />
          </div>
          <h2 className="mt-4 font-semibold text-gray-200 group-hover:text-amber-300">{book.title}</h2>
        </Link>
      ))}
    </div>
  );
}