/** CORE ENGINE: Overworld logic, rendering, and main game loop. */

// Simple Logic to toggle instructions
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.getElementById('instr-mobile').style.display = 'inline';
} else {
    document.getElementById('instr-desktop').style.display = 'inline';
}

window.customAlertCallback = null;

// Rebind the standard alert UI
window.alert = function(msg, callback) {
    const modal = document.getElementById('custom-alert-modal');
    if(modal) {
        document.getElementById('custom-alert-input').style.display = 'none';
        document.getElementById('custom-alert-cancel-btn').style.display = 'none';
        document.getElementById('custom-alert-text').innerText = msg;
        
        let okBtn = document.getElementById('custom-alert-ok-btn');
        okBtn.innerText = "Acknowledge";
        okBtn.onclick = () => {
             modal.style.display = 'none'; 
             modal.classList.add('hidden'); 
             if(callback) callback(); 
        };
        
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    } else {
        console.log("ALERT:", msg);
        if(callback) callback();
    }
};

// Use an async callback-based prompt instead of freezing execution
window.customPrompt = function(msg, callback) {
    const modal = document.getElementById('custom-alert-modal');
    if(modal) {
        let input = document.getElementById('custom-alert-input');
        input.style.display = 'block';
        input.value = '';
        
        document.getElementById('custom-alert-text').innerText = msg;
        
        let cancelBtn = document.getElementById('custom-alert-cancel-btn');
        cancelBtn.style.display = 'block';
        cancelBtn.onclick = () => {
             modal.style.display = 'none'; 
             modal.classList.add('hidden');
             callback(null);
        };
        
        let okBtn = document.getElementById('custom-alert-ok-btn');
        okBtn.innerText = "Submit";
        okBtn.onclick = () => {
             modal.style.display = 'none'; 
             modal.classList.add('hidden'); 
             callback(input.value); 
        };
        
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        input.focus();
    } else {
        console.log("PROMPT:", msg);
        callback(null);
    }
};
window.onerror = function(msg, url, line, col, error) {
   const log = document.getElementById('message-log');
   if(log) {
       log.style.display = 'block';
       log.style.color = 'red';
       log.innerText = `ERROR: ${msg}\nLine: ${line}:${col}`;
       console.error(error);
   }
   // Also alert for visibility if log is hidden
   // alert(`Error: ${msg}`); 
   return false;
};

// Audio system moved to js/audio.js

function toggleFullScreen() {
    const el = document.getElementById('game-container');
    if (!document.fullscreenElement) {
        el.requestFullscreen().catch(err => { console.warn(`Fullscreen Error: ${err.message}`); });
    } else { document.exitFullscreen(); }
}

const TILE_SIZE = 40; const MAP_WIDTH = 100; const MAP_HEIGHT = 100;
let VIEWPORT_W = window.innerWidth; 
let VIEWPORT_H = window.innerHeight;



// SPELLS, TILES, SPRITES, SHEET_SRC moved to js/config.js

const SPRITE_SHEETS = {};
// Pre-populate keys to avoid undefined errors before load
Object.keys(SHEET_SRC).forEach(k => SPRITE_SHEETS[k] = new Image());

// --- INJECT AVAILABLE ASSETS INTO RENDERING ---
if (typeof AVAILABLE_ASSETS !== 'undefined') {
    AVAILABLE_ASSETS.forEach(a => {
        // Map editor path: "../../images/craft-work/..."
        // Game path: "../images/craft-work/..."
        let fixPath = a.path.replace('../../', '../');
        // Ensure the source image is tracked and preloaded
        if (!SHEET_SRC[fixPath]) {
            SHEET_SRC[fixPath] = fixPath; 
            SPRITE_SHEETS[fixPath] = new Image();
        }
    });
}

let spritesLoaded = false;

function loadSprites() {
    const promises = Object.keys(SHEET_SRC).map(key => {
        return new Promise((resolve, reject) => {
            const img = SPRITE_SHEETS[key];
            img.onload = resolve;
            img.onerror = () => { console.warn(`Failed to load ${SHEET_SRC[key]}`); resolve(); }; // Continue even if fail
            img.src = SHEET_SRC[key];
        });
    });

    return Promise.all(promises).then(() => { 
        spritesLoaded = true; 
        console.log("All Sprites Loaded!");
        // logSheetDimensions();
    });
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    VIEWPORT_W = canvas.width;
    VIEWPORT_H = canvas.height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let gameState = {
    screen: 'START', playerClass: null, playerName: '', selectedSpell: null,
    currentIngredientIndex: 0, inventory: [], map: [], enemies: [], particles: [], projectiles: [], enemyProjectiles: [],
    camera: { x: 0, y: 0 }, lastTime: 0, bossActive: false, bossEntity: null,
    ritualStep: 0, stirCount: 0
};

let player = { 
    x: 0, y: 0, w: 60, h: 60, speed: 5, 
    hp: 100, maxHp: 100, mana: 100, maxMana: 100, 
    facing: 'down', isLevitating: false, invulnTimer: 0,
    // Animation State
    frameX: 0, frameY: 0, flipX: false, isAttacking: false, animTimer: 0
};
let keys = {};

// Input handling (joystickInput, initMobileControls, handleFire, toggleLevitate) moved to js/input.js

function init() {
    const spellContainer = document.getElementById('spell-options');
    SPELLS.forEach(spell => {
        const div = document.createElement('div'); div.className = 'choice-card';
        div.innerHTML = `<div style="color:${spell.color};font-size:24px">✨</div>${spell.name}<br><span style="font-size:9px">${spell.id.toUpperCase()}</span>`;
        div.onclick = () => startGame(spell); spellContainer.appendChild(div);
    });
    window.addEventListener('keydown', e => {
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Enter","z","Z"].includes(e.key)) {
            e.preventDefault();
        }
        if (e.key === " " && e.target.tagName !== 'INPUT') {
            e.preventDefault();
        }
        keys[e.key] = true;
        if (e.key && (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'z')) { 
            playerAttack(); 
        }
        if (e.key === 'Shift') toggleLevitate();
    });
    window.addEventListener('keyup', e => keys[e.key] = false);
    
    // Init Mobile
    initMobileControls();

    requestAnimationFrame(gameLoop);
    
    setupStirring();
    
    // Start Loading
    loadSprites().then(() => {
        // Updated Intro Icons (Top Half of Sprite)
        const keys = ['witch', 'wizard'];
        keys.forEach(k => {
            const container = document.getElementById(`icon-${k}`);
            if(container) {
                const c = document.createElement('canvas'); c.width = 60; c.height = 60;
                const ctx = c.getContext('2d');
                
                // Zoom on upper body/face: Source region [128, 50] size [256, 256] -> Dest [0, 0] size [60, 60]
                if(SPRITE_SHEETS[k].complete) {
                     ctx.drawImage(SPRITE_SHEETS[k], 128, 50, 256, 256, 0, 0, 60, 60);
                }
                
                container.innerHTML = '';
                container.appendChild(c);
            }
        });

        // --- DEBUG JUMP LOGIC ---
        const urlParams = new URLSearchParams(window.location.search);
        const testSpell = urlParams.get('spell');
        const testStage = urlParams.get('stage');
        const testCauldron = urlParams.get('cauldron');
        const testRitualMap = urlParams.get('ritualMap');

        if (testSpell) {
            const spellObj = SPELLS.find(s => s.id === testSpell) || SPELLS[0];
            gameState.playerClass = 'wizard';
            gameState.playerName = 'Tester';
            
            startGame(spellObj);
            
            if (testRitualMap === 'true') {
                gameState.inventory = [spellObj.ingredients[0]]; // Stage 1 completed
                gameState.currentIngredientIndex = 1;
                gameState.enemies = [];
                
                document.getElementById('canvas-wrapper').style.display = 'block';
                document.getElementById('hud').style.display = 'flex';
                // Trigger Ritual Map directly
                gameState.screen = 'RITUAL_MAP';
                initRitualMap();
                
                // Add click listener to canvas for direct interactions
                canvas.addEventListener('mousedown', (e) => {
                    if (gameState.screen !== 'RITUAL_MAP' || !ritualState) return;
                    const rect = canvas.getBoundingClientRect();
                    
                    // Calculate scale to handle dynamic canvas sizing
                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;
                    
                    // Click coords in screen space
                    const clickX = (e.clientX - rect.left) * scaleX;
                    const clickY = (e.clientY - rect.top) * scaleY;
                    
                    // Convert screen space to world space based on camera
                    const worldX = clickX + gameState.camera.x;
                    const worldY = clickY + gameState.camera.y;
                    
                    const now = Date.now();
                    ritualState.assets.forEach(a => {
                        if (a.hidden || !a.interact) return;
                        if (worldX > a.x && worldX < a.x + a.w && worldY > a.y && worldY < a.y + a.h) {
                            if (now - ritualState.lastInteractTime > 1000) {
                                ritualState.lastInteractTime = now;
                                a.interact();
                            }
                        }
                    });
                });
            } else if (testStage !== null) {
                const stageNum = parseInt(testStage);
                // Fill inventory
                gameState.inventory = [];
                for(let i = 0; i < stageNum; i++) {
                    gameState.inventory.push(spellObj.ingredients[i]);
                }
                gameState.currentIngredientIndex = gameState.inventory.length;
                
                // Clear enemies spawned by initial startGame
                gameState.enemies = [];
                
                // Update Info
                for(let i = 0; i < gameState.inventory.length; i++) {
                    const slot = document.getElementById(`inv-slot-${i}`);
                    if(slot) slot.classList.add('collected');
                }
                const hudCount = document.getElementById('hud-count');
                if(hudCount) hudCount.innerText = gameState.inventory.length;

                // Re-spawn objective with correct stage
                spawnNextIngredient();
            } else if (testCauldron === 'true') {
                gameState.inventory = [...spellObj.ingredients];
                gameState.currentIngredientIndex = 7;
                gameState.enemies = [];
                
                document.getElementById('canvas-wrapper').style.display = 'none';
                document.getElementById('hud').style.display = 'none';
                gameState.screen = 'CAULDRON'; 
                document.getElementById('cauldron-screen').classList.remove('hidden');
                document.getElementById('ritual-intro-modal').classList.add('show');
                initRitual();
            }
        }
    });
}

