"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Lock, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Minus, RefreshCw, Move, CheckCircle } from 'lucide-react';
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

// Default Offsets - "f" stands for Flip (Horizontal Mirror)
const DEFAULT_OFFSETS = {
    base:    { x: 0, y: 0, s: 1.0, f: false },
    leg:     { x: 0, y: 0, s: 0.75, f: false },
    arm:     { x: 0, y: 5, s: 0.75, f: false },
    head:    { x: 0, y: -5, s: 0.85, f: false },
    clothes: { x: 0, y: 0, s: 1.05, f: false },
    tool:    { x: 5, y: 10, s: 0.6, f: false },
    wing:    { x: 0, y: -5, s: 1.2, f: false },
    vessel:  { x: 0, y: 0, s: 1.0, f: false },
    mound:   { x: 0, y: 0, s: 1.0, f: false },
    sigil:   { x: 0, y: 0, s: 0.5, f: false } 
};

// Categories for the UI Menu
const CATEGORIES = [
    { id: 'base', label: 'Torso', asset: ASSETS.BASES, indexKey: 'baseIndex', offsetKey: 'base' },
    { id: 'head', label: 'Head', asset: ASSETS.HEAD, indexKey: 'hatIndex', offsetKey: 'head' },
    { id: 'arm', label: 'Arms', asset: ASSETS.ARMS, indexKey: 'limbIndex', offsetKey: 'arm', canFlip: true },
    { id: 'leg', label: 'Legs', asset: ASSETS.LEGS, indexKey: 'legIndex', offsetKey: 'leg', canFlip: true },
    { id: 'clothes', label: 'Robes', asset: ASSETS.CLOTHES, indexKey: 'clothingIndex', offsetKey: 'clothes' },
    { id: 'tool', label: 'Tool', asset: ASSETS.TOOLS, indexKey: 'toolIndex', offsetKey: 'tool' },
    { id: 'wing', label: 'Wings', asset: ASSETS.BACK, indexKey: 'wingIndex', offsetKey: 'wing' },
    { id: 'sigil', label: 'Sigil', asset: ASSETS.TREASURES, indexKey: 'sigilIndex', offsetKey: 'sigil' },
    { id: 'vessel', label: 'Vessel', asset: ASSETS.VESSELS, indexKey: 'vesselIndex', offsetKey: 'vessel' },
    { id: 'mound', label: 'Mound', asset: ASSETS.MOUND, indexKey: null, offsetKey: 'mound' }, // Single image
    { id: 'food', label: 'Food', asset: ASSETS.FOOD, indexKey: 'foodIndex', offsetKey: null },
    { id: 'settings', label: 'Settings', asset: null, indexKey: null, offsetKey: null }
];

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
    
    // UI State
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Refs
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
    
    // Config
    const [config, setConfig] = useState({
        baseIndex: 0, limbIndex: 0, legIndex: 0, toolIndex: 0,
        hatIndex: 0, wingIndex: 0, vesselIndex: 0, clothingIndex: 0,
        sigilIndex: 0, foodIndex: 0,
        
        hasWings: false, movementType: "walk", 
        feedFreq: 5,
        
        // Deep copy defaults
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
            }
        };
        initUser();
    }, []);

    // --- ACTIONS ---
    const updateOffset = (part: string, field: 'x'|'y'|'s'|'f', value: number | boolean) => {
        setConfig(prev => ({
            ...prev,
            offsets: {
                ...prev.offsets,
                [part]: { ...(prev.offsets as any)[part], [field]: value }
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
        osc.frequency.setValueAtTime(type === 'deposit' ? 600 : 200, now);
        g.gain.setValueAtTime(0.1, now);
        osc.start(now); osc.stop(now + 0.2);
    };

    // --- GAME LOOP ---
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

    const moveTo = (targetPercent: number, id: number) => {
        return new Promise<void>(resolve => {
            const el = document.getElementById('servitor-container');
            if(!el) { resolve(); return; }
            
            const current = parseFloat(el.style.left) || 20;
            const dist = Math.abs(targetPercent - current);
            const time = dist * 40; 

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
        const rig = document.getElementById('game-rig');

        while(runningRef.current && loopIdRef.current === id) {
            // 1. Walk to Mound
            if(servitor) { servitor.style.opacity = '1'; servitor.style.transform = 'scale(1)'; }
            if(rig) {
                rig.classList.remove('anim-idle', 'anim-walk-right', 'anim-fly-right');
                rig.classList.add(config.movementType === 'fly' ? 'anim-fly-left' : 'anim-walk-left');
            }
            
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
            if(rig) {
                rig.classList.remove('anim-walk-left', 'anim-fly-left');
                rig.classList.add(config.movementType === 'fly' ? 'anim-fly-right' : 'anim-walk-right');
            }
            
            await moveTo(80, id);
            if(!runningRef.current) break;

            // 5. Deposit
            if(rig) {
                rig.classList.remove('anim-walk-right', 'anim-fly-right');
                rig.classList.add('anim-idle');
            }
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

    // --- RIG COMPONENTS ---

    // D-Pad Control
    const DPad = ({ part, allowFlip = false }: { part: string, allowFlip?: boolean }) => {
        const cfg = (config.offsets as any)[part];
        if(!cfg) return null;

        return (
            <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-[#5d4037]/50 mt-2">
                <div className="grid grid-cols-3 gap-1 w-[80px]">
                    <div />
                    <button onClick={() => updateOffset(part, 'y', cfg.y - 1)} className="p-1 bg-[#3e2723] hover:bg-[#5d4037] rounded flex justify-center"><ArrowUp size={12}/></button>
                    <div />
                    <button onClick={() => updateOffset(part, 'x', cfg.x - 1)} className="p-1 bg-[#3e2723] hover:bg-[#5d4037] rounded flex justify-center"><ArrowLeft size={12}/></button>
                    <div className="flex justify-center items-center text-[8px] text-gray-400"><Move size={12}/></div>
                    <button onClick={() => updateOffset(part, 'x', cfg.x + 1)} className="p-1 bg-[#3e2723] hover:bg-[#5d4037] rounded flex justify-center"><ArrowRight size={12}/></button>
                    <div />
                    <button onClick={() => updateOffset(part, 'y', cfg.y + 1)} className="p-1 bg-[#3e2723] hover:bg-[#5d4037] rounded flex justify-center"><ArrowDown size={12}/></button>
                    <div />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                        <button onClick={() => updateOffset(part, 's', Math.max(0.1, cfg.s - 0.1))} className="p-1 bg-[#3e2723] rounded"><Minus size={12}/></button>
                        <button onClick={() => updateOffset(part, 's', cfg.s + 0.1)} className="p-1 bg-[#3e2723] rounded"><Plus size={12}/></button>
                    </div>
                    {allowFlip && (
                        <button onClick={() => updateOffset(part, 'f', !cfg.f)} className={`p-1 rounded flex gap-1 items-center justify-center text-[10px] ${cfg.f ? 'bg-amber-600 text-black' : 'bg-[#3e2723] text-gray-400'}`}>
                            <RefreshCw size={10} /> Flip
                        </button>
                    )}
                </div>
                <div className="text-[9px] text-gray-400 font-mono flex flex-col leading-tight">
                    <span>X: {cfg.x.toFixed(0)}</span>
                    <span>Y: {cfg.y.toFixed(0)}</span>
                    <span>S: {cfg.s.toFixed(1)}</span>
                </div>
            </div>
        );
    };

    // Rig Logic (Joint-Based)
    const ServitorRig = ({ idPrefix, isPreview = false }: { idPrefix: string, isPreview?: boolean }) => {
        const wrapperClass = isFeeding ? 'anim-feed' : 'anim-idle';
        
        // Render A Part
        const renderPart = (idx: number, asset: string, partKey: string, isLeft: boolean = false) => {
            const cfg = (config.offsets as any)[partKey];
            // 1. Joint Style (Handles Animation Rotation only)
            const jointClass = isLeft ? `${partKey}-left-joint` : `${partKey}-right-joint`;
            
            // 2. Sprite Style (Handles Static Configuration: Scale, Translate, Flip)
            // Note: If isLeft, we mirror naturally. If cfg.f is true, we flip the user's choice.
            const flip = isLeft ? !cfg.f : cfg.f; 
            const spriteTransform = `translate(${cfg.x}%, ${cfg.y}%) scale(${cfg.s}) ${flip ? 'scaleX(-1)' : ''}`;

            return (
                <div className={`joint absolute w-full h-full top-0 left-0 origin-top-center ${jointClass}`}>
                    <div className="sprite absolute w-full h-full top-0 left-0"
                         style={{ ...getSpriteStyle(idx, asset), transform: spriteTransform }} />
                </div>
            );
        };

        // Static Part (No Joint animation, just offset)
        const renderStatic = (idx: number, asset: string, partKey: string) => {
            const cfg = (config.offsets as any)[partKey];
            const transform = `translate(${cfg.x}%, ${cfg.y}%) scale(${cfg.s})`;
            return (
                <div className="absolute w-full h-full top-0 left-0"
                     style={{ ...getSpriteStyle(idx, asset), transform }} />
            );
        };

        return (
            <div id={idPrefix} className={`servitor-rig relative w-[128px] h-[128px] ${wrapperClass}`} style={{ transform: isPreview ? 'scale(1.5)' : 'scale(1)' }}>
                {config.hasWings && renderStatic(config.wingIndex, ASSETS.BACK, 'wing')}
                
                {renderPart(config.legIndex, ASSETS.LEGS, 'leg', true)}
                {renderPart(config.legIndex, ASSETS.LEGS, 'leg', false)}

                {renderStatic(config.baseIndex, ASSETS.BASES, 'base')}
                
                {/* Sigil on Chest */}
                {renderStatic(config.sigilIndex, ASSETS.TREASURES, 'sigil')}

                {renderStatic(config.clothingIndex, ASSETS.CLOTHES, 'clothes')}

                {renderPart(config.limbIndex, ASSETS.ARMS, 'arm', true)}
                {renderPart(config.limbIndex, ASSETS.ARMS, 'arm', false)}

                {renderStatic(config.hatIndex, ASSETS.HEAD, 'head')}
                {renderPart(config.toolIndex, ASSETS.TOOLS, 'tool', false)} 
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
                
                /* ANIMATIONS APPLIED TO JOINTS ONLY */
                @keyframes bounce { 0% { top: 0; } 50% { top: -5px; } }
                @keyframes rotate-l { 0% { transform: rotate(-15deg); } 50% { transform: rotate(15deg); } 100% { transform: rotate(-15deg); } }
                @keyframes rotate-r { 0% { transform: rotate(15deg); } 50% { transform: rotate(-15deg); } 100% { transform: rotate(15deg); } }
                
                .anim-walk-left .servitor-rig { animation: bounce 0.5s infinite; }
                .anim-walk-left .leg-left-joint { animation: rotate-l 1s infinite; }
                .anim-walk-left .leg-right-joint { animation: rotate-r 1s infinite; }
                .anim-walk-left .arm-left-joint { animation: rotate-r 1s infinite; }
                .anim-walk-left .arm-right-joint { animation: rotate-l 1s infinite; }

                .anim-walk-right .servitor-rig { animation: bounce 0.5s infinite; }
                /* Flip rotation logic for walking right handled by container transform scaleX(-1) in animation state logic would be easier, 
                   but here we just reuse the rotation because the container flips direction? No, we handle direction via classes. */
                .anim-walk-right .leg-left-joint { animation: rotate-r 1s infinite; }
                .anim-walk-right .leg-right-joint { animation: rotate-l 1s infinite; }
                .anim-walk-right .arm-left-joint { animation: rotate-l 1s infinite; }
                .anim-walk-right .arm-right-joint { animation: rotate-r 1s infinite; }

                .pulse-glow-void { animation: pulse-void 1s infinite alternate; }
                @keyframes pulse-void { from { filter: drop-shadow(0 0 5px #4b0082); } to { filter: drop-shadow(0 0 20px #8a2be2); } }
                .pulse-glow-gold { animation: pulse-gold 0.5s infinite alternate; }
                @keyframes pulse-gold { from { filter: drop-shadow(0 0 5px #FFD700); } to { filter: drop-shadow(0 0 25px #FFFF00); } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #5d4037; border-radius: 4px; }
            `}</style>

            <button onClick={() => hasUnsavedChanges ? setShowExitWarning(true) : router.push('/spell-room')} className="absolute top-4 right-4 z-[60] text-gray-400 hover:text-white"><X /></button>

            {/* STAGE */}
            <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url('${ASSET_PATH}${ASSETS.BG_MAIN}')` }}>
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* GAME WORLD (Mound, Servitor, Vessel) */}
            <div className="relative w-full h-full z-10 pointer-events-none">
                <div id="game-mound" className="absolute bottom-[15vh] left-[10%] w-[160px] h-[100px] z-20 bg-contain bg-no-repeat bg-bottom transition-all duration-500"
                     style={{ backgroundImage: `url('${ASSET_PATH}${ASSETS.MOUND}')`, transform: `scale(${config.offsets.mound.s}) translate(${config.offsets.mound.x}%, ${config.offsets.mound.y}%)` }} />

                <div id="servitor-container" className="absolute bottom-[18vh] left-[20%] w-[128px] h-[128px] z-[100] transition-all duration-100 pointer-events-auto origin-bottom">
                    <ServitorRig idPrefix="game-rig" />
                </div>

                <div className="absolute bottom-[20vh] right-[10%] w-[128px] h-[128px] z-20 flex flex-col items-center">
                    <div id="game-vessel" className="w-full h-full relative transition-all duration-500" 
                         style={{ ...getSpriteStyle(config.vesselIndex, ASSETS.VESSELS), transform: `scale(${config.offsets.vessel.s}) translate(${config.offsets.vessel.x}%, ${config.offsets.vessel.y}%)` }} />
                    <div id="vessel-shine" className="absolute top-0 text-4xl opacity-0 transition-opacity duration-500">✨</div>
                </div>

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

            {/* MAIN UI PANEL */}
            <div className={`absolute top-0 left-0 h-full w-full md:w-[500px] z-50 transition-transform duration-500 ease-in-out ${isRunning ? '-translate-x-full' : 'translate-x-0'} pointer-events-auto flex flex-col bg-[#0f0f1a]`}
                 style={{ borderRight: '2px solid #5d4037' }}>
                
                {/* 1. FIXED PREVIEW AREA (Top 45%) */}
                <div className="h-[45%] w-full relative bg-[#1a1a2e] border-b border-[#5d4037]">
                    <div className="absolute inset-0 opacity-40 bg-[url('/images/Servitor_images/Astral_Plane_Parallax_Layers.jpg')] bg-cover bg-center" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ServitorRig idPrefix="preview-rig" isPreview={true} />
                    </div>
                    {/* Inputs Overlay */}
                    <div className="absolute top-2 left-2 right-2 flex gap-2">
                        <input type="text" value={sName} onChange={e => setSName(e.target.value)} className="flex-1 bg-black/50 border border-[#5d4037] p-1 text-xs text-white rounded" placeholder="Spirit Name" />
                        <input type="text" value={sPurpose} onChange={e => setSPurpose(e.target.value)} className="flex-1 bg-black/50 border border-[#5d4037] p-1 text-xs text-white rounded" placeholder="Purpose" />
                    </div>
                </div>

                {/* 2. CATEGORY BUTTONS (Scrollable Row) */}
                <div className="bg-[#2a1a1a] p-2 flex gap-2 overflow-x-auto border-b border-[#5d4037] custom-scrollbar shrink-0">
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                            className={`px-3 py-2 rounded text-xs font-bold uppercase whitespace-nowrap border transition-colors ${activeCategory === cat.id ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-black/50 text-[#8d6e63] border-[#5d4037]'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* 3. ACTIVE CONTROLS (Pop-up Area) */}
                <div className="flex-1 overflow-y-auto bg-[#eaddcf] p-4 relative">
                    <div className="absolute inset-0 pointer-events-none border-[30px] border-transparent" style={{ borderImage: `url('${ASSET_PATH}${ASSETS.UI_PANEL}') 30 stretch` }} />
                    
                    {activeCategory ? (
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-[#3e2723] font-bold uppercase">{CATEGORIES.find(c => c.id === activeCategory)?.label}</h3>
                                <button onClick={() => setActiveCategory(null)}><X size={16} className="text-[#3e2723]"/></button>
                            </div>

                            {activeCategory === 'settings' ? (
                                <div className="space-y-4">
                                    <div className="bg-[#5d4037]/10 p-3 rounded">
                                        <label className="text-xs font-bold text-[#3e2723]">Feeding Frequency: {config.feedFreq}</label>
                                        <input type="range" min="1" max="50" value={config.feedFreq} onChange={e => setConfig({...config, feedFreq: parseInt(e.target.value)})} className="w-full accent-[#3e2723]" />
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <label className="flex items-center gap-2 text-xs font-bold text-[#3e2723] cursor-pointer">
                                            <input type="checkbox" checked={config.hasWings} onChange={e => setConfig({...config, hasWings: e.target.checked})} className="accent-[#3e2723]" /> Wings
                                        </label>
                                        <select value={config.movementType} onChange={e => setConfig({...config, movementType: e.target.value})} className="bg-[#fdf5e6] text-xs p-1 rounded border border-[#8d6e63] text-black">
                                            <option value="walk">Walk</option><option value="fly">Fly</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {/* SELECTION GRID */}
                                    {CATEGORIES.find(c => c.id === activeCategory)?.asset && (
                                        <div className="grid grid-cols-4 gap-2 mb-4">
                                            {GENERIC_LIST.map((_, i) => (
                                                <button key={i} 
                                                    onClick={() => setConfig({...config, [(CATEGORIES.find(c => c.id === activeCategory)?.indexKey as string)]: i})}
                                                    className={`w-full aspect-square border-2 rounded overflow-hidden bg-[#eaddcf]/50 ${(config as any)[CATEGORIES.find(c => c.id === activeCategory)?.indexKey as string] === i ? 'border-[#3e2723]' : 'border-transparent'}`}>
                                                    <div className="w-full h-full transform scale-75" style={getSpriteStyle(i, (CATEGORIES.find(c => c.id === activeCategory)?.asset as string))} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {/* D-PAD */}
                                    {CATEGORIES.find(c => c.id === activeCategory)?.offsetKey && (
                                        <DPad part={CATEGORIES.find(c => c.id === activeCategory)?.offsetKey as string} allowFlip={CATEGORIES.find(c => c.id === activeCategory)?.canFlip} />
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-[#5d4037] opacity-60">
                            <p className="text-sm font-serif italic">Select a category to customize...</p>
                        </div>
                    )}
                </div>

                {/* 4. FIXED ACTION BUTTONS */}
                <div className="p-4 bg-[#2a1a1a] border-t border-[#5d4037] flex gap-2 shrink-0">
                    <button onMouseDown={() => startHold('awaken')} onMouseUp={stopHold} onMouseLeave={stopHold} onTouchStart={() => startHold('awaken')} onTouchEnd={stopHold}
                        className="runic-btn flex-1 py-3 text-xs font-bold uppercase tracking-widest relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-75 ease-linear" style={{width: `${awakenProgress}%`}}></div>
                        <span className="relative z-10">{isAwakening ? "Awakening..." : "Hold to Awaken"}</span>
                    </button>
                    <button onClick={handleBind} className="flex-1 py-3 bg-[#5d4037] text-white text-xs uppercase font-bold rounded shadow hover:bg-[#3e2723]">
                        Bind/Save ({COST_BIND_SERVITOR})
                    </button>
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