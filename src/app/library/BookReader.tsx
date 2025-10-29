"use client";

import React, { useRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Book } from './content';

// --- Helper Components for different page types ---

// A single styled page component
const Page = React.forwardRef<HTMLDivElement, { children: React.Node }>(({ children }, ref) => {
  return (
    <div 
      ref={ref} 
      // THE FIX: Added a solid background color (`bg-[#fdf9e8]`) behind the image.
      // This will prevent any see-through effect.
      className="flex items-center justify-center p-8 md:p-12 bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover bg-center shadow-inner shadow-black/30"
    >
      <div className="text-gray-800 text-lg leading-relaxed">{children}</div>
    </div>
  );
});
Page.displayName = 'Page';

// The front cover of the book
const CoverPage = React.forwardRef<HTMLDivElement, { title: string }>(({ title }, ref) => {
  return (
    <div ref={ref} className="bg-gray-800 flex flex-col items-center justify-center p-4 shadow-lg shadow-black/50">
      <h1 className="text-3xl text-amber-200 text-center" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>{title}</h1>
    </div>
  );
});
CoverPage.displayName = 'CoverPage';

// The Table of Contents page
const TableOfContents = React.forwardRef<HTMLDivElement, { book: Book, onChapterClick: (page: number) => void }>(({ book, onChapterClick }, ref) => {
  return (
    <Page ref={ref}>
      <div>
        <h2 className="text-3xl font-bold text-center mb-8 border-b-2 border-gray-500 pb-2">Table of Contents</h2>
        <ul className="space-y-4">
          {book.chapters.map((chapter, index) => (
            <li key={index}>
              <button
                onClick={() => onChapterClick(index + 2)}
                className="hover:text-amber-800 hover:underline transition-colors duration-300 text-left"
              >
                {chapter.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
});
TableOfContents.displayName = 'TableOfContents';


// --- The Main Book Reader Component ---
interface BookReaderProps {
  book: Book;
}
export default function BookReader({ book }: BookReaderProps) {
  const flipBookRef = useRef<any>(null);

  const handleChapterClick = useCallback((pageNumber: number) => {
    flipBookRef.current?.pageFlip().flip(pageNumber);
  }, []);

  return (
    <div className="w-full max-w-5xl aspect-2/1.2">
      <HTMLFlipBook
        width={500}
        height={600}
        size="stretch"
        minWidth={315}
        maxWidth={1000}
        minHeight={420}
        maxHeight={1350}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        className="shadow-2xl shadow-black/70"
        ref={flipBookRef}
      >
        <CoverPage title={book.title} />
        <TableOfContents book={book} onChapterClick={handleChapterClick} />
        {book.chapters.map((chapter, index) => (
          <Page key={index}>
            <div>
              <h3 className="text-2xl font-bold mb-4">{chapter.title}</h3>
              <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
            </div>
          </Page>
        ))}
        <Page>
          <div className="text-center text-gray-500">End of Tome</div>
        </Page>
      </HTMLFlipBook>
    </div>
  );
}