// src/app/oracle-room/tarot-reading/[reader]/page.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

// --- TYPE DECLARATIONS for the Vapi HTML Script SDK ---
declare global {
  interface Window {
    vapiSDK: {
      run: (config: any) => any;
    };
  }
}

// --- TYPE DEFINITIONS ---
interface TarotCard { url: string; name: string; }
type CallStateConfig = { title: string; subtitle: string; };
interface ReaderConfig {
  assistantId: string;
  buttonConfig: {
    idle: CallStateConfig;
    loading: CallStateConfig;
    active: CallStateConfig;
    backgroundImageUrl: string;
  };
}

const readerConfigs: Record<string, ReaderConfig> = {
  ambrose: {
    assistantId: "517aca67-ced6-4710-927d-4dd1f5944419",
    buttonConfig: {
      idle: { title: "Begin Your Tarot Reading", subtitle: "Speak with Ambrose" },
      loading: { title: "Connecting to Spirit", subtitle: "Waiting for Ambrose" },
      active: { title: "Speaking with Ambrose", subtitle: "End the Reading" },
      backgroundImageUrl: "https://images.squarespace-cdn.com/content/662b53c5379e5a412f214a15/ce4dd7e2-a21c-47e9-a2f3-ae98693f0da4/A_front-facing_portrait_of_an_attractive%2C_charisma.jpg?content-type=image%2Fjpeg"
    }
  },
  natalia: {
    assistantId: "5eded252-3876-4bda-90d8-aec2c5407285",
    buttonConfig: {
      idle: { title: "Begin Your Tarot Reading", subtitle: "Speak with Natalia" },
      loading: { title: "Connecting to Spirit", subtitle: "Wait my lovely" },
      active: { title: "Reading is in Progress..", subtitle: "End the Reading" },
      backgroundImageUrl: "https://images.squarespace-cdn.com/content/63ff45f58b2ecb2de4ae9935/56fb4457-d689-43cc-95f8-08c15cc34c4b/Sage+the+Tarot+Reader.jpg?content-type=image%2Fjpeg"
    }
  }
};

