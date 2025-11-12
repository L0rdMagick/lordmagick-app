// --- START OF FILE src/app/components/WiccaSpellGenerator.tsx ---

import React from 'react';
import type { Session } from '@/lib/types';
import { WiccaRitualFlow } from './dep-WiccaRitualFlow'; 

interface WiccaSpellGeneratorProps {
  session: Session;
  isSubscribed: boolean;
  onBack: () => void;
}

const WiccaSpellGenerator: React.FC<WiccaSpellGeneratorProps> = ({ session, isSubscribed, onBack }) => {
  return (
    <div className="w-full h-full max-w-4xl mx-auto">
      <WiccaRitualFlow session={session} isSubscribed={isSubscribed} onBack={onBack} />
    </div>
  );
};

export default WiccaSpellGenerator;