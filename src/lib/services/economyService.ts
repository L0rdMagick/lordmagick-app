import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fetch cost from DB
export const getServiceCost = async (slug: string): Promise<number> => {
    const { data, error } = await supabase
        .from('service_costs')
        .select('cost')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error(`Error fetching cost for ${slug}:`, error);
        return 3; // Safe default
    }
    return data?.cost || 0;
};

// Deduct credits safely
export const deductUserCredits = async (userId: string, cost: number): Promise<boolean> => {
    try {
        console.log(`[Economy] Attempting to deduct ${cost} from user ${userId}`);
        // 1. Get Profile
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) {
            console.error("Economy Error: Profile not found", fetchError);
            return false;
        }

        console.log(`[Economy] User Balance: ${profile.credits}, Cost: ${cost}`);

        // 2. Check Balance
        if (profile.credits < cost) {
            console.warn(`[Economy] Insufficient funds. Balance: ${profile.credits} < Cost: ${cost}`);
            return false;
        }

        // 3. Deduct
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits: profile.credits - cost })
            .eq('id', userId);

        if (updateError) {
            console.error("Economy Error: Deduction failed", updateError);
            return false;
        }

        console.log("[Economy] Deduction successful");
        return true;
    } catch (e) {
        console.error("Economy Exception:", e);
        return false;
    }
};

// NEW: Purchase Spell Slots
export const buySpellSlots = async (userId: string): Promise<boolean> => {
    try {
        // 1. Get Cost
        const cost = await getServiceCost('shop_spell_slots_5');
        
        // 2. Deduct Credits
        const paid = await deductUserCredits(userId, cost);
        if (!paid) return false;

        // 3. Get Current Limit
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('spell_slots_limit')
            .eq('id', userId)
            .single();
            
        if (fetchError) throw fetchError;
        
        const currentLimit = profile?.spell_slots_limit || 5;

        // 4. Update Limit
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ spell_slots_limit: currentLimit + 5 })
            .eq('id', userId);
        
        if (updateError) {
            console.error("Error expanding slots:", updateError);
            // In a real production app, you might want to refund here if update fails
            return false;
        }

        return true;
    } catch (e) {
        console.error("Exception in buySpellSlots:", e);
        return false;
    }
};

// NEW: Unlock a Feature (e.g. Psychic Stats)
export const unlockFeature = async (userId: string, featureSlug: string): Promise<boolean> => {
    try {
        const cost = await getServiceCost('unlock_stats_general');
        
        // 1. Check if already unlocked
        const { data } = await supabase.from('feature_unlocks').select('id').eq('user_id', userId).eq('feature_slug', featureSlug).single();
        if (data) return true; // Already unlocked

        // 2. Pay
        const paid = await deductUserCredits(userId, cost);
        if (!paid) return false;

        // 3. Unlock
        const { error } = await supabase.from('feature_unlocks').insert({
            user_id: userId,
            feature_slug: featureSlug
        });

        return !error;
    } catch (e) {
        console.error("Exception in unlockFeature:", e);
        return false;
    }
};

// NEW: Check if feature is unlocked
export const checkFeatureAccess = async (userId: string, featureSlug: string): Promise<boolean> => {
    const { data } = await supabase
        .from('feature_unlocks')
        .select('id')
        .eq('user_id', userId)
        .eq('feature_slug', featureSlug)
        .single();
    return !!data;
};