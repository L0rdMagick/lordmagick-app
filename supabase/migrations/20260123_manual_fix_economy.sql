-- RUN THIS SCRIPT IN THE SUPABASE SQL EDITOR

-- 1. Ensure Profiles Table has Economy Columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 3;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'initiate' CHECK (tier IN ('initiate', 'adept'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_reset_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Clean up old function if signature mismatched (optional but safe)
DROP FUNCTION IF EXISTS consume_credits(uuid, integer);

-- 3. Create or Replace the Consumption Function
CREATE OR REPLACE FUNCTION consume_credits(p_user_id UUID, p_cost INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits INTEGER;
    current_tier TEXT;
    last_reset TIMESTAMPTZ;
    new_credits INTEGER;
BEGIN
    -- Initialize with fallback values if null
    SELECT COALESCE(credits, 3), COALESCE(tier, 'initiate'), COALESCE(last_reset_at, NOW() - INTERVAL '48 hours')
    INTO current_credits, current_tier, last_reset
    FROM profiles
    WHERE id = p_user_id;

    -- If no profile found, create one (Self-Healing)
    IF NOT FOUND THEN
        INSERT INTO profiles (id, credits, tier, last_reset_at)
        VALUES (p_user_id, 3, 'initiate', NOW())
        RETURNING credits, tier, last_reset_at INTO current_credits, current_tier, last_reset;
    END IF;

    -- 1. ADEPT BYPASS
    IF current_tier = 'adept' THEN
        RETURN TRUE;
    END IF;

    -- 2. LAZY RESET
    IF last_reset < NOW() - INTERVAL '24 hours' THEN
        current_credits := 3;
        UPDATE profiles 
        SET credits = 3, last_reset_at = NOW() 
        WHERE id = p_user_id;
    END IF;

    -- 3. CHECK BALANCE
    IF current_credits >= p_cost THEN
        new_credits := current_credits - p_cost;
        UPDATE profiles SET credits = new_credits WHERE id = p_user_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;
