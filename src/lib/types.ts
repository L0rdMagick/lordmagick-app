// --- START OF FILE src/lib/types.ts ---
import type { Session } from '@supabase/supabase-js';

export interface FormData {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthplace: string;
}

export interface HumanDesignChart {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  centers: {
    name: string;
    defined: boolean;
  }[];
  incarnationCross: string;
}

export interface Report {
    id: string;
    user_id: string;
    name: string;
    report_content: string;
    chart_data: HumanDesignChart;
    created_at: string;
}

export interface UserProfile {
    id: string;
    display_name: string;
    is_subscribed: boolean;
}

// --- Chaos Magick Types ---
export type SpellTradition = 'WICCA' | 'HOODOO' | 'VOODOO' | 'ELECTRIC' | 'CHAOS' | 'LOVE';

export interface SpellFormData {
  outcome: string;
  target: string;
  feeling: string;
  element: string;
  timing: string;
  action: 'attract' | 'release';
  name: string;
}

export interface GeneratedSpell {
    title: string;
    intention: string;
    incantation: string;
    sigilBase64: string; 
    sigil_url?: string;
    instructions?: string[];
    sigil_description?: string;
}

export interface Spell {
    id: string;
    user_id: string;
    created_at: string;
    name: string;
    intention: string;
    incantation: string;
    sigil_url?: string;
    element?: string;
    ritual_data?: any; 
    status?: string;
    tradition?: SpellTradition;
}

// --- Wiccan Spell Types ---
export interface WiccanSpellFormData {
  intention: string;
  focalPoint: string;
  moonPhase: string;
  situation?: string; 
}

export interface WiccanIngredient {
  name: string;
  activation_phrase?: string; 
  incantation?: string;      
}

// NEW: Interfaces for High Ritual
export interface WiccanDeity {
  name: string;
  title: string;
  pantheon: string;
  description: string;
}

export interface TransitionalIncantations {
  sanctification: string;
  circle_casting: string;
  invocation: string;
  closing: string;
}

export interface GeneratedWiccanSpell {
  title: string;
  central_chant: string;
  affirmation: string;
  symbolic_ingredients: WiccanIngredient[];
  elemental_chants?: {
    Spirit: string;
    Air: string;
    Fire: string;
    Water: string;
    Earth: string;
  };
  // NEW: Fields for High Ritual
  transitional_incantations?: TransitionalIncantations;
  suggested_deities?: WiccanDeity[];
}

// --- Love Spell Types ---
export interface GeneratedLoveSpell {
    incantation: string[];
    ingredients: Array<{
        name: string;
        icon: string;
        desc: string;
        color: string;
    }>;
}

// --- Electric Magick Types ---
export interface NeuralLinkResult {
    incantation1: string;
    incantation2: string;
    finalResult: string;
}

export interface RealityPatchRitualData {
    consecration: string;
    grounding: string;
    etching: string;
    ancientTongue: string;
    integration: string;
    charge: string;
}

// --- HOODOO & VOODOO TYPES ---
export interface HoodooVoodooPetition {
  petition: string;
}

export interface HoodooVoodooPsalmResponse {
  selections: string[];
}

export interface HoodooVoodooMateriaResponse {
  selections: Array<{ name: string; incantation: string; }>;
}

export interface HoodooVoodooLwaResponse {
  selection: string;
}

export interface HoodooVoodooOfferingResponse {
  selections: Array<{ name: string; incantation: string; }>;
}

export interface HoodooVoodooAffirmationResponse {
  affirmation: string;
}

export type AppView = 
  | { type: 'dashboard' }
  | { type: 'generate' }
  | { type: 'view_report'; report: Report }
  | { type: 'subscribe' }
  | { type: 'spell_room' };

export type { Session };
// --- END OF FILE src/lib/types.ts ---