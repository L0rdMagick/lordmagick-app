
import { JWT } from "npm:google-auth-library";
import { corsHeaders } from '../_shared/cors.ts';

const GCP_PROJECT_ID = 'arcane-tools';
const GCP_REGION = 'us-central1';

// These lists match your spriteLibrary.ts EXACTLY.
// The AI must choose from these to ensure the visual appears in the jar.
const HOODOO_MATERIA = [
    "Alfalfa", "Rosemary", "High John Root", "Bay Leaf", "Lodestone", 
    "Pyrite", "Magnetic Sand", "Silver Dime", "Goofer Dust", "Salt", 
    "Sulfur", "Brick Dust", "Lavender", "Cinnamon Stick", "Personal Concern (Hair)", "Snake Shed"
];

const VOODOO_OFFERINGS = [
    "Rum", "Cigar", "Sweet Coffee", "Candy", "Pink Rose", "Perfume Bottle",
    "Mirror", "Champagne", "Machete (mini)", "Iron Nail", "Red Candle", 
    "Coconut", "White Egg", "White Cloth", "Snake Icon", "Top Hat"
];

const LWA_OPTIONS = [ "Papa Legba", "Erzulie Freda", "Ogun", "Damballah", "Baron Samedi" ];
const PSALM_OPTIONS = [ "Psalm 23", "Psalm 91", "Psalm 51", "Psalm 37", "Psalm 7" ]; 

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { path, step, payload } = await req.json(); 
        const serviceAccountKey = Deno.env.get('GCP_SERVICE_ACCOUNT_KEY');
        if (!serviceAccountKey) { throw new Error("GCP_SERVICE_ACCOUNT_KEY secret is not set."); }

        const serviceAccount = JSON.parse(serviceAccountKey);

        const client = new JWT({
            email: serviceAccount.client_email,
            key: serviceAccount.private_key,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const accessToken = (await client.getAccessToken()).token;
        if (!accessToken) { throw new Error("Failed to retrieve access token."); }

        const apiUrl = `https://${GCP_REGION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/publishers/google/models/gemini-2.5-flash:generateContent`;
        
        let prompt = '';

        // --- AI Logic: The Digital Rootworker ---
        if (path === 'hoodoo') {
            switch(step) {
                case 3: // Find Your Verse
                    prompt = `
                    You are an elder Hoodoo rootworker. A client has come to you with this petition: "${payload.petition}".
                    From this list of Biblical Psalms: [${PSALM_OPTIONS.map(p => `"${p}"`).join(", ")}], select the THREE that are most spiritually potent for this specific situation.
                    Return a JSON object: { "selections": ["Psalm X", "Psalm Y", "Psalm Z"] }
                    `;
                    break;
                case 4: // Gather Your Materia
                    prompt = `
                    You are an expert Hoodoo rootworker crafting a 'Mojo Hand' or 'Sweet Jar' for a client.
                    Client Petition: "${payload.petition}"
                    
                    Available Ingredients (You MUST choose from this list only): 
                    [${HOODOO_MATERIA.join(", ")}]

                    Task:
                    1. Analyze the metaphysical properties of the available ingredients.
                    2. Select exactly 5 ingredients that best align with the client's petition (e.g., Cinnamon for speed/money, Lavender for peace/love, Sulfur for enemy work/banishing).
                    3. For each selected ingredient, write a short, 1-sentence activation incantation that commands that specific ingredient to fulfill the petition.

                    Return a JSON object: 
                    { 
                      "selections": [
                        { "name": "Ingredient Name", "incantation": "Spirit of [Name], [Command]." },
                        ... (5 items)
                      ] 
                    }
                    `;
                    break;
                case 7: // The Work is Done (Affirmation)
                     prompt = `
                     The Hoodoo work is complete. The petition was: "${payload.petition}".
                     Write a powerful, past-tense affirmation confirming the result is already manifest. 
                     Style: Authoritative, Biblical, Folk Magic.
                     Return a JSON object: { "affirmation": "Your affirmation here." }
                     `;
                     break;
            }
        } else if (path === 'voodoo') {
             switch(step) {
                case 3: // Serve the Lwa
                    prompt = `
                    You are a Voodoo Houngan. A supplicant asks: "${payload.petition}".
                    Which Lwa governs this request? Choose ONE from: [${LWA_OPTIONS.join(", ")}].
                    Return a JSON object: { "selection": "Lwa Name" }
                    `;
                    break;
                case 4: // Prepare the Offering
                    prompt = `
                    You are preparing a service for the Lwa ${payload.lwa} to grant this request: "${payload.petition}".
                    
                    Available Offerings (You MUST choose from this list only):
                    [${VOODOO_OFFERINGS.join(", ")}]

                    Task:
                    1. Select exactly 5 offerings that are traditional favorites of ${payload.lwa} OR that align with the petition.
                    2. For each, write a short sentence presenting the gift to the Lwa.

                    Return a JSON object:
                    {
                      "selections": [
                        { "name": "Offering Name", "incantation": "I offer you [Name] to [Purpose]." },
                        ... (5 items)
                      ]
                    }
                    `;
                    break;
                case 7: // The Lwa is Served (Affirmation)
                    prompt = `
                    The service for ${payload.lwa} regarding "${payload.petition}" is complete.
                    Write a respectful confirmation that the Lwa has accepted the gifts and the path is open.
                    Return a JSON object: { "affirmation": "Your affirmation here." }
                    `;
                    break;
            }
        }

        if (!prompt) { throw new Error("Invalid path or step provided."); }
        
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
        const responseBody = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseBody) { throw new Error("Received an empty response from the AI model."); }
        
        const cleanedJsonString = responseBody.replace(/```json\n|```/g, '').trim();
        const parsedJson = JSON.parse(cleanedJsonString);

        return new Response(JSON.stringify(parsedJson), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
        console.error('Error in generate-hoodoo-voodoo-spell function:', errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});