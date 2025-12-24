// --- START OF FILE supabase/functions/generate-love-spell/index.ts ---
import { GoogleAuth } from "npm:google-auth-library";
import { corsHeaders } from '../_shared/cors.ts';

const GCP_PROJECT_ID = 'arcane-tools';
const GCP_REGION = 'us-central1';

Deno.serve(async (req: Request) => {
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
            You are an expert in love magick.
            Context: "Soul Connect" honey jar spell.
            User Intention: "${intention}"
            Target: "${targetName}"
            Situation: "${situation}"

            Generate a JSON object. NO MARKDOWN.
            
            Structure:
            {
              "incantation": ["Line 1", "Line 2", "Line 3", "Line 4"],
              "ingredients": [
                { 
                  "name": "Ingredient Name", 
                  "icon": "Emoji", 
                  "desc": "Metaphysical use", 
                  "color": "text-pink-400",
                  "chant": "2 rhyming lines to charge this specific ingredient for ${intention}."
                },
                ... (3 items total)
              ],
              "step_chants": {
                "honey": "2 rhyming lines for pouring honey to sweeten ${targetName}.",
                "candle": "2 rhyming lines for lighting the candle to ignite ${intention}.",
                "release": "2 rhyming lines for releasing the spell to the universe."
              }
            }
        `;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`Vertex AI error: ${errorBody.error.message}`);
        }

        const responseData = await response.json();
        const text = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) throw new Error("Empty response from AI");

        const cleanedText = text.replace(/```json\n|```/g, '').trim();
        const json = JSON.parse(cleanedText);

        return new Response(JSON.stringify(json), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
        console.error(errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }
});
// --- END OF FILE ---