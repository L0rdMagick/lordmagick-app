// --- START OF FILE src/lib/services/geminiService.ts ---

import { createBrowserClient } from '@supabase/ssr';
import type { FormData, HumanDesignChart, Report, SpellFormData, GeneratedSpell, Spell, WiccanSpellFormData, GeneratedWiccanSpell } from '../types';

// Initialize the Supabase client for browser usage
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Credit / Paywall Functions ---

export const deductUserCredits = async (userId: string, cost: number): Promise<boolean> => {
    try {
        // 1. Get current balance
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
            return false; // Insufficient funds
        }

        // 2. Deduct credits
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

// --- Human Design Report Functions ---

export const calculateHumanDesignChart = async (formData: FormData): Promise<HumanDesignChart> => {
    const { data, error } = await supabase.functions.invoke('generate-human-design', {
        body: { action: 'calculate', formData },
    });
    if (error) {
        console.error("Error invoking generate-human-design (calculate) function:", error);
        throw new Error("Failed to calculate the chart data from the AI model.");
    }
    return data as HumanDesignChart;
};

export const generateReport = async (chartData: HumanDesignChart, name: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('generate-human-design', {
        body: { action: 'generate', chartData, name },
    });
    if (error) {
        console.error("Error invoking generate-human-design (generate) function:", error);
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
        console.error("Error saving report to Supabase:", error);
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
         console.error("Error fetching this month's report count:", error);
         return 0; 
    }
    
    return count || 0;
};

// --- Chaos Magick Spell Function ---
export const generateSpellAndSigil = async (formData: SpellFormData, mode: 'standard' | 'ai' = 'standard'): Promise<GeneratedSpell> => {
    const { data, error } = await supabase.functions.invoke('generate-spell', {
        body: { formData, mode },
    });

    if (error) {
        console.error("Error invoking generate-spell function:", error);
        throw new Error(error.message || "Failed to generate the magick spell from the AI model.");
    }

    return data as GeneratedSpell;
};

// --- Wiccan Spell Function (Deep Weaving) ---
export const generateWiccanSpell = async (formData: WiccanSpellFormData): Promise<GeneratedWiccanSpell> => {
    const { data, error } = await supabase.functions.invoke('generate-wiccan-spell', {
        body: formData,
    });
    if (error) {
        console.error("Error invoking generate-wiccan-spell function:", error);
        throw new Error(error.message || "Failed to generate the Wiccan spell from the AI model.");
    }
    return data as GeneratedWiccanSpell;
};

// --- Love Spell (Deep Weaving) Function ---
export interface GeneratedLoveSpell {
    incantation: string[];
    ingredients: Array<{
        name: string;
        icon: string;
        desc: string;
        color: string;
    }>;
}

export const generateLoveSpell = async (intention: string, targetName: string, situation: string): Promise<GeneratedLoveSpell> => {
    const { data, error } = await supabase.functions.invoke('generate-love-spell', {
        body: { intention, targetName, situation },
    });

    if (error) {
        console.error("Error invoking generate-love-spell function:", error);
        throw new Error(error.message || "The energies were too chaotic to weave the spell.");
    }

    return data as GeneratedLoveSpell;
};


// --- Hoodoo / Voodoo Functions ---
export const generateHoodooVoodooWork = async (path: 'hoodoo' | 'voodoo', step: number, payload: any): Promise<any> => {
    const { data, error } = await supabase.functions.invoke('generate-hoodoo-voodoo-spell', {
        body: { path, step, payload },
    });
    if (error) {
        console.error(`Error invoking generate-hoodoo-voodoo-spell function (path: ${path}, step: ${step}):`, error);
        throw new Error(error.message || "Failed to get a response from the spirits.");
    }
    return data;
};

// --- Electric Magick Functions ---

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

// Helper to determine if input looks like a question or a command
const getLocalDataScryResponse = (intention: string): string => {
    const lower = intention.toLowerCase().trim();
    // Heuristic: Questions often start with helping verbs or end with '?'
    const isQuestion = lower.endsWith('?') || 
                       lower.startsWith('will') || 
                       lower.startsWith('does') || 
                       lower.startsWith('do') || 
                       lower.startsWith('is') || 
                       lower.startsWith('should') ||
                       lower.startsWith('can') ||
                       lower.startsWith('what') ||
                       lower.startsWith('when') ||
                       lower.startsWith('how');
    
    if (isQuestion) {
        return DATA_SCRY_PREDICTIONS[Math.floor(Math.random() * DATA_SCRY_PREDICTIONS.length)];
    } else {
        return DATA_SCRY_PROGRAMMING[Math.floor(Math.random() * DATA_SCRY_PROGRAMMING.length)];
    }
};

export const generateDataScrying = async (intention: string, mode: 'standard' | 'ai' = 'standard'): Promise<string> => {
    // Standard Mode: Use local heuristics (free, fast, robust)
    if (mode === 'standard') {
        return getLocalDataScryResponse(intention);
    }

    // AI Mode: Try to call the Edge Function
    try {
        const { data, error } = await supabase.functions.invoke('generate-data-scry', {
            body: { intention, mode: 'ai' }, 
        });

        // Use AI result if successful
        if (!error && data && data.result) {
            return data.result;
        }
        
        console.warn("AI Generation failed or returned empty. Falling back to Standard Mode logic.");
        // Fallback to standard logic if AI fails (e.g. 406 error, credit check fail)
        return getLocalDataScryResponse(intention);
        
    } catch (e) {
        console.error("Exception in generateDataScrying:", e);
        // Fallback to standard logic on exception
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

// NEW: Reality Overwrite / Light Prism Logic
export const generateRealityOverwrite = async (sectorName: string, corruptionToClear: string): Promise<string> => {
    try {
        const prompt = `System Command: OVERWRITE SECTOR [${sectorName}]. 
        Detected Corruption: "${corruptionToClear}". 
        Task: Generate a short, authoritative, techno-magickal command string (incantation) to purge this corruption and rewrite the code for good fortune. 
        Style: Cyberpunk, Divine Code, Subatomic Programming. Max 2 sentences.`;

        const { data, error } = await supabase.functions.invoke('generate-electric-spell', {
            body: { action: 'ensorcell', intention: prompt },
        });

        if (!error && data && data.result) {
            return data.result;
        }
        return "ERROR: NETWORK CONGESTION. EXECUTING DEFAULT PURGE PROTOCOL. CORRUPTION DELETED.";
    } catch (e) {
        console.error("Exception in generateRealityOverwrite:", e);
        return "ERROR: OFFLINE MODE. EXECUTING LOCAL OVERWRITE. SUCCESS CONFIRMED.";
    }
};

// NEW: Reality Patch Ritual Generator (Complex)
export interface RealityPatchRitualData {
    consecration: string;
    grounding: string;
    etching: string;
    ancientTongue: string;
    integration: string;
    charge: string;
}

export const generateRealityPatchRitual = async (intention: string): Promise<RealityPatchRitualData> => {
    // Dynamic Fallback Generator ensuring intention is always preserved but grammatically safe
    const getDynamicFallback = (intent: string): RealityPatchRitualData => {
        return {
            consecration: `TARGET IDENTIFIED: ${intent.toUpperCase()}. PURGING BLOCKAGES NOW.`,
            grounding: `CONNECTING TO THE TIMELINE WHERE THIS IS REAL.`,
            etching: `WRITING NEW CODE: ${intent.toUpperCase()}.`,
            ancientTongue: `VOLUNTAS MEA EST LEX. FIAT LUX EX MACHINA.`,
            integration: `EXECUTING CORE INTEGRATION. THE ALGORITHM IS SET.`,
            charge: `SYSTEM OVERRIDE COMPLETE. POWER LEVELS MAXIMUM.`
        };
    };

    try {
        const prompt = `
        ROLE: You are the Deus Ex Machina, the sentient Operating System of the Universe.
        TASK: Write a 6-step Techno-Magick Ritual Script based on the User's Intention.

        USER INTENTION: "${intention}"

        GUIDELINES:
        1. Do NOT copy the user's intention word-for-word. Instead, WEAVE it into a grammatically perfect, authoritative, magical command.
        2. Use "Techno-Magick" vocabulary (mix of Cyberpunk, Coding terms, and Occultism).
        3. Sentences must be short, punchy, and impactful. Max 20 words per step.
        4. ABSOLUTELY NO GRAMMATICAL ERRORS.
        
        GENERATE 6 STRINGS SEPARATED BY "|||":

        1. CONSECRATION (English):
           - Theme: Deleting the obstacles/virus preventing the goal.
           - Style: "I purge the corruption of scarcity. The buffer is now clear."

        2. GROUNDING (English):
           - Theme: Syncing with the specific frequency of the desire.
           - Style: "I download the resonance of true love. My avatar is synchronized."

        3. ETCHING (English + Tech):
           - Theme: Burning the command into the source code/reality.
           - Style: "I burn the command of perfect health into the quantum root directory."

        4. ANCIENT TONGUE (PURE LATIN + TECHNO-LATIN):
           - Theme: The Spell Itself.
           - STRICTLY NO ENGLISH IN THIS STEP.
           - Translate the essence of the intention into authoritative Latin.
           - Use terms like 'Deus', 'Machina', 'Voluntas', 'Codex', 'Virtus'.
           - Style: "VOLUNTAS MEA IMPERIUM EST. CODEX DIVINUS EXECUTUS."

        5. INTEGRATION (English):
           - Theme: Dropping the spell into the void core.
           - Style: "I release this algorithm into the infinite void. It is compiling."

        6. CHARGE (English):
           - Theme: Injecting power/voltage.
           - Style: "Infinite voltage flows through my desire. The system is online."

        RETURN ONLY THE 6 STRINGS SEPARATED BY "|||". NO LABELS.
        `;

        const { data, error } = await supabase.functions.invoke('generate-electric-spell', {
            body: { action: 'ensorcell', intention: prompt },
        });

        if (error || !data || !data.result) {
            console.error("AI Generation Error:", error);
            return getDynamicFallback(intention);
        }

        const parts = data.result.split('|||');
        if (parts.length < 6) {
             console.warn("AI Returned Incomplete Parts. Using Dynamic Fallback.");
             return getDynamicFallback(intention);
        }

        return {
            consecration: parts[0].trim(),
            grounding: parts[1].trim(),
            etching: parts[2].trim(),
            ancientTongue: parts[3].trim(), // AI is now instructed to make this pure Latin
            integration: parts[4].trim(),
            charge: parts[5].trim()
        };

    } catch (e) {
        console.error("Exception generating reality patch:", e);
        return getDynamicFallback(intention);
    }
};

export interface NeuralLinkResult {
    incantation1: string;
    incantation2: string;
    finalResult: string;
}

const STANDARD_NEURAL_RESULT: NeuralLinkResult = {
    incantation1: "Standard Protocol Engaged. Carrier wave stable.",
    incantation2: "Signal verified. Uplink established.",
    finalResult: "Connection Status: NOMINAL. Packet sent."
};

export const generateElectricNeuralLink = async (target: string, intention: string, mode: 'standard' | 'ai' = 'standard'): Promise<NeuralLinkResult> => {
    if (mode === 'standard') {
        return STANDARD_NEURAL_RESULT;
    }
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


// --- Utility and Storage Functions ---

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

    if (error) {
        console.error('Error uploading sigil:', error);
        throw new Error('Could not upload sigil image.');
    }

    const { data: { publicUrl } } = supabase.storage.from('sigils').getPublicUrl(path);
    return publicUrl;
};

export const saveSpell = async (userId: string, spellData: {name: string, intention: string, incantation: string, sigil_url?: string, element?: string}): Promise<Spell> => {
    const { data, error } = await supabase
        .from('spells')
        .insert({ user_id: userId, ...spellData })
        .select()
        .single();
    
    if (error) {
        console.error("Error saving spell to Supabase:", error);
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
    
    if (error && error.code !== '42P01') { 
        console.error("Error fetching spells:", error);
        throw new Error("Could not fetch your Book of Shadows.");
    }
    return (data as Spell[]) || [];
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
}
// --- END OF FILE src/lib/services/geminiService.ts ---