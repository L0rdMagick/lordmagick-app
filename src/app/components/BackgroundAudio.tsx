// --- START OF FILE src/app/components/BackgroundAudio.tsx ---
"use client";

import { useEffect } from 'react';

const DRONE_VOLUME = 0.5; // 30% volume, ideal for ambience

const BackgroundAudio = () => {
  useEffect(() => {
    // FIX: Access globalThis safely to bypass TypeScript environment restrictions
    const globalAny = globalThis as any;
    
    // Ensure we are in a browser environment
    if (typeof globalAny.window === 'undefined') return;

    const win = globalAny.window;
    const AudioCtor = globalAny.Audio;

    const droneSound = new AudioCtor('/audio/sfx-drone-main-hall.mp3');
    droneSound.loop = true;
    droneSound.volume = DRONE_VOLUME;

    let hasInteracted = false;

    const playAudio = () => {
      // FIX: Explicitly cast error to 'any'
      droneSound.play().catch((error: any) => {
        console.log("Waiting for user interaction to play drone sound.", error);
      });
    };

    // Try auto-playing immediately (might fail depending on browser policy)
    playAudio();

    const enableAudioOnInteraction = () => {
      if (!hasInteracted) {
        hasInteracted = true;
        playAudio();
        // FIX: Use 'win' variable instead of 'window'
        win.removeEventListener('click', enableAudioOnInteraction);
        win.removeEventListener('keydown', enableAudioOnInteraction);
      }
    };

    // FIX: Use 'win' variable instead of 'window'
    win.addEventListener('click', enableAudioOnInteraction);
    win.addEventListener('keydown', enableAudioOnInteraction);

    // Cleanup to prevent memory leaks or double-playing
    return () => {
      droneSound.pause();
      droneSound.src = ''; // Clear source
      win.removeEventListener('click', enableAudioOnInteraction);
      win.removeEventListener('keydown', enableAudioOnInteraction);
    };

  }, []);

  return null;
};

export default BackgroundAudio;