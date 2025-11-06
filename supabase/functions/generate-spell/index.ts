// --- START OF FILE generate-spell/index.ts ---

import { GoogleAuth } from "google-auth-library";
import { corsHeaders } from '../_shared/cors.ts';

const GCP_PROJECT_ID = 'arcane-tools'; // This is correct
const GCP_REGION = 'us-central1';

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { formData } = await req.json();
        const serviceAccountKey = Deno.env.get('GCP_SERVICE_ACCOUNT_KEY');
        if (!serviceAccountKey) { throw new Error("GCP_SERVICE_ACCOUNT_KEY secret is not set in Supabase."); }

        const auth = new GoogleAuth({
            credentials: JSON.parse(serviceAccountKey),
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });
        const client = await auth.getClient();
        const accessToken = (await client.getAccessToken()).token;
        if (!accessToken) { throw new Error("Failed to retrieve access token from Google Auth."); }
        
        const authHeaders = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };

        // --- Part 1: Generate Spell Text using Vertex AI (gemini-2.5-flash) ---
        const textPrompt = `Generate a magick spell as a JSON object with "title", "intention", and a 2-4 line rhyming "incantation", based on this: ${formData.outcome}`;
        const textApiUrl = `https://${GCP_REGION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/publishers/google/models/gemini-2.5-flash:generateContent`;
        
        const textRequestPromise = fetch(textApiUrl, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: textPrompt }] }]
            }),
        });

        // --- Part 2: Generate Sigil Image using Vertex AI (Imagen) ---
        const sigilPrompt = `a mystical, minimalist, glowing white line-art sigil on a solid black background, representing the intention to "${formData.action} ${formData.outcome}" with the element of ${formData.element}`;
        const imageApiUrl = `https://${GCP_REGION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/publishers/google/models/imagen-4.0-fast-generate-001:predict`;

        const imageRequestPromise = fetch(imageApiUrl, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                instances: [{ prompt: sigilPrompt }],
                parameters: { sampleCount: 1 }
            }),
        });

        // --- Await both AI calls concurrently ---
        const [textResponse, imageResponse] = await Promise.all([textRequestPromise, imageRequestPromise]);

        if (!textResponse.ok) {
            const errorBody = await textResponse.json();
            throw new Error(`Failed to generate spell text: ${errorBody.error.message}`);
        }
        const rawTextResponse = (await textResponse.json()).candidates[0].content.parts[0].text;
        const cleanedText = rawTextResponse.replace(/```json\n|```/g, '').trim();
        const spellContent = JSON.parse(cleanedText);
        
        if (!imageResponse.ok) {
            const errorBody = await imageResponse.json();
            throw new Error(`Failed to generate sigil image: ${errorBody.error.message}`);
        }
        const imageResponseBody = await imageResponse.json();
        const sigilBase64 = imageResponseBody?.predictions?.[0]?.bytesBase64Encoded;

        if (!sigilBase64) {
            throw new Error("The celestial forge returned an empty sigil. Please try again.");
        }

        // Return the full payload with the REAL base64 image data
        return new Response(JSON.stringify({ ...spellContent, sigilBase64 }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
        console.error('Error in generate-spell function:', errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});