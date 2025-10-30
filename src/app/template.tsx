"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        
        // THE FIX: Using a simpler opacity fade is more reliable on mobile.
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        
        // THE FIX: Shortened the duration to feel more responsive.
        transition={{ ease: 'easeInOut', duration: 0.5 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}