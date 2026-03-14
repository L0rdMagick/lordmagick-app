/** CAULDRON MINI-GAME: Stirring, ingredient dropping, and ritual UI. */

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
        
        if(overlay) overlay.style.backgroundColor = gameState.selectedSpell.color;
        
        spawnBubbles(5);
        if(gameState.steamInterval) clearInterval(gameState.steamInterval);
        gameState.steamInterval = setInterval(() => spawnSteam(), 500); 
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
        // const icon = gameState.selectedSpell.icons[gameState.ritualStep]; // REMOVED
        const sheetKey = gameState.selectedSpell.sheet;
        const index = gameState.selectedSpell.spriteIndices[gameState.ritualStep];
        
        if(instr) instr.innerHTML = `Step ${gameState.ritualStep+1}/7: Add <span style="color:${gameState.selectedSpell.color}">${ingName}</span>`;
        if(chant) chant.innerText = `"${chantText}"`;
        if(itemVisual) {
            itemVisual.innerHTML = ''; // Clear text
            const c = document.createElement('canvas'); c.width = 100; c.height = 100;
            const ctxIcon = c.getContext('2d');
            const sheet = SPRITE_SHEETS[sheetKey];
            if(spritesLoaded) {
                ctxIcon.drawImage(sheet, (index%4)*512, Math.floor(index/4)*512, 512, 512, 0, 0, 100, 100);
            }
            itemVisual.appendChild(c);
            
            itemVisual.className = 'ingredient-visual'; 
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
    // Capture current data before it updates
    const currentStep = gameState.ritualStep;
    const sheetKey = gameState.selectedSpell.sheet;
    const spriteIndex = gameState.selectedSpell.spriteIndices[currentStep];
    
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
                // floatingItem.innerText = currentIcon; // REPLACED
                const c = document.createElement('canvas'); c.width = 40; c.height = 40;
                const ctxIcon = c.getContext('2d');
                const sheet = SPRITE_SHEETS[sheetKey];
                if(spritesLoaded) {
                    ctxIcon.drawImage(sheet, (spriteIndex%4)*512, Math.floor(spriteIndex/4)*512, 512, 512, 0, 0, 40, 40);
                }
                floatingItem.appendChild(c);

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
