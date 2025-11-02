// src/app/oracle-room/tarot-reading/[reader]/page.tsx

"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

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
  const readerName = params.reader as keyof typeof readerConfigs;
  const config = readerConfigs[readerName];

  useEffect(() => {
    if (typeof window === 'undefined' || !config) return;

    // THE FIX: We go back to the simple, reliable HTML Script Tag method.
    
    // Set the CSS variable for the background image
    document.documentElement.style.setProperty('--vapi-background-image', `url('${config.backgroundImageUrl}')`);

    const scriptId = 'vapi-script';
    // Prevent adding the script multiple times
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    script.defer = true;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.vapiSDK) {
        window.vapiSDK.run({
          apiKey: process.env.NEXT_PUBLIC_VAPI_API_KEY!,
          assistant: config.assistantId,
          // The config object can be empty because our CSS will handle all styling.
          config: {},
        });
      }
    };

    // Cleanup function
    return () => {
      // It's better to let Vapi's own cleanup handle the instance,
      // but we can remove the script tag to be clean.
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        // You might need a more robust way to "destroy" the Vapi instance if one exists.
        // For now, reloading on page leave is the safest.
      }
    };
  }, [config]);

  // We no longer need any complex state or logic here. The page is just a container.
  if (!config) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Oracle not found.</div>;
  }

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      {/* Vapi will inject its button into this div */}
      <div id="vapi-support-btn"></div>
      {/* The tarot card display area can be added back here later if needed */}
    </main>
  );
}