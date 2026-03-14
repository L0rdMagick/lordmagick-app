/** DATA ONLY: Contains SPELLS, TILES, SPRITES, and SHEET_SRC. No game logic. */

// Expanded Incantations and Icons
const SPELLS = [
    {
        id: 'love', name: 'Amor Aeterna',
        ingredients: ['Rose Quartz', 'Honey Comb', 'Dove Feather', 'Siren Scale', 'Moon Flower', 'Passion Fruit', 'Heart of Ruby'],
        finalIncantation: "By the powers of Earth and Sky, I release this love into the universe to bind two souls as one!",
        incantations: [
            "I consecrate this Rose Quartz! May it open the gates of the heart to true affection.",
            "I activate this Honey Comb to sweeten the bond and bind the spirit in delight.",
            "Feather of the Dove, carry my intent on gentle wings to the one I seek.",
            "Scale of the Siren, sing the song of the deep to draw my beloved near.",
            "I awaken the Moon Flower to guide us through the darkness of solitude.",
            "Passion Fruit, ignite the divine spark of desire within the soul!",
            "Ruby Heart, I charge you to seal this fate in blood and stone forever!"
        ],
        bosses: [
            { name: 'Narcissus', spriteKey: 'BOSS_NARCISSUS' },
            { name: 'The Moaning Ghost', spriteKey: 'BOSS_MOANING_GHOST' },
            { name: 'The Tin Man', spriteKey: 'BOSS_TIN_MAN' },
            { name: 'Medusa', spriteKey: 'BOSS_MEDUSA' },
            { name: 'The Siren', spriteKey: 'BOSS_SIREN' },
            { name: 'Davy Jones', spriteKey: 'BOSS_DAVY_JONES' },
            { name: 'The Black Widow', spriteKey: 'BOSS_BLACK_WIDOW' }
        ],
        color: '#ff00aa', // Neon Pink (High Vis)
        sheet: 'INGR_1',
        spriteIndices: [0, 1, 2, 3, 4, 5, 6]
    },
    {
        id: 'wealth', name: 'Aurea Fortuna',
        ingredients: ['Fool\'s Gold', 'Clover Leaf', 'Ancient Coin', 'Jade Fragment', 'Golden Apple', 'Dragon Scale', 'Crown Jewel'],
        finalIncantation: "As gold is forged in fire, so shall my fortune be forged in destiny. Wealth flow to me now!",
        incantations: [
            "I consecrate this Gold! Transmute all lack into endless prosperity.",
            "Clover of the fields, awaken the luck of the earth to bless my path.",
            "I activate this Ancient Coin to pay the debt of destiny and clear the way.",
            "Fragment of Jade, grant me the solidity and endurance of true wealth.",
            "Golden Apple, bless my harvest with the sweetness of divine abundance.",
            "Dragon Scale, I charge you to guard my hoard against all who would steal it.",
            "Crown Jewel, I claim my sovereignty over fortune! Let it be so!"
        ],
        bosses: [
            { name: 'The Leprechaun', spriteKey: 'BOSS_LEPRECHAUN' },
            { name: 'King Midas', spriteKey: 'BOSS_KING_MIDAS' },
            { name: 'Ebenezer Scrooge', spriteKey: 'BOSS_EBENEZER_SCROOGE' },
            { name: 'The Harpy', spriteKey: 'BOSS_HARPY' },
            { name: 'Smaug', spriteKey: 'BOSS_SMAUG' },
            { name: 'Atlas', spriteKey: 'BOSS_ATLAS' },
            { name: 'The Void', spriteKey: 'BOSS_THE_VOID' }
        ],
        color: '#ffd700',
        sheet: 'INGR_1',
        spriteIndices: [8, 9, 10, 11, 12, 13, 14]
    },
    {
        id: 'health', name: 'Sanus Vita',
        ingredients: ['Spring Water', 'Ginseng Root', 'Phoenix Ash', 'Vitality Herb', 'Sun Stone', 'Elixir Drop', 'Tree Bark'],
        finalIncantation: "Vigor returns, sickness fades. By this brew, life is renewed and the body made whole!",
        incantations: [
            "I consecrate this Water! Cleanse the spirit and wash away all decay.",
            "Root of the deep earth, ground this vessel and restore its strength.",
            "Ash of the Phoenix, I invoke the power of resurrection from the embers.",
            "Vitality Herb, knit the flesh and mend what has been broken.",
            "Sun Stone, burn away the shadow of illness with your radiant fire!",
            "I activate this Elixir to awaken the dormant power of life within.",
            "Bark of the Elder Tree, shield this body from all harm and time!"
        ],
        bosses: [
            { name: 'The Sloth', spriteKey: 'BOSS_SLOTH' },
            { name: 'Dorian Gray', spriteKey: 'BOSS_DORIAN_GRAY' },
            { name: 'The Hydra', spriteKey: 'BOSS_HYDRA' },
            { name: 'The Golem', spriteKey: 'BOSS_GOLEM' },
            { name: 'The Chimera', spriteKey: 'BOSS_CHIMERA' },
            { name: 'Sisyphus', spriteKey: 'BOSS_SISYPHUS' },
            { name: 'The Grim Reaper', spriteKey: 'BOSS_GRIM_REAPER' }
        ],
        color: '#7cfc00',
        sheet: 'INGR_2',
        spriteIndices: [0, 1, 2, 3, 4, 5, 6]
    },
    {
        id: 'glamour', name: 'Lux Forma',
        ingredients: ['Mirror Shard', 'Peacock Feather', 'Pearl Dust', 'Silk Worm', 'Night Essence', 'Crystal Tear', 'Star Fragment'],
        finalIncantation: "Let the shadows dance and the light reveal. Beauty unbound, shine for all the world to see!",
        incantations: [
            "I consecrate this Mirror to reflect only the truth of my inner radiance.",
            "Feather of the Peacock, command the gaze of all who behold me.",
            "Dust of the Pearl, smooth the edges and bring a glow to the form.",
            "Silk Worm, spin a web of allure that captures every wandering eye.",
            "Essence of Night, I charge you to add mystery and shadow to the light.",
            "Crystal Tear, wash away insecurity and leave only diamond strength.",
            "Star Fragment, fall from the heavens and crown me with starlight!"
        ],
        bosses: [
            { name: 'The Invisible Man', spriteKey: 'BOSS_INVISIBLE_MAN' },
            { name: 'The Step-Sister', spriteKey: 'BOSS_STEP_SISTER' },
            { name: 'The Doppelgänger', spriteKey: 'BOSS_DOPPELGANGER' },
            { name: 'The Gargoyle', spriteKey: 'BOSS_GARGOYLE' },
            { name: 'The Phantom', spriteKey: 'BOSS_PHANTOM' },
            { name: 'Frankenstein\'s Monster', spriteKey: 'BOSS_FRANKENSTEIN' },
            { name: 'Lucifer', spriteKey: 'BOSS_LUCIFER' }
        ],
        color: '#e0ffff',
        sheet: 'INGR_2',
        spriteIndices: [8, 9, 10, 11, 12, 13, 14]
    }
];

