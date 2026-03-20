import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabaseAdmin } from '../../../../src/lib/supabase-server';

export async function GET(req: NextRequest) {
  const privKey = process.env.BROFLOW_VAPID_PRIVATE_KEY;
  if (!privKey) {
    return NextResponse.json({ error: 'Missing BROFLOW_VAPID_PRIVATE_KEY' });
  }
  webpush.setVapidDetails(
    'mailto:hello@broflow.app',
    'BF8028aHfscwVCjFxHuS47ZM_75s2M5BGiBwxrV0OOzUNmMU_1OmjYwn46n-zX88ieMdWSlPCB5k06oupSfhO2g',
    privKey
  );
  // Verify this is called by Vercel Cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all partners with cycle data
  const { data: partners } = await supabaseAdmin
    .from('partners')
    .select('user_id, name, last_period_start, avg_cycle_length');

  if (!partners?.length) return NextResponse.json({ sent: 0 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let sent = 0;

  for (const partner of partners) {
    if (!partner.last_period_start) continue;

    const lastPeriod = new Date(partner.last_period_start);
    const cycleLen = partner.avg_cycle_length ?? 28;
    const daysSince = Math.floor((today.getTime() - lastPeriod.getTime()) / 86400000);
    const dayInCycle = (daysSince % cycleLen) + 1;
    const daysUntilPeriod = cycleLen - dayInCycle;

    // Only notify at 5 days and 2 days out (bypass with ?force=true)
    const force = new URL(req.url).searchParams.get('force') === 'true';
    if (!force && daysUntilPeriod !== 5 && daysUntilPeriod !== 2) continue;

    // Get push subscription for this user
    const { data: sub } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', partner.user_id)
      .single();

    if (!sub?.subscription) continue;

    const payload = JSON.stringify({
      title: daysUntilPeriod === 5
        ? `${partner.name}'s period is in 5 days`
        : `${partner.name}'s period is in 2 days`,
      body: daysUntilPeriod === 5
        ? `A good time to order something warm and thoughtful.`
        : `She'll appreciate a little extra care right now.`,
      url: '/gifts',
    });

    try {
      await webpush.sendNotification(JSON.parse(sub.subscription), payload);
      sent++;
    } catch {
      // Subscription expired — clean it up
      await supabaseAdmin.from('push_subscriptions').delete().eq('user_id', partner.user_id);
    }
  }

  return NextResponse.json({ sent });
}
