"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Activity, Eye, Brain, X, Info, Volume2, VolumeX, 
  Sparkles, Save, RotateCcw, Settings, Flame, Zap,
  RefreshCw, Trophy, Maximize, Minimize, BarChart3, ChevronDown,
  Lock, ChevronsUp
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import { useHaptics } from '@/hooks/useHaptics';
import PsychicStatsModal from '../components/PsychicStatsModal';
import { calculateZScore } from '../utils/psychicStats';

/**
 * --- 1. MATH & HELPERS (GOLD STANDARD) ---
 */

// Local stats logic removed in favor of shared utilities

/**
 * --- 2. SUB-COMPONENTS ---
 */

// Sub-components removed (replaced by shared PsychicStatsModal)

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
      if (AudioContext) ctxRef.current = new AudioContext();
    }
    if (ctxRef.current?.state === 'suspended') ctxRef.current.resume();
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
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
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
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playHit = () => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  };

  const playMiss = () => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  };

  return { init, playTheta, playFlip, playHit, playMiss };
};

/**
 * --- HELPER: Secure RNG ---
 */
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

/**
 * --- VISUAL ASSETS ---
 */
const DevilIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className || "w-full h-full text-red-500 fill-current drop-shadow-lg"}>
    <path d="M20,30 Q10,10 30,20 Q40,5 50,25 Q60,5 70,20 Q90,10 80,30 Q95,40 85,60 Q90,80 70,90 Q50,100 30,90 Q10,80 15,60 Q5,40 20,30 Z M30,45 A5,5 0 0,0 40,45 A5,5 0 0,0 30,45 M60,45 A5,5 0 0,0 70,45 A5,5 0 0,0 60,45 M35,65 Q50,75 65,65" stroke="black" strokeWidth="3" fill="currentColor" />
    <path d="M15,25 Q10,0 35,15" fill="none" stroke="currentColor" strokeWidth="4" />
    <path d="M85,25 Q90,0 65,15" fill="none" stroke="currentColor" strokeWidth="4" />
  </svg>
);

const AngelIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className || "w-full h-full text-yellow-400 fill-current drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"}>
    <circle cx="50" cy="50" r="30" className="text-blue-200" fill="currentColor" />
    <circle cx="50" cy="50" r="25" fill="white" opacity="0.5" />
    <ellipse cx="50" cy="20" rx="20" ry="5" className="text-yellow-400" fill="none" stroke="currentColor" strokeWidth="4" />
    <path d="M10,40 Q30,20 20,60" fill="none" stroke="white" strokeWidth="4" opacity="0.8" />
    <path d="M90,40 Q70,20 80,60" fill="none" stroke="white" strokeWidth="4" opacity="0.8" />
  </svg>
);

const CardBack = () => (
  <div className="w-full h-full bg-slate-800 rounded-xl border-2 border-indigo-500/30 flex items-center justify-center relative overflow-hidden group-hover:border-indigo-400 transition-colors shadow-lg">
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-900"></div>
    <Eye className="w-[40%] h-[40%] text-indigo-500/50" />
    <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
  </div>
);

/**
 * --- MODALS ---
 */

