--- START OF FILE supabase/migrations/20240522_economy_setup.sql ---

-- 1. Add Economy Columns to Profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'initiate' CHECK (tier IN ('initiate', 'adept')),
ADD COLUMN IF NOT EXISTS last_reset_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Create the "Lazy Reset" Transaction Function
-- This function handles the logic: 
-- IF Adept -> Allow (return true)
-- IF Initiate AND 24h passed -> Reset to 3, then check cost
-- IF Initiate AND insufficient credits -> Deny (return false)
-- IF Initiate AND sufficient credits -> Deduct, Allow (return true)

CREATE OR REPLACE FUNCTION consume_credits(p_user_id UUID, p_cost INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges to ensure atomic updates
AS $$
DECLARE
    current_credits INTEGER;
    current_tier TEXT;
    last_reset TIMESTAMPTZ;
    new_credits INTEGER;
BEGIN
    -- Lock the row for update to prevent race conditions
    SELECT credits, tier, last_reset_at 
    INTO current_credits, current_tier, last_reset
    FROM profiles
    WHERE id = p_user_id
    FOR UPDATE;

    -- 1. ADEPT BYPASS: If tier is adept, they don't consume credits
    IF current_tier = 'adept' THEN
        RETURN TRUE;
    END IF;

    -- 2. LAZY RESET: Check if 24 hours have passed since last reset
    IF last_reset < NOW() - INTERVAL '24 hours' THEN
        -- Reset credits to 3 (daily allowance)
        current_credits := 3;
        -- Update the reset timer to NOW()
        UPDATE profiles 
        SET credits = 3, last_reset_at = NOW() 
        WHERE id = p_user_id;
    END IF;

    -- 3. CHECK BALANCE
    IF current_credits >= p_cost THEN
        -- Deduct credits
        new_credits := current_credits - p_cost;
        UPDATE profiles SET credits = new_credits WHERE id = p_user_id;
        RETURN TRUE;
    ELSE
        -- Insufficient funds
        RETURN FALSE;
    END IF;
END;
$$;