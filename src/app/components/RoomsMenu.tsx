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
import { useMusicPlayer } from '@/app/context/MusicPlayerContext';

const uncialAntiqua = Uncial_Antiqua({ subsets: ['latin'], weight: ['400'] });

const navLinks = [
  { name: "Grand Hall", href: "/hall" },
  { name: "The Grimoire", href: "/grimoire" }, // NEW
  { name: "The Spell Room", href: "/spell-room" },
  { name: "Oracle Room", href: "/oracle-room" },
  { name: "The School", href: "/the-magick-psychic-school" },
  { name: "Magickal Tools", href: "/magickal-tools" },
  { name: "Faestone Store", href: "/store" },
];

export default function RoomsMenu() {
  const { isOpen, closeMenu } = useNavMenu();
  const { setIsExpanded } = useMusicPlayer();
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
        className={`fixed top-0 right-0 bottom-0 z-50 h-full w-full max-w-sm md:max-w-md transition-transform duration-500 ease-in-out flex flex-col items-center justify-center pointer-events-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Aspect Ratio Container for Image + Content */}
        {/* We use pointer-events-auto on this container to recapture interaction inside the menu */}
        <div className="relative w-full aspect-[1000/1644] max-h-screen pointer-events-auto">
            
            <button 
                onClick={closeMenu}
                aria-label="Close menu"
                className="absolute top-8 -left-16 z-50 flex items-center justify-center w-12 h-12 rounded-full border-2 border-amber-400/50 bg-black/80 text-amber-300 hover:bg-amber-900/50 hover:border-amber-300 transition-all active:scale-90 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <Image
                src="/images/door.png"
                alt="Navigation Door"
                fill
                priority
                className="object-contain"
            />
            
            {/* Content Overlay - Positioned perfectly based on user specs */}
            {/* Left: 16.6%, Top: 18.5%, Width: 67.7%, Height: 75.4% */}
            <div 
                className="absolute flex flex-col"
                style={{
                    left: '16.6%',
                    top: '18.5%',
                    width: '67.7%',
                    height: '75.4%',
                    // Visualize safe area for debugging if needed:
                    // border: '1px solid red' 
                }}
            >
                <div className="w-full h-full flex flex-col items-center justify-start overflow-y-auto no-scrollbar py-2 px-1">
                
                    {/* Credit Display */}
                    {user && credits !== null && (
                        <div className="shrink-0 flex items-center gap-2 bg-black/40 border border-amber-500/30 px-3 py-1.5 rounded-lg mb-4 w-full justify-between">
                            <div className="flex items-center gap-2">
                                <Coins size={14} className="text-amber-400" />
                                <span className="text-amber-100 font-mono font-bold text-sm">{credits}</span>
                            </div>
                            <Link href="/store" onClick={closeMenu} className="text-[10px] text-amber-500 uppercase font-bold hover:text-white flex items-center gap-1">
                                Add <Plus size={10} />
                            </Link>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col items-center justify-around w-full gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                target={link.href.startsWith('http') ? '_blank' : '_self'}
                                rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
                                onClick={closeMenu}
                                className={`${uncialAntiqua.className} text-xl md:text-2xl text-center text-amber-300 hover:text-amber-100 transition-colors leading-tight`}
                                style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="shrink-0 pt-4 mt-2 border-t-2 border-amber-400/50 w-full flex flex-col items-center gap-3">
                        <button
                            onClick={() => {
                                setIsExpanded(true);
                                closeMenu();
                            }}
                            className={`${uncialAntiqua.className} text-xl md:text-2xl w-full text-center text-amber-300 hover:text-amber-100 transition-colors`}
                            style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}
                        >
                            Music Player
                        </button>

                        {user ? (
                            <button
                                onClick={handleLogout}
                                className={`${uncialAntiqua.className} text-xl md:text-2xl w-full text-center text-amber-300/70 hover:text-red-300 transition-colors`}
                                style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                onClick={closeMenu}
                                className={`${uncialAntiqua.className} text-xl md:text-2xl w-full text-center text-amber-300 hover:text-amber-100 transition-colors`}
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