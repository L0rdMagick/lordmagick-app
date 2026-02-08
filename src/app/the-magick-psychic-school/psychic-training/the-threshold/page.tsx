"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Settings, HelpCircle, Eye, X, 
  Trash2, RotateCcw, Lock, Check
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import { useHaptics } from '@/hooks/useHaptics';
import PsychicStatsModal from '../components/PsychicStatsModal';
import { calculateZScore } from '../utils/psychicStats';

// --- ASSET DEFINITIONS ---

const IMG_PATH = '/images/door-vision/';

const CATEGORIES: Record<string, { id: string; name: string; color: string; items: { id: string; label: string; src: string }[] }> = {
  FAMILY: {
    id: 'family',
    name: 'The Family',
    color: '#D4AF37',
    items: [
      { id: 'man', label: 'The Man', src: `${IMG_PATH}man.jpg` },
      { id: 'woman', label: 'The Woman', src: `${IMG_PATH}woman.jpg` }, 
      { id: 'boy', label: 'The Boy', src: `${IMG_PATH}Boy.jpg` },
      { id: 'girl', label: 'The Girl', src: `${IMG_PATH}Girl.jpg` },
    ]
  },
  COMPANIONS: {
    id: 'companions',
    name: 'The Companions',
    color: '#CD7F32',
    items: [
      { id: 'wolf', label: 'The Wolf', src: `${IMG_PATH}Wolf.jpg` },
      { id: 'cat', label: 'The Cat', src: `${IMG_PATH}Cat.jpg` },
      { id: 'small', label: 'The Mouse', src: `${IMG_PATH}Small.jpg` },
      { id: 'fluffy', label: 'The Bird', src: `${IMG_PATH}Fluffy.jpg` },
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
      { id: 'sun', label: 'The Sun', src: `${IMG_PATH}Sun.jpg` },
      { id: 'moon', label: 'The Moon', src: `${IMG_PATH}Moon.jpg` },
      { id: 'planet', label: 'The Planet', src: `${IMG_PATH}Planet.jpg` },
      { id: 'star', label: 'The Star', src: `${IMG_PATH}Star.jpg` },
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
      { id: 'sword', label: 'Ace of Swords', src: `${IMG_PATH}Sword.jpg` },
      { id: 'cup', label: 'Ace of Cups', src: `${IMG_PATH}Cup.jpg` },
      { id: 'wand', label: 'Ace of Wands', src: `${IMG_PATH}Wand.jpg` },
      { id: 'pentacle', label: 'Ace of Pentacles', src: `${IMG_PATH}Pentacle.jpg` },
    ]
  }
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

// 2. Door Component
const Door = ({ isOpen }: { isOpen: boolean }) => (
  <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 ease-in-out z-20 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
     <div className={`absolute left-0 top-0 bottom-0 w-1/2 bg-neutral-900 border-r-2 border-dashed border-neutral-700 transition-transform duration-1000 ease-in-out origin-left ${isOpen ? '-rotate-y-90 -translate-x-full' : 'rotate-y-0 translate-x-0'}`} />
     <div className={`absolute right-0 top-0 bottom-0 w-1/2 bg-neutral-900 border-l-2 border-dashed border-neutral-700 transition-transform duration-1000 ease-in-out origin-right ${isOpen ? 'rotate-y-90 translate-x-full' : 'rotate-y-0 translate-x-0'}`} />
     
     {/* Lock Icon */}
     <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 delay-500'}`}>
        <Lock className="text-yellow-500 w-16 h-16 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
     </div>
  </div>
);

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
          <li>The target will be chosen. The <strong>DOORS</strong> will slam shut.</li>
          <li>Behind the doors, the chosen target will be concealed.</li>
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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function TheThresholdApp() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

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

  // Pre-calculate target-to-category mapping for O(1) lookup
  const targetToCategory = React.useMemo(() => {
      const map: Record<string, string> = {};
      Object.values(CATEGORIES).forEach(cat => {
          cat.items.forEach(item => {
              map[item.id] = cat.id;
          });
      });
      return map;
  }, []);

  const radarData = React.useMemo(() => {
      return Object.values(CATEGORIES).map(cat => {
          // Filter history for trials where the target was in this category
          const catTrials = history.filter(h => targetToCategory[h.target] === cat.id);
          const hits = catTrials.filter(h => h.correct).length;
          const total = catTrials.length;
          
          return {
              id: cat.id,
              label: cat.name,
              value: total > 0 ? (hits / total) * 100 : 0,
              color: cat.color,
              fullMark: 100
          };
      });
  }, [history, targetToCategory]);

  const currentCategory = CATEGORIES[categoryKey];

  // Haptics Hook
  const haptics = useHaptics();

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

  const handleStart = async () => {
    if (gameState !== 'IDLE' && gameState !== 'RESULT') return;
    
    // Init Sequence
    setTargetId(null);
    setUserGuess(null);
    setGameState('SPINNING');
    
    // Phase 1: 1s per item (1 full cycle = 4 items)
    for (let i = 0; i < 4; i++) {
        setDisplayIndex(prev => (prev + 1) % 4);
        playSound('click');
        await delay(1000);
    }

    // Phase 2: 0.5s per item (1 full cycle)
    for (let i = 0; i < 4; i++) {
        setDisplayIndex(prev => (prev + 1) % 4);
        playSound('click');
        await delay(500);
    }

    // Phase 3: 0.2s per item (1 full cycle)
    for (let i = 0; i < 4; i++) {
        setDisplayIndex(prev => (prev + 1) % 4);
        playSound('click');
        await delay(200);
    }

    // Phase 4: 0.1s per item (1 full cycle)
    for (let i = 0; i < 4; i++) {
        setDisplayIndex(prev => (prev + 1) % 4);
        playSound('click');
        await delay(100);
    }

    // Doors Closing
    setGameState('CLOSED_SPIN');
    playSound('thud');
    await delay(800); // Allow visual door close

    // Phase 5: Closed Spin (3 Full Cycles @ 0.1s)
    for (let i = 0; i < 12; i++) { // 3 * 4 = 12 items
        setDisplayIndex(prev => (prev + 1) % 4);
        playSound('click'); // Use same click sound per instruction
        await delay(100);
    }

    // Determine Winner (RNG)
    const buffer = new Uint32Array(1);
    const win = (globalThis as any).window;
    if (win && win.crypto) {
        win.crypto.getRandomValues(buffer);
        const rand = buffer[0] / (0xffffffff + 1);
        const winningIndex = Math.floor(rand * 4);
        
        setTargetId(currentCategory.items[winningIndex].id);
        setDisplayIndex(winningIndex); // Snap visual to winner behind door
        
        setGameState('LOCKED');
        playSound('lock');
    }
  };

  const handleGuess = (id: string) => {
    if (gameState !== 'LOCKED') return;
    
    // Selection Haptic
    haptics.triggerMedium();
    
    setUserGuess(id);
    setGameState('REVEALING');
    playSound('click');
    
    setTimeout(() => {
      const isCorrect = id === targetId;
      setGameState('RESULT');
      
      if (isCorrect) {
          playSound('success');
          haptics.triggerHeavy(); // Success Haptic
      } else {
          playSound('fail');
          haptics.triggerLight(); // Fail Haptic
      }

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

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center overflow-hidden flex flex-col font-sans" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-0" />
      
      {showInstructions && <InstructionModal onClose={() => setShowInstructions(false)} />}
      
      {/* Header */}
      <header className="relative z-40 py-[3px] px-3 md:px-4 flex items-center justify-between border-b border-white/10 bg-neutral-900/50 backdrop-blur-md min-h-[54px]">
        <div className="flex items-center gap-4 w-1/3">
          <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit" className="text-sm" />
        </div>
        
        <div className="flex justify-center w-1/3 text-center">
            <PsychicStatsModal 
               hits={history.filter(h => h.correct).length}
               trials={history.length}
               chance={0.25}
               appName="Door Vision"
               maxStreak={maxStreak}
               radarData={radarData}
            />
        </div>

        <div className="flex items-center justify-end gap-2 w-1/3">
            <button onClick={() => setShowInstructions(true)} className="text-gray-500 hover:text-white transition p-2">
                <HelpCircle className="w-5 h-5" />
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="text-gray-500 hover:text-white transition p-2">
                <Settings className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* Settings Panel */}
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

      {/* Main Stage */}
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

        {/* The Wall & Door - Yellow Aura */}
        <div className="relative flex-1 w-full max-w-[280px] min-h-[250px] bg-neutral-950 rounded-t-full border-8 border-neutral-800 shadow-[0_0_80px_rgba(250,204,21,0.4)] overflow-hidden ring-1 ring-white/10 my-2">
          
          {/* Content Behind Door */}
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black">
             {/* Spinning/Revealed Item */}
             {currentCategory.items.map((item, idx) => {
               const isVisible = gameState === 'RESULT' ? item.id === targetId : idx === displayIndex;
               
               // Show image logic: Visible during Result or during spinning (before closed spin)
               const showImage = isVisible && (gameState !== 'CLOSED_SPIN');

               return (
                 <div 
                  key={item.id}
                  className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-100 ${showImage ? 'opacity-100' : 'opacity-0'}`}
                 >
                   <div className="relative w-full h-full flex items-center justify-center">
                       <img 
                         src={item.src} 
                         alt={item.label}
                         className={`w-full h-full object-cover shadow-[0_0_30px_currentColor] 
                           ${gameState === 'RESULT' && targetId === item.id ? 'animate-pulse border-white' : ''}`}
                         style={{ borderColor: currentCategory.color }}
                       />
                       
                       {/* Large Label Display while Spinning (Door Open) - ABSOLUTE POSITIONED OVER IMAGE */}
                       {gameState === 'SPINNING' && (
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
                              <div className="bg-black/70 px-4 py-1 rounded-full backdrop-blur-sm border border-white/20 shadow-lg">
                                <span className="text-lg font-serif tracking-widest text-white uppercase" style={{ color: currentCategory.color, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                    {item.label}
                                </span>
                              </div>
                          </div>
                       )}
                   </div>
                 </div>
               );
             })}
          </div>

          <Door isOpen={gameState === 'SPINNING' || gameState === 'RESULT'} />
        </div>

        {/* Controls - Fixed Height Area */}
        <div className="w-full max-w-sm space-y-4 flex-none relative">
          
          {/* Pinkish Glow Behind Mini Images */}
          <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full scale-110 -z-10" />

          {/* Thumbnails */}
          <div className={`grid grid-cols-4 gap-3 transition-all duration-500 relative z-0 ${gameState === 'LOCKED' ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none grayscale'}`}>
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
                  
                  {/* Result Overlays - Thick Icons */}
                  {gameState === 'RESULT' && isSelected && (
                     <div className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px] ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                        {isCorrect ? <Check strokeWidth={4} size={32} /> : <X strokeWidth={4} size={32} />}
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