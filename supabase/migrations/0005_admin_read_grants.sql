-- RLS policies decide which admin rows are visible, while these grants allow
-- the authenticated role to issue the read/update statements in the first place.
grant select on public.applications, public.payment_transactions, public.bank_transfer_submissions, public.courses to authenticated;
grant update on public.applications, public.payment_transactions, public.bank_transfer_submissions to authenticated;
grant select on public.admin_users to authenticated;
