"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Session } from '@/lib/types';
import SpellRoom from '../components/SpellRoom';
import AuthPage from '../components/AuthPage';
import LoadingSpinner from '../components/LoadingSpinner';
import RoomsButton from '../components/RoomsButton'; // THE FIX: Import the button

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
      return <LoadingSpinner customMessage="Unsealing the Spell Room..." />;
    }
    if (!session) {
      return <AuthPage />;
    }
    if (session && profile !== undefined) {
      return <SpellRoom session={session} isSubscribed={profile?.is_subscribed || false} onBack={() => {}} />;
    }
    return <LoadingSpinner customMessage="Summoning your Grimoire..." />;
  };

  return (
    <main 
      className="relative min-h-screen w-full bg-black bg-cover bg-center"
      style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
        
        {/* THE FIX: Added the new responsive header to this page */}
        <header className="mb-8 w-full">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <h1 className={`text-5xl md:text-6xl text-purple-300 text-center md:text-left`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    The Spell Room
                </h1>
                <RoomsButton className="ml-0 md:ml-8" />
            </div>
        </header>

        <main className="bg-black/40 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl shadow-purple-500/10 border border-white/10">
          {renderContent()}
        </main>
      </div>
    </main>
  );
}