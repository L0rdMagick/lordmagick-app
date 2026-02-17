"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export type Tradition = "Chaos Magick" | "Wicca Magick" | "Ceremonial Magick" | "Folk Magick" | "Hoodoo (Rootwork)" | "Electric Magick" | "Love" | "Grimoire of Magickal Servitors" | "Servitors of the Wild Unknown" | "Craft Work" | "Games of Magick";

export interface TraditionInfo {
  name: Tradition | string; // Allow string for flexibility
  image: string;
  isAvailable: boolean;
  customHref?: string;
  caption: string;
  category: string;
  visualTags: string; 
}

interface TraditionButtonProps {
  tradition: TraditionInfo;
}

const slugifyTradition = (name: string): string => {
  return name.toLowerCase()
    .replace(/ & /g, '-')
    .replace(/ /g, '-')
    .replace(/\(|\)/g, '') + '-spells-app';
};

export const TraditionButton: React.FC<TraditionButtonProps> = ({ tradition }) => {
    const [showMessage, setShowMessage] = useState(false);
    const [isTouched, setIsTouched] = useState(false); 
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showMessage) {
            const timer = setTimeout(() => setShowMessage(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showMessage]);
    
    useEffect(() => {
        if (!isTouched || !containerRef.current) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) {
                setIsTouched(false);
            }
        }, { threshold: 0.1 }); 

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [isTouched]);
    
    const handleInteraction = (e: React.MouseEvent) => {
         if (!tradition.isAvailable) {
            e.preventDefault();
            setShowMessage(true);
            return;
        }

        const hasHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
        
        if (!hasHover && !isTouched) {
            e.preventDefault();
            setIsTouched(true);
        }
    };
    
    const handleMouseLeave = () => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
            setIsTouched(false);
        }
    };

    const href = tradition.customHref || `/spell-room/${slugifyTradition(tradition.name)}`;

    const thumbnailAlt = `${tradition.visualTags} for ${tradition.name} ritual - ${tradition.category} Witchcraft - LordMagick App`;
    const buttonAlt = `Magickal sigil button to initiate the ${tradition.name} - Cast ${tradition.category} ritual now`;

    return (
        <div 
            ref={containerRef}
            className="relative w-full max-w-sm mx-auto flex flex-col items-center"
            onMouseLeave={handleMouseLeave}
        >
            <Link 
                href={href} 
                onClick={handleInteraction}
                className={`group relative block w-full overflow-hidden rounded-xl bg-transparent transition-all duration-300 ${!tradition.isAvailable ? 'cursor-not-allowed grayscale opacity-70' : 'cursor-pointer hover:scale-105 hover:drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]'}`}
                role="button"
                aria-expanded={isTouched} 
                aria-label={`Open ${tradition.name} Ritual`}
            >
                {/* Image Container */}
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <Image
                        src={tradition.image}
                        alt={thumbnailAlt}
                        fill
                        className={`object-cover transition-all duration-700 ease-in-out ${tradition.isAvailable ? (isTouched ? 'opacity-0' : 'group-hover:opacity-0') : ''}`}
                    />
                    
                    {/* OVERLAY */}
                    {tradition.isAvailable && (
                        <div 
                            className={`
                                absolute inset-[1%] rounded-xl
                                transition-transform duration-500 ease-out 
                                z-20 flex flex-col items-center justify-start pointer-events-none 
                                ${isTouched ? 'translate-y-0 pointer-events-auto' : 'translate-y-full group-hover:translate-y-0 group-hover:pointer-events-auto'}
                            `}
                        >
                            <div className="relative w-full h-full flex flex-col items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" style={{ opacity: isTouched ? 1 : undefined }}>
                                <div className="absolute inset-0 z-0">
                                    <Image
                                        src="/images/spell-room/magick-overlay-caption.png"
                                        alt="" 
                                        fill
                                        className="object-fill drop-shadow-xl rounded-xl"
                                    />
                                </div>
                                <div className="relative z-10 w-[80%] h-full flex items-center justify-center pb-[40%] mt-4">
                                    <p className="text-[#3c2f2f] text-center font-serif text-xl md:text-lg leading-snug font-semibold mix-blend-multiply overflow-y-auto max-h-full scrollbar-hide break-words">
                                        {tradition.caption}
                                    </p>
                                </div>
                            </div>

                             {/* Floating Sigil Button */}
                            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 z-30 w-[70%] transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                                <div className="relative w-full aspect-[3/1]">
                                    <Image
                                        src="/images/spell-room/magick-button.png"
                                        alt={buttonAlt}
                                        fill
                                        className="object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* LOCKED STATE */}
                {!tradition.isAvailable && !showMessage && (
                    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 opacity-80 z-10 w-full text-center">
                         <span className="text-gray-400 text-xs uppercase tracking-widest font-serif border-b border-gray-600 pb-1 bg-black/80 px-3 py-1 rounded-full">Locked</span>
                    </div>
                )}
            </Link>

             {/* LABEL */}
             <div className="mt-3 text-center z-10 relative group-hover:text-purple-300 transition-colors duration-300">
                 <h3 className={`font-serif text-lg tracking-wide ${tradition.isAvailable ? 'text-purple-200' : 'text-gray-600'}`} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                     {tradition.name}
                 </h3>
             </div>

            {/* ERROR TOAST */}
            {showMessage && (
                <div className="absolute inset-0 z-50 flex items-center justify-center animate-fade-in pointer-events-none">
                    <div className="bg-black/90 border border-purple-500/50 p-4 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] backdrop-blur-sm text-center transform scale-110 transition-all">
                        <p className="text-purple-200 font-serif text-sm md:text-base italic tracking-wide" style={{ textShadow: '0 0 10px rgba(168,85,247,0.8)' }}>
                            This Ritual is in Preparation
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
