/**
 * Audio System
 */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;

    if (type === 'shoot') {
        osc.type = 'square'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now); gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'splash') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(50, now+0.5);
        gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.linearRampToValueAtTime(0, now+0.5);
        osc.start(now); osc.stop(now+0.5);
    } else if (type === 'stir') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(100, now); 
        gainNode.gain.setValueAtTime(0.02, now); gainNode.gain.linearRampToValueAtTime(0, now+0.1);
        osc.start(now); osc.stop(now+0.1);
    } else if (type === 'lap_complete') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(800, now+0.3);
        gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0, now+0.3);
        osc.start(now); osc.stop(now+0.3);
    } else if (type === 'collect') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.setValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'monster_groan') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(80, now); osc.frequency.linearRampToValueAtTime(60, now + 0.5);
        gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.8);
        osc.start(now); osc.stop(now + 0.8);
    } else if (type === 'monster_hiss') { // Spiders/Snakes
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'monster_rattle') { // Skeletons
        osc.type = 'square'; osc.frequency.setValueAtTime(150, now); 
        gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'monster_squeak') { // Bats
        osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.linearRampToValueAtTime(1500, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'final_magic') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(200, now); osc.frequency.linearRampToValueAtTime(800, now + 2.0);
        gainNode.gain.setValueAtTime(0.0, now); gainNode.gain.linearRampToValueAtTime(0.3, now + 1.0); gainNode.gain.linearRampToValueAtTime(0, now + 3.0);
        osc.start(now); osc.stop(now + 3.0);
    } else if (type === 'shimmer') {
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(600, now);
        for(let i=0; i<40; i++) { osc.frequency.linearRampToValueAtTime(600 + (i%2==0 ? 100 : -100), now + (i*0.1)); }
        osc.frequency.linearRampToValueAtTime(2000, now + 4.0);
        gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0.2, now + 2.0); gainNode.gain.linearRampToValueAtTime(0, now + 4.0);
        osc.start(now); osc.stop(now + 4.0);
    } else if (type === 'portal') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 1.0);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 1.0);
        osc.start(now);
        osc.stop(now + 1.0);
    } else if (type === 'hit_player') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.2);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

function toggleFullScreen() {
    const el = document.getElementById('game-container');
    if (!document.fullscreenElement) {
        el.requestFullscreen().catch(err => { alert(`Error: ${err.message}`); });
    } else { document.exitFullscreen(); }
}

const TILE_SIZE = 40; const MAP_WIDTH = 100; const MAP_HEIGHT = 100;
let VIEWPORT_W = window.innerWidth; 
let VIEWPORT_H = window.innerHeight;

// Expanded Incantations and Icons
const SPELLS = [
    {
        id: 'love', name: 'Amor Aeterna',
        ingredients: ['Rose Quartz', 'Honey Comb', 'Dove Feather', 'Siren Scale', 'Moon Flower', 'Passion Fruit', 'Heart of Ruby'],
        icons: ['💎', '🍯', '🪶', '🧜♀️', '🌼', '🥥', '❤️'],
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
        boss: 'Cupid\'s Shadow', color: '#ff69b4'
    },
    {
        id: 'wealth', name: 'Aurea Fortuna',
        ingredients: ['Fool\'s Gold', 'Clover Leaf', 'Ancient Coin', 'Jade Fragment', 'Golden Apple', 'Dragon Scale', 'Crown Jewel'],
        icons: ['✨', '🍀', '🪙', '🟢', '🍎', '🐉', '👑'],
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
        boss: 'The Greed Demon', color: '#ffd700'
    },
    {
        id: 'health', name: 'Sanus Vita',
        ingredients: ['Spring Water', 'Ginseng Root', 'Phoenix Ash', 'Vitality Herb', 'Sun Stone', 'Elixir Drop', 'Tree Bark'],
        icons: ['💧', '🥕', '🌋', '🌿', '☀️', '⚗️', '🪵'],
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
        boss: 'The Rot Golem', color: '#7cfc00'
    },
    {
        id: 'glamour', name: 'Lux Forma',
        ingredients: ['Mirror Shard', 'Peacock Feather', 'Pearl Dust', 'Silk Worm', 'Night Essence', 'Crystal Tear', 'Star Fragment'],
        icons: ['🪞', '🦚', '⚪', '🐛', '🌑', '💧', '⭐'],
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
        boss: 'The Mirror Shadow', color: '#e0ffff'
    }
];

const TILES = { GRASS: { color: '#4a8c4a', type: 'walkable' }, WATER: { color: '#4fa4b8', type: 'obstacle' }, MOUNTAIN: { color: '#5c5552', type: 'wall' }, SAND: { color: '#dec47c', type: 'walkable' }, SNOW: { color: '#e8eef2', type: 'walkable' }, SWAMP: { color: '#3e4231', type: 'walkable' } };
const SPRITES = { 
    PLAYER_WITCH: '🧙♀️', PLAYER_WIZARD: '🧙♂️', 
    ITEM: '✨', PORTAL: '🌀', TREE: '🌲', ROCK: '🪨',
    // Monster Progression
    MONSTERS: ['🦠', '🦇', '🕷️', '👻', '👺', '💀', '👹'] // Slime, Bat, Spider, Ghost, Goblin, Skeleton, Boss
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = {
    screen: 'START', playerClass: 'witch', playerName: '', selectedSpell: null,
    currentIngredientIndex: 0, inventory: [], map: [], enemies: [], particles: [], projectiles: [], enemyProjectiles: [],
    camera: { x: 0, y: 0 }, lastTime: 0, bossActive: false, bossEntity: null,
    ritualStep: 0, stirCount: 0
};

let player = { x: 0, y: 0, w: 40, h: 40, speed: 5, hp: 100, maxHp: 100, mana: 100, maxMana: 100, facing: 'down', isLevitating: false, invulnTimer: 0 };
let keys = {};

function resizeGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    VIEWPORT_W = window.innerWidth;
    VIEWPORT_H = window.innerHeight;
}
window.addEventListener('resize', resizeGame);
resizeGame(); // Init

