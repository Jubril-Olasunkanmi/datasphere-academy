grant usage on schema public to anon, authenticated, service_role;

grant select on public.courses, public.cohorts, public.instructors, public.testimonials to anon, authenticated;
grant insert on public.applications, public.enquiries to anon, authenticated;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
