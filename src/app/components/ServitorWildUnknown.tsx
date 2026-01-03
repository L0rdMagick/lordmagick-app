"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Lock } from 'lucide-react';
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
    MOUND: 'mound_into_the_void.png', // New Asset
    UI_PANEL: 'Parchment_And_Oak_Responsive_Panels.png',
    BG_MAIN: 'Astral_Plane_Parallax_Layers.jpg',
    UI_BUTTONS: 'Runic_Glass_Button_Set.png'
};

// --- 2. SPRITE TUNING SECTION (ADJUST PROPORTIONS & PLACEMENT) ---
// Scale: 1.0 = 100%. 
// X: Positive moves Right, Negative moves Left (percentages).
// Y: Positive moves Down, Negative moves Up (percentages).
const SPRITE_OFFSET_CONFIG = {
    base:    { scale: 1.0,  x: 0,   y: 0 },   // Main Torso
    arm:     { scale: 0.75, x: 0,   y: 5 },   // Arms (Moved down slightly)
    leg:     { scale: 0.75, x: 0,   y: 0 },   // Legs
    head:    { scale: 0.85, x: 0,   y: -5 },  // Hats (Moved up slightly)
    clothes: { scale: 1.05, x: 0,   y: 0 },   // Clothes
    tool:    { scale: 0.6,  x: 5,   y: 10 },  // Tools (Moved right/down to fit hand)
    wings:   { scale: 1.2,  x: 0,   y: -5 },  // Back elements
    vessel:  { scale: 1.0,  x: 0,   y: 0 }    // The Chest/Cauldron
};

const GENERIC_LIST = Array.from({length: 16}).map((_, i) => `Option ${i + 1}`);

interface SavedServitor {
    id: string;
    name: string;
    master_name: string;
    purpose: string;
    config: any;
}

// Helper: Get Sprite CSS
const getSpriteStyle = (index: number, filename: string) => {
    const safeIndex = Math.max(0, Math.min(15, index));
    const col = safeIndex % 4;
    const row = Math.floor(safeIndex / 4);
    const xPos = col * 33.333;
    const yPos = row * 33.333;

    return {
        backgroundImage: `url('${ASSET_PATH}${filename}')`,
        backgroundSize: '400% 400%',
        backgroundPosition: `${xPos}% ${yPos}%`,
        backgroundRepeat: 'no-repeat'
    };
};

