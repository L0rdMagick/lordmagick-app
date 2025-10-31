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
    const timer = setTimeout(calculatePages, 150);
    window.addEventListener('resize', calculatePages);
    return () => {
      window.removeEventListener('resize', calculatePages);
      clearTimeout(timer);
    };
  }, [calculatePages]);
  
  const goToPage = useCallback((pageNumber: number) => {
    if (viewportRef.current && pageNumber >= 0 && pageNumber < totalPages) {
      const viewportHeight = viewportRef.current.clientHeight;
      viewportRef.current.scrollTo({
        top: pageNumber * viewportHeight,
        behavior: 'smooth',
      });
      setCurrentPage(pageNumber);
    }
  }, [totalPages]);

  return (
    <div className={`w-full max-w-2xl h-[85vh] bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover bg-center rounded-lg shadow-2xl shadow-black/70 flex flex-col p-8 md:p-10 text-black ${crimsonText.className}`}>
      
      <h1 className={`text-3xl md:text-4xl text-center border-b-2 border-gray-500/50 pb-4 mb-6 shrink-0 ${uncialAntiqua.className}`}>
        {title}
      </h1>

      <div className="grow relative">
        {/* THE DEFINITIVE FIX: The conflicting <style jsx> tag has been removed. */}
        {/* This will solve the build error. */}
        <div 
          ref={viewportRef} 
          className="absolute inset-0 overflow-y-scroll"
          style={{
            scrollBehavior: 'smooth',
            // Note: On some browsers a scrollbar may be visible, but the app will be stable.
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div ref={contentRef}>
            <div
              className="prose prose-lg max-w-none 
                         prose-headings:text-black prose-p:text-black 
                         prose-strong:text-black prose-em:text-black 
                         prose-a:text-black prose-ul:text-black 
                         prose-ol:text-black prose-li:text-black"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>

        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 text-black/30 hover:text-black disabled:opacity-0 text-7xl z-10 transition-all">
          &#x2039;
        </button>
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages - 1} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-black/30 hover:text-black disabled:opacity-0 text-7xl z-10 transition-all">
          &#x203A;
        </button>
      </div>

      <div className="flex justify-center items-center pt-4 mt-4 border-t-2 border-gray-500/50 shrink-0">
        <span className="text-gray-700 font-sans">
          Page {currentPage + 1} of {totalPages}
        </span>
      </div>
    </div>
  );
}