const TILES = { GRASS: { color: '#4a8c4a', type: 'walkable' }, WATER: { color: '#4fa4b8', type: 'obstacle' }, MOUNTAIN: { color: '#5c5552', type: 'wall' }, SAND: { color: '#dec47c', type: 'walkable' }, SNOW: { color: '#e8eef2', type: 'walkable' }, SWAMP: { color: '#3e4231', type: 'walkable' } };

const SPRITES = { 
    PLAYER_WITCH: 'witch', 
    PLAYER_WIZARD: 'wizard',
    
    // Enemies 
    SLIME: 'slime',
    BAT: 'bat',
    SPIDER: 'spider',
    GHOST: 'ghost',
    GOBLIN: 'goblin',
    SKELETON: 'skeleton',
    
    // Bosses (legacy)
    BOSS_LOVE: 'cupid',
    BOSS_WEALTH: 'demon',
    BOSS_HEALTH: 'rot_golem',
    BOSS_GLAMOUR: 'mirror_shadow',

    // Progression Bosses - Love
    BOSS_NARCISSUS: 'narcissus',
    BOSS_MOANING_GHOST: 'moaning_ghost',
    BOSS_TIN_MAN: 'tin_man',
    BOSS_MEDUSA: 'medusa',
    BOSS_SIREN: 'siren',
    BOSS_DAVY_JONES: 'davy_jones',
    BOSS_BLACK_WIDOW: 'black_widow',

    // Progression Bosses - Wealth
    BOSS_LEPRECHAUN: 'leprechaun',
    BOSS_KING_MIDAS: 'king_midas',
    BOSS_EBENEZER_SCROOGE: 'ebenezer_scrooge',
    BOSS_HARPY: 'harpy',
    BOSS_SMAUG: 'smaug',
    BOSS_ATLAS: 'atlas',
    BOSS_THE_VOID: 'the_void',

    // Progression Bosses - Health
    BOSS_SLOTH: 'sloth',
    BOSS_DORIAN_GRAY: 'dorian_gray',
    BOSS_HYDRA: 'hydra',
    BOSS_GOLEM: 'golem',
    BOSS_CHIMERA: 'chimera',
    BOSS_SISYPHUS: 'sisyphus',
    BOSS_GRIM_REAPER: 'grim_reaper',

    // Progression Bosses - Glamour
    BOSS_INVISIBLE_MAN: 'invisible_man',
    BOSS_STEP_SISTER: 'step_sister',
    BOSS_DOPPELGANGER: 'doppelganger',
    BOSS_GARGOYLE: 'gargoyle',
    BOSS_PHANTOM: 'phantom',
    BOSS_FRANKENSTEIN: 'frankenstein',
    BOSS_LUCIFER: 'lucifer',

    // Misc (Keep on old sheet for now if not replaced)
    PROJECTILE: { sheet: 'CHARS', index: 12 },
    PORTAL: { sheet: 'CHARS', index: 13 },
    CHEST: { sheet: 'CHARS', index: 14 },
    SPARKLES: { sheet: 'CHARS', index: 15 },
    
    // Environment (Strings for Emoji fallback or Sprite keys if added later)
    TREE: '🌲',
    ROCK: '🪨'
};

