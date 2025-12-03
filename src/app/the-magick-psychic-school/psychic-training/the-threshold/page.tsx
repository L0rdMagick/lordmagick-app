"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, User, Baby, Smile, 
  Dog, Cat, Rat, Bird, 
  Flame, Droplets, Mountain, Cloud, 
  Sun, Moon, Globe, Star, 
  Sprout, Leaf, Snowflake, 
  Sword, CupSoda, Feather, Coins,
  Settings, HelpCircle, Eye
} from 'lucide-react';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';

// --- ASSET DEFINITIONS ---

const CATEGORIES: Record<string, { id: string; name: string; color: string; items: { id: string; label: string; icon: any }[] }> = {
  FAMILY: {
    id: 'family',
    name: 'The Family',
    color: '#D4AF37', // Gold
    items: [
      { id: 'man', label: 'Man', icon: User },
      { id: 'woman', label: 'Woman', icon: Users }, 
      { id: 'boy', label: 'Boy', icon: Smile },
      { id: 'girl', label: 'Girl', icon: Baby },
    ]
  },
  COMPANIONS: {
    id: 'companions',
    name: 'The Companions',
    color: '#CD7F32', // Bronze
    items: [
      { id: 'wolf', label: 'Wolf', icon: Dog },
      { id: 'cat', label: 'Cat', icon: Cat },
      { id: 'mouse', label: 'Small', icon: Rat },
      { id: 'bird', label: 'Fluffy', icon: Bird },
    ]
  },
  ELEMENTS: {
    id: 'elements',
    name: 'The Elements',
    color: '#ef4444', // Red/Orange
    items: [
      { id: 'fire', label: 'Fire', icon: Flame },
      { id: 'water', label: 'Water', icon: Droplets },
      { id: 'earth', label: 'Earth', icon: Mountain },
      { id: 'air', label: 'Air', icon: Cloud },
    ]
  },
  COSMOS: {
    id: 'cosmos',
    name: 'The Cosmos',
    color: '#8b5cf6', // Violet
    items: [
      { id: 'sun', label: 'Sun', icon: Sun },
      { id: 'moon', label: 'Moon', icon: Moon },
      { id: 'planet', label: 'Planet', icon: Globe },
      { id: 'star', label: 'Star', icon: Star },
    ]
  },
  SEASONS: {
    id: 'seasons',
    name: 'The Seasons',
    color: '#10b981', // Emerald
    items: [
      { id: 'spring', label: 'Spring', icon: Sprout },
      { id: 'summer', label: 'Summer', icon: Sun }, 
      { id: 'autumn', label: 'Autumn', icon: Leaf },
      { id: 'winter', label: 'Winter', icon: Snowflake },
    ]
  },
  SUITS: {
    id: 'suits',
    name: 'The Suits',
    color: '#3b82f6', // Blue
    items: [
      { id: 'sword', label: 'Sword', icon: Sword },
      { id: 'cup', label: 'Cup', icon: CupSoda },
      { id: 'wand', label: 'Wand', icon: Feather },
      { id: 'coin', label: 'Pentacle', icon: Coins },
    ]
  }
};

// --- AUDIO ENGINE (Procedural) ---
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
    case 'click': // Sharp mechanical click
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
      
    case 'muffled-click': // Dull click behind wall
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.1);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;

    case 'thud': // Heavy door slam
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + 0.5);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      break;

    case 'lock': // High pitch tumbler lock
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;

    case 'success': // Magical chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 1.5);
      osc.start(now);
      osc.stop(now + 1.5);
      
      // Harmonics
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(554, now); // C#
      osc2.frequency.linearRampToValueAtTime(1108, now + 0.3);
      gain2.gain.setValueAtTime(0.1, now);
      gain2.gain.linearRampToValueAtTime(0, now + 1.5);
      osc2.start(now);
      osc2.stop(now + 1.5);
      break;

    case 'fail': // Dissonant low hum
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.5);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 1);
      osc.start(now);
      osc.stop(now + 1);
      break;
    
    default:
      break;
  }
};

// --- COMPONENTS ---

