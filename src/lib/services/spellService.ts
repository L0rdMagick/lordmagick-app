import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type SpellTradition = 'WICCA' | 'HOODOO' | 'VOODOO' | 'ELECTRIC' | 'CHAOS' | 'LOVE';

interface SpellPayload {
    name: string;
    intention: string;
    incantation: string;
    tradition: SpellTradition;
    visual_assets?: any; // JSONB data (sigils, ingredients, colors)
    is_premium?: boolean;
}

interface ServitorPayload {
    name: string;
    master_name: string;
    purpose: string;
    config: any; // JSONB appearance config
}

/**
 * Saves a spell to the universal grimoire.
 */
export const saveSpellToGrimoire = async (userId: string, payload: SpellPayload) => {
    const { data, error } = await supabase
        .from('spells')
        .insert({
            user_id: userId,
            name: payload.name,
            intention: payload.intention,
            incantation: payload.incantation,
            tradition: payload.tradition,
            visual_assets: payload.visual_assets || {},
            is_premium: payload.is_premium || false
        })
        .select()
        .single();

    if (error) {
        console.error("Error saving spell:", error);
        throw new Error("Failed to scribe spell into grimoire.");
    }
    return data;
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
 * Fetch all spells for a user.
 */
export const getMySpells = async (userId: string) => {
    const { data, error } = await supabase
        .from('spells')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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