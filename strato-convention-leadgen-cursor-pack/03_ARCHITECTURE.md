# Technical Architecture

## 1. Application
- Next.js App Router + TypeScript strict mode + Tailwind CSS.
- Use Server Components by default; Client Components only for interactive forms, admin workflows, and QR UI.
- Route handlers own all integration calls.
- Zod schemas shared where appropriate between client and server, with server validation authoritative.

## 2. Route map
- `app/page.tsx` — lead capture landing page
- `app/business-cards/page.tsx` — active staff card directory
- `app/business-cards/[slug]/page.tsx` — public card
- `app/admin/business-cards/page.tsx` — protected admin manager
- `app/api/leads/route.ts` — validate and forward lead
- `app/api/business-cards/route.ts` — authorized list/create proxy
- `app/api/business-cards/[id]/route.ts` — authorized update/deactivate proxy
- `app/api/admin/session/route.ts` — sign-in/sign-out/session handling
- `app/api/business-cards/public/route.ts` (or equivalent) — safe public active-card list
- `app/api/business-cards/public/[slug]/route.ts` (or server data helper) — safe public card lookup

Keep route design coherent and avoid duplicate route patterns if Server Components can call a server-side service directly.

## 3. Suggested structure
```text
app/
  page.tsx
  business-cards/
    page.tsx
    [slug]/page.tsx
  admin/
    business-cards/page.tsx
  api/
    leads/route.ts
    business-cards/route.ts
    business-cards/[id]/route.ts
    admin/session/route.ts
components/
  brand/
  lead-form/
  business-cards/
  admin/
  ui/
lib/
  validation/
  integrations/google-apps-script.ts
  security/admin-session.ts
  vcard.ts
  qr.ts
  utils.ts
types/
  lead.ts
  business-card.ts
tests/
.cursor/rules/
```

## 4. Data flow — leads
1. Browser posts to `/api/leads`.
2. Route validates and normalizes payload; reject malformed input.
3. Route applies basic rate limiting / honeypot checks without relying on them as the only defence.
4. Route sends a server-to-server request to Apps Script using a secret stored only in environment variables.
5. Apps Script validates a shared secret, appends one row to `Leads`, then sends an email notification.
6. API returns success only after Apps Script confirms success.
7. If Sheets succeeds but email fails, Apps Script should report the partial outcome clearly and log it; define retry/idempotency behaviour so visitors are not encouraged to create duplicates.

## 5. Data flow — business cards
- Public requests receive only active, approved card fields.
- Admin requests require a valid server-verified session before proxying CRUD operations.
- Admin API proxies requests to Apps Script; browser never receives the Apps Script shared secret.
- Apps Script operations validate and sanitize values and require the shared secret.
- Do not accept a public `isActive: true` update without admin authorization.
- Keep card IDs stable and slugs unique.

## 6. Persistence
Google Sheets is the lightweight MVP store:
- `Leads` tab: one row per submission.
- `BusinessCards` tab: staff card records.
- Optional `SystemLog` tab for integration/admin operation outcomes without sensitive payloads.
The sheet must be owned by an appropriate STRATO-managed Google account, not a personal employee account. Restrict sharing to authorized staff.

## 7. API contracts
### POST `/api/leads`
Request JSON:
```json
{
  "name": "Example",
  "surname": "Person",
  "companyName": "Example Ltd",
  "cellNumber": "+27...",
  "emailAddress": "person@example.com",
  "productInterest": "STRATOPOD",
  "comment": ""
}
```
Success: `{ "ok": true, "message": "Lead submitted" }`
Failure: `{ "ok": false, "message": "We could not submit your details. Please try again." }`
Do not return integration URLs, secrets, stack traces, or raw provider errors.

### Business card data
Use typed, validated objects. Keep internal fields such as spreadsheet row numbers and admin audit metadata off public responses. Validate URLs as HTTPS where appropriate; phone/email values must be escaped before rendering into links or vCards.

## 8. Runtime and deployment
- Requires a Node.js-compatible host for Next.js route handlers.
- Vercel is a convenient option, but not mandatory.
- Configure all environment variables in hosting settings.
- Add a canonical base URL environment variable for QR codes and public card links.
- Preview deployments must not send convention leads to production recipients unless explicitly configured.
