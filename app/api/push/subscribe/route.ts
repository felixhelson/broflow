import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../src/lib/supabase-server';

export async function POST(req: NextRequest) {
  const { userId, subscription } = await req.json();
  if (!userId || !subscription) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  await supabaseAdmin.from('push_subscriptions').upsert(
    { user_id: userId, subscription: JSON.stringify(subscription) },
    { onConflict: 'user_id' }
  );

  return NextResponse.json({ success: true });
}
