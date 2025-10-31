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
    <div className={`w-full max-w-2xl h-[80vh] bg-[#fdf9e8] bg-[url('/images/books/parchment-bg.png')] bg-cover bg-center rounded-lg shadow-2xl shadow-black/70 p-8 md:p-12 overflow-y-auto ${crimsonText.className}`}>
      <h1 className={`text-3xl md:text-4xl text-center text-gray-800 border-b-2 border-gray-500 pb-4 mb-8 ${uncialAntiqua.className}`}>
        {title}
      </h1>
      <div
        className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-900 prose-strong:text-gray-900 prose-em:text-gray-800"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}