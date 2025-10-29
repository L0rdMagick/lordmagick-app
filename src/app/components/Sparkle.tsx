"use client";

import { motion } from 'framer-motion';

const PARTICLE_COUNT = 12; // The number of lines/particles in our burst

const Sparkle = ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <motion.div
          key={i}
          // THE FIX: Changed `bg-gradient-to-b` to the new `bg-linear-to-b`.
          className="absolute w-1 h-20 bg-linear-to-b from-amber-200 to-transparent"
          style={{
            originY: '0%', // Animate out from the center
            rotate: i * (360 / PARTICLE_COUNT),
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: [0, 1, 0] }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.1,
          }}
          // Only attach the callback to one particle to prevent it from firing multiple times
          onAnimationComplete={i === 0 ? onAnimationComplete : undefined}
        />
      ))}
    </div>
  );
};

export default Sparkle;