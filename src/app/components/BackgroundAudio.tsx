"use client";

import { useEffect } from 'react';

// NEW: Define a specific volume for the background drone.
const DRONE_VOLUME = 0.3; // 30% volume, ideal for ambience

const BackgroundAudio = () => {
  useEffect(() => {
    // This component mounts once and never unmounts, so the audio is persistent.
    const droneSound = new Audio('/audio/sfx-drone-main-hall.mp3');
    droneSound.loop = true;
    droneSound.volume = DRONE_VOLUME;

    // We use a variable to track if the user has interacted to avoid console errors.
    let hasInteracted = false;

    const playAudio = () => {
      droneSound.play().catch(error => {
        // This catch block handles the browser's autoplay policy.
        // The audio will start as soon as the user clicks anywhere.
        console.log("Waiting for user interaction to play drone sound.");
      });
    };

    // Attempt to play immediately
    playAudio();

    const enableAudioOnInteraction = () => {
      if (!hasInteracted) {
        hasInteracted = true;
        playAudio();
        // Remove the listener after the first interaction
        window.removeEventListener('click', enableAudioOnInteraction);
        window.removeEventListener('keydown', enableAudioOnInteraction);
      }
    };

    // Add listeners to play the sound upon the first user interaction
    window.addEventListener('click', enableAudioOnInteraction);
    window.addEventListener('keydown', enableAudioOnInteraction);

    // No cleanup function is needed because we want this to play forever.

  }, []); // The empty array ensures this runs only once.

  return null; // This component renders no visible HTML.
};

export default BackgroundAudio;