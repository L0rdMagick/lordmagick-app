/** --- START OF FILE page.tsx --- **/
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Target, Settings, RotateCcw, 
  Activity, X, Info, Volume2, VolumeX, Sparkles, Save,
  Heart, Skull, ArrowRight
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import MagickalBackLink from '@/app/components/MagickalBackLink';

/**
 * --- ASSET CONFIGURATION ---
 */
const BASE_PATH = "/images/friend-or-foe-app";

const CHARACTER_KEYS = [
  "abuela", "alt_guy", "barista_girl", "church_lady", 
  "construction_man", "corp_woman", "dad_guy", "doctor_woman", 
  "genz_teen", "hijabi_student", "island_man", "jazz_man", 
  "native_man", "office_guy (1)", "retail_woman", "senior_asian_man", 
  "student_girl", "suburban_mom", "teacher_man", "tech_guy"
];

interface CharacterAssets {
  id: string;
  normal: string;
  angelic: string;
  evil: string;
}

// Generate the asset map from the keys
const CHARACTERS: CharacterAssets[] = CHARACTER_KEYS.map(key => ({
  id: key,
  normal: `${BASE_PATH}/${key}_normal.jpg`,
  angelic: `${BASE_PATH}/${key}_angelic.jpg`,
  evil: `${BASE_PATH}/${key}_evil.jpg`
}));

/**
 * --- PSI MATH ENGINE (Binary 50/50) ---
 */
const calculatePsiScore = (hits: number, trials: number) => {
  if (trials === 0) return 0;
  const chance = 0.5; // Binary choice
  const expected = trials * chance;
  const stdDev = Math.sqrt(trials * chance * (1 - chance));
  return (hits - expected) / stdDev;
};

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
  const pValue = 0.5 * (1 - erf(Math.abs(z) / Math.sqrt(2)));
  if (pValue <= 0) return "1 in ∞"; 
  const oneInX = 1 / pValue;
  
  if (oneInX > 1000000) return `1 in ${(oneInX / 1000000).toFixed(1)}M`;
  if (oneInX > 1000) return `1 in ${(oneInX / 1000).toFixed(1)}k`;
  if (oneInX < 2) return "1 in 2";
  return `1 in ${Math.round(oneInX)}`;
};

const getPsiTier = (z: number) => {
  // POSITIVE SCALE (Psi-Hitting)
  if (z >= 4.0) return { name: "The Oracle", color: "text-amber-300 shadow-amber-500/50" };
  if (z >= 3.0) return { name: "The Medium", color: "text-purple-300 shadow-purple-500/50" };
  if (z >= 1.96) return { name: "The Clairvoyant", color: "text-pink-300 shadow-pink-500/50" };
  if (z >= 1.65) return { name: "The Channel", color: "text-indigo-300 shadow-indigo-500/50" };
  if (z >= 1.0) return { name: "The Adept", color: "text-cyan-300 shadow-cyan-500/50" };
  if (z >= 0.5) return { name: "The Spark", color: "text-teal-300 shadow-teal-500/50" };
  if (z >= 0.0) return { name: "The Initiate", color: "text-slate-200" };

  // NEGATIVE SCALE (Psi-Missing)
  if (z <= -4.0) return { name: "The Void", color: "text-slate-500" };
  if (z <= -3.0) return { name: "The Shadow", color: "text-slate-400" };
  if (z <= -2.0) return { name: "The Mirror", color: "text-slate-400" };
  if (z <= -1.0) return { name: "The Blocker", color: "text-slate-400" };
  if (z <= -0.5) return { name: "The Dreamer", color: "text-slate-400" };
  
  // Just below baseline
  return { name: "The Sleeper", color: "text-slate-300" };
};

/**
 * --- AUDIO ENGINE ---
 */
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
      osc.frequency.setValueAtTime(100, ctx.currentTime); 
      
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(40, ctx.currentTime); 
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(50, ctx.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      
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

  const playSelect = () => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playReveal = (success: boolean) => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (success) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(522.81, now); 
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.5); 
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.4);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.5);
  };

  return { init, playTheta, playSelect, playReveal };
};

/**
 * --- SECURE RNG ---
 */
