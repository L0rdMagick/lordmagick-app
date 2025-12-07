"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import RoomsButton from '@/app/components/RoomsButton';

// Data configuration for the tools
const psychicTools = [
  {
    title: "The Gaze",
    href: "/the-magick-psychic-school/psychic-training/the-gaze",
    image: "/images/psychic-school/the_gaze_thumb_circle.jpg",
    description: "Ever feel eyes burning into the back of your head? Sharpen that instinct. This tool replicates the psychic weight of a stare, training your awareness to detect exactly when—and by whom—you are being watched or thought of."
  },
  {
    title: "Lie Detector",
    href: "/the-magick-psychic-school/psychic-training/lie-detector",
    image: "/images/psychic-school/truth_or_lie.jpg",
    description: "Become a human polygraph. Truth resonates; lies dissonate. Train your gut to distinguish the pure ring of honesty from the murky vibration of deceit. Never be fooled by a smooth talker again."
  },
  {
    title: "Door Vision",
    href: "/the-magick-psychic-school/psychic-training/door-vision",
    image: "/images/psychic-school/door_vision_thumb.jpg",
    description: "Walls are just a suggestion. Develop your remote viewing abilities to see what lies behind closed doors. Pierce physical barriers with your mind’s eye and reveal what others try to keep hidden."
  },
  {
    title: "Emotional Radar",
    href: "/the-magick-psychic-school/psychic-training/emotional-radar",
    image: "/images/psychic-school/emotional_radar_thumb.jpg",
    description: "Read the room before you even walk in. Every emotion hums with a specific frequency; learn to tune them in. Master the art of detecting hidden feelings and invisible tensions swirling within your relationships and environments."
  },
  {
    title: "Friend or Foe?",
    href: "/the-magick-psychic-school/psychic-training/friend-or-foe",
    image: "/images/psychic-school/friend_or_foe_thumb_circle.jpg",
    description: "Trust your gut? Prove it. Scan faces to intuitively divine who brings light and who harbors toxicity. Train your instincts to instantly recognize the energetic signature of a true ally—or a hidden enemy."
  },
  {
    title: "Senses",
    href: "/the-magick-psychic-school/psychic-training/senses",
    image: "/images/psychic-school/senses_thumb_circle.jpg",
    description: "Expand your sensorium. Is it a color, a texture, or a pulse of life? Engage every subtle sense to profile the unknown, then discover which of your intuitive channels is screaming the loudest."
  },
  {
    title: "Zener ESP",
    href: "/the-magick-psychic-school/psychic-training/zener-esp",
    image: "/images/psychic-school/zener_esp_thumb_circle (1).jpg", 
    description: "Beat the odds. Test your intuition against the cold hard math of probability using the classic Zener cards. Track your stats and prove that your foresight is more than just luck."
  },
  {
    title: "Good vs Evil",
    href: "/the-magick-psychic-school/psychic-training/good-vs-evil",
    image: "/images/psychic-school/good_vs_evil_thumb_circle.jpg",
    description: "The oldest duality: Light and Dark. Train your soul to pierce the veil of appearance and detect the true nature of a spirit. Whether seeking the Angel or spotting the Devil, learn to recognize the energy even when it hides in plain sight."
  }
];

export default function PsychicTrainingPage() {
  return (
    <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8 flex flex-col" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        
        <header className="relative z-20 mb-12 w-full max-w-7xl mx-auto flex flex-col items-center">
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center w-full mb-8">
                <div>
                    <MagickalBackLink href="/the-magick-psychic-school" text="The School" />
                </div>
                <div>
                    <RoomsButton />
                </div>
            </div>

            {/* Psychic Explorer Header Image with Magickal Rotating Frame */}
            <div className="relative group mb-8">
                {/* Rotating Glowing Line Container - Fixed class: bg-linear-to-r */}
                <div className="absolute -inset-[3px] rounded-lg bg-linear-to-r from-transparent via-amber-500 to-transparent opacity-75 blur-sm animate-spin-slow" style={{ animationDuration: '4s' }}></div>
                
                {/* Secondary Static Glow for "Sigil" feel - Fixed class: -inset-px */}
                <div className="absolute -inset-px rounded-lg border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>

                {/* Main Image Container */}
                <div className="relative h-64 w-64 md:h-80 md:w-80 bg-black rounded-lg overflow-hidden border border-amber-900/50">
                    <Image 
                        src="/images/psychic-school/psychic_explorer.jpg" 
                        alt="Psychic Explorer" 
                        fill
                        className="object-cover"
                    />
                    {/* Overlay to darken slightly and integrate with theme - Fixed class: bg-linear-to-t */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                </div>
            </div>

            {/* Title and Description */}
            <h1 className="text-3xl md:text-5xl font-serif text-amber-300 mb-4 text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                Psychic Training
            </h1>
            <p className="text-center text-gray-300 max-w-2xl mx-auto leading-relaxed text-lg">
                Unlock the eye of your mind. Own your ESP and sharpen your sixth sense with tools built for the real world. Tune into the unseen frequencies around you and learn to divine the true nature of any person, situation, or energy.
            </p>
        </header>

        {/* Grid of Tools */}
        <div className="relative z-10 grow flex items-start justify-center pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4">
                
                {psychicTools.map((tool, index) => (
                    <Link key={index} href={tool.href} className="group relative bg-black/40 border border-purple-500/20 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:-translate-y-1">
                        
                        {/* Image Area - Circular Frame */}
                        <div className="h-56 w-full bg-linear-to-b from-gray-900 to-black relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1),transparent)] opacity-40 group-hover:opacity-60 transition-opacity" />
                            
                            {/* Circular Image Container */}
                            <div className="relative z-10 w-40 h-40 rounded-full border-2 border-amber-500/30 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500 group-hover:border-amber-400/60">
                                <Image 
                                    src={tool.image} 
                                    alt={tool.title} 
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Decorative glow below circle */}
                            <div className="absolute bottom-6 w-32 h-1 bg-amber-500/20 blur-md rounded-full group-hover:w-40 transition-all duration-500"></div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6">
                            <h2 className="text-2xl font-serif text-white mb-3 group-hover:text-amber-300 transition-colors">
                                {tool.title}
                            </h2>
                            {/* Fixed class: min-h-20 */}
                            <p className="text-sm text-gray-400 leading-relaxed min-h-20">
                                {tool.description}
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-cyan-500 uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                                Active Training
                            </div>
                        </div>
                    </Link>
                ))}

            </div>
        </div>
    </main>
  );
}