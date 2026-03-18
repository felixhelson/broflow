-- ─────────────────────────────────────────────────────────────────────────────
-- Catch-up migration — run this if you started from schema.sql
-- Adds everything added via incremental migrations 001–006
-- ─────────────────────────────────────────────────────────────────────────────

-- profiles: add stripe_customer_id
alter table profiles
  add column if not exists stripe_customer_id text;

-- sponsors: add notification + shopify fields
alter table sponsors
  add column if not exists notification_email  text,
  add column if not exists notification_phone  text,
  add column if not exists notification_method text not null default 'email',
  add column if not exists shopify_domain      text,
  add column if not exists shopify_access_token text;

-- gifts: add image_url
alter table gifts
  add column if not exists image_url text;

-- sponsor_applications table
create table if not exists sponsor_applications (
  id                  uuid primary key default gen_random_uuid(),
  business_name       text not null,
  category            text not null,
  website_url         text,
  contact_name        text not null,
  contact_email       text not null,
  contact_phone       text,
  notification_method text not null default 'email',
  offers_pickup       boolean,
  message             text,
  status              text not null default 'pending',
  created_at          timestamptz not null default now()
);

-- push_subscriptions table
create table if not exists push_subscriptions (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  subscription text not null,
  created_at   timestamptz default now()
);

-- indexes for orders
create index if not exists orders_status_idx     on orders(status);
create index if not exists orders_created_at_idx on orders(created_at desc);

-- fix trigger to handle conflict on re-runs
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, first_name, profile_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'firstName', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'profileType', 'SINGLE')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
