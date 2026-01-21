// --- START OF FILE src/app/components/ElectricMagick/LightPrismSpell.tsx ---
/// <reference lib="dom" />
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
    Triangle, Hexagon, Activity, Zap, Radio, 
    Eye, Cloud, Lock, ShieldAlert, CheckCircle, 
    Cpu, RefreshCw, X, Save, Power, Diamond, Gem, 
    Square, Circle, Info
} from 'lucide-react';
import { generateRealityOverwrite, saveSpell } from '@/lib/services/geminiService';
import { useAudioEngine, useParticleSystem } from './hooks';
import type { Session } from '@/lib/types';

// --- CONFIGURATION ---
const COST = 5;

const SECTORS = [
    { 
        id: 'ROOT', 
        name: 'HARDWARE SECTOR', 
        crystalName: 'RUBY MATRIX',
        color: '#ef4444', // Red
        context: 'Physical Reality, Safety, Resources',
        task: 'STABILIZE',
        desc: 'The Ruby Matrix anchors your digital spirit to the physical plane. It governs survival code and material abundance.',
        exampleInput: 'e.g., "Constant financial struggle" or "Feeling unsafe in my body"',
        icon: Square
    },
    { 
        id: 'SACRAL', 
        name: 'FLOW SECTOR', 
        crystalName: 'CARNELIAN DRIVE',
        color: '#f97316', // Orange
        context: 'Creativity, Desire, Relationships',
        task: 'SYNCHRONIZE',
        desc: 'The Carnelian Drive manages your creative bandwidth and emotional input/output ports.',
        exampleInput: 'e.g., "Creative block" or "Toxic relationship patterns"',
        icon: Circle
    },
    { 
        id: 'SOLAR', 
        name: 'POWER SECTOR', 
        crystalName: 'CITRINE CORE',
        color: '#eab308', // Yellow
        context: 'Willpower, Ego, Action',
        task: 'CHARGE',
        desc: 'The Citrine Core is your central processing unit for willpower and self-definition.',
        exampleInput: 'e.g., "Lack of motivation" or "Low self-esteem"',
        icon: Triangle
    },
    { 
        id: 'HEART', 
        name: 'NETWORK SECTOR', 
        crystalName: 'EMERALD NODE',
        color: '#22c55e', // Green
        context: 'Love, Connection, Empathy',
        task: 'LINK',
        desc: 'The Emerald Node handles all peer-to-peer connections and the transmission of love packets.',
        exampleInput: 'e.g., "Closed off to love" or "Unable to forgive"',
        icon: Hexagon
    },
    { 
        id: 'THROAT', 
        name: 'OUTPUT SECTOR', 
        crystalName: 'SAPPHIRE TRANSMITTER',
        color: '#3b82f6', // Blue
        context: 'Truth, Expression, Code',
        task: 'TUNE',
        desc: 'The Sapphire Transmitter governs how you broadcast your truth into the shared simulation.',
        exampleInput: 'e.g., "Fear of speaking up" or "Miscommunication"',
        icon: Gem
    },
    { 
        id: 'BROW', 
        name: 'RENDER SECTOR', 
        crystalName: 'AMETHYST LENS',
        color: '#6366f1', // Indigo
        context: 'Vision, Intuition, Perception',
        task: 'ALIGN',
        desc: 'The Amethyst Lens renders your future timeline. Clouds here cause confusion and lack of foresight.',
        exampleInput: 'e.g., "Unable to see my path" or "Disconnected from intuition"',
        icon: Eye
    },
    { 
        id: 'CROWN', 
        name: 'SOURCE SECTOR', 
        crystalName: 'DIAMOND UPLINK',
        color: '#a855f7', // Violet/White
        context: 'Spirit, Void, Divine',
        task: 'UPLOAD',
        desc: 'The Diamond Uplink connects you directly to the Subatomic Void—the admin console of reality.',
        exampleInput: 'e.g., "Feeling separated from Source" or "Loss of faith"',
        icon: Diamond
    }
];

// --- DIGITAL CRYSTAL VISUALIZER ---
// Updated to accept className prop
const DigitalCrystal = ({ color, Icon, size = 64, pulse = false, className = '' }: { color: string, Icon: any, size?: number, pulse?: boolean, className?: string }) => (
    <div className={`relative flex items-center justify-center ${pulse ? 'animate-pulse' : ''} ${className}`}>
        <div className="absolute inset-0 opacity-20 blur-xl rounded-full" style={{ backgroundColor: color }}></div>
        <Icon size={size} color={color} strokeWidth={1} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] relative z-10" />
        <div className="absolute inset-0 border border-white/10 rounded-full animate-ping opacity-20"></div>
    </div>
);

