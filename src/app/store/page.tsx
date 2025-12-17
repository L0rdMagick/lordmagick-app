"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Coins, Sparkles, Gem, Check, AlertTriangle, Loader2 } from 'lucide-react';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';
import { useHaptics } from '@/hooks/useHaptics';
import { createBrowserClient } from '@supabase/ssr';

const STORE_ITEMS = [
    {
        id: 'pack_small',
        name: "Handful of Stardust",
        credits: 50,
        price: "$4.99",
        icon: Sparkles,
        color: "text-slate-300",
        border: "border-slate-600",
        glow: "shadow-slate-500/20",
        desc: "Enough for casual divination."
    },
    {
        id: 'pack_medium',
        name: "Vial of Essence",
        credits: 150,
        price: "$12.99",
        icon: Coins,
        color: "text-amber-300",
        border: "border-amber-500",
        glow: "shadow-amber-500/40",
        desc: "Best for regular practitioners.",
        badge: "POPULAR"
    },
    {
        id: 'pack_large',
        name: "Philosopher's Stone",
        credits: 500,
        price: "$39.99",
        icon: Gem,
        color: "text-purple-300",
        border: "border-purple-500",
        glow: "shadow-purple-500/50",
        desc: "For the serious Magus.",
        badge: "BEST VALUE"
    }
];

export default function StorePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const haptics = useHaptics();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

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
            
            // Clear URL params
            router.replace('/store');
        }
    }, [searchParams, haptics, router]);

    const handlePurchase = async (pkgId: string) => {
        setLoadingId(pkgId);
        haptics.triggerMedium();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login?redirect=/store');
                return;
            }

            const response = await fetch('/api/shop/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId: pkgId })
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
        <main className="min-h-screen w-full bg-black bg-[url('/images/grand-hall-bg.png')] bg-cover bg-center flex flex-col relative overflow-hidden font-sans text-gray-200">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0" />
            
            {/* Header */}
            <header className="relative z-10 p-6 flex justify-between items-center border-b border-white/10 bg-black/40">
                <div className="flex items-center gap-4">
                    <MagickalBackLink href="/hall" text="Grand Hall" />
                </div>
                <div className="flex items-center gap-4">
                    <h1 className="text-xl md:text-2xl font-serif text-amber-500 tracking-widest uppercase hidden md:block">
                        Aether Exchange
                    </h1>
                    <RoomsButton />
                </div>
            </header>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-500">
                
                <div className="text-center mb-12 max-w-2xl">
                    <p className="text-sm font-mono text-purple-300 uppercase tracking-[0.2em] mb-4">
                        Transmute Wealth into Will
                    </p>
                    <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 text-shadow-lg">
                        Acquire Aether
                    </h2>
                    <p className="text-gray-400 font-serif text-lg leading-relaxed">
                        Credits power your spells, readings, and bindings. Choose your vessel wisely.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    {STORE_ITEMS.map((pkg) => (
                        <div 
                            key={pkg.id}
                            onClick={() => handlePurchase(pkg.id)}
                            className={`
                                relative group cursor-pointer 
                                bg-black/60 border-2 ${pkg.border} rounded-xl p-8 
                                hover:bg-white/5 transition-all duration-300 
                                hover:scale-105 shadow-2xl hover:${pkg.glow}
                                flex flex-col items-center text-center
                            `}
                        >
                            {pkg.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                    {pkg.badge}
                                </div>
                            )}

                            <pkg.icon size={48} className={`${pkg.color} mb-6 group-hover:animate-pulse transition-transform duration-500 group-hover:rotate-12`} />
                            
                            <h3 className="text-xl font-serif text-white mb-2">{pkg.name}</h3>
                            <div className="text-3xl font-bold font-mono text-white mb-4">
                                {pkg.credits} <span className="text-sm text-gray-500 font-normal">AETHER</span>
                            </div>
                            
                            <p className="text-xs text-gray-400 mb-8 min-h-8">{pkg.desc}</p>
                            
                            <button 
                                disabled={loadingId !== null}
                                className={`
                                    w-full py-3 rounded-lg border ${pkg.border} 
                                    text-white font-mono uppercase tracking-widest text-xs
                                    group-hover:bg-white group-hover:text-black transition-colors
                                    flex items-center justify-center gap-2
                                `}
                            >
                                {loadingId === pkg.id ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                    `Purchase ${pkg.price}`
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-[10px] text-gray-600 font-mono uppercase tracking-widest flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
                    <AlertTriangle size={12} />
                    Transactions secured by Stripe. No refunds on digital essence.
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 p-4">
                    <div className="bg-[#0a0a0a] border border-amber-500 p-8 rounded-2xl max-w-sm w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                        <div className="absolute inset-0 bg-amber-500/10 animate-pulse" />
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500">
                                <Check size={40} className="text-amber-400" />
                            </div>
                            <h2 className="text-2xl font-serif text-white mb-2">Transmutation Complete</h2>
                            <p className="text-gray-400 text-sm mb-8">
                                Your Aether has been replenished. The cosmos awaits your command.
                            </p>
                            <button 
                                onClick={() => setShowSuccess(false)}
                                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase tracking-widest text-xs rounded transition-colors"
                            >
                                Return to Hall
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}