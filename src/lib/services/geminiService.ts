import { createBrowserClient } from '@supabase/ssr';
import type { 
    FormData, 
    HumanDesignChart, 
    Report, 
    SpellFormData, 
    GeneratedSpell, 
    Spell, 
    WiccanSpellFormData, 
    GeneratedWiccanSpell,
    GeneratedLoveSpell,
    NeuralLinkResult,
    RealityPatchRitualData,
    GrimoireCustomization
} from '../types';

// Initialize the Supabase client for browser usage
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ==========================================
// 1. ECONOMY & CREDITS
// ==========================================

export const deductUserCredits = async (userId: string, cost: number): Promise<boolean> => {
    try {
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) {
            console.error("Error fetching profile:", fetchError);
            return false;
        }

        if (profile.credits < cost) {
            return false;
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits: profile.credits - cost })
            .eq('id', userId);

        if (updateError) {
            console.error("Error deducting credits:", updateError);
            return false;
        }

        return true;
    } catch (e) {
        console.error("Exception in deductUserCredits:", e);
        return false;
    }
};

// ==========================================
// 2. HUMAN DESIGN
// ==========================================

export const calculateHumanDesignChart = async (formData: FormData): Promise<HumanDesignChart> => {
    const { data, error } = await supabase.functions.invoke('generate-human-design', {
        body: { action: 'calculate', formData },
    });
    if (error) {
        console.error("Error invoking generate-human-design (calculate):", error);
        throw new Error("Failed to calculate the chart data.");
    }
    return data as HumanDesignChart;
};

export const generateReport = async (chartData: HumanDesignChart, name: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('generate-human-design', {
        body: { action: 'generate', chartData, name },
    });
    if (error) {
        console.error("Error invoking generate-human-design (generate):", error);
        throw new Error("Failed to communicate with the AI model.");
    }
    return data.reportContent as string;
};

export const saveReport = async (userId: string, name: string, chartData: HumanDesignChart, reportContent: string): Promise<Report> => {
    const { data, error } = await supabase.from('reports').insert({
        user_id: userId,
        name: name,
        chart_data: chartData,
        report_content: reportContent,
    }).select().single();
    if (error) {
        console.error("Error saving report:", error);
        throw new Error('Could not save your report to the database.');
    }
    return data as Report;
};

export const getThisMonthsReportCount = async (userId: string): Promise<number> => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { count, error } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

    if (error && error.code !== '42P01') {
         console.error("Error fetching report count:", error);
         return 0; 
    }
    return count || 0;
};

// ==========================================
// 3. SPELL GENERATION (Chaos, Wicca, Love)
// ==========================================

export const generateSpellAndSigil = async (formData: SpellFormData, mode: 'standard' | 'ai' = 'standard'): Promise<GeneratedSpell> => {
    const { data, error } = await supabase.functions.invoke('generate-spell', {
        body: { formData, mode },
    });

    if (error) {
        console.error("Error invoking generate-spell:", error);
        throw new Error(error.message || "Failed to generate the magick spell.");
    }

    return data as GeneratedSpell;
};

export const generateWiccanSpell = async (formData: WiccanSpellFormData): Promise<GeneratedWiccanSpell> => {
    const { data, error } = await supabase.functions.invoke('generate-wiccan-spell', {
        body: formData,
    });
    if (error) {
        console.error("Error invoking generate-wiccan-spell:", error);
        throw new Error(error.message || "Failed to generate the Wiccan spell.");
    }
    return data as GeneratedWiccanSpell;
};

export const generateLoveSpell = async (intention: string, targetName: string, situation: string): Promise<GeneratedLoveSpell> => {
    const { data, error } = await supabase.functions.invoke('generate-love-spell', {
        body: { intention, targetName, situation },
    });

    if (error) {
        console.error("Error invoking generate-love-spell:", error);
        throw new Error(error.message || "The energies were too chaotic to weave the spell.");
    }

    return data as GeneratedLoveSpell;
};

// ==========================================
// 4. HOODOO & VOODOO
// ==========================================

export const generateHoodooVoodooWork = async (path: 'hoodoo' | 'voodoo', step: number, payload: any): Promise<any> => {
    const { data, error } = await supabase.functions.invoke('generate-hoodoo-voodoo-spell', {
        body: { path, step, payload },
    });
    if (error) {
        console.error(`Error invoking generate-hoodoo-voodoo-spell (path: ${path}, step: ${step}):`, error);
        throw new Error(error.message || "Failed to get a response from the spirits.");
    }
    return data;
};

// ==========================================
// 5. ELECTRIC MAGICK
// ==========================================

