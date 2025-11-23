// --- START OF FILE src/app/components/ElectricMagick/NeuralLinkSpell.tsx ---
/// <reference lib="dom" />
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, X, Brain, Network, Lock
} from 'lucide-react';
import { generateElectricNeuralLink } from '@/lib/services/geminiService';
import { useAudioEngine, useParticleSystem } from './hooks';

// ==========================================
// SUB-COMPONENTS
// ==========================================

interface TargetStageProps {
    target: string;
    setTarget: (val: string) => void;
    intent: string;
    setIntent: (val: string) => void;
    onNext: () => void;
}

const TargetStage = ({ target, setTarget, intent, setIntent, onNext }: TargetStageProps) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-8 animate-fade-in">
            <Brain className="text-pink-500 mb-6 animate-pulse" size={48} />
            <h2 className="text-2xl font-serif text-pink-200 mb-8 tracking-widest text-center">NEURAL TARGET</h2>
            
            <div className="w-full max-w-md space-y-6">
                <div className="group relative">
                    <label className="block text-[10px] font-mono text-pink-500/70 mb-1 tracking-widest">DESTINATION (PERSON / ENTITY / CONCEPT)</label>
                    <input 
                        type="text" 
                        value={target}
                        // FIX: Explicitly cast target to any/HTMLInputElement to access value
                        onChange={(e) => setTarget((e.target as any).value)}
                        className="w-full bg-black/50 border-b border-pink-900/50 p-4 text-pink-100 focus:outline-none focus:border-pink-500 font-serif text-xl text-center placeholder:text-pink-900/30 transition-all"
                        placeholder="WHO ARE WE LINKING TO?"
                        autoFocus
                    />
                </div>

                <div className="group relative">
                     <label className="block text-[10px] font-mono text-pink-500/70 mb-1 tracking-widest">PAYLOAD (INTENT)</label>
                    <input 
                        type="text" 
                        value={intent}
                        // FIX: Explicitly cast target to any/HTMLInputElement to access value
                        onChange={(e) => setIntent((e.target as any).value)}
                        className="w-full bg-black/50 border-b border-pink-900/50 p-4 text-pink-100 focus:outline-none focus:border-pink-500 font-serif text-xl text-center placeholder:text-pink-900/30 transition-all"
                        placeholder="WHAT IS THE COMMAND?"
                    />
                </div>

                <button 
                    onClick={onNext}
                    disabled={!target || !intent}
                    className="w-full mt-8 py-4 border border-pink-900 text-pink-500 hover:bg-pink-900/20 hover:text-pink-200 transition-all uppercase tracking-[0.3em] text-xs disabled:opacity-30"
                >
                    Initialize Protocol
                </button>
            </div>
        </div>
    );
};

interface CalibrationStageProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playDrone: (active: boolean, freq?: number) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <div className="flex flex-col items-center justify-center h-full w-full px-6 select-none">
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
                // FIX: Cast to 'any' to access value
                onChange={(e) => setFreq(parseInt((e.target as any).value))}
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

interface SyncStageProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playTone: (freq: number, type?: any, dur?: number, vol?: number) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spawnExplosion: (x: number, y: number, color?: string, count?: number) => void;
    onNext: () => void;
}

const SyncStage = ({ playTone, spawnExplosion, onNext }: SyncStageProps) => {
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
                            
                            // FIX: Use safe globalThis cast to access window properties
                            const win = (globalThis as any).window;
                            if (win) {
                                spawnExplosion(win.innerWidth/2, win.innerHeight/2, '#ffffff', 100);
                            }
                            
                            onNext();
                            return 100;
                        }
                        return next;
                    });
                    
                    // FIX: Use safe globalThis cast to access window properties
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
            className="flex flex-col items-center justify-center h-full w-full select-none touch-none"
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
    target: string;
    intent: string;
    onExit: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playDrone: (active: boolean, freq?: number) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playTone: (freq: number, type?: any, dur?: number, vol?: number) => void;
}

