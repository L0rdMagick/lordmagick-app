// --- START OF FILE src/app/components/ElectricMagick/hooks.ts ---
"use client";

import { useRef, useCallback, useEffect } from 'react';

export const getMagickalNumber = (min: number, max: number): number => {
  const sacredNumbers = [3, 7, 9, 11, 13, 21, 23, 33, 42, 72, 93, 108];
  const valid = sacredNumbers.filter(n => n >= min && n <= max);
  return valid.length > 0 
    ? valid[Math.floor(Math.random() * valid.length)] 
    : Math.floor(Math.random() * (max - min + 1)) + min;
};

export const useAudioEngine = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const oscillatorsRef = useRef<any[]>([]);

  const initAudio = useCallback(() => {
    if (typeof window !== 'undefined' && !audioCtxRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
          audioCtxRef.current = new AudioContext();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType = 'sine', duration = 1, volume = 0.1) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, []);

  const playDrone = useCallback((active: boolean, frequency = 55) => {
    if (!audioCtxRef.current) return;
    
    if (active) {
        if (oscillatorsRef.current.length > 0) {
            oscillatorsRef.current.forEach((o, i) => {
                const detune = i * 2; 
                o.osc.frequency.setTargetAtTime(frequency + detune, audioCtxRef.current!.currentTime, 0.1);
            });
            return;
        }

        const ctx = audioCtxRef.current;
        const freqs = [frequency, frequency * 1.5]; 
        
        freqs.forEach(f => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = f;
            gain.gain.value = 0.05;
            osc.type = 'sawtooth';
            
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 200;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            oscillatorsRef.current.push({osc, gain, filter});
        });
    } else {
        oscillatorsRef.current.forEach(o => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                o.gain.gain.setTargetAtTime(0, audioCtxRef.current!.currentTime, 0.5);
                setTimeout(() => o.osc.stop(), 600);
            } catch (e) { console.log(e) }
        });
        oscillatorsRef.current = [];
    }
  }, []);

  const modulateFilter = useCallback((val: number) => {
      oscillatorsRef.current.forEach(o => {
          if(o.filter) {
              o.filter.frequency.setTargetAtTime(val, audioCtxRef.current!.currentTime, 0.1);
          }
      });
  }, []);

  useEffect(() => {
    return () => {
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
    };
  }, []);

  return { initAudio, playTone, playDrone, modulateFilter };
};

export const useParticleSystem = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const particlesRef = useRef<any[]>([]);

  const spawnExplosion = (x: number, y: number, color = '#a855f7', count = 30) => {
    if (!canvasRef.current) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
        size: Math.random() * 3 + 1
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; 
        p.vx *= 0.95; 
        p.life -= 0.02;
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return { canvasRef, spawnExplosion };
};