// --- START OF FILE src/types.ts ---

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

// --- UPDATED WICCAN SPELL TYPES ---
export interface WiccanSpellFormData {
  intention: string;
  focalPoint: string;
  moonPhase: string;
}

export interface WiccanIngredient {
  name: string;
  activation_phrase: string;
}

export interface GeneratedWiccanSpell {
  title: string;
  incantation: string;
  symbolic_ingredients: WiccanIngredient[];
  central_chant: string;
  affirmation: string;
}
// --- END UPDATED WICCAN SPELL TYPES ---


export type AppView = 
  | { type: 'dashboard' }
  | { type: 'generate' }
  | { type: 'view_report'; report: Report }
  | { type: 'subscribe' }
  | { type: 'spell_room' };

export type { Session };