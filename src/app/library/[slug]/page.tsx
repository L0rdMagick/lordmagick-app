"use client"; // This is now a Client Component.

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Book } from '@/lib/library'; // We still need the Book type
import BookReader from '../BookReader';
import Link from 'next/link';

// A simple loading component to show while we fetch the book data.
function LoadingSpinner() {
  return (
    <div className="text-center text-amber-200 text-2xl">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-200 mx-auto mb-4"></div>
      Unsealing the Tome...
    </div>
  );
}

export default function BookPage() {
  // useParams is a client-side hook to get URL parameters.
  // This replaces the broken server-side 'params' prop.
  const params = useParams();
  const slug = params.slug as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs in the browser after the page loads.
    if (slug) {
      const fetchBook = async () => {
        try {
          setLoading(true);
          // We fetch the data from our new API endpoint.
          const response = await fetch(`/api/books/${slug}`);
          
          if (!response.ok) {
            throw new Error('The tome could not be found.');
          }
          
          const data: Book = await response.json();
          setBook(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchBook();
    }
  }, [slug]); // Rerun this effect if the slug changes.

  // --- Main Render Logic ---

  // The content of the main page wrapper.
  const pageContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <div className="text-center text-red-400 text-2xl">Error: {error}</div>;
    }
    if (book) {
      return <BookReader book={book} />;
    }
    // This will handle the case where the slug is somehow missing.
    return <div className="text-center text-red-400 text-2xl">Invalid book specified.</div>;
  };

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur" />
      <nav className="fixed top-0 left-0 right-0 z-50 flex flex-col sm:flex-row justify-between items-center p-4 gap-2">
        <Link href="/library" className="text-gray-300 hover:text-amber-300 transition-colors duration-300 text-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
          &larr; Back to Bookshelf
        </Link>
        <Link href="/hall" className="text-gray-300 hover:text-amber-300 transition-colors duration-300 text-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
          Return to Grand Hall &rarr;
        </Link>
      </nav>
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 pt-20 sm:pt-16">
        {pageContent()}
      </div>
    </main>
  );
}