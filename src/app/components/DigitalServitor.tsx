"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Maximize2, Minimize2, Save, Trash2, BookOpen, Info, AlertTriangle, Lock } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { checkAndSpendCredits, getWalletStatus, COST_BIND_SERVITOR } from '@/lib/economy';
import { saveServitorToGrimoire, getMyServitors } from '@/lib/services/spellService';

import { BlockageErrorOverlay } from './economy/BlockageErrorOverlay';

// --- CONSTANTS ---

interface SavedServitor {
    id: string;
    name: string;
    master_name: string;
    purpose: string;
    config: any;
}

const HATS: Record<string, string> = {
    'none': '',
    'wizard': '<div class="hat-wizard"></div>',
    'crown': '<div class="hat-crown"></div>',
    'horns': '<div class="hat-horns"><div class="horn l"></div><div class="horn r"></div></div>',
    'hood': '<div class="hat-hood"></div>',
    'diadem': '<div class="hat-diadem"></div>',
    'halo': '<div class="hat-halo"></div>'
};

const OBJECTS: Record<string, string> = {
    'gold': '💰', 'heart': '❤️', 'clover': '🍀', 'sparkle': '✨',
    'health': '⚕️', 'bolt': '⚡', 'bulb': '💡', 'sword': '⚔️', 'shield': '🛡️', 'fire': '🔥'
};

const FOOD_ICONS: string[] = [
    '💖', '✨', '🍎', '🍷', '🍞', '🥩', '🍪', '🥛', '🍯', 
    '💰', '💎', '🕯️', '🪄', '🔮', '💋', '🎁', '🎈', '🏅', 
    '🏆', '🎱', '🗝️', '🧬', '⚡', '🎵', '🧿'
];

const CHEST_SYMBOLS: Record<string, string> = {
    'none': '', 'star': '⭐', 'eye': '👁️', 'moon': '🌙', 'sun': '☀️', 
    'om': '🕉️', 'yin': '☯️', 'cross': '✝️', 'ankh': '☥', 'spiral': '🌀'
};

const CHEST_NAMES: Record<string, string> = {
    'default': 'Treasure Chest',
    'portal': 'Soul Portal',
    'cave': 'Magick Cavern',
    'pond': 'Pond of Becoming'
};

