"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Session } from '@/lib/types';
import SpellRoom from '../components/SpellRoom';
import AuthPage from '../components/AuthPage';
import LoadingSpinner from '../components/LoadingSpinner';
import RoomsButton from '../components/RoomsButton';
import MagickalBackLink from '../components/MagickalBackLink';

export default function SpellRoomPage() {
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

  const renderContent = () => {
    if (loading) {
      return <div className="bg-black/50 p-8 rounded-lg"><LoadingSpinner customMessage="Unsealing the Spell Room..." /></div>;
    }
    if (!session) {
      return <div className="bg-black/50 backdrop-blur-sm p-8 rounded-lg border border-white/10 w-full max-w-lg"><AuthPage /></div>;
    }
    if (session && profile !== undefined) {
      // SpellRoom now controls its own layout on the transparent background
      return <SpellRoom session={session} isSubscribed={profile?.is_subscribed || false} />;
    }
     return <div className="bg-black/50 p-8 rounded-lg"><LoadingSpinner customMessage="Summoning your Grimoire..." /></div>;
  };

  return (
    <main 
      className="relative min-h-screen w-full bg-black bg-cover bg-center flex flex-col"
      style={{ backgroundImage: "url('/images/spell-room/spell-room-background.png')" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      
      <header className="relative z-20 w-full flex justify-between items-center p-6">
        <MagickalBackLink href="/hall" text="Grand Hall" />
        <RoomsButton />
      </header>

      <div className="relative z-10 grow flex items-center justify-center container mx-auto px-4">
        {renderContent()}
      </div>
    </main>
  );
}