// src/app/login/page.tsx

"use client";

// THE FIX: The function is now correctly named createBrowserClient
import { createBrowserClient } from "@supabase/ssr";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export default function LoginPage() {
  // THE FIX: The function call is updated and now passes the required env variables.
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (session) {
          router.push('/hall');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <main 
      className="relative min-h-screen w-full bg-black bg-cover bg-center p-8 flex items-center justify-center" 
      style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md p-8 bg-black/50 rounded-xl border border-gray-700/50">
        <div className="relative w-full max-w-xs mx-auto mb-6">
            <Image 
              src="/images/logo-lordmagick.com.png" 
              alt="LordMagick.com Logo" 
              width={600} 
              height={200} 
              priority 
              style={{ width: '100%', height: 'auto', filter: 'drop-shadow(1px 1px 3px rgba(0,0,0,0.5))' }} 
            />
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(260 70% 50%)',
                  brandAccent: 'hsl(260 70% 60%)',
                  defaultButtonText: 'white',
                  inputBackground: 'rgba(50,50,50,0.5)',
                  inputText: 'white',
                  inputLabelText: '#ccc',
                },
              },
            },
          }}
          theme="dark"
          providers={['google']}
          redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`}
        />
        
        <div className="mt-8 text-center">
            <Link href="/hall" className="text-sm text-gray-400 hover:text-amber-300 transition-colors">
              &larr; Return to the Grand Hall
            </Link>
        </div>
      </div>
    </main>
  );
}