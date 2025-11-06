"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Uncial_Antiqua } from 'next/font/google';

const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'] });

const navLinks = [
  { name: "Grand Hall", href: "/hall" },
  // THE FIX: Updated href to the new subdomain
  { name: "The Spell Room", href: "https://spells.lordmagick.com/" },
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
      <button
        onClick={toggleNav}
        className="fixed top-4 right-4 z-50 bg-black/50 text-white py-2 px-4 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
        aria-label="Toggle navigation menu"
      >
        Rooms
      </button>

      <div
        onClick={closeNav}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-30 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        className={`fixed top-0 right-0 bottom-0 z-40 h-full w-full max-w-sm md:max-w-md transition-transform duration-500 ease-in-out flex justify-end items-center overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="relative w-full h-auto aspect-1080/1920">
          <Image
            src="/images/door.png"
            alt="Navigation Door"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="pointer-events-none object-contain"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex w-3/5 flex-col items-center space-y-6">
                {navLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    // Handle external links correctly
                    target={link.href.startsWith('http') ? '_blank' : '_self'}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
                    onClick={closeNav}
                    className={`${uncialAntiqua.className} text-3xl text-center text-amber-300 hover:text-amber-100 transition-colors`}
                    style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}
                >
                    {link.name}
                </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}