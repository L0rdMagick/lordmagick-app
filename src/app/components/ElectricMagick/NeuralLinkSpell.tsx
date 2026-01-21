// --- START OF FILE src/app/components/ElectricMagick/NeuralLinkSpell.tsx ---
/// <reference lib="dom" />
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, X, Brain, Network, Lock, Zap, Sparkles, HardDrive, Check, Save, Terminal
} from 'lucide-react';
import { generateElectricNeuralLink, saveSpell } from '@/lib/services/geminiService';
// FIX: Import Type from the correct file
import type { NeuralLinkResult, Session } from '@/lib/types';
import { useAudioEngine, useParticleSystem } from './hooks';
import { useSpellPersistence } from '@/hooks/useSpellPersistence';
import { BlockageErrorOverlay } from '../economy/BlockageErrorOverlay';

// ==========================================
// SUB-COMPONENTS
// ==========================================

interface TargetStageProps {
    target: string;
    setTarget: (val: string) => void;
    intent: string;
    setIntent: (val: string) => void;
    onBegin: (mode: 'standard' | 'ai') => void;
    isReplay?: boolean;
}

const TargetStage = ({ target, setTarget, intent, setIntent, onBegin, isReplay }: TargetStageProps) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-6 animate-fade-in relative z-20">
            <Brain className="text-pink-500 mb-6 animate-pulse" size={48} />
            <h2 className="text-2xl font-serif text-pink-200 mb-8 tracking-widest text-center">NEURAL TARGET</h2>
            
            <div className="w-full max-w-md space-y-6">
                <div className="group relative">
                    <label className="block text-[10px] font-mono text-pink-500/70 mb-1 tracking-widest">DESTINATION (PERSON / ENTITY)</label>
                    <input 
                        type="text" 
                        value={target}
                        onChange={(e) => !isReplay && setTarget(e.target.value)}
                        readOnly={isReplay}
                        className={`w-full bg-black/50 border-b ${isReplay ? 'border-pink-500/30 text-pink-500/70' : 'border-pink-900/50 text-pink-100'} p-4 focus:outline-none focus:border-pink-500 font-serif text-xl text-center placeholder:text-pink-900/30 transition-all uppercase`}
                        placeholder="TARGET IDENTIFIER"
                        autoFocus={!isReplay}
                    />
                    {isReplay && <Lock size={16} className="absolute right-2 top-10 text-pink-500/50" />}
                </div>

                <div className="group relative">
                     <label className="block text-[10px] font-mono text-pink-500/70 mb-1 tracking-widest">PAYLOAD (INTENT)</label>
                    <input 
                        type="text" 
                        value={intent}
                        onChange={(e) => !isReplay && setIntent(e.target.value)}
                        readOnly={isReplay}
                        className={`w-full bg-black/50 border-b ${isReplay ? 'border-pink-500/30 text-pink-500/70' : 'border-pink-900/50 text-pink-100'} p-4 focus:outline-none focus:border-pink-500 font-serif text-xl text-center placeholder:text-pink-900/30 transition-all uppercase`}
                        placeholder="COMMAND STRING"
                    />
                    {isReplay && <div className="absolute right-2 bottom-4"><Lock size={16} className="text-pink-500/50" /></div>}
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4">
                     {!isReplay && (
                     <button 
                        onClick={() => onBegin('standard')}
                        disabled={!target || !intent}
                        className="flex items-center gap-4 p-4 border border-pink-900 bg-black/60 hover:bg-pink-900/30 hover:border-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group text-left backdrop-blur-sm rounded-sm"
                    >
                        <div className="bg-pink-900/30 p-2 rounded-sm group-hover:bg-pink-500/20 transition-colors">
                            <Zap className="text-pink-600 group-hover:text-pink-400 transition-colors" size={20} />
                        </div>
                        <div>
                            <div className="text-pink-200 font-mono text-sm tracking-wider font-bold uppercase">Standard Protocol</div>
                            <div className="text-pink-700 text-[10px] tracking-wide mt-1">Direct Link. Instant. Free.</div>
                        </div>
                    </button>
                    )}

                    <button 
                        onClick={() => onBegin('ai')}
                        disabled={!target || !intent}
                        className="flex items-center gap-4 p-4 border border-purple-500/50 bg-purple-900/10 hover:bg-purple-900/30 hover:border-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed group text-left relative overflow-hidden backdrop-blur-sm rounded-sm"
                    >
                        <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 animate-pulse"></div>
                        <div className="bg-purple-900/30 p-2 rounded-sm relative z-10 group-hover:bg-purple-500/20 transition-colors">
                            <Sparkles className="text-purple-400 group-hover:text-purple-200 transition-colors" size={20} />
                        </div>
                        <div className="relative z-10">
                            <div className="text-purple-200 font-mono text-sm tracking-wider font-bold uppercase flex items-center gap-2">
                                Reality Overwrite {isReplay && "(REPLAY)"}
                            </div>
                            <div className="text-purple-400/70 text-[10px] tracking-wide mt-1">{isReplay ? "Replay Cached Session" : "AI Incantations + Void Injection. 3 Credits."}</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

