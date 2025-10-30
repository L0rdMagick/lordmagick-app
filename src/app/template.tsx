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
        
        // THE FIX: The animation now starts slightly below and fades in.
        initial={{ opacity: 0, y: 15 }}
        
        // The animation ends fully visible at its normal position.
        animate={{ opacity: 1, y: 0 }}
        
        // THE FIX: The exit animation fades out and moves slightly up.
        exit={{ opacity: 0, y: -15 }}
        
        // THE FIX: The transition is now much faster for a more responsive feel.
        transition={{ ease: 'easeInOut', duration: 0.75 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}