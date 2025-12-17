import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { stripe, PACKAGES } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { packageId } = await request.json();
    
    // 1. Authenticate User
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }); },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate Package
    const pack = PACKAGES[packageId as keyof typeof PACKAGES];
    if (!pack) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const origin = request.headers.get('origin');

    // 3. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      // ENABLE COUPONS HERE
      allow_promotion_codes: true, 
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pack.name,
              description: pack.description,
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/store?success=true`,
      cancel_url: `${origin}/store?canceled=true`,
      metadata: {
        userId: user.id,
        creditAmount: pack.credits.toString(),
        packageId: pack.id,
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}