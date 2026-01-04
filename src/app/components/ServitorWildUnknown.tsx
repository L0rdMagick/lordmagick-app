"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Lock, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Minus, RefreshCw, Move, Eye, EyeOff, Settings, User, ArrowLeftRight } from 'lucide-react';
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

// --- 2. CONFIGURATION SECTION (CODE ONLY) ---

// A. MASTER DIRECTIONAL OFFSETS & BASE DEFAULTS
//
// HOW TO EDIT:
// 1. facingRight (BASE): This controls the position for BOTH directions.
//    If you move an arm here, it moves in both Right and Left views.
//
// 2. facingLeft (OFFSET): This is ONLY for fine-tuning the Left view.
//    Values here are ADDED to the Base. Leave them at 0 to perfectly mirror the Base.
//    Example: If Base X is 10, and facingLeft X is 0 -> Result is 10.
//             If Base X is 10, and facingLeft X is -5 -> Result is 5.

const DIRECTIONAL_OFFSETS = {
    facingRight: {
        // --- BASE POSITIONS (Default/Right) ---
        global:  { x: 0, y: 0, s: 1.0, f: false }, 
        
        // Static Parts
        wing:    { x: 0, y: 3, s: 1.0, f: false },
        base:    { x: 0, y: 0, s: 1.0, f: false },
        head:    { x: 0, y: -49, s: 0.6, f: false },
        clothes: { x: -1, y: 10, s: 0.55, f: false },
        sigil:   { x: 3, y: 2, s: 0.2, f: false },
        tool:    { x: 32, y: 15, s: 0.5, f: false },
        
        // Specific Limbs (Consolidated & Tuned for Natural Pivot)
        armRight: { x: 2, y: 15, s: 0.6, f: false },
        armLeft:  { x: 25, y: 19, s: 0.6, f: false }, 
        
        legRight: { x: -5, y: 65, s: 0.9, f: true },
        legLeft:  { x: 5, y: 60, s: 0.9, f: true },

        // World Objects
        vessel:  { x: 0, y: 0, s: 1.8, f: false },
        mound:   { x: 0, y: 3, s: 2.8, f: false },
    },
    facingLeft: {
        // --- ADJUSTMENTS (Added to Base when Facing Left) ---
        global: { x: 0, y: 0, s: 0 },
        base: { x: 0, y: 0, s: 0 },
        head: { x: 0, y: 0, s: 0 },
        clothes: { x: 1, y: 0, s: 0 },
        wing: { x: 0, y: 0, s: 0 },
        tool: { x: -64, y: -4, s: 0 },
        sigil: { x: -8, y: 0, s: 0 },
        
        // Limb Shifts for Left Walk
        armRight: { x: -23, y: 3, s: 0 },
        armLeft:  { x: -26, y: -6, s: 0 },
        
        legRight: { x: -5, y: 2, s: 0 },
        legLeft:  { x: -1, y: 10, s: 0 },

        vessel: { x: 0, y: 0, s: 0 },
        mound: { x: 0, y: 0, s: 0 }
    }
};

// B. UI PREVIEW SETTINGS
const UI_PREVIEW_SETTINGS = {
    scale: 1.0, 
    y: -11      
};

// C. LAYER ORDERING (Z-Index)
const LAYER_ORDER_CONFIG = {
    facingRight: {
        wing: 0,
        armLeft: 10,   
        legLeft: 20,   
        base: 30,      
        clothes: 40,   
        sigil: 50,     
        armRight: 60, 
        legRight: 70,  
        tool: 80,      
        head: 90       
    },
    facingLeft: {
        wing: 0,
        legRight: 10,  
        armRight: 20,  
        base: 30,
        clothes: 40,
        legLeft: 50,   
        sigil: 60,
        tool: 70,
        armLeft: 80,   
        head: 90
    }
};

