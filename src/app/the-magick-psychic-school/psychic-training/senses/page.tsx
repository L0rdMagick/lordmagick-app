// --- START OF FILE page.tsx ---

"use client";

import React, { useState, useEffect } from 'react';
import { 
  Settings, RefreshCw, Eye, Check, X, BarChart2, ArrowLeft, 
  Sparkles, Moon, Sun, Lock, Volume2, Home, LogOut, HelpCircle
} from 'lucide-react';
import MagickalBackLink from '@/app/components/MagickalBackLink';

// --- CONFIGURATION & CATEGORY DEFINITIONS ---

const POOLS = [
  { id: 'all', label: 'The Void (All Realms)' },
  { id: 'animals', label: 'Animals' },
  { id: 'structures', label: 'Structures' },
  { id: 'landscapes', label: "Natural Formations" },
  { id: 'objects', label: 'Random Objects' },
  { id: 'food', label: 'Food' }
];

type CategoryOption = { id: string; label: string; options: string[] };
type PoolConfig = Record<string, CategoryOption>;

// --- NEW HIGH-CONTRAST UNIVERSAL SCHEMA ---
const UNIVERSAL_CATEGORIES: PoolConfig = {
  LUMINOSITY: { 
    id: 'luminosity', 
    label: 'Luminosity', 
    options: ['Bright / Direct', 'Dark / Shadowed', 'Diffused / Hazy', 'Glow / Source'] 
  },
  COLOR: { 
    id: 'color', 
    label: 'Color', 
    options: ['Warm', 'Cool', 'Earthy', 'Monochrome'] 
  },
  TEXTURE: { 
    id: 'texture', 
    label: 'Texture', 
    options: ['Soft / Biological', 'Hard / Smooth', 'Rough / Coarse', 'Fluid / Malleable'] 
  },
  FORM: { 
    id: 'form', 
    label: 'Form', 
    options: ['Biomorphic', 'Architectural', 'Amorphous', 'Composite'] 
  }
};

const POOL_CONFIGS: Record<string, PoolConfig> = {
  all: UNIVERSAL_CATEGORIES,
  animals: {
    CLASS: { id: 'class', label: 'Class', options: ['Mammal', 'Bird', 'Marine', 'Insect'] },
    SKIN: { id: 'skin', label: 'Skin / Surface', options: ['Fur / Hair', 'Feathers', 'Scales / Wet', 'Shell / Exoskeleton'] },
    ACTION: { id: 'action', label: 'Action', options: ['Resting / Still', 'Moving / Active', 'Eating', 'Flying / Swimming'] },
    COLOR: UNIVERSAL_CATEGORIES.COLOR // Contextual visual aid
  },
  structures: {
    MATERIAL: { id: 'material', label: 'Material', options: ['Stone / Brick', 'Metal / Glass', 'Wood / Organic', 'Concrete'] },
    TIME_PERIOD: { id: 'time_period', label: 'Time Period', options: ['Ancient / Ruin', 'Modern / Industrial', 'Traditional', 'Futuristic'] },
    TYPE: { id: 'struct_type', label: 'Structure Type', options: ['Monument / Sacred', 'Dwelling / Home', 'Infrastructure', 'Commercial / City'] },
    FORM: UNIVERSAL_CATEGORIES.FORM
  },
  landscapes: {
    ELEMENT: { id: 'element', label: 'Dominant Element', options: ['Water / Ice', 'Earth / Rock', 'Greenery / Forest', 'Air / Sky'] },
    TEMP: { id: 'temp', label: 'Temperature', options: ['Hot / Arid', 'Cold / Frozen', 'Temperate', 'Tropical / Humid'] },
    LIGHT: { id: 'light', label: 'Lighting', options: ['Sunny / Bright', 'Stormy / Grey', 'Night / Dark', 'Golden Hour'] },
    FORM: UNIVERSAL_CATEGORIES.FORM
  },
  objects: {
    MATERIAL: { id: 'obj_material', label: 'Material', options: ['Metal', 'Wood / Paper', 'Plastic / Glass', 'Fabric / Soft'] },
    FUNCTION: { id: 'function', label: 'Function', options: ['Transport', 'Tool / Device', 'Art / Decor', 'Container'] },
    COMPLEXITY: { id: 'complexity', label: 'Complexity', options: ['Simple / Solid', 'Mechanical', 'Electronic', 'Intricate'] },
    FORM: UNIVERSAL_CATEGORIES.FORM
  },
  food: {
    FLAVOR: { id: 'flavor', label: 'Flavor Profile', options: ['Sweet', 'Savory / Salty', 'Sour / Acidic', 'Spicy / Bitter'] },
    TEMP: { id: 'food_temp', label: 'Serving Temp', options: ['Hot / Warm', 'Cold / Chilled', 'Room Temp', 'Frozen'] },
    TEXTURE: { id: 'food_texture', label: 'Mouthfeel', options: ['Crunchy / Hard', 'Soft / Creamy', 'Liquid / Wet', 'Fibrous'] },
    COLOR: UNIVERSAL_CATEGORIES.COLOR
  }
};

