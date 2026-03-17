-- Run in Supabase SQL editor after the initial schema.sql

-- Add stripe_customer_id to profiles
alter table profiles add column if not exists stripe_customer_id text;

-- Add subscription_data metadata to subscriptions table (for webhook recording)
-- The subscriptions table already exists; this adds the stripe_price_id if missing
alter table subscriptions add column if not exists stripe_price_id text;
