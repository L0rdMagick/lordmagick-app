// --- START OF FILE src/lib/spriteLibrary.ts ---

export interface SpriteInfo {
  x: number;
  y: number;
  incantation: string;
}

export interface SpriteSheet {
  path: string;
  spriteSize: { width: number; height: number };
  sheetSize: { width: number; height: number };
  items: Record<string, SpriteInfo>;
}

const generateGrid = (rows: number, cols: number, spriteWidth: number, spriteHeight: number, names: string[], incantations: string[]): Record<string, SpriteInfo> => {
  const items: Record<string, SpriteInfo> = {};
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      if (index < names.length) {
        const key = names[index].toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/\(|\)/g, ''); // Added replace for parenthesis
        items[key] = { 
            x: -c * spriteWidth, 
            y: -r * spriteHeight,
            incantation: incantations[index] || "Let this component serve my will."
        };
      }
    }
  }
  return items;
};

const SIZE_256 = { width: 256, height: 256 };
const SHEET_SIZE_1024 = { width: 1024, height: 1024 };

const herbs1 = generateGrid(4, 4, 256, 256, 
    [ "Rosemary", "Sage", "Basil", "Lavender", "Bay Leaf", "Mint", "Thyme", "Cinnamon", "Cloves", "Ginger", "Lemongrass", "Chamomile", "Mugwort", "Frankincense", "Myrrh", "Rowan Branch" ],
    [
        "Herb of memory, sharp and bright,\nlend my working your keen sight.",
        "Wisest sage, now lend your might,\ncleanse this space with sacred light.",
        "Leaf of fortune, green and bold,\nmay this spell bring wealth untold.",
        "Flower of peace, serene and deep,\nguard my magic while I sleep.",
        "Leaf of victory, strong and true,\nmake my heartfelt wish come through.",
        "Herb of focus, cool and clear,\nbanish doubt and conquer fear.",
        "Leaf of courage, small and brave,\ngrant the inner strength I crave.",
        "Bark of passion, sweet and warm,\nshield this potent spell from harm.",
        "Bud of power, sharp and fast,\nmake this potent magic last.",
        "Root of fire, fierce and bold,\nlet my story now unfold.",
        "Blade of grass, so sharp and keen,\ncut all ties that are unseen.",
        "Flower of comfort, soft and mild,\nsoothe the heart of a spirit wild.",
        "Herb of vision, moonlit queen,\nshow me what is yet unseen.",
        "Tears of sun, a sacred scent,\nbless this working's true intent.",
        "Resin dark, from bleeding tree,\nseal this spell for all to see.",
        "Branch of Rowan, ward and bind,\nprotect the work of heart and mind."
    ]
);

const crystals1 = generateGrid(4, 4, 256, 256, 
    [ "Clear Quartz", "Amethyst", "Rose Quartz", "Citrine", "Black Tourmaline", "Obsidian", "Selenite", "Labradorite", "Carnelian", "Jade", "Quartz Crystal", "Lapis Lazuli", "Onyx", "Tiger's Eye", "Smoky Quartz", "Aventurine" ],
    [
        "Crystal clear, a focused beam,\namplify my magickal dream.",
        "Stone of spirit, violet flame,\ncalm the mind and speak my name.",
        "Heart of crystal, soft and warm,\nshield my loving spell from harm.",
        "Gem of sunlight, gold and bright,\nfill this working with delight.",
        "Stone of grounding, dark as night,\nbanish all that is not right.",
        "Glass of dragon, sharp and deep,\nall my secrets you will keep.",
        "Moonlit tower, soft and white,\ncleanse this magic with your light.",
        "Stone of cosmos, flash and fire,\nawaken now my true desire.",
        "Gem of courage, orange flame,\nlet me now achieve my aim.",
        "Stone of fortune, green and grand,\nlend a calm and steady hand.",
        "Point of power, sharp and true,\nfocus all that I now do.",
        "Starry stone of deepest blue,\nmake my inner wisdom true.",
        "Stone of strength, a steady shield,\nto no challenge will I yield.",
        "Eye of courage, fierce and bold,\na warrior's story to be told.",
        "Shadow stone that holds the light,\nturn my darkness into might.",
        "Stone of luck, a gentle gleam,\nhelp me manifest my dream."
    ]
);

const tools1 = generateGrid(4, 4, 256, 256, 
    [ "Athame", "Wand", "Chalice", "Cauldron", "Pentacle", "Bell", "Candle", "Mortar & Pestle", "Bowl", "Staff", "Altar", "Besom", "Grimoire", "Cord", "Mirror", "Lantern" ],
    [
        "Blade of air, so sharp and true,\ncut the path for what I do.",
        "Branch of power, straight and tall,\nanswer to my sacred call.",
        "Cup of water, deep and wide,\nhold the magic here inside.",
        "Womb of change, where all is born,\nshape my will 'til break of dawn.",
        "Star of elements, sign of might,\nseal this circle, strong and bright.",
        "Voice of silver, sweet and clear,\nlet the spirits know I'm here.",
        "Flame of focus, burning bright,\nbe a beacon in the night.",
        "Stone on stone, to grind and blend,\non your power I depend.",
        "Vessel sacred, hold this charm,\nkeep it safe from all that harms.",
        "Heart of forest, wise and old,\nlet my power now unfold.",
        "Sacred table, space and stone,\nmake this hallowed place my own.",
        "Broom of branches, sweep and clear,\nonly good may enter here.",
        "Book of shadows, words of might,\nguide my spirit in the night.",
        "Knot of binding, thread of fate,\nmake my magic strong and great.",
        "Glass of vision, scry and see,\nshow the hidden truth to me.",
        "Light in darkness, single flame,\nI invoke you by your name."
    ]
);

