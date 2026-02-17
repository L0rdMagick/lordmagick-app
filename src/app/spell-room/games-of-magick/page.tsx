"use client";

import React from 'react';
import { TraditionButton, TraditionInfo } from '../../components/TraditionButton';

// GAMES LIST
const games: TraditionInfo[] = [
  {
    name: "Craft Work",
    image: "/images/spell-room/craft-work-thumbnail.png",
    isAvailable: true,
    customHref: "/spell-room/games-of-magick/craft-work",
    caption: "A retro-style alchemical adventure. Gather ingredients, brew potions, and defeat the guardians.",
    category: "Game",
    visualTags: "Pixel art wizard brewing a potion in a dungeon"
  }
];

export default function GamesOfMagickPage() {
  return (
    <div className="w-full h-full animate-fade-in p-4 md:p-8 pb-20 relative">
        {/* Back Button */}
        <div className="w-full max-w-[1400px] mx-auto mb-4 px-4">
             <a href="/spell-room" className="inline-flex items-center text-purple-300/70 hover:text-purple-200 transition-colors font-serif italic text-sm md:text-base group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back to Spell Room
            </a>
        </div>

        {/* Header */}
        <div className="w-full max-w-[1400px] mx-auto mb-8 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-md aspect-[4/1]">
                {/* Reusing the thumbnail as a header or just a title if preferred, keeping it consistent with the previous section look */}
                <h1 className="text-3xl md:text-5xl font-serif text-purple-200 text-center drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                    Games of Magick
                </h1>
                <p className="text-purple-300/70 text-center mt-2 font-serif italic">
                    Test your skills in the arcade of arcana
                </p>
            </div>
        </div>

       <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-start justify-center">
        {games.map((game) => (
          <TraditionButton 
            key={typeof game.name === 'string' ? game.name : 'unknown'}
            tradition={game}
          />
        ))}
      </div>
    </div>
  );
}