function selectClass(c) {
    gameState.playerClass = c;
    const w = document.getElementById('card-witch');
    const z = document.getElementById('card-wizard');
    if(w) w.classList.remove('selected');
    if(z) z.classList.remove('selected');
    
    document.getElementById(`card-${c}`).classList.add('selected');
}

function goToStep2() {
    const name = document.getElementById('player-name').value;
    if (!name) { alert("Please enter a name!"); return; }
    if (!gameState.playerClass) { alert("Please select a character (Witch or Wizard)!"); return; }
    
    gameState.playerName = name;
    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
}

function startGame(spell) {
    gameState.selectedSpell = spell;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('hud').style.display = 'block';
    
    // Enable Mobile Controls if touch supported or forced
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.getElementById('mobile-controls').classList.add('show');
    }
    
    // Auto Fullscreen
    toggleFullScreen();
    
    // Disable Context Menu (prevent long press modals)
    window.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };
    
    
    // document.getElementById('hud-spell-name').innerText = spell.name; // Removed from UI
    // Update Name Display: Class: Name
    const pClass = gameState.playerClass.charAt(0).toUpperCase() + gameState.playerClass.slice(1);
    document.getElementById('hud-name').innerText = `${pClass}: ${gameState.playerName}`;
    
    // Init Inventory Bar
    const bar = document.getElementById('inventory-bar');
    bar.innerHTML = '';
    spell.ingredients.forEach((ing, i) => {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.id = `inv-slot-${i}`;
        // For HUD, we can just use a placeholder or mini canvas, but for now let's use the ingredient name first letter or generic
        // BETTER: Create a mini canvas for the icon
        const c = document.createElement('canvas'); c.width = 30; c.height = 30;
        const ctxIcon = c.getContext('2d');
        const sheet = SPRITE_SHEETS[spell.sheet];
        const index = spell.spriteIndices[i];
        if(spritesLoaded) {
            ctxIcon.drawImage(sheet, (index%4)*512, Math.floor(index/4)*512, 512, 512, 0, 0, 30, 30);
        }
        slot.appendChild(c);
        
        bar.appendChild(slot);
    });

    // Reset Game State
    gameState.inventory = [];
    gameState.enemies = [];
    gameState.projectiles = [];
    gameState.enemyProjectiles = [];
    gameState.particles = [];
    gameState.currentIngredientIndex = 0;
    gameState.bossActive = false;
    
    player.hp = 100;
    player.maxHp = 100;
    player.mana = 100;
    player.maxMana = 100;
    player.invulnTimer = 180; // Start with 3s of safety
    
    console.log("Game Starting... Player HP:", player.hp, "Invuln:", player.invulnTimer);
    
    generateWorld();
    gameState.screen = 'PLAY';
    spawnNextIngredient();
    showMessage(`Welcome! Collect 7 ingredients.`);
}