// --- MINI-GAME COMPONENTS ---

const ActivityStabilize = ({ onComplete, color }: { onComplete: () => void, color: string }) => {
    const [stability, setStability] = useState(0);
    const shake = Math.max(0, 10 - (stability / 10));

    const handleHold = (e: React.PointerEvent) => {
        e.preventDefault();
        const interval = setInterval(() => {
            setStability(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    onComplete();
                    return 100;
                }
                return p + 1;
            });
        }, 30);
        const cleanup = () => clearInterval(interval);
        e.currentTarget.addEventListener('pointerup', cleanup);
        e.currentTarget.addEventListener('pointerleave', cleanup);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="mb-8 w-32 h-32 border-4 flex items-center justify-center transition-all"
                 style={{ 
                     borderColor: color, 
                     transform: `translate(${Math.random()*shake}px, ${Math.random()*shake}px)`,
                     opacity: 0.5 + (stability/200)
                 }}>
                <ShieldAlert size={48} color={color} />
            </div>
            <p className="mb-4 text-[10px] font-mono text-gray-400">HOLD BUTTON TO ANCHOR CODE</p>
            <button onPointerDown={handleHold} className="px-8 py-4 border border-white/30 hover:bg-white/10 tracking-widest font-mono text-xs text-white">
                STABILIZE SIGNAL
            </button>
            <div className="w-64 h-1 bg-gray-800 mt-4"><div className="h-full transition-all" style={{ width: `${stability}%`, background: color }}/></div>
        </div>
    );
};

