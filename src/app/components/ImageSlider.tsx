"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageSliderProps {
  images: string[];
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const Arrow = ({ direction, onClick }: { direction: 'left' | 'right', onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`absolute top-1/2 -translate-y-1/2 z-10 bg-black/40 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-colors ${direction === 'left' ? 'left-2' : 'right-2'}`}
    >
        {direction === 'left' ? '<' : '>'}
    </button>
);

export default function ImageSlider({ images }: ImageSliderProps) {
  const [[page, direction], setPage] = useState([0, 0]);

  const imageIndex = ((page % images.length) + images.length) % images.length;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  return (
    <div className="w-full aspect-[3/4] relative overflow-hidden rounded-lg shadow-lg">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          className="absolute w-full h-full"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
        >
          <Image
            src={images[imageIndex]}
            alt={`Product image ${imageIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: 'cover' }}
          />
        </motion.div>
      </AnimatePresence>
      <Arrow direction="left" onClick={() => paginate(-1)} />
      <Arrow direction="right" onClick={() => paginate(1)} />
    </div>
  );
}