/** AUDIO SYSTEM: AudioCtx and playSound(). */

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
    } else if (type === 'enemy_hit') { // New unique hit sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, now);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'enemy_kill') { // New unique kill sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }
}
