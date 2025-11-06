// --- START OF FILE src/components/WiccaSpellGenerator.tsx ---

import React, { useState } from 'react';
import type { Session, WiccanSpellFormData, GeneratedWiccanSpell } from '@/lib/types';
import { generateWiccanSpell } from '@/lib/services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { WandIcon, MoonIcon, CheckCircleIcon, XCircleIcon } from './icons';
import { WiccaRitual } from './WiccaRitual';

interface WiccaSpellGeneratorProps {
  session: Session;
  isSubscribed: boolean;
  onBack: () => void;
}

const getMoonPhase = (): string => {
    const day = new Date().getDate();
    if (day === 1) return "New Moon";
    if (day > 1 && day < 8) return "Waxing Crescent";
    if (day >= 8 && day < 15) return "First Quarter";
    if (day === 15) return "Full Moon";
    if (day > 15 && day < 22) return "Waning Gibbous";
    if (day >= 22 && day < 29) return "Last Quarter";
    return "Waning Crescent";
};

const focalPoints = [
  "The Moon", "The Sun", "The Earth", "The Element of Air", "The Element of Fire",
  "The Element of Water", "The Horned God", "The Triple Goddess", "Hecate",
  "Brigid", "Self-Love", "Abundance & Prosperity", "Protection"
];

const WiccaSpellGenerator: React.FC<WiccaSpellGeneratorProps> = ({ session, isSubscribed, onBack }) => {
  const [formData, setFormData] = useState<WiccanSpellFormData>({
    intention: '',
    focalPoint: focalPoints[0],
    moonPhase: getMoonPhase(),
  });
  const [generatedSpell, setGeneratedSpell] = useState<GeneratedWiccanSpell | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateSpell = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedSpell(null);
    try {
      const spell = await generateWiccanSpell(formData);
      setGeneratedSpell(spell);
    } catch (err: any) {
      setError(err.message || "The spirits are busy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRitualComplete = () => {
    setGeneratedSpell(null);
    setFormData(prev => ({ ...prev, intention: '' }));
  };

  if (loading) {
    return <LoadingSpinner title="Consulting the Elements..." customMessage="Reading the lunar energies..." />;
  }
  
  if (generatedSpell) {
    return <WiccaRitual spell={generatedSpell} onComplete={handleRitualComplete} />;
  }

  return (
    <div className="animate-fade-in-up max-w-2xl mx-auto">
      <button onClick={onBack} className="mb-6 text-purple-400 hover:text-purple-300">&larr; Back to Traditions</button>
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-serif text-gray-100">Wiccan Spellcraft</h2>
        <p className="text-gray-400 mt-2">Work with nature, the moon, and ancient energies to manifest your will.</p>
      </div>
      
      {error && <div className="text-center text-red-400 p-4 bg-red-500/10 rounded-lg mb-6">{error}</div>}

      <form onSubmit={handleGenerateSpell} className="space-y-6 bg-white/5 p-6 rounded-lg border border-white/10">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">What is your intention?</label>
          <textarea name="intention" value={formData.intention} onChange={handleFormChange} required className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500" placeholder="e.g., To find clarity on my career path" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">What is your focal point?</label>
          <select name="focalPoint" value={formData.focalPoint} onChange={handleFormChange} required className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500">
            {focalPoints.map(point => (
              <option key={point} value={point} className="bg-[#1a1a3d]">{point}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-gray-400 text-sm">
          <p>The current phase is:</p>
          <div className="flex items-center gap-2 font-bold text-purple-300">
            <MoonIcon />
            {formData.moonPhase}
          </div>
        </div>
        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg">
          <WandIcon /> Create Ritual
        </button>
      </form>
    </div>
  );
};

export default WiccaSpellGenerator;