// --- START OF FILE supabase/functions/generate-wiccan-spell/index.ts ---

import { GoogleAuth } from "npm:google-auth-library";
import { corsHeaders } from '../_shared/cors.ts';

const GCP_PROJECT_ID = 'arcane-tools';
const GCP_REGION = 'us-central1';

const AVAILABLE_INGREDIENTS = [
    // tools1
    "Athame", "Wand", "Chalice", "Cauldron", "Pentacle", "Bell", "Candle", 
    "Mortar & Pestle", "Bowl", "Staff", "Altar", "Besom", "Grimoire", 
    "Cord", "Mirror", "Lantern",
    // herbs1
    "Rosemary", "Sage", "Basil", "Lavender", "Bay Leaf", "Mint", "Thyme", 
    "Cinnamon", "Cloves", "Ginger", "Lemongrass", "Chamomile", "Mugwort", 
    "Frankincense", "Myrrh", "Rowan Branch",
    // crystals1
    "Clear Quartz", "Amethyst", "Rose Quartz", "Citrine", "Black Tourmaline", 
    "Obsidian", "Selenite", "Labradorite", "Carnelian", "Jade", "Quartz Crystal", 
    "Lapis Lazuli", "Onyx", "Tiger's Eye", "Smoky Quartz", "Aventurine",
    // offerings2
    "Nuts", "Herbs Offering", "Rice", "Tobacco", "Salt", "Sugar", "Grain", 
    "Bread Loaf", "Candle Cluster", "Crystal Offering", "Shell", "Bowl of Fire", 
    "Sacred Stone", "Bonsai", "Coin Pile"
];

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { ...corsHeaders, 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS' } });
    }

    try {
        const { intention, focalPoint, moonPhase, situation } = await req.json();
        const serviceAccountKey = Deno.env.get('GCP_SERVICE_ACCOUNT_KEY');
        if (!serviceAccountKey) { throw new Error("GCP_SERVICE_ACCOUNT_KEY secret is not set in Supabase."); }

        const auth = new GoogleAuth({
            credentials: JSON.parse(serviceAccountKey),
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });
        const client = await auth.getClient();
        const accessToken = (await client.getAccessToken()).token;
        if (!accessToken) { throw new Error("Failed to retrieve access token."); }

        const apiUrl = `https://${GCP_REGION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/publishers/google/models/gemini-2.5-flash:generateContent`;
        
        const prompt = `
          You are designing a self-contained, DIGITAL Wiccan ritual.
          User Intention: "${intention}".
          Situation Context: "${situation || 'General'}"
          Focal Point: "${focalPoint}".
          Moon Phase: "${moonPhase}".

          Generate a valid JSON object with the following keys:
          - "title": A poetic name for the ritual.
          - "elemental_chants": An object containing 5 short (2-line) rhyming incantations to call the quarters, specifically tailored to the intention. Keys must be exactly: "Spirit", "Air", "Fire", "Earth", "Water".
          - "symbolic_ingredients": An array of EXACTLY FIVE objects. For each object:
             - "name": Choose from [${AVAILABLE_INGREDIENTS.map(i => `"${i}"`).join(", ")}].
             - "incantation": A specific 1-sentence command telling this item what to do for the spell.
          - "central_chant": A short, 4-line rhyming chant to speak at the climax.
          - "affirmation": A single, powerful sentence to seal the spell.
          
          Do not include markdown formatting. Return only the raw JSON.
        `;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`Vertex AI request failed: ${errorBody.error.message}`);
        }

        const responseData = await response.json();
        const responseBody = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseBody) {
            throw new Error("Received an unexpected or empty response from the AI model.");
        }
        
        const cleanedJsonString = responseBody.replace(/```json\n|```/g, '').trim();
        const parsedJson = JSON.parse(cleanedJsonString);

        return new Response(JSON.stringify(parsedJson), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
        console.error('Error in generate-wiccan-spell function:', errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});