"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Settings, HelpCircle, Eye, X, Trophy, Activity, 
  Sparkles, Maximize2, Trash2, RotateCcw
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import MagickalBackLink from '@/app/components/MagickalBackLink';

// --- DATA ASSETS ---

const IMG_PATH = '/images/door-vision/';

const CATEGORIES: Record<string, { id: string; name: string; color: string; items: { id: string; label: string; src: string }[] }> = {
  FAMILY: {
    id: 'family',
    name: 'The Family',
    color: '#D4AF37',
    items: [
      { id: 'man', label: 'Man', src: `${IMG_PATH}man.jpg` },
      { id: 'woman', label: 'Woman', src: `${IMG_PATH}woman.jpg` }, 
      { id: 'boy', label: 'Boy', src: `${IMG_PATH}Boy.jpg` },
      { id: 'girl', label: 'Girl', src: `${IMG_PATH}Girl.jpg` },
    ]
  },
  COMPANIONS: {
    id: 'companions',
    name: 'The Companions',
    color: '#CD7F32',
    items: [
      { id: 'wolf', label: 'Wolf', src: `${IMG_PATH}Wolf.jpg` },
      { id: 'cat', label: 'Cat', src: `${IMG_PATH}Cat.jpg` },
      { id: 'small', label: 'Small', src: `${IMG_PATH}Small.jpg` },
      { id: 'fluffy', label: 'Fluffy', src: `${IMG_PATH}Fluffy.jpg` },
    ]
  },
  ELEMENTS: {
    id: 'elements',
    name: 'The Elements',
    color: '#ef4444',
    items: [
      { id: 'fire', label: 'Fire', src: `${IMG_PATH}fire.jpg` },
      { id: 'water', label: 'Water', src: `${IMG_PATH}Water.jpg` },
      { id: 'earth', label: 'Earth', src: `${IMG_PATH}Earth.jpg` },
      { id: 'air', label: 'Air', src: `${IMG_PATH}Air.jpg` },
    ]
  },
  COSMOS: {
    id: 'cosmos',
    name: 'The Cosmos',
    color: '#8b5cf6',
    items: [
      { id: 'sun', label: 'Sun', src: `${IMG_PATH}Sun.jpg` },
      { id: 'moon', label: 'Moon', src: `${IMG_PATH}Moon.jpg` },
      { id: 'planet', label: 'Planet', src: `${IMG_PATH}Planet.jpg` },
      { id: 'star', label: 'Star', src: `${IMG_PATH}Star.jpg` },
    ]
  },
  SEASONS: {
    id: 'seasons',
    name: 'The Seasons',
    color: '#10b981',
    items: [
      { id: 'spring', label: 'Spring', src: `${IMG_PATH}Spring.jpg` },
      { id: 'summer', label: 'Summer', src: `${IMG_PATH}Summer.jpg` }, 
      { id: 'autumn', label: 'Autumn', src: `${IMG_PATH}Autumn.jpg` },
      { id: 'winter', label: 'Winter', src: `${IMG_PATH}Winter.jpg` },
    ]
  },
  SUITS: {
    id: 'suits',
    name: 'The Suits',
    color: '#3b82f6',
    items: [
      { id: 'sword', label: 'Sword', src: `${IMG_PATH}Sword.jpg` },
      { id: 'cup', label: 'Cup', src: `${IMG_PATH}Cup.jpg` },
      { id: 'wand', label: 'Wand', src: `${IMG_PATH}Wand.jpg` },
      { id: 'pentacle', label: 'Pentacle', src: `${IMG_PATH}Pentacle.jpg` },
    ]
  }
};

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
  if (z >= 1.96) return { name: "The Seer", color: "text-pink-300 shadow-pink-500/50" };
  if (z >= 1.65) return { name: "The Channel", color: "text-indigo-300 shadow-indigo-500/50" };
  if (z >= 1.0) return { name: "The Adept", color: "text-cyan-300 shadow-cyan-500/50" };
  if (z >= 0.5) return { name: "The Spark", color: "text-teal-300 shadow-teal-500/50" };
  if (z >= 0.0) return { name: "The Initiate", color: "text-slate-200" };
  
  if (z <= -4.0) return { name: "The Void", color: "text-slate-500" };
  if (z <= -2.0) return { name: "The Mirror", color: "text-slate-400" };
  return { name: "The Sleeper", color: "text-slate-300" };
};

