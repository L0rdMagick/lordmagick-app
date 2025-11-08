// --- START OF FILE src/app/components/WiccaSpellGenerator.tsx ---

import React from 'react';
import type { Session } from '@/lib/types';
import { WiccaRitualFlow } from './WiccaRitualFlow'; // Import the new, consolidated component

interface WiccaSpellGeneratorProps {
  session: Session;
  isSubscribed: boolean;
  onBack: () => void;
}

const WiccaSpellGenerator: React.FC<WiccaSpellGeneratorProps> = ({ session, isSubscribed, onBack }) => {
  // The entire ritual flow is now encapsulated in the WiccaRitualFlow component.
  // This parent component's only job is to render it and pass the necessary props.
  return (
    <div className="animate-fade-in-up w-full max-w-4xl mx-auto">
      <WiccaRitualFlow session={session} isSubscribed={isSubscribed} onBack={onBack} />
    </div>
  );
};

export default WiccaSpellGenerator;