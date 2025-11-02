// src/app/api/tarot/route.ts

import { NextResponse } from 'next/server';

// --- Tarot Card Data (This can stay the same) ---
const tarotCards = [
    'https://images.squarespace-cdn.com/content/v1/63ff45f58b2ecb2de4ae9935/3589a05d-dc60-40c1-8fd9-9333d60e79af/two_of_swords.jpg',
    // ... all 78 card URLs ...
    'https://images.squarespace-cdn.com/content/v1/63ff45f58b2ecb2de4ae9935/e0de8a2a-9c79-44d1-8271-5a5a828c4112/death.jpg',
];

const tarotCardMapping: { [key: string]: string } = {
    'https://images.squarespace-cdn.com/content/v1/63ff45f58b2ecb2de4ae9935/3589a05d-dc60-40c1-8fd9-9333d60e79af/two_of_swords.jpg': 'Two of Swords',
    // ... all 78 mappings ...
    'https://images.squarespace-cdn.com/content/v1/63ff45f58b2ecb2de4ae9935/e0de8a2a-9c79-44d1-8271-5a5a828c4112/death.jpg': 'Death',
};

// Helper function to shuffle cards
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// THE FIX: This is the new, correct handler for Vapi Tool Calls.
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // According to the documentation, the payload structure is { message: { toolCallList: [...] } }
    const toolCall = body?.message?.toolCallList?.[0];

    if (!toolCall) {
      console.error("Invalid Vapi tool call payload:", body);
      return NextResponse.json({ error: 'Invalid tool call payload' }, { status: 400 });
    }

    const toolCallId = toolCall.id;
    const functionName = toolCall.name;
    const parameters = toolCall.arguments || {};

    let result: any;

    // This switch allows you to have multiple tools in the future.
    switch (functionName) {
      case 'getTarotReadingCards': // Ensure this name matches your Vapi Dashboard Tool Name
        const cardCount = parameters.cardCount || 10;
        const selectedCards = shuffleArray(tarotCards).slice(0, cardCount);
        const cardNames = selectedCards.map(url => tarotCardMapping[url] || 'Unknown Card');
        
        // We will no longer save to the database here. We just return the names.
        // The front-end will fetch the images separately if needed.
        result = cardNames;
        break;

      default:
        return NextResponse.json({ error: `Unknown tool function: ${functionName}` }, { status: 400 });
    }

    // The response must be in the format Vapi expects, as per the documentation.
    const vapiResponse = {
      results: [
        {
          toolCallId: toolCallId,
          result: result,
        },
      ],
    };

    return NextResponse.json(vapiResponse);

  } catch (error: any) {
    console.error('API Error in Vapi tool call:', error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}