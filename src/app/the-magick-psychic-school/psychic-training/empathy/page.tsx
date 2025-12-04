"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Heart, CloudRain, Sun, Banknote, Flame, Zap, Crosshair, PartyPopper, 
  Settings, Eye, Volume2, VolumeX, 
  Sparkles, X, Trophy, Info, RotateCcw, Save, Activity
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import MagickalBackLink from '@/app/components/MagickalBackLink';

/**
 * --- PSI MATH ENGINE ---
 * Helper functions for statistical analysis of psychic phenomena.
 */
const calculateZScore = (hits: number, trials: number, chance: number) => {
  if (trials === 0) return 0;
  const expected = trials * chance;
  const stdDev = Math.sqrt(trials * chance * (1 - chance));
  return (hits - expected) / stdDev;
};

// Approximation of the error function (erf) for p-value calculation
const erf = (x: number) => {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = (x < 0) ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
};

const calculateProbability = (z: number) => {
  // One-tailed probability
  const pValue = 0.5 * (1 - erf(z / Math.sqrt(2)));
  if (pValue <= 0) return "1 in ∞"; // Effectively impossible
  const oneInX = 1 / pValue;
  
  if (oneInX > 1000000) return `1 in ${(oneInX / 1000000).toFixed(1)}M`;
  if (oneInX > 1000) return `1 in ${(oneInX / 1000).toFixed(1)}k`;
  return `1 in ${Math.round(oneInX)}`;
};

const getPsiTier = (z: number) => {
  if (z >= 4.0) return { name: "The Oracle", color: "text-amber-300 shadow-amber-500/50" };
  if (z >= 3.0) return { name: "The Medium", color: "text-purple-300 shadow-purple-500/50" };
  if (z >= 1.96) return { name: "The Clairvoyant", color: "text-pink-300 shadow-pink-500/50" };
  if (z >= 1.65) return { name: "The Empath", color: "text-indigo-300 shadow-indigo-500/50" };
  if (z >= 1.0) return { name: "The Sensitive", color: "text-cyan-300 shadow-cyan-500/50" };
  if (z >= 0.5) return { name: "The Intuitive", color: "text-teal-300 shadow-teal-500/50" };
  
  if (z <= -4.0) return { name: "The Void", color: "text-slate-500" };
  if (z <= -3.0) return { name: "The Shadow", color: "text-slate-400" };
  if (z <= -2.0) return { name: "The Inverter", color: "text-slate-400" };
  if (z <= -1.0) return { name: "The Skeptic", color: "text-slate-400" };
  if (z <= -0.5) return { name: "The Latent", color: "text-slate-400" };
  
  return { name: "The Sensor", color: "text-slate-300" };
};

/**
 * --- PSI STATS COMPONENT ---
 * HUD for displaying performance metrics.
 */
