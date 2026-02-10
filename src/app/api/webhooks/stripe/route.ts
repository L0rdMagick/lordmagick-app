import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize Admin Client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: Request) {
  const body = await req.text();
  // Await the headers() call
  const headerPayload = await headers();
  const signature = headerPayload.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Extract metadata added in the checkout route
    const userId = session.metadata?.userId;
    const creditAmount = parseInt(session.metadata?.creditAmount || '0');

    if (userId && creditAmount > 0) {
      console.log(`Adding ${creditAmount} credits to user ${userId}`);

      // Call the RPC function we created to safely increment
      const { error } = await supabaseAdmin.rpc('increment_credits', {
        row_id: userId,
        amount: creditAmount
      });

      if (error) {
        console.error('Database update failed:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
      
      console.log('Credits updated successfully.');
    }
  }

  return NextResponse.json({ received: true });
}