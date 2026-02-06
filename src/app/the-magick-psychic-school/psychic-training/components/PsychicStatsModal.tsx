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
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setIsExpanded(false)}
    >
      <div 
        className="w-full max-w-5xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => setIsExpanded(false)}
          className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-rose-500/20 text-slate-400 hover:text-white rounded-full transition-all"
        >
            <X size={20} />
        </button>

        {/* CONTENT ROW */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* LEFT COLUMN: STATS BOARD */}
            <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-white/10 relative overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="text-indigo-500" size={20} />
                    <h2 className="text-xl font-serif text-white">Performance</h2>
                </div>
    
                {/* Session Header */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 border-b border-white/5 pb-6">
                    <div className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-1 col-span-2">Current Session</div>
                    
                    <div className="flex justify-between items-center py-1">
                        <span className="text-slate-400 text-sm font-bold">Hits / Trials</span>
                        <span className="text-white text-lg font-mono font-bold">{hits} / {trials}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-1">
                         <span className="text-slate-400 text-sm font-bold">Accuracy</span>
                         <span className="text-white text-lg font-mono font-bold">{accuracy.toFixed(1)}%</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                         <span className="text-slate-400 text-sm font-bold">Psi Score (Z)</span>
                         <span className={`text-lg font-mono font-bold ${zScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{zScore.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                         <span className="text-slate-400 text-sm font-bold">Probability</span>
                         <span className="text-indigo-300 text-lg font-mono font-bold">{probabilityLabel}</span>
                    </div>

                    <div className="col-span-2 text-center mt-4">
                        <div className={`text-sm font-black uppercase tracking-[0.3em] ${rank.color}`}>{rank.title}</div>
                    </div>
                </div>

                {/* VISUALS: Matrix OR Resonance Grid */}
                {/* If we have radar data, show the resonance grid blocks */}
                {radarData && radarData.length > 0 && (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {radarData.map(cat => (
                            <div key={cat.id} className="bg-white/5 rounded p-3 flex flex-col items-center justify-center border border-white/5 text-center">
                                <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 mb-1">{cat.label}</span>
                                <span className="text-lg font-black text-white">{Math.round(cat.value || 0)}%</span>
                                <span className="text-[9px] text-slate-600 font-mono">{cat.hits}/{cat.total}</span>
                            </div>
                        ))}
                     </div>
                )}

                {/* If Binary Matrix Data */}
                {matrixData && matrixData.labels && (
                    <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden mt-2">
                        <div className="text-[9px] uppercase font-black tracking-widest text-center py-2 bg-white/5 text-slate-400 border-b border-white/5">Performance Matrix</div>
                        <div className="grid grid-cols-[auto_1fr_1fr] text-xs">
                             <div className="p-2"></div>
                             <div className="p-2 text-center font-bold text-emerald-400 border-b border-white/5 border-l border-white/5">Guess: {matrixData.labels[0]}</div>
                             <div className="p-2 text-center font-bold text-rose-400 border-b border-white/5 border-l border-white/5">Guess: {matrixData.labels[1]}</div>

                             <div className="p-2 font-bold text-cyan-400 text-right flex items-center justify-end border-b border-white/5">Was {matrixData.labels[0]}</div>
                             <div className="p-4 text-center text-xl font-bold text-white border-b border-white/5 border-l border-white/5 bg-white/5">{matrixData.tp}</div>
                             <div className="p-4 text-center text-xl font-bold text-slate-500 border-b border-white/5 border-l border-white/5">{matrixData.fn}</div>

                             <div className="p-2 font-bold text-fuchsia-400 text-right flex items-center justify-end">Was {matrixData.labels[1]}</div>
                             <div className="p-4 text-center text-xl font-bold text-slate-500 border-l border-white/5">{matrixData.fp}</div>
                             <div className="p-4 text-center text-xl font-bold text-white border-l border-white/5 bg-white/5">{matrixData.tn}</div>
                        </div>
                    </div>
                )}
            </div>
    
            {/* RIGHT COLUMN: RADAR & LOCK */}
            <div className="flex-1 bg-black/50 p-6 md:p-8 flex flex-col items-center justify-start text-center space-y-8 relative overflow-hidden border-l border-white/10">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950/80 to-slate-950 pointer-events-none" />

                 {/* Radar Chart */}
                 {radarData && radarData.length >= 3 && (
                     <div className="relative z-10 w-full flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-4 text-amber-100/80">
                            <Activity size={16} className="text-amber-400" /> {/* Changed from Sparkles to Activity */}
                            <h3 className="font-serif text-lg">Soul Resonance</h3>
                        </div>
                        <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 backdrop-blur-sm w-full max-w-xs aspect-square flex items-center justify-center">
                            <ResonanceRadar categories={radarData} size={220} />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-widest">Intuition Resonance Field</p>
                     </div>
                 )}

                 {/* Lifetime Lock */}
                 <div className="relative z-10 bg-slate-900/80 p-6 rounded-2xl border border-amber-500/20 shadow-xl max-w-sm w-full mx-auto mt-auto">
                    <Lock className="w-8 h-8 text-amber-500/80 mb-3 mx-auto" />
                    <h3 className="text-xs font-black text-amber-100 uppercase tracking-widest mb-1">Adept Access Required</h3>
                    <button className="mt-4 w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-400 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                        UNLOCK LIFETIME ANALYSIS
                    </button>
                 </div>
            </div>
        </div>

        {/* FOOTER: DEFINITIONS LEGEND */}
        <div className="w-full bg-slate-950/50 border-t border-white/10 p-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[300px]">
           {/* HITTING */}
           <div>
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span> Psi-Hitting (Positive)
              </h4>
              <div className="space-y-1">
                 {PSI_RANKS.filter(r => r.tier === 'HITTING').map(r => (
                     <div key={r.title} className="flex flex-col md:flex-row md:items-baseline md:justify-between text-[10px] group cursor-default hover:bg-white/5 p-1.5 rounded transition-colors">
                        <div>
                            <span className={`font-black uppercase tracking-wider ${r.color}`}>{r.title}</span>
                            <span className="mx-2 text-slate-600 hidden md:inline">|</span>
                            <span className="text-slate-400 font-medium">{r.description}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-600 text-[9px] mt-1 md:mt-0">Z &ge; {r.minZ}</span>
                     </div>
                 ))}
              </div>
           </div>

           {/* MISSING */}
           <div>
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-400 mb-3 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span> Psi-Missing (Negative)
              </h4>
              <div className="space-y-1">
                 {PSI_RANKS.filter(r => r.tier === 'MISSING').map(r => (
                    <div key={r.title} className="flex flex-col md:flex-row md:items-baseline md:justify-between text-[10px] group cursor-default hover:bg-white/5 p-1.5 rounded transition-colors">
                        <div>
                            <span className={`font-black uppercase tracking-wider ${r.color}`}>{r.title}</span>
                            <span className="mx-2 text-slate-600 hidden md:inline">|</span>
                            <span className="text-slate-400 font-medium">{r.description}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-600 text-[9px] mt-1 md:mt-0">Z &le; {r.maxZ}</span>
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