export default function TarotReaderPage() {
  const params = useParams();
  const readerName = params.reader as keyof typeof readerConfigs;
  const config = readerConfigs[readerName];

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<TarotCard[]>([]);
  
  const vapiSessionIdRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef(0);

  // --- AUTH CHECK (Bypassed for testing) ---
  useEffect(() => {
    setUser({ id: 'test-user-id' } as User);
    setIsLoading(false);
  }, []);

  // --- POLLING LOGIC ---
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const pollForCards = useCallback(async (sessionId: string) => {
    if (pollingAttemptsRef.current >= 20) { stopPolling(); return; }
    pollingAttemptsRef.current++;
    try {
        const response = await fetch('/api/tarot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getCards', vapiSessionId: sessionId }),
        });
        const data = await response.json();
        if (data.cards && data.cards.length > 0) {
            setCards(data.cards);
            stopPolling();
            const loadingEl = document.getElementById('loading');
            if (loadingEl) loadingEl.classList.add('hidden');
        }
    } catch (error) { console.error('Polling error:', error); }
  }, [stopPolling]);

  const startPollingForCards = useCallback(() => {
    const sessionId = vapiSessionIdRef.current;
    if (!sessionId) { 
        console.error("Could not get session ID for polling."); 
        // Poll again for the ID in case of a race condition
        setTimeout(startPollingForCards, 500);
        return; 
    }
    stopPolling(); 
    pollingAttemptsRef.current = 0;
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.classList.remove('hidden');

    setTimeout(() => {
        pollForCards(sessionId);
        pollingIntervalRef.current = setInterval(() => pollForCards(sessionId), 7000);
    }, 15000);
  }, [pollForCards, stopPolling]);

  // --- VAPI & NETWORK INTERCEPTION SETUP ---
  useEffect(() => {
    if (!config || !user) return;

    // 1. Intercept network requests to capture the session ID
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const urlString = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
      if (urlString.includes('vapi.aiforpaper.com')) {
        const sessionId = urlString.split('/').pop()?.split('?')[0];
        if (sessionId && sessionId.length > 10) { // Basic validation
          console.log('VAPI Session ID captured:', sessionId);
          vapiSessionIdRef.current = sessionId;
          
          // As soon as ID is captured, create the session record
          try {
            await fetch('/api/tarot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'startSession',
                userId: user.id,
                vapiSessionId: sessionId,
                readerName: readerName,
                cardCount: 10,
              }),
            });
          } catch (err) {
            console.error("Failed to start session on backend", err);
          }
        }
      }
      return originalFetch(input, init);
    };

    // 2. Dynamically inject the Vapi HTML script
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.vapiSDK) {
        const vapiInstance = window.vapiSDK.run({
          apiKey: process.env.NEXT_PUBLIC_VAPI_API_KEY!,
          assistant: config.assistantId,
          config: {
            ...config.buttonConfig,
            position: "manual" // We will manually place it
          },
        });

        vapiInstance.on('call-start', () => {
          console.log('Call has started');
          startPollingForCards();
          const btn = document.getElementById('vapi-support-btn');
          if (btn) btn.onclick = showWarningPopup;
        });

        vapiInstance.on('call-end', () => {
          console.log('Call has ended');
          stopPolling();
          location.reload();
        });
      }
    };

    return () => {
      window.fetch = originalFetch; // Cleanup fetch override
      const vapiButton = document.getElementById('vapi-support-btn');
      if (vapiButton) vapiButton.remove();
      document.body.removeChild(script);
    };
  }, [config, user, readerName, startPollingForCards, stopPolling]);

  const showWarningPopup = () => {
    const modal = document.getElementById('warningModal');
    if (modal) modal.style.display = 'block';
  };
  
  if (isLoading || !config) {
    return (
      <div className="relative min-h-screen w-full bg-black bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="text-center text-amber-200 text-2xl z-10"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-200 mx-auto mb-4"></div>Loading Oracle...</div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <audio id="vapiAudio" className="hidden"></audio>
      
      <div id="warningModal" className="modal">
        <div className="modal-content">
          <p>End the current reading?</p>
          <button onClick={() => location.reload()}>End Session</button>
          <button onClick={() => { const modal = document.getElementById('warningModal'); if (modal) modal.style.display = 'none'; }}>Keep Session</button>
        </div>
      </div>
      
      {/* Vapi will inject its button here, but we style the container */}
      <div id="vapi-support-btn" />

      <div className="relative z-10">
        <div className="tarot-container">
            <div id="tarotDisplay" className="tarot-display">
                {cards.map((card, index) => (<Card key={index} card={card} />))}
            </div>
        </div>
        <div className="loading-container"><div id="loading" className="loading-spinner hidden"><span>Shuffling your cards...<br/>Deck: <em>Cats of the Crown</em></span></div></div>
      </div>
    </main>
  );
}

function Card({ card }: { card: TarotCard }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);

  const handleClick = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    } else {
      setIsEnlarged(!isEnlarged);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsEnlarged(false);
  };

  return (
    <>
      <div 
        className={`card-container ${isFlipped ? 'flipped' : ''}`} 
        onClick={handleClick}
      >
        <img src={card.url} alt={card.name} className={`card-image ${isEnlarged ? 'enlarged' : ''}`} />
        <img src="https://images.squarespace-cdn.com/content/63ff45f58b2ecb2de4ae9935/8afd5dd6-f795-41fc-a9ba-7a6b39921caf/9.jpg?content-type=image%2Fjpeg" alt="Card back" className="card-cover" />
      </div>
      {isEnlarged && (
        <div 
          onClick={handleBackdropClick} 
          className="fixed inset-0 bg-black/70 z-2147483645"
        />
      )}
    </>
  );
}