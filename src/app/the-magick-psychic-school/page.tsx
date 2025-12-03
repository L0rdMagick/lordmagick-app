"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';

export default function SchoolPage() {
  const sections = [
    {
      name: "Psychic Training",
      href: "/the-magick-psychic-school/psychic-training",
      image: "/images/psychic-training.png",
      description: "Develop your inner sight and intuition."
    },
    {
      name: "Magick Training",
      href: "/the-magick-psychic-school/magick-training",
      image: "/images/magick-training.png",
      description: "Learn the arts of manifestation and ritual."
    },
    {
      name: "The Magick Library",
      href: "/the-magick-psychic-school/the-magick-library",
      image: "/images/the-magick-library.png",
      description: "Ancient tomes and arcane knowledge."
    }
  ];

  return (
    <main 
      // UPDATED CLASSNAME:
      // min-h-screen: Allows the container to grow on mobile so scrolling works naturally.
      // md:h-screen: Locks the height to the viewport on desktop/tablets to fit in one screen.
      // md:overflow-hidden: Prevents scrolling on desktop.
      className="relative w-full bg-black bg-cover bg-center flex flex-col p-4 md:p-8 min-h-screen md:h-screen md:overflow-hidden" 
      style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}
    >
      
      {/* HEADER */}
      <header className="relative z-20 w-full shrink-0">
        <div className="flex justify-between items-center flex-wrap w-full max-w-7xl mx-auto">
          <div className="order-1">
            <MagickalBackLink href="/hall" text="Grand Hall" />
          </div>
          <div className="order-2 md:order-3">
            <RoomsButton />
          </div>
          <h1 className="w-full text-center order-3 md:w-auto md:order-2 text-3xl md:text-5xl font-serif text-amber-300 mt-2 md:mt-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            The Magick & Psychic School
          </h1>
        </div>
        <p className="relative z-20 text-center text-gray-200 mt-2 max-w-2xl mx-auto font-medium text-sm md:text-base" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}>
            Choose your path of study. Awaken your mind, master the craft, or study the ancients.
        </p>
      </header>

      {/* CONTENT CONTAINER */}
      <div className="relative z-10 grow flex items-center justify-center w-full py-8 md:py-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-4 lg:gap-12 max-w-7xl w-full items-center justify-items-center">
          {sections.map((section) => (
            <Link key={section.name} href={section.href} className="group flex flex-col items-center justify-center w-full h-full">
              
              {/* IMAGE WRAPPER */}
              <div className="relative w-full max-w-[300px] md:max-w-[350px] aspect-square h-auto max-h-[40vh] lg:max-h-[50vh] transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                  <div className="relative w-full h-full flex items-center justify-center">
                      <Image 
                          src={section.image} 
                          alt={section.name}
                          fill
                          className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all duration-300"
                          sizes="(max-width: 768px) 100vw, 33vw"
                      />
                  </div>
              </div>
              
              <h2 className="mt-4 text-2xl md:text-3xl font-serif text-amber-100 group-hover:text-amber-300 transition-colors text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.5)' }}>
                  {section.name}
              </h2>
              <p className="text-xs md:text-sm text-gray-200 mt-2 text-center max-w-xs font-semibold tracking-wide" style={{ textShadow: '1px 1px 3px rgba(0,0,0,1)' }}>
                  {section.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}