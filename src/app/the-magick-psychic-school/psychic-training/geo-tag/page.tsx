"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, BarChart2, CheckCircle, XCircle, Eye, HelpCircle, Volume2, VolumeX, Maximize2, Minimize2, MapPin, Navigation, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useHaptics } from '@/hooks/useHaptics';
import PsychicStatsModal from '../components/PsychicStatsModal';
import ResonanceRadar, { RadarCategory } from '../components/ResonanceRadar';
import { TARGET_DATA, TargetLocation } from './targetData';
import { generateGameRound, calculateGameScore, ScoringResult } from './utils';

// --- CONFIG ---
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

declare var google: any;

// --- HELPERS ---
const getTargetCategory = (target: TargetLocation): string => {
  for (const [category, targets] of Object.entries(TARGET_DATA)) {
    if (targets.some(t => t.name === target.name)) return category;
  }
  return 'UNKNOWN';
};

const CATEGORY_COLORS: Record<string, string> = {
  ANCIENT: '#f59e0b', // Amber
  ARCHITECTURAL: '#3b82f6', // Blue
  NATURAL: '#10b981', // Emerald
  URBAN: '#8b5cf6', // Violet
};

export default function GeoTagApp() {
  
  // --- STATE ---
  const [gameState, setGameState] = useState<{
    status: 'SELECTION' | 'RESULTS';
    target: TargetLocation | null;
    tags: string[];
    selectedTags: string[];
    score: ScoringResult | null;
  }>({
    status: 'SELECTION',
    target: null,
    tags: [],
    selectedTags: [],
    score: null,
  });

  const [history, setHistory] = useState<{ target: TargetLocation; score: ScoringResult }[]>([]);
  const [bestScore, setBestScore] = useState(0); // Track max hits in a round
  const [showStats, setShowStats] = useState(false);
  
  const [cameraView, setCameraView] = useState<'STREET' | 'AERIAL'>('STREET');
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audio = useAudioEngine();
  const haptics = useHaptics();

  // --- REFS for Map ---
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<any>(null);
  const streetViewInstance = useRef<any>(null);

  // --- SOUND INIT ---
  useEffect(() => {
    audio.init();
    // Default ambient sound loop? 
    // audio.playAmbient('drone'); // if available
  }, []);

  // --- MAP INIT ---
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
        console.error("Google Maps API Key missing");
        return;
    }

    if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => setMapLoaded(true);
        document.head.appendChild(script);
    } else {
        setMapLoaded(true);
    }
  }, []);

  // --- MAP RENDER LOGIC ---
  useEffect(() => {
      if (!mapLoaded || !gameState.target) return;

      // DELAY to ensure DOM is ready if switching states?
      // Actually, we render map container always but hide/show overlays.
      
      // 1. Initialize Street View (if not exists or target changed)
      if (streetViewRef.current) {
          const panorama = new google.maps.StreetViewPanorama(streetViewRef.current, {
            position: { lat: gameState.target.lat, lng: gameState.target.lng },
            pov: { heading: 165, pitch: 0 },
            zoom: 1,
            disableDefaultUI: true, // Clean look
            showRoadLabels: false,
          });
          streetViewInstance.current = panorama;
      }

      // 2. Initialize Aerial Map (if needed)
      // We can lazy load this or init it hidden
      
  }, [mapLoaded, gameState.target, cameraView]);


  // --- GAME LOGIC ---

  const startNewGame = () => {
    const { target, tags } = generateGameRound();
    setGameState({
      status: 'SELECTION',
      target,
      tags,
      selectedTags: [],
      score: null // Reset score
    });
    setCameraView('STREET');
  };

  // Initial Game Start
  useEffect(() => {
    if (!gameState.target) startNewGame();
  }, []);

  const submitGuess = () => {
    if (!gameState.target) return;

    const score = calculateGameScore(gameState.target, gameState.selectedTags);
    
    // Update History
    setHistory(prev => [...prev, { target: gameState.target!, score }]);

    // Update Best Score (Max Streak concept)
    if (score.totalHits > bestScore) {
      setBestScore(score.totalHits);
    }

    setGameState(prev => ({
      ...prev,
      status: 'RESULTS',
      score
    }));
    
    // Play sound based on rank
    if (score.zScore > 1.645) { // p < 0.05
        audio.playHit();
        haptics.triggerHeavy();
    } else {
        audio.playMiss();
        haptics.triggerLight();
    }
  };

  const toggleSound = () => setSoundEnabled(!soundEnabled);


  // --- STATS CALCULATION ---
  const radarData: RadarCategory[] = useMemo(() => {
    const categories = ['ANCIENT', 'ARCHITECTURAL', 'NATURAL', 'URBAN'];
    return categories.map(cat => {
      // Find all rounds where target was in this category
      const relevantRounds = history.filter(h => getTargetCategory(h.target) === cat);
      
      let accuracy = 0;
      if (relevantRounds.length > 0) {
        const totalHits = relevantRounds.reduce((sum, r) => sum + r.score.totalHits, 0);
        // Each round has 17 selections. So "accuracy" is hints found / total selections? 
        // Or % of "Max Possible Score"? Max hits usually varies per target (some have 17 tags, some have fewer relevant ones?)
        // Actually target tags are fixed, but user selects 17.
        // Let's use: (Hits / 17) * 100 as a simple metric of "Precision" for that category.
        const totalTrials = relevantRounds.length * 17; 
        accuracy = (totalHits / totalTrials) * 100;

        // Normalizing: If max possible hits is low, accuracy looks low. 
        // But for now, simple is better. 
        // Boost visually if needed? nah.
      }

      return {
        id: cat,
        label: cat,
        value: accuracy * 2.5, // Scale up a bit visually? Typical user gets 3-5 hits. 3/17 is 17%. Chart looks empty.
        // Let's scale for visual if accuracy is generally low.
        // Or keep it real. 
        // Let's keep it real but maybe consider "Alignment" hits too? 
        // Total Hits includes Alignments in our score logic? 
        // utils.ts: totalHits = exactHits.length + alignmentHits.length. Yes.
        color: CATEGORY_COLORS[cat] || '#ffffff',
        total: relevantRounds.length
      };
    });
  }, [history]);

  const aggregateHits = history.reduce((sum, h) => sum + h.score.totalHits, 0);
  const aggregateTrials = history.length * 17; 

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col overflow-hidden font-sans text-slate-200 selection:bg-indigo-500/30">
      
      {/* HEADER */}
      <header className="h-14 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 z-50 shrink-0">
        <div className="flex items-center gap-4">
             <Link href="/the-magick-psychic-school/psychic-training" className="p-2 -ml-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
               <ArrowLeft size={18} />
             </Link>
             <h1 className="font-serif text-lg text-transparent bg-clip-text bg-linear-to-r from-indigo-200 via-purple-200 to-amber-200 font-bold tracking-wide">
               Geo Tag
             </h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={toggleSound} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT PANEL (RESULTS & SOUL RESONANCE) - Visible only on RESULTS */}
        {/* MOBILE: Height 33% (1/3) */}
        {/* DESKTOP: Width 1/3, Height Full */}
        <AnimatePresence>
          {gameState.status === 'RESULTS' && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="order-first md:w-[400px] h-[33vh] md:h-full bg-slate-900/95 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/10 flex flex-col z-30 shadow-2xl relative overflow-hidden shrink-0"
            >
               <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-6 space-y-3 md:space-y-6">
                  
                  {/* ROUND SCORE HEADER */}
                  {/* Compact Header for Mobile */}
                  <div className="flex items-center justify-between md:block">
                      <div className="text-left md:text-center">
                          <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5 md:mb-1">Score</div>
                          <div className="text-xl md:text-4xl font-black text-white drop-shadow-lg leading-none">
                              {gameState.score?.totalHits} <span className="text-xs md:text-lg text-slate-500 font-bold">/ 17</span>
                          </div>
                      </div>
                      
                      <div className={`text-xs md:text-base font-bold font-mono ${gameState.score && gameState.score.zScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          Z: {gameState.score?.zScore.toFixed(2)}
                      </div>
                  </div>

                  {/* SOUL RESONANCE CHART */}
                  <div className="bg-slate-950/50 rounded-xl p-2 md:p-4 border border-white/5 flex flex-row md:flex-col gap-2 md:gap-4 items-center h-full max-h-[140px] md:max-h-none overflow-hidden md:overflow-visible">
                      {/* Percentages List */}
                      <div className="flex-1 md:w-full min-w-0">
                          <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-indigo-300 md:mb-4 flex items-center gap-1 md:gap-2 mb-1">
                            <BarChart2 size={10} className="md:w-3 md:h-3" /> <span className="hidden md:inline">Soul Resonance</span><span className="md:hidden">Resonance</span>
                          </h3>
                          <div className="space-y-1">
                            {radarData.map(cat => (
                                <div key={cat.id} className="flex items-center gap-2 text-[8px] md:text-[10px]">
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                                    <span className="flex-1 text-slate-400 font-bold uppercase tracking-wider truncate">{cat.label}</span>
                                    <div className="w-12 md:w-16 h-1 bg-slate-800 rounded-full overflow-hidden shrink-0">
                                        <div className="h-full" style={{ width: `${Math.min(cat.value || 0, 100)}%`, backgroundColor: cat.color }}></div>
                                    </div>
                                    <span className="text-xs font-mono text-white w-6 text-right md:hidden">{Math.round(cat.value || 0)}%</span>
                                </div>
                            ))}
                          </div>
                      </div>
                      
                      {/* Radar Chart - Compact on Mobile */}
                      <div className="w-20 h-20 md:w-full md:h-40 relative shrink-0">
                         <ResonanceRadar categories={radarData} size={150} />
                      </div>
                  </div>

                  {/* ALIGNMENT LIST - Hidden on mobile to save space, available in Detailed Stats */}
                  <div className="hidden md:block">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 text-center">Tag Analysis</h3>
                      <div className="flex flex-wrap gap-2 justify-center">
                           {/* Exact Hits */}
                           {gameState.score?.exactHits.map(t => (
                               <span key={t} className="px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                   <CheckCircle size={10} /> {t}
                               </span>
                           ))}
                            {/* Alignment Hits */}
                           {gameState.score?.alignmentHits.map((t, idx) => (
                               <span key={`${t.selected}-${idx}`} className="px-2 py-1 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                   <CheckCircle size={10} /> {t.selected} (Near)
                               </span>
                           ))}
                           {/* Misses (Optional - show first few?) */}
                           {gameState.score?.misses.slice(0, 3).map(t => (
                               <span key={t} className="px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700 text-slate-500 text-[10px] font-bold uppercase tracking-wide decoration-slate-600 line-through">
                                   {t}
                               </span>
                           ))}
                      </div>
                  </div>

                  {/* ACTION BUTTONS (Desktop) */}
                  <div className="hidden md:flex flex-col gap-2 pt-2">
                      <button 
                        onClick={startNewGame}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-indigo-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                         <RefreshCw size={16} /> Next Location
                      </button>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS MAP VIEW (Right Panel) */}
        <div className="flex-1 relative min-h-0 bg-slate-900 flex flex-col">
           {/* MAP CONTAINER */}
           <div id="street-view" ref={streetViewRef} className="absolute inset-0 z-0 bg-slate-900" />
           
           {/* If Map Not Loaded */}
           {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 z-0">
                  Loading Satellite Link...
              </div>
           )}

           {/* SELECTION UI OVERLAY - Full Screen over Map */}
           {gameState.status === 'SELECTION' && (
              <div className="absolute inset-0 z-10 flex flex-col overflow-y-auto custom-scrollbar bg-slate-950/80 backdrop-blur-md p-4 md:p-12 items-center justify-center animate-in fade-in duration-500">
                 {/* TAG CLOUD */}
                 <div className="w-full max-w-5xl mx-auto text-center pb-24">
                    <h2 className="text-xl md:text-3xl font-serif text-white mb-2 drop-shadow-md">Attune to the Signal</h2>
                    <p className="text-slate-400 text-xs md:text-sm uppercase tracking-widest mb-8 md:mb-12">Select 17 Resonance Artifacts</p>
                    
                    <div className="flex flex-wrap justify-center gap-1.5 md:gap-3">
                       {gameState.tags.map(tag => {
                           const isSelected = gameState.selectedTags.includes(tag);
                           return (
                               <button
                                   key={tag}
                                   onClick={() => {
                                       if (isSelected) {
                                           setGameState(p => ({ ...p, selectedTags: p.selectedTags.filter(t => t !== tag) }));
                                       } else if (gameState.selectedTags.length < 17) {
                                            audio.playBlip();
                                            haptics.triggerLight();
                                           setGameState(p => ({ ...p, selectedTags: [...p.selectedTags, tag] }));
                                       }
                                   }}
                                   className={`
                                       px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide border transition-all duration-300
                                       ${isSelected 
                                           ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-105' 
                                           : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-200'}
                                   `}
                               >
                                   {tag}
                               </button>
                           );
                       })}
                    </div>
                 </div>

                 {/* SUBMIT BUTTON (Fixed Bottom) */}
                 <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                     <button
                        onClick={submitGuess}
                        disabled={gameState.selectedTags.length !== 17}
                        className={`
                            px-8 py-4 rounded-full font-black uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center gap-3 whitespace-nowrap
                            ${gameState.selectedTags.length === 17 
                                ? 'bg-white text-slate-950 hover:bg-indigo-50 hover:scale-105 cursor-pointer' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'}
                        `}
                     >
                        Confirm Sync ({gameState.selectedTags.length}/17)
                     </button>
                 </div>
              </div>
           )}

           {/* RESULTS OVERLAY ACTIONS (Mobile/Desktop Map Toggles) */}
           {gameState.status === 'RESULTS' && (
               <>
                {/* View Toggles - Top Right */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-lg p-1 flex flex-col gap-1 shadow-lg">
                        <button onClick={() => setCameraView('STREET')} className={`p-2 rounded-md transition-colors ${cameraView === 'STREET' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}><Eye size={18}/></button>
                        <button onClick={() => setCameraView('AERIAL')} className={`p-2 rounded-md transition-colors ${cameraView === 'AERIAL' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}><MapPin size={18}/></button>
                    </div>
                </div>

                {/* BOTTOM LEFT ACTION BUTTONS (Stats & Next) */}
                <div className="absolute bottom-6 left-6 z-50 flex flex-col gap-3 items-start">
                    {/* Next Button (Mobile Only - since desktop has it in panel) */}
                    <button 
                        onClick={startNewGame}
                        className="md:hidden flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-lg shadow-indigo-900/50"
                    >
                         <RefreshCw size={16} /> Next
                    </button>

                    {/* Detailed Stats Button */}
                    <button 
                        onClick={() => setShowStats(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-white/10 rounded-full shadow-lg backdrop-blur-md transition-transform hover:scale-105 active:scale-95 group"
                    >
                        <BarChart2 size={16} className="text-indigo-400 group-hover:text-indigo-300" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-white">Detailed Stats</span>
                    </button>
                </div>
               </>
           )}

        </div>

      </main>

      {/* STATS MODAL - Full Data */}
      <PsychicStatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        hits={aggregateHits} 
        trials={aggregateTrials} 
        chance={1/6} 
        maxStreak={bestScore}
        appName="Geo Tag"
        radarData={radarData}
      />
    </div>
  );
}
