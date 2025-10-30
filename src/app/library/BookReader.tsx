"use client";

import React, { useState } from 'react';
import { ReactReader } from 'react-reader';
import { useRouter } from 'next/navigation';

interface BookReaderProps {
  slug: string;
}

// THE FIX (Part 1): We define our styles in a separate object.
const myReaderStyles = {
  reader: {
    backgroundColor: '#fbf0d9', // Sepia theme background
    color: '#222',             // Dark text for readability
    fontFamily: '"Crimson Text", serif', // Applying a more book-like font
  },
  arrow: {
    color: '#222'
  },
  // We can add other overrides as needed without defining all 17 properties.
};

export default function BookReader({ slug }: BookReaderProps) {
  const [location, setLocation] = useState<string | number>(0);
  const router = useRouter();

  const handleReturnToLibrary = () => {
    router.push('/library');
  };

  const epubUrl = `/api/books/${slug}`;

  return (
    <div className="relative w-full h-[90vh] max-w-5xl bg-gray-900 rounded-lg shadow-2xl shadow-black/70">
      
      <ReactReader
        url={epubUrl}
        location={location}
        locationChanged={(epubcfi: string) => setLocation(epubcfi)}
        // THE FIX (Part 2): We pass our styles and use 'as any' to tell TypeScript 
        // to accept our partial style object, bypassing the strict type check.
        readerStyles={myReaderStyles as any}
      />
      
      <button 
        onClick={handleReturnToLibrary}
        className="absolute top-2 right-4 z-50 bg-black/50 text-white px-4 py-2 rounded-lg hover:bg-black/70 transition-colors"
      >
        Back to Library
      </button>
    </div>
  );
}