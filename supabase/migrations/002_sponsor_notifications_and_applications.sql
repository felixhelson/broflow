-- Add notification fields to sponsors
ALTER TABLE sponsors
  ADD COLUMN IF NOT EXISTS notification_email text,
  ADD COLUMN IF NOT EXISTS notification_phone text,
  ADD COLUMN IF NOT EXISTS notification_method text not null default 'email'; -- 'email' | 'sms' | 'whatsapp'

-- Sponsor applications (businesses applying to be listed)
CREATE TABLE IF NOT EXISTS sponsor_applications (
  id            uuid primary key default gen_random_uuid(),
  business_name text not null,
  category      text not null,
  website_url   text,
  contact_name  text not null,
  contact_email text not null,
  contact_phone text,
  notification_method text not null default 'email',
  message       text,
  status        text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at    timestamptz not null default now()
);
