// --- START OF FILE stripe-webhook/index.ts ---

import Stripe from "npm:stripe";
import { createClient } from "npm:@supabase/supabase-js";

Deno.serve(async (req: Request) => {
  const signingSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
  const signature = req.headers.get('stripe-signature');

  try {
    const body = await req.text();
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
        apiVersion: '2024-06-20',
        httpClient: Stripe.createFetchHttpClient(),
    });

    const event = await stripe.webhooks.constructEvent(
      body,
      signature!,
      signingSecret!
    );
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      const userEmail = session.customer_details?.email;

      if (!userEmail) {
          throw new Error("No email found in Stripe session.");
      }
      
      // Find the user by email from the `auth.users` table
      const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', userEmail)
          .single();

      if (userError || !userData) {
          throw new Error(`Could not find user in auth.users with email: ${userEmail}`);
      }

      // Update the user's profile to set is_subscribed to true
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_subscribed: true })
        .eq('id', userData.id);

      if (updateError) {
        throw updateError;
      }
      
      console.log(`Successfully subscribed user: ${userData.id}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (err) {
    const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred.";
    console.error('Webhook error:', errorMessage);
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
});