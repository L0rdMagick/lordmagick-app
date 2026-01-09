// --- START OF FILE index.ts ---

import { GoogleAuth } from "npm:google-auth-library";
import { corsHeaders } from '../_shared/cors.ts';

const GCP_PROJECT_ID = 'arcane-tools';
const GCP_REGION = 'us-central1';

const AVAILABLE_INGREDIENTS = [
    // Standard Tools
    "Athame", "Wand", "Chalice", "Cauldron", "Pentacle", "Bell", 
    // New Candles
    "Red Candle", "Green Candle", "Black Candle", "White Candle", "Pink Candle", "Blue Candle", "Yellow Candle", "Purple Candle", "Orange Candle", "Gold Candle", "Silver Candle", 
    // New Oils/Resins
    "Dragon's Blood", "Frankincense Resin", "Myrrh Resin", "Moon Water", "Patchouli Oil", "Rose Oil", "Sandalwood", "Salt Water", "Graveyard Dirt", "Black Salt", "Red Brick Dust", "Florida Water", "Van Van Oil", "Crown of Success", "Come to Me", "Protection Oil",
    // Standard Herbs
    "Rosemary", "Sage", "Basil", "Lavender", "Bay Leaf", "Mint", "Thyme", "Cinnamon", "Cloves", "Ginger", "Lemongrass", "Chamomile", "Mugwort", "Rowan Branch",
    // Crystals
    "Clear Quartz", "Amethyst", "Rose Quartz", "Citrine", "Black Tourmaline", "Obsidian", "Selenite", "Labradorite", "Carnelian", "Jade", "Lapis Lazuli", "Onyx", "Tiger's Eye"
];

// STRICT LIST of Deities we have icons for
const AVAILABLE_DEITIES = [
    "Triple Moon", "Horned God", "Pink Heart", "Owl", "Stag", "Sun Wheel", "Triskele", "Ankh", 
    "Lightning Bolt", "Crescent Moon", "Raven", "Hammer", 
    "Snake", "Dove", "Cornucopia", "Skull",
    "Hecate", "Cernunnos", "Aphrodite", "Thor", 
    "Brigid", "Ganesha", "Pan", "Isis", 
    "Odin", "Freya", "Morrigan", "Gaia", 
    "Apollo", "Selene", "Lakshmi", "Thoth"
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
          You are designing a High Ritual Wiccan ceremony.
          User Intention: "${intention}".
          Situation: "${situation || 'General'}"
          Focal Point: "${focalPoint}".
          Moon Phase: "${moonPhase}".

          Generate a valid JSON object with the following keys:
          - "title": A poetic name for the ritual.
          - "transitional_incantations": An object with 4 keys:
               1. "sanctification": A 2-line rhyme to purify the user before starting.
               2. "circle_casting": A 2-line rhyme to invoke while tracing the circle.
               3. "invocation": A 2-line rhyme to welcome the deity.
               4. "closing": A 2-line rhyme to open the circle/end the ritual.
          - "elemental_chants": An object containing 5 short (2-line) rhyming incantations to call the quarters. Keys: "Spirit", "Air", "Fire", "Earth", "Water".
          - "suggested_deities": An array of 3 objects (Deity Suggestions) relevant to the intention. Keys: 
             - "name": Choose from [${AVAILABLE_DEITIES.map(d => `"${d}"`).join(", ")}].
             - "title": A short title.
             - "pantheon": The origin.
             - "description": 1 sentence description.
             - "invocation": A specific 2-line rhyming invocation/prayer to call this specific deity for help.
          - "symbolic_ingredients": An array of EXACTLY FIVE objects. For each:
             - "name": Choose from [${AVAILABLE_INGREDIENTS.map(i => `"${i}"`).join(", ")}].
             - "incantation": A 1-sentence command for this item.
          - "central_chant": A 4-line rhyming chant for the climax.
          - "affirmation": A single sentence to seal the spell.
          
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