# Datasphere Academy

Production-oriented React + TypeScript + Vite website for Datasphere Academy.

## Local development

```bash
npm install
npm run dev
```

## Included in this first release

- Responsive branded public website with Home, About, Courses, Course Detail, Instructors, Cohorts, Private Training, Contact, FAQs, policy pages and Admin preview routes.
- Accurate five-course catalogue, approved pricing, cohort dates, weekend schedule and Nigerian time-zone context.
- Working application → reference → bank instructions → payment status flow.
- Added `/projects` and `/success-stories` with explicit no-fabrication handling for unapproved alumni content.
- Official supplied logo under `public/brand/`.
- Supabase migration with normalized course, cohort, application, payment, bank evidence, instructor, testimonial, enquiry and admin audit tables plus RLS policies.
- Cloudflare Pages SPA fallback via `public/_redirects`.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/0001_initial_schema.sql` in the SQL editor or via the Supabase CLI.
3. Create an administrator in Supabase Auth, then insert their UUID into `public.admin_users` with an approved role.
4. Add server-side Edge Functions for receipt upload signing, payment verification and transactional email before production launch.

Copy `.env.example` to `.env.local` and add the Supabase project URL and anon key for the next integration phase. The public app remains usable without those values for content review.

## Required production configuration

Configure Supabase URL/anon key through a typed client module, transactional email provider, private Storage bucket for receipts, rate limiting, analytics consent, and optional Paystack credentials only in server-side secrets. Paystack remains intentionally unconfigured and must not be enabled until credentials and webhook verification are in place.

## Deployment

Build with `npm run build` and deploy `dist/` to Cloudflare Pages. Add the custom domain only after DNS ownership is confirmed. The app is currently designed to be safe to preview without external credentials; form submission is client-side demo behavior until the Supabase API wiring is enabled.
