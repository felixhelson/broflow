alter table sponsor_applications
  add column if not exists offers_pickup boolean;
