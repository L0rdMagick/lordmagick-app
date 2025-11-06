// --- START OF FILE src/components/Sprite.tsx ---

import React from 'react';

interface SpriteProps {
  sheetPath: string;
  x: number;
  y: number;
  spriteWidth: number;
  spriteHeight: number;
  sheetWidth: number;
  sheetHeight: number;
  className?: string;
}

export const Sprite: React.FC<SpriteProps> = ({ sheetPath, x, y, spriteWidth, spriteHeight, sheetWidth, sheetHeight, className }) => {

  const style: React.CSSProperties = {
    backgroundImage: `url(${sheetPath})`,
    // By calculating the background-size as a percentage, we ensure the image scales proportionally.
    // 100% size would be one sprite's width, so we scale up from there.
    backgroundSize: `${(sheetWidth / spriteWidth) * 100}% ${(sheetHeight / spriteHeight) * 100}%`,
    // The position is also a percentage, calculated based on the sprite's offset within the sheet.
    // This correctly places any sprite, not just the one at (0,0).
    backgroundPosition: `${(Math.abs(x) / (sheetWidth - spriteWidth)) * 100}% ${(Math.abs(y) / (sheetHeight - spriteHeight)) * 100}%`,
    backgroundRepeat: 'no-repeat',
    width: '100%',
    height: '100%',
    imageRendering: 'pixelated', // Optional: keeps pixel art crisp
  };

  return (
    <div className={className} style={style} />
  );
};