const InstructionModal = ({ onClose, mode }: { onClose: () => void, mode: string }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full border border-indigo-500/30 bg-[#0f172a] p-8 rounded-xl shadow-[0_0_50px_rgba(99,102,241,0.2)] text-center relative">
          <h2 className="text-3xl font-black text-indigo-400 mb-2 tracking-tighter font-serif">PSI-TRAINER</h2>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-[0.2em] mb-6">Intuition Verification Protocol</p>
          <div className="text-left space-y-4 mb-8 bg-black/40 p-4 rounded border border-white/5 text-sm text-slate-300 font-mono">
              <p className="leading-relaxed"><span className="text-amber-400 font-bold">MISSION:</span> Locate the designated target ({mode === 'FIND_DEVIL' ? 'DEVIL' : 'ANGEL'}) hidden among distractors.</p>
              <p className="leading-relaxed"><span className="text-indigo-400 font-bold">CHANCE:</span> 1 in 4 (25%). Beat the odds.</p>
              <p className="leading-relaxed"><span className="text-green-400 font-bold">METHOD:</span> Clear your mind. Sense the card before clicking.</p>
          </div>
          <button onClick={onClose} className="w-full py-3 bg-indigo-900/50 hover:bg-indigo-800/80 border border-indigo-500/50 text-indigo-100 font-mono font-bold tracking-widest uppercase transition-all duration-300">Begin Session</button>
      </div>
    </div>
);

/**
 * --- MAIN APP ---
 */
export default function PsiTrainer() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [gameMode, setGameMode] = useState('FIND_DEVIL'); 
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  // showStatsModal removed as it is handled by the shared component internally
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Updated Stats State to track categories
  const [stats, setStats] = useState({
    trials: 0,
    hits: 0,
    streak: 0,
    bestStreak: 0,
    history: [] as { trial: number, zScore: number }[],
    // Breakdown for Radar Chart
    breakdown: {
        DEVIL: { hits: 0, attempts: 0 },
        ANGEL: { hits: 0, attempts: 0 }
    } as Record<string, { hits: number, attempts: number }>
  });

  // Game Logic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cards, setCards] = useState<any[]>([]);
  const [gameState, setGameState] = useState('WAITING');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [feedback, setFeedback] = useState<any>(null);

  const audio = useAudioEngine();
  const haptics = useHaptics(); // HAPTICS INTEGRATION
  const deckSize = 4; // Standard 1 in 4 chance

  useEffect(() => {
    audio.init();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (soundEnabled) audio.playTheta(true);
    else audio.playTheta(false);
  }, [soundEnabled]);

  const toggleSound = () => setSoundEnabled(!soundEnabled);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen(); 
    }
  };

  const startNewRound = useCallback((mode = gameMode) => {
    const isFindDevil = mode === 'FIND_DEVIL';
    const targetType = isFindDevil ? 'DEVIL' : 'ANGEL';
    const distractorType = isFindDevil ? 'ANGEL' : 'DEVIL';

    const deck = [
      { id: 1, type: targetType, isTarget: true },
      { id: 2, type: distractorType, isTarget: false },
      { id: 3, type: distractorType, isTarget: false },
      { id: 4, type: distractorType, isTarget: false },
    ];

    const shuffled = secureShuffle(deck);
    setCards(shuffled.map(c => ({ ...c, isFlipped: false })));
    setGameState('WAITING');
    setFeedback(null);
  }, [gameMode]);

  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  const handleCardClick = (index: number) => {
    if (gameState === 'REVEALED') return;

    audio.playFlip();
    haptics.triggerMedium(); // HAPTICS: SELECTION

    const selectedCards = [...cards];
    const clickedCard = selectedCards[index];
    const revealedCards = selectedCards.map(c => ({ ...c, isFlipped: true }));
    setCards(revealedCards);
    setGameState('REVEALED');

    const isHit = clickedCard.isTarget;
    // For tracking, we record based on the Game Mode (Target was DEVIL or ANGEL)
    const targetKey = gameMode === 'FIND_DEVIL' ? 'DEVIL' : 'ANGEL';
    
    if (isHit) {
        audio.playHit();
        haptics.triggerHeavy(); // HAPTICS: SUCCESS
        setFeedback({ type: 'success', message: 'INTUITION CONFIRMED' });
    } else {
        audio.playMiss();
        haptics.triggerLight(); // HAPTICS: MISS
        setFeedback({ type: 'error', message: 'TARGET MISSED' });
    }
    
    setStats(prev => {
        const newHits = isHit ? prev.hits + 1 : prev.hits;
        const newTrials = prev.trials + 1;
        const newStreak = isHit ? prev.streak + 1 : 0;
        const chance = 1 / deckSize;
        const z = calculateZScore(newHits, newTrials, chance);
        
        // Update Breakdown
        const newBreakdown = { ...prev.breakdown };
        if (!newBreakdown[targetKey]) newBreakdown[targetKey] = { hits: 0, attempts: 0 };
        newBreakdown[targetKey].attempts += 1;
        if (isHit) newBreakdown[targetKey].hits += 1;

        return {
          hits: newHits,
          trials: newTrials,
          streak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
          history: [...prev.history, { trial: newTrials, zScore: z }],
          breakdown: newBreakdown
        };
    });
  };

  const switchMode = (newMode: string) => {
    if (gameMode !== newMode) {
        setGameMode(newMode);
        startNewRound(newMode);
    }
  };

  const handleResetSimulation = () => {
    setStats({ 
        trials: 0, 
        hits: 0, 
        streak: 0, 
        bestStreak: 0, 
        history: [], 
        breakdown: { DEVIL: { hits: 0, attempts: 0 }, ANGEL: { hits: 0, attempts: 0 } } 
    });
    setGameState('WAITING');
    setShowSettings(false);
    startNewRound();
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

      // Check for subscription before allowing manual save (Monetization Gate)
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
          name: 'Psi Trainer',
          category: 'training', 
          chart_data: stats, 
          report_content: `Session completed. Trials: ${stats.trials}. Hits: ${stats.hits}. Mode: ${gameMode}.`,
        });
      if (error) throw error;
      setSaveMessage("Archiving Energy..."); // VISUAL POLISH
    } catch (e) {
      console.error(e);
      setSaveMessage("UPLOAD FAILED");
    } finally {
      setTimeout(() => setSaveMessage(null), 3000);
      setSaving(false);
    }
  };

  const getAccuracy = () => {
    if (stats.trials === 0) return 0;
    return Math.round((stats.hits / stats.trials) * 100);
  };

  return (
    <div className="h-dvh w-full bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 flex flex-col overflow-hidden relative" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_90%)] z-0 opacity-80 pointer-events-none"></div>

      {showInstructions && <InstructionModal onClose={() => { setShowInstructions(false); startNewRound(); }} mode={gameMode} />}

      {/* HEADER */}
      <header className="shrink-0 z-30 px-3 py-2 md:p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex items-center w-full md:w-auto justify-between">
             <div className="flex items-center gap-2 md:gap-3">
               <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit" className="text-xs text-slate-400 hover:text-white" />
               <div className="h-4 w-px bg-slate-700"></div>
               <Brain className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
               <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">
                 Psi-Trainer
               </h1>
             </div>
             
             <div className="flex md:hidden gap-1 items-center">
               <button onClick={toggleSound} className="p-2 text-slate-400 hover:text-white">{soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
               <button onClick={() => setShowInstructions(true)} className="p-2 text-slate-400 hover:text-white"><Info size={18} /></button>
               <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-slate-400 hover:text-white"><Settings size={18}/></button>
             </div>
        </div>
        
        {/* SHARED STATS MODAL INTEGRATION */}
        <div className="relative z-50">
           <PsychicStatsModal 
              hits={stats.hits} 
              trials={stats.trials} 
              chance={0.25} 
              appName="Psi Trainer"
              radarData={[
                { id: 'DEVIL', label: 'THREAT', value: stats.breakdown?.DEVIL?.total ? stats.breakdown.DEVIL.hits / stats.breakdown.DEVIL.total : 0, color: '#f87171' },
                { id: 'ANGEL', label: 'SAFETY', value: stats.breakdown?.ANGEL?.total ? stats.breakdown.ANGEL.hits / stats.breakdown.ANGEL.total : 0, color: '#60a5fa' },
                // Dummy values to make radar triangle if needed, or just 2 points? Radar needs 3.
                // Psi Trainer only has 2 categories.
                // We'll add a "Flow" and "Focus" metric based on streak?
                { id: 'FLOW', label: 'FLOW', value: Math.min(1, stats.streak / 10), color: '#a78bfa' } 
              ]}
           />
        </div>
            
        <div className="hidden md:flex items-center gap-1 ml-4 pl-4 border-l border-slate-700">
            <button onClick={toggleSound} className="p-2 hover:bg-slate-800 rounded text-slate-400">{soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
            <button onClick={() => setShowInstructions(true)} className="p-2 hover:bg-slate-800 rounded text-slate-400"><Info size={18} /></button>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-slate-800 rounded text-slate-400"><Settings size={18} /></button>
        </div>
      </header>

      {/* MAIN GAME AREA */}
      <main className="flex-1 flex flex-col items-center justify-between p-2 md:p-4 min-h-0 w-full relative z-10">
        
        <div className="text-center w-full shrink-0 min-h-[30px] flex items-center justify-center mb-2">
          <p className="text-slate-300 text-sm md:text-lg animate-in fade-in slide-in-from-top-2 duration-500 key={gameMode}">
            {gameMode === 'FIND_DEVIL' 
              ? "Instinct: Which card feels 'heavy' or dangerous?" 
              : "Instinct: Which card feels 'light' or protective?"}
          </p>
        </div>

        <div className="flex-1 w-full min-h-0">
            <div 
                className="grid gap-2 w-full h-full grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1"
            >
            {cards.map((card, index) => (
                <button
                    key={`${card.id}-${index}`} 
                    onClick={() => handleCardClick(index)}
                    disabled={gameState === 'REVEALED'}
                    className="group relative w-full h-full perspective-1000 focus:outline-none transition-transform active:scale-95"
                >
                    <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${card.isFlipped ? 'rotate-y-180' : ''}`}>
                    
                        <svg viewBox="0 0 200 300" className="block w-full h-full opacity-0 pointer-events-none select-none" preserveAspectRatio="none" aria-hidden="true"><rect width="200" height="300" fill="transparent"/></svg>

                        <div className="absolute inset-0 w-full h-full backface-hidden">
                            <div className="w-full h-full bg-slate-800 rounded-xl border-2 border-indigo-500/30 flex items-center justify-center relative overflow-hidden group-hover:border-indigo-400 transition-colors shadow-lg">
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-900"></div>
                                <Eye className="w-[40%] h-[40%] text-indigo-500/50" />
                                <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        <div className={`
                            absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl border-2 flex flex-col items-center justify-center bg-slate-900 shadow-xl
                            ${card.type === 'DEVIL' ? 'border-red-900/50 bg-linear-to-br from-red-950/30 to-slate-900' : 'border-blue-900/50 bg-linear-to-br from-blue-950/30 to-slate-900'}
                            ${gameState === 'REVEALED' && card.isTarget ? 'ring-2 ring-offset-2 ring-offset-slate-950 ' + (card.type === 'DEVIL' ? 'ring-red-500' : 'ring-yellow-400') : ''}
                        `}>
                            <div className="w-[60%] h-[60%] flex items-center justify-center">
                                {card.type === 'DEVIL' ? <DevilIcon /> : <AngelIcon />}
                            </div>
                            
                            <span className={`absolute bottom-4 text-[10px] md:text-xs font-bold tracking-widest uppercase opacity-60
                                ${card.type === 'DEVIL' ? 'text-red-400' : 'text-blue-200'}
                            `}>
                                {card.type}
                            </span>
                        </div>

                    </div>
                </button>
            ))}
            </div>
        </div>

        <div className="shrink-0 w-full flex flex-col items-center justify-center h-16 md:h-20 gap-2 mt-2">
          {gameState === 'REVEALED' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col items-center gap-2 w-full">
               <div className={`text-lg md:text-xl font-bold flex items-center gap-2 ${feedback?.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {feedback?.type === 'success' ? <Trophy className="w-5 h-5" /> : null}
                  {feedback?.message}
               </div>
               <button 
                onClick={() => startNewRound()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 active:scale-95"
               >
                 <RefreshCw className="w-4 h-4" />
                 Next Trial
               </button>
            </div>
          ) : (
            <div className="text-slate-500 text-xs md:text-sm animate-pulse mt-2">
              Tap a card to lock in your choice...
            </div>
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="shrink-0 relative z-20 border-t border-indigo-900/30 bg-slate-950/80 backdrop-blur h-14 md:h-16 flex items-center justify-center px-4">
         <div className="bg-slate-900 p-1 rounded-full border border-slate-800 flex relative shadow-lg">
            <button 
              onClick={() => switchMode('FIND_DEVIL')}
              className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-sm font-medium transition-all duration-300 ${
                gameMode === 'FIND_DEVIL' 
                ? 'bg-red-900/40 text-red-200 shadow-[0_0_15px_rgba(220,38,38,0.3)] border border-red-500/20' 
                : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Detect Threat (Find Devil)
            </button>
            <button 
              onClick={() => switchMode('FIND_ANGEL')}
              className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-sm font-medium transition-all duration-300 ${
                gameMode === 'FIND_ANGEL' 
                ? 'bg-blue-900/40 text-blue-200 shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-500/20' 
                : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sense Safety (Find Angel)
            </button>
        </div>
         
         <div className="absolute right-4 pl-4 border-l border-slate-800 hidden md:block">
             <button onClick={toggleFullScreen} className="text-slate-500 hover:text-white">
                {typeof document !== 'undefined' && document.fullscreenElement ? <Minimize size={18}/> : <Maximize size={18}/>}
             </button>
         </div>
      </footer>

      {/* SETTINGS DRAWER */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
            <div 
                className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-indigo-500/20 shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-serif text-xl text-indigo-100">Configuration</h3>
                    <button onClick={() => setShowSettings(false)}><X className="text-slate-500 hover:text-white" /></button>
                </div>

                <div className="space-y-8">
                    {/* Mode Selection */}
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-3">Protocol</label>
                        <div className="flex flex-col gap-2">
                             <button 
                                onClick={() => { switchMode('FIND_DEVIL'); setShowSettings(false); }}
                                className={`p-3 rounded border text-left flex items-center gap-3 transition-all ${gameMode === 'FIND_DEVIL' ? 'bg-red-900/30 border-red-500/50' : 'bg-slate-950 border-slate-800'}`}
                             >
                                <div className="p-2 bg-red-900/50 rounded-full"><Flame size={16} className="text-red-400" /></div>
                                <div className="text-xs font-bold text-slate-300">DETECT THREAT</div>
                             </button>
                             <button 
                                onClick={() => { switchMode('FIND_ANGEL'); setShowSettings(false); }}
                                className={`p-3 rounded border text-left flex items-center gap-3 transition-all ${gameMode === 'FIND_ANGEL' ? 'bg-blue-900/30 border-blue-500/50' : 'bg-slate-950 border-slate-800'}`}
                             >
                                <div className="p-2 bg-blue-900/50 rounded-full"><Zap size={16} className="text-blue-400" /></div>
                                <div className="text-xs font-bold text-slate-300">SENSE SAFETY</div>
                             </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 space-y-3">
                        <button onClick={handleResetSimulation} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center justify-center gap-2 text-xs font-bold tracking-widest">
                            <RotateCcw size={14} /> REBOOT SYSTEM
                        </button>
                        
                        {/* MANUAL SAVE BUTTON (GATED) */}
                        <button 
                            onClick={handleSaveResults} 
                            disabled={saving}
                            className="w-full py-3 bg-indigo-900/30 hover:bg-indigo-800/50 border border-indigo-500/50 text-indigo-100 rounded flex items-center justify-center gap-2 text-xs font-bold tracking-widest"
                        >
                            {saving ? <Sparkles className="animate-spin" size={14} /> : <Save size={14} />}
                            {saving ? "ARCHIVING..." : "SAVE LOGS"}
                        </button>
                        {saveMessage && <p className="text-center text-xs text-indigo-500 font-mono animate-pulse">{saveMessage}</p>}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

    </div>
  );
}