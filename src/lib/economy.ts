import { createBrowserClient } from '@supabase/ssr';

export const COST_AI_GENERATE = 3;
export const COST_SAVE_SPELL = 1;
export const COST_BIND_SERVITOR = 5;

/**
 * Checks if the user has enough credits and deducts them if so.
 * Handles the 'adept' tier check and daily resets automatically via the SQL RPC.
 * 
 * @param userId - The UUID of the user
 * @param cost - Amount of credits to consume (default 1)
 * @returns Promise<boolean> - True if transaction successful/allowed, False if out of credits
 */
export const checkAndSpendCredits = async (userId: string, cost: number = 1): Promise<boolean> => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data, error } = await supabase.rpc('consume_credits', {
      p_user_id: userId,
      p_cost: cost
    });

    if (error) {
      console.error("Economy Error:", error);
      return false; // Fail safe
    }

    return data as boolean;

  } catch (err) {
    console.error("Unexpected economy error:", err);
    return false;
  }
};

/**
 * Fetches the current credit balance for UI display.
 */
export const getWalletStatus = async (userId: string) => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

    const { data, error } = await supabase
    .from('profiles')
    .select('credits, subscription_tier') // Removed last_reset_at and tier as they don't exist in schema
    .eq('id', userId)
    .single();

  if (error) {
      console.error("getWalletStatus Error:", error);
      return null;
  }
  
  // Map subscription_tier to tier for app compatibility
  const tier = data.subscription_tier || 'seeker';

  // Calculate if a reset is pending (Disabled: last_reset_at missing in schema)
  // const lastReset = new Date(data.last_reset_at).getTime();
  // const now = Date.now();
  // const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

  
  let displayCredits = data.credits;
  
  // If user is Initiate and >24h have passed, show 3 (pending reset) IF they have less than 3
  // Daily Reset UI logic disabled until last_reset_at column is verified
  // if (tier === 'initiate' && hoursSinceReset >= 24 && data.credits < 3) {
  //    displayCredits = 3; 
  // }

  return {
      credits: displayCredits,
      tier: tier,
      isUnlimited: tier === 'adept'
  };
};