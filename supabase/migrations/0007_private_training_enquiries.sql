alter table public.enquiries
  add column if not exists country text,
  add column if not exists pathway text,
  add column if not exists experience_level text,
  add column if not exists learning_goal text,
  add column if not exists city_timezone text,
  add column if not exists preferred_times text,
  add column if not exists intended_start_date date,
  add column if not exists portfolio_url text,
  add column if not exists extra_details text,
  add column if not exists consent_at timestamptz;

create index if not exists enquiries_kind_created_at_idx on public.enquiries(kind, created_at desc);

revoke insert on public.enquiries from anon, authenticated;
grant select on public.enquiries to authenticated;