function init() {
    const spellContainer = document.getElementById('spell-options');
    SPELLS.forEach(spell => {
        const div = document.createElement('div'); div.className = 'choice-card';
        div.innerHTML = `<div style="color:${spell.color};font-size:24px">✨</div>${spell.name}<br><span style="font-size:9px">${spell.id.toUpperCase()}</span>`;
        div.onclick = () => startGame(spell); spellContainer.appendChild(div);
    });
    window.addEventListener('keydown', e => {
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
        keys[e.key] = true;
        if (e.key === ' ') playerAttack();
        if (e.key === 'Shift') toggleLevitate();
    });
    window.addEventListener('keyup', e => keys[e.key] = false);

    // TOUCH CONTROLS SETUP
    const touchMap = {
        'btn-up': 'ArrowUp', 'btn-down': 'ArrowDown',
        'btn-left': 'ArrowLeft', 'btn-right': 'ArrowRight'
    };

    Object.keys(touchMap).forEach(id => {
        const btn = document.getElementById(id);
        const key = touchMap[id];
        if(!btn) return;
        
        const down = (e) => { e.preventDefault(); keys[key] = true; btn.classList.add('active'); };
        const up = (e) => { e.preventDefault(); keys[key] = false; btn.classList.remove('active'); };
        
        // Use pointer events for better handling
        btn.addEventListener('pointerdown', down);
        btn.addEventListener('pointerup', up);
        btn.addEventListener('pointerleave', up);
    });
    
    // Actions
    const btnShoot = document.getElementById('btn-shoot');
    let shootInterval;

    if(btnShoot) {
        const startShooting = (e) => {
            e.preventDefault();
            playerAttack();
            if (!shootInterval) {
                shootInterval = setInterval(playerAttack, 200); // Rapid fire every 200ms
            }
            btnShoot.classList.add('active');
        };

        const stopShooting = (e) => {
            if(e) e.preventDefault();
            clearInterval(shootInterval);
            shootInterval = null;
            btnShoot.classList.remove('active');
        };

        btnShoot.addEventListener('pointerdown', startShooting);
        btnShoot.addEventListener('pointerup', stopShooting);
        btnShoot.addEventListener('pointerleave', stopShooting);
        btnShoot.addEventListener('pointercancel', stopShooting);
    }
    
    const btnLev = document.getElementById('btn-levitate');
    if(btnLev) btnLev.addEventListener('pointerdown', (e) => { e.preventDefault(); toggleLevitate(); });

    requestAnimationFrame(gameLoop);
    
    setupStirring(); // Ensure this is definitely inside init
}

function selectClass(c) {
    gameState.playerClass = c;
    document.getElementById('card-witch').classList.remove('selected');
    document.getElementById('card-wizard').classList.remove('selected');
    document.getElementById(`card-${c}`).classList.add('selected');
}

function goToStep2() {
    const name = document.getElementById('player-name').value;
    if (!name) { alert("Please enter a name!"); return; }
    gameState.playerName = name;
    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
}

function startGame(spell) {
    gameState.selectedSpell = spell;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('hud').style.display = 'block';
    document.getElementById('hud-spell-name').innerText = spell.name;
    document.getElementById('hud-name').innerText = gameState.playerName;
    
    // Init Inventory Bar
    const bar = document.getElementById('inventory-bar');
    bar.innerHTML = '';
    spell.icons.forEach((icon, i) => {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.id = `inv-slot-${i}`;
        slot.innerText = icon;
        bar.appendChild(slot);
    });

    if (audioCtx.state === 'suspended') audioCtx.resume();
    generateWorld();
    gameState.screen = 'PLAY';
    spawnNextIngredient();
    showMessage(`Welcome! Collect 7 ingredients.`);
}

function generateWorld() {
    for (let y = 0; y < MAP_HEIGHT; y++) {
        gameState.map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            let noise = Math.sin(x * 0.1) + Math.cos(y * 0.1) + Math.random() * 0.2;
            let type = TILES.GRASS;
            if (y < 20) type = TILES.SNOW; else if (y > 80) type = TILES.SAND; else if (x > 80) type = TILES.SWAMP; else if (noise > 1.5) type = TILES.MOUNTAIN; else if (noise < -0.5) type = TILES.WATER;
            
            let deco = null;
            // More random decorations
            let r = Math.random();
            if (type === TILES.GRASS) {
                if(r < 0.05) deco = SPRITES.TREE;
                else if(r < 0.06) deco = '🏡';
                else if(r < 0.08) deco = '🪨';
                else if(r < 0.15) deco = '🌿';
            }
            if (type === TILES.SNOW && r < 0.05) deco = SPRITES.ROCK;
            if (type === TILES.SAND && r < 0.05) deco = '🌵';
            if (type === TILES.SWAMP && r < 0.05) deco = '🍄';
            
            gameState.map[y][x] = { type: type, x: x * TILE_SIZE, y: y * TILE_SIZE, deco: deco, decoSize: 20 + Math.random()*20 };
        }
    }
    player.x = (MAP_WIDTH / 2) * TILE_SIZE; player.y = (MAP_HEIGHT / 2) * TILE_SIZE;
    const cx = Math.floor(MAP_WIDTH / 2), cy = Math.floor(MAP_HEIGHT / 2);
    for(let y = cy - 2; y <= cy + 2; y++) { for(let x = cx - 2; x <= cx + 2; x++) { gameState.map[y][x] = { type: TILES.GRASS, x: x * TILE_SIZE, y: y * TILE_SIZE, deco: null }; } }
}

