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

-- 3. Create Spells Table (Universal Storage)
CREATE TABLE IF NOT EXISTS spells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tradition TEXT NOT NULL CHECK (tradition IN ('WICCA', 'HOODOO', 'VOODOO', 'ELECTRIC', 'CHAOS', 'LOVE')),
    name TEXT NOT NULL,
    intention TEXT,
    incantation TEXT,
    visual_assets JSONB DEFAULT '{}'::jsonb,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Spells
ALTER TABLE spells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own spells" 
ON spells FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spells" 
ON spells FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spells" 
ON spells FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create Servitors Table
CREATE TABLE IF NOT EXISTS servitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    master_name TEXT,
    purpose TEXT,
    config JSONB DEFAULT '{}'::jsonb, -- Stores appearance/audio settings
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Servitors
ALTER TABLE servitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own servitors" 
ON servitors FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own servitors" 
ON servitors FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own servitors" 
ON servitors FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own servitors" 
ON servitors FOR DELETE 
USING (auth.uid() = user_id);