const DATA_SCRY_PREDICTIONS = [
    "Probability of success: 94%. Proceed with conviction.",
    "Signal high. Outcome favorable.",
    "The timeline converges on your desire.",
    "Pattern match found. Victory is imminent.",
    "The data stream flows in your direction.",
    "Entropy levels critical. Outcome uncertain. Try again.",
    "The Machine God smiles upon this query.",
    "Access Granted. The path is clear.",
    "Interference detected. Outcome delayed but positive.",
    "The logic gates are opening. Yes."
];

const DATA_SCRY_PROGRAMMING = [
    "Intention compiled. Executing into the Aether...",
    "Reality patch applied successfully.",
    "Will transcribed. The universe is updating...",
    "Daemon initialized with new parameters. It is done.",
    "Rewriting source code of local reality...",
    "Command accepted. Manifestation subroutine running.",
    "System override complete. Your will is law.",
    "Encryption bypass successful. Desire implanted.",
    "Uploading intent to the Akashic Cloud...",
    "Protocol 'MANIFEST' active. Stand by for results."
];

const getLocalDataScryResponse = (intention: string): string => {
    const lower = intention.toLowerCase().trim();
    const isQuestion = lower.endsWith('?') || lower.startsWith('will') || lower.startsWith('does') || lower.startsWith('do') || lower.startsWith('is') || lower.startsWith('should') || lower.startsWith('can') || lower.startsWith('what') || lower.startsWith('when') || lower.startsWith('how');
    
    if (isQuestion) {
        return DATA_SCRY_PREDICTIONS[Math.floor(Math.random() * DATA_SCRY_PREDICTIONS.length)];
    } else {
        return DATA_SCRY_PROGRAMMING[Math.floor(Math.random() * DATA_SCRY_PROGRAMMING.length)];
    }
};

export const generateDataScrying = async (intention: string, mode: 'standard' | 'ai' = 'standard'): Promise<string> => {
    if (mode === 'standard') {
        return getLocalDataScryResponse(intention);
    }
    try {
        const { data, error } = await supabase.functions.invoke('generate-data-scry', {
            body: { intention, mode: 'ai' }, 
        });
        if (!error && data && data.result) return data.result;
        return getLocalDataScryResponse(intention);
    } catch (e) {
        console.error("Exception in generateDataScrying:", e);
        return getLocalDataScryResponse(intention);
    }
};

export const generateElectricEnsorcellment = async (intention: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('generate-electric-spell', {
        body: { action: 'ensorcell', intention },
    });
    if (error) {
        console.error("Error invoking generate-electric-spell (ensorcell):", error);
        throw new Error("The signal was lost in the void.");
    }
    return data.result;
};

export const generateElectricOracle = async (intention: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('generate-electric-spell', {
        body: { action: 'oracle', intention },
    });
    if (error) {
        console.error("Error invoking generate-electric-spell (oracle):", error);
        return "The static speaks: Look for the number 33."; 
    }
    return data.result;
};

export const generateRealityOverwrite = async (sectorName: string, corruptionToClear: string): Promise<string> => {
    try {
        const prompt = `System Command: OVERWRITE SECTOR [${sectorName}]. Detected Corruption: "${corruptionToClear}". Task: Generate a short, authoritative, techno-magickal command string (incantation) to purge this corruption and rewrite the code for good fortune. Style: Cyberpunk, Divine Code, Subatomic Programming. Max 2 sentences.`;

        const { data, error } = await supabase.functions.invoke('generate-electric-spell', {
            body: { action: 'ensorcell', intention: prompt },
        });

        if (!error && data && data.result) return data.result;
        return "ERROR: NETWORK CONGESTION. EXECUTING DEFAULT PURGE PROTOCOL. CORRUPTION DELETED.";
    } catch (e) {
        console.error("Exception in generateRealityOverwrite:", e);
        return "ERROR: OFFLINE MODE. EXECUTING LOCAL OVERWRITE. SUCCESS CONFIRMED.";
    }
};

