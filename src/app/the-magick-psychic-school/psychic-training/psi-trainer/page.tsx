"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Trophy, Activity, Eye, Brain } from 'lucide-react';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';

// --- Custom SVG Icons for Game Elements ---

const DevilIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 text-red-500 fill-current drop-shadow-lg">
    <path d="M20,30 Q10,10 30,20 Q40,5 50,25 Q60,5 70,20 Q90,10 80,30 Q95,40 85,60 Q90,80 70,90 Q50,100 30,90 Q10,80 15,60 Q5,40 20,30 Z M30,45 A5,5 0 0,0 40,45 A5,5 0 0,0 30,45 M60,45 A5,5 0 0,0 70,45 A5,5 0 0,0 60,45 M35,65 Q50,75 65,65" stroke="black" strokeWidth="3" fill="currentColor" />
    <path d="M15,25 Q10,0 35,15" fill="none" stroke="currentColor" strokeWidth="4" />
    <path d="M85,25 Q90,0 65,15" fill="none" stroke="currentColor" strokeWidth="4" />
  </svg>
);

const AngelIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 text-yellow-400 fill-current drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
    <circle cx="50" cy="50" r="30" className="text-blue-200" fill="currentColor" />
    <circle cx="50" cy="50" r="25" fill="white" opacity="0.5" />
    <ellipse cx="50" cy="20" rx="20" ry="5" className="text-yellow-400" fill="none" stroke="currentColor" strokeWidth="4" />
    <path d="M10,40 Q30,20 20,60" fill="none" stroke="white" strokeWidth="4" opacity="0.8" />
    <path d="M90,40 Q70,20 80,60" fill="none" stroke="white" strokeWidth="4" opacity="0.8" />
  </svg>
);

const CardBack = () => (
  <div className="w-full h-full bg-slate-800 rounded-xl border-2 border-indigo-500/30 flex items-center justify-center relative overflow-hidden group-hover:border-indigo-400 transition-colors">
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-900"></div>
    <Eye className="w-12 h-12 text-indigo-500/50" />
    <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
  </div>
);

// --- The Core Algorithm ---

