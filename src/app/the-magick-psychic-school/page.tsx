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
      image: "/images/the-magick-library.png", // Assuming png based on others
      description: "Ancient tomes and arcane knowledge."
    }
  ];

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <header className="relative z-20 w-full p-4 md:p-6 shrink-0 mb-8">
        <div className="flex justify-between items-center flex-wrap w-full max-w-7xl mx-auto">
          <div className="order-1">
            <MagickalBackLink href="/hall" text="Grand Hall" />
          </div>
          <div className="order-2 md:order-3">
            <RoomsButton />
          </div>
          <h1 className="w-full text-center order-3 md:w-auto md:order-2 text-4xl md:text-5xl font-serif text-amber-300 mt-2 md:mt-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            The Magick & Psychic School
          </h1>
        </div>
        <p className="relative z-20 text-center text-gray-300 mt-4 max-w-2xl mx-auto">
            Choose your path of study. Awaken your mind, master the craft, or study the ancients.
        </p>
      </header>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-center justify-center">
        {sections.map((section) => (
          <Link key={section.name} href={section.href} className="group flex flex-col items-center">
            <div className="relative w-full aspect-3/4 max-w-[350px] transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2 filter drop-shadow-2xl">
                {/* 
                   Note: Ensure these images exist in /public/images/ 
                   If they don't exist yet, Next/Image will throw an error or show broken image.
                   You can temporarily comment out the Image component and use a div if needed.
                */}
                <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-transparent group-hover:border-amber-400/50 transition-colors">
                    <Image 
                        src={section.image} 
                        alt={section.name}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
                </div>
            </div>
            <h2 className="mt-6 text-2xl font-serif text-amber-100 group-hover:text-amber-300 transition-colors">{section.name}</h2>
            <p className="text-sm text-gray-400 mt-2 text-center max-w-xs">{section.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}