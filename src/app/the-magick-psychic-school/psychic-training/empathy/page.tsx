"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Heart, CloudRain, Sun, Banknote, Flame, Zap, Crosshair, PartyPopper, 
  Settings, Eye, Volume2, VolumeX, 
  Sparkles, X, Trophy, Info, RotateCcw, Save
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import MagickalBackLink from '@/app/components/MagickalBackLink';

/**
 * EMPATHY - Emotional Intuition Trainer
 */

// --- 1. CONFIGURATION & ASSETS ---

const EMOTIONS = [
  { id: 'love', name: 'Love', icon: Heart, color: '#ec4899', desc: 'Resonance, Connection', aura: 'shadow-pink-500' },
  { id: 'sad', name: 'Sadness', icon: CloudRain, color: '#94a3b8', desc: 'Rain, Tears, Grey', aura: 'shadow-slate-500' },
  { id: 'happy', name: 'Joy', icon: Sun, color: '#facc15', desc: 'Sun, Radiance', aura: 'shadow-yellow-500' },
  { id: 'rich', name: 'Wealth', icon: Banknote, color: '#fbbf24', desc: 'Gold, Abundance', aura: 'shadow-amber-500' },
  { id: 'sexy', name: 'Desire', icon: Flame, color: '#ef4444', desc: 'Heat, Passion', aura: 'shadow-red-600' },
  { id: 'angry', name: 'Rage', icon: Zap, color: '#dc2626', desc: 'Lightning, Force', aura: 'shadow-red-800' },
  { id: 'focused', name: 'Focus', icon: Crosshair, color: '#10b981', desc: 'Precision, Laser', aura: 'shadow-emerald-500' },
  { id: 'laughing', name: 'Laughter', icon: PartyPopper, color: '#d946ef', desc: 'Vibration, Release', aura: 'shadow-fuchsia-500' }
];

// Card backs: Deep Indigo/Black themes with Static and Silver Borders
const CARD_BACKS: Record<string, { name: string; bg: string }> = {
  static: { 
    name: 'Static', 
    // High contrast TV static effect using gradients + deep indigo overlay
    bg: 'bg-indigo-950 bg-[repeating-conic-gradient(#000000_0deg_10deg,_#312e81_10deg_20deg,_#ffffff15_20deg_30deg)]' 
  },
  void: { 
    name: 'Void', 
    bg: 'bg-[radial-gradient(circle_at_center,_#312e81_0%,_#020617_90%)]' 
  },
  ether: { 
    name: 'Ether', 
    bg: 'bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-slate-900' 
  }
};

// --- 2. AUDIO ENGINE (Web Audio API) ---
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
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(55, now + 0.5); 
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  };

  return { init, playTheta, playFlip, playSuccess, playFailure };
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in duration-500">
    <div className="max-w-md w-full border border-purple-500/30 bg-[#0f0f1a] p-8 rounded-xl shadow-[0_0_50px_rgba(236,72,153,0.2)] text-center relative">
        <h2 className="text-3xl font-serif text-pink-400 mb-2 tracking-widest">EMPATHY PROTOCOL</h2>
        <p className="text-xs font-mono text-purple-300 uppercase tracking-[0.2em] mb-6">Emotional Resonance Trainer</p>
        
        <div className="text-left space-y-4 mb-8 bg-black/40 p-4 rounded border border-white/5">
            <p className="text-sm text-gray-400 leading-relaxed">
                <strong className="text-pink-300">The Goal:</strong> Detect the hidden emotional signature behind the cards.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
                <li>A target emotion will be chosen (e.g., JOY).</li>
                <li>Cards will be dealt face down. One holds the energy.</li>
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

