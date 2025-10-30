"use client";

import React, { useState } from 'react';
import { ReactReader } from 'react-reader';
import { useRouter } from 'next/navigation';

interface BookReaderProps {
  // THE FIX: It now accepts the raw book data directly.
  bookData: ArrayBuffer;
}

const myReaderStyles = {
  reader: {
    backgroundColor: '#fbf0d9',
    color: '#222',
    fontFamily: '"Crimson Text", serif',
  },
  arrow: {
    color: '#222'
  },
};

export default function BookReader({ bookData }: BookReaderProps) {
  const [location, setLocation] = useState<string | number>(0);
  const router = useRouter();

  const handleReturnToLibrary = () => {
    router.push('/library');
  };

  return (
    <div className="relative w-full h-[90vh] max-w-5xl bg-gray-900 rounded-lg shadow-2xl shadow-black/70">
      
      {/* ReactReader now receives the ArrayBuffer directly via the 'url' prop. */}
      <ReactReader
        url={bookData}
        location={location}
        locationChanged={(epubcfi: string) => setLocation(epubcfi)}
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