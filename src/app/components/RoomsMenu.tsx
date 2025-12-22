"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Uncial_Antiqua } from 'next/font/google';
import type { User } from '@supabase/supabase-js';
import { useNavMenu } from '../context/NavMenuContext';
import { Coins, Plus } from 'lucide-react'; // Import icons

const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'] });

const navLinks = [
  { name: "Grand Hall", href: "/hall" },
  { name: "The Grimoire", href: "/grimoire" }, // NEW
  { name: "The Spell Room", href: "/spell-room" },
  { name: "Oracle Room", href: "/oracle-room" },
  { name: "The School", href: "/the-magick-psychic-school" },
  { name: "Magickal Tools", href: "/magickal-tools" },
  { name: "Aether Store", href: "/store" },
];

export default function RoomsMenu() {
  const { isOpen, closeMenu } = useNavMenu();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number | null>(null); // Add state for credits
  
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchCredits(session.user.id);
    });

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchCredits(user.id);
    }
    getUser();

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const fetchCredits = async (userId: string) => {
      const { data } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', userId)
          .single();
      if (data) setCredits(data.credits);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    closeMenu();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <div
        onClick={closeMenu}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 h-full w-full max-w-sm md:max-w-md transition-transform duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="relative w-full h-full">
          <button 
            onClick={closeMenu}
            aria-label="Close menu"
            className="absolute top-8 left-12 z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 border-amber-400/50 bg-black/30 text-amber-300 hover:bg-amber-900/50 hover:border-amber-300 transition-all active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <Image
            src="/images/door.png"
            alt="Navigation Door"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="pointer-events-none object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex w-3/5 flex-col items-center space-y-6">
              
              {/* Credit Display in Menu */}
              {user && credits !== null && (
                  <div className="flex items-center gap-3 bg-black/40 border border-amber-500/30 px-4 py-2 rounded-lg mb-4 w-full justify-between">
                      <div className="flex items-center gap-2">
                        <Coins size={16} className="text-amber-400" />
                        <span className="text-amber-100 font-mono font-bold">{credits}</span>
                      </div>
                      <Link href="/store" onClick={closeMenu} className="text-[10px] text-amber-500 uppercase font-bold hover:text-white flex items-center gap-1">
                          Add <Plus size={10} />
                      </Link>
                  </div>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : '_self'}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
                  onClick={closeMenu}
                  className={`${uncialAntiqua.className} text-3xl text-center text-amber-300 hover:text-amber-100 transition-colors`}
                  style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}
                >
                  {link.name}
                </Link>
              ))}
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
                    onClick={closeMenu}
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