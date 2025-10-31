"use client";

import { useRef } from 'react';
import { Crimson_Text, Uncial_Antiqua } from 'next/font/google';

const crimsonText = Crimson_Text({ subsets: ['latin'], weight: ['400', '700'], });
const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'], });

interface BookReaderProps {
  title: string;
  content: string;
}

export default function BookReader({ title, content }: BookReaderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // We calculate the width of one "page" (the container's width) to scroll by.
      const scrollAmount = container.clientWidth;
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth', // This creates a beautiful, smooth scroll animation.
      });
    }
  };

  return (
    // The main book container. It's a single, solid element.
    <div className={`w-full max-w-5xl h-[85vh] bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover bg-center rounded-lg shadow-2xl shadow-black/70 flex flex-col p-8 md:p-10 ${crimsonText.className} relative`}>
      
      {/* Book Title - Stays fixed at the top */}
      <h1 className={`text-3xl md:text-4xl text-center text-gray-800 border-b-2 border-gray-500/50 pb-4 mb-6 shrink-0 ${uncialAntiqua.className}`}>
        {title}
      </h1>

      {/* The Scrollable Viewport */}
      <div 
        ref={scrollContainerRef}
        className="grow overflow-x-auto overflow-y-hidden"
        style={{
          scrollSnapType: 'x mandatory', // This is the magic: forces snapping to the x-axis.
          scrollbarWidth: 'none', // Hides the scrollbar for a cleaner look
          msOverflowStyle: 'none', // Hides the scrollbar for IE/Edge
        }}
      >
        {/* This inner container holds the multi-column content */}
        <div 
          className="h-full w-full" 
          style={{
            columnWidth: '100%', // Each column takes the full width of the viewport.
            columnGap: '5rem',   // Creates the "gutter" between the two pages in a spread.
          }}
        >
          {/* The 'prose' classes style your book's HTML for perfect readability */}
          <div
            className="prose prose-lg max-w-none h-full prose-headings:text-gray-800 prose-p:text-gray-900 prose-strong:text-gray-900 prose-em:text-gray-800"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      {/* Navigation Arrows */}
      <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/70 text-5xl p-4 z-10">
        &#x2039;
      </button>
      <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/70 text-5xl p-4 z-10">
        &#x203A;
      </button>
    </div>
  );
}