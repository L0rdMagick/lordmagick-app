"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Coins, Sparkles, Gem, Check, AlertTriangle, Loader2 } from 'lucide-react';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';
import { useHaptics } from '@/hooks/useHaptics';
import { createBrowserClient } from '@supabase/ssr';

const STORE_ITEMS = [
    {
        id: 'pack_small',
        name: "Handful of Faestones",
        credits: 50,
        price: "$4.99",
        quantity: 1,
        color: "text-slate-300",
        border: "border-slate-600",
        glow: "shadow-slate-500/20",
        desc: "Enough for Casual Magick"
    },
    {
        id: 'pack_medium',
        name: "A Pouch of Faestones",
        credits: 120,
        price: "$9.99",
        quantity: 3,
        color: "text-amber-300",
        border: "border-amber-500",
        glow: "shadow-amber-500/40",
        desc: "Includes 20 Bonus Faestones!",
        badge: "POPULAR"
    },
    {
        id: 'pack_large',
        name: "A Bag of Faestones",
        credits: 300,
        price: "$19.99",
        quantity: 6,
        color: "text-purple-300",
        border: "border-purple-500",
        glow: "shadow-purple-500/50",
        desc: "For the serious Magus.",
        badge: "BEST VALUE"
    }
];

const FaestonePile = ({ count }: { count: number }) => {
    if (count === 1) {
        return (
            <div className="relative w-14 h-14 mb-1 group-hover:scale-110 transition-transform duration-500">
                <Image src="/images/faestones.png" alt="Faestone: Magickal Currency Token" layout="fill" objectFit="contain" />
            </div>
        );
    }
    
    if (count === 3) {
        return (
            <div className="relative w-28 h-16 mb-1 group-hover:scale-110 transition-transform duration-500">
                <div className="absolute left-0 bottom-0 w-12 h-12 rotate-[-15deg] z-10">
                    <Image src="/images/faestones.png" alt="Faestone: Magickal Currency Token" layout="fill" objectFit="contain" />
                </div>
                <div className="absolute left-7 bottom-1 w-14 h-14 z-20">
                    <Image src="/images/faestones.png" alt="Faestone: Magickal Currency Token" layout="fill" objectFit="contain" />
                </div>
                <div className="absolute right-0 bottom-1 w-12 h-12 rotate-[15deg] z-10">
                    <Image src="/images/faestones.png" alt="Faestone: Magickal Currency Token" layout="fill" objectFit="contain" />
                </div>
            </div>
        );
    }

    if (count === 6) {
        return (
            <div className="relative w-36 h-20 mb-1 group-hover:scale-110 transition-transform duration-500">
                {/* Back Row */}
                <div className="absolute left-2 bottom-4 w-12 h-12 rotate-[-45deg] opacity-90 blur-[1px]">
                     <Image src="/images/faestones.png" alt="Faestone: Magickal Currency Token" layout="fill" objectFit="contain" />
                </div>
                <div className="absolute left-12 bottom-6 w-12 h-12 rotate-[10deg] opacity-90">
                     <Image src="/images/faestones.png" alt="Faestone: Magickal Currency Token" layout="fill" objectFit="contain" />
                </div>
                <div className="absolute right-4 bottom-3 w-12 h-12 rotate-[60deg] opacity-90 blur-[1px]">
                     <Image src="/images/faestones.png" alt="Faestone: Magickal Currency Token" layout="fill" objectFit="contain" />
                </div>
                
                {/* Front Row */}
                 <div className="absolute left-0 bottom-0 w-14 h-14 rotate-[-10deg] z-20">
                     <Image src="/images/faestones.png" alt="Faestone: Magickal Currency Token" layout="fill" objectFit="contain" />
                </div>
                <div className="absolute left-9 -bottom-2 w-16 h-16 z-30 drop-shadow-xl">
                     <Image src="/images/faestones.png" alt="Faestone: Magickal Currency Token" layout="fill" objectFit="contain" />
                </div>
                <div className="absolute right-0 bottom-0 w-14 h-14 rotate-[25deg] z-20">
                     <Image src="/images/faestones.png" alt="Faestone: Magickal Currency Token" layout="fill" objectFit="contain" />
                </div>
            </div>
        );
    }
    return null;
};