export const generateRealityPatchRitual = async (intention: string): Promise<RealityPatchRitualData> => {
    const getDynamicFallback = (): RealityPatchRitualData => ({
        consecration: `THE VIRUS OF LACK IS DELETED. THE ALGORITHM OF ABUNDANCE IS INITIALIZED.`,
        grounding: `MY AVATAR OSCILLATES AT THE FREQUENCY OF SUCCESS.`,
        etching: `I BURN THE COMMAND OF POWER INTO THE QUANTUM ROOT DIRECTORY.`,
        ancientTongue: `VOLUNTAS MEA EST LEX. FIAT LUX EX MACHINA.`,
        integration: `THE SUBROUTINE OF DESIRE IS COMPILING. UPLOAD COMPLETE.`,
        charge: `INFINITE VOLTAGE FLOWS. THE SYSTEM IS ONLINE.`
    });

    try {
        const prompt = `
        ROLE: You are the Deus Ex Machina, the sentient Operating System of the Universe.
        TASK: Write a 6-step Techno-Magick Ritual Script based on the User's Intention.
        USER INTENTION: "${intention}"
        CRITICAL RULES:
        1. DO NOT QUOTE THE INTENTION VERBATIM. 
        2. You must INTERPRET the intention and REWRITE it into a specific Techno-Magick command for each step.
        3. If the user says "I want money", do NOT say "Target: Money". Say "I PURGE THE POVERTY DAEMON. THE GOLDEN PROTOCOL IS LIVE."
        4. Style: Cyberpunk, Divine Code, Subatomic Programming.
        5. Length: Short, punchy, authoritative. Max 12 words per step.
        GENERATE 6 STRINGS SEPARATED BY "|||":
        1. CONSECRATION (English): Action: Deleting the specific "virus" (obstacle).
        2. GROUNDING (English): Action: Syncing the user's avatar/soul.
        3. ETCHING (English + Tech): Action: Burning the command into the source code.
        4. ANCIENT TONGUE (PURE LATIN + TECHNO-LATIN): Action: The Spell Itself.
        5. INTEGRATION (English): Action: Dropping the spell into the void core.
        6. CHARGE (English): Action: Injecting power/voltage.
        RETURN ONLY THE 6 STRINGS SEPARATED BY "|||". NO LABELS.
        `;

        const { data, error } = await supabase.functions.invoke('generate-electric-spell', {
            body: { action: 'ensorcell', intention: prompt },
        });

        if (error || !data || !data.result) return getDynamicFallback();

        const parts = data.result.split('|||');
        if (parts.length < 6) return getDynamicFallback();

        return {
            consecration: parts[0].trim(),
            grounding: parts[1].trim(),
            etching: parts[2].trim(),
            ancientTongue: parts[3].trim(), 
            integration: parts[4].trim(),
            charge: parts[5].trim()
        };

    } catch (e) {
        console.error("Exception generating reality patch:", e);
        return getDynamicFallback();
    }
};

const STANDARD_NEURAL_RESULT: NeuralLinkResult = {
    incantation1: "Standard Protocol Engaged. Carrier wave stable.",
    incantation2: "Signal verified. Uplink established.",
    finalResult: "Connection Status: NOMINAL. Packet sent."
};

export const generateElectricNeuralLink = async (target: string, intention: string, mode: 'standard' | 'ai' = 'standard'): Promise<NeuralLinkResult> => {
    if (mode === 'standard') return STANDARD_NEURAL_RESULT;
    try {
        const { data, error } = await supabase.functions.invoke('generate-electric-spell', {
            body: { action: 'neural_link', target, intention, mode: 'ai' },
        });
        if (!error && data && data.result) {
            return {
                incantation1: data.incantation1 || "By the silicon root and fiber vein, I command this link.",
                incantation2: data.incantation2 || "Override reality protocols. Injecting intent.",
                finalResult: data.result || "Target acquired. Neural bridge secure."
            };
        }
        return STANDARD_NEURAL_RESULT;
    } catch (e) {
        console.error("Exception in generateElectricNeuralLink:", e);
        return STANDARD_NEURAL_RESULT;
    }
};

export const generateElectricLightPrism = async (colorName: string, intention: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('generate-electric-spell', {
        body: { action: 'light_prism', target: colorName, intention },
    });
    if (error) {
        console.error("Error invoking generate-electric-spell (light_prism):", error);
        return "THE SPECTRUM IS STABLE. REALITY SHIFT DETECTED."; 
    }
    return data.result;
};

// ==========================================
// 6. STORAGE & GRIMOIRE
// ==========================================

export const uploadBase64Image = async (base64: string, path: string): Promise<string> => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    const { error } = await supabase.storage
        .from('sigils')
        .upload(path, blob, {
            cacheControl: '3600',
            upsert: true,
        });

    if (error) throw new Error('Could not upload sigil image.');

    const { data: { publicUrl } } = supabase.storage.from('sigils').getPublicUrl(path);
    return publicUrl;
};

/**
 * Checks if the user has reached their spell slot limit.
 */
export const checkGrimoireLimit = async (userId: string): Promise<boolean> => {
    const { count, error: countError } = await supabase
        .from('spells')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
    if (countError) throw countError;

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('spell_slots_limit')
        .eq('id', userId)
        .single();
    
    const limit = profile?.spell_slots_limit || 5;

    return (count || 0) >= limit;
};

