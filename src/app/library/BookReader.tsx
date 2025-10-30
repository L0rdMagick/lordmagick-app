"use client";

import React from 'react';
import type { Book } from '@/types';
import { Crimson_Text, Uncial_Antiqua } from 'next/font/google';

const crimsonText = Crimson_Text({ subsets: ['latin'], weight: ['400', '700'] });
const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'] });

interface BookReaderProps { book: Book; }

/**
 * This is a diagnostic version of the BookReader that removes the 'react-pageflip'
 * library to confirm it is the source of the build error.
 * It renders the book content as a simple scrollable page.
 */
export default function BookReader({ book }: BookReaderProps) {
  return (
    <div 
      className={`w-full max-w-2xl h-[80vh] bg-[#fdf9e8] text-gray-800 overflow-y-auto p-8 sm:p-12 shadow-2xl shadow-black/70 rounded-lg border-2 border-amber-900/50 ${crimsonText.className}`}
    >
      {/* Book Title */}
      <h1 className={`text-3xl sm:text-4xl text-center mb-8 text-amber-900 ${uncialAntiqua.className}`}>
        {book.title}
      </h1>

      {/* Chapters Content */}
      {book.chapters.map((chapter, index) => (
        <div key={index} className="mb-12 last:mb-0">
          <h3 className="text-2xl font-bold mb-4 border-b-2 border-amber-900/30 pb-2">
            {chapter.title}
          </h3>
          <div 
            className="book-content" 
            dangerouslySetInnerHTML={{ __html: chapter.content }} 
          />
        </div>
      ))}
    </div>
  );
}