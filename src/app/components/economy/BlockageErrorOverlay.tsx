import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Coins } from 'lucide-react';

interface BlockageErrorOverlayProps {
    error: string | null;
    onDismiss: () => void;
    showStoreLink?: boolean;
    redirectPath?: string;
    onGoToStore?: () => void; // Optional direct handler if not using Link
}

export const BlockageErrorOverlay = ({ 
    error, 
    onDismiss, 
    showStoreLink = true,
    redirectPath = '/store',
    onGoToStore
}: BlockageErrorOverlayProps) => {
    
    if (!error) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
             <div className="bg-[#1a1a2e] border border-red-500/50 rounded-xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                {error === "Insufficient Faestones" ? (
                    <>
                        <div className="w-16 h-16 mx-auto mb-4 relative drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse">
                            <Image src="/images/faestones.png" alt="Faestone" layout="fill" objectFit="contain" />
                        </div>
                        <h3 className="text-xl font-serif text-amber-100 mb-2">Your pouch is empty…</h3>
                        <p className="text-purple-200 text-sm mb-6 leading-relaxed">
                            To expand your grimoire, more Faestones are required. Manifest more?
                        </p>
                        <div className="flex flex-col gap-3">
                            {showStoreLink && (
                                onGoToStore ? (
                                    <button 
                                        onClick={onGoToStore}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded uppercase tracking-wider text-xs transition-colors shadow-[0_0_15px_rgba(180,83,9,0.4)]"
                                    >
                                        <div className="w-4 h-4 relative">
                                            <Image src="/images/faestones.png" alt="Token" layout="fill" objectFit="contain" />
                                        </div> 
                                        Manifest Faestones
                                    </button>
                                ) : (
                                    <Link 
                                        href={`/store?redirect=${encodeURIComponent(redirectPath)}`}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded uppercase tracking-wider text-xs transition-colors shadow-[0_0_15px_rgba(180,83,9,0.4)]"
                                    >
                                        <div className="w-4 h-4 relative">
                                            <Image src="/images/faestones.png" alt="Token" layout="fill" objectFit="contain" />
                                        </div> 
                                        Manifest Faestones
                                    </Link>
                                )
                            )}
                            <button onClick={onDismiss} className="text-gray-400 hover:text-white text-xs font-serif italic tracking-wide">
                                Close the Portal
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 mx-auto mb-4 relative drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                            <Image src="/images/faestones.png" alt="Faestone" layout="fill" objectFit="contain" />
                        </div>
                        <h3 className="text-xl font-magical text-red-100 mb-2">A Blockage Found</h3>
                        <p className="text-gray-400 text-sm mb-6">{error}</p>
                        <div className="flex flex-col gap-3">
                            {showStoreLink && (
                                <Link 
                                href={`/store?redirect=${encodeURIComponent(redirectPath)}`}
                                className="w-full bg-amber-600 hover:bg-amber-500 text-black py-3 uppercase tracking-widest font-magical text-xs rounded transition-colors flex items-center justify-center gap-2"
                                >
                                    <div className="w-4 h-4 relative"><Image src="/images/faestones.png" alt="Faestone" layout="fill" objectFit="contain" /></div> Manifest More Faestones
                                </Link>
                            )}
                            <button onClick={onDismiss} className="w-full border border-red-500/50 text-red-300 py-3 uppercase tracking-widest font-magical text-xs hover:bg-red-900/20 transition-colors">
                                Cancel the Ritual
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
