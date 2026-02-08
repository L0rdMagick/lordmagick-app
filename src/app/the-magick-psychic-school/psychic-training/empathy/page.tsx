"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Settings, Eye, Volume2, VolumeX, 
  Sparkles, X, Activity, Maximize, Minimize,
  Info, RotateCcw, Save, Lock, ChevronsUp 
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import { useHaptics } from '@/hooks/useHaptics';

import PsychicStatsModal from '../components/PsychicStatsModal';
import { calculateZScore } from '../utils/psychicStats';

/**
 * --- PSI MATH ENGINE ---
 * Local stats logic removed in favor of shared utilities
 */

/**
 * --- RADAR CHART COMPONENT ---
 */
// Local Radar, StatsGrid, and PsiStats components removed in favor of PsychicStatsModal


// --- 1. CONFIGURATION & ASSETS ---

const IMG_PATH = '/images/empathy-app/';

const EMOTIONS = [
  { id: 'love', name: 'Love', src: `${IMG_PATH}love.jpg`, color: '#ec4899', desc: 'Resonance, Connection', aura: 'shadow-pink-500' },
  { id: 'sad', name: 'Sadness', src: `${IMG_PATH}sadness.jpg`, color: '#94a3b8', desc: 'Rain, Tears, Grey', aura: 'shadow-slate-500' },
  { id: 'happy', name: 'Joy', src: `${IMG_PATH}joy_unbound.jpg`, color: '#facc15', desc: 'Sun, Radiance', aura: 'shadow-yellow-500' },
  { id: 'rich', name: 'Wealth', src: `${IMG_PATH}wealth (1).jpg`, color: '#fbbf24', desc: 'Gold, Abundance', aura: 'shadow-amber-500' },
  { id: 'sexy', name: 'Desire', src: `${IMG_PATH}desire.jpg`, color: '#ef4444', desc: 'Heat, Passion', aura: 'shadow-red-600' },
  { id: 'angry', name: 'Rage', src: `${IMG_PATH}rage_scream.jpg`, color: '#dc2626', desc: 'Lightning, Force', aura: 'shadow-red-800' },
  { id: 'focused', name: 'Focus', src: `${IMG_PATH}focus_clarity.jpg`, color: '#10b981', desc: 'Precision, Laser', aura: 'shadow-emerald-500' },
  { id: 'laughing', name: 'Laughter', src: `${IMG_PATH}laughter.jpg`, color: '#d946ef', desc: 'Vibration, Release', aura: 'shadow-fuchsia-500' }
];

const CARD_BACKS: Record<string, { name: string; bg: string }> = {
  checkered: { 
    name: 'Checkered Gold', 
    bg: 'bg-[#2e1065] border-2 border-amber-300/50 bg-[linear-gradient(45deg,#1e1b4b_25%,transparent_25%,transparent_75%,#1e1b4b_75%,#1e1b4b),linear-gradient(45deg,#1e1b4b_25%,transparent_25%,transparent_75%,#1e1b4b_75%,#1e1b4b)] bg-[length:30px_30px] [background-position:0_0,15px_15px] shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]' 
  },
  box: {
    name: 'Golden Box',
    bg: 'bg-black border border-amber-500/80 shadow-[inset_0_0_0_8px_#000,inset_0_0_0_9px_rgba(245,158,11,0.6)]'
  },
  solid: {
    name: 'Deep Purple',
    bg: 'bg-[#3b0764] border border-white/10 shadow-[inset_0_0_30px_rgba(0,0,0,0.7)]'
  },
  static: { 
    name: 'Static', 
    bg: 'bg-indigo-950 bg-[repeating-conic-gradient(#000000_0deg_10deg,_#312e81_10deg_20deg,_#ffffff15_20deg_30deg)]' 
  },
  void: { 
    name: 'Void', 
    bg: 'bg-[radial-gradient(circle_at_center,_#312e81_0%,_#020617_90%)]' 
  }
};