export default function ServitorWildUnknown() {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // --- State ---
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);

    const [isRunning, setIsRunning] = useState(false);
    const runningRef = useRef(false); 
    const loopIdRef = useRef(0);
    const audioCtxRef = useRef<any>(null);
    const servitorPosRef = useRef(20); 

    const [sName, setSName] = useState("");
    const [sPurpose, setSPurpose] = useState("");
    const [uName, setUName] = useState("");
    
    const [user, setUser] = useState<any>(null);
    const [savedServitors, setSavedServitors] = useState<SavedServitor[]>([]);
    const [wallet, setWallet] = useState<{ credits: number, tier: string, isUnlimited: boolean } | null>(null);

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showExitWarning, setShowExitWarning] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);

    // Config State
    const [config, setConfig] = useState({
        baseIndex: 0, limbIndex: 0, legIndex: 0, toolIndex: 0,
        hatIndex: 0, wingIndex: 0, vesselIndex: 0, clothingIndex: 0,
        sigilIndex: 0, foodIndex: 0,
        hasWings: false, movementType: "walk", 
        soundSearch: "rumble", soundFind: "chime", soundDeposit: "coin",
        feedFreq: 5
    });

    // Interaction State
    const [awakenProgress, setAwakenProgress] = useState(0);
    const [isAwakening, setIsAwakening] = useState(false);
    const [isFeeding, setIsFeeding] = useState(false);
    
    // Gameplay Stats & Visuals
    const [depositCount, setDepositCount] = useState(0);
    const depositRef = useRef(0); 
    const [hungerState, setHungerState] = useState<'sated' | 'hungry' | 'fed'>('sated');
    const [feedProgress, setFeedProgress] = useState(0);
    const [fallingFood, setFallingFood] = useState<{id: number, left: number, top: number, spriteIndex: number}[]>([]);
    const holdIntervalRef = useRef<any>(null);

    // --- Init ---
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
            if (user) { refreshCabinet(user.id); }
        };
        initUser();
    }, [supabase]);

    useEffect(() => { if (sName || sPurpose) setHasUnsavedChanges(true); }, [sName, sPurpose, config]);

    const refreshCabinet = async (userId: string) => {
        const data = await getMyServitors(userId);
        setSavedServitors(data as SavedServitor[]);
        const w = await getWalletStatus(userId);
        setWallet(w);
    };

    // --- Actions ---
    const handleBindToGrimoire = async () => {
        if (!user) return alert("Login required.");
        if (!sName) return alert("Name required.");
        const canAfford = await checkAndSpendCredits(user.id, COST_BIND_SERVITOR);
        if (!canAfford) { setShowCreditModal(true); return; }
        await saveServitorToGrimoire(user.id, { name: sName, master_name: uName, purpose: sPurpose, config: config });
        setHasUnsavedChanges(false);
        refreshCabinet(user.id);
        alert(`Servitor "${sName}" Bound.`);
    };

    const handleLoad = (s: SavedServitor) => {
        setSName(s.name); setUName(s.master_name); setSPurpose(s.purpose); setConfig(s.config);
        setTimeout(() => setHasUnsavedChanges(false), 100);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm("Release entity?")) return;
        await supabase.from('servitors').delete().eq('id', id);
        if(user) refreshCabinet(user.id);
    };

    const initAudio = () => {
        const win = (globalThis as any).window;
        if (!audioCtxRef.current) {
            const AC = win.AudioContext || win.webkitAudioContext;
            if (AC) audioCtxRef.current = new AC();
        }
        if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    };

    const playSound = (type: string) => {
        if(!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        
        if(type === 'glitter') {
            osc.frequency.setValueAtTime(800, now); osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
            g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
        } else if (type === 'search') {
            osc.frequency.setValueAtTime(100, now); osc.frequency.linearRampToValueAtTime(150, now + 1.0);
            g.gain.setValueAtTime(0.2, now); g.gain.linearRampToValueAtTime(0, now + 1.0);
            osc.start(now); osc.stop(now + 1.0);
        } else {
            osc.frequency.setValueAtTime(300, now); g.gain.setValueAtTime(0.05, now);
            osc.start(now); osc.stop(now+0.1);
        }
    };

    // --- Animation Logic ---
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

    const moveTo = (targetPercent: number, id: number) => {
        return new Promise<void>(resolve => {
            const el = document.getElementById('servitor-container');
            if(!el) { resolve(); return; }
            
            const current = parseFloat(el.style.left) || 20;
            const dist = Math.abs(targetPercent - current);
            const time = dist * 40; 

            el.style.transition = `left ${time}ms linear, opacity 0.5s ease, transform 0.5s ease`;
            el.style.opacity = '1';
            el.style.transform = 'scale(1)';
            
            requestAnimationFrame(() => {
                el.style.left = targetPercent + "%";
                servitorPosRef.current = targetPercent; 
            });

            setTimeout(() => { if(runningRef.current && loopIdRef.current === id) resolve(); }, time);
        });
    }

    const setAnim = (cls: string) => {
        const rig = document.getElementById('game-rig');
        if(rig) rig.className = `servitor-rig ${cls}`;
    };

    // --- MAIN GAME LOOP ---
    const mainLoop = async (id: number) => {
        await wait(100);
        const mound = document.getElementById('game-mound');
        const vessel = document.getElementById('game-vessel');
        const servitor = document.getElementById('servitor-container');
        const shine = document.getElementById('vessel-shine');

        while(runningRef.current && loopIdRef.current === id) {
            
            // 1. Walk to Mound (Left)
            if(servitor) { servitor.style.opacity = '1'; servitor.style.transform = 'scale(1)'; }
            setAnim(config.movementType === 'fly' ? 'anim-fly-left' : 'anim-walk-left');
            await moveTo(15, id); 
            if(!runningRef.current) break;

            // 2. Jump INTO Mound (Disappear)
            if(servitor) {
                // Shrink and Fade out
                servitor.style.transition = 'opacity 0.5s, transform 0.5s';
                servitor.style.opacity = '0';
                servitor.style.transform = 'scale(0.1) translateY(50px)';
            }
            await wait(500);

            // 3. Searching (Mound Glows)
            if(mound) mound.classList.add('pulse-glow-void');
            playSound('search');
            await wait(2000); // Searching time
            if(mound) mound.classList.remove('pulse-glow-void');

            // 4. Reappear from Mound
            if(servitor) {
                servitor.style.opacity = '1';
                servitor.style.transform = 'scale(1) translateY(0)';
            }
            await wait(500);
            
            // 5. Walk to Vessel (Right)
            playSound('find');
            setAnim(config.movementType === 'fly' ? 'anim-fly-right' : 'anim-walk-right');
            await moveTo(80, id); 
            if(!runningRef.current) break;

            // 6. Deposit (Vessel Glows)
            setAnim('anim-idle');
            playSound('deposit');
            if(vessel) vessel.classList.add('pulse-glow-gold');
            if(shine) { shine.style.opacity = '1'; setTimeout(() => { if(shine) shine.style.opacity = '0'; }, 1000); }
            
            await wait(1000);
            if(vessel) vessel.classList.remove('pulse-glow-gold');

            // 7. Update Stats
            depositRef.current += 1;
            setDepositCount(depositRef.current);

            if(depositRef.current >= config.feedFreq) {
                setHungerState('hungry');
                break;
            }
            await wait(500);
        }
    };

    // --- Hold Interactions ---
    const startHold = (type: 'awaken' | 'feed') => {
        initAudio();
        const start = Date.now();
        const dur = type === 'awaken' ? 5000 : 3000; 
        if (type === 'awaken') setIsAwakening(true);
        if (type === 'feed') setIsFeeding(true);

        holdIntervalRef.current = setInterval(() => {
            const p = Math.min(100, ((Date.now() - start) / dur) * 100);
            if (type === 'awaken') setAwakenProgress(p);
            else setFeedProgress(p);

            if (p >= 100) {
                clearInterval(holdIntervalRef.current);
                playSound('glitter');
                if (type === 'awaken') {
                    setIsAwakening(false); setIsRunning(true); runningRef.current = true;
                    loopIdRef.current++; mainLoop(loopIdRef.current);
                } else {
                    setIsFeeding(false); setHungerState('fed');
                }
            }
            
            // Food Spawn
            if (type === 'feed' && Math.random() > 0.7) {
                const targetX = servitorPosRef.current + (Math.random() * 10 - 5);
                setFallingFood(prev => [...prev, { id: Math.random(), left: Math.max(0, Math.min(90, targetX)), top: 0, spriteIndex: config.foodIndex }]);
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

    // --- RIG COMPONENT (With Offset Config) ---
    const ServitorRig = ({ idPrefix, isPreview = false }: { idPrefix: string, isPreview?: boolean }) => {
        const wrapperClass = isFeeding ? 'anim-feed' : 'anim-idle';
        
        // Helper to apply the offset config
        const getStyle = (partIndex: number, asset: string, partConfig: {scale: number, x: number, y: number}, flip: boolean = false) => {
            const transform = `
                translate(${partConfig.x}%, ${partConfig.y}%) 
                scale(${partConfig.scale}) 
                ${flip ? 'scaleX(-1)' : ''}
            `;
            return {
                ...getSpriteStyle(partIndex, asset),
                transform,
                transformOrigin: 'top center'
            };
        };

        const sc = SPRITE_OFFSET_CONFIG;

        return (
            <div id={idPrefix} className={`servitor-rig relative w-[128px] h-[128px] ${wrapperClass}`} style={{ transform: isPreview ? 'scale(1.5)' : 'scale(1)' }}>
                {config.hasWings && <div className="absolute inset-0 z-0" style={getStyle(config.wingIndex, ASSETS.BACK, sc.wings)} />}
                
                <div className="limb leg-left absolute z-10 w-full h-full" style={getStyle(config.legIndex, ASSETS.LEGS, sc.leg, true)} />
                <div className="limb leg-right absolute z-10 w-full h-full" style={getStyle(config.legIndex, ASSETS.LEGS, sc.leg)} />

                <div className="base absolute inset-0 z-20" style={getStyle(config.baseIndex, ASSETS.BASES, sc.base)} />
                <div className="clothes absolute inset-0 z-30" style={getStyle(config.clothingIndex, ASSETS.CLOTHES, sc.clothes)} />

                <div className="limb arm-left absolute z-40 w-full h-full" style={getStyle(config.limbIndex, ASSETS.ARMS, sc.arm, true)} />
                <div className="limb arm-right absolute z-40 w-full h-full" style={getStyle(config.limbIndex, ASSETS.ARMS, sc.arm)} />

                <div className="hat absolute inset-0 z-50" style={getStyle(config.hatIndex, ASSETS.HEAD, sc.head)} />
                <div className="tool absolute inset-0 z-60" style={getStyle(config.toolIndex, ASSETS.TOOLS, sc.tool)} />
            </div>
        );
    };

    if (!assetsLoaded) {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[999]">
                 <div className="w-32 h-32 animate-spin" style={getSpriteStyle(0, ASSETS.TREASURES)}></div>
                 <p className="text-[#FFD700] mt-4 font-serif">Summoning Assets... {loadProgress}%</p>
            </div>
        );
    }

    const isFeedingActive = hungerState === 'hungry' || isFeeding || hungerState === 'fed';

    return (
        <div className="fixed inset-0 w-full h-full bg-[#0f0f1a] text-[#dcdcdc] overflow-hidden select-none font-sans flex flex-col">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
                .magick-font { font-family: 'Cinzel', serif; }

                /* BUTTONS */
                .runic-btn {
                    background: url('${ASSET_PATH}${ASSETS.UI_BUTTONS}') center/cover no-repeat;
                    color: #FFD700; text-shadow: 0 1px 2px black;
                    border: 1px solid rgba(255, 215, 0, 0.3);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.5);
                    transition: all 0.2s; display: flex; align-items: center; justify-content: center;
                }
                .runic-btn:active { transform: scale(0.95); filter: brightness(0.8); }

                /* ANIMATIONS */
                @keyframes rig-bounce { 0%, 100% { top: 0; } 50% { top: -5px; } }
                @keyframes fall { from { top: -10%; } to { top: 80%; opacity: 0; } }
                
                /* Pulse Glows */
                .pulse-glow-void { animation: pulse-void 1s infinite alternate; }
                @keyframes pulse-void { from { filter: drop-shadow(0 0 5px #4b0082) brightness(1); } to { filter: drop-shadow(0 0 20px #8a2be2) brightness(1.5); } }
                
                .pulse-glow-gold { animation: pulse-gold 0.5s infinite alternate; }
                @keyframes pulse-gold { from { filter: drop-shadow(0 0 5px #FFD700); } to { filter: drop-shadow(0 0 25px #FFFF00); } }

                /* Walk Logic */
                .anim-walk-left .leg-left { transform: rotate(-15deg) scaleX(-1) !important; transition: 0.5s; }
                .anim-walk-left .leg-right { transform: rotate(15deg) !important; transition: 0.5s; }
                .anim-walk-left { animation: rig-bounce 0.5s infinite; }

                .anim-walk-right .leg-left { transform: rotate(15deg) scaleX(-1) !important; transition: 0.5s; }
                .anim-walk-right .leg-right { transform: rotate(-15deg) !important; transition: 0.5s; }
                .anim-walk-right { animation: rig-bounce 0.5s infinite; transform: scaleX(-1); }

                /* SCROLLBAR */
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #5d4037; border-radius: 4px; }
            `}</style>

            <button onClick={() => hasUnsavedChanges ? setShowExitWarning(true) : router.push('/spell-room')} className="absolute top-4 right-4 z-[60] text-gray-400 hover:text-white"><X /></button>

            {/* STAGE */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${ASSET_PATH}${ASSETS.BG_MAIN}')` }}></div>
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* GAME WORLD (Z-Index Hierarchy: Background 0 -> Mound/Vessel 10 -> Servitor 20) */}
            <div className="relative w-full h-full z-10 pointer-events-none">
                
                {/* MOUND (Left Destination) */}
                <div id="game-mound" className="absolute bottom-[15vh] left-[10%] w-[160px] h-[100px] z-10 bg-contain bg-no-repeat bg-bottom transition-all duration-500"
                     style={{ backgroundImage: `url('${ASSET_PATH}${ASSETS.MOUND}')` }} />

                {/* SERVITOR (Moves between Mound and Vessel) */}
                <div id="servitor-container" className="absolute bottom-[18vh] left-[20%] w-[128px] h-[128px] z-20 transition-all duration-100 pointer-events-auto origin-bottom">
                    <ServitorRig idPrefix="game-rig" />
                </div>

                {/* VESSEL (Right Destination) */}
                <div className="absolute bottom-[20vh] right-[10%] w-[128px] h-[128px] z-10 flex flex-col items-center">
                    <div id="game-vessel" className="w-full h-full relative transition-all duration-500" 
                         style={{ ...getSpriteStyle(config.vesselIndex, ASSETS.VESSELS), transform: `scale(${SPRITE_OFFSET_CONFIG.vessel.scale})` }}>
                         <div className="absolute top-[20%] left-[25%] w-[50%] h-[50%] opacity-80 mix-blend-overlay" style={getSpriteStyle(config.sigilIndex, ASSETS.TREASURES)} />
                    </div>
                    <div id="vessel-shine" className="absolute top-0 text-4xl opacity-0 transition-opacity duration-500">✨</div>
                </div>

                {/* FALLING FOOD */}
                {fallingFood.map(f => (
                    <div key={f.id} className="absolute w-16 h-16 z-30 animate-bounce"
                         style={{ left: f.left + '%', top: f.top + '%', animation: 'fall 1s linear forwards', ...getSpriteStyle(f.spriteIndex, ASSETS.FOOD) }} 
                    />
                ))}
            </div>

            {/* BOTTOM HUD (Mobile Flex Fix) */}
            {isRunning && !isFeedingActive && (
                <div className="absolute bottom-6 left-0 w-full z-40 px-4 flex flex-wrap justify-between items-end gap-4 pointer-events-auto">
                    <button onClick={() => { setIsRunning(false); runningRef.current = false; }} className="runic-btn px-6 py-3 rounded uppercase font-bold text-xs tracking-widest whitespace-nowrap">
                        Modify Ritual
                    </button>
                    <div className="runic-btn px-6 py-2 rounded-full text-center min-w-[120px]">
                        <div><p className="text-[10px] uppercase opacity-70">Wealth Count</p><p className="text-xl font-bold">{depositCount}</p></div>
                    </div>
                </div>
            )}

            {/* CONFIG PANEL */}
            <div className={`absolute top-0 left-0 h-full w-full md:w-[500px] z-50 transition-transform duration-500 ease-in-out ${isRunning ? '-translate-x-full' : 'translate-x-0'} pointer-events-auto`}
                 style={{ borderImage: `url('${ASSET_PATH}${ASSETS.UI_PANEL}') 18% 15% fill stretch`, borderWidth: '40px', padding: '20px' }}>
                
                <div className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-2">
                    <div className="text-center border-b border-[#5d4037]/30 pb-2"><h2 className="text-[#3e2723] text-2xl magick-font font-bold">Servitor Forge</h2></div>
                    <div className="flex justify-center py-4 bg-black/10 rounded border border-[#5d4037]/20"><ServitorRig idPrefix="preview-rig" isPreview={true} /></div>

                    {/* Inputs */}
                    <div className="space-y-3">
                        <input type="text" value={sName} onChange={e => setSName(e.target.value)} className="w-full bg-[#fdf5e6] border border-[#8d6e63] p-2 rounded text-[#2a1a1a] placeholder-opacity-50" placeholder="Spirit Name" />
                        <input type="text" value={sPurpose} onChange={e => setSPurpose(e.target.value)} className="w-full bg-[#fdf5e6] border border-[#8d6e63] p-2 rounded text-[#2a1a1a] placeholder-opacity-50" placeholder="Purpose (e.g. Wealth)" />
                    </div>

                    {/* Selection Grids (Scaled down 75% to prevent overflow) */}
                    <div className="space-y-6">
                        {[
                            { label: 'Torso', key: 'baseIndex', asset: ASSETS.BASES },
                            { label: 'Legs', key: 'legIndex', asset: ASSETS.LEGS },
                            { label: 'Arms', key: 'limbIndex', asset: ASSETS.ARMS },
                            { label: 'Headgear', key: 'hatIndex', asset: ASSETS.HEAD },
                            { label: 'Attire', key: 'clothingIndex', asset: ASSETS.CLOTHES },
                            { label: 'Tools', key: 'toolIndex', asset: ASSETS.TOOLS },
                            { label: 'Back / Wings', key: 'wingIndex', asset: ASSETS.BACK },
                            { label: 'Vessel', key: 'vesselIndex', asset: ASSETS.VESSELS },
                            { label: 'Chest Sigil', key: 'sigilIndex', asset: ASSETS.TREASURES },
                            { label: 'Sustenance', key: 'foodIndex', asset: ASSETS.FOOD }
                        ].map((grp, idx) => (
                            <div key={idx}>
                                <label className="block text-xs font-bold text-[#3e2723] uppercase mb-1">{grp.label}</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {GENERIC_LIST.map((_, i) => (
                                        <button key={i} onClick={() => setConfig({...config, [grp.key]: i})}
                                            className={`w-full aspect-square border-2 rounded overflow-hidden bg-[#eaddcf]/50 ${config[grp.key as keyof typeof config] === i ? 'border-[#3e2723] shadow-inner' : 'border-transparent'}`}>
                                            {/* Reduced to 75% scale to prevent overflow */}
                                            <div className="w-full h-full transform scale-75" style={getSpriteStyle(i, grp.asset)} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Frequency & Wings */}
                        <div className="bg-[#5d4037]/10 p-3 rounded space-y-3">
                            <label className="flex justify-between text-xs font-bold text-[#3e2723] uppercase">
                                <span>Feeding Frequency: {config.feedFreq} Tasks</span>
                            </label>
                            <input type="range" min="1" max="50" value={config.feedFreq} onChange={e => setConfig({...config, feedFreq: parseInt(e.target.value)})} className="w-full accent-[#3e2723]" />
                            
                            <div className="flex gap-4 items-center pt-2 border-t border-[#5d4037]/20">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#3e2723] uppercase cursor-pointer">
                                    <input type="checkbox" checked={config.hasWings} onChange={e => setConfig({...config, hasWings: e.target.checked})} className="accent-[#3e2723]" />
                                    Wings
                                </label>
                                <select value={config.movementType} onChange={e => setConfig({...config, movementType: e.target.value})} className="bg-[#fdf5e6] text-xs p-1 rounded border border-[#8d6e63]">
                                    <option value="walk">Walk</option> <option value="fly">Fly</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 flex flex-col gap-2">
                        <button onMouseDown={() => startHold('awaken')} onMouseUp={stopHold} onMouseLeave={stopHold} onTouchStart={() => startHold('awaken')} onTouchEnd={stopHold}
                            className="runic-btn w-full py-4 text-sm font-bold uppercase tracking-widest relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-75 ease-linear" style={{width: `${awakenProgress}%`}}></div>
                            <span className="relative z-10">{isAwakening ? "Awakening..." : "Hold to Awaken"}</span>
                        </button>
                        <div className="flex gap-2">
                            <button onClick={handleBindToGrimoire} className="flex-1 py-3 bg-[#5d4037] text-white text-xs uppercase font-bold rounded shadow hover:bg-[#3e2723]">Bind ({COST_BIND_SERVITOR})</button>
                            {savedServitors.length > 0 && (
                                <div className="flex-1 flex flex-col gap-1 max-h-24 overflow-y-auto">
                                    {savedServitors.map(s => (
                                        <div key={s.id} onClick={() => handleLoad(s)} className="flex justify-between bg-white/50 p-1 text-[10px] cursor-pointer border border-[#8d6e63]">
                                            <span className="truncate">{s.name}</span><Trash2 size={12} onClick={(e) => handleDelete(s.id, e)} className="text-red-500"/>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
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