// D. DEFAULT USER OFFSETS (Zeroed out as requested)
const DEFAULT_OFFSETS = {
    global:  { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 }, 
    wing:    { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    leg:     { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    tool:    { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    arm:     { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    base:    { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    head:    { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    clothes: { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    sigil:   { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    vessel:  { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    mound:   { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
};

// --- END CONFIGURATION ---

interface CategoryItem {
    id: string;
    label: string;
    asset: string | null;
    indexKey: string | null;
    offsetKey: string | null;
    canFlip?: boolean;
    canSpread?: boolean;
    single?: boolean;
}

const CATEGORIES: CategoryItem[] = [
    { id: 'global', label: 'WHOLE', asset: null, indexKey: null, offsetKey: 'global', canFlip: true },
    { id: 'head', label: 'HATS', asset: ASSETS.HEAD, indexKey: 'hatIndex', offsetKey: 'head', canFlip: true },
    { id: 'base', label: 'TORSOS', asset: ASSETS.BASES, indexKey: 'baseIndex', offsetKey: 'base', canFlip: true },
    { id: 'leg', label: 'LEGS', asset: ASSETS.LEGS, indexKey: 'legIndex', offsetKey: 'leg', canFlip: false, canSpread: true },
    { id: 'arm', label: 'ARMS', asset: ASSETS.ARMS, indexKey: 'limbIndex', offsetKey: 'arm', canFlip: false, canSpread: true },
    { id: 'tool', label: 'TOOLS', asset: ASSETS.TOOLS, indexKey: 'toolIndex', offsetKey: 'tool', canFlip: true },
    { id: 'clothes', label: 'ROBES', asset: ASSETS.CLOTHES, indexKey: 'clothingIndex', offsetKey: 'clothes', canFlip: true },
    { id: 'wing', label: 'WINGS', asset: ASSETS.BACK, indexKey: 'wingIndex', offsetKey: 'wing', canFlip: true },
    { id: 'sigil', label: 'SIGILS', asset: ASSETS.TREASURES, indexKey: 'sigilIndex', offsetKey: 'sigil', canFlip: true },
    { id: 'mound', label: 'MOUNDS', asset: ASSETS.MOUND, indexKey: null, offsetKey: 'mound', single: true, canFlip: true },
    { id: 'vessel', label: 'VESSELS', asset: ASSETS.VESSELS, indexKey: 'vesselIndex', offsetKey: 'vessel', canFlip: true },
    { id: 'food', label: 'FOOD', asset: ASSETS.FOOD, indexKey: 'foodIndex', offsetKey: null },
    { id: 'settings', label: 'BEHAVIOR', asset: null, indexKey: null, offsetKey: null } // Renamed to BEHAVIOR
];

const GENERIC_LIST = Array.from({length: 16}).map((_, i) => `Option ${i + 1}`);

const getSpriteStyle = (index: number, filename: string, isSingleImage = false) => {
    if (isSingleImage) {
        return {
            backgroundImage: `url('${ASSET_PATH}${filename}')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        };
    }
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
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // This state controls the Rig Animation & Direction explicitly
    const [rigAnimation, setRigAnimation] = useState('anim-idle');

    const runningRef = useRef(false); 
    const loopIdRef = useRef(0);
    const audioCtxRef = useRef<any>(null);
    const servitorPosRef = useRef(20);
    const holdIntervalRef = useRef<any>(null); 
    const buttonIntervalRef = useRef<any>(null); 

    const [sName, setSName] = useState("");
    const [sPurpose, setSPurpose] = useState("");
    const [uName, setUName] = useState("");
    const [user, setUser] = useState<any>(null);
    const [savedServitors, setSavedServitors] = useState<any[]>([]);
    
    const [config, setConfig] = useState({
        baseIndex: 0, limbIndex: 0, legIndex: 0, toolIndex: 0,
        hatIndex: 0, wingIndex: 0, vesselIndex: 0, clothingIndex: 0,
        sigilIndex: 0, foodIndex: 0, treasureIndex: 0,
        
        movementType: "walk", 
        feedFreq: 5,
        offsets: JSON.parse(JSON.stringify(DEFAULT_OFFSETS))
    });

    const [depositCount, setDepositCount] = useState(0);
    const depositRef = useRef(0);
    const [hungerState, setHungerState] = useState<'sated' | 'hungry' | 'fed'>('sated');
    const [awakenProgress, setAwakenProgress] = useState(0);
    const [isAwakening, setIsAwakening] = useState(false);
    const [isFeeding, setIsFeeding] = useState(false);
    const [feedProgress, setFeedProgress] = useState(0);
    const [fallingFood, setFallingFood] = useState<{id: number, left: number, top: number, spriteIndex: number}[]>([]);

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
    const updateOffset = (part: string, field: 'x'|'y'|'s'|'f'|'v'|'spread', value: number | boolean) => {
        setConfig(prev => ({
            ...prev,
            offsets: {
                ...prev.offsets,
                [part]: { ...(prev.offsets as any)[part], [field]: value }
            }
        }));
    };

    const handleOffsetStart = (part: string, field: 'x'|'y'|'s'|'spread', change: number) => {
        const current = (config.offsets as any)[part][field] || 0;
        const step = field === 's' ? 0.1 : 1.0; 
        updateOffset(part, field, current + (change * step));

        buttonIntervalRef.current = setInterval(() => {
            setConfig(prev => {
                const cur = (prev.offsets as any)[part][field] || 0;
                return {
                    ...prev,
                    offsets: {
                        ...prev.offsets,
                        [part]: { ...(prev.offsets as any)[part], [field]: cur + (change * step) }
                    }
                };
            });
        }, 100);
    };

    const handleOffsetStop = () => {
        if (buttonIntervalRef.current) clearInterval(buttonIntervalRef.current);
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

        while(runningRef.current && loopIdRef.current === id) {
            
            // 1. Walk to Mound (Left)
            // UPDATED: Go deeper into the void (7% instead of 15%)
            if(servitor) { servitor.style.opacity = '1'; servitor.style.transform = 'scale(1)'; }
            setRigAnimation(config.movementType === 'fly' ? 'anim-fly-left' : 'anim-walk-left');
            
            await moveTo(7, id); 
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
            setRigAnimation(config.movementType === 'fly' ? 'anim-fly-right' : 'anim-walk-right');
            
            // UPDATED: Walk further past vessel (88% instead of 80%)
            await moveTo(88, id);
            if(!runningRef.current) break;

            // 5. Deposit
            setRigAnimation('anim-idle');
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
            if(type === 'feed' && Math.random() > 0.6) {
                const targetX = servitorPosRef.current;
                setFallingFood(prev => [...prev, {
                    id: Math.random(), 
                    left: Math.max(0, Math.min(90, targetX + (Math.random()*10 - 5))), 
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

    const DPad = ({ part, allowFlip = false, allowSpread = false }: { part: string, allowFlip?: boolean, allowSpread?: boolean }) => {
        const cfg = (config.offsets as any)[part];
        if(!cfg) return null;
        const btnClass = "p-1 bg-[#3e2723] hover:bg-[#5d4037] active:bg-[#8d6e63] rounded flex justify-center items-center shadow border border-black/30 text-white";

        return (
            <div className="flex items-center gap-2 bg-[#2a1a1a]/80 p-2 rounded border border-[#5d4037]/50 mt-2 backdrop-blur-sm shadow-lg w-full justify-center">
                <button onClick={() => updateOffset(part, 'v', !cfg.v)} 
                    className={`p-2 rounded border shadow ${cfg.v ? 'bg-green-900/50 border-green-700 text-green-300' : 'bg-red-900/50 border-red-700 text-red-300'}`}>
                    {cfg.v ? <Eye size={16}/> : <EyeOff size={16}/>}
                </button>
                <div className="grid grid-cols-3 gap-1 w-20">
                    <div />
                    <button onMouseDown={() => handleOffsetStart(part, 'y', -1)} onMouseUp={handleOffsetStop} onMouseLeave={handleOffsetStop} className={btnClass}><ArrowUp size={12}/></button>
                    <div />
                    <button onMouseDown={() => handleOffsetStart(part, 'x', -1)} onMouseUp={handleOffsetStop} onMouseLeave={handleOffsetStop} className={btnClass}><ArrowLeft size={12}/></button>
                    <div className="flex justify-center items-center text-[8px] text-gray-400"><Move size={12}/></div>
                    <button onMouseDown={() => handleOffsetStart(part, 'x', 1)} onMouseUp={handleOffsetStop} onMouseLeave={handleOffsetStop} className={btnClass}><ArrowRight size={12}/></button>
                    <div />
                    <button onMouseDown={() => handleOffsetStart(part, 'y', 1)} onMouseUp={handleOffsetStop} onMouseLeave={handleOffsetStop} className={btnClass}><ArrowDown size={12}/></button>
                    <div />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                        <button onMouseDown={() => handleOffsetStart(part, 's', -0.1)} onMouseUp={handleOffsetStop} onMouseLeave={handleOffsetStop} className={btnClass}><Minus size={12}/></button>
                        <button onMouseDown={() => handleOffsetStart(part, 's', 0.1)} onMouseUp={handleOffsetStop} onMouseLeave={handleOffsetStop} className={btnClass}><Plus size={12}/></button>
                    </div>
                    
                    {allowSpread && (
                        <div className="flex gap-1">
                            <button onMouseDown={() => handleOffsetStart(part, 'spread', -1)} onMouseUp={handleOffsetStop} onMouseLeave={handleOffsetStop} className={btnClass} title="Decrease Spread"><ArrowLeftRight size={12} className="rotate-90"/></button>
                            <button onMouseDown={() => handleOffsetStart(part, 'spread', 1)} onMouseUp={handleOffsetStop} onMouseLeave={handleOffsetStop} className={btnClass} title="Increase Spread"><ArrowLeftRight size={12}/></button>
                        </div>
                    )}

                    {allowFlip && (
                        <button onClick={() => updateOffset(part, 'f', !cfg.f)} className={`p-1 rounded flex gap-1 items-center justify-center text-[10px] border ${cfg.f ? 'bg-amber-700 border-amber-500 text-white' : 'bg-[#3e2723] border-[#5d4037] text-gray-400'}`}>
                            <RefreshCw size={10} /> Flip
                        </button>
                    )}
                </div>
                <div className="text-[9px] text-gray-400 font-mono flex flex-col leading-tight ml-1 w-12">
                    <span>X: {cfg.x.toFixed(0)}</span>
                    <span>Y: {cfg.y.toFixed(0)}</span>
                    <span>S: {cfg.s.toFixed(1)}</span>
                    {allowSpread && <span>Spr: {cfg.spread.toFixed(1)}</span>}
                </div>
            </div>
        );
    };

    const ServitorRig = ({ idPrefix, isPreview = false, overrideDirection }: { idPrefix: string, isPreview?: boolean, overrideDirection?: 'left'|'right' }) => {
        const wrapperClass = isFeeding ? 'anim-feed' : 'anim-idle';
        
        // Determine facing direction
        const isFacingLeft = rigAnimation.includes('left');
        const isFlying = config.movementType === 'fly' || rigAnimation.includes('fly');

        // Helper for Z-Index from Config
        const getZ = (key: keyof typeof LAYER_ORDER_CONFIG.facingRight) => {
            const map = isFacingLeft ? LAYER_ORDER_CONFIG.facingLeft : LAYER_ORDER_CONFIG.facingRight;
            return map[key];
        };

        const renderPart = (idx: number, asset: string, partKey: string, z: number, partType: 'limb' | 'static', specificLimb?: 'armLeft' | 'armRight' | 'legLeft' | 'legRight') => {
            // 1. Get User Config (Starts at 0/0/0)
            const userCfg = (config.offsets as any)[partKey];
            if (!userCfg.v) return null;

            // 2. Get Base Config (The consolidated Default)
            const baseMap = DIRECTIONAL_OFFSETS.facingRight;
            const baseCfg = specificLimb ? (baseMap as any)[specificLimb] : (baseMap as any)[partKey] || { x:0, y:0, s:1, f:false };

            // 3. Get Directional Adjustments (Left Walk offsets)
            const dirMap = isFacingLeft ? DIRECTIONAL_OFFSETS.facingLeft : null;
            const dirCfg = dirMap ? (specificLimb ? (dirMap as any)[specificLimb] : (dirMap as any)[partKey]) : { x:0, y:0, s:0 };

            // 4. Calculate Final Values
            let flip = baseCfg.f !== userCfg.f; 
            if (isFacingLeft) flip = !flip;

            let spreadMod = 0;
            if (partType === 'limb' && userCfg.spread) {
                if (specificLimb?.includes('Left')) spreadMod = -userCfg.spread;
                if (specificLimb?.includes('Right')) spreadMod = userCfg.spread;
            }

            // MATH: Base + Direction Adjustment + User Adjustment + Spread
            const totalX = baseCfg.x + (dirCfg?.x || 0) + userCfg.x + spreadMod;
            const totalY = baseCfg.y + (dirCfg?.y || 0) + userCfg.y;
            const totalS = baseCfg.s + (dirCfg?.s || 0) + userCfg.s; 

            const spriteTransform = `translate(${totalX}%, ${totalY}%) scale(${totalS}) ${flip ? 'scaleX(-1)' : ''}`;
            
            // 5. Dynamic Transform Origin Calculation
            // This ensures pivots stay on the Shoulder/Hip regardless of flip
            let originX = '50%';
            let originY = '20%';

            if (specificLimb?.includes('arm') || partKey === 'tool') {
                // Arms (Right Default): Shoulder is Top-Left (approx 15%)
                // If facing Right: 15%. If facing Left (flipped): 85%
                const baseArmX = 15; 
                originX = isFacingLeft ? `${100 - baseArmX}%` : `${baseArmX}%`;
                originY = '15%'; // Shoulder height
            } else if (specificLimb?.includes('leg')) {
                // Legs (Left Default): Hip is Top-Right (approx 85%)
                // If facing Left (default orientation): 85%. If facing Right (flipped): 15%
                const baseLegX = 85;
                originX = isFacingLeft ? `${baseLegX}%` : `${100 - baseLegX}%`;
                originY = '10%'; // Hip height
            }

            // Joint logic
            let jointClass = '';
            if (partType === 'limb' && specificLimb) {
                if (specificLimb === 'armLeft') jointClass = 'arm-left-joint';
                if (specificLimb === 'armRight') jointClass = 'arm-right-joint';
                if (specificLimb === 'legLeft') jointClass = 'leg-left-joint';
                if (specificLimb === 'legRight') jointClass = 'leg-right-joint';
            }
            
            // Tool Animation Logic (Sync with Right Arm)
            // If this part is the 'tool', we apply the exact same animation class as the arm-right-joint
            if (partKey === 'tool') {
                 // Determine which joint class mimics the right arm for the current direction
                 if (isFacingLeft) {
                    jointClass = 'tool-hand-anim'; // Will use same keyframes as arm-right but handle flipping if needed
                 } else {
                    jointClass = 'tool-hand-anim';
                 }
            }

            return (
                <div className={`joint absolute w-full h-full top-0 left-0 ${jointClass}`} 
                     style={{ zIndex: z, transformOrigin: `${originX} ${originY}` }}>
                    <div className="sprite absolute w-full h-full top-0 left-0 pointer-events-none"
                         style={{ ...getSpriteStyle(idx, asset), transform: spriteTransform }} />
                </div>
            );
        };

        const renderStatic = (idx: number, asset: string, partKey: string, z: number) => {
            return renderPart(idx, asset, partKey, z, 'static');
        };

        const gUser = config.offsets.global;
        const gBase = DIRECTIONAL_OFFSETS.facingRight.global;
        const finalGx = gBase.x + gUser.x;
        const finalGy = gBase.y + gUser.y;
        const finalGs = gBase.s + gUser.s;
        const finalGf = gBase.f !== gUser.f; 

        // Add floating class if flying
        const flyClass = isFlying ? 'anim-floating' : '';

        // Force transform-origin to bottom center for proper global scaling
        const globalTransform = `translate(${finalGx}%, ${finalGy}%) scale(${finalGs}) ${finalGf ? 'scaleX(-1)' : ''}`;
        const previewStyle = isPreview ? `translateY(${UI_PREVIEW_SETTINGS.y}%) scale(${UI_PREVIEW_SETTINGS.scale})` : '';

        return (
            <div id={idPrefix} 
                 className={`servitor-rig relative w-32 h-32 ${rigAnimation} ${wrapperClass} ${flyClass}`} 
                 style={{ 
                     transform: `${previewStyle} ${globalTransform}`,
                     transformOrigin: 'bottom center' // CRITICAL: Ensures "Whole" scaling keeps feet planted/centered
                 }}>
                {renderStatic(config.wingIndex, ASSETS.BACK, 'wing', getZ('wing'))}
                {renderPart(config.legIndex, ASSETS.LEGS, 'leg', getZ('legLeft'), 'limb', 'legLeft')}
                {renderPart(config.legIndex, ASSETS.LEGS, 'leg', getZ('legRight'), 'limb', 'legRight')}
                {renderStatic(config.baseIndex, ASSETS.BASES, 'base', getZ('base'))}
                {renderStatic(config.clothingIndex, ASSETS.CLOTHES, 'clothes', getZ('clothes'))}
                {renderStatic(config.sigilIndex, ASSETS.TREASURES, 'sigil', getZ('sigil'))} 
                {renderPart(config.limbIndex, ASSETS.ARMS, 'arm', getZ('armLeft'), 'limb', 'armLeft')}
                {renderPart(config.limbIndex, ASSETS.ARMS, 'arm', getZ('armRight'), 'limb', 'armRight')}
                {renderStatic(config.toolIndex, ASSETS.TOOLS, 'tool', getZ('tool'))} 
                {renderStatic(config.hatIndex, ASSETS.HEAD, 'head', getZ('head'))}
            </div>
        );
    };

    if (!assetsLoaded) return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-999">
            <div className="w-32 h-32 animate-spin" style={getSpriteStyle(0, ASSETS.TREASURES)}></div>
            <p className="text-[#FFD700] mt-4 font-serif">Summoning Assets... {loadProgress}%</p>
        </div>
    );

    const isFeedingActive = hungerState === 'hungry' || isFeeding || hungerState === 'fed';

    const getGameObjectStyle = (key: 'mound' | 'vessel') => {
        const u = (config.offsets as any)[key];
        const b = (DIRECTIONAL_OFFSETS.facingRight as any)[key];
        return {
            transform: `scale(${b.s + u.s}) translate(${b.x + u.x}%, ${b.y + u.y}%)`,
            filter: !u.v ? 'opacity(0)' : 'none'
        };
    };

    return (
        <div className="fixed inset-0 w-full h-full bg-[#0f0f1a] text-[#dcdcdc] overflow-hidden select-none font-sans flex flex-col">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');
                
                .magick-font { font-family: 'MedievalSharp', cursive; }
                body { font-family: 'MedievalSharp', cursive; }

                .runic-btn { background: url('${ASSET_PATH}${ASSETS.UI_BUTTONS}') center/cover; color: #FFD700; text-shadow: 0 1px 2px black; border: 1px solid #FFD70050; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .runic-btn:active { transform: scale(0.95); filter: brightness(0.8); }
                
                @keyframes bounce { 0% { top: 0; } 50% { top: -5px; } }
                
                /* Rotation for walking limbs */
                @keyframes rotate-l { 0% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } 100% { transform: rotate(-5deg); } }
                @keyframes rotate-r { 0% { transform: rotate(5deg); } 50% { transform: rotate(-5deg); } 100% { transform: rotate(5deg); } }
                
                /* Feeding Wave Animation (Arms wave up and down) */
                @keyframes feed-wave {
                    0% { transform: rotate(0deg); }
                    50% { transform: rotate(-45deg); } 
                    100% { transform: rotate(0deg); }
                }

                /* Flying Bob */
                @keyframes float-bob {
                    0% { transform: translateY(-40px); }
                    50% { transform: translateY(-60px); }
                    100% { transform: translateY(-40px); }
                }
                .anim-floating { animation: float-bob 3s ease-in-out infinite; }

                @keyframes fall { from { top: -10%; opacity: 1; } to { top: 100%; opacity: 0; } }

                .anim-walk-left .servitor-rig { animation: bounce 0.6s infinite; }
                .anim-walk-left .leg-left-joint { animation: rotate-l 1.2s infinite ease-in-out; }
                .anim-walk-left .leg-right-joint { animation: rotate-r 1.2s infinite ease-in-out; }
                .anim-walk-left .arm-left-joint { animation: rotate-r 1.2s infinite ease-in-out; }
                .anim-walk-left .arm-right-joint { animation: rotate-l 1.2s infinite ease-in-out; }
                /* Tool syncs with Right Arm logic when walking Left (which is "back" arm) */
                .anim-walk-left .tool-hand-anim { animation: rotate-l 1.2s infinite ease-in-out; }
                
                .anim-walk-right .servitor-rig { animation: bounce 0.6s infinite; }
                .anim-walk-right .leg-left-joint { animation: rotate-r 1.2s infinite ease-in-out; }
                .anim-walk-right .leg-right-joint { animation: rotate-l 1.2s infinite ease-in-out; }
                .anim-walk-right .arm-left-joint { animation: rotate-l 1.2s infinite ease-in-out; }
                .anim-walk-right .arm-right-joint { animation: rotate-r 1.2s infinite ease-in-out; }
                /* Tool syncs with Right Arm logic when walking Right (Front arm) */
                .anim-walk-right .tool-hand-anim { animation: rotate-r 1.2s infinite ease-in-out; }

                /* Feeding Animation Overrides */
                .anim-feed .arm-left-joint { animation: feed-wave 0.5s infinite ease-in-out; }
                .anim-feed .arm-right-joint { animation: feed-wave 0.5s infinite ease-in-out; animation-delay: 0.1s; }
                .anim-feed .tool-hand-anim { animation: feed-wave 0.5s infinite ease-in-out; animation-delay: 0.1s; }

                /* Enhanced Glow Effects */
                .pulse-glow-void { animation: pulse-void 1s infinite alternate; }
                @keyframes pulse-void { from { filter: drop-shadow(0 0 10px #4b0082); } to { filter: drop-shadow(0 0 40px #8a2be2); } }
                .pulse-glow-gold { animation: pulse-gold 0.5s infinite alternate; }
                @keyframes pulse-gold { from { filter: drop-shadow(0 0 10px #FFD700); } to { filter: drop-shadow(0 0 50px #FFFF00); } }
                
                .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #5d4037; border-radius: 4px; }
            `}</style>

            <button onClick={() => hasUnsavedChanges ? setShowExitWarning(true) : router.push('/spell-room')} className="absolute top-4 right-4 z-60 text-gray-400 hover:text-white"><X /></button>

            {/* STAGE */}
            <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url('${ASSET_PATH}${ASSETS.BG_MAIN}')` }}>
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* GAME WORLD */}
            <div className="relative w-full h-full z-10 pointer-events-none">
                <div id="game-mound" className="absolute bottom-[15vh] left-[10%] w-40 h-[100px] z-20 bg-contain bg-no-repeat bg-bottom transition-all duration-500"
                     style={{ backgroundImage: `url('${ASSET_PATH}${ASSETS.MOUND}')`, ...getGameObjectStyle('mound') }} />

                <div id="servitor-container" className="absolute bottom-[18vh] left-[20%] w-32 h-32 z-100 transition-all duration-100 pointer-events-auto origin-bottom">
                    <ServitorRig idPrefix="game-rig" />
                </div>

                <div className="absolute bottom-[20vh] right-[10%] w-32 h-32 z-20 flex flex-col items-center">
                    {config.offsets.vessel.v && (
                        <div id="game-vessel" className="w-full h-full relative transition-all duration-500" 
                             style={{ ...getSpriteStyle(config.vesselIndex, ASSETS.VESSELS), ...getGameObjectStyle('vessel') }} />
                    )}
                    <div id="vessel-shine" className="absolute top-0 text-4xl opacity-0 transition-opacity duration-500">✨</div>
                </div>

                {fallingFood.map(f => (
                    <div key={f.id} className="absolute w-16 h-16 z-[200] animate-bounce"
                         style={{ left: f.left + '%', top: f.top + '%', animation: 'fall 1.5s linear forwards', ...getSpriteStyle(f.spriteIndex, ASSETS.FOOD) }} />
                ))}
            </div>

            {/* HUD */}
            {isRunning && !isFeedingActive && (
                <div className="absolute bottom-6 left-0 w-full z-40 px-4 flex flex-wrap justify-between items-end gap-4 pointer-events-auto">
                    <button onClick={() => { setIsRunning(false); runningRef.current = false; }} className="runic-btn px-6 py-3 rounded uppercase font-bold text-xs tracking-widest whitespace-nowrap">Modify Ritual</button>
                    <div className="runic-btn px-6 py-2 rounded-full text-center min-w-[120px]"><div><p className="text-[10px] uppercase opacity-70">Wealth Count</p><p className="text-xl font-bold">{depositCount}</p></div></div>
                </div>
            )}

            {/* CONFIG PANEL - Lowered by 30px via top-[30px] and h-[calc(100%-30px)] */}
            <div className={`absolute top-[30px] left-0 h-[calc(100%-30px)] w-full md:w-[500px] z-50 transition-transform duration-500 ease-in-out ${isRunning ? '-translate-x-full' : 'translate-x-0'} pointer-events-auto flex flex-col bg-[#0f0f1a]`}
                 style={{ borderImage: `url('${ASSET_PATH}${ASSETS.UI_PANEL}') 18% 15% fill stretch`, borderWidth: '40px', padding: '20px' }}>
                
                {/* 1. FIXED PREVIEW AREA */}
                <div className="h-[45%] w-full relative border-b border-[#5d4037] shrink-0 flex flex-col items-center justify-center z-50">
                    {/* Inputs raised higher (mt-2 instead of absolute top), stacked on mobile */}
                    <div className="absolute top-0 w-full p-2 flex flex-col md:flex-row gap-2 z-50">
                        <input type="text" value={sName} onChange={e => setSName(e.target.value)} 
                            className="flex-1 bg-[#f0e6d2] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-[#5d4037] p-2 text-sm text-black rounded magick-font placeholder-gray-600" 
                            placeholder="Spirit Name" />
                        <input type="text" value={sPurpose} onChange={e => setSPurpose(e.target.value)} 
                            className="flex-1 bg-[#f0e6d2] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-[#5d4037] p-2 text-sm text-black rounded magick-font placeholder-gray-600" 
                            placeholder="Purpose" />
                    </div>
                    {/* Render Servitor with Preview Settings */}
                    <div className="relative z-10 mt-12">
                        <ServitorRig idPrefix="preview-rig" isPreview={true} />
                    </div>
                </div>

                {/* 2. MENU GRID */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-[#eaddcf]/90 relative">
                    {!activeCategory ? (
                        <div className="grid grid-cols-3 gap-2">
                            {CATEGORIES.map(cat => {
                                const currentIdx = cat.indexKey ? (config as any)[cat.indexKey] : 0;
                                const isSingle = cat.single || false;
                                return (
                                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                                        className="flex flex-col items-center gap-1 group bg-[#eaddcf] p-2 border border-[#8d6e63] rounded shadow-sm hover:border-[#3e2723]">
                                        <div className="w-12 h-12 flex items-center justify-center relative overflow-hidden">
                                            {cat.asset ? (
                                                <div className="w-full h-full transform scale-90" style={getSpriteStyle(currentIdx, cat.asset, isSingle)} />
                                            ) : cat.id === 'global' ? (
                                                <User size={24} className="text-[#3e2723]" />
                                            ) : (
                                                <Settings size={24} className="text-[#3e2723]"/>
                                            )}
                                        </div>
                                        <span className="text-[9px] text-[#3e2723] font-bold uppercase tracking-wider">{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        // 3. POPUP CONTROLS
                        <div className="absolute inset-0 bg-[#eaddcf] p-2 z-20 flex flex-col">
                            <div className="flex justify-between items-center mb-2 border-b border-[#3e2723] pb-1">
                                <h3 className="text-[#3e2723] font-bold uppercase">{CATEGORIES.find(c => c.id === activeCategory)?.label}</h3>
                                <button onClick={() => setActiveCategory(null)}><X size={20} className="text-[#3e2723]"/></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {activeCategory === 'settings' ? (
                                    <div className="space-y-4 p-2">
                                        <div className="bg-black/10 p-3 rounded">
                                            <label className="text-xs font-bold text-[#3e2723]">Feeding Frequency: {config.feedFreq}</label>
                                            <input type="range" min="1" max="50" value={config.feedFreq} onChange={e => setConfig({...config, feedFreq: parseInt(e.target.value)})} className="w-full accent-[#3e2723]" />
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <label className="text-xs font-bold text-[#3e2723]">Mode:</label>
                                            <select value={config.movementType} onChange={e => setConfig({...config, movementType: e.target.value})} className="bg-white/50 text-xs text-black p-1 rounded border border-[#8d6e63]">
                                                <option value="walk">Walk</option><option value="fly">Fly</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Controls (DPad) - Moved ABOVE Grid */}
                                        {CATEGORIES.find(c => c.id === activeCategory)?.offsetKey && (
                                            <div className="mb-4">
                                                <DPad 
                                                    part={CATEGORIES.find(c => c.id === activeCategory)?.offsetKey as string} 
                                                    allowFlip={CATEGORIES.find(c => c.id === activeCategory)?.canFlip} 
                                                    allowSpread={CATEGORIES.find(c => c.id === activeCategory)?.canSpread}
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Grid */}
                                        {CATEGORIES.find(c => c.id === activeCategory)?.indexKey && (
                                            <div className="grid grid-cols-4 gap-2 mb-4">
                                                {GENERIC_LIST.map((_, i) => (
                                                    <button key={i} 
                                                        onClick={() => setConfig({...config, [(CATEGORIES.find(c => c.id === activeCategory)?.indexKey as string)]: i})}
                                                        className={`w-full aspect-square border-2 rounded overflow-hidden bg-white/50 ${(config as any)[CATEGORIES.find(c => c.id === activeCategory)?.indexKey as string] === i ? 'border-[#3e2723] ring-1 ring-[#3e2723]' : 'border-transparent'}`}>
                                                        <div className="w-full h-full transform scale-75" 
                                                             style={getSpriteStyle(i, (CATEGORIES.find(c => c.id === activeCategory)?.asset as string), CATEGORIES.find(c => c.id === activeCategory)?.single)} />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. FIXED ACTION BUTTONS */}
                <div className="p-4 border-t border-[#5d4037]/30 flex gap-2 shrink-0 bg-[#eaddcf]">
                    <button onMouseDown={() => startHold('awaken')} onMouseUp={stopHold} onMouseLeave={stopHold} onTouchStart={() => startHold('awaken')} onTouchEnd={stopHold}
                        className="runic-btn flex-1 py-3 text-xs font-bold uppercase tracking-widest relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-75 ease-linear" style={{width: `${awakenProgress}%`}}></div>
                        <span className="relative z-10 text-center w-full block">{isAwakening ? "Awakening..." : "Hold to Awaken"}</span>
                    </button>
                    <button onClick={handleBind} className="flex-1 py-3 bg-[#5d4037] text-white text-xs uppercase font-bold rounded shadow hover:bg-[#3e2723] text-center">
                        Bind/Save ({COST_BIND_SERVITOR})
                    </button>
                </div>
            </div>

            {/* FEEDING MODAL */}
            {isFeedingActive && (
                // Background opacity is removed (bg-black/0) when holding (isFeeding=true)
                <div className={`absolute inset-0 z-[200] flex flex-col items-center justify-center transition-colors duration-300 ${isFeeding ? 'bg-black/0' : 'bg-black/80'}`}>
                    {hungerState === 'fed' ? (
                        <div className="text-center animate-in zoom-in">
                            <h2 className="text-[#FFD700] magick-font text-3xl mb-4">Hunger Sated</h2>
                            <button onClick={handleResume} className="runic-btn px-8 py-3 rounded text-lg font-bold">Resume Ritual</button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            {/* Text disappears while feeding to clear view */}
                            {!isFeeding && <p className="text-[#FFD700] mb-8 animate-pulse text-xl font-serif">{sName} requires sustenance...</p>}
                            
                            <button onMouseDown={() => startHold('feed')} onMouseUp={stopHold} onMouseLeave={stopHold} onTouchStart={() => startHold('feed')} onTouchEnd={stopHold}
                                className={`w-40 h-40 rounded-full border-4 border-[#FFD700] flex items-center justify-center relative overflow-hidden bg-black shadow-[0_0_50px_#FFD700] transition-opacity duration-300 ${isFeeding ? 'opacity-50 scale-75' : 'opacity-100'}`}>
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