export default function DigitalServitor() {
    const router = useRouter();
    
    // Supabase
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // --- State Management ---
    
    // Logic State
    const [isRunning, setIsRunning] = useState(false);
    const runningRef = useRef(false); 
    const loopIdRef = useRef(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const audioCtxRef = useRef<any>(null);
    const oscRef = useRef<any>(null); // For continuous sounds (awaken/feed)

    // Form State
    const [sName, setSName] = useState("");
    const [sPurpose, setSPurpose] = useState("");
    const [uName, setUName] = useState("");
    
    // User & Cabinet State
    const [user, setUser] = useState<any>(null);
    const [savedServitors, setSavedServitors] = useState<SavedServitor[]>([]);
    const [loadingCabinet, setLoadingCabinet] = useState(false);
    
    // THE FIX: Added isUnlimited to the state type definition
    const [wallet, setWallet] = useState<{ credits: number, tier: string, isUnlimited: boolean } | null>(null);

    // Persistence & Economy State
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showExitWarning, setShowExitWarning] = useState(false);
    const [blockageError, setBlockageError] = useState<string | null>(null);

    // Appearance & Audio State
    const [config, setConfig] = useState({
        skin: "#9ea7c6",
        clothes: "#2a2a35",
        hairColor: "#444444",
        beardColor: "#444444",
        outfit: "outfit-tunic",
        hat: "none",
        tool: "wand",
        hairStyle: "short",
        beardStyle: "none",
        face: "face-stoic",
        object: "gold",
        chestSymbol: "none",
        chestType: "default",
        hasWings: false,
        wingColor: "#aaffff",
        movementType: "walk", 
        soundSearch: "rumble", 
        soundFind: "chime",    
        soundDeposit: "coin",
        // Feeding Config
        foodName: "Gratitude",
        foodIcon: "✨",
        feedFreq: 5
    });

    // Awakening & Feeding State
    const [awakenProgress, setAwakenProgress] = useState(0);
    const [isAwakening, setIsAwakening] = useState(false);
    const [awakenComplete, setAwakenComplete] = useState(false); // For the glitter flash
    const [isFeeding, setIsFeeding] = useState(false);
    
    // Hunger System
    const [depositCount, setDepositCount] = useState(0);
    const depositRef = useRef(0); // Ref for synchronous loop access
    const [hungerState, setHungerState] = useState<'sated' | 'hungry' | 'fed'>('sated');
    const [feedProgress, setFeedProgress] = useState(0);
    const [fallingFood, setFallingFood] = useState<{id: number, left: number, top: number}[]>([]);
    const holdIntervalRef = useRef<any>(null);

    // --- Effects ---

    // 1. Init User & Data & Restore Draft
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                refreshCabinet(user.id);
                const w = await getWalletStatus(user.id);
                setWallet(w);
            }

            // CHECK FOR DRAFT (Return from Store)
            const draft = sessionStorage.getItem('SERVITOR_PENDING_DRAFT');
            if (draft) {
                try {
                    const data = JSON.parse(draft);
                    if (data) {
                        setSName(data.sName || "");
                        setSPurpose(data.sPurpose || "");
                        setUName(data.uName || "");
                        if (data.config) setConfig(data.config);
                        setHasUnsavedChanges(true); // Restore dirty state
                    }
                } catch (e) {
                    console.error("Failed to restore servitor draft", e);
                }
                sessionStorage.removeItem('SERVITOR_PENDING_DRAFT');
            }
        };
        init();
    }, [supabase]);

    // 2. Track Changes for Warning
    useEffect(() => {
        // Any change to name, purpose, or config flags the state as dirty
        // We check if sName is present to ensure we aren't flagging empty initial state
        if (sName || sPurpose) {
            setHasUnsavedChanges(true);
        }
    }, [sName, sPurpose, config]);

    // 3. Browser Back Button Protection
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = ''; // Chrome requires returnValue to be set
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const refreshCabinet = async (userId: string) => {
        setLoadingCabinet(true);
        try {
            const data = await getMyServitors(userId);
            setSavedServitors(data as SavedServitor[]);
            // Also refresh wallet
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

        // 1. Check & Spend Credits
        const canAfford = await checkAndSpendCredits(user.id, COST_BIND_SERVITOR);
        if (!canAfford) {
            setBlockageError("Insufficient Faestones");
            return;
        }

        // 2. Save to DB - ENSURE ALL DATA IS SAVED
        try {
            await saveServitorToGrimoire(user.id, {
                name: sName,
                master_name: uName,
                purpose: sPurpose,
                config: config // Full config object
            });
            
            // 3. Success State
            setHasUnsavedChanges(false);
            refreshCabinet(user.id);
            if(win) win.alert(`Servitor "${sName}" successfully bound to Grimoire.`);
            
        } catch (error) {
            console.error("Binding failed:", error);
            if(win) win.alert("The binding ritual failed. Please try again.");
        }
    };

    const handleGoToStoreWithSave = () => {
        // Save draft before leaving
        const draft = {
            sName,
            sPurpose,
            uName,
            config
        };
        sessionStorage.setItem('SERVITOR_PENDING_DRAFT', JSON.stringify(draft));
        
        // BlockageErrorOverlay will handle the navigation via router.push or we can do it here if we didn't pass onGoToStore to it.
        // But since we are passing onGoToStore, we MUST navigate.
        router.push('/store?redirect=' + encodeURIComponent(window.location.pathname));
    };

    const handleLoad = (servitor: SavedServitor) => {
        // Loading an existing one resets the "dirty" state
        setSName(servitor.name);
        setUName(servitor.master_name || "");
        setSPurpose(servitor.purpose || "");
        setConfig(servitor.config);
        
        // Wait a tick then clear dirty flag so setting state doesn't trigger it immediately
        setTimeout(() => setHasUnsavedChanges(false), 100);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const win = (globalThis as any).window;
        if (win && !win.confirm("Release this servitor back to the void?")) return;

        const { error } = await supabase.from('servitors').delete().eq('id', id);
        if (!error && user) {
            refreshCabinet(user.id);
        }
    };

    const handleSafeExit = () => {
        if (hasUnsavedChanges) {
            setShowExitWarning(true);
        } else {
            router.push('/spell-room'); 
        }
    };

    const confirmExit = () => {
        runningRef.current = false;
        router.push('/spell-room');
    };

    // --- Helpers ---
    const toggleFullscreen = () => {
        const doc = (globalThis as any).document;
        if (!doc) return;

        if (!doc.fullscreenElement) {
            doc.documentElement.requestFullscreen().catch((e: any) => {
                console.error(`Error attempting to enable fullscreen: ${e.message}`);
            });
            setIsFullscreen(true);
        } else {
            if (doc.exitFullscreen) {
                doc.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // --- Audio Logic ---
    const initAudio = () => {
        const win = (globalThis as any).window;
        if (typeof win === 'undefined') return;

        if (!audioCtxRef.current) {
            const AudioContext = win.AudioContext || win.webkitAudioContext;
            if (AudioContext) {
                audioCtxRef.current = new AudioContext();
            }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    const playSound = (category: 'search' | 'find' | 'deposit' | 'awaken-start' | 'awaken-stop' | 'glitter') => {
        if(!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const now = ctx.currentTime;
        
        // Helper for oscillators
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
            // Sparkly arpeggio
            const base = 800;
            for(let i=0; i<10; i++) {
                setTimeout(() => playOsc('sine', base + (i*100), base + (i*200), 0.2, 0.1), i * 50);
            }
            return;
        }

        const type = category === 'search' ? config.soundSearch : 
                     category === 'find' ? config.soundFind : 
                     config.soundDeposit;

        switch(type) {
            // -- SEARCHING SOUNDS --
            case 'rumble':
                playOsc('sine', 150, 140, 0.8, 0.2);
                break;
            case 'hum':
                playOsc('sine', 400, 450, 1.5, 0.15);
                playOsc('sine', 600, 550, 1.5, 0.05);
                break;
            case 'static':
                playOsc('triangle', 300, 500, 0.6, 0.1);
                setTimeout(() => playOsc('sine', 500, 300, 0.6, 0.1), 400);
                break;
            case 'pulse':
                playOsc('sine', 280, 280, 0.3, 0.3);
                setTimeout(() => playOsc('sine', 280, 280, 0.3, 0.3), 300);
                setTimeout(() => playOsc('sine', 280, 280, 0.3, 0.3), 600);
                break;

            // -- FINDING SOUNDS --
            case 'chime':
                playOsc('sine', 800, 1200, 1, 0.1);
                setTimeout(() => playOsc('sine', 1200, 2000, 0.5, 0.05), 100);
                break;
            case 'wow':
                playOsc('triangle', 400, 800, 0.8, 0.1);
                playOsc('sine', 405, 805, 0.8, 0.1);
                break;
            case 'laser':
                playOsc('sine', 1200, 400, 0.4, 0.1); 
                break;
            case 'chord':
                playOsc('sine', 440, 440, 1.5, 0.05); // A
                playOsc('sine', 554, 554, 1.5, 0.05); // C#
                playOsc('sine', 659, 659, 1.5, 0.05); // E
                break;

            // -- DEPOSIT SOUNDS --
            case 'coin':
                playOsc('sine', 1800, 1800, 0.1, 0.1);
                setTimeout(() => playOsc('sine', 2000, 2000, 0.4, 0.05), 50);
                break;
            case 'angelic':
                const oscA = ctx.createOscillator();
                const gA = ctx.createGain();
                oscA.connect(gA); gA.connect(ctx.destination);
                oscA.type = 'triangle';
                oscA.frequency.value = 350;
                gA.gain.setValueAtTime(0, now);
                gA.gain.linearRampToValueAtTime(0.1, now + 0.5);
                gA.gain.linearRampToValueAtTime(0, now + 2);
                oscA.start(now); oscA.stop(now + 2);
                break;
            case 'vortex':
                playOsc('sine', 600, 150, 1.5, 0.4);
                playOsc('sine', 605, 155, 1.5, 0.2);
                break;
            case 'teleport':
                playOsc('sine', 200, 800, 1, 0.1);
                setTimeout(() => playOsc('sine', 800, 200, 0.5, 0.05), 800);
                break;
            default: break;
        }
    };

    // Continuous Sound Manager for Awaken/Feed
    const updateProgressSound = (active: boolean, progress: number, type: 'awaken' | 'feed') => {
        if(!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const now = ctx.currentTime;

        const startFreq = 200;
        const endFreq = 350;

        if (active) {
            // Start or Update
            if (!oscRef.current) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.type = type === 'awaken' ? 'triangle' : 'sine';
                osc.frequency.setValueAtTime(startFreq, now);
                gain.gain.setValueAtTime(0.1, now);
                osc.start(now);
                oscRef.current = { osc, gain, startFreq };
            }

            const { osc } = oscRef.current;
            const currentFreq = startFreq + ((endFreq - startFreq) * (progress / 100));
            osc.frequency.setTargetAtTime(currentFreq, now, 0.1);

        } else {
            // Stop / Reverse
            if (oscRef.current) {
                const { osc, gain, startFreq } = oscRef.current;
                osc.frequency.exponentialRampToValueAtTime(startFreq, now + 0.5);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                osc.stop(now + 0.5);
                oscRef.current = null;
            }
        }
    };

    // --- Visual Update Logic ---
    useEffect(() => {
        const doc = (globalThis as any).document;
        if (!doc) return;

        const updateCharacter = (prefix: string) => {
            const isGame = prefix === 'game-';
            const rig = doc.getElementById(isGame ? 'game-rig' : 'preview-rig');
            
            const setColors = (selector: string, color: string) => {
                doc.querySelectorAll('.' + prefix + selector).forEach((el: any) => {
                    el.style.backgroundColor = color;
                });
            };

            setColors('skin', config.skin);
            setColors('clothes', config.clothes);
            setColors('hair', config.hairColor);
            setColors('beard', config.beardColor);

            if(!rig) return;

            rig.classList.remove('outfit-tunic', 'outfit-robe', 'outfit-armor');
            rig.classList.add(config.outfit);

            const hairBack = rig.querySelector('.hair-back');
            const hairFront = rig.querySelector('.hair-front');
            if(hairBack) hairBack.className = `hair-back ${prefix}hair ${config.hairStyle !== 'short' ? config.hairStyle : ''}`;
            if(hairFront) hairFront.className = `hair-front ${prefix}hair ${config.hairStyle !== 'short' ? config.hairStyle : ''}`;

            const beard = rig.querySelector('.beard');
            if(beard) beard.className = `beard ${prefix}beard ${config.beardStyle}`;

            const head = rig.querySelector('.head');
            if(head) {
                head.classList.remove('face-stoic', 'face-determined', 'face-happy', 'face-discovery');
                if(!isFeeding) {
                   head.classList.add(config.face); 
                }
            }

            const hatContainer = doc.getElementById(prefix + 'hat-container');
            if(hatContainer) hatContainer.innerHTML = HATS[config.hat] || '';

            const toolEl = doc.getElementById(prefix + 'tool');
            if(toolEl) {
                toolEl.innerHTML = ''; toolEl.style.transform = '';
                if(config.tool === 'wand') {
                    toolEl.innerHTML = '<div class="css-wand"></div>';
                } else {
                    const map: any = { 'orb': '🔮', 'sword': '🗡️', 'key': '🗝️' };
                    toolEl.innerText = map[config.tool] || '';
                    toolEl.style.fontSize = '24px';
                    toolEl.style.transform = 'translate(-5px, 5px) rotate(-20deg)';
                }
            }

            const chestSigil = rig.querySelector('.chest-sigil');
            if(chestSigil) {
                chestSigil.innerText = CHEST_SYMBOLS[config.chestSymbol] || '';
            }

            const wings = rig.querySelector('.wings-container');
            if(wings) {
                wings.style.display = config.hasWings ? 'block' : 'none';
                const wingEls = wings.querySelectorAll('.wing-shape');
                wingEls.forEach((w: any) => {
                    w.style.background = `linear-gradient(to bottom right, ${config.wingColor}, rgba(255,255,255,0.5))`;
                    w.style.borderColor = 'silver';
                });
            }

            if(!isGame) {
                const carryEl = doc.getElementById('p-carry');
                if(carryEl) carryEl.innerText = OBJECTS[config.object];
            }
        };

        updateCharacter('p-');
        
        if(isRunning) {
            const win = (globalThis as any).window;
            if (win) {
                win.requestAnimationFrame(() => updateCharacter('game-'));
            }
        }

    }, [config, isRunning, hungerState, isFeeding]);

    // --- Animation Logic ---
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

    const moveTo = (targetPercent: number, id: number) => {
        return new Promise<void>(resolve => {
            const doc = (globalThis as any).document;
            const win = (globalThis as any).window;
            if (!doc || !win) { resolve(); return; }

            const el = doc.getElementById('servitor');
            if(!el) { resolve(); return; }
            
            const current = parseFloat(el.style.left) || 20;
            const dist = Math.abs(targetPercent - current);
            const time = dist * 40; 

            el.style.transition = `left ${time}ms linear`;
            
            win.requestAnimationFrame(() => {
                el.style.left = targetPercent + "%";
            });

            setTimeout(() => {
                if(runningRef.current && loopIdRef.current === id) {
                    resolve();
                }
            }, time);
        });
    }

    const stopAction = () => {
        const doc = (globalThis as any).document;
        if (!doc) return;
        const servitor = doc.getElementById('servitor');
        const rig = doc.getElementById('game-rig');
        if(servitor) servitor.classList.remove('walk-left', 'walk-right', 'anim-fly', 'anim-jump-in', 'anim-jump-out');
        if(rig) rig.classList.remove('dance-happy');
    }

    const mainLoop = async (id: number) => {
        const doc = (globalThis as any).document;
        
        const getEls = () => ({
            servitor: doc.getElementById('servitor'),
            rig: doc.getElementById('game-rig'),
            mound: doc.getElementById('mound'),
            carry: doc.getElementById('game-carry'),
            status: doc.getElementById('status-bar'),
            chestShine: doc.getElementById('chest-shine'),
            chestWrapper: doc.getElementById('chest-wrapper'),
            head: doc.getElementById('game-rig')?.querySelector('.head')
        });

        const chestName = CHEST_NAMES[config.chestType] || 'Treasure Chest';

        await wait(100);
        let els = getEls();
        
        if (!els.servitor) {
            await wait(500);
            els = getEls();
        }

        if(!els.servitor) return;

        els.carry.innerText = '';
        els.carry.style.display = 'none';

        while(runningRef.current && loopIdRef.current === id) {
            
            if(els.status) els.status.innerText = `${sName || 'The Servitor'} seeks ${sPurpose || 'Result'}...`;
            stopAction();
            
            const isFlying = config.movementType === 'fly';
            const moveClass = isFlying ? 'anim-fly' : 'walk-left';
            els.servitor.classList.add(moveClass);
            if(isFlying) els.servitor.classList.add('fly-left'); 
            
            await moveTo(15, id);
            stopAction();
            if(isFlying) els.servitor.classList.remove('fly-left');
            
            if(!runningRef.current || loopIdRef.current !== id) break;

            els.servitor.classList.add('anim-jump-in');
            await wait(500);
            
            if(els.status) els.status.innerText = `Searching the aether for your ${sPurpose || 'Result'}...`;
            els.mound.classList.add('mound-active'); 
            
            const digTime = 5000 + Math.random() * 5000;
            const steps = Math.floor(digTime / 2000);
            for(let i=0; i<steps; i++) {
                playSound('search'); 
                await wait(2000);
                if(!runningRef.current || loopIdRef.current !== id) break;
            }
            els.mound.classList.remove('mound-active');
            
            playSound('find'); 
            stopAction();
            els.servitor.classList.add('anim-jump-out');
            
            els.carry.innerText = OBJECTS[config.object];
            els.carry.style.display = 'block';

            if(els.head) {
                els.head.classList.remove(config.face);
                els.head.classList.add('face-discovery');
            }

            await wait(500);
            stopAction(); 
            
            if(els.status) els.status.innerText = `${sName || 'The Servitor'} found it! Returning to your ${chestName}...`;
            
            setTimeout(() => {
                if(runningRef.current && loopIdRef.current === id && els.head) {
                    els.head.classList.remove('face-discovery');
                    els.head.classList.add(config.face);
                }
            }, 1500);

            await wait(500);

            stopAction();
            
            const returnClass = isFlying ? 'anim-fly' : 'walk-right';
            els.servitor.classList.add(returnClass);
            if(isFlying) els.servitor.classList.add('fly-right'); 
            
            await moveTo(80, id);
            stopAction();
            if(isFlying) els.servitor.classList.remove('fly-right');
            
            if(!runningRef.current || loopIdRef.current !== id) break;

            if(els.status) els.status.innerText = `Depositing ${sPurpose || 'Result'} into your ${chestName}.`;
            
            els.chestWrapper.classList.add('chest-open');
            
            await wait(300);
            
            els.carry.style.display = 'none';
            els.chestShine.innerText = OBJECTS[config.object];
            els.chestShine.style.display = 'block';
            playSound('deposit'); 
            
            await wait(1500);
            els.chestWrapper.classList.remove('chest-open');
            els.chestShine.style.display = 'none';
            
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
        const duration = type === 'awaken' ? 7000 : 11000;
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
                updateProgressSound(false, 100, type);
                playSound('glitter');
                if(type === 'awaken') completeAwakening();
                if(type === 'feed') completeFeeding();
            } else {
                updateProgressSound(true, p, type);
            }
            setProgress(p);

            if(type === 'feed') {
                 if(Math.random() > 0.7) {
                     setFallingFood(prev => [...prev, {
                         id: Math.random(), 
                         left: 30 + Math.random() * 40, 
                         top: 0
                     }]);
                 }
                 const doc = (globalThis as any).document;
                 const rig = doc ? doc.getElementById('game-rig') : null;
                 if(rig) rig.classList.add('dance-happy');
            }

        }, 30);
    };

    const stopHold = (type: 'awaken' | 'feed') => {
        if(holdIntervalRef.current) {
            clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = null;
        }
        
        updateProgressSound(false, 0, type);
        
        if(type === 'awaken') {
            setIsAwakening(false);
            setAwakenProgress(0);
        }
        if(type === 'feed') {
            setIsFeeding(false);
            setFeedProgress(0);
            setFallingFood([]); 
            const doc = (globalThis as any).document;
            const rig = doc ? doc.getElementById('game-rig') : null;
            if(rig) rig.classList.remove('dance-happy');
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

    const handleEdit = () => {
        setIsRunning(false);
        runningRef.current = false;
        stopAction();
    };

    useEffect(() => {
        return () => { 
            runningRef.current = false; 
            if(holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        };
    }, []);

    const isFeedingActive = hungerState === 'hungry' || isFeeding || hungerState === 'fed';

    return (
        <div className="fixed inset-0 w-full h-full bg-[#0f0f1a] text-[#dcdcdc] overflow-hidden select-none font-sans flex flex-col">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
                
                :root { --bg-color: #0f0f1a; --gold: #FFD700; --indigo: #4b0082; }
                .magick-font { font-family: 'Cinzel', serif; }
                
                .sky-container { position: absolute; top:0; left:0; width:100%; height:100%; z-index: 1; pointer-events: none; overflow: hidden; background: linear-gradient(to bottom, #050510, #1a1a2e); }
                .stars { position: absolute; width: 200%; height: 200%; top: -50%; left: -50%; background-image: radial-gradient(white 1px, transparent 1px); background-size: 50px 50px; opacity: 0.3; animation: sky-rotate 200s linear infinite; }
                @keyframes sky-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .moon { position: absolute; top: 10%; right: 20%; width: 150px; height: 150px; background: radial-gradient(circle at 30% 30%, #fff, #ddd 80%, #aaa 100%); border-radius: 50%; box-shadow: 0 0 50px rgba(255,255,255,0.2); opacity: 0.8; }
                .castle { position: absolute; bottom: 15vh; right: 5%; width: 300px; height: 200px; background: #08080c; z-index: 5; opacity: 0.6; clip-path: polygon(10% 100%, 10% 60%, 5% 60%, 5% 40%, 15% 20%, 25% 40%, 25% 60%, 30% 60%, 30% 50%, 40% 30%, 50% 50%, 60% 30%, 70% 50%, 75% 60%, 75% 30%, 85% 10%, 95% 30%, 95% 100%); }
                .vine { position: absolute; top: -20px; width: 5px; background: #0b1a0b; border-radius: 0 0 10px 10px; z-index: 10; opacity: 0.7; }
                .vine::after { content:''; position: absolute; top: 30px; left: -10px; width: 20px; height: 10px; background: #1a2e1a; border-radius: 20px 0 20px 0; box-shadow: 0 50px 0 #1a2e1a, 10px 100px 0 #1a2e1a; }
                .v1 { height: 30vh; left: 10%; animation: vine-sway 5s infinite ease-in-out; }
                .v2 { height: 20vh; left: 90%; animation: vine-sway 7s infinite ease-in-out reverse; }
                @keyframes vine-sway { 0%,100%{transform:rotate(2deg);} 50%{transform:rotate(-2deg);} }
                .wisp { position: absolute; width: 4px; height: 4px; background: #aaffff; border-radius: 50%; box-shadow: 0 0 10px #aaffff; opacity: 0.6; animation: wisp-fly 15s infinite linear; }
                @keyframes wisp-fly { 0% { transform: translate(0,0); opacity: 0; } 20% { opacity: 0.8; } 80% { opacity: 0.8; } 100% { transform: translate(100vw, -50vh); opacity: 0; } }
                #ground { position: absolute; bottom: 0; width: 100%; height: 15vh; background: linear-gradient(to top, #08080c, #151520); border-top: 2px solid #333; z-index: 20; box-shadow: 0 -10px 50px rgba(0,0,0,0.8); }
                
                /* RIGGING */
                .servitor-root { position: absolute; bottom: calc(15vh - 5px); left: 20%; width: 0; height: 0; z-index: 30; transition: left 0.1s linear, opacity 0.5s; }
                .servitor-rig { position: relative; width: 60px; height: 130px; transform-origin: center bottom; left: -30px; top: -130px; }
                .skin { background-color: #f1c27d; } .clothes { background-color: #333; }
                .head { width: 42px; height: 42px; border-radius: 50%; position: absolute; top: 0; left: 9px; z-index: 10; transition: transform 0.2s; }
                
                .beard { position: absolute; background-color: #444; z-index: 12; display: none; }
                .beard.goatee { top: 38px; left: 16px; width: 10px; height: 12px; border-radius: 0 0 5px 5px; display: block; }
                .beard.full { top: 22px; left: 2px; width: 38px; height: 22px; border-radius: 5px 5px 20px 20px; display: block; }
                
                .body { position: absolute; top: 35px; left: 13px; z-index: 5; }
                /* Chest Symbol */
                .chest-sigil { position: absolute; top: 12px; left: 0; width: 100%; text-align: center; font-size: 14px; opacity: 0.7; z-index: 6; pointer-events: none; }

                /* NEW WINGS (Centered & Fairy Like - Updated) */
                .wings-container { 
                    position: absolute; 
                    top: 50px; 
                    left: 30px; 
                    width: 0; height: 0; 
                    z-index: 0; 
                    display: none; 
                }
                .wing-shape { 
                    position: absolute; 
                    width: 70px; /* Wider */
                    height: 100px; /* Taller */
                    top: -50px;
                    border: 1px solid silver; 
                    background: rgba(200, 255, 255, 0.4); 
                    transform-origin: center center;
                    /* Pointy top, flared bottom lobe for visibility behind body */
                    clip-path: polygon(0% 50%, 90% 0%, 100% 40%, 80% 50%, 100% 70%, 80% 100%, 0% 80%);
                }
                .wing.left { 
                    left: -65px; 
                    transform: scaleX(-1) rotate(10deg); 
                    animation: wing-flap-l 0.8s infinite ease-in-out; 
                }
                .wing.right { 
                    left: -5px; 
                    transform: rotate(10deg); 
                    animation: wing-flap-r 0.8s infinite ease-in-out; 
                }
                @keyframes wing-flap-r { 
                    0% { transform: rotate(10deg) scaleX(1); } 
                    50% { transform: rotate(35deg) scaleX(0.7); } 
                    100% { transform: rotate(10deg) scaleX(1); } 
                }
                @keyframes wing-flap-l { 
                    0% { transform: scaleX(-1) rotate(10deg) scaleX(1); } 
                    50% { transform: scaleX(-1) rotate(35deg) scaleX(0.7); } 
                    100% { transform: scaleX(-1) rotate(10deg) scaleX(1); } 
                }
                
                .outfit-tunic .body { width: 34px; height: 50px; border-radius: 8px 8px 4px 4px; }
                .outfit-robe .body { width: 38px; height: 85px; left: 11px; border-radius: 15px 15px 2px 2px; clip-path: polygon(10% 0, 90% 0, 100% 100%, 0% 100%); }
                .outfit-armor .body { width: 40px; height: 55px; left: 10px; border-radius: 5px; border: 1px solid #666; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); }
                .outfit-armor .body::after { content:''; position: absolute; bottom: -5px; left: -2px; width: 44px; height: 15px; background: inherit; z-index: 6; border-radius: 4px; }
                .leg { width: 13px; height: 28px; position: absolute; top: 75px; transform-origin: top center; border-radius: 6px; }
                .leg.left { left: 15px; z-index: 2; filter: brightness(0.7); }
                .leg.right { left: 32px; z-index: 6; }
                .outfit-robe .leg { display: none; }
                .calf { width: 11px; height: 30px; background: inherit; position: absolute; top: 22px; left: 1px; transform-origin: top center; border-radius: 4px; }
                .foot { width: 19px; height: 10px; background: #111; position: absolute; bottom: -5px; left: -8px; border-radius: 15px 2px 2px 5px; transform: rotate(0deg); transition: border-radius 0.1s, left 0.1s; }
                .arm { width: 11px; height: 42px; position: absolute; top: 40px; border-radius: 6px; transform-origin: 5px 5px; }
                .arm.left { left: 5px; z-index: 2; filter: brightness(0.8); } .arm.right { right: 5px; z-index: 15; } 
                .hand { width: 9px; height: 10px; position: absolute; bottom: -8px; left: 1px; border-radius: 4px; }
                .hair-back { position: absolute; top: 5px; left: 5px; width: 50px; height: 40px; border-radius: 20px 20px 10px 10px; z-index: 1; display: none; }
                .hair-back.long { display: block; height: 90px; }
                .hair-back.afro { display: block; width: 60px; height: 60px; top: -5px; left: 0px; border-radius: 50%; background-image: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent), radial-gradient(circle at 70% 60%, rgba(0,0,0,0.2), transparent); background-color: inherit; }
                .hair-front { position: absolute; top: -2px; left: 9px; width: 42px; height: 15px; border-radius: 20px 20px 0 0; z-index: 11; }
                .hair-front.bald { display: none; }
                .hair-front.afro { top: -10px; height: 25px; border-radius: 50% 50% 0 0; background-image: radial-gradient(circle at 50% 20%, rgba(255,255,255,0.1), transparent); background-color: inherit; }
                .face-container { position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index: 15; }
                .eye { position: absolute; top: 18px; width: 4px; height: 4px; background: #000; border-radius: 50%; }
                .eye.l { left: 10px; } .eye.r { right: 10px; }
                .mouth { position: absolute; bottom: 10px; left: 16px; width: 10px; height: 2px; background: #000; transition: all 0.2s; }
                .face-happy .mouth { height: 6px; border-radius: 0 0 10px 10px; background: #500; }
                .face-determined .eye { height: 2px; width: 6px; transform: rotate(15deg); } .face-determined .eye.r { transform: rotate(-15deg); }
                .face-stoic .mouth { width: 10px; height: 2px; background: #333; }
                .face-discovery .eye { width: 5px; height: 5px; top: 16px; }
                .face-discovery .mouth { height: 10px; width: 14px; left: 14px; bottom: 8px; border-radius: 0 0 15px 15px; background: #d00; border: 1px solid #000; }
                
                .hat-container { position: absolute; width: 100%; height: 100%; z-index: 50; pointer-events: none; }
                .hat-wizard { position: absolute; top: -45px; left: -5px; width: 0; height: 0; border-left: 35px solid transparent; border-right: 35px solid transparent; border-bottom: 60px solid var(--indigo); z-index: 55; }
                .hat-wizard::after { content: '✦'; color: var(--gold); font-size: 10px; position: absolute; top: 20px; left: -5px; }
                .hat-wizard::before { content: ''; position: absolute; bottom: -60px; left: -35px; width: 70px; height: 8px; background: var(--indigo); border-radius: 50%; }
                .hat-crown { position: absolute; top: -15px; left: 6px; width: 48px; height: 15px; background: var(--gold); border-radius: 5px; box-shadow: inset 0 0 5px rgba(0,0,0,0.3); z-index: 55; }
                .hat-crown::after { content:''; position: absolute; top: -10px; left: 0; width: 100%; height: 10px; background: repeating-linear-gradient(45deg, var(--gold), var(--gold) 5px, transparent 5px, transparent 10px); clip-path: polygon(0 100%, 10% 0, 20% 100%, 30% 0, 40% 100%, 50% 0, 60% 100%, 70% 0, 80% 100%, 90% 0, 100% 100%); }
                .hat-horns .horn { position: absolute; top: -12px; width: 8px; height: 25px; background: #d00; border-radius: 50% 50% 0 0; z-index: 55; }
                .hat-horns .horn.l { left: 8px; transform: rotate(-15deg); clip-path: polygon(0 100%, 50% 0, 100% 100%); } .hat-horns .horn.r { right: 8px; transform: rotate(15deg); clip-path: polygon(0 100%, 50% 0, 100% 100%); }
                .hat-hood { position: absolute; top: -8px; left: 2px; width: 56px; height: 58px; background: #222; border-radius: 30px 30px 10px 10px; z-index: 55; mask: radial-gradient(circle at 50% 45%, transparent 18px, black 19px); -webkit-mask: radial-gradient(circle at 50% 45%, transparent 18px, black 19px); opacity: 1; }
                .hat-hood::before { content: ''; position: absolute; bottom: 0; left: 10px; width: 36px; height: 15px; background: #222; z-index: -1; border-radius: 0 0 10px 10px; }
                .hat-diadem { position: absolute; top: 10px; left: 6px; width: 48px; height: 10px; border-top: 3px solid #0ff; border-radius: 50% 50% 0 0; z-index: 60; }
                .hat-halo { position: absolute; top: -15px; left: 10px; width: 40px; height: 10px; border: 3px solid gold; border-radius: 50%; transform: rotateX(60deg); z-index: 60; }
                
                .tool-hand { position: absolute; bottom: 0; left: 0; transform-origin: center bottom; }
                .tool-carry { position: absolute; top: 50px; left: -5px; z-index: 200; font-size: 26px; filter: drop-shadow(0 0 5px white); display: none; }
                .css-wand { width: 3px; height: 50px; background: #6d4c41; transform: rotate(-15deg) translateY(10px); position: relative; }
                .css-wand::after { content:''; position: absolute; top: -2px; left: -2px; width: 7px; height: 7px; background: #b2dfdb; border-radius: 50%; box-shadow: 0 0 10px #fff; }
                
                /* PROPS */
                .mound { position: absolute; bottom: calc(15vh - 2px); left: 10%; width: 90px; height: 40px; background: #2e1a12; border-radius: 50% 50% 0 0; z-index: 25; box-shadow: inset 0 10px 20px rgba(0,0,0,0.8); border: 2px solid #1a0f0a; border-bottom: none; overflow: visible; transform-origin: bottom center; }
                .mound-spiral { position: absolute; top: -20px; left: 20px; width: 50px; height: 50px; border: 2px dashed #a020f0; border-radius: 50%; opacity: 0; pointer-events: none; }
                .mound-active { animation: mound-breathe 1.5s infinite ease-in-out; }
                .mound-active .mound-spiral { animation: spiral-spin 2s infinite linear; opacity: 0.6; }
                @keyframes mound-breathe { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
                @keyframes spiral-spin { 0% { transform: rotate(0deg) scale(0.5); opacity: 0; } 50% { opacity: 0.8; } 100% { transform: rotate(360deg) scale(1.5); opacity: 0; } }
                
                #chest-container { position: absolute; bottom: 15vh; right: 10%; z-index: 20; display: flex; flex-direction: column; align-items: center; }
                .chest-wrapper { position: relative; width: 75px; height: 50px; perspective: 400px; }
                
                /* Default Chest */
                .chest-default .chest-base { width: 100%; height: 100%; background: #8B4513; border: 3px solid #FFD700; border-radius: 2px 2px 4px 4px; position: relative; box-shadow: 0 0 10px rgba(0,0,0,0.5); background: linear-gradient(90deg, #8B4513 10%, #5D4037 20%, #8B4513 30%); }
                .chest-default .chest-lid { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #8B4513; border: 3px solid #FFD700; border-bottom: 1px solid #FFD700; border-radius: 10px 10px 0 0; transform-origin: top center; transition: transform 0.4s ease-in-out; z-index: 10; }
                .chest-default .chest-seal { position: absolute; width: 12px; height: 12px; background: #FFD700; clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%); }
                .chest-default .chest-seal.left { bottom: 10px; left: 15px; z-index: 11; } .chest-default .chest-seal.right { bottom: 10px; right: 15px; z-index: 11; }
                .chest-default .chest-interior { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #1a0505; display: flex; justify-content: center; align-items: center; z-index: 1; }
                .chest-default.chest-open .chest-lid { transform: rotateX(-110deg); }

                /* Portal Chest */
                .chest-portal { width: 80px; height: 80px; bottom: 20px; }
                .chest-portal .chest-base { position: absolute; top:0; left:0; width:100%; height:100%; border-radius: 50%; background: radial-gradient(circle, #fff, #a0f, #000); animation: portal-spin 5s infinite linear; border: 2px solid #fff; box-shadow: 0 0 20px #a0f; opacity: 0.8; }
                .chest-portal.chest-open .chest-base { animation: portal-spin 0.5s infinite linear; filter: brightness(1.5); }
                @keyframes portal-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .chest-portal .chest-lid, .chest-portal .chest-seal { display: none; }
                .chest-portal .chest-interior { position: absolute; top:0; left:0; width:100%; height:100%; display: flex; justify-content: center; align-items: center; z-index: 10; }

                /* Cave Chest */
                .chest-cave { width: 90px; height: 70px; }
                .chest-cave .chest-base { position: absolute; bottom:0; left:0; width:100%; height:100%; background: #222; clip-path: polygon(10% 100%, 0% 50%, 20% 10%, 50% 0%, 80% 10%, 100% 50%, 90% 100%); box-shadow: inset 10px -10px 20px rgba(0,0,0,0.8); }
                .chest-cave .chest-lid { display: none; }
                .chest-cave .chest-interior { position: absolute; bottom:0; left: 20%; width: 60%; height: 60%; background: #000; border-radius: 50% 50% 0 0; display: flex; justify-content: center; align-items: flex-end; padding-bottom: 10px; z-index: 2; box-shadow: inset 0 0 10px #000; transition: background 0.5s; }
                .chest-cave.chest-open .chest-interior { background: radial-gradient(circle at bottom, #f00 10%, #000 80%); }

                /* Pond Chest */
                .chest-pond { width: 100px; height: 30px; transform: scaleY(0.7); bottom: 10px; }
                .chest-pond .chest-base { width: 100%; height: 100%; background: radial-gradient(ellipse at center, #00f, #003); border: 2px solid #55f; border-radius: 50%; box-shadow: 0 0 20px #00f; }
                .chest-pond .chest-lid { display: none; }
                .chest-pond .chest-interior { position: absolute; top: -20px; left: 0; width: 100%; height: 50px; display: flex; justify-content: center; align-items: center; z-index: 10; transform: scaleY(1.4); }
                .chest-pond.chest-open .chest-base { box-shadow: 0 0 40px #aaf; background: radial-gradient(ellipse at center, #aaf, #00f); }

                .chest-shine { font-size: 24px; animation: pulse 1s infinite; display: none; }
                @keyframes pulse { 0% { opacity:0.5; } 100% { opacity:1; scale: 1.2; } }

                /* ANIMATIONS */
                .anim-jump-in { animation: jump-in 0.5s forwards; }
                @keyframes jump-in { 0% { transform: translateY(0) scale(1); opacity: 1; } 50% { transform: translateY(-40px) scale(0.8); opacity: 1; } 100% { transform: translateY(20px) scale(0.1); opacity: 0; } }
                .anim-jump-out { animation: jump-out 0.5s forwards; }
                @keyframes jump-out { 0% { transform: translateY(20px) scale(0.1); opacity: 0; } 50% { transform: translateY(-40px) scale(0.8); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
                
                /* FLYING ANIMATION (LEGS FIXED & SWAPPED) */
                .anim-fly .servitor-rig { animation: fly-hover 1.5s infinite ease-in-out; }
                
                /* Moving Left (To Search) - Legs Swapped to point Left/Down */
                .anim-fly.fly-left .leg { transform: rotate(-30deg); }
                .anim-fly.fly-left .foot { transform: rotate(-20deg); }
                
                /* Moving Right (To Chest) - Legs Swapped to point Right/Down */
                .anim-fly.fly-right .leg { transform: rotate(30deg); }
                .anim-fly.fly-right .foot { transform: rotate(20deg); }
                
                @keyframes fly-hover { 0%, 100% { transform: translateY(-30px); } 50% { transform: translateY(-40px); } }

                .walk-left .leg.left { animation: thigh-l 0.8s infinite linear; } .walk-left .leg.left .calf { animation: calf-l 0.8s infinite linear; }
                .walk-left .leg.right { animation: thigh-r 0.8s infinite linear; } .walk-left .leg.right .calf { animation: calf-r 0.8s infinite linear; }
                .walk-left .servitor-rig { animation: walk-bob 0.8s infinite ease-in-out; }
                .walk-left .arm.left { animation: arm-swing 0.8s infinite ease-in-out; } .walk-left .arm.right { animation: arm-swing 0.8s infinite ease-in-out reverse; }
                @keyframes thigh-l { 0% { transform: rotate(-10deg); } 50% { transform: rotate(20deg); } 100% { transform: rotate(-10deg); } }
                @keyframes calf-l { 0% { transform: rotate(-40deg); } 50% { transform: rotate(0deg); } 100% { transform: rotate(-40deg); } }
                @keyframes thigh-r { 0% { transform: rotate(20deg); } 50% { transform: rotate(-10deg); } 100% { transform: rotate(20deg); } }
                @keyframes calf-r { 0% { transform: rotate(0deg); } 50% { transform: rotate(-40deg); } 100% { transform: rotate(0deg); } }
                @keyframes walk-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
                @keyframes arm-swing { 0% { transform: rotate(-25deg); } 50% { transform: rotate(25deg); } 100% { transform: rotate(-25deg); } }
                .walk-right .foot { border-radius: 2px 15px 5px 2px; left: 0px; }
                .walk-right .leg.left { animation: thigh-l-right 0.8s infinite linear; } .walk-right .leg.left .calf { animation: calf-l-right 0.8s infinite linear; }
                .walk-right .leg.right { animation: thigh-r-right 0.8s infinite linear; } .walk-right .leg.right .calf { animation: calf-r-right 0.8s infinite linear; }
                .walk-right .servitor-rig { animation: walk-bob 0.8s infinite ease-in-out; }
                .walk-right .arm.left { animation: arm-swing 0.8s infinite ease-in-out; } .walk-right .arm.right { animation: arm-swing 0.8s infinite ease-in-out reverse; }
                @keyframes thigh-l-right { 0% { transform: rotate(10deg); } 50% { transform: rotate(-20deg); } 100% { transform: rotate(10deg); } }
                @keyframes calf-l-right { 0% { transform: rotate(40deg); } 50% { transform: rotate(0deg); } 100% { transform: rotate(40deg); } }
                @keyframes thigh-r-right { 0% { transform: rotate(-20deg); } 50% { transform: rotate(10deg); } 100% { transform: rotate(-20deg); } }
                @keyframes calf-r-right { 0% { transform: rotate(0deg); } 50% { transform: rotate(40deg); } 100% { transform: rotate(0deg); } }

                /* DANCE ANIMATION FOR FEEDING - REVERSED ARMS */
                .dance-happy .servitor-rig { animation: dance-bob 0.5s infinite ease-in-out; }
                .dance-happy .arm { animation: arm-cheer 0.5s infinite alternate !important; }
                .dance-happy .head { animation: head-bop 0.5s infinite alternate; }
                .dance-happy .mouth { height: 6px; border-radius: 0 0 10px 10px; background: #d00; } /* Force Smile */
                @keyframes dance-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                /* Inverted rotation for left sway: positive instead of negative */
                @keyframes arm-cheer { 0% { transform: rotate(60deg); } 100% { transform: rotate(80deg); } }
                @keyframes head-bop { 0% { transform: rotate(-5deg); } 100% { transform: rotate(5deg); } }

                .falling-food {
                    position: absolute;
                    font-size: 20px;
                    animation: fall-down 1.5s linear forwards;
                    z-index: 100;
                }
                @keyframes fall-down { 0% { opacity: 0; transform: translateY(0) rotate(0deg); } 20% { opacity: 1; } 100% { opacity: 0; transform: translateY(150px) rotate(360deg); } }

                /* Awakening Sparkles */
                .awaken-overlay {
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: radial-gradient(circle, rgba(255,215,0,0.2), transparent 70%);
                    z-index: 1000;
                    pointer-events: none;
                    animation: pulse-overlay 1.5s infinite;
                }
                @keyframes pulse-overlay { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
            `}</style>

            {/* Exit Button */}
            <button 
                onClick={handleSafeExit} 
                className="absolute top-6 right-6 z-50 text-gray-500 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>

            {/* Bottom Controls Container */}
            {isRunning && !isFeedingActive && (
                <div className="absolute bottom-6 left-0 w-full px-4 z-50 flex items-end justify-between pointer-events-none">
                    
                    {/* Left: Edit Ritual */}
                    <button 
                        onClick={handleEdit}
                        className="pointer-events-auto border border-[#FFD700] text-[#FFD700] bg-black/50 px-4 py-2 text-xs uppercase hover:bg-[#FFD700]/20 tracking-widest whitespace-nowrap"
                    >
                        Edit Ritual
                    </button>

                    {/* Center: Counter */}
                    <div className="pointer-events-auto animate-in fade-in zoom-in duration-700 max-w-[40%] flex flex-col items-center">
                         <div className="bg-[#08080c]/80 border border-[#FFD700]/50 rounded px-3 py-1 shadow-[0_0_10px_rgba(0,0,0,0.8)] backdrop-blur-sm flex flex-col items-center w-full">
                             <p className="magick-font text-[#FFD700] text-[10px] tracking-widest uppercase opacity-80 mb-0.5 truncate w-full text-center">
                                {sPurpose || 'Treasures'} Found
                             </p>
                             <p className="text-sm text-white font-bold drop-shadow-[0_0_5px_#FFD700] leading-none">
                                 {depositCount}
                             </p>
                         </div>
                    </div>

                    {/* Right: Fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        className="pointer-events-auto text-gray-500 hover:text-white bg-black/30 p-2 rounded-full border border-gray-700 hover:border-gray-500"
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                </div>
            )}

            {/* Background */}
            <div className="sky-container">
                <div className="stars"></div>
                <div className="moon"></div>
                <div className="castle"></div>
                <div className="vine v1"></div>
                <div className="vine v2"></div>
                <div className="wisp" style={{top:'50%', left:'20%', animationDuration: '20s'}}></div>
                <div className="wisp" style={{top:'30%', left:'70%', animationDuration: '25s', animationDelay: '2s'}}></div>
                <div className="wisp" style={{top:'70%', left:'50%', animationDuration: '18s', animationDelay: '5s'}}></div>
            </div>

            {/* Config Panel */}
            <div className={`absolute top-0 left-0 w-full h-full bg-[#08080c]/98 z-300 flex flex-col overflow-y-auto p-5 transition-opacity duration-500 ${isRunning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{zIndex: 300}}>
                <div className="max-w-[600px] mx-auto w-full flex flex-col gap-4 pb-12">
                    <div className="text-center border-b border-[#FFD700] pb-4">
                        <h2 className="text-[#FFD700] uppercase tracking-widest text-2xl magick-font">Grimoire of Servitors</h2>
                        <p className="text-[#FFD700]/70 uppercase tracking-widest text-sm font-serif mt-1">Your Servants of Magick</p>
                    </div>
                    
                    {/* WITCH CABINET & WALLET */}
                    {user && (
                        <div className="p-4 bg-gray-900/50 rounded border border-[#FFD700]/40 space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm uppercase text-[#FFD700] tracking-wide font-bold flex items-center gap-2">
                                    <BookOpen size={16} /> Servitor Cabinet
                                </h3>
                                {wallet && (
                                    <span className="text-xs font-mono text-purple-400">
                                        Aether: {wallet.isUnlimited ? "∞" : wallet.credits}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2 mb-4">
                                <button onClick={handleBindToGrimoire} className="flex-1 bg-black/40 hover:bg-[#FFD700]/20 border border-[#FFD700]/50 text-[#FFD700] py-2 rounded text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-colors">
                                    <Save size={14} /> Bind ({COST_BIND_SERVITOR} Credits)
                                </button>
                            </div>
                            
                            <div className="max-h-32 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {loadingCabinet ? (
                                    <p className="text-xs text-center text-gray-500 italic">Opening cabinet...</p>
                                ) : savedServitors.length === 0 ? (
                                    <p className="text-xs text-center text-gray-500 italic">No servitors bound yet.</p>
                                ) : (
                                    savedServitors.map(s => (
                                        <div key={s.id} className="group flex justify-between items-center bg-gray-950 p-2 rounded border border-gray-800 hover:border-[#FFD700] cursor-pointer transition-all" onClick={() => handleLoad(s)}>
                                            <div>
                                                <p className="text-sm text-gray-200 font-medium group-hover:text-[#FFD700]">{s.name}</p>
                                                {s.purpose && <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{s.purpose}</p>}
                                            </div>
                                            <button 
                                                onClick={(e) => handleDelete(s.id, e)}
                                                className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Preview Rig */}
                    <div className="bg-[radial-gradient(circle_at_center,#2b1055_0%,#000_100%)] border border-[#FFD700] h-[260px] relative flex justify-center items-center mt-2 shadow-[inset_0_0_20px_#000]">
                         <div id="preview-rig" className="servitor-rig" style={{left: 0, top: 0}}>
                            {/* Wings added behind body with specific z-index and container logic */}
                            <div className="wings-container">
                                <div className="wing-shape wing left"></div>
                                <div className="wing-shape wing right"></div>
                            </div>
                            <div className="hair-back p-hair"></div>
                            <div className="leg left p-clothes"><div className="calf p-clothes"><div className="foot"></div></div></div>
                            <div className="leg right p-clothes"><div className="calf p-clothes"><div className="foot"></div></div></div>
                            <div className="body p-clothes">
                                <div className="chest-sigil"></div>
                            </div>
                            <div className="arm left p-clothes"><div className="hand p-skin"></div></div>
                            <div className="tool-carry" id="p-carry" style={{display:'block', opacity: 0.6}}>✨</div>
                            <div className="head p-skin">
                                <div className="face-container p-face-container">
                                    <div className="eye l"></div><div className="eye r"></div><div className="mouth"></div>
                                </div>
                                <div className="beard p-beard"></div>
                            </div>
                            <div className="hair-front p-hair"></div>
                            <div className="hat-container" id="p-hat-container"></div>
                            <div className="arm right p-clothes"><div className="hand p-skin"></div>
                                <div className="tool-hand" id="p-tool"></div>
                            </div>
                        </div>
                    </div>

                    {/* BASIC INFO */}
                    <div className="grid grid-cols-1 gap-3 bg-white/5 p-3 rounded border border-gray-800">
                        <label className="text-gray-400 text-xs uppercase">Name your servitor</label>
                        <input type="text" value={sName} onChange={e => setSName((e.target as any).value)} placeholder="Name the entity..." className="w-full p-2 bg-[#1a1a25] border border-gray-700 text-white rounded outline-none" />
                    </div>
                    <div className="grid grid-cols-1 gap-3 bg-white/5 p-3 rounded border border-gray-800">
                        <label className="text-gray-400 text-xs uppercase">Desired Outcome</label>
                        <input type="text" value={sPurpose} onChange={e => setSPurpose((e.target as any).value)} placeholder="e.g. Wealth, Protection, Love..." className="w-full p-2 bg-[#1a1a25] border border-gray-700 text-white rounded outline-none" />
                    </div>

                    {/* FEEDING SYSTEM */}
                    <div className="bg-gray-900/80 p-3 rounded border border-red-900/50">
                        <p className="text-[#FFD700] text-xs uppercase tracking-widest mb-3 border-b border-red-900/50 pb-1 flex items-center justify-between">
                            Sustenance Rituals
                            <span className="text-[10px] text-gray-500 cursor-help" title="Servitors require energy to function. Define what they feed on."><Info size={12}/></span>
                        </p>
                        <div className="space-y-3">
                             <div>
                                <label className="text-gray-400 text-[10px] uppercase block mb-1">Your Servitor's Food</label>
                                <input type="text" value={config.foodName} onChange={e => setConfig({...config, foodName: (e.target as any).value})} placeholder="e.g. Appreciation, Head Pats..." className="w-full text-xs p-2 bg-black border border-gray-700 rounded text-gray-300 outline-none" />
                             </div>
                             
                             <div>
                                <label className="text-gray-400 text-[10px] uppercase mb-1 flex justify-between">Food Appearance</label>
                                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar p-1 border border-gray-800 rounded bg-black/50">
                                    {FOOD_ICONS.map(icon => (
                                        <button 
                                            key={icon}
                                            onClick={() => setConfig({...config, foodIcon: icon})}
                                            className={`w-8 h-8 flex items-center justify-center rounded text-lg hover:bg-white/10 ${config.foodIcon === icon ? 'bg-[#FFD700]/20 border border-[#FFD700]' : 'border border-transparent'}`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                             </div>

                             <div>
                                <label className="text-gray-400 text-[10px] uppercase flex mb-1 justify-between">
                                    Feeding Frequency (Deposits)
                                    <span className="text-gray-500">{config.feedFreq} tasks</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="range" 
                                        min="1" max="50" 
                                        value={config.feedFreq} 
                                        onChange={e => setConfig({...config, feedFreq: parseInt((e.target as any).value)})}
                                        className="flex-1 accent-[#FFD700]" 
                                    />
                                    <input 
                                        type="number" 
                                        min="1" max="1000000"
                                        value={config.feedFreq}
                                        onChange={e => setConfig({...config, feedFreq: parseInt((e.target as any).value)})}
                                        className="w-20 text-xs p-1 bg-black border border-gray-700 rounded text-center"
                                    />
                                </div>
                             </div>
                        </div>
                    </div>
                    
                    {/* CHEST SYMBOL SELECTION */}
                    <div className="grid grid-cols-1 gap-3 bg-white/5 p-3 rounded border border-gray-800">
                        <label className="text-gray-400 text-xs uppercase">Chest Sigil</label>
                        <div className="flex gap-2 flex-wrap">
                            {Object.entries(CHEST_SYMBOLS).map(([key, symbol]) => (
                                <button 
                                    key={key}
                                    onClick={() => setConfig({...config, chestSymbol: key})}
                                    className={`w-8 h-8 flex items-center justify-center rounded border ${config.chestSymbol === key ? 'border-[#FFD700] bg-[#FFD700]/20' : 'border-gray-700 hover:border-gray-500'}`}
                                >
                                    {symbol || '-'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <div className="bg-white/5 p-3 rounded border border-gray-800">
                            <label className="text-gray-400 text-xs uppercase block mb-2">Treasure Type</label>
                            <select value={config.object} onChange={e => setConfig({...config, object: (e.target as any).value})} className="w-full p-2 bg-[#1a1a25] border border-gray-700 text-white rounded outline-none">
                                <option value="gold">Gold 💰</option>
                                <option value="heart">Heart ❤️</option>
                                <option value="clover">Clover 🍀</option>
                                <option value="sparkle">Sparkle ✨</option>
                                <option value="health">Health ⚕️</option>
                                <option value="bolt">Lightning ⚡</option>
                                <option value="bulb">Idea 💡</option>
                                <option value="sword">Sword ⚔️</option>
                                <option value="shield">Shield 🛡️</option>
                                <option value="fire">Fire 🔥</option>
                            </select>
                        </div>
                        <div className="bg-white/5 p-3 rounded border border-gray-800">
                            <label className="text-gray-400 text-xs uppercase block mb-2">Master's Name</label>
                            <input type="text" value={uName} onChange={e => setUName((e.target as any).value)} placeholder="Your name..." className="w-full p-2 bg-[#1a1a25] border border-gray-700 text-white rounded outline-none" />
                        </div>
                    </div>

                    {/* MOVEMENT & WINGS */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded border border-gray-800">
                            <label className="text-gray-400 text-xs uppercase block mb-2">Movement</label>
                            <select value={config.movementType} onChange={e => setConfig({...config, movementType: (e.target as any).value})} className="w-full p-2 bg-[#1a1a25] border border-gray-700 text-white rounded outline-none">
                                <option value="walk">Earth Walk</option>
                                <option value="fly">Levitate / Fly</option>
                            </select>
                        </div>
                         <div className="bg-white/5 p-3 rounded border border-gray-800 flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={config.hasWings} onChange={e => setConfig({...config, hasWings: (e.target as any).checked})} className="accent-[#FFD700]" />
                                <span className="text-gray-400 text-xs uppercase">Aetheric Wings</span>
                            </label>
                            {config.hasWings && (
                                <input type="color" value={config.wingColor} onChange={e => setConfig({...config, wingColor: (e.target as any).value})} className="w-full h-6 bg-transparent border-none cursor-pointer" />
                            )}
                        </div>
                    </div>

                    {/* CHEST TYPE */}
                    <div className="grid grid-cols-1 gap-3 bg-white/5 p-3 rounded border border-gray-800">
                        <label className="text-gray-400 text-xs uppercase">Manifestation Portal (Chest)</label>
                        <select value={config.chestType} onChange={e => setConfig({...config, chestType: (e.target as any).value})} className="w-full p-2 bg-[#1a1a25] border border-gray-700 text-white rounded outline-none">
                            <option value="default">Standard Chest 📦</option>
                            <option value="portal">Soul Portal 🌀</option>
                            <option value="cave">Magick Cavern 🗻</option>
                            <option value="pond">Pond of Becoming 💧</option>
                        </select>
                    </div>

                    {/* AUDIO SETTINGS */}
                    <div className="bg-gray-900/80 p-3 rounded border border-purple-500/30">
                        <p className="text-[#FFD700] text-xs uppercase tracking-widest mb-3 border-b border-purple-500/30 pb-1">Ritual Harmonics</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-gray-500 text-[10px] uppercase block mb-1">Search Sound</label>
                                <select value={config.soundSearch} onChange={e => setConfig({...config, soundSearch: (e.target as any).value})} className="w-full text-xs p-1 bg-black border border-gray-700 rounded text-gray-300">
                                    <option value="rumble">Steady Pulse</option>
                                    <option value="hum">Ethereal Hum</option>
                                    <option value="static">Ethereal Wah</option>
                                    <option value="pulse">Deep Pulse</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-gray-500 text-[10px] uppercase block mb-1">Discovery Sound</label>
                                <select value={config.soundFind} onChange={e => setConfig({...config, soundFind: (e.target as any).value})} className="w-full text-xs p-1 bg-black border border-gray-700 rounded text-gray-300">
                                    <option value="chime">Chime</option>
                                    <option value="wow">Wah-Wah</option>
                                    <option value="laser">Zap</option>
                                    <option value="chord">Harmony</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-gray-500 text-[10px] uppercase block mb-1">Deposit Sound</label>
                                <select value={config.soundDeposit} onChange={e => setConfig({...config, soundDeposit: (e.target as any).value})} className="w-full text-xs p-1 bg-black border border-gray-700 rounded text-gray-300">
                                    <option value="coin">Coin Drop</option>
                                    <option value="angelic">Angelic</option>
                                    <option value="vortex">Vortex</option>
                                    <option value="teleport">Teleport</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* APPEARANCE */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded border border-gray-800">
                            <label className="text-gray-400 text-xs uppercase block mb-2">Outfit</label>
                            <select value={config.outfit} onChange={e => setConfig({...config, outfit: (e.target as any).value})} className="w-full p-2 bg-[#1a1a25] border border-gray-700 text-white rounded outline-none">
                                <option value="outfit-tunic">Tunic</option>
                                <option value="outfit-robe">Robes</option>
                                <option value="outfit-armor">Armor</option>
                            </select>
                        </div>
                        <div className="bg-white/5 p-3 rounded border border-gray-800">
                            <label className="text-gray-400 text-xs uppercase block mb-2">Headgear</label>
                            <select value={config.hat} onChange={e => setConfig({...config, hat: (e.target as any).value})} className="w-full p-2 bg-[#1a1a25] border border-gray-700 text-white rounded outline-none">
                                <option value="none">None</option>
                                <option value="wizard">Starry Hat</option>
                                <option value="hood">Shadow Hood</option>
                                <option value="diadem">Crystal Diadem</option>
                                <option value="crown">Golden Crown</option>
                                <option value="horns">Horns</option>
                                <option value="halo">Halo</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded border border-gray-800">
                            <label className="text-gray-400 text-xs uppercase block mb-2">Skin Tone</label>
                            <input type="color" value={config.skin} onChange={e => setConfig({...config, skin: (e.target as any).value})} className="w-full h-8 bg-transparent border-none cursor-pointer" />
                        </div>
                        <div className="bg-white/5 p-3 rounded border border-gray-800">
                            <label className="text-gray-400 text-xs uppercase block mb-2">Outfit Color</label>
                            <input type="color" value={config.clothes} onChange={e => setConfig({...config, clothes: (e.target as any).value})} className="w-full h-8 bg-transparent border-none cursor-pointer" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded border border-gray-800">
                            <label className="text-gray-400 text-xs uppercase block mb-2">Hair Style</label>
                            <select value={config.hairStyle} onChange={e => setConfig({...config, hairStyle: (e.target as any).value})} className="w-full p-2 bg-[#1a1a25] border border-gray-700 text-white rounded outline-none">
                                <option value="short">Short</option>
                                <option value="long">Long</option>
                                <option value="afro">Curly</option>
                                <option value="bald">Bald</option>
                            </select>
                        </div>
                        <div className="bg-white/5 p-3 rounded border border-gray-800">
                            <label className="text-gray-400 text-xs uppercase block mb-2">Hair Color</label>
                            <input type="color" value={config.hairColor} onChange={e => setConfig({...config, hairColor: (e.target as any).value})} className="w-full h-8 bg-transparent border-none cursor-pointer" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded border border-gray-800">
                            <label className="text-gray-400 text-xs uppercase block mb-2">Beard Style</label>
                            <select value={config.beardStyle} onChange={e => setConfig({...config, beardStyle: (e.target as any).value})} className="w-full p-2 bg-[#1a1a25] border border-gray-700 text-white rounded outline-none">
                                <option value="none">No Facial Hair</option>
                                <option value="goatee">Goatee</option>
                                <option value="full">Full Beard</option>
                            </select>
                        </div>
                        <div className="bg-white/5 p-3 rounded border border-gray-800">
                            <label className="text-gray-400 text-xs uppercase block mb-2">Beard Color</label>
                            <input type="color" value={config.beardColor} onChange={e => setConfig({...config, beardColor: (e.target as any).value})} className="w-full h-8 bg-transparent border-none cursor-pointer" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded border border-gray-800">
                            <label className="text-gray-400 text-xs uppercase block mb-2">Default Mood</label>
                            <select value={config.face} onChange={e => setConfig({...config, face: (e.target as any).value})} className="w-full p-2 bg-[#1a1a25] border border-gray-700 text-white rounded outline-none">
                                <option value="face-stoic">Stoic</option>
                                <option value="face-determined">Determined</option>
                                <option value="face-happy">Content</option>
                            </select>
                        </div>
                        <div className="bg-white/5 p-3 rounded border border-gray-800">
                            <label className="text-gray-400 text-xs uppercase block mb-2">Magick Tool</label>
                            <select value={config.tool} onChange={e => setConfig({...config, tool: (e.target as any).value})} className="w-full p-2 bg-[#1a1a25] border border-gray-700 text-white rounded outline-none">
                                <option value="wand">Wand 🪄</option>
                                <option value="orb">Orb 🔮</option>
                                <option value="sword">Athame 🗡️</option>
                                <option value="key">Key 🗝️</option>
                            </select>
                        </div>
                    </div>

                    {/* AWAKEN BUTTON */}
                    <div className="relative mt-6">
                        {isAwakening && (
                            <div className="absolute -top-10 left-0 w-full text-center">
                                <div className="inline-block bg-black/80 border border-[#FFD700] px-4 py-2 rounded text-[#FFD700] text-sm magick-font animate-pulse">
                                    You are awakening your servitor now...
                                </div>
                            </div>
                        )}
                        <button 
                            onMouseDown={() => startHold('awaken')}
                            onMouseUp={() => stopHold('awaken')}
                            onMouseLeave={() => stopHold('awaken')}
                            onTouchStart={() => startHold('awaken')}
                            onTouchEnd={() => stopHold('awaken')}
                            className="w-full h-16 relative bg-linear-to-b from-[#2a2a35] to-[#1a1a25] border border-[#FFD700] overflow-hidden group active:scale-95 transition-transform"
                        >
                            <div className="absolute top-0 left-0 h-full bg-[#FFD700]/30 transition-all duration-75 ease-linear" style={{width: `${awakenProgress}%`}}></div>
                            <span className="relative z-10 text-[#FFD700] text-lg uppercase tracking-widest font-serif flex items-center justify-center gap-2">
                                Press to Awaken Your Servitor (Free)
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* STAGE */}
            <div id="stage" className="relative flex-1 w-full h-full overflow-hidden z-10">
                
                {/* STATUS BAR */}
                <div id="status-bar" className="absolute top-5 w-full text-center text-xl text-white tracking-widest z-50 shadow-none magick-font pointer-events-none">
                    {hungerState === 'hungry' ? `${sName} is hungry...` : 'Awaiting summoning...'}
                </div>

                 {/* AWAKEN GLITTER & TEXT */}
                {awakenComplete && (
                    <div className="awaken-overlay flex flex-col items-center justify-center z-500">
                         <h1 className="text-4xl md:text-6xl text-[#FFD700] font-bold text-center magick-font drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] animate-bounce">
                             {sName} has awoken
                         </h1>
                         <p className="text-xl text-white mt-4 font-serif italic opacity-80">...and is serving you now.</p>
                    </div>
                )}
                
                {/* FEEDING OVERLAY */}
                {isFeedingActive && (
                    <div className="absolute inset-0 z-200 bg-black/40 flex flex-col items-center justify-center pointer-events-auto">
                        {hungerState === 'fed' ? (
                            <div className="bg-black/90 p-8 rounded border-2 border-[#FFD700] text-center max-w-sm mx-4 shadow-[0_0_30px_#FFD700]">
                                <div className="text-4xl mb-4 animate-spin">✨</div>
                                <h2 className="text-2xl text-[#FFD700] magick-font mb-2">Thank You, Master!</h2>
                                <p className="text-gray-300 mb-6 font-serif">I am revitalized by your {config.foodName}. Shall I resume?</p>
                                <div className="flex gap-4 justify-center">
                                    <button onClick={handleResume} className="bg-[#FFD700] text-black px-6 py-2 rounded font-bold hover:bg-white uppercase tracking-wider">Yes, Resume</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center animate-in fade-in duration-500">
                                <div className="text-[#FFD700] magick-font text-2xl mb-8 text-center drop-shadow-md bg-black/50 px-4 py-2 rounded-full border border-[#FFD700]/30">
                                    {sName} hungers for {config.foodName}...
                                </div>
                                <button
                                    onMouseDown={() => startHold('feed')}
                                    onMouseUp={() => stopHold('feed')}
                                    onMouseLeave={() => stopHold('feed')}
                                    onTouchStart={() => startHold('feed')}
                                    onTouchEnd={() => stopHold('feed')}
                                    className="w-32 h-32 rounded-full border-4 border-[#FFD700] bg-linear-to-br from-purple-900 to-black shadow-[0_0_30px_rgba(255,215,0,0.4)] flex items-center justify-center active:scale-95 transition-transform overflow-hidden relative group"
                                >
                                    <div className="absolute bottom-0 left-0 w-full bg-[#FFD700]/40 transition-all duration-75 ease-linear" style={{height: `${feedProgress}%`}}></div>
                                    <span className="text-4xl z-10 animate-pulse">{config.foodIcon}</span>
                                </button>
                                <p className="mt-4 text-gray-400 text-xs uppercase tracking-widest animate-pulse">Hold for 11 Seconds to Feed</p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* PARTICLES & RIG */}
                {fallingFood.map(f => (
                    <div key={f.id} className="falling-food" style={{left: f.left + '%', top: '10%'}}>
                        {config.foodIcon}
                    </div>
                ))}
                
                 <div className="mound" id="mound"><div className="mound-spiral"></div></div>

                {/* ACTIVE SERVITOR */}
                <div id="servitor" className="servitor-root">
                    <div className="servitor-rig" id="game-rig">
                         <div className="wings-container"><div className="wing-shape wing left"></div><div className="wing-shape wing right"></div></div>
                        <div className="tool-carry" id="game-carry"></div>
                        <div className="hair-back game-hair"></div>
                        <div className="leg left game-clothes"><div className="calf game-clothes"><div className="foot"></div></div></div>
                        <div className="leg right game-clothes"><div className="calf game-clothes"><div className="foot"></div></div></div>
                        <div className="body game-clothes"><div className="chest-sigil"></div></div>
                        <div className="arm left game-clothes"><div className="hand game-skin"></div></div>
                        <div className="head game-skin">
                            <div className="face-container game-face-container"><div className="eye l"></div><div className="eye r"></div><div className="mouth"></div></div>
                            <div className="beard game-beard"></div>
                        </div>
                        <div className="hair-front game-hair"></div>
                        <div className="hat-container" id="game-hat-container"></div>
                        <div className="arm right game-clothes"><div className="hand game-skin"></div>
                            <div className="tool-hand" id="game-tool"></div>
                        </div>
                    </div>
                </div>

                <div id="chest-container">
                    <div className={`chest-wrapper chest-${config.chestType}`} id="chest-wrapper">
                        <div className="chest-lid"></div>
                        <div className="chest-interior"><div className="chest-shine" id="chest-shine">✨</div></div>
                        <div className="chest-base"></div>
                        <div className="chest-seal left"></div><div className="chest-seal right"></div>
                    </div>
                    <div className="mt-1 text-gray-400 text-xs text-center drop-shadow-[0_0_5px_black] magick-font" id="chest-label">
                        {uName || 'Master'}'s {CHEST_NAMES[config.chestType]}
                    </div>
                </div>

                <div id="ground"></div>
            </div>

            {/* --- MODALS --- */}

            {/* BLOCKAGE / INSUFFICIENT FUNDS OVERLAY */}
            <BlockageErrorOverlay 
                error={blockageError}
                onDismiss={() => setBlockageError(null)}
                onGoToStore={handleGoToStoreWithSave}
            />

            {/* EXIT WARNING MODAL */}
            {showExitWarning && (
                <div className="fixed inset-0 z-500 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
                    <div className="bg-[#2a1a1a] border border-red-600/50 p-8 rounded-lg max-w-sm w-full text-center shadow-[0_0_60px_rgba(220,38,38,0.2)]">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-xl font-magical text-red-100 mb-2">Unbound Spirit</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            You have not bound this Servitor. If you leave now, it will be lost to the void forever. Are you sure?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={confirmExit}
                                className="w-full bg-red-900/40 hover:bg-red-800/40 border border-red-600 text-red-100 py-3 uppercase tracking-widest font-magical text-sm transition-colors"
                            >
                                Yes, Leave It Behind
                            </button>
                            <button 
                                onClick={() => setShowExitWarning(false)}
                                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 uppercase tracking-widest font-magical text-sm transition-colors rounded"
                            >
                                Return to Bind
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}