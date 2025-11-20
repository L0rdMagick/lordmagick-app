// --- START OF FILE supabase/functions/generate-electric-spell/index.ts ---

import { GoogleAuth } from "npm:google-auth-library";
import { corsHeaders } from '../_shared/cors.ts';

const GCP_PROJECT_ID = 'arcane-tools';
const GCP_REGION = 'us-central1';

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { action, intention } = await req.json();
        const serviceAccountKey = Deno.env.get('GCP_SERVICE_ACCOUNT_KEY');
        if (!serviceAccountKey) { throw new Error("GCP_SERVICE_ACCOUNT_KEY secret is not set."); }

        const auth = new GoogleAuth({
            credentials: JSON.parse(serviceAccountKey),
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });
        const client = await auth.getClient();
        const accessToken = (await client.getAccessToken()).token;
        if (!accessToken) { throw new Error("Failed to retrieve access token."); }

        const apiUrl = `https://${GCP_REGION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/publishers/google/models/gemini-2.5-flash:generateContent`;
        
        let prompt = '';

        if (action === 'ensorcell') {
            prompt = `Rewrite this intention as a cryptic, ancient, powerful chaos magick mantra. Max 10 words. Uppercase. Return ONLY the text. Intention: "${intention}"`;
        } else if (action === 'oracle') {
            prompt = `A chaos magick spell for "${intention}" has been cast into a wormhole. Provide a very short, surreal, and mysterious synchronicity (under 20 words) the user might witness in the next 24 hours. Focus on colors, numbers, or animals. Do not explain. Format: "Watch for..." Return ONLY the text.`;
        } else {
            throw new Error("Invalid action.");
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
        const resultText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!resultText) { throw new Error("Received an empty response from the AI model."); }

        return new Response(JSON.stringify({ result: resultText.trim().replace(/['"]/g, '') }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
        console.error('Error in generate-electric-spell function:', errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});