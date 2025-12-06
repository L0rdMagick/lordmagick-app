// --- START OF FILE page.tsx ---

"use client";

import React, { useState, useEffect } from 'react';
import { 
  Settings, RefreshCw, Eye, Check, X, BarChart2, ArrowLeft, 
  Sparkles, Moon, Sun, Lock, Volume2, Home, LogOut
} from 'lucide-react';
import MagickalBackLink from '@/app/components/MagickalBackLink';

// --- CONFIGURATION ---

const POOLS = [
  { id: 'all', label: 'Universal (All)' },
  { id: 'animals', label: 'Biological Entities' },
  { id: 'structures', label: 'Constructs & Ruins' },
  { id: 'landscapes', label: 'Natural Vistas' },
  { id: 'objects', label: 'Artifacts & Machines' },
  { id: 'food', label: 'Sustenance' }
];

// --- CONTEXT AWARE CATEGORY DEFINITIONS ---

type CategoryOption = { id: string; label: string; options: string[] };
type PoolConfig = Record<string, CategoryOption>;

const UNIVERSAL_CATEGORIES: PoolConfig = {
  GESTALT: { id: 'gestalt', label: 'Primary Gestalt', options: ['Biological', 'Structure', 'Machine', 'Natural Feature'] },
  COLOR: { id: 'color', label: 'Dominant Color', options: ['Warm (Red/Yel)', 'Cool (Blue/Purp)', 'Nature (Grn/Brn)', 'Mono (Grey/Wht)'] },
  TEXTURE: { id: 'texture', label: 'Texture', options: ['Soft / Organic', 'Hard / Smooth', 'Rough / Coarse', 'Fluid / Wet'] },
  VIBE: { id: 'emotion', label: 'Energetic Vibe', options: ['Peaceful', 'High Energy', 'Melancholic', 'Intense / Scary'] }
};

const POOL_CONFIGS: Record<string, PoolConfig> = {
  all: UNIVERSAL_CATEGORIES,
  animals: {
    CLASS: { id: 'class', label: 'Biological Class', options: ['Mammal', 'Bird', 'Marine', 'Insect/Bug'] },
    DIET: { id: 'diet', label: 'Dietary Archetype', options: ['Carnivore', 'Herbivore', 'Omnivore', 'Filter/Scavenger'] },
    HABITAT: { id: 'habitat', label: 'Primary Habitat', options: ['Land / Forest', 'Water / Ocean', 'Air / Sky', 'Domestic'] },
    COLOR: UNIVERSAL_CATEGORIES.COLOR
  },
  structures: {
    ERA: { id: 'era', label: 'Temporal Era', options: ['Ancient / Ruin', 'Classical / Trad', 'Modern / Industrial', 'Futuristic'] },
    MATERIAL: { id: 'material', label: 'Primary Material', options: ['Stone / Brick', 'Metal / Glass', 'Wood / Organic', 'Concrete'] },
    TYPE: { id: 'struct_type', label: 'Function', options: ['Dwelling', 'Monument/Sacred', 'Infrastructure', 'Commercial'] },
    VIBE: UNIVERSAL_CATEGORIES.VIBE
  },
  landscapes: {
    ELEMENT: { id: 'element', label: 'Dominant Element', options: ['Water / Ice', 'Earth / Rock', 'Greenery / Plant', 'Air / Sky'] },
    TEMP: { id: 'temp', label: 'Temperature', options: ['Hot / Arid', 'Cold / Frozen', 'Temperate / Mild', 'Humid / Tropical'] },
    LIGHT: { id: 'light', label: 'Lighting Condition', options: ['Bright / Sunny', 'Dark / Night', 'Overcast / Stormy', 'Golden Hour'] },
    VIBE: UNIVERSAL_CATEGORIES.VIBE
  },
  objects: {
    MATERIAL: { id: 'obj_material', label: 'Material', options: ['Metal', 'Wood / Paper', 'Plastic / Synthetic', 'Composite / Glass'] },
    FUNCTION: { id: 'function', label: 'Utility', options: ['Transport', 'Tool / Device', 'Art / Decor', 'Container'] },
    COMPLEXITY: { id: 'complexity', label: 'Complexity', options: ['Simple / Single', 'Mechanical', 'Electronic', 'Ornate'] },
    COLOR: UNIVERSAL_CATEGORIES.COLOR
  },
  food: {
    FLAVOR: { id: 'flavor', label: 'Dominant Profile', options: ['Sweet', 'Savory / Salty', 'Sour / Acidic', 'Bitter / Spicy'] },
    STATE: { id: 'state', label: 'Physical State', options: ['Solid / Dry', 'Liquid / Wet', 'Soft / Creamy', 'Crunchy'] },
    SOURCE: { id: 'source', label: 'Origin', options: ['Plant / Fruit', 'Meat / Protein', 'Baked / Grain', 'Beverage'] },
    COLOR: UNIVERSAL_CATEGORIES.COLOR
  }
};

interface LevelData {
    id: number;
    concept: string;
    filename: string;
    pool: string;
    prompt: string;
    tags: Record<string, string>; // These are the Universal Tags stored in DB
}

// --- FULL IMAGE DATABASE (100 ITEMS) ---

