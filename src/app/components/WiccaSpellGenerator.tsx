// --- START OF FILE src/app/components/WiccaSpellGenerator.tsx ---

import React from 'react';
import type { Session } from '@/lib/types';
import { WiccaRitualFlow } from './WiccaRitualFlow'; 

interface WiccaSpellGeneratorProps {
  session: Session;
  isSubscribed: boolean;
  onBack: () => void;
}

const WiccaSpellGenerator: React.FC<WiccaSpellGeneratorProps> = ({ session, isSubscribed, onBack }) => {
  // THE FIX: Added h-full to this container to ensure it expands vertically,
  // giving its child (WiccaRitualFlow) a valid height to fill.
  return (
    <div className="animate-fade-in-up w-full h-full max-w-4xl mx-auto">
      <WiccaRitualFlow session={session} isSubscribed={isSubscribed} onBack={onBack} />
    </div>
  );
};

export default WiccaSpellGenerator;