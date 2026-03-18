import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '../../../src/lib/supabase-server';

const CHARITY_PERCENT = 0.10;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' as any });

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 });
  }

  const { productId, productName, priceInCents, partnerId, deliveryAddress, userId } = await req.json();

  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  // Get or create a Stripe customer for this user
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email, stripe_customer_id')
    .eq('id', userId)
    .single();

  let customerId: string = profile?.stripe_customer_id ?? '';
  if (!customerId) {
    const customer = await stripe.customers.create({ email: profile?.email, metadata: { userId } });
    customerId = customer.id;
    await supabaseAdmin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
  }

  // Create a recurring Price object for this product
  const stripePrice = await stripe.prices.create({
    currency: 'aud',
    unit_amount: priceInCents,
    recurring: { interval: 'month' },
    product_data: { name: productName },
  });

  const charityAmountInCents = Math.round(priceInCents * CHARITY_PERCENT);
  const origin = req.headers.get('origin') ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: stripePrice.id, quantity: 1 }],
    success_url: `${origin}/gift/success?product=${encodeURIComponent(productName)}&partner=${encodeURIComponent(partnerId ?? '')}&recurring=1`,
    cancel_url: `${origin}/gift/${productId}`,
    metadata: {
      productId,
      productName,
      partnerId: partnerId ?? '',
      userId,
      charityAmountInCents: charityAmountInCents.toString(),
      deliveryLine1: deliveryAddress?.line1 ?? '',
      deliveryCity: deliveryAddress?.city ?? '',
      deliveryState: deliveryAddress?.state ?? '',
      deliveryPostcode: deliveryAddress?.postcode ?? '',
    },
    subscription_data: {
      metadata: {
        userId,
        partnerId: partnerId ?? '',
        productId,
        productName,
        priceInCents: priceInCents.toString(),
        deliveryLine1: deliveryAddress?.line1 ?? '',
        deliveryCity: deliveryAddress?.city ?? '',
        deliveryState: deliveryAddress?.state ?? '',
        deliveryPostcode: deliveryAddress?.postcode ?? '',
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
