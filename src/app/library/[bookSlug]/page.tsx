"use client"; // CRITICAL: Convert to a Client Component

import { useState, useEffect } from 'react';
import { useRouter, notFound, useParams } from 'next/navigation';
import { libraryBooks } from '../content';
import BookReader from '../BookReader';

// This page must be a client component to manage state and routing hooks.
export default function BookPage() {
  const router = useRouter();
  const params = useParams(); // Hook to get URL parameters like 'bookSlug'
  const { bookSlug } = params;

  // Find the book data based on the slug from the URL
  const book = libraryBooks.find((b) => b.slug === bookSlug);

  // State to control the visibility of the BookReader component
  const [isBookVisible, setIsBookVisible] = useState(true);

  // The new navigation handler that fixes the bug
  const handleNavigate = (path: string) => {
    // Step 1: Hide the BookReader component. This forces it to unmount
    // and removes its lingering invisible layer from the page.
    setIsBookVisible(false);

    // Step 2: Use the router to navigate. We add a tiny delay to ensure
    // React has time to process the state change and unmount the component
    // before the page transition animation starts.
    setTimeout(() => {
      router.push(path);
    }, 50); 
  };
  
  // This hook handles the case where a user enters an invalid book URL.
  // It must be inside a hook now that this is a Client Component.
  useEffect(() => {
    if (!book && bookSlug) {
      notFound();
    }
  }, [book, bookSlug]);

  // If the book data hasn't been found yet, return null to prevent errors.
  if (!book) {
    return null;
  }

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur" />
      
      {/* Navigation Links are now <button> elements to use our custom handler */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex flex-col sm:flex-row justify-between items-center p-4 gap-2">
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
        {/* THE FIX: We only render the BookReader if isBookVisible is true. */}
        {isBookVisible && <BookReader book={book} />}
      </div>
    </main>
  );
}