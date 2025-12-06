// --- START OF FILE page.tsx ---

"use client";

import React, { useState, useEffect } from 'react';
import { 
  Settings, RefreshCw, Eye, Check, X, BarChart2, ArrowLeft, 
  Sparkles, Moon, Sun, Lock, Volume2, Home, LogOut, HelpCircle
} from 'lucide-react';
import MagickalBackLink from '@/app/components/MagickalBackLink';

// --- CONFIGURATION ---

const POOLS = [
  { id: 'all', label: 'The Void (All Realms)' },
  { id: 'animals', label: 'Animals' },
  { id: 'structures', label: 'Structures' },
  { id: 'landscapes', label: "Natural Formations" },
  { id: 'objects', label: 'Random Objects' },
  { id: 'food', label: 'Food' }
];

// --- OBJECTIVE SENSORY DEFINITIONS (NEW SCHEMA) ---

type CategoryOption = { id: string; label: string; options: string[] };
type PoolConfig = Record<string, CategoryOption>;

const UNIVERSAL_CATEGORIES: PoolConfig = {
  COLOR: { id: 'color', label: 'Primary Color', options: ['Red / Warm', 'Blue / Cool', 'Green / Nature', 'Grey / B&W'] },
  TEXTURE: { id: 'texture', label: 'Texture', options: ['Furry / Soft', 'Hard / Smooth', 'Rough / Stone', 'Wet / Fluid'] },
  LUMINOSITY: { id: 'luminosity', label: 'Luminosity', options: ['Bright / Day', 'Dark / Night', 'Dim / Shadow', 'Artificial / Neon'] },
  FORM: { id: 'form', label: 'Form', options: ['Organic / Curvy', 'Geometric / Boxy', 'Fluid / Flowing', 'Cluster / Many'] }
};

const POOL_CONFIGS: Record<string, PoolConfig> = {
  all: UNIVERSAL_CATEGORIES,
  animals: {
    CLASS: { id: 'class', label: 'Class', options: ['Mammal', 'Bird', 'Marine', 'Insect'] },
    SKIN: { id: 'skin', label: 'Skin / Surface', options: ['Fur / Hair', 'Feathers', 'Scales / Wet', 'Shell / Exoskeleton'] },
    ACTIVITY: { id: 'activity', label: 'Activity', options: ['Stationary / Resting', 'Moving / Action', 'Swimming', 'Flying'] },
    COLOR: UNIVERSAL_CATEGORIES.COLOR
  },
  structures: {
    MATERIAL: { id: 'material', label: 'Material', options: ['Stone / Brick', 'Metal / Glass', 'Wood / Organic', 'Concrete'] },
    AGE: { id: 'age', label: 'Time Period', options: ['Ancient / Ruin', 'Classical / Trad', 'Modern / Industrial', 'Futuristic'] },
    TYPE: { id: 'struct_type', label: 'Structure Type', options: ['Dwelling / Home', 'Monument / Sacred', 'Infrastructure', 'Commercial / City'] },
    FORM: UNIVERSAL_CATEGORIES.FORM
  },
  landscapes: {
    ELEMENT: { id: 'element', label: 'Dominant Element', options: ['Water / Ice', 'Earth / Rock', 'Greenery / Plant', 'Air / Sky'] },
    TEMP: { id: 'temp', label: 'Temperature (Visual)', options: ['Hot / Arid', 'Cold / Frozen', 'Mild / Temperate', 'Humid / Tropical'] },
    LUMINOSITY: UNIVERSAL_CATEGORIES.LUMINOSITY,
    FORM: UNIVERSAL_CATEGORIES.FORM
  },
  objects: {
    MATERIAL: { id: 'obj_material', label: 'Material', options: ['Metal', 'Wood / Paper', 'Plastic / Synthetic', 'Composite / Glass'] },
    SURFACE: { id: 'surface', label: 'Surface Texture', options: ['Polished / Shiny', 'Matte / Dull', 'Rusted / Weathered', 'Complex / Detailed'] },
    COMPLEXITY: { id: 'complexity', label: 'Complexity', options: ['Simple / Single', 'Mechanical', 'Electronic', 'Ornate / Art'] },
    FORM: UNIVERSAL_CATEGORIES.FORM
  },
  food: {
    TASTE: { id: 'flavor', label: 'Flavor Profile', options: ['Sweet', 'Savory / Salty', 'Sour / Acidic', 'Bitter / Spicy'] },
    TEMP: { id: 'food_temp', label: 'Serving Temp', options: ['Hot / Cooked', 'Cold / Frozen', 'Room Temp', 'Boiling / Steaming'] },
    TEXTURE: { id: 'food_texture', label: 'Mouthfeel', options: ['Crunchy / Hard', 'Soft / Creamy', 'Liquid / Wet', 'Fibrous / Chewy'] },
    COLOR: UNIVERSAL_CATEGORIES.COLOR
  }
};

