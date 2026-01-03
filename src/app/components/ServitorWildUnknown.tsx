"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Lock, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Minus, RefreshCw, Move } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { checkAndSpendCredits, getWalletStatus, COST_BIND_SERVITOR } from '@/lib/economy';
import { saveServitorToGrimoire, getMyServitors } from '@/lib/services/spellService';

// --- 1. ASSET CONFIGURATION ---
const ASSET_PATH = '/images/Servitor_images/';

const ASSETS = {
    BASES: 'Servitor_Bases_Master_Sheet.png',
    ARMS: 'Servitor_Arms_Master_Sheet.png',
    LEGS: 'Servitor_Legs_Master_Sheet.png',
    BACK: 'Servitor_Back_Elements_Master_Sheet.png',
    CLOTHES: 'Servitor_Clothing_Overlays_Sheet.png',
    HEAD: 'Servitor_Headgear_Master_Sheet.png',
    TOOLS: 'Servitor_Magickal_Tools_Sheet.png',
    VESSELS: 'Ritual_Vessels_Master_Sheet.png',
    TREASURES: 'Chest_Sigils_And_Treasures_Sheet.png',
    FOOD: 'Servitor_Sustenance_Food_Sheet.png',
    MOUND: 'mound_into_the_void.png',
    UI_PANEL: 'Parchment_And_Oak_Responsive_Panels.png',
    BG_MAIN: 'Astral_Plane_Parallax_Layers.jpg',
    UI_BUTTONS: 'Runic_Glass_Button_Set.png'
};

// Default Offsets (The starting point for adjustments)
const DEFAULT_OFFSETS = {
    base:    { x: 0, y: 0, s: 1.0, f: false },
    leg:     { x: 0, y: 0, s: 0.75, f: false },
    arm:     { x: 0, y: 5, s: 0.75, f: false },
    head:    { x: 0, y: -5, s: 0.85, f: false },
    clothes: { x: 0, y: 0, s: 1.05, f: false },
    tool:    { x: 5, y: 10, s: 0.6, f: false },
    wing:    { x: 0, y: -5, s: 1.2, f: false },
    vessel:  { x: 0, y: 0, s: 1.0, f: false },
    mound:   { x: 0, y: 0, s: 1.0, f: false } // New Mound Controls
};

const GENERIC_LIST = Array.from({length: 16}).map((_, i) => `Option ${i + 1}`);

// Helper: Get Sprite CSS
const getSpriteStyle = (index: number, filename: string) => {
    const safeIndex = Math.max(0, Math.min(15, index));
    const col = safeIndex % 4;
    const row = Math.floor(safeIndex / 4);
    return {
        backgroundImage: `url('${ASSET_PATH}${filename}')`,
        backgroundSize: '400% 400%',
        backgroundPosition: `${col * 33.333}% ${row * 33.333}%`,
        backgroundRepeat: 'no-repeat'
    };
};