interface CalibrationStageProps {
    playDrone: (active: boolean, freq?: number) => void;
    playTone: (freq: number, type?: any, dur?: number, vol?: number) => void;
    onNext: () => void;
}

const CalibrationStage = ({ playDrone, playTone, onNext }: CalibrationStageProps) => {
    const [freq, setFreq] = useState(50);
    const [aligned, setAligned] = useState(false);
    
    const targetFreq = useRef(Math.floor(Math.random() * 80) + 10);

    useEffect(() => {
        playDrone(true, 100 + freq); 
        
        const dist = Math.abs(freq - targetFreq.current);
        if (dist < 5) {
            if (!aligned) {
                setAligned(true);
                playTone(880, 'sine', 0.2);
            }
        } else {
            setAligned(false);
        }
        
        return () => playDrone(false);
    }, [freq, playDrone, playTone, aligned]);

    const handleNext = () => {
        playTone(1200, 'sine', 1);
        onNext();
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-6 select-none relative z-20">
             <div className="absolute top-24 text-pink-500/50 text-[10px] font-mono tracking-[0.5em] animate-pulse">
                CALIBRATING CARRIER WAVE
             </div>

             <div className={`w-64 h-64 rounded-full border-2 ${aligned ? 'border-pink-400 shadow-[0_0_30px_#ec4899]' : 'border-pink-900/30'} flex items-center justify-center transition-all duration-300`}>
                 <div className={`w-full h-1 bg-pink-500 transition-transform duration-75`} 
                      style={{ transform: `rotate(${freq * 3.6}deg) scale(${aligned ? 1 : 0.5})` }} />
                 <div className={`absolute w-full h-1 bg-pink-500/50 transition-transform duration-100`} 
                      style={{ transform: `rotate(${freq * -3.6}deg) scale(${aligned ? 1 : 0.5})` }} />
                 
                 {aligned && <Lock className="text-pink-200 animate-ping absolute" size={32} />}
             </div>

             <input 
                type="range" 
                min="0" max="100" 
                value={freq} 
                onChange={(e) => setFreq(parseInt(e.target.value))}
                className="w-64 mt-12 accent-pink-500"
             />

             <button 
                disabled={!aligned}
                onClick={handleNext}
                className="mt-12 px-8 py-3 border border-pink-800 text-pink-500 disabled:opacity-0 transition-opacity uppercase tracking-[0.2em] text-xs"
             >
                Lock Frequency
             </button>
        </div>
    );
};

interface IncantationStageProps {
    text: string;
    onNext: () => void;
    title: string;
    playTone: (freq: number, type?: any, dur?: number, vol?: number) => void;
    initAudio: () => void;
}

const IncantationStage = ({ text, onNext, title, playTone, initAudio }: IncantationStageProps) => {
    const [confirmed, setConfirmed] = useState(false);

    const handleConfirm = () => {
        initAudio(); // FIX: Audio Init
        playTone(400, 'square', 0.2);
        setConfirmed(true);
        setTimeout(onNext, 500);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-8 animate-fade-in relative z-20">
            <Terminal className="text-purple-400 mb-6 animate-pulse" size={48} />
            <h2 className="text-xl font-mono text-purple-300 mb-8 tracking-widest text-center uppercase">{title}</h2>
            
            <div className="bg-black/60 border border-purple-500/30 p-8 max-w-lg w-full relative overflow-hidden group">
                <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
                <p className="text-lg md:text-2xl font-serif text-pink-100 text-center leading-relaxed drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]">
                    "{text}"
                </p>
            </div>
            
            <p className="mt-8 text-pink-500/50 text-[10px] font-mono tracking-widest uppercase">
                Recite Aloud to Encode
            </p>

            <button 
                onClick={handleConfirm}
                disabled={confirmed}
                className="mt-8 px-12 py-4 bg-purple-900/20 border border-purple-500/50 text-purple-200 hover:bg-purple-900/40 hover:border-purple-400 transition-all uppercase tracking-[0.2em] text-xs rounded-sm"
            >
                {confirmed ? "Encoding..." : "Confirm & Execute"}
            </button>
        </div>
    );
};

