// src/app/oracle-room/tarot-reading/[reader]/page.tsx

"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const readerConfigs = {
  ambrose: {
    assistantId: "517aca67-ced6-4710-927d-4dd1f5944419",
    backgroundImageUrl: "https://images.squarespace-cdn.com/content/662b53c5379e5a412f214a15/ce4dd7e2-a21c-47e9-a2f3-ae98693f0da4/A_front-facing_portrait_of_an_attractive%2C_charisma.jpg?content-type=image%2Fjpeg"
  },
  natalia: {
    assistantId: "5eded252-3876-4bda-90d8-aec2c5407285",
    backgroundImageUrl: "https://images.squarespace-cdn.com/content/63ff45f58b2ecb2de4ae9935/56fb4457-d689-43cc-95f8-08c15cc34c4b/Sage+the+Tarot+Reader.jpg?content-type=image%2Fjpeg"
  }
};

export default function TarotReaderPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const readerName = params.reader as keyof typeof readerConfigs;
  const config = readerConfigs[readerName];

  useEffect(() => {
    // Authentication Check
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login'); 
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  useEffect(() => {
    if (typeof window === 'undefined' || !config) return;

    // Set the CSS variable for the background image
    document.documentElement.style.setProperty('--vapi-background-image', `url('${config.backgroundImageUrl}')`);

    const scriptId = 'vapi-script';
    if (document.getElementById(scriptId)) return; // Prevent multiple script injections

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    script.defer = true;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.vapiSDK) {
        const vapiInstance = window.vapiSDK.run({
          apiKey: process.env.NEXT_PUBLIC_VAPI_API_KEY!,
          assistant: config.assistantId,
          // We pass an empty config because our global CSS handles all the styling.
          config: {}, 
        });

        // THE FIX: Re-implement the "End Call" warning logic
        vapiInstance.on('call-start', () => {
            const buttonElement = document.getElementById('vapi-support-btn');
            const innerButton = buttonElement?.querySelector<HTMLElement>('div');
            if (innerButton && !document.getElementById('buttonOverlay')) {
                const overlay = document.createElement('div');
                overlay.id = 'buttonOverlay';
                overlay.onclick = (e) => {
                    e.stopPropagation();
                    const modal = document.getElementById('warningModal');
                    if (modal) modal.style.display = 'block';
                };
                innerButton.appendChild(overlay);
            }
        });

        vapiInstance.on('call-end', () => {
            const overlay = document.getElementById('buttonOverlay');
            if (overlay) overlay.parentNode?.removeChild(overlay);
        });
      }
    };
  }, [config]);

  if (!config) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Oracle not found.</div>;
  }

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Vapi will inject its button into this div */}
      <div id="vapi-support-btn"></div>
      
      {/* Warning Modal for ending call */}
      <div id="warningModal" className="modal">
        <div className="modal-content">
          <p>End the current reading?</p>
          <button onClick={() => location.reload()}>End Session</button>
          <button onClick={() => { 
            const modal = document.getElementById('warningModal'); 
            if (modal) modal.style.display = 'none'; 
          }}>Keep Session</button>
        </div>
      </div>

      {/* We can add the card display back later once the AI flow is confirmed working */}
      {/* <div className="tarot-container"><div id="tarotDisplay" className="tarot-display"></div></div> */}
    </main>
  );
}