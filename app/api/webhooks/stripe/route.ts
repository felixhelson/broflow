import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '../../../../src/lib/supabase-server';

const POINTS_PER_DOLLAR = 1;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' as any });

function isBirthdayMonth(birthday: string | null): boolean {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  return today.getMonth() === bday.getMonth();
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    return NextResponse.json({ error: `Webhook error: ${err}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};
    const userId = meta.userId;
    if (!userId) return NextResponse.json({ received: true });

    // Subscription checkout — record subscription, first order handled by invoice.payment_succeeded
    if (session.mode === 'subscription' && session.subscription) {
      const subId = session.subscription as string;
      const priceInCents = parseInt(meta.charityAmountInCents ? String(Math.round(parseInt(meta.charityAmountInCents) / 0.15)) : '0', 10);
      await supabaseAdmin.from('subscriptions').upsert({
        user_id: userId,
        partner_id: meta.partnerId || null,
        stripe_subscription_id: subId,
        product_id: meta.productId,
        product_name: meta.productName,
        amount_cents: priceInCents,
        delivery_address: {
          line1: meta.deliveryLine1,
          city: meta.deliveryCity,
          state: meta.deliveryState,
          postcode: meta.deliveryPostcode,
        },
        status: 'active',
      }, { onConflict: 'stripe_subscription_id' });
      return NextResponse.json({ received: true });
    }

    const amountCents        = session.amount_total ?? 0;
    const charityAmountCents = parseInt(meta.charityAmountInCents ?? '0', 10);
    const pointsRedeemed     = parseInt(meta.pointsRedeemed ?? '0', 10);

    // Record the order
    const { data: order } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        partner_id: meta.partnerId || null,
        stripe_session_id: session.id,
        product_id: meta.productId,
        product_name: meta.productId,
        amount_cents: amountCents,
        charity_amount_cents: charityAmountCents,
        delivery_address: {
          line1: meta.deliveryLine1,
          city: meta.deliveryCity,
          state: meta.deliveryState,
          postcode: meta.deliveryPostcode,
        },
        status: 'completed',
        is_recurring: false,
      })
      .select()
      .single();

    // Apply points redemption deduction
    if (pointsRedeemed > 0) {
      await supabaseAdmin.from('points_transactions').insert({
        user_id: userId,
        order_id: order?.id,
        amount: -pointsRedeemed,
        type: 'redeemed',
        description: `${pointsRedeemed} points redeemed for $${(pointsRedeemed / 100).toFixed(2)} discount`,
      });
      await supabaseAdmin.rpc('increment_points', { p_user_id: userId, p_amount: -pointsRedeemed });
    }

    // Check for bonus points multiplier
    let multiplier = 1;
    let bonusReason = '';

    if (meta.partnerId) {
      const { data: partner } = await supabaseAdmin
        .from('partners')
        .select('birthday, last_period_start, avg_cycle_length')
        .eq('id', meta.partnerId)
        .single();

      if (partner) {
        if (isBirthdayMonth(partner.birthday)) {
          multiplier = 2;
          bonusReason = 'birthday month';
        }

        if (multiplier === 1 && partner.last_period_start) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const lastPeriod = new Date(partner.last_period_start);
          const daysSince = Math.floor((today.getTime() - lastPeriod.getTime()) / 86400000);
          const cycleLen = partner.avg_cycle_length ?? 28;
          const dayInCycle = (daysSince % cycleLen) + 1;
          const daysUntilPeriod = cycleLen - dayInCycle;
          if (daysUntilPeriod <= 5) {
            multiplier = 2;
            bonusReason = 'PMS window';
          }
        }
      }
    }

    // Award points
    const basePoints  = Math.floor((amountCents / 100) * POINTS_PER_DOLLAR);
    const totalPoints = basePoints * multiplier;

    if (totalPoints > 0 && order) {
      await supabaseAdmin.from('points_transactions').insert({
        user_id: userId,
        order_id: order.id,
        amount: totalPoints,
        type: multiplier > 1 ? 'bonus' : 'earned',
        description: multiplier > 1
          ? `${totalPoints} points earned (${multiplier}x bonus — ${bonusReason})`
          : `${totalPoints} points earned on order`,
      });
      await supabaseAdmin.rpc('increment_points', { p_user_id: userId, p_amount: totalPoints });
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    const subId = (invoice as { subscription?: string }).subscription;
    if (!subId) return NextResponse.json({ received: true });

    // Get subscription metadata from Stripe (reliable even on first payment)
    const stripeSub = await stripe.subscriptions.retrieve(subId);
    const subMeta = stripeSub.metadata ?? {};
    const userId = subMeta.userId;
    if (!userId) return NextResponse.json({ received: true });

    const amountCents = invoice.amount_paid ?? 0;

    await supabaseAdmin.from('orders').insert({
      user_id: userId,
      partner_id: subMeta.partnerId || null,
      stripe_subscription_id: subId,
      product_id: subMeta.productId,
      product_name: subMeta.productName,
      amount_cents: amountCents,
      charity_amount_cents: Math.round(amountCents * 0.15),
      delivery_address: {
        line1: subMeta.deliveryLine1,
        city: subMeta.deliveryCity,
        state: subMeta.deliveryState,
        postcode: subMeta.deliveryPostcode,
      },
      status: 'completed',
      is_recurring: true,
    });

    const pointsEarned = Math.floor((amountCents / 100) * POINTS_PER_DOLLAR);
    if (pointsEarned > 0) {
      await supabaseAdmin.from('points_transactions').insert({
        user_id: userId,
        amount: pointsEarned,
        type: 'earned',
        description: 'Points earned on recurring order',
      });
      await supabaseAdmin.rpc('increment_points', { p_user_id: userId, p_amount: pointsEarned });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('stripe_subscription_id', sub.id);
  }

  return NextResponse.json({ received: true });
}