let currentObjective = { x: 0, y: 0, item: '', bossDefeated: false };

function spawnNextIngredient() {
    if (gameState.inventory.length >= 7) {
        currentObjective = { x: (MAP_WIDTH/2)*TILE_SIZE, y: (MAP_HEIGHT/2)*TILE_SIZE, item: 'PORTAL', active: true, bossDefeated: true };
        document.getElementById('hud-mission').innerText = "Return to Start (Portal)";
        showMessage("Ritual ready! Return to start.");
        const targetIcon = document.getElementById('target-icon-hud');
        if(targetIcon) targetIcon.innerText = SPRITES.PORTAL;
        return;
    }
    
    const idx = Math.min(gameState.inventory.length, 6);
    gameState.currentIngredientIndex = idx;

    const ingredientName = gameState.selectedSpell.ingredients[idx];
    const ingredientIcon = gameState.selectedSpell.icons[idx];
    document.getElementById('hud-mission').innerText = `Find the ${ingredientName}`;
    const targetIcon = document.getElementById('target-icon-hud');
    if(targetIcon) targetIcon.innerText = ingredientIcon;
    
    let valid = false, tx, ty;
    while (!valid) {
        tx = Math.floor(Math.random() * (MAP_WIDTH - 20)) + 10; ty = Math.floor(Math.random() * (MAP_HEIGHT - 20)) + 10;
        if (gameState.map[ty][tx].type.type === 'walkable') valid = true;
    }
    currentObjective = { x: tx * TILE_SIZE, y: ty * TILE_SIZE, item: ingredientName, icon: ingredientIcon, active: true, bossDefeated: false };
    
    for(let i=0; i<5; i++) { 
        spawnEnemy(tx * TILE_SIZE + (Math.random()*300 - 150), ty * TILE_SIZE + (Math.random()*300 - 150), 'minion'); 
    }
}

function spawnEnemy(x, y, type) {
    const stage = gameState.currentIngredientIndex;
    let spriteIndex = type === 'boss' ? 6 : stage;
    let sprite = SPRITES.MONSTERS[Math.min(spriteIndex, 6)];
    
    let soundType = 'monster_groan';
    if(spriteIndex === 1) soundType = 'monster_squeak';
    else if(spriteIndex === 2) soundType = 'monster_hiss';
    else if(spriteIndex === 5) soundType = 'monster_rattle';

    // Difficulty Scaling
    let hp = type === 'boss' ? (200 + stage*50) : (30 + (stage * 15));
    let speed = 1.0 + (stage * 0.2);
    let size = type === 'boss' ? 70 : 40; 
    let canShoot = (type === 'boss' && stage >= 4); // Final 3 bosses shoot

    gameState.enemies.push({ 
        x: x, y: y, w: size, h: size, type: type, 
        hp: hp, maxHp: hp, speed: speed, canShoot: canShoot, shootTimer: 0,
        sprite: sprite, soundType: soundType 
    });
}

function spawnBoss() {
    gameState.bossActive = true;
    const name = gameState.selectedSpell.boss;
    showMessage(`WARNING: ${name} approaches!`);
    playSound('monster_groan');
    document.getElementById('hud-mission').innerText = `Defeat ${name}!`;
    spawnEnemy(currentObjective.x, currentObjective.y, 'boss');
    gameState.bossEntity = gameState.enemies[gameState.enemies.length-1];
}

function toggleLevitate() {
    if (gameState.screen !== 'PLAY') return; // Guard clause
    if (player.mana > 10) { player.isLevitating = !player.isLevitating; createParticles(player.x, player.y, 10, '#fff'); }
}

function playerAttack() {
    if (gameState.screen !== 'PLAY' || !gameState.selectedSpell) return; // Guard clause
    if (player.mana < 2) { playSound('empty'); return; }
    player.mana -= 2; playSound('shoot');
    let vx = 0, vy = 0;
    switch(player.facing) { case 'up': vy = -12; break; case 'down': vy = 12; break; case 'left': vx = -12; break; case 'right': vx = 12; break; default: vy = 12; }
    gameState.projectiles.push({ x: player.x + 15, y: player.y + 15, vx: vx, vy: vy, life: 40, color: gameState.selectedSpell.color });
}