interface LevelData {
    id: number;
    concept: string;
    filename: string;
    pool: string;
    prompt: string;
    tags: Record<string, string>; // Tags are now generated dynamically at runtime
}

// --- FULL IMAGE DATABASE (100 ITEMS) ---

const LEVEL_DATA: LevelData[] = [
  // --- POOL: ANIMALS ---
  { id: 1, concept: "Roaring Lion", filename: "predator_lion.jpg", pool: "animals", prompt: "Cinematic close up of a male lion roaring, golden hour lighting, savannah background, intense eyes, sharp teeth.", tags: {} },
  { id: 2, concept: "Great White Shark", filename: "predator_shark.jpg", pool: "animals", prompt: "Underwater shot of a great white shark swimming towards camera, deep blue ocean.", tags: {} },
  { id: 3, concept: "Wolf Howling", filename: "predator_wolf.jpg", pool: "animals", prompt: "Grey wolf howling at a full moon, snowy forest night, breath visible.", tags: {} },
  { id: 4, concept: "Tiger Stalking", filename: "predator_tiger.jpg", pool: "animals", prompt: "Bengal tiger walking through tall green grass, orange and black stripes.", tags: {} },
  { id: 5, concept: "Grizzly Bear", filename: "predator_bear.jpg", pool: "animals", prompt: "Massive grizzly bear standing in a river catching a salmon, splashing water.", tags: {} },
  { id: 6, concept: "Deer in Mist", filename: "herbivore_deer.jpg", pool: "animals", prompt: "A deer standing in a misty forest clearing at dawn, soft light, antlers.", tags: {} },
  { id: 7, concept: "Giraffe", filename: "herbivore_giraffe.jpg", pool: "animals", prompt: "Tall giraffe eating leaves from an acacia tree, blue sky background.", tags: {} },
  { id: 8, concept: "Giant Panda", filename: "herbivore_panda.jpg", pool: "animals", prompt: "Giant panda sitting and eating bamboo, black and white fur.", tags: {} },
  { id: 9, concept: "Elephant", filename: "herbivore_elephant.jpg", pool: "animals", prompt: "Close up of an elephant skin texture and eye, trunk raised, dusty environment.", tags: {} },
  { id: 10, concept: "Rabbit", filename: "herbivore_rabbit.jpg", pool: "animals", prompt: "Small white fluffy rabbit sitting in green grass, cute, macro.", tags: {} },
  { id: 11, concept: "Scarlet Macaw", filename: "avian_macaw.jpg", pool: "animals", prompt: "Bright red scarlet macaw parrot flying, colorful feathers, blue sky.", tags: {} },
  { id: 12, concept: "Bald Eagle", filename: "avian_eagle.jpg", pool: "animals", prompt: "Bald eagle soaring high above mountains, wings spread wide.", tags: {} },
  { id: 13, concept: "Peacock", filename: "avian_peacock.jpg", pool: "animals", prompt: "Peacock displaying full tail feathers, iridescent blue and green patterns.", tags: {} },
  { id: 14, concept: "Owl at Night", filename: "avian_owl.jpg", pool: "animals", prompt: "Great horned owl perched on a branch at night, large yellow eyes glowing.", tags: {} },
  { id: 15, concept: "Swan", filename: "avian_swan.jpg", pool: "animals", prompt: "Elegant white swan floating on a calm lake, reflection in water.", tags: {} },
  { id: 16, concept: "Octopus", filename: "marine_octopus.jpg", pool: "animals", prompt: "Red octopus moving underwater, tentacles swirling, suckers visible.", tags: {} },
  { id: 17, concept: "Jellyfish", filename: "marine_jellyfish.jpg", pool: "animals", prompt: "Glowing blue jellyfish floating in deep black water, translucent.", tags: {} },
  { id: 18, concept: "Clownfish", filename: "marine_clownfish.jpg", pool: "animals", prompt: "Orange and white clownfish hiding in a purple anemone.", tags: {} },
  { id: 19, concept: "Sea Turtle", filename: "marine_turtle.jpg", pool: "animals", prompt: "Green sea turtle swimming gracefully underwater, sunbeams from surface.", tags: {} },
  { id: 20, concept: "Koi Fish", filename: "marine_koi.jpg", pool: "animals", prompt: "Top down view of a pond with orange and white koi fish swimming.", tags: {} },
  { id: 21, concept: "Butterfly", filename: "insect_butterfly.jpg", pool: "animals", prompt: "Monarch butterfly resting on a purple flower, macro shot.", tags: {} },
  { id: 22, concept: "Spider Web", filename: "insect_spider.jpg", pool: "animals", prompt: "Black spider sitting in the center of a dew-covered web, morning light.", tags: {} },
  { id: 23, concept: "Honey Bee", filename: "insect_bee.jpg", pool: "animals", prompt: "Honey bee collecting pollen from a yellow sunflower, extreme macro.", tags: {} },
  { id: 24, concept: "Snail", filename: "insect_snail.jpg", pool: "animals", prompt: "Snail crawling on a wet green leaf, spiral shell, slime trail.", tags: {} },
  { id: 25, concept: "Dragonfly", filename: "insect_dragonfly.jpg", pool: "animals", prompt: "Blue metallic dragonfly resting on a reed, wings spread.", tags: {} },

  // --- POOL: STRUCTURES ---
  { id: 26, concept: "Great Pyramid", filename: "ruin_pyramid.jpg", pool: "structures", prompt: "The Great Pyramids of Giza, yellow sand, blue sky.", tags: {} },
  { id: 27, concept: "Stonehenge", filename: "ruin_stonehenge.jpg", pool: "structures", prompt: "Stonehenge stone circle at sunset, green grass, orange sky.", tags: {} },
  { id: 28, concept: "Roman Colosseum", filename: "ruin_colosseum.jpg", pool: "structures", prompt: "Interior view of the Roman Colosseum, broken stone arches.", tags: {} },
  { id: 29, concept: "Mayan Temple", filename: "ruin_mayan.jpg", pool: "structures", prompt: "Chichen Itza Mayan pyramid surrounded by dense green jungle.", tags: {} },
  { id: 30, concept: "Moai Statues", filename: "ruin_moai.jpg", pool: "structures", prompt: "Easter Island Moai heads standing on a grassy hill, overcast.", tags: {} },
  { id: 31, concept: "Glass Skyscraper", filename: "arch_skyscraper.jpg", pool: "structures", prompt: "Looking up at a modern glass skyscraper reflecting the blue sky.", tags: {} },
  { id: 32, concept: "Sydney Opera House", filename: "arch_opera.jpg", pool: "structures", prompt: "Sydney Opera House shells against a blue harbor.", tags: {} },
  { id: 33, concept: "Neon City Street", filename: "arch_neon.jpg", pool: "structures", prompt: "Cyberpunk style city street at night, neon signs in rain.", tags: {} },
  { id: 34, concept: "Minimalist Concrete", filename: "arch_concrete.jpg", pool: "structures", prompt: "Brutalist architecture, raw grey concrete wall.", tags: {} },
  { id: 35, concept: "Suspension Bridge", filename: "arch_bridge.jpg", pool: "structures", prompt: "Golden Gate Bridge in fog, red metal cables.", tags: {} },
  { id: 36, concept: "Oil Refinery", filename: "ind_refinery.jpg", pool: "structures", prompt: "Oil refinery at night with lights and smoke stacks.", tags: {} },
  { id: 37, concept: "Rusted Factory", filename: "ind_factory.jpg", pool: "structures", prompt: "Abandoned factory interior, rusted machinery, broken windows.", tags: {} },
  { id: 38, concept: "Cargo Port", filename: "ind_port.jpg", pool: "structures", prompt: "Aerial view of shipping containers at a port, colorful metal boxes.", tags: {} },
  { id: 39, concept: "Wind Farm", filename: "ind_windfarm.jpg", pool: "structures", prompt: "White wind turbines on a green hill, blue sky.", tags: {} },
  { id: 40, concept: "Train Tracks", filename: "ind_tracks.jpg", pool: "structures", prompt: "Railway tracks vanishing into the distance, gravel, steel rails.", tags: {} },
  { id: 41, concept: "Buddhist Temple", filename: "sacred_buddhist.jpg", pool: "structures", prompt: "Golden Buddhist temple roof with curved edges, incense smoke.", tags: {} },
  { id: 42, concept: "Stained Glass", filename: "sacred_stainedglass.jpg", pool: "structures", prompt: "Detailed stained glass window in a dark church.", tags: {} },
  { id: 43, concept: "Zen Garden", filename: "sacred_zen.jpg", pool: "structures", prompt: "Japanese Zen rock garden, raked white sand patterns.", tags: {} },
  { id: 44, concept: "Candle Altar", filename: "sacred_candles.jpg", pool: "structures", prompt: "Dozens of lit candles in a dark stone room, warm glow.", tags: {} },
  { id: 45, concept: "Torii Gate", filename: "sacred_torii.jpg", pool: "structures", prompt: "Red Torii gate standing in calm water, fog.", tags: {} },
  { id: 46, concept: "Cozy Fireplace", filename: "home_fireplace.jpg", pool: "structures", prompt: "Roaring fire in a stone fireplace, cozy living room.", tags: {} },
  { id: 47, concept: "Modern Kitchen", filename: "home_kitchen.jpg", pool: "structures", prompt: "Clean modern kitchen with marble island, white cabinets.", tags: {} },
  { id: 48, concept: "Old Library", filename: "home_library.jpg", pool: "structures", prompt: "Walls of old leather books in a library, wooden ladder.", tags: {} },
  { id: 49, concept: "Spiral Staircase", filename: "home_stairs.jpg", pool: "structures", prompt: "Looking down a wooden spiral staircase, geometric swirl.", tags: {} },
  { id: 50, concept: "Bedroom Window", filename: "home_window.jpg", pool: "structures", prompt: "View from a cozy bed looking out a window at rain.", tags: {} },

  // --- POOL: LANDSCAPES ---
  { id: 51, concept: "Snowy Peak", filename: "land_mountain.jpg", pool: "landscapes", prompt: "Majestic snow-capped mountain peak against blue sky.", tags: {} },
  { id: 52, concept: "Grand Canyon", filename: "land_canyon.jpg", pool: "landscapes", prompt: "Vast view of the Grand Canyon, red rock layers.", tags: {} },
  { id: 53, concept: "Volcano Eruption", filename: "land_volcano.jpg", pool: "landscapes", prompt: "Volcano erupting lava at night, glowing red magma.", tags: {} },
  { id: 54, concept: "Cave Interior", filename: "land_cave.jpg", pool: "landscapes", prompt: "Inside a limestone cave with stalactites, dark.", tags: {} },
  { id: 55, concept: "Green Hills", filename: "land_hills.jpg", pool: "landscapes", prompt: "Rolling green hills in Ireland, soft grass, overcast.", tags: {} },
  { id: 56, concept: "Tropical Beach", filename: "water_beach.jpg", pool: "landscapes", prompt: "White sand beach with turquoise water, palm tree.", tags: {} },
  { id: 57, concept: "Waterfall", filename: "water_waterfall.jpg", pool: "landscapes", prompt: "Powerful waterfall crashing into a pool, mist rising.", tags: {} },
  { id: 58, concept: "Stormy Ocean", filename: "water_storm.jpg", pool: "landscapes", prompt: "Dark stormy ocean waves crashing, white foam, grey sky.", tags: {} },
  { id: 59, concept: "Frozen Lake", filename: "water_ice.jpg", pool: "landscapes", prompt: "Cracked blue ice on a frozen lake, bubbles trapped in ice.", tags: {} },
  { id: 60, concept: "River Stone", filename: "water_river.jpg", pool: "landscapes", prompt: "Smooth river stones under clear running water.", tags: {} },
  { id: 61, concept: "Redwood Forest", filename: "forest_redwood.jpg", pool: "landscapes", prompt: "Giant redwood trees towering up, sunbeams through mist.", tags: {} },
  { id: 62, concept: "Autumn Path", filename: "forest_autumn.jpg", pool: "landscapes", prompt: "Forest path covered in orange and red autumn leaves.", tags: {} },
  { id: 63, concept: "Jungle Vines", filename: "forest_jungle.jpg", pool: "landscapes", prompt: "Dense tropical jungle, hanging vines, huge green leaves.", tags: {} },
  { id: 64, concept: "Bamboo Grove", filename: "forest_bamboo.jpg", pool: "landscapes", prompt: "Tall green bamboo forest, vertical lines.", tags: {} },
  { id: 65, concept: "Dead Tree", filename: "forest_dead.jpg", pool: "landscapes", prompt: "Lone dead tree in a barren field, twisted branches, grey sky.", tags: {} },
  { id: 66, concept: "Sand Dunes", filename: "desert_dunes.jpg", pool: "landscapes", prompt: "Sahara desert sand dunes, smooth curves, golden sand.", tags: {} },
  { id: 67, concept: "Cracked Earth", filename: "desert_cracked.jpg", pool: "landscapes", prompt: "Dry cracked earth texture, drought, beige clay.", tags: {} },
  { id: 68, concept: "Cactus", filename: "desert_cactus.jpg", pool: "landscapes", prompt: "Close up of a green cactus with sharp spines.", tags: {} },
  { id: 69, concept: "Salt Flats", filename: "desert_salt.jpg", pool: "landscapes", prompt: "Bolivia Salt Flats, endless white ground reflecting the sky.", tags: {} },
  { id: 70, concept: "Oasis", filename: "desert_oasis.jpg", pool: "landscapes", prompt: "Desert oasis with palm trees and a small blue pool.", tags: {} },
  { id: 71, concept: "Iceberg", filename: "ice_iceberg.jpg", pool: "landscapes", prompt: "Massive white and blue iceberg floating in dark ocean.", tags: {} },
  { id: 72, concept: "Snow Flake", filename: "ice_snowflake.jpg", pool: "landscapes", prompt: "Extreme macro of a single unique snowflake, geometric crystal.", tags: {} },
  { id: 73, concept: "Icicles", filename: "ice_icicles.jpg", pool: "landscapes", prompt: "Sharp icicles hanging from a roof edge, glistening.", tags: {} },
  { id: 74, concept: "Aurora Borealis", filename: "ice_aurora.jpg", pool: "landscapes", prompt: "Northern lights aurora borealis, green and purple lights.", tags: {} },
  { id: 75, concept: "Tundra Moss", filename: "ice_tundra.jpg", pool: "landscapes", prompt: "Frozen tundra ground with moss and lichen.", tags: {} },

  // --- POOL: OBJECTS ---
  { id: 76, concept: "Formula 1 Car", filename: "vehicle_racecar.jpg", pool: "objects", prompt: "Red Formula 1 race car speeding on track.", tags: {} },
  { id: 77, concept: "Steam Train", filename: "vehicle_train.jpg", pool: "objects", prompt: "Black steam locomotive train emitting white smoke.", tags: {} },
  { id: 78, concept: "Vintage Tractor", filename: "vehicle_tractor.jpg", pool: "objects", prompt: "Old rusted red tractor in a field.", tags: {} },
  { id: 79, concept: "Motorcycle", filename: "vehicle_motorcycle.jpg", pool: "objects", prompt: "Chrome motorcycle detail, engine block, leather seat.", tags: {} },
  { id: 80, concept: "School Bus", filename: "vehicle_bus.jpg", pool: "objects", prompt: "Classic yellow school bus parked.", tags: {} },
  { id: 81, concept: "Hot Air Balloon", filename: "vessel_balloon.jpg", pool: "objects", prompt: "Colorful hot air balloon floating in blue sky.", tags: {} },
  { id: 82, concept: "Fighter Jet", filename: "vessel_jet.jpg", pool: "objects", prompt: "Grey fighter jet flying at high speed.", tags: {} },
  { id: 83, concept: "Sailboat", filename: "vessel_sailboat.jpg", pool: "objects", prompt: "White sailboat with sails full of wind.", tags: {} },
  { id: 84, concept: "Submarine", filename: "vessel_submarine.jpg", pool: "objects", prompt: "Black submarine surfacing in choppy water.", tags: {} },
  { id: 85, concept: "Space Shuttle", filename: "vessel_shuttle.jpg", pool: "objects", prompt: "Space shuttle launching, massive smoke plume.", tags: {} },
  { id: 86, concept: "Circuit Board", filename: "tech_circuit.jpg", pool: "objects", prompt: "Macro of a green electronic circuit board.", tags: {} },
  { id: 87, concept: "Vinyl Record", filename: "tech_vinyl.jpg", pool: "objects", prompt: "Close up of black vinyl record grooves.", tags: {} },
  { id: 88, concept: "Light Bulb", filename: "tech_bulb.jpg", pool: "objects", prompt: "Edison light bulb glowing filament.", tags: {} },
  { id: 89, concept: "Vintage Camera", filename: "tech_camera.jpg", pool: "objects", prompt: "Old silver and black film camera, leather texture.", tags: {} },
  { id: 90, concept: "Robot Hand", filename: "tech_robot.jpg", pool: "objects", prompt: "White humanoid robot hand, mechanical joints.", tags: {} },
  { id: 91, concept: "Rusty Key", filename: "tool_key.jpg", pool: "objects", prompt: "Old rusty iron skeleton key, textured metal.", tags: {} },
  { id: 92, concept: "Sword", filename: "tool_sword.jpg", pool: "objects", prompt: "Medieval steel sword, shining blade.", tags: {} },
  { id: 93, concept: "Compass", filename: "tool_compass.jpg", pool: "objects", prompt: "Antique brass compass, north needle, glass face.", tags: {} },
  { id: 94, concept: "Paint Palette", filename: "tool_palette.jpg", pool: "objects", prompt: "Artist wooden palette with messy colorful oil paints.", tags: {} },
  { id: 95, concept: "Anchor", filename: "tool_anchor.jpg", pool: "objects", prompt: "Large rusty iron ship anchor sitting on a dock.", tags: {} },

  // --- POOL: FOOD ---
  { id: 96, concept: "Fresh Lemon", filename: "food_lemon.jpg", pool: "food", prompt: "Bright yellow lemon sliced in half, juice droplets.", tags: {} },
  { id: 97, concept: "Coffee Beans", filename: "food_coffee.jpg", pool: "food", prompt: "Pile of roasted brown coffee beans.", tags: {} },
  { id: 98, concept: "Strawberry Cake", filename: "food_cake.jpg", pool: "food", prompt: "Slice of strawberry shortcake with whipped cream.", tags: {} },
  { id: 99, concept: "Red Wine", filename: "food_wine.jpg", pool: "food", prompt: "Red wine being poured into a crystal glass.", tags: {} },
  { id: 100, concept: "Chili Pepper", filename: "food_chili.jpg", pool: "food", prompt: "Red hot chili peppers, smooth skin.", tags: {} }
];

