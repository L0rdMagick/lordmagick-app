'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, BarChart2, MapPin, CheckCircle, XCircle, Camera } from 'lucide-react';
import Link from 'next/link';
import PsychicStatsModal from '../components/PsychicStatsModal';
import { startNewGame, calculateGameScore, GameState, ScoringResult } from './utils';

// --- UTILS ---
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// --- TYPES ---
declare global {
  interface Window {
    google: any;
  }
}

// --- STREET VIEW COMPONENT (Ported from GeoingViewing) ---
function StreetViewPanel({ coords, title, className, label }: { coords: { lat: number, lng: number }, title: string, className?: string, label?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const panoRef = useRef<any>(null);

  useEffect(() => {
    if (!coords || !containerRef.current || !window.google || !window.google.maps) return;
    
    const sv = new window.google.maps.StreetViewService();
    
    const pano = new window.google.maps.StreetViewPanorama(containerRef.current, {
        position: coords,
        pov: { heading: 165, pitch: 0 },
        zoom: 1,
        addressControl: false,
        showRoadLabels: false,
        motionTracking: true,
        linksControl: false,
        panControl: true,
        enableCloseButton: false,
        visible: false
    });
    
    panoRef.current = pano;

    // Search for panorama
    sv.getPanorama({ location: coords, radius: 50 }, (data: any, status: any) => {
        if (status === "OK") {
            pano.setPano(data.location.pano);
            pano.setVisible(true);
            setError(false);
        } else {
             // Try a wider radius if initial fails
             sv.getPanorama({ location: coords, radius: 1000 }, (data2: any, status2: any) => {
                if (status2 === "OK") {
                    pano.setPano(data2.location.pano);
                    pano.setVisible(true);
                    setError(false);
                } else {
                    console.warn(`Street View not found for ${title} at loc`, coords);
                    setError(true);
                }
             });
        }
    });

    return () => {
        if (panoRef.current) {
            panoRef.current.unbindAll();
            panoRef.current.setVisible(false);
            panoRef.current = null;
        }
    };

  }, [coords, title]);

  return (
    <div className={cn("relative bg-black/50 overflow-hidden", className)}>
        {/* Label Overlay */}
        <div className="absolute top-0 left-0 right-0 p-3 z-10 flex justify-between items-start pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
            <div>
                {label && <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">{label}</div>}
                <div className="text-xs font-bold text-white drop-shadow-md truncate max-w-[200px]">{title}</div>
            </div>
            <div className="p-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-white/70">
                <Camera size={14} />
            </div>
        </div>

        {/* Panorama Container */}
        {error ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900 border border-white/5">
                <Camera size={24} className="mb-2 opacity-50" />
                <span className="text-[10px] uppercase tracking-widest">No Visual Feed</span>
            </div>
        ) : (
            <div ref={containerRef} className="w-full h-full grayscale-[0.2]" />
        )}
    </div>
  );
}


// --- MAIN PAGE ---
export default function GeoTagApp() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [score, setScore] = useState<ScoringResult | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Load Google Maps Script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    if (!apiKey) {
         console.warn("Google Maps API Key missing");
         return;
    }

    const scriptId = 'google-maps-script';
    // Check if script already exists
    if (document.getElementById(scriptId)) {
        if (window.google && window.google.maps) {
            setGoogleLoaded(true);
        } else {
             // Maybe loaded but not ready? checking interval?
             const interval = setInterval(() => {
                 if (window.google && window.google.maps) {
                     setGoogleLoaded(true);
                     clearInterval(interval);
                 }
             }, 100);
        }
        return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&v=weekly`;
    script.async = true;
    script.onload = () => {
      if (window.google && window.google.maps) {
        setGoogleLoaded(true);
      }
    };
    document.head.appendChild(script);
  }, []);

  // Initialize Game
  useEffect(() => {
    startNewRound();
  }, []);

  const startNewRound = () => {
    const newState = startNewGame();
    setGameState(newState);
    setScore(null);
    setShowStats(false);
  };

  const toggleTag = (tag: string) => {
    if (!gameState) return;
    
    setGameState(prev => {
      if (!prev) return null;
      const isSelected = prev.selectedTags.includes(tag);
      let newSelected = [...prev.selectedTags];
      
      if (isSelected) {
        newSelected = newSelected.filter(t => t !== tag);
      } else {
        if (newSelected.length < 17) {
          newSelected.push(tag);
        }
      }
      
      return { ...prev, selectedTags: newSelected };
    });
  };

  const submitGuess = () => {
    if (!gameState) return;
    const result = calculateGameScore(gameState.target, gameState.selectedTags);
    setScore(result);
    setGameState(prev => prev ? { ...prev, status: 'RESULTS' } : null);
    // Show map (Reveal) immediately. Stats can be toggled.
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="relative z-20 flex justify-between items-center p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/the-magick-psychic-school/psychic-training" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Exit</span>
          </Link>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
           <h1 className="text-xl font-serif tracking-widest text-amber-500/90 glow-amber">GEO TAG</h1>
        </div>

        <div className="flex items-center gap-2">
           {score && (
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => setShowStats(true)}>
                <BarChart2 className="w-5 h-5 text-amber-400" />
              </button>
           )}
           <button className="p-2 hover:bg-white/10 rounded-full transition-colors" onClick={startNewRound}>
             <RefreshCw className="w-5 h-5 text-slate-400 hover:text-white" />
           </button>
        </div>
      </header>
      
      {/* MAIN CONTENT */}
      <main className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
         
         {/* RESULT VIEW (MAP) - Only visible when RESULTS */}
         <AnimatePresence>
           {gameState?.status === 'RESULTS' && googleLoaded && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 z-0 bg-black"
             >
                <StreetViewPanel 
                    coords={{ lat: gameState.target.lat, lng: gameState.target.lng }}
                    title={gameState.target.name}
                    label={`${gameState.target.region}`}
                    className="w-full h-full"
                />
             </motion.div>
           )}
         </AnimatePresence>

         {/* TAG CLOUD / GAME AREA */}
         {gameState?.status === 'SELECTION' && (
           <div className="absolute inset-0 z-10 flex flex-col p-4 md:p-8 overflow-y-auto custom-scrollbar bg-slate-950">
              <div className="flex justify-between items-center mb-6">
                 <div className="text-slate-400 text-sm">
                    Select the 17 tags that resonate with the target location.
                 </div>
                 <div className="text-amber-500 font-mono font-bold text-lg">
                    {gameState.selectedTags.length} / 17
                 </div>
              </div>

              {/* TAG GRID */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 justify-center content-start pb-20">
                  {gameState.allTags.map((tag, i) => {
                     const isSelected = gameState.selectedTags.includes(tag);
                     return (
                       <button
                         key={`${tag}-${i}`}
                         onClick={() => toggleTag(tag)}
                         className={cn(
                           "px-3 py-1.5 rounded-full text-xs md:text-sm transition-all duration-300 border",
                           isSelected 
                             ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105"
                             : "bg-slate-900/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-500 hover:text-slate-200"
                         )}
                       >
                         {tag}
                       </button>
                     );
                  })}
                </div>
              </div>

              {/* ACTION BAR */}
              <div className="mt-6 flex justify-center sticky bottom-0 py-4 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none">
                 <button 
                    onClick={submitGuess}
                    disabled={gameState.selectedTags.length !== 17}
                    className={cn(
                        "pointer-events-auto w-full max-w-sm font-bold tracking-widest transition-all duration-500 h-10 rounded-md flex items-center justify-center",
                        gameState.selectedTags.length === 17 
                          ? "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                          : "bg-slate-800 text-slate-500"
                    )}
                 >
                    {gameState.selectedTags.length === 17 ? "REVEAL LOCATION" : `SELECT ${17 - gameState.selectedTags.length} MORE`}
                 </button>
              </div>
           </div>
         )}
      </main>

      {/* STATS MODAL */}
      <PsychicStatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        hits={score?.totalHits || 0}
        trials={17}
        chance={1/6} 
      >
         {/* Custom Detail View inside the modal for "Detailed Stats" */}
         {score && (
            <div className="mt-6 space-y-6">
                <div className="text-center">
                    <h3 className="text-amber-400 font-serif text-xl">{gameState?.target.name}</h3>
                    <p className="text-slate-400 text-xs uppercase">{gameState?.target.region}</p>
                </div>

               {/* HITS BREAKDOWN */}
               <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-widest text-slate-500 border-b border-slate-700 pb-1">Soul Resonance (Tag Groups)</h4>
                  <div className="flex flex-wrap gap-2">
                     {score.soulResonance.map(group => (
                        <span key={group} className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                           {group}
                        </span>
                     ))}
                     {score.soulResonance.length === 0 && <span className="text-xs text-slate-600 italic">No strong resonance detected.</span>}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-3 rounded border border-green-500/20">
                     <div className="flex items-center gap-2 mb-2 text-green-400 text-sm font-bold uppercase tracking-wide">
                        <CheckCircle className="w-4 h-4" /> Hits
                     </div>
                     <div className="max-h-32 overflow-y-auto text-xs space-y-1 custom-scrollbar">
                        {score.exactHits.map(t => <div key={t} className="text-slate-300">{t}</div>)}
                        {score.alignmentHits.map(h => (
                           <div key={h.selected} className="text-slate-400 flex justify-between">
                              <span>{h.selected}</span>
                              <span className="text-slate-600 text-[10px] italic">({h.groupName})</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="bg-slate-900/50 p-3 rounded border border-red-500/20">
                     <div className="flex items-center gap-2 mb-2 text-red-400 text-sm font-bold uppercase tracking-wide">
                        <XCircle className="w-4 h-4" /> Misses
                     </div>
                     <div className="max-h-32 overflow-y-auto text-xs space-y-1 custom-scrollbar text-slate-500">
                        {score.misses.map(t => <div key={t}>{t}</div>)}
                     </div>
                  </div>
               </div>
            </div>
         )}
      </PsychicStatsModal>
      
    </div>
  );
}
