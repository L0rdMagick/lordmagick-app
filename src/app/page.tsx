// This directive tells Next.js that this is an interactive component that will run in the user's browser.
"use client";

// Import the necessary tools from React for handling state and direct element references.
import { useState, useRef } from 'react';

// This is our main HomePage component.
export default function HomePage() {
  // State to track if the user has started the entering sequence.
  const [isEntering, setIsEntering] = useState(false);
  // State to track if the video has finished playing.
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  
  // A 'ref' is a direct link to a DOM element, in this case, our <video>.
  // This allows us to call methods like .play() on it.
  const videoRef = useRef<HTMLVideoElement>(null);

  // This function is called when the "Enter the Realm" button is clicked.
  const handleEnter = () => {
    setIsEntering(true); // Start the fade-out animations.
    // If the video element exists in the DOM, play it.
    if (videoRef.current) {
      videoRef.current.play();
    }
  };
  
  // This function is attached to the video's 'onEnded' event.
  const handleVideoEnd = () => {
    setIsVideoFinished(true); // Trigger the fade-in of the "next screen".
  };

  return (
    // Main container is a simple black background.
    <main className="relative bg-black h-screen w-screen flex items-center justify-center overflow-hidden">
      
      {/* The Video Player */}
      {/* It's layered in the back and covers the entire screen. */}
      <video
        ref={videoRef}
        src="/videos/door-animation.mp4" // Make sure this path is correct!
        className="absolute inset-0 w-full h-full object-cover z-10"
        playsInline // Essential for autoplay on iOS.
        muted // Essential for autoplay in most browsers.
        preload="auto"
        poster="/images/video-poster.png" // The static image shown before play.
        onEnded={handleVideoEnd} // Call our function when the video finishes.
      />

      {/* The Button */}
      {/* Sits on top of the video and fades out when 'isEntering' becomes true. */}
      <button 
        onClick={handleEnter}
        // 'pointer-events-none' prevents clicking the button while it's fading out.
        className={`absolute z-30 text-white bg-purple-900/50 rounded-full py-4 px-6 font-semibold tracking-wider uppercase shadow-lg shadow-purple-900/50 hover:bg-purple-700/50 transition-opacity animate-pulse duration-500 ${isEntering ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        Enter the Realm
      </button>

      {/* The "Next Screen" Overlay (Simulating the Grand Hall) */}
      {/* Starts completely invisible and fades in over the video once it's finished. */}
      <div 
        className={`absolute inset-0 z-20 bg-black flex items-center justify-center transition-opacity duration-1000 ${isVideoFinished ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <h1 className="text-white text-4xl font-serif animate-pulse">
          Welcome to the Grand Hall
        </h1>
      </div>

    </main>
  );
}