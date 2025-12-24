// --- START OF FILE supabase/functions/generate-love-spell/index.ts ---
import { GoogleAuth } from "npm:google-auth-library";
import { corsHeaders } from '../_shared/cors.ts';

const GCP_PROJECT_ID = 'arcane-tools';
const GCP_REGION = 'us-central1';

Deno.serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { intention, targetName, situation } = await req.json();
        
        const serviceAccountKey = Deno.env.get('GCP_SERVICE_ACCOUNT_KEY');
        if (!serviceAccountKey) { throw new Error("GCP_SERVICE_ACCOUNT_KEY secret is not set."); }

        const auth = new GoogleAuth({
            credentials: JSON.parse(serviceAccountKey),
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });
        const client = await auth.getClient();
        const accessToken = (await client.getAccessToken()).token;

        const apiUrl = `https://${GCP_REGION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/publishers/google/models/gemini-2.5-flash:generateContent`;
        
        const prompt = `
            You are an expert in love magick and rootwork.
            Context: A user is casting a "Soul Connect" honey jar spell.
            User Intention: "${intention}"
            Target Name: "${targetName}"
            Situation: "${situation}"

            Task: Generate a JSON object for the spell components.
            
            Requirements:
            1. "incantation": An array of 4-6 rhyming lines for the final spell. It should be powerful, romantic, and binding.
            2. "ingredients": An array of exactly 3 symbolic ingredients to add to the jar. For each ingredient provide:
               - "name": (e.g., "Rose Petals", "Cinnamon", "Magnetic Sand")
               - "icon": A single emoji representing it (e.g., "🌹", "🪵", "🧲")
               - "desc": A very short metaphysical description (e.g., "For sweet love")
               - "color": A Tailwind CSS text color class that matches the item (e.g., "text-pink-400", "text-red-500", "text-amber-700", "text-purple-400", "text-blue-300").

            Return ONLY the JSON. No markdown formatting.
            Example Structure:
            {
              "incantation": ["Line 1", "Line 2", ...],
              "ingredients": [
                { "name": "Rose", "icon": "🌹", "desc": "For romance", "color": "text-pink-400" },
                ...
              ]
            }
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
            throw new Error(`Vertex AI error: ${errorBody.error.message}`);
        }

        const responseData = await response.json();
        const text = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) throw new Error("Empty response from AI");

        // Clean and parse JSON
        const cleanedText = text.replace(/```json\n|```/g, '').trim();
        const json = JSON.parse(cleanedText);

        return new Response(JSON.stringify(json), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
        console.error(errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }
});
// --- END OF FILE ---