// --- 2. AUDIO ENGINE ---
const useAudioEngine = () => {
  const ctxRef = useRef<any>(null);
  const thetaOscRef = useRef<any>(null);
  
  const init = () => {
    const win = (globalThis as any).window;
    if (typeof win !== 'undefined' && !ctxRef.current) {
      const AudioContext = win.AudioContext || win.webkitAudioContext;
      if (AudioContext) {
          ctxRef.current = new AudioContext();
      }
    }
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume();
    }
  };

  const playTheta = (active: boolean) => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;

    if (active && !thetaOscRef.current) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, ctx.currentTime); 
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(4, ctx.currentTime); 
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(5, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      lfo.start();
      thetaOscRef.current = { osc, lfo, gain };
    } else if (!active && thetaOscRef.current) {
      const { osc, lfo, gain } = thetaOscRef.current;
      const now = ctx.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
      osc.stop(now + 1);
      lfo.stop(now + 1);
      thetaOscRef.current = null;
    }
  };

  const playFlip = () => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playSuccess = () => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + (i * 0.05));
      gain.gain.setValueAtTime(0, now + (i * 0.05));
      gain.gain.linearRampToValueAtTime(0.1, now + (i * 0.05) + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.05) + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + (i * 0.05));
      osc.stop(now + (i * 0.05) + 2);
    });
  };

  const playFailure = () => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  };

  const playSlide = () => {
      if (!ctxRef.current) return;
      const ctx = ctxRef.current;
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.2; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.linearRampToValueAtTime(100, now + 0.2);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now); 
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
  };

  return { init, playTheta, playFlip, playSuccess, playFailure, playSlide };
};

// --- 3. HELPER FUNCTIONS ---

const secureShuffle = (array: any[]) => {
  const newArray = [...array];
  const win = (globalThis as any).window;
  if (win && win.crypto) {
      const randomBuffer = new Uint32Array(newArray.length);
      win.crypto.getRandomValues(randomBuffer);
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = randomBuffer[i] % (i + 1);
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
  } else {
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
  }
  return newArray;
};

// --- 4. COMPONENTS ---

const InstructionModal = ({ onClose }: { onClose: () => void }) => (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in duration-500"
    onClick={onClose}
  >
    <div 
        className="max-w-md w-full border border-purple-500/30 bg-[#0f0f1a] p-8 rounded-xl shadow-[0_0_50px_rgba(236,72,153,0.2)] text-center relative"
        onClick={(e) => e.stopPropagation()}
    >
        <h2 className="text-3xl font-serif text-pink-400 mb-2 tracking-widest">EMPATHY PROTOCOL</h2>
        <p className="text-xs font-mono text-purple-300 uppercase tracking-[0.2em] mb-6">Emotional Resonance Trainer</p>
        
        <div className="text-left space-y-4 mb-8 bg-black/40 p-4 rounded border border-white/5">
            <p className="text-sm text-gray-400 leading-relaxed">
                <strong className="text-pink-300">The Goal:</strong> Detect the hidden emotional signature behind the cards.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
                <li>A target emotion will be chosen (e.g., JOY).</li>
                <li>Cards will be dealt face down. One holds the energy.</li>
                <li>Locate the card with the chosen energy.</li>
                <li>Feel for the resonance. Do not guess; <strong>sense</strong>.</li>
            </ul>
        </div>
        
        <button 
            onClick={onClose}
            className="w-full py-3 bg-pink-900/30 hover:bg-pink-800/50 border border-pink-500/50 text-pink-100 font-serif tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]"
        >
            Begin Training
        </button>
    </div>
  </div>
);

// --- 5. MAIN APP ---

