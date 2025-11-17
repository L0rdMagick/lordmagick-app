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
}

export interface Spell {
    id: string;
    user_id: string;
    created_at: string;
    name: string;
    intention: string;
    incantation: string;
    sigil_url: string;
    element: string;
}

// --- Wiccan Spell Types ---
export interface WiccanSpellFormData {
  intention: string;
  focalPoint: string;
  moonPhase: string;
}

export interface WiccanIngredient {
  name: string;
  activation_phrase?: string; 
}

export interface GeneratedWiccanSpell {
  title: string;
  incantation: string;
  symbolic_ingredients: WiccanIngredient[];
  central_chant: string;
  affirmation: string;
}

// --- HOODOO & VOODOO TYPES (UPDATED) ---
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
// --- END OF FILE ---