const secureRandomBit = () => {
  const win = (globalThis as any).window;
  if (win && win.crypto) {
      const array = new Uint32Array(1);
      win.crypto.getRandomValues(array);
      return array[0] % 2 === 0 ? 'good' : 'evil';
  }
  return Math.random() > 0.5 ? 'good' : 'evil';
};

/**
 * --- COMPONENTS ---
 */

const InstructionModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full border border-purple-500/30 bg-[#0f172a] p-8 rounded-xl shadow-[0_0_50px_rgba(168,85,247,0.2)] text-center relative">
          <h2 className="text-3xl font-black text-purple-400 mb-2 tracking-tighter font-serif">FRIEND OR FOE</h2>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-[0.2em] mb-6">Intuition Defense System</p>
          
          <div className="text-left space-y-4 mb-8 bg-black/40 p-4 rounded border border-white/5 text-sm text-slate-300 font-mono">
              <p className="leading-relaxed">
                  <span className="text-purple-400 font-bold">THE TASK:</span> View the subject. Use your intuition to sense their hidden nature.
              </p>
              <p className="leading-relaxed">
                  <span className="text-slate-200 font-bold">THE CHOICE:</span> Decide if they are <span className="text-green-400">GOOD (Angelic)</span> or <span className="text-red-400">EVIL (Demonic)</span>.
              </p>
              <p className="leading-relaxed">
                  <span className="text-amber-400 font-bold">THE LADDER:</span>
                  <br/>- Level 1: 1 Subject.
                  <br/>- Level 2: 2 Subjects.
                  <br/>- Level 3: 3 Subjects.
                  <br/>- Level 4: 4 Subjects.
              </p>
              <p className="text-xs text-red-400 mt-2 border-t border-white/10 pt-2">
                 *WARNING: You must get ALL subjects correct to advance. A single mistake resets you to Level 1.*
              </p>
          </div>
          
          <button 
              onClick={onClose}
              className="w-full py-3 bg-purple-900/50 hover:bg-purple-800/80 border border-purple-500/50 text-purple-100 font-mono font-bold tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          >
              Begin Trial
          </button>
      </div>
    </div>
);