function update(dt) {
    if (gameState.screen !== 'PLAY') return;
    
    // Decrement iFrame timer
    if (player.invulnTimer > 0) player.invulnTimer--;

    let dx = 0, dy = 0;
    if (keys['w'] || keys['ArrowUp']) dy = -player.speed; if (keys['s'] || keys['ArrowDown']) dy = player.speed; if (keys['a'] || keys['ArrowLeft']) dx = -player.speed; if (keys['d'] || keys['ArrowRight']) dx = player.speed;
    if (dy < 0) player.facing = 'up'; else if (dy > 0) player.facing = 'down'; else if (dx < 0) player.facing = 'left'; else if (dx > 0) player.facing = 'right';
    
    // Check Collision
    const checkCollision = (newX, newY) => {
        let tx = Math.floor((newX + 15) / TILE_SIZE), ty = Math.floor((newY + 15) / TILE_SIZE);
        let tile = (gameState.map[ty] && gameState.map[ty][tx]) ? gameState.map[ty][tx] : null;
        if (!tile) return false;
        let isWalkable = tile.type.type === 'walkable'; if (tile.type.type === 'obstacle' && player.isLevitating) isWalkable = true;
        return isWalkable;
    };
    if (dx !== 0 && checkCollision(player.x + dx, player.y)) player.x += dx;
    if (dy !== 0 && checkCollision(player.x, player.y + dy)) player.y += dy;
    
    // Mana
    if (player.isLevitating) { player.mana -= 0.1; if (player.mana <= 0) player.isLevitating = false; createParticles(player.x + 15, player.y + 30, 1, '#aaf'); } else { if (player.mana < player.maxMana) player.mana += 0.2; }
    
    gameState.camera.x = Math.max(0, Math.min(player.x - VIEWPORT_W / 2, MAP_WIDTH * TILE_SIZE - VIEWPORT_W));
    gameState.camera.y = Math.max(0, Math.min(player.y - VIEWPORT_H / 2, MAP_HEIGHT * TILE_SIZE - VIEWPORT_H));
    
    // Process Projectiles (REVERSE LOOP to fix splicing bug)
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        let p = gameState.projectiles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        
        let hitEnemy = false;
        // Check collision with all alive enemies
        for (let j = 0; j < gameState.enemies.length; j++) {
            let e = gameState.enemies[j];
            if (rectIntersect(p.x, p.y, 10, 10, e.x, e.y, e.w, e.h)) {
                e.hp -= 10; p.life = 0; hitEnemy = true;
                playSound('hit'); createParticles(e.x + e.w/2, e.y + e.h/2, 5, gameState.selectedSpell.color);
                
                if (e.hp <= 0) {
                    // Mark for deletion later or handle splicing carefully
                    // Here we just modify the array in place since we aren't iterating enemies with index issues in this specific inner loop context
                    // BUT to be safe, we will mark them as dead and filter later
                    e.dead = true;
                    if (e.type === 'boss') { 
                        playSound('monster_groan'); gameState.bossActive = false; gameState.bossEntity = null; currentObjective.bossDefeated = true; document.getElementById('hud-mission').innerText = `Pick up the ${currentObjective.item}!`; 
                    }
                }
                break; // One projectile hits one enemy
            }
        }
        if (p.life <= 0 || hitEnemy) gameState.projectiles.splice(i, 1);
    }
    
    // Filter dead enemies
    gameState.enemies = gameState.enemies.filter(e => !e.dead);
    
    // Enemy Projectiles
    gameState.enemyProjectiles.forEach(ep => {
        ep.x += ep.vx; ep.y += ep.vy; ep.life--;
        if (rectIntersect(ep.x, ep.y, 10, 10, player.x, player.y, player.w, player.h)) {
            takeDamage(15);
            ep.life = 0;
        }
    });
    gameState.enemyProjectiles = gameState.enemyProjectiles.filter(p => p.life > 0);

    // Enemies Logic
    gameState.enemies.forEach(e => {
        let angle = Math.atan2(player.y - e.y, player.x - e.x); 
        e.x += Math.cos(angle) * (e.type === 'boss' ? 2.5 * e.speed : 1.5 * e.speed); 
        e.y += Math.sin(angle) * (e.type === 'boss' ? 2.5 * e.speed : 1.5 * e.speed);
        
        // Shooting
        if (e.canShoot) {
            e.shootTimer++;
            if (e.shootTimer > 100) {
                e.shootTimer = 0;
                gameState.enemyProjectiles.push({ x: e.x + e.w/2, y: e.y + e.h/2, vx: Math.cos(angle)*6, vy: Math.sin(angle)*6, life: 60 });
                playSound('shoot');
            }
        }

        if (Math.random() < 0.005 && distance(player.x, player.y, e.x, e.y) < 600) playSound(e.soundType);
        
        // Collision with player
        if (rectIntersect(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) { 
            takeDamage(10);
        }
    });
    
    let dist = distance(player.x, player.y, currentObjective.x, currentObjective.y);
    document.getElementById('compass').style.transform = `rotate(${Math.atan2(currentObjective.y - player.y, currentObjective.x - player.x) * (180/Math.PI)}deg)`;
    if (dist < 400 && !gameState.bossActive && !currentObjective.bossDefeated && currentObjective.active && currentObjective.item !== 'PORTAL' && !gameState.enemies.some(e => e.type === 'boss')) spawnBoss();
    
    if (dist < 80 && currentObjective.active && (!gameState.bossActive || currentObjective.bossDefeated)) { 
        if (!gameState.bossEntity) { 
            if(currentObjective.item === 'PORTAL') enterPortal();
            else collectIngredient(); 
        } 
    }
    
    const hpEl = document.getElementById('hud-hp');
    const manaEl = document.getElementById('hud-mana');
    if(hpEl) hpEl.innerText = Math.floor(player.hp); 
    if(manaEl) manaEl.innerText = Math.floor(player.mana);
}

