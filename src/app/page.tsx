// This directive tells Next.js that this is an interactive component.
"use client";

// Import the necessary tools from React and Next.js
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Import the router hook

// This is our main HomePage component.
export default function HomePage() {
  const [isEntering, setIsEntering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter(); // Initialize the router

  // This function is called when the "Enter the Realm" button is clicked.
  const handleEnter = () => {
    setIsEntering(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };
  
  // This function is called when the video finishes playing.
  const handleVideoEnd = () => {
    // Instead of just showing text, we now navigate to the new page.
    router.push('/hall'); 
  };

  return (
    // Main container is a simple black background.
    <main className="relative bg-black h-screen w-screen flex items-center justify-center overflow-hidden">
      
      {/* The Video Player */}
      <video
        ref={videoRef}
        src="/videos/door-animation.mp4"
        className="absolute inset-0 w-full h-full object-cover z-10"
        playsInline
        muted
        preload="auto"
        poster="/images/video-poster.png"
        onEnded={handleVideoEnd} // This now triggers the navigation
      />

      {/* The Button */}
      <button 
        onClick={handleEnter}
        className={`absolute z-30 text-white bg-purple-900/50 rounded-full py-4 px-6 font-semibold tracking-wider uppercase shadow-lg shadow-purple-900/50 hover:bg-purple-700/50 transition-opacity animate-pulse duration-500 ${isEntering ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        Enter the Realm
      </button>

      {/* The welcome text overlay is no longer needed, as we are navigating away. */}
    </main>
  );
}