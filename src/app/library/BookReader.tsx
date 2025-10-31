"use client";

import { Crimson_Text, Uncial_Antiqua } from 'next/font/google';

const crimsonText = Crimson_Text({ subsets: ['latin'], weight: ['400', '700'], });
const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'], });

interface BookReaderProps {
  title: string;
  content: string;
}

export default function BookReader({ title, content }: BookReaderProps) {
  return (
    // The main book container. It's a single, solid element.
    <div className={`w-full max-w-5xl h-[85vh] bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover bg-center rounded-lg shadow-2xl shadow-black/70 flex flex-col p-8 md:p-10 ${crimsonText.className}`}>
      
      {/* Book Title - Stays fixed at the top */}
      <h1 className={`text-3xl md:text-4xl text-center text-gray-800 border-b-2 border-gray-500/50 pb-4 mb-6 shrink-0 ${uncialAntiqua.className}`}>
        {title}
      </h1>

      {/* THE DEFINITIVE FIX: The "Ancient Scroll" content area */}
      <div 
        className="grow overflow-x-auto overflow-y-hidden" // Allow horizontal scrolling, hide vertical
        style={{
          // Custom scrollbar styles for a more thematic feel
          scrollbarWidth: 'thin',
          scrollbarColor: '#854d0e #fdf9e8', // Dark amber handle, parchment track
        }}
      >
        {/* This inner container holds the columns */}
        <div 
          className="h-full" 
          style={{
            columnWidth: '22rem', // Each "page" or column will be a readable width
            columnGap: '4rem',    // The space between the "pages"
            columnRule: '1px solid rgba(0, 0, 0, 0.2)', // A subtle line between pages
          }}
        >
          {/* The 'prose' classes style your book's HTML for perfect readability */}
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-900 prose-strong:text-gray-900 prose-em:text-gray-800"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}