function generateWorld() {
    gameState.map = []; // Ensure map is cleared before regenerating
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
        if(targetIcon) {
            targetIcon.innerHTML = '';
            const c = document.createElement('canvas'); c.width = 40; c.height = 40;
            const ctxIcon = c.getContext('2d');
            const sheet = SPRITE_SHEETS.CHARS;
            const index = SPRITES.PORTAL.index;
            if(spritesLoaded) {
                ctxIcon.drawImage(sheet, (index%4)*512, Math.floor(index/4)*512, 512, 512, 0, 0, 40, 40);
            }
            targetIcon.appendChild(c);
        }
        return;
    }
    
    const idx = Math.min(gameState.inventory.length, 6);
    gameState.currentIngredientIndex = idx;

    const ingredientName = gameState.selectedSpell.ingredients[idx];
    const sheetKey = gameState.selectedSpell.sheet;
    const spriteIndex = gameState.selectedSpell.spriteIndices[idx];
    
    document.getElementById('hud-mission').innerText = `Find the ${ingredientName}`;
    
    const targetIcon = document.getElementById('target-icon-hud');
    if(targetIcon) {
        targetIcon.innerHTML = '';
        const c = document.createElement('canvas'); c.width = 40; c.height = 40; // Size increased to 40 (was 20)
        const ctxIcon = c.getContext('2d');
        const sheet = SPRITE_SHEETS[sheetKey];
        if(spritesLoaded) {
            ctxIcon.drawImage(sheet, (spriteIndex%4)*512, Math.floor(spriteIndex/4)*512, 512, 512, 0, 0, 40, 40);
        }
        targetIcon.appendChild(c);
    }
    
    let valid = false, tx, ty;
    let attempts = 0;
    while (!valid) {
        tx = Math.floor(Math.random() * (MAP_WIDTH - 20)) + 10; ty = Math.floor(Math.random() * (MAP_HEIGHT - 20)) + 10;
        
        let distToPlayer = distance(tx * TILE_SIZE, ty * TILE_SIZE, player.x, player.y);
        
        // Ensure distance is at least 600px (15 tiles) to avoid instant death on spawn
        if (gameState.map[ty][tx].type.type === 'walkable' && distToPlayer > 800) valid = true; // Increased safety distance
        
        attempts++;
        if(attempts > 500 && gameState.map[ty][tx].type.type === 'walkable') valid = true; // Fallback
    }
    currentObjective = { x: tx * TILE_SIZE, y: ty * TILE_SIZE, item: ingredientName, sheet: sheetKey, index: spriteIndex, active: true, bossDefeated: false };
    
    for(let i=0; i<5; i++) { 
        spawnEnemy(tx * TILE_SIZE + (Math.random()*300 - 150), ty * TILE_SIZE + (Math.random()*300 - 150), 'minion'); 
    }
}

function spawnEnemy(x, y, type, customSpriteKey = null) {
    // SAFETY CHECK: Do not spawn if too close to player
    const dist = distance(x, y, player.x, player.y);
    if (dist < 500 && gameState.screen !== 'RITUAL_MAP') {
        console.warn("Prevented enemy spawn too close to player:", x, y, "Dist:", dist);
        return null;
    }

    const stage = gameState.currentIngredientIndex;
    let spriteData;
    
    if (customSpriteKey) {
        let key = customSpriteKey;
        if (typeof key === 'string' && key.endsWith('_0_0')) {
            key = key.substring(0, key.length - 4);
        }
        spriteData = SPRITES[key.toUpperCase()] || SPRITES['BOSS_' + key.toUpperCase()] || SPRITES[key] || key;
    } else if (type === 'boss') {
        const currentBossInfo = gameState.selectedSpell.bosses[gameState.currentIngredientIndex];
        spriteData = SPRITES[currentBossInfo.spriteKey];
    } else {
        // Minion progression: Slime -> Bat -> Spider -> Ghost -> Goblin -> Skeleton -> Spell Specific Minion
        const spellId = gameState.selectedSpell.id;
        let finalMinion;
        if (spellId === 'love') finalMinion = SPRITES.BOSS_LOVE;
        else if (spellId === 'wealth') finalMinion = SPRITES.BOSS_WEALTH;
        else if (spellId === 'health') finalMinion = SPRITES.BOSS_HEALTH;
        else if (spellId === 'glamour') finalMinion = SPRITES.BOSS_GLAMOUR;
        else finalMinion = SPRITES.SKELETON; // Fallback

        const order = [SPRITES.SLIME, SPRITES.BAT, SPRITES.SPIDER, SPRITES.GHOST, SPRITES.GOBLIN, SPRITES.SKELETON, finalMinion];
        spriteData = order[Math.min(stage, 6)]; // Use index 0-6
    }
    
    let soundType = 'monster_groan';
    // Update sound logic for string keys
    if (spriteData === 'bat' || (spriteData.index === 3)) soundType = 'monster_squeak'; 
    else if (spriteData === 'spider' || (spriteData.index === 4)) soundType = 'monster_hiss'; 
    else if (spriteData === 'skeleton' || (spriteData.index === 7)) soundType = 'monster_rattle';

    // Difficulty Scaling
    let hp = type === 'boss' ? (200 + stage*50) : (30 + (stage * 15));
    let speed = 1.0 + (stage * 0.2);
    let size = type === 'boss' ? 105 : 60; // 50% increase (70->105, 40->60)
    let canShoot = (type === 'boss' && stage >= 4); // Final 3 bosses shoot

    console.log("Spawning enemy at", x, y, "Type:", type, "Dist to Player:", dist);

    const enemy = { 
        x: x, y: y, w: size, h: size, type: type, 
        hp: hp, maxHp: hp, speed: speed, canShoot: canShoot, shootTimer: 0,
        spriteKey: typeof spriteData === 'string' ? spriteData : null, // Store key specifically
        sheet: typeof spriteData === 'object' ? spriteData.sheet : spriteData, // Fallback/Legacy
        // Animation State
        frameX: 0, frameY: 0, flipX: false, isAttacking: false, animTimer: 0 + Math.floor(Math.random()*10), // Offset anims
        soundType: soundType 
    };
    gameState.enemies.push(enemy);
    return enemy;
}

function spawnBoss() {
    const currentBossInfo = gameState.selectedSpell.bosses[gameState.currentIngredientIndex];
    const name = currentBossInfo.name;
    
    // Find a safe spawn position for the boss (at least 600px away from player)
    let angle = Math.random() * Math.PI * 2;
    let dist = 600;
    let bx = player.x + Math.cos(angle) * dist;
    let by = player.y + Math.sin(angle) * dist;
    
    // Ensure inside map bounds (with padding)
    bx = Math.max(100, Math.min(MAP_WIDTH * TILE_SIZE - 100, bx));
    by = Math.max(100, Math.min(MAP_HEIGHT * TILE_SIZE - 100, by));

    // Force spawn even if safety check warns (we manually calculated a safe spot)
    console.log(`Spawning Boss ${name} at ${bx}, ${by} (Player at ${player.x}, ${player.y})`);
    
    spawnEnemy(bx, by, 'boss');
    
    // Verify boss actually spawned
    const boss = gameState.enemies[gameState.enemies.length-1];
    if (boss && boss.type === 'boss') {
        gameState.bossActive = true;
        gameState.bossEntity = boss;
        showMessage(`WARNING: ${name} approaches!`);
        playSound('monster_groan');
        document.getElementById('hud-mission').innerText = `Defeat ${name}!`;
    } else {
        console.error("Boss failed to spawn! Retrying next frame...");
        // Do NOT set bossActive = true, so it will try again next update
    }
}

// toggleLevitate moved to js/input.js

