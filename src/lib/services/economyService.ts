import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const getServiceCost = async (slug: string): Promise<number> => {
    const { data, error } = await supabase
        .from('service_costs')
        .select('cost')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error(`Error fetching cost for ${slug}:`, error);
        return 3; // Fallback default if DB fails
    }

    return data?.cost || 0;
};