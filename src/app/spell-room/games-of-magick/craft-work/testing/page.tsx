"use client";

import React, { useEffect, useRef, useState } from 'react';

// Hardcoded Assets from craft-work.html
const ASSETS = [
    // Characters
    { name: 'Witch', src: '/images/craft-work/characters/witch.png', w: 60, h: 60 },
    { name: 'Wizard', src: '/images/craft-work/characters/wizard.png', w: 60, h: 60 },

    // Minions (Typically 60x60)
    { name: 'Slime', src: '/images/craft-work/characters/slime.png', w: 60, h: 60 },
    { name: 'Bat', src: '/images/craft-work/characters/bat.png', w: 60, h: 60 },
    { name: 'Spider', src: '/images/craft-work/characters/spider.png', w: 60, h: 60 },
    { name: 'Ghost', src: '/images/craft-work/characters/ghost.png', w: 60, h: 60 },
    { name: 'Goblin', src: '/images/craft-work/characters/goblin.png', w: 60, h: 60 },
    { name: 'Skeleton', src: '/images/craft-work/characters/skeleton.png', w: 60, h: 60 },

    // Bosses
    // Love Bosses
    { name: 'Narcissus (Love)', src: '/images/craft-work/characters/Narcissus.png', w: 105, h: 105 },
    { name: 'The Moaning Ghost (Love)', src: '/images/craft-work/characters/The_Moaning_Ghost.png', w: 105, h: 105 },
    { name: 'The Tin Man (Love)', src: '/images/craft-work/characters/The_Tin_Man.png', w: 105, h: 105 },
    { name: 'Medusa (Love)', src: '/images/craft-work/characters/Medusa.png', w: 105, h: 105 },
    { name: 'The Siren (Love)', src: '/images/craft-work/characters/The_Siren.png', w: 105, h: 105 },
    { name: 'Davy Jones (Love)', src: '/images/craft-work/characters/Davy_Jones.png', w: 105, h: 105 },
    { name: 'The Black Widow (Love)', src: '/images/craft-work/characters/The_Black_Widow.png', w: 105, h: 105 },

    // Wealth Bosses
    { name: 'The Leprechaun (Wealth)', src: '/images/craft-work/characters/The_Leprechaun.png', w: 105, h: 105 },
    { name: 'King Midas (Wealth)', src: '/images/craft-work/characters/King_Midas.png', w: 105, h: 105 },
    { name: 'Ebenezer Scrooge (Wealth)', src: '/images/craft-work/characters/Ebenezer_Scrooge.png', w: 105, h: 105 },
    { name: 'The Harpy (Wealth)', src: '/images/craft-work/characters/The_Harpy.png', w: 105, h: 105 },
    { name: 'Smaug (Wealth)', src: '/images/craft-work/characters/Smaug.png', w: 105, h: 105 },
    { name: 'Atlas (Wealth)', src: '/images/craft-work/characters/Atlas.png', w: 105, h: 105 },
    { name: 'The Void (Wealth)', src: '/images/craft-work/characters/The_Void.png', w: 105, h: 105 },

    // Health Bosses
    { name: 'The Sloth (Health)', src: '/images/craft-work/characters/The_Sloth.png', w: 105, h: 105 },
    { name: 'Dorian Gray (Health)', src: '/images/craft-work/characters/Dorian_Gray.png', w: 105, h: 105 },
    { name: 'The Hydra (Health)', src: '/images/craft-work/characters/The_Hydra.png', w: 105, h: 105 },
    { name: 'The Golem (Health)', src: '/images/craft-work/characters/The_Golem.png', w: 105, h: 105 },
    { name: 'The Chimera (Health)', src: '/images/craft-work/characters/The_Chimera.png', w: 105, h: 105 },
    { name: 'Sisyphus (Health)', src: '/images/craft-work/characters/Sisyphus.png', w: 105, h: 105 },
    { name: 'The Grim Reaper (Health)', src: '/images/craft-work/characters/The_Grim_Reaper.png', w: 105, h: 105 },

    // Glamour Bosses
    { name: 'The Invisible Man (Glamour)', src: '/images/craft-work/characters/The_Invisible_Man.png', w: 105, h: 105 },
    { name: 'The Step-Sister (Glamour)', src: '/images/craft-work/characters/The_Step-Sister.png', w: 105, h: 105 },
    { name: 'The Doppelgänger (Glamour)', src: '/images/craft-work/characters/The_Doppelgänger.png', w: 105, h: 105 },
    { name: 'The Gargoyle (Glamour)', src: '/images/craft-work/characters/The_Gargoyle.png', w: 105, h: 105 },
    { name: 'The Phantom (Glamour)', src: '/images/craft-work/characters/The_Phantom.png', w: 105, h: 105 },
    { name: 'Frankenstein\'s Monster (Glamour)', src: '/images/craft-work/characters/Frankensteins_Monster.png', w: 105, h: 105 },
    { name: 'Lucifer (Glamour)', src: '/images/craft-work/characters/Lucifer.png', w: 105, h: 105 },

    // Ingredients Sheet 1
    // (Indices 0-14 for different items)
    // We will render Frame 0 of each Sheet as a representative
    // Actually, let's render *ALL* unique ingredient icons from the sheets if possible
    // Sheet contains 4x4 grid usually? Typically indices up to 15.
];

