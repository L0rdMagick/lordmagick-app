// --- START OF FILE src/app/components/ElectricMagick/LightPrismSpell.tsx ---
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Triangle, Sun, X, Zap } from 'lucide-react';
import { generateElectricLightPrism } from '@/lib/services/geminiService';
import { useAudioEngine, useParticleSystem } from './hooks';

// --- CONFIGURATION ---
const RAYS = [
    { name: "CRIMSON", intent: "VITALITY & POWER", color: "#ef4444", freq: 396 },
    { name: "AMBER", intent: "CREATIVITY & FLOW", color: "#f59e0b", freq: 417 },
    { name: "EMERALD", intent: "GROWTH & WEALTH", color: "#10b981", freq: 528 },
    { name: "AZURE", intent: "TRUTH & CLARITY", color: "#3b82f6", freq: 639 },
    { name: "VIOLET", intent: "SPIRIT & MYSTERY", color: "#8b5cf6", freq: 852 },
    { name: "PEARL", intent: "PURIFICATION", color: "#ffffff", freq: 963 },
];

// --- SUB-COMPONENTS ---

interface SelectionStageProps {
    onSelect: (ray: typeof RAYS[0]) => void;
}

const SelectionStage = ({ onSelect }: SelectionStageProps) => (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 animate-fade-in overflow-y-auto py-10">
        <Triangle className="text-white mb-8 animate-spin-slow" size={48} strokeWidth={1} />
        <h2 className="text-2xl font-serif text-white mb-8 tracking-[0.3em] text-center">CHOOSE YOUR RAY</h2>
        
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
            {RAYS.map((ray) => (
                <button
                    key={ray.name}
                    onClick={() => onSelect(ray)}
                    className="group relative overflow-hidden border border-white/20 p-6 rounded transition-all duration-300 hover:border-white hover:scale-105"
                >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                         style={{ backgroundColor: ray.color }}></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <span className="font-serif text-lg tracking-widest text-white">{ray.name}</span>
                        <span className="text-[10px] font-mono text-gray-400">{ray.intent}</span>
                    </div>
                </button>
            ))}
        </div>
    </div>
);

interface GatheringStageProps {
    onNext: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playDrone: (active: boolean, freq?: number) => void;
}

const GatheringStage = ({ onNext, playDrone }: GatheringStageProps) => {
    const [charge, setCharge] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleStart = (e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        playDrone(true, 100);
        intervalRef.current = setInterval(() => {
            setCharge(prev => {
                if (prev >= 100) {
                    if(intervalRef.current) clearInterval(intervalRef.current);
                    onNext();
                    return 100;
                }
                return prev + 1; // ~2 seconds to fill
            });
        }, 20);
    };

    const handleEnd = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCharge(0);
        playDrone(false);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full select-none bg-black transition-colors duration-100"
             style={{ backgroundColor: `rgba(255,255,255,${charge/200})` }}>
            
            <div 
                className="relative cursor-pointer touch-none"
                onMouseDown={handleStart}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchEnd={handleEnd}
            >
                <div className="absolute inset-0 bg-white rounded-full blur-[50px] transition-opacity duration-100"
                     style={{ opacity: charge / 100 }}></div>
                
                <Sun 
                    size={80} 
                    className={`text-white transition-transform duration-200 ${charge > 0 ? 'scale-110' : 'scale-100'}`} 
                />
            </div>
            
            <p className={`mt-12 font-mono text-xs tracking-[0.3em] transition-colors ${charge > 50 ? 'text-black' : 'text-white'}`}>
                HOLD TO DRAW DOWN THE WHITE LIGHT
            </p>
        </div>
    );
};

interface RefractionStageProps {
    targetRay: typeof RAYS[0];
    onNext: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playTone: (freq: number, type?: any, dur?: number, vol?: number) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playDrone: (active: boolean, freq?: number) => void;
    modulateFilter: (val: number) => void;
}