// --- OBJECTIVE INFERENCE ENGINE ---
// Maps images to the new Objective Sensory Schema

const inferSpecificTags = (level: LevelData, pool: string): Record<string, string> => {
  const tags: Record<string, string> = {};
  const concept = level.concept.toLowerCase();
  const filename = level.filename.toLowerCase();
  const prompt = level.prompt.toLowerCase();

  // --- UNIVERSAL TAGS (Applied Logic) ---
  
  // COLOR
  if (['red', 'orange', 'yellow', 'gold', 'lion', 'fire', 'sun', 'autumn', 'desert', 'rust', 'copper', 'candle'].some(k => prompt.includes(k) || concept.includes(k))) tags.color = 'Red / Warm';
  else if (['blue', 'purple', 'cyan', 'ice', 'water', 'sky', 'night', 'shark', 'rain', 'neon'].some(k => prompt.includes(k) || concept.includes(k))) tags.color = 'Blue / Cool';
  else if (['green', 'grass', 'forest', 'jungle', 'leaf', 'bamboo', 'moss', 'circuit', 'turtle', 'cact'].some(k => prompt.includes(k) || concept.includes(k))) tags.color = 'Green / Nature';
  else tags.color = 'Grey / B&W';

  // TEXTURE
  if (pool === 'animals' && !['turtle', 'snail', 'fish', 'shark', 'dolphin', 'jelly', 'octo'].some(k => concept.includes(k))) tags.texture = 'Furry / Soft';
  else if (['metal', 'glass', 'plastic', 'chrome', 'robot', 'car', 'sword', 'ice', 'gem', 'water'].some(k => prompt.includes(k) || concept.includes(k))) tags.texture = 'Hard / Smooth';
  else if (['water', 'rain', 'ocean', 'wine', 'juice', 'soup', 'river', 'ink', 'paint'].some(k => prompt.includes(k) || concept.includes(k))) tags.texture = 'Wet / Fluid';
  else tags.texture = 'Rough / Stone'; // Default for nature/ruins

  // LUMINOSITY
  if (['night', 'cave', 'dark', 'storm', 'space', 'abyss', 'shadow', 'deep'].some(k => prompt.includes(k) || concept.includes(k))) tags.luminosity = 'Dark / Night';
  else if (['neon', 'lamp', 'bulb', 'fire', 'candle', 'glowing', 'monitor', 'screen', 'refinery'].some(k => prompt.includes(k) || concept.includes(k))) tags.luminosity = 'Artificial / Neon';
  else if (['mist', 'fog', 'interior', 'room', 'library', 'church'].some(k => prompt.includes(k) || concept.includes(k))) tags.luminosity = 'Dim / Shadow';
  else tags.luminosity = 'Bright / Day';

  // FORM
  if (pool === 'animals' || ['tree', 'plant', 'flower', 'fruit', 'human'].some(k => prompt.includes(k))) tags.form = 'Organic / Curvy';
  else if (['building', 'structure', 'box', 'screen', 'road', 'rail', 'brick', 'pyramid', 'cube'].some(k => prompt.includes(k) || concept.includes(k))) tags.form = 'Geometric / Boxy';
  else if (['water', 'smoke', 'fire', 'cloud', 'liquid', 'ghost'].some(k => prompt.includes(k) || concept.includes(k))) tags.form = 'Fluid / Flowing';
  else tags.form = 'Cluster / Many'; // gravel, beans, coins

  // --- SPECIFIC POOL LOGIC ---

  if (pool === 'animals') {
    // CLASS
    if (['shark', 'fish', 'octopus', 'jellyfish', 'turtle', 'koi', 'whale'].some(k => concept.includes(k))) tags.class = 'Marine';
    else if (['eagle', 'macaw', 'peacock', 'owl', 'swan'].some(k => concept.includes(k))) tags.class = 'Bird';
    else if (['butterfly', 'spider', 'bee', 'snail', 'dragonfly'].some(k => concept.includes(k))) tags.class = 'Insect';
    else tags.class = 'Mammal';

    // SKIN
    if (tags.class === 'Bird') tags.skin = 'Feathers';
    else if (tags.class === 'Insect' || ['turtle', 'armadillo'].some(k => concept.includes(k))) tags.skin = 'Shell / Exoskeleton';
    else if (tags.class === 'Marine' || ['frog', 'salamander'].some(k => concept.includes(k))) tags.skin = 'Scales / Wet';
    else tags.skin = 'Fur / Hair';

    // ACTIVITY
    if (['rest', 'sit', 'stand', 'wait'].some(k => prompt.includes(k))) tags.activity = 'Stationary / Resting';
    else if (['swim', 'div', 'float'].some(k => prompt.includes(k))) tags.activity = 'Swimming';
    else if (['fly', 'soar', 'wing'].some(k => prompt.includes(k))) tags.activity = 'Flying';
    else tags.activity = 'Moving / Action';
  }

  if (pool === 'structures') {
    // MATERIAL
    if (['glass', 'steel', 'metal', 'iron'].some(k => prompt.includes(k))) tags.material = 'Metal / Glass';
    else if (['wood', 'timber', 'bamboo', 'log'].some(k => prompt.includes(k))) tags.material = 'Wood / Organic';
    else if (['concrete', 'cement', 'brutalist'].some(k => prompt.includes(k))) tags.material = 'Concrete';
    else tags.material = 'Stone / Brick';

    // AGE
    if (['ancient', 'ruin', 'pyramid', 'stonehenge', 'temple', 'castle'].some(k => prompt.includes(k) || concept.includes(k))) tags.age = 'Ancient / Ruin';
    else if (['modern', 'skyscraper', 'neon', 'city', 'future', 'space'].some(k => prompt.includes(k) || concept.includes(k))) tags.age = 'Modern / Industrial';
    else if (['futuristic', 'cyber', 'scifi'].some(k => prompt.includes(k))) tags.age = 'Futuristic';
    else tags.age = 'Classical / Trad';

    // TYPE
    if (['home', 'house', 'kitchen', 'bed', 'living', 'cabin'].some(k => prompt.includes(k) || concept.includes(k))) tags.struct_type = 'Dwelling / Home';
    else if (['temple', 'church', 'shrine', 'altar', 'monument', 'pyramid', 'stonehenge'].some(k => prompt.includes(k) || concept.includes(k))) tags.struct_type = 'Monument / Sacred';
    else if (['bridge', 'dam', 'road', 'tracks', 'port', 'wind', 'refinery'].some(k => prompt.includes(k) || concept.includes(k))) tags.struct_type = 'Infrastructure';
    else tags.struct_type = 'Commercial / City';
  }

  if (pool === 'landscapes') {
    // ELEMENT
    if (['water', 'ocean', 'lake', 'river', 'ice', 'snow', 'rain'].some(k => prompt.includes(k) || concept.includes(k))) tags.element = 'Water / Ice';
    else if (['mountain', 'canyon', 'rock', 'stone', 'desert', 'sand', 'cave'].some(k => prompt.includes(k) || concept.includes(k))) tags.element = 'Earth / Rock';
    else if (['forest', 'tree', 'jungle', 'grass', 'plant'].some(k => prompt.includes(k) || concept.includes(k))) tags.element = 'Greenery / Plant';
    else tags.element = 'Air / Sky';

    // TEMP
    if (['ice', 'snow', 'frozen', 'glacier', 'cold', 'winter'].some(k => prompt.includes(k) || concept.includes(k))) tags.temp = 'Cold / Frozen';
    else if (['desert', 'sun', 'hot', 'fire', 'volcano', 'lava'].some(k => prompt.includes(k) || concept.includes(k))) tags.temp = 'Hot / Arid';
    else if (['jungle', 'rain', 'mist', 'fog', 'tropical'].some(k => prompt.includes(k) || concept.includes(k))) tags.temp = 'Humid / Tropical';
    else tags.temp = 'Mild / Temperate';
  }

  if (pool === 'objects') {
    // MATERIAL
    if (['car', 'train', 'plane', 'metal', 'gold', 'silver', 'brass', 'key', 'sword'].some(k => prompt.includes(k) || concept.includes(k))) tags.obj_material = 'Metal';
    else if (['wood', 'paper', 'book', 'palette'].some(k => prompt.includes(k) || concept.includes(k))) tags.obj_material = 'Wood / Paper';
    else if (['glass', 'bulb', 'composite', 'circuit'].some(k => prompt.includes(k) || concept.includes(k))) tags.obj_material = 'Composite / Glass';
    else tags.obj_material = 'Plastic / Synthetic';

    // SURFACE
    if (['polished', 'chrome', 'clean', 'new', 'glass', 'mirror'].some(k => prompt.includes(k))) tags.surface = 'Polished / Shiny';
    else if (['rust', 'old', 'weathered', 'dirty'].some(k => prompt.includes(k))) tags.surface = 'Rusted / Weathered';
    else if (['circuit', 'ornate', 'detailed', 'complex'].some(k => prompt.includes(k))) tags.surface = 'Complex / Detailed';
    else tags.surface = 'Matte / Dull';

    // COMPLEXITY
    if (['circuit', 'robot', 'computer', 'electronic'].some(k => prompt.includes(k))) tags.complexity = 'Electronic';
    else if (['car', 'train', 'watch', 'camera', 'engine', 'bike'].some(k => prompt.includes(k))) tags.complexity = 'Mechanical';
    else if (['ornate', 'jewelry', 'art', 'decor'].some(k => prompt.includes(k))) tags.complexity = 'Ornate / Art';
    else tags.complexity = 'Simple / Single';
  }

  if (pool === 'food') {
    // FLAVOR
    if (['lemon', 'lime', 'citrus', 'sour', 'wine'].some(k => concept.includes(k))) tags.flavor = 'Sour / Acidic';
    else if (['cake', 'sweet', 'fruit', 'berry', 'chocolate'].some(k => concept.includes(k))) tags.flavor = 'Sweet';
    else if (['chili', 'spicy', 'pepper', 'coffee', 'bitter'].some(k => concept.includes(k))) tags.flavor = 'Bitter / Spicy';
    else tags.flavor = 'Savory / Salty';

    // TEMP
    if (['coffee', 'soup', 'tea', 'fire', 'cook'].some(k => prompt.includes(k))) tags.food_temp = 'Hot / Cooked';
    else if (['ice', 'frozen', 'chill'].some(k => prompt.includes(k))) tags.food_temp = 'Cold / Frozen';
    else if (['boil', 'steam'].some(k => prompt.includes(k))) tags.food_temp = 'Boiling / Steaming';
    else tags.food_temp = 'Room Temp';

    // TEXTURE
    if (['wine', 'juice', 'soup', 'drink'].some(k => concept.includes(k))) tags.food_texture = 'Liquid / Wet';
    else if (['cake', 'bread', 'cream', 'soft'].some(k => concept.includes(k))) tags.food_texture = 'Soft / Creamy';
    else if (['meat', 'steak', 'veg'].some(k => concept.includes(k))) tags.food_texture = 'Fibrous / Chewy';
    else tags.food_texture = 'Crunchy / Hard';
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
    const saved = localStorage.getItem('senses_history_v3_objective');
    if (saved) setHistory(JSON.parse(saved));

    const introSeen = sessionStorage.getItem('senses_intro_seen');
    if (!introSeen) {
        setShowInstructions(true);
    }
  }, []);

  // Persist History
  useEffect(() => {
    localStorage.setItem('senses_history_v3_objective', JSON.stringify(history));
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
      levelId: currentLevel.id,
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
            Remote Viewing Trainer v3.1
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
            <div className="bg-indigo-900/30 px-3 py-1 rounded text-amber-500 text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
                 {currentLevel.pool === 'all' ? 'The Void' : currentLevel.pool}
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
                                localStorage.removeItem('senses_history_v3_objective');
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
                    Remote Viewing Trainer v3.1
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
                                <li><strong className="text-slate-200">Be Objective:</strong> Do not guess "Lion". Sense "Furry", "Warm Color", "Organic Form".</li>
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

// --- END OF FILE page.tsx ---