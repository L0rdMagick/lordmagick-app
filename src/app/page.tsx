"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [isEntering, setIsEntering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const handleEnter = () => {
    setIsEntering(true);
    if (videoRef.current) {
      // THE FIX: Ensure the video is unmuted before playing.
      videoRef.current.muted = false;
      videoRef.current.play();
    }
  };
  
  const handleVideoEnd = () => {
    router.push('/hall'); 
  };

  return (
    <main className="relative bg-black h-screen w-screen flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        src="/videos/door-animation.mp4"
        className="absolute inset-0 w-full h-full object-cover z-10"
        playsInline
        // THE FIX: The video now starts muted but is unmuted on click.
        muted 
        preload="auto"
        poster="/images/video-poster.png"
        onEnded={handleVideoEnd}
      />

      {!isEntering && (
        <button 
          onClick={handleEnter}
          className="absolute z-30 text-white bg-purple-900/50 rounded-full py-4 px-6 font-semibold tracking-wider uppercase shadow-lg shadow-purple-900/50 hover:bg-purple-700/50 transition-opacity animate-pulse duration-500"
        >
          Enter the Realm
        </button>
      )}
    </main>
  );
}