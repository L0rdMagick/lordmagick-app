"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Uncial_Antiqua } from 'next/font/google';

const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'] });

const navLinks = [
  { name: "Grand Hall", href: "/hall" },
  { name: "The Spell Room", href: "/spell-room" },
  { name: "Oracle Room", href: "/oracle-room" },
  { name: "The Library", href: "/library" },
  { name: "Marketplace", href: "/marketplace" },
];

export default function GlobalNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => setIsOpen(!isOpen);
  const closeNav = () => setIsOpen(false);

  return (
    <>
      {/* Navigation Trigger Button */}
      <button
        onClick={toggleNav}
        // THE FIX: Changed z-[60] to z-50 for canonical class name
        className="fixed top-4 right-4 z-50 bg-black/50 text-white py-2 px-4 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
        aria-label="Toggle navigation menu"
      >
        Rooms
      </button>

      {/* Backdrop - Dims the page when nav is open */}
      <div
        onClick={closeNav}
        // THE FIX: Adjusted z-index to maintain stacking order
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-30 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* The Sliding Door Navigation Panel */}
      <div
        // THE FIX: Adjusted z-index to maintain stacking order
        className={`fixed top-0 right-0 bottom-0 z-40 h-full w-full max-w-sm md:max-w-md transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Door Image as the background */}
        <Image
          src="/images/door.png"
          alt="Navigation Door"
          fill
          style={{ objectFit: 'contain', objectPosition: 'right' }}
          className="pointer-events-none"
        />

        {/* Links container, centered over the door */}
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeNav}
              className={`${uncialAntiqua.className} text-3xl text-amber-300 hover:text-amber-100 transition-colors`}
              style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}