const RefractionStage = ({ targetRay, onNext, playTone, playDrone, modulateFilter }: RefractionStageProps) => {
    const [angle, setAngle] = useState(0); // 0 to 100 slider value
    const [intensity, setIntensity] = useState(0); // How close to perfect
    const [locked, setLocked] = useState(false);
    
    // The "Sweet Spot" is random each time
    const sweetSpot = useRef(Math.floor(Math.random() * 70) + 15);

    useEffect(() => {
        playDrone(true, 200);
        return () => playDrone(false);
    }, [playDrone]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (e: any) => {
        const val = parseInt(e.target.value);
        setAngle(val);

        const dist = Math.abs(val - sweetSpot.current);
        const newIntensity = Math.max(0, 100 - (dist * 4)); // 25 unit range
        setIntensity(newIntensity);

        // Audio Feedback
        // As we get closer, filter opens up (brighter sound) + pitch modulation
        modulateFilter(200 + (newIntensity * 20)); 
        
        if (newIntensity > 95 && !locked) {
            if (Math.random() > 0.8) {
                playTone(targetRay.freq * 2, 'sine', 0.1, 0.1); // Sparkle sound
            }
        }
    };

    const handleHold = (e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        if (intensity > 90 && !locked) {
            setLocked(true);
            playTone(targetRay.freq, 'sawtooth', 2, 0.5);
            setTimeout(onNext, 2000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-6 overflow-hidden">
            {/* The Prism Visual */}
            <div className="relative w-full max-w-xs aspect-square flex items-center justify-center mb-12">
                {/* The Beam Input (White) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-1/2 bg-gradient-to-b from-white to-transparent opacity-50" />
                
                {/* The Crystal */}
                <div className="relative z-10 transition-transform duration-300" style={{ transform: `rotate(${angle - 50}deg)` }}>
                     <Triangle 
                        size={160} 
                        className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" 
                        strokeWidth={1}
                        fill="rgba(255,255,255,0.1)"
                     />
                </div>

                {/* The Refracted Beam (Output) */}
                {/* This grows and colors as intensity increases */}
                <div 
                    className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none blur-3xl transition-all duration-100"
                    style={{ 
                        backgroundColor: targetRay.color,
                        opacity: intensity / 100,
                        transform: `scale(${0.5 + (intensity/100)})`
                    }}
                />
            </div>

            {/* Slider */}
            <div className="w-full max-w-md space-y-2">
                <input 
                    type="range" 
                    min="0" max="100" 
                    value={angle} 
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-500 tracking-widest">
                    <span>REFRACT</span>
                    <span>FOCUS</span>
                    <span>ALIGN</span>
                </div>
            </div>

            {/* Lock Button */}
            <button
                onMouseDown={handleHold}
                onTouchStart={handleHold}
                disabled={intensity < 90}
                className={`mt-12 w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300
                    ${intensity > 90 
                        ? 'border-white bg-white/10 shadow-[0_0_30px_white] scale-110' 
                        : 'border-gray-800 text-gray-800 opacity-50'
                    }`}
                style={{ borderColor: intensity > 90 ? targetRay.color : undefined }}
            >
                <Zap size={32} className={intensity > 90 ? "text-white animate-pulse" : "text-gray-800"} />
            </button>

            <p className="mt-8 text-gray-400 text-[10px] font-mono tracking-[0.2em] text-center">
                {locked ? "RESONANCE CRITICAL" : "TUNE THE PRISM TO THE FREQUENCY"}
            </p>
        </div>
    );
};

interface ProjectionStageProps {
    ray: typeof RAYS[0];
    onExit: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playTone: (freq: number, type?: any, dur?: number, vol?: number) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spawnExplosion: (x: number, y: number, color?: string, count?: number) => void;
}

const ProjectionStage = ({ ray, onExit, playTone, spawnExplosion }: ProjectionStageProps) => {
    const [message, setMessage] = useState("");

    useEffect(() => {
        const run = async () => {
            spawnExplosion(window.innerWidth/2, window.innerHeight/2, ray.color, 100);
            playTone(ray.freq, 'sine', 3, 0.3); // The Solfeggio freq
            
            const msg = await generateElectricLightPrism(ray.name, ray.intent);
            setMessage(msg);
        };
        run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div 
            className="flex flex-col items-center justify-center h-full w-full px-8 text-center animate-fade-in transition-colors duration-1000"
            style={{ 
                background: `radial-gradient(circle at center, ${ray.color}22 0%, black 100%)`
            }}
        >
            <Sun className="mb-8 animate-spin-slow" size={80} style={{ color: ray.color }} />
            
            <div className="border-y border-white/20 py-8 w-full max-w-md backdrop-blur-sm">
                <h3 className="text-white font-serif text-2xl tracking-widest mb-4">{ray.name} RAY PROJECTED</h3>
                {message ? (
                    <p className="font-serif text-lg leading-relaxed text-gray-200 animate-fade-in drop-shadow-md">
                        &quot;{message}&quot;
                    </p>
                ) : (
                    <p className="font-mono text-xs text-gray-500 animate-pulse">BURNING INTENTION INTO AETHER...</p>
                )}
            </div>

            <button 
                onClick={onExit}
                className="mt-16 text-[10px] text-gray-400 hover:text-white uppercase tracking-[0.4em] transition-colors border-b border-transparent hover:border-white pb-1"
            >
                Dissipate
            </button>
        </div>
    );
};

// --- MAIN ORCHESTRATOR ---

const LightPrismSpell = ({ onExit }: { onExit: () => void }) => {
    const [stage, setStage] = useState(0);
    const [selectedRay, setSelectedRay] = useState<typeof RAYS[0] | null>(null);
    
    const { initAudio, playTone, playDrone, modulateFilter } = useAudioEngine();
    const { canvasRef, spawnExplosion } = useParticleSystem();

    // Initialize audio on first interaction
    useEffect(() => {
        if (stage === 1) initAudio();
    }, [stage, initAudio]);

    const handleSelect = (ray: typeof RAYS[0]) => {
        setSelectedRay(ray);
        setStage(1);
    };

    const styles = `
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
    `;

    return (
        <div className="fixed inset-0 bg-black text-white overflow-hidden select-none font-sans touch-none z-50">
            <button onClick={onExit} className="absolute top-6 right-6 z-50 text-gray-600 hover:text-white transition-colors"><X size={24}/></button>
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" style={{ mixBlendMode: 'screen' }} />
            
            <div className="relative z-20 h-full w-full">
                 {stage === 0 && <SelectionStage onSelect={handleSelect} />}
                 
                 {stage === 1 && selectedRay && (
                    <GatheringStage 
                        onNext={() => setStage(2)} 
                        playDrone={playDrone} 
                    />
                 )}
                 
                 {stage === 2 && selectedRay && (
                    <RefractionStage 
                        targetRay={selectedRay} 
                        onNext={() => setStage(3)} 
                        playTone={playTone}
                        playDrone={playDrone}
                        modulateFilter={modulateFilter}
                    />
                 )}
                 
                 {stage === 3 && selectedRay && (
                    <ProjectionStage 
                        ray={selectedRay} 
                        onExit={onExit}
                        playTone={playTone}
                        spawnExplosion={spawnExplosion}
                    />
                 )}
            </div>
            <style>{styles}</style>
        </div>
    );
};

export default LightPrismSpell;
// --- END OF FILE ---