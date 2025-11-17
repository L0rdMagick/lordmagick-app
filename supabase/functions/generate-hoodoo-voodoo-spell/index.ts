// --- START OF FILE supabase/functions/generate-hoodoo-voodoo-spell/index.ts ---

import { GoogleAuth } from "npm:google-auth-library";
import { corsHeaders } from '../_shared/cors.ts';

const GCP_PROJECT_ID = 'arcane-tools';
const GCP_REGION = 'us-central1';

// Lists of available items for the AI to choose from
const HOODOO_MATERIA = [
    "Alfalfa", "Rosemary", "High John Root", "Bay Leaf", "Lodestone", 
    "Pyrite", "Magnetic Sand", "Silver Dime", "Goofer Dust", "Salt", 
    "Sulfur", "Brick Dust", "Lavender", "Cinnamon Stick", "Personal Concern (Hair)", "Snake Shed"
];

const VOODOO_OFFERINGS = [
    "Rum", "Cigar", "Sweet Coffee", "Candy", "Pink Rose", "Perfume Bottle",
    "Mirror", "Champagne", "Machete (mini)", "Iron Nail", "Red Candle", 
    "Coconut", "White Egg", "White Cloth", "Snake Icon", "Top Hat"
];

const LWA_OPTIONS = [ "Papa Legba", "Erzulie Freda", "Ogun", "Damballah", "Baron Samedi" ];
const PSALM_OPTIONS = [ "Psalm 23", "Psalm 91", "Psalm 51", "Psalm 37", "Psalm 7" ]; // Example Psalms

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { path, step, payload } = await req.json(); // `payload` will contain petition, selections, etc.
        const serviceAccountKey = Deno.env.get('GCP_SERVICE_ACCOUNT_KEY');
        if (!serviceAccountKey) { throw new Error("GCP_SERVICE_ACCOUNT_KEY secret is not set."); }

        const auth = new GoogleAuth({
            credentials: JSON.parse(serviceAccountKey),
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });
        const client = await auth.getClient();
        const accessToken = (await client.getAccessToken()).token;
        if (!accessToken) { throw new Error("Failed to retrieve access token."); }

        const apiUrl = `https://${GCP_REGION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/publishers/google/models/gemini-1.5-flash:generateContent`;
        
        let prompt = '';

        // --- AI Prompt Logic ---
        if (path === 'hoodoo') {
            switch(step) {
                case 3: // Find Your Verse
                    // THE FIX: Properly format the array as a string with quoted elements for the AI.
                    prompt = `A user's petition is: "${payload.petition}". From the following list of Psalms, select the THREE most spiritually aligned with this goal. Return a valid JSON object with a single key "selections" which is an array of three strings. List: [${PSALM_OPTIONS.map(p => `"${p}"`).join(", ")}]`;
                    break;
                case 4: // Gather Your Materia
                    // THE FIX: Properly format the array as a string with quoted elements for the AI.
                    prompt = `For a Hoodoo jar spell with the petition "${payload.petition}", select the FIVE to SEVEN most appropriate ingredients from this list. Return a valid JSON object with a single key "selections" which is an array of strings. List: [${HOODOO_MATERIA.map(i => `"${i}"`).join(", ")}]`;
                    break;
                case 7: // The Work is Done (Affirmation)
                     prompt = `Based on the Hoodoo petition "${payload.petition}", write a single, powerful, past-tense affirmation to be displayed on a plaque, confirming the work is done. Example: "My path to prosperity is now cleared and blessed." The output should be a valid JSON object with a single key "affirmation".`;
                     break;
            }
        } else if (path === 'voodoo') {
             switch(step) {
                case 3: // Serve the Lwa
                    // This case was missing from the previous switch, but it's good practice to ensure all lists are formatted correctly.
                    prompt = `A user's petition is: "${payload.petition}". From the following list of Lwa, select the ONE most appropriate to handle this need. Return a valid JSON object with a single key "selection". List: [${LWA_OPTIONS.map(l => `"${l}"`).join(", ")}]`;
                    break;
                case 4: // Prepare the Offering
                    // THE FIX: Properly format the array as a string with quoted elements for the AI.
                    prompt = `For serving the Lwa ${payload.lwa} with the petition "${payload.petition}", select FIVE to SEVEN appropriate offerings from this list. Return a valid JSON object with a single key "selections". List: [${VOODOO_OFFERINGS.map(o => `"${o}"`).join(", ")}]`;
                    break;
                case 7: // The Lwa is Served (Affirmation)
                    prompt = `Based on the Voodoo petition "${payload.petition}" made to the Lwa ${payload.lwa}, write a single, powerful, respectful, past-tense affirmation to be displayed on a plaque, confirming the Lwa has been served. Example: "Erzulie Freda has received her gifts and blesses my heart with love." The output must be a valid JSON object with a single key "affirmation".`;
                    break;
            }
        }

        if (!prompt) {
            throw new Error("Invalid path or step provided.");
        }
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`Vertex AI request failed: ${errorBody.error.message}`);
        }

        const responseData = await response.json();
        const responseBody = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseBody) { throw new Error("Received an empty response from the AI model."); }
        
        const cleanedJsonString = responseBody.replace(/```json\n|```/g, '').trim();
        const parsedJson = JSON.parse(cleanedJsonString);

        return new Response(JSON.stringify(parsedJson), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
        console.error('Error in generate-hoodoo-voodoo-spell function:', errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});
// --- END OF FILE ---