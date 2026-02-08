/** --- START OF FILE page.tsx --- **/
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Target, Settings, RotateCcw, 
  Activity, X, Info, Volume2, VolumeX, Sparkles, Save,
  Heart, Skull, ArrowRight, Lock, ChevronsUp
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import { useHaptics } from '@/hooks/useHaptics';

import PsychicStatsModal from '../components/PsychicStatsModal';
import { calculateZScore } from '../utils/psychicStats';

/**
 * --- ASSET CONFIGURATION ---
 */
const BASE_PATH = "/images/friend-or-foe-app";

const CHARACTER_KEYS = [
  "abuela", "alt_guy", "barista_girl", "church_lady", 
  "construction_man", "corp_woman", "dad_guy", "doctor_woman", 
  "genz_teen", "hijabi_student", "island_man", "jazz_man", 
  "native_man", "office_guy", "retail_woman", "senior_asian_man", 
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
 * Local logic removed in favor of shared utilities
 */

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
                  <span className="text-slate-200 font-bold">THE CHOICE:</span> Decide if they are <span className="text-blue-400">GOOD (Angelic)</span> or <span className="text-red-400">EVIL (Demonic)</span>.
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

// Local PsiStats removed in favor of PsychicStatsModal

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
  const [history, setHistory] = useState<any[]>([]); // New History Tracking

  const matrixData = React.useMemo(() => {
      const tp = history.filter(h => h.actual === 'good' && h.guess === 'good').length;
      const tn = history.filter(h => h.actual === 'evil' && h.guess === 'evil').length;
      const fp = history.filter(h => h.actual === 'evil' && h.guess === 'good').length;
      const fn = history.filter(h => h.actual === 'good' && h.guess === 'evil').length;
      
      const sensitivity = (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 0;
      const specificity = (tn + fp) > 0 ? (tn / (tn + fp)) * 100 : 0;
      const accuracy = history.length > 0 ? ((tp + tn) / history.length) * 100 : 0;

      // Calculate Max Streak
      let maxStreak = 0;
      let currentStreak = 0;
      history.forEach(h => {
          if (h.correct) {
              currentStreak++;
              if (currentStreak > maxStreak) maxStreak = currentStreak;
          } else {
              currentStreak = 0;
          }
      });

      return {
          labels: ['ANGELIC', 'DEMONIC'] as [string, string],
          tp, tn, fp, fn,
          radarData: [
              { id: 'sense', label: 'Angelic Sense', value: sensitivity, color: '#facc15' },
              { id: 'spec', label: 'Demonic Alert', value: specificity, color: '#22d3ee' },
              { id: 'acc', label: 'Combined', value: accuracy, color: '#a78bfa' }
          ],
          maxStreak
      };
  }, [history]);

  const audio = useAudioEngine();
  const haptics = useHaptics();

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
      
      haptics.triggerMedium(); // SELECTION HAPTIC
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

    // Update History for Matrix
    const newHistoryItems = cards.map(c => ({
        actual: c.target,
        guess: c.guess,
        correct: c.target === c.guess,
        timestamp: Date.now()
    }));
    setHistory(prev => [...prev, ...newHistoryItems]);

    // Feedback
    audio.playReveal(allCorrect);
    
    if (allCorrect) {
        haptics.triggerHeavy(); // SUCCESS
    } else {
        haptics.triggerLight(); // FAIL
    }
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
    setSaveMessage("Attuning to Cloud..."); // VISUAL POLISH
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSaveMessage("AUTH REQUIRED");
        setTimeout(() => setSaveMessage(null), 3000);
        setSaving(false);
        return;
      }
      
      // Manual Save Check (Subscription)
      const { data: profile } = await supabase.from('profiles').select('is_subscribed').eq('id', user.id).single();
      if (!profile?.is_subscribed) {
          setSaveMessage("ADEPT ACCESS REQUIRED");
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

      {/* Glitter Effect Style */}
      <style jsx>{`
        .magickal-glitter {
            background-image: 
                radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px),
                radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px),
                radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 3px);
            background-size: 550px 550px, 350px 350px, 250px 250px;
            background-position: 0 0, 40px 60px, 130px 270px;
        }
      `}</style>

      {showInstructions && <InstructionModal onClose={() => { setShowInstructions(false); startRound(1); }} />}

      {/* HEADER - Consistent Flex Layout */}
      <header className="relative z-20 flex justify-between items-center px-4 py-[3px] border-b border-purple-900/30 backdrop-blur-sm bg-slate-950/60 shrink-0 min-h-[54px]">
        
        {/* Left: Back Link */}
        <div className="flex items-center gap-4 relative z-10 pointer-events-auto shrink-0">
            <div className="md:hidden">
                <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="" className="text-xs text-slate-500 hover:text-purple-400" />
            </div>
            <div className="hidden md:block">
                <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit" className="text-xs text-slate-500 hover:text-purple-400" />
            </div>
        </div>

        {/* Center: Title (Desktop Only) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-3 pointer-events-none z-0">
             <div className="w-8 h-8 rounded bg-purple-950 border border-purple-800 flex items-center justify-center">
                <Heart size={16} className="text-purple-400" />
            </div>
            <span className="font-serif tracking-widest text-lg font-bold text-slate-200">
                FRIEND OR FOE
            </span>
        </div>

        {/* Right: Modal + Buttons */}
        <div className="flex items-center gap-1 md:gap-2 z-10 pointer-events-auto flex-1 justify-end min-w-0">
            <PsychicStatsModal 
                  hits={stats.hits} 
                  trials={stats.trials} 
                  chance={0.5} 
                  appName="Friend or Foe"
                  matrixData={matrixData}
                  radarData={matrixData.radarData}
                  maxStreak={matrixData.maxStreak}
                  className="static transform-none z-30 w-full max-w-[230px] md:w-64 md:max-w-none shrink"
            />
            
           <button onClick={() => setShowInstructions(true)} className="hidden md:block p-2 hover:bg-slate-800 rounded transition-colors text-slate-500 shrink-0">
             <Info size={20} />
           </button>
           <button onClick={toggleSound} className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-500 shrink-0">
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded transition-colors ${showSettings ? 'bg-purple-900/50 text-purple-200' : 'hover:bg-slate-800 text-slate-500 shrink-0'}`}>
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* HUD - Fixed Height */}
      <div className="shrink-0 w-full flex items-center justify-between px-4 py-[3px] relative z-20 h-14">
          <div className="flex flex-col justify-center">
            <span className="text-[9px] uppercase tracking-widest text-slate-500">Status</span>
            <div className="text-sm font-mono tracking-wider text-slate-300">
                LEVEL <span className="text-purple-400 font-bold text-lg">{level}</span>
            </div>
          </div>

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
                    // Selected but not revealed - BLUE FOR SELECTED "ANGELIC"
                    if (card.guess === 'good') {
                         cardStyleClass = "border-2 border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.4)]";
                    } else {
                         cardStyleClass = "border-2 border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.4)]";
                    }
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
                        <div className="flex-1 w-full min-h-0 relative p-4 overflow-hidden">
                             
                             {/* 
                                WRAPPER (UPDATED):
                                - Absolute inset-0: Fills the parent container exactly.
                                - Flex center: Centers content.
                                - Pointer-events-none on wrapper to pass clicks if needed, but wrapper is layout only.
                             */}
                             <div className="absolute inset-4 flex items-center justify-center">
                                <img 
                                    src={imgSrc} 
                                    alt="Subject" 
                                    className={`
                                      max-w-full max-h-full w-auto h-auto object-contain 
                                      rounded-2xl transition-all duration-700 
                                      ${cardStyleClass} ${isRevealed ? 'scale-105' : 'filter sepia-[0.3]'}
                                    `}
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
                                        {card.guess === 'good' ? <span className="text-blue-400">ANGELIC</span> : <span className="text-red-400">EVIL</span>}
                                    </div>
                                 )}
                             </div>
                        </div>

                        {/* CONTROLS */}
                        {!isRevealed && (
                             <div className="grid grid-cols-2 gap-2 h-12 w-full shrink-0">
                                <button 
                                    onClick={() => handleGuess(index, 'good')}
                                    className={`rounded-lg border flex flex-row items-center justify-center gap-2 transition-all magickal-glitter ${
                                        card.guess === 'good' 
                                        ? 'bg-blue-900/60 border-blue-500 text-blue-200 shadow-[0_0_10px_rgba(96,165,250,0.2)]' 
                                        : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:border-blue-800 hover:text-blue-400'
                                    }`}
                                >
                                    <Heart size={16} className={card.guess === 'good' ? 'fill-current' : ''} />
                                    <span className="text-[10px] md:text-xs uppercase font-bold tracking-widest">Good</span>
                                </button>
                                <button 
                                    onClick={() => handleGuess(index, 'evil')}
                                    className={`rounded-lg border flex flex-row items-center justify-center gap-2 transition-all magickal-glitter ${
                                        card.guess === 'evil' 
                                        ? 'bg-red-900/60 border-red-500 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                                        : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:border-red-800 hover:text-red-400'
                                    }`}
                                >
                                    <Skull size={16} className={card.guess === 'evil' ? 'fill-current' : ''} />
                                    <span className="text-[10px] md:text-xs uppercase font-bold tracking-widest">Evil</span>
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
                className="w-full max-w-md py-3 bg-[#0f0c29] border border-amber-500/50 hover:bg-[#1a1640] disabled:opacity-50 disabled:cursor-not-allowed text-amber-300 font-bold rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2 text-xs md:text-sm magickal-glitter"
            >
                <Target size={16} /> Commit Decision
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