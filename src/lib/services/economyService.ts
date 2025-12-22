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
        // 1. Get Profile
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) {
            console.error("Economy Error: Profile not found");
            return false;
        }

        // 2. Check Balance
        if (profile.credits < cost) {
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

        return true;
    } catch (e) {
        console.error("Economy Exception:", e);
        return false;
    }
};