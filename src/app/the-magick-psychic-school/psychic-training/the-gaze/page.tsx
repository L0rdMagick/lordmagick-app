"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Eye, EyeOff, Play, RotateCcw, HelpCircle, X, Trophy, 
  Settings, Save, Activity, Sparkles, Volume2, VolumeX, Maximize, Minimize, Trash2,
  ChevronsUp, Maximize2
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import MagickalBackLink from '@/app/components/MagickalBackLink';

// --- DATA ASSETS ---

const IMAGE_BASE_PATH = '/images/the-gaze/';

const RAW_FILES = [
  "asian-man-front-facing.jpg", "asian-man-looking-elsewhere.jpg",
  "asian-woman-front-facing.jpg", "asian-woman-looking-elsewhere.jpg",
  "black-man-front-facing.jpg", "black-man-looking-elsewhere.jpg",
  "black-woman-front-facing.jpg", "black-woman-looking-elsewhere.jpg",
  "eagle-front-facing.jpg", "eagle-looking-elsewhere.jpg",
  "hispanic-man-front-facing.jpg", "hispanic-man-looking-elsewhere.jpg",
  "hispanic-woman-front-facing.jpg", "hispanic-woman-looking-elsewhere.jpg",
  "indian-man-front-facing.jpg", "indian-man-looking-elsewhere.jpg",
  "indian-woman-front-facing.jpg", "indian-woman-looking-elsewhere.jpg",
  "lion-front-facing.jpg", "lion-looking-elsewhere.jpg",
  "middle-eastern-man-front-facing.jpg", "middle-eastern-man-looking-elsewhere.jpg",
  "middle-eastern-woman-front-facing.jpg", "middle-eastern-woman-looking-elsewhere.jpg",
  "owl-front-facing.jpg", "owl-looking-elsewhere.jpg",
  "tiger-front-facing.jpg", "tiger-looking-elsewhere.jpg",
  "white-man-front-facing.jpg", "white-man-looking-elsewhere.jpg",
  "white-woman-front-facing.jpg", "white-woman-looking-elsewhere.jpg",
  "wolf-front-facing.jpg", "wolf-looking-elsewhere.jpg"
];

// Process files into usable objects
const SUBJECTS = RAW_FILES.map(filename => {
  const isStaring = filename.includes('front-facing');
  let category: 'MEN' | 'WOMEN' | 'ANIMALS' = 'ANIMALS';
  
  if (filename.includes('woman')) {
    category = 'WOMEN';
  } else if (filename.includes('man')) {
    category = 'MEN';
  }

  const nameSlug = filename.replace('-front-facing.jpg', '').replace('-looking-elsewhere.jpg', '');
  const name = nameSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    id: filename,
    src: `${IMAGE_BASE_PATH}${filename}`,
    name,
    category,
    isStaring
  };
});

const PHRASES = [
  "Can you feel eyes on you?",
  "Tune into the gaze...",
  "Sense the presence...",
  "Are they looking?",
  "Trust your neck sensation..."
];

const TIMER_DURATION = 5000;

// --- STATS ENGINE ---

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
  if (z >= 4.0) return { name: "The Oracle", color: "text-amber-300 shadow-amber-500/50" };
  if (z >= 3.0) return { name: "The Medium", color: "text-purple-300 shadow-purple-500/50" };
  if (z >= 1.96) return { name: "The Clairvoyant", color: "text-pink-300 shadow-pink-500/50" };
  if (z >= 1.65) return { name: "The Channel", color: "text-indigo-300 shadow-indigo-500/50" };
  if (z >= 1.0) return { name: "The Adept", color: "text-cyan-300 shadow-cyan-500/50" };
  if (z >= 0.5) return { name: "The Spark", color: "text-teal-300 shadow-teal-500/50" };
  if (z >= 0.0) return { name: "The Initiate", color: "text-slate-200" };
  
  if (z <= -4.0) return { name: "The Void", color: "text-slate-500" };
  if (z <= -3.0) return { name: "The Shadow", color: "text-slate-400" };
  if (z <= -2.0) return { name: "The Mirror", color: "text-slate-400" };
  if (z <= -1.0) return { name: "The Blocker", color: "text-slate-400" };
  if (z <= -0.5) return { name: "The Dreamer", color: "text-slate-400" };
  return { name: "The Sleeper", color: "text-slate-300" };
};