/**
 * Cryptographically Secure Shuffle
 * Uses the Fisher-Yates algorithm driven by window.crypto for true randomness.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const secureShuffle = (array: any[]) => {
  const newArray = [...array];
  const win = (globalThis as any).window;
  if (win && win.crypto) {
      for (let i = newArray.length - 1; i > 0; i--) {
        const randomBuffer = new Uint32Array(1);
        win.crypto.getRandomValues(randomBuffer);
        const j = randomBuffer[0] % (i + 1);
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
  } else {
      // Fallback
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
  }
  return newArray;
};

export default function PsiTrainer() {
  const [gameMode, setGameMode] = useState('FIND_DEVIL'); // 'FIND_DEVIL' or 'FIND_ANGEL'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cards, setCards] = useState<any[]>([]);
  const [gameState, setGameState] = useState('WAITING'); // 'WAITING', 'REVEALED'
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [feedback, setFeedback] = useState<any>(null);

  // Initialize a new round
  const startNewRound = useCallback((mode = gameMode) => {
    const isFindDevil = mode === 'FIND_DEVIL';
    const targetType = isFindDevil ? 'DEVIL' : 'ANGEL';
    const distractorType = isFindDevil ? 'ANGEL' : 'DEVIL';

    // Create the deck: 1 Target, 3 Distractors
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

  // Initial load
  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  const handleCardClick = (index: number) => {
    if (gameState === 'REVEALED') return;

    const selectedCards = [...cards];
    const clickedCard = selectedCards[index];
    
    // Flip all cards to reveal truth
    const revealedCards = selectedCards.map(c => ({ ...c, isFlipped: true }));
    setCards(revealedCards);
    setGameState('REVEALED');

    // Update Stats
    const isWin = clickedCard.isTarget;
    
    setStats(prev => {
      const newStreak = isWin ? prev.streak + 1 : 0;
      return {
        correct: prev.correct + (isWin ? 1 : 0),
        total: prev.total + 1,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak)
      };
    });

    if (isWin) {
      setFeedback({ type: 'success', message: 'Intuition Confirmed' });
    } else {
      setFeedback({ type: 'error', message: 'Target Missed' });
    }
  };

  const switchMode = () => {
    const newMode = gameMode === 'FIND_DEVIL' ? 'FIND_ANGEL' : 'FIND_DEVIL';
    setGameMode(newMode);
    // Reset stats on mode switch to keep data clean? 
    // Let's keep total stats but reset streak logic visually if desired.
    // For now, we keep cumulative stats for the session.
    startNewRound(newMode);
  };

  const getAccuracy = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.correct / stats.total) * 100);
  };

  return (
    <main className="relative min-h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 flex flex-col" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0" />
      
      {/* Header */}
      <header className="relative z-10 p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
             <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit" className="text-xs text-slate-400 hover:text-white" />
             <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-indigo-400" />
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">
                Psi-Trainer
                </h1>
             </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium">
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Accuracy</span>
              <span className={`text-lg ${getAccuracy() > 30 ? 'text-green-400' : 'text-slate-200'}`}>
                {getAccuracy()}%
              </span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Streak</span>
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-orange-400" />
                <span className="text-lg">{stats.streak}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Attempts</span>
              <span className="text-lg">{stats.total}</span>
            </div>
            <div className="ml-4"><RoomsButton /></div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto p-6 flex flex-col items-center gap-8 mt-4 w-full">
        
        {/* Mode Selector */}
        <div className="bg-slate-900 p-1.5 rounded-full border border-slate-800 flex relative">
            <button 
              onClick={() => gameMode !== 'FIND_DEVIL' && switchMode()}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                gameMode === 'FIND_DEVIL' 
                ? 'bg-red-900/30 text-red-200 shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Detect Threat (Find Devil)
            </button>
            <button 
              onClick={() => gameMode !== 'FIND_ANGEL' && switchMode()}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                gameMode === 'FIND_ANGEL' 
                ? 'bg-blue-900/30 text-blue-200 shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sense Safety (Find Angel)
            </button>
        </div>

        {/* Instructions */}
        <div className="text-center max-w-lg">
          <p className="text-slate-400 text-lg">
            {gameMode === 'FIND_DEVIL' 
              ? "Tune into your instinct. Which card feels 'heavy' or dangerous?" 
              : "Clear your mind. Which card feels 'light' or protective?"}
          </p>
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl perspective-1000">
          {cards.map((card, index) => (
            <button
              key={`${card.id}-${index}`} // Re-render unique key per deal
              onClick={() => handleCardClick(index)}
              disabled={gameState === 'REVEALED'}
              className="group relative h-48 md:h-64 w-full perspective-1000 focus:outline-none"
            >
              <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${card.isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* Front (Hidden) */}
                <div className="absolute inset-0 w-full h-full backface-hidden">
                  <CardBack />
                </div>

                {/* Back (Revealed) */}
                <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl border-2 flex items-center justify-center bg-slate-900 shadow-xl
                  ${card.type === 'DEVIL' ? 'border-red-900/50 bg-linear-to-br from-red-950/30 to-slate-900' : 'border-blue-900/50 bg-linear-to-br from-blue-950/30 to-slate-900'}
                  ${gameState === 'REVEALED' && card.isTarget ? 'ring-2 ring-offset-2 ring-offset-slate-950 ' + (card.type === 'DEVIL' ? 'ring-red-500' : 'ring-yellow-400') : ''}
                `}>
                  {card.type === 'DEVIL' ? <DevilIcon /> : <AngelIcon />}
                  
                  {/* Label for clarity */}
                  <span className={`absolute bottom-4 text-xs font-bold tracking-widest uppercase opacity-50
                    ${card.type === 'DEVIL' ? 'text-red-400' : 'text-blue-200'}
                  `}>
                    {card.type}
                  </span>
                </div>

              </div>
            </button>
          ))}
        </div>

        {/* Feedback / Control Area */}
        <div className="h-24 flex flex-col items-center justify-center w-full">
          {gameState === 'REVEALED' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col items-center gap-4">
               <div className={`text-xl font-bold flex items-center gap-2 ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {feedback.type === 'success' ? <Trophy className="w-6 h-6" /> : null}
                  {feedback.message}
               </div>
               <button 
                onClick={() => startNewRound()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-indigo-500/20"
               >
                 <RefreshCw className="w-5 h-5" />
                 Next Trial
               </button>
            </div>
          ) : (
            <div className="text-slate-500 text-sm animate-pulse">
              Select a card to lock in your choice...
            </div>
          )}
        </div>

      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-4 right-4 text-slate-600 text-xs text-right hidden md:block">
        <p>Entropy Source: window.crypto (CSPRNG)</p>
        <p>Algorithm: Fisher-Yates Shuffle</p>
      </footer>

      {/* Custom Styles for 3D Flip */}
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </main>
  );
}