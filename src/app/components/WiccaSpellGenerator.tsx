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
  // THE FIX: This h-full class now works correctly because its parent in page.tsx provides a valid height.
  return (
    <div className="w-full h-full max-w-4xl mx-auto">
      <WiccaRitualFlow session={session} isSubscribed={isSubscribed} onBack={onBack} />
    </div>
  );
};

export default WiccaSpellGenerator;