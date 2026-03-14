// Mock DOM and globals
global.document = {
    getElementById: (id) => null,
    createElement: (tag) => ({ style: {}, appendChild: () => {}, classList: { add: () => {}, remove: () => {} } }),
    body: { appendChild: () => {} },
    head: { appendChild: () => {} },
    addEventListener: () => {}
};
global.window = { addEventListener: () => {} };
global.VIEWPORT_W = 800; global.VIEWPORT_H = 600;
global.SPRITE_SHEETS = {}; global.SPRITES = {};
for (let key of ['wizard', 'witch', 'slime', 'bat', 'crystal_down_stairs', 'shard']) {
    global.SPRITES[key] = { sheet: 'mock', index: 0 };
    global.SPRITES[key.toUpperCase()] = { sheet: 'mock', index: 0 };
}
global.keys = {};
global.playSound = () => {};
global.createParticles = () => {};
global.typeof = (k) => 'object';
global.alert = console.log;
global.distance = (x1, y1, x2, y2) => Math.hypot(x2-x1, y2-y1);

global.toggleFullScreen = () => {};

global.gameState = {
    screen: 'RITUAL_MAP',
    camera: {x:0,y:0},
    enemies: [], projectiles: [], enemyProjectiles: [],
    playerRespawnLoc: 'start', playerRespawnProgress: 'restart',
    inventory: [], currentIngredientIndex: 0, mapStartX: 0, mapStartY: 0
};
global.player = {
    x:0,y:0,w:60,h:60,speed:5,
    hp:100,maxHp:100,mana:100,maxMana:100,
    facing:'down',isLevitating:false,invulnTimer:0,
    frameX:0,frameY:0,flipX:false,isAttacking:false,animTimer:0
};

const fs = require('fs');
eval(fs.readFileSync('c:/Users/danie/Documents/Projects/lordmagick-app/public/games/js/engine.js', 'utf8'));
eval(fs.readFileSync('c:/Users/danie/Documents/Projects/lordmagick-app/public/games/js/ritual-map.js', 'utf8'));

// Test
initRitualMap();

let bat = gameState.enemies.find(e => e.id === 'id_4293');
console.log("FIRST SPAWN: Bat id:", bat ? bat.id : 'not found');

// Simulate killing bat
bat.dead = true;
updateRitualMap(0.16);

// Simulate taking damage twice to die
takeDamage(100, "debug test");

// In respawnPlayer, the modal's Rise Again click should trigger initRitualMap
// Instead of finding document elements, we'll just manually call initRitualMap
initRitualMap();

let bat2 = gameState.enemies.find(e => e.id === 'id_4293');
console.log("SECOND SPAWN: Bat id:", bat2 ? bat2.id : 'not found');

bat2.dead = true;

// Mock showZoneMessage to see if it's called
let messageLog = [];
global.showZoneMessage = (msg) => {
    messageLog.push(msg);
    console.log("MESSAGED CALLED", msg);
};

updateRitualMap(0.16);

// Execute setTimeout manually since it's mocked or node env
setTimeout(() => {
    console.log("Pending timers executed...");
    console.log("Logged Messages:", messageLog);
}, 200);

