# Cursor Master Prompt

Build a production-quality STRATO IT Group convention lead-generation website using Next.js App Router and TypeScript. Follow every requirement in this pack, especially `01_PRODUCT_REQUIREMENTS.md`, `02_UI_UX_SPEC.md`, `03_ARCHITECTURE.md`, `04_GOOGLE_SHEETS_AND_EMAIL.md`, `05_SECURITY_PRIVACY.md`, and `06_IMPLEMENTATION_PHASES.md`.

## Product outcome
A fast, mobile-first convention kiosk/QR landing page that captures qualified business leads for STRATO products and notifies the STRATO team. Include a separate digital business card experience where visitors can save a specific STRATO employee's contact details to their phone. Company staff must be able to create, edit, activate/deactivate, and preview multiple staff cards through a protected admin interface.

## Required stack
- Next.js App Router, current stable version supported by the project environment
- TypeScript with strict mode
- Tailwind CSS
- Accessible, reusable React components
- Zod (or equivalent) for server and client validation
- Google Apps Script Web App as a no-paid-API integration layer for Google Sheets and email
- Use `fetch` from server-side route handlers to call Apps Script
- No database other than the agreed Google Sheets persistence for this initial convention MVP
- Do not use Next.js Pages Router

## Required routes
- `/` — lead capture landing page and form
- `/business-cards` — digital business card directory/entry page
- `/business-cards/[slug]` — individual shareable digital card
- `/admin/business-cards` — protected card-management interface
- `/api/leads` — server-only lead submission endpoint
- `/api/business-cards` and `/api/business-cards/[id]` — server-only card CRUD proxy endpoints
- `/api/admin/session` — protected admin sign-in/sign-out/session route, using secure HTTP-only cookies

## Lead form fields
- Name — required
- Surname — required
- Company Name — required
- Cell Number — required; preserve international prefixes and normalize whitespace
- Email Address — required and valid
- Product Interest — required dropdown with exactly:
  - STRATOPOD
  - STRATOPOD GO
  - STRATOWM
  - STRATOOB
  - Other
- Comment — optional except when Product Interest is `Other`, in which case it is required and must contain meaningful non-whitespace text
- Confirm button
- Accessible validation errors and an explicit success state
- Prevent accidental double submissions; show loading state and preserve the form after an error
- On successful server acceptance, append to Google Sheets and send an email notification to the configured STRATO recipient(s)

## Business card requirements
- Public cards have a stable slug and individual shareable URL.
- Each card supports: first name, surname, job title, company, work email, mobile phone, optional office phone, optional website, optional LinkedIn URL, optional location, optional profile image URL, and active/inactive state.
- Add a prominent “Add to contacts” action. Generate a valid `.vcf` vCard download for the selected person. Do not merely open a `tel:` or `mailto:` link and call it a saved contact.
- Provide a QR code for the individual's card URL; it must encode the canonical deployed URL, not localhost.
- Directory shows only active cards. Direct visits to inactive/unpublished cards should show a clean unavailable state.
- Admin UI must support create/edit, activate/deactivate, preview, copy public link, and download/print a QR code.
- Protect admin APIs on the server. Do not rely on hiding admin UI alone.
- Admin password/session secrets must never be exposed to client bundles. Use HTTP-only, Secure-in-production, SameSite cookies and a signed/verified session or equivalent robust approach. Rate-limit sign-in attempts where practical.
- Do not provide public write access to the business-card data source.

## Brand and UX
Use the STRATO IT Group website supplied by the user as visual reference: `https://stratoitgroup.ahvashen.com/`. The site presents STRATO as an established enterprise technology and business-systems company, with consulting, SAP integration, mobile business applications, and logistics/warehouse/order-capture products. Preserve that credible, enterprise feel.
- Visual direction: premium, restrained, professional; dark navy/near-black, white/off-white, warm gold accent, neutral greys; use Saira if legally/technically available, with a sensible sans-serif fallback.
- Gold should be an accent, not a large background everywhere.
- Clear hierarchy, generous whitespace, large touch targets, high contrast, polished form controls, responsive layout.
- Design for people standing at a convention and using their phone: minimal friction, no unnecessary account creation, form usable one-handed.
- No fake testimonials, client logos, metrics, product claims, or employee details.
- Do not invent the official logo. Use provided approved assets if present, otherwise create a simple replaceable text wordmark.

## Engineering quality
- Keep API secrets server-side and validate all inputs on the server.
- Use environment variables, not hardcoded endpoints, passwords, recipient emails, or secrets.
- Include loading, success, empty, error, and unavailable states.
- Include unit/integration tests for validation, Other-comment requirement, API failure, duplicate submission guard, vCard output, card visibility, and admin authorization.
- Add a useful `.env.example`, setup documentation, deployment instructions, and a manual convention-day test checklist.
- Run lint, typecheck, and tests. Fix errors rather than suppressing them.
- Keep components small and focused. Avoid giant page components.
- Do not add a paid API dependency. Prefer free/native approaches.