// --- AUDIO ENGINE ---

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
      lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(20, ctx.currentTime);
      
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

  const playHover = () => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
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
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  };

  const playMiss = () => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  };

  return { init, playTheta, playHover, playHit, playMiss };
};

// --- COMPONENTS ---

const InstructionModal = ({ onClose }: { onClose: () => void }) => (
  <div 
    className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in duration-300"
    onClick={onClose}
  >
    <div 
      className="bg-gray-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-purple-900/20 relative animate-in zoom-in duration-300"
      onClick={e => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
        <X size={24} />
      </button>
      
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/50">
          <Eye className="text-purple-400" size={32} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-linear-to-r from-purple-200 to-cyan-200 mb-4 font-serif">
        Protocol: Scopaesthesia
      </h2>
      
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>
          <strong className="text-white">The Goal:</strong> Detect if a hidden subject is staring at you using only your psychic sense.
        </p>
        <div>
          <strong className="text-white">The Process:</strong>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400">
            <li>Focus on the <span className="text-cyan-300">Focus Circle</span>.</li>
            <li>A randomly selected subject will be chosen.</li>
            <li>The computer will decide to make them <strong className="text-purple-300">STARE</strong> or <strong className="text-purple-300">LOOK AWAY</strong>.</li>
            <li>When the timer ends, answer: <strong>Are they staring at you?</strong></li>
          </ul>
        </div>
      </div>

      <button 
        onClick={onClose}
        className="w-full mt-8 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-purple-900/50"
      >
        Begin Session
      </button>
    </div>
  </div>
);

const PsiStats = ({ stats, variant = 'floating' }: { stats: any, variant?: 'floating' | 'header' }) => {
    const [supabase] = useState(() => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ));
    const [showModal, setShowModal] = useState(false);
    const [lifetimeStats, setLifetimeStats] = useState({ hits: 0, trials: 0 });
    const [loadingLifetime, setLoadingLifetime] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    // Calculate Current Session Stats
    const sessionTrials = stats.total;
    const sessionHits = stats.hits;
    const chance = 0.5; // Binary choice (1 in 2)
    
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
              .eq('name', 'The Gaze');
  
          if (!error && data) {
              let h = 0; 
              let t = 0;
              data.forEach((row: any) => {
                  const chart = row.chart_data;
                  if (chart) {
                     h += chart.hits || 0;
                     t += chart.total || 0;
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

    const containerClasses = variant === 'header' 
      ? "flex items-center gap-6 px-4 py-1 hover:bg-white/5 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-white/10 group"
      : "cursor-pointer group flex flex-col items-end justify-center bg-slate-800/90 hover:bg-slate-700/90 border border-purple-500/20 hover:border-purple-500/50 rounded-lg px-3 py-1 transition-all duration-300 min-w-20 h-[50px] relative";

    const TriggerContent = () => (
      <>
        {variant === 'header' ? (
           <div className="flex items-center gap-6" title="Click to view full stats">
              <div className="flex items-center gap-3 border-r border-gray-700 pr-4">
                  <span className="text-yellow-400 font-bold flex items-center gap-1"><Trophy size={14} /> {stats.streak}</span>
              </div>
              <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">Accuracy</span>
                  <span className={`text-sm font-bold font-mono ${sessionAccuracy > 50 ? 'text-green-400' : 'text-gray-300'}`}>{sessionAccuracy.toFixed(0)}%</span>
              </div>
              <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">Psi (Z)</span>
                  <span className={`text-sm font-bold font-mono ${sessionZ >= 0 ? 'text-purple-300' : 'text-gray-400'}`}>{sessionZ.toFixed(2)}</span>
              </div>
              {/* Desktop Affordance: Visible Maximize Icon, brightens on hover */}
              <div className="pl-4 border-l border-gray-700/50">
                  <Maximize2 size={16} className="text-gray-500 group-hover:text-white transition-colors" />
              </div>
           </div>
        ) : (
           <>
             {/* Mobile Affordance: Distinct EXPAND label */}
             <div className="absolute -top-3 right-0 bg-purple-900 border border-purple-500 text-[9px] font-bold px-2 py-0.5 rounded text-white tracking-widest shadow-md">
               TAP INFO
             </div>
             <div className="absolute top-1 right-1 text-purple-400 group-hover:text-white">
               <ChevronsUp size={12} />
             </div>
             
             <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-purple-400 group-hover:text-purple-300 transition-colors">N: {sessionTrials}</span>
              <div className="w-px h-3 bg-purple-500/20"></div>
              <span className="text-xl font-mono font-bold text-slate-200 group-hover:text-white transition-colors">
                  {sessionAccuracy.toFixed(0)}%
              </span>
            </div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest group-hover:text-purple-300 transition-colors">
              Z: {sessionZ.toFixed(2)}
            </div>
           </>
        )}
      </>
    );
  
    // Modal Content Component to be Portaled
    const ModalContent = () => (
        <div 
            className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-xl p-0 md:p-4 animate-in fade-in duration-300"
            style={{ zIndex: 9999 }} // Force z-index inline to guarantee stack order
            onClick={() => setShowModal(false)}
        >
          {/* Modal Container */}
          <div 
            className="w-full h-full md:h-auto md:max-h-[95vh] md:max-w-4xl bg-slate-900 border-0 md:border md:border-purple-500/20 rounded-none md:rounded-xl p-6 relative overflow-y-auto shadow-[0_0_50px_rgba(168,85,247,0.2)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Close Button for Mobile */}
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900/95 backdrop-blur z-10 py-2 border-b border-white/5 md:border-0 md:static">
               <h2 className="text-2xl font-serif text-white flex items-center gap-2">
                  <Activity className="text-purple-400" /> Performance
               </h2>
               <button onClick={() => setShowModal(false)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white transition-colors">
                  <X size={20}/>
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* CURRENT */}
              <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                <h3 className="text-xs uppercase tracking-[0.2em] text-purple-400 mb-4 text-center">Current Session</h3>
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
                    <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="animate-spin text-purple-500"/></div>
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

            {/* Definitions Legend */}
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
    );

    return (
      <>
        <div onClick={() => setShowModal(true)} className={containerClasses}>
            <TriggerContent />
        </div>
        {/* Render Portal if Mounted and Modal Open */}
        {showModal && mounted && createPortal(<ModalContent />, document.body)}
      </>
    );
};

const CircularTimer = ({ duration, onComplete, isActive }: { duration: number, onComplete: () => void, isActive: boolean }) => {
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      startTimeRef.current = null;
      return;
    }

    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const timeElapsed = time - startTimeRef.current;
      const newProgress = Math.min((timeElapsed / duration) * 100, 100);

      setProgress(newProgress);

      if (timeElapsed < duration) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, duration, onComplete]);

  const size = 280;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = size / 2 - strokeWidth * 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
       {/* Background Glow */}
      <div className="absolute inset-0 rounded-full bg-black shadow-[0_0_80px_rgba(139,92,246,0.3)] border border-gray-800/50 z-0" />
      
      {/* SVG Container: Rotation applied internally via transform attribute for compatibility */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="z-10 relative">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#0f172a"
            strokeWidth={strokeWidth}
            transform={`rotate(-90 ${center} ${center})`}
          />
          {/* Bright Cyan Progress Line */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#22d3ee" 
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            className="drop-shadow-[0_0_15px_rgba(34,211,238,1)] transition-all duration-75 ease-linear"
          />
      </svg>
      
      {isActive && (
        <div className="absolute w-full h-full flex items-center justify-center animate-pulse z-20">
           <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_30px_rgba(34,211,238,1)]" />
        </div>
      )}
    </div>
  );
};

export default function TheGazeApp() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [gameState, setGameState] = useState<'IDLE' | 'FOCUSING' | 'DECIDING' | 'REVEAL'>('IDLE');
  const [showInstructions, setShowInstructions] = useState(true);
  const [stats, setStats] = useState({ hits: 0, total: 0, streak: 0 });
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Game Configuration
  const [filterMode, setFilterMode] = useState<'ALL' | 'MEN' | 'WOMEN' | 'ANIMALS'>('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  // Session State
  const [currentSubject, setCurrentSubject] = useState<typeof SUBJECTS[0] | null>(null);
  const [userGuess, setUserGuess] = useState<string | null>(null);
  const [phrase, setPhrase] = useState(PHRASES[0]);
  
  const audio = useAudioEngine();

  useEffect(() => {
    audio.init();
  }, []);

  // Update audio background when state changes
  useEffect(() => {
    if (soundEnabled && gameState === 'FOCUSING') {
       audio.playTheta(true);
    } else {
       audio.playTheta(false);
    }
  }, [soundEnabled, gameState]);

  const toggleSound = () => setSoundEnabled(!soundEnabled);

  // AUTO-SAVE LOGIC
  const saveSessionStats = async (newStats: typeof stats) => {
      setSaveMessage("SAVING...");
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setSaveMessage(null);
            return;
        }

        if (sessionId) {
            // Update existing session
            const { error } = await supabase
                .from('reports')
                .update({ 
                    chart_data: newStats,
                    report_content: `Auto-saved session. Trials: ${newStats.total}. Hits: ${newStats.hits}. Mode: ${filterMode}.`
                })
                .eq('id', sessionId);
            if (error) throw error;
        } else {
            // Create new session
            const { data, error } = await supabase
                .from('reports')
                .insert({
                    user_id: user.id,
                    name: 'The Gaze',
                    category: 'training',
                    chart_data: newStats,
                    report_content: `New session started. Mode: ${filterMode}.`
                })
                .select()
                .single();
            
            if (error) throw error;
            if (data) setSessionId(data.id);
        }
        setSaveMessage("SAVED");
        setTimeout(() => setSaveMessage(null), 2000);

      } catch (err) {
          console.error("Auto-save failed:", err);
          setSaveMessage("ERROR");
      }
  };

  const startFocus = () => {
    setGameState('FOCUSING');
    setUserGuess(null);
    setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
    
    let availableSubjects = SUBJECTS;
    if (filterMode !== 'ALL') {
      availableSubjects = SUBJECTS.filter(s => s.category === filterMode);
    }
    
    const randomSubject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)];
    setCurrentSubject(randomSubject);
  };

  const handleTimerComplete = () => {
    setGameState('DECIDING');
  };

  const handleGuess = (guess: 'STARE' | 'AWAY') => {
    if (!currentSubject) return;

    setUserGuess(guess);
    setGameState('REVEAL');
    
    const isCorrect = (guess === 'STARE' && currentSubject.isStaring) || (guess === 'AWAY' && !currentSubject.isStaring);
    
    if (isCorrect) {
      audio.playHit();
    } else {
      audio.playMiss();
    }

    const newStats = {
      hits: isCorrect ? stats.hits + 1 : stats.hits,
      total: stats.total + 1,
      streak: isCorrect ? stats.streak + 1 : 0
    };

    setStats(newStats);
    
    // Trigger Auto Save
    saveSessionStats(newStats);
  };

  const handleResetSession = () => {
    setStats({ hits: 0, total: 0, streak: 0 });
    setSessionId(null); // Detach from DB row so next guess creates new session
    setGameState('IDLE');
    setShowSettings(false);
  };

  const handleDeleteLifetime = async () => {
      if(!confirm("Are you sure? This will delete ALL your history for The Gaze.")) return;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;

        const { error } = await supabase
            .from('reports')
            .delete()
            .eq('user_id', user.id)
            .eq('name', 'The Gaze');
        
        if (error) throw error;
        alert("History deleted.");
        handleResetSession();
      } catch(e) {
          console.error(e);
          alert("Failed to delete.");
      }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen(); 
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center overflow-hidden flex flex-col font-sans" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-0" />

      {/* Header */}
      <header className="relative z-20 px-6 py-4 flex justify-between items-center border-b border-gray-800/50 bg-[#0a0a0a]/50">
        <div className="flex items-center gap-4">
          <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit Training" className="text-sm" />
        </div>

        {/* Desktop Stats (Hidden on mobile) */}
        <div className="hidden md:flex items-center">
            <PsiStats stats={stats} variant="header" />
        </div>

        <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl tracking-wider text-transparent bg-clip-text bg-linear-to-r from-cyan-200 to-purple-200 hidden lg:block">
                THE GAZE
            </h1>
            <button onClick={() => setShowInstructions(true)} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white" title="Instructions">
              <HelpCircle size={20} />
            </button>
            <button onClick={toggleSound} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
              <Settings size={20} />
            </button>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 gap-6">
        
        {/* Mobile Stats HUD (In-flow to prevent overlap) */}
        <div className="md:hidden w-full flex justify-center order-first">
           <div className="flex items-center gap-4 px-6 py-2 bg-gray-900/80 rounded-full border border-gray-800 shadow-xl backdrop-blur-sm">
             <div className="flex flex-col items-center">
               <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Streak</span>
               <span className="text-lg font-mono font-bold text-yellow-400 flex items-center gap-1">
                 <Trophy size={14} /> {stats.streak}
               </span>
             </div>
             <div className="w-px h-8 bg-gray-800"></div>
             <PsiStats stats={stats} variant="floating" />
           </div>
        </div>

        {/* Central Stage */}
        <div className="relative w-full max-w-md flex flex-col items-center justify-center min-h-[400px]">
          
          {/* IDLE STATE */}
          {gameState === 'IDLE' && (
            <div className="text-center animate-in fade-in zoom-in duration-500 relative z-10">
              <div className="mb-8 relative group cursor-pointer" onClick={startFocus}>
                <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-2xl group-hover:bg-purple-500/50 transition-all duration-500"></div>
                <div className="relative w-48 h-48 rounded-full border-2 border-purple-500/50 flex items-center justify-center bg-black/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                  <Play size={48} className="text-purple-400 ml-2 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                </div>
              </div>
              <h2 className="text-2xl font-light text-gray-300 mb-2">Ready to Tune In?</h2>
              <p className="text-gray-500 text-sm">Clear your mind. Trust your instinct.</p>
              <div className="mt-4 text-xs text-purple-400/50 uppercase tracking-widest">
                Current Filter: {filterMode}
              </div>
            </div>
          )}

          {/* FOCUSING STATE */}
          {gameState === 'FOCUSING' && (
            <div className="flex flex-col items-center animate-in fade-in duration-700">
              <CircularTimer 
                duration={TIMER_DURATION} 
                isActive={true} 
                onComplete={handleTimerComplete} 
              />
              <p className="mt-8 text-cyan-200/70 text-lg font-light tracking-wide animate-pulse drop-shadow-md">
                {phrase}
              </p>
            </div>
          )}

          {/* DECIDING STATE */}
          {gameState === 'DECIDING' && (
            <div className="flex flex-col items-center w-full animate-in slide-in-from-bottom-10 fade-in duration-300">
              {/* Central Glowing Void */}
              <div className="w-64 h-64 bg-black rounded-full border-4 border-indigo-900 shadow-[0_0_100px_rgba(79,70,229,0.4)] flex items-center justify-center mb-8 relative overflow-hidden animate-pulse">
                <div className="absolute inset-0 bg-radial-gradient from-indigo-900/50 to-black/90"></div>
              </div>

              <h3 className="text-2xl text-white mb-8 font-medium font-serif tracking-wide drop-shadow-lg">Are they staring at you?</h3>

              <div className="flex gap-4 w-full max-w-sm">
                <button 
                  onClick={() => handleGuess('AWAY')}
                  onMouseEnter={() => audio.playHover()}
                  className="flex-1 py-4 px-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all flex flex-col items-center gap-2 group"
                >
                  <EyeOff size={24} className="text-gray-400 group-hover:text-white" />
                  <span className="text-sm font-bold text-gray-400 group-hover:text-white uppercase">No</span>
                </button>
                
                <button 
                  onClick={() => handleGuess('STARE')}
                  onMouseEnter={() => audio.playHover()}
                  className="flex-1 py-4 px-4 bg-linear-to-b from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 rounded-xl border border-purple-700/50 transition-all flex flex-col items-center gap-2 group shadow-lg shadow-purple-900/20"
                >
                  <Eye size={24} className="text-purple-300 group-hover:text-white" />
                  <span className="text-sm font-bold text-purple-200 group-hover:text-white uppercase">Yes</span>
                </button>
              </div>
            </div>
          )}

          {/* REVEAL STATE */}
          {gameState === 'REVEAL' && currentSubject && (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
              <div className={`
                relative w-72 h-72 rounded-3xl flex items-center justify-center mb-8 shadow-2xl transition-all duration-500 border-4 overflow-hidden
                ${((userGuess === 'STARE' && currentSubject.isStaring) || (userGuess === 'AWAY' && !currentSubject.isStaring)) 
                  ? 'border-green-500 shadow-green-900/40' 
                  : 'border-red-500 shadow-red-900/40'}
              `}>
                <img 
                    src={currentSubject.src} 
                    alt="Subject Reveal" 
                    className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className={`text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-black/80 backdrop-blur ${currentSubject.isStaring ? 'border-purple-500 text-purple-400' : 'border-gray-500 text-gray-400'}`}>
                    {currentSubject.isStaring ? 'Staring' : 'Looking Away'}
                  </span>
                </div>
              </div>

              <div className="text-center mb-8">
                {((userGuess === 'STARE' && currentSubject.isStaring) || (userGuess === 'AWAY' && !currentSubject.isStaring)) ? (
                  <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-green-400">Correct!</h2>
                    <p className="text-green-200/60 text-sm">Your intuition was accurate.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-red-500">Missed</h2>
                    <p className="text-red-200/60 text-sm">It was {currentSubject.name}.</p>
                  </div>
                )}
                {saveMessage && <p className="text-xs text-gray-500 mt-2 font-mono">{saveMessage}</p>}
              </div>

              <button 
                onClick={startFocus}
                className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <RotateCcw size={18} />
                Next Subject
              </button>
            </div>
          )}

        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-purple-900/30 bg-[#0a0a0a]/80 backdrop-blur shrink-0 h-12 flex items-center justify-between px-6">
        <div className="text-[10px] text-gray-600 font-mono">
            SUBJECTS: {filterMode} // CHANCE: 50%
        </div>
        <button onClick={toggleFullScreen} className="text-gray-500 hover:text-white">
            {typeof document !== 'undefined' && document.fullscreenElement ? <Minimize size={18}/> : <Maximize size={18}/>}
        </button>
      </footer>

      {/* SETTINGS DRAWER */}
      {showSettings && (
        <div className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
            <div 
                className="absolute right-0 top-16 bottom-0 w-80 bg-gray-900 border-l border-purple-500/20 shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-serif text-xl text-purple-100">Settings</h3>
                    <button onClick={() => setShowSettings(false)}><X className="text-gray-500 hover:text-white" /></button>
                </div>

                <div className="space-y-8">
                    {/* Filter Mode */}
                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-3">Target Subjects</label>
                        <div className="grid grid-cols-1 gap-2">
                            {(['ALL', 'MEN', 'WOMEN', 'ANIMALS'] as const).map(mode => (
                                <button 
                                    key={mode} 
                                    onClick={() => setFilterMode(mode)} 
                                    className={`p-3 rounded border text-left transition-all ${filterMode === mode ? 'bg-purple-900/50 border-purple-500 text-purple-300' : 'bg-black border-gray-800 text-gray-500 hover:border-gray-600'}`}
                                >
                                    <span className="text-xs font-bold font-mono">{mode}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800 space-y-3">
                        <button onClick={handleResetSession} className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 flex items-center justify-center gap-2 text-xs font-bold tracking-widest">
                            <RotateCcw size={14} /> RESET CURRENT SESSION
                        </button>
                        
                        <button 
                            onClick={handleDeleteLifetime} 
                            className="w-full py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 text-red-400 rounded flex items-center justify-center gap-2 text-xs font-bold tracking-widest hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all"
                        >
                            <Trash2 size={14} /> DELETE LIFETIME DATA
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {showInstructions && <InstructionModal onClose={() => setShowInstructions(false)} />}
    </main>
  );
}