interface LevelData {
    id: number;
    concept: string;
    filename: string;
    pool: string;
    prompt: string;
    tags: Record<string, string>; // Stores Universal Tags by default
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
    tags: { color: 'Warm', texture: 'Soft / Biological', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 2,
    concept: "Great White Shark",
    filename: "predator_shark.jpg",
    pool: "animals",
    prompt: "Underwater shot of a great white shark swimming towards camera, deep blue ocean, light rays breaking through water, sharp teeth visible.",
    tags: { color: 'Cool', texture: 'Hard / Smooth', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },
  {
    id: 3,
    concept: "Wolf Howling",
    filename: "predator_wolf.jpg",
    pool: "animals",
    prompt: "Grey wolf howling at a full moon, snowy forest night, breath visible in cold air, atmospheric, high contrast.",
    tags: { color: 'Monochrome', texture: 'Soft / Biological', luminosity: 'Dark / Shadowed', form: 'Biomorphic' }
  },
  {
    id: 4,
    concept: "Tiger Stalking",
    filename: "predator_tiger.jpg",
    pool: "animals",
    prompt: "Bengal tiger walking through tall green grass, orange and black stripes, intense focus, jungle environment.",
    tags: { color: 'Warm', texture: 'Soft / Biological', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },
  {
    id: 5,
    concept: "Grizzly Bear",
    filename: "predator_bear.jpg",
    pool: "animals",
    prompt: "Massive grizzly bear standing in a river catching a salmon, splashing water, wet fur, nature photography.",
    tags: { color: 'Earthy', texture: 'Fluid / Malleable', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 6,
    concept: "Deer in Mist",
    filename: "herbivore_deer.jpg",
    pool: "animals",
    prompt: "A deer standing in a misty forest clearing at dawn, soft light, antlers, peaceful atmosphere.",
    tags: { color: 'Earthy', texture: 'Soft / Biological', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },
  {
    id: 7,
    concept: "Giraffe",
    filename: "herbivore_giraffe.jpg",
    pool: "animals",
    prompt: "Tall giraffe eating leaves from an acacia tree, blue sky background, sunny day on the African plains.",
    tags: { color: 'Warm', texture: 'Soft / Biological', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 8,
    concept: "Giant Panda",
    filename: "herbivore_panda.jpg",
    pool: "animals",
    prompt: "Giant panda sitting and eating bamboo, black and white fur, green bamboo forest background.",
    tags: { color: 'Monochrome', texture: 'Soft / Biological', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 9,
    concept: "Elephant",
    filename: "herbivore_elephant.jpg",
    pool: "animals",
    prompt: "Close up of an elephant skin texture and eye, trunk raised, dusty environment, wrinkled gray skin.",
    tags: { color: 'Monochrome', texture: 'Rough / Coarse', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 10,
    concept: "Rabbit",
    filename: "herbivore_rabbit.jpg",
    pool: "animals",
    prompt: "Small white fluffy rabbit sitting in green grass, twitching nose, clover flowers, cute, macro photography.",
    tags: { color: 'Monochrome', texture: 'Soft / Biological', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 11,
    concept: "Scarlet Macaw",
    filename: "avian_macaw.jpg",
    pool: "animals",
    prompt: "Bright red scarlet macaw parrot flying, colorful feathers, blue sky, tropical jungle background.",
    tags: { color: 'Warm', texture: 'Soft / Biological', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 12,
    concept: "Bald Eagle",
    filename: "avian_eagle.jpg",
    pool: "animals",
    prompt: "Bald eagle soaring high above mountains, wings spread wide, sharp beak, fierce expression.",
    tags: { color: 'Earthy', texture: 'Soft / Biological', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 13,
    concept: "Peacock",
    filename: "avian_peacock.jpg",
    pool: "animals",
    prompt: "Peacock displaying full tail feathers, iridescent blue and green patterns, majestic pose.",
    tags: { color: 'Cool', texture: 'Soft / Biological', luminosity: 'Bright / Direct', form: 'Composite' }
  },
  {
    id: 14,
    concept: "Owl at Night",
    filename: "avian_owl.jpg",
    pool: "animals",
    prompt: "Great horned owl perched on a branch at night, large yellow eyes glowing, dark forest, moonlight.",
    tags: { color: 'Earthy', texture: 'Soft / Biological', luminosity: 'Dark / Shadowed', form: 'Biomorphic' }
  },
  {
    id: 15,
    concept: "Swan",
    filename: "avian_swan.jpg",
    pool: "animals",
    prompt: "Elegant white swan floating on a calm lake, reflection in water, peaceful, graceful.",
    tags: { color: 'Monochrome', texture: 'Fluid / Malleable', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 16,
    concept: "Octopus",
    filename: "marine_octopus.jpg",
    pool: "animals",
    prompt: "Red octopus moving underwater, tentacles swirling, suckers visible, coral reef background.",
    tags: { color: 'Warm', texture: 'Fluid / Malleable', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },
  {
    id: 17,
    concept: "Jellyfish",
    filename: "marine_jellyfish.jpg",
    pool: "animals",
    prompt: "Glowing blue jellyfish floating in deep black water, translucent, bioluminescent, ethereal.",
    tags: { color: 'Cool', texture: 'Fluid / Malleable', luminosity: 'Glow / Source', form: 'Biomorphic' }
  },
  {
    id: 18,
    concept: "Clownfish",
    filename: "marine_clownfish.jpg",
    pool: "animals",
    prompt: "Orange and white clownfish hiding in a purple anemone, underwater macro photography, vibrant colors.",
    tags: { color: 'Warm', texture: 'Fluid / Malleable', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 19,
    concept: "Sea Turtle",
    filename: "marine_turtle.jpg",
    pool: "animals",
    prompt: "Green sea turtle swimming gracefully underwater, sunbeams from surface, detailed shell texture.",
    tags: { color: 'Earthy', texture: 'Hard / Smooth', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },
  {
    id: 20,
    concept: "Koi Fish",
    filename: "marine_koi.jpg",
    pool: "animals",
    prompt: "Top down view of a pond with orange and white koi fish swimming, lily pads, ripples in water.",
    tags: { color: 'Warm', texture: 'Fluid / Malleable', luminosity: 'Bright / Direct', form: 'Composite' }
  },
  {
    id: 21,
    concept: "Butterfly",
    filename: "insect_butterfly.jpg",
    pool: "animals",
    prompt: "Monarch butterfly resting on a purple flower, macro shot, shallow depth of field, sunny garden.",
    tags: { color: 'Warm', texture: 'Soft / Biological', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 22,
    concept: "Spider Web",
    filename: "insect_spider.jpg",
    pool: "animals",
    prompt: "Black spider sitting in the center of a dew-covered web, morning light, geometric web pattern.",
    tags: { color: 'Monochrome', texture: 'Soft / Biological', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 23,
    concept: "Honey Bee",
    filename: "insect_bee.jpg",
    pool: "animals",
    prompt: "Honey bee collecting pollen from a yellow sunflower, extreme macro, fuzzy texture, bright sunlight.",
    tags: { color: 'Warm', texture: 'Soft / Biological', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 24,
    concept: "Snail",
    filename: "insect_snail.jpg",
    pool: "animals",
    prompt: "Snail crawling on a wet green leaf, spiral shell, slime trail, rain drops, macro.",
    tags: { color: 'Earthy', texture: 'Fluid / Malleable', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },
  {
    id: 25,
    concept: "Dragonfly",
    filename: "insect_dragonfly.jpg",
    pool: "animals",
    prompt: "Blue metallic dragonfly resting on a reed, wings spread, iridescent eyes, pond background.",
    tags: { color: 'Cool', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },

  // --- POOL: STRUCTURES ---
  {
    id: 26,
    concept: "Great Pyramid",
    filename: "ruin_pyramid.jpg",
    pool: "structures",
    prompt: "The Great Pyramids of Giza, yellow sand, blue sky, camels in distance, ancient stone texture.",
    tags: { color: 'Warm', texture: 'Rough / Coarse', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 27,
    concept: "Stonehenge",
    filename: "ruin_stonehenge.jpg",
    pool: "structures",
    prompt: "Stonehenge stone circle at sunset, green grass, orange sky, massive standing stones, mystical.",
    tags: { color: 'Earthy', texture: 'Rough / Coarse', luminosity: 'Bright / Direct', form: 'Composite' }
  },
  {
    id: 28,
    concept: "Roman Colosseum",
    filename: "ruin_colosseum.jpg",
    pool: "structures",
    prompt: "Interior view of the Roman Colosseum, broken stone arches, ancient ruins, sunlight and shadow.",
    tags: { color: 'Warm', texture: 'Rough / Coarse', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 29,
    concept: "Mayan Temple",
    filename: "ruin_mayan.jpg",
    pool: "structures",
    prompt: "Chichen Itza Mayan pyramid surrounded by dense green jungle, stone steps, ancient history.",
    tags: { color: 'Earthy', texture: 'Rough / Coarse', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 30,
    concept: "Moai Statues",
    filename: "ruin_moai.jpg",
    pool: "structures",
    prompt: "Easter Island Moai heads standing on a grassy hill, ocean in background, overcast sky, mysterious.",
    tags: { color: 'Monochrome', texture: 'Rough / Coarse', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },
  {
    id: 31,
    concept: "Glass Skyscraper",
    filename: "arch_skyscraper.jpg",
    pool: "structures",
    prompt: "Looking up at a modern glass skyscraper reflecting the blue sky, geometric lines, corporate architecture.",
    tags: { color: 'Cool', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 32,
    concept: "Sydney Opera House",
    filename: "arch_opera.jpg",
    pool: "structures",
    prompt: "Sydney Opera House shells against a blue harbor, white ceramic tiles, architectural icon, sunny day.",
    tags: { color: 'Monochrome', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 33,
    concept: "Neon City Street",
    filename: "arch_neon.jpg",
    pool: "structures",
    prompt: "Cyberpunk style city street at night, neon signs in rain, wet pavement reflections, futuristic buildings.",
    tags: { color: 'Cool', texture: 'Hard / Smooth', luminosity: 'Glow / Source', form: 'Architectural' }
  },
  {
    id: 34,
    concept: "Minimalist Concrete",
    filename: "arch_concrete.jpg",
    pool: "structures",
    prompt: "Brutalist architecture, raw grey concrete wall with sharp shadows, minimalist, geometric shapes.",
    tags: { color: 'Monochrome', texture: 'Rough / Coarse', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 35,
    concept: "Suspension Bridge",
    filename: "arch_bridge.jpg",
    pool: "structures",
    prompt: "Golden Gate Bridge in fog, red metal cables, spanning over water, engineering marvel.",
    tags: { color: 'Warm', texture: 'Hard / Smooth', luminosity: 'Diffused / Hazy', form: 'Architectural' }
  },
  {
    id: 36,
    concept: "Oil Refinery",
    filename: "ind_refinery.jpg",
    pool: "structures",
    prompt: "Oil refinery at night with lights and smoke stacks, complex pipes, industrial metal structures.",
    tags: { color: 'Monochrome', texture: 'Hard / Smooth', luminosity: 'Glow / Source', form: 'Architectural' }
  },
  {
    id: 37,
    concept: "Rusted Factory",
    filename: "ind_factory.jpg",
    pool: "structures",
    prompt: "Abandoned factory interior, rusted machinery, broken windows, light beams through dust, decay.",
    tags: { color: 'Warm', texture: 'Rough / Coarse', luminosity: 'Diffused / Hazy', form: 'Architectural' }
  },
  {
    id: 38,
    concept: "Cargo Port",
    filename: "ind_port.jpg",
    pool: "structures",
    prompt: "Aerial view of shipping containers at a port, colorful metal boxes, cranes, industrial logistics.",
    tags: { color: 'Cool', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Composite' }
  },
  {
    id: 39,
    concept: "Wind Farm",
    filename: "ind_windfarm.jpg",
    pool: "structures",
    prompt: "White wind turbines on a green hill, blue sky, renewable energy, clean lines, rotating blades.",
    tags: { color: 'Monochrome', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 40,
    concept: "Train Tracks",
    filename: "ind_tracks.jpg",
    pool: "structures",
    prompt: "Railway tracks vanishing into the distance, gravel, steel rails, wooden ties, overcast day.",
    tags: { color: 'Monochrome', texture: 'Rough / Coarse', luminosity: 'Diffused / Hazy', form: 'Architectural' }
  },
  {
    id: 41,
    concept: "Buddhist Temple",
    filename: "sacred_buddhist.jpg",
    pool: "structures",
    prompt: "Golden Buddhist temple roof with curved edges, incense smoke, peaceful courtyard, red columns.",
    tags: { color: 'Warm', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 42,
    concept: "Stained Glass",
    filename: "sacred_stainedglass.jpg",
    pool: "structures",
    prompt: "Detailed stained glass window in a dark church, light shining through creating colorful patterns on floor.",
    tags: { color: 'Cool', texture: 'Hard / Smooth', luminosity: 'Glow / Source', form: 'Architectural' }
  },
  {
    id: 43,
    concept: "Zen Garden",
    filename: "sacred_zen.jpg",
    pool: "structures",
    prompt: "Japanese Zen rock garden, raked white sand patterns, mossy rocks, peaceful meditation space.",
    tags: { color: 'Monochrome', texture: 'Rough / Coarse', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },
  {
    id: 44,
    concept: "Candle Altar",
    filename: "sacred_candles.jpg",
    pool: "structures",
    prompt: "Dozens of lit candles in a dark stone room, warm glow, dripping wax, spiritual atmosphere.",
    tags: { color: 'Warm', texture: 'Fluid / Malleable', luminosity: 'Glow / Source', form: 'Composite' }
  },
  {
    id: 45,
    concept: "Torii Gate",
    filename: "sacred_torii.jpg",
    pool: "structures",
    prompt: "Red Torii gate standing in calm water, Itsukushima shrine, foggy mountains in background, serene.",
    tags: { color: 'Warm', texture: 'Hard / Smooth', luminosity: 'Diffused / Hazy', form: 'Architectural' }
  },
  {
    id: 46,
    concept: "Cozy Fireplace",
    filename: "home_fireplace.jpg",
    pool: "structures",
    prompt: "Roaring fire in a stone fireplace, cozy living room, rug, warm light, winter evening.",
    tags: { color: 'Warm', texture: 'Rough / Coarse', luminosity: 'Glow / Source', form: 'Biomorphic' }
  },
  {
    id: 47,
    concept: "Modern Kitchen",
    filename: "home_kitchen.jpg",
    pool: "structures",
    prompt: "Clean modern kitchen with marble island, stainless steel appliances, white cabinets, bowl of fruit.",
    tags: { color: 'Monochrome', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 48,
    concept: "Old Library",
    filename: "home_library.jpg",
    pool: "structures",
    prompt: "Walls of old leather books in a library, wooden ladder, dust motes, warm lamp light, studious.",
    tags: { color: 'Warm', texture: 'Rough / Coarse', luminosity: 'Diffused / Hazy', form: 'Composite' }
  },
  {
    id: 49,
    concept: "Spiral Staircase",
    filename: "home_stairs.jpg",
    pool: "structures",
    prompt: "Looking down a wooden spiral staircase, geometric swirl, architectural detail, shadows.",
    tags: { color: 'Earthy', texture: 'Hard / Smooth', luminosity: 'Diffused / Hazy', form: 'Architectural' }
  },
  {
    id: 50,
    concept: "Bedroom Window",
    filename: "home_window.jpg",
    pool: "structures",
    prompt: "View from a cozy bed looking out a window at rain, coffee cup on sill, blankets, moody morning.",
    tags: { color: 'Cool', texture: 'Soft / Biological', luminosity: 'Diffused / Hazy', form: 'Architectural' }
  },

  // --- POOL: LANDSCAPES ---
  {
    id: 51,
    concept: "Snowy Peak",
    filename: "land_mountain.jpg",
    pool: "landscapes",
    prompt: "Majestic snow-capped mountain peak against blue sky, jagged rocks, alpine environment, cold.",
    tags: { color: 'Monochrome', texture: 'Rough / Coarse', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 52,
    concept: "Grand Canyon",
    filename: "land_canyon.jpg",
    pool: "landscapes",
    prompt: "Vast view of the Grand Canyon, red rock layers, deep depth, sunset light, arid landscape.",
    tags: { color: 'Warm', texture: 'Rough / Coarse', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 53,
    concept: "Volcano Eruption",
    filename: "land_volcano.jpg",
    pool: "landscapes",
    prompt: "Volcano erupting lava at night, glowing red magma flowing down, black rock, smoke plume.",
    tags: { color: 'Warm', texture: 'Rough / Coarse', luminosity: 'Glow / Source', form: 'Biomorphic' }
  },
  {
    id: 54,
    concept: "Cave Interior",
    filename: "land_cave.jpg",
    pool: "landscapes",
    prompt: "Inside a limestone cave with stalactites and stalagmites, dark, damp, single light source, mysterious.",
    tags: { color: 'Monochrome', texture: 'Rough / Coarse', luminosity: 'Dark / Shadowed', form: 'Biomorphic' }
  },
  {
    id: 55,
    concept: "Green Hills",
    filename: "land_hills.jpg",
    pool: "landscapes",
    prompt: "Rolling green hills in Ireland, soft grass, overcast sky, rural landscape, peaceful.",
    tags: { color: 'Earthy', texture: 'Soft / Biological', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },
  {
    id: 56,
    concept: "Tropical Beach",
    filename: "water_beach.jpg",
    pool: "landscapes",
    prompt: "White sand beach with turquoise water, palm tree shadow, sunny tropical paradise, calm waves.",
    tags: { color: 'Cool', texture: 'Fluid / Malleable', luminosity: 'Bright / Direct', form: 'Amorphous' }
  },
  {
    id: 57,
    concept: "Waterfall",
    filename: "water_waterfall.jpg",
    pool: "landscapes",
    prompt: "Powerful waterfall crashing into a pool, mist rising, green mossy rocks, dynamic water motion.",
    tags: { color: 'Cool', texture: 'Fluid / Malleable', luminosity: 'Diffused / Hazy', form: 'Amorphous' }
  },
  {
    id: 58,
    concept: "Stormy Ocean",
    filename: "water_storm.jpg",
    pool: "landscapes",
    prompt: "Dark stormy ocean waves crashing, white foam, grey sky, dangerous sea condition, cinematic.",
    tags: { color: 'Monochrome', texture: 'Fluid / Malleable', luminosity: 'Diffused / Hazy', form: 'Amorphous' }
  },
  {
    id: 59,
    concept: "Frozen Lake",
    filename: "water_ice.jpg",
    pool: "landscapes",
    prompt: "Cracked blue ice on a frozen lake, bubbles trapped in ice, winter cold, smooth texture.",
    tags: { color: 'Cool', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Amorphous' }
  },
  {
    id: 60,
    concept: "River Stone",
    filename: "water_river.jpg",
    pool: "landscapes",
    prompt: "Smooth river stones under clear running water, ripples, sunlight refracting on bottom, peaceful.",
    tags: { color: 'Earthy', texture: 'Fluid / Malleable', luminosity: 'Bright / Direct', form: 'Composite' }
  },
  {
    id: 61,
    concept: "Redwood Forest",
    filename: "forest_redwood.jpg",
    pool: "landscapes",
    prompt: "Giant redwood trees towering up, sunbeams through mist, fern ground cover, ancient forest.",
    tags: { color: 'Earthy', texture: 'Rough / Coarse', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },
  {
    id: 62,
    concept: "Autumn Path",
    filename: "forest_autumn.jpg",
    pool: "landscapes",
    prompt: "Forest path covered in orange and red autumn leaves, trees changing color, soft fall light.",
    tags: { color: 'Warm', texture: 'Soft / Biological', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },
  {
    id: 63,
    concept: "Jungle Vines",
    filename: "forest_jungle.jpg",
    pool: "landscapes",
    prompt: "Dense tropical jungle, hanging vines, huge green leaves, humidity, dark and green atmosphere.",
    tags: { color: 'Earthy', texture: 'Soft / Biological', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },
  {
    id: 64,
    concept: "Bamboo Grove",
    filename: "forest_bamboo.jpg",
    pool: "landscapes",
    prompt: "Tall green bamboo forest, vertical lines, light filtering through leaves, zen nature.",
    tags: { color: 'Earthy', texture: 'Hard / Smooth', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },
  {
    id: 65,
    concept: "Dead Tree",
    filename: "forest_dead.jpg",
    pool: "landscapes",
    prompt: "Lone dead tree in a barren field, twisted branches, grey sky, desolate landscape, silhouette.",
    tags: { color: 'Monochrome', texture: 'Rough / Coarse', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },
  {
    id: 66,
    concept: "Sand Dunes",
    filename: "desert_dunes.jpg",
    pool: "landscapes",
    prompt: "Sahara desert sand dunes, smooth curves, golden sand, ripples caused by wind, clear sky.",
    tags: { color: 'Warm', texture: 'Soft / Biological', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 67,
    concept: "Cracked Earth",
    filename: "desert_cracked.jpg",
    pool: "landscapes",
    prompt: "Dry cracked earth texture, drought, arid ground, beige clay, detail shot, lifeless.",
    tags: { color: 'Earthy', texture: 'Rough / Coarse', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 68,
    concept: "Cactus",
    filename: "desert_cactus.jpg",
    pool: "landscapes",
    prompt: "Close up of a green cactus with sharp spines, desert background, harsh sunlight, prickly.",
    tags: { color: 'Earthy', texture: 'Rough / Coarse', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 69,
    concept: "Salt Flats",
    filename: "desert_salt.jpg",
    pool: "landscapes",
    prompt: "Bolivia Salt Flats, endless white ground reflecting the sky, mirror effect, ethereal landscape.",
    tags: { color: 'Monochrome', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Amorphous' }
  },
  {
    id: 70,
    concept: "Oasis",
    filename: "desert_oasis.jpg",
    pool: "landscapes",
    prompt: "Desert oasis with palm trees and a small blue pool of water, surrounded by sand, refuge.",
    tags: { color: 'Cool', texture: 'Fluid / Malleable', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 71,
    concept: "Iceberg",
    filename: "ice_iceberg.jpg",
    pool: "landscapes",
    prompt: "Massive white and blue iceberg floating in dark ocean, antarctica, cold, majestic structure.",
    tags: { color: 'Cool', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 72,
    concept: "Snow Flake",
    filename: "ice_snowflake.jpg",
    pool: "landscapes",
    prompt: "Extreme macro of a single unique snowflake, geometric crystal structure, blue background, cold.",
    tags: { color: 'Cool', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 73,
    concept: "Icicles",
    filename: "ice_icicles.jpg",
    pool: "landscapes",
    prompt: "Sharp icicles hanging from a roof edge, glistening in sun, melting drops, winter texture.",
    tags: { color: 'Cool', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 74,
    concept: "Aurora Borealis",
    filename: "ice_aurora.jpg",
    pool: "landscapes",
    prompt: "Northern lights aurora borealis, green and purple lights in night sky, snowy landscape below.",
    tags: { color: 'Earthy', texture: 'Fluid / Malleable', luminosity: 'Glow / Source', form: 'Amorphous' }
  },
  {
    id: 75,
    concept: "Tundra Moss",
    filename: "ice_tundra.jpg",
    pool: "landscapes",
    prompt: "Frozen tundra ground with moss and lichen, patches of snow, rocky, cold desolate landscape.",
    tags: { color: 'Earthy', texture: 'Soft / Biological', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  },

  // --- POOL: OBJECTS ---
  {
    id: 76,
    concept: "Formula 1 Car",
    filename: "vehicle_racecar.jpg",
    pool: "objects",
    prompt: "Red Formula 1 race car speeding on track, motion blur, asphalt, aerodynamic design.",
    tags: { color: 'Warm', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 77,
    concept: "Steam Train",
    filename: "vehicle_train.jpg",
    pool: "objects",
    prompt: "Black steam locomotive train emitting white smoke, vintage, heavy metal wheels, powerful.",
    tags: { color: 'Monochrome', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 78,
    concept: "Vintage Tractor",
    filename: "vehicle_tractor.jpg",
    pool: "objects",
    prompt: "Old rusted red tractor in a field, peeled paint, weathered tires, farming history.",
    tags: { color: 'Warm', texture: 'Rough / Coarse', luminosity: 'Diffused / Hazy', form: 'Architectural' }
  },
  {
    id: 79,
    concept: "Motorcycle",
    filename: "vehicle_motorcycle.jpg",
    pool: "objects",
    prompt: "Chrome motorcycle detail, engine block, leather seat, shiny metal, mechanical power.",
    tags: { color: 'Monochrome', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 80,
    concept: "School Bus",
    filename: "vehicle_bus.jpg",
    pool: "objects",
    prompt: "Classic yellow school bus parked, stop sign extended, front grille view.",
    tags: { color: 'Warm', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 81,
    concept: "Hot Air Balloon",
    filename: "vessel_balloon.jpg",
    pool: "objects",
    prompt: "Colorful hot air balloon floating in blue sky, fabric texture, burner flame, freedom.",
    tags: { color: 'Warm', texture: 'Soft / Biological', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 82,
    concept: "Fighter Jet",
    filename: "vessel_jet.jpg",
    pool: "objects",
    prompt: "Grey fighter jet flying at high speed, afterburners glowing, clouds, military technology.",
    tags: { color: 'Monochrome', texture: 'Hard / Smooth', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 83,
    concept: "Sailboat",
    filename: "vessel_sailboat.jpg",
    pool: "objects",
    prompt: "White sailboat with sails full of wind, blue ocean, leaning hull, adventure.",
    tags: { color: 'Monochrome', texture: 'Soft / Biological', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 84,
    concept: "Submarine",
    filename: "vessel_submarine.jpg",
    pool: "objects",
    prompt: "Black submarine surfacing in choppy water, wet metal, periscope, stealth.",
    tags: { color: 'Monochrome', texture: 'Hard / Smooth', luminosity: 'Diffused / Hazy', form: 'Architectural' }
  },
  {
    id: 85,
    concept: "Space Shuttle",
    filename: "vessel_shuttle.jpg",
    pool: "objects",
    prompt: "Space shuttle launching, massive smoke plume, fire exhaust, pointing towards sky.",
    tags: { color: 'Monochrome', texture: 'Fluid / Malleable', luminosity: 'Bright / Direct', form: 'Architectural' }
  },
  {
    id: 86,
    concept: "Circuit Board",
    filename: "tech_circuit.jpg",
    pool: "objects",
    prompt: "Macro of a green electronic circuit board, gold paths, chips, technology texture.",
    tags: { color: 'Earthy', texture: 'Hard / Smooth', luminosity: 'Diffused / Hazy', form: 'Architectural' }
  },
  {
    id: 87,
    concept: "Vinyl Record",
    filename: "tech_vinyl.jpg",
    pool: "objects",
    prompt: "Close up of black vinyl record grooves, light reflection, spinning on turntable, retro audio.",
    tags: { color: 'Monochrome', texture: 'Hard / Smooth', luminosity: 'Diffused / Hazy', form: 'Architectural' }
  },
  {
    id: 88,
    concept: "Light Bulb",
    filename: "tech_bulb.jpg",
    pool: "objects",
    prompt: "Edison light bulb glowing filament, warm orange light, glass texture, dark background.",
    tags: { color: 'Warm', texture: 'Hard / Smooth', luminosity: 'Glow / Source', form: 'Biomorphic' }
  },
  {
    id: 89,
    concept: "Vintage Camera",
    filename: "tech_camera.jpg",
    pool: "objects",
    prompt: "Old silver and black film camera, lens reflection, leather texture, retro photography.",
    tags: { color: 'Monochrome', texture: 'Hard / Smooth', luminosity: 'Diffused / Hazy', form: 'Architectural' }
  },
  {
    id: 90,
    concept: "Robot Hand",
    filename: "tech_robot.jpg",
    pool: "objects",
    prompt: "White humanoid robot hand, mechanical joints, futuristic technology, clean background.",
    tags: { color: 'Monochrome', texture: 'Hard / Smooth', luminosity: 'Glow / Source', form: 'Architectural' }
  },
  {
    id: 91,
    concept: "Rusty Key",
    filename: "tool_key.jpg",
    pool: "objects",
    prompt: "Old rusty iron skeleton key, textured metal, antique, lying on wood.",
    tags: { color: 'Warm', texture: 'Rough / Coarse', luminosity: 'Diffused / Hazy', form: 'Architectural' }
  },
  {
    id: 92,
    concept: "Sword",
    filename: "tool_sword.jpg",
    pool: "objects",
    prompt: "Medieval steel sword, shining blade, leather hilt, sharp edge, weapon.",
    tags: { color: 'Monochrome', texture: 'Hard / Smooth', luminosity: 'Diffused / Hazy', form: 'Architectural' }
  },
  {
    id: 93,
    concept: "Compass",
    filename: "tool_compass.jpg",
    pool: "objects",
    prompt: "Antique brass compass, north needle, glass face, map background, exploration.",
    tags: { color: 'Warm', texture: 'Hard / Smooth', luminosity: 'Diffused / Hazy', form: 'Architectural' }
  },
  {
    id: 94,
    concept: "Paint Palette",
    filename: "tool_palette.jpg",
    pool: "objects",
    prompt: "Artist wooden palette with messy colorful oil paints, brush, creative mess.",
    tags: { color: 'Warm', texture: 'Fluid / Malleable', luminosity: 'Bright / Direct', form: 'Composite' }
  },
  {
    id: 95,
    concept: "Anchor",
    filename: "tool_anchor.jpg",
    pool: "objects",
    prompt: "Large rusty iron ship anchor sitting on a dock, heavy, nautical texture.",
    tags: { color: 'Monochrome', texture: 'Rough / Coarse', luminosity: 'Bright / Direct', form: 'Architectural' }
  },

  // --- POOL: FOOD ---
  {
    id: 96,
    concept: "Fresh Lemon",
    filename: "food_lemon.jpg",
    pool: "food",
    prompt: "Bright yellow lemon sliced in half, juice droplets, zest, fresh citrus, sunny background.",
    tags: { color: 'Warm', texture: 'Rough / Coarse', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 97,
    concept: "Coffee Beans",
    filename: "food_coffee.jpg",
    pool: "food",
    prompt: "Pile of roasted brown coffee beans, oily texture, aromatic, macro shot.",
    tags: { color: 'Earthy', texture: 'Hard / Smooth', luminosity: 'Diffused / Hazy', form: 'Composite' }
  },
  {
    id: 98,
    concept: "Strawberry Cake",
    filename: "food_cake.jpg",
    pool: "food",
    prompt: "Slice of strawberry shortcake with whipped cream, red berries, fluffy sponge, delicious.",
    tags: { color: 'Warm', texture: 'Soft / Biological', luminosity: 'Bright / Direct', form: 'Biomorphic' }
  },
  {
    id: 99,
    concept: "Red Wine",
    filename: "food_wine.jpg",
    pool: "food",
    prompt: "Red wine being poured into a crystal glass, splash, dark red liquid, elegant.",
    tags: { color: 'Warm', texture: 'Fluid / Malleable', luminosity: 'Diffused / Hazy', form: 'Amorphous' }
  },
  {
    id: 100,
    concept: "Chili Pepper",
    filename: "food_chili.jpg",
    pool: "food",
    prompt: "Red hot chili peppers, smooth skin, spicy food ingredient, fire concept.",
    tags: { color: 'Warm', texture: 'Hard / Smooth', luminosity: 'Diffused / Hazy', form: 'Biomorphic' }
  }
];

// --- OBJECTIVE INFERENCE ENGINE ---
// Derives specific tags based on the logic schema provided

const inferSpecificTags = (level: LevelData, pool: string): Record<string, string> => {
  const tags: Record<string, string> = { ...level.tags };
  const concept = level.concept.toLowerCase();
  const filename = level.filename.toLowerCase();

  // 1. ANIMALS POOL LOGIC
  if (pool === 'animals') {
    if (filename.includes('marine') || concept.includes('shark') || concept.includes('turtle')) {
      tags.class = 'Marine';
      tags.skin = 'Scales / Wet';
      tags.action = 'Flying / Swimming';
    } else if (filename.includes('avian') || concept.includes('macaw') || concept.includes('eagle')) {
      tags.class = 'Bird';
      tags.skin = 'Feathers';
      tags.action = 'Flying / Swimming'; // Defaulting to flying, unless specific context
    } else if (filename.includes('insect')) {
      tags.class = 'Insect';
      tags.skin = 'Shell / Exoskeleton';
      tags.action = 'Moving / Active';
    } else {
      tags.class = 'Mammal';
      tags.skin = 'Fur / Hair';
      tags.action = 'Moving / Active';
      // Specific override mentioned in prompt
      if (concept.includes('sleeping') || concept.includes('resting')) {
          tags.action = 'Resting / Still';
      }
    }
  }

  // 2. STRUCTURES POOL LOGIC
  if (pool === 'structures') {
    if (filename.includes('ruin') || filename.includes('sacred')) {
      tags.time_period = 'Ancient / Ruin';
      tags.material = 'Stone / Brick';
      tags.struct_type = 'Monument / Sacred';
    } else if (filename.includes('arch') || filename.includes('ind')) {
      tags.time_period = 'Modern / Industrial';
      tags.material = 'Metal / Glass';
      tags.struct_type = 'Commercial / City';
    } else if (filename.includes('home')) {
      tags.time_period = 'Traditional';
      tags.material = 'Wood / Organic';
      tags.struct_type = 'Dwelling / Home';
    } else {
        // Fallback for cases not explicitly covered
        tags.time_period = 'Traditional';
        tags.material = 'Stone / Brick';
        tags.struct_type = 'Commercial / City';
    }
  }

  // 3. LANDSCAPES POOL LOGIC
  if (pool === 'landscapes') {
    if (concept.includes('snow') || concept.includes('ice') || concept.includes('frozen')) {
      tags.element = 'Water / Ice';
      tags.temp = 'Cold / Frozen';
    } else if (concept.includes('desert') || concept.includes('canyon') || concept.includes('volcano')) {
      tags.element = 'Earth / Rock';
      tags.temp = 'Hot / Arid';
    } else if (concept.includes('forest') || concept.includes('jungle') || concept.includes('hills')) {
      tags.element = 'Greenery / Forest';
      tags.temp = 'Temperate'; // Or tropical
      if (concept.includes('jungle')) tags.temp = 'Tropical / Humid';
    } else {
      tags.element = 'Air / Sky';
      tags.temp = 'Temperate';
    }
    
    // MAPPING NEW HIGH-CONTRAST LUMINOSITY TO LANDSCAPE LIGHT
    if (tags.luminosity === 'Bright / Direct') tags.light = 'Sunny / Bright';
    else if (tags.luminosity === 'Dark / Shadowed') tags.light = 'Night / Dark';
    else if (tags.luminosity === 'Diffused / Hazy') tags.light = 'Stormy / Grey';
    else if (tags.luminosity === 'Glow / Source') tags.light = 'Golden Hour';
    else tags.light = 'Sunny / Bright';
  }

  // 4. OBJECTS POOL LOGIC
  if (pool === 'objects') {
    if (filename.includes('vehicle') || filename.includes('vessel')) {
      tags.function = 'Transport';
      tags.obj_material = 'Metal';
      tags.complexity = 'Mechanical';
    } else if (filename.includes('tech') || concept.includes('circuit') || concept.includes('robot')) {
      tags.function = 'Tool / Device';
      tags.obj_material = 'Metal';
      tags.complexity = 'Electronic';
    } else if (concept.includes('statue') || concept.includes('paint') || concept.includes('decor')) {
      tags.function = 'Art / Decor';
      tags.obj_material = 'Wood / Paper';
      tags.complexity = 'Simple / Solid';
    } else {
      tags.function = 'Container';
      tags.obj_material = 'Plastic / Glass';
      tags.complexity = 'Simple / Solid';
    }
  }

  // 5. FOOD POOL LOGIC
  if (pool === 'food') {
    if (concept.includes('lemon') || concept.includes('wine')) {
      tags.flavor = 'Sour / Acidic';
      tags.food_texture = concept.includes('wine') ? 'Liquid / Wet' : 'Crunchy / Hard'; 
    } else if (concept.includes('cake') || concept.includes('choc')) {
      tags.flavor = 'Sweet';
      tags.food_texture = 'Soft / Creamy';
    } else if (concept.includes('coffee') || concept.includes('chili')) {
      tags.flavor = 'Spicy / Bitter';
      tags.food_temp = 'Hot / Warm';
    } else {
      tags.flavor = 'Savory / Salty';
    }
    
    // Fallback temps if not set above
    if (!tags.food_temp) {
        if (concept.includes('wine') || concept.includes('lemon')) tags.food_temp = 'Cold / Chilled';
        else tags.food_temp = 'Room Temp';
    }
    if (!tags.food_texture) tags.food_texture = 'Fibrous';
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
  
  // Settings & Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Initialize from LocalStorage & SessionStorage
  useEffect(() => {
    const saved = localStorage.getItem('senses_history_v6_highcontrast');
    if (saved) setHistory(JSON.parse(saved));

    const introSeen = sessionStorage.getItem('senses_intro_seen');
    if (!introSeen) {
        setShowInstructions(true);
    }
  }, []);

  // Persist History
  useEffect(() => {
    localStorage.setItem('senses_history_v6_highcontrast', JSON.stringify(history));
  }, [history]);

  // Scoring Logic
  const calculateScore = (guesses: Record<string, string>, correctTags: Record<string, string>, config: PoolConfig) => {
    let matched = 0;
    let total = 0;
    
    Object.values(config).forEach(cat => {
      total++;
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
      levelId: currentLevel.id, // ID is stored but not shown to user
      score: scoreData,
      guesses: guesses,
      correct: currentLevel.tags,
      pool: currentLevel.pool
    };
    
    setHistory(prev => [resultRecord, ...prev].slice(0, 50)); 
  };

  const closeInstructions = () => {
      sessionStorage.setItem('senses_intro_seen', 'true');
      setShowInstructions(false);
  }

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
            THE ORACLE GATE
            </h1>
            <p className="text-indigo-300 font-serif italic tracking-wide text-lg">
            High-Contrast Remote Viewing Trainer v6
            </p>
        </div>
      </div>

      {/* Intro Text */}
      <div className="max-w-lg mx-auto bg-slate-900/80 p-6 rounded-lg border border-indigo-900/50 text-slate-400 font-light leading-relaxed backdrop-blur-sm">
        <p>
          Attune your inner eye. A target has been veiled from sight. 
          Use your intuition to describe its physical properties before the veil is lifted.
        </p>
      </div>

      {/* Pool Selector */}
      <div className="w-full max-w-lg space-y-3">
          <label className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-serif">Select Your Plane of Focus</label>
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
          Open the Eye
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
        
        {/* Header / Target Status (REFACTORED for Anti-Cheating) */}
        <div className="flex items-center justify-between border-b border-indigo-900/30 pb-4">
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                <span className="font-serif text-sm md:text-base text-amber-100 tracking-wider">Predict the Qualities of the Image</span>
            </div>
            <div className="text-amber-500 text-xl font-bold font-serif uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(245,158,11,0.3)]">
                 {currentLevel.pool === 'all' ? 'THE VOID' : POOLS.find(p => p.id === currentLevel.pool)?.label.toUpperCase()}
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

                        <h2 className="text-2xl font-serif text-slate-300 mb-2">Target Veiled</h2>
                        <p className="text-sm text-slate-500 font-light">
                           No visual data available. <br/>Rely on your inner senses.
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
                        <span className="text-xs text-indigo-400 uppercase tracking-widest">Resonance</span>
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
                   <LogOut className="w-3 h-3" /> Sever Connection
                </button>
            </div>

            {/* Right Column: Context-Aware Descriptors */}
            <div className="lg:col-span-7 space-y-6">
                 {/* Instructional Text */}
                 <div className="bg-indigo-950/20 p-4 rounded border-l-2 border-amber-500/50 mb-6">
                     <p className="text-indigo-200 text-sm font-light italic">
                         "Tune into the target. Select the sensory details that describe its physical reality."
                     </p>
                 </div>

                 {Object.values(currentConfig).map((cat) => (
                     <div key={cat.id} className="group">
                         <div className="flex items-center gap-2 mb-3">
                             <span className={`w-1 h-1 rounded-full ${guesses[cat.id] ? 'bg-amber-500' : 'bg-slate-700'}`}></span>
                             <h3 className="font-serif text-slate-200 text-base tracking-wide font-medium">{cat.label}</h3>
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                             {cat.options.map((opt) => (
                                 <button
                                    key={opt}
                                    onClick={() => handleGuess(cat.id, opt)}
                                    className={`
                                        py-3 px-3 text-xs uppercase tracking-wider rounded border transition-all duration-300
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
                {allAnswered ? "Pierce the Veil" : "Awaiting Resonance..."}
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
                    <span className="block text-amber-500 text-xs font-mono mb-1 uppercase tracking-widest">Vision Confirmed</span>
                    <h2 className="text-3xl font-serif text-white">{currentLevel.concept}</h2>
                </div>
            </Card>

            <div className="space-y-6">
                <div className="text-center md:text-left space-y-2">
                    <h3 className="text-sm font-serif text-indigo-300 uppercase tracking-[0.2em]">Clairvoyance Accuracy</h3>
                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                        <span className="text-6xl font-light text-white">{score.percentage}</span>
                        <span className="text-2xl text-amber-500">%</span>
                    </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-1 border border-indigo-900/30">
                     <div className="grid grid-cols-3 divide-x divide-indigo-900/30 text-center py-4">
                         <div>
                             <div className="text-xs text-slate-500 uppercase mb-1">Aligned</div>
                             <div className="text-xl text-indigo-400 font-mono">{score.matched}</div>
                         </div>
                         <div>
                             <div className="text-xs text-slate-500 uppercase mb-1">Elements</div>
                             <div className="text-xl text-slate-300 font-mono">{score.total}</div>
                         </div>
                         <div>
                             <div className="text-xs text-slate-500 uppercase mb-1">Plane</div>
                             <div className="text-amber-500/80 font-serif capitalize text-sm pt-1">{currentLevel.pool}</div>
                         </div>
                     </div>
                </div>
                
                <p className="text-slate-400 font-serif italic text-sm leading-relaxed border-l-2 border-indigo-500/30 pl-4">
                    "{currentLevel.prompt}"
                </p>

                <div className="flex gap-4 pt-4">
                    <Button onClick={startRound} className="flex-1">
                        <RefreshCw className="w-4 h-4" /> Next Vision
                    </Button>
                    <Button onClick={() => setView('welcome')} variant="outline">
                        Exit Trance
                    </Button>
                </div>
            </div>
        </div>

        {/* Bottom Section: The Analysis */}
        <div className="border-t border-indigo-900/30 pt-8">
            <h3 className="text-center font-serif text-slate-400 text-lg mb-6">Objective Sensory Analysis</h3>
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
            <ArrowLeft className="w-4 h-4" /> Back to Gate
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
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Ascended</div>
          </div>
        </div>

        <div className="space-y-3">
            <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-4">Past Visions</h3>
            {history.length === 0 ? (
                <div className="text-center py-12 text-slate-600 italic font-serif">The records are empty. Begin your training.</div>
            ) : (
                history.map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/30 rounded border border-slate-800 hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                             <div className={`w-2 h-2 rounded-full ${record.score.percentage >= 60 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                             <div>
                                 <div className="text-slate-300 text-sm font-serif">Vision Log #{idx + 1}</div>
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
                                localStorage.removeItem('senses_history_v6_highcontrast');
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
                    Remote Viewing Trainer v6
                </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const InstructionModal = () => {
      if (!showInstructions) return null;

      return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-110 flex items-center justify-center p-4 animate-in fade-in duration-500">
            <Card className="w-full max-w-lg bg-slate-950 border border-indigo-500/30">
                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <Eye className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
                        <h2 className="text-2xl font-serif text-amber-100 tracking-widest">ATTUNING THE INNER EYE</h2>
                    </div>

                    <div className="space-y-4 text-slate-300 font-light leading-relaxed text-sm">
                        <p>
                            Welcome, Seer. This tool is designed to sharpen your remote viewing capabilities.
                        </p>
                        <div className="bg-indigo-950/30 p-4 rounded border border-indigo-900/50">
                            <h3 className="text-indigo-300 font-bold uppercase text-xs mb-2">How it Works</h3>
                            <p>An image has been hidden behind the veil. Your task is not to 'guess' the picture, but to <span className="text-amber-400 font-medium">sense</span> its physical facts.</p>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-amber-500 font-serif uppercase tracking-widest text-xs">The Process</h3>
                            <ul className="space-y-2 list-disc pl-4 text-slate-400">
                                <li><strong className="text-slate-200">Center Yourself:</strong> Take a deep breath. Clear your mind.</li>
                                <li><strong className="text-slate-200">Be Objective:</strong> Do not guess "Lion". Sense "Warm Color", "Biomorphic Form".</li>
                                <li><strong className="text-slate-200">Select a Realm:</strong> Choose a specific category to focus your practice.</li>
                            </ul>
                        </div>
                        
                        <p className="text-center italic text-indigo-400 pt-2">"True sight comes when the mind is silent."</p>
                    </div>

                    <Button onClick={closeInstructions} className="w-full">
                        Begin Ritual
                    </Button>
                </div>
            </Card>
        </div>
      )
  }

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
        
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowInstructions(true)} 
             className="p-2 hover:bg-slate-900 rounded-full transition-colors text-indigo-400/50 hover:text-amber-400"
             title="Instructions"
           >
             <HelpCircle className="w-5 h-5" />
           </button>

           <button 
             onClick={() => setShowSettings(true)} 
             className="p-2 hover:bg-slate-900 rounded-full transition-colors text-indigo-400/50 hover:text-indigo-300"
             title="Settings"
           >
             <Settings className="w-5 h-5" />
           </button>
           
           <button 
             onClick={() => setView('stats')} 
             className="p-2 hover:bg-slate-900 rounded-full transition-colors text-indigo-400/50 hover:text-amber-500"
             title="Akashic Records"
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
      <InstructionModal />

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