export default function ServitorWildUnknown() {
    const router = useRouter();
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    // --- STATE ---
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    
    // Refs for Loop
    const runningRef = useRef(false); 
    const loopIdRef = useRef(0);
    const audioCtxRef = useRef<any>(null);
    const servitorPosRef = useRef(20);

    // Data
    const [sName, setSName] = useState("");
    const [sPurpose, setSPurpose] = useState("");
    const [uName, setUName] = useState("");
    const [user, setUser] = useState<any>(null);
    const [savedServitors, setSavedServitors] = useState<any[]>([]);
    const [wallet, setWallet] = useState<{ credits: number } | null>(null);

    // Config
    const [config, setConfig] = useState({
        baseIndex: 0, limbIndex: 0, legIndex: 0, toolIndex: 0,
        hatIndex: 0, wingIndex: 0, vesselIndex: 0, clothingIndex: 0,
        sigilIndex: 0, foodIndex: 0,
        
        hasWings: false, movementType: "walk", 
        feedFreq: 5,
        
        // Deep copy defaults so we can modify them
        offsets: JSON.parse(JSON.stringify(DEFAULT_OFFSETS))
    });

    // Game State
    const [depositCount, setDepositCount] = useState(0);
    const depositRef = useRef(0);
    const [hungerState, setHungerState] = useState<'sated' | 'hungry' | 'fed'>('sated');
    const [awakenProgress, setAwakenProgress] = useState(0);
    const [isAwakening, setIsAwakening] = useState(false);
    const [isFeeding, setIsFeeding] = useState(false);
    const [feedProgress, setFeedProgress] = useState(0);
    const [fallingFood, setFallingFood] = useState<{id: number, left: number, top: number, spriteIndex: number}[]>([]);
    const holdIntervalRef = useRef<any>(null);

    // Modals
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showExitWarning, setShowExitWarning] = useState(false);

    // --- INIT ---
    useEffect(() => {
        const imageUrls = Object.values(ASSETS);
        let loadedCount = 0;
        imageUrls.forEach((url) => {
            const img = new Image();
            img.src = ASSET_PATH + url;
            img.onload = () => {
                loadedCount++;
                setLoadProgress(Math.floor((loadedCount / imageUrls.length) * 100));
                if (loadedCount === imageUrls.length) setTimeout(() => setAssetsLoaded(true), 500);
            };
            img.onerror = () => { loadedCount++; if (loadedCount === imageUrls.length) setAssetsLoaded(true); }
        });

        const initUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) { 
                const data = await getMyServitors(user.id);
                setSavedServitors(data as any[]);
                const w = await getWalletStatus(user.id);
                setWallet(w);
            }
        };
        initUser();
    }, []);

    // --- ACTIONS ---
    const updateOffset = (part: keyof typeof DEFAULT_OFFSETS, field: 'x'|'y'|'s'|'f', value: number | boolean) => {
        setConfig(prev => ({
            ...prev,
            offsets: {
                ...prev.offsets,
                [part]: { ...prev.offsets[part], [field]: value }
            }
        }));
    };

    const handleBind = async () => {
        if (!user || !sName) return alert("Name & Login required.");
        const afford = await checkAndSpendCredits(user.id, COST_BIND_SERVITOR);
        if (!afford) { setShowCreditModal(true); return; }
        await saveServitorToGrimoire(user.id, { name: sName, master_name: uName, purpose: sPurpose, config });
        setHasUnsavedChanges(false);
        alert("Bound!");
    };

    const playSound = (type: string) => {
        if(!audioCtxRef.current) {
            const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
            if(AC) audioCtxRef.current = new AC();
        }
        if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
        
        const ctx = audioCtxRef.current;
        if(!ctx) return;
        
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        const now = ctx.currentTime;

        if (type === 'search') {
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.linearRampToValueAtTime(50, now + 1);
            g.gain.setValueAtTime(0.2, now);
            g.gain.linearRampToValueAtTime(0, now + 1);
            osc.start(now); osc.stop(now + 1);
        } else if (type === 'deposit') {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(800, now + 0.5);
            g.gain.setValueAtTime(0.1, now);
            osc.start(now); osc.stop(now + 0.5);
        } else {
            // Glitter / Generic
            osc.frequency.setValueAtTime(800, now);
            g.gain.setValueAtTime(0.05, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        }
    };

    // --- GAME LOOP ---
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

    const moveTo = (targetPercent: number, id: number) => {
        return new Promise<void>(resolve => {
            const el = document.getElementById('servitor-container');
            if(!el) { resolve(); return; }
            
            const current = parseFloat(el.style.left) || 20;
            const dist = Math.abs(targetPercent - current);
            const time = dist * 40; // Speed

            el.style.transition = `left ${time}ms linear, opacity 0.5s, transform 0.5s`;
            el.style.opacity = '1';
            el.style.transform = 'scale(1)';
            
            requestAnimationFrame(() => {
                el.style.left = targetPercent + "%";
                servitorPosRef.current = targetPercent;
            });

            setTimeout(() => { if(runningRef.current && loopIdRef.current === id) resolve(); }, time);
        });
    };

    const mainLoop = async (id: number) => {
        const mound = document.getElementById('game-mound');
        const vessel = document.getElementById('game-vessel');
        const servitor = document.getElementById('servitor-container');
        const shine = document.getElementById('vessel-shine');

        while(runningRef.current && loopIdRef.current === id) {
            // 1. Walk to Mound
            if(servitor) { servitor.style.opacity = '1'; servitor.style.transform = 'scale(1)'; }
            document.getElementById('game-rig')?.classList.remove('anim-idle');
            document.getElementById('game-rig')?.classList.add(config.movementType === 'fly' ? 'anim-fly-left' : 'anim-walk-left');
            
            await moveTo(15, id);
            if(!runningRef.current) break;

            // 2. Enter Void
            if(servitor) {
                servitor.style.opacity = '0';
                servitor.style.transform = 'scale(0.1) translateY(50px)';
            }
            await wait(500);

            // 3. Search Pulse
            if(mound) mound.classList.add('pulse-glow-void');
            playSound('search');
            await wait(2000);
            if(mound) mound.classList.remove('pulse-glow-void');

            // 4. Return
            if(servitor) {
                servitor.style.opacity = '1';
                servitor.style.transform = 'scale(1)';
            }
            document.getElementById('game-rig')?.classList.remove('anim-walk-left', 'anim-fly-left');
            document.getElementById('game-rig')?.classList.add(config.movementType === 'fly' ? 'anim-fly-right' : 'anim-walk-right');
            
            await moveTo(80, id);
            if(!runningRef.current) break;

            // 5. Deposit
            document.getElementById('game-rig')?.classList.remove('anim-walk-right', 'anim-fly-right');
            document.getElementById('game-rig')?.classList.add('anim-idle');
            playSound('deposit');
            if(vessel) vessel.classList.add('pulse-glow-gold');
            if(shine) { shine.style.opacity = '1'; setTimeout(() => shine.style.opacity = '0', 1000); }
            await wait(1000);
            if(vessel) vessel.classList.remove('pulse-glow-gold');

            depositRef.current++;
            setDepositCount(depositRef.current);

            if(depositRef.current >= config.feedFreq) {
                setHungerState('hungry');
                break;
            }
            await wait(500);
        }
    };

    // --- HOLD HANDLERS ---
    const startHold = (type: 'awaken' | 'feed') => {
        const start = Date.now();
        const dur = type === 'awaken' ? 5000 : 3000;
        if(type === 'awaken') setIsAwakening(true); else setIsFeeding(true);

        holdIntervalRef.current = setInterval(() => {
            const p = Math.min(100, ((Date.now() - start) / dur) * 100);
            if(type === 'awaken') setAwakenProgress(p); else setFeedProgress(p);

            if(p >= 100) {
                clearInterval(holdIntervalRef.current);
                playSound('glitter');
                if(type === 'awaken') {
                    setIsAwakening(false); setIsRunning(true); runningRef.current = true;
                    loopIdRef.current++; mainLoop(loopIdRef.current);
                } else {
                    setIsFeeding(false); setHungerState('fed');
                }
            }
            // Food Logic
            if(type === 'feed' && Math.random() > 0.7) {
                setFallingFood(prev => [...prev, {
                    id: Math.random(), 
                    left: Math.max(0, Math.min(90, servitorPosRef.current + (Math.random()*10-5))), 
                    top: 0, 
                    spriteIndex: config.foodIndex 
                }]);
            }
        }, 30);
    };

    const stopHold = () => {
        if(holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        setIsAwakening(false); setAwakenProgress(0); setIsFeeding(false); setFeedProgress(0); setFallingFood([]);
    };

    const handleResume = () => {
        setHungerState('sated'); depositRef.current = 0; setDepositCount(0);
        runningRef.current = true; loopIdRef.current++; mainLoop(loopIdRef.current);
    };

    // --- COMPONENTS ---

    // D-Pad Control Component
    const DPad = ({ part, allowFlip = false }: { part: keyof typeof DEFAULT_OFFSETS, allowFlip?: boolean }) => {
        const cfg = config.offsets[part];
        return (
            <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-[#5d4037]/50 mt-2">
                {/* Directional Pad */}
                <div className="grid grid-cols-3 gap-1 w-[80px]">
                    <div />
                    <button onClick={() => updateOffset(part, 'y', cfg.y - 5)} className="p-1 bg-[#3e2723] hover:bg-[#5d4037] rounded flex justify-center"><ArrowUp size={12}/></button>
                    <div />
                    <button onClick={() => updateOffset(part, 'x', cfg.x - 5)} className="p-1 bg-[#3e2723] hover:bg-[#5d4037] rounded flex justify-center"><ArrowLeft size={12}/></button>
                    <div className="flex justify-center items-center text-[8px] text-gray-400"><Move size={12}/></div>
                    <button onClick={() => updateOffset(part, 'x', cfg.x + 5)} className="p-1 bg-[#3e2723] hover:bg-[#5d4037] rounded flex justify-center"><ArrowRight size={12}/></button>
                    <div />
                    <button onClick={() => updateOffset(part, 'y', cfg.y + 5)} className="p-1 bg-[#3e2723] hover:bg-[#5d4037] rounded flex justify-center"><ArrowDown size={12}/></button>
                    <div />
                </div>

                {/* Size & Flip */}
                <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                        <button onClick={() => updateOffset(part, 's', Math.max(0.1, cfg.s - 0.05))} className="p-1 bg-[#3e2723] rounded"><Minus size={12}/></button>
                        <button onClick={() => updateOffset(part, 's', cfg.s + 0.05)} className="p-1 bg-[#3e2723] rounded"><Plus size={12}/></button>
                    </div>
                    {allowFlip && (
                        <button onClick={() => updateOffset(part, 'f', !cfg.f)} className={`p-1 rounded flex gap-1 items-center justify-center text-[10px] ${cfg.f ? 'bg-amber-600 text-black' : 'bg-[#3e2723] text-gray-400'}`}>
                            <RefreshCw size={10} /> Flip
                        </button>
                    )}
                </div>
                <div className="text-[9px] text-gray-400 font-mono flex flex-col leading-tight">
                    <span>X: {cfg.x}</span>
                    <span>Y: {cfg.y}</span>
                    <span>S: {cfg.s.toFixed(2)}</span>
                </div>
            </div>
        );
    };

    // Servitor Rig (with Dynamic Config)
    const ServitorRig = ({ idPrefix, isPreview = false }: { idPrefix: string, isPreview?: boolean }) => {
        const getStyle = (idx: number, asset: string, part: keyof typeof DEFAULT_OFFSETS, mirror: boolean = false) => {
            const c = config.offsets[part];
            const flip = mirror ? !c.f : c.f; // Logic to handle natural mirroring vs user flip
            return {
                ...getSpriteStyle(idx, asset),
                transform: `translate(${c.x}%, ${c.y}%) scale(${c.s}) ${flip ? 'scaleX(-1)' : ''}`,
                transformOrigin: 'top center'
            };
        };

        return (
            <div id={idPrefix} className={`servitor-rig relative w-[128px] h-[128px] ${isFeeding ? 'anim-feed' : 'anim-idle'}`} style={{ transform: isPreview ? 'scale(2)' : 'scale(1)' }}>
                {config.hasWings && <div className="absolute inset-0 z-0" style={getStyle(config.wingIndex, ASSETS.BACK, 'wing')} />}
                <div className="limb leg-left absolute z-10 w-full h-full" style={getStyle(config.legIndex, ASSETS.LEGS, 'leg', true)} />
                <div className="limb leg-right absolute z-10 w-full h-full" style={getStyle(config.legIndex, ASSETS.LEGS, 'leg')} />
                <div className="base absolute inset-0 z-20" style={getStyle(config.baseIndex, ASSETS.BASES, 'base')} />
                <div className="clothes absolute inset-0 z-30" style={getStyle(config.clothingIndex, ASSETS.CLOTHES, 'clothes')} />
                <div className="limb arm-left absolute z-40 w-full h-full" style={getStyle(config.limbIndex, ASSETS.ARMS, 'arm', true)} />
                <div className="limb arm-right absolute z-40 w-full h-full" style={getStyle(config.limbIndex, ASSETS.ARMS, 'arm')} />
                <div className="hat absolute inset-0 z-50" style={getStyle(config.hatIndex, ASSETS.HEAD, 'head')} />
                <div className="tool absolute inset-0 z-60" style={getStyle(config.toolIndex, ASSETS.TOOLS, 'tool')} />
            </div>
        );
    };

    if (!assetsLoaded) return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[999]">
            <div className="w-32 h-32 animate-spin" style={getSpriteStyle(0, ASSETS.TREASURES)}></div>
            <p className="text-[#FFD700] mt-4 font-serif">Summoning Assets... {loadProgress}%</p>
        </div>
    );

    const isFeedingActive = hungerState === 'hungry' || isFeeding || hungerState === 'fed';

    return (
        <div className="fixed inset-0 w-full h-full bg-[#0f0f1a] text-[#dcdcdc] overflow-hidden select-none font-sans flex flex-col">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
                .magick-font { font-family: 'Cinzel', serif; }
                .runic-btn { background: url('${ASSET_PATH}${ASSETS.UI_BUTTONS}') center/cover; color: #FFD700; text-shadow: 0 1px 2px black; border: 1px solid #FFD70050; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .runic-btn:active { transform: scale(0.95); filter: brightness(0.8); }
                /* ANIMATIONS */
                @keyframes rig-bounce { 0% { top: 0; } 50% { top: -5px; } }
                @keyframes fall { from { top: -10%; } to { top: 80%; opacity: 0; } }
                .pulse-glow-void { animation: pulse-void 1s infinite alternate; }
                @keyframes pulse-void { from { filter: drop-shadow(0 0 5px #4b0082); } to { filter: drop-shadow(0 0 20px #8a2be2); } }
                .pulse-glow-gold { animation: pulse-gold 0.5s infinite alternate; }
                @keyframes pulse-gold { from { filter: drop-shadow(0 0 5px #FFD700); } to { filter: drop-shadow(0 0 25px #FFFF00); } }
                .anim-walk-left .leg-left { transform: rotate(-15deg) scaleX(-1) !important; } .anim-walk-left .leg-right { transform: rotate(15deg) !important; } .anim-walk-left { animation: rig-bounce 0.5s infinite; }
                .anim-walk-right .leg-left { transform: rotate(15deg) scaleX(-1) !important; } .anim-walk-right .leg-right { transform: rotate(-15deg) !important; } .anim-walk-right { animation: rig-bounce 0.5s infinite; transform: scaleX(-1); }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #5d4037; border-radius: 4px; }
            `}</style>

            <button onClick={() => hasUnsavedChanges ? setShowExitWarning(true) : router.push('/spell-room')} className="absolute top-4 right-4 z-[60] text-gray-400 hover:text-white"><X /></button>

            {/* STAGE */}
            <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url('${ASSET_PATH}${ASSETS.BG_MAIN}')` }}>
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* GAME WORLD */}
            <div className="relative w-full h-full z-10 pointer-events-none">
                {/* Mound */}
                <div id="game-mound" className="absolute bottom-[15vh] left-[10%] w-[160px] h-[100px] z-20 bg-contain bg-no-repeat bg-bottom transition-all duration-500"
                     style={{ backgroundImage: `url('${ASSET_PATH}${ASSETS.MOUND}')`, transform: `scale(${config.offsets.mound.s}) translate(${config.offsets.mound.x}%, ${config.offsets.mound.y}%)` }} />

                {/* Servitor */}
                <div id="servitor-container" className="absolute bottom-[18vh] left-[20%] w-[128px] h-[128px] z-[100] transition-all duration-100 pointer-events-auto origin-bottom">
                    <ServitorRig idPrefix="game-rig" />
                </div>

                {/* Vessel */}
                <div className="absolute bottom-[20vh] right-[10%] w-[128px] h-[128px] z-20 flex flex-col items-center">
                    <div id="game-vessel" className="w-full h-full relative transition-all duration-500" 
                         style={{ ...getSpriteStyle(config.vesselIndex, ASSETS.VESSELS), transform: `scale(${config.offsets.vessel.s}) translate(${config.offsets.vessel.x}%, ${config.offsets.vessel.y}%)` }}>
                         <div className="absolute top-[20%] left-[25%] w-[50%] h-[50%] opacity-80 mix-blend-overlay" style={getSpriteStyle(config.sigilIndex, ASSETS.TREASURES)} />
                    </div>
                    <div id="vessel-shine" className="absolute top-0 text-4xl opacity-0 transition-opacity duration-500">✨</div>
                </div>

                {/* Food */}
                {fallingFood.map(f => (
                    <div key={f.id} className="absolute w-16 h-16 z-[101] animate-bounce"
                         style={{ left: f.left + '%', top: f.top + '%', animation: 'fall 1s linear forwards', ...getSpriteStyle(f.spriteIndex, ASSETS.FOOD) }} />
                ))}
            </div>

            {/* HUD */}
            {isRunning && !isFeedingActive && (
                <div className="absolute bottom-6 left-0 w-full z-40 px-4 flex flex-wrap justify-between items-end gap-4 pointer-events-auto">
                    <button onClick={() => { setIsRunning(false); runningRef.current = false; }} className="runic-btn px-6 py-3 rounded uppercase font-bold text-xs tracking-widest whitespace-nowrap">Modify Ritual</button>
                    <div className="runic-btn px-6 py-2 rounded-full text-center min-w-[120px]"><div><p className="text-[10px] uppercase opacity-70">Wealth Count</p><p className="text-xl font-bold">{depositCount}</p></div></div>
                </div>
            )}

            {/* CONFIG PANEL */}
            <div className={`absolute top-0 left-0 h-full w-full md:w-[500px] z-50 transition-transform duration-500 ease-in-out ${isRunning ? '-translate-x-full' : 'translate-x-0'} pointer-events-auto flex flex-col`}
                 style={{ borderImage: `url('${ASSET_PATH}${ASSETS.UI_PANEL}') 18% 15% fill stretch`, borderWidth: '40px', padding: '20px' }}>
                
                {/* FIXED PREVIEW HEADER */}
                <div className="shrink-0 border-b border-[#5d4037]/30 pb-4 mb-4">
                    <div className="text-center pb-2"><h2 className="text-[#3e2723] text-2xl magick-font font-bold">Servitor Forge</h2></div>
                    <div className="h-[250px] flex items-center justify-center bg-black/10 rounded border border-[#5d4037]/20 relative overflow-hidden">
                         <div className="absolute inset-0 opacity-20 bg-[url('/images/Servitor_images/Astral_Plane_Parallax_Layers.jpg')] bg-cover bg-center" />
                         <ServitorRig idPrefix="preview-rig" isPreview={true} />
                    </div>
                </div>

                {/* SCROLLABLE CONTROLS */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                    <div className="space-y-3">
                        <input type="text" value={sName} onChange={e => setSName(e.target.value)} className="w-full bg-[#fdf5e6] border border-[#8d6e63] p-2 rounded text-[#2a1a1a]" placeholder="Spirit Name" />
                        <input type="text" value={sPurpose} onChange={e => setSPurpose(e.target.value)} className="w-full bg-[#fdf5e6] border border-[#8d6e63] p-2 rounded text-[#2a1a1a]" placeholder="Purpose (e.g. Wealth)" />
                    </div>

                    {[
                        { label: 'Torso', key: 'baseIndex', asset: ASSETS.BASES, part: 'base' },
                        { label: 'Legs', key: 'legIndex', asset: ASSETS.LEGS, part: 'leg', flip: true },
                        { label: 'Arms', key: 'limbIndex', asset: ASSETS.ARMS, part: 'arm', flip: true },
                        { label: 'Headgear', key: 'hatIndex', asset: ASSETS.HEAD, part: 'head' },
                        { label: 'Attire', key: 'clothingIndex', asset: ASSETS.CLOTHES, part: 'clothes' },
                        { label: 'Tools', key: 'toolIndex', asset: ASSETS.TOOLS, part: 'tool' },
                        { label: 'Back / Wings', key: 'wingIndex', asset: ASSETS.BACK, part: 'wing' },
                        { label: 'Vessel', key: 'vesselIndex', asset: ASSETS.VESSELS, part: 'vessel' },
                        { label: 'Chest Sigil', key: 'sigilIndex', asset: ASSETS.TREASURES, part: 'vessel' }, // Shares vessel D-Pad logic conceptually, or add separate if needed
                        { label: 'Mound Style', key: 'mound', asset: ASSETS.MOUND, part: 'mound' } // Using simple loop for UI consistency, mound is single image but we can add DPad
                    ].map((grp, idx) => (
                        <div key={idx} className="bg-[#5d4037]/5 p-3 rounded">
                            <label className="block text-xs font-bold text-[#3e2723] uppercase mb-2">{grp.label}</label>
                            {/* Grid */}
                            {grp.key !== 'mound' && (
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {GENERIC_LIST.map((_, i) => (
                                        <button key={i} onClick={() => setConfig({...config, [grp.key]: i})}
                                            className={`w-full aspect-square border-2 rounded overflow-hidden bg-[#eaddcf]/50 ${config[grp.key as keyof typeof config] === i ? 'border-[#3e2723] shadow-inner' : 'border-transparent'}`}>
                                            <div className="w-full h-full transform scale-60" style={getSpriteStyle(i, grp.asset)} />
                                        </button>
                                    ))}
                                </div>
                            )}
                            {/* D-Pad */}
                            <DPad part={grp.part as any} allowFlip={grp.flip} />
                        </div>
                    ))}

                    <div className="bg-[#5d4037]/10 p-3 rounded space-y-3">
                        <label className="text-xs font-bold text-[#3e2723] uppercase">Feeding Frequency: {config.feedFreq} Tasks</label>
                        <input type="range" min="1" max="50" value={config.feedFreq} onChange={e => setConfig({...config, feedFreq: parseInt(e.target.value)})} className="w-full accent-[#3e2723]" />
                        <label className="block text-xs font-bold text-[#3e2723] uppercase mt-2">Sustenance</label>
                        <div className="grid grid-cols-4 gap-2">
                            {GENERIC_LIST.map((_, i) => (
                                <button key={i} onClick={() => setConfig({...config, foodIndex: i})}
                                    className={`w-full aspect-square border-2 rounded overflow-hidden bg-[#eaddcf]/50 ${config.foodIndex === i ? 'border-[#3e2723]' : 'border-transparent'}`}>
                                    <div className="w-full h-full transform scale-60" style={getSpriteStyle(i, ASSETS.FOOD)} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                        <button onMouseDown={() => startHold('awaken')} onMouseUp={stopHold} onMouseLeave={stopHold} onTouchStart={() => startHold('awaken')} onTouchEnd={stopHold}
                            className="runic-btn w-full py-4 text-sm font-bold uppercase tracking-widest relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-75 ease-linear" style={{width: `${awakenProgress}%`}}></div>
                            <span className="relative z-10">{isAwakening ? "Awakening..." : "Hold to Awaken"}</span>
                        </button>
                        <button onClick={handleBind} className="flex-1 py-3 bg-[#5d4037] text-white text-xs uppercase font-bold rounded shadow hover:bg-[#3e2723]">Bind ({COST_BIND_SERVITOR} Credits)</button>
                    </div>
                </div>
            </div>

            {/* FEEDING MODAL */}
            {isFeedingActive && (
                <div className="absolute inset-0 z-[200] bg-black/80 flex flex-col items-center justify-center">
                    {hungerState === 'fed' ? (
                        <div className="text-center animate-in zoom-in">
                            <h2 className="text-[#FFD700] magick-font text-3xl mb-4">Hunger Sated</h2>
                            <button onClick={handleResume} className="runic-btn px-8 py-3 rounded text-lg font-bold">Resume Ritual</button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <p className="text-[#FFD700] mb-8 animate-pulse text-xl font-serif">{sName} requires sustenance...</p>
                            <button onMouseDown={() => startHold('feed')} onMouseUp={stopHold} onMouseLeave={stopHold} onTouchStart={() => startHold('feed')} onTouchEnd={stopHold}
                                className="w-40 h-40 rounded-full border-4 border-[#FFD700] flex items-center justify-center relative overflow-hidden bg-black shadow-[0_0_50px_#FFD700]">
                                <div className="absolute bottom-0 left-0 w-full bg-[#FFD700]/30 transition-all duration-75" style={{height: `${feedProgress}%`}}></div>
                                <div className="w-20 h-20" style={getSpriteStyle(config.foodIndex, ASSETS.FOOD)} />
                            </button>
                        </div>
                    )}
                </div>
            )}
            {showCreditModal && (
                 <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 p-6">
                    <div className="bg-[#1a1528] border border-amber-600 p-8 rounded text-center max-w-sm">
                        <Lock className="mx-auto mb-4 text-amber-500" /><p className="text-gray-300 mb-6">Insufficient Aether.</p>
                        <button onClick={() => setShowCreditModal(false)} className="w-full bg-amber-900/50 border border-amber-600 py-2 uppercase text-amber-100">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}