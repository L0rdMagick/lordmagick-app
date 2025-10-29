"use client";

import { useEffect } from 'react';

const DRONE_VOLUME = 0.3; // 30% volume, ideal for ambience

const BackgroundAudio = () => {
  useEffect(() => {
    const droneSound = new Audio('/audio/sfx-drone-main-hall.mp3');
    droneSound.loop = true;
    droneSound.volume = DRONE_VOLUME;

    let hasInteracted = false;

    const playAudio = () => {
      droneSound.play().catch(error => {
        console.log("Waiting for user interaction to play drone sound.");
      });
    };

    playAudio();

    const enableAudioOnInteraction = () => {
      if (!hasInteracted) {
        hasInteracted = true;
        playAudio();
        window.removeEventListener('click', enableAudioOnInteraction);
        window.removeEventListener('keydown', enableAudioOnInteraction);
      }
    };

    window.addEventListener('click', enableAudioOnInteraction);
    window.addEventListener('keydown', enableAudioOnInteraction);

  }, []);

  return null;
};

export default BackgroundAudio;