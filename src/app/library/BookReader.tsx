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
    // The main container for our book.
    <div className={`w-full max-w-2xl h-[85vh] bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover bg-center rounded-lg shadow-2xl shadow-black/70 flex flex-col p-8 md:p-10 ${crimsonText.className}`}>
      
      {/* Book Title - Stays fixed at the top */}
      {/* THE FIX: 'flex-shrink-0' has been updated to the canonical 'shrink-0'. */}
      <h1 className={`text-3xl md:text-4xl text-center text-gray-800 border-b-2 border-gray-500/50 pb-4 mb-6 shrink-0 ${uncialAntiqua.className}`}>
        {title}
      </h1>

      {/* The Scrollable Content Area */}
      {/* THE FIX: 'flex-grow' has been updated to the canonical 'grow'. */}
      <div className="grow overflow-y-auto pr-4 -mr-4">
        {/* The 'prose' classes from Tailwind automatically style your book's HTML for perfect readability. */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-900 prose-strong:text-gray-900 prose-em:text-gray-800"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}