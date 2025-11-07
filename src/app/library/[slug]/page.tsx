"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BookReader from '../../components/BookReader';
import TableOfContents, { Chapter } from '../../components/TableOfContents';
import MagickalBackLink from '../../components/MagickalBackLink'; // THE FIX: Import the new component

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
            const errorData = await response.json();
            throw new Error(errorData.error || 'The tome could not be found.');
          }
          const data: BookData = await response.json();

          const parser = new DOMParser();
          const doc = parser.parseFromString(data.content, 'text/html');
          const headings = Array.from(doc.querySelectorAll('h2'));
          const chapters: Chapter[] = headings.map((heading, index) => {
            const id = `chapter-${index}`;
            heading.id = id;
            return { id, title: heading.textContent || 'Unnamed Chapter' };
          });
          const processedContent = doc.body.innerHTML;

          setBookData({ title: data.title, processedContent, chapters });

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
    const chapterElement = document.getElementById(chapterId);
    if (chapterElement) {
        // We will pass this down to the BookReader to handle the scroll
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

      {/* THE FIX: Add the back link to the top-left */}
      <MagickalBackLink 
        href="/library"
        text="Return to Library"
        className="absolute top-6 left-6 z-20"
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        {pageContent()}
      </div>
    </main>
  );
}