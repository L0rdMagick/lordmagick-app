/** INPUT HANDLING: Mobile joystick logic, toggleLevitate, and handleFire. */

// Mobile Input State
let joystickInput = { x: 0, y: 0, active: false };

function initMobileControls() {
    const zone = document.getElementById('joystick-zone');
    const knob = document.getElementById('joystick-knob');
    
    if (!zone || !knob) return;

    let startX = 0, startY = 0;
    const maxDist = 40; // Max distance knob can move from center

    const handleStart = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = zone.getBoundingClientRect();
        // Center of joystick
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        startX = centerX;
        startY = centerY;
        joystickInput.active = true;
        updateKnob(touch.clientX, touch.clientY);
    };

    const handleMove = (e) => {
        e.preventDefault();
        if (!joystickInput.active) return;
        const touch = e.touches[0];
        updateKnob(touch.clientX, touch.clientY);
    };

    const handleEnd = (e) => {
        e.preventDefault();
        joystickInput.active = false;
        joystickInput.x = 0;
        joystickInput.y = 0;
        knob.style.transform = `translate(-50%, -50%)`;
    };

    const updateKnob = (clientX, clientY) => {
        // Calculate vector from center
        const rect = zone.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = clientX - centerX;
        let dy = clientY - centerY;
        
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Normalize if outside maxDist
        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }

        // Move Knob
        knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        
        // Set Input (Normalized -1 to 1)
        joystickInput.x = dx / maxDist;
        joystickInput.y = dy / maxDist;
    };

    zone.addEventListener('touchstart', handleStart, {passive: false});
    zone.addEventListener('touchmove', handleMove, {passive: false});
    zone.addEventListener('touchend', handleEnd);
    zone.addEventListener('touchcancel', handleEnd);
}

function handleFire(e) {
    if(e) e.preventDefault();
    playerAttack();
}

function toggleLevitate(e) {
    if(e) e.preventDefault();
    if (gameState.screen !== 'PLAY' && gameState.screen !== 'RITUAL_MAP') return; 
    if (player.mana >= 10 || player.isLevitating) { 
        player.isLevitating = !player.isLevitating; 
        if (player.isLevitating) createParticles(player.x, player.y, 10, '#fff'); 
    }
}
