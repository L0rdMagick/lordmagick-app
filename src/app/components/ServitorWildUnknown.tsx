"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Lock, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Minus, RefreshCw, Move, Eye, EyeOff, Settings, User, ArrowLeftRight, Info, Globe, Save, Coins, FolderOpen, ChevronRight } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

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
    CARRY_TREASURE: 'treasures.png',
    FOOD: 'Servitor_Sustenance_Food_Sheet.png',
    MOUND: 'mound_into_the_void.png',
    UI_PANEL: 'Parchment_And_Oak_Responsive_Panels.png',
    UI_BUTTONS: 'Runic_Glass_Button_Set.png'
};

// --- AUDIO CONFIGURATION ---
const AUDIO_PATHS = {
    SPIRIT_LOOP: '/audio/spirit.mp3',               
    BIND_ACTIVATE: '/audio/sfx-chaos-activate.mp3', 
    DEPOSIT: '/audio/old-sfx-library-portal.mp3',   
    FEED_COMPLETE: '/audio/sfx-chaos-hold.mp3',     
    MOUND_JUMP_IN: '/audio/sfx-searching-2.mp3',    
    MOUND_JUMP_OUT: '/audio/sfx-finding-something-1.mp3',
    THUNDER_LOOP: '/audio/searching-a-bag-415807.mp3'
};

const BACKGROUND_OPTIONS = [
    'Crystal_Cave.jpg',
    'Magick_Forest.jpg',
    'Treasure_Cave.jpg',
    'Enchanted_Island.jpg',
    'Love_Planet.jpg',
    'Sparkle_Land.jpg'
];

// --- 2. CONFIGURATION SECTION ---

const GENERIC_LIST = Array.from({length: 16}).map((_, i) => `Option ${i + 1}`);

const DIRECTIONAL_OFFSETS = {
    facingRight: {
        globalUI:   { x: 0, y: 14, s: 1.3, f: false },
        globalGame: { x: -20, y: -40, s: 1.2, f: false },
        wing:    { x: 0, y: 3, s: 1.0, f: false },
        base:    { x: 0, y: 0, s: 1.0, f: false },
        head:    { x: 0, y: -49, s: 0.6, f: false },
        clothes: { x: -1, y: 10, s: 0.55, f: false },
        sigil:   { x: 3, y: 2, s: 0.2, f: false },
        tool:    { x: 28, y: 17, s: 0.5, f: false },
        carryTreasure: { x: 53, y: 20, s: 0.5, f: false }, 
        armRight: { x: 2, y: 15, s: 0.6, f: false },
        armLeft:  { x: 25, y: 19, s: 0.6, f: false }, 
        legRight: { x: -5, y: 65, s: 0.9, f: true },
        legLeft:  { x: 5, y: 60, s: 0.9, f: true },
        vessel:  { x: 0, y: 0, s: 1.8, f: false },
        mound:   { x: 0, y: 3, s: 2.8, f: false },
    },
    facingLeft: {
        globalUI:   { x: 0, y: 0, s: 0 }, 
        globalGame: { x: 0, y: 0, s: 0 },
        base: { x: 0, y: 0, s: 0 },
        head: { x: 0, y: 0, s: 0 },
        clothes: { x: 1, y: 0, s: 0 },
        wing: { x: 0, y: 0, s: 0 },
        tool: { x: -75, y: 2, s: 0 },
        carryTreasure: { x: -75, y: 2, s: 0 },
        sigil: { x: -8, y: 0, s: 0 },
        armRight: { x: -23, y: 3, s: 0 },
        armLeft:  { x: -26, y: -6, s: 0 },
        legRight: { x: -5, y: 2, s: 0 },
        legLeft:  { x: -1, y: 10, s: 0 },
        vessel: { x: 0, y: 0, s: 0 },
        mound: { x: 0, y: 0, s: 0 }
    }
};

const UI_PREVIEW_SETTINGS = { scale: 0.65, y: -25 };

const LAYER_ORDER_CONFIG = {
    facingRight: {
        wing: 0, armLeft: 10, legLeft: 20, base: 30, clothes: 40, sigil: 50,
        armRight: 70, legRight: 60, tool: 65, carryTreasure: 15, head: 90
    },
    facingLeft: {
        wing: 0, legRight: 20, armRight: 10, base: 30, clothes: 40, legLeft: 50,
        sigil: 60, tool: 15, carryTreasure: 75, armLeft: 80, head: 90
    }
};

