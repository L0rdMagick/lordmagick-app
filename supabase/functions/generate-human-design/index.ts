// --- START OF FILE supabase/functions/generate-human-design/index.ts ---

import { GoogleAuth } from "google-auth-library";
import { corsHeaders } from '../_shared/cors.ts';

const GCP_PROJECT_ID = 'arcane-tools';
const GCP_REGION = 'us-central1';

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }
    try {
        const { action, formData, chartData, name } = await req.json();
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
        
        let prompt = '';
        if (action === 'calculate') {
            prompt = `Calculate the Human Design chart data for a person with these details: Name: ${formData.name}, DOB: ${formData.dateOfBirth}, Time: ${formData.timeOfBirth}, Place: ${formData.birthplace}. Return ONLY a valid JSON object with keys: type, strategy, authority, profile, incarnationCross, and a 'centers' array of objects with 'name' and 'defined' boolean properties.`;
        } else if (action === 'generate') {
            // THE FIX: The prompt is updated to remove custom IDs and use standard Markdown.
            prompt = `You are "Arcanum AI," an expert Human Design analyst. Write a detailed, multi-section report for ${name} based on this chart data: ${JSON.stringify(chartData)}. Use standard Markdown formatting. Include a "Table of Contents" section that links to the other section headers. Do NOT include custom HTML IDs like {#id-name}.`;
        } else {
            return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
        }

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

        if (action === 'calculate') {
            const cleanedBody = responseBody.replace(/```json\n|```/g, '').trim();
            return new Response(cleanedBody, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } else { // generate
            return new Response(JSON.stringify({ reportContent: responseBody }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
        console.error('Error in generate-human-design function:', errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});