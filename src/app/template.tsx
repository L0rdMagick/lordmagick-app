"use client";

import { motion } from 'framer-motion';

// This component will wrap every page in our application
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      // The animation starts with the page invisible and slightly moved down
      initial={{ opacity: 0, y: 20 }}
      // The animation ends with the page fully visible and at its normal position
      animate={{ opacity: 1, y: 0 }}
      // This defines the smooth transition timing
      transition={{ ease: 'easeInOut', duration: 3.75 }}
    >
      {children}
    </motion.div>
  );
}