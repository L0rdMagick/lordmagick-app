"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { Session } from '@/lib/types';

import SpellGenerator from '@/app/components/SpellGenerator';
import WiccaSpellGenerator from '@/app/components/WiccaSpellGenerator';
import AuthPage from '@/app/components/AuthPage';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import RoomsButton from '@/app/components/RoomsButton';
import MagickalBackLink from '@/app/components/MagickalBackLink';

const traditionDetails: { [key: string]: { name: string; component: React.FC<any> } } = {
  'chaos-magick-spells-app': { name: 'Chaos Magick', component: SpellGenerator },
  'wicca-witchcraft-spells-app': { name: 'Wicca & Witchcraft', component: WiccaSpellGenerator },
};

export default function SpellTraditionPage() {
  const params = useParams();
  const router = useRouter();
  const traditionSlug = params.tradition as string;

  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchProfile = useCallback(async (user: any) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error fetching profile:", profileError);
    } else {
      setProfile(profileData);
    }
  }, [supabase]);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchProfile(session.user);
      }
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const handleBack = () => {
    router.push('/spell-room');
  };

  const renderContent = () => {
    if (loading) {
      return <div className="bg-black/50 p-8 rounded-lg"><LoadingSpinner /></div>;
    }
    if (!session) {
      return <div className="bg-black/50 backdrop-blur-sm p-8 rounded-lg border border-white/10 w-full max-w-lg"><AuthPage /></div>;
    }
    if (session && profile !== undefined) {
      const tradition = traditionDetails[traditionSlug];
      if (tradition) {
        const SpellComponent = tradition.component;
        return (
          <div className="w-full max-w-2xl bg-black/60 backdrop-blur-md p-8 rounded-lg border border-white/10">
            <SpellComponent 
              session={session} 
              isSubscribed={profile?.is_subscribed || false} 
              onBack={handleBack} 
            />
          </div>
        );
      }
      return <div className="text-white">Tradition not found. Please return to the Spell Room.</div>;
    }
    return <div className="bg-black/50 p-8 rounded-lg"><LoadingSpinner /></div>;
  };

  const traditionName = traditionDetails[traditionSlug]?.name || "Spell Crafter";

  return (
    <main 
      className="relative min-h-screen w-full bg-black bg-cover bg-center flex flex-col"
      style={{ backgroundImage: "url('/images/spell-room/spell-room-background.png')" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      
      <header className="relative z-20 w-full p-6">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <MagickalBackLink href="/spell-room" text="All Traditions" />
          <RoomsButton />
        </div>
      </header>

      <div className="relative z-10 grow flex flex-col items-center justify-center container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-serif text-purple-300 text-center mb-8" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          {traditionName}
        </h1>
        {renderContent()}
      </div>
    </main>
  );
}