// Sprite Sheets
const SHEET_SRC = {
    CHARS: '../images/craft-work/characters_sheet.png', // Legacy/Misc
    INGR_1: '../images/craft-work/ingredients and rewards/ingredients_sheet_1.png',
    INGR_2: '../images/craft-work/ingredients and rewards/ingredients_sheet_2.png',
    
    // New Character Sheets
    witch: '../images/craft-work/characters/witch.png',
    wizard: '../images/craft-work/characters/wizard.png',
    slime: '../images/craft-work/characters/slime.png',
    bat: '../images/craft-work/characters/bat.png',
    spider: '../images/craft-work/characters/spider.png',
    ghost: '../images/craft-work/characters/ghost.png',
    goblin: '../images/craft-work/characters/goblin.png',
    skeleton: '../images/craft-work/characters/skeleton.png',
    
    // Bosses
    cupid: '../images/craft-work/characters/cupid.png',
    demon: '../images/craft-work/characters/demon.png',
    rot_golem: '../images/craft-work/characters/rot_golem.png',
    mirror_shadow: '../images/craft-work/characters/mirror_shadow.png',

    // Love Bosses
    narcissus: '../images/craft-work/characters/Narcissus.png',
    moaning_ghost: '../images/craft-work/characters/Moaning_Ghost.png',
    tin_man: '../images/craft-work/characters/The_Tin_Man.png',
    medusa: '../images/craft-work/characters/Medusa.png',
    siren: '../images/craft-work/characters/The_Siren.png',
    davy_jones: '../images/craft-work/characters/Davy_Jones.png',
    black_widow: '../images/craft-work/characters/The_Black_Widow.png',
    // Wealth Bosses
    leprechaun: '../images/craft-work/characters/The_Leprechaun.png',
    king_midas: '../images/craft-work/characters/King_Midas.png',
    ebenezer_scrooge: '../images/craft-work/characters/Ebenezer_Scrooge.png',
    harpy: '../images/craft-work/characters/The_Harpy.png',
    smaug: '../images/craft-work/characters/Smaug.png',
    atlas: '../images/craft-work/characters/Atlas.png',
    the_void: '../images/craft-work/characters/The_Void.png',
    // Health Bosses
    sloth: '../images/craft-work/characters/The_Sloth.png',
    dorian_gray: '../images/craft-work/characters/Dorian_Gray.png',
    hydra: '../images/craft-work/characters/The_Hydra.png',
    golem: '../images/craft-work/characters/The_Golem.png',
    chimera: '../images/craft-work/characters/The_Chimera.png',
    sisyphus: '../images/craft-work/characters/Sisyphus.png',
    grim_reaper: '../images/craft-work/characters/The_Grim_Reaper.png',
    // Glamour Bosses
    invisible_man: '../images/craft-work/characters/The_Invisible_Man.png',
    step_sister: '../images/craft-work/characters/The_Step-Sister.png',
    doppelganger: '../images/craft-work/characters/The_Doppelgänger.png',
    gargoyle: '../images/craft-work/characters/The_Gargoyle.png',
    phantom: '../images/craft-work/characters/The_Phantom.png',
    frankenstein: '../images/craft-work/characters/Frankensteins_Monster.png',
    lucifer: '../images/craft-work/characters/Lucifer.png',

    // Stage 1 Ritual Map Assets
    crystal_structure: '../images/craft-work/indoor maps/stage 1/crystal_structure_sprite_sheet.png'
};
