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
4. Deploy the payment workflow after authenticating the Supabase CLI: `npx supabase login`, then `npx supabase functions deploy get-application-status --project-ref <project-ref>` and `npx supabase functions deploy review-payment --project-ref <project-ref>`.
5. Set the notification secrets in Supabase: `supabase secrets set RESEND_API_KEY=... FROM_EMAIL=... --project-ref <project-ref>`. The admin payment review screen is available at `/admin`; customers can refresh `/application/<reference>` to see the live result.
6. In Supabase, open Authentication → Providers and enable Google (and any additional providers you want to offer), then add the provider Client ID/Secret and set the production Site URL plus redirect URL to `<site-url>/`.

For phone testing, run `npm run dev` and open the Network URL shown by Vite (for example `http://10.10.6.185:5173/`) on the phone; do not use `localhost`, because on the phone that points back to the phone itself. Add that Network URL to Supabase Authentication → URL Configuration → Redirect URLs (and to the Google OAuth client if required). Set `VITE_AUTH_REDIRECT_URL` only when you need to override the current browser origin.

Copy `.env.example` to `.env.local` and add the Supabase project URL and anon key for the next integration phase. The public app remains usable without those values for content review.

## Required production configuration

Configure Supabase URL/anon key through a typed client module, transactional email provider, private Storage bucket for receipts, rate limiting, analytics consent, and optional Paystack credentials only in server-side secrets. Paystack remains intentionally unconfigured and must not be enabled until credentials and webhook verification are in place.

## Deployment

Build with `npm run build` and deploy `dist/` to Cloudflare Pages. Add the custom domain only after DNS ownership is confirmed. The app is currently designed to be safe to preview without external credentials; form submission is client-side demo behavior until the Supabase API wiring is enabled.
