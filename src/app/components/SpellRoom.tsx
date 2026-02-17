"use client";

import React from 'react';
import { TraditionButton, TraditionInfo } from './TraditionButton';

// REORDERED LIST based on request with NEW SEO DATA & CAPTIONS
const traditions: TraditionInfo[] = [
  {
    name: "Wicca Magick",
    image: "/images/spell-room/wicca-witchcraft-magick-button.png",
    isAvailable: true,
    caption: "Interactive Wiccan altar for circle casting, deity invocation, and elemental spellwork.",
    category: "Wiccan",
    visualTags: "Glowing pentacle and ritual candles on a wooden altar"
  },
  {
    name: "Hoodoo (Rootwork)",
    image: "/images/spell-room/hoodoo-magick-button.png",
    isAvailable: true,
    caption: "Traditional Rootwork and Voodoo Lwa service with Psalm divination and jar fixing.",
    category: "Hoodoo",
    visualTags: "Antique mojo bag, burning candles, and petition paper"
  },
  {
    name: "Grimoire of Magickal Servitors",
    image: "/images/spell-room/servitor-magick.png", 
    isAvailable: true,
    customHref: "/spell-room/grimoire-of-digital-servitors",
    caption: "Design, program, and bind custom digital spirit servitors to do your bidding.",
    category: "Chaos",
    visualTags: "Glowing cybernetic spirit construct in a digital containment field"
  },
  {
    name: "Servitors of the Wild Unknown",
    image: "/images/spell-room/servitors-of-the-wild-unknown.png", 
    isAvailable: true,
    customHref: "/spell-room/servitors-of-the-wild-unknown",
    caption: "Summon specialized chaotic entities from deep dimensions for complex tasks.",
    category: "Dimensional",
    visualTags: "Abstract otherworldly creature emerging from a portal"
  },
  {
    name: "Love",
    image: "/images/spell-room/love-spells-app-page.png", 
    isAvailable: true,
    caption: "Soul Connect spells and honey jar rituals to sweeten relationships and attract love.",
    category: "Love",
    visualTags: "Radiant pink heart energy with rose petals and soft light"
  },
  {
    name: "Electric Magick",
    image: "/images/spell-room/electric-magick-button.png", 
    isAvailable: true,
    caption: "Cyber-sorcery using digital chaos magick, neural linking, and reality patching.",
    category: "Techno-pagan",
    visualTags: "Neon circuit board sigils and data streams"
  },
  {
    name: "Chaos Magick",
    image: "/images/spell-room/chaos-magick-button.png",
    isAvailable: true,
    caption: "Generate and charge unique sigils with primal chaos energy and gnosis.",
    category: "Chaos",
    visualTags: "Chaosphere symbol pulsating with purple entropy energy"
  },
  {
    name: "Games of Magick",
    image: "/images/spell-room/games-of-magick-thumbnail.png",
    isAvailable: true,
    customHref: "/spell-room/games-of-magick",
    caption: "Enter the arcade of arcana. Test your skills and weave spells in interactive challenges.",
    category: "Games",
    visualTags: "Glowing arcade cabinet with mystical runes and pixel art potions"
  },
  {
    name: "Ceremonial Magick",
    image: "/images/spell-room/ceremonial-magick-button.png",
    isAvailable: false, 
    caption: "High ritual invocation, banishing, and communion with the divine. (Coming Soon)",
    category: "High Magick",
    visualTags: "Golden ritual chalice and solomonic circle"
  },
  {
    name: "Folk Magick",
    image: "/images/spell-room/folk-magick-button.png",
    isAvailable: false, 
    caption: "Ancient earth-based practices using herbs, stones, and simple charms. (Coming Soon)",
    category: "Folk",
    visualTags: "Bundles of dried herbs, crystals, and natural stones"
  },
];

const SpellRoom: React.FC = () => {
  return (
    <div className="w-full h-full animate-fade-in p-4 md:p-8 pb-20">
       <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-start justify-center">
        {traditions.map((tradition) => (
          <TraditionButton 
            key={typeof tradition.name === 'string' ? tradition.name : 'unknown'}
            tradition={tradition}
          />
        ))}
      </div>
    </div>
  );
}

export default SpellRoom;