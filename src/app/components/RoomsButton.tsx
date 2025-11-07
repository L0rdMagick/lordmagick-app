"use client";

import Image from 'next/image';
import { useNavMenu } from '@/app/context/NavMenuContext';

interface RoomsButtonProps {
  className?: string;
}

export default function RoomsButton({ className }: RoomsButtonProps) {
  const { openMenu } = useNavMenu();

  return (
    <button
      onClick={openMenu}
      className={`w-36 h-20 relative shrink-0 transition-transform hover:scale-105 active:scale-95 ${className}`}
      style={{ filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.7))' }}
      aria-label="Toggle navigation menu"
    >
      <Image
        src="/images/glowing-rooms-button.png"
        alt="Open rooms navigation"
        fill
        sizes="144px"
      />
      <span
        className="absolute inset-0 flex items-center justify-center text-white font-semibold text-lg uppercase tracking-wider"
        style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
      >
        Rooms
      </span>
    </button>
  );
}