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
  className?: string;
};

export default function PsychicStatsModal({ hits, trials, chance, appName, matrixData, radarData, className }: PsychicStatsProps) {
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
      className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200 overflow-y-auto md:overflow-hidden"
      onClick={() => setIsExpanded(false)}
    >
      <div 
        className="w-full md:max-w-5xl bg-slate-900 border-x md:border border-white/10 md:rounded-2xl shadow-2xl flex flex-col min-h-screen md:min-h-0 md:max-h-[90vh] relative overflow-visible md:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => setIsExpanded(false)}
          className="fixed md:absolute top-4 right-4 z-50 p-2 bg-black/40 md:bg-black/20 hover:bg-rose-500/20 text-slate-400 hover:text-white rounded-full transition-all backdrop-blur-md"
        >
            <X size={20} />
        </button>

        {/* CONTENT ROW */}
        <div className="flex flex-col md:flex-row md:flex-1 md:min-h-0 bg-slate-900/50">
            {/* LEFT COLUMN: STATS BOARD */}
            <div className="flex-none md:flex-1 p-4 md:p-6 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-white/5 relative md:overflow-y-auto custom-scrollbar shrink-0 pb-10 md:pb-6">
                <div className="flex items-center gap-2 mb-0 sticky top-0 bg-slate-900/95 backdrop-blur z-10 py-1">
                    <Activity className="text-indigo-500" size={18} />
                    <h2 className="text-lg font-serif text-white">Performance</h2>
                </div>
    
                {/* Session Header */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 border-b border-white/5 pb-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1 col-span-2">Current Session</div>
                    
                    <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400 text-xs font-bold">Hits / Trials</span>
                        <span className="text-white text-base font-mono font-bold">{hits} / {trials}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-0.5">
                         <span className="text-slate-400 text-xs font-bold">Accuracy</span>
                         <span className="text-white text-base font-mono font-bold">{accuracy.toFixed(1)}%</span>
                    </div>

                    <div className="flex justify-between items-center py-0.5">
                         <span className="text-slate-400 text-xs font-bold">Psi Score (Z)</span>
                         <span className={`text-base font-mono font-bold ${zScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{zScore.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center py-0.5">
                         <span className="text-slate-400 text-xs font-bold">Probability</span>
                         <span className="text-indigo-300 text-base font-mono font-bold">{probabilityLabel}</span>
                    </div>

                    <div className="col-span-2 text-center mt-2">
                        <div className={`text-xs font-black uppercase tracking-[0.3em] ${rank.color}`}>{rank.title}</div>
                    </div>
                </div>

                {/* VISUALS: Matrix OR Resonance Grid */}
                {/* If we have radar data, show the resonances in a compact grid */}
                {/* VISUALS: Matrix OR Resonance Grid */}
                {/* If we have radar data, show the resonances in a compact grid */}
                <div className="md:flex-1 md:min-h-0 pt-2 w-full">
                    {radarData && radarData.length > 0 && (
                         <div className="grid grid-cols-2 gap-2 mb-2">
                            {radarData.map(cat => (
                                <div key={cat.id} className="bg-white/5 rounded p-2 flex flex-col items-center justify-center border border-white/5 text-center min-h-[60px]">
                                    <span className="text-[8px] uppercase font-black tracking-widest text-slate-500 mb-0.5">{cat.label}</span>
                                    <span className="text-sm font-black text-white">{Math.round(cat.value || 0)}%</span>
                                    <div className="w-full bg-white/10 h-0.5 mt-1 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${Math.min((cat.value || 0), 100)}%` }}></div>
                                    </div>
                                </div>
                            ))}
                         </div>
                    )}

                    {/* If Binary Matrix Data */}
                    {matrixData && matrixData.labels && (
                        <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden mt-1">
                            <div className="text-[8px] uppercase font-black tracking-widest text-center py-1.5 bg-white/5 text-slate-400 border-b border-white/5">Performance Matrix</div>
                            <div className="grid grid-cols-[auto_1fr_1fr] text-[10px]">
                                 <div className="p-1.5"></div>
                                 <div className="p-1.5 text-center font-bold text-emerald-400 border-b border-white/5 border-l border-white/5">Guess: {matrixData.labels[0]}</div>
                                 <div className="p-1.5 text-center font-bold text-rose-400 border-b border-white/5 border-l border-white/5">Guess: {matrixData.labels[1]}</div>

                                 <div className="p-1.5 font-bold text-cyan-400 text-right flex items-center justify-end border-b border-white/5">Was {matrixData.labels[0]}</div>
                                 <div className="p-3 text-center text-lg font-bold text-white border-b border-white/5 border-l border-white/5 bg-white/5">{matrixData.tp}</div>
                                 <div className="p-3 text-center text-lg font-bold text-slate-500 border-b border-white/5 border-l border-white/5">{matrixData.fn}</div>

                                 <div className="p-1.5 font-bold text-fuchsia-400 text-right flex items-center justify-end">Was {matrixData.labels[1]}</div>
                                 <div className="p-3 text-center text-lg font-bold text-slate-500 border-l border-white/5">{matrixData.fp}</div>
                                 <div className="p-3 text-center text-lg font-bold text-white border-l border-white/5 bg-white/5">{matrixData.tn}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
    
            {/* RIGHT COLUMN: RADAR & LOCK */}
            <div className="flex-none md:flex-1 bg-black/50 p-6 md:p-6 flex flex-col items-center md:items-center justify-start md:justify-start text-center space-y-4 relative md:overflow-y-auto custom-scrollbar border-l border-white/10 shrink-0 min-h-[300px] md:min-h-0 pt-14 md:pt-6">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950/80 to-slate-950 pointer-events-none fixed" />

                 {/* Radar Chart */}
                 {radarData && radarData.length >= 3 && (
                     <div className="relative z-10 w-full flex flex-col items-center justify-center md:min-h-0 py-4 shrink-0">
                        <div className="flex items-center gap-2 mb-2 md:mb-6 text-amber-100/80 shrink-0 transform translate-y-0 relative z-20">
                            <Activity size={14} className="text-amber-400" />
                            <h3 className="font-serif text-base">Soul Resonance</h3>
                        </div>
                        <div className="bg-slate-900/50 rounded-2xl p-2 border border-white/5 backdrop-blur-sm w-full md:max-w-[400px] aspect-square flex items-center justify-center shrink-0 relative z-10">
                            <ResonanceRadar categories={radarData || []} size={340} />
                        </div>
                        <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase tracking-widest shrink-0">Intuition Resonance Field</p>
                     </div>
                 )}
                        <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase tracking-widest shrink-0">Intuition Resonance Field</p>
                     </div>
                 )}

                 {/* Lifetime Lock */}
                 <div className="relative z-10 bg-slate-900/80 p-3 md:p-4 rounded-xl border border-amber-500/20 shadow-xl max-w-sm w-full mx-auto mt-auto shrink-0 mb-4 md:mb-0">
                    <Lock className="w-5 h-5 text-amber-500/80 mb-2 mx-auto" />
                    <h3 className="text-[10px] font-black text-amber-100 uppercase tracking-widest mb-1">Adept Access Required</h3>
                    <button className="mt-2 w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-400 rounded-lg font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2">
                        UNLOCK LIFETIME ANALYSIS
                    </button>
                 </div>
            </div>
        </div>

        {/* FOOTER: DEFINITIONS LEGEND */}
        <div className="w-full bg-slate-950 border-t border-white/10 p-3 md:px-6 md:py-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 md:overflow-y-auto md:max-h-[25vh] shrink-0 md:sticky md:bottom-0 z-20">
           {/* HITTING */}
           <div>
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400 mb-2 flex items-center gap-2 sticky top-0 bg-slate-950 z-10 py-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span> Psi-Hitting (Positive)
              </h4>
              <div className="grid grid-cols-1 gap-0.5">
                 {PSI_RANKS.filter(r => r.tier === 'HITTING').map(r => (
                     <div key={r.title} className="flex justify-between items-center text-[9px] group cursor-default hover:bg-white/5 px-2 py-1 rounded transition-colors">
                        <div className="flex items-center gap-2 truncate min-w-0">
                            <span className={`font-black uppercase tracking-wider ${r.color} shrink-0`}>{r.title}</span>
                            <span className="text-slate-500 hidden sm:inline truncate">{r.description}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-600 whitespace-nowrap ml-2 shrink-0">Z &ge; {r.minZ}</span>
                     </div>
                 ))}
              </div>
           </div>

           {/* MISSING */}
           <div>
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-400 mb-2 flex items-center gap-2 sticky top-0 bg-slate-950 z-10 py-1">
                 <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span> Psi-Missing (Negative)
              </h4>
              <div className="grid grid-cols-1 gap-0.5">
                 {PSI_RANKS.filter(r => r.tier === 'MISSING').map(r => (
                    <div key={r.title} className="flex justify-between items-center text-[9px] group cursor-default hover:bg-white/5 px-2 py-1 rounded transition-colors">
                        <div className="flex items-center gap-2 truncate min-w-0">
                            <span className={`font-black uppercase tracking-wider ${r.color} shrink-0`}>{r.title}</span>
                            <span className="text-slate-500 hidden sm:inline truncate">{r.description}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-600 whitespace-nowrap ml-2 shrink-0">Z &le; {r.maxZ}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
