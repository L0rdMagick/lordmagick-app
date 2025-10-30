"use client"; // THE FIX: This must be a client component to handle user events.

import { useRef } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { libraryBooks } from '../content';
import BookReader from '../BookReader';

// This is an interface for the ref to have proper types.
interface BookReaderRef {
  destroyBook: () => void;
}

// NOTE: This component no longer needs to be async since we're on the client.
// Next.js handles passing params differently for client components.
export default function BookPage({ params }: { params: { bookSlug: string } }) {
  const router = useRouter();
  const bookReaderRef = useRef<BookReaderRef>(null);
  
  const { bookSlug } = params;
  const book = libraryBooks.find((b) => b.slug === bookSlug);

  if (!book) {
    notFound();
  }

  // THE FIX: This function now handles all navigation away from the page.
  const handleNavigate = (path: string) => {
    // 1. Check if the book reader ref exists and call our exposed destroy function.
    if (bookReaderRef.current) {
      bookReaderRef.current.destroyBook();
    }
    // 2. Only after the cleanup is done, navigate to the new page.
    router.push(path);
  };

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur" />
      
      <nav className="fixed top-0 left-0 right-0 z-50 flex flex-col sm:flex-row justify-between items-center p-4 gap-2">
        {/* THE FIX: Changed from <Link> to <button> to run our function onClick. */}
        <button 
          onClick={() => handleNavigate('/library')} 
          className="text-gray-300 hover:text-amber-300 transition-colors duration-300 text-lg" 
          style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}
        >
          &larr; Back to Bookshelf
        </button>
        <button 
          onClick={() => handleNavigate('/hall')}
          className="text-gray-300 hover:text-amber-300 transition-colors duration-300 text-lg" 
          style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}
        >
          Return to Grand Hall &rarr;
        </button>
      </nav>

      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 pt-20 sm:pt-16">
        {/* THE FIX: Pass the ref to the BookReader component. */}
        <BookReader book={book} ref={bookReaderRef} />
      </div>
    </main>
  );
}