export default function EmpathyApp() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [showInstructions, setShowInstructions] = useState(true);
  const [deckSize, setDeckSize] = useState(4);
  const [cardBack, setCardBack] = useState('checkered'); // Set new default
  const [feedbackMode, setFeedbackMode] = useState('training');
  const [targetFocus, setTargetFocus] = useState('random');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [gameState, setGameState] = useState('setup');
  const [targetEmotion, setTargetEmotion] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [history, setHistory] = useState<any[]>([]);

  const maxStreak = React.useMemo(() => {
    let max = 0;
    let current = 0;
    history.forEach(h => {
        if (h.correct) {
            current++;
            if (current > max) max = current;
        } else {
            current = 0;
        }
    });
    return max;
  }, [history]);
  
  const [feedback, setFeedback] = useState<{type: 'hit'|'miss'} | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [isDesktop, setIsDesktop] = useState(false);

  const audio = useAudioEngine();
  const haptics = useHaptics(); // Hook Integration

  useEffect(() => {
      const savedStats = localStorage.getItem('empathy_stats');
      if (savedStats) setStats(JSON.parse(savedStats));

      const checkLayout = () => {
        setIsDesktop(window.innerWidth >= 768);
      };
      checkLayout();
      window.addEventListener('resize', checkLayout);
      return () => window.removeEventListener('resize', checkLayout);
  }, []);

  const handleStart = () => {
      setShowInstructions(false);
      audio.init();
      if (soundEnabled) audio.playTheta(true);
      startNewRound();
  };

  const handleResetSimulation = () => {
    setStats({});
    localStorage.removeItem('empathy_stats');
    setShowSettings(false);
    startNewRound();
  };

  const handleSaveResults = async () => {
    setSaving(true);
    setSaveMessage("Attuning to Cloud..."); // VISUAL POLISH
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSaveMessage("Soul signature not found (Login required)");
        setTimeout(() => setSaveMessage(null), 3000);
        setSaving(false);
        return;
      }

      // Check subscription before allowing save
      const { data: profile } = await supabase.from('profiles').select('is_subscribed').eq('id', user.id).single();
      if (!profile?.is_subscribed) {
          setSaveMessage("ADEPT ACCESS REQUIRED");
          setTimeout(() => setSaveMessage(null), 3000);
          setSaving(false);
          return;
      }

      const totalAttempts = Object.values(stats).reduce((acc: number, curr: any) => acc + curr.attempts, 0);
      const { error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          name: 'Empathy Training',
          category: 'training', 
          chart_data: stats, 
          report_content: `Session completed. Total Attempts: ${totalAttempts}. Focus: ${targetFocus}. Deck Size: ${deckSize}.`,
        });
      if (error) throw error;
      setSaveMessage("Inscribed in Grimoire"); // VISUAL POLISH
    } catch (e) {
      console.error(e);
      setSaveMessage("Inscription Failed");
    } finally {
      setTimeout(() => setSaveMessage(null), 3000);
      setSaving(false);
    }
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    audio.playTheta(newState);
  };

  // Toggle Fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen(); 
        }
    }
  };

  const startNewRound = useCallback(() => {
    setGameState('setup');
    setFeedback(null);
    
    let target;
    if (targetFocus === 'random') {
      const win = (globalThis as any).window;
      if (win && win.crypto) {
          const buffer = new Uint32Array(1);
          win.crypto.getRandomValues(buffer);
          target = EMOTIONS[buffer[0] % EMOTIONS.length];
      } else {
          target = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      }
    } else {
      target = EMOTIONS.find(e => e.id === targetFocus);
    }
    
    if (!target) return;

    setTargetEmotion(target);

    let deck: any[] = [];
    deck.push({ ...target, isTarget: true, id: `card-${Math.random()}`, status: 'face-down' });

    const possibleDistractors = EMOTIONS.filter(e => e.id !== target.id);

    while (deck.length < deckSize) {
      const win = (globalThis as any).window;
      let randomEmo;
      if (win && win.crypto) {
          const buffer = new Uint32Array(1);
          win.crypto.getRandomValues(buffer);
          randomEmo = possibleDistractors[buffer[0] % possibleDistractors.length];
      } else {
          randomEmo = possibleDistractors[Math.floor(Math.random() * possibleDistractors.length)];
      }
      deck.push({ ...randomEmo, isTarget: false, id: `card-${Math.random()}`, status: 'face-down' });
    }

    deck = secureShuffle(deck);
    setCards(deck);

    setTimeout(() => {
      setGameState('sensing');
    }, 600);
  }, [deckSize, targetFocus]);

  // Reactive Deck Update: Automatically resets round when deckSize changes
  useEffect(() => {
    startNewRound();
  }, [deckSize, startNewRound]);

  const handleCardClick = (index: number) => {
    if (gameState !== 'sensing') return;
    
    // HAPTIC: SELECTION
    haptics.triggerMedium();
    
    const clickedCard = cards[index];
    const isMatch = clickedCard.isTarget;
    
    audio.playFlip();

    setStats((prev: any) => {
      const targetId = targetEmotion.id;
      const current = prev[targetId] || { attempts: 0, hits: 0 };
      const newStats = {
        ...prev,
        [targetId]: { attempts: current.attempts + 1, hits: current.hits + (isMatch ? 1 : 0) }
      };
      localStorage.setItem('empathy_stats', JSON.stringify(newStats));
      return newStats;
    });

    setHistory(prev => [...prev, { correct: isMatch, timestamp: Date.now() }]);

    if (isMatch) {
      audio.playSuccess();
      haptics.triggerHeavy(); // HAPTIC: SUCCESS
      
      const newCards = [...cards];
      newCards[index].status = 'revealed';
      // Mark as explicitly clicked so we know where to show text
      newCards[index].isClicked = true; 
      
      setCards(newCards);
      setGameState('revealed');
      setFeedback({ type: 'hit' });

    } else {
      audio.playFailure();
      haptics.triggerLight(); // HAPTIC: FAILURE
      
      const newCards = [...cards];
      newCards[index].status = 'revealed-wrong';
      newCards[index].isClicked = true;
      
      if (feedbackMode === 'training') {
        const truthIndex = cards.findIndex(c => c.isTarget);
        newCards[truthIndex].status = 'revealed';
      }

      setCards(newCards);
      setGameState('revealed');
      setFeedback({ type: 'miss' });
    }
  };

  const getLayoutConfig = () => {
    let cols = 2;
    if (isDesktop) {
        // Desktop / Large Screen Logic
        if (deckSize <= 5) cols = deckSize;        // 1 row of 1-5 cards
        else if (deckSize === 6) cols = 3;         // 2 rows of 3
        else if (deckSize <= 8) cols = 4;          // 2 rows of 4
        else cols = 5;                             // 2 rows of 5 (9-10 cards)
    } else {
        // Mobile Logic
        if (deckSize >= 10) cols = 4;
        else if (deckSize >= 5) cols = 3;
        else cols = 2;
    }
    const rows = Math.ceil(deckSize / cols);
    return { cols, rows };
  };

  const { cols, rows } = getLayoutConfig();

  // Grid Aspect Ratio Logic to prevent overflow
  const gridAspectRatio = `${cols} / ${rows * 1.5}`;

  return (
    <div className="relative h-dvh w-full bg-neutral-950 text-slate-200 font-sans selection:bg-purple-500/30 flex flex-col overflow-hidden" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-0" />
      
      {/* Twinkling Stars Background Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
            <div 
                key={i}
                className="absolute bg-white rounded-full opacity-0 animate-twinkle"
                style={{
                    width: Math.random() * 2 + 1 + 'px',
                    height: Math.random() * 2 + 1 + 'px',
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                    animationDelay: Math.random() * 5 + 's',
                    animationDuration: Math.random() * 3 + 2 + 's'
                }}
            />
        ))}
      </div>

      {showInstructions && <InstructionModal onClose={handleStart} />}

      {/* HEADER - Fixed at top */}
      <header className="relative z-20 flex justify-between items-center px-4 py-3 border-b border-white/5 backdrop-blur-sm bg-black/40 shrink-0 h-16">
        <div className="flex items-center gap-4">
            <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit" className="text-xs text-slate-400 hover:text-white" />
            <div className="w-px h-6 bg-white/20 hidden md:block"></div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-purple-500 to-amber-300 flex items-center justify-center">
                    <Eye size={16} className="text-black" />
                </div>
                <span className="font-serif tracking-widest text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-200 to-slate-400 hidden md:block">
                    EMPATHY
                </span>
            </div>
        </div>
        
        <div className="flex gap-2">
           <button onClick={() => setShowInstructions(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
             <Info size={20} />
           </button>
           <button onClick={toggleSound} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-purple-900/50 text-purple-200' : 'hover:bg-white/10 text-slate-400'}`}>
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* TOP BAR: Target Info & Scorecard in Flow */}
      <div className="shrink-0 w-full flex items-start justify-between px-4 py-1 relative z-20 min-h-[60px] md:min-h-20">
          
          {/* Target Info */}
          <div className="flex flex-col items-start md:items-center justify-center md:absolute md:inset-0 md:pointer-events-none z-0">
             <p className="text-slate-500 text-[9px] md:text-[10px] uppercase tracking-[0.2em] mb-1">Target Frequency</p>
             <h1 className="text-lg md:text-4xl font-serif text-slate-100">{targetEmotion?.name.toUpperCase()}</h1>
          </div>

          {/* Stats Widget */}
          <div className="ml-auto relative z-30 pointer-events-auto">
              <PsychicStatsModal 
                  hits={Object.values(stats).reduce((acc: number, curr: any) => acc + (curr.hits || 0), 0)}
                  trials={Object.values(stats).reduce((acc: number, curr: any) => acc + (curr.attempts || 0), 0)}
                  chance={1 / deckSize}
                  appName="Empathy Training"
                  radarData={EMOTIONS.map(emo => {
                      const stat = stats[emo.id] || { hits: 0, attempts: 0 };
                      return {
                          id: emo.id,
                          label: emo.name,
                          value: stat.attempts > 0 ? Math.round((stat.hits / stat.attempts) * 100) : 0,
                          color: emo.color
                      };
                  })}
                  maxStreak={maxStreak}
              />
          </div>
      </div>

      {/* "TAP TO CONTINUE" - Invisible Layer covering whole screen when revealed */}
      {gameState === 'revealed' && (
        <div 
            className="absolute inset-0 z-50 flex items-end justify-center cursor-pointer pb-8"
            onClick={() => startNewRound()}
        >
            <div className="bg-black/50 text-slate-300 text-xs uppercase tracking-widest px-4 py-2 rounded-full border border-white/10 animate-pulse pointer-events-none">
                Tap anywhere to continue
            </div>
        </div>
      )}

      {/* SETTINGS DRAWER */}
      {showSettings && (
        <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
        >
            <div 
                className="absolute right-0 top-16 bottom-0 w-80 bg-neutral-900 border-l border-white/10 shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-serif text-xl text-purple-200">Lab Conditions</h3>
                    <button onClick={() => setShowSettings(false)}><X className="text-slate-500" /></button>
                </div>

                <div className="space-y-8">
                    <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-3">Probability Pool (Cards)</label>
                    <div className="flex items-center gap-4">
                        <input 
                        type="range" min="2" max="10" 
                        value={deckSize} onChange={(e) => setDeckSize(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <span className="font-mono text-xl w-8 text-center">{deckSize}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 text-right">Chance: {Math.round((1/deckSize)*100)}%</div>
                    </div>

                    <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-3">Target Signature</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                        onClick={() => setTargetFocus('random')}
                        className={`px-3 py-2 text-sm rounded border ${targetFocus === 'random' ? 'bg-purple-900 border-purple-500 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
                        >
                        Random Loop
                        </button>
                        {/* Specific Targets - Expanded to all options */}
                        {EMOTIONS.map(e => (
                        <button 
                        key={e.id}
                        onClick={() => setTargetFocus(e.id)}
                        className={`px-3 py-2 text-sm rounded border truncate ${targetFocus === e.id ? 'bg-purple-900 border-purple-500 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
                        >
                        Only {e.name}
                        </button>
                        ))}
                    </div>
                    </div>

                    <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-3">Feedback Protocol</label>
                    <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                        <button 
                        onClick={() => setFeedbackMode('training')}
                        className={`flex-1 py-2 text-xs rounded transition-all ${feedbackMode === 'training' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'}`}
                        >
                        Training
                        </button>
                        <button 
                        onClick={() => setFeedbackMode('test')}
                        className={`flex-1 py-2 text-xs rounded transition-all ${feedbackMode === 'test' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'}`}
                        >
                        Test
                        </button>
                    </div>
                    </div>

                    <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-3">Etheric Masking</label>
                    <div className="flex gap-3">
                        {Object.keys(CARD_BACKS).map(key => (
                        <button 
                            key={key} 
                            onClick={() => setCardBack(key)}
                            className={`h-12 flex-1 rounded border-2 transition-all ${cardBack === key ? 'border-amber-400 scale-105' : 'border-transparent opacity-50'} ${CARD_BACKS[key].bg}`}
                            title={CARD_BACKS[key].name}
                        ></button>
                        ))}
                    </div>
                    <div className="text-center text-xs text-slate-500 mt-2 capitalize">{CARD_BACKS[cardBack].name}</div>
                    </div>
                    
                    <button onClick={handleResetSimulation} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded border border-white/10 flex items-center justify-center gap-2">
                    <RotateCcw size={16} /> Reset Simulation
                    </button>
                    
                    <button 
                        onClick={handleSaveResults} 
                        disabled={saving}
                        className="w-full py-3 bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/50 text-purple-100 rounded flex items-center justify-center gap-2"
                    >
                        {saving ? <Sparkles className="animate-spin" size={16} /> : <Save size={16} />}
                        {saving ? "Inscribing..." : "Save Session"}
                    </button>
                    {saveMessage && <p className="text-center text-xs text-amber-300 font-mono animate-pulse">{saveMessage}</p>}
                </div>
            </div>
        </div>
      )}

      {/* GAME AREA - Flex Centered */}
      <main className="flex-1 w-full min-h-0 flex items-center justify-center relative z-10 overflow-hidden p-4 md:p-8">
            <div 
                className="grid gap-2 sm:gap-4"
                style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    aspectRatio: gridAspectRatio,
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`
                }}
            >
            {cards.map((card, idx) => (
                <div 
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    onMouseEnter={() => { if(gameState === 'sensing') audio.playSlide(); }}
                    className="w-full h-full flex items-center justify-center p-1 group cursor-pointer relative perspective-[1000px]"
                >
                    {/* Centered Card Container */}
                    <div 
                        className={`
                            relative
                            w-full h-full
                            transition-transform duration-300 ease-out transform
                            ${gameState === 'sensing' ? 'group-hover:-translate-y-2 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]' : ''}
                            ${card.isTarget && card.status === 'revealed' ? 'animate-breathe' : ''}
                        `}
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: card.status !== 'face-down' ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                    >
                        {/* THE STRUT: Ensures card maintains ratio */}
                        <svg 
                            viewBox="0 0 200 300"
                            className="block w-full h-full opacity-0 pointer-events-none select-none"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <rect width="200" height="300" fill="transparent"/>
                        </svg>
                    
                        {/* Card Back */}
                        <div 
                            className={`
                            absolute inset-0 w-full h-full rounded-lg backface-hidden overflow-hidden z-10
                            ${CARD_BACKS[cardBack].bg}
                            ${cardBack === 'box' || cardBack === 'checkered' ? '' : 'border-2 border-slate-400 ring-1 ring-inset ring-black/80'}
                            `}
                        >
                            {cardBack === 'static' && <div className="absolute inset-0 border border-white/20 rounded-lg pointer-events-none"></div>}
                        </div>

                        {/* Card Front */}
                        <div 
                            className={`
                            absolute inset-0 w-full h-full rounded-lg backface-hidden transform-[rotateY(180deg)] z-10
                            overflow-hidden border-2
                            ${card.status === 'revealed-wrong' 
                                ? 'border-neutral-700 grayscale opacity-60' 
                                : `border-slate-600 ${card.aura}`
                            }
                            `}
                        >
                            {/* Full Height Image */}
                            <img 
                                src={card.src} 
                                alt={card.name} 
                                className="w-full h-full object-cover" 
                            />

                            {/* IN-CARD FEEDBACK - CORRECT */}
                            {card.status === 'revealed' && card.isTarget && (
                                <div className="absolute bottom-4 left-0 right-0 text-center z-20">
                                    <span className="text-xl md:text-2xl font-black text-amber-300 uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                        CORRECT
                                    </span>
                                </div>
                            )}

                            {/* IN-CARD FEEDBACK - INCORRECT */}
                            {card.status === 'revealed-wrong' && card.isClicked && (
                                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                                    <span className="text-3xl md:text-5xl font-black text-red-600 uppercase tracking-widest transform -rotate-45 border-4 border-red-600 px-4 py-2 rounded-lg bg-black/60 shadow-2xl drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">
                                        INCORRECT
                                    </span>
                                </div>
                            )}
                        </div>
                  </div>
                </div>
            ))}
          </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 py-2 text-center border-t border-white/5 bg-black/40 backdrop-blur text-[10px] text-slate-600 shrink-0 h-8 flex items-center justify-between px-4">
        <div className="w-6"></div> {/* Spacer */}
        <p>LAB CONDITIONS: {deckSize} CARDS // {feedbackMode.toUpperCase()} MODE</p>
        <button onClick={toggleFullScreen} className="w-6 text-slate-400 hover:text-white">
            {typeof document !== 'undefined' && document.fullscreenElement ? <Minimize size={16}/> : <Maximize size={16}/>}
        </button>
      </footer>

      {/* CSS UTILS */}
      <style jsx global>{`
        .perspective-[1000px] { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
        
        @keyframes breathe {
            0%, 100% { transform: rotateY(180deg) scale(1); }
            50% { transform: rotateY(180deg) scale(1.05); }
        }
        .animate-breathe { animation: breathe 3s ease-in-out infinite; }

        @keyframes twinkle {
            0%, 100% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 0.5; transform: scale(1); }
        }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}