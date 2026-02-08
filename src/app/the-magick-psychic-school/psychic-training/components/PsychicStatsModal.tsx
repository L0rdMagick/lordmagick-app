"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Maximize2, Minimize2, Activity, Lock, X, Sparkles } from 'lucide-react';
import { calculateZScore, getPsiRank, calculatePValue, PSI_RANKS } from '../utils/psychicStats';
import ResonanceRadar, { RadarCategory } from './ResonanceRadar';

type PsychicStatsProps = {
  hits: number;
  trials: number;
  chance: number; // Probability of hit (0-1)
  appName?: string; // For saving/loading specific stats potentially
  matrixData?: {
    tp: number;
    tn: number;
    fp: number;
    fn: number;
    labels?: [string, string];
  };
  radarData?: RadarCategory[];
  maxStreak?: number;
  className?: string;
};

export default function PsychicStatsModal({ hits, trials, chance, appName, matrixData, radarData, maxStreak, className }: PsychicStatsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const zScore = (hits !== undefined && trials !== undefined) ? calculateZScore(hits, trials, chance) : 0;
  const accuracy = trials > 0 ? (hits / trials) * 100 : 0;
  const rank = getPsiRank(zScore);
  const probabilityLabel = calculatePValue(zScore);

  // --- MINIMIZED VIEW ---
  if (!isExpanded) {
    return (
      <div className={className || "absolute top-4 right-4 z-50"}>
        <button 
          onClick={() => setIsExpanded(true)}
          className="group relative bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl hover:border-indigo-500/50 transition-all flex items-center gap-4 text-left w-64"
        >
          <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500 text-indigo-400 group-hover:text-white transition-all">
             <Trophy size={20} />
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Session</span>
                <Maximize2 size={10} className="text-slate-600 group-hover:text-white transition-colors" />
             </div>
             <div className="flex items-baseline justify-between">
                <div className="text-lg font-black text-white leading-none">{hits} <span className="text-xs text-slate-500 font-bold">/ {trials}</span></div>
                <div className={`text-sm font-bold ${zScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>Z: {zScore.toFixed(2)}</div>
             </div>
             <div className={`text-[9px] font-black uppercase tracking-wider mt-1 truncate ${rank.color}`}>{rank.title}</div>
          </div>
        </button>
      </div>
    );
  }

  // --- EXPANDED VIEW ---

  if (!mounted || typeof document === 'undefined' || !document.body) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200 overflow-y-auto"
      onClick={() => setIsExpanded(false)}
    >
      <div 
        className="w-[90%] md:w-[70%] max-w-none bg-slate-900 border-x md:border border-white/10 md:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => setIsExpanded(false)}
          className="fixed md:absolute top-4 right-4 z-50 p-2 bg-black/40 md:bg-black/20 hover:bg-rose-500/20 text-slate-400 hover:text-white rounded-full transition-all backdrop-blur-md"
        >
            <X size={20} />
        </button>

        {/* MAIN SCROLLABLE CONTENT CONTAINER - SINGLE COLUMN */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-6">

            {/* 1. ADEPT ACCESS SECTION (Already a Card - No Border Change Requested) */}
            <div className="w-full bg-slate-900/80 p-3 md:p-4 rounded-xl border border-amber-500/20 shadow-xl mx-auto shrink-0 relative z-10">
                <Lock className="w-5 h-5 text-amber-500/80 mb-2 mx-auto" />
                <h3 className="text-[10px] font-black text-amber-100 uppercase tracking-widest mb-1 text-center">Adept Access Required</h3>
                <button className="mt-2 w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-400 rounded-lg font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2">
                    UNLOCK LIFETIME ANALYSIS
                </button>
            </div>

            {/* 2. PERFORMANCE SECTION (Card) */}
            <div className="w-full bg-slate-900/50 rounded-xl border border-white/20 p-4 md:p-6 shadow-md">
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="text-indigo-500" size={18} />
                        <h2 className="text-lg font-serif text-white">Performance</h2>
                    </div>
                     <div className={`text-sm font-black uppercase tracking-[0.3em] ${rank.color}`}>{rank.title}</div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2 col-span-2 text-center md:text-left">Current Session</div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-slate-400 text-xs font-bold">Hits / Trials</span>
                        <span className="text-white text-base font-mono font-bold">{hits} / {trials}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                         <span className="text-slate-400 text-xs font-bold">Accuracy</span>
                         <span className="text-white text-base font-mono font-bold">{accuracy.toFixed(1)}%</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                         <span className="text-slate-400 text-xs font-bold">Psi Score (Z)</span>
                         <span className={`text-base font-mono font-bold ${zScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{zScore.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                         <span className="text-slate-400 text-xs font-bold">Probability</span>
                         <span className="text-indigo-300 text-base font-mono font-bold">{probabilityLabel}</span>
                    </div>

                    {/* MAX STREAK ADDITION */}
                    {maxStreak !== undefined && (
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                             <span className="text-slate-400 text-xs font-bold">Max Streak</span>
                             <span className="text-amber-400 text-base font-mono font-bold">{maxStreak}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. DEFINITIONS / Z-SCORES (Card) */}
            <div className="w-full bg-slate-900/50 rounded-xl border border-white/20 p-4 md:p-6 shadow-md">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 text-center">Status Meanings</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                   {/* HITTING */}
                   <div>
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400 mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span> Psi-Hitting (Positive)
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                         {PSI_RANKS.filter(r => r.tier === 'HITTING').map(r => (
                             <div key={r.title} className="flex flex-col sm:flex-row justify-between sm:items-center text-[9px] group cursor-default hover:bg-white/5 px-2 py-2 rounded transition-colors bg-white/5 border border-white/5 gap-1 sm:gap-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                                    <span className={`font-black uppercase tracking-wider ${r.color} shrink-0`}>{r.title}</span>
                                    <span className="text-slate-400 sm:text-slate-500 truncate">{r.description}</span>
                                </div>
                                <span className="font-mono font-bold text-slate-600 whitespace-nowrap ml-0 sm:ml-2 shrink-0 self-end sm:self-auto">Z &ge; {r.minZ}</span>
                             </div>
                         ))}
                      </div>
                   </div>

                   {/* MISSING */}
                   <div>
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-400 mb-3 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span> Psi-Missing (Negative)
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                         {PSI_RANKS.filter(r => r.tier === 'MISSING').map(r => (
                            <div key={r.title} className="flex flex-col sm:flex-row justify-between sm:items-center text-[9px] group cursor-default hover:bg-white/5 px-2 py-2 rounded transition-colors bg-white/5 border border-white/5 gap-1 sm:gap-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                                    <span className={`font-black uppercase tracking-wider ${r.color} shrink-0`}>{r.title}</span>
                                    <span className="text-slate-400 sm:text-slate-500 truncate">{r.description}</span>
                                </div>
                                <span className="font-mono font-bold text-slate-600 whitespace-nowrap ml-0 sm:ml-2 shrink-0 self-end sm:self-auto">Z &le; {r.maxZ}</span>
                            </div>
                         ))}
                      </div>
                   </div>
               </div>
            </div>

            {/* 4. PERFORMANCE MATRIX (2x2 CONFUSION TABLE) */}
            {matrixData && matrixData.labels && (
                <div className="w-full bg-slate-900/50 rounded-xl border border-white/20 overflow-hidden shadow-md">
                   <div className="text-[8px] uppercase font-black tracking-widest text-center py-2 bg-white/5 text-slate-400 border-b border-white/5">Performance Matrix</div>
                   <div className="grid grid-cols-[auto_1fr_1fr] text-[10px]">
                        <div className="p-2"></div>
                        <div className="p-2 text-center font-bold text-emerald-400 border-b border-white/5 border-l border-white/5">Guess: {matrixData.labels[0]}</div>
                        <div className="p-2 text-center font-bold text-rose-400 border-b border-white/5 border-l border-white/5">Guess: {matrixData.labels[1]}</div>

                        <div className="p-2 font-bold text-cyan-400 text-right flex items-center justify-end border-b border-white/5">Was {matrixData.labels[0]}</div>
                        <div className="p-4 text-center text-lg font-bold text-white border-b border-white/5 border-l border-white/5 bg-white/5">{matrixData.tp}</div>
                        <div className="p-4 text-center text-lg font-bold text-slate-500 border-b border-white/5 border-l border-white/5">{matrixData.fn}</div>

                        <div className="p-2 font-bold text-fuchsia-400 text-right flex items-center justify-end">Was {matrixData.labels[1]}</div>
                        <div className="p-4 text-center text-lg font-bold text-slate-500 border-l border-white/5">{matrixData.fp}</div>
                        <div className="p-4 text-center text-lg font-bold text-white border-l border-white/5 bg-white/5">{matrixData.tn}</div>
                   </div>
                </div>
            )}

            {/* 5. SOUL RESONANCE (SPIDERWEB CHART + PERCENTAGES) */}
            <div className="w-full bg-slate-900/50 rounded-xl border border-white/20 p-4 md:p-6 shadow-md flex flex-col items-center justify-center">
                 {radarData && radarData.length > 0 && (
                     <div className="relative z-10 w-full flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 mb-4 text-amber-100/80 shrink-0">
                            <Activity size={16} className="text-amber-400" />
                            <h3 className="font-serif text-lg">Soul Resonance</h3>
                        </div>
                        
                        <p className="text-[10px] text-slate-500 mb-6 font-mono uppercase tracking-widest text-center">Intuition Resonance Field</p>

                        {/* RADAR PERCENTAGES (Moved Here) */}
                        <div className="grid grid-cols-3 gap-2 w-full mb-6">
                            {radarData.map(cat => (
                                <div key={cat.id} className="bg-slate-950/50 rounded-lg p-2 flex flex-col items-center justify-center border border-white/10 text-center">
                                    <span className="text-[7px] uppercase font-black tracking-widest text-slate-500 mb-0.5 truncate w-full">{cat.label}</span>
                                    <span className="text-sm font-black text-white">{Math.round(cat.value || 0)}%</span>
                                    <div className="w-full bg-white/10 h-0.5 mt-1 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${Math.min((cat.value || 0), 100)}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {radarData.length >= 3 && (
                            <div className="bg-slate-950/30 rounded-2xl p-4 border border-white/5 backdrop-blur-sm w-full max-w-[400px] aspect-square flex items-center justify-center shadow-inner relative">
                                 {/* Background Gradient for Chart */}
                                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent opacity-50 rounded-2xl pointer-events-none" />
                                <ResonanceRadar categories={radarData || []} size={340} />
                            </div>
                        )}
                     </div>
                 )}
            </div>

        </div>

      </div>
    </div>,
    document.body
  );
}