function takeDamage(amount) {
    if (player.invulnTimer > 0) return;
    
    player.hp -= amount;
    player.invulnTimer = 30; // 0.5s invincibility (60fps)
    playSound('hit_player');
    
    if (player.hp <= 0) {
        respawnPlayer();
    }
}

function respawnPlayer() {
    player.hp = 100; player.x = (MAP_WIDTH/2)*TILE_SIZE; player.y = (MAP_HEIGHT/2)*TILE_SIZE; alert("You fainted! The spirits return you to safety.");
}

let isCollecting = false;

function collectIngredient() {
    if (isCollecting) return;
    isCollecting = true;
    
    currentObjective.active = false; 
    
    // Update visual inventory
    const slotId = `inv-slot-${gameState.inventory.length}`;
    const slot = document.getElementById(slotId);
    if(slot) slot.classList.add('collected');

    // Show Modal
    const modal = document.getElementById('collection-modal');
    const colIcon = document.getElementById('col-icon');
    const colName = document.getElementById('col-name');
    
    if (modal && colIcon && colName) {
        colIcon.innerText = currentObjective.icon || '✨';
        colName.innerText = currentObjective.item || 'Item';
        modal.classList.add('show');
    }
    
    gameState.inventory.push(currentObjective.item); 
    gameState.currentIngredientIndex = gameState.inventory.length; 
    
    playSound('collect');
    createParticles(player.x, player.y, 50, '#FFD700'); 
    
    const hudCount = document.getElementById('hud-count');
    if(hudCount) hudCount.innerText = gameState.inventory.length;
    
    setTimeout(() => {
        if(modal) modal.classList.remove('show');
        isCollecting = false;
        spawnNextIngredient();
    }, 2500);
}

function enterPortal() {
    playSound('portal');
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('hud').style.display = 'none';
    
    // Trigger transition overlay
    const overlay = document.getElementById('transition-overlay');
    overlay.classList.add('active');
    
    setTimeout(() => {
        overlay.classList.remove('active');
        gameState.screen = 'CAULDRON'; 
        document.getElementById('cauldron-screen').classList.remove('hidden');
        document.getElementById('ritual-intro-modal').classList.add('show'); // Show new instruction
        initRitual();
    }, 1000);
}

function closeRitualIntro() {
    document.getElementById('ritual-intro-modal').classList.remove('show');
}

/**
 * Enhanced Draw Logic for detailed terrain
 */
function drawTile(ctx, type, x, y) {
    ctx.fillStyle = type.color;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    if (type === TILES.GRASS) {
        ctx.fillStyle = '#3a7c3a'; 
        if ((x+y)%3 === 0) ctx.fillRect(x+5, y+5, 2, 4);
    } 
    else if (type === TILES.WATER) {
        ctx.fillStyle = '#6fc4db'; 
        let waveOffset = Math.sin(Date.now()/500 + x)*5;
        ctx.fillRect(x + 5, y + 15 + waveOffset, 10, 2);
    }
    else if (type === TILES.MOUNTAIN) {
        // Continuous Mountain Look
        ctx.fillStyle = '#4a4442'; // Dark base
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        
        // Highlight logic requires checking neighbors but for single file simple drawing:
        // Draw a distinct rock formation
        ctx.fillStyle = '#7a706c';
        ctx.beginPath();
        ctx.moveTo(x+5, y+35);
        ctx.lineTo(x+20, y+5);
        ctx.lineTo(x+35, y+35);
        ctx.fill();
    }
    else if (type === TILES.SAND) {
        ctx.fillStyle = '#c2a86b'; 
        if ((x+y)%5===0) ctx.fillRect(x+15, y+15, 2, 2);
    }
}

function drawWand(ctx, pX, pY, facing, isCasting) {
    ctx.save();
    ctx.translate(pX + player.w/2, pY + player.h/2);
    let angle = 0;
    if(facing === 'up') angle = -Math.PI/2; else if(facing === 'down') angle = Math.PI/2; else if(facing === 'left') angle = Math.PI; else angle = 0;
    ctx.rotate(angle);
    ctx.fillStyle = '#8b4513'; ctx.fillRect(15, -2, 20, 4); 
    ctx.fillStyle = isCasting ? '#fff' : '#ccc'; ctx.fillRect(35, -3, 6, 6);
    if (isCasting) { ctx.shadowColor = gameState.selectedSpell.color; ctx.shadowBlur = 10; ctx.fillStyle = gameState.selectedSpell.color; ctx.fillRect(35, -3, 6, 6); }
    ctx.restore();
}

