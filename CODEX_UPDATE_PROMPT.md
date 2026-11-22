# CODEX UPDATE INSTRUCTIONS — DATASPHERE ACADEMY

## Purpose
Update the EXISTING Datasphere Academy website in this repository using the supplied real assets. **Do not create a new website**, discard prior functionality, or build another static design mockup. Review the existing React app, routes, course records, payment flow, and admin management first; adapt the current components/data. No fictitious instructors, achievements, ratings, or testimonials.

## Asset installation
This ZIP has an actual `public/` directory; merge it into the repository's `public/` folder. Assets must load from root-relative URLs. Refer to `asset-manifest.json` for paths. Do not assume any images posted in ChatGPT are accessible in this codebase except these packaged files.

Course artwork (use actual bundled files):
- Data Analytics → `/images/courses/data-analytics.jpg`
- Data Science → `/images/courses/data-science.jpg`
- Data Engineering → `/images/courses/data-engineering.png`
- AI Engineering → `/images/courses/ai-engineering.jpg`
- AI Automation & Agent Development → `/images/courses/ai-automation.jpg`

Brand: `/brand/datasphere-academy-logo.jpg` (the source has a white background; do not stretch or replace with fake lettering).

Founder portrait: `/images/instructors/ammar-jubril-profile.jpg` (square crop of user's provided photo) or `/images/instructors/ammar-jubril-original.jpg`. Keep the subject's appearance unchanged. **No founder spotlight on the homepage and NO founder portrait as the primary hero illustration.** The portrait belongs inside the instructor listing.

The screenshot `references/instructor-team-reference.png` is for textual names/roles only. It is not permission to reuse each pictured person's likeness as a new headshot. The eight vector placeholders in `/public/images/instructors/` are generic illustrated initials/empty states, not photos of real people.

## Rename programme
The old label "AI Agent Developer" sounds like a job title rather than a course. Proposed new public course name: **AI Automation & Agent Development**. Short display title if needed: **AI Automation**. This is an editorial recommendation, not a formally confirmed rename; make the name admin-editable so it can be changed without code. Course description: "Build AI-powered workflows, integrate LLMs and APIs, and develop practical intelligent agents using n8n and Python." Keep 8 weeks, ₦60,000, and next cohort 9 January 2027. Preserve old existing route `/courses/ai-agent-developer` using an alias or redirect to avoid breaking bookmarks and existing applications. Preserve all database references and application history.

## Other course facts (never let image mockup text overwrite business facts)
- Data Analytics: 12 weeks; standard ₦120,000; one-time ₦100,000 OR installments ₦60,000 + ₦60,000; cohort 17 January 2027.
- Data Science: 12 weeks; same pricing; next date TBA.
- Data Engineering: 12 weeks; same pricing; next date TBA.
- AI Engineering: **14 weeks**; same pricing; next date TBA.
- AI Automation & Agent Development: **8 weeks**; ₦60,000; cohort **9 January 2027**.
- Saturday 10:00 AM–1:00 PM WAT; Sunday **4:00 PM–6:30 PM WAT**.
- The academy currently imposes no maximum cohort capacity. Never fabricate a seats-left counter.
- Do not stack a separate early-bird discount with the ₦100,000 one-time price unless explicitly configured and approved.
- Avoid false social proof: do not use the generated mockup's "5,000+ learners", ratings, fabricated testimonials, or invented alumni portraits. The provided business history supports 100+ learners; do not misrepresent other counts.

## Instructor section
Create a professional responsive instructor grid (not a standalone founder feature). The first card uses the real cropped portrait and name **Ammar Jubril**, role **Founder & Lead Instructor**. Keep his biography accurate and concise; don't claim his pending degree is completed.

Extract these names from the Academy-provided team-reference screenshot as candidate existing tutors:
- Chimobi Maxwell — Data Scientist and BI Developer
- Tobiloba Odukunle — Data Scientist and BI Developer
- Teslim Olagoke — Machine Learning Engineer
- Sodiq Adesina — Data Engineer
- Agbons Ekata — Data Scientist and BI Developer

Roles are transcribed from the screenshot and should remain editable. For their images, use the corresponding neutral SVG placeholders in the ZIP until actual verified photos are supplied. There are **three additional unnamed placeholder slots**, for a total of **eight additional potential instructors plus Ammar**. These three must show neutral wording, such as "More industry experts", not fabricated full names, credentials, or portrait images. Do not make unverified profiles fully public as actual instructors automatically. If a richer grid is important for layout, show visibly labeled "Profile coming soon" on unpublished slots, preferably after the confirmed names, or only show the verified subset on the public page and keep other slots inside admin.

Allow admins to add/edit/replace portraits, biographies, roles, courses and publication statuses. Ensure image aspect ratios are consistent and faces aren't awkwardly cropped. Do not use the composite AI-generated mockup as an instructor photo source.

## Hero and page visual direction
Deliver the previous premium hybrid design: navy/cyan/white, bold meaningful typography, layered tech imagery and strong composition. Do NOT prominently feature the founder in hero. Use relevant technology/AI artwork, a curated course-image montage, subtle gradients and technical patterns. Make all course cards visually rich with the bundled course imagery, consistent proportions and clear course details. Place genuine technology logos appropriately (Python, Excel, Power BI, n8n, PostgreSQL/SQL label, Pandas, NumPy, Airflow, dbt etc). Obtain legitimate icon assets via suitable libraries such as Simple Icons or official brand sources, not untrusted broken remote image links. Distinguish technology taught from corporate endorsement.

Landing-page order: hero, relevant tool strip, courses, upcoming cohorts, learning experience, real instructor grid, one genuine testimonial, practical project examples, FAQs, contact/CTA and footer. This is visual refinement of the existing application; all navigation, registration, bank transfer payment submission, admin functions, and mobile behaviors must continue working.

Testimonial: Sherifdeen Oloye, Data Scientist, United Kingdom. Use the exact testimonial already provided in the prior specification (do not invent a replacement). Do not use a generated person's headshot for him. If no approved photo exists, design the card without one. Confirm permission before publishing.

## Required implementation work
1. Inspect source files, route mapping, course data seed and database schemas.
2. Copy/update the packaged assets into `public/`.
3. Map course images to all corresponding course cards and detail pages.
4. Update course title, slug alias and related labels without losing applications/payment history.
5. Remove founder portrait as hero/founder showcase; use actual portrait only in instructor grid.
6. Implement instructor profile/grid data using five candidate names + Ammar + three unnamed slots as specified, with neutral SVG placeholders and admin publication controls.
7. Use official technology logos with accurate brand labeling; avoid unsupported logos.
8. Confirm payment pricing and actual cohort dates/times in UI against this prompt.
9. Maintain SEO titles and navigation links after course rename.
10. Test responsive layout at 375, 768, 1440px; test images, links, registration flow, bank transfer upload, admin editing and production build.

## Acceptance criteria
- All five course artworks load correctly from bundled local assets.
- AI Automation & Agent Development replaces the old label consistently; legacy links keep working.
- Founder isn't featured as hero; real supplied portrait appears in his instructor card.
- Eight additional placeholder slots are supported without pretending fictional tutors are verified.
- Correct fees, 14-week AI Engineering duration, January dates, and WAT Sunday timing appear.
- No invented review rating, student totals, partners, job placement claim, or instructor photo.
- No broken mobile layouts, image paths, forms or payment behaviors.
- Show changed files, build/test results, and any missing dependencies/permissions.

Proceed by editing the existing repository, not creating a parallel site.
