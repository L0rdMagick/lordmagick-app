import { GoogleAuth } from "npm:google-auth-library";
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

        const apiUrl = `https://${GCP_REGION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/publishers/google/models/gemini-1.5-flash:generateContent`;
        
        let prompt = '';
        if (action === 'calculate') {
            prompt = `Calculate the Human Design chart data for a person with these details: Name: ${formData.name}, DOB: ${formData.dateOfBirth}, Time: ${formData.timeOfBirth}, Place: ${formData.birthplace}. Return ONLY a valid JSON object with keys: type, strategy, authority, profile, incarnationCross, and a 'centers' array of objects with 'name' and 'defined' boolean properties.`;
        } else if (action === 'generate') {
            // THE FIX: Restored the original, highly detailed prompt for a long-form report.
            prompt = `
                You are "Arcanum AI," an expert Human Design analyst with a profound, eloquent, and insightful voice. Your task is to generate an exceptionally thorough, multi-page Human Design report for a client named ${name}, based on the provided chart data.

                **Chart Data:**
                ${JSON.stringify(chartData)}

                **Report Structure and Formatting Instructions (Follow PRECISELY):**

                1.  **Cover Page:** Start with a cover page section. It must be formatted exactly like this, with each item on a new line:
                    \`\`\`
                    TITLE: Human Design AI Report
                    NAME: ${name}
                    DESCRIPTION: A comprehensive, personalized guide to your unique energetic blueprint. This report delves into your core essence, personality, energy centers, life purpose, and provides practical guidance for living in alignment with your authentic self.
                    SUBTITLE: [Generate a creative, fitting subtitle based on their Type, Profile, and Cross]
                    ---
                    \`\`\`

                2.  **Main Content:** After the cover page's "---" separator, generate the main body of the report. The report must contain the following ten sections, in this exact order. Each section header MUST be a Markdown H2 (##) and MUST include a custom HTML ID in the format \`{#id-name}\`.

                    -   \`## 1. Introduction: Your Personal Blueprint {#introduction-your-personal-blueprint}\`
                    -   \`## 2. Core Essence: Type, Strategy, and Authority {#core-essence-type-strategy-and-authority}\`
                    -   \`## 3. Your Role & Personality: The Profile {#your-role-personality-the-profile}\`
                    -   \`## 4. Energy Centers: Your Energetic Makeup {#energy-centers-your-energetic-makeup}\`
                    -   \`## 5. Your Gifts and Lifeforce: Gates and Channels {#your-gifts-and-lifeforce-gates-and-channels}\`
                    -   \`## 6. Your Life's Purpose: The Incarnation Cross {#your-lifes-purpose-the-incarnation-cross}\`
                    -   \`## 7. Career and Vocation: Thriving in Your Work {#career-and-vocation-thriving-in-your-work}\`
                    -   \`## 8. Relationships and Connection: The Design of Your Heart {#relationships-and-connection-the-design-of-your-heart}\`
                    -   \`## 9. Challenges & The Not-Self Theme: Your Path to Growth {#challenges-the-not-self-theme-your-path-to-growth}\`
                    -   \`## 10. Living Your Design: A Practical Guide {#living-your-design-a-practical-guide}\`

                3.  **Table of Contents:** The VERY FIRST section after the cover page must be the "Table of Contents". It must be a Markdown bulleted list, with each item linking to the corresponding section ID from the list above. Example: \`- [1. Introduction: Your Personal Blueprint](#introduction-your-personal-blueprint)\`

                4.  **Content Depth:** Each section must be exceptionally detailed, insightful, and at least 3-5 long paragraphs. Use subheadings (### and ####) where appropriate. Use Markdown for formatting (bolding with **, italics with *, bullet points with *).

                5.  **Back to Top Links:** At the end of EACH of the 10 main sections (from Introduction to Living Your Design), you MUST include a "Back to Top" link formatted exactly like this: \`[Back to Top](#cover-page)\`

                **Tone and Voice:**
                -   Your tone should be wise, empowering, and insightful.
                -   Address the client directly by their name, ${name}.
                -   Explain complex concepts clearly and provide practical, actionable advice.

                Generate the complete report now based on these strict instructions.
            `;
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