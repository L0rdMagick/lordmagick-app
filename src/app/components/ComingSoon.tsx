import React from 'react';
import { GrimoireFlourish } from './icons';

const ComingSoon: React.FC = () => {
  return (
    <div className="text-center animate-fade-in flex flex-col items-center gap-4 p-8">
      <GrimoireFlourish className="w-16 h-16 text-purple-400/70" />
      <h3 className="text-3xl font-serif text-amber-200">
        This Ritual is in Preparation
      </h3>
      <p className="text-gray-300 max-w-sm">
        The energies are being gathered for this tradition. Return soon to discover the magick that awaits.
      </p>
    </div>
  );
};

export default ComingSoon;