// --- AUDIO ENGINE ---
const playSound = (type: string) => {
  const win = (globalThis as any).window;
  if (typeof win === 'undefined') return;
  const AudioContext = win.AudioContext || win.webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  switch (type) {
    case 'click':
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    case 'muffled-click':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.1);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case 'thud':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + 0.5);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    case 'lock':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    case 'success':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 1.5);
      osc.start(now);
      osc.stop(now + 1.5);
      break;
    case 'fail':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.5);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 1);
      osc.start(now);
      osc.stop(now + 1);
      break;
  }
};

// --- COMPONENTS ---

// 1. Stats Component (Mini Widget + Modal)
const DoorVisionStats = ({ history }: { history: any[] }) => {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));
  const [showModal, setShowModal] = useState(false);
  const [lifetimeStats, setLifetimeStats] = useState({ hits: 0, trials: 0 });
  const [loadingLifetime, setLoadingLifetime] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Stats Logic (1 in 4 chance)
  const chance = 0.25;
  const sessionTrials = history.length;
  const sessionHits = history.filter(h => h.correct).length;
  const streak = history.reduce((acc, curr) => curr.correct ? acc + 1 : 0, 0);

  const sessionAccuracy = sessionTrials > 0 ? (sessionHits / sessionTrials) * 100 : 0;
  const sessionZ = calculatePsiScore(sessionHits, sessionTrials, chance);
  const sessionProb = calculateProbability(sessionZ);
  const sessionTier = getPsiTier(sessionZ);

  useEffect(() => {
    if (showModal) {
      const fetchHistory = async () => {
        setLoadingLifetime(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoadingLifetime(false); return; }

        const { data, error } = await supabase
            .from('reports')
            .select('chart_data')
            .eq('user_id', user.id)
            .eq('category', 'training') 
            .eq('name', 'Door Vision');

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

  const ModalContent = () => (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md z-100"
      onClick={() => setShowModal(false)}
    >
      <div 
        className="w-full max-w-4xl bg-[#120a1f] border border-purple-500/30 p-6 rounded-2xl relative overflow-y-auto max-h-[90vh] shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b border-purple-500/20 pb-4">
          <h2 className="text-2xl text-purple-200 flex items-center gap-2 font-serif tracking-widest">
            <Activity size={24} className="text-purple-400"/> PERFORMANCE DATA
          </h2>
          <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
            <X size={24}/>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Current Session */}
          <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-lg">
            <h3 className="text-xs uppercase tracking-[0.2em] text-purple-400 mb-4 text-center">Current Session</h3>
            <div className="space-y-2 text-sm font-mono text-gray-300">
              <div className="flex justify-between border-b border-white/5 pb-1"><span>Hits / Trials</span> <span className="text-white">{sessionHits} / {sessionTrials}</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span>Accuracy</span> <span className="text-white">{sessionAccuracy.toFixed(1)}%</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span>Psi Score (Z)</span> <span className={sessionZ >= 0 ? "text-purple-300" : "text-gray-500"}>{sessionZ.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Probability</span> <span className="text-green-300">{sessionProb}</span></div>
              <div className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-white border border-purple-500/30 py-1 rounded">{sessionTier.name}</div>
            </div>
          </div>

          {/* Lifetime */}
          <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-lg relative">
            <h3 className="text-xs uppercase tracking-[0.2em] text-amber-400 mb-4 text-center">Lifetime Record</h3>
            {loadingLifetime ? (
               <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="animate-spin text-purple-500"/></div>
            ) : (
               <div className="space-y-2 text-sm font-mono text-gray-300">
                   <div className="flex justify-between border-b border-white/5 pb-1"><span>Hits / Trials</span> <span className="text-white">{lifetimeStats.hits} / {lifetimeStats.trials}</span></div>
                   <div className="flex justify-between border-b border-white/5 pb-1"><span>Accuracy</span> <span className="text-white">{lifeAccuracy.toFixed(1)}%</span></div>
                   <div className="flex justify-between border-b border-white/5 pb-1"><span>Psi Score (Z)</span> <span className={lifeZ >= 0 ? "text-purple-300" : "text-gray-500"}>{lifeZ.toFixed(2)}</span></div>
                   <div className="flex justify-between"><span>Probability</span> <span className="text-green-300">{lifeProb}</span></div>
                   <div className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-white border border-purple-500/30 py-1 rounded">{lifeTier.name}</div>
               </div>
            )}
          </div>
        </div>

        {/* Definitions Legend */}
        <div className="grid md:grid-cols-2 gap-8 border-t border-white/10 pt-6">
            <div>
                <h4 className="text-xs uppercase tracking-widest text-purple-400 mb-3 pb-2 border-b border-white/5">Psi-Hitting (Positive)</h4>
                <div className="space-y-3 text-xs text-gray-400">
                    <div><strong className="text-amber-200 block">The Oracle (Z &ge; 4.0)</strong> World Class Anomaly</div>
                    <div><strong className="text-purple-300 block">The Medium (Z &ge; 3.0)</strong> Highly Significant</div>
                    <div><strong className="text-pink-300 block">The Seer (Z &ge; 1.96)</strong> Statistically Significant</div>
                    <div><strong className="text-indigo-300 block">The Channel (Z &ge; 1.65)</strong> 1 in 20 Odds</div>
                    <div><strong className="text-cyan-300 block">The Adept (Z &ge; 1.0)</strong> Above Average</div>
                </div>
            </div>
            <div>
                <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-3 pb-2 border-b border-white/5">Psi-Missing (Negative)</h4>
                <div className="space-y-3 text-xs text-gray-500">
                    <div><strong className="text-slate-400 block">The Sleeper (Z &lt; 0.0)</strong> Below Baseline</div>
                    <div><strong className="text-slate-400 block">The Mirror (Z &le; -2.0)</strong> Significant Avoidance</div>
                    <div><strong className="text-slate-500 block">The Void (Z &le; -4.0)</strong> Total Suppression</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="flex flex-col items-center gap-1 bg-neutral-900/50 hover:bg-neutral-800 border border-purple-500/30 hover:border-purple-400 rounded-lg cursor-pointer transition-all group p-2 min-w-[140px]"
      >
        <div className="flex items-center gap-4 w-full justify-center">
            <div className="flex items-center gap-2 border-r border-purple-500/30 pr-3">
                <span className="text-yellow-400 font-bold flex items-center gap-1 font-mono"><Trophy size={14} /> {streak}</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-[9px] text-purple-400 uppercase tracking-widest font-mono">Accuracy</span>
                <span className={`text-xs font-bold font-mono ${sessionAccuracy > 25 ? 'text-green-400' : 'text-gray-400'}`}>{sessionAccuracy.toFixed(0)}%</span>
            </div>
        </div>
        <div className="w-full text-center border-t border-purple-500/10 pt-1 mt-1">
             <span className="text-[8px] font-bold text-purple-500 group-hover:text-purple-300 tracking-[0.2em] uppercase">See All Stats</span>
        </div>
      </div>
      {showModal && mounted && createPortal(<ModalContent />, document.body)}
    </>
  );
};

// 2. Door Component
const Door = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <div className="absolute inset-0 z-20 flex pointer-events-none overflow-hidden rounded-t-full">
      {/* Left Door Panel */}
      <div 
        className={`h-full w-1/2 bg-neutral-900 relative transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] border-r-4 border-black shadow-2xl flex items-center justify-end
        ${isOpen ? '-translate-x-full' : 'translate-x-0'}`}
        style={{ backgroundImage: `radial-gradient(circle at right, #2a2a2a 0%, #111 100%)` }}
      >
        <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
        <div className="absolute right-4 w-2 h-32 bg-yellow-900/30 rounded-full blur-sm"></div>
      </div>

      {/* Right Door Panel */}
      <div 
        className={`h-full w-1/2 bg-neutral-900 relative transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] border-l-4 border-black shadow-2xl flex items-center justify-start
        ${isOpen ? 'translate-x-full' : 'translate-x-0'}`}
        style={{ backgroundImage: `radial-gradient(circle at left, #2a2a2a 0%, #111 100%)` }}
      >
        <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
        <div className="absolute left-4 w-2 h-32 bg-yellow-900/30 rounded-full blur-sm"></div>
      </div>
      
      {/* Center Lock Visual */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-opacity duration-300 pointer-events-none ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-16 h-16 rounded-full border-4 border-yellow-700/50 bg-black/80 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <div className="w-8 h-8 rounded-full border border-yellow-700/30 bg-yellow-900/10"></div>
        </div>
      </div>
    </div>
  );
};

// 3. Instruction Modal
const InstructionModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 backdrop-blur-md p-6 overflow-y-auto">
    <div className="max-w-md w-full border border-purple-500/50 bg-[#120a1f] p-8 rounded-xl shadow-2xl shadow-purple-900/50 text-center animate-in fade-in zoom-in duration-500">
      <Eye className="w-12 h-12 text-purple-400 mx-auto mb-4" />
      <h1 className="text-3xl font-serif text-purple-100 mb-2 tracking-widest">DOOR VISION</h1>
      <h2 className="text-xs font-mono text-purple-400 mb-6 uppercase tracking-widest">Remote Viewing Barrier Trainer</h2>
      
      <div className="text-left space-y-4 text-gray-300 font-light mb-8 text-sm">
        <p><strong className="text-purple-300">Protocol:</strong> You are testing your ability to perceive through solid matter.</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>The target will be chosen. The <strong>DOOR</strong> will slam shut.</li>
          <li>Behind the wall, the target is still active.</li>
          <li>Project your consciousness past the barrier.</li>
          <li>When the lock clicks, <strong>select the image</strong> you see with your inner eye.</li>
        </ol>
      </div>

      <button 
        onClick={onClose}
        className="w-full py-4 bg-purple-900 hover:bg-purple-800 border border-purple-500 text-purple-100 font-serif tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] rounded-lg"
      >
        Initiate Sequence
      </button>
    </div>
  </div>
);

// --- MAIN APP ---

export default function TheThresholdApp() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  // State
  const [showInstructions, setShowInstructions] = useState(true); // Always show on mount
  const [showSettings, setShowSettings] = useState(false);
  
  const [categoryKey, setCategoryKey] = useState('FAMILY');
  const [gameState, setGameState] = useState('IDLE'); // IDLE, SPINNING, CLOSED_SPIN, LOCKED, REVEALING, RESULT
  const [displayIndex, setDisplayIndex] = useState(0); 
  const [targetId, setTargetId] = useState<string | null>(null);
  const [userGuess, setUserGuess] = useState<string | null>(null);
  
  // History State for Stats
  const [history, setHistory] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Refs
  const spinInterval = useRef<NodeJS.Timeout | null>(null);
  const spinTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const currentCategory = CATEGORIES[categoryKey];

  useEffect(() => {
    return () => {
        if (spinInterval.current) clearInterval(spinInterval.current);
        if (spinTimeout.current) clearTimeout(spinTimeout.current);
    };
  }, []);

  const saveSessionStats = async (newHistory: any[]) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const hits = newHistory.filter(h => h.correct).length;
        const total = newHistory.length;
        const streak = newHistory.length > 0 && newHistory[newHistory.length - 1].correct 
            ? history.reduce((acc, curr) => curr.correct ? acc + 1 : 0, 0) + (newHistory[newHistory.length - 1].correct ? 1 : 0) // rough approx
            : 0;

        const statsObject = { hits, total, streak };

        if (sessionId) {
            await supabase.from('reports')
                .update({ chart_data: statsObject, report_content: `Door Vision. Trials: ${total}.` })
                .eq('id', sessionId);
        } else {
            const { data } = await supabase.from('reports')
                .insert({
                    user_id: user.id,
                    name: 'Door Vision',
                    category: 'training',
                    chart_data: statsObject,
                    report_content: `New Door Vision Session.`
                }).select().single();
            if (data) setSessionId(data.id);
        }
      } catch (err) {
          console.error("Save failed", err);
      }
  };

  const handleStart = () => {
    if (gameState !== 'IDLE' && gameState !== 'RESULT') return;
    
    setTargetId(null);
    setUserGuess(null);
    setGameState('SPINNING');
    
    // Start Visual Spin
    const speed = 100;
    playSound('click');
    if (spinInterval.current) clearInterval(spinInterval.current);
    
    spinInterval.current = setInterval(() => {
      setDisplayIndex(prev => (prev + 1) % 4);
      playSound('click');
    }, speed);

    setTimeout(() => {
      setGameState('CLOSED_SPIN');
      playSound('thud');
      
      const buffer = new Uint32Array(1);
      const win = (globalThis as any).window;
      if (win && win.crypto) {
          win.crypto.getRandomValues(buffer);
          const rand = buffer[0] / (0xffffffff + 1);
          const winningIndex = Math.floor(rand * 4);
          setTargetId(currentCategory.items[winningIndex].id);
          
          if (spinInterval.current) clearInterval(spinInterval.current);
          
          let count = 0;
          const totalTicks = 8;
          const slowSpin = () => {
            if (count >= totalTicks) {
              setGameState('LOCKED');
              playSound('lock');
              setDisplayIndex(winningIndex); 
              return;
            }
            setDisplayIndex(prev => (prev + 1) % 4); 
            playSound('muffled-click');
            count++;
            spinTimeout.current = setTimeout(slowSpin, 200 + (count * 100)); 
          };
          slowSpin();
      }
    }, 2500); 
  };

  const handleGuess = (id: string) => {
    if (gameState !== 'LOCKED') return;
    setUserGuess(id);
    setGameState('REVEALING');
    playSound('click');
    
    setTimeout(() => {
      const isCorrect = id === targetId;
      setGameState('RESULT');
      if (isCorrect) playSound('success');
      else playSound('fail');

      const newRecord = {
        guess: id,
        target: targetId,
        correct: isCorrect,
        timestamp: Date.now()
      };
      const updatedHistory = [...history, newRecord];
      setHistory(updatedHistory);
      saveSessionStats(updatedHistory);

    }, 1500);
  };

  const handleDeleteSession = () => {
     setHistory([]);
     setSessionId(null);
     alert("Session Data Cleared.");
  };

  const handleDeleteLifetime = async () => {
     if(!confirm("Delete ALL Door Vision history?")) return;
     try {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;
        await supabase.from('reports').delete().eq('user_id', user.id).eq('name', 'Door Vision');
        alert("Lifetime Data Purged.");
        setHistory([]);
        setSessionId(null);
     } catch(e) { console.error(e); }
  };

  const getTargetItem = () => currentCategory.items.find(i => i.id === targetId);

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center overflow-hidden flex flex-col font-sans" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-0" />
      
      {showInstructions && <InstructionModal onClose={() => setShowInstructions(false)} />}
      
      {/* Header */}
      <header className="relative z-40 p-3 md:p-4 flex justify-between items-center border-b border-white/10 bg-neutral-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit" className="text-sm" />
        </div>
        
        {/* Widget Center */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2 z-50">
           <DoorVisionStats history={history} />
        </div>

        <div className="flex items-center gap-2">
            <button onClick={() => setShowInstructions(true)} className="text-gray-500 hover:text-white transition p-2">
                <HelpCircle className="w-5 h-5" />
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="text-gray-500 hover:text-white transition p-2">
                <Settings className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* Settings Panel (Click dead space to close) */}
      {showSettings && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
           <div 
             className="absolute top-0 right-0 bottom-0 w-80 bg-[#120a1f] border-l border-white/10 p-6 shadow-2xl overflow-y-auto"
             onClick={e => e.stopPropagation()}
           >
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-serif text-xl text-white">Settings</h3>
                <button onClick={() => setShowSettings(false)}><X className="text-gray-500 hover:text-white"/></button>
              </div>

              <div className="space-y-6">
                 <div>
                    <h4 className="text-xs uppercase text-gray-500 font-mono mb-3">Protocol Deck</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(CATEGORIES).map(([key, cat]) => (
                        <button
                            key={key}
                            onClick={() => { setCategoryKey(key); setShowSettings(false); setGameState('IDLE'); }}
                            className={`p-3 border rounded text-sm text-left transition-all ${
                            categoryKey === key 
                            ? 'border-purple-500 bg-purple-900/20 text-white' 
                            : 'border-white/10 text-gray-400 hover:bg-white/5'
                            }`}
                        >
                            {cat.name}
                        </button>
                        ))}
                    </div>
                 </div>

                 <div className="pt-4 border-t border-white/10 space-y-3">
                    <button onClick={handleDeleteSession} className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 flex items-center justify-center gap-2 text-xs font-bold tracking-widest">
                       <RotateCcw size={14} /> RESET SESSION
                    </button>
                    <button onClick={handleDeleteLifetime} className="w-full py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 text-red-400 rounded flex items-center justify-center gap-2 text-xs font-bold tracking-widest">
                       <Trash2 size={14} /> DELETE LIFETIME
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Main Stage - Optimized for Single Screen Mobile */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between py-4 w-full max-w-lg mx-auto px-4 overflow-y-auto min-h-0">
        
        {/* Status */}
        <div className="h-6 flex-none flex items-center justify-center">
          {gameState === 'IDLE' && <span className="font-mono text-xs text-purple-400 animate-pulse">SYSTEM READY... AWAITING INITIATION</span>}
          {gameState === 'SPINNING' && <span className="font-mono text-xs text-yellow-400">SHUFFLING TARGETS...</span>}
          {gameState === 'CLOSED_SPIN' && <span className="font-mono text-xs text-red-400 animate-pulse">BARRIER ACTIVE... SCANNING...</span>}
          {gameState === 'LOCKED' && <span className="font-mono text-xs text-green-400 animate-bounce">TARGET LOCKED. INPUT REQUIRED.</span>}
          {gameState === 'REVEALING' && <span className="font-mono text-xs text-white tracking-[0.2em]">BREACHING BARRIER...</span>}
          {gameState === 'RESULT' && <span className="font-mono text-xs text-white">SEQUENCE COMPLETE</span>}
        </div>

        {/* The Wall & Door - Flexible Height */}
        <div className="relative flex-1 w-full max-w-[280px] min-h-[250px] bg-neutral-950 rounded-t-full border-8 border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10 my-2">
          
          {/* Content Behind Door */}
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black">
             {/* Spinning/Revealed Item */}
             {currentCategory.items.map((item, idx) => {
               const isVisible = gameState === 'RESULT' ? item.id === targetId : idx === displayIndex;
               return (
                 <div 
                  key={item.id}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-100 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                 >
                   <img 
                     src={item.src} 
                     alt={item.label}
                     className={`w-4/5 h-4/5 object-cover rounded-full border-4 border-opacity-50 shadow-[0_0_30px_currentColor] 
                       ${gameState === 'RESULT' && targetId === item.id ? 'animate-pulse border-white' : ''}`}
                     style={{ borderColor: currentCategory.color }}
                   />
                 </div>
               );
             })}
          </div>

          <Door isOpen={gameState === 'SPINNING' || gameState === 'RESULT'} />
        </div>

        {/* Controls - Fixed Height Area */}
        <div className="w-full max-w-sm space-y-4 flex-none">
          
          {/* Thumbnails */}
          <div className={`grid grid-cols-4 gap-3 transition-all duration-500 ${gameState === 'LOCKED' ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none grayscale'}`}>
            {currentCategory.items.map((item) => {
               const isSelected = userGuess === item.id;
               const isCorrect = item.id === targetId;
               
               return (
                <button
                  key={item.id}
                  onClick={() => handleGuess(item.id)}
                  className={`aspect-square rounded-full relative overflow-hidden transition-all group active:scale-95
                    ${isSelected ? 'ring-4 ring-purple-500 scale-105 z-10' : 'border border-white/20 hover:border-purple-500'}
                  `}
                >
                  <img src={item.src} alt={item.label} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />
                  
                  {/* Result Overlays */}
                  {gameState === 'RESULT' && isSelected && (
                     <div className={`absolute inset-0 flex items-center justify-center bg-black/50 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                        {isCorrect ? <span className="text-2xl font-bold">✓</span> : <span className="text-2xl font-bold">✕</span>}
                     </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Text */}
          <div className="h-10 flex items-center justify-center text-center">
            {gameState === 'RESULT' && (
              <div className="animate-in zoom-in duration-300">
                {userGuess === targetId ? (
                  <div className="text-green-400 font-serif text-lg tracking-widest drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                    Target Acquired
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                     <div className="text-red-500 font-serif text-md tracking-widest">Connection Failed</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button 
            onClick={handleStart}
            disabled={gameState !== 'IDLE' && gameState !== 'RESULT'}
            className={`w-full py-4 rounded font-mono uppercase tracking-widest text-sm transition-all duration-300
              ${(gameState === 'IDLE' || gameState === 'RESULT') 
                ? 'bg-purple-900 text-white hover:bg-purple-800 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'}
            `}
          >
            {gameState === 'IDLE' ? 'Open Barrier' : gameState === 'RESULT' ? 'Reset Protocol' : 'Sequence Running...'}
          </button>
        </div>

      </div>
      
      {/* Footer */}
      <footer className="py-2 text-center text-[10px] text-gray-600 font-mono relative z-10 bg-black/80">
        EST. 2025 // PROJECT STARGATE ARCHIVE
      </footer>
    </main>
  );
}