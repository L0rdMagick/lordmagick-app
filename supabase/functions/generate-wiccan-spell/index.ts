// --- START OF FILE supabase/functions/generate-wiccan-spell/index.ts ---

import { GoogleAuth } from "google-auth-library";
import { corsHeaders } from '../_shared/cors.ts';

const GCP_PROJECT_ID = 'arcane-tools'; // This is correct
const GCP_REGION = 'us-central1';

const SYMBOLIC_INGREDIENTS = [
  "Candle", "Athame", "Chalice", "Pentacle", "Quartz Crystal", "Lavender", "Rosemary", "Sage", "Salt", "Rowan Branch"
];

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { ...corsHeaders, 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS' } });
    }

    try {
        const { intention, _focalPoint, _moonPhase } = await req.json();
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
          You are designing a self-contained, DIGITAL Wiccan ritual for an app.
          The user's intention is: "${intention}".

          Generate a valid JSON object with the following keys:
          - "title": A fitting, poetic name for the ritual.
          - "incantation": A short, 2-4 line rhyming incantation for the user to speak at the start.
          - "symbolic_ingredients": An array of EXACTLY FIVE objects. For each object, choose a "name" from this list: [${SYMBOLIC_INGREDIENTS.map(i => `"${i}"`).join(", ")}]. Select the five ingredients that are MOST symbolically aligned with the user's intention. Prioritize variety and avoid repetition unless an ingredient is exceptionally fitting. Each object must also have an "activation_phrase" (a short, powerful phrase for the user to speak when placing that ingredient).
          - "central_chant": A short, 2-line rhyming chant to appear after all ingredients are placed.
          - "affirmation": A single, powerful sentence for the user to see at the very end to seal the spell.
          
          Do not include any other keys or markdown formatting. The output must be only the raw JSON object.
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

        let parsedJson;
        try {
            parsedJson = JSON.parse(cleanedJsonString);
        } catch (parseError) {
            console.error("Failed to parse JSON response from AI:", cleanedJsonString);
            // --- THIS IS THE FIX ---
            if (parseError instanceof Error) {
                console.error("Parse Error:", parseError.message);
            } else {
                console.error("An unknown parsing error occurred:", parseError);
            }
            // --- END FIX ---
            throw new Error("The AI returned a malformed spell. Please try again.");
        }

        return new Response(JSON.stringify(parsedJson), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
        console.error('Error in generate-wiccan-spell function:', errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});