export function StoreContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const haptics = useHaptics();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // --- Hybrid Redirect State ---
    const [backupPath, setBackupPath] = useState<string | null>(null);

    // --- Stateless Redirect Handlers ---
    const redirectParam = searchParams.get('redirect');
    const returnToParam = searchParams.get('return_to');
    
    // --- Hybrid Logic: Redundancy ---
    // 1. Save incoming redirect to LS as backup
    // 2. Read from LS if no params found
    useEffect(() => {
        if (redirectParam) {
            localStorage.setItem('aether_return_path', redirectParam);
        } else {
            // Only load backup if we don't have a direct param active
            const saved = localStorage.getItem('aether_return_path');
            if (saved) setBackupPath(saved);
        }
    }, [redirectParam]);

    // Logic: 
    // 1. Post-purchase 'return_to' (Highest Priority - from Stripe)
    // 2. Pre-purchase 'redirect' (High Priority - direct link)
    // 3. Backup State (Fallback - from LS if params stripped)
    const activeReturnPath = returnToParam || redirectParam || backupPath;

    // --- NEW: Handle Redirect Logic ---


    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        if (searchParams.get('success')) {
            setShowSuccess(true);
            haptics.triggerHeavy();
            const audio = new Audio('/audio/sfx-chaos-activate.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {});
        }
    }, [searchParams, haptics]);

    const handleExit = () => {
        setShowSuccess(false);
        localStorage.removeItem('aether_return_path');
        router.replace(activeReturnPath || '/store');
    };

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(handleExit, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess, activeReturnPath, router]);

    const handlePurchase = async (pkgId: string) => {
        setLoadingId(pkgId);
        haptics.triggerMedium();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Determine current full path for redirect
                const currentPath = window.location.pathname + window.location.search;
                router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
                return;
            }

            const response = await fetch('/api/shop/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    packageId: pkgId,
                    returnPath: activeReturnPath // Pass it forward!
                })
            });

            const data = await response.json();
            
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No checkout URL");
            }
        } catch (error) {
            console.error(error);
            alert("The Aether is turbulent. Please try again.");
            setLoadingId(null);
        }
    };

    return (
        <main className="h-screen w-full bg-black bg-[url('/images/grand-hall-bg.png')] bg-cover bg-center flex flex-col relative overflow-hidden font-sans text-gray-200">
            <div className="absolute inset-0 bg-black/20 z-0" />
            
            {/* Header */}
            <header className="relative z-10 p-4 shrink-0 flex justify-between items-center bg-transparent">
                <div className="flex items-center gap-4">
                    <MagickalBackLink 
                        href={activeReturnPath || "/hall"} 
                        text={activeReturnPath ? "Return to Ritual" : "Grand Hall"} 
                    />
                </div>
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-serif text-amber-500 tracking-widest uppercase hidden md:block">
                        Faestone Exchange
                    </h1>
                    <RoomsButton />
                </div>
            </header>

            {/* Content */}
            <div className="relative z-10 flex-1 w-full overflow-y-auto overflow-x-hidden">
                <div className="min-h-full flex flex-col items-center justify-start md:justify-center p-4">
                    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-3 md:gap-4">
                        
                        {/* Title Card */}
                        <div className="text-center w-full max-w-lg bg-indigo-950/60 backdrop-blur-md border border-white/10 p-3 md:p-4 rounded-xl rounded-tl-3xl rounded-br-3xl shadow-2xl shrink-0">
                            <p className="text-[10px] md:text-xs font-mono text-purple-300 uppercase tracking-[0.2em] mb-1">
                                Transmute Wealth into Will
                            </p>
                            <h2 className="text-xl md:text-3xl font-serif text-amber-400 mb-1 text-shadow-lg">
                                Acquire Faestones
                            </h2>
                            <p className="text-gray-400 font-serif text-xs md:text-sm leading-relaxed max-w-sm mx-auto mb-2">
                                Faestones power your spells, readings, and bindings. Choose your vessel wisely.
                            </p>
                            <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest flex items-center justify-center gap-2 opacity-60">
                                <AlertTriangle size={10} />
                                Transactions secured by Stripe. No refunds on digital essence.
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-4xl">
                        {STORE_ITEMS.map((pkg) => (
                            <div 
                                key={pkg.id}
                                onClick={() => handlePurchase(pkg.id)}
                                className={`
                                    relative group cursor-pointer 
                                    bg-black/80 border-2 ${pkg.border} 
                                    rounded-none rounded-tl-2xl rounded-br-2xl p-3
                                    hover:bg-black/90 transition-all duration-300 
                                    hover:scale-[1.02] shadow-2xl hover:${pkg.glow}
                                    flex flex-col items-center text-center
                                `}
                            >
                                {pkg.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-none rounded-tl-lg rounded-br-lg uppercase tracking-widest shadow-lg">
                                        {pkg.badge}
                                    </div>
                                )}

                                <div className="scale-90 origin-center">
                                    <FaestonePile count={pkg.quantity} />
                                </div>
                                
                                <h3 className="text-lg font-serif text-amber-400 mb-0.5">{pkg.name}</h3>
                                <div className="text-xl font-bold font-mono text-amber-400 mb-1">
                                    {pkg.credits} <span className="text-[10px] text-gray-500 font-normal">FAESTONES</span>
                                </div>
                                
                                <p className="text-[10px] text-gray-400 mb-2 min-h-[16px] uppercase tracking-wide">{pkg.desc}</p>
                                
                                <button 
                                    disabled={loadingId !== null}
                                    className={`
                                        w-full py-2 border ${pkg.border} 
                                        text-amber-400 font-mono uppercase tracking-widest text-xs
                                        hover:bg-amber-400 hover:text-black transition-colors
                                        flex items-center justify-center gap-2
                                        rounded-none rounded-tl-lg rounded-br-lg
                                    `}
                                >
                                    {loadingId === pkg.id ? (
                                        <Loader2 className="animate-spin w-4 h-4" />
                                    ) : (
                                        `Acquire ${pkg.price}`
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 p-4">
                    <div className="bg-[#0a0a0a] border border-amber-500 p-8 rounded-2xl max-w-sm w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                        <div className="absolute inset-0 bg-amber-500/10 animate-pulse" />
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500">
                                <div className="w-12 h-12 relative animate-pulse"><Image src="/images/faestones.png" alt="Faestones: Magickal Currency Tokens" layout="fill" objectFit="contain" /></div>
                            </div>
                            <h2 className="text-2xl font-serif text-white mb-2">Transmutation Complete</h2>
                            <p className="text-gray-400 text-sm mb-8">
                                Your Faestones have been replenished. The cosmos awaits your command.
                            </p>
                            <button 
                                onClick={handleExit}
                                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase tracking-widest text-xs rounded transition-colors"
                            >
                                {activeReturnPath ? "Return to Ritual" : "Return to Hall"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function StorePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-amber-500 font-serif animate-pulse">Summoning Store...</div>}>
            <StoreContent />
        </Suspense>
    );
}