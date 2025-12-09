"use client";

import { useCallback } from 'react';

export const useHaptics = () => {
  const trigger = useCallback((pattern: number | number[]) => {
    // Safety check: Ensure window and navigator exist (SSR safe) and vibrate is supported
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Silently fail on devices that throw errors for vibration (rare but possible)
        console.warn("Haptic feedback failed", e);
      }
    }
  }, []);

  const triggerLight = useCallback(() => trigger(10), [trigger]);
  const triggerMedium = useCallback(() => trigger(40), [trigger]);
  const triggerHeavy = useCallback(() => trigger(70), [trigger]);
  
  // Magickal pattern: A double heartbeat pulse
  const triggerHeartbeat = useCallback(() => trigger([50, 50, 50]), [trigger]);
  
  // Error pattern: Three rapid buzzes
  const triggerError = useCallback(() => trigger([30, 30, 30, 30, 30]), [trigger]);

  return {
    trigger,
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerHeartbeat,
    triggerError
  };
};