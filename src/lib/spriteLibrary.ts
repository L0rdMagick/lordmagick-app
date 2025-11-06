// --- START OF FILE src/lib/spriteLibrary.ts ---

export interface SpriteInfo {
  x: number;
  y: number;
}

export interface SpriteSheet {
  path: string;
  spriteSize: { width: number; height: number };
  sheetSize: { width: number; height: number };
  items: Record<string, SpriteInfo>;
}

const generateGrid = (rows: number, cols: number, spriteWidth: number, spriteHeight: number, names: string[]): Record<string, SpriteInfo> => {
  const items: Record<string, SpriteInfo> = {};
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      if (index < names.length) {
        const key = names[index].toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
        items[key] = { x: -c * spriteWidth, y: -r * spriteHeight };
      }
    }
  }
  return items;
};

const SIZE_256 = { width: 256, height: 256 };
const SHEET_SIZE_1024 = { width: 1024, height: 1024 };

const herbs1 = generateGrid(4, 4, 256, 256, [ "Rosemary", "Sage", "Basil", "Lavender", "Bay Leaf", "Mint", "Thyme", "Cinnamon", "Cloves", "Ginger", "Lemongrass", "Chamomile", "Mugwort", "Frankincense", "Myrrh", "Rowan Branch" ]);
const crystals1 = generateGrid(4, 4, 256, 256, [ "Clear Quartz", "Amethyst", "Rose Quartz", "Citrine", "Black Tourmaline", "Obsidian", "Selenite", "Labradorite", "Carnelian", "Jade", "Quartz Crystal", "Lapis Lazuli", "Onyx", "Tiger's Eye", "Smoky Quartz", "Aventurine" ]);
const tools1 = generateGrid(4, 4, 256, 256, [ "Athame", "Wand", "Chalice", "Cauldron", "Pentacle", "Bell", "Candle", "Mortar & Pestle", "Bowl", "Staff", "Altar", "Besom", "Grimoire", "Cord", "Mirror", "Lantern" ]);
const offerings2 = generateGrid(4, 4, 256, 256, [ "Nuts", "Herbs Offering", "Rice", "Tobacco", "Salt", "Sugar", "Grain", "Bread Loaf", "Candle Cluster", "Crystal Offering", "Bell", "Shell", "Bowl of Fire", "Sacred Stone", "Bonsai", "Coin Pile" ]);

export const spriteLibrary: Record<string, SpriteSheet> = {
  herbs1: { path: '/images/sprite-sheets/herbs1.png', spriteSize: SIZE_256, sheetSize: SHEET_SIZE_1024, items: herbs1 },
  crystals1: { path: '/images/sprite-sheets/crystals1.png', spriteSize: SIZE_256, sheetSize: SHEET_SIZE_1024, items: crystals1 },
  tools1: { path: '/images/sprite-sheets/tools1.png', spriteSize: SIZE_256, sheetSize: SHEET_SIZE_1024, items: tools1 },
  offerings2: { path: '/images/sprite-sheets/offerings2.png', spriteSize: SIZE_256, sheetSize: SHEET_SIZE_1024, items: offerings2 },
};

export const findSprite = (itemName: string): { sheet: SpriteSheet; itemInfo: SpriteInfo; } | null => {
  const normalizedItemName = itemName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
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