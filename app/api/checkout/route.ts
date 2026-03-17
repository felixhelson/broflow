import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '../../../src/lib/supabase-server';

const CHARITY_PERCENT = 0.15;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' as any });

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured on this server.' }, { status: 503 });
  }

  const { productId, productName, priceInCents, partnerId, deliveryAddress, userId, pointsToRedeem = 0 } = await req.json();

  // Validate points redemption
  let validatedPointsToRedeem = 0;
  if (userId && pointsToRedeem >= 100) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('points_balance')
      .eq('id', userId)
      .single();
    const available = profile?.points_balance ?? 0;
    validatedPointsToRedeem = Math.min(pointsToRedeem, available, Math.floor((priceInCents - 100) / 100) * 100);
  }

  const discountCents   = validatedPointsToRedeem; // 100 pts = $1 = 100 cents
  const effectiveCents  = priceInCents - discountCents;
  const charityAmountInCents = Math.round(effectiveCents * CHARITY_PERCENT);
  const origin = req.headers.get('origin') ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'aud',
          product_data: { name: productName },
          unit_amount: effectiveCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/gift/success?product=${encodeURIComponent(productName)}&partner=${encodeURIComponent(partnerId ?? '')}`,
    cancel_url: `${origin}/gift/${productId}`,
    metadata: {
      productId,
      partnerId: partnerId ?? '',
      userId: userId ?? '',
      charityAmountInCents: charityAmountInCents.toString(),
      pointsRedeemed: validatedPointsToRedeem.toString(),
      deliveryLine1: deliveryAddress?.line1 ?? '',
      deliveryCity: deliveryAddress?.city ?? '',
      deliveryState: deliveryAddress?.state ?? '',
      deliveryPostcode: deliveryAddress?.postcode ?? '',
    },
    payment_intent_data: {
      metadata: {
        charityAmount: charityAmountInCents.toString(),
        recipient: 'Period Dignity Project',
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
