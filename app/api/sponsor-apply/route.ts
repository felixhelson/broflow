import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../src/lib/supabase-server';

export async function POST(req: NextRequest) {
  const { businessName, category, websiteUrl, contactName, contactEmail, contactPhone, notificationMethod, offersPickup, message } = await req.json();

  if (!businessName || !category || !contactName || !contactEmail) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('sponsor_applications').insert({
    business_name: businessName,
    category,
    website_url: websiteUrl || null,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone || null,
    notification_method: notificationMethod,
    offers_pickup: offersPickup ?? null,
    message: message || null,
    status: 'pending',
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to submit application.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