function playerAttack() {
    if ((gameState.screen !== 'PLAY' && gameState.screen !== 'RITUAL_MAP')) return;
    if (player.hp <= 0) return;
    
    // NEW: Fire Rate Cooldown Check
    const now = performance.now();
    const rate = player.fireRate || 250; // Defaults to 250ms rapid loop protection
    if (player.lastShotTime && now - player.lastShotTime < rate) return;
    player.lastShotTime = now;
    
    if (player.mana < 2 && !player.weapon) { playSound('empty'); return; }
    if (!player.weapon) player.mana -= 2; 
    playSound('shoot');
    
    // Trigger Animation
    player.isAttacking = true;
    player.frameX = 0;
    player.frameY = 3; // Row 3 is Attack
    
    const speed = player.projSpeed ? player.projSpeed : (player.weapon === 'piercing' ? 20 : (player.weapon === 'fireball' ? 10 : 12));
    let vx = 0, vy = 0;
    
    // 1. Joystick Input (8-way Snap for Mobile Requirement)
    if (joystickInput.active && (Math.abs(joystickInput.x) > 0.1 || Math.abs(joystickInput.y) > 0.1)) {
        // Calculate raw angle
        let angle = Math.atan2(joystickInput.y, joystickInput.x);
        
        // Snap to nearest 45 degrees (PI/4 radians)
        const snap = Math.PI / 4; 
        angle = Math.round(angle / snap) * snap;
        
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
    } else {
        // 2. Keyboard / Facing fallback
        let dir = player.facing || 'down'; 
        const diag = speed * 0.7071;
        
        switch(dir) {
            case 'up':          vx = 0;     vy = -speed; break;
            case 'down':        vx = 0;     vy = speed;  break;
            case 'left':        vx = -speed; vy = 0;     break;
            case 'right':       vx = speed;  vy = 0;     break;
            case 'up-left':     vx = -diag; vy = -diag; break;
            case 'up-right':    vx = diag;  vy = -diag; break;
            case 'down-left':   vx = -diag; vy = diag;  break;
            case 'down-right':  vx = diag;  vy = diag;  break;
            default:            vx = 0;     vy = speed; // Default Down
        }
    }

    let color = '#ff0';
    let size = parseFloat(player.projSize) || 18; // Default 6 * 3
    let pierce = false;
    let damage = parseFloat(player.projDamage) || 10;
    
    if (player.weapon === 'fireball') { color = '#fa0'; if (!player.projSize) size = 45; damage = parseFloat(player.projDamage) || 40; } // 15 * 3
    if (player.weapon === 'piercing') { color = '#0ff'; if (!player.projSize) size = 12; pierce = true; damage = parseFloat(player.projDamage) || 5; } // 4 * 3

    gameState.projectiles.push({
        x: player.x + player.w/2, 
        y: player.y + player.h/2, 
        vx: vx, vy: vy, 
        color: color, size: size, pierce: pierce, damage: damage, life: player.projDist || 120, // Dist
        weapon: player.weapon
    });
}

function isGamePausedByModal() {
    const alertModal = document.getElementById('custom-alert-modal');
    const riddleModal = document.getElementById('riddle-modal');
    const zoneMsg = document.getElementById('zone-msg-overlay');
    const colModal = document.getElementById('collection-modal');
    
    if (alertModal && alertModal.style.display !== 'none' && !alertModal.classList.contains('hidden')) return true;
    if (riddleModal && riddleModal.style.display !== 'none' && !riddleModal.classList.contains('hidden')) return true;
    if (zoneMsg) return true; // zone-msg-overlay is dynamically created/removed
    if (colModal && colModal.classList.contains('show')) return true;
    
    return false;
}

