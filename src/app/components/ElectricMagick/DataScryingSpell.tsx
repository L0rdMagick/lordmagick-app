// --- START OF FILE src/app/components/ElectricMagick/DataScryingSpell.tsx ---
/// <reference lib="dom" />
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Eye, X, Fingerprint, Radio, Binary, ChevronUp, ChevronDown, Zap, Sparkles, Save, Check, Lock
} from 'lucide-react';
import { generateDataScrying, saveSpell } from '@/lib/services/geminiService';
import { useAudioEngine, useParticleSystem, getMagickalNumber } from './hooks';
import type { Session } from '@/lib/types';

// --- SUB-COMPONENTS ---

interface IntentionStageProps {
    intention: string;
    setIntention: (val: string) => void;
    onBegin: (mode: 'standard' | 'ai') => void;
}

const IntentionStage: React.FC<IntentionStageProps> = ({ intention, setIntention, onBegin }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-6 animate-fade-in">
            <h2 className="text-2xl font-serif text-cyan-400 mb-6 tracking-[0.3em] uppercase text-center">Initialize Query</h2>
            
            <div className="w-full max-w-md mb-8 relative group">
                <div className="absolute -inset-1 bg-cyan-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
                <input 
                    type="text" 
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="ENTER TARGET DATA / INTENTION"
                    className="relative w-full bg-black/80 border-b-2 border-cyan-900 text-cyan-100 text-center font-mono py-4 focus:outline-none focus:border-cyan-400 placeholder:text-cyan-900 transition-all uppercase tracking-widest text-lg z-10"
                    autoFocus
                />
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs z-10">
                <button 
                    onClick={() => onBegin('standard')}
                    disabled={!intention}
                    className="flex items-center gap-4 p-4 border border-cyan-800 bg-black/60 hover:bg-cyan-900/30 hover:border-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group text-left backdrop-blur-sm"
                >
                    <Zap className="text-cyan-600 group-hover:text-cyan-400 transition-colors" size={24} />
                    <div>
                        <div className="text-cyan-200 font-mono text-sm tracking-wider font-bold">STANDARD SCAN</div>
                        <div className="text-cyan-700 text-xs">Local Database. Instant. Free.</div>
                    </div>
                </button>

                <button 
                    onClick={() => onBegin('ai')}
                    disabled={!intention}
                    className="flex items-center gap-4 p-4 border border-purple-500/50 bg-purple-900/10 hover:bg-purple-900/30 hover:border-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed group text-left relative overflow-hidden backdrop-blur-sm"
                >
                    <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 animate-pulse"></div>
                    <Sparkles className="text-purple-400 group-hover:text-purple-200 relative z-10 transition-colors" size={24} />
                    <div className="relative z-10">
                        <div className="text-purple-200 font-mono text-sm tracking-wider font-bold">AI DECRYPTION</div>
                        <div className="text-purple-400/70 text-xs">Deep Neural Analysis. 3 Credits.</div>
                    </div>
                </button>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const DataScryingSpell = ({ onExit, session }: { onExit: () => void, session?: Session }) => {
    // Stage 0: Intention, 1: Bio-Sync, 2: Tuning, 3: Focus (Generation), 4: Reveal (Result & Save)
    const [stage, setStage] = useState(0); 
    const { initAudio, playTone, playDrone, modulateFilter } = useAudioEngine();
    const { canvasRef, spawnExplosion } = useParticleSystem();
    
    // Spell Data
    const [intention, setIntention] = useState("");
    const [mode, setMode] = useState<'standard' | 'ai'>('standard');
    const [decodedMessage, setDecodedMessage] = useState("");
    
    // Saving State
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleBegin = (selectedMode: 'standard' | 'ai') => {
        setMode(selectedMode);
        setStage(1);
    };

    // --- STAGE 1: BIO-SYNC ---
    const BioSyncStage = () => {
        const [progress, setProgress] = useState(0);
        const intervalRef = useRef<NodeJS.Timeout | null>(null);

        const handleStart = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
            e.preventDefault();
            initAudio();
            playDrone(true, 60); 
            intervalRef.current = setInterval(() => {
                setProgress(prev => {
                    const next = prev + 2; 
                    playTone(200 + next * 5, 'sawtooth', 0.1, 0.05); 
                    if (next >= 100) {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        
                        const win = (globalThis as any).window;
                        if (win) {
                            spawnExplosion(win.innerWidth/2, win.innerHeight/2, '#06b6d4', 50);
                        }
                        
                        playTone(800, 'sine', 1, 0.5);
                        setTimeout(() => setStage(2), 1000);
                        return 100;
                    }
                    return next;
                });
            }, 50);
        };

        const handleEnd = () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setProgress(0);
            playDrone(false);
        };

        return (
            <div className="flex flex-col items-center justify-center h-full w-full select-none touch-none animate-fade-in">
                <h2 className="text-xl font-serif text-cyan-400 mb-12 tracking-[0.3em] uppercase animate-pulse text-center">Bio-Sync Required</h2>
                <div 
                    className="relative w-32 h-32 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                    onMouseDown={handleStart}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchEnd={handleEnd}
                >
                    <div className="absolute inset-0 border-2 border-cyan-900 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-cyan-400 rounded-full" style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}></div>
                    <Fingerprint size={64} className={`text-cyan-500 transition-all duration-200 ${progress > 0 ? 'scale-110 text-cyan-200' : 'scale-100'}`} />
                    <div className="absolute inset-0 bg-cyan-500 blur-xl rounded-full transition-opacity duration-200" style={{ opacity: progress / 100 }}></div>
                </div>
                <p className="mt-12 text-cyan-700 text-[10px] font-mono tracking-widest animate-pulse">HOLD TO INTEGRATE</p>
            </div>
        );
    };

    // --- STAGE 2: TUNING ---
    const TuningStage = () => {
        const [tuning, setTuning] = useState(50);
        const target = useRef(getMagickalNumber(15, 85)); 
        const [signalStrength, setSignalStrength] = useState(0);
        const [isLocked, setIsLocked] = useState(false);
        
        useEffect(() => {
            playDrone(true, 110); 
            return () => playDrone(false);
        }, [playDrone]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleMove = (e: any) => {
            const win = (globalThis as any).window;
            if (!win) return;

            const y = e.touches ? e.touches[0].clientY : e.clientY;
            const percent = 100 - (y / win.innerHeight) * 100;
            const clamped = Math.min(100, Math.max(0, percent));
            setTuning(clamped);

            const distance = Math.abs(clamped - target.current);
            const strength = Math.max(0, 100 - (distance * 6)); 
            setSignalStrength(strength);

            modulateFilter(100 + (strength * 25)); 
            
            if (strength > 90 && !isLocked) {
                 if (Math.random() > 0.92) playTone(880, 'sine', 0.1, 0.1); 
                 if (strength > 96) {
                    setIsLocked(true);
                    playTone(1200, 'sine', 2, 0.5);
                    setTimeout(() => setStage(3), 1000);
                 }
            }
        };

        return (
            <div className="flex flex-col items-center justify-center h-full w-full select-none overflow-hidden touch-none animate-fade-in"
                 onTouchMove={handleMove} onMouseMove={(e) => e.buttons === 1 && handleMove(e)} onMouseDown={handleMove} 
            >
                <div className={`absolute top-24 text-center transition-opacity duration-500 ${signalStrength > 20 ? 'opacity-0' : 'opacity-100'}`}>
                     <div className="flex flex-col items-center text-cyan-800 animate-bounce">
                        <ChevronUp size={24} />
                        <span className="text-[10px] font-mono tracking-widest my-2">SLIDE VERTICALLY TO TUNE</span>
                        <ChevronDown size={24} />
                     </div>
                </div>
                <div className="z-20 text-center space-y-8 pointer-events-none">
                    <div className="text-cyan-400 font-mono text-xs tracking-widest mb-4">FREQUENCY: {tuning.toFixed(2)} MHz</div>
                    <div className={`relative w-64 h-32 border-2 ${isLocked ? 'border-cyan-400 bg-cyan-900/20' : 'border-cyan-900 bg-black/50'} rounded-lg overflow-hidden transition-colors duration-300`}>
                        <div className="absolute inset-0 bg-repeat opacity-40" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${2 - (signalStrength/60)}' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#06b6d4] transition-all duration-100" style={{ transform: `scaleY(${1 + (signalStrength/5)}) scaleX(${signalStrength/100})`, opacity: signalStrength / 100 }}></div>
                        </div>
                        {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-cyan-500/20"><span className="text-cyan-100 font-bold tracking-widest animate-pulse">LOCKED</span></div>}
                    </div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center bg-linear-to-l from-cyan-900/20 to-transparent">
                    <div className="w-1 h-3/4 bg-cyan-900/50 rounded-full relative">
                        <div className="absolute w-2 h-2 bg-cyan-900/0 left-1/2 -translate-x-1/2" style={{ bottom: `${target.current}%` }}></div>
                        <div className="absolute w-6 h-6 bg-cyan-500 rounded-full left-1/2 -translate-x-1/2 shadow-[0_0_15px_#06b6d4] transition-all duration-75 ease-out" style={{ bottom: `${tuning}%` }}>
                             <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30"></div>     
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- STAGE 3: FOCUS (The Trance & Generation) ---
    const FocusStage = () => {
        const [gazeTime, setGazeTime] = useState(0);
        // Use a Ref for API completion status to avoid dependency loop in useEffect
        const isReadyRef = useRef(false);
        const [loadingStatus, setLoadingStatus] = useState("INITIALIZING...");
        
        const loadingMessages = useMemo(() => [
            "PARSING ETHERIC DATA...",
            "TRAVERSING VOID GATES...",
            "NEGOTIATING WITH THE MACHINE GOD...",
            "BYPASSING REALITY FIREWALLS...",
            "COMPILING FATE...",
            "SYNCHRONIZING TIMELINES...",
            "DECRYPTING SIGILS..."
        ], []);

        useEffect(() => {
            playDrone(true, 220); 
            
            // 1. API Call Definition
            const fetchData = async () => {
                try {
                    // Safety Timeout (15 seconds)
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error("Timeout")), 15000)
                    );
                    
                    const apiPromise = generateDataScrying(intention, mode);

                    // Race API vs Timeout
                    const result = await Promise.race([apiPromise, timeoutPromise]);
                    
                    setDecodedMessage(result as string);
                    isReadyRef.current = true; // Signal completion to the interval
                } catch (err) {
                    console.error("Scrying failed:", err);
                    setDecodedMessage(mode === 'ai' 
                        ? "SIGNAL WEAK. PACKET LOSS. TRY AGAIN." 
                        : "DATA CORRUPTED.");
                    isReadyRef.current = true; // Force completion so UI unblocks
                }
            };

            // 2. Trigger API
            fetchData();

            // 3. Status Message Cycler
            let messageIndex = 0;
            const statusInterval = setInterval(() => {
                if (!isReadyRef.current) {
                    setLoadingStatus(loadingMessages[messageIndex % loadingMessages.length]);
                    messageIndex++;
                }
            }, 2000);

            // 4. Progress Bar Animation
            const interval = setInterval(() => {
                setGazeTime(prev => {
                    const increment = mode === 'standard' ? 2 : 0.5;
                    const next = prev + increment;

                    // Stall at 85% if API isn't ready
                    if (next >= 85 && !isReadyRef.current) {
                        return 85; 
                    }

                    // Complete
                    if (next >= 100) {
                        clearInterval(interval);
                        clearInterval(statusInterval);
                        playTone(440, 'sine', 3, 0.2);
                        setTimeout(() => setStage(4), 500);
                        return 100;
                    }
                    return next;
                });
            }, 40);
            
            return () => {
                clearInterval(interval);
                clearInterval(statusInterval);
                playDrone(false);
            };
        }, []); // Empty dependency array ensures API is called exactly once

        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-black animate-fade-in px-4 text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500 blur-[100px] opacity-20 animate-pulse"></div>
                    <div className="relative z-10 transition-all duration-5000" style={{ transform: `scale(${1 + gazeTime/50})` }}>
                        <Eye size={120} className={isReadyRef.current ? "text-cyan-100" : "text-cyan-800 animate-pulse"} strokeWidth={0.5} />
                        <div className="absolute inset-0 flex items-center justify-center">
                             <div className={`w-2 h-2 bg-white rounded-full animate-ping ${isReadyRef.current ? 'opacity-100' : 'opacity-20'}`}></div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-20 font-mono text-cyan-500 text-xs tracking-[0.2em] animate-pulse h-8">
                    {Math.floor(gazeTime) >= 85 && !isReadyRef.current ? loadingStatus : `DECRYPTING... ${Math.floor(gazeTime)}%`}
                </div>
                
                <div className="w-64 h-1 bg-cyan-900/50 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 transition-all duration-100 ease-linear" style={{ width: `${gazeTime}%` }} />
                </div>
            </div>
        );
    };

    // --- STAGE 4: REVEAL (The Message) ---
    const RevealStage = () => {
        const handleBurnToDrive = async () => {
            if (isSaved || isSaving) return;
            setIsSaving(true);
            try {
                const userId = session?.user?.id || 'anon';
                await saveSpell(userId, {
                    name: `Data Scry: ${intention.substring(0, 20)}...`,
                    intention: intention,
                    incantation: decodedMessage,
                    element: "Air" 
                });
                setIsSaved(true);
            } catch (error) {
                console.error("Save failed:", error);
            } finally {
                setIsSaving(false);
            }
        };

        return (
            <div className="flex flex-col items-center justify-center h-full w-full px-8 text-center animate-fade-in">
                <Binary className="text-cyan-700 mb-8 animate-bounce" size={48} />
                
                <div className="border-l-2 border-cyan-500 pl-6 py-4 bg-black/50 backdrop-blur-sm rounded-r-lg max-w-lg mb-8 relative">
                    <div className="absolute top-0 right-0 p-2">
                        <Lock size={12} className="text-cyan-900" />
                    </div>
                    <h3 className="text-cyan-900 text-xs font-mono uppercase mb-4 text-left">
                        DAEMON.LOG // {new Date().toLocaleTimeString()}
                    </h3>
                    <p className="text-lg md:text-2xl font-serif text-cyan-100 leading-relaxed drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] whitespace-pre-line">
                        {decodedMessage || "PACKET LOSS DETECTED. RETRY."}
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <button 
                        onClick={handleBurnToDrive}
                        disabled={isSaved || isSaving}
                        className="flex items-center justify-center gap-2 px-8 py-3 border border-cyan-500 bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-200 transition-colors uppercase tracking-[0.2em] text-xs rounded disabled:opacity-50"
                    >
                        {isSaved ? <Check size={16} /> : <Save size={16} />}
                        {isSaved ? "SAVED TO DRIVE" : isSaving ? "BURNING..." : "BURN TO DRIVE (1 CREDIT)"}
                    </button>

                    <button 
                        onClick={onExit}
                        className="px-8 py-3 border border-cyan-900 text-cyan-700 hover:text-cyan-400 hover:border-cyan-400 transition-colors uppercase tracking-[0.2em] text-xs rounded"
                    >
                        Terminate Session
                    </button>
                </div>
            </div>
        );
    };

    const styles = `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
    `;

    return (
        <div className="fixed inset-0 bg-black text-cyan-50 overflow-hidden select-none font-sans touch-none z-50">
            <button onClick={onExit} className="absolute top-6 right-6 z-50 text-cyan-700 hover:text-cyan-400 transition-colors"><X size={24}/></button>
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" style={{ mixBlendMode: 'screen' }} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,rgba(0,0,0,1)_90%)] pointer-events-none z-0" />
            
            <div className="relative z-20 h-full w-full">
                 {stage === 0 ? <IntentionStage intention={intention} setIntention={setIntention} onBegin={handleBegin} /> : 
                  stage === 1 ? <BioSyncStage /> : 
                  stage === 2 ? <TuningStage /> :
                  stage === 3 ? <FocusStage /> :
                  <RevealStage />}
            </div>
            <style>{styles}</style>
        </div>
    );
};

export default DataScryingSpell;
// --- END OF FILE src/app/components/ElectricMagick/DataScryingSpell.tsx ---