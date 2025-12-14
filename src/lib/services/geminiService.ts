// --- START OF FILE src/lib/services/geminiService.ts ---

import { createBrowserClient } from '@supabase/ssr';
import type { FormData, HumanDesignChart, Report, SpellFormData, GeneratedSpell, Spell, WiccanSpellFormData, GeneratedWiccanSpell } from '../types';

// Initialize the Supabase client for browser usage
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

const STANDARD_DATA_SCRY_RESPONSES = [
    "The ghost in the machine whispers: Yes.",
    "Signal unclear. Entropy high. Retry.",
    "Pattern matching... 99% probability of success.",
    "The void stares back. Proceed with caution.",
    "Packet loss detected. The answer is hidden.",
    "Encryption key found: The path is open.",
    "System override: Permission granted.",
    "Neural handshake complete. Connection established.",
    "Data corrupted. The future is in flux.",
    "Static interference masks the truth.",
    "Binary alignment achieved. Outcome favorable.",
    "The network rejects this query.",
    "Echo received from the deep web.",
    "Firewall breached. Insight downloaded.",
    "The algorithm predicts a shift.",
    "Zero-day exploit found in reality.",
    "Rebooting destiny... Please wait.",
    "404: Fate not found.",
    "Bandwidth exceeded. Focus your intent.",
    "The simulation glitches in your favor."
];

export const generateDataScrying = async (intention: string, mode: 'standard' | 'ai' = 'standard'): Promise<string> => {
    if (mode === 'standard') {
        // Return a random cryptic phrase
        return STANDARD_DATA_SCRY_RESPONSES[Math.floor(Math.random() * STANDARD_DATA_SCRY_RESPONSES.length)];
    }

    // Paid/AI Mode
    const { data, error } = await supabase.functions.invoke('generate-data-scry', {
        body: { intention, mode: 'ai' }, 
    });
    if (error) {
        console.error("Error invoking generate-data-scry:", error);
        return "ERROR: SIGNAL CORRUPTED. REBOOT SYSTEM.";
    }
    return data.result;
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

export const generateElectricNeuralLink = async (target: string, intention: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('generate-electric-spell', {
        body: { action: 'neural_link', target, intention },
    });
    if (error) {
        console.error("Error invoking generate-electric-spell (neural_link):", error);
        return "LINK ESTABLISHED. PACKET DELIVERED VIA BACKUP PROTOCOL."; 
    }
    return data.result;
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
// --- END OF FILE src/lib/services/geminiService.ts ---