function update(dt) {
    if (isGamePausedByModal()) return;

    if (gameState.screen === 'RITUAL_MAP') {
        updateRitualMap(dt);
        return;
    }
    if (gameState.screen !== 'PLAY') return;
    
    // Decrement iFrame timer
    if (player.invulnTimer > 0) player.invulnTimer--;

    // Movement Logic
    if (gameState.screen === 'PLAY' && player.hp > 0) {
        let dx = 0, dy = 0;
        
        // Keyboard
        if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1;
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
        
        // Joystick override
        if (joystickInput.active) {
            dx = joystickInput.x;
            dy = joystickInput.y;
            // Add deadzone
            if(Math.abs(dx) < 0.1) dx = 0;
            if(Math.abs(dy) < 0.1) dy = 0;
        }

        if (dx !== 0 || dy !== 0) {
            // Normalize for diagonal speed
            const len = Math.sqrt(dx*dx + dy*dy);
            if (len > 1) { dx /= len; dy /= len; } // Only normalize if > 1 (keyboard) or allow analog control for stick

            let speed = player.speed;
            if (player.isLevitating) speed *= 1.5;
            
            // Collision Check (Simple)
            const checkCollision = (newX, newY) => {
                let tx = Math.floor((newX + player.w/2) / TILE_SIZE);
                let ty = Math.floor((newY + player.h/2) / TILE_SIZE);
                // Bounding box checks
                if(tx < 0 || tx >= MAP_WIDTH || ty < 0 || ty >= MAP_HEIGHT) return true; // Treat out of bounds as collision
                
                let tile = (gameState.map[ty] && gameState.map[ty][tx]) ? gameState.map[ty][tx] : null;
                if (!tile) return true; // Treat null tile as collision
                let isWalkable = tile.type.type === 'walkable'; 
                if (tile.type.type === 'obstacle' && player.isLevitating) isWalkable = true;
                return !isWalkable;
            };

            let nextX = player.x + dx * speed;
            let nextY = player.y + dy * speed;
            
            // Boundary
            if (nextX < 0) nextX = 0; if (nextX > MAP_WIDTH*TILE_SIZE - player.w) nextX = MAP_WIDTH*TILE_SIZE - player.w;
            if (nextY < 0) nextY = 0; if (nextY > MAP_HEIGHT*TILE_SIZE - player.h) nextY = MAP_HEIGHT*TILE_SIZE - player.h;

            if (!checkCollision(nextX, nextY)) {
                player.x = nextX;
                player.y = nextY;
            } else if (!checkCollision(player.x, nextY)) {
                 player.y = nextY; // Slide Y
            } else if (!checkCollision(nextX, player.y)) {
                 player.x = nextX; // Slide X
            }
            
            // --- UPDATED FACING LOGIC (Visuals Fix) ---
            // Determine primary facing for sprites
            if (joystickInput.active) {
                // Use input angle for true 8-way facing
                const angle = Math.atan2(dy, dx);
                const deg = angle * (180 / Math.PI);
                
                if (deg > -22.5 && deg <= 22.5) player.facing = 'right';
                else if (deg > 22.5 && deg <= 67.5) player.facing = 'down-right';
                else if (deg > 67.5 && deg <= 112.5) player.facing = 'down';
                else if (deg > 112.5 && deg <= 157.5) player.facing = 'down-left';
                else if (Math.abs(deg) > 157.5) player.facing = 'left';
                else if (deg < -112.5 && deg >= -157.5) player.facing = 'up-left';
                else if (deg < -67.5 && deg >= -112.5) player.facing = 'up';
                else if (deg < -22.5 && deg >= -67.5) player.facing = 'up-right';
            } else {
                // Keyboard fallback (Explicit diagonals)
                if (dy < 0 && dx < 0) player.facing = 'up-left';
                else if (dy < 0 && dx > 0) player.facing = 'up-right';
                else if (dy > 0 && dx < 0) player.facing = 'down-left';
                else if (dy > 0 && dx > 0) player.facing = 'down-right';
                else if (dx < 0) player.facing = 'left';
                else if (dx > 0) player.facing = 'right';
                else if (dy < 0) player.facing = 'up';
                else if (dy > 0) player.facing = 'down';
            }

            // Sync visual sprites to facing
            // Row 0: Down (and diagonals-down)
            // Row 1: Up (and diagonals-up)
            // Row 2: Side (Left/Right)
            // ONLY UPDATE IF NOT ATTACKING (Preserve Row 3)
            if (!player.isAttacking) {
                if (player.facing.includes('up')) player.frameY = 1;
                else if (player.facing.includes('down')) player.frameY = 0;
                else if (player.facing === 'left' || player.facing === 'right') player.frameY = 2;
            }

            // Flip check
            player.flipX = (player.facing.includes('left'));

            // Animation
            player.animTimer++;
            if (player.animTimer > 10) { player.frameX = (player.frameX + 1) % 4; player.animTimer = 0; }
        } else {
             // Only reset to idle frame if NOT attacking
             if (!player.isAttacking) {
                player.frameX = 0; 
             }
        }
        
        // Camera Follow
        gameState.camera.x = player.x + player.w/2 - VIEWPORT_W/2;
        gameState.camera.y = player.y + player.h/2 - VIEWPORT_H/2;
        // Clamp Camera
        gameState.camera.x = Math.max(0, Math.min(gameState.camera.x, MAP_WIDTH*TILE_SIZE - VIEWPORT_W));
        gameState.camera.y = Math.max(0, Math.min(gameState.camera.y, MAP_HEIGHT*TILE_SIZE - VIEWPORT_H));
    }
    
    // --- PLAYER ANIMATION LOGIC (Attack part) ---
    if (player.isAttacking) {
        // Attack Animation
        player.animTimer++;
        if (player.animTimer > 5) { // Fast attack
            player.frameX++;
            player.animTimer = 0;
            if (player.frameX > 3) {
                player.isAttacking = false;
                player.frameX = 0;
                // Return to correct walking frame row based on facing
                 if(player.facing.includes('down')) player.frameY = 0;
                 else if(player.facing.includes('up')) player.frameY = 1;
                 else if(player.facing === 'left' || player.facing === 'right') player.frameY = 2;
            }
        }
    }
    
    // Mana Regeneration / Levitation Drain
    if (player.isLevitating) { 
        player.mana -= 0.1; 
        if (player.mana <= 0) player.isLevitating = false; 
        // createParticles(player.x + 15, player.y + 30, 1, '#aaf'); // Optional visual
    } else { 
        if (player.mana < player.maxMana) player.mana += 0.2; 
    }
    updateManaUI();
    

    
    // Process Projectiles (REVERSE LOOP to fix splicing bug)
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        let p = gameState.projectiles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        
        let hitEnemy = false;
        // Check collision with all alive enemies
        for (let j = 0; j < gameState.enemies.length; j++) {
            let e = gameState.enemies[j];
            let pSize = p.size || 10;
            if (rectIntersect(p.x, p.y, pSize, pSize, e.x, e.y, e.w, e.h)) {
                e.hp -= (p.damage || 10); p.life = 0; hitEnemy = true;
                playSound('enemy_hit'); // Updated Sound
                createParticles(e.x + e.w/2, e.y + e.h/2, 15, gameState.selectedSpell.color);
                
                if (e.hp <= 0) {
                    // Mark for deletion later or handle splicing carefully
                    // Here we just modify the array in place since we aren't iterating enemies with index issues in this specific inner loop context
                    // BUT to be safe, we will mark them as dead and filter later
                    e.dead = true;
                    playSound('enemy_kill'); // Updated Sound
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
        let pSize = ep.size || 10;
        if (rectIntersect(ep.x, ep.y, pSize, pSize, player.x, player.y, player.w, player.h)) {
            takeDamage(ep.damage || 15, "Enemy Projectile");
            createParticles(player.x + player.w/2, player.y + player.h/2, 15, '#ff3300');
            ep.life = 0;
        }
    });
    gameState.enemyProjectiles = gameState.enemyProjectiles.filter(p => p.life > 0);

    // Enemies Logic
    gameState.enemies.forEach(e => {
        let angle = Math.atan2(player.y - e.y, player.x - e.x); 
        let speed = (e.type === 'boss' ? 2.5 * e.speed : 1.5 * e.speed);
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;
        
        e.x += vx; 
        e.y += vy;
        
        // --- ENEMY SEPARATION (Anti-Overlap) ---
        gameState.enemies.forEach(other => {
            if (e === other) return;
            const dist = distance(e.x, e.y, other.x, other.y);
            const minDist = (e.w + other.w) * 0.4; // Partial overlap allowed, but push apart
            
            if (dist < minDist && dist > 0) {
                const pushX = (e.x - other.x) / dist;
                const pushY = (e.y - other.y) / dist;
                e.x += pushX * 1.5; // Push e away
                e.y += pushY * 1.5;
            }
        });
        
        // --- ENEMY ANIMATION ---
        
        if (e.isAttacking) {
            // Attack Animation (Row 3 / Index 3)
            e.animTimer++;
            if (e.animTimer > 5) {
                e.frameX++;
                e.animTimer = 0;
                if (e.frameX > 3) {
                    e.isAttacking = false; // Attack complete
                    e.frameX = 0;
                    // Reset to walk row will happen next frame
                }
            }
            e.frameY = 3; // Force Attack Row
        } else {
            // Simple directional mapping (Walk)
            if (Math.abs(vy) > Math.abs(vx)) {
                if (vy > 0) { e.frameY = 0; e.flipX = false; }
                else { e.frameY = 1; e.flipX = false; }
            } else {
                e.frameY = 2; // Side
                if (vx < 0) e.flipX = true; else e.flipX = false;
            }
            
            // Animate walk
            e.animTimer++;
            if (e.animTimer > 10) {
                e.frameX = (e.frameX + 1) % 4;
                e.animTimer = 0;
            }
        }
        
        // Shooting
        if (e.canShoot) {
            e.shootTimer++;
            const tRate = e.fireRate || 100;
            if (e.shootTimer > tRate) {
                e.shootTimer = 0;
                let ejSpeed = e.projSpeed || 6;
                let ejDamage = e.projDamage || 15;
                gameState.enemyProjectiles.push({ 
                    x: e.x + e.w/2, 
                    y: e.y + e.h/2, 
                    vx: Math.cos(angle)*ejSpeed, 
                    vy: Math.sin(angle)*ejSpeed, 
                    life: e.projDist || 60,
                    damage: ejDamage
                });
                playSound('shoot');
            }
        }

        if (Math.random() < 0.005 && distance(player.x, player.y, e.x, e.y) < 600) playSound(e.soundType);
        
        // Collision with player
        if (rectIntersect(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) { 
            takeDamage(10, "Enemy Contact (" + e.type + ")");
            // Trigger Enemy Attack Animation
            if (!e.isAttacking) {
                e.isAttacking = true;
                e.frameX = 0;
                e.frameY = 3; 
                e.animTimer = 0;
            }
        }
    });
    
    let dist = distance(player.x, player.y, currentObjective.x, currentObjective.y);
    document.getElementById('compass').style.transform = `rotate(${Math.atan2(currentObjective.y - player.y, currentObjective.x - player.x) * (180/Math.PI)}deg)`;
    const distEl = document.getElementById('hud-distance-val');
    if(distEl) distEl.innerText = Math.floor(dist/10) + 'm'; // Update Distance Text (scaled down)

    if (dist < 400 && !gameState.bossActive && !currentObjective.bossDefeated && currentObjective.active && currentObjective.item !== 'PORTAL' && !gameState.enemies.some(e => e.type === 'boss')) spawnBoss();
    
    // Strict Hitbox for Pickup (40px radius check for 80px item)
    if (dist < 40 && currentObjective.active && (!gameState.bossActive || currentObjective.bossDefeated)) { 
        if (!gameState.bossEntity) { 
            if(currentObjective.item === 'PORTAL') enterPortal();
            else {
                // Must defeat all enemies
                if(gameState.enemies.length === 0) {
                     collectIngredient(); 
                } else {
                     document.getElementById('compass').style.transform = `rotate(${Math.atan2(currentObjective.y - player.y, currentObjective.x - player.x) * (180/Math.PI)}deg)`;
                     const distEl = document.getElementById('hud-distance-val');
                     if(distEl) distEl.innerText = 'Clear Enemies first!';
                }
            }
        } 
    }
    
    const hpEl = document.getElementById('hud-hp');
    const manaEl = document.getElementById('hud-mana');
    if(hpEl) hpEl.innerText = Math.floor(player.hp); 
    if(manaEl) manaEl.innerText = Math.floor(player.mana);
}

function takeDamage(amount, source) {
    if (player.invulnTimer > 0) return;
    
    console.warn(`[DAMAGE] Player took ${amount} damage from ${source}. Pos: ${Math.floor(player.x)},${Math.floor(player.y)} | HP: ${player.hp} -> ${player.hp - amount}`);
    
    player.hp -= amount;
    player.invulnTimer = 30; // 0.5s invincibility (60fps)
    playSound('hit_player');
    
    if (player.hp <= 0) {
        console.error("Player died!");
        respawnPlayer();
    }
}

function respawnPlayer() {
    console.log("Respawning player...");
    player.hp = 0;
    
    // Safety Invulnerability (prevent taking damage while modal is open)
    player.invulnTimer = 999999;
    
    // Clear any stuck zone messages
    const existingMsg = document.getElementById('zone-msg-overlay');
    if (existingMsg) existingMsg.remove();
    
    const existingStyle = document.getElementById('zone-msg-style');
    if (existingStyle) existingStyle.remove();

    // Reset Input State to prevent sticky movement
    keys = {}; 
    
    // Custom Modal instead of Alert to keep Fullscreen
    const modal = document.createElement('div');
    modal.style.position = 'fixed'; modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100%'; modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.8)'; modal.style.color = '#fff'; modal.style.display = 'flex'; modal.style.flexDirection = 'column';
    modal.style.justifyContent = 'center'; modal.style.alignItems = 'center'; modal.style.zIndex = '1000';
    modal.innerHTML = `<h1>You Fainted!</h1><p>The spirits utilize your mana to return you to safety...</p><button class="btn" id="respawn-btn">Rise Again</button>`;
    
    const container = document.getElementById('game-container') || document.body;
    container.appendChild(modal);
    
    document.getElementById('respawn-btn').onclick = () => {
        modal.remove();
        toggleFullScreen(); // Re-trigger ensures we stay in fullscreen if lost
        
        player.hp = 100;
        player.mana = player.maxMana;
        player.invulnTimer = 180; // 3 seconds normal invulnerability

        if (gameState.screen === 'RITUAL_MAP') {
            const saveProgress = (gameState.playerRespawnProgress === 'save');
            const locStart = (gameState.playerRespawnLoc === 'start');

            if (!saveProgress) {
                // Restart Map from Scratch
                initRitualMap();
            } else {
                // Save Progress (Keep items/enemy states)
                if (locStart && gameState.mapStartX !== undefined) {
                    player.x = gameState.mapStartX;
                    player.y = gameState.mapStartY;
                }
                // Else: Place of Death (don't move them)
            }
        } else {
            // Default Overworld respawn
            player.x = (MAP_WIDTH/2)*TILE_SIZE; 
            player.y = (MAP_HEIGHT/2)*TILE_SIZE; 
        }
    };

    playSound('shimmer');
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
        colIcon.innerHTML = '';
        const c = document.createElement('canvas'); c.width = 40; c.height = 40; // 1/2 size (was 60, orig 80)
        const ctxIcon = c.getContext('2d');
        const sheet = SPRITE_SHEETS[currentObjective.sheet];
        const index = currentObjective.index;
        if(spritesLoaded) {
            ctxIcon.drawImage(sheet, (index%4)*512, Math.floor(index/4)*512, 512, 512, 0, 0, 40, 40);
        }
        colIcon.appendChild(c);
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
    document.getElementById('canvas-wrapper').style.display = 'none';
    document.getElementById('hud').style.display = 'none';
    
    // Trigger transition overlay
    const overlay = document.getElementById('transition-overlay');
    overlay.classList.add('active');
    
    setTimeout(() => {
        overlay.classList.remove('active');
        document.getElementById('canvas-wrapper').style.display = 'block';
        document.getElementById('hud').style.display = 'flex';
        
        // Redirect to Ritual Map Initialization
        gameState.screen = 'RITUAL_MAP';
        initRitualMap();
    }, 1000);
}

function closeRitualIntro() {
    const modal = document.getElementById('ritual-intro-modal');
    if (modal) {
        modal.classList.remove('show');
    }
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

// Draw Helpers
// Generic Sprite Drawer with Animation Support
function drawSprite(ctx, imageOrKey, x, y, size, frameX = 0, frameY = 0, flipX = false) {
    if (!spritesLoaded) return;
    
    let img;
    if (typeof imageOrKey === 'string') {
        img = SPRITE_SHEETS[imageOrKey];
    } else {
        // Fallback for legacy sprite objects (e.g. {sheet:'CHARS', index:0})
        if (imageOrKey && imageOrKey.sheet) {
            img = SPRITE_SHEETS[imageOrKey.sheet];
            // Conversion for old index-based sprites (static)
            const index = imageOrKey.index;
            frameX = index % 4;
            frameY = Math.floor(index / 4);
        } else {
            return; // Invalid
        }
    }
    
    if (!img) return;

    const frameSize = 512; // As per spec
    const sx = frameX * frameSize;
    const sy = frameY * frameSize;

    ctx.save();
    
    // Move to center of timestamp to handle flip
    ctx.translate(x + size/2, y + size/2);
    
    if (flipX) ctx.scale(-1, 1);
    


    // Draw centered
    ctx.drawImage(img, sx, sy, frameSize, frameSize, -size/2, -size/2, size, size);
    
    ctx.restore();
}

// Helper to log warning only once
console.warnOnce = (function() {
    let logged = {};
    return function(msg) {
        if (!logged[msg]) {
            console.warn(msg);
            logged[msg] = true;
        }
    };
})();

// Debug log for sheet dimensions on load
function logSheetDimensions() {
    console.log("Sprite Sheet Dimensions:");
    for (let key in SPRITE_SHEETS) {
        const img = SPRITE_SHEETS[key];
        console.log(`${key}: ${img.width}x${img.height} (Loaded: ${img.complete})`);
    }
}

function draw() {
    if (gameState.screen === 'RITUAL_MAP') {
        drawRitualMap();
        return;
    }
    if (gameState.screen !== 'PLAY') return;
    
    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Use actual canvas size
        


        // Fill background (outside map)
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        
        // Camera Transform using dynamic viewport
        // Ensure camera values are valid
        if (isNaN(gameState.camera.x) || isNaN(gameState.camera.y)) {
             gameState.camera.x = 0; gameState.camera.y = 0;
             console.warn("Fixed NaN Camera");
        }
        
        ctx.translate(-Math.floor(gameState.camera.x), -Math.floor(gameState.camera.y)); // Floor to prevent subpixel blur

    
    // Draw Map (Optimization: only visible tiles)
    const startX = Math.floor(gameState.camera.x / TILE_SIZE);
    const startY = Math.floor(gameState.camera.y / TILE_SIZE);
    const endX = startX + Math.ceil(VIEWPORT_W / TILE_SIZE) + 1;
    const endY = startY + Math.ceil(VIEWPORT_H / TILE_SIZE) + 1;

    // OPTIMIZATION: Set Text Properties ONCE before loop
    ctx.font = '30px sans-serif';
    ctx.textAlign = 'center'; 
    ctx.textBaseline = 'middle';

    for (let y = Math.max(0, startY); y < Math.min(MAP_HEIGHT, endY); y++) {
        for (let x = Math.max(0, startX); x < Math.min(MAP_WIDTH, endX); x++) {
            let t = gameState.map[y][x];
            drawTile(ctx, t.type, t.x, t.y);
            if (t.deco) {
               ctx.fillText(t.deco, t.x + TILE_SIZE/2, t.y + TILE_SIZE/2);
            }
        }
    }
    
    // Objective / Item
    if (currentObjective.active && currentObjective.item !== 'PORTAL') {
         let size = 80; // Doubled Size (was 40)
         let pulse = Math.sin(Date.now() / 200) * 5;
         
         if (!currentObjective.bossDefeated && gameState.bossActive) ctx.globalAlpha = 0.6;
         

         drawSprite(ctx, { sheet: currentObjective.sheet, index: currentObjective.index }, currentObjective.x - pulse/2, currentObjective.y - pulse/2, size + pulse);
         
         ctx.globalAlpha = 1.0;
    }
    
    // Portal
    if (currentObjective.item === 'PORTAL' && currentObjective.active) {
         let size = 60;
         let rot = (Date.now() / 1000) * Math.PI;
         
         ctx.save();
         ctx.translate(currentObjective.x + TILE_SIZE/2, currentObjective.y + TILE_SIZE/2);
         ctx.rotate(rot);
         // Use legacy lookup for Portal (sheet: CHARS, index: 13)
         // But we have to manually call drawImage because rotation implies we need center pivot which drawSprite does...
         // Actually, let's just use raw ctx.drawImage for this special rotatable
         const pSheet = SPRITE_SHEETS.CHARS;
         if(pSheet.complete) {
            ctx.drawImage(pSheet, (13%4)*512, Math.floor(13/4)*512, 512, 512, -30, -30, 60, 60);
         }
         ctx.restore();
    }

    // Enemies
    gameState.enemies.forEach(e => {
        // CULLING OPTIMIZATION: Only draw if within Viewport + Margin
        if (e.x + e.w < gameState.camera.x - 100 || e.x > gameState.camera.x + VIEWPORT_W + 100 ||
            e.y + e.h < gameState.camera.y - 100 || e.y > gameState.camera.y + VIEWPORT_H + 100) {
            return;
        }



        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(e.x + e.w/2, e.y + e.h - 5, e.w/2, 10, 0, 0, Math.PI*2); ctx.fill();

        // Sprite
        // e.spriteKey contains the string key 'slime', 'bat', etc.
        if(e.spriteKey) {
             drawSprite(ctx, e.spriteKey, e.x, e.y, e.w, e.frameX, e.frameY, e.flipX);
        } else if (e.sprite && e.sprite.sheet) {
             // Fallback for any legacy objects
             drawSprite(ctx, e.sprite, e.x, e.y, e.w);
        }
        
        // HP Bar (New Style: White Border, Red Back, Green Front)
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(e.x, e.y - 12, e.w, 8);
        ctx.fillStyle = '#cc0000'; ctx.fillRect(e.x, e.y - 12, e.w, 8); // Red Back
        ctx.fillStyle = '#00cc00'; ctx.fillRect(e.x, e.y - 12, e.w * (e.hp/e.maxHp), 8); // Green Front
    });
    
    // Player
    if (player.hp > 0 && player.invulnTimer % 10 < 5) {


        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(player.x + player.w/2, player.y + player.h - 5, player.w/2, 10, 0, 0, Math.PI*2); ctx.fill();

        // Sprite
        const pKey = gameState.playerClass === 'witch' ? 'PLAYER_WITCH' : 'PLAYER_WIZARD';
        // The key in SPRITES is now 'witch' or 'wizard'
        const spriteName = SPRITES[pKey];
        
        drawSprite(ctx, spriteName, player.x, player.y, player.w, player.frameX, player.frameY, player.flipX);
        
        if(player.isLevitating) {
            // Circle removed as requested
            // Keeping shadow or other subtle effect if needed, but circle gone.
            // ctx.strokeStyle = '#aaf'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(player.x+20, player.y+20, 25, 0, Math.PI*2); ctx.stroke();
        }
    }
    
    // Projectiles
    gameState.projectiles.forEach(p => window.drawActiveProjectile(ctx, p, false));
    // Enemy Projectiles
    gameState.enemyProjectiles.forEach(p => window.drawActiveProjectile(ctx, p, true));

    // Particles
    gameState.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
        p.x += p.vx; p.y += p.vy; p.life--;
    });
    gameState.particles = gameState.particles.filter(p => p.life > 0);

    ctx.restore();
    } catch(e) {
        console.error("Draw Loop Error:", e);
        ctx.restore(); // Ensure restore happens
    }
}

