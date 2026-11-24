alter table public.applications add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists applications_user_id_idx on public.applications(user_id);
