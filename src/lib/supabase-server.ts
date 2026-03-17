import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only client (bypasses RLS — only use in API routes/server components)
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
