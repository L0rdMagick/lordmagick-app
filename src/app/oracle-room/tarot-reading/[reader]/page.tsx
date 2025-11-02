// src/app/oracle-room/tarot-reading/[reader]/page.tsx

"use client";

import { useState, useEffect, useRef, useCallback, MouseEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import Vapi from '@vapi-ai/web';

// Define structures for better type safety
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
      backgroundImageUrl: "https://images.squarespace-cdn.com/content/63ff45f58b2ecb2de4ae9935/56fb45f58b2ecb2de4ae9935/56fb4457-d689-43cc-95f8-08c15cc34c4b/Sage+the+Tarot+Reader.jpg?content-type=image%2Fjpeg"
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
  const [callStatus, setCallStatus] = useState<'idle' | 'loading' | 'active'>('idle');
  const [cards, setCards] = useState<TarotCard[]>([]);
  
  const vapiRef = useRef<Vapi | null>(null);
  // THE FIX: Restore the ref to hold the session ID captured from the network.
  const vapiSessionIdRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef(0);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); } 
      else { setUser(session.user); setIsLoading(false); }
    };
    checkUser();
  }, [router, supabase.auth]);
  
  // THE FIX: Restore your original, working network interception logic.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const originalFetch = window.fetch;
    window.fetch = async (url, ...args) => {
        const urlString = url.toString();
        if (urlString.includes('gs.daily.co/rooms/check/vapi')) {
            const sessionId = urlString.split('/').pop();
            console.log('VAPI Session ID captured via fetch override:', sessionId);
            if (sessionId) vapiSessionIdRef.current = sessionId;
        }
        return originalFetch(url, ...args);
    };
    return () => { window.fetch = originalFetch; }; // Cleanup
  }, []);

  useEffect(() => {
    if (!config) return;
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    vapiRef.current = vapiInstance;

    vapiInstance.on('call-start', () => { 
      console.log('Call has started');
      setCallStatus('active'); 
      startPollingForCards(); 
    });
    vapiInstance.on('call-end', () => { 
      console.log('Call has ended'); 
      setCallStatus('idle'); 
      stopPolling(); 
      location.reload(); 
    });
    vapiInstance.on('error', (e) => { 
      console.error('Vapi error:', e); 
      setCallStatus('idle'); 
      showErrorPopup(e?.message || 'An unknown error occurred.'); 
    });

    return () => { vapiInstance.stop(); };
  }, [config]);

  const showWarningPopup = () => {
    const modal = document.getElementById('warningModal');
    if (modal) modal.style.display = 'block';
  };
  
  const showErrorPopup = (message: string) => {
    const p = document.getElementById('errorMessage');
    const modal = document.getElementById('errorModal');
    if (p && modal) {
      p.textContent = message;
      modal.style.display = 'block';
    }
  };
  
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
        }
    } catch (error) { console.error('Polling error:', error); }
  }, [stopPolling]);

  const startPollingForCards = useCallback(() => {
    const sessionId = vapiSessionIdRef.current;
    if (!sessionId) { console.error("Could not get session ID for polling."); return; }
    stopPolling(); 
    pollingAttemptsRef.current = 0;
    setTimeout(() => {
        pollForCards(sessionId);
        pollingIntervalRef.current = setInterval(() => pollForCards(sessionId), 7000);
    }, 15000); 
  }, [pollForCards, stopPolling]);

  const handleStartCall = async () => {
    if (!user || callStatus !== 'idle' || !vapiRef.current) return;
    setCallStatus('loading');
    
    vapiRef.current.start(config.assistantId);

    // This timeout waits for the network interception to capture the session ID.
    setTimeout(async () => {
      const sessionId = vapiSessionIdRef.current;
      if (!sessionId) {
        showErrorPopup('Could not initiate call. Please try again.');
        setCallStatus('idle');
        return;
      }
      try {
        const response = await fetch('/api/tarot', {
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
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to start session.');
        }
      } catch (err: any) {
          showErrorPopup(err.message);
          vapiRef.current?.stop();
      }
    }, 1500); // Wait 1.5s for the fetch to be intercepted
  };

  const handleEndCall = () => {
    showWarningPopup();
  };

  if (isLoading || !user) {
    return (
      <div className="relative min-h-screen w-full bg-black bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="text-center text-amber-200 text-2xl z-10"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-200 mx-auto mb-4"></div>Verifying Access...</div>
      </div>
    );
  }

  if (!config) { return null; }
  
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <audio id="vapiAudio" className="hidden"></audio>
      <div id="warningModal" className="modal"><div className="modal-content"><p>End the current reading?</p><button onClick={() => vapiRef.current?.stop()}>End Session</button><button onClick={() => { const modal = document.getElementById('warningModal'); if (modal) modal.style.display = 'none'; }}>Keep Session</button></div></div>
      <div id="errorModal" className="modal"><div className="modal-content"><p id="errorMessage"></p><button onClick={() => router.push('/marketplace')}>Purchase Tokens</button><button onClick={() => { const modal = document.getElementById('errorModal'); if (modal) modal.style.display = 'none'; }}>Close</button></div></div>
      
      <div className="relative z-10">
        <div id="vapi-support-btn" onClick={callStatus === 'active' ? handleEndCall : handleStartCall}>
          <div style={{ backgroundImage: `url('${config.buttonConfig.backgroundImageUrl}')` }}>
            <div id="vpi-title-container">
              <div>
                <div id="vapi-title">{config.buttonConfig[callStatus].title}</div>
                <div id="vapi-subtitle">{config.buttonConfig[callStatus].subtitle}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="tarot-container"><div id="tarotDisplay" className="tarot-display">{cards.map((card, index) => (<Card key={index} card={card} />))}</div></div>
        <div className="loading-container"><div id="loading" className={callStatus === 'loading' ? "loading-spinner" : "loading-spinner hidden"}><span>Shuffling your cards...<br/>Deck: <em>Cats of the Crown</em></span></div></div>
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