function draw() {
    if (gameState.screen !== 'PLAY') return;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height); const cam = gameState.camera;
    const startCol = Math.floor(cam.x / TILE_SIZE), endCol = startCol + (canvas.width / TILE_SIZE) + 1, startRow = Math.floor(cam.y / TILE_SIZE), endRow = startRow + (canvas.height / TILE_SIZE) + 1;
    
    // First pass: Draw terrain backgrounds
    for (let y = startRow; y <= endRow; y++) { 
        for (let x = startCol; x <= endCol; x++) { 
            if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) { 
                const t = gameState.map[y][x]; 
                drawTile(ctx, t.type, t.x - cam.x, t.y - cam.y);
            } 
        } 
    }

    // Second pass: Draw decorations (trees, mushrooms) so they layer correctly
    for (let y = startRow; y <= endRow; y++) { 
        for (let x = startCol; x <= endCol; x++) { 
            if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) { 
                const t = gameState.map[y][x]; 
                if (t.deco) { 
                    ctx.font = `${t.decoSize}px serif`; 
                    ctx.fillText(t.deco, t.x - cam.x + 5, t.y - cam.y + 30); 
                } 
            } 
        } 
    }
    
    // Objective Drawing
    if (currentObjective.active) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let dx = currentObjective.x - cam.x; 
        let dy = currentObjective.y - cam.y; 
        let cx = dx + TILE_SIZE/2; 
        let cy = dy + TILE_SIZE/2; 

        // Draw Circle
        ctx.globalAlpha = 0.5 + Math.sin(Date.now()/200)*0.2; 
        ctx.fillStyle = gameState.bossActive ? '#f00' : gameState.selectedSpell.color; 
        ctx.beginPath(); 
        ctx.arc(cx, cy, gameState.bossActive ? 40 : 25, 0, Math.PI*2); 
        ctx.fill(); 
        ctx.globalAlpha = 1;

        // Draw Icon centered
        ctx.font = '40px serif'; 
        ctx.fillStyle = '#fff';
        ctx.fillText(currentObjective.item === 'PORTAL' ? SPRITES.PORTAL : currentObjective.icon, cx, cy);

        // Draw Text centered above
        if (!gameState.bossActive && currentObjective.item !== 'PORTAL') { 
            ctx.fillStyle = "#fff"; 
            ctx.font = "10px sans-serif"; 
            ctx.fillText("WALK HERE", cx, cy - 40); 
            ctx.fillText("⬇", cx, cy - 55 + Math.sin(Date.now()/100)*5); 
        }
        ctx.restore();
    }
    
    // Draw Enemies
    gameState.enemies.forEach(e => { 
        // Save context to ensure alignment doesn't bleed
        ctx.save();
        ctx.font = e.type === 'boss' ? '60px serif' : '40px serif'; 
        let wobbleY = Math.sin(Date.now()/200) * 3;
        
        // Draw enemy relative to top-left (standard)
        ctx.fillText(e.sprite, e.x - cam.x, e.y - cam.y + e.h + wobbleY); 
        
        // HP Bar
        ctx.fillStyle = 'red'; ctx.fillRect(e.x - cam.x, e.y - cam.y - 10, e.w, 5); 
        ctx.fillStyle = 'green'; ctx.fillRect(e.x - cam.x, e.y - cam.y - 10, e.w * (e.hp/e.maxHp), 5); 
        ctx.restore();
    });
    
    // Enemy Projectiles
    gameState.enemyProjectiles.forEach(ep => {
        ctx.fillStyle = '#f00'; ctx.beginPath(); ctx.arc(ep.x-cam.x, ep.y-cam.y, 8, 0, Math.PI*2); ctx.fill();
    });

    // --- DRAW PLAYER (Restored Logic) ---
    
    // Ensure alignment is reset to default for the player
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";

    // Draw Shadow (Restored to +20 x, +45 y offset)
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; 
    ctx.beginPath(); 
    ctx.ellipse(player.x - cam.x + 20, player.y - cam.y + 45, 15, 8, 0, 0, Math.PI*2); 
    ctx.fill();
    
    // Flash if hurt
    if(player.invulnTimer > 0 && Math.floor(Date.now()/100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    } else {
        ctx.globalAlpha = 1.0;
    }

    let pWobble = Math.sin(Date.now()/150) * 2;
    if (player.isLevitating) ctx.translate(0, -Math.sin(Date.now()/100)*5); else ctx.translate(0, pWobble);
    
    let isCasting = keys[' '];
    
    // Draw Wand BEHIND if facing up
    if (player.facing === 'up') drawWand(ctx, player.x - cam.x, player.y - cam.y, player.facing, isCasting);
    
    // Reset fillStyle to opaque white to ensure emoji renders fully opaque
    ctx.fillStyle = '#ffffff';
    ctx.font = '45px serif'; 
    
    // Draw Sprite (Restored to +0 x, +40 y offset for top-left anchor text)
    ctx.fillText(gameState.playerClass === 'witch' ? SPRITES.PLAYER_WITCH : SPRITES.PLAYER_WIZARD, player.x - cam.x, player.y - cam.y + 40); 
    
    // Draw Wand FRONT if not facing up
    if (player.facing !== 'up') drawWand(ctx, player.x - cam.x, player.y - cam.y, player.facing, isCasting);
    
    ctx.setTransform(1,0,0,1,0,0);
    
    // --- END PLAYER DRAW ---
    
    gameState.projectiles.forEach(p => { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x-cam.x, p.y-cam.y, 6, 0, Math.PI*2); ctx.fill(); });
    gameState.particles.forEach(p => { p.life--; p.x+=p.vx; p.y+=p.vy; ctx.fillStyle = p.color; ctx.fillRect(p.x-cam.x, p.y-cam.y, p.size, p.size); }); gameState.particles = gameState.particles.filter(p => p.life > 0);
}
function gameLoop(timestamp) { const dt = timestamp - gameState.lastTime; gameState.lastTime = timestamp; update(dt); draw(); requestAnimationFrame(gameLoop); }
function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) { return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1; }
function distance(x1, y1, x2, y2) { return Math.hypot(x1-x2, y1-y2); }
function createParticles(x, y, count, color) { for(let i=0;i<count;i++) gameState.particles.push({x:x,y:y,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,life:30,size:Math.random()*4,color:color}); }
function showMessage(msg, d=3000) { const el=document.getElementById('message-log'); el.innerText=msg; el.style.display='block'; setTimeout(()=>el.style.display='none', d); }