interface VoidInjectionStageProps {
    onNext: () => void;
    playTone: (freq: number, type?: any, dur?: number, vol?: number) => void;
    initAudio: () => void;
}

const VoidInjectionStage = ({ onNext, playTone, initAudio }: VoidInjectionStageProps) => {
    const [progress, setProgress] = useState(0);
    // eslint-disable-next-line no-undef
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleInject = (e: React.MouseEvent | React.TouchEvent) => {
        if (e.cancelable) e.preventDefault();
        initAudio(); // FIX: Audio Init
        
        intervalRef.current = setInterval(() => {
            setProgress(p => {
                const next = p + 2; // Fast fill
                playTone(100 + next * 8, 'sawtooth', 0.05, 0.1);
                if (next >= 100) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    playTone(880, 'square', 0.5);
                    setTimeout(onNext, 500);
                    return 100;
                }
                return next;
            });
        }, 30);
    };

    const handleStop = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setProgress(0);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full select-none touch-none relative z-20">
            <h2 className="text-xl font-mono text-pink-400 mb-12 tracking-widest text-center animate-pulse">
                INJECTING CODE INTO VOID
            </h2>

            <div 
                className="relative w-48 h-48 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                onMouseDown={handleInject}
                onMouseUp={handleStop}
                onMouseLeave={handleStop}
                onTouchStart={handleInject}
                onTouchEnd={handleStop}
            >
                {/* Rotating Outer Ring */}
                <div className="absolute inset-0 border-2 border-dashed border-pink-900 rounded-full animate-[spin_10s_linear_infinite]"></div>
                
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="90" stroke="rgba(80,20,50,0.5)" strokeWidth="4" fill="transparent" />
                    <circle cx="96" cy="96" r="90" stroke="#ec4899" strokeWidth="4" fill="transparent" strokeDasharray={565} strokeDashoffset={565 - (565 * progress) / 100} strokeLinecap="round" />
                </svg>

                <div className="absolute inset-0 bg-pink-500 rounded-full blur-[50px] transition-opacity duration-200" style={{ opacity: progress / 100 }}></div>
                <HardDrive size={48} className={`text-pink-500 transition-all duration-200 ${progress > 50 ? 'animate-bounce text-white' : ''}`} />
            </div>

            <p className="mt-12 text-pink-700 text-[10px] font-mono tracking-widest animate-pulse">
                HOLD TO UPLOAD REALITY PATCH
            </p>
        </div>
    );
};

interface SyncStageProps {
    playTone: (freq: number, type?: any, dur?: number, vol?: number) => void;
    spawnExplosion: (x: number, y: number, color?: string, count?: number) => void;
    onNext: () => void;
    initAudio: () => void;
}

