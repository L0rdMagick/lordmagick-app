/// <reference lib="dom" />
"use client";

// --- START OF FILE src/app/the-magick-psychic-school/the-magick-library/[slug]/page.tsx ---

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BookReader from '@/app/components/BookReader';
import TableOfContents, { Chapter } from '@/app/components/TableOfContents';
import MagickalBackLink from '@/app/components/MagickalBackLink';

function LoadingSpinner() {
  return (
    <div className="text-center text-amber-200 text-2xl">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-200 mx-auto mb-4"></div>
      Unsealing the Tome...
    </div>
  );
}

interface BookData {
  title: string;
  content: string;
}

export default function BookPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [bookData, setBookData] = useState<{ title: string; processedContent: string; chapters: Chapter[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTocOpen, setIsTocOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      const fetchBook = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await fetch(`/api/books/${slug}`);
          if (!response.ok) {
            // FIX: Cast errorData to any to avoid 'unknown' type error
            const errorData = await response.json() as any;
            throw new Error(errorData.error || 'The tome could not be found.');
          }
          // FIX: Cast data to BookData
          const data = await response.json() as BookData;

          // FIX: Safe access to DOMParser via globalThis
          const WinDOMParser = (globalThis as any).DOMParser;
          if (WinDOMParser) {
              const parser = new WinDOMParser();
              const doc = parser.parseFromString(data.content, 'text/html');
              const headings = Array.from(doc.querySelectorAll('h2'));
              
              // FIX: Explicitly cast heading to any to avoid 'unknown' type error in map
              const chapters: Chapter[] = headings.map((heading: any, index: number) => {
                const id = `chapter-${index}`;
                heading.id = id;
                return { id, title: heading.textContent || 'Unnamed Chapter' };
              });
              const processedContent = doc.body.innerHTML;

              setBookData({ title: data.title, processedContent, chapters });
          } else {
              // Fallback if DOMParser isn't available (SSR context or obscure browser)
              setBookData({ title: data.title, processedContent: data.content, chapters: [] });
          }

        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchBook();
    }
  }, [slug]);

  const handleChapterSelect = (chapterId: string) => {
    // FIX: Safe access to document via globalThis
    const doc = (globalThis as any).document;
    if (doc) {
        const chapterElement = doc.getElementById(chapterId);
        if (chapterElement) {
             chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    setIsTocOpen(false); // Close TOC after selection
  };

  const pageContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-400 text-xl">Error: {error}</div>;
    if (bookData) return (
      <BookReader
        title={bookData.title}
        content={bookData.processedContent}
        onTocToggle={() => setIsTocOpen(!isTocOpen)}
      />
    );
    return null;
  };

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-4 md:p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur" />

      {bookData && (
        <TableOfContents
          chapters={bookData.chapters}
          isOpen={isTocOpen}
          onClose={() => setIsTocOpen(false)}
        />
      )}

      <MagickalBackLink 
        href="/the-magick-psychic-school/the-magick-library"
        text="Return to Library"
        className="absolute top-6 left-6 z-20"
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        {pageContent()}
      </div>
    </main>
  );
}