// --- RITUAL LOGIC ---

let stirState = { isDragging: false, lastAngle: 0, totalRotation: 0, centerX: 140, centerY: 125, lastSoundTime: 0 };

function initRitual() {
    gameState.ritualStep = 0; gameState.stirCount = 0; stirState.totalRotation = 0;
    const liq = document.getElementById('cauldron-liquid');
    if(liq) {
        liq.style.setProperty('--spell-color', gameState.selectedSpell.color);
        // Do not nuke innerHTML because spoon is now inside HTML structure differently
        // Just clear the mixed ingredients container
        const mixed = document.getElementById('mixed-ingredients');
        if(mixed) mixed.innerHTML = '';
        const parts = document.getElementById('cauldron-particles');
        if(parts) parts.innerHTML = '';
        const overlay = document.getElementById('liquid-overlay');
        if(overlay) overlay.style.backgroundColor = gameState.selectedSpell.color;
        
        spawnBubbles(5);
        setInterval(() => spawnSteam(), 500); 
    }
    
    updateRitualUI();
    
    // Add ambient dust motes
    const ui = document.getElementById('cauldron-ui');
    if(ui) {
        // Only add if not present
        if(ui.querySelectorAll('.dust-mote').length === 0) {
            for(let i=0; i<15; i++) {
                let d = document.createElement('div');
                d.className = 'dust-mote';
                d.style.left = Math.random()*100 + '%';
                d.style.top = Math.random()*100 + '%';
                d.style.animationDelay = Math.random()*5 + 's';
                ui.appendChild(d);
            }
        }
    }
}

function updateRitualUI() {
    const instr = document.getElementById('ritual-instruction');
    const chant = document.getElementById('chant-display');
    const btn = document.getElementById('ritual-btn');
    const itemVisual = document.getElementById('current-ingredient');
    const spoon = document.getElementById('spoon');
    const stirDisplay = document.getElementById('stir-count-display');
    const finalUI = document.getElementById('final-activation-ui');
    const controls = document.getElementById('ritual-controls');
    
    if (gameState.ritualStep < 7) {
        if(spoon) spoon.style.display = 'none'; 
        if(stirDisplay) stirDisplay.style.display = 'none'; 
        if(finalUI) finalUI.style.display = 'none'; 
        if(controls) controls.style.display = 'block';
        
        const ingName = gameState.selectedSpell.ingredients[gameState.ritualStep];
        const chantText = gameState.selectedSpell.incantations[gameState.ritualStep];
        const icon = gameState.selectedSpell.icons[gameState.ritualStep];
        
        if(instr) instr.innerHTML = `Step ${gameState.ritualStep+1}/7: Add <span style="color:${gameState.selectedSpell.color}">${ingName}</span>`;
        if(chant) chant.innerText = `"${chantText}"`;
        if(itemVisual) {
            itemVisual.innerText = icon; itemVisual.className = 'ingredient-visual'; 
            itemVisual.style.animation = 'none'; itemVisual.offsetHeight; itemVisual.style.opacity = '1'; itemVisual.style.transform = 'scale(1)'; itemVisual.style.top = '-100px';
        }
    } else {
        if(itemVisual) itemVisual.style.opacity = '0'; 
        if(controls) controls.style.display = 'none'; 
        if(spoon) { spoon.style.display = 'block'; spoon.style.transform = `translate(0px, 0px)`; }
        if(stirDisplay) stirDisplay.style.display = 'block';
        if(chant) chant.innerText = "The potion bubbles with power... Stir the spoon to bind the spell!";
        if(instr) instr.innerText = "Grab the spoon and stir clockwise!";
    }
}

let isAnimating = false;
function triggerAddIngredient() {
    if (isAnimating) return;
    isAnimating = true;
    const chant = document.getElementById('chant-display');
    if(chant) chant.style.color = gameState.selectedSpell.color; 
    playSound('collect'); 
    
    // VISUAL FEEDBACK: Create and Add floating ingredient
    const currentIcon = document.getElementById('current-ingredient').innerText;
    const container = document.getElementById('mixed-ingredients');
    
    setTimeout(() => {
        if(chant) chant.style.color = "#fff";
        const item = document.getElementById('current-ingredient');
        if(item) item.style.animation = `drop-in 0.8s forwards`;
        
        setTimeout(() => {
            playSound('splash'); spawnSteam(); spawnBubbles(10); 
            
            // Add to persistent floating mix
            if(container) {
                const floatingItem = document.createElement('div');
                floatingItem.className = 'mixed-item';
                floatingItem.innerText = currentIcon;
                floatingItem.style.left = (Math.random() * 60 + 20) + '%';
                floatingItem.style.top = (Math.random() * 60 + 20) + '%';
                floatingItem.style.animationDelay = (Math.random() * 2) + 's';
                container.appendChild(floatingItem);
            }
            
            gameState.ritualStep++; isAnimating = false; updateRitualUI(); 
        }, 800);
    }, 500);
}

function spawnSteam() {
    const liq = document.getElementById('cauldron-liquid');
    if(!liq) return;
    let s = document.createElement('div'); s.className = 'steam'; s.style.left = (Math.random() * 60 + 20) + '%';
    s.style.animation = `steamRise 2s forwards`; liq.appendChild(s); setTimeout(() => s.remove(), 2000);
}

