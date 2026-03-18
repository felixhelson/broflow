-- Allow 'fulfilled' as an order status (no constraint change needed if using text)
-- Add index for faster admin queries
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_at_idx on orders(created_at desc);
