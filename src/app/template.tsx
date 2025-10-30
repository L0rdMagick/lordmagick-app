"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react'; // Import useEffect

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // THE FIX: This is our global failsafe.
  // It runs EVERY time the page URL changes.
  useEffect(() => {
    // No matter what the previous page did, we guarantee that the scrollbar
    // is restored on both the <html> and <body> elements.
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
  }, [pathname]); // The effect re-runs on every navigation.

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: 'easeInOut', duration: 0.5 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}