const SyncStage = ({ playTone, spawnExplosion, onNext, initAudio }: SyncStageProps) => {
    const [touches, setTouches] = useState(0);
    const [power, setPower] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const pulseInterval = setInterval(() => {
            const baseFreq = 100 + (power * 2); 
            playTone(baseFreq, 'triangle', 0.1, 0.05);
        }, 200 - (power * 1.5));

        return () => clearInterval(pulseInterval);
    }, [power, playTone]);

    const checkTouches = (e: React.TouchEvent | React.MouseEvent) => {
        initAudio(); // FIX: Audio Init on interaction
        const count = 'touches' in e ? e.touches.length : (e.buttons === 1 ? 1 : 0);
        setTouches(count);

        if (count > 0) {
            if (!intervalRef.current) {
                intervalRef.current = setInterval(() => {
                    setPower(p => {
                        const next = p + 1;
                        if (next >= 100) {
                            if(intervalRef.current) clearInterval(intervalRef.current);
                            playTone(200, 'sawtooth', 0.5);
                            setTimeout(() => playTone(880, 'sine', 2, 0), 500);
                            
                            const win = (globalThis as any).window;
                            if (win) {
                                spawnExplosion(win.innerWidth/2, win.innerHeight/2, '#ffffff', 100);
                            }
                            
                            onNext();
                            return 100;
                        }
                        return next;
                    });
                    
                    const win = (globalThis as any).window;
                    if (win) {
                        spawnExplosion(win.innerWidth/2, win.innerHeight/2, '#ec4899', 2);
                    }
                }, 50);
            }
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setPower(p => Math.max(0, p - 2));
        }
    };

    return (
        <div 
            className="flex flex-col items-center justify-center h-full w-full select-none touch-none relative z-20"
            onTouchStart={checkTouches}
            onTouchEnd={checkTouches}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onMouseDown={(e) => { checkTouches({...e, buttons: 1} as any) }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onMouseUp={(e) => { checkTouches({...e, buttons: 0} as any) }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onMouseLeave={(e) => { checkTouches({...e, buttons: 0} as any) }}
        >
            <h2 className="text-pink-400 font-mono text-xs tracking-[0.3em] mb-8 uppercase animate-pulse">
                {power < 100 ? "BRIDGE THE CIRCUIT" : "LINK CRITICAL"}
            </h2>

            <div className="relative w-full h-64 flex items-center justify-center gap-8">
                <div className={`w-24 h-24 rounded-full border-2 ${touches > 0 ? 'border-pink-200 bg-pink-900/50' : 'border-pink-900'} flex items-center justify-center transition-all duration-200`}>
                    <Network className={touches > 0 ? "text-pink-200" : "text-pink-900"} />
                </div>
                
                <div className="h-2 flex-1 bg-gray-900 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-pink-500 transition-all duration-75"
                         style={{ width: `${power}%`, boxShadow: '0 0 20px #ec4899' }}></div>
                </div>

                <div className={`w-24 h-24 rounded-full border-2 ${touches > 1 ? 'border-pink-200 bg-pink-900/50' : 'border-pink-900'} flex items-center justify-center transition-all duration-200`}>
                     <Network className={touches > 1 ? "text-pink-200" : "text-pink-900"} />
                </div>
            </div>
            
            <p className="mt-12 text-pink-800 text-[10px] font-mono uppercase text-center">
                TOUCH & HOLD BOTH NODES TO SYNC<br/>(OR CLICK AND HOLD ON DESKTOP)
            </p>
        </div>
    );
};

interface TransmitStageProps {
    onExit: () => void;
    finalLog: string;
    target: string;
    intent: string;
    saveEnabled: boolean;
    session?: Session;
    spellSystem?: any; 
    aiContent: NeuralLinkResult | null;
    setEconomyError: (e: string) => void;
}

const TransmitStage = ({ onExit, finalLog, target, intent, saveEnabled, session, spellSystem, aiContent, setEconomyError }: TransmitStageProps) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleSaveSpell = async () => {
        if (isSaved || isSaving) return;
        const userId = session?.user?.id;
        if (!userId) return;

        setIsSaving(true);
        try {
            // 1. Pay Credits
            const paid = await spellSystem.saveEconomy.spendAether(userId, 2);
            if (!paid) throw new Error("INSUFFICIENT_FUNDS");

            // 3. Save
            await saveSpell(userId, {
                name: `Neural Link: ${target.substring(0, 15)}`,
                intention: `${intent}`,
                incantation: aiContent?.incantation2 || "LINK ESTABLISHED",
                element: "Spirit",
                ritual_data: {
                    target: target,
                    mode: session ? 'ai' : 'standard', // Infer mode or pass it if available (prop is not passed currently but inferred)
                    full_ai_structure: aiContent || { finalResult: finalLog }
                }
            }, true);

            setIsSaved(true);
        } catch (error: any) {
            console.error("Save failed:", error);
            if (error.message === "INSUFFICIENT_FUNDS") {
                 setEconomyError("Insufficient Faestones");
            } else {
                spellSystem.handleSaveError(error);
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-8 text-center animate-fade-in relative z-20">
            <Activity className="text-pink-500 mb-8 animate-bounce" size={64} />
            
            <div className="w-full max-w-md bg-black/50 border border-pink-900/50 p-6 rounded font-mono text-xs text-left space-y-2 mb-8">
                <div className="text-pink-800">{"> INITIALIZING UPLINK..."}</div>
                <div className="text-pink-800">{"> ENCRYPTING PAYLOAD..."}</div>
                <div className="text-pink-800">{"> HANDSHAKE ACCEPTED."}</div>
                <div className="text-pink-200 mt-4 pt-4 border-t border-pink-900/50 animate-pulse whitespace-pre-wrap">
                    {`>> ${finalLog}`}
                </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
                {saveEnabled ? (
                    <button 
                        onClick={handleSaveSpell}
                        disabled={isSaved || isSaving}
                        className="flex items-center justify-center gap-3 px-8 py-4 border border-pink-500 bg-pink-900/20 hover:bg-pink-900/40 text-pink-200 transition-colors uppercase tracking-[0.2em] text-xs rounded-sm disabled:opacity-50"
                    >
                        {isSaved ? <Check size={16} /> : <HardDrive size={16} />}
                        <span>{isSaved ? "LINK ARCHIVED" : "ARCHIVE LINK (2 CREDITS)"}</span>
                    </button>
                ) : (
                    <div className="text-pink-800 text-[10px] tracking-widest uppercase">
                        Standard Link Active. (No Archive)
                    </div>
                )}

                <button 
                    onClick={onExit}
                    className="mt-8 text-[10px] text-pink-700 hover:text-pink-400 uppercase tracking-[0.3em] font-mono transition-colors"
                >
                    Sever Connection
                </button>
            </div>
        </div>
    );
};

// ==========================================
// MAIN ORCHESTRATOR
// ==========================================

const NeuralLinkSpell = ({ onExit, spellSystem, session, savedState }: { onExit: () => void, spellSystem: any, session?: Session, savedState?: any }) => {
    const [stage, setStage] = useState(0); 
    // Stages: 0:Target, 1:Calib, 2:Inc1, 3:Void, 4:Inc2, 5:Sync, 6:Transmit
    
    const { initAudio, playTone, playDrone } = useAudioEngine();
    const { canvasRef, spawnExplosion } = useParticleSystem();
    
    const [target, setTarget] = useState("");
    const [intent, setIntent] = useState("");
    const [mode, setMode] = useState<'standard' | 'ai'>('standard');
    const [economyError, setEconomyError] = useState<string | null>(null);
    
    // Persistent State
    const { state: spellState, setState: setSpellState, clearState, isRestored } = useSpellPersistence('neural_link_spell_state', {
        aiContent: null as NeuralLinkResult | null,
        targetPersist: '',
        intentPersist: '',
        modePersist: 'standard',
        stagePersist: 0,
        rehydrated: false
    });
    
    const setAiContent = (c: NeuralLinkResult | null) => setSpellState(prev => ({ ...prev, aiContent: c }));
    const aiContent = spellState.aiContent;
    
    // REHYDRATION
    useEffect(() => {
        // Check if we are in a return flow to prevent overwriting restored state with savedState
        const isPending = typeof window !== 'undefined' && sessionStorage.getItem('PENDING_PURCHASE');
    
        if ((isRestored || isPending) && !spellState.rehydrated) {
            return;
        }

        if (savedState && !spellState.rehydrated) {
            const rData = typeof savedState.ritual_data === 'string' ? JSON.parse(savedState.ritual_data) : savedState.ritual_data;
            const fullAi = rData?.full_ai_structure || null;

            setTarget(rData?.target || savedState.name.replace('Neural Link: ', ''));
            setIntent(savedState.intention);
            setMode(rData?.mode || 'standard');
            // If we have full AI content, restore it. If not (legacy), construct minimal
            if (fullAi) {
                setAiContent(fullAi);
            } else {
                 setAiContent({
                     incantation1: "RESTORED LINK",
                     incantation2: savedState.incantation,
                     finalResult: "CONNECTION RESTORED FROM ARCHIVES."
                 });
            }
            setStage(0); // Start from beginning
            
            // Update persist
            setSpellState({
                aiContent: fullAi || { incantation1: "RESTORED", incantation2: savedState.incantation, finalResult: "RESTORED" },
                targetPersist: rData?.target || "",
                intentPersist: savedState.intention,
                modePersist: rData?.mode || 'standard',
                stagePersist: 0,
                rehydrated: true
            });
        }
        else if (spellState.stagePersist > 0) {
             setStage(spellState.stagePersist);
             setTarget(spellState.targetPersist);
             setIntent(spellState.intentPersist);
             setMode(spellState.modePersist as any);
        }
    }, [savedState, spellState.rehydrated, isRestored]);

    // Keep Persistence Updated
    useEffect(() => {
        if (stage > 0 || target) {
            setSpellState(prev => ({
                ...prev,
                stagePersist: stage,
                targetPersist: target,
                intentPersist: intent,
                modePersist: mode
            }));
        }
    }, [stage, target, intent, mode]);

    const handleBegin = async (selectedMode: 'standard' | 'ai') => {
        if (selectedMode === 'ai' && !spellState.rehydrated) {
             if (!session?.user?.id) return;
             const paid = await spellSystem.genEconomy.spendAether(session.user.id, 3);
             if (!paid) {
                 setEconomyError("Insufficient Faestones");
                 return;
             }
        }

        initAudio();
        playTone(440, 'sine', 0.5);
        setMode(selectedMode);
        setStage(1); // Move to calibration immediately

        setStage(1); // Move to calibration immediately

        // Prefetch content only if not already present
        if (!aiContent) {
            const result = await generateElectricNeuralLink(target, intent, selectedMode);
            setAiContent(result);
        }
    };

    const handleCalibrationNext = () => {
        if (mode === 'ai') {
            setStage(2); // Go to Incantation 1
        } else {
            setStage(5); // Skip to Sync for Standard
        }
    };

    const handleIncantation1Next = () => setStage(3); // Go to Injection
    const handleInjectionNext = () => setStage(4); // Go to Incantation 2
    const handleIncantation2Next = () => setStage(5); // Go to Sync
    const handleSyncNext = () => setStage(6); // Go to Transmit

    const styles = `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
    `;

    // Render logic based on Stage ID
    const renderStage = () => {
        switch(stage) {
            case 0: return <TargetStage target={target} setTarget={setTarget} intent={intent} setIntent={setIntent} onBegin={handleBegin} isReplay={spellState.rehydrated} />;
            case 1: return <CalibrationStage playDrone={playDrone} playTone={playTone} onNext={handleCalibrationNext} />;
            case 2: return <IncantationStage text={aiContent?.incantation1 || "Initializing..."} onNext={handleIncantation1Next} title="Primary Directive" playTone={playTone} initAudio={initAudio} />;
            case 3: return <VoidInjectionStage onNext={handleInjectionNext} playTone={playTone} initAudio={initAudio} />;
            case 4: return <IncantationStage text={aiContent?.incantation2 || "Finalizing..."} onNext={handleIncantation2Next} title="Reality Overwrite" playTone={playTone} initAudio={initAudio} />;
            case 5: return <SyncStage playTone={playTone} spawnExplosion={spawnExplosion} onNext={handleSyncNext} initAudio={initAudio} />;
            case 6: return <TransmitStage onExit={onExit} finalLog={aiContent?.finalResult || "Link Established."} target={target} intent={intent} saveEnabled={mode === 'ai'} session={session} spellSystem={spellSystem} aiContent={aiContent} setEconomyError={setEconomyError} />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black text-pink-50 overflow-hidden select-none font-sans touch-none z-50">
            <button onClick={onExit} className="absolute top-6 right-6 z-50 text-pink-800 hover:text-pink-400 transition-colors"><X size={24}/></button>
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" style={{ mixBlendMode: 'screen' }} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.1)_0%,rgba(0,0,0,1)_90%)] pointer-events-none z-0" />
            
            <div className="relative z-20 h-full w-full">
                 {renderStage()}
            </div>
            <style>{styles}</style>
            <BlockageErrorOverlay 
                error={economyError} 
                onDismiss={() => setEconomyError(null)} 
            />
        </div>
    );
};

export default NeuralLinkSpell;
// --- END OF FILE src/app/components/ElectricMagick/NeuralLinkSpell.tsx ---