const offerings2 = generateGrid(4, 4, 256, 256, 
    [ "Nuts", "Herbs Offering", "Rice", "Tobacco", "Salt", "Sugar", "Grain", "Bread Loaf", "Candle Cluster", "Crystal Offering", "Bell", "Shell", "Bowl of Fire", "Sacred Stone", "Bonsai", "Coin Pile" ],
    [
        "Fruit of earth, a gift I bring,\nlend your strength to the song I sing.",
        "Gathered herbs, a fragrant plea,\nadd your power now to me.",
        "Grain of life, a fertile boon,\nbless this working by the moon.",
        "Sacred smoke, to realms above,\ncarry this offering with my love.",
        "Crystal of the earth and sea,\npurify this space for me.",
        "Grains of sweetness, love and light,\nmake this working pure and bright.",
        "Seed of harvest, staff of life,\nend all sorrow, want, and strife.",
        "Gift of oven, warm and blessed,\nput my spirit to the test.",
        "Cluster of fire, shining bright,\nfill this sacred space with light.",
        "Gift of crystal, earth's deep art,\nbe the focus of my heart.",
        "Gift of sound, a ringing tone,\nlet my humble wishes be known.",
        "Gift of ocean, endless sea,\nbring your mystery to me.",
        "Flame in vessel, wild and free,\nlend your energy to me.",
        "Heart of mountain, ancient stone,\nmake my steadfast purpose known.",
        "Tree of patience, strong and slow,\nhelp my focused magic grow.",
        "Gift of metal, round and bright,\nattract abundance, day and night."
    ]
);

const hoodooMateria1 = generateGrid(4, 4, 256, 256,
    [
        "Alfalfa", "Rosemary", "High John Root", "Bay Leaf",
        "Lodestone", "Pyrite", "Magnetic Sand", "Silver Dime",
        "Goofer Dust", "Salt", "Sulfur", "Brick Dust",
        "Lavender", "Cinnamon Stick", "Personal Concern (Hair)", "Snake Shed"
    ],
    Array(16).fill("The work is grounded.") // Placeholder incantations
);

const voodooOfferings1 = generateGrid(4, 4, 256, 256,
    [
        "Rum", "Cigar", "Sweet Coffee", "Candy",
        "Pink Rose", "Perfume Bottle", "Mirror", "Champagne",
        "Machete (mini)", "Iron Nail", "Red Candle", "Coconut",
        "White Egg", "White Cloth", "Snake Icon", "Top Hat"
    ],
    Array(16).fill("A gift is given.") // Placeholder incantations
);

export const spriteLibrary: Record<string, SpriteSheet> = {
  herbs1: { path: '/images/sprite-sheets/herbs1.png', spriteSize: SIZE_256, sheetSize: SHEET_SIZE_1024, items: herbs1 },
  crystals1: { path: '/images/sprite-sheets/crystals1.png', spriteSize: SIZE_256, sheetSize: SHEET_SIZE_1024, items: crystals1 },
  tools1: { path: '/images/sprite-sheets/tools1.png', spriteSize: SIZE_256, sheetSize: SHEET_SIZE_1024, items: tools1 },
  offerings2: { path: '/images/sprite-sheets/offerings2.png', spriteSize: SIZE_256, sheetSize: SHEET_SIZE_1024, items: offerings2 },
  hoodooMateria1: { path: '/images/sprite-sheets/hoodoo-materia-spritesheet.png', spriteSize: SIZE_256, sheetSize: SHEET_SIZE_1024, items: hoodooMateria1 },
  voodooOfferings1: { path: '/images/sprite-sheets/voodoo-offering-spritesheet.png', spriteSize: SIZE_256, sheetSize: SHEET_SIZE_1024, items: voodooOfferings1 },
};

export const findSprite = (itemName: string): { sheet: SpriteSheet; itemInfo: SpriteInfo; } | null => {
  const normalizedItemName = itemName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/\(|\)/g, '');
  for (const sheetKey in spriteLibrary) {
    const sheet = spriteLibrary[sheetKey];
    if (sheet.items[normalizedItemName]) {
      return {
        sheet,
        itemInfo: sheet.items[normalizedItemName],
      };
    }
  }
  console.warn(`Sprite item "${itemName}" not found in any sheet.`);
  return null;
};
// --- END OF FILE ---