const InstructionOverlay = ({ onStart }: { onStart: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-6 overflow-y-auto">
    <div className="max-w-md w-full border border-purple-500/50 bg-gray-900/90 p-8 rounded-lg shadow-2xl shadow-purple-900/50 text-center animate-in fade-in zoom-in duration-500">
      <Eye className="w-16 h-16 text-purple-400 mx-auto mb-6" />
      <h1 className="text-3xl font-serif text-purple-100 mb-2 tracking-widest">THE THRESHOLD</h1>
      <h2 className="text-sm font-mono text-purple-400 mb-6 uppercase tracking-widest">Remote Viewing Barrier Trainer</h2>
      
      <div className="text-left space-y-4 text-gray-300 font-light mb-8">
        <p><strong className="text-purple-300">Protocol:</strong> You are testing your ability to perceive through solid matter.</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>The target will be chosen. The <strong>DOOR</strong> will slam shut.</li>
          <li>Behind the wall, the target is still active.</li>
          <li>Project your consciousness past the barrier.</li>
          <li>When the lock clicks, <strong>select the image</strong> you see with your inner eye.</li>
        </ol>
      </div>

      <button 
        onClick={onStart}
        className="w-full py-4 bg-purple-900 hover:bg-purple-800 border border-purple-500 text-purple-100 font-serif tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
      >
        Initiate Sequence
      </button>
    </div>
  </div>
);

const Door = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <div className="absolute inset-0 z-20 flex pointer-events-none overflow-hidden rounded-t-full">
      {/* Left Door Panel */}
      <div 
        className={`h-full w-1/2 bg-neutral-900 relative transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] border-r-4 border-black shadow-2xl flex items-center justify-end
        ${isOpen ? '-translate-x-full' : 'translate-x-0'}`}
        style={{ 
          backgroundImage: `radial-gradient(circle at right, #2a2a2a 0%, #111 100%)`,
        }}
      >
        <div className="w-full h-full opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="absolute right-4 w-2 h-32 bg-yellow-900/30 rounded-full blur-sm"></div>
      </div>

      {/* Right Door Panel */}
      <div 
        className={`h-full w-1/2 bg-neutral-900 relative transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] border-l-4 border-black shadow-2xl flex items-center justify-start
        ${isOpen ? 'translate-x-full' : 'translate-x-0'}`}
        style={{ 
          backgroundImage: `radial-gradient(circle at left, #2a2a2a 0%, #111 100%)`,
        }}
      >
        <div className="w-full h-full opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
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

export default function TheThresholdApp() {
  // State
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [categoryKey, setCategoryKey] = useState('FAMILY');
  const [gameState, setGameState] = useState('IDLE'); // IDLE, SPINNING, CLOSED_SPIN, LOCKED, REVEALING, RESULT
  const [displayIndex, setDisplayIndex] = useState(0); // For the carousel visual
  const [targetId, setTargetId] = useState<string | null>(null);
  const [userGuess, setUserGuess] = useState<string | null>(null);

  // Refs for animation loops
  const spinInterval = useRef<NodeJS.Timeout | null>(null);
  const spinTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const currentCategory = CATEGORIES[categoryKey];

  // --- LIFECYCLE ---

  useEffect(() => {
    // Check Local Storage
    const hasSeen = localStorage.getItem('the_threshold_instructions_seen');
    if (!hasSeen) {
      setShowInstructions(true);
    }
    
    // Cleanup
    return () => {
        if (spinInterval.current) clearInterval(spinInterval.current);
        if (spinTimeout.current) clearTimeout(spinTimeout.current);
    };
  }, []);

  const handleInstructionsDone = () => {
    localStorage.setItem('the_threshold_instructions_seen', 'true');
    setShowInstructions(false);
  };

  const handleStart = () => {
    if (gameState !== 'IDLE' && gameState !== 'RESULT') return;
    
    // Reset state
    setTargetId(null);
    setUserGuess(null);
    setGameState('SPINNING');
    
    // Start Visual Spin (Door Open)
    const speed = 100;
    playSound('click');
    
    // Ensure we clear any old intervals
    if (spinInterval.current) clearInterval(spinInterval.current);
    
    spinInterval.current = setInterval(() => {
      setDisplayIndex(prev => (prev + 1) % 4);
      playSound('click');
    }, speed);

    // Sequence Timing
    setTimeout(() => {
      setGameState('CLOSED_SPIN');
      playSound('thud');
      
      // Determine Target Crypto-Securely NOW (to prevent lag cheating later)
      const buffer = new Uint32Array(1);
      const win = (globalThis as any).window;
      if (win && win.crypto) {
          win.crypto.getRandomValues(buffer);
          const rand = buffer[0] / (0xffffffff + 1);
          const winningIndex = Math.floor(rand * 4);
          setTargetId(currentCategory.items[winningIndex].id);
          
          // Slow down spin sounds behind the wall
          if (spinInterval.current) clearInterval(spinInterval.current);
          
          let count = 0;
          const totalTicks = 8;
          
          const slowSpin = () => {
            if (count >= totalTicks) {
              setGameState('LOCKED');
              playSound('lock');
              setDisplayIndex(winningIndex); // Set the visual behind the door to the winner
              return;
            }
            
            // Visual keeps updating but we can't see it (door is closed)
            setDisplayIndex(prev => (prev + 1) % 4); 
            playSound('muffled-click');
            
            count++;
            // Geometric slowdown
            spinTimeout.current = setTimeout(slowSpin, 200 + (count * 100)); 
          };
          
          slowSpin();
      }
    }, 2500); // Door open for 2.5s
  };

  const handleGuess = (id: string) => {
    if (gameState !== 'LOCKED') return;
    setUserGuess(id);
    setGameState('REVEALING');
    playSound('click'); // Button press
    
    // Suspense Building (1.5s delay)
    setTimeout(() => {
      setGameState('RESULT');
      if (id === targetId) {
        playSound('success');
      } else {
        playSound('fail');
      }
    }, 1500);
  };

  const getTargetItem = () => currentCategory.items.find(i => i.id === targetId);
  const getGuessItem = () => currentCategory.items.find(i => i.id === userGuess);

  // --- RENDER ---

  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center overflow-hidden flex flex-col font-sans" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-0" />
      
      {showInstructions && <InstructionOverlay onStart={handleInstructionsDone} />}
      
      {/* Header */}
      <header className="relative z-40 p-4 flex justify-between items-center border-b border-white/10 bg-neutral-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit Training" className="text-sm" />
        </div>
        <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl tracking-wider text-transparent bg-clip-text bg-linear-to-r from-purple-300 to-indigo-300 hidden md:block">
                THE THRESHOLD
            </h1>
            <button onClick={() => setShowInstructions(true)} className="text-gray-500 hover:text-white transition p-2">
                <HelpCircle className="w-5 h-5" />
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="text-gray-500 hover:text-white transition p-2">
                <Settings className="w-5 h-5" />
            </button>
            <div className="ml-4"><RoomsButton /></div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-neutral-900 border-b border-white/10 p-6 animate-in slide-in-from-top-4 shadow-2xl">
          <h3 className="font-mono text-xs uppercase text-gray-500 mb-4">Select Protocol Deck</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => { setCategoryKey(key); setShowSettings(false); setGameState('IDLE'); }}
                className={`p-3 border rounded text-sm text-left transition-all ${
                  categoryKey === key 
                  ? 'border-purple-500 bg-purple-900/20 text-white shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                  : 'border-white/10 text-gray-400 hover:bg-white/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start py-6 gap-6 w-full max-w-lg mx-auto px-4 overflow-y-auto">
        
        {/* Status Indicator */}
        <div className="h-6 flex items-center justify-center">
          {gameState === 'IDLE' && <span className="font-mono text-xs text-purple-400 animate-pulse">SYSTEM READY... AWAITING INITIATION</span>}
          {gameState === 'SPINNING' && <span className="font-mono text-xs text-yellow-400">SHUFFLING TARGETS...</span>}
          {gameState === 'CLOSED_SPIN' && <span className="font-mono text-xs text-red-400 animate-pulse">BARRIER ACTIVE... SCANNING...</span>}
          {gameState === 'LOCKED' && <span className="font-mono text-xs text-green-400 animate-bounce">TARGET LOCKED. INPUT REQUIRED.</span>}
          {gameState === 'REVEALING' && <span className="font-mono text-xs text-white tracking-[0.2em]">BREACHING BARRIER...</span>}
          {gameState === 'RESULT' && <span className="font-mono text-xs text-white">SEQUENCE COMPLETE</span>}
        </div>

        {/* The Wall & Door Container */}
        <div className="relative w-full max-w-[280px] aspect-3/4 bg-neutral-950 rounded-t-full border-8 border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10">
          
          {/* Background / Aperture (What's behind the door) */}
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black">
             {/* The Spinning Item */}
             {currentCategory.items.map((item, idx) => {
               const Icon = item.icon;
               const isVisible = idx === displayIndex;
               return (
                 <div 
                  key={item.id}
                  className={`absolute transition-all duration-100 transform flex flex-col items-center justify-center
                    ${isVisible ? 'scale-100 opacity-100 blur-0' : 'scale-50 opacity-0 blur-xl'}
                  `}
                 >
                   <Icon 
                    size={100} 
                    color={gameState === 'RESULT' && targetId === item.id ? '#fff' : currentCategory.color} 
                    strokeWidth={1}
                    className={`drop-shadow-[0_0_15px_${currentCategory.color}] ${gameState === 'RESULT' && targetId === item.id ? 'animate-pulse' : ''}`}
                   />
                   <div className="mt-6 text-center font-serif text-xl tracking-widest uppercase opacity-80" style={{ color: currentCategory.color }}>
                     {item.label}
                   </div>
                 </div>
               );
             })}

             {/* Ghost Overlay (If Wrong) */}
             {gameState === 'RESULT' && userGuess !== targetId && (
                <div className="absolute inset-0 flex items-center justify-center opacity-30 scale-150 grayscale pointer-events-none">
                   {(() => {
                     const GuestItem = getGuessItem();
                     if (!GuestItem) return null;
                     const GIcon = GuestItem.icon;
                     return <GIcon size={180} />;
                   })()}
                </div>
             )}
          </div>

          {/* The Physical Door */}
          <Door isOpen={gameState === 'SPINNING' || gameState === 'RESULT'} />
          
        </div>

        {/* Controls */}
        <div className="w-full max-w-sm space-y-4">
          
          {/* Selection Dock */}
          <div className={`grid grid-cols-4 gap-3 transition-all duration-500 ${gameState === 'LOCKED' ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none grayscale'}`}>
            {currentCategory.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleGuess(item.id)}
                  className="aspect-square rounded-full bg-neutral-900 border border-white/20 hover:border-purple-500 hover:bg-purple-900/20 flex flex-col items-center justify-center gap-1 transition-all group shadow-lg active:scale-95"
                >
                  <Icon size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </button>
              );
            })}
          </div>

          {/* Feedback Text */}
          <div className="h-14 flex items-center justify-center text-center">
            {gameState === 'RESULT' && (
              <div className="animate-in zoom-in duration-300">
                {userGuess === targetId ? (
                  <div className="text-yellow-400 font-serif text-lg tracking-widest drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                    Target Acquired
                  </div>
                ) : (
                  <div className="space-y-1">
                     <div className="text-red-500 font-serif text-md tracking-widest">Connection Failed</div>
                     <div className="text-xs font-mono text-gray-500">Target was {getTargetItem()?.label}</div>
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
                ? 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'}
            `}
          >
            {gameState === 'IDLE' ? 'Open Barrier' : gameState === 'RESULT' ? 'Reset Protocol' : 'Sequence Running...'}
          </button>
        </div>

      </div>
      
      {/* Footer */}
      <footer className="py-4 text-center text-[10px] text-gray-600 font-mono relative z-10 bg-black/80">
        EST. 2025 // PROJECT STARGATE ARCHIVE
      </footer>
    </main>
  );
}