const TransmitStage = ({ target, intent, onExit, playDrone, playTone }: TransmitStageProps) => {
    const [result, setResult] = useState("");
    const [statusLog, setStatusLog] = useState<string[]>([]);

    useEffect(() => {
        const run = async () => {
            playDrone(true, 440); // High carrier
            setStatusLog(prev => [...prev, "INITIALIZING UPLINK...", "ENCRYPTING PAYLOAD...", "SEARCHING FOR HOST..."]);
            
            // Call API
            const aiResponse = await generateElectricNeuralLink(target, intent);
            setResult(aiResponse);
            
            setStatusLog(prev => [...prev, "HANDSHAKE ACCEPTED.", "PAYLOAD DELIVERED.", "CLOSING PORT."]);
            playDrone(false);
            playTone(523.25, 'sine', 1);
        };
        run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-8 text-center animate-fade-in">
            <Activity className="text-pink-500 mb-8 animate-bounce" size={64} />
            
            <div className="w-full max-w-md bg-black/50 border border-pink-900/50 p-6 rounded font-mono text-xs text-left space-y-2 mb-8">
                {statusLog.map((log, i) => (
                    <div key={i} className="text-pink-800">{`> ${log}`}</div>
                ))}
                {result && (
                    <div className="text-pink-200 mt-4 pt-4 border-t border-pink-900/50 animate-pulse">
                        {`>> ${result}`}
                    </div>
                )}
            </div>

            <button 
                onClick={onExit}
                className="mt-8 px-8 py-3 border border-pink-900 text-pink-600 hover:text-pink-300 hover:border-pink-400 transition-colors uppercase tracking-[0.2em] text-xs rounded"
            >
                Sever Connection
            </button>
        </div>
    );
};

// ==========================================
// MAIN ORCHESTRATOR
// ==========================================

const NeuralLinkSpell = ({ onExit }: { onExit: () => void }) => {
    const [stage, setStage] = useState(0); // 0: Target, 1: Calibrate, 2: Sync, 3: Transmit
    const { initAudio, playTone, playDrone } = useAudioEngine();
    const { canvasRef, spawnExplosion } = useParticleSystem();
    
    const [target, setTarget] = useState("");
    const [intent, setIntent] = useState("");

    const handleTargetNext = () => {
        initAudio();
        playTone(440, 'sine', 0.5);
        setStage(1);
    };

    const handleCalibrationNext = () => {
        setStage(2);
    };

    const handleSyncNext = () => {
        setStage(3);
    };

    const styles = `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
    `;

    return (
        <div className="fixed inset-0 bg-black text-pink-50 overflow-hidden select-none font-sans touch-none z-50">
            <button onClick={onExit} className="absolute top-6 right-6 z-50 text-pink-800 hover:text-pink-400 transition-colors"><X size={24}/></button>
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" style={{ mixBlendMode: 'screen' }} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.1)_0%,rgba(0,0,0,1)_90%)] pointer-events-none z-0" />
            
            <div className="relative z-20 h-full w-full">
                 {stage === 0 ? 
                    <TargetStage 
                        target={target} setTarget={setTarget} 
                        intent={intent} setIntent={setIntent} 
                        onNext={handleTargetNext} 
                    /> : 
                  stage === 1 ? 
                    <CalibrationStage 
                        playDrone={playDrone} 
                        playTone={playTone} 
                        onNext={handleCalibrationNext} 
                    /> :
                  stage === 2 ? 
                    <SyncStage 
                        playTone={playTone} 
                        spawnExplosion={spawnExplosion} 
                        onNext={handleSyncNext} 
                    /> :
                    <TransmitStage 
                        target={target} 
                        intent={intent} 
                        playDrone={playDrone} 
                        playTone={playTone} 
                        onExit={onExit} 
                    />
                }
            </div>
            <style>{styles}</style>
        </div>
    );
};

export default NeuralLinkSpell;