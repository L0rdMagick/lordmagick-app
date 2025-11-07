"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Uncial_Antiqua } from 'next/font/google';
import type { User } from '@supabase/supabase-js';

const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'] });

const navLinks = [
  { name: "Grand Hall", href: "/hall" },
  { name: "The Spell Room", href: "https://spells.lordmagick.com/" },
  { name: "Oracle Room", href: "/oracle-room" },
  { name: "The Library", href: "/library" },
  { name: "Marketplace", href: "/marketplace" },
];

export default function GlobalNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // THE FIX: Import hooks for routing and auth
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // THE FIX: Check user auth state on component mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();

    return () => subscription.unsubscribe();
  }, [supabase.auth]);


  const toggleNav = () => setIsOpen(!isOpen);
  const closeNav = () => setIsOpen(false);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    closeNav(); // Close the menu
    router.push('/'); // Redirect to the homepage after logout
    router.refresh(); // Refresh router cache
  };

  // THE FIX: Do not render the navigation on the root landing page
  if (pathname === '/') {
    return null;
  }

  return (
    <>
      {/* THE FIX: Button is restyled and repositioned to the bottom right */}
      <button
        onClick={toggleNav}
        className="fixed bottom-6 right-6 z-50 w-36 h-20 transition-transform hover:scale-105 active:scale-95"
        style={{ filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.7))' }}
        aria-label="Toggle navigation menu"
      >
        <Image
            src="/images/glowing-rooms-button.png" // Assumes you created this image
            alt="Open rooms navigation"
            fill
            sizes="144px"
        />
        <span 
            className="absolute inset-0 flex items-center justify-center text-white font-semibold text-lg uppercase tracking-wider"
            style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
        >
            Rooms
        </span>
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
                    target={link.href.startsWith('http') ? '_blank' : '_self'}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
                    onClick={closeNav}
                    className={`${uncialAntiqua.className} text-3xl text-center text-amber-300 hover:text-amber-100 transition-colors`}
                    style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}
                >
                    {link.name}
                </Link>
                ))}
                
                {/* THE FIX: Conditional Login/Logout Button */}
                <div className="pt-4 mt-4 border-t-2 border-amber-400/50 w-full">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className={`${uncialAntiqua.className} text-3xl w-full text-center text-amber-300 hover:text-amber-100 transition-colors`}
                      style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={closeNav}
                      className={`${uncialAntiqua.className} text-3xl w-full text-center text-amber-300 hover:text-amber-100 transition-colors`}
                      style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}
                    >
                      Login
                    </Link>
                  )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}