"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Crimson_Text, Uncial_Antiqua } from 'next/font/google';

const crimsonText = Crimson_Text({ subsets: ['latin'], weight: ['400', '700'], });
const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'], });

// --- FONT SIZE CONTROLS ---
const fontSizes = ['lg', 'xl', '2xl']; // Tailwind's prose sizes

// THE DEFINITIVE FIX (Part 1): A helper function to get the full class name.
// This is necessary because Tailwind CSS cannot process dynamically created class strings.
// By writing out the full class names here, we ensure they are included in the final build.
const getFontSizeClass = (index: number) => {
  switch(index) {
    case 1: return 'prose-xl';
    case 2: return 'prose-2xl';
    default: return 'prose-lg';
  }
};

interface BookReaderProps {
  title: string;
  content: string;
}

export default function BookReader({ title, content }: BookReaderProps) {
  const [fontSizeIndex, setFontSizeIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Scroll by the width of one page/column. The scroll-snap will handle the perfect alignment.
      const scrollAmount = container.clientWidth;
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };
  
  const increaseFontSize = () => setFontSizeIndex(prev => Math.min(prev + 1, fontSizes.length - 1));
  const decreaseFontSize = () => setFontSizeIndex(prev => Math.max(prev - 1, 0));
  
  return (
    <div className={`w-full max-w-5xl h-[85vh] bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover bg-center rounded-lg shadow-2xl shadow-black/70 flex flex-col p-8 md:p-10 text-black ${crimsonText.className}`}>
      
      <h1 className={`text-3xl md:text-4xl text-center border-b-2 border-gray-500/50 pb-4 mb-6 shrink-0 ${uncialAntiqua.className}`}>
        {title}
      </h1>

      <div className="grow relative">
        {/* The Viewport: This is our horizontally scrollable "window". */}
        <div 
          ref={scrollContainerRef} 
          className="absolute inset-0 overflow-x-auto overflow-y-hidden snap-x snap-mandatory" // The magic!
          style={{
            scrollbarWidth: 'none', // Hide scrollbar for Firefox
            msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
          }}
        >
          {/* Webkit specific scrollbar hiding */}
          <style jsx global>{`
            .hide-scrollbar::-webkit-scrollbar { display: none; }
          `}</style>

          {/* The Content Strip with CSS Columns */}
          <div className="h-full w-full hide-scrollbar" style={{ columnWidth: '100%', columnGap: '5rem' }}>
            <div
              className={`prose max-w-none h-full 
                         ${getFontSizeClass(fontSizeIndex)}
                         prose-headings:text-black prose-p:text-black 
                         prose-strong:text-black prose-em:text-black 
                         prose-a:text-black prose-ul:text-black 
                         prose-ol:text-black prose-li:text-black`}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>

        {/* Navigation Arrows */}
        <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full text-black/30 hover:text-black text-7xl z-10 transition-colors">
          &#x2039;
        </button>
        <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full text-black/30 hover:text-black text-7xl z-10 transition-colors">
          &#x203A;
        </button>
      </div>

      {/* Controls: Font Size */}
      <div className="flex justify-center items-center pt-4 mt-4 border-t-2 border-gray-500/50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={decreaseFontSize} disabled={fontSizeIndex === 0} className="text-xl font-bold text-black/50 hover:text-black disabled:opacity-20 transition-colors">A-</button>
          <button onClick={increaseFontSize} disabled={fontSizeIndex === fontSizes.length - 1} className="text-2xl font-bold text-black/50 hover:text-black disabled:opacity-20 transition-colors">A+</button>
        </div>
      </div>
    </div>
  );
}