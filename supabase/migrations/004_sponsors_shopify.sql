alter table sponsors
  add column if not exists shopify_domain text,
  add column if not exists shopify_access_token text;
