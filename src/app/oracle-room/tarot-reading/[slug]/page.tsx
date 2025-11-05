// src/app/oracle-room/tarot-reading/[slug]/page.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

// --- TYPE DEFINITIONS & CONFIGURATION ---
interface TarotCard { url: string; name: string; }
type CallStateConfig = { title: string; subtitle: string; };

interface ReaderProfile {
  displayName: string;
  backgroundImageUrl: string;
}

interface ReaderConfig {
  profile: ReaderProfile;
  assistants: Record<string, string>;
}

const readerData: Record<string, ReaderConfig> = {
  ambrose: {
    profile: {
      displayName: "Ambrose",
      backgroundImageUrl: "https://images.squarespace-cdn.com/content/662b53c5379e5a412f214a15/ce4dd7e2-a21c-47e9-a2f3-ae98693f0da4/A_front-facing_portrait_of_an_attractive%2C_charisma.jpg?content-type=image%2Fjpeg"
    },
    assistants: {
      "5": "3ca1609f-a052-42ce-9106-ccb530b429e6",
      "10": "29bce012-e0a9-4347-999d-f36a500f8eb1",
      "20": "517aca67-ced6-4710-927d-4dd1f5944419",
    }
  },
  natalia: {
    profile: {
      displayName: "Natalia",
      backgroundImageUrl: "https://images.squarespace-cdn.com/content/63ff45f58b2ecb2de4ae9935/56fb4457-d689-43cc-95f8-08c15cc34c4b/Sage+the+Tarot+Reader.jpg?content-type=image%2Fjpeg"
    },
    assistants: {
      "5": "34347501-52b8-4980-9b67-aedd56967cfb",
      "10": "39e63560-a609-4266-8db7-7a355b88f661",
      "20": "5eded252-3876-4bda-90d8-aec2c5407285",
    }
  }
};


