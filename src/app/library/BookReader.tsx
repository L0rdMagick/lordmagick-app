"use client";

// THE FIX: We need to import CSSProperties to use it for our type assertion.
import { useState, useEffect, useRef, useCallback, CSSProperties } from 'react';
import { Crimson_Text, Uncial_Antiqua } from 'next/font/google';

const crimsonText = Crimson_Text({ subsets: ['latin'], weight: ['400', '700'], });
const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'], });

const fontSizes = ['16px', '18px', '20px', '22px'];

interface BookReaderProps {
  title: string;
  content: string;
  onTocToggle: () => void;
}

export default function BookReader({ title, content, onTocToggle }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);

  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const calculatePages = useCallback(() => {
    if (viewportRef.current && contentRef.current) {
      const viewportHeight = viewportRef.current.clientHeight;
      const totalContentHeight = contentRef.current.scrollHeight;
      const calculatedTotalPages = Math.ceil(totalContentHeight / viewportHeight);
      setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
      setCurrentPage(prev => Math.min(prev, (calculatedTotalPages > 0 ? calculatedTotalPages : 1) - 1));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(calculatePages, 200);
    window.addEventListener('resize', calculatePages);
    const resizeObserver = new ResizeObserver(calculatePages);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    return () => {
      window.removeEventListener('resize', calculatePages);
      clearTimeout(timer);
      if (contentRef.current) {
        resizeObserver.unobserve(contentRef.current);
      }
    };
  }, [content, fontSizeIndex, calculatePages]);

  useEffect(() => {
    if (viewportRef.current) {
      const viewportHeight = viewportRef.current.clientHeight;
      viewportRef.current.scrollTo({
        top: currentPage * viewportHeight,
        behavior: 'smooth',
      });
    }
  }, [currentPage]);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 0));

  const increaseFontSize = () => {
    setFontSizeIndex(prev => Math.min(prev + 1, fontSizes.length - 1));
  };
  const decreaseFontSize = () => {
    setFontSizeIndex(prev => Math.max(prev - 1, 0));
  };

  // THE FIX: We cast our object to CSSProperties to allow the custom variable.
  const contentStyle = {
    '--prose-font-size': fontSizes[fontSizeIndex],
  } as CSSProperties;

  return (
    <div className={`w-full max-w-2xl h-[85vh] bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover bg-center rounded-lg shadow-2xl shadow-black/70 flex flex-col p-8 md:p-10 text-black ${crimsonText.className}`}>
      
      <h1 className={`text-3xl md:text-4xl text-center border-b-2 border-gray-500/50 pb-4 mb-6 shrink-0 ${uncialAntiqua.className}`}>
        {title}
      </h1>

      <div className="grow relative">
        <div 
          ref={viewportRef} 
          className="absolute inset-0 overflow-y-scroll"
          style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style jsx global>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          
          <div ref={contentRef} className="hide-scrollbar">
            <div
              className="prose max-w-none"
              style={contentStyle}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>

        <button onClick={goToPrevPage} disabled={currentPage === 0} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full text-black/30 hover:text-black disabled:opacity-0 text-7xl z-10 transition-all">
          &#x2039;
        </button>
        <button onClick={goToNextPage} disabled={currentPage === totalPages - 1} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full text-black/30 hover:text-black disabled:opacity-0 text-7xl z-10 transition-all">
          &#x203A;
        </button>
      </div>

      <footer className="flex justify-between items-center pt-4 mt-4 border-t-2 border-gray-500/50 shrink-0">
        <button 
          onClick={onTocToggle} 
          className="text-gray-600 hover:text-black transition-colors font-semibold uppercase text-sm tracking-wider"
        >
          Contents
        </button>

        <span className="text-gray-700 font-sans text-sm">
          Page {currentPage + 1} of {totalPages}
        </span>

        <div className="flex items-center gap-2">
          <button onClick={decreaseFontSize} disabled={fontSizeIndex === 0} className="text-xl font-bold text-black/50 hover:text-black disabled:opacity-20 transition-colors">A-</button>
          <button onClick={increaseFontSize} disabled={fontSizeIndex === fontSizes.length - 1} className="text-2xl font-bold text-black/50 hover:text-black disabled:opacity-20 transition-colors">A+</button>
        </div>
      </footer>
    </div>
  );
}