const EmotionRadar = ({ stats }: { stats: any }) => {
  const size = 200;
  const center = size / 2;
  const radius = 80;
  
  const points = EMOTIONS.map((emotion, i) => {
    const angle = (Math.PI * 2 * i) / EMOTIONS.length - Math.PI / 2;
    const stat = stats[emotion.id] || { attempts: 0, hits: 0 };
    const accuracy = stat.attempts > 0 ? stat.hits / stat.attempts : 0.1;
    
    const x = center + radius * accuracy * Math.cos(angle);
    const y = center + radius * accuracy * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const gridPoints = [0.25, 0.5, 0.75, 1].map(scale => {
    return EMOTIONS.map((_, i) => {
      const angle = (Math.PI * 2 * i) / EMOTIONS.length - Math.PI / 2;
      const x = center + radius * scale * Math.cos(angle);
      const y = center + radius * scale * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {gridPoints.map((pts, i) => (
          <polygon key={i} points={pts} fill="none" stroke="#334155" strokeWidth="1" />
        ))}
        {EMOTIONS.map((_, i) => {
          const angle = (Math.PI * 2 * i) / EMOTIONS.length - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#334155" strokeWidth="1" />;
        })}
        <polygon points={points} fill="rgba(236, 72, 153, 0.3)" stroke="#ec4899" strokeWidth="2" />
        {EMOTIONS.map((emo, i) => {
          const angle = (Math.PI * 2 * i) / EMOTIONS.length - Math.PI / 2;
          const x = center + (radius + 20) * Math.cos(angle);
          const y = center + (radius + 20) * Math.sin(angle);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" alignmentBaseline="middle" fill={emo.color} fontSize="10" fontWeight="bold">
              {emo.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

// --- 5. MAIN APP ---

export default function EmpathyApp() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [showInstructions, setShowInstructions] = useState(true);
  const [deckSize, setDeckSize] = useState(4);
  const [cardBack, setCardBack] = useState('static'); 
  const [feedbackMode, setFeedbackMode] = useState('training');
  const [targetFocus, setTargetFocus] = useState('random');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [gameState, setGameState] = useState('setup');
  const [targetEmotion, setTargetEmotion] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [message, setMessage] = useState("Initializing...");
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const audio = useAudioEngine();

  // Initialize
  useEffect(() => {
      const savedStats = localStorage.getItem('empathy_stats');
      if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  const handleStart = () => {
      setShowInstructions(false);
      audio.init();
      if (soundEnabled) audio.playTheta(true);
      startNewRound();
  };

  const handleSaveResults = async () => {
    setSaving(true);
    setSaveMessage("Inscribing...");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSaveMessage("Soul signature not found (Login required)");
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
      setSaveMessage("Inscribed in Grimoire");
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

  const startNewRound = useCallback(() => {
    setGameState('setup');
    
    // 1. Select Target
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
    setMessage(`Locate the energy of ${target.name.toUpperCase()}`);

    // 2. Build Deck
    let deck: any[] = [];
    deck.push({ ...target, isTarget: true, id: `card-${Math.random()}`, status: 'face-down' });

    while (deck.length < deckSize) {
      const win = (globalThis as any).window;
      let randomEmo;
      if (win && win.crypto) {
          const buffer = new Uint32Array(1);
          win.crypto.getRandomValues(buffer);
          randomEmo = EMOTIONS[buffer[0] % EMOTIONS.length];
      } else {
          randomEmo = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      }
      deck.push({ ...randomEmo, isTarget: false, id: `card-${Math.random()}`, status: 'face-down' });
    }

    deck = secureShuffle(deck);
    setCards(deck);

    setTimeout(() => {
      setGameState('sensing');
    }, 600);
  }, [deckSize, targetFocus]);

  const handleCardClick = (index: number) => {
    if (gameState !== 'sensing') return;
    
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

    if (isMatch) {
      audio.playSuccess();
      const newCards = [...cards];
      newCards[index].status = 'revealed';
      setCards(newCards);
      setGameState('revealed');
      setMessage("RESONANCE CONFIRMED");
      
      setTimeout(() => startNewRound(), 2500);

    } else {
      audio.playFailure();
      
      const newCards = [...cards];
      newCards[index].status = 'revealed-wrong';
      setCards(newCards);
      setGameState('revealed');
      setMessage(`Dissonance. You found ${clickedCard.name}.`);

      if (feedbackMode === 'training') {
        setTimeout(() => {
          const truthIndex = cards.findIndex(c => c.isTarget);
          const finalCards = [...newCards];
          finalCards[truthIndex].status = 'revealed';
          setCards(finalCards);
          setMessage(`Energy was here.`);
          
          setTimeout(() => startNewRound(), 2000);
        }, 800);
      } else {
        setTimeout(() => startNewRound(), 1500);
      }
    }
  };

  const TargetIcon = targetEmotion?.icon;

  // --- GRID & LAYOUT LOGIC ---
  const getLayoutConfig = () => {
    let cols = 2;
    if (deckSize >= 5 && deckSize <= 7) cols = 3;
    if (deckSize >= 8) cols = 4;
    
    // Calculate required rows to ensure fit
    const rows = Math.ceil(deckSize / cols);
    
    return { cols, rows };
  };

  const { cols, rows } = getLayoutConfig();

  return (
    <div className="relative h-dvh w-full bg-neutral-950 text-slate-200 font-sans selection:bg-purple-500/30 flex flex-col overflow-hidden" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-0" />
      
      {showInstructions && <InstructionModal onClose={handleStart} />}

      {/* HEADER */}
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
          <button onClick={() => setShowStats(!showStats)} className={`p-2 rounded-full transition-colors ${showStats ? 'bg-purple-900/50 text-purple-200' : 'hover:bg-white/10 text-slate-400'}`}>
            <Trophy size={20} />
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-purple-900/50 text-purple-200' : 'hover:bg-white/10 text-slate-400'}`}>
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* STATS DRAWER */}
      {showStats && (
        <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-10 duration-300 overflow-y-auto">
          <button onClick={() => setShowStats(false)} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white"><X /></button>
          <h2 className="text-3xl font-serif text-amber-100 mb-8 flex items-center gap-3">
            <Sparkles className="text-amber-400" />
            Soul Resonance
          </h2>
          <EmotionRadar stats={stats} />
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl pb-6">
            {EMOTIONS.map(e => {
              const s = stats[e.id] || { attempts: 0, hits: 0 };
              const rate = s.attempts > 0 ? Math.round((s.hits / s.attempts) * 100) : 0;
              return (
                <div key={e.id} className="bg-white/5 p-3 rounded border border-white/5 flex flex-col items-center">
                  <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">{e.name}</div>
                  <div className="text-xl font-mono text-white">{rate}%</div>
                  <div className="text-[10px] text-slate-500">{s.hits}/{s.attempts}</div>
                </div>
              )
            })}
          </div>
          
          <button 
            onClick={handleSaveResults} 
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/50 text-purple-100 rounded-lg transition-all"
          >
            {saving ? <Sparkles className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Inscribing..." : "Inscribe to Grimoire"}
          </button>
          {saveMessage && <p className="mt-3 text-sm text-amber-300 font-mono animate-pulse">{saveMessage}</p>}
        </div>
      )}

      {/* SETTINGS DRAWER */}
      {showSettings && (
        <div className="absolute right-0 top-16 bottom-0 w-80 z-40 bg-neutral-900 border-l border-white/10 shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
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
                {EMOTIONS.slice(0,3).map(e => (
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
            
            <button onClick={startNewRound} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded border border-white/10 flex items-center justify-center gap-2">
              <RotateCcw size={16} /> Reset Simulation
            </button>
          </div>
        </div>
      )}

      {/* GAME AREA */}
      <main className="flex-1 w-full flex flex-col relative z-10 overflow-y-auto p-2">
        
        {/* Instruction / Status */}
        <div className="shrink-0 mb-2 w-full text-center animate-fade-in-up min-h-[60px] flex flex-col justify-center">
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-1">Target Frequency</p>
          <div className="flex items-center justify-center gap-2">
             {TargetIcon && <TargetIcon size={18} className="text-amber-400" />}
             <h1 className="text-xl md:text-3xl font-serif text-slate-100">{targetEmotion?.name.toUpperCase()}</h1>
             {TargetIcon && <TargetIcon size={18} className="text-amber-400" />}
          </div>
          <p className={`h-4 text-[10px] md:text-xs font-medium tracking-wide transition-colors duration-500 ${message.includes('CONFIRMED') ? 'text-green-400' : message.includes('Dissonance') ? 'text-red-400' : 'text-purple-300/80'}`}>
            {message}
          </p>
        </div>

        {/* Grid Container - Forces Fit */}
        <div className="flex-1 w-full min-h-0 flex items-center justify-center">
            <div 
                className="grid gap-3 w-full max-w-5xl h-full max-h-full"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
                }}
            >
            {cards.map((card, idx) => (
                <div 
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    // Wrapper: Centers the card in the cell
                    className="relative w-full h-full flex items-center justify-center"
                >
                    <div className={`
                        relative aspect-[2/3] w-auto h-auto max-w-full max-h-full
                        cursor-pointer transition-all duration-500 transform
                        ${gameState === 'sensing' ? 'hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]' : ''}
                    `}
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: card.status !== 'face-down' ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                    >
                    {/* Card Back - Magickal Silver Border */}
                    <div 
                        className={`
                        absolute inset-0 w-full h-full rounded-lg backface-hidden overflow-hidden
                        ${CARD_BACKS[cardBack].bg}
                        border-[3px] border-slate-400 ring-1 ring-inset ring-black/80
                        shadow-[0_0_10px_rgba(148,163,184,0.2)]
                        `}
                    >
                        {/* Inner metallic sheen */}
                        <div className="absolute inset-0 border-[1px] border-white/20 rounded-lg pointer-events-none"></div>
                    </div>

                    {/* Card Front */}
                    <div 
                        className={`
                        absolute inset-0 w-full h-full rounded-lg backface-hidden transform-[rotateY(180deg)]
                        flex flex-col items-center justify-center border-2
                        ${card.status === 'revealed-wrong' 
                            ? 'bg-neutral-800 border-neutral-700 grayscale opacity-60' 
                            : `bg-neutral-900 ${card.color === '#ec4899' ? 'border-pink-500' : 'border-slate-600'} ${card.aura}`
                        }
                        `}
                    >
                        {card.status === 'revealed' && card.isTarget && (
                        <div className="absolute inset-0 bg-linear-to-t from-amber-500/20 to-transparent animate-pulse rounded-lg"></div>
                        )}

                        <div className={`p-3 rounded-full bg-white/5 mb-3 ${card.status === 'revealed' && card.isTarget ? 'text-amber-300 scale-110' : 'text-slate-300'}`}>
                        <card.icon 
                            className="w-6 h-6 md:w-8 md:h-8"
                            color={card.status === 'revealed-wrong' ? '#525252' : card.color} 
                        />
                        </div>
                        <span className={`text-[10px] md:text-xs uppercase tracking-widest font-bold ${card.status === 'revealed-wrong' ? 'text-neutral-500' : 'text-white'}`}>
                        {card.name}
                        </span>
                        
                        {card.isTarget && card.status === 'revealed' && (
                        <Sparkles className="absolute top-1 right-1 text-amber-400 animate-spin-slow" size={12} />
                        )}
                    </div>
                </div>
            </div>
          ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 py-2 text-center border-t border-white/5 bg-black/40 backdrop-blur text-[10px] text-slate-600 shrink-0 h-8 flex items-center justify-center">
        <p>LAB CONDITIONS: {deckSize} CARDS // {feedbackMode.toUpperCase()} MODE</p>
      </footer>

      {/* CSS UTILS FOR 3D */}
      <style jsx global>{`
        .perspective-[1000px] { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>
    </div>
  );
}