const LEVEL_DATA: LevelData[] = [
  // --- POOL: ANIMALS ---
  {
    id: 1,
    concept: "Roaring Lion",
    filename: "predator_lion.jpg",
    pool: "animals",
    prompt: "Cinematic close up of a male lion roaring, golden hour lighting, savannah background, intense eyes, sharp teeth, dust motes in air.",
    tags: { gestalt: 'Biological', color: 'Warm (Red/Yel)', texture: 'Soft / Organic', smell: 'Stagnant / Dust', taste: 'Sweet / Savory', sound: 'Chaotic / Loud', emotion: 'Intense / Scary' }
  },
  {
    id: 2,
    concept: "Great White Shark",
    filename: "predator_shark.jpg",
    pool: "animals",
    prompt: "Underwater shot of a great white shark swimming towards camera, deep blue ocean, light rays breaking through water, sharp teeth visible.",
    tags: { gestalt: 'Biological', color: 'Cool (Blue/Purp)', texture: 'Hard / Smooth', smell: 'Fresh / Nature', taste: 'Salty / Mineral', sound: 'Silence', emotion: 'Intense / Scary' }
  },
  {
    id: 3,
    concept: "Wolf Howling",
    filename: "predator_wolf.jpg",
    pool: "animals",
    prompt: "Grey wolf howling at a full moon, snowy forest night, breath visible in cold air, atmospheric, high contrast.",
    tags: { gestalt: 'Biological', color: 'Mono (Grey/Wht)', texture: 'Soft / Organic', smell: 'Fresh / Nature', taste: 'Sweet / Savory', sound: 'Nature Sounds', emotion: 'Melancholic' }
  },
  {
    id: 4,
    concept: "Tiger Stalking",
    filename: "predator_tiger.jpg",
    pool: "animals",
    prompt: "Bengal tiger walking through tall green grass, orange and black stripes, intense focus, jungle environment.",
    tags: { gestalt: 'Biological', color: 'Warm (Red/Yel)', texture: 'Soft / Organic', smell: 'Fresh / Nature', taste: 'Sweet / Savory', sound: 'Silence', emotion: 'Intense / Scary' }
  },
  {
    id: 5,
    concept: "Grizzly Bear",
    filename: "predator_bear.jpg",
    pool: "animals",
    prompt: "Massive grizzly bear standing in a river catching a salmon, splashing water, wet fur, nature photography.",
    tags: { gestalt: 'Biological', color: 'Nature (Grn/Brn)', texture: 'Soft / Organic', smell: 'Stagnant / Dust', taste: 'Sweet / Savory', sound: 'Nature Sounds', emotion: 'Intense / Scary' }
  },
  {
    id: 6,
    concept: "Deer in Mist",
    filename: "herbivore_deer.jpg",
    pool: "animals",
    prompt: "A deer standing in a misty forest clearing at dawn, soft light, antlers, peaceful atmosphere.",
    tags: { gestalt: 'Biological', color: 'Nature (Grn/Brn)', texture: 'Soft / Organic', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 7,
    concept: "Giraffe",
    filename: "herbivore_giraffe.jpg",
    pool: "animals",
    prompt: "Tall giraffe eating leaves from an acacia tree, blue sky background, sunny day on the African plains.",
    tags: { gestalt: 'Biological', color: 'Warm (Red/Yel)', texture: 'Soft / Organic', smell: 'Stagnant / Dust', taste: 'Neutral / Dry', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 8,
    concept: "Giant Panda",
    filename: "herbivore_panda.jpg",
    pool: "animals",
    prompt: "Giant panda sitting and eating bamboo, black and white fur, green bamboo forest background.",
    tags: { gestalt: 'Biological', color: 'Mono (Grey/Wht)', texture: 'Soft / Organic', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 9,
    concept: "Elephant",
    filename: "herbivore_elephant.jpg",
    pool: "animals",
    prompt: "Close up of an elephant skin texture and eye, trunk raised, dusty environment, wrinkled gray skin.",
    tags: { gestalt: 'Biological', color: 'Mono (Grey/Wht)', texture: 'Rough / Coarse', smell: 'Stagnant / Dust', taste: 'Salty / Mineral', sound: 'Chaotic / Loud', emotion: 'Peaceful' }
  },
  {
    id: 10,
    concept: "Rabbit",
    filename: "herbivore_rabbit.jpg",
    pool: "animals",
    prompt: "Small white fluffy rabbit sitting in green grass, twitching nose, clover flowers, cute, macro photography.",
    tags: { gestalt: 'Biological', color: 'Mono (Grey/Wht)', texture: 'Soft / Organic', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 11,
    concept: "Scarlet Macaw",
    filename: "avian_macaw.jpg",
    pool: "animals",
    prompt: "Bright red scarlet macaw parrot flying, colorful feathers, blue sky, tropical jungle background.",
    tags: { gestalt: 'Biological', color: 'Warm (Red/Yel)', texture: 'Soft / Organic', smell: 'Sweet / Food', taste: 'Sweet / Savory', sound: 'Chaotic / Loud', emotion: 'High Energy' }
  },
  {
    id: 12,
    concept: "Bald Eagle",
    filename: "avian_eagle.jpg",
    pool: "animals",
    prompt: "Bald eagle soaring high above mountains, wings spread wide, sharp beak, fierce expression.",
    tags: { gestalt: 'Biological', color: 'Nature (Grn/Brn)', texture: 'Soft / Organic', smell: 'Fresh / Nature', taste: 'Salty / Mineral', sound: 'Nature Sounds', emotion: 'High Energy' }
  },
  {
    id: 13,
    concept: "Peacock",
    filename: "avian_peacock.jpg",
    pool: "animals",
    prompt: "Peacock displaying full tail feathers, iridescent blue and green patterns, majestic pose.",
    tags: { gestalt: 'Biological', color: 'Cool (Blue/Purp)', texture: 'Soft / Organic', smell: 'Stagnant / Dust', taste: 'Neutral / Dry', sound: 'Mechanical', emotion: 'High Energy' }
  },
  {
    id: 14,
    concept: "Owl at Night",
    filename: "avian_owl.jpg",
    pool: "animals",
    prompt: "Great horned owl perched on a branch at night, large yellow eyes glowing, dark forest, moonlight.",
    tags: { gestalt: 'Biological', color: 'Nature (Grn/Brn)', texture: 'Soft / Organic', smell: 'Stagnant / Dust', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Melancholic' }
  },
  {
    id: 15,
    concept: "Swan",
    filename: "avian_swan.jpg",
    pool: "animals",
    prompt: "Elegant white swan floating on a calm lake, reflection in water, peaceful, graceful.",
    tags: { gestalt: 'Biological', color: 'Mono (Grey/Wht)', texture: 'Soft / Organic', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 16,
    concept: "Octopus",
    filename: "marine_octopus.jpg",
    pool: "animals",
    prompt: "Red octopus moving underwater, tentacles swirling, suckers visible, coral reef background.",
    tags: { gestalt: 'Biological', color: 'Warm (Red/Yel)', texture: 'Fluid / Wet', smell: 'Salty / Mineral', taste: 'Salty / Mineral', sound: 'Silence', emotion: 'High Energy' }
  },
  {
    id: 17,
    concept: "Jellyfish",
    filename: "marine_jellyfish.jpg",
    pool: "animals",
    prompt: "Glowing blue jellyfish floating in deep black water, translucent, bioluminescent, ethereal.",
    tags: { gestalt: 'Biological', color: 'Cool (Blue/Purp)', texture: 'Fluid / Wet', smell: 'Salty / Mineral', taste: 'Salty / Mineral', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 18,
    concept: "Clownfish",
    filename: "marine_clownfish.jpg",
    pool: "animals",
    prompt: "Orange and white clownfish hiding in a purple anemone, underwater macro photography, vibrant colors.",
    tags: { gestalt: 'Biological', color: 'Warm (Red/Yel)', texture: 'Fluid / Wet', smell: 'Salty / Mineral', taste: 'Salty / Mineral', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 19,
    concept: "Sea Turtle",
    filename: "marine_turtle.jpg",
    pool: "animals",
    prompt: "Green sea turtle swimming gracefully underwater, sunbeams from surface, detailed shell texture.",
    tags: { gestalt: 'Biological', color: 'Nature (Grn/Brn)', texture: 'Hard / Smooth', smell: 'Salty / Mineral', taste: 'Salty / Mineral', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 20,
    concept: "Koi Fish",
    filename: "marine_koi.jpg",
    pool: "animals",
    prompt: "Top down view of a pond with orange and white koi fish swimming, lily pads, ripples in water.",
    tags: { gestalt: 'Biological', color: 'Warm (Red/Yel)', texture: 'Fluid / Wet', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 21,
    concept: "Butterfly",
    filename: "insect_butterfly.jpg",
    pool: "animals",
    prompt: "Monarch butterfly resting on a purple flower, macro shot, shallow depth of field, sunny garden.",
    tags: { gestalt: 'Biological', color: 'Warm (Red/Yel)', texture: 'Soft / Organic', smell: 'Sweet / Food', taste: 'Sweet / Savory', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 22,
    concept: "Spider Web",
    filename: "insect_spider.jpg",
    pool: "animals",
    prompt: "Black spider sitting in the center of a dew-covered web, morning light, geometric web pattern.",
    tags: { gestalt: 'Biological', color: 'Mono (Grey/Wht)', texture: 'Soft / Organic', smell: 'Fresh / Nature', taste: 'Bitter / Slimy', sound: 'Silence', emotion: 'Intense / Scary' }
  },
  {
    id: 23,
    concept: "Honey Bee",
    filename: "insect_bee.jpg",
    pool: "animals",
    prompt: "Honey bee collecting pollen from a yellow sunflower, extreme macro, fuzzy texture, bright sunlight.",
    tags: { gestalt: 'Biological', color: 'Warm (Red/Yel)', texture: 'Soft / Organic', smell: 'Sweet / Food', taste: 'Sweet / Savory', sound: 'Mechanical', emotion: 'High Energy' }
  },
  {
    id: 24,
    concept: "Snail",
    filename: "insect_snail.jpg",
    pool: "animals",
    prompt: "Snail crawling on a wet green leaf, spiral shell, slime trail, rain drops, macro.",
    tags: { gestalt: 'Biological', color: 'Nature (Grn/Brn)', texture: 'Fluid / Wet', smell: 'Earthy / Musty', taste: 'Bitter / Slimy', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 25,
    concept: "Dragonfly",
    filename: "insect_dragonfly.jpg",
    pool: "animals",
    prompt: "Blue metallic dragonfly resting on a reed, wings spread, iridescent eyes, pond background.",
    tags: { gestalt: 'Biological', color: 'Cool (Blue/Purp)', texture: 'Hard / Smooth', smell: 'Fresh / Nature', taste: 'Bitter / Slimy', sound: 'Mechanical', emotion: 'Peaceful' }
  },

  // --- POOL: STRUCTURES ---
  {
    id: 26,
    concept: "Great Pyramid",
    filename: "ruin_pyramid.jpg",
    pool: "structures",
    prompt: "The Great Pyramids of Giza, yellow sand, blue sky, camels in distance, ancient stone texture.",
    tags: { gestalt: 'Structure', color: 'Warm (Red/Yel)', texture: 'Rough / Coarse', smell: 'Stagnant / Dust', taste: 'Salty / Mineral', sound: 'Silence', emotion: 'Melancholic' }
  },
  {
    id: 27,
    concept: "Stonehenge",
    filename: "ruin_stonehenge.jpg",
    pool: "structures",
    prompt: "Stonehenge stone circle at sunset, green grass, orange sky, massive standing stones, mystical.",
    tags: { gestalt: 'Structure', color: 'Nature (Grn/Brn)', texture: 'Rough / Coarse', smell: 'Fresh / Nature', taste: 'Salty / Mineral', sound: 'Nature Sounds', emotion: 'Melancholic' }
  },
  {
    id: 28,
    concept: "Roman Colosseum",
    filename: "ruin_colosseum.jpg",
    pool: "structures",
    prompt: "Interior view of the Roman Colosseum, broken stone arches, ancient ruins, sunlight and shadow.",
    tags: { gestalt: 'Structure', color: 'Warm (Red/Yel)', texture: 'Rough / Coarse', smell: 'Stagnant / Dust', taste: 'Salty / Mineral', sound: 'Silence', emotion: 'Intense / Scary' }
  },
  {
    id: 29,
    concept: "Mayan Temple",
    filename: "ruin_mayan.jpg",
    pool: "structures",
    prompt: "Chichen Itza Mayan pyramid surrounded by dense green jungle, stone steps, ancient history.",
    tags: { gestalt: 'Structure', color: 'Nature (Grn/Brn)', texture: 'Rough / Coarse', smell: 'Earthy / Musty', taste: 'Salty / Mineral', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 30,
    concept: "Moai Statues",
    filename: "ruin_moai.jpg",
    pool: "structures",
    prompt: "Easter Island Moai heads standing on a grassy hill, ocean in background, overcast sky, mysterious.",
    tags: { gestalt: 'Structure', color: 'Mono (Grey/Wht)', texture: 'Rough / Coarse', smell: 'Salty / Mineral', taste: 'Salty / Mineral', sound: 'Nature Sounds', emotion: 'Melancholic' }
  },
  {
    id: 31,
    concept: "Glass Skyscraper",
    filename: "arch_skyscraper.jpg",
    pool: "structures",
    prompt: "Looking up at a modern glass skyscraper reflecting the blue sky, geometric lines, corporate architecture.",
    tags: { gestalt: 'Structure', color: 'Cool (Blue/Purp)', texture: 'Hard / Smooth', smell: 'Chemical / City', taste: 'Metallic / Chem', sound: 'Mechanical', emotion: 'High Energy' }
  },
  {
    id: 32,
    concept: "Sydney Opera House",
    filename: "arch_opera.jpg",
    pool: "structures",
    prompt: "Sydney Opera House shells against a blue harbor, white ceramic tiles, architectural icon, sunny day.",
    tags: { gestalt: 'Structure', color: 'Mono (Grey/Wht)', texture: 'Hard / Smooth', smell: 'Salty / Mineral', taste: 'Salty / Mineral', sound: 'Nature Sounds', emotion: 'High Energy' }
  },
  {
    id: 33,
    concept: "Neon City Street",
    filename: "arch_neon.jpg",
    pool: "structures",
    prompt: "Cyberpunk style city street at night, neon signs in rain, wet pavement reflections, futuristic buildings.",
    tags: { gestalt: 'Structure', color: 'Cool (Blue/Purp)', texture: 'Hard / Smooth', smell: 'Chemical / City', taste: 'Metallic / Chem', sound: 'Chaotic / Loud', emotion: 'High Energy' }
  },
  {
    id: 34,
    concept: "Minimalist Concrete",
    filename: "arch_concrete.jpg",
    pool: "structures",
    prompt: "Brutalist architecture, raw grey concrete wall with sharp shadows, minimalist, geometric shapes.",
    tags: { gestalt: 'Structure', color: 'Mono (Grey/Wht)', texture: 'Rough / Coarse', smell: 'Stagnant / Dust', taste: 'Salty / Mineral', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 35,
    concept: "Suspension Bridge",
    filename: "arch_bridge.jpg",
    pool: "structures",
    prompt: "Golden Gate Bridge in fog, red metal cables, spanning over water, engineering marvel.",
    tags: { gestalt: 'Structure', color: 'Warm (Red/Yel)', texture: 'Hard / Smooth', smell: 'Salty / Mineral', taste: 'Metallic / Chem', sound: 'Mechanical', emotion: 'High Energy' }
  },
  {
    id: 36,
    concept: "Oil Refinery",
    filename: "ind_refinery.jpg",
    pool: "structures",
    prompt: "Oil refinery at night with lights and smoke stacks, complex pipes, industrial metal structures.",
    tags: { gestalt: 'Structure', color: 'Mono (Grey/Wht)', texture: 'Hard / Smooth', smell: 'Chemical / City', taste: 'Metallic / Chem', sound: 'Mechanical', emotion: 'Intense / Scary' }
  },
  {
    id: 37,
    concept: "Rusted Factory",
    filename: "ind_factory.jpg",
    pool: "structures",
    prompt: "Abandoned factory interior, rusted machinery, broken windows, light beams through dust, decay.",
    tags: { gestalt: 'Structure', color: 'Warm (Red/Yel)', texture: 'Rough / Coarse', smell: 'Stagnant / Dust', taste: 'Metallic / Chem', sound: 'Silence', emotion: 'Melancholic' }
  },
  {
    id: 38,
    concept: "Cargo Port",
    filename: "ind_port.jpg",
    pool: "structures",
    prompt: "Aerial view of shipping containers at a port, colorful metal boxes, cranes, industrial logistics.",
    tags: { gestalt: 'Structure', color: 'Cool (Blue/Purp)', texture: 'Hard / Smooth', smell: 'Chemical / City', taste: 'Metallic / Chem', sound: 'Mechanical', emotion: 'High Energy' }
  },
  {
    id: 39,
    concept: "Wind Farm",
    filename: "ind_windfarm.jpg",
    pool: "structures",
    prompt: "White wind turbines on a green hill, blue sky, renewable energy, clean lines, rotating blades.",
    tags: { gestalt: 'Structure', color: 'Mono (Grey/Wht)', texture: 'Hard / Smooth', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Mechanical', emotion: 'Peaceful' }
  },
  {
    id: 40,
    concept: "Train Tracks",
    filename: "ind_tracks.jpg",
    pool: "structures",
    prompt: "Railway tracks vanishing into the distance, gravel, steel rails, wooden ties, overcast day.",
    tags: { gestalt: 'Structure', color: 'Mono (Grey/Wht)', texture: 'Rough / Coarse', smell: 'Chemical / City', taste: 'Metallic / Chem', sound: 'Mechanical', emotion: 'Melancholic' }
  },
  {
    id: 41,
    concept: "Buddhist Temple",
    filename: "sacred_buddhist.jpg",
    pool: "structures",
    prompt: "Golden Buddhist temple roof with curved edges, incense smoke, peaceful courtyard, red columns.",
    tags: { gestalt: 'Structure', color: 'Warm (Red/Yel)', texture: 'Hard / Smooth', smell: 'Sweet / Food', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 42,
    concept: "Stained Glass",
    filename: "sacred_stainedglass.jpg",
    pool: "structures",
    prompt: "Detailed stained glass window in a dark church, light shining through creating colorful patterns on floor.",
    tags: { gestalt: 'Structure', color: 'Cool (Blue/Purp)', texture: 'Hard / Smooth', smell: 'Stagnant / Dust', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 43,
    concept: "Zen Garden",
    filename: "sacred_zen.jpg",
    pool: "structures",
    prompt: "Japanese Zen rock garden, raked white sand patterns, mossy rocks, peaceful meditation space.",
    tags: { gestalt: 'Natural Feature', color: 'Mono (Grey/Wht)', texture: 'Rough / Coarse', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 44,
    concept: "Candle Altar",
    filename: "sacred_candles.jpg",
    pool: "structures",
    prompt: "Dozens of lit candles in a dark stone room, warm glow, dripping wax, spiritual atmosphere.",
    tags: { gestalt: 'Machine', color: 'Warm (Red/Yel)', texture: 'Fluid / Wet', smell: 'Burnt / Smoky', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 45,
    concept: "Torii Gate",
    filename: "sacred_torii.jpg",
    pool: "structures",
    prompt: "Red Torii gate standing in calm water, Itsukushima shrine, foggy mountains in background, serene.",
    tags: { gestalt: 'Structure', color: 'Warm (Red/Yel)', texture: 'Hard / Smooth', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 46,
    concept: "Cozy Fireplace",
    filename: "home_fireplace.jpg",
    pool: "structures",
    prompt: "Roaring fire in a stone fireplace, cozy living room, rug, warm light, winter evening.",
    tags: { gestalt: 'Structure', color: 'Warm (Red/Yel)', texture: 'Rough / Coarse', smell: 'Burnt / Smoky', taste: 'Sweet / Savory', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 47,
    concept: "Modern Kitchen",
    filename: "home_kitchen.jpg",
    pool: "structures",
    prompt: "Clean modern kitchen with marble island, stainless steel appliances, white cabinets, bowl of fruit.",
    tags: { gestalt: 'Structure', color: 'Mono (Grey/Wht)', texture: 'Hard / Smooth', smell: 'Sweet / Food', taste: 'Sweet / Savory', sound: 'Mechanical', emotion: 'High Energy' }
  },
  {
    id: 48,
    concept: "Old Library",
    filename: "home_library.jpg",
    pool: "structures",
    prompt: "Walls of old leather books in a library, wooden ladder, dust motes, warm lamp light, studious.",
    tags: { gestalt: 'Structure', color: 'Warm (Red/Yel)', texture: 'Rough / Coarse', smell: 'Earthy / Musty', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 49,
    concept: "Spiral Staircase",
    filename: "home_stairs.jpg",
    pool: "structures",
    prompt: "Looking down a wooden spiral staircase, geometric swirl, architectural detail, shadows.",
    tags: { gestalt: 'Structure', color: 'Nature (Grn/Brn)', texture: 'Hard / Smooth', smell: 'Stagnant / Dust', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Melancholic' }
  },
  {
    id: 50,
    concept: "Bedroom Window",
    filename: "home_window.jpg",
    pool: "structures",
    prompt: "View from a cozy bed looking out a window at rain, coffee cup on sill, blankets, moody morning.",
    tags: { gestalt: 'Structure', color: 'Cool (Blue/Purp)', texture: 'Soft / Organic', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },

  // --- POOL: LANDSCAPES ---
  {
    id: 51,
    concept: "Snowy Peak",
    filename: "land_mountain.jpg",
    pool: "landscapes",
    prompt: "Majestic snow-capped mountain peak against blue sky, jagged rocks, alpine environment, cold.",
    tags: { gestalt: 'Natural Feature', color: 'Mono (Grey/Wht)', texture: 'Rough / Coarse', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Nature Sounds', emotion: 'Intense / Scary' }
  },
  {
    id: 52,
    concept: "Grand Canyon",
    filename: "land_canyon.jpg",
    pool: "landscapes",
    prompt: "Vast view of the Grand Canyon, red rock layers, deep depth, sunset light, arid landscape.",
    tags: { gestalt: 'Natural Feature', color: 'Warm (Red/Yel)', texture: 'Rough / Coarse', smell: 'Earthy / Musty', taste: 'Salty / Mineral', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 53,
    concept: "Volcano Eruption",
    filename: "land_volcano.jpg",
    pool: "landscapes",
    prompt: "Volcano erupting lava at night, glowing red magma flowing down, black rock, smoke plume.",
    tags: { gestalt: 'Natural Feature', color: 'Warm (Red/Yel)', texture: 'Rough / Coarse', smell: 'Burnt / Smoky', taste: 'Salty / Mineral', sound: 'Chaotic / Loud', emotion: 'Intense / Scary' }
  },
  {
    id: 54,
    concept: "Cave Interior",
    filename: "land_cave.jpg",
    pool: "landscapes",
    prompt: "Inside a limestone cave with stalactites and stalagmites, dark, damp, single light source, mysterious.",
    tags: { gestalt: 'Natural Feature', color: 'Cool (Blue/Purp)', texture: 'Rough / Coarse', smell: 'Earthy / Musty', taste: 'Salty / Mineral', sound: 'Silence', emotion: 'Intense / Scary' }
  },
  {
    id: 55,
    concept: "Green Hills",
    filename: "land_hills.jpg",
    pool: "landscapes",
    prompt: "Rolling green hills in Ireland, soft grass, overcast sky, rural landscape, peaceful.",
    tags: { gestalt: 'Natural Feature', color: 'Nature (Grn/Brn)', texture: 'Soft / Organic', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 56,
    concept: "Tropical Beach",
    filename: "water_beach.jpg",
    pool: "landscapes",
    prompt: "White sand beach with turquoise water, palm tree shadow, sunny tropical paradise, calm waves.",
    tags: { gestalt: 'Natural Feature', color: 'Cool (Blue/Purp)', texture: 'Fluid / Wet', smell: 'Fresh / Nature', taste: 'Salty / Mineral', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 57,
    concept: "Waterfall",
    filename: "water_waterfall.jpg",
    pool: "landscapes",
    prompt: "Powerful waterfall crashing into a pool, mist rising, green mossy rocks, dynamic water motion.",
    tags: { gestalt: 'Natural Feature', color: 'Cool (Blue/Purp)', texture: 'Fluid / Wet', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Chaotic / Loud', emotion: 'High Energy' }
  },
  {
    id: 58,
    concept: "Stormy Ocean",
    filename: "water_storm.jpg",
    pool: "landscapes",
    prompt: "Dark stormy ocean waves crashing, white foam, grey sky, dangerous sea condition, cinematic.",
    tags: { gestalt: 'Natural Feature', color: 'Cool (Blue/Purp)', texture: 'Fluid / Wet', smell: 'Salty / Mineral', taste: 'Salty / Mineral', sound: 'Chaotic / Loud', emotion: 'Intense / Scary' }
  },
  {
    id: 59,
    concept: "Frozen Lake",
    filename: "water_ice.jpg",
    pool: "landscapes",
    prompt: "Cracked blue ice on a frozen lake, bubbles trapped in ice, winter cold, smooth texture.",
    tags: { gestalt: 'Natural Feature', color: 'Cool (Blue/Purp)', texture: 'Hard / Smooth', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Melancholic' }
  },
  {
    id: 60,
    concept: "River Stone",
    filename: "water_river.jpg",
    pool: "landscapes",
    prompt: "Smooth river stones under clear running water, ripples, sunlight refracting on bottom, peaceful.",
    tags: { gestalt: 'Natural Feature', color: 'Nature (Grn/Brn)', texture: 'Fluid / Wet', smell: 'Earthy / Musty', taste: 'Neutral / Dry', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 61,
    concept: "Redwood Forest",
    filename: "forest_redwood.jpg",
    pool: "landscapes",
    prompt: "Giant redwood trees towering up, sunbeams through mist, fern ground cover, ancient forest.",
    tags: { gestalt: 'Natural Feature', color: 'Nature (Grn/Brn)', texture: 'Rough / Coarse', smell: 'Earthy / Musty', taste: 'Bitter / Slimy', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 62,
    concept: "Autumn Path",
    filename: "forest_autumn.jpg",
    pool: "landscapes",
    prompt: "Forest path covered in orange and red autumn leaves, trees changing color, soft fall light.",
    tags: { gestalt: 'Natural Feature', color: 'Warm (Red/Yel)', texture: 'Soft / Organic', smell: 'Earthy / Musty', taste: 'Neutral / Dry', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 63,
    concept: "Jungle Vines",
    filename: "forest_jungle.jpg",
    pool: "landscapes",
    prompt: "Dense tropical jungle, hanging vines, huge green leaves, humidity, dark and green atmosphere.",
    tags: { gestalt: 'Natural Feature', color: 'Nature (Grn/Brn)', texture: 'Soft / Organic', smell: 'Fresh / Nature', taste: 'Bitter / Slimy', sound: 'Nature Sounds', emotion: 'Intense / Scary' }
  },
  {
    id: 64,
    concept: "Bamboo Grove",
    filename: "forest_bamboo.jpg",
    pool: "landscapes",
    prompt: "Tall green bamboo forest, vertical lines, light filtering through leaves, zen nature.",
    tags: { gestalt: 'Natural Feature', color: 'Nature (Grn/Brn)', texture: 'Hard / Smooth', smell: 'Fresh / Nature', taste: 'Bitter / Slimy', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 65,
    concept: "Dead Tree",
    filename: "forest_dead.jpg",
    pool: "landscapes",
    prompt: "Lone dead tree in a barren field, twisted branches, grey sky, desolate landscape, silhouette.",
    tags: { gestalt: 'Natural Feature', color: 'Mono (Grey/Wht)', texture: 'Rough / Coarse', smell: 'Stagnant / Dust', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Melancholic' }
  },
  {
    id: 66,
    concept: "Sand Dunes",
    filename: "desert_dunes.jpg",
    pool: "landscapes",
    prompt: "Sahara desert sand dunes, smooth curves, golden sand, ripples caused by wind, clear sky.",
    tags: { gestalt: 'Natural Feature', color: 'Warm (Red/Yel)', texture: 'Soft / Organic', smell: 'Earthy / Musty', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 67,
    concept: "Cracked Earth",
    filename: "desert_cracked.jpg",
    pool: "landscapes",
    prompt: "Dry cracked earth texture, drought, arid ground, beige clay, detail shot, lifeless.",
    tags: { gestalt: 'Natural Feature', color: 'Nature (Grn/Brn)', texture: 'Rough / Coarse', smell: 'Earthy / Musty', taste: 'Salty / Mineral', sound: 'Silence', emotion: 'Melancholic' }
  },
  {
    id: 68,
    concept: "Cactus",
    filename: "desert_cactus.jpg",
    pool: "landscapes",
    prompt: "Close up of a green cactus with sharp spines, desert background, harsh sunlight, prickly.",
    tags: { gestalt: 'Biological', color: 'Nature (Grn/Brn)', texture: 'Rough / Coarse', smell: 'Earthy / Musty', taste: 'Bitter / Slimy', sound: 'Silence', emotion: 'Intense / Scary' }
  },
  {
    id: 69,
    concept: "Salt Flats",
    filename: "desert_salt.jpg",
    pool: "landscapes",
    prompt: "Bolivia Salt Flats, endless white ground reflecting the sky, mirror effect, ethereal landscape.",
    tags: { gestalt: 'Natural Feature', color: 'Mono (Grey/Wht)', texture: 'Rough / Coarse', smell: 'Salty / Mineral', taste: 'Salty / Mineral', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 70,
    concept: "Oasis",
    filename: "desert_oasis.jpg",
    pool: "landscapes",
    prompt: "Desert oasis with palm trees and a small blue pool of water, surrounded by sand, refuge.",
    tags: { gestalt: 'Natural Feature', color: 'Cool (Blue/Purp)', texture: 'Fluid / Wet', smell: 'Fresh / Nature', taste: 'Sweet / Savory', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 71,
    concept: "Iceberg",
    filename: "ice_iceberg.jpg",
    pool: "landscapes",
    prompt: "Massive white and blue iceberg floating in dark ocean, antarctica, cold, majestic structure.",
    tags: { gestalt: 'Natural Feature', color: 'Cool (Blue/Purp)', texture: 'Hard / Smooth', smell: 'Fresh / Nature', taste: 'Salty / Mineral', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 72,
    concept: "Snow Flake",
    filename: "ice_snowflake.jpg",
    pool: "landscapes",
    prompt: "Extreme macro of a single unique snowflake, geometric crystal structure, blue background, cold.",
    tags: { gestalt: 'Natural Feature', color: 'Cool (Blue/Purp)', texture: 'Hard / Smooth', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 73,
    concept: "Icicles",
    filename: "ice_icicles.jpg",
    pool: "landscapes",
    prompt: "Sharp icicles hanging from a roof edge, glistening in sun, melting drops, winter texture.",
    tags: { gestalt: 'Natural Feature', color: 'Cool (Blue/Purp)', texture: 'Hard / Smooth', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Intense / Scary' }
  },
  {
    id: 74,
    concept: "Aurora Borealis",
    filename: "ice_aurora.jpg",
    pool: "landscapes",
    prompt: "Northern lights aurora borealis, green and purple lights in night sky, snowy landscape below.",
    tags: { gestalt: 'Natural Feature', color: 'Nature (Grn/Brn)', texture: 'Soft / Organic', smell: 'Fresh / Nature', taste: 'Neutral / Dry', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 75,
    concept: "Tundra Moss",
    filename: "ice_tundra.jpg",
    pool: "landscapes",
    prompt: "Frozen tundra ground with moss and lichen, patches of snow, rocky, cold desolate landscape.",
    tags: { gestalt: 'Natural Feature', color: 'Nature (Grn/Brn)', texture: 'Soft / Organic', smell: 'Earthy / Musty', taste: 'Bitter / Slimy', sound: 'Nature Sounds', emotion: 'Melancholic' }
  },

  // --- POOL: OBJECTS ---
  {
    id: 76,
    concept: "Formula 1 Car",
    filename: "vehicle_racecar.jpg",
    pool: "objects",
    prompt: "Red Formula 1 race car speeding on track, motion blur, asphalt, aerodynamic design.",
    tags: { gestalt: 'Machine', color: 'Warm (Red/Yel)', texture: 'Hard / Smooth', smell: 'Burnt / Smoky', taste: 'Metallic / Chem', sound: 'Chaotic / Loud', emotion: 'High Energy' }
  },
  {
    id: 77,
    concept: "Steam Train",
    filename: "vehicle_train.jpg",
    pool: "objects",
    prompt: "Black steam locomotive train emitting white smoke, vintage, heavy metal wheels, powerful.",
    tags: { gestalt: 'Machine', color: 'Mono (Grey/Wht)', texture: 'Hard / Smooth', smell: 'Burnt / Smoky', taste: 'Metallic / Chem', sound: 'Mechanical', emotion: 'High Energy' }
  },
  {
    id: 78,
    concept: "Vintage Tractor",
    filename: "vehicle_tractor.jpg",
    pool: "objects",
    prompt: "Old rusted red tractor in a field, peeled paint, weathered tires, farming history.",
    tags: { gestalt: 'Machine', color: 'Warm (Red/Yel)', texture: 'Rough / Coarse', smell: 'Chemical / City', taste: 'Metallic / Chem', sound: 'Mechanical', emotion: 'Melancholic' }
  },
  {
    id: 79,
    concept: "Motorcycle",
    filename: "vehicle_motorcycle.jpg",
    pool: "objects",
    prompt: "Chrome motorcycle detail, engine block, leather seat, shiny metal, mechanical power.",
    tags: { gestalt: 'Machine', color: 'Mono (Grey/Wht)', texture: 'Hard / Smooth', smell: 'Chemical / City', taste: 'Metallic / Chem', sound: 'Chaotic / Loud', emotion: 'High Energy' }
  },
  {
    id: 80,
    concept: "School Bus",
    filename: "vehicle_bus.jpg",
    pool: "objects",
    prompt: "Classic yellow school bus parked, stop sign extended, front grille view.",
    tags: { gestalt: 'Machine', color: 'Warm (Red/Yel)', texture: 'Hard / Smooth', smell: 'Chemical / City', taste: 'Metallic / Chem', sound: 'Mechanical', emotion: 'Peaceful' }
  },
  {
    id: 81,
    concept: "Hot Air Balloon",
    filename: "vessel_balloon.jpg",
    pool: "objects",
    prompt: "Colorful hot air balloon floating in blue sky, fabric texture, burner flame, freedom.",
    tags: { gestalt: 'Machine', color: 'Warm (Red/Yel)', texture: 'Soft / Organic', smell: 'Burnt / Smoky', taste: 'Neutral / Dry', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 82,
    concept: "Fighter Jet",
    filename: "vessel_jet.jpg",
    pool: "objects",
    prompt: "Grey fighter jet flying at high speed, afterburners glowing, clouds, military technology.",
    tags: { gestalt: 'Machine', color: 'Mono (Grey/Wht)', texture: 'Hard / Smooth', smell: 'Chemical / City', taste: 'Metallic / Chem', sound: 'Chaotic / Loud', emotion: 'Intense / Scary' }
  },
  {
    id: 83,
    concept: "Sailboat",
    filename: "vessel_sailboat.jpg",
    pool: "objects",
    prompt: "White sailboat with sails full of wind, blue ocean, leaning hull, adventure.",
    tags: { gestalt: 'Machine', color: 'Mono (Grey/Wht)', texture: 'Soft / Organic', smell: 'Fresh / Nature', taste: 'Salty / Mineral', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 84,
    concept: "Submarine",
    filename: "vessel_submarine.jpg",
    pool: "objects",
    prompt: "Black submarine surfacing in choppy water, wet metal, periscope, stealth.",
    tags: { gestalt: 'Machine', color: 'Mono (Grey/Wht)', texture: 'Hard / Smooth', smell: 'Chemical / City', taste: 'Metallic / Chem', sound: 'Mechanical', emotion: 'Intense / Scary' }
  },
  {
    id: 85,
    concept: "Space Shuttle",
    filename: "vessel_shuttle.jpg",
    pool: "objects",
    prompt: "Space shuttle launching, massive smoke plume, fire exhaust, pointing towards sky.",
    tags: { gestalt: 'Machine', color: 'Mono (Grey/Wht)', texture: 'Hard / Smooth', smell: 'Burnt / Smoky', taste: 'Metallic / Chem', sound: 'Chaotic / Loud', emotion: 'High Energy' }
  },
  {
    id: 86,
    concept: "Circuit Board",
    filename: "tech_circuit.jpg",
    pool: "objects",
    prompt: "Macro of a green electronic circuit board, gold paths, chips, technology texture.",
    tags: { gestalt: 'Machine', color: 'Nature (Grn/Brn)', texture: 'Hard / Smooth', smell: 'Chemical / City', taste: 'Metallic / Chem', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 87,
    concept: "Vinyl Record",
    filename: "tech_vinyl.jpg",
    pool: "objects",
    prompt: "Close up of black vinyl record grooves, light reflection, spinning on turntable, retro audio.",
    tags: { gestalt: 'Machine', color: 'Mono (Grey/Wht)', texture: 'Hard / Smooth', smell: 'Chemical / City', taste: 'Neutral / Dry', sound: 'Nature Sounds', emotion: 'Peaceful' }
  },
  {
    id: 88,
    concept: "Light Bulb",
    filename: "tech_bulb.jpg",
    pool: "objects",
    prompt: "Edison light bulb glowing filament, warm orange light, glass texture, dark background.",
    tags: { gestalt: 'Machine', color: 'Warm (Red/Yel)', texture: 'Hard / Smooth', smell: 'Burnt / Smoky', taste: 'Metallic / Chem', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 89,
    concept: "Vintage Camera",
    filename: "tech_camera.jpg",
    pool: "objects",
    prompt: "Old silver and black film camera, lens reflection, leather texture, retro photography.",
    tags: { gestalt: 'Machine', color: 'Mono (Grey/Wht)', texture: 'Hard / Smooth', smell: 'Stagnant / Dust', taste: 'Metallic / Chem', sound: 'Mechanical', emotion: 'Melancholic' }
  },
  {
    id: 90,
    concept: "Robot Hand",
    filename: "tech_robot.jpg",
    pool: "objects",
    prompt: "White humanoid robot hand, mechanical joints, futuristic technology, clean background.",
    tags: { gestalt: 'Machine', color: 'Mono (Grey/Wht)', texture: 'Hard / Smooth', smell: 'Chemical / City', taste: 'Metallic / Chem', sound: 'Mechanical', emotion: 'High Energy' }
  },
  {
    id: 91,
    concept: "Rusty Key",
    filename: "tool_key.jpg",
    pool: "objects",
    prompt: "Old rusty iron skeleton key, textured metal, antique, lying on wood.",
    tags: { gestalt: 'Machine', color: 'Warm (Red/Yel)', texture: 'Rough / Coarse', smell: 'Stagnant / Dust', taste: 'Metallic / Chem', sound: 'Silence', emotion: 'Melancholic' }
  },
  {
    id: 92,
    concept: "Sword",
    filename: "tool_sword.jpg",
    pool: "objects",
    prompt: "Medieval steel sword, shining blade, leather hilt, sharp edge, weapon.",
    tags: { gestalt: 'Machine', color: 'Mono (Grey/Wht)', texture: 'Hard / Smooth', smell: 'Metallic / Chem', taste: 'Metallic / Chem', sound: 'Mechanical', emotion: 'Intense / Scary' }
  },
  {
    id: 93,
    concept: "Compass",
    filename: "tool_compass.jpg",
    pool: "objects",
    prompt: "Antique brass compass, north needle, glass face, map background, exploration.",
    tags: { gestalt: 'Machine', color: 'Warm (Red/Yel)', texture: 'Hard / Smooth', smell: 'Stagnant / Dust', taste: 'Metallic / Chem', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 94,
    concept: "Paint Palette",
    filename: "tool_palette.jpg",
    pool: "objects",
    prompt: "Artist wooden palette with messy colorful oil paints, brush, creative mess.",
    tags: { gestalt: 'Machine', color: 'Warm (Red/Yel)', texture: 'Fluid / Wet', smell: 'Chemical / City', taste: 'Bitter / Slimy', sound: 'Silence', emotion: 'High Energy' }
  },
  {
    id: 95,
    concept: "Anchor",
    filename: "tool_anchor.jpg",
    pool: "objects",
    prompt: "Large rusty iron ship anchor sitting on a dock, heavy, nautical texture.",
    tags: { gestalt: 'Machine', color: 'Mono (Grey/Wht)', texture: 'Rough / Coarse', smell: 'Salty / Mineral', taste: 'Metallic / Chem', sound: 'Silence', emotion: 'Melancholic' }
  },

  // --- POOL: FOOD ---
  {
    id: 96,
    concept: "Fresh Lemon",
    filename: "food_lemon.jpg",
    pool: "food",
    prompt: "Bright yellow lemon sliced in half, juice droplets, zest, fresh citrus, sunny background.",
    tags: { gestalt: 'Biological', color: 'Warm (Red/Yel)', texture: 'Rough / Coarse', smell: 'Fresh / Nature', taste: 'Sour / Acidic', sound: 'Silence', emotion: 'High Energy' }
  },
  {
    id: 97,
    concept: "Coffee Beans",
    filename: "food_coffee.jpg",
    pool: "food",
    prompt: "Pile of roasted brown coffee beans, oily texture, aromatic, macro shot.",
    tags: { gestalt: 'Biological', color: 'Nature (Grn/Brn)', texture: 'Hard / Smooth', smell: 'Burnt / Smoky', taste: 'Bitter / Slimy', sound: 'Mechanical', emotion: 'High Energy' }
  },
  {
    id: 98,
    concept: "Strawberry Cake",
    filename: "food_cake.jpg",
    pool: "food",
    prompt: "Slice of strawberry shortcake with whipped cream, red berries, fluffy sponge, delicious.",
    tags: { gestalt: 'Biological', color: 'Warm (Red/Yel)', texture: 'Soft / Organic', smell: 'Sweet / Food', taste: 'Sweet / Savory', sound: 'Silence', emotion: 'High Energy' }
  },
  {
    id: 99,
    concept: "Red Wine",
    filename: "food_wine.jpg",
    pool: "food",
    prompt: "Red wine being poured into a crystal glass, splash, dark red liquid, elegant.",
    tags: { gestalt: 'Biological', color: 'Warm (Red/Yel)', texture: 'Fluid / Wet', smell: 'Sweet / Food', taste: 'Sweet / Savory', sound: 'Silence', emotion: 'Peaceful' }
  },
  {
    id: 100,
    concept: "Chili Pepper",
    filename: "food_chili.jpg",
    pool: "food",
    prompt: "Red hot chili peppers, smooth skin, spicy food ingredient, fire concept.",
    tags: { gestalt: 'Biological', color: 'Warm (Red/Yel)', texture: 'Hard / Smooth', smell: 'Chemical / City', taste: 'Spicy / Hot', sound: 'Silence', emotion: 'Intense / Scary' }
  }
];

// --- TAG INFERENCE ENGINE ---
// This system programmatically determines specific tags for context-aware pools
// so we don't have to manually rewrite the database.

const inferSpecificTags = (level: LevelData, pool: string): Record<string, string> => {
  // Start with universal tags as base
  const tags = { ...level.tags };
  const concept = level.concept.toLowerCase();
  const filename = level.filename.toLowerCase();

  if (pool === 'animals') {
    // 1. CLASS
    if (filename.includes('marine') || ['shark', 'fish', 'octopus', 'jellyfish', 'turtle'].some(k => concept.includes(k))) tags.class = 'Marine';
    else if (filename.includes('avian') || ['eagle', 'macaw', 'peacock', 'owl', 'swan'].some(k => concept.includes(k))) tags.class = 'Bird';
    else if (filename.includes('insect') || ['butterfly', 'spider', 'bee', 'snail', 'dragonfly'].some(k => concept.includes(k))) tags.class = 'Insect/Bug';
    else tags.class = 'Mammal'; // Default for predator/herbivore

    // 2. DIET
    if (['lion', 'shark', 'wolf', 'tiger', 'eagle', 'spider', 'owl', 'jellyfish', 'octopus'].some(k => concept.includes(k))) tags.diet = 'Carnivore';
    else if (['deer', 'giraffe', 'panda', 'rabbit', 'elephant', 'bee', 'butterfly', 'snail'].some(k => concept.includes(k))) tags.diet = 'Herbivore';
    else if (['bear', 'clownfish', 'macaw'].some(k => concept.includes(k))) tags.diet = 'Omnivore';
    else tags.diet = 'Filter/Scavenger';

    // 3. HABITAT
    if (tags.class === 'Marine' || concept.includes('swan') || concept.includes('water')) tags.habitat = 'Water / Ocean';
    else if (tags.class === 'Bird' || concept.includes('dragonfly') || concept.includes('bee')) tags.habitat = 'Air / Sky';
    else if (['rabbit', 'dog', 'cat'].some(k => concept.includes(k))) tags.habitat = 'Domestic';
    else tags.habitat = 'Land / Forest';
  }

  if (pool === 'structures') {
    // 1. ERA
    if (filename.includes('ruin') || ['pyramid', 'mayan', 'colosseum', 'stonehenge', 'moai'].some(k => concept.includes(k))) tags.era = 'Ancient / Ruin';
    else if (['skyscraper', 'neon', 'modern', 'refinery'].some(k => concept.includes(k))) tags.era = 'Modern / Industrial';
    else if (['temple', 'torii', 'buddhist', 'stained glass', 'library'].some(k => concept.includes(k))) tags.era = 'Classical / Trad';
    else tags.era = 'Modern / Industrial';

    // 2. MATERIAL
    if (concept.includes('glass') || concept.includes('neon') || concept.includes('refinery')) tags.material = 'Metal / Glass';
    else if (concept.includes('wood') || concept.includes('bamboo') || concept.includes('tree')) tags.material = 'Wood / Organic';
    else if (concept.includes('concrete')) tags.material = 'Concrete';
    else tags.material = 'Stone / Brick';

    // 3. TYPE
    if (['home', 'kitchen', 'bedroom', 'fireplace'].some(k => filename.includes(k))) tags.struct_type = 'Dwelling';
    else if (['temple', 'church', 'shrine', 'altar', 'monument', 'pyramid', 'stonehenge'].some(k => concept.toLowerCase().includes(k) || filename.includes('sacred'))) tags.struct_type = 'Monument/Sacred';
    else if (['bridge', 'dam', 'road', 'tracks', 'port', 'wind farm'].some(k => concept.toLowerCase().includes(k) || filename.includes('ind'))) tags.struct_type = 'Infrastructure';
    else tags.struct_type = 'Commercial';
  }

  if (pool === 'landscapes') {
    // 1. ELEMENT
    if (filename.includes('water') || filename.includes('ice') || concept.includes('ocean') || concept.includes('lake')) tags.element = 'Water / Ice';
    else if (filename.includes('land') || filename.includes('desert') || concept.includes('mountain') || concept.includes('canyon')) tags.element = 'Earth / Rock';
    else if (filename.includes('forest') || concept.includes('tree') || concept.includes('jungle') || concept.includes('green')) tags.element = 'Greenery / Plant';
    else tags.element = 'Air / Sky';

    // 2. TEMP
    if (filename.includes('ice') || concept.includes('snow') || concept.includes('frozen')) tags.temp = 'Cold / Frozen';
    else if (filename.includes('desert') || concept.includes('volcano') || concept.includes('dunes')) tags.temp = 'Hot / Arid';
    else if (filename.includes('jungle') || filename.includes('water') || concept.includes('rain')) tags.temp = 'Humid / Tropical';
    else tags.temp = 'Temperate / Mild';

    // 3. LIGHT
    if (concept.includes('night') || concept.includes('cave') || concept.includes('dark')) tags.light = 'Dark / Night';
    else if (concept.includes('storm') || concept.includes('overcast') || concept.includes('fog')) tags.light = 'Overcast / Stormy';
    else if (concept.includes('sunset') || concept.includes('sunrise') || concept.includes('autumn')) tags.light = 'Golden Hour';
    else tags.light = 'Bright / Sunny';
  }

  if (pool === 'objects') {
    // 1. MATERIAL
    if (filename.includes('vehicle') || filename.includes('tech') || filename.includes('tool')) tags.obj_material = 'Metal';
    else if (concept.includes('wood') || concept.includes('paper') || concept.includes('book')) tags.obj_material = 'Wood / Paper';
    else if (concept.includes('glass') || concept.includes('composite') || concept.includes('circuit')) tags.obj_material = 'Composite / Glass';
    else tags.obj_material = 'Plastic / Synthetic';

    // 2. FUNCTION
    if (filename.includes('vehicle') || filename.includes('vessel')) tags.function = 'Transport';
    else if (filename.includes('tool') || filename.includes('tech') || concept.includes('robot')) tags.function = 'Tool / Device';
    else if (concept.includes('statue') || concept.includes('painting') || concept.includes('decor')) tags.function = 'Art / Decor';
    else tags.function = 'Container'; // box, bottle etc, defaulting if unknown

    // 3. COMPLEXITY
    if (concept.includes('circuit') || concept.includes('robot') || concept.includes('engine')) tags.complexity = 'Electronic';
    else if (filename.includes('vehicle') || concept.includes('clock') || concept.includes('camera')) tags.complexity = 'Mechanical';
    else if (concept.includes('ornate') || concept.includes('vintage')) tags.complexity = 'Ornate';
    else tags.complexity = 'Simple / Single';
  }

  if (pool === 'food') {
    // 1. FLAVOR
    if (concept.includes('lemon') || concept.includes('lime') || concept.includes('wine')) tags.flavor = 'Sour / Acidic';
    else if (concept.includes('cake') || concept.includes('chocolate') || concept.includes('fruit')) tags.flavor = 'Sweet';
    else if (concept.includes('chili') || concept.includes('pepper') || concept.includes('coffee')) tags.flavor = 'Bitter / Spicy';
    else tags.flavor = 'Savory / Salty';

    // 2. STATE
    if (concept.includes('wine') || concept.includes('juice') || concept.includes('soup')) tags.state = 'Liquid / Wet';
    else if (concept.includes('cake') || concept.includes('bread') || concept.includes('cream')) tags.state = 'Soft / Creamy';
    else if (concept.includes('cookie') || concept.includes('chip') || concept.includes('nut')) tags.state = 'Crunchy';
    else tags.state = 'Solid / Dry';

    // 3. SOURCE
    if (concept.includes('meat') || concept.includes('fish') || concept.includes('egg')) tags.source = 'Meat / Protein';
    else if (concept.includes('cake') || concept.includes('bread') || concept.includes('pasta')) tags.source = 'Baked / Grain';
    else if (concept.includes('wine') || concept.includes('coffee')) tags.source = 'Beverage';
    else tags.source = 'Plant / Fruit';
  }

  return tags;
};


// --- COMPONENTS ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-slate-900/50 backdrop-blur-md rounded-xl border border-indigo-500/30 shadow-2xl overflow-hidden relative ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = "primary", className = "", disabled = false }: { onClick: () => void, children: React.ReactNode, variant?: 'primary' | 'secondary' | 'outline' | 'danger', className?: string, disabled?: boolean }) => {
  const base = "px-6 py-3 rounded-lg font-serif tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group";
  
  const variants = {
    primary: "bg-indigo-900 text-amber-100 border border-indigo-700 hover:border-amber-500/50 hover:bg-indigo-800 shadow-[0_0_20px_rgba(79,70,229,0.1)]",
    secondary: "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700",
    outline: "border border-slate-600 text-slate-400 hover:border-amber-500/30 hover:text-amber-100 hover:bg-slate-800",
    danger: "bg-red-950/30 text-red-400 border border-red-900/50 hover:bg-red-900/40"
  };
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === 'primary' && <div className="absolute inset-0 bg-linear-to-r from-indigo-500/0 via-amber-500/10 to-indigo-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />}
    </button>
  );
};

// --- MAIN APP COMPONENT ---

export default function SensesApp() {
  // State
  const [view, setView] = useState('welcome'); 
  const [currentLevel, setCurrentLevel] = useState<LevelData | null>(null);
  const [currentConfig, setCurrentConfig] = useState<PoolConfig>(UNIVERSAL_CATEGORIES);
  const [guesses, setGuesses] = useState<Record<string, string>>({});
  const [isRevealed, setIsRevealed] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<any[]>([]);
  const [selectedPool, setSelectedPool] = useState('all');
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('senses_history_v2');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Persist History
  useEffect(() => {
    localStorage.setItem('senses_history_v2', JSON.stringify(history));
  }, [history]);

  // Scoring Logic (Dynamic based on active config)
  const calculateScore = (guesses: Record<string, string>, correctTags: Record<string, string>, config: PoolConfig) => {
    let matched = 0;
    let total = 0;
    
    Object.values(config).forEach(cat => {
      total++;
      // Check if user has made a guess for this category
      if (guesses[cat.id] && guesses[cat.id] === correctTags[cat.id]) {
        matched++;
      }
    });

    return { matched, total, percentage: total === 0 ? 0 : Math.round((matched / total) * 100) };
  };

  // Game Logic
  const startRound = () => {
    // 1. Filter Data by Pool
    const poolData = selectedPool === 'all' 
      ? LEVEL_DATA 
      : LEVEL_DATA.filter(l => l.pool === selectedPool);

    if (poolData.length === 0) return; 

    // 2. Select Target
    let nextLevel;
    do {
      nextLevel = poolData[Math.floor(Math.random() * poolData.length)];
    } while (currentLevel && nextLevel.id === currentLevel.id && poolData.length > 1);

    // 3. Determine Context-Aware Config & Infer Tags
    const activeConfig = POOL_CONFIGS[selectedPool] || POOL_CONFIGS['all'];
    const inferredTags = inferSpecificTags(nextLevel, selectedPool);
    const completeLevel = { ...nextLevel, tags: { ...nextLevel.tags, ...inferredTags } };

    // 4. Reset State
    setCurrentLevel(completeLevel);
    setCurrentConfig(activeConfig);
    setGuesses({});
    setIsRevealed(false);
    
    // 5. Change View
    setView('game');
  };

  const handleGuess = (categoryId: string, option: string) => {
    setGuesses(prev => ({ ...prev, [categoryId]: option }));
  };

  const submitGuesses = () => {
    if (!currentLevel) return;
    setIsRevealed(true);
    const scoreData = calculateScore(guesses, currentLevel.tags, currentConfig);
    
    const resultRecord = {
      timestamp: Date.now(),
      levelId: currentLevel.id,
      score: scoreData,
      guesses: guesses,
      correct: currentLevel.tags,
      pool: currentLevel.pool
    };
    
    setHistory(prev => [resultRecord, ...prev].slice(0, 50)); 
  };

  // --- SUB-VIEWS ---

  const WelcomeView = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 animate-in fade-in duration-1000">
      
      {/* Polished Logo Section */}
      <div className="relative group cursor-default">
        <div className="absolute -inset-8 bg-indigo-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-1000"></div>
        <div className="relative z-10 flex flex-col items-center">
            {/* Horizontal Icon Arrangement */}
            <div className="flex flex-row items-center gap-4 mb-4">
                 <Moon className="w-12 h-12 text-indigo-300 opacity-60" />
                 <Eye className="w-16 h-16 text-amber-100 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]" />
                 <Sun className="w-12 h-12 text-amber-500 opacity-60" />
            </div>
            <h1 className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-linear-to-b from-amber-100 to-amber-600 tracking-widest mb-2">
            REMOTE VIEWING
            </h1>
            <p className="text-indigo-300 font-serif italic tracking-wide text-lg">
            Protocol Omega // Psychic Training Tool
            </p>
        </div>
      </div>

      {/* Intro Text */}
      <div className="max-w-lg mx-auto bg-slate-900/80 p-6 rounded-lg border border-indigo-900/50 text-slate-400 font-light leading-relaxed backdrop-blur-sm">
        <p>
          Connect with the unseen. A target has been hidden behind the veil. 
          Use your intuition to describe its gestalt, sensory data, and energetic signature before it is revealed.
        </p>
      </div>

      {/* Pool Selector */}
      <div className="w-full max-w-lg space-y-3">
          <label className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-serif">Select Target Frequency</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POOLS.map(pool => (
                  <button
                    key={pool.id}
                    onClick={() => setSelectedPool(pool.id)}
                    className={`
                        p-3 rounded border text-xs sm:text-sm font-medium transition-all duration-300
                        ${selectedPool === pool.id 
                            ? 'bg-indigo-900/80 border-amber-500/50 text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                            : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-indigo-500/30 hover:text-indigo-300'}
                    `}
                  >
                      {pool.label}
                  </button>
              ))}
          </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <Button onClick={startRound} className="w-48 text-lg border-amber-500/30">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Initiate
        </Button>
      </div>
    </div>
  );

  const GameView = () => {
    const totalCategories = Object.keys(currentConfig).length;
    const answeredCount = Object.keys(guesses).length;
    const allAnswered = answeredCount === totalCategories;

    if (isRevealed) return <ResultView />;
    if (!currentLevel) return null;

    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 pb-24 animate-in slide-in-from-bottom-8 duration-700">
        
        {/* Header / Target Status */}
        <div className="flex items-center justify-between border-b border-indigo-900/30 pb-4">
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                <span className="font-mono text-xs text-amber-500 tracking-[0.2em]">TARGET COORDINATES LOCKED</span>
            </div>
            <div className="text-indigo-400 text-xs font-serif italic">
                Session ID: {currentLevel.id.toString().padStart(4, '0')} // {currentLevel.pool.toUpperCase()}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: The "Hidden" Card */}
            <div className="lg:col-span-5 flex flex-col gap-4">
                <Card className="aspect-3/4 relative group transition-all duration-500 hover:border-indigo-500/50">
                    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                        <div className="absolute inset-0 bg-indigo-900/10 radial-gradient-mask"></div>
                        
                        <div className="relative z-10 w-32 h-32 mb-8 rounded-full border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                             <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                             <div className="absolute inset-2 border border-amber-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                             <Lock className="w-8 h-8 text-indigo-400/50" />
                        </div>

                        <h2 className="text-2xl font-serif text-slate-300 mb-2">Target Concealed</h2>
                        <p className="text-sm text-slate-500 font-light">
                            Focus your intent. <br/>receive the data streams.
                        </p>
                    </div>
                    {/* Corner accents */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-amber-500/30"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-amber-500/30"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-amber-500/30"></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-amber-500/30"></div>
                </Card>
                
                <div className="bg-slate-900/50 p-4 rounded-lg border border-indigo-900/30">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-indigo-400 uppercase tracking-widest">Signal Strength</span>
                        <span className="text-xs text-amber-500 font-mono">{Math.round((answeredCount/totalCategories)*100)}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-linear-to-r from-indigo-600 to-amber-600 transition-all duration-500"
                            style={{ width: `${(answeredCount/totalCategories)*100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Abort Button */}
                <button 
                  onClick={() => setView('welcome')}
                  className="w-full py-2 flex items-center justify-center gap-2 text-xs text-red-400/60 hover:text-red-400 border border-transparent hover:border-red-900/30 rounded transition-all"
                >
                   <LogOut className="w-3 h-3" /> Abort Session
                </button>
            </div>

            {/* Right Column: Context-Aware Descriptors */}
            <div className="lg:col-span-7 space-y-6">
                 {Object.values(currentConfig).map((cat) => (
                     <div key={cat.id} className="group">
                         <div className="flex items-center gap-2 mb-3">
                             <span className={`w-1 h-1 rounded-full ${guesses[cat.id] ? 'bg-amber-500' : 'bg-slate-700'}`}></span>
                             <h3 className="font-serif text-slate-300 text-sm tracking-wide">{cat.label}</h3>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                             {cat.options.map((opt) => (
                                 <button
                                    key={opt}
                                    onClick={() => handleGuess(cat.id, opt)}
                                    className={`
                                        py-2 px-2 text-[10px] sm:text-xs uppercase tracking-wider rounded border transition-all duration-300
                                        ${guesses[cat.id] === opt 
                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
                                            : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-700 hover:text-slate-300'}
                                    `}
                                 >
                                     {opt.split(' / ')[0]}
                                 </button>
                             ))}
                         </div>
                     </div>
                 ))}
            </div>

        </div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-slate-950 via-slate-950/90 to-transparent flex justify-center z-50 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md">
            <Button 
                onClick={submitGuesses} 
                disabled={!allAnswered} 
                className={`w-full shadow-2xl transition-all duration-500 ${allAnswered ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-2'}`}
            >
                {allAnswered ? "Manifest Truth" : "Awaiting Data Input..."}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const ResultView = () => {
    // State to track if image has finished downloading
    const [imageLoaded, setImageLoaded] = useState(false);

    if (!currentLevel) return null;
    const score = calculateScore(guesses, currentLevel.tags, currentConfig);
    
    // Using standard spaces as requested
    const imageUrl = `/images/senses app images/${currentLevel.filename}`;

    return (
      <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 animate-in zoom-in-95 duration-700">
        
        {/* Top Section: The Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            <Card className="aspect-4/3 md:aspect-square bg-black border-amber-500/20 group relative">
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                         <div className="w-10 h-10 border-2 border-indigo-500/50 border-t-amber-500 rounded-full animate-spin"></div>
                    </div>
                )}
                
                <img 
                    src={imageUrl} 
                    alt="Target" 
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
                
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 p-6">
                    <span className="block text-amber-500 text-xs font-mono mb-1 uppercase tracking-widest">Target Identity Confirmed</span>
                    <h2 className="text-3xl font-serif text-white">{currentLevel.concept}</h2>
                </div>
            </Card>

            <div className="space-y-6">
                <div className="text-center md:text-left space-y-2">
                    <h3 className="text-sm font-serif text-indigo-300 uppercase tracking-[0.2em]">Intuition Accuracy</h3>
                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                        <span className="text-6xl font-light text-white">{score.percentage}</span>
                        <span className="text-2xl text-amber-500">%</span>
                    </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-1 border border-indigo-900/30">
                     <div className="grid grid-cols-3 divide-x divide-indigo-900/30 text-center py-4">
                         <div>
                             <div className="text-xs text-slate-500 uppercase mb-1">Matched</div>
                             <div className="text-xl text-indigo-400 font-mono">{score.matched}</div>
                         </div>
                         <div>
                             <div className="text-xs text-slate-500 uppercase mb-1">Total Datapoints</div>
                             <div className="text-xl text-slate-300 font-mono">{score.total}</div>
                         </div>
                         <div>
                             <div className="text-xs text-slate-500 uppercase mb-1">Pool</div>
                             <div className="text-amber-500/80 font-serif capitalize text-sm pt-1">{currentLevel.pool}</div>
                         </div>
                     </div>
                </div>
                
                <p className="text-slate-400 font-serif italic text-sm leading-relaxed border-l-2 border-indigo-500/30 pl-4">
                    "{currentLevel.prompt}"
                </p>

                <div className="flex gap-4 pt-4">
                    <Button onClick={startRound} className="flex-1">
                        <RefreshCw className="w-4 h-4" /> Next Target
                    </Button>
                    <Button onClick={() => setView('welcome')} variant="outline">
                        Exit
                    </Button>
                </div>
            </div>
        </div>

        {/* Bottom Section: The Analysis */}
        <div className="border-t border-indigo-900/30 pt-8">
            <h3 className="text-center font-serif text-slate-400 text-lg mb-6">Psychic Data Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(currentConfig).map(cat => {
                    const userGuess = guesses[cat.id];
                    const correct = currentLevel.tags[cat.id];
                    const isCorrect = userGuess === correct;

                    return (
                        <div key={cat.id} className={`p-4 rounded border flex flex-col gap-2 ${isCorrect ? 'bg-indigo-950/30 border-indigo-500/30' : 'bg-slate-900/50 border-slate-800'}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">{cat.label}</span>
                                {isCorrect ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-red-500" />}
                            </div>
                            
                            <div className="flex items-center justify-between text-sm mt-1">
                                <span className={`${isCorrect ? 'text-emerald-400' : 'text-red-400 line-through decoration-red-900/50'}`}>
                                    {userGuess || "-"}
                                </span>
                                {!isCorrect && (
                                    <span className="text-indigo-300 text-right">{correct}</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
    );
  };

  const StatsView = () => {
    const totalRounds = history.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avgAccuracy = totalRounds > 0 
      ? Math.round(history.reduce((acc: number, curr: any) => acc + curr.score.percentage, 0) / totalRounds) 
      : 0;

    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right duration-500">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <button onClick={() => setView('welcome')} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Nexus
          </button>
          <h2 className="text-xl font-serif tracking-widest text-amber-500">AKASHIC RECORDS</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-6 text-center bg-slate-900/50 border border-indigo-500/20 rounded-lg">
            <div className="text-3xl font-light text-white mb-2 font-serif">{totalRounds}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Sessions</div>
          </div>
          <div className="p-6 text-center bg-slate-900/50 border border-indigo-500/20 rounded-lg">
            <div className="text-3xl font-light text-indigo-400 mb-2 font-serif">{avgAccuracy}%</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Avg Resonance</div>
          </div>
          <div className="p-6 text-center bg-slate-900/50 border border-indigo-500/20 rounded-lg">
            <div className="text-3xl font-light text-amber-500 mb-2 font-serif">
                {history.filter((h: any) => h.score.percentage >= 80).length}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">High Accuracy</div>
          </div>
        </div>

        <div className="space-y-3">
            <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-4">Recent Transmissions</h3>
            {history.length === 0 ? (
                <div className="text-center py-12 text-slate-600 italic font-serif">The records are empty. Begin your training.</div>
            ) : (
                history.map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/30 rounded border border-slate-800 hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                             <div className={`w-2 h-2 rounded-full ${record.score.percentage >= 60 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                             <div>
                                 <div className="text-slate-300 text-sm font-serif">Target #{record.levelId}</div>
                                 <div className="text-xs text-slate-600 uppercase">{record.pool}</div>
                             </div>
                        </div>
                        <div className="font-mono text-amber-500">{record.score.percentage}%</div>
                    </div>
                ))
            )}
        </div>
      </div>
    );
  };

  const SettingsModal = () => {
    if (!showSettings) return null;

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <Card className="w-full max-w-md bg-slate-950 border border-slate-800">
          <div className="p-6 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif tracking-widest text-indigo-300 flex items-center gap-2">
                <Settings className="w-4 h-4" /> CONFIGURATION
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase text-slate-500 font-bold">Data Management</label>
                    <button 
                        onClick={() => {
                            if(confirm("Purge all akashic records? This cannot be undone.")) {
                                setHistory([]);
                                localStorage.removeItem('senses_history_v2');
                                setShowSettings(false);
                            }
                        }}
                        className="w-full flex items-center justify-between p-3 rounded bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/30 transition-colors"
                    >
                        <span>Purge History Log</span>
                        <Volume2 className="w-4 h-4 opacity-50" />
                    </button>
                </div>

                <div className="text-xs text-slate-600 italic text-center pt-4">
                    System Version 3.1.0 // Context Aware Protocol
                </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // --- RENDER ---
  return (
    <main className="relative min-h-screen w-full bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-100 overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(49,46,129,0.2),rgba(2,6,23,1))]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" />
      </div>
      
      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-indigo-900/10 backdrop-blur-sm">
        <div className="flex items-center gap-6">
           {view === 'welcome' ? (
               <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Return" className="text-xs text-indigo-400/50 hover:text-amber-400 transition-colors" />
           ) : (
               <button 
                onClick={() => setView('welcome')}
                className="flex items-center gap-2 text-xs text-indigo-400/50 hover:text-amber-400 transition-colors"
               >
                   <Home className="w-4 h-4" /> Home
               </button>
           )}
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowSettings(true)} 
             className="p-2 hover:bg-slate-900 rounded-full transition-colors text-indigo-400/50 hover:text-indigo-300"
           >
             <Settings className="w-5 h-5" />
           </button>
           
           <button 
             onClick={() => setView('stats')} 
             className="p-2 hover:bg-slate-900 rounded-full transition-colors text-indigo-400/50 hover:text-amber-500"
           >
             <BarChart2 className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 grow flex flex-col p-4 md:p-8 overflow-y-auto custom-scrollbar">
        {view === 'welcome' && <WelcomeView />}
        {view === 'game' && currentLevel && <GameView />}
        {view === 'result' && <ResultView />}
        {view === 'stats' && <StatsView />}
      </div>

      <SettingsModal />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        
        .font-serif {
            font-family: 'Playfair Display', serif;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #020617; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e1b4b; 
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #312e81; 
        }
        
        .radial-gradient-mask {
            mask-image: radial-gradient(circle, black 40%, transparent 70%);
        }
      `}</style>
    </main>
  );
}