function gameLoop(timestamp) { const dt = timestamp - gameState.lastTime; gameState.lastTime = timestamp; update(dt); draw(); requestAnimationFrame(gameLoop); }
function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) { return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1; }
function distance(x1, y1, x2, y2) { return Math.hypot(x1-x2, y1-y2); }
window.drawActiveProjectile = function(ctx, p, isEnemy) {
    let drawColor = p.color || (isEnemy ? '#f00' : '#fff');
    let s = p.size || (isEnemy ? 18 : 6);
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = drawColor;
    
    let isSpriteProjectile = p.weapon && typeof AVAILABLE_ASSETS !== 'undefined' && AVAILABLE_ASSETS.find(a => a.id === p.weapon);
    if (!isSpriteProjectile && p.weapon && p.weapon.includes('_')) {
        isSpriteProjectile = true; // Fallback
    }
    
    if (isSpriteProjectile) {
        const angle = Math.atan2(p.vy, p.vx);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        
        let loadedPath = p.weapon;
        let cropX = 0, cropY = 0, cropW = 512, cropH = 512;
        
        if (typeof AVAILABLE_ASSETS !== 'undefined') {
            const asset = AVAILABLE_ASSETS.find(a => a.id === p.weapon);
            if (asset) {
                loadedPath = asset.path.replace('../../', '../');
                cropX = asset.sx || 0;
                cropY = asset.sy || 0;
                cropW = asset.sw || 512;
                cropH = asset.sh || 512;
            }
        }
        
        if (!SPRITE_SHEETS[loadedPath] && loadedPath.includes('.png')) {
            const img = new Image(); img.src = loadedPath; SPRITE_SHEETS[loadedPath] = img;
        }
        
        if (SPRITE_SHEETS[loadedPath] && SPRITE_SHEETS[loadedPath].complete) {
            ctx.drawImage(SPRITE_SHEETS[loadedPath], cropX, cropY, cropW, cropH, -s, -s, s*2, s*2);
        } else {
            ctx.fillStyle = drawColor; ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    } else if (p.weapon === 'piercing') {
        const angle = Math.atan2(p.vy, p.vx);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.fillStyle = drawColor;
        ctx.fillRect(-s * 1.5, -4, s * 3, 8); // Laser rectangle
        ctx.restore();
    } else {
        ctx.fillStyle = drawColor; 
        ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, Math.PI*2); ctx.fill();
    }
    
    ctx.shadowBlur = 0;
};