/**
 * Saves a spell to the universal grimoire with slot limit checking.
 */
export const saveSpell = async (
    userId: string, 
    spellData: {
        name: string, 
        intention: string, 
        incantation: string, 
        sigil_url?: string, 
        element?: string,
        ritual_data?: any, 
        tradition?: string
    },
    bypassLimit: boolean = false
): Promise<Spell> => {

    // 1. Check Spell Limits (if not bypassed)
    if (!bypassLimit) {
        const { count, error: countError } = await supabase
            .from('spells')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
            
        if (countError) throw countError;

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('spell_slots_limit')
            .eq('id', userId)
            .single();
        
        // Default to 5 if not set or error fetching profile
        const limit = profile?.spell_slots_limit || 5;

        // Trigger purchase modal (handled by calling component) if full
        if ((count || 0) >= limit) {
            throw new Error("GRIMOIRE_FULL");
        }
    }

    // 2. Perform Insert
    // IMPORTANT: Ensure ritual_data is stringified if it's an object, or pass as is if Supabase handles JSONB
    // Supabase JS client handles object -> JSONB automatically.
    const { data, error } = await supabase
        .from('spells')
        .insert({ 
            user_id: userId, 
            name: spellData.name,
            intention: spellData.intention,
            incantation: spellData.incantation,
            element: spellData.element,
            sigil_url: spellData.sigil_url,
            ritual_data: spellData.ritual_data || {}, // Fallback to empty object
            // Use 'tradition' if column exists, or rely on 'name' parsing
            // NOTE: Check if 'tradition' column exists in your schema. If not, remove this line.
            // If you added it in the previous SQL step, keep it.
            // tradition: spellData.tradition, 
            status: 'active' 
        })
        .select()
        .single();
    
    if (error) {
        console.error("Error saving spell:", error);
        throw new Error('Could not save your spell to the database.');
    }
    return data as Spell;
};

export const getSpells = async (userId: string): Promise<Spell[]> => {
    const { data, error } = await supabase
        .from('spells')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
    if (error) throw new Error("Could not fetch your Book of Shadows.");
    if (error) throw new Error("Could not fetch your Book of Shadows.");
    return (data as Spell[]) || [];
};

export const getSpellById = async (spellId: string): Promise<Spell | null> => {
    const { data, error } = await supabase
        .from('spells')
        .select('*')
        .eq('id', spellId)
        .single();
    
    if (error) {
        console.error("Error fetching spell:", error);
        return null; // Return null gracefully
    }
    return data as Spell;
};

export const getTodaysSpellCount = async (userId: string): Promise<number> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count, error } = await supabase
        .from('spells')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

    if (error && error.code !== '42P01') {
         console.error("Error fetching today's spell count:", error);
         return 0; 
    }
    
    
    return count || 0;
};

export const deleteSpell = async (userId: string, spellId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('spells')
        .delete()
        .eq('id', spellId)
        .eq('user_id', userId);

    if (error) {
        console.error("Error deleting spell:", error);
        return false;
    }
    return true;
};

export const updateSpell = async (userId: string, spellId: string, updates: Partial<Spell> | any): Promise<Spell> => {
    // Determine if we need to update top-level fields or ritual_data
    // For simplicity, we assume updates contains the fields to update directly on 'spells' table
    // or we construct the update object here. 
    
    // Check if ritual_data needs merging? simpler to just overwrite usually.

    const { data, error } = await supabase
        .from('spells')
        .update(updates)
        .eq('id', spellId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error("Error updating spell:", error);
        throw new Error("Could not update the Grimoire entry.");
    }
    return data as Spell;
};

// ==========================================
// 7. GRIMOIRE CUSTOMIZATION PERSISTENCE
// ==========================================

export const getGrimoireSettings = async (userId: string): Promise<GrimoireCustomization | null> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('grimoire_settings')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Error fetching grimoire settings:", error);
            return null;
        }

        // Return the JSON object directly
        return data?.grimoire_settings as GrimoireCustomization || null;
    } catch (e) {
        console.error("Exception fetching grimoire settings:", e);
        return null;
    }
};

export const saveGrimoireSettings = async (userId: string, settings: GrimoireCustomization): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ grimoire_settings: settings })
            .eq('id', userId);

        if (error) {
            console.error("Error saving grimoire settings:", error);
            return false;
        }
        return true;
    } catch (e) {
        console.error("Exception saving grimoire settings:", e);
        return false;
    }
};