export default function TarotReaderPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // --- Parse Slug to get Reader and Duration ---
  const [readerName, duration] = (slug || '').split('-');
  const readerInfo = readerData[readerName];
  const assistantId = readerInfo?.assistants[duration];

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [enlargedCard, setEnlargedCard] = useState<TarotCard | null>(null);
  
  const vapiSessionIdRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef(0);

  useEffect(() => {
    // Redirect if the slug is invalid
    if (!assistantId) {
      router.push('/oracle-room/tarot-reading');
      return;
    }

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    };

    checkUser();
  }, [router, supabase.auth, assistantId]);

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
        const response = await fetch('/api/tarot/session', {
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
        console.error("Could not get session ID for polling. Retrying..."); 
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

  useEffect(() => {
    if (!readerInfo || !user || !assistantId) {
      return;
    }

    // Dynamically create button config
    const buttonConfig = {
      type: "pill",
      idle: { title: `Begin ${duration} Minute Reading`, subtitle: `Speak with ${readerInfo.profile.displayName}` },
      loading: { title: "Connecting to Spirit", subtitle: `Waiting for ${readerInfo.profile.displayName}` },
      active: { title: `Speaking with ${readerInfo.profile.displayName}`, subtitle: "End the Reading" },
      backgroundImageUrl: readerInfo.profile.backgroundImageUrl
    };

    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const urlString = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
      
      if (urlString.includes('/rooms/check/vapi/')) {
        const sessionId = urlString.split('/').pop()?.split('?')[0];
        if (sessionId && sessionId.length > 10) {
          console.log('SUCCESS: Vapi Session ID captured:', sessionId);
          vapiSessionIdRef.current = sessionId;
          
          try {
            const response = await fetch('/api/tarot/session', {
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

            if (!response.ok) {
              const errorBody = await response.json();
              console.error("API Error: Failed to start session on backend.", response.status, errorBody);
            } else {
              console.log("API Success: Session record created/upserted successfully.");
            }

          } catch (err) {
            console.error("FETCH Error: Failed to send startSession request.", err);
          }
        }
      }
      return originalFetch(input, init);
    };

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.vapiSDK) {
        const vapiInstance = window.vapiSDK.run({
          apiKey: process.env.NEXT_PUBLIC_VAPI_API_KEY!,
          assistant: assistantId,
          config: {
            ...buttonConfig,
            position: "manual"
          },
        });
        
        setTimeout(() => {
          const vapiButton = document.getElementById('vapi-support-btn');
          if (vapiButton) {
            vapiButton.style.backgroundImage = `url('${buttonConfig.backgroundImageUrl}')`;
          }
        }, 100);

        vapiInstance.on('call-start', () => {
          console.log('Event: call-start received. Beginning to poll for cards.');
          setIsCallActive(true);
          startPollingForCards();
        });

        vapiInstance.on('call-end', () => {
          console.log('Event: call-end received.');
          setIsCallActive(false);
          stopPolling();
          location.reload();
        });
      } else {
        console.error("Vapi SDK did not initialize on window object.");
      }
    };

    return () => {
      window.fetch = originalFetch;
      const vapiButton = document.getElementById('vapi-support-btn');
      if (vapiButton) vapiButton.remove();
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [readerInfo, user, assistantId, duration, readerName, startPollingForCards, stopPolling]);

  const showWarningPopup = () => {
    const modal = document.getElementById('warningModal');
    if (modal) modal.style.display = 'block';
  };

  const handleEnlargeCard = (card: TarotCard) => {
    setEnlargedCard(card);
  };
  
  if (isLoading || !readerInfo || !user) {
    return (
      <div className="relative min-h-screen w-full bg-black bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="text-center text-amber-200 text-2xl z-10"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-200 mx-auto mb-4"></div>Authenticating and Loading Oracle...</div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <audio id="vapiAudio" className="hidden"></audio>
      
      <div id="warningModal" className="modal">
        <div className="modal-content">
          <p>Start a new session?</p>
          <button onClick={() => location.reload()}>Start New Session</button>
          <button onClick={() => { 
              const modal = document.getElementById('warningModal'); 
              if (modal) modal.style.display = 'none'; 
          }}>Keep Session</button>
        </div>
      </div>
      
      <div id="vapi-support-btn" />

      {/* THE FIX: Overlay now uses a CSS class to perfectly match the button's size and position */}
      {isCallActive && (
          <div 
              onClick={showWarningPopup}
              className="vapi-overlay"
          />
      )}


      <div className="relative z-10">
        <div className="tarot-container">
            <div id="tarotDisplay" className="tarot-display">
                {cards.map((card, index) => (
                  <Card key={index} card={card} onEnlarge={handleEnlargeCard} />
                ))}
            </div>
        </div>
        <div className="loading-container"><div id="loading" className="loading-spinner hidden"><span>Shuffling your cards...<br/>Deck: <em>Cats of the Crown</em></span></div></div>
      </div>

      {enlargedCard && (
        <>
          <div 
            onClick={() => setEnlargedCard(null)} 
            className="card-enlarged-backdrop"
          />
          <div className="card-enlarged-container" onClick={() => setEnlargedCard(null)}>
             <img src={enlargedCard.url} alt={enlargedCard.name} className="card-enlarged-image" />
          </div>
        </>
      )}
    </main>
  );
}

function Card({ card, onEnlarge }: { card: TarotCard; onEnlarge: (card: TarotCard) => void; }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    } else {
      onEnlarge(card);
    }
  };

  return (
    <div 
      className={`card-container ${isFlipped ? 'flipped' : ''}`} 
      onClick={handleClick}
    >
      <img src={card.url} alt={card.name} className="card-image" />
      <img src="https://images.squarespace-cdn.com/content/v1/63ff45f58b2ecb2de4ae9935/8afd5dd6-f795-41fc-a9ba-7a6b39921caf/9.jpg?content-type=image%2Fjpeg" alt="Card back" className="card-cover" />
    </div>
  );
}