// --- POLYGON-AWARE COLLISION HELPERS ---
function buildAssetPoly(a) {
    const at = a.edgeAnchors?.t ?? 0.5, ab = a.edgeAnchors?.b ?? 0.5;
    const al = a.edgeAnchors?.l ?? 0.5, ar = a.edgeAnchors?.r ?? 0.5;
    // cornerOffsets are authored in sprite-sheet pixel units (relative to the crop region).
    // Scale them to world-space pixels using the ratio of world size to crop size.
    const sx = a.cw ? (a.w / a.cw) : 1;
    const sy = a.ch ? (a.h / a.ch) : 1;
    const co = a.cornerOffsets || {};
    const s = (o, axis) => o ? o[axis] * (axis === 'x' ? sx : sy) : 0;
    return [
        [a.x + a.w * at,                              a.y],
        [a.x + s(co.tl,'x'),                          a.y  + s(co.tl,'y')],
        [a.x,                                         a.y  + a.h * al],
        [a.x + s(co.bl,'x'),                          a.y  + a.h + s(co.bl,'y')],
        [a.x + a.w * ab,                              a.y  + a.h],
        [a.x + a.w + s(co.br,'x'),                    a.y  + a.h + s(co.br,'y')],
        [a.x + a.w,                                   a.y  + a.h * ar],
        [a.x + a.w + s(co.tr,'x'),                    a.y  + s(co.tr,'y')]
    ];
}
function pointInPoly(px, py, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
        if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}
