"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Target, Shield, Crosshair, Zap, Settings, Play, RotateCcw, 
  Activity, Eye, Brain, Lock, X, Info, Volume2, VolumeX, Sparkles, Save,
  Maximize, Minimize
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import MagickalBackLink from '@/app/components/MagickalBackLink';

/**
 * --- PSI MATH ENGINE (Standardized) ---
 */
const calculatePsiScore = (hits: number, trials: number, chance: number) => {
  if (trials === 0) return 0;
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
      // 40Hz Gamma/Theta mix for focus
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime); 
      
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(10, ctx.currentTime); 
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(100, ctx.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      
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

  const playHover = () => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  const playHit = () => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;
    // High tech confirm sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  };

  const playMiss = () => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;
    // Low error sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  };

  return { init, playTheta, playHover, playHit, playMiss };
};

/**
 * --- SECURE RNG ---
 */
const secureRandom = (max: number) => {
  const win = (globalThis as any).window;
  if (win && win.crypto) {
      const array = new Uint32Array(1);
      win.crypto.getRandomValues(array);
      return array[0] % max;
  }
  return Math.floor(Math.random() * max);
};

/**
 * --- COMPONENTS ---
 */

const InstructionModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full border border-cyan-500/30 bg-[#0f172a] p-8 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] text-center relative">
          <h2 className="text-3xl font-black text-cyan-400 mb-2 tracking-tighter font-serif">PSI-HUNTER</h2>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-[0.2em] mb-6">Intuition Defense System v2.0</p>
          
          <div className="text-left space-y-4 mb-8 bg-black/40 p-4 rounded border border-white/5 text-sm text-slate-300 font-mono">
              <p className="leading-relaxed">
                  <span className="text-red-400 font-bold">MISSION:</span> Identify the hidden target hidden among decoys.
              </p>
              <p className="leading-relaxed">
                  <span className="text-yellow-400 font-bold">INTEL:</span> Visuals are abstract. Logic is useless. The target is randomized securely.
              </p>
              <p className="leading-relaxed">
                  <span className="text-cyan-400 font-bold">PROTOCOL:</span> Use remote viewing. Feel the "heat" or "weight" of the correct sector.
              </p>
          </div>
          
          <button 
              onClick={onClose}
              className="w-full py-3 bg-cyan-900/50 hover:bg-cyan-800/80 border border-cyan-500/50 text-cyan-100 font-mono font-bold tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
              Initialize System
          </button>
      </div>
    </div>
);