const INGREDIENT_SHEETS = [
    { name: 'Ingredients 1', src: '/images/craft-work/ingredients_sheet_1.png', indices: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14] },
    { name: 'Ingredients 2', src: '/images/craft-work/ingredients_sheet_2.png', indices: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14] }
];

// Helper Component for Single Sprite (Canvas Render)
const SpriteCanvas = ({ src, w, h, frameX = 0, frameY = 0, label }: { src: string, w: number, h: number, frameX?: number, frameY?: number, label: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setLoaded(true);
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                // Clear
                ctx.clearRect(0, 0, w, h);
                
                // Draw Frame 0 (Down/Stand) usually top-left
                // Source Size is fixed at 512x512 based on game logic
                const frameSize = 512;
                const sx = frameX * frameSize;
                const sy = frameY * frameSize;

                // Draw
                // We draw it at 0,0 for testing
                ctx.drawImage(img, sx, sy, frameSize, frameSize, 0, 0, w, h);
            }
        };
    }, [src, w, h, frameX, frameY]);

    return (
        <div className="flex flex-col items-center m-4 bg-white p-2 shadow-sm rounded">
            <div className="relative" style={{ width: w, height: h }}>
                <canvas ref={canvasRef} width={w} height={h} />
                {!loaded && <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Loading...</div>}
            </div>
            <span className="mt-2 text-xs font-mono text-gray-600">{label}</span>
            <span className="text-[10px] text-gray-400">({w}x{h})</span>
        </div>
    );
};

export default function SpriteTester() {
    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <h1 className="text-3xl font-bold mb-2">Sprite Artifact Auditor</h1>
            <p className="mb-8 text-gray-600">
                This page renders game assets on a pure white background to identify visual artifacts (square boxes, noise, stray pixels).
                <br />
                Dimensions match in-game usage.
            </p>

            <section className="mb-12">
                <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Characters & Bosses</h2>
                <div className="flex flex-wrap bg-white p-4 rounded-lg shadow-inner">
                    {ASSETS.map((asset, i) => (
                        <SpriteCanvas 
                            key={i} 
                            src={asset.src} 
                            w={asset.w} 
                            h={asset.h} 
                            label={asset.name} 
                            frameX={0} frameY={0} // Default Frame 0
                        />
                    ))}
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Ingredients (Sheet 1)</h2>
                <div className="flex flex-wrap bg-white p-4 rounded-lg shadow-inner">
                    {INGREDIENT_SHEETS[0].indices.map((idx) => (
                        <SpriteCanvas 
                            key={`ing1-${idx}`} 
                            src={INGREDIENT_SHEETS[0].src} 
                            w={40} h={40} // Default Ingredient Size
                            label={`Index ${idx}`} 
                            frameX={idx % 4} 
                            frameY={Math.floor(idx / 4)} 
                        />
                    ))}
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Ingredients (Sheet 2)</h2>
                <div className="flex flex-wrap bg-white p-4 rounded-lg shadow-inner">
                    {INGREDIENT_SHEETS[1].indices.map((idx) => (
                        <SpriteCanvas 
                            key={`ing2-${idx}`} 
                            src={INGREDIENT_SHEETS[1].src} 
                            w={40} h={40} 
                            label={`Index ${idx}`} 
                            frameX={idx % 4} 
                            frameY={Math.floor(idx / 4)} 
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
