"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

// This component will wrap every page in our application
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    // AnimatePresence is the key to enabling exit animations.
    // `mode="wait"` ensures the old page finishes its exit animation
    // before the new page begins its enter animation.
    <AnimatePresence mode="wait">
      <motion.div
        // A unique key is required for AnimatePresence to track components.
        // The page's pathname is a perfect unique key.
        key={pathname}
        
        // The animation starts with the page invisible and slightly moved down.
        initial={{ opacity: 0, y: 0 }}
        
        // The animation ends with the page fully visible at its normal position.
        animate={{ opacity: 1, y: 0 }}
        
        // NEW: This defines the exit animation. It will fade out and move up.
        exit={{ opacity: 0, y: 0 }}
        
        // This defines the smooth transition timing for all states.
        // I've slightly shortened the duration for a crisper feel.
        transition={{ ease: 'easeInOut', duration: 2.00 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}