function spawnBubbles(count) {
    const container = document.getElementById('cauldron-particles');
    if(!container) return;

    for(let i=0; i<count; i++) {
        let b = document.createElement('div'); b.className = 'bubble';
        b.style.left = (Math.random() * 90) + '%'; b.style.width = (Math.random()*15+5)+'px'; b.style.height = b.style.width; b.style.bottom = '10px';
        b.style.animation = `bubbleRise ${Math.random()+0.5}s forwards`; container.appendChild(b); setTimeout(() => b.remove(), 1500);
    }
}

function setupStirring() {
    const spoon = document.getElementById('spoon');
    const zone = document.getElementById('cauldron-zone');
    const mixedContainer = document.getElementById('mixed-ingredients');
    
    if(!spoon || !zone) return;

    spoon.addEventListener('mousedown', (e) => {
        e.preventDefault(); stirState.isDragging = true;
        const rect = zone.getBoundingClientRect(); stirState.lastAngle = Math.atan2(e.clientY - (rect.top + rect.height/2), e.clientX - (rect.left + rect.width/2));
    });
    document.addEventListener('mouseup', () => { stirState.isDragging = false; });
    document.addEventListener('mousemove', (e) => {
        if (!stirState.isDragging || gameState.ritualStep < 7) return;
        const rect = zone.getBoundingClientRect(); const centerX = rect.left + rect.width / 2; const centerY = rect.top + rect.height / 2;
        const maxR = 80;
        let finalX = e.clientX - centerX; let finalY = e.clientY - centerY;
        if (Math.hypot(finalX, finalY) > maxR) { const a = Math.atan2(finalY, finalX); finalX = Math.cos(a) * maxR; finalY = Math.sin(a) * maxR; }
        spoon.style.transform = `translate(${finalX}px, ${finalY}px)`;
        
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        let delta = currentAngle - stirState.lastAngle;
        if (delta > Math.PI) delta -= Math.PI * 2; if (delta < -Math.PI) delta += Math.PI * 2;
        if (delta > 0) { 
            stirState.totalRotation += delta;
            
            // Stir the ingredients visually!
            let rotationDeg = stirState.totalRotation * (180/Math.PI);
            if(mixedContainer) mixedContainer.style.transform = `rotate(${rotationDeg}deg)`;
            
            if (Math.random() < 0.2) spawnBubbles(1);
            if (Date.now() - stirState.lastSoundTime > 300 && Math.abs(delta) > 0.1) { playSound('stir'); stirState.lastSoundTime = Date.now(); }
        }
        stirState.lastAngle = currentAngle;
        
        const progress = Math.floor(stirState.totalRotation / (Math.PI * 2));
        if (progress > gameState.stirCount) {
            gameState.stirCount = progress; 
            const stirCountEl = document.getElementById('stir-count-display');
            if(stirCountEl) stirCountEl.innerText = `Stir Count: ${gameState.stirCount}/7`;
            spawnSteam(); playSound('lap_complete'); 
            if (gameState.stirCount >= 7) { transitionToFinalStep(); stirState.isDragging = false; }
        }
    });
}

function transitionToFinalStep() {
    const spoon = document.getElementById('spoon');
    if(spoon) spoon.style.display = 'none';
    const stirCountEl = document.getElementById('stir-count-display');
    if(stirCountEl) stirCountEl.style.display = 'none';
    const instr = document.getElementById('ritual-instruction');
    if(instr) instr.style.display = 'none';
    
    document.querySelector('.cauldron-wrapper').classList.add('glowing-cauldron');
    const chant = document.getElementById('chant-display'); 
    if(chant) {
        chant.innerText = `"${gameState.selectedSpell.finalIncantation}"`; 
        chant.style.color = gameState.selectedSpell.color; 
        chant.style.textShadow = "0 0 20px white";
    }
    const finalUI = document.getElementById('final-activation-ui');
    if(finalUI) finalUI.style.display = 'flex'; 
    playSound('final_magic');
}

function performFinalActivation() {
    document.querySelector('.cauldron-wrapper').classList.add('float-away');
    const finalUI = document.getElementById('final-activation-ui');
    if(finalUI) finalUI.style.display = 'none'; 
    const chant = document.getElementById('chant-display');
    if(chant) chant.style.opacity = '0';
    
    for(let i=0; i<30; i++) {
        let p = document.createElement('div'); p.className = 'magic-sparkle'; p.style.left = '50%'; p.style.top = '50%';
        p.style.setProperty('--tx', (Math.random()*400 - 200) + 'px'); p.style.setProperty('--ty', (Math.random()*400 - 200) + 'px');
        p.style.animation = `sparkle-fly 1s forwards`; 
        const cUI = document.getElementById('cauldron-ui');
        if(cUI) cUI.appendChild(p);
    }
    playSound('shimmer');
    setTimeout(() => { finishGame(); }, 4000);
}

function finishGame() {
    document.getElementById('cauldron-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');
    if(gameState.selectedSpell) {
        document.getElementById('end-spell-name').innerText = gameState.selectedSpell.name;
        // Simplified message construction to avoid complex template literal
        const spellId = gameState.selectedSpell.id.toUpperCase();
        document.getElementById('end-message').innerText = "Ritual complete! The spirits accepted your offering. Your intention for " + spellId + " manifests now.";
    }
}

// Start the game logic
try {
    console.log("Initializing Alchemist's Path...");
    init();
} catch(e) {
    console.error("Initialization failed:", e);
}