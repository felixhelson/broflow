-- ─────────────────────────────────────────────────────────────────────────────
-- Broflow schema
-- Run this in the Supabase SQL editor (https://supabase.com/dashboard/project/_/sql)
-- ─────────────────────────────────────────────────────────────────────────────

-- Profiles (extends auth.users, created automatically on signup via trigger)
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  first_name    text,
  profile_type  text not null default 'SINGLE',
  points_balance integer not null default 0,
  created_at    timestamptz not null default now()
);

-- Partners
create table if not exists partners (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles(id) on delete cascade,
  name              text not null,
  avatar_color      text not null default '#D85A30',
  avg_cycle_length  integer not null default 28,
  avg_period_length integer not null default 5,
  last_period_start date,
  birthday          date,
  notes             text,
  created_at        timestamptz not null default now()
);

-- Cycles (period log entries)
create table if not exists cycles (
  id          uuid primary key default gen_random_uuid(),
  partner_id  uuid not null references partners(id) on delete cascade,
  start_date  date not null,
  notes       text,
  created_at  timestamptz not null default now()
);

-- Sponsors (tampon + gift sponsors)
create table if not exists sponsors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo_url    text,
  website_url text,
  type        text not null default 'gift', -- 'gift' | 'tampon'
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Gifts (product catalogue)
create table if not exists gifts (
  id          text primary key,
  name        text not null,
  emoji       text,
  description text,
  price_cents integer not null,
  category    text not null,
  sponsor_id  uuid references sponsors(id),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Orders
create table if not exists orders (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references profiles(id),
  partner_id            uuid references partners(id),
  stripe_session_id     text unique,
  stripe_subscription_id text,
  product_id            text,
  product_name          text,
  amount_cents          integer,
  charity_amount_cents  integer,
  delivery_address      jsonb,
  status                text not null default 'pending', -- pending | completed | cancelled
  is_recurring          boolean not null default false,
  created_at            timestamptz not null default now()
);

-- Points transactions ledger
create table if not exists points_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id),
  order_id    uuid references orders(id),
  amount      integer not null, -- positive = earned, negative = redeemed
  type        text not null,    -- 'earned' | 'redeemed' | 'bonus'
  description text,
  created_at  timestamptz not null default now()
);

-- Subscriptions (recurring monthly orders)
create table if not exists subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references profiles(id),
  partner_id             uuid references partners(id),
  stripe_subscription_id text unique,
  stripe_price_id        text,
  product_id             text,
  product_name           text,
  amount_cents           integer,
  delivery_address       jsonb,
  status                 text not null default 'active', -- active | cancelled | paused
  created_at             timestamptz not null default now()
);

-- ─── Trigger: create profile on signup ───────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, first_name, profile_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'firstName', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'profileType', 'SINGLE')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Helper: increment points balance atomically ─────────────────────────────
create or replace function increment_points(p_user_id uuid, p_amount integer)
returns void language plpgsql security definer as $$
begin
  update profiles set points_balance = points_balance + p_amount where id = p_user_id;
end;
$$;

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table profiles            enable row level security;
alter table partners            enable row level security;
alter table cycles              enable row level security;
alter table orders              enable row level security;
alter table points_transactions enable row level security;
alter table subscriptions       enable row level security;
alter table gifts               enable row level security;
alter table sponsors            enable row level security;

-- Profiles: users can read/update their own
create policy "own profile" on profiles for all using (auth.uid() = id);

-- Partners: users can CRUD their own
create policy "own partners" on partners for all using (auth.uid() = user_id);

-- Cycles: via partner ownership
create policy "own cycles" on cycles for all
  using (exists (select 1 from partners where partners.id = cycles.partner_id and partners.user_id = auth.uid()));

-- Orders: own orders
create policy "own orders" on orders for all using (auth.uid() = user_id);

-- Points: own transactions
create policy "own points" on points_transactions for all using (auth.uid() = user_id);

-- Subscriptions: own subscriptions
create policy "own subscriptions" on subscriptions for all using (auth.uid() = user_id);

-- Gifts + sponsors: public read
create policy "public gifts"   on gifts    for select using (true);
create policy "public sponsors" on sponsors for select using (true);
