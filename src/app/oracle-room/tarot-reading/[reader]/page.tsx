// src/app/oracle-room/tarot-reading/[reader]/page.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

// Define the structure for a Tarot card
interface TarotCard {
  url: string;
  name: string;
}

// Define the configurations for each reader
const readerConfigs = {
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
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const readerName = params.reader as keyof typeof readerConfigs;
  const config = readerConfigs[readerName];

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUiLocked, setIsUiLocked] = useState(false);
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const vapiInstanceRef = useRef<any>(null);
  const vapiSessionIdRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef(0);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login'); 
      } else {
        setUser(session.user);
        setIsLoading(false);
      }
    };
    checkUser();
  }, [router, supabase.auth]);
  
  const showWarningPopup = () => {
    const modal = document.getElementById('warningModal');
    if (modal) modal.style.display = 'block';
  };
  
  const addOverlay = () => {
    const buttonElement = document.getElementById('vapi-support-btn');
    if (buttonElement && !document.getElementById('buttonOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'buttonOverlay';
      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        showWarningPopup();
      });
      buttonElement.appendChild(overlay);
    }
  };

  const removeOverlay = () => {
    const overlay = document.getElementById('buttonOverlay');
    if (overlay) {
      overlay.parentNode?.removeChild(overlay);
    }
  };

  const showErrorPopup = (message: string) => {
    const p = document.getElementById('errorMessage');
    const modal = document.getElementById('errorModal');
    if (p && modal) {
      p.textContent = message;
      modal.style.display = 'block';
    }
  };
  
  const handleBeginReading = useCallback(async () => {
    if (!user || !vapiSessionIdRef.current || isUiLocked) return;
    setIsUiLocked(true);
    setErrorMessage(null);
    document.getElementById('loading')?.classList.remove('hidden');
    try {
        const response = await fetch('/api/tarot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'startSession',
                userId: user.id,
                vapiSessionId: vapiSessionIdRef.current,
                readerName: readerName,
                cardCount: 10,
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to start session.');
        }
        console.log('Session started successfully.');
    } catch (err: any) {
        showErrorPopup(err.message);
        setIsUiLocked(false);
        document.getElementById('loading')?.classList.add('hidden');
    }
  }, [user, isUiLocked, readerName]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const pollForCards = useCallback(async () => {
    if (!vapiSessionIdRef.current || pollingAttemptsRef.current >= 20) {
      if (pollingAttemptsRef.current >= 20) console.error("Max polling attempts reached.");
      stopPolling();
      return;
    }
    pollingAttemptsRef.current++;
    try {
        const response = await fetch('/api/tarot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getCards', vapiSessionId: vapiSessionIdRef.current }),
        });
        const data = await response.json();
        if (data.cards && data.cards.length > 0) {
            setCards(data.cards);
            stopPolling();
            document.getElementById('loading')?.classList.add('hidden');
        }
    } catch (error) { console.error('Polling error:', error); }
  }, [stopPolling]);

  const startPollingForCards = useCallback(() => {
    stopPolling(); 
    pollingAttemptsRef.current = 0;
    setTimeout(() => {
        pollForCards();
        pollingIntervalRef.current = setInterval(pollForCards, 7000);
    }, 15000); 
  }, [pollForCards, stopPolling]);

  useEffect(() => {
    if (typeof window === 'undefined' || !config) return;
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    script.defer = true;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!window.vapiSDK) { console.error("Vapi SDK failed to load."); return; }
      const vapiInstance = window.vapiSDK.run({
        apiKey: process.env.NEXT_PUBLIC_VAPI_API_KEY!,
        assistant: config.assistantId,
        config: {
            ...config.buttonConfig,
            width: "300px", // Matched to CSS
            height: "500px", // Matched to CSS
            type: "pill",
            icon: "https://images.squarespace-cdn.com/content/662b53c5379e5a412f214a15/ddf5d813-9f00-409a-b052-290a1b985a8a/hand+icon+50px+height.png?content-type=image%2Fpng",
        },
        targetAudioElement: document.getElementById('vapiAudio')
      });
      vapiInstanceRef.current = vapiInstance;
      vapiInstance.on('call-start', () => { addOverlay(); startPollingForCards(); });
      vapiInstance.on('call-end', () => { removeOverlay(); stopPolling(); location.reload(); });
      
      const buttonElement = document.getElementById("vapi-support-btn");
      if(buttonElement) {
        // THE FIX: Use a MutationObserver to wait for Vapi to create its internal elements
        const observer = new MutationObserver((mutationsList, observer) => {
            const innerButton = buttonElement.querySelector<HTMLElement>('div');
            if (innerButton) {
                // We found the inner div, now we can style it and stop observing
                innerButton.style.backgroundImage = `url('${config.buttonConfig.backgroundImageUrl}')`;
                innerButton.style.backgroundSize = 'cover';
                innerButton.style.backgroundPosition = 'center';
                innerButton.style.backgroundColor = 'transparent';
                observer.disconnect(); // Stop observing once we've applied the style
            }
        });
        observer.observe(buttonElement, { childList: true, subtree: true });

        buttonElement.addEventListener('click', handleBeginReading);
      }
    };
    return () => {
        const buttonElement = document.getElementById("vapi-support-btn");
        if (buttonElement) buttonElement.removeEventListener('click', handleBeginReading);
        if (script.parentNode) document.body.removeChild(script);
        vapiInstanceRef.current?.stop();
    };
  }, [config, handleBeginReading, startPollingForCards, stopPolling]);

  useEffect(() => {
      if (typeof window === 'undefined') return;
      const currentFetch = window.fetch;
      const newFetch: typeof window.fetch = async (url, ...args) => {
          const urlString = url.toString();
          if (urlString.includes('gs.daily.co/rooms/check/vapi')) {
              const sessionId = urlString.split('/').pop();
              if (sessionId) vapiSessionIdRef.current = sessionId;
          }
          return currentFetch(url, ...args);
      };
      window.fetch = newFetch;
      return () => { window.fetch = currentFetch; };
  }, []);

  if (isLoading || !user) {
    return (
      <div className="relative min-h-screen w-full bg-black bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="text-center text-amber-200 text-2xl z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-200 mx-auto mb-4"></div>
          Verifying Access...
        </div>
      </div>
    );
  }
  
  if (!config) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Oracle not found.</div>;
  }

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <audio id="vapiAudio" className="hidden"></audio>
      <div id="warningModal" className="modal"><div className="modal-content"><p>End the current reading and start a new one?</p><button onClick={() => location.reload()}>End Session</button><button onClick={() => { const modal = document.getElementById('warningModal'); if (modal) modal.style.display = 'none'; }}>Keep Session</button></div></div>
      <div id="errorModal" className="modal"><div className="modal-content"><p id="errorMessage">{errorMessage}</p><button onClick={() => router.push('/marketplace')}>Purchase Tokens</button><button onClick={() => { const modal = document.getElementById('errorModal'); if (modal) modal.style.display = 'none'; }}>Close</button></div></div>
      <div className="relative z-10">
        <div id="vapi-support-btn"></div>
        <div className="tarot-container"><div id="tarotDisplay" className="tarot-display">{cards.map((card, index) => (<Card key={index} card={card} />))}</div></div>
        <div className="loading-container"><div id="loading" className="loading-spinner hidden"><span>Shuffling your cards...<br/>Deck: <em>Cats of the Crown</em></span></div></div>
      </div>
    </main>
  );
}

function Card({ card }: { card: TarotCard }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const handleClick = () => {
    if (!isFlipped) setIsFlipped(true);
    else setIsEnlarged(!isEnlarged);
  };
  return (
    <div className={`card-container ${isEnlarged ? 'enlarged' : ''}`} onClick={handleClick}>
      <img src={card.url} alt={card.name} className={`card-image ${isFlipped ? '' : 'hidden'} ${isEnlarged ? 'enlarged' : ''}`} />
      <img src="https://images.squarespace-cdn.com/content/63ff45f58b2ecb2de4ae9935/8afd5dd6-f795-41fc-a9ba-7a6b39921caf/9.jpg?content-type=image%2Fjpeg" alt="Card back" className={`card-cover ${isFlipped ? 'hidden' : ''}`} />
    </div>
  );
}