const PsiStats = ({ stats, difficulty, onClose }: { stats: any, difficulty: number, onClose?: () => void }) => {
    const [supabase] = useState(() => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ));
    const [showModal, setShowModal] = useState(false);
    const [lifetimeStats, setLifetimeStats] = useState({ hits: 0, trials: 0 });
    const [loadingLifetime, setLoadingLifetime] = useState(false);
    
    // Calculate Current Session Stats
    const sessionTrials = stats.trials;
    const sessionHits = stats.hits;
    const chance = 1 / difficulty;
    
    const sessionAccuracy = sessionTrials > 0 ? (sessionHits / sessionTrials) * 100 : 0;
    const sessionZ = calculatePsiScore(sessionHits, sessionTrials, chance);
    const sessionProb = calculateProbability(sessionZ);
    const sessionTier = getPsiTier(sessionZ);
  
    useEffect(() => {
      if (showModal) {
        const fetchHistory = async () => {
          setLoadingLifetime(true);
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
              setLoadingLifetime(false);
              return;
          }
  
          const { data, error } = await supabase
              .from('reports')
              .select('chart_data')
              .eq('user_id', user.id)
              .eq('category', 'training') 
              .eq('name', 'Psi Hunter');
  
          if (!error && data) {
              let h = 0; 
              let t = 0;
              data.forEach((row: any) => {
                  const chart = row.chart_data;
                  if (chart) {
                     h += chart.hits || 0;
                     t += chart.trials || 0;
                  }
              });
              setLifetimeStats({ hits: h + sessionHits, trials: t + sessionTrials });
          }
          setLoadingLifetime(false);
        };
        fetchHistory();
      }
    }, [showModal, sessionHits, sessionTrials, supabase]);
  
    const lifeAccuracy = lifetimeStats.trials > 0 ? (lifetimeStats.hits / lifetimeStats.trials) * 100 : 0;
    const lifeZ = calculatePsiScore(lifetimeStats.hits, lifetimeStats.trials, chance);
    const lifeProb = calculateProbability(lifeZ);
    const lifeTier = getPsiTier(lifeZ);
  
    return (
      <>
        <div 
          onClick={() => setShowModal(true)}
          className="
              cursor-pointer group
              flex flex-col items-end justify-center
              bg-cyan-950/30 hover:bg-cyan-900/50 border border-cyan-500/20 hover:border-cyan-500/50
              rounded-lg px-3 py-1 transition-all duration-300
              min-w-20 h-[50px]
          "
        >
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-600 group-hover:text-cyan-400 transition-colors">N: {sessionTrials}</span>
              <div className="w-px h-3 bg-cyan-500/20"></div>
              <span className="text-xl font-mono font-bold text-slate-200 group-hover:text-white transition-colors">
                  {sessionAccuracy.toFixed(0)}%
              </span>
            </div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest group-hover:text-cyan-300 transition-colors">
              Z: {sessionZ.toFixed(2)}
            </div>
        </div>
  
        {showModal && (
          <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300"
              onClick={() => setShowModal(false)}
          >
            <div 
              className="max-w-3xl w-full bg-slate-900 border border-cyan-500/20 rounded-xl p-6 relative max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(8,145,178,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X /></button>
              <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-2">
                <Activity className="text-cyan-400" /> Performance Analysis
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* CURRENT */}
                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-4 text-center">Current Session</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Hits / Trials</span> <span className="text-white">{sessionHits} / {sessionTrials}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Accuracy</span> <span className="text-white">{sessionAccuracy.toFixed(1)}%</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Psi Score (Z)</span> <span className={sessionZ >= 0 ? "text-amber-300" : "text-slate-400"}>{sessionZ.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Probability</span> <span className="text-green-300">{sessionProb}</span></div>
                    <div className="mt-2 text-center text-xs font-bold uppercase tracking-widest text-white">{sessionTier.name}</div>
                  </div>
                </div>
  
                {/* LIFETIME */}
                <div className="bg-black/20 rounded-lg p-4 border border-white/5 relative">
                   <h3 className="text-xs uppercase tracking-[0.2em] text-amber-300 mb-4 text-center">Lifetime Record</h3>
                   {loadingLifetime ? (
                      <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="animate-spin text-cyan-500"/></div>
                   ) : (
                      <div className="space-y-2 text-sm font-mono">
                          <div className="flex justify-between border-b border-white/5 pb-1"><span>Hits / Trials</span> <span className="text-white">{lifetimeStats.hits} / {lifetimeStats.trials}</span></div>
                          <div className="flex justify-between border-b border-white/5 pb-1"><span>Accuracy</span> <span className="text-white">{lifeAccuracy.toFixed(1)}%</span></div>
                          <div className="flex justify-between border-b border-white/5 pb-1"><span>Psi Score (Z)</span> <span className={lifeZ >= 0 ? "text-amber-300" : "text-slate-400"}>{lifeZ.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Probability</span> <span className="text-green-300">{lifeProb}</span></div>
                          <div className="mt-2 text-center text-xs font-bold uppercase tracking-widest text-white">{lifeTier.name}</div>
                      </div>
                   )}
                </div>
              </div>
  
              {/* Definitions Legend - FULLY SYNCED */}
              <div className="grid md:grid-cols-2 gap-8 border-t border-white/10 pt-6">
                <div>
                    <h4 className="text-xs uppercase tracking-widest text-amber-400 mb-3 pb-2">Psi-Hitting (Positive)</h4>
                    <div className="space-y-3 text-xs">
                        <div><strong className="text-amber-200 block">The Oracle (Z &ge; 4.0)</strong><span className="text-slate-400">World Class Anomaly (1 in 31,000+).</span></div>
                        <div><strong className="text-purple-300 block">The Medium (Z &ge; 3.0)</strong><span className="text-slate-400">Highly Significant (1 in 740).</span></div>
                        <div><strong className="text-pink-300 block">The Clairvoyant (Z &ge; 1.96)</strong><span className="text-slate-400">Statistically Significant (p &lt; 0.05).</span></div>
                        <div><strong className="text-indigo-300 block">The Channel (Z &ge; 1.65)</strong><span className="text-slate-400">Tapping into something real (1 in 20).</span></div>
                        <div><strong className="text-cyan-300 block">The Adept (Z &ge; 1.0)</strong><span className="text-slate-400">Finding flow. Beating odds of 1 in 6.</span></div>
                        <div><strong className="text-teal-300 block">The Spark (Z &ge; 0.5)</strong><span className="text-slate-400">Pulse of intuition. Nudging past average.</span></div>
                        <div><strong className="text-slate-200 block">The Initiate (Z &ge; 0.0)</strong><span className="text-slate-500">Above baseline. Better than random.</span></div>
                    </div>
                </div>
                <div>
                    <h4 className="text-xs uppercase tracking-widest text-blue-400 mb-3 pb-2">Psi-Missing (Negative)</h4>
                    <div className="space-y-3 text-xs">
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
 * --- MAIN APP ---
 */
export default function PsiHunterApp() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [difficulty, setDifficulty] = useState(4); 
  const [visualMode, setVisualMode] = useState('ABSTRACT'); 
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [isDesktop, setIsDesktop] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    trials: 0,
    hits: 0,
    history: [] as { trial: number, zScore: number }[]
  });

  // Game Logic
  const [grid, setGrid] = useState<any[]>([]); 
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'ACTIVE' | 'REVEALED'>('IDLE');

  const audio = useAudioEngine();

  useEffect(() => {
    audio.init();
    const checkLayout = () => setIsDesktop(window.innerWidth >= 768);
    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, []);

  // Update audio background when state changes
  useEffect(() => {
    if (soundEnabled) {
       audio.playTheta(true);
    } else {
       audio.playTheta(false);
    }
  }, [soundEnabled]);

  const toggleSound = () => setSoundEnabled(!soundEnabled);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen(); 
    }
  };

  const startNewRound = useCallback(() => {
    const newTargetIndex = secureRandom(difficulty);
    setTargetIndex(newTargetIndex);

    const newGrid = Array.from({ length: difficulty }, (_, i) => ({
      id: i,
      seed: Math.random().toString(36).substring(7), 
      isTarget: i === newTargetIndex 
    }));

    setGrid(newGrid);
    setRevealed(false);
    setSelectedIndex(null);
    setGameState('ACTIVE');
  }, [difficulty]);

  // Reactive Update: Reset round if difficulty changes
  useEffect(() => {
    startNewRound();
  }, [difficulty, startNewRound]);

  // Handle grid clicks
  const handleSelection = (index: number) => {
    if (gameState !== 'ACTIVE') return;

    setSelectedIndex(index);
    setRevealed(true);
    setGameState('REVEALED');

    const isHit = index === targetIndex;
    
    if (isHit) {
      audio.playHit();
    } else {
      audio.playMiss();
    }

    setStats((prev) => {
      const newHits = isHit ? prev.hits + 1 : prev.hits;
      const newTrials = prev.trials + 1;
      const chance = 1 / difficulty;
      const z = calculatePsiScore(newHits, newTrials, chance);
      
      return {
        hits: newHits,
        trials: newTrials,
        history: [...prev.history, { trial: newTrials, zScore: z }]
      };
    });
  };

  const handleResetSimulation = () => {
    setStats({ trials: 0, hits: 0, history: [] });
    setGrid([]);
    setGameState('IDLE');
    setShowSettings(false);
    startNewRound();
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
          name: 'Psi Hunter',
          category: 'training', 
          chart_data: stats, 
          report_content: `Session completed. Trials: ${stats.trials}. Hits: ${stats.hits}. Protocol: ${visualMode}. Complexity: ${difficulty}.`,
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

  // --- LAYOUT LOGIC FOR FIT-TO-SCREEN ---
  const getGridConfig = () => {
    // Desktop Logic
    if (isDesktop) {
        if (difficulty === 2) return { cols: 2, rows: 1 };
        if (difficulty === 4) return { cols: 2, rows: 2 };
        if (difficulty === 8) return { cols: 4, rows: 2 }; 
        return { cols: 4, rows: 2 };
    } 
    // Mobile Logic
    else {
        if (difficulty === 2) return { cols: 2, rows: 1 };
        if (difficulty === 4) return { cols: 2, rows: 2 };
        // FIXED: 2 columns x 4 rows for 8 items. Fits phone screens much better.
        if (difficulty === 8) return { cols: 2, rows: 4 }; 
        return { cols: 2, rows: 4 };
    }
  };

  const { cols, rows } = getGridConfig();
  // Aspect ratio is cols / rows.
  const gridAspectRatio = `${cols} / ${rows}`;

  // --- RENDER HELPERS ---
  const renderAvatar = (item: any, index: number) => {
    let content = null;
    let borderColor = "border-slate-800";
    let bgColor = "bg-slate-900";
    let opacity = "opacity-100";
    
    // Abstract shapes map based on seed
    const shapes = [<Activity key="1" />, <Lock key="2" />, <Shield key="3" />, <Target key="4" />, <Zap key="5" />, <Brain key="6" />, <Eye key="7" />, <Crosshair key="8" />];
    
    if (revealed) {
        if (item.id === targetIndex) {
            borderColor = "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]";
            bgColor = "bg-green-900/20";
        } else if (index === selectedIndex) {
            borderColor = "border-red-500";
            bgColor = "bg-red-900/20";
            opacity = "opacity-50 grayscale";
        } else {
            opacity = "opacity-20 grayscale";
        }
    } else {
        borderColor = "hover:border-cyan-400/50 hover:bg-slate-800 border-slate-700";
    }

    if (visualMode === 'ABSTRACT') {
        const shapeIndex = item.seed.charCodeAt(0) % shapes.length;
        content = (
            // INCREASED ICON SIZE: w-[70%] h-[70%] (was w-1/2 h-1/2)
            <div className={`w-[70%] h-[70%] flex items-center justify-center ${revealed && item.id === targetIndex ? 'text-green-400' : 'text-slate-600'}`}>
               {React.cloneElement(shapes[shapeIndex], { size: '100%', strokeWidth: 1.5 })}
            </div>
        );
    } else if (visualMode === 'SILHOUETTES') {
        content = (
            <svg viewBox="0 0 24 24" fill="currentColor" className={`w-[70%] h-[70%] ${revealed && item.id === targetIndex ? 'text-green-500' : 'text-slate-800 drop-shadow-lg'}`}>
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
        );
    } else if (visualMode === 'FACES') {
        content = (
            <img 
              src={`https://robohash.org/${item.seed}?set=set1&size=150x150`} 
              alt="Subject"
              className={`w-full h-full object-cover opacity-80 ${revealed ? '' : 'sepia contrast-125'}`}
              draggable="false"
            />
        );
    }

    return (
        <div 
            key={item.id}
            onClick={() => handleSelection(index)}
            onMouseEnter={() => { if(gameState === 'ACTIVE') audio.playHover(); }}
            className={`
                relative w-full h-full rounded-xl border-2 overflow-hidden flex items-center justify-center cursor-crosshair
                transition-all duration-300
                ${borderColor} ${bgColor} ${opacity}
            `}
        >
            {content}
            {revealed && item.id === targetIndex && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                 <span className="text-green-500 font-mono font-bold text-[10px] md:text-xs tracking-widest uppercase animate-pulse border border-green-500/50 px-2 py-1 rounded bg-black/80">
                   Subject Confirmed
                 </span>
               </div>
            )}
            {revealed && index === selectedIndex && item.id !== targetIndex && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                 <span className="text-red-500 font-mono font-bold text-[10px] md:text-xs tracking-widest uppercase border border-red-500/50 px-2 py-1 rounded bg-black/80">
                   Civilian
                 </span>
               </div>
            )}
        </div>
    );
  };

  return (
    <div className="relative h-dvh w-full bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 flex flex-col overflow-hidden">
      
      {/* Background with Grid Overlay */}
      <div className="absolute inset-0 bg-[#020617] z-0" style={{ backgroundImage: 'linear-gradient(#083344 1px, transparent 1px), linear-gradient(90deg, #083344 1px, transparent 1px)', backgroundSize: '50px 50px', opacity: 0.1 }}></div>
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950 z-0 opacity-80"></div>

      {showInstructions && <InstructionModal onClose={() => { setShowInstructions(false); startNewRound(); }} />}

      {/* HEADER */}
      <header className="relative z-20 flex justify-between items-center px-4 py-3 border-b border-cyan-900/30 backdrop-blur-sm bg-slate-950/60 shrink-0 h-16">
        <div className="flex items-center gap-4">
            <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit" className="text-xs text-slate-500 hover:text-cyan-400" />
            <div className="w-px h-6 bg-slate-800 hidden md:block"></div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center">
                    <Crosshair size={16} className="text-cyan-400 animate-spin-slow" />
                </div>
                <span className="font-serif tracking-widest text-lg font-bold text-slate-200 hidden md:block">
                    PSI-HUNTER
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
          <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded transition-colors ${showSettings ? 'bg-cyan-900/50 text-cyan-200' : 'hover:bg-slate-800 text-slate-500'}`}>
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* SUB-HEADER / HUD */}
      <div className="shrink-0 w-full flex items-center justify-between px-4 py-2 relative z-20 min-h-[60px]">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-slate-500">System Status</span>
            <div className={`text-sm font-mono tracking-wider ${gameState === 'ACTIVE' ? 'text-green-400 animate-pulse' : 'text-slate-400'}`}>
                {gameState === 'ACTIVE' ? 'SCANNING...' : gameState === 'IDLE' ? 'STANDBY' : 'ANALYZING'}
            </div>
          </div>

          <div className="ml-auto">
              <PsiStats stats={stats} difficulty={difficulty} />
          </div>
      </div>

      {/* MAIN GAME GRID */}
      {/* Reduced padding to maximize card size */}
      <main className="flex-1 w-full min-h-0 flex items-center justify-center relative z-10 overflow-hidden p-2 md:p-8">
         {grid.length > 0 ? (
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
                {grid.map((item, idx) => renderAvatar(item, idx))}
            </div>
         ) : (
             <div className="flex flex-col items-center justify-center border border-dashed border-slate-700 rounded-lg p-12 text-slate-600 bg-slate-900/30">
                <Crosshair size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-mono uppercase tracking-widest">Awaiting Neural Input</p>
                <button 
                    onClick={startNewRound}
                    className="mt-6 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all"
                >
                    INITIALIZE GRID
                </button>
             </div>
         )}
      </main>

      {/* FOOTER ACTION BAR */}
      <footer className="relative z-20 border-t border-cyan-900/30 bg-slate-950/80 backdrop-blur shrink-0 h-14 flex items-center justify-between px-6">
         {gameState === 'REVEALED' ? (
             <button onClick={startNewRound} className="flex items-center gap-2 text-cyan-400 hover:text-white font-mono text-xs uppercase tracking-widest group">
                <Play size={16} className="group-hover:fill-current" /> Next Subject
             </button>
         ) : (
             <div className="text-[10px] text-slate-600 font-mono">PROTOCOL: {visualMode} // DIFF: {difficulty}</div>
         )}

         <button onClick={toggleFullScreen} className="text-slate-500 hover:text-white">
            {typeof document !== 'undefined' && document.fullscreenElement ? <Minimize size={18}/> : <Maximize size={18}/>}
         </button>
      </footer>

      {/* SETTINGS DRAWER */}
      {showSettings && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
            <div 
                className="absolute right-0 top-16 bottom-0 w-80 bg-slate-900 border-l border-cyan-500/20 shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-serif text-xl text-cyan-100">Configuration</h3>
                    <button onClick={() => setShowSettings(false)}><X className="text-slate-500 hover:text-white" /></button>
                </div>

                <div className="space-y-8">
                    {/* Difficulty */}
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-3">Crowd Density</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[2, 4, 8].map(n => (
                                <button 
                                    key={n} 
                                    onClick={() => setDifficulty(n)} 
                                    className={`p-2 rounded border text-xs font-bold font-mono transition-all ${difficulty === n ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                                >
                                    {n} SUBJ
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Visual Mode */}
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-3">Optical Feed</label>
                        <div className="grid grid-cols-1 gap-2">
                        {[
                            { id: 'ABSTRACT', label: 'ABSTRACT', desc: 'Geometric Shapes' },
                            { id: 'SILHOUETTES', label: 'SILHOUETTE', desc: 'Shadow Forms' },
                            { id: 'FACES', label: 'SYNTHETIC', desc: 'AI Generated Faces' },
                        ].map(mode => (
                            <button key={mode.id} onClick={() => setVisualMode(mode.id)} className={`p-3 rounded border text-left flex justify-between items-center transition-all ${visualMode === mode.id ? 'bg-cyan-900/50 border-cyan-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}>
                                <span className={`text-xs font-bold font-mono ${visualMode === mode.id ? 'text-cyan-400' : 'text-slate-400'}`}>{mode.label}</span>
                                <span className="text-[9px] text-slate-600 uppercase">{mode.desc}</span>
                            </button>
                        ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 space-y-3">
                        <button onClick={handleResetSimulation} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center justify-center gap-2 text-xs font-bold tracking-widest">
                            <RotateCcw size={14} /> REBOOT SYSTEM
                        </button>
                        
                        <button 
                            onClick={handleSaveResults} 
                            disabled={saving}
                            className="w-full py-3 bg-cyan-900/30 hover:bg-cyan-800/50 border border-cyan-500/50 text-cyan-100 rounded flex items-center justify-center gap-2 text-xs font-bold tracking-widest"
                        >
                            {saving ? <Sparkles className="animate-spin" size={14} /> : <Save size={14} />}
                            {saving ? "ARCHIVING..." : "SAVE LOGS"}
                        </button>
                        {saveMessage && <p className="text-center text-xs text-cyan-500 font-mono animate-pulse">{saveMessage}</p>}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>

    </div>
  );
}