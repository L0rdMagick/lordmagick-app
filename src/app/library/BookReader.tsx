"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import HTMLFlipBook from 'react-pageflip';
import { Crimson_Text, Uncial_Antiqua } from 'next/font/google';

const crimsonText = Crimson_Text({ subsets: ['latin'], weight: ['400', '700'], });
const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'], });

// --- Child Components for the Book ---

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => (
  <div ref={ref} className="bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover bg-center shadow-inner shadow-black/30 text-gray-800 p-8 md:p-12 overflow-hidden">
    {children}
  </div>
));
Page.displayName = 'Page';

const CoverPage = React.forwardRef<HTMLDivElement, { title: string }>(({ title }, ref) => (
    <div ref={ref} className="relative bg-gray-900 shadow-lg shadow-black/50">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/books/default-cover.png')" }} />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
            <h1 className={`text-[#d2b48c] text-center text-2xl md:text-3xl lg:text-4xl ${uncialAntiqua.className}`} style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.9)' }}>{title}</h1>
        </div>
    </div>
));
CoverPage.displayName = 'CoverPage';

const BackCoverPage = React.forwardRef<HTMLDivElement, { onReturn: () => void }>(({ onReturn }, ref) => (
    <div ref={ref} className="relative bg-gray-900 shadow-lg shadow-black/50 group">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/books/default-cover.png')" }} />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={onReturn}>
            <span className={`text-2xl text-amber-200 ${uncialAntiqua.className}`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                Back to Library
            </span>
        </div>
    </div>
));
BackCoverPage.displayName = 'BackCoverPage';


// --- The Main Reader Component ---

interface BookReaderProps {
  title: string;
  content: string;
}

export default function BookReader({ title, content }: BookReaderProps) {
  const router = useRouter();
  const flipBookRef = useRef<any>(null);
  const [pages, setPages] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  
  // This is the core of the intelligent pagination.
  const paginateContent = useCallback(() => {
    if (contentRef.current && pageContainerRef.current) {
      const pageHeight = pageContainerRef.current.clientHeight;
      const contentNodes = Array.from(contentRef.current.children);
      
      const newPages: string[] = [];
      let currentPageContent = '';
      let currentHeight = 0;

      contentNodes.forEach((node) => {
        const element = node as HTMLElement;
        const elementHeight = element.offsetHeight + 16; // Add margin for spacing

        if (currentHeight + elementHeight > pageHeight && currentPageContent !== '') {
          newPages.push(currentPageContent);
          currentPageContent = element.outerHTML;
          currentHeight = elementHeight;
        } else {
          currentPageContent += element.outerHTML;
          currentHeight += elementHeight;
        }
      });
      
      if (currentPageContent) { newPages.push(currentPageContent); }
      setPages(newPages);
    }
  }, [content]);

  // Use a ResizeObserver to automatically re-paginate when the window size changes.
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      paginateContent();
    });

    if (pageContainerRef.current) {
      observer.observe(pageContainerRef.current);
    }
    // Initial pagination
    const timer = setTimeout(paginateContent, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [paginateContent]);


  const handleReturnToLibrary = useCallback(() => router.push('/library'), [router]);
  const handleCloseBookAnimation = useCallback(() => {
    flipBookRef.current?.pageFlip().flip(pages.length + 1);
  }, [flipBookRef, pages]);

  return (
    <>
      {/* Hidden container for measuring content. Its size dictates the pagination. */}
      <div ref={pageContainerRef} className="fixed opacity-0 pointer-events-none z-[-1] w-full max-w-xl h-[75vh] p-8 md:p-12">
        <div ref={contentRef} className={`prose prose-lg max-w-none ${crimsonText.className}`} dangerouslySetInnerHTML={{ __html: content }} />
      </div>

      {/* The visible FlipBook */}
      <div className="w-full max-w-5xl aspect-[1/1.4] md:aspect-[2/1.4] max-h-[85vh]">
        <HTMLFlipBook width={500} height={700} size="stretch" minWidth={300} maxWidth={1000} minHeight={420} maxHeight={1400} maxShadowOpacity={0.5} showCover={true} mobileScrollSupport={true} className={`shadow-2xl shadow-black/70`} ref={flipBookRef}>
          <CoverPage title={title} />
          
          {pages.length > 0 ? (
            pages.map((pageContent, index) => (
              <Page key={index}>
                <div className={`prose prose-lg max-w-none ${crimsonText.className}`} dangerouslySetInnerHTML={{ __html: pageContent }} />
              </Page>
            ))
          ) : ( <Page><div className="flex items-center justify-center h-full"><p>Loading pages...</p></div></Page> )}
          
          <Page>
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-gray-500 mb-8 text-xl">End of Tome</p>
              <button onClick={handleCloseBookAnimation} className={`text-2xl text-amber-800 hover:text-amber-600 ${uncialAntiqua.className}`}>Close Tome</button>
            </div>
          </Page>
          
          <BackCoverPage onReturn={handleReturnToLibrary} />
        </HTMLFlipBook>
      </div>
    </>
  );
}