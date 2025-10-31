"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Crimson_Text, Uncial_Antiqua } from 'next/font/google';

const crimsonText = Crimson_Text({ subsets: ['latin'], weight: ['400', '700'], });
const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'], });

const fontSizes = ['prose-lg', 'prose-xl', 'prose-2xl'];

interface BookReaderProps {
  title: string;
  content: string;
  onTocToggle: () => void;
}

export default function BookReader({ title, content, onTocToggle }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fontSizeIndex, setFontSizeIndex] = useState(0);

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
    const timer = setTimeout(calculatePages, 150);
    window.addEventListener('resize', calculatePages);

    // THE FIX: Add an observer for when content like images loads, which can change height
    const resizeObserver = new ResizeObserver(calculatePages);
    if(contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      window.removeEventListener('resize', calculatePages);
      clearTimeout(timer);
      if(contentRef.current) {
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
  
  // This effect listens for clicks on chapter links inside the content itself
  useEffect(() => {
    const handleInternalLink = (event: Event) => {
        const target = event.target as HTMLElement;
        const anchor = target.closest('a');
        if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
            event.preventDefault();
            const chapterId = anchor.getAttribute('href')?.substring(1);
            if(chapterId) {
                const element = contentRef.current?.querySelector(`#${chapterId}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    const contentEl = contentRef.current;
    contentEl?.addEventListener('click', handleInternalLink);
    return () => contentEl?.removeEventListener('click', handleInternalLink);
}, [content]);


  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 0));

  const increaseFontSize = () => {
    setFontSizeIndex(prev => Math.min(prev + 1, fontSizes.length - 1));
  };
  const decreaseFontSize = () => {
    setFontSizeIndex(prev => Math.max(prev - 1, 0));
  };
  
  return (
    <div className={`w-full max-w-4xl h-[90vh] bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover bg-center rounded-lg shadow-2xl shadow-black/70 flex flex-col p-6 md:p-10 text-black ${crimsonText.className}`}>
      
      <header className="flex justify-between items-center border-b-2 border-gray-500/50 pb-4 mb-6 shrink-0">
        <button onClick={onTocToggle} className="text-gray-600 hover:text-black transition-colors text-sm font-semibold">
          CONTENTS
        </button>
        <h1 className={`text-2xl md:text-3xl text-center ${uncialAntiqua.className}`}>
          {title}
        </h1>
        <div className="w-20"></div> {/* Spacer */}
      </header>

      <div className="grow relative">
        <div 
          ref={viewportRef} 
          className="h-full overflow-y-scroll"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style jsx global>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          
          <div ref={contentRef} className="hide-scrollbar">
            <div
              className={`prose max-w-none ${fontSizes[fontSizeIndex]}`}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>

        {/* Navigation Arrows */}
        <button onClick={goToPrevPage} disabled={currentPage === 0} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full text-black/30 hover:text-black disabled:opacity-0 text-7xl z-10 transition-all">
          &#x2039;
        </button>
        <button onClick={goToNextPage} disabled={currentPage === totalPages - 1} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full text-black/30 hover:text-black disabled:opacity-0 text-7xl z-10 transition-all">
          &#x203A;
        </button>
      </div>

      <footer className="flex justify-between items-center pt-4 mt-4 border-t-2 border-gray-500/50 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={decreaseFontSize} disabled={fontSizeIndex === 0} className="text-xl font-bold text-black/50 hover:text-black disabled:opacity-20 transition-colors">A-</button>
          <button onClick={increaseFontSize} disabled={fontSizeIndex === fontSizes.length - 1} className="text-2xl font-bold text-black/50 hover:text-black disabled:opacity-20 transition-colors">A+</button>
        </div>
        <span className="text-gray-700 font-sans text-sm">
          Page {currentPage + 1} of {totalPages}
        </span>
      </footer>
    </div>
  );
}