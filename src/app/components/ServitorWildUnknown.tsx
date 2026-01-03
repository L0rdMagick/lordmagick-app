"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Lock } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { checkAndSpendCredits, getWalletStatus, COST_BIND_SERVITOR } from '@/lib/economy';
import { saveServitorToGrimoire, getMyServitors } from '@/lib/services/spellService';

// --- ASSET CONFIGURATION ---
const ASSET_PATH = '/images/Servitor_images/';

// Updated File Names Mapped to Constants
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
    UI_PANEL: 'Parchment_And_Oak_Responsive_Panels.png',
    BG_MAIN: 'Untitled design (4).png', // Assuming this is the main background composite
    BG_LAYER_1: '14.png',
    BG_LAYER_2: '15.png',
    UI_BUTTONS: 'Runic_Glass_Button_Set.png'
};

// Indices match the previous logic (0-15)
const BASES_LIST = [
    'Porcelain Doll', 'Smoke Wisp', 'Shadow Entity', 'Ethereal Wisp',
    'Oak Golem', 'Stone Statue', 'Iron Clockwork', 'Vine Spirit',
    'Galaxy Nebula', 'Molten Lava', 'Ice Crystal', 'Mercury Fluid',
    'Gothic Gargoyle', 'Tattered Scarecrow', 'Golden Automaton', 'Ink-Blot Shadow'
];

const LIMBS_LIST = [
    'Ghostly Energy', 'Obsidian Shard', 'Twisted Root', 'Brass Gear',
    'Skeletal Bone', 'Dragon Scale', 'Silk Wrapped', 'Crystal Shard',
    'Aetheric Glow', 'Flaming Ember', 'Shadow Tendril', 'Carved Stone',
    'Primal Talon', 'Tattooed Flesh', 'Blue Lightning', 'Mercury Drip'
];

const TOOLS_LIST = [
    'Wood Wand', 'Obsidian Athame', 'Glass Orb', 'Iron Key',
    'Burning Censer', 'Ancient Scroll', 'Crystal Staff', 'Silver Bell',
    'Tarot Deck', 'Hourglass', 'Astral Compass', 'Brass Telescope',
    'Ritual Bowl', 'Bone Wand', 'Soul Lantern', 'Potion Flask'
];

const VESSELS_LIST = [
    'Iron Cauldron', 'Golden Chalice', 'Stone Font', 'Alchemical Bowl',
    'Burning Brazier', 'Scrying Bowl', 'Incense Burner', 'Wicker Basket',
    'Hollowed Pumpkin', 'Sea-Shell Basin', 'Petrified Stump', 'Iron-Bound Chest',
    'Stone Altar', 'Miniature Furnace', 'Glass Prism', 'Open Sarcophagus'
];

interface SavedServitor {
    id: string;
    name: string;
    master_name: string;
    purpose: string;
    config: any;
}

