"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BookReader from '../BookReader';
import Link from 'next/link';

function LoadingSpinner() {
  return (
    <div className="text-center text-amber-200 text-2xl">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-200 mx-auto mb-4"></div>
      Unsealing the Tome...
    </div>
  );
}

// Define the shape of the data we expect from our new API.
interface BookData {
  title: string;
  content: string;
}

export default function BookPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [bookData, setBookData] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchBook = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await fetch(`/api/books/${slug}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'The tome could not be found.');
          }
          
          const data: BookData = await response.json();
          setBookData(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchBook();
    }
  }, [slug]);

  const pageContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-400 text-xl">Error: {error}</div>;
    if (bookData) return <BookReader title={bookData.title} content={bookData.content} />;
    return null;
  };

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur" />
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-end items-center p-4 gap-4">
        <Link href="/library" className="text-gray-300 hover:text-amber-300" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
          &larr; Bookshelf
        </Link>
        <Link href="/hall" className="text-gray-300 hover:text-amber-300" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
          Grand Hall &rarr;
        </Link>
      </nav>
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8">
        {pageContent()}
      </div>
    </main>
  );
}