const DEFAULT_OFFSETS = {
    global:  { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 }, 
    wing:    { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    leg:     { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    tool:    { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    carryTreasure: { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    arm:     { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    base:    { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    head:    { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    clothes: { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    sigil:   { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    vessel:  { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
    mound:   { x: 0, y: 0, s: 0.0, f: false, v: true, spread: 0 },
};

// --- EXTRACTED SERVITOR RIG COMPONENT ---
const ServitorRig = React.memo(({ 
    idPrefix, 
    config, 
    rigAnimation, 
    isFeeding = false,
    isPreview = false, 
    showCarriedTreasure = false,
    isHappy = false 
}: { 
    idPrefix: string, 
    config: any, 
    rigAnimation: string, 
    isFeeding?: boolean,
    isPreview?: boolean, 
    showCarriedTreasure?: boolean,
    isHappy?: boolean 
}) => {
    let animationClass = rigAnimation;
    if (isFeeding) animationClass = 'anim-feed';
    
    let wrapperClass = config.movementType === 'fly' || rigAnimation.includes('fly') ? 'anim-floating' : '';
    if (isHappy) wrapperClass = 'anim-happy-jump'; 

    const isFacingLeft = rigAnimation.includes('left');

    const getZ = (key: keyof typeof LAYER_ORDER_CONFIG.facingRight) => {
        const map = isFacingLeft ? LAYER_ORDER_CONFIG.facingLeft : LAYER_ORDER_CONFIG.facingRight;
        return map[key];
    };

    const renderPart = (idx: number, asset: string, partKey: string, z: number, partType: 'limb' | 'static', specificLimb?: 'armLeft' | 'armRight' | 'legLeft' | 'legRight') => {
        if (partKey === 'carryTreasure' && !isPreview && !showCarriedTreasure) return null;

        const userCfg = config.offsets[partKey];
        if (!userCfg?.v) return null;

        const baseMap = DIRECTIONAL_OFFSETS.facingRight;
        const baseCfg = specificLimb ? (baseMap as any)[specificLimb] : (baseMap as any)[partKey] || { x:0, y:0, s:1, f:false };

        const dirMap = isFacingLeft ? DIRECTIONAL_OFFSETS.facingLeft : null;
        const dirCfg = dirMap ? (specificLimb ? (dirMap as any)[specificLimb] : (dirMap as any)[partKey]) : { x:0, y:0, s:0 };

        let flip = baseCfg.f !== userCfg.f; 
        if (isFacingLeft) flip = !flip;

        let spreadMod = 0;
        if (partType === 'limb' && userCfg.spread) {
            if (specificLimb?.includes('Left')) spreadMod = -userCfg.spread;
            if (specificLimb?.includes('Right')) spreadMod = userCfg.spread;
        }

        const totalX = baseCfg.x + (dirCfg?.x || 0) + userCfg.x + spreadMod;
        const totalY = baseCfg.y + (dirCfg?.y || 0) + userCfg.y;
        const totalS = baseCfg.s + (dirCfg?.s || 0) + userCfg.s; 

        const spriteTransform = `translate(${totalX}%, ${totalY}%) scale(${totalS}) ${flip ? 'scaleX(-1)' : ''}`;
        
        let originX = '50%';
        let originY = '20%';

        if (specificLimb?.includes('arm') || partKey === 'tool' || partKey === 'carryTreasure') {
            const baseArmX = 15; 
            originX = isFacingLeft ? `${100 - baseArmX}%` : `${baseArmX}%`;
            originY = '15%'; 
        } else if (specificLimb?.includes('leg')) {
            const baseLegX = 85;
            originX = isFacingLeft ? `${baseLegX}%` : `${100 - baseLegX}%`;
            originY = '10%'; 
        }

        let jointClass = '';
        if (partType === 'limb' && specificLimb) {
            if (specificLimb === 'armLeft') jointClass = 'arm-left-joint';
            if (specificLimb === 'armRight') jointClass = 'arm-right-joint';
            if (specificLimb === 'legLeft') jointClass = 'leg-left-joint';
            if (specificLimb === 'legRight') jointClass = 'leg-right-joint';
        }
        
        if (partKey === 'tool') jointClass = 'tool-hand-anim';
        else if (partKey === 'carryTreasure') jointClass = 'carry-hand-anim';

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
    const baseMap = DIRECTIONAL_OFFSETS.facingRight;
    const gBase = isPreview ? baseMap.globalUI : baseMap.globalGame;
    
    const finalGx = gBase.x + gUser.x;
    const finalGy = gBase.y + gUser.y;
    const finalGs = gBase.s + gUser.s;
    const finalGf = gBase.f !== gUser.f; 

    const globalTransform = `translate(${finalGx}%, ${finalGy}%) scale(${finalGs}) ${finalGf ? 'scaleX(-1)' : ''}`;
    const previewStyle = isPreview ? `translateY(${UI_PREVIEW_SETTINGS.y}%) scale(${UI_PREVIEW_SETTINGS.scale})` : '';

    return (
        <div id={idPrefix} className="relative w-32 h-32" style={{ transform: previewStyle }}>
            {isHappy && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-[200] text-4xl animate-pulse filter drop-shadow-[0_0_10px_gold]">
                    ✨
                </div>
            )}
            
            <div className={`w-full h-full ${wrapperClass}`} style={{ transformStyle: 'preserve-3d' }}>
                <div className={`servitor-rig relative w-full h-full ${animationClass}`} 
                    style={{ 
                        transform: globalTransform,
                        transformOrigin: 'bottom center'
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
                    {renderStatic(config.carryTreasureIndex, ASSETS.CARRY_TREASURE, 'carryTreasure', getZ('carryTreasure'))} 
                    {renderStatic(config.hatIndex, ASSETS.HEAD, 'head', getZ('head'))}
                </div>
            </div>
        </div>
    );
});
ServitorRig.displayName = 'ServitorRig';

// --- MAIN COMPONENT ---

export default function ServitorWildUnknown() {
    const router = useRouter();
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    // --- STATE ---
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [showInfoModal, setShowInfoModal] = useState(true); 

    const [rigAnimation, setRigAnimation] = useState('anim-idle');
    const [isCarryingTreasure, setIsCarryingTreasure] = useState(false);
    const [isHappy, setIsHappy] = useState(false);
    const [isDepositing, setIsDepositing] = useState(false);

    const runningRef = useRef(false); 
    const loopIdRef = useRef(0);
    const audioRefs = useRef<{[key: string]: HTMLAudioElement}>({});

    const servitorPosRef = useRef(20);
    const holdIntervalRef = useRef<any>(null); 
    const buttonIntervalRef = useRef<any>(null); 
    const isHoldingRef = useRef(false);

    const [sName, setSName] = useState("");
    const [sPurpose, setSPurpose] = useState("");
    const [user, setUser] = useState<any>(null);
    const [credits, setCredits] = useState<number | null>(null);
    const [savedServitors, setSavedServitors] = useState<any[]>([]);
    
    // --- CATEGORIES DEFINITION ---
    const CATEGORIES = useMemo(() => [
        { id: 'saved', label: 'SAVED', asset: null, indexKey: null, offsetKey: null }, // NEW SAVED BUTTON
        { id: 'global', label: 'WHOLE', asset: null, indexKey: null, offsetKey: 'global', canFlip: true },
        { id: 'worlds', label: 'WORLDS', asset: null, indexKey: 'bgIndex', offsetKey: null }, 
        { id: 'settings', label: 'BEHAVIOR', asset: null, indexKey: null, offsetKey: null },
        { id: 'head', label: 'HATS', asset: ASSETS.HEAD, indexKey: 'hatIndex', offsetKey: 'head', canFlip: true },
        { id: 'base', label: 'TORSOS', asset: ASSETS.BASES, indexKey: 'baseIndex', offsetKey: 'base', canFlip: true },
        { id: 'leg', label: 'LEGS', asset: ASSETS.LEGS, indexKey: 'legIndex', offsetKey: 'leg', canFlip: false, canSpread: true },
        { id: 'arm', label: 'ARMS', asset: ASSETS.ARMS, indexKey: 'limbIndex', offsetKey: 'arm', canFlip: false, canSpread: true },
        { id: 'tool', label: 'TOOLS', asset: ASSETS.TOOLS, indexKey: 'toolIndex', offsetKey: 'tool', canFlip: true },
        { id: 'treasure', label: 'TREASURE', asset: ASSETS.CARRY_TREASURE, indexKey: 'carryTreasureIndex', offsetKey: 'carryTreasure', canFlip: true },
        { id: 'clothes', label: 'ROBES', asset: ASSETS.CLOTHES, indexKey: 'clothingIndex', offsetKey: 'clothes', canFlip: true },
        { id: 'wing', label: 'WINGS', asset: ASSETS.BACK, indexKey: 'wingIndex', offsetKey: 'wing', canFlip: true },
        { id: 'sigil', label: 'SIGILS', asset: ASSETS.TREASURES, indexKey: 'sigilIndex', offsetKey: 'sigil', canFlip: true },
        { id: 'mound', label: 'MOUNDS', asset: ASSETS.MOUND, indexKey: null, offsetKey: 'mound', single: true, canFlip: true },
        { id: 'vessel', label: 'VESSELS', asset: ASSETS.VESSELS, indexKey: 'vesselIndex', offsetKey: 'vessel', canFlip: true },
        { id: 'food', label: 'FOOD', asset: ASSETS.FOOD, indexKey: 'foodIndex', offsetKey: null }
    ], []);

    const [config, setConfig] = useState({
        baseIndex: 0, limbIndex: 0, legIndex: 0, toolIndex: 0,
        hatIndex: 0, wingIndex: 0, vesselIndex: 0, clothingIndex: 0,
        sigilIndex: 0, foodIndex: 0, treasureIndex: 0,
        carryTreasureIndex: 0,
        bgIndex: 0,
        movementType: "walk", 
        feedFreq: 5,
        offsets: JSON.parse(JSON.stringify(DEFAULT_OFFSETS))
    });

    const [treasurePile, setTreasurePile] = useState<{id: number, x: number, y: number, r: number, index: number}[]>([]);

    const [depositCount, setDepositCount] = useState(0);
    const depositRef = useRef(0);
    const [hungerState, setHungerState] = useState<'sated' | 'hungry' | 'fed'>('sated');
    const [awakenProgress, setAwakenProgress] = useState(0);
    const [isAwakening, setIsAwakening] = useState(false);
    const [isFeeding, setIsFeeding] = useState(false);
    const [feedProgress, setFeedProgress] = useState(0);
    const [fallingFood, setFallingFood] = useState<{id: number, left: number, top: number, spriteIndex: number}[]>([]);

    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showConfirmSave, setShowConfirmSave] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showExitWarning, setShowExitWarning] = useState(false);
    const SAVE_COST = 10;

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
            if (user) {
                setUser(user);
                fetchCredits(user.id);
                fetchSavedServitors(user.id);
            }
        };
        initUser();
    }, [supabase]);

    const fetchCredits = async (userId: string) => {
        const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single();
        if (data) setCredits(data.credits);
    };

    const fetchSavedServitors = async (userId: string) => {
        const { data } = await supabase
            .from('spells')
            .select('*')
            .eq('user_id', userId)
            .eq('tradition', 'SERVITOR')
            .order('created_at', { ascending: false });
        if (data) setSavedServitors(data);
    };

    const updateOffset = (part: string, field: 'x'|'y'|'s'|'f'|'v'|'spread', value: number | boolean) => {
        setConfig(prev => ({
            ...prev,
            offsets: {
                ...prev.offsets,
                [part]: { ...(prev.offsets as any)[part], [field]: value }
            }
        }));
        setHasUnsavedChanges(true);
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
            setHasUnsavedChanges(true);
        }, 100);
    };

    const handleOffsetStop = () => {
        if (buttonIntervalRef.current) clearInterval(buttonIntervalRef.current);
    };

    // --- AUDIO LOGIC ---
    const playAudio = (path: string, loop: boolean = false) => {
        if (!audioRefs.current[path]) {
            audioRefs.current[path] = new Audio(path);
        }
        
        const audio = audioRefs.current[path];
        audio.loop = loop;
        audio.currentTime = 0;
        audio.volume = 0.5; 
        audio.play().catch(e => console.error("Audio play failed:", e));
    };

    const stopAudio = (path: string) => {
        if (audioRefs.current[path]) {
            audioRefs.current[path].pause();
            audioRefs.current[path].currentTime = 0;
        }
    };

    // --- SAVING LOGIC (UPDATED) ---
    const handleSaveClick = () => {
        if (!user) return alert("Please log in to save.");
        if (!sName) return alert("Name your Servitor before saving.");
        setShowConfirmSave(true);
    };

    const confirmSave = async () => {
        if (!user || credits === null) return;

        if (credits < SAVE_COST) {
            setShowConfirmSave(false);
            setShowCreditModal(true);
            return;
        }

        // Deduct Credits
        const newBalance = credits - SAVE_COST;
        const { error: creditError } = await supabase.from('profiles').update({ credits: newBalance }).eq('id', user.id);
        
        if (creditError) {
            alert("Transaction failed. The Aether rejects this.");
            return;
        }

        setCredits(newBalance);

        // Save Spell
        const { error: saveError } = await supabase.from('spells').insert({
            user_id: user.id,
            name: sName,
            intention: sPurpose,
            tradition: 'SERVITOR',
            ritual_data: config
        });

        if (saveError) {
            console.error(saveError);
            alert("Failed to bind spirit to grimoire.");
        } else {
            playAudio(AUDIO_PATHS.BIND_ACTIVATE);
            alert("Bound to Grimoire!");
            setHasUnsavedChanges(false);
            setShowConfirmSave(false);
            fetchSavedServitors(user.id);
        }
    };

    const loadServitor = (servitor: any) => {
        setSName(servitor.name);
        setSPurpose(servitor.intention);
        if (servitor.ritual_data) {
            setConfig(servitor.ritual_data);
        }
        setActiveCategory(null);
    };

    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

    const moveTo = (targetPercent: number, id: number) => {
        return new Promise<void>(resolve => {
            const el = document.getElementById('servitor-container');
            if(!el) { resolve(); return; }
            
            const current = parseFloat(el.style.left) || 20;
            const dist = Math.abs(targetPercent - current);
            const time = dist * 40; 

            el.style.transition = `left ${time}ms linear`;
            
            requestAnimationFrame(() => {
                el.style.left = targetPercent + "%";
                servitorPosRef.current = targetPercent;
            });

            setTimeout(() => { if(runningRef.current && loopIdRef.current === id) resolve(); }, time);
        });
    };

    const mainLoop = async (id: number) => {
        let retries = 0;
        let servitor = document.getElementById('servitor-container');
        while (!servitor && retries < 20 && runningRef.current) {
            await wait(50);
            servitor = document.getElementById('servitor-container');
            retries++;
        }

        const moundInner = document.getElementById('game-mound-inner');
        const vessel = document.getElementById('game-vessel');
        const shine = document.getElementById('vessel-shine');

        while(runningRef.current && loopIdRef.current === id) {
            
            if(servitor) { 
                servitor.style.opacity = '1'; 
                servitor.style.transform = 'scale(1)'; 
                servitor.style.animation = 'none'; 
                servitor.style.removeProperty('transform');
            }
            setIsCarryingTreasure(false); 
            setRigAnimation(config.movementType === 'fly' ? 'anim-fly-left' : 'anim-walk-left');
            
            await moveTo(15, id); 
            if(!runningRef.current) break;
            
            setRigAnimation('anim-idle-left'); 
            await wait(200);

            if(servitor) {
                servitor.style.transition = 'none';
                servitor.style.removeProperty('transform');
                void servitor.offsetWidth; 
                
                playAudio(AUDIO_PATHS.MOUND_JUMP_IN);
                
                servitor.style.animation = 'jump-into-void 0.8s forwards ease-in-out';
            }
            await wait(800); 

            if(servitor) {
                servitor.style.opacity = '0';
                servitor.style.animation = 'none'; 
            }
            
            if(moundInner) moundInner.classList.add('anim-searching');
            
            playAudio(AUDIO_PATHS.THUNDER_LOOP, true);

            const searchDuration = Math.random() * 7000 + 3000;
            await wait(searchDuration); 

            stopAudio(AUDIO_PATHS.THUNDER_LOOP);
            
            if(moundInner) moundInner.classList.remove('anim-searching');

            if(servitor) {
                servitor.style.opacity = '1';
                servitor.style.removeProperty('transform');
                void servitor.offsetWidth;
                
                setIsCarryingTreasure(true);
                setRigAnimation(config.movementType === 'fly' ? 'anim-fly-right' : 'anim-walk-right'); 

                playAudio(AUDIO_PATHS.MOUND_JUMP_OUT);

                servitor.style.animation = 'jump-out-of-void 0.8s forwards ease-in-out';
            }
            await wait(800); 

            setRigAnimation(config.movementType === 'fly' ? 'anim-fly-right' : 'anim-walk-right');
            
            const isMobile = window.innerWidth < 768;
            const rightDestination = isMobile ? 60 : 72;
            
            await moveTo(rightDestination, id);
            if(!runningRef.current) break;

            setRigAnimation('anim-idle');
            setIsCarryingTreasure(false); 

            setTreasurePile(prev => [...prev, {
                id: Math.random(),
                x: (Math.random() * 50) - 25, 
                y: (Math.random() * -20) - 10, 
                r: (Math.random() * 60) - 30, 
                index: config.carryTreasureIndex
            }]);

            playAudio(AUDIO_PATHS.DEPOSIT);

            setIsDepositing(true);
            setTimeout(() => setIsDepositing(false), 500);

            if(shine) { shine.style.opacity = '1'; setTimeout(() => shine.style.opacity = '0', 1000); }
            await wait(1000);

            depositRef.current++;
            setDepositCount(depositRef.current);

            if(depositRef.current >= config.feedFreq) {
                setHungerState('hungry');
                setFeedProgress(0);
                break;
            }
            await wait(500);
        }
    };

    const startHold = (type: 'awaken' | 'feed') => {
        if(isHoldingRef.current) return;
        isHoldingRef.current = true;

        playAudio(AUDIO_PATHS.SPIRIT_LOOP, true);

        const start = Date.now();
        const dur = type === 'awaken' ? 5000 : 7000;
        
        if(type === 'awaken') {
            setIsAwakening(true); 
            setAwakenProgress(0);
        } else {
            setIsFeeding(true);
            setFeedProgress(0);
        }

        holdIntervalRef.current = setInterval(() => {
            const p = Math.min(100, ((Date.now() - start) / dur) * 100);
            if(type === 'awaken') setAwakenProgress(p); else setFeedProgress(p);

            if(p >= 100) {
                clearInterval(holdIntervalRef.current);
                isHoldingRef.current = false; 

                stopAudio(AUDIO_PATHS.SPIRIT_LOOP);

                if(type === 'awaken') {
                    playAudio(AUDIO_PATHS.BIND_ACTIVATE);

                    setIsAwakening(false); 
                    setIsRunning(true); 
                    runningRef.current = true;
                    setTimeout(() => {
                        loopIdRef.current++; 
                        mainLoop(loopIdRef.current);
                    }, 100);
                } else {
                    playAudio(AUDIO_PATHS.FEED_COMPLETE);
                    
                    setIsFeeding(false); 
                    setHungerState('fed');
                    setTreasurePile([]); 
                }
            }
            
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
        stopAudio(AUDIO_PATHS.SPIRIT_LOOP);

        isHoldingRef.current = false;
        if(holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        setIsAwakening(false); 
        setAwakenProgress(0); 
        setIsFeeding(false); 
        setFeedProgress(0); 
        setFallingFood([]);
    };

    const handleResume = () => {
        playAudio(AUDIO_PATHS.DEPOSIT);

        setIsHappy(true);
        setTimeout(() => setIsHappy(false), 1200);

        setHungerState('sated'); 
        depositRef.current = 0; 
        setDepositCount(0);
        runningRef.current = true; 
        loopIdRef.current++; 
        
        setTimeout(() => mainLoop(loopIdRef.current), 1300);
    };

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

    if (!assetsLoaded) return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-200">
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

                /* NEW ORNATE BUTTON STYLE */
                .ornate-btn {
                    background-color: #000;
                    border: 2px solid #FFD700;
                    border-radius: 8px; 
                    box-shadow: 0 0 5px #FFD700, inset 0 0 10px #FFD700aa;
                    font-family: 'MedievalSharp', serif;
                    color: #FFD700;
                    text-transform: uppercase;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    user-select: none;
                    touch-action: none;
                }
                .ornate-btn:active { background-color: #1a1a00; transform: none !important; }
                
                @keyframes bounce { 0% { top: 0; } 50% { top: -5px; } }
                
                @keyframes rotate-l { 0% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } 100% { transform: rotate(-5deg); } }
                @keyframes rotate-r { 0% { transform: rotate(5deg); } 50% { transform: rotate(-5deg); } 100% { transform: rotate(5deg); } }
                
                @keyframes feed-wave-sync {
                    0% { transform: rotate(0deg); }
                    50% { transform: rotate(-12deg); }
                    100% { transform: rotate(0deg); }
                }

                @keyframes float-bob {
                    0% { transform: translateY(-60px); }
                    50% { transform: translateY(-90px); }
                    100% { transform: translateY(-60px); }
                }
                .anim-floating { animation: float-bob 3s ease-in-out infinite; }
                
                @keyframes jump-into-void {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    50% { transform: translateY(-100px) scale(1); opacity: 1; }
                    100% { transform: translateY(20px) scale(0); opacity: 0; }
                }

                @keyframes jump-out-of-void {
                    0% { transform: translateY(20px) scale(0); opacity: 1; } 
                    50% { transform: translateY(-100px) scale(1); opacity: 1; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }

                @keyframes rumble-search {
                    0% { transform: scale(1) translate(0, 0); }
                    25% { transform: scale(1.05) translate(-1px, 1px); }
                    50% { transform: scale(1.1) translate(1px, -1px); }
                    75% { transform: scale(1.05) translate(-1px, 1px); }
                    100% { transform: scale(1) translate(0, 0); }
                }
                
                .anim-searching {
                    animation: rumble-search 0.25s infinite linear;
                    filter: drop-shadow(0 0 20px #8a2be2) !important;
                }

                @keyframes vessel-pulse-grow {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .anim-vessel-deposit {
                    animation: vessel-pulse-grow 0.5s ease-in-out;
                }

                @keyframes jump-celebrate {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0); }
                }
                .anim-happy-jump {
                    animation: jump-celebrate 0.6s ease-in-out infinite;
                }

                /* UPDATED CSS STARFIELD - 5x Size, 3x Density */
                .stars-container { position: absolute; top:0; left:0; width:100%; height:100%; overflow:hidden; pointer-events:none; z-index: 5; }
                .stars-1 {
                    width: 5px; height: 5px; background: transparent;
                    /* Increased density of box-shadows */
                    box-shadow: 
                        10vw 10vh #FFF, 20vw 80vh #FFF, 80vw 10vh #FFF, 90vw 90vh #FFF, 50vw 50vh #FFF, 30vw 30vh #FFF, 60vw 20vh #FFF, 10vw 90vh #FFF,
                        15vw 40vh #FFF, 25vw 60vh #FFF, 70vw 30vh #FFF, 85vw 70vh #FFF, 40vw 40vh #FFF, 05vw 20vh #FFF, 95vw 10vh #FFF, 35vw 75vh #FFF,
                        55vw 10vh #FFF, 12vw 88vh #FFF, 65vw 55vh #FFF, 75vw 05vh #FFF, 45vw 95vh #FFF, 22vw 33vh #FFF, 88vw 44vh #FFF, 02vw 50vh #FFF;
                    animation: twinkle 4s infinite alternate;
                }
                .stars-2 {
                    width: 10px; height: 10px; background: transparent;
                    box-shadow: 
                        15vw 15vh #FFD700, 25vw 85vh #FFD700, 85vw 15vh #FFD700, 95vw 95vh #FFD700, 55vw 55vh #FFD700,
                        35vw 35vh #FFD700, 45vw 75vh #FFD700, 65vw 25vh #FFD700, 75vw 65vh #FFD700, 05vw 95vh #FFD700,
                        20vw 50vh #FFD700, 80vw 40vh #FFD700, 10vw 30vh #FFD700, 90vw 60vh #FFD700, 60vw 90vh #FFD700;
                    animation: twinkle 6s infinite alternate-reverse;
                }
                .stars-3 {
                    width: 15px; height: 15px; background: transparent;
                    box-shadow: 
                        5vw 50vh #FFF, 90vw 20vh #FFF, 40vw 80vh #FFF,
                        20vw 20vh #FFF, 70vw 70vh #FFF, 30vw 90vh #FFF,
                        10vw 60vh #FFF, 80vw 10vh #FFF, 60vw 40vh #FFF;
                    animation: twinkle 8s infinite alternate;
                    filter: blur(2px);
                }
                @keyframes twinkle { from { opacity: 0.3; } to { opacity: 1; } }

                @keyframes fall { from { top: -10%; opacity: 1; } to { top: 100%; opacity: 0; } }

                .anim-walk-left .servitor-rig { animation: bounce 0.6s infinite; }
                .anim-walk-left .leg-left-joint { animation: rotate-l 1.2s infinite ease-in-out; }
                .anim-walk-left .leg-right-joint { animation: rotate-r 1.2s infinite ease-in-out; }
                .anim-walk-left .arm-left-joint { animation: rotate-r 1.2s infinite ease-in-out; }
                .anim-walk-left .arm-right-joint { animation: rotate-l 1.2s infinite ease-in-out; }
                .anim-walk-left .tool-hand-anim { animation: rotate-l 1.2s infinite ease-in-out; }
                .anim-walk-left .carry-hand-anim { animation: rotate-r 1.2s infinite ease-in-out; }

                .anim-walk-right .servitor-rig { animation: bounce 0.6s infinite; }
                .anim-walk-right .leg-left-joint { animation: rotate-r 1.2s infinite ease-in-out; }
                .anim-walk-right .leg-right-joint { animation: rotate-l 1.2s infinite ease-in-out; }
                .anim-walk-right .arm-left-joint { animation: rotate-l 1.2s infinite ease-in-out; }
                .anim-walk-right .arm-right-joint { animation: rotate-r 1.2s infinite ease-in-out; }
                .anim-walk-right .tool-hand-anim { animation: rotate-r 1.2s infinite ease-in-out; }
                .anim-walk-right .carry-hand-anim { animation: rotate-l 1.2s infinite ease-in-out; }

                .anim-feed .arm-left-joint { animation: feed-wave-sync 0.6s infinite ease-in-out !important; }
                .anim-feed .arm-right-joint { animation: feed-wave-sync 0.6s infinite ease-in-out !important; }
                .anim-feed .tool-hand-anim { animation: feed-wave-sync 0.6s infinite ease-in-out !important; }
                .anim-feed .carry-hand-anim { animation: feed-wave-sync 0.6s infinite ease-in-out !important; }

                .pulse-glow-void { animation: pulse-void 1s infinite alternate; }
                @keyframes pulse-void { from { filter: drop-shadow(0 0 10px #4b0082); } to { filter: drop-shadow(0 0 40px #8a2be2); } }
                .pulse-glow-gold { animation: pulse-gold 0.5s infinite alternate; }
                @keyframes pulse-gold { from { filter: drop-shadow(0 0 10px #FFD700); } to { filter: drop-shadow(0 0 50px #FFFF00); } }
                
                .custom-scrollbar::-webkit-scrollbar { width: 8px; } 
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #5d4037; border-radius: 4px; }
            `}</style>

            <button onClick={() => hasUnsavedChanges ? setShowExitWarning(true) : router.push('/spell-room')} className="absolute top-5 right-4 z-60 text-gray-400 hover:text-white"><X /></button>
            
            <button onClick={() => setShowInfoModal(true)} className="absolute top-4 left-4 z-60 text-gray-400 hover:text-white"><Info /></button>

            {/* INFO MODAL */}
            {showInfoModal && (
                <div className="fixed inset-0 z-500 flex items-center justify-center bg-black/80 p-6 animate-in fade-in">
                    <div className="bg-[#1a1528] border border-amber-600 p-8 rounded text-center max-w-sm relative">
                        <h2 className="text-[#FFD700] magick-font text-2xl mb-4">The Servitor</h2>
                        <div className="text-gray-300 text-sm space-y-4 mb-6 text-left font-sans">
                            <p>A Servitor is a created spirit entity, designed to perform a specific task or fulfill a specific purpose for its creator.</p>
                            <p><strong>Instructions:</strong></p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Customize your spirit's appearance.</li>
                                <li>Name it and define its purpose.</li>
                                <li>Hold "Awaken" to bring it to life.</li>
                                <li>Watch it gather wealth/energy for you.</li>
                                <li>Feed it when it gets hungry to maintain the bond.</li>
                                <li>Bind it to your grimoire to save it.</li>
                            </ul>
                        </div>
                        <button onClick={() => setShowInfoModal(false)} className="w-full bg-amber-900/50 border border-amber-600 py-2 uppercase text-amber-100">Close</button>
                    </div>
                </div>
            )}

            {/* STAGE */}
            <div className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700" 
                 style={{ backgroundImage: `url('${ASSET_PATH}${BACKGROUND_OPTIONS[config.bgIndex]}')` }}>
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* MAGICAL BACKGROUND SPARKLES (Task 4) */}
            {isRunning && !isFeedingActive && (
                <div className="stars-container">
                    <div className="stars-1"></div>
                    <div className="stars-2"></div>
                    <div className="stars-3"></div>
                </div>
            )}

            {/* GAME WORLD */}
            <div className="relative w-full h-full z-10 pointer-events-none">
                {/* GAMEPLAY HUD: Name & Purpose */}
                {isRunning && !isFeedingActive && (
                    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-indigo-900/90 border-double border-4 border-cyan-300 shadow-[0_0_15px_#4FD1C5] px-8 py-2 rounded-lg text-center min-w-60 pointer-events-auto">
                        <p className="text-[#FFD700] font-bold uppercase text-sm font-serif tracking-wider drop-shadow-md">
                            {sName || "Spirit"}: {sPurpose || "Serve"}
                        </p>
                    </div>
                )}

                <div id="mound-wrapper" className="absolute bottom-[15vh] left-[10%] w-40 h-[100px] z-20 transition-all duration-500" 
                     style={{ ...getGameObjectStyle('mound') }}>
                    <div id="game-mound-inner" className="w-full h-full bg-contain bg-no-repeat bg-bottom" 
                         style={{ backgroundImage: `url('${ASSET_PATH}${ASSETS.MOUND}')` }} />
                </div>

                {isRunning && (
                    <div id="servitor-container" className="absolute bottom-[18vh] left-[20%] w-32 h-32 z-100 pointer-events-auto origin-bottom">
                        <ServitorRig 
                            idPrefix="game-rig" 
                            config={config} 
                            rigAnimation={rigAnimation} 
                            isFeeding={isFeeding} 
                            showCarriedTreasure={isCarryingTreasure} 
                            isHappy={isHappy} 
                        />
                    </div>
                )}

                <div className="absolute bottom-[20vh] right-[10%] w-32 h-32 z-20 flex flex-col items-center">
                    {config.offsets.vessel.v && (
                        <div id="vessel-wrapper" className="w-full h-full relative transition-all duration-500"
                             style={getGameObjectStyle('vessel')}>
                            <div id="game-vessel-inner" 
                                 className={`w-full h-full ${isDepositing ? 'anim-vessel-deposit' : ''}`}
                                 style={{ ...getSpriteStyle(config.vesselIndex, ASSETS.VESSELS) }}>
                                 {treasurePile.map(t => (
                                     <div key={t.id} className="absolute w-8 h-8 opacity-90" 
                                          style={{
                                              left: `calc(50% + ${t.x}px)`,
                                              bottom: `calc(30% + ${t.y}px)`,
                                              transform: `rotate(${t.r}deg)`,
                                              ...getSpriteStyle(t.index, ASSETS.CARRY_TREASURE)
                                          }}
                                     />
                                 ))}
                            </div>
                        </div>
                    )}
                    <div id="vessel-shine" className="absolute top-0 text-4xl opacity-0 transition-opacity duration-500">✨</div>
                </div>

                {fallingFood.map(f => (
                    <div key={f.id} className="absolute w-16 h-16 z-200 animate-bounce"
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

            {/* MASTER UI PANEL */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${isRunning ? 'opacity-0 pointer-events-none transform scale-95' : 'opacity-100 pointer-events-auto transform scale-100'} p-0 md:p-0`}>
                
                <div className="relative w-full h-[95dvh] md:w-[600px] md:h-[calc(100vh-24px)] flex flex-col px-6 pt-12 pb-6 md:px-16 md:pt-14 md:pb-8 box-border"
                    style={{ 
                        backgroundImage: `url('${ASSET_PATH}${ASSETS.UI_PANEL}')`,
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat'
                    }}>
                    
                    {/* INPUTS */}
                    <div className="flex flex-col md:flex-row gap-2 shrink-0 mb-4 pt-4 md:pt-2 w-full max-w-[90%] mx-auto z-20">
                        <input type="text" value={sName} onChange={e => { setSName(e.target.value); setHasUnsavedChanges(true); }}
                            className="flex-1 bg-[#f0e6d2] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border-2 border-[#3e2723] p-2 h-10 md:h-auto text-sm text-black rounded magick-font placeholder-gray-600 px-3 min-w-0" 
                            placeholder="Spirit Name" />
                        <input type="text" value={sPurpose} onChange={e => { setSPurpose(e.target.value); setHasUnsavedChanges(true); }}
                            className="flex-1 bg-[#f0e6d2] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border-2 border-[#3e2723] p-2 h-10 md:h-auto text-sm text-black rounded magick-font placeholder-gray-600 px-3 min-w-0" 
                            placeholder="Purpose" />
                    </div>

                    {/* PREVIEW */}
                    <div className="relative shrink-0 h-44 md:h-48 w-full flex justify-center items-end border-b border-[#5d4037]/30 mb-2 overflow-visible z-30">
                        <div className="w-full h-full flex items-end justify-center pb-4">
                            <ServitorRig idPrefix="preview-rig" config={config} rigAnimation="anim-idle" isPreview={true} showCarriedTreasure={true} />
                        </div>
                    </div>

                    {/* GRID */}
                    <div className="flex-1 min-h-40 overflow-y-auto custom-scrollbar bg-[#eaddcf]/60 rounded p-2 z-20 relative border border-[#8d6e63]/30">
                        {!activeCategory ? (
                            <div className="grid grid-cols-4 gap-2">
                                {CATEGORIES.map(cat => {
                                    const currentIdx = cat.indexKey ? (config as any)[cat.indexKey] : 0;
                                    const isSingle = cat.single || false;
                                    return (
                                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                                            className="flex flex-col items-center gap-1 group bg-[#eaddcf] p-2 border border-[#8d6e63] rounded shadow-sm hover:border-[#3e2723]">
                                            <div className="w-12 h-12 flex items-center justify-center relative overflow-hidden">
                                                {/* CONDITIONAL RENDER */}
                                                {cat.id === 'saved' ? (
                                                    <FolderOpen size={24} className="text-[#3e2723]" />
                                                ) : cat.asset ? (
                                                    <div className="w-full h-full transform scale-90" style={getSpriteStyle(currentIdx, cat.asset, isSingle)} />
                                                ) : cat.id === 'global' ? (
                                                    <User size={24} className="text-[#3e2723]" />
                                                ) : cat.id === 'worlds' ? (
                                                    <Globe size={24} className="text-[#3e2723]" />
                                                ) : (
                                                    <Settings size={24} className="text-[#3e2723]"/>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-[#3e2723] font-bold uppercase tracking-wider">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : activeCategory === 'saved' ? (
                            // SAVED SERVITOR LIST
                            <div className="flex flex-col gap-2 h-full">
                                <div className="flex justify-between items-center mb-2 border-b border-[#3e2723] pb-1 sticky top-0 bg-[#eaddcf] z-30 pt-1">
                                    <h3 className="text-[#3e2723] font-bold uppercase">Grimoire</h3>
                                    <button onClick={() => setActiveCategory(null)}><X size={20} className="text-[#3e2723]"/></button>
                                </div>
                                {savedServitors.length === 0 ? (
                                    <div className="text-center text-[#3e2723] opacity-60 mt-10 text-sm">No spirits bound yet.</div>
                                ) : (
                                    savedServitors.map(servitor => (
                                        <button key={servitor.id} onClick={() => loadServitor(servitor)}
                                            className="flex items-center justify-between p-3 bg-[#f0e6d2] border border-[#8d6e63] rounded hover:bg-[#fff8e7] transition-colors text-left group">
                                            <div>
                                                <div className="text-[#3e2723] font-bold text-sm font-serif">{servitor.name}</div>
                                                <div className="text-[#5d4037] text-xs italic">
                                                    {servitor.intention?.length > 21 ? servitor.intention.substring(0, 21) + '...' : servitor.intention}
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-[#8d6e63] group-hover:text-[#3e2723]" />
                                        </button>
                                    ))
                                )}
                            </div>
                        ) : (
                            // STANDARD CONTROLS
                            <div className="w-full h-full flex flex-col">
                                <div className="flex justify-between items-center mb-2 border-b border-[#3e2723] pb-1 sticky top-0 bg-[#eaddcf] z-30 pt-1">
                                    <h3 className="text-[#3e2723] font-bold uppercase">{CATEGORIES.find(c => c.id === activeCategory)?.label}</h3>
                                    <button onClick={() => setActiveCategory(null)}><X size={20} className="text-[#3e2723]"/></button>
                                </div>
                                
                                <div className="flex-1">
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
                                            {CATEGORIES.find(c => c.id === activeCategory)?.offsetKey && (
                                                <div className="mb-4">
                                                    <DPad 
                                                        part={CATEGORIES.find(c => c.id === activeCategory)?.offsetKey as string} 
                                                        allowFlip={CATEGORIES.find(c => c.id === activeCategory)?.canFlip} 
                                                        allowSpread={CATEGORIES.find(c => c.id === activeCategory)?.canSpread}
                                                    />
                                                </div>
                                            )}
                                            
                                            {CATEGORIES.find(c => c.id === activeCategory)?.indexKey && (
                                                <div className={`grid ${activeCategory === 'worlds' ? 'grid-cols-2' : 'grid-cols-4'} gap-2 mb-4 pb-2`}>
                                                    {activeCategory === 'worlds' ? (
                                                        BACKGROUND_OPTIONS.map((bgName, i) => (
                                                            <button key={i} 
                                                                onClick={() => { setConfig({...config, bgIndex: i}); setHasUnsavedChanges(true); }}
                                                                className={`w-full aspect-video border-2 rounded overflow-hidden relative ${(config as any).bgIndex === i ? 'border-[#3e2723] ring-1 ring-[#3e2723]' : 'border-transparent'}`}>
                                                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${ASSET_PATH}${bgName}')` }} />
                                                                <div className="absolute bottom-0 left-0 w-full bg-black/50 text-[8px] text-white text-center py-1 truncate px-1">
                                                                    {bgName.split('.')[0].replace(/_/g, ' ')}
                                                                </div>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        GENERIC_LIST.map((_, i) => (
                                                            <button key={i} 
                                                                onClick={() => { setConfig({...config, [(CATEGORIES.find(c => c.id === activeCategory)?.indexKey as string)]: i}); setHasUnsavedChanges(true); }}
                                                                className={`w-full aspect-square border-2 rounded overflow-hidden bg-white/50 ${(config as any)[CATEGORIES.find(c => c.id === activeCategory)?.indexKey as string] === i ? 'border-[#3e2723] ring-1 ring-[#3e2723]' : 'border-transparent'}`}>
                                                                <div className="w-full h-full transform scale-75" 
                                                                     style={getSpriteStyle(i, (CATEGORIES.find(c => c.id === activeCategory)?.asset as string), CATEGORIES.find(c => c.id === activeCategory)?.single)} />
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="mt-2 shrink-0 flex gap-2 w-full z-20">
                        <button 
                            onPointerDown={(e) => {
                                e.preventDefault();
                                e.currentTarget.setPointerCapture(e.pointerId);
                                startHold('awaken');
                            }}
                            onPointerUp={(e) => {
                                e.preventDefault();
                                e.currentTarget.releasePointerCapture(e.pointerId);
                                stopHold();
                            }}
                            onPointerCancel={(e) => stopHold()}
                            className="ornate-btn flex-1 py-3 text-sm font-bold tracking-widest relative overflow-hidden"
                            style={{ touchAction: 'none' }}
                        >
                            <div className="absolute top-0 left-0 h-full bg-[#FFD700]/30 transition-all duration-75 ease-linear" style={{width: `${awakenProgress}%`}}></div>
                            <span className="relative z-10 text-center w-full block">{isAwakening ? "Awakening..." : "Hold to Awaken"}</span>
                        </button>
                        <button onClick={handleSaveClick} className="ornate-btn flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2">
                           <Save size={16} /> Bind ({SAVE_COST})
                        </button>
                    </div>

                </div>
            </div>

            {/* CONFIRMATION SAVE MODAL */}
            {showConfirmSave && (
                <div className="fixed inset-0 z-500 flex items-center justify-center bg-black/90 p-6 animate-in fade-in">
                    <div className="bg-[#1a1528] border border-amber-600 p-8 rounded text-center max-w-sm w-full shadow-[0_0_50px_rgba(251,191,36,0.2)]">
                        <Save size={48} className="mx-auto mb-4 text-amber-500" />
                        <h2 className="text-[#FFD700] magick-font text-2xl mb-2">Bind Spirit</h2>
                        <p className="text-gray-300 text-sm mb-6">
                            Saving "{sName}" to your Grimoire requires energy.
                        </p>
                        
                        <div className="bg-black/30 p-4 rounded mb-6 text-sm">
                            <div className="flex justify-between text-gray-400 mb-2">
                                <span>Current Aether:</span>
                                <span className="text-white font-bold">{credits}</span>
                            </div>
                            <div className="flex justify-between text-amber-400 font-bold border-t border-gray-700 pt-2">
                                <span>Cost:</span>
                                <span>-{SAVE_COST}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button onClick={confirmSave} className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded uppercase tracking-wider transition-colors">
                                Confirm & Bind
                            </button>
                            <button onClick={() => setShowConfirmSave(false)} className="text-gray-500 hover:text-white text-sm underline">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INSUFFICIENT FUNDS MODAL */}
            {showCreditModal && (
                 <div className="fixed inset-0 z-500 flex items-center justify-center bg-black/90 p-6 animate-in fade-in">
                    <div className="bg-[#1a1528] border border-red-500 p-8 rounded text-center max-w-sm w-full">
                        <Lock className="mx-auto mb-4 text-red-500 w-12 h-12" />
                        <h2 className="text-red-100 magick-font text-xl mb-2">Insufficient Aether</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            You require more energy to bind this spirit to your Grimoire.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => router.push('/store?redirect=/spell-room/servitor-app')} 
                                className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 rounded uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                <Coins size={16} /> Acquire Aether
                            </button>
                            <button onClick={() => setShowCreditModal(false)} className="text-gray-500 hover:text-white text-sm underline">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FEEDING MODAL */}
            {isFeedingActive && (
                <div className={`absolute inset-0 z-200 flex flex-col items-center justify-start pt-[50px] transition-colors duration-300 ${isFeeding ? 'bg-black/0' : 'bg-black/80'}`}>
                    {hungerState === 'fed' ? (
                        <div className="text-center animate-in zoom-in">
                            <h2 className="text-[#FFD700] magick-font text-3xl mb-4">Hunger Sated</h2>
                            <button onClick={handleResume} className="runic-btn px-8 py-3 rounded text-lg font-bold">Resume Ritual</button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-60">
                            <div className="h-8 mb-8 flex items-center justify-center w-full">
                                <p className="text-[#FFD700] text-xl font-serif animate-pulse text-center whitespace-nowrap">
                                    {isFeeding ? "Feeding your Servitor..." : `${sName || 'Spirit'} requires sustenance...`}
                                </p>
                            </div>
                            
                            <div className="w-40 h-40 flex items-center justify-center">
                                <button 
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.setPointerCapture(e.pointerId);
                                        startHold('feed');
                                    }}
                                    onPointerUp={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.releasePointerCapture(e.pointerId);
                                        stopHold();
                                    }}
                                    onPointerCancel={(e) => stopHold()}
                                    style={{ transform: 'translateZ(0) scale(1)', touchAction: 'none' }} 
                                    className={`w-40 h-40 rounded-full border-4 border-[#FFD700] flex items-center justify-center relative overflow-hidden bg-black shadow-[0_0_50px_#FFD700] transition-opacity duration-300 ${isFeeding ? 'opacity-90' : 'opacity-100'}`}
                                >
                                    <div 
                                        className="absolute bottom-0 left-0 w-full bg-[#FFD700] z-10" 
                                        style={{
                                            height: `${feedProgress}%`,
                                            transition: feedProgress > 0 ? 'height 0.1s linear' : 'none'
                                        }}>
                                    </div>
                                    <div className="w-20 h-20 relative z-20 pointer-events-none" style={getSpriteStyle(config.foodIndex, ASSETS.FOOD)} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}