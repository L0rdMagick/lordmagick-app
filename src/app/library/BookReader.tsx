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

  // THE FIX (Part 1): The arrow logic is now simpler and more reliable.
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // We get the width of the scrollable area itself. On a desktop, this will
      // be roughly two "pages" wide, so we scroll by half of that width.
      const scrollAmount = container.clientWidth / 2;
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    // Main book container
    <div className={`w-full max-w-5xl h-[85vh] bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover bg-center rounded-lg shadow-2xl shadow-black/70 flex flex-col p-8 md:p-10 ${crimsonText.className} relative`}>
      
      {/* Book Title */}
      <h1 className={`text-3xl md:text-4xl text-center text-gray-800 border-b-2 border-gray-500/50 pb-4 mb-6 shrink-0 ${uncialAntiqua.className}`}>
        {title}
      </h1>

      {/* The Scrollable Viewport */}
      <div 
        ref={scrollContainerRef}
        className="grow overflow-x-auto overflow-y-hidden"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Inner container for multi-column content */}
        <div 
          className="h-full" 
          style={{
            // On large screens, show two columns (a two-page spread).
            // On smaller screens, this will automatically become one column.
            columnWidth: 'calc(50% - 2rem)', // Each column takes nearly half the width
            columnGap: '4rem',
            columnRule: '1px solid rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* THE FIX (Part 2): Added a padding-bottom to prevent text from being cut off. */}
          <div
            // THE FIX (Part 3): Overriding prose colors for a deep black "ancient ink" feel.
            className="prose prose-lg max-w-none h-full pb-8 prose-headings:text-black prose-p:text-black prose-strong:text-black prose-em:text-black prose-a:text-black prose-ul:text-black prose-ol:text-black prose-li:text-black"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      {/* Navigation Arrows */}
      <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/70 text-5xl p-4 z-10 transition-colors">
        &#x2039;
      </button>
      <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/70 text-5xl p-4 z-10 transition-colors">
        &#x203A;
      </button>
    </div>
  );
}