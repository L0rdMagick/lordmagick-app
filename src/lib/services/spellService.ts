import { createBrowserClient } from '@supabase/ssr';
import type { Spell } from '../types';

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type SpellTradition = 'WICCA' | 'HOODOO' | 'VOODOO' | 'ELECTRIC' | 'CHAOS' | 'LOVE';

interface SpellPayload {
    name: string;
    intention: string;
    incantation: string;
    tradition?: SpellTradition; // Made optional to support legacy calls or default
    element?: string; // Support for Electric/Wicca elements
    sigil_url?: string;
    visual_assets?: any; 
    is_premium?: boolean;
    ritual_data?: any; // NEW: For deep saving (ingredients, steps, etc)
}

interface ServitorPayload {
    name: string;
    master_name: string;
    purpose: string;
    config: any; 
}

/**
 * Saves a spell to the universal grimoire with slot checking.
 */
export const saveSpell = async (userId: string, payload: SpellPayload, bypassLimit: boolean = false): Promise<Spell> => {
    // 1. Check Slot Limits (if not bypassed)
    // 1. Check Slot Limits (DISABLED GLOBALLY)
    // The user has requested to remove all grimoire storage limits.
    // This block is intentionally removed/bypassed.

    // 2. Save Spell
    const { data, error } = await supabase
        .from('spells')
        .insert({
            user_id: userId,
            name: payload.name,
            intention: payload.intention,
            incantation: payload.incantation,
            tradition: payload.tradition,
            element: payload.element,
            sigil_url: payload.sigil_url,
            visual_assets: payload.visual_assets || {},
            is_premium: payload.is_premium || false,
            // New Columns (Ensure these exist in DB)
            ritual_data: payload.ritual_data || {}, 
            status: 'active'
        })
        .select()
        .single();

    if (error) {
        console.error("Error saving spell:", error);
        throw new Error("Failed to scribe spell into grimoire.");
    }
    return data as Spell;
};

/**
 * Binds a servitor to the database.
 */
export const saveServitorToGrimoire = async (userId: string, payload: ServitorPayload) => {
    const { data, error } = await supabase
        .from('servitors')
        .insert({
            user_id: userId,
            name: payload.name,
            master_name: payload.master_name,
            purpose: payload.purpose,
            config: payload.config
        })
        .select()
        .single();

    if (error) {
        console.error("Error binding servitor:", error);
        throw new Error("Failed to bind servitor entity.");
    }
    return data;
};

/**
 * Updates an existing servitor (Free action).
 */
export const updateServitor = async (servitorId: string, payload: ServitorPayload) => {
    const { data, error } = await supabase
        .from('servitors')
        .update({
            name: payload.name,
            master_name: payload.master_name,
            purpose: payload.purpose,
            config: payload.config
        })
        .eq('id', servitorId)
        .select()
        .single();

    if (error) {
        console.error("Error updating servitor:", error);
        throw new Error("Failed to update servitor entity.");
    }
    return data;
};

/**
 * Fetch all spells for a user.
 */
export const getSpells = async (userId: string): Promise<Spell[]> => {
    const { data, error } = await supabase
        .from('spells')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Spell[];
};

/**
 * Fetch all servitors for a user.
 */
export const getMyServitors = async (userId: string) => {
    const { data, error } = await supabase
        .from('servitors')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};
// ... existing imports and functions

/**
 * Fetch a single spell by ID for Replay Mode.
 */
export const getSpellById = async (spellId: string): Promise<Spell | null> => {
    const { data, error } = await supabase
        .from('spells')
        .select('*')
        .eq('id', spellId)
        .single();
    
    if (error) {
        console.error("Error fetching spell for replay:", error);
        return null;
    }
    return data as Spell;
};