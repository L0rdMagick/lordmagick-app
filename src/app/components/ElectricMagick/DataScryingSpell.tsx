// --- START OF FILE src/app/components/ElectricMagick/DataScryingSpell.tsx ---
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, X, Fingerprint, Radio, Binary
} from 'lucide-react';
import { generateDataScrying } from '@/lib/services/geminiService';
import { useAudioEngine, useParticleSystem, getMagickalNumber } from './hooks';

const DataScryingSpell = ({ onExit }: { onExit: () => void }) => {
    const [stage, setStage] = useState(0); // 0: Intro, 1: Bio-Sync, 2: Tuning, 3: Focus, 4: Reveal
    const { initAudio, playTone, playDrone, modulateFilter } = useAudioEngine();
    const { canvasRef, spawnExplosion } = useParticleSystem();
    const [decodedMessage, setDecodedMessage] = useState("");

    // --- STAGE 1: BIO-SYNC (Fingerprint) ---
    const BioSyncStage = () => {
        const [progress, setProgress] = useState(0);
        const intervalRef = useRef<NodeJS.Timeout | null>(null);

        const handleStart = (e: React.PointerEvent | React.TouchEvent) => {
            e.preventDefault();
            initAudio();
            playDrone(true, 60); 
            intervalRef.current = setInterval(() => {
                setProgress(prev => {
                    const next = prev + 2; // Takes ~2.5 seconds
                    playTone(200 + next * 5, 'sawtooth', 0.1, 0.05); // Climbing pitch
                    if (next >= 100) {
                        clearInterval(intervalRef.current!);
                        spawnExplosion(window.innerWidth/2, window.innerHeight/2, '#06b6d4', 50);
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
            <div className="flex flex-col items-center justify-center h-full w-full select-none">
                <h2 className="text-2xl font-serif text-cyan-400 mb-12 tracking-[0.3em] uppercase animate-pulse">Bio-Sync Required</h2>
                
                <div 
                    className="relative w-32 h-32 flex items-center justify-center"
                    onMouseDown={handleStart}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchEnd={handleEnd}
                >
                    {/* Ring */}
                    <div className="absolute inset-0 border-2 border-cyan-900 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-cyan-400 rounded-full" 
                         style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}></div>
                    
                    {/* Icon */}
                    <Fingerprint 
                        size={64} 
                        className={`text-cyan-500 transition-all duration-200 ${progress > 0 ? 'scale-110 text-cyan-200' : 'scale-100'}`} 
                    />
                    
                    {/* Glow */}
                    <div className="absolute inset-0 bg-cyan-500 blur-xl rounded-full transition-opacity duration-200"
                         style={{ opacity: progress / 150 }}></div>
                </div>
                
                <p className="mt-12 text-cyan-700 text-[10px] font-mono tracking-widest">
                    HOLD TO INTEGRATE NERVOUS SYSTEM
                </p>
            </div>
        );
    };

    // --- STAGE 2: TUNING (The Stream) ---
    const TuningStage = () => {
        const [tuning, setTuning] = useState(50); // 0-100
        const target = useRef(getMagickalNumber(20, 80)); // Random sweet spot
        const [signalStrength, setSignalStrength] = useState(0);
        
        useEffect(() => {
            playDrone(true, 110); // Base drone
            return () => playDrone(false);
        }, [playDrone]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleMove = (e: any) => {
            const clientY = e.touches ? e.touches[0].clientX : e.clientX;
            const percent = 100 - (clientY / window.innerHeight) * 100;
            const clamped = Math.min(100, Math.max(0, percent));
            setTuning(clamped);

            // Calculate closeness to target
            const distance = Math.abs(clamped - target.current);
            const strength = Math.max(0, 100 - (distance * 5)); // Range of ~20%
            setSignalStrength(strength);

            // Audio feedback
            modulateFilter(100 + (strength * 20)); // Open filter as signal gets stronger
            
            // Haptic/Audio blip on perfect match
            if (strength > 95 && Math.random() > 0.9) {
                 playTone(880, 'sine', 0.1, 0.1);
            }

            if (strength > 98) {
                 setTimeout(() => {
                     playTone(1200, 'sine', 2, 0.5);
                     setStage(3);
                 }, 1500); // Must hold for 1.5s
            }
        };

        return (
            <div className="flex flex-col items-center justify-center h-full w-full select-none overflow-hidden"
                 onTouchMove={handleMove} onMouseMove={(e) => e.buttons === 1 && handleMove(e)}>
                
                {/* Background Matrix Rain Effect (Simplified via CSS/DOM for now) */}
                <div className="absolute inset-0 pointer-events-none flex justify-between px-4 opacity-30">
                     {Array.from({length: 10}).map((_, i) => (
                         <div key={i} className="text-[10px] text-cyan-900 font-mono writing-vertical-rl text-orientation-upright animate-pulse"
                              style={{ animationDelay: `${i * 0.2}s` }}>
                             {Array.from({length: 20}).map(() => Math.random() > 0.5 ? '1' : '0').join('')}
                         </div>
                     ))}
                </div>

                <div className="z-20 text-center space-y-8">
                    <div className="text-cyan-400 font-mono text-xs tracking-widest mb-4">
                        FREQUENCY: {tuning.toFixed(2)} Hz
                    </div>

                    {/* Visualizer */}
                    <div className="relative w-64 h-16 border border-cyan-900 bg-black/50 rounded overflow-hidden">
                        {/* Noise */}
                        <div className="absolute inset-0 bg-repeat opacity-20" 
                             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${2 - (signalStrength/50)}' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }}>
                        </div>
                        {/* Signal Wave */}
                        <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-full h-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]" 
                                  style={{ 
                                      transform: `scaleY(${1 + (signalStrength/10)})`,
                                      opacity: signalStrength / 100
                                  }}></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-cyan-600">
                        <Radio className={signalStrength > 50 ? "animate-ping" : ""} />
                        <span className="text-xs font-serif uppercase tracking-widest">
                            {signalStrength > 90 ? "SIGNAL LOCKED" : "SCANNING ETHER..."}
                        </span>
                    </div>
                </div>

                {/* Slider Thumb Graphic */}
                <div className="absolute right-4 w-1 h-64 bg-gray-800 rounded-full">
                    <div className="absolute w-4 h-4 bg-cyan-500 rounded-full -left-1.5 shadow-[0_0_10px_#06b6d4]"
                         style={{ bottom: `${tuning}%` }}></div>
                </div>
            </div>
        );
    };

    // --- STAGE 3: FOCUS (The Trance) ---
    const FocusStage = () => {
        const [gazeTime, setGazeTime] = useState(0);
        
        useEffect(() => {
            playDrone(true, 220); // Higher frequency drone
            
            // Simulate fetching data while they gaze
            generateDataScrying().then(text => setDecodedMessage(text));

            const interval = setInterval(() => {
                setGazeTime(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        playTone(440, 'sine', 3, 0.2);
                        setTimeout(() => setStage(4), 2000);
                        return 100;
                    }
                    return prev + 0.5; // Takes ~5 seconds
                });
            }, 50);
            
            return () => {
                clearInterval(interval);
                playDrone(false);
            };
        }, [playDrone, playTone]);

        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-black">
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500 blur-[100px] opacity-20 animate-pulse"></div>
                    
                    {/* The Eye */}
                    <div className="relative z-10 transition-all duration-[5000ms]" style={{ transform: `scale(${1 + gazeTime/50})` }}>
                        <Eye size={120} className="text-cyan-200" strokeWidth={0.5} />
                        <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-20 font-mono text-cyan-900 text-xs tracking-[1em] animate-pulse">
                    DECRYPTING... {Math.floor(gazeTime)}%
                </div>
            </div>
        );
    };

    // --- STAGE 4: REVEAL (The Message) ---
    const RevealStage = () => {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full px-8 text-center">
                <Binary className="text-cyan-700 mb-8 animate-bounce" size={48} />
                
                <div className="border-l-2 border-cyan-500 pl-6 py-4">
                    <h3 className="text-cyan-900 text-xs font-mono uppercase mb-4 text-left">
                        DAEMON.LOG // {new Date().toLocaleTimeString()}
                    </h3>
                    <p className="text-xl md:text-3xl font-serif text-cyan-100 leading-relaxed drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                        {decodedMessage || "PACKET LOSS DETECTED."}
                    </p>
                </div>

                <button 
                    onClick={onExit}
                    className="mt-20 px-8 py-3 border border-cyan-900 text-cyan-700 hover:text-cyan-400 hover:border-cyan-400 transition-colors uppercase tracking-[0.2em] text-xs rounded"
                >
                    Terminate Session
                </button>
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
                 {stage === 0 || stage === 1 ? <BioSyncStage /> : 
                  stage === 2 ? <TuningStage /> :
                  stage === 3 ? <FocusStage /> :
                  <RevealStage />}
            </div>
            <style>{styles}</style>
        </div>
    );
};

export default DataScryingSpell;