// Helper for 4x4 Sprite Grid
const getSpriteStyle = (index: number, filename: string) => {
    // 0-15 Index
    const safeIndex = Math.max(0, Math.min(15, index));
    const col = safeIndex % 4;
    const row = Math.floor(safeIndex / 4);
    
    // 33.333% shifts background by exactly 1 frame width/height in a 4-frame strip
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
    
    // Supabase
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // --- Loading State ---
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);

    // Logic State
    const [isRunning, setIsRunning] = useState(false);
    const runningRef = useRef(false); 
    const loopIdRef = useRef(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const audioCtxRef = useRef<any>(null);
    const oscRef = useRef<any>(null);

    // Form State
    const [sName, setSName] = useState("");
    const [sPurpose, setSPurpose] = useState("");
    const [uName, setUName] = useState("");
    
    // User & Cabinet State
    const [user, setUser] = useState<any>(null);
    const [savedServitors, setSavedServitors] = useState<SavedServitor[]>([]);
    const [loadingCabinet, setLoadingCabinet] = useState(false);
    const [wallet, setWallet] = useState<{ credits: number, tier: string, isUnlimited: boolean } | null>(null);

    // Persistence & Economy State
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showExitWarning, setShowExitWarning] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);

    // Appearance & Audio State
    const [config, setConfig] = useState({
        baseIndex: 0,
        limbIndex: 0,
        toolIndex: 0,
        hatIndex: 0,
        wingIndex: 0,
        vesselIndex: 0,
        clothingIndex: 0,
        
        hasWings: false,
        movementType: "walk", 
        
        // Sound Config
        soundSearch: "rumble", 
        soundFind: "chime",    
        soundDeposit: "coin",

        // Feeding Config
        foodName: "Gratitude",
        feedFreq: 5
    });

    // Awakening & Feeding State
    const [awakenProgress, setAwakenProgress] = useState(0);
    const [isAwakening, setIsAwakening] = useState(false);
    const [awakenComplete, setAwakenComplete] = useState(false); 
    const [isFeeding, setIsFeeding] = useState(false);
    
    // Hunger System
    const [depositCount, setDepositCount] = useState(0);
    const depositRef = useRef(0); 
    const [hungerState, setHungerState] = useState<'sated' | 'hungry' | 'fed'>('sated');
    const [feedProgress, setFeedProgress] = useState(0);
    // Modified to include random food sprite index
    const [fallingFood, setFallingFood] = useState<{id: number, left: number, top: number, spriteIndex: number}[]>([]);
    const holdIntervalRef = useRef<any>(null);

    // --- Asset Loading ---
    useEffect(() => {
        const imageUrls = Object.values(ASSETS);

        let loadedCount = 0;
        imageUrls.forEach((url) => {
            const img = new Image();
            img.src = ASSET_PATH + url;
            img.onload = () => {
                loadedCount++;
                setLoadProgress(Math.floor((loadedCount / imageUrls.length) * 100));
                if (loadedCount === imageUrls.length) {
                    setTimeout(() => setAssetsLoaded(true), 500);
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load asset: ${url}`);
                loadedCount++;
                setLoadProgress(Math.floor((loadedCount / imageUrls.length) * 100));
                if (loadedCount === imageUrls.length) setAssetsLoaded(true);
            }
        });
    }, []);

    // --- Effects ---

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                refreshCabinet(user.id);
                const w = await getWalletStatus(user.id);
                setWallet(w);
            }
        };
        init();
    }, [supabase]);

    useEffect(() => {
        if (sName || sPurpose) {
            setHasUnsavedChanges(true);
        }
    }, [sName, sPurpose, config]);

    const refreshCabinet = async (userId: string) => {
        setLoadingCabinet(true);
        try {
            const data = await getMyServitors(userId);
            setSavedServitors(data as SavedServitor[]);
            const w = await getWalletStatus(userId);
            setWallet(w);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingCabinet(false);
        }
    };

    // --- Actions ---

    const handleBindToGrimoire = async () => {
        const win = (globalThis as any).window;
        if (!user) {
            if (win) win.alert("You must be logged in to bind servitors.");
            return;
        }
        if (!sName) {
            if (win) win.alert("You must name the spirit before binding it.");
            return;
        }

        const canAfford = await checkAndSpendCredits(user.id, COST_BIND_SERVITOR);
        if (!canAfford) {
            setShowCreditModal(true);
            return;
        }

        try {
            await saveServitorToGrimoire(user.id, {
                name: sName,
                master_name: uName,
                purpose: sPurpose,
                config: config
            });
            
            setHasUnsavedChanges(false);
            refreshCabinet(user.id);
            if(win) win.alert(`Servitor "${sName}" successfully bound to Grimoire.`);
            
        } catch (error) {
            console.error("Binding failed:", error);
            if(win) win.alert("The binding ritual failed. Please try again.");
        }
    };

    const handleLoad = (servitor: SavedServitor) => {
        setSName(servitor.name);
        setUName(servitor.master_name || "");
        setSPurpose(servitor.purpose || "");
        setConfig(servitor.config);
        setTimeout(() => setHasUnsavedChanges(false), 100);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const win = (globalThis as any).window;
        if (win && !win.confirm("Release this servitor back to the void?")) return;
        const { error } = await supabase.from('servitors').delete().eq('id', id);
        if (!error && user) refreshCabinet(user.id);
    };

    const handleSafeExit = () => {
        if (hasUnsavedChanges) setShowExitWarning(true);
        else router.push('/spell-room'); 
    };

    // --- Audio Logic ---
    const initAudio = () => {
        const win = (globalThis as any).window;
        if (!audioCtxRef.current) {
            const AudioContext = win.AudioContext || win.webkitAudioContext;
            if (AudioContext) audioCtxRef.current = new AudioContext();
        }
        if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    };

    const playSound = (category: 'search' | 'find' | 'deposit' | 'glitter') => {
        if(!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const now = ctx.currentTime;
        
        const playOsc = (type: string, freqStart: number, freqEnd: number, dur: number, vol: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = type as any;
            osc.frequency.setValueAtTime(freqStart, now);
            if(freqEnd !== freqStart) osc.frequency.linearRampToValueAtTime(freqEnd, now + dur);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            osc.start(now);
            osc.stop(now + dur);
        };

        if(category === 'glitter') {
            for(let i=0; i<8; i++) setTimeout(() => playOsc('sine', 800+(i*100), 1200, 0.2, 0.05), i*50);
            return;
        }

        const type = category === 'search' ? config.soundSearch : 
                     category === 'find' ? config.soundFind : 
                     config.soundDeposit;

        switch(type) {
            // -- SEARCHING SOUNDS --
            case 'rumble': playOsc('sine', 150, 140, 0.8, 0.2); break;
            case 'hum': playOsc('sine', 400, 450, 1.5, 0.15); playOsc('sine', 600, 550, 1.5, 0.05); break;
            case 'static': playOsc('triangle', 300, 500, 0.6, 0.1); setTimeout(() => playOsc('sine', 500, 300, 0.6, 0.1), 400); break;
            case 'pulse': playOsc('sine', 280, 280, 0.3, 0.3); setTimeout(() => playOsc('sine', 280, 280, 0.3, 0.3), 300); break;

            // -- FINDING SOUNDS --
            case 'chime': playOsc('sine', 800, 1200, 1, 0.1); setTimeout(() => playOsc('sine', 1200, 2000, 0.5, 0.05), 100); break;
            case 'wow': playOsc('triangle', 400, 800, 0.8, 0.1); break;
            case 'laser': playOsc('sine', 1200, 400, 0.4, 0.1); break;
            case 'chord': playOsc('sine', 440, 440, 1.5, 0.05); playOsc('sine', 554, 554, 1.5, 0.05); break;

            // -- DEPOSIT SOUNDS --
            case 'coin': playOsc('sine', 1800, 1800, 0.1, 0.1); setTimeout(() => playOsc('sine', 2000, 2000, 0.4, 0.05), 50); break;
            case 'angelic': 
                const oscA = ctx.createOscillator();
                const gA = ctx.createGain();
                oscA.connect(gA); gA.connect(ctx.destination);
                oscA.type = 'triangle';
                oscA.frequency.value = 350;
                gA.gain.setValueAtTime(0, now); gA.gain.linearRampToValueAtTime(0.1, now + 0.5); gA.gain.linearRampToValueAtTime(0, now + 2);
                oscA.start(now); oscA.stop(now + 2);
                break;
            case 'vortex': playOsc('sine', 600, 150, 1.5, 0.4); break;
            case 'teleport': playOsc('sine', 200, 800, 1, 0.1); setTimeout(() => playOsc('sine', 800, 200, 0.5, 0.05), 800); break;
            default: break;
        }
    };

    // --- Animation Logic ---
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

    const moveTo = (targetPercent: number, id: number) => {
        return new Promise<void>(resolve => {
            const doc = (globalThis as any).document;
            const win = (globalThis as any).window;
            if (!doc || !win) { resolve(); return; }

            const el = doc.getElementById('servitor-container');
            if(!el) { resolve(); return; }
            
            const current = parseFloat(el.style.left) || 20;
            const dist = Math.abs(targetPercent - current);
            const time = dist * 40; 

            el.style.transition = `left ${time}ms linear`;
            
            win.requestAnimationFrame(() => {
                el.style.left = targetPercent + "%";
            });

            setTimeout(() => {
                if(runningRef.current && loopIdRef.current === id) resolve();
            }, time);
        });
    }

    const setAnimationState = (state: string) => {
        const doc = (globalThis as any).document;
        const rig = doc.getElementById('game-rig');
        if(rig) rig.className = `servitor-rig ${state}`;
    }

    const mainLoop = async (id: number) => {
        const doc = (globalThis as any).document;
        const getEls = () => ({
            vessel: doc.getElementById('game-vessel'),
            shine: doc.getElementById('vessel-shine')
        });

        await wait(100);
        let els = getEls();

        while(runningRef.current && loopIdRef.current === id) {
            // Move Left
            setAnimationState(config.movementType === 'fly' ? 'anim-fly-left' : 'anim-walk-left');
            await moveTo(15, id);
            
            if(!runningRef.current || loopIdRef.current !== id) break;

            // Search/Dig
            setAnimationState('anim-dig');
            playSound('search');
            await wait(2000);
            
            // Find
            playSound('find');
            setAnimationState('anim-found');
            await wait(1000);

            // Move Right
            setAnimationState(config.movementType === 'fly' ? 'anim-fly-right' : 'anim-walk-right');
            await moveTo(80, id);
            
            if(!runningRef.current || loopIdRef.current !== id) break;

            // Deposit
            setAnimationState('anim-idle');
            playSound('deposit');
            if(els.shine) {
                els.shine.style.opacity = '1';
                setTimeout(() => { if(els.shine) els.shine.style.opacity = '0'; }, 1000);
            }
            
            depositRef.current += 1;
            setDepositCount(depositRef.current);
            
            if (depositRef.current >= config.feedFreq) {
                setHungerState('hungry');
                break;
            }
            await wait(1000);
        }
    };

    // --- Hold Button Handlers ---
    const startHold = (type: 'awaken' | 'feed') => {
        initAudio();
        const startTime = Date.now();
        const duration = type === 'awaken' ? 5000 : 8000;
        const setProgress = type === 'awaken' ? setAwakenProgress : setFeedProgress;
        
        if (type === 'awaken') setIsAwakening(true);
        if (type === 'feed') setIsFeeding(true);

        holdIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            let p = (elapsed / duration) * 100;
            if(p >= 100) {
                p = 100;
                clearInterval(holdIntervalRef.current);
                holdIntervalRef.current = null;
                playSound('glitter');
                if(type === 'awaken') completeAwakening();
                if(type === 'feed') completeFeeding();
            }
            setProgress(p);
            
            if(type === 'feed' && Math.random() > 0.8) {
                 setFallingFood(prev => [...prev, {
                     id: Math.random(), 
                     left: 20 + Math.random() * 60, 
                     top: 0,
                     spriteIndex: Math.floor(Math.random() * 16) // Random food sprite
                 }]);
            }
        }, 30);
    };

    const stopHold = (type: 'awaken' | 'feed') => {
        if(holdIntervalRef.current) {
            clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = null;
        }
        if(type === 'awaken') {
            setIsAwakening(false);
            setAwakenProgress(0);
        }
        if(type === 'feed') {
            setIsFeeding(false);
            setFeedProgress(0);
            setFallingFood([]); 
        }
    };

    const completeAwakening = async () => {
        setAwakenComplete(true);
        await wait(1500);
        setIsRunning(true);
        runningRef.current = true;
        depositRef.current = 0;
        setDepositCount(0);
        setHungerState('sated');
        loopIdRef.current++;
        mainLoop(loopIdRef.current);
        setAwakenComplete(false);
        setIsAwakening(false);
        setAwakenProgress(0);
        setHasUnsavedChanges(true);
    };

    const completeFeeding = () => {
        setHungerState('fed');
        setFeedProgress(100);
    };

    const handleResume = () => {
        setHungerState('sated');
        depositRef.current = 0;
        setDepositCount(0);
        setFeedProgress(0);
        setIsFeeding(false);
        setFallingFood([]);
        runningRef.current = true;
        loopIdRef.current++;
        mainLoop(loopIdRef.current);
    };

    useEffect(() => {
        return () => { 
            runningRef.current = false; 
            if(holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        };
    }, []);

    // --- Rig Component (Local) ---
    const ServitorRig = ({ idPrefix, isPreview = false }: { idPrefix: string, isPreview?: boolean }) => {
        const wrapperClass = isFeeding ? 'anim-feed' : 'anim-idle';
        
        return (
            <div 
                id={idPrefix} 
                className={`servitor-rig relative w-[128px] h-[128px] ${wrapperClass}`}
                style={{ transform: isPreview ? 'scale(1.5)' : 'scale(1)' }}
            >
                {/* 1. Back Elements (Wings/Aura) */}
                {config.hasWings && (
                     <div className="absolute inset-0 z-0" style={getSpriteStyle(config.wingIndex, ASSETS.BACK)} />
                )}
                
                {/* 2. Legs (Jointed at top center) */}
                <div 
                    className="limb leg-left absolute z-10 w-full h-full origin-top-center"
                    style={{ ...getSpriteStyle(config.limbIndex, ASSETS.LEGS), transform: 'scaleX(-1)' }} 
                />
                <div 
                    className="limb leg-right absolute z-10 w-full h-full origin-top-center"
                    style={getSpriteStyle(config.limbIndex, ASSETS.LEGS)} 
                />

                {/* 3. Base / Torso */}
                <div 
                    className="base absolute inset-0 z-20"
                    style={getSpriteStyle(config.baseIndex, ASSETS.BASES)} 
                />

                {/* 4. Clothes */}
                <div 
                    className="clothes absolute inset-0 z-30"
                    style={getSpriteStyle(config.clothingIndex, ASSETS.CLOTHES)} 
                />

                {/* 5. Arms */}
                <div 
                    className="limb arm-left absolute z-40 w-full h-full origin-top-center"
                    style={{ ...getSpriteStyle(config.limbIndex, ASSETS.ARMS), transform: 'scaleX(-1)' }} 
                />
                <div 
                    className="limb arm-right absolute z-40 w-full h-full origin-top-center"
                    style={getSpriteStyle(config.limbIndex, ASSETS.ARMS)} 
                />

                {/* 6. Hat */}
                <div 
                    className="hat absolute inset-0 z-50"
                    style={getSpriteStyle(config.hatIndex, ASSETS.HEAD)} 
                />

                {/* 7. Tool (Attached to Right Arm logically, but rendered on top for visibility) */}
                <div 
                    className="tool absolute inset-0 z-60"
                    style={getSpriteStyle(config.toolIndex, ASSETS.TOOLS)} 
                />
            </div>
        );
    };


    // --- RENDERING ---

    if (!assetsLoaded) {
        return (
            <div className="fixed inset-0 bg-[#08080c] z-[999] flex flex-col items-center justify-center">
                <div 
                    style={{
                        ...getSpriteStyle(0, ASSETS.TREASURES),
                        width: '128px', height: '128px',
                        animation: 'spin 4s infinite linear',
                        filter: 'drop-shadow(0 0 15px #FFD700)'
                    }} 
                />
                <h2 className="magick-font text-[#FFD700] mt-8 tracking-[0.2em] animate-pulse">
                    SUMMONING ASSETS... {loadProgress}%
                </h2>
                <div className="w-64 h-1 bg-gray-900 mt-4 rounded-full overflow-hidden border border-[#FFD700]/20">
                    <div className="h-full bg-[#FFD700] transition-all duration-300" style={{ width: `${loadProgress}%` }} />
                </div>
                <style jsx>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    const isFeedingActive = hungerState === 'hungry' || isFeeding || hungerState === 'fed';

    return (
        <div className="fixed inset-0 w-full h-full bg-[#0f0f1a] text-[#dcdcdc] overflow-hidden select-none font-sans flex flex-col">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
                .magick-font { font-family: 'Cinzel', serif; }
                
                /* ANIMATIONS */
                @keyframes limb-walk {
                    0% { transform: rotate(-15deg); } 50% { transform: rotate(15deg); } 100% { transform: rotate(-15deg); }
                }
                @keyframes limb-walk-rev {
                    0% { transform: rotate(15deg); } 50% { transform: rotate(-15deg); } 100% { transform: rotate(15deg); }
                }
                @keyframes rig-bounce {
                    0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); }
                }
                @keyframes rig-float {
                    0%, 100% { transform: translateY(-10px); } 50% { transform: translateY(-20px); }
                }
                
                /* Walk Left Logic */
                .anim-walk-left .leg-left { animation: limb-walk 1s infinite ease-in-out; }
                .anim-walk-left .leg-right { animation: limb-walk-rev 1s infinite ease-in-out; }
                .anim-walk-left .arm-left { animation: limb-walk-rev 1s infinite ease-in-out; }
                .anim-walk-left .arm-right { animation: limb-walk 1s infinite ease-in-out; }
                .anim-walk-left { animation: rig-bounce 0.5s infinite ease-in-out; }

                /* Walk Right Logic */
                .anim-walk-right .leg-left { animation: limb-walk 1s infinite ease-in-out; }
                .anim-walk-right .leg-right { animation: limb-walk-rev 1s infinite ease-in-out; }
                .anim-walk-right .arm-left { animation: limb-walk-rev 1s infinite ease-in-out; }
                .anim-walk-right .arm-right { animation: limb-walk 1s infinite ease-in-out; }
                .anim-walk-right { animation: rig-bounce 0.5s infinite ease-in-out; transform: scaleX(-1); }
                
                /* Fly Logic (Legs dangle, rig floats) */
                .anim-fly-left { animation: rig-float 2s infinite ease-in-out; }
                .anim-fly-left .leg-left, .anim-fly-left .leg-right { transform: rotate(15deg) !important; transition: transform 0.5s; }

                .anim-fly-right { animation: rig-float 2s infinite ease-in-out; transform: scaleX(-1); }
                .anim-fly-right .leg-left, .anim-fly-right .leg-right { transform: rotate(15deg) !important; transition: transform 0.5s; }

                /* Feeding Logic */
                .anim-feed .arm-left { transform: rotate(140deg) !important; transition: transform 0.5s; }
                .anim-feed .arm-right { transform: rotate(-140deg) !important; transition: transform 0.5s; }
                
                /* Scrollbar for Panel */
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #5d4037; border-radius: 2px; }
            `}</style>

            {/* Exit Button */}
            <button onClick={handleSafeExit} className="absolute top-6 right-6 z-50 text-gray-500 hover:text-white transition-colors">
                <X size={24} />
            </button>

            {/* PARALLAX WORLD */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                {/* Layer 1: Background (Stars/Sky) */}
                 <div className="absolute inset-0 bg-cover bg-center" 
                     style={{ backgroundImage: `url('${ASSET_PATH}${ASSETS.BG_LAYER_1}')` }}>
                </div>
                {/* Layer 2: Midground */}
                <div className="absolute inset-0 bg-cover bg-center" 
                     style={{ backgroundImage: `url('${ASSET_PATH}${ASSETS.BG_LAYER_2}')` }}>
                </div>
                {/* Layer 3: Main/Foreground (Composite) */}
                <div className="absolute inset-0 bg-cover bg-center" 
                     style={{ backgroundImage: `url('${ASSET_PATH}${ASSETS.BG_MAIN}')`, transform: 'scale(1.1)' }}>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10" />
            </div>

            {/* GAME STAGE */}
            <div className="relative w-full h-full z-10">
                
                {/* Servitor Container (Moves Left/Right) */}
                <div id="servitor-container" className="absolute bottom-[20vh] left-[20%] w-[128px] h-[128px] z-20 transition-all duration-100">
                    <ServitorRig idPrefix="game-rig" />
                </div>

                {/* Vessel (Chest) */}
                <div className="absolute bottom-[20vh] right-[10%] w-[128px] h-[128px] z-20 flex flex-col items-center">
                    <div id="game-vessel" className="w-full h-full" style={getSpriteStyle(config.vesselIndex, ASSETS.VESSELS)} />
                    <div id="vessel-shine" className="absolute top-0 text-4xl opacity-0 transition-opacity duration-500">✨</div>
                    <div className="mt-2 font-serif text-[#FFD700] text-xs text-center drop-shadow-md">
                        {uName || "Master"}'s Altar
                    </div>
                </div>

                {/* Status HUD (When Running) */}
                {isRunning && !isFeedingActive && (
                    <div className="absolute bottom-6 w-full flex justify-center pointer-events-none">
                        <div className="bg-black/60 border border-[#FFD700]/50 px-6 py-2 rounded-full backdrop-blur-sm text-center">
                            <p className="text-[#FFD700] text-xs tracking-widest uppercase mb-1">{sPurpose || 'Result'} Count</p>
                            <p className="text-2xl text-white font-bold">{depositCount}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* CONFIGURATION PANEL (Parchment UI) */}
            <div 
                className={`absolute top-0 left-0 h-full w-full md:w-[500px] z-50 transition-transform duration-500 ease-in-out ${isRunning ? '-translate-x-full' : 'translate-x-0'}`}
                style={{
                    borderImage: `url('${ASSET_PATH}${ASSETS.UI_PANEL}') 18% 15% fill stretch`,
                    borderWidth: '50px', 
                    padding: '20px' 
                }}
            >
                <div className="w-full h-full overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-6 text-[#2a1a1a]">
                    
                    {/* Header */}
                    <div className="text-center border-b border-[#5d4037]/30 pb-4">
                        <h2 className="text-[#3e2723] uppercase tracking-widest text-2xl magick-font font-bold">Grimoire of the Wild</h2>
                        <p className="text-[#5d4037] text-sm font-serif italic">Forge your servant from the elements</p>
                    </div>

                    {/* Preview Area */}
                    <div className="flex justify-center py-6 bg-black/10 rounded-lg shadow-inner border border-[#5d4037]/20">
                         <ServitorRig idPrefix="preview-rig" isPreview={true} />
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#3e2723] uppercase mb-1">Spirit Name</label>
                            <input type="text" value={sName} onChange={e => setSName(e.target.value)} className="w-full bg-[#fdf5e6] border border-[#8d6e63] p-2 rounded text-[#2a1a1a] placeholder-[#8d6e63]/50 focus:outline-none focus:border-[#3e2723]" placeholder="Name your entity..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#3e2723] uppercase mb-1">Purpose</label>
                            <input type="text" value={sPurpose} onChange={e => setSPurpose(e.target.value)} className="w-full bg-[#fdf5e6] border border-[#8d6e63] p-2 rounded text-[#2a1a1a] placeholder-[#8d6e63]/50 focus:outline-none focus:border-[#3e2723]" placeholder="What does it seek?" />
                        </div>
                    </div>

                    {/* MOVEMENT & AUDIO */}
                    <div className="bg-[#5d4037]/10 p-3 rounded border border-[#5d4037]/20 space-y-3">
                        <label className="block text-xs font-bold text-[#3e2723] uppercase mb-1 border-b border-[#5d4037]/20 pb-1">Ritual Harmonics</label>
                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <label className="text-[10px] text-[#5d4037] uppercase block mb-1">Locomotion</label>
                                <select value={config.movementType} onChange={e => setConfig({...config, movementType: e.target.value})} className="w-full text-xs p-1 bg-[#fdf5e6] border border-[#8d6e63] rounded text-[#2a1a1a]">
                                    <option value="walk">Walking</option>
                                    <option value="fly">Floating</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-[#5d4037] uppercase block mb-1">Search Tone</label>
                                <select value={config.soundSearch} onChange={e => setConfig({...config, soundSearch: e.target.value})} className="w-full text-xs p-1 bg-[#fdf5e6] border border-[#8d6e63] rounded text-[#2a1a1a]">
                                    <option value="rumble">Steady Pulse</option>
                                    <option value="hum">Ethereal Hum</option>
                                    <option value="static">Ethereal Wah</option>
                                    <option value="pulse">Deep Pulse</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-[#5d4037] uppercase block mb-1">Find Tone</label>
                                <select value={config.soundFind} onChange={e => setConfig({...config, soundFind: e.target.value})} className="w-full text-xs p-1 bg-[#fdf5e6] border border-[#8d6e63] rounded text-[#2a1a1a]">
                                    <option value="chime">Chime</option>
                                    <option value="wow">Wah-Wah</option>
                                    <option value="laser">Zap</option>
                                    <option value="chord">Harmony</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-[#5d4037] uppercase block mb-1">Deposit Tone</label>
                                <select value={config.soundDeposit} onChange={e => setConfig({...config, soundDeposit: e.target.value})} className="w-full text-xs p-1 bg-[#fdf5e6] border border-[#8d6e63] rounded text-[#2a1a1a]">
                                    <option value="coin">Coin Drop</option>
                                    <option value="angelic">Angelic</option>
                                    <option value="vortex">Vortex</option>
                                    <option value="teleport">Teleport</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Visual Configuration Grids */}
                    <div className="space-y-6">
                        {/* Bases */}
                        <div>
                            <label className="block text-xs font-bold text-[#3e2723] uppercase mb-2">Manifestation Base</label>
                            <div className="grid grid-cols-4 gap-2">
                                {BASES_LIST.map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setConfig({...config, baseIndex: i})}
                                        className={`w-full aspect-square border-2 rounded overflow-hidden ${config.baseIndex === i ? 'border-[#3e2723] shadow-md' : 'border-transparent hover:border-[#8d6e63]'}`}
                                    >
                                        <div className="w-full h-full transform scale-150" style={getSpriteStyle(i, ASSETS.BASES)} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Wings Checkbox */}
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                checked={config.hasWings} 
                                onChange={e => setConfig({...config, hasWings: e.target.checked})} 
                                className="accent-[#3e2723] w-4 h-4"
                            />
                            <label className="text-xs font-bold text-[#3e2723] uppercase">Manifest Wings / Aura</label>
                        </div>
                        
                        {config.hasWings && (
                            <div className="grid grid-cols-4 gap-2">
                                {Array.from({length: 16}).map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setConfig({...config, wingIndex: i})}
                                        className={`w-full aspect-square border-2 rounded overflow-hidden bg-gray-300/20 ${config.wingIndex === i ? 'border-[#3e2723] shadow-md' : 'border-transparent hover:border-[#8d6e63]'}`}
                                    >
                                        <div className="w-full h-full transform scale-125" style={getSpriteStyle(i, ASSETS.BACK)} />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Limbs */}
                        <div>
                            <label className="block text-xs font-bold text-[#3e2723] uppercase mb-2">Limb Material</label>
                            <div className="grid grid-cols-4 gap-2">
                                {LIMBS_LIST.map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setConfig({...config, limbIndex: i})}
                                        className={`w-full aspect-square border-2 rounded overflow-hidden ${config.limbIndex === i ? 'border-[#3e2723] shadow-md' : 'border-transparent hover:border-[#8d6e63]'}`}
                                    >
                                        <div className="w-full h-full transform scale-125" style={getSpriteStyle(i, ASSETS.ARMS)} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Clothes */}
                        <div>
                            <label className="block text-xs font-bold text-[#3e2723] uppercase mb-2">Vestments</label>
                            <div className="grid grid-cols-4 gap-2">
                                {Array.from({length: 16}).map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setConfig({...config, clothingIndex: i})}
                                        className={`w-full aspect-square border-2 rounded overflow-hidden bg-gray-300/20 ${config.clothingIndex === i ? 'border-[#3e2723] shadow-md' : 'border-transparent hover:border-[#8d6e63]'}`}
                                    >
                                        <div className="w-full h-full transform scale-150" style={getSpriteStyle(i, ASSETS.CLOTHES)} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                         {/* Headgear */}
                         <div>
                            <label className="block text-xs font-bold text-[#3e2723] uppercase mb-2">Headgear</label>
                            <div className="grid grid-cols-4 gap-2">
                                {Array.from({length: 16}).map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setConfig({...config, hatIndex: i})}
                                        className={`w-full aspect-square border-2 rounded overflow-hidden ${config.hatIndex === i ? 'border-[#3e2723] shadow-md' : 'border-transparent hover:border-[#8d6e63]'}`}
                                    >
                                        <div className="w-full h-full transform scale-150" style={getSpriteStyle(i, ASSETS.HEAD)} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tools */}
                        <div>
                            <label className="block text-xs font-bold text-[#3e2723] uppercase mb-2">Tool of Power</label>
                            <div className="grid grid-cols-4 gap-2">
                                {TOOLS_LIST.map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setConfig({...config, toolIndex: i})}
                                        className={`w-full aspect-square border-2 rounded overflow-hidden ${config.toolIndex === i ? 'border-[#3e2723] shadow-md' : 'border-transparent hover:border-[#8d6e63]'}`}
                                    >
                                        <div className="w-full h-full transform scale-75" style={getSpriteStyle(i, ASSETS.TOOLS)} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Vessels */}
                        <div>
                            <label className="block text-xs font-bold text-[#3e2723] uppercase mb-2">Ritual Vessel</label>
                            <div className="grid grid-cols-4 gap-2">
                                {VESSELS_LIST.map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setConfig({...config, vesselIndex: i})}
                                        className={`w-full aspect-square border-2 rounded overflow-hidden ${config.vesselIndex === i ? 'border-[#3e2723] shadow-md' : 'border-transparent hover:border-[#8d6e63]'}`}
                                    >
                                        <div className="w-full h-full transform scale-125" style={getSpriteStyle(i, ASSETS.VESSELS)} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="sticky bottom-0 bg-[#eaddcf] py-4 border-t border-[#5d4037]/20 flex flex-col gap-2">
                        <button 
                            onMouseDown={() => startHold('awaken')}
                            onMouseUp={() => stopHold('awaken')}
                            onMouseLeave={() => stopHold('awaken')}
                            onTouchStart={() => startHold('awaken')}
                            onTouchEnd={() => stopHold('awaken')}
                            className="w-full py-4 bg-[#3e2723] text-[#FFD700] uppercase tracking-widest font-bold border-2 border-[#5d4037] hover:bg-[#2a1a1a] transition-colors relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 h-full bg-[#FFD700]/30 transition-all duration-75 ease-linear" style={{width: `${awakenProgress}%`}}></div>
                            <span className="relative z-10">{isAwakening ? "Awakening..." : "Hold to Awaken"}</span>
                        </button>
                        
                        <div className="flex gap-2">
                            <button onClick={handleBindToGrimoire} className="flex-1 py-2 bg-[#5d4037] text-white text-xs uppercase tracking-wide hover:bg-[#4e342e]">
                                Bind ({COST_BIND_SERVITOR} Credits)
                            </button>
                            <div className="bg-[#fdf5e6] px-3 py-2 border border-[#8d6e63] flex items-center">
                                <span className="text-xs text-[#3e2723] font-bold">{wallet?.isUnlimited ? '∞' : wallet?.credits || 0} Credits</span>
                            </div>
                        </div>
                    </div>

                    {/* Saved Cabinet */}
                    {savedServitors.length > 0 && (
                        <div className="mt-4 border-t border-[#5d4037]/20 pt-4">
                            <h3 className="text-xs font-bold text-[#3e2723] uppercase mb-2">Bound Servitors</h3>
                            <div className="space-y-2">
                                {savedServitors.map(s => (
                                    <div key={s.id} onClick={() => handleLoad(s)} className="flex justify-between items-center bg-[#fdf5e6] p-2 border border-[#8d6e63] cursor-pointer hover:bg-white">
                                        <span className="text-sm font-bold text-[#3e2723]">{s.name}</span>
                                        <Trash2 size={14} className="text-[#8d6e63] hover:text-red-600" onClick={(e) => handleDelete(s.id, e)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* FEEDING OVERLAY */}
            {isFeedingActive && (
                <div className="absolute inset-0 z-[200] bg-black/60 flex flex-col items-center justify-center pointer-events-auto">
                    {hungerState === 'fed' ? (
                        <div className="bg-[#2a1a1a] p-8 border-2 border-[#FFD700] text-center max-w-sm mx-4 shadow-[0_0_30px_#FFD700]">
                            <h2 className="text-2xl text-[#FFD700] magick-font mb-2">Offering Accepted</h2>
                            <p className="text-gray-300 mb-6 font-serif">The spirit is revitalized.</p>
                            <button onClick={handleResume} className="bg-[#FFD700] text-black px-6 py-2 rounded font-bold hover:bg-white uppercase tracking-wider">Resume</button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center animate-in fade-in duration-500">
                             <div className="text-[#FFD700] magick-font text-xl mb-8 text-center drop-shadow-md bg-black/50 px-4 py-2 rounded-full">
                                {sName} hungers...
                            </div>
                            <button
                                onMouseDown={() => startHold('feed')}
                                onMouseUp={() => stopHold('feed')}
                                onMouseLeave={() => stopHold('feed')}
                                onTouchStart={() => startHold('feed')}
                                onTouchEnd={() => stopHold('feed')}
                                className="w-32 h-32 rounded-full border-4 border-[#FFD700] bg-gradient-to-b from-[#3e2723] to-black shadow-[0_0_30px_rgba(255,215,0,0.4)] flex items-center justify-center active:scale-95 transition-transform overflow-hidden relative"
                            >
                                <div className="absolute bottom-0 left-0 w-full bg-[#FFD700]/40 transition-all duration-75 ease-linear" style={{height: `${feedProgress}%`}}></div>
                                <span className="text-4xl z-10">✨</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {/* Falling Food Particles using Sprite Sheet */}
            {fallingFood.map(f => (
                <div 
                    key={f.id} 
                    className="absolute z-[201] animate-bounce w-16 h-16" 
                    style={{
                        left: f.left + '%', 
                        top: '10%',
                        ...getSpriteStyle(f.spriteIndex, ASSETS.FOOD)
                    }} 
                />
            ))}

            {/* EDIT BUTTON (When Running) */}
            {isRunning && !isFeedingActive && (
                <button 
                    onClick={() => { setIsRunning(false); runningRef.current = false; }}
                    className="absolute bottom-6 left-6 z-50 bg-black/50 border border-[#FFD700] text-[#FFD700] px-4 py-2 uppercase tracking-widest hover:bg-[#FFD700]/20 transition-colors"
                >
                    Modify Ritual
                </button>
            )}

            {/* Credit Modal */}
            {showCreditModal && (
                 <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
                    <div className="bg-[#1a1528] border border-amber-600/50 p-8 rounded-lg max-w-sm w-full text-center">
                        <Lock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <h3 className="text-xl font-magical text-amber-100 mb-2">Insufficient Aether</h3>
                        <p className="text-gray-400 text-sm mb-6">You need {COST_BIND_SERVITOR} credits.</p>
                        <button onClick={() => setShowCreditModal(false)} className="w-full bg-amber-900/40 border border-amber-600 text-amber-50 py-3 uppercase">Return</button>
                    </div>
                </div>
            )}
        </div>
    );
}