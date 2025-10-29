"use client";

import React, { useRef, useCallback, useState } from 'react';
import Image from 'next/image';
import HTMLFlipBook from 'react-pageflip';
import { Book } from './content';
import { Crimson_Text, Uncial_Antiqua } from 'next/font/google';

// (Fonts and Page/TableOfContents components remain the same)
const crimsonText = Crimson_Text({ subsets: ['latin'], weight: ['400', '700'], });
const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'], });
const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => ( <div ref={ref} className="flex items-center justify-center p-8 md:p-12 bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover bg-center shadow-inner shadow-black/30"> <div className="text-gray-800 text-lg leading-relaxed">{children}</div> </div> ));
Page.displayName = 'Page';
const TableOfContents = React.forwardRef<HTMLDivElement, { book: Book, onChapterClick: (page: number) => void }>(({ book, onChapterClick }, ref) => ( <Page ref={ref}> <div> <h2 className="text-3xl font-bold text-center mb-8 border-b-2 border-gray-500 pb-2">Table of Contents</h2> <ul className="space-y-4"> {book.chapters.map((chapter, index) => ( <li key={index}> <button onClick={() => onChapterClick(index + 1)} className="hover:text-amber-800 hover:underline transition-colors duration-300 text-left"> {chapter.title} </button> </li> ))} </ul> </div> </Page> ));
TableOfContents.displayName = 'TableOfContents';

// The Cover component is now a standalone component, not a page.
const Cover = ({ title, coverImage }: { title: string, coverImage: string }) => (
  <div className="relative w-full h-full bg-gray-900 shadow-lg shadow-black/50">
    <Image src={coverImage} alt={`${title} cover`} fill style={{ objectFit: 'cover' }} priority />
    <div className="absolute inset-0 bg-black/40" />
    <div className="absolute inset-0 flex items-center justify-center z-10 p-4 pr-2">
      <h1 className={`text-[#d2b48c] text-center max-w-[80%] text-2xl md:text-3xl lg:text-4xl ${uncialAntiqua.className}`} style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.9)' }}>{title}</h1>
    </div>
  </div>
);

interface BookReaderProps { book: Book; }

export default function BookReader({ book }: BookReaderProps) {
  const flipBookRef = useRef<any>(null);
  const [isCoverOpen, setIsCoverOpen] = useState(false);

  const handleChapterClick = useCallback((pageNumber: number) => {
    // We add 1 because the ToC is now the first page inside the book (index 0).
    flipBookRef.current?.pageFlip().flip(pageNumber + 1);
  }, []);

  const handleFlip = (e: { data: number }) => {
    // When we flip past page 0, the cover is considered "open".
    if (e.data > 0) {
      setIsCoverOpen(true);
    } else {
      setIsCoverOpen(false);
    }
  };

  return (
    <div className="w-full max-w-5xl aspect-2/1.2 relative">
      {/*
        THE COVER FIX 1: The Cover is now a separate component.
        It has a click handler to open the book to the first page.
        The `isCoverOpen` state controls its visibility.
      */}
      <div 
        className={`absolute inset-0 transition-transform duration-700 ease-in-out shadow-2xl shadow-black/70 ${isCoverOpen ? 'transform -rotate-y-180 opacity-0' : ''}`}
        style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
        onClick={() => flipBookRef.current?.pageFlip().flipNext()}
      >
        <Cover title={book.title} coverImage={book.coverImage} />
      </div>

      {/* 
        THE COVER FIX 2: The HTMLFlipBook component now has showCover={false}
        and is initially invisible until the cover is opened.
      */}
      <div className={`transition-opacity duration-300 ${isCoverOpen ? 'opacity-100' : 'opacity-0'}`}>
        <HTMLFlipBook
          width={500}
          height={600}
          size="stretch"
          minWidth={315} maxWidth={1000} minHeight={420} maxHeight={1350}
          maxShadowOpacity={0.5}
          showCover={false} // This is the key change
          mobileScrollSupport={true}
          className="shadow-2xl shadow-black/70"
          ref={flipBookRef}
          onFlip={handleFlip}
        >
          {/* The first "real" page is now the Table of Contents */}
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
    </div>
  );
}