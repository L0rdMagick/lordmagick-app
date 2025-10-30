"use client";

import { useParams } from 'next/navigation';
import BookReader from '../BookReader';
import Link from 'next/link';

export default function BookPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur" />
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-end items-center p-4 gap-4">
        {/* The back button is now inside the reader, but we can keep these global links. */}
        <Link href="/library" className="text-gray-300 hover:text-amber-300 transition-colors duration-300 text-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
          &larr; Bookshelf
        </Link>
        <Link href="/hall" className="text-gray-300 hover:text-amber-300 transition-colors duration-300 text-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
          Grand Hall &rarr;
        </Link>
      </nav>
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 pt-20 sm:pt-16">
        {/* We pass the slug to the BookReader, which will handle fetching and rendering. */}
        {slug ? <BookReader slug={slug} /> : <p>Loading book...</p>}
      </div>
    </main>
  );
}