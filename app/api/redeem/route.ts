import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../src/lib/supabase-server';

const REDEEM_COST = 500;

export async function POST(req: NextRequest) {
  const { userId, giftId, giftName, partnerId, deliveryAddress } = await req.json();

  if (!userId || !giftId) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  // Verify points balance
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('points_balance')
    .eq('id', userId)
    .single();

  if (!profile || profile.points_balance < REDEEM_COST) {
    return NextResponse.json({ error: `You need ${REDEEM_COST} points to redeem a free gift.` }, { status: 400 });
  }

  // Deduct points
  await supabaseAdmin.rpc('increment_points', { p_user_id: userId, p_amount: -REDEEM_COST });

  // Record transaction
  const { data: order } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: userId,
      partner_id: partnerId || null,
      product_id: giftId,
      product_name: giftName,
      amount_cents: 0,
      charity_amount_cents: 0,
      delivery_address: deliveryAddress,
      status: 'completed',
      is_recurring: false,
    })
    .select()
    .single();

  await supabaseAdmin.from('points_transactions').insert({
    user_id: userId,
    order_id: order?.id,
    amount: -REDEEM_COST,
    type: 'redeemed',
    description: `${REDEEM_COST} points redeemed for free gift: ${giftName}`,
  });

  return NextResponse.json({ success: true });
}
