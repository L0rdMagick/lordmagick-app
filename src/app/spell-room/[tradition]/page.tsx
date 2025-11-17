// --- START OF FILE src/app/spell-room/[tradition]/page.tsx ---

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { Session } from '@/lib/types';

import SpellGenerator from '@/app/components/SpellGenerator';
import WiccaMagick from '@/app/components/WiccaMagick';
import HoodooVoodooMagick from '@/app/components/HoodooVoodooMagick'; // THE FIX: Import the new component
import AuthPage from '@/app/components/AuthPage';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import RoomsButton from '@/app/components/RoomsButton';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import ComingSoon from '@/app/components/ComingSoon';

const traditionDetails: { [key: string]: { name: string; component: React.FC<any> } } = {
  'chaos-magick-spells-app': { name: 'Chaos Magick', component: SpellGenerator },
  'wicca-magick-spells-app': { name: 'Wicca Magick', component: WiccaMagick },
  'hoodoo-rootwork-spells-app': { name: 'Hoodoo (Rootwork)', component: HoodooVoodooMagick }, // THE FIX: Add new tradition route
  'ceremonial-magick-spells-app': { name: 'Ceremonial Magick', component: ComingSoon },
  'folk-magick-spells-app': { name: 'Folk Magick', component: ComingSoon },
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

  // --- THE FIX: This logic now handles BOTH full-screen, independent components ---
  const isFullScreenTradition = traditionSlug === 'wicca-magick-spells-app' || traditionSlug === 'hoodoo-rootwork-spells-app';

  if (isFullScreenTradition) {
    const backgroundImageUrl = traditionSlug === 'wicca-magick-spells-app' 
      ? "/images/spell-room/spell-room-background.png" 
      : "/images/Spells/HooDoo Voo Doo/background-shack-interior.png";

    const FullScreenWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
        <div className="relative min-h-screen w-full bg-black bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: `url('${backgroundImageUrl}')` }}>
            {children}
        </div>
    );

    if (loading) return <FullScreenWrapper><LoadingSpinner /></FullScreenWrapper>;
    if (!session) return <FullScreenWrapper><div className="bg-black/50 backdrop-blur-sm p-8 rounded-lg border border-white/10 w-full max-w-lg"><AuthPage /></div></FullScreenWrapper>;
    
    const Component = traditionDetails[traditionSlug]?.component;
    if (!Component) return <FullScreenWrapper><div>Tradition component not found.</div></FullScreenWrapper>;

    return <Component session={session} isSubscribed={profile?.is_subscribed || false} />;
  }
  // --- END FIX ---

  const handleBack = () => {
    router.push('/spell-room');
  };

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
    if (!session) return <div className="flex items-center justify-center h-full"><div className="bg-black/50 backdrop-blur-sm p-8 rounded-lg border border-white/10 w-full max-w-lg"><AuthPage /></div></div>;
    if (session && profile !== undefined) {
      const tradition = traditionDetails[traditionSlug];
      if (tradition) {
        const PageComponent = tradition.component;
        if (PageComponent === ComingSoon) return <PageComponent />;
        
        return (
          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-2xl bg-black/60 backdrop-blur-md p-8 rounded-lg border border-white/10">
              <PageComponent session={session} isSubscribed={profile?.is_subscribed || false} onBack={handleBack} />
            </div>
          </div>
        );
      }
      return <div className="flex items-center justify-center h-full text-white">Tradition not found.</div>;
    }
    return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
  };

  const traditionName = traditionDetails[traditionSlug]?.name || "Spell Crafter";

  return (
    <main 
      className="relative min-h-screen w-full bg-black bg-cover bg-center flex flex-col"
      style={{ backgroundImage: "url('/images/spell-room/spell-room-background.png')" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <header className="relative z-20 w-full p-4 md:p-6 shrink-0">
        <div className="flex justify-between items-center flex-wrap w-full max-w-7xl mx-auto">
          <div className="order-1">
            <MagickalBackLink href="/spell-room" text="All Traditions" />
          </div>
          <div className="order-2 md:order-3">
            <RoomsButton />
          </div>
          <h1 className="w-full text-center order-3 md:w-auto md:order-2 text-4xl md:text-5xl font-serif text-purple-300 mt-2 md:mt-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {traditionName}
          </h1>
        </div>
      </header>
      <div className="relative z-10 grow w-full flex flex-col overflow-hidden">
        <div className="relative w-full h-full">
          {renderContent()}
        </div>
      </div>
    </main>
  );
}
// --- END OF FILE ---