// --- START OF FILE supabase/functions/generate-data-scry/index.ts ---

import { GoogleAuth } from "npm:google-auth-library";
import { corsHeaders } from '../_shared/cors.ts';

const GCP_PROJECT_ID = 'arcane-tools';
const GCP_REGION = 'us-central1';

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // We don't strictly need a payload for general scrying, but we can accept one if needed later.
        // const { ... } = await req.json(); 

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
        
        const prompt = `
            You are a digital oracle reading the raw code of the universe.
            Generate a cryptic, glitchy, cyberpunk-style prophecy about the user's immediate future. 
            Use technical jargon mixed with mysticism (e.g., "Packet loss in the astral plane", "Soul latency detected", "Daemon initialized").
            Keep it under 25 words. obscure but poetic. Return ONLY the text.
        `;

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
        console.error('Error in generate-data-scry function:', errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});