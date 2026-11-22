create extension if not exists pgcrypto;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  summary text not null, description text not null, duration_weeks integer not null check (duration_weeks > 0),
  level text not null, standard_fee_minor integer not null check (standard_fee_minor >= 0),
  published boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
  start_date date, timezone text not null default 'Africa/Lagos', saturday_time text, sunday_time text,
  status text not null default 'upcoming' check (status in ('upcoming','enrolling','in_progress','completed')),
  registration_open date, registration_close date, created_at timestamptz not null default now()
);
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(), reference text unique not null,
  course_id uuid not null references public.courses(id), cohort_id uuid references public.cohorts(id),
  first_name text not null, last_name text not null, email text not null, phone text, whatsapp text,
  country text, city_state text, occupation text, experience_level text, laptop_os text,
  payment_option text not null, application_status text not null default 'received',
  consent_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create table if not exists public.payment_plans (
  id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
  name text not null, amount_minor integer not null check (amount_minor >= 0), installments integer not null default 1,
  active boolean not null default true
);
create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id) on delete cascade,
  plan_id uuid references public.payment_plans(id), amount_minor integer not null check (amount_minor >= 0),
  status text not null default 'pending' check (status in ('pending','submitted','verified','rejected','refunded')),
  provider text not null default 'bank_transfer', provider_reference text, verified_by uuid, verified_at timestamptz,
  created_at timestamptz not null default now(), unique(provider, provider_reference)
);
create table if not exists public.bank_transfer_submissions (
  id uuid primary key default gen_random_uuid(), payment_transaction_id uuid not null references public.payment_transactions(id) on delete cascade,
  transaction_reference text, receipt_path text, review_status text not null default 'pending' check (review_status in ('pending','approved','rejected','needs_info')),
  review_note text, submitted_at timestamptz not null default now(), reviewed_at timestamptz
);
create table if not exists public.instructors (id uuid primary key default gen_random_uuid(), display_name text not null, role text, bio text, verified boolean not null default false, published boolean not null default false, created_at timestamptz not null default now());
create table if not exists public.testimonials (id uuid primary key default gen_random_uuid(), name text not null, professional_title text, course_attended text, body text not null, permission_confirmed boolean not null default false, published boolean not null default false, display_order integer not null default 0, created_at timestamptz not null default now());
create table if not exists public.enquiries (id uuid primary key default gen_random_uuid(), kind text not null, name text not null, email text, whatsapp text, message text, status text not null default 'new', created_at timestamptz not null default now());
create table if not exists public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade, role text not null default 'admin' check (role in ('admin','editor','finance')), created_at timestamptz not null default now());
create table if not exists public.admin_audit_logs (id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id), action text not null, entity_type text not null, entity_id uuid, metadata jsonb, created_at timestamptz not null default now());

create index if not exists applications_reference_idx on public.applications(reference);
create index if not exists applications_email_idx on public.applications(email);
create index if not exists payment_transactions_status_idx on public.payment_transactions(status);
create index if not exists cohorts_course_status_idx on public.cohorts(course_id, status);

alter table public.courses enable row level security; alter table public.cohorts enable row level security;
alter table public.applications enable row level security; alter table public.payment_transactions enable row level security;
alter table public.bank_transfer_submissions enable row level security; alter table public.instructors enable row level security;
alter table public.testimonials enable row level security; alter table public.enquiries enable row level security;
alter table public.admin_users enable row level security; alter table public.admin_audit_logs enable row level security;

create or replace function public.is_admin() returns boolean language sql security definer set search_path = public as $$ select exists(select 1 from public.admin_users where user_id = auth.uid()); $$;
create policy "published courses are public" on public.courses for select using (published = true or public.is_admin());
create policy "public cohorts are visible" on public.cohorts for select using (true);
create policy "admins manage applications" on public.applications for all using (public.is_admin()) with check (public.is_admin());
create policy "public can submit applications" on public.applications for insert with check (true);
create policy "admins manage payments" on public.payment_transactions for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage transfer evidence" on public.bank_transfer_submissions for all using (public.is_admin()) with check (public.is_admin());
create policy "verified instructors are public" on public.instructors for select using ((published = true and verified = true) or public.is_admin());
create policy "approved testimonials are public" on public.testimonials for select using ((published = true and permission_confirmed = true) or public.is_admin());
create policy "public can submit enquiries" on public.enquiries for insert with check (true);
create policy "admins manage enquiries" on public.enquiries for select using (public.is_admin());
create policy "admins manage admin users" on public.admin_users for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read audit logs" on public.admin_audit_logs for select using (public.is_admin());

insert into public.instructors (display_name, role, bio, verified, published) values ('Ammar Jubril', 'Founder, Datasphere Academy', 'Data analytics, data science, financial technology, business intelligence, and technology consulting.', true, true) on conflict do nothing;
insert into public.testimonials (name, professional_title, body, permission_confirmed, published, display_order) values ('Sherifdeen Oloye', 'Data Scientist, United Kingdom', 'I learned the foundations of Data Science and Analytics at Datasphere Academy. The training was rigorous, practical, and delivered by industry experts. It provided a strong foundation that I have continued to build upon since relocating to the UK. The knowledge and skills I gained have been invaluable in my professional journey.', false, false, 1) on conflict do nothing;

insert into public.courses (slug, title, summary, description, duration_weeks, level, standard_fee_minor, published) values
('data-analytics', 'Data Analytics', 'Turn complex data into clear business decisions.', 'Practical analytics across Excel, SQL, Power BI and Python.', 12, 'Beginner', 12000000, true),
('data-science', 'Data Science', 'Move from questions to predictive insight.', 'Statistics, machine learning and model interpretation through practical case studies.', 12, 'Beginner', 12000000, true),
('data-engineering', 'Data Engineering', 'Design reliable systems that move and power data.', 'Modern data platforms from ingestion to warehouse.', 12, 'Beginner', 12000000, true),
('ai-engineering', 'AI Engineering', 'Build useful AI applications responsibly.', 'Machine learning foundations, LLM applications, evaluation and deployment.', 14, 'Beginner', 12000000, true),
('ai-agent-developer', 'AI Agent Developer', 'Build LLM apps, AI agents and intelligent automations.', 'n8n, Python and APIs with a focus on reliability and safe automation.', 8, 'Beginner', 6000000, true)
on conflict (slug) do update set title = excluded.title, summary = excluded.summary, description = excluded.description, duration_weeks = excluded.duration_weeks, standard_fee_minor = excluded.standard_fee_minor, published = excluded.published;

insert into public.cohorts (course_id, start_date, status, saturday_time, sunday_time)
select id, case slug when 'data-analytics' then '2027-01-17'::date when 'ai-agent-developer' then '2027-01-09'::date else null end, 'upcoming', '10:00–13:00', '16:00–18:30' from public.courses
on conflict do nothing;
