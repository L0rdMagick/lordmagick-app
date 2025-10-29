"use client";

import React, { useRef, useCallback } from 'react';
import Image from 'next/image'; // NEW: Import the Image component
import HTMLFlipBook from 'react-pageflip';
import { Book } from './content';
import { Crimson_Text } from 'next/font/google'; // NEW: Import the new font

// NEW: Initialize the font for the book's interior pages
const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '700'], // Include normal and bold weights
});

// --- Helper Components for different page types ---

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => {
  return (
    <div 
      ref={ref} 
      className="flex items-center justify-center p-8 md:p-12 bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover bg-center shadow-inner shadow-black/30"
    >
      <div className="text-gray-800 text-lg leading-relaxed">{children}</div>
    </div>
  );
});
Page.displayName = 'Page';

// THE FIX 1: The CoverPage component now accepts and displays an image
const CoverPage = React.forwardRef<HTMLDivElement, { title: string, coverImage: string }>(({ title, coverImage }, ref) => {
  return (
    <div ref={ref} className="relative bg-gray-900 flex flex-col items-center justify-center p-4 shadow-lg shadow-black/50">
      <Image 
        src={coverImage}
        alt={`${title} cover`}
        fill
        style={{ objectFit: 'cover' }}
        priority // Load the cover image faster
      />
      {/* Add a dark overlay to ensure the title is always readable */}
      <div className="absolute inset-0 bg-black/40" />
      <h1 className="relative z-10 text-3xl text-amber-200 text-center" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
        {title}
      </h1>
    </div>
  );
});
CoverPage.displayName = 'CoverPage';

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
      {/* THE FIX 2: Apply the new font's className to the book container */}
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
        className={`shadow-2xl shadow-black/70 ${crimsonText.className}`}
        ref={flipBookRef}
      >
        {/* THE FIX 3: Pass the cover image URL to the CoverPage component */}
        <CoverPage title={book.title} coverImage={book.coverImage} />
        
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