const PsiStats = ({ stats, deckSize }: { stats: any, deckSize: number }) => {
  const [showModal, setShowModal] = useState(false);
  
  // Aggregate current session stats
  let totalTrials = 0;
  let totalHits = 0;
  
  Object.values(stats).forEach((s: any) => {
    totalTrials += s.attempts;
    totalHits += s.hits;
  });

  const chance = 1 / deckSize;
  const accuracy = totalTrials > 0 ? (totalHits / totalTrials) * 100 : 0;
  const zScore = calculateZScore(totalHits, totalTrials, chance);
  const probability = calculateProbability(zScore);
  const tier = getPsiTier(zScore);

  // Load lifetime stats for modal
  const [lifetimeStats, setLifetimeStats] = useState<any>({ hits: 0, trials: 0 });
  
  useEffect(() => {
    if (showModal) {
      // Mockup of reading local storage or DB for lifetime
      const saved = localStorage.getItem('empathy_lifetime');
      if (saved) setLifetimeStats(JSON.parse(saved));
    }
  }, [showModal]);

  return (
    <>
      {/* HUD BOX */}
      <div className="absolute top-20 md:top-6 right-2 md:right-6 z-30 flex flex-col items-end pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-3 text-right shadow-[0_0_20px_rgba(0,0,0,0.5)] w-[140px] md:w-[180px]">
          <div className="text-3xl font-mono font-bold text-white mb-1">{accuracy.toFixed(1)}%</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 border-b border-white/10 pb-1">Accuracy</div>
          
          <div className="space-y-1 font-mono text-xs text-slate-300">
            <div className="flex justify-between"><span>N:</span> <span>{totalTrials}</span></div>
            <div className="flex justify-between"><span>Z:</span> <span className={zScore > 0 ? 'text-green-400' : zScore < 0 ? 'text-red-400' : ''}>{zScore.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Prob:</span> <span>{probability}</span></div>
          </div>
          
          <div className={`mt-2 text-xs font-bold uppercase tracking-wider ${tier.color} text-shadow-sm`}>
            {tier.name}
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="mt-3 w-full text-[10px] text-slate-500 hover:text-white uppercase tracking-wider border border-transparent hover:border-white/20 rounded py-1 transition-all"
          >
            View Scores
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="max-w-2xl w-full bg-neutral-900 border border-white/10 rounded-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X /></button>
            
            <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-2">
              <Activity className="text-purple-400" /> Psychic Performance Record
            </h2>

            {/* Comparison Table */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <h3 className="text-xs uppercase tracking-[0.2em] text-purple-300 mb-4 text-center">Current Session</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-1"><span>Hits</span> <span className="text-white font-mono">{totalHits}</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-1"><span>Trials</span> <span className="text-white font-mono">{totalTrials}</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-1"><span>Accuracy</span> <span className="text-white font-mono">{accuracy.toFixed(1)}%</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-1"><span>Z-Score</span> <span className="text-amber-300 font-mono">{zScore.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Probability</span> <span className="text-green-300 font-mono">{probability}</span></div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/5 opacity-50 relative">
                 <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px] rounded-lg">
                    <span className="text-xs uppercase tracking-widest text-slate-400">Lifetime Data (Simulated)</span>
                 </div>
                 {/* Placeholder for lifetime structure */}
                 <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4 text-center">Lifetime</h3>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-3 border-b border-white/10 pb-2">Psi-Hitting (Positive Scale)</h4>
                <div className="space-y-2 text-xs md:text-sm">
                  <div className="grid grid-cols-12 gap-2"><span className="col-span-2 text-amber-300 font-bold">Oracle</span><span className="col-span-2 text-slate-500">Z &ge; 4.0</span><span className="col-span-8 text-slate-300">World Class Anomaly (1 in 31,000)</span></div>
                  <div className="grid grid-cols-12 gap-2"><span className="col-span-2 text-purple-300 font-bold">Medium</span><span className="col-span-2 text-slate-500">Z &ge; 3.0</span><span className="col-span-8 text-slate-300">Highly Significant (1 in 740)</span></div>
                  <div className="grid grid-cols-12 gap-2"><span className="col-span-2 text-pink-300 font-bold">Clairvoyant</span><span className="col-span-2 text-slate-500">Z &ge; 1.96</span><span className="col-span-8 text-slate-300">Statistically Significant (p &lt; 0.05)</span></div>
                  <div className="grid grid-cols-12 gap-2"><span className="col-span-2 text-indigo-300 font-bold">Empath</span><span className="col-span-2 text-slate-500">Z &ge; 1.65</span><span className="col-span-8 text-slate-300">Borderline Significant</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-3 border-b border-white/10 pb-2">Psi-Missing (Negative Scale)</h4>
                 <div className="space-y-2 text-xs md:text-sm text-slate-400">
                  <div className="grid grid-cols-12 gap-2"><span className="col-span-2 font-bold">Inverter</span><span className="col-span-2 text-slate-600">Z &le; -2.0</span><span className="col-span-8">Subconscious flipping of signal</span></div>
                  <div className="grid grid-cols-12 gap-2"><span className="col-span-2 font-bold">Shadow</span><span className="col-span-2 text-slate-600">Z &le; -3.0</span><span className="col-span-8">Highly significant displacement</span></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};


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

// Card backs
const CARD_BACKS: Record<string, { name: string; bg: string }> = {
  static: { 
    name: 'Static', 
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
  
  // Feedback System State
  const [feedback, setFeedback] = useState<{show: boolean, type: 'hit'|'miss', text: string, subtext: string} | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Layout State
  const [isDesktop, setIsDesktop] = useState(false);

  const audio = useAudioEngine();

  // Initialize
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
    setFeedback(null);
    
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

    // 2. Build Deck
    let deck: any[] = [];
    deck.push({ ...target, isTarget: true, id: `card-${Math.random()}`, status: 'face-down' });

    // CRITICAL FIX: EXCLUDE TARGET FROM DISTRACTORS
    // This prevents a "Love" card being chosen as a distractor when "Love" is the target
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

  const handleCardClick = (index: number) => {
    if (gameState !== 'sensing') return;
    
    const clickedCard = cards[index];
    const isMatch = clickedCard.isTarget;
    
    audio.playFlip();

    // Update Stats
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

    // Reveal Logic
    if (isMatch) {
      audio.playSuccess();
      const newCards = [...cards];
      newCards[index].status = 'revealed';
      setCards(newCards);
      setGameState('revealed');
      
      // SHOW MAGICKAL FEEDBACK
      setFeedback({
        show: true,
        type: 'hit',
        text: "CORRECT",
        subtext: `You found ${targetEmotion.name}`
      });
      
      setTimeout(() => startNewRound(), 5000); // 5 Seconds pause

    } else {
      audio.playFailure();
      const newCards = [...cards];
      newCards[index].status = 'revealed-wrong';
      
      // If training mode, show the correct card too
      if (feedbackMode === 'training') {
        const truthIndex = cards.findIndex(c => c.isTarget);
        newCards[truthIndex].status = 'revealed';
      }

      setCards(newCards);
      setGameState('revealed');

      // SHOW MAGICKAL FEEDBACK
      setFeedback({
        show: true,
        type: 'miss',
        text: "INCORRECT",
        subtext: `You chose ${clickedCard.name}. Target was ${targetEmotion.name}.`
      });

      setTimeout(() => startNewRound(), 5000); // 5 Seconds pause
    }
  };

  const TargetIcon = targetEmotion?.icon;

  // --- GRID & LAYOUT LOGIC ---
  const getLayoutConfig = () => {
    let cols = 2; // Default Mobile
    if (isDesktop) {
        if (deckSize === 10) {
            cols = 5;
        } else {
            cols = Math.min(deckSize, 4);
        }
    } else {
        cols = deckSize > 6 ? 3 : 2;
    }
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
          <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-purple-900/50 text-purple-200' : 'hover:bg-white/10 text-slate-400'}`}>
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* PSI STATS HUD */}
      <PsiStats stats={stats} deckSize={deckSize} />

      {/* MAGICKAL FEEDBACK OVERLAY */}
      {feedback && feedback.show && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
            {/* The Text Animation Container */}
            <div className="animate-magick-zoom text-center">
                <h1 
                  className={`
                    text-6xl md:text-9xl font-serif font-black tracking-tighter mb-4
                    ${feedback.type === 'hit' ? 'text-amber-300' : 'text-slate-400'}
                  `}
                  style={{
                    textShadow: feedback.type === 'hit' 
                      ? '4px 4px 0px #ec4899, -2px -2px 0px #facc15' 
                      : '4px 4px 0px #1e293b, -2px -2px 0px #0f172a'
                  }}
                >
                    {feedback.text}
                </h1>
                <p className="text-xl md:text-2xl text-white font-mono uppercase tracking-widest bg-black/80 px-6 py-2 rounded-full inline-block border border-white/20">
                    {feedback.subtext}
                </p>
            </div>
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
      )}

      {/* GAME AREA */}
      <main className="flex-1 w-full flex flex-col relative z-10 overflow-y-auto p-2">
        
        {/* Instruction / Status */}
        <div className="shrink-0 mb-2 w-full text-center animate-fade-in-up min-h-[60px] flex flex-col justify-center">
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-1">Target Frequency</p>
          <div className="flex items-center justify-center gap-2">
             {TargetIcon && <TargetIcon size={24} className="text-amber-400" />}
             <h1 className="text-2xl md:text-4xl font-serif text-slate-100">{targetEmotion?.name.toUpperCase()}</h1>
             {TargetIcon && <TargetIcon size={24} className="text-amber-400" />}
          </div>
          <p className="h-4 text-[10px] md:text-xs font-medium tracking-wide text-purple-300/50">
            {gameState === 'sensing' ? 'Tune into the signal...' : 'Processing...'}
          </p>
        </div>

        {/* Grid Container - Forces Fit */}
        <div className="flex-1 w-full min-h-0 flex items-center justify-center">
            <div 
                className="grid gap-3 w-full max-w-6xl h-full max-h-full"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
                }}
            >
            {cards.map((card, idx) => (
                <div 
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    className="relative w-full h-full"
                >
                    {/* Centered Absolute Card */}
                    <div 
                        className={`
                            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                            h-[90%] w-auto aspect-2/3 max-w-full
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
                        <div className="absolute inset-0 border border-white/20 rounded-lg pointer-events-none"></div>
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

                        {/* BIGGER ICONS */}
                        <div className={`p-4 rounded-full bg-white/5 mb-2 ${card.status === 'revealed' && card.isTarget ? 'text-amber-300 scale-110' : 'text-slate-300'}`}>
                            <card.icon 
                                // Taking up 1/3 of space essentially
                                className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20"
                                color={card.status === 'revealed-wrong' ? '#525252' : card.color} 
                                strokeWidth={1.5}
                            />
                        </div>
                        <span className={`text-[10px] md:text-sm uppercase tracking-widest font-bold ${card.status === 'revealed-wrong' ? 'text-neutral-500' : 'text-white'}`}>
                        {card.name}
                        </span>
                        
                        {card.isTarget && card.status === 'revealed' && (
                        <Sparkles className="absolute top-2 right-2 text-amber-400 animate-spin-slow" size={20} />
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

      {/* CSS UTILS */}
      <style jsx global>{`
        .perspective-[1000px] { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }

        @keyframes magick-zoom {
            0% { transform: scale(0.5) translateY(50px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-magick-zoom { animation: magick-zoom 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}