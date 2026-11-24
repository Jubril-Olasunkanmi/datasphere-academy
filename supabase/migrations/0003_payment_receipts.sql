insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', false)
on conflict (id) do update set public = excluded.public;

create policy "admins can read payment receipts" on storage.objects for select using (bucket_id = 'payment-receipts' and public.is_admin());
