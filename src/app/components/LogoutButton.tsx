"use client";

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Redirect to the homepage after logout
    router.push('/');
    // Refresh the router cache to ensure a clean state
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="fixed top-4 right-4 bg-black/50 text-white py-2 px-4 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors z-50"
    >
      Logout
    </button>
  );
}