const PsiStats = ({ stats, level }: { stats: any, level: number }) => {
    const [supabase] = useState(() => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ));
    const [showModal, setShowModal] = useState(false);
    
    // Stats
    const { hits, trials } = stats;
    const accuracy = trials > 0 ? (hits / trials) * 100 : 0;
    const z = calculatePsiScore(hits, trials);
    const prob = calculateProbability(z);
    const tier = getPsiTier(z);

    return (
      <>
        <div 
          onClick={() => setShowModal(true)}
          className="cursor-pointer group flex flex-col items-end justify-center bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/20 hover:border-purple-500/50 rounded-lg px-3 py-1 transition-all duration-300 min-w-24 h-[50px]"
        >
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-purple-400">LVL {level}</span>
              <div className="w-px h-3 bg-purple-500/20"></div>
              <span className="text-xl font-mono font-bold text-slate-200 group-hover:text-white transition-colors">
                  {accuracy.toFixed(0)}%
              </span>
            </div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest group-hover:text-purple-300 transition-colors">
              Z: {z.toFixed(2)}
            </div>
        </div>
  
        {showModal && (
          <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300"
              onClick={() => setShowModal(false)}
          >
            <div 
              className="max-w-4xl w-full bg-slate-900 border border-purple-500/20 rounded-xl p-6 relative max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(168,85,247,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X /></button>
              <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-2">
                <Activity className="text-purple-400" /> Performance Analysis
              </h2>
              
              {/* CURRENT STATS CARD */}
              <div className="bg-black/20 rounded-lg p-4 border border-white/5 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm font-mono text-center md:text-left">
                  <div className="flex flex-col"><span className="text-slate-500 text-[10px] uppercase">Trials</span><span className="text-white text-lg">{trials}</span></div>
                  <div className="flex flex-col"><span className="text-slate-500 text-[10px] uppercase">Hits</span><span className="text-white text-lg">{hits}</span></div>
                  <div className="flex flex-col"><span className="text-slate-500 text-[10px] uppercase">Accuracy</span><span className="text-white text-lg">{accuracy.toFixed(1)}%</span></div>
                  <div className="flex flex-col"><span className="text-slate-500 text-[10px] uppercase">Psi Score (Z)</span><span className={`text-lg ${z >= 0 ? "text-amber-300" : "text-slate-400"}`}>{z.toFixed(2)}</span></div>
                  <div className="flex flex-col"><span className="text-slate-500 text-[10px] uppercase">Probability</span><span className="text-green-300 text-sm mt-1">{prob}</span></div>
                </div>
                <div className="mt-4 text-center text-sm font-bold uppercase tracking-widest text-white border-t border-white/10 pt-2">{tier.name}</div>
              </div>

              {/* DEFINITIONS LEGEND */}
              <div className="grid md:grid-cols-2 gap-8 border-t border-white/10 pt-6">
                  {/* Positive Column */}
                  <div>
                      <h4 className="text-xs uppercase tracking-widest text-amber-400 mb-3 pb-2 border-b border-white/5">Psi-Hitting (Positive)</h4>
                      <div className="space-y-3 text-xs font-mono">
                          <div><strong className="text-amber-200 block">The Oracle (Z &ge; 4.0)</strong><span className="text-slate-400">World Class Anomaly (1 in 31,000+).</span></div>
                          <div><strong className="text-purple-300 block">The Medium (Z &ge; 3.0)</strong><span className="text-slate-400">Highly Significant (1 in 740).</span></div>
                          <div><strong className="text-pink-300 block">The Clairvoyant (Z &ge; 1.96)</strong><span className="text-slate-400">Statistically Significant (p &lt; 0.05).</span></div>
                          <div><strong className="text-indigo-300 block">The Channel (Z &ge; 1.65)</strong><span className="text-slate-400">Tapping into something real (1 in 20).</span></div>
                          <div><strong className="text-cyan-300 block">The Adept (Z &ge; 1.0)</strong><span className="text-slate-400">Finding flow. Beating odds of 1 in 6.</span></div>
                          <div><strong className="text-teal-300 block">The Spark (Z &ge; 0.5)</strong><span className="text-slate-400">Pulse of intuition. Nudging past average.</span></div>
                          <div><strong className="text-slate-200 block">The Initiate (Z &ge; 0.0)</strong><span className="text-slate-500">Above baseline. Better than random.</span></div>
                      </div>
                  </div>
                  
                  {/* Negative Column */}
                  <div>
                      <h4 className="text-xs uppercase tracking-widest text-blue-400 mb-3 pb-2 border-b border-white/5">Psi-Missing (Negative)</h4>
                      <div className="space-y-3 text-xs font-mono">
                          <div><strong className="text-slate-300 block">The Sleeper (Z &lt; 0.0)</strong><span className="text-slate-500">Just below baseline. Stop over-analyzing.</span></div>
                          <div><strong className="text-slate-400 block">The Dreamer (Z &le; -0.5)</strong><span className="text-slate-500">Drifting. Intuition active but unfocused.</span></div>
                          <div><strong className="text-slate-400 block">The Blocker (Z &le; -1.0)</strong><span className="text-slate-500">Dodging targets. Logic fighting gut.</span></div>
                          <div><strong className="text-slate-400 block">The Mirror (Z &le; -2.0)</strong><span className="text-slate-500">Significant Avoidance. Flipping the signal.</span></div>
                          <div><strong className="text-slate-500 block">The Shadow (Z &le; -3.0)</strong><span className="text-slate-600">Highly Significant Displacement. Inverted.</span></div>
                          <div><strong className="text-slate-500 block">The Void (Z &le; -4.0)</strong><span className="text-slate-600">World Class Anomaly. Total suppression.</span></div>
                      </div>
                  </div>
              </div>

            </div>
          </div>
        )}
      </>
    );
};

/**
 * --- GAME LOGIC & MAIN APP ---
 */

interface GameCard {
    instanceId: string; // unique ID for React keys
    data: CharacterAssets;
    target: 'good' | 'evil';
    guess: 'good' | 'evil' | null;
}

export default function FriendOrFoeApp() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  // --- APP STATE ---
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [gameState, setGameState] = useState<'INPUT' | 'RESULT'>('INPUT');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({ trials: 0, hits: 0 });

  const audio = useAudioEngine();

  // Audio Init
  useEffect(() => {
    audio.init();
  }, []);

  // Background Audio
  useEffect(() => {
    if (soundEnabled) {
       audio.playTheta(true);
    } else {
       audio.playTheta(false);
    }
  }, [soundEnabled]);

  const toggleSound = () => setSoundEnabled(!soundEnabled);

  // --- GAMEPLAY FUNCTIONS ---

  const startRound = useCallback((targetLevel: number) => {
    // 1. Pick (targetLevel) unique random characters
    const shuffled = [...CHARACTERS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, targetLevel);

    // 2. Generate cards with secret targets
    const newCards: GameCard[] = selected.map((char, index) => ({
        instanceId: `${char.id}-${Date.now()}-${index}`,
        data: char,
        target: secureRandomBit(),
        guess: null
    }));

    setCards(newCards);
    setGameState('INPUT');
  }, []);

  // Initial Load
  useEffect(() => {
    if (!showInstructions) {
        startRound(1);
    }
  }, [showInstructions, startRound]);


  const handleGuess = (index: number, choice: 'good' | 'evil') => {
      if (gameState !== 'INPUT') return;
      
      audio.playSelect();

      setCards(prev => {
          const newCards = [...prev];
          newCards[index].guess = choice;
          return newCards;
      });
  };

  const submitRound = () => {
    // Check if all answered
    if (cards.some(c => c.guess === null)) return;

    setGameState('RESULT');
    
    // Calculate outcome
    let roundHits = 0;
    const roundTrials = cards.length;
    let allCorrect = true;

    cards.forEach(card => {
        if (card.guess === card.target) {
            roundHits++;
        } else {
            allCorrect = false;
        }
    });

    // Update stats
    setStats(prev => ({
        hits: prev.hits + roundHits,
        trials: prev.trials + roundTrials
    }));

    // Audio Feedback
    audio.playReveal(allCorrect);
  };

  const handleContinue = () => {
      const allCorrect = cards.every(c => c.guess === c.target);
      
      if (allCorrect) {
          // Progression
          const nextLevel = level >= 4 ? 1 : level + 1;
          setLevel(nextLevel);
          startRound(nextLevel);
      } else {
          // Failure - Reset
          setLevel(1);
          startRound(1);
      }
  };

  const handleReset = () => {
      setStats({ hits: 0, trials: 0 });
      setLevel(1);
      startRound(1);
      setShowSettings(false);
  };

  const handleSaveResults = async () => {
    setSaving(true);
    setSaveMessage("UPLOADING DATA...");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSaveMessage("AUTH REQUIRED");
        setTimeout(() => setSaveMessage(null), 3000);
        setSaving(false);
        return;
      }
      
      const { error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          name: 'Friend or Foe',
          category: 'training', 
          chart_data: stats, 
          report_content: `Session Stats: ${stats.hits}/${stats.trials}. Max Level reached: ${level}.`,
        });
      if (error) throw error;
      setSaveMessage("DATA ARCHIVED");
    } catch (e) {
      console.error(e);
      setSaveMessage("UPLOAD FAILED");
    } finally {
      setTimeout(() => setSaveMessage(null), 3000);
      setSaving(false);
    }
  };

  // --- LAYOUT HELPERS ---
  const getGridClasses = () => {
    // UPDATED LOGIC FOR FIT-TO-SCREEN
    // Level 1: 1 col, 1 row (Centered)
    // Level 2: 2 cols, 1 row (Side by Side) - as requested
    // Level 3/4: 2 cols, 2 rows (2x2 Grid)
    
    switch(level) {
        case 1: return "grid-cols-1 grid-rows-1";
        case 2: return "grid-cols-2 grid-rows-1"; // Forced Side-by-Side
        case 3: 
        case 4: return "grid-cols-2 grid-rows-2";
        default: return "grid-cols-1 grid-rows-1";
    }
  };

  // --- RENDER ---
  return (
    <div className="relative h-dvh w-full bg-slate-950 text-slate-200 font-sans selection:bg-purple-500/30 flex flex-col overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 bg-[#020617] z-0" style={{ backgroundImage: 'linear-gradient(#1e1b4b 1px, transparent 1px), linear-gradient(90deg, #1e1b4b 1px, transparent 1px)', backgroundSize: '50px 50px', opacity: 0.1 }}></div>
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950 z-0 opacity-80"></div>

      {showInstructions && <InstructionModal onClose={() => { setShowInstructions(false); startRound(1); }} />}

      {/* HEADER - Fixed Height */}
      <header className="relative z-20 flex justify-between items-center px-4 py-3 border-b border-purple-900/30 backdrop-blur-sm bg-slate-950/60 shrink-0 h-16">
        <div className="flex items-center gap-4">
            <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit" className="text-xs text-slate-500 hover:text-purple-400" />
            <div className="w-px h-6 bg-slate-800 hidden md:block"></div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-purple-950 border border-purple-800 flex items-center justify-center">
                    <Heart size={16} className="text-purple-400" />
                </div>
                <span className="font-serif tracking-widest text-lg font-bold text-slate-200 hidden md:block">
                    FRIEND OR FOE
                </span>
            </div>
        </div>
        
        <div className="flex gap-2">
           <button onClick={() => setShowInstructions(true)} className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-500">
             <Info size={20} />
           </button>
           <button onClick={toggleSound} className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-500">
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded transition-colors ${showSettings ? 'bg-purple-900/50 text-purple-200' : 'hover:bg-slate-800 text-slate-500'}`}>
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* HUD - Fixed Height */}
      <div className="shrink-0 w-full flex items-center justify-between px-4 py-2 relative z-20 h-14">
          <div className="flex flex-col justify-center">
            <span className="text-[9px] uppercase tracking-widest text-slate-500">Status</span>
            <div className="text-sm font-mono tracking-wider text-slate-300">
                LEVEL <span className="text-purple-400 font-bold text-lg">{level}</span>
            </div>
          </div>
          <PsiStats stats={stats} level={level} />
      </div>

      {/* MAIN GAME AREA - STRICT FLEX FIT & OVERFLOW HANDLING */}
      <main className="flex-1 w-full relative z-10 overflow-hidden p-2 flex flex-col items-center justify-center min-h-0">
         
         <div 
            className={`grid gap-2 w-full h-full ${getGridClasses()}`}
         >
            {cards.map((card, index) => {
                const isRevealed = gameState === 'RESULT';
                const isCorrect = isRevealed && card.guess === card.target;
                
                // Determine Image Source
                let imgSrc = card.data.normal;
                if (isRevealed) {
                    imgSrc = card.target === 'good' ? card.data.angelic : card.data.evil;
                }

                // Styling Logic for Card
                let cardStyleClass = "border-2 border-slate-600 shadow-[0_0_15px_rgba(147,51,234,0.15)]"; // Default
                if (isRevealed) {
                    if (isCorrect) {
                        cardStyleClass = "border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.6)]";
                    } else {
                        cardStyleClass = "border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]";
                    }
                } else if (card.guess) {
                    // Selected but not revealed
                    cardStyleClass = "border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]";
                }

                return (
                    <div 
                        key={card.instanceId} 
                        className="flex flex-col gap-1 relative w-full h-full min-h-0 min-w-0 overflow-hidden"
                    >
                        {/* 
                           IMAGE AREA (UPDATED): 
                           - flex-1: Takes available vertical space
                           - h-full: Reinforces vertical height context
                           - overflow-hidden: Crucial for ensuring image doesn't push bounds
                           - flex/justify-center: Centers the image
                           - p-4: Adds padding so image doesn't touch edges
                        */}
                        <div className="flex-1 h-full w-full min-h-0 relative flex items-center justify-center p-4 overflow-hidden">
                             
                             {/* 
                                WRAPPER (UPDATED):
                                - relative flex justify-center items-center: Centers the child image
                                - max-w-full max-h-full: STRICTLY limits growth
                             */}
                             <div className="relative flex justify-center items-center max-w-full max-h-full">
                                <img 
                                    src={imgSrc} 
                                    alt="Subject" 
                                    style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
                                    className={`block object-contain rounded-2xl transition-all duration-700 ${cardStyleClass} ${isRevealed ? 'scale-105' : 'filter sepia-[0.3]'}`}
                                />

                                 {/* OVERLAYS */}
                                 {isRevealed && (
                                    <div className="absolute inset-0 flex items-end justify-center pb-4 bg-linear-to-t from-black/80 via-transparent to-transparent pointer-events-none rounded-2xl">
                                        <span className={`text-xl md:text-3xl font-black tracking-tighter uppercase drop-shadow-md ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                            {isCorrect ? 'CORRECT' : 'INCORRECT'}
                                        </span>
                                    </div>
                                 )}

                                 {/* Selection Indicator */}
                                 {!isRevealed && card.guess && (
                                    <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur text-[10px] font-bold uppercase tracking-wider border border-white/10 z-10">
                                        {card.guess === 'good' ? <span className="text-green-400">ANGELIC</span> : <span className="text-red-400">EVIL</span>}
                                    </div>
                                 )}
                             </div>
                        </div>

                        {/* CONTROLS */}
                        {!isRevealed && (
                             <div className="grid grid-cols-2 gap-2 h-10 md:h-12 w-full shrink-0">
                                <button 
                                    onClick={() => handleGuess(index, 'good')}
                                    className={`rounded-lg border flex flex-col items-center justify-center transition-all ${
                                        card.guess === 'good' 
                                        ? 'bg-green-900/40 border-green-500 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                                        : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:border-green-800 hover:text-green-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-1">
                                        <Heart size={14} className={card.guess === 'good' ? 'fill-current' : ''} />
                                        <span className="text-[10px] uppercase font-bold tracking-widest hidden md:inline">Good</span>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => handleGuess(index, 'evil')}
                                    className={`rounded-lg border flex flex-col items-center justify-center transition-all ${
                                        card.guess === 'evil' 
                                        ? 'bg-red-900/40 border-red-500 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                                        : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:border-red-800 hover:text-red-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-1">
                                        <Skull size={14} className={card.guess === 'evil' ? 'fill-current' : ''} />
                                        <span className="text-[10px] uppercase font-bold tracking-widest hidden md:inline">Evil</span>
                                    </div>
                                </button>
                             </div>
                        )}
                    </div>
                );
            })}
         </div>
      </main>

      {/* FOOTER - Fixed Height */}
      <footer className="relative z-30 border-t border-purple-900/30 bg-slate-950/90 backdrop-blur shrink-0 h-16 flex items-center justify-center px-4">
         {gameState === 'INPUT' ? (
             <button 
                onClick={submitRound}
                disabled={cards.some(c => c.guess === null)}
                className="w-full max-w-md py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2 text-xs md:text-sm"
            >
                <Target size={16} /> Manifest Outcome
             </button>
         ) : (
            <button 
                onClick={handleContinue}
                className="w-full max-w-md py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold rounded-lg transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2 text-xs md:text-sm"
            >
                {cards.every(c => c.guess === c.target) ? 'Ascend Level' : 'Restart Cycle'} <ArrowRight size={16} />
            </button>
         )}
      </footer>

      {/* SETTINGS DRAWER */}
      {showSettings && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
            <div 
                className="absolute right-0 top-16 bottom-0 w-80 bg-slate-900 border-l border-purple-500/20 shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-serif text-xl text-purple-100">Configuration</h3>
                    <button onClick={() => setShowSettings(false)}><X className="text-slate-500 hover:text-white" /></button>
                </div>

                <div className="space-y-8">
                    <div className="text-sm text-slate-400 font-mono">
                        Current Session:
                        <br/>
                        Level: {level}
                        <br/>
                        Accuracy: {stats.trials > 0 ? ((stats.hits/stats.trials)*100).toFixed(0) : 0}%
                    </div>

                    <div className="pt-4 border-t border-slate-800 space-y-3">
                        <button onClick={handleReset} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center justify-center gap-2 text-xs font-bold tracking-widest">
                            <RotateCcw size={14} /> REBOOT SYSTEM
                        </button>
                        
                        <button 
                            onClick={handleSaveResults} 
                            disabled={saving}
                            className="w-full py-3 bg-purple-900/30 hover:bg-purple-800/50 border border-purple-500/50 text-purple-100 rounded flex items-center justify-center gap-2 text-xs font-bold tracking-widest"
                        >
                            {saving ? <Sparkles className="animate-spin" size={14} /> : <Save size={14} />}
                            {saving ? "ARCHIVING..." : "SAVE LOGS"}
                        </button>
                        {saveMessage && <p className="text-center text-xs text-purple-500 font-mono animate-pulse">{saveMessage}</p>}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}