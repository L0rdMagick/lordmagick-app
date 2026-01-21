// --- START OF FILE src/app/components/ElectricMagick/ElectricMagickMenu.tsx ---
"use client";

import React, { useState } from 'react';
import { Zap, Orbit, Eye, Activity, Triangle, SquareActivity, Terminal } from 'lucide-react';
import VoidGateSpell from './VoidGateSpell';
import DataScryingSpell from './DataScryingSpell';
import NeuralLinkSpell from './NeuralLinkSpell'; 
import LightPrismSpell from './LightPrismSpell';
import RealityPatchSpell from './RealityPatchSpell'; 
import ZeroPointZetSpell from './ZeroPointZetSpell'; 
import { useSpellSystem } from '@/hooks/useSpellSystem';
import type { Session } from '@/lib/types';
import { SlotPurchaseModal } from '@/app/components/economy/SlotPurchaseModal';
import { BlockageErrorOverlay } from '@/app/components/economy/BlockageErrorOverlay';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpellCard = ({ title, desc, icon: Icon, onClick, disabled }: { title: string, desc: string, icon: any, onClick?: () => void, disabled?: boolean }) => (
  <div 
    onClick={!disabled ? onClick : undefined}
    className={`relative group p-6 border border-purple-900/50 bg-gray-950/50 backdrop-blur-sm rounded-lg transition-all duration-300 overflow-hidden ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500 cursor-pointer hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]'}`}
  >
    {/* FIX: bg-linear-to-br */}
    <div className={`absolute inset-0 bg-linear-to-br from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
      <div className={`p-3 rounded-full bg-gray-900 border border-gray-800 group-hover:border-purple-500/50 transition-colors duration-300`}>
        <Icon size={32} className={disabled ? "text-gray-600" : "text-purple-400 group-hover:text-purple-200"} />
      </div>
      <div>
        <h3 className="text-lg font-serif tracking-widest text-gray-200 group-hover:text-white uppercase">{title}</h3>
        <p className="text-xs text-gray-500 mt-2 font-light">{desc}</p>
      </div>
      {disabled && <span className="text-[10px] uppercase tracking-widest text-gray-700 border border-gray-800 px-2 py-1 rounded">Locked</span>}
    </div>
  </div>
);

export default function ElectricMagickMenu({ session, isSubscribed, onBack }: { session?: Session, isSubscribed?: boolean, onBack?: () => void }) {
  const [activeSpell, setActiveSpell] = useState<string | null>(null);

  const spellSystem = useSpellSystem({
      serviceSlugGen: 'ai_electric_magick', 
      serviceSlugSave: 'save_spell_electric',
      baseRedirectPath: '/spell-room/electric-magick-spells-app'
  });
  
  const handleGoToStore = () => {
      spellSystem.goToStoreForSlots(null, 'electric_spell_save_temp'); 
  };

  const commonProps = { 
      onExit: () => setActiveSpell(null), 
      spellSystem, 
      session 
  };

  const renderActiveSpell = () => {
    switch (activeSpell) {
        case 'void-gate': return <VoidGateSpell {...commonProps} />;
        case 'data-scry': return <DataScryingSpell {...commonProps} />;
        case 'neural-link': return <NeuralLinkSpell {...commonProps} />;
        case 'light-prism': return <LightPrismSpell {...commonProps} />; 
        case 'reality-patch': return <RealityPatchSpell {...commonProps} />; 
        case 'zero-point-zet': return <ZeroPointZetSpell {...commonProps} />;
        default: return null;
    }
  };

  if (activeSpell) {
      return (
        <>
            {renderActiveSpell()}
            {spellSystem.activeError && (
                <BlockageErrorOverlay 
                    error={spellSystem.activeError}
                    onDismiss={spellSystem.clearErrors}
                    redirectPath="/spell-room/electric-magick-spells-app"
                />
            )}
             <SlotPurchaseModal 
                isOpen={spellSystem.modalState.isOpen} 
                onClose={spellSystem.modalState.close} 
                onPurchase={() => spellSystem.buySlots(session?.user?.id || '')} 
                isProcessing={spellSystem.modalState.isLoading}
                showAetherWarning={spellSystem.modalState.showWarning}
                showSuccess={spellSystem.modalState.showSuccess}
                onGoToStore={handleGoToStore}
            />
        </>
      );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-purple-900 selection:text-white relative overflow-hidden">
      {/* Background Noise & Ambient Light */}
      <div className="fixed inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="flex items-center justify-center gap-2 text-purple-500 mb-4">
             <Zap size={20} className="animate-pulse" />
             <span className="text-xs uppercase tracking-[0.5em]">Digital Sorcery</span>
             <Zap size={20} className="animate-pulse" />
          </div>
          {/* FIX: bg-linear-to-b */}
          <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-linear-to-b from-white to-gray-600 uppercase tracking-widest drop-shadow-2xl">
            Electric Magick
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto font-light tracking-wide text-sm">
            Rituals forged in silicon. Sigils burned into pixels. 
            Choose a current to ride.
          </p>
        </div>

        {/* Spell Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <SpellCard 
            title="The Void Gate"
            desc="A chaos magick ritual involving gestures, numeric alignments, and sigil crafting to open a digital wormhole."
            icon={Orbit}
            onClick={() => setActiveSpell('void-gate')}
          />

          <SpellCard 
            title="Data Scrying"
            desc="Gaze into the static of the machine god to divine future timelines."
            icon={Eye}
            onClick={() => setActiveSpell('data-scry')}
          />

          <SpellCard 
            title="Neural Link"
            desc="Bind two minds across the network through synchronized frequency modulation."
            icon={Activity}
            onClick={() => setActiveSpell('neural-link')}
          />

          <SpellCard 
            title="Light Prism"
            desc="Refract your intention through digital spectrums to manifest color magick."
            icon={Triangle}
            onClick={() => setActiveSpell('light-prism')} 
          />

          <SpellCard 
            title="The Reality Patch"
            desc="Inject a new intention directly into the source code of the universe through bio-rhythmic crystallization."
            icon={SquareActivity}
            onClick={() => setActiveSpell('reality-patch')} 
          />

          {/* THE NEW ZER0 P0INT ZET SPELL */}
          <SpellCard 
            title="Zer0 P0int Zet"
            desc="Hack the subatomic layer. A high-intensity, resistance-based ritual to overwrite local reality parameters."
            icon={Terminal}
            onClick={() => setActiveSpell('zero-point-zet')} 
          />
          
        </div>

        <div className="mt-20 text-center">
            <p className="text-[10px] text-gray-700 font-mono">SYSTEM STATUS: ONLINE // AETHER: STABLE</p>
        </div>
      </div>
    </div>
  );
}
// --- END OF FILE ---