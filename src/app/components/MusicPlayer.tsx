"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { AUDIO_TRACKS, AudioTrack, Category } from '../utils/audioTracks';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicPlayer } from '../context/MusicPlayerContext';

// Icons
const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

const NextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
);

const VolumeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const MusicNoteIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// Whitelisted paths
const VISIBLE_PATHS = [
    '/hall',
    '/spell-room',
    '/oracle-room',
    '/the-magick-psychic-school',
    '/magickal-tools'
];

const MusicPlayer = () => {
    const pathname = usePathname();
    
    // Web Audio API Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<AudioTrack>(AUDIO_TRACKS[0]);
    const [volume, setVolume] = useState(0.3);
    const { isExpanded, setIsExpanded } = useMusicPlayer();
    const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
    
    // Visibility Check
    const isVisible = useMemo(() => {
        return VISIBLE_PATHS.some(path => pathname?.startsWith(path));
    }, [pathname]);

    const tracksByCategory = useMemo(() => {
        const groups: Record<string, AudioTrack[]> = {};
        AUDIO_TRACKS.forEach(track => {
            if (!groups[track.category]) groups[track.category] = [];
            groups[track.category].push(track);
        });
        return groups;
    }, []);

    const categories = Object.keys(tracksByCategory) as Category[];

    // Initialize Audio Context with global unlock
    useEffect(() => {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            const gainNode = ctx.createGain();
            gainNode.gain.value = volume;
            gainNode.connect(ctx.destination);
            gainNodeRef.current = gainNode;
        }

        const unlockAudio = () => {
             if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                 audioContextRef.current.resume().then(() => {
                     // If we wanted to ensure play on first click if it failed before:
                     if (isPlaying && !sourceNodeRef.current && audioBufferRef.current) {
                         playBuffer(audioBufferRef.current);
                     }
                 });
             }
             document.removeEventListener('click', unlockAudio);
             document.removeEventListener('keydown', unlockAudio);
             document.removeEventListener('touchstart', unlockAudio);
        };

        document.addEventListener('click', unlockAudio);
        document.addEventListener('keydown', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);

        return () => {
             if (sourceNodeRef.current) {
                 try { sourceNodeRef.current.stop(); } catch(e) {}
             }
             if (audioContextRef.current?.state !== 'closed') {
                 audioContextRef.current?.close();
             }
             document.removeEventListener('click', unlockAudio);
             document.removeEventListener('keydown', unlockAudio);
             document.removeEventListener('touchstart', unlockAudio);
        };
    }, []);

    // Effect to handle track changes & Auto-play on mount
    useEffect(() => {
        // Always try to auto-play, even on first load
        const autoPlay = true; 
        loadAndPlayTrack(currentTrack, autoPlay);
    }, [currentTrack]);


    const togglePlay = () => {
        if (!audioContextRef.current) return;

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        if (isPlaying) {
             if (sourceNodeRef.current) {
                try { sourceNodeRef.current.stop(); } catch(e) {}
             }
             setIsPlaying(false);
        } else {
            if (audioBufferRef.current) {
                playBuffer(audioBufferRef.current);
            } else {
                // Buffer not ready? reload
                loadAndPlayTrack(currentTrack, true);
            }
        }
    };

    // Volume Control
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVol = parseFloat(e.target.value);
        setVolume(newVol);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = newVol;
        }
    };

    const playTrack = (track: AudioTrack) => {
        if (currentTrack.url === track.url) {
            togglePlay();
        } else {
            // New track
            setCurrentTrack(track);
            setIsPlaying(true); // Will be handled by useEffect
        }
    };

    const playNext = () => {
        const currentIndex = AUDIO_TRACKS.findIndex(t => t.url === currentTrack.url);
        const nextIndex = (currentIndex + 1) % AUDIO_TRACKS.length;
        setCurrentTrack(AUDIO_TRACKS[nextIndex]);
        setIsPlaying(true);
    };

    return (
        <>
            <AnimatePresence mode="wait">
                {isVisible && !isExpanded && pathname === '/hall' && (
                    <motion.button
                        key="minimized"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        className="fixed top-6 left-10 z-[9999] w-12 h-12 rounded-full bg-black/80 border border-amber-500/50 text-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-sm cursor-pointer hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-shadow"
                        onClick={() => setIsExpanded(true)}
                    >
                        <div className={`absolute inset-0 rounded-full border border-amber-500/30 ${isPlaying ? 'animate-ping opacity-20' : 'opacity-0'}`} />
                         {isLoading ? <LoadingSpinner /> : <MusicNoteIcon />}
                    </motion.button>
                )}

                {isVisible && isExpanded && (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                         className="fixed top-6 left-4 right-4 md:right-auto md:left-10 md:w-96 z-[9999] bg-black/95 border border-amber-900/50 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-stone-950 to-stone-900 border-b border-amber-900/30 flex items-center justify-between">
                            <div className="flex flex-col overflow-hidden">
                                <h3 className="text-amber-500 font-medieval text-lg truncate pr-2 leading-none">
                                    {currentTrack.name}
                                </h3>
                                <span className="text-stone-500 text-xs uppercase tracking-wider mt-1">{currentTrack.category}</span>
                            </div>
                            <button 
                                onClick={() => setIsExpanded(false)}
                                className="text-stone-400 hover:text-amber-500 transition-colors p-1"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Controls */}
                        <div className="p-4 bg-stone-950/50 space-y-4">
                            <div className="flex items-center justify-center gap-6">
                                {/* Play/Pause */}
                                <button 
                                    onClick={togglePlay}
                                    className="w-10 h-10 rounded-full bg-amber-900/20 border border-amber-700/50 text-amber-500 flex items-center justify-center hover:bg-amber-900/40 hover:scale-105 transition-all"
                                >
                                    {isLoading ? <LoadingSpinner /> : (isPlaying ? <PauseIcon /> : <PlayIcon />)}
                                </button>
                                
                                {/* Next */}
                                <button 
                                    onClick={playNext}
                                    className="text-stone-400 hover:text-amber-500 transition-colors"
                                >
                                    <NextIcon />
                                </button>
                            </div>
                            
                            {/* Volume */}
                            <div className="flex items-center gap-3 px-2">
                                <VolumeIcon />
                                <input 
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-600 hover:[&::-webkit-slider-thumb]:bg-amber-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="px-2 pt-2 pb-1 flex flex-wrap gap-2 justify-center">
                             <button
                                 onClick={() => setActiveCategory('All')}
                                 className={`px-3 py-1 text-xs rounded-full border transition-all whitespace-nowrap ${activeCategory === 'All' ? 'bg-amber-900/30 border-amber-700 text-amber-400' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
                             >
                                 All
                             </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3 py-1 text-xs rounded-full border transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-amber-900/30 border-amber-700 text-amber-400' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Track List */}
                        <div className="flex-1 overflow-y-auto min-h-[150px] p-2 space-y-1 bg-black/60 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                            {(activeCategory === 'All' ? AUDIO_TRACKS : tracksByCategory[activeCategory as Category]).map((track, idx) => {
                                const isCurrent = currentTrack.url === track.url;
                                return (
                                    <button
                                        key={track.url + idx}
                                        onClick={() => playTrack(track)}
                                        className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-sm transition-colors ${
                                            isCurrent 
                                            ? 'bg-amber-900/20 text-amber-400 border border-amber-900/30' 
                                            : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'
                                        }`}
                                    >
                                        <span className="truncate">{track.name}</span>
                                        {isCurrent && isPlaying && (
                                            <span className="flex gap-[2px] items-end h-3 ml-2">
                                                <span className="w-[2px] bg-amber-500 animate-[music-bar_0.6s_ease-in-out_infinite]" />
                                                <span className="w-[2px] bg-amber-500 animate-[music-bar_0.8s_ease-in-out_infinite]" />
                                                <span className="w-[2px] bg-amber-500 animate-[music-bar_0.5s_ease-in-out_infinite]" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <style jsx global>{`
                @keyframes music-bar {
                    0%, 100% { height: 20%; }
                    50% { height: 100%; }
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
};

export default MusicPlayer;