// polyVsRect and assetIntersect moved to js/ritual-map.js
function createParticles(x, y, count, color) { for(let i=0;i<count;i++) gameState.particles.push({x:x,y:y,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,life:30,size:Math.random()*4,color:color}); }
function showMessage(msg, d=3000) { const el=document.getElementById('message-log'); el.innerText=msg; el.style.display='block'; setTimeout(()=>el.style.display='none', d); }

// --- RITUAL LOGIC ---
// stirState, initRitual, updateRitualUI, triggerAddIngredient,
// spawnSteam, spawnBubbles, setupStirring, transitionToFinalStep,
// and performFinalActivation have been moved to js/cauldron.js

function updateManaUI() {
    const hpEl = document.getElementById('hud-hp');
    const manaEl = document.getElementById('hud-mana');
    if(hpEl) hpEl.innerText = Math.floor(player.hp);
    if(manaEl) manaEl.innerText = Math.floor(player.mana);
}

function finishGame() {
    document.getElementById('cauldron-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');
    document.getElementById('end-spell-name').innerText = gameState.selectedSpell.name;
    document.getElementById('end-message').innerText = `Ritual complete! The spirits accepted your offering. Your intention for ${gameState.selectedSpell.id.toUpperCase()} manifests now.`;
}

// RITUAL_SPRITES, ritualState, initRitualMap (including all addAsset lines)
// have been moved to js/ritual-map.js

// initRitualMap() body moved to js/ritual-map.js
function showRiddleModal(props, successCallback) {
    const modal = document.getElementById('riddle-modal');
    if (!modal) {
        alert("Riddle: " + (props.qRiddle || 'Solve the puzzle?')); 
        return successCallback(); // Fallback if no DOM
    }
    
    document.getElementById('riddle-text').innerText = props.qRiddle || 'Solve the puzzle?';
    
    const optsContainer = document.getElementById('riddle-options-container');
    const txtInput = document.getElementById('riddle-text-input');
    const subBtn = document.getElementById('riddle-submit-btn');
    
    optsContainer.innerHTML = '';
    
    let isMultipleChoice = (props.qRiddleA && props.qRiddleA.trim() !== '') || (props.qRiddleB && props.qRiddleB.trim() !== '') || (props.qRiddleC && props.qRiddleC.trim() !== '') || (props.qRiddleD && props.qRiddleD.trim() !== '');
    
    if (isMultipleChoice) {
        txtInput.style.display = 'none';
        subBtn.style.display = 'none';
        optsContainer.style.display = 'flex';
        
        const options = [];
        if(props.qRiddleA) options.push({label: props.qRiddleA, key: 'A'});
        if(props.qRiddleB) options.push({label: props.qRiddleB, key: 'B'});
        if(props.qRiddleC) options.push({label: props.qRiddleC, key: 'C'});
        if(props.qRiddleD) options.push({label: props.qRiddleD, key: 'D'});
        
        options.forEach(opt => {
            let btn = document.createElement('button');
            btn.className = 'btn';
            btn.style.width = '100%';
            btn.style.textAlign = 'left';
            btn.innerText = opt.label;
            btn.onclick = () => {
                const ans = props.qRiddleAns ? props.qRiddleAns.toUpperCase().trim() : 'A'; 
                if(ans === opt.key) {
                    ritualState.riddleAnswered = true;
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                    successCallback();
                } else {
                    alert('Incorrect answer. The Guardian remains steadfast.');
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                }
            };
            optsContainer.appendChild(btn);
        });
    } else {
        optsContainer.style.display = 'none';
        txtInput.style.display = 'block';
        txtInput.value = '';
        subBtn.style.display = 'block';
        subBtn.onclick = () => {
             const ans = props.qRiddleAns ? props.qRiddleAns.toLowerCase().trim() : '';
             if (txtInput.value.toLowerCase().trim() === ans) {
                  ritualState.riddleAnswered = true;
                  modal.classList.add('hidden');
                  modal.style.display = 'none';
                  successCallback();
             } else {
                  alert('Incorrect answer. The Guardian remains steadfast.');
                  modal.classList.add('hidden');
                  modal.style.display = 'none';
             }
        };
    }
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

// updateRitualMap() and drawRitualMap() moved to js/ritual-map.js
init();