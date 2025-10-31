"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Crimson_Text, Uncial_Antiqua } from 'next/font/google';

const crimsonText = Crimson_Text({ subsets: ['latin'], weight: ['400', '700'], });
const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'], });

interface BookReaderProps {
  title: string;
  content: string;
}

export default function BookReader({ title, content }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const calculatePages = useCallback(() => {
    if (viewportRef.current && contentRef.current) {
      const viewportHeight = viewportRef.current.clientHeight;
      const totalContentHeight = contentRef.current.scrollHeight;
      const calculatedTotalPages = Math.ceil(totalContentHeight / viewportHeight);
      setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
    }
  }, []);

  useEffect(() => {
    calculatePages();
    // A small delay to recalculate after initial render and font loading
    const timer = setTimeout(calculatePages, 100); 
    window.addEventListener('resize', calculatePages);
    return () => {
      window.removeEventListener('resize', calculatePages);
      clearTimeout(timer);
    };
  }, [calculatePages]);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    // THE DEFINITIVE FIX: Added 'text-black' to the main container.
    // This forcefully sets the default text color for everything inside the book to black,
    // overriding the global 'text-white' style from the layout.
    <div className={`w-full max-w-2xl h-[85vh] bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover bg-center rounded-lg shadow-2xl shadow-black/70 flex flex-col p-8 md:p-10 text-black ${crimsonText.className} relative`}>
      
      {/* Book Title */}
      <h1 className={`text-3xl md:text-4xl text-center border-b-2 border-gray-500/50 pb-4 mb-6 shrink-0 ${uncialAntiqua.className}`}>
        {title}
      </h1>

      {/* The Viewport */}
      <div ref={viewportRef} className="grow overflow-hidden relative">
        {/* The Content Strip */}
        <div
          ref={contentRef}
          className="transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(-${currentPage * 100}%)` }}
        >
          {/* We no longer need to fight with prose colors, as the parent sets the color. */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      {/* Navigation and Page Counter */}
      <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-gray-500/50 shrink-0">
        <button onClick={goToPrevPage} disabled={currentPage === 0} className="text-black/50 hover:text-black disabled:opacity-20 text-4xl transition-colors">
          &#x2039;
        </button>
        <span className="text-gray-700 font-sans">
          Page {currentPage + 1} of {totalPages}
        </span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages - 1} className="text-black/50 hover:text-black disabled:opacity-20 text-4xl transition-colors">
          &#x203A;
        </button>
      </div>
    </div>
  );
}