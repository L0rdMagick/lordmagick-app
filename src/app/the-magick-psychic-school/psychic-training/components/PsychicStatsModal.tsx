import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Maximize2, Minimize2, Activity, Lock, X } from 'lucide-react';
import { calculateZScore, getPsiRank, calculatePValue } from '../utils/psychicStats';
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

  // Use Portal to escape any parent transforms/z-index issues
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setIsExpanded(false)} // Backdrop click
    >
      <div 
        className="w-full max-w-5xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-hidden relative"
        onClick={(e) => e.stopPropagation()} // Prevent close on content click
      >
        
        {/* Close Button (X) */}
        <button 
          onClick={() => setIsExpanded(false)}
          className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-red-500/20 text-slate-400 hover:text-white rounded-full transition-all"
        >
            <X size={20} />
        </button>

        {/* LEFT COLUMN: CURRENT SESSION */}
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-white/10 relative overflow-y-auto custom-scrollbar">
            {/* Alternative Minimize Button (Legacy) - Optional, but keeping for symmetry if desired, or removing since we have X now. User asked for X. */}
            <button 
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 left-4 p-2 text-slate-500 hover:text-white transition-colors md:hidden"
            >
               <Minimize2 size={16} />
            </button>

            <div className="text-center space-y-1 mt-4">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400">Current Session</h2>
                <div className={`text-4xl md:text-5xl font-black ${rank.color} drop-shadow-lg`}>{rank.title}</div>
                <p className="text-xs text-slate-400 font-bold italic">{rank.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                    <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">PSI Score (Z)</div>
                    <div className={`text-3xl font-black ${zScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{zScore.toFixed(2)}</div>
                 </div>
                 <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                    <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Accuracy</div>
                    <div className="text-3xl font-black text-white">{accuracy.toFixed(1)}%</div>
                 </div>
                 <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                    <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Hits / Trials</div>
                    <div className="text-2xl font-black text-white">{hits} / {trials}</div>
                 </div>
                 <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                    <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Probability</div>
                    <div className="text-2xl font-black text-white">{probabilityLabel}</div>
                 </div>
            </div>

            {/* Matrix Section */}
            {matrixData && matrixData.labels && (
                <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                    <div className="text-[9px] uppercase font-black tracking-widest text-center py-2 bg-white/5 text-slate-400 border-b border-white/5">Performance Matrix</div>
                    <div className="grid grid-cols-[auto_1fr_1fr] text-xs">
                        {/* Header Row */}
                        <div className="p-2"></div>
                        <div className="p-2 text-center font-bold text-emerald-400 border-b border-white/5 border-l border-white/5">Guess: {matrixData.labels[0]}</div>
                        <div className="p-2 text-center font-bold text-rose-400 border-b border-white/5 border-l border-white/5">Guess: {matrixData.labels[1]}</div>

                        {/* Row 1 */}
                        <div className="p-2 font-bold text-cyan-400 text-right flex items-center justify-end border-b border-white/5">Was {matrixData.labels[0]}</div>
                        <div className="p-4 text-center text-xl font-bold text-white border-b border-white/5 border-l border-white/5 bg-white/5">{matrixData.tp}</div>
                        <div className="p-4 text-center text-xl font-bold text-slate-500 border-b border-white/5 border-l border-white/5">{matrixData.fn}</div>

                        {/* Row 2 */}
                        <div className="p-2 font-bold text-fuchsia-400 text-right flex items-center justify-end">Was {matrixData.labels[1]}</div>
                        <div className="p-4 text-center text-xl font-bold text-slate-500 border-l border-white/5">{matrixData.fp}</div>
                        <div className="p-4 text-center text-xl font-bold text-white border-l border-white/5 bg-white/5">{matrixData.tn}</div>
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: LIFETIME & RESONANCE */}
        <div className="flex-1 bg-black/50 p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden border-l border-white/10">
             {/* Background decorative elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950/80 to-slate-950 pointer-events-none" />

            {/* Radar Chart if Available */}
            {radarData && radarData.length >= 3 && (
                <div className="relative z-10 mb-4 bg-slate-900/50 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                    <ResonanceRadar categories={radarData} size={220} />
                </div>
            )}
            
            <div className="relative z-10 bg-slate-900/80 p-6 rounded-2xl border border-amber-500/20 shadow-xl max-w-sm w-full mx-auto">
                <Lock className="w-10 h-10 text-amber-500/80 mb-3 mx-auto" />
                
                <div className="space-y-2 mb-4">
                    <h3 className="text-sm font-black text-amber-100 uppercase tracking-widest">Adept Access Required</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                        Unlock lifetime analysis, deep resonance patterns, and historical anomaly detection.
                    </p>
                </div>
                
                {/* Mock Lifetime Stats (Blurred) */}
                <div className="space-y-2 mb-4 opacity-30 blur-[2px] select-none text-xs font-mono">
                    <div className="flex justify-between"><span>Lifetime Hits</span> <span>1,240</span></div>
                    <div className="flex justify-between"><span>Avg Z-Score</span> <span>+0.42</span></div>
                    <div className="flex justify-between"><span>Total Trials</span> <span>5,000</span></div>
                </div>

                <button className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-400 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex items-center justify-center gap-2">
                    <Activity size={12} /> Unlock Full Analysis
                </button>
            </div>
            
        </div>

      </div>
    </div>,
    document.body
  );
}
