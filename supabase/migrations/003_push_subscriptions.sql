create table if not exists push_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  subscription text not null,
  created_at timestamptz default now()
);
