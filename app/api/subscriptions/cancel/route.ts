import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '../../../../src/lib/supabase-server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' as any });

export async function POST(req: NextRequest) {
  const { subscriptionId, userId } = await req.json();
  if (!subscriptionId || !userId) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  // Verify this subscription belongs to the requesting user
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, stripe_subscription_id')
    .eq('id', subscriptionId)
    .single();

  if (!sub || sub.user_id !== userId) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 403 });
  }

  // Cancel at period end in Stripe
  await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });

  // Mark as cancelled in DB immediately for UI clarity
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', subscriptionId);

  return NextResponse.json({ success: true });
}