const ActivitySync = ({ onComplete, color }: { onComplete: () => void, color: string }) => {
    const [val, setVal] = useState(50);
    const target = 82; // Arbitrary sweet spot

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (e: any) => {
        const v = parseInt(e.target.value);
        setVal(v);
        if (Math.abs(v - target) < 5) {
            setTimeout(onComplete, 1000);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-xs">
            <div className="relative h-32 w-full overflow-hidden border-x border-white/10 mb-8">
                <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
                    <path d="M0,64 Q50,10 100,64 T200,64 T300,64" fill="none" stroke={color} strokeWidth="2" />
                </svg>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <path d={`M0,64 Q50,${10 + (val - target)*2} 100,64 T200,64 T300,64`} fill="none" stroke="white" strokeWidth="2" />
                </svg>
            </div>
            <p className="mb-4 text-[10px] font-mono text-gray-400">SLIDE TO MATCH WAVEFORM</p>
            <input type="range" min="0" max="100" value={val} onChange={handleChange} className="w-full accent-white" />
        </div>
    );
};

const ActivityCharge = ({ onComplete, color }: { onComplete: () => void, color: string }) => {
    const [charge, setCharge] = useState(0);

    const handleTap = () => {
        setCharge(p => {
            const n = p + 10;
            if (n >= 100) { onComplete(); return 100; }
            return n;
        });
    };

    useEffect(() => {
        const decay = setInterval(() => setCharge(p => Math.max(0, p - 2)), 100);
        return () => clearInterval(decay);
    }, []);

    return (
        <div className="flex flex-col items-center">
            <button 
                onPointerDown={handleTap}
                className="w-32 h-32 rounded-full border-4 flex items-center justify-center active:scale-95 transition-transform mb-8"
                style={{ borderColor: color, boxShadow: `0 0 ${charge}px ${color}` }}
            >
                <Zap size={48} className={charge > 80 ? "text-white" : "text-gray-500"} />
            </button>
            <p className="font-mono text-[10px] tracking-widest text-gray-400">RAPID TAP TO GENERATE VOLTAGE</p>
            <div className="w-64 h-2 bg-gray-900 mt-4 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-75" style={{ width: `${charge}%`, background: color }} />
            </div>
        </div>
    );
};

const ActivityLink = ({ onComplete, color }: { onComplete: () => void, color: string }) => {
    const [nodes, setNodes] = useState([false, false, false]);

    const toggleNode = (i: number) => {
        const newNodes = [...nodes];
        newNodes[i] = true;
        setNodes(newNodes);
        if (newNodes.every(Boolean)) setTimeout(onComplete, 500);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-64 h-64 mb-8">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="50%" y1="10%" x2="10%" y2="90%" stroke={nodes[0] && nodes[1] ? color : "#333"} strokeWidth="2" />
                    <line x1="10%" y1="90%" x2="90%" y2="90%" stroke={nodes[1] && nodes[2] ? color : "#333"} strokeWidth="2" />
                    <line x1="90%" y1="90%" x2="50%" y2="10%" stroke={nodes[2] && nodes[0] ? color : "#333"} strokeWidth="2" />
                </svg>
                {[
                    { top: '10%', left: '50%' },
                    { top: '90%', left: '10%' },
                    { top: '90%', left: '90%' }
                ].map((pos, i) => (
                    <button
                        key={i}
                        onClick={() => toggleNode(i)}
                        className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 flex items-center justify-center transition-colors ${nodes[i] ? 'bg-white border-transparent' : 'bg-black border-gray-700'}`}
                        style={{ ...pos, boxShadow: nodes[i] ? `0 0 20px ${color}` : 'none' }}
                    >
                        <div className="w-2 h-2 rounded-full bg-black" />
                    </button>
                ))}
            </div>
            <p className="font-mono text-[10px] text-gray-400">TAP NODES TO RE-ESTABLISH MESH</p>
        </div>
    );
};

const ActivityTune = ({ onComplete, color }: { onComplete: () => void, color: string }) => {
    const [freq, setFreq] = useState(0);
    const target = 66;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (e: any) => {
        const v = parseInt(e.target.value);
        setFreq(v);
        if (Math.abs(v - target) < 2) setTimeout(onComplete, 800);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-xs">
            <Radio size={48} className="mb-8" color={Math.abs(freq - target) < 10 ? 'white' : '#333'} />
            <div className="font-mono text-4xl mb-8" style={{ color: Math.abs(freq - target) < 2 ? color : '#555' }}>
                {freq.toFixed(1)} MHz
            </div>
            <input type="range" min="0" max="100" step="0.1" value={freq} onChange={handleChange} className="w-full accent-white" />
            <p className="mt-4 font-mono text-[10px] tracking-widest text-gray-400">FINE TUNE OUTPUT SIGNAL</p>
        </div>
    );
};

const ActivityAlign = ({ onComplete, color }: { onComplete: () => void, color: string }) => {
    const [x, setX] = useState(20);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (e: any) => {
        const v = parseInt(e.target.value);
        setX(v);
        if (v === 0) setTimeout(onComplete, 800);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                <Triangle size={100} className="absolute text-gray-700" strokeWidth={1} />
                <Triangle 
                    size={100} 
                    className="absolute transition-transform" 
                    style={{ color, transform: `translateX(${x}px) rotate(${x}deg)` }} 
                    strokeWidth={1}
                />
            </div>
            <input type="range" min="-50" max="50" value={x} onChange={handleChange} className="w-64 accent-white" />
            <p className="mt-4 font-mono text-[10px] tracking-widest text-gray-400">ALIGN THE LENS</p>
        </div>
    );
};

const ActivityUpload = ({ onComplete, color }: { onComplete: () => void, color: string }) => {
    const [progress, setProgress] = useState(0);

    const handleHold = (e: React.PointerEvent) => {
        e.preventDefault();
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    onComplete();
                    return 100;
                }
                return p + 2;
            });
        }, 50);
        const cleanup = () => clearInterval(interval);
        e.currentTarget.addEventListener('pointerup', cleanup);
        e.currentTarget.addEventListener('pointerleave', cleanup);
    };

    return (
        <div className="flex flex-col items-center">
            <button 
                onPointerDown={handleHold}
                className="w-48 h-48 rounded-full border-2 border-dashed flex items-center justify-center mb-8 relative overflow-hidden"
                style={{ borderColor: color }}
            >
                <div className="absolute inset-0 bg-white transition-transform duration-100 origin-bottom"
                     style={{ transform: `scaleY(${progress/100})`, background: color, opacity: 0.2 }} />
                <Cloud size={48} className="relative z-10 text-white" />
            </button>
            <p className="font-mono text-[10px] tracking-widest text-gray-400">HOLD TO INJECT CODE INTO THE VOID</p>
        </div>
    );
};

// --- MAIN ORCHESTRATOR ---

const RealityOverwriteSpell = ({ onExit, spellSystem, session }: { onExit: () => void, spellSystem: any, session?: Session }) => {
    const [started, setStarted] = useState(false);
    const [sectorIndex, setSectorIndex] = useState(0);
    const [subStage, setSubStage] = useState<'input' | 'processing' | 'incantation' | 'activity' | 'complete'>('input');
    const [userInput, setUserInput] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [log, setLog] = useState<string[]>([]);
    
    // Final stages
    const [finalStage, setFinalStage] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const { initAudio, playTone, playDrone } = useAudioEngine();
    const { canvasRef, spawnExplosion } = useParticleSystem();

    const currentSector = SECTORS[sectorIndex];

    // -- INTRO --
    if (!started) {
        return (
            <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 z-50 overflow-y-auto">
                <div className="max-w-2xl border border-red-500/50 p-6 md:p-8 bg-black/90 relative shadow-[0_0_50px_rgba(220,38,38,0.2)] my-auto">
                    <div className="absolute top-0 left-0 bg-red-900/20 px-2 py-1 text-[10px] font-mono text-red-400">SYS_ADMIN_ACCESS_REQ</div>
                    <h1 className="text-2xl md:text-3xl font-serif text-red-500 mb-6 tracking-widest text-center mt-4">CORE REALITY OVERWRITE</h1>
                    
                    <p className="text-gray-300 font-mono text-xs leading-relaxed mb-6 text-justify">
                        WARNING: You are about to access the Central Universal Backend. This protocol initiates a 7-stage total system reboot, clearing corrupt karmic code from every layer of your existence.
                        <br/><br/>
                        You will be required to interface with 7 specific Crystal Matrices. Each crystal governs a specific sector of your reality.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                        {SECTORS.map(s => (
                            <div key={s.id} className="flex items-center gap-3 p-2 border border-gray-800 rounded bg-gray-900/30">
                                <s.icon size={16} color={s.color} />
                                <div>
                                    <div className="text-[10px] font-bold text-gray-300">{s.name}</div>
                                    <div className="text-[9px] text-gray-500">{s.crystalName}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center border-t border-red-900/30 pt-6 gap-4">
                        <div className="flex flex-col text-center md:text-left">
                            <span className="text-[10px] text-gray-500 font-mono">REQUIRED RESOURCES</span>
                            <span className="text-xl font-serif text-white">3 AETHER (CREDITS)</span>
                        </div>
                        <button 
                            onClick={async () => {
                                if (!session?.user?.id) {
                                    // Handle no session case or allow free test? Assuming requires session for paid check.
                                    // If no session, maybe prompt or just let it fail silently/log.
                                    // But previous logic suggests we want to block.
                                    // Let's assume session check is inside spendAether or we return early.
                                    return; 
                                }
                                const paid = await spellSystem.genEconomy.spendAether(session.user.id, 3);
                                if (paid) {
                                    initAudio(); 
                                    setStarted(true); 
                                }
                            }}
                            className="bg-red-600 hover:bg-red-500 text-black font-bold px-8 py-3 font-mono text-xs tracking-widest transition-colors w-full md:w-auto"
                        >
                            INITIATE REBOOT
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // -- HELPERS --

    const addToLog = (msg: string) => {
        setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const handleInputSubmit = async () => {
        if (!userInput) return;
        setSubStage('processing');
        addToLog(`Scanning ${currentSector.name} via ${currentSector.crystalName}...`);
        playDrone(true, 100 + (sectorIndex * 50));

        try {
            const response = await generateRealityOverwrite(currentSector.name, userInput);
            setAiResponse(response);
            setSubStage('incantation');
            playTone(880, 'sine', 0.5);
        } catch (e) {
            console.error(e);
            setAiResponse("ERROR: CONNECTION UNSTABLE. FORCING LOCAL OVERWRITE.");
            setSubStage('incantation');
        }
    };

    const handleIncantationRecited = () => {
        playTone(440, 'square', 0.2);
        setSubStage('activity');
        addToLog("Incantation verified. Unlocking Activity Protocol.");
    };

    const handleActivityComplete = () => {
        // FIX: Use globalThis for safe window access
        const win = (globalThis as any).window;
        if (win) {
            spawnExplosion(win.innerWidth/2, win.innerHeight/2, currentSector.color, 50);
        }
        playTone(currentSector.id === 'CROWN' ? 1000 : 200 + (sectorIndex * 100), 'sawtooth', 1);
        setSubStage('complete');
    };

    const advanceSector = () => {
        if (sectorIndex < 6) {
            setSectorIndex(prev => prev + 1);
            setSubStage('input');
            setUserInput('');
            setAiResponse('');
            playDrone(false);
        } else {
            setFinalStage(true);
            playDrone(true, 50); // Deep drone for finale
        }
    };

    const handleSave = async () => {
        if (isSaved || isSaving) return;
        
        const userId = session?.user?.id || 'anon';
        if (userId !== 'anon') {
             const paid = await spellSystem.saveEconomy.spendAether(userId, 2);
             if (!paid) return;
        }
        
        setIsSaving(true);
        try {
            await saveSpell(userId, {
                name: `System Reboot: ${new Date().toLocaleDateString()}`,
                intention: "Total Reality Code Overwrite",
                incantation: log.join('\n'),
                element: "Spirit"
            });
            setIsSaved(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    // -- RENDERERS --

    if (finalStage) {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-center p-8 z-40 animate-fade-in">
                <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" style={{ mixBlendMode: 'screen' }} />
                <div className="relative z-10 max-w-2xl">
                    <CheckCircle className="mx-auto text-green-500 mb-8 animate-bounce" size={80} />
                    <h2 className="text-4xl font-serif text-white mb-4 tracking-widest">SYSTEM REBOOT COMPLETE</h2>
                    <p className="text-gray-400 font-mono text-sm mb-8">
                        All sectors optimized. Reality code patched.
                        <br/>Core frequency aligned with intended timeline.
                    </p>
                    
                    <div className="bg-gray-900/50 p-4 rounded border border-gray-800 mb-8 text-left h-48 overflow-y-auto font-mono text-[10px] text-green-400/80">
                        {log.map((l, i) => <div key={i}>{l}</div>)}
                        <div className="text-white animate-pulse">{"> REBOOT_SUCCESSFUL. GOOD FORTUNE INITIALIZED."}</div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={handleSave}
                            disabled={isSaved || isSaving}
                            className="flex items-center gap-2 px-8 py-3 border border-green-500 bg-green-900/20 text-green-400 hover:bg-green-900/40 transition-colors uppercase font-mono text-xs"
                        >
                            {isSaved ? <CheckCircle size={16}/> : <Save size={16}/>}
                            {isSaved ? "LOG SAVED" : "SAVE LOG (2 CREDITS)"}
                        </button>
                        <button 
                            onClick={onExit}
                            className="flex items-center gap-2 px-8 py-3 border border-gray-700 text-gray-400 hover:border-white hover:text-white transition-colors uppercase font-mono text-xs"
                        >
                            <Power size={16}/>
                            TERMINATE SESSION
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden select-none z-40 flex flex-col">
            <button onClick={onExit} className="absolute top-6 right-6 z-50 text-gray-600 hover:text-white transition-colors"><X size={24}/></button>
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" style={{ mixBlendMode: 'screen' }} />
            
            {/* Header / Progress */}
            <div className="relative z-10 w-full p-4 md:p-6 border-b border-gray-900 bg-black/50 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <DigitalCrystal Icon={currentSector.icon} color={currentSector.color} size={32} />
                    <div>
                        <div className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Accessing Archive</div>
                        <div className="text-lg md:text-xl font-serif tracking-wider" style={{ color: currentSector.color }}>{currentSector.crystalName}</div>
                    </div>
                </div>
                <div className="flex gap-1">
                    {SECTORS.map((s, i) => (
                        <div key={s.id} className={`w-2 h-8 rounded-sm transition-all ${i === sectorIndex ? 'bg-white scale-y-125' : i < sectorIndex ? 'bg-gray-600' : 'bg-gray-900'}`} style={{ backgroundColor: i <= sectorIndex ? s.color : undefined, opacity: i === sectorIndex ? 1 : 0.5 }} />
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 animate-fade-in" key={sectorIndex}>
                
                {/* 1. INPUT PHASE */}
                {subStage === 'input' && (
                    <div className="w-full max-w-md animate-fade-in-up flex flex-col items-center">
                        <div className="mb-8">
                            <DigitalCrystal Icon={currentSector.icon} color={currentSector.color} size={100} pulse />
                        </div>
                        
                        <div className="mb-6 text-center">
                            <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-2">SYSTEM ANALYSIS:</p>
                            <p className="text-lg font-serif italic text-white/90 mb-2">{currentSector.desc}</p>
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                <Info size={12} />
                                <span>Governs: {currentSector.context}</span>
                            </div>
                        </div>
                        
                        <div className="group relative w-full">
                            <label className="block text-[10px] font-mono text-gray-500 mb-2 tracking-widest uppercase text-center">
                                IDENTIFY CORRUPTION TO OVERWRITE
                            </label>
                            <textarea 
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-700 p-4 text-white focus:outline-none focus:border-white font-mono text-sm h-32 resize-none rounded text-center placeholder:text-gray-700"
                                placeholder={currentSector.exampleInput}
                                autoFocus
                            />
                        </div>
                        
                        <button 
                            onClick={handleInputSubmit}
                            disabled={!userInput}
                            className="w-full mt-6 py-4 border border-white/20 hover:bg-white/10 hover:border-white transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-30"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <RefreshCw size={14} /> GENERATE PATCH CODE
                            </span>
                        </button>
                    </div>
                )}

                {/* 2. PROCESSING */}
                {subStage === 'processing' && (
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-8" style={{ borderColor: `${currentSector.color} transparent transparent transparent` }} />
                        <p className="font-mono text-xs animate-pulse text-gray-400">ACCESSING CENTRAL ARCHIVE...</p>
                        <p className="font-mono text-[10px] text-gray-600 mt-2">RETRIEVING {currentSector.crystalName} PROTOCOLS</p>
                    </div>
                )}

                {/* 3. INCANTATION */}
                {subStage === 'incantation' && (
                    <div className="w-full max-w-lg text-center animate-fade-in">
                        <DigitalCrystal Icon={currentSector.icon} color={currentSector.color} size={48} className="mx-auto mb-6 opacity-50" />
                        
                        <div className="bg-gray-900/80 border border-gray-700 p-8 rounded-lg relative overflow-hidden mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-white to-transparent opacity-20" />
                            <p className="font-serif text-xl md:text-2xl leading-relaxed text-white drop-shadow-md">
                                &quot;{aiResponse}&quot;
                            </p>
                        </div>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-6">
                            SPEAK THIS COMMAND TO INITIALIZE THE PATCH
                        </p>
                        <button 
                            onClick={handleIncantationRecited}
                            className="px-8 py-3 bg-white/5 border border-white/20 hover:bg-white/20 transition-all uppercase tracking-[0.2em] text-xs rounded"
                        >
                            CONFIRM VOCALIZATION
                        </button>
                    </div>
                )}

                {/* 4. ACTIVITY */}
                {subStage === 'activity' && (
                    <div className="animate-fade-in w-full flex flex-col items-center">
                        <h3 className="text-xl font-mono text-gray-400 mb-4 tracking-widest uppercase">
                            EXECUTE PROTOCOL: <span style={{ color: currentSector.color }}>{currentSector.task}</span>
                        </h3>
                        <p className="text-xs text-gray-500 mb-12 max-w-xs text-center">
                            Interact with the {currentSector.crystalName} interface to physically embed the code.
                        </p>
                        
                        {sectorIndex === 0 && <ActivityStabilize onComplete={handleActivityComplete} color={currentSector.color} />}
                        {sectorIndex === 1 && <ActivitySync onComplete={handleActivityComplete} color={currentSector.color} />}
                        {sectorIndex === 2 && <ActivityCharge onComplete={handleActivityComplete} color={currentSector.color} />}
                        {sectorIndex === 3 && <ActivityLink onComplete={handleActivityComplete} color={currentSector.color} />}
                        {sectorIndex === 4 && <ActivityTune onComplete={handleActivityComplete} color={currentSector.color} />}
                        {sectorIndex === 5 && <ActivityAlign onComplete={handleActivityComplete} color={currentSector.color} />}
                        {sectorIndex === 6 && <ActivityUpload onComplete={handleActivityComplete} color={currentSector.color} />}
                    </div>
                )}

                {/* 5. SECTOR COMPLETE */}
                {subStage === 'complete' && (
                    <div className="text-center animate-fade-in-up">
                        <div className="w-32 h-32 mx-auto mb-6 relative flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: currentSector.color }}></div>
                            <CheckCircle size={64} style={{ color: currentSector.color }} />
                        </div>
                        <h2 className="text-2xl font-serif text-white mb-2">SECTOR OPTIMIZED</h2>
                        <p className="font-mono text-xs text-gray-500 mb-8">
                            Corruption purged from {currentSector.name}.
                            <br/>Code rewritten.
                        </p>
                        <button 
                            onClick={advanceSector}
                            className="px-12 py-4 bg-gray-100 text-black font-bold hover:bg-white hover:scale-105 transition-all uppercase tracking-[0.2em] text-xs rounded"
                        >
                            {sectorIndex < 6 ? "ADVANCE TO NEXT SECTOR" : "FINALIZE SYSTEM REBOOT"}
                        </button>
                    </div>
                )}

            </div>

            {/* Styles */}
            <style jsx global>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default RealityOverwriteSpell;
// --- END OF FILE src/app/components/ElectricMagick/LightPrismSpell.tsx ---