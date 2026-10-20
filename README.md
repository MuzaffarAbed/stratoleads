# STRATO Convention Lead Generation

Mobile-first convention site for STRATO IT Group. Visitors submit a product enquiry and can save a staff member's digital business card. Leads are stored in a private Google Sheet through Google Apps Script. Notification email is not used.

The specification pack in `strato-convention-leadgen-cursor-pack/` is the source of truth for product behaviour.

## Stack

- Next.js App Router, TypeScript strict mode, Tailwind CSS
- Zod validation on the browser and the server
- Google Apps Script for Google Sheets
- Native vCard downloads and QR codes
- Vitest

No separate database, paid email API, or paid Google API is used.

## Local setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`
3. Generate an admin password hash: `npm run hash-admin-password -- "a-long-password"`
4. Put that hash in `ADMIN_PASSWORD_HASH`
5. Set `ADMIN_SESSION_SECRET` to a random string of at least 32 characters
6. Deploy the Apps Script in `google-apps-script/` and set `GOOGLE_APPS_SCRIPT_URL` and `GOOGLE_APPS_SCRIPT_SHARED_SECRET`
7. Set `LEAD_CAPTURE_ENABLED=true` only when the script points at the sheet and recipients you intend to use
8. Set `NEXT_PUBLIC_SITE_URL` to the public origin. QR codes use this value, so a production build must be created with the real URL
9. Start the site: `npm run dev`

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## What is not live until you configure it

The form, card directory, and admin screens run without Google credentials, but they will not report a successful lead or show staff cards until Apps Script is deployed and the environment variables above are set. Do not point a preview deployment at the production sheet or recipient list.

End-to-end proof still required after configuration:

- One lead row appears in the `Leads` tab, and no email is sent
- Two active cards can be created in the admin UI, opened from their public URLs, and saved as vCards
- An inactive card stays off the public directory
- Signed-out calls to the admin APIs are rejected

## Routes

- `/` lead capture
- `/business-cards` public directory of active cards
- `/business-cards/[slug]` individual card, vCard, and QR download
- `/admin/business-cards` protected card manager
- `/privacy` draft privacy notice
- `/api/leads`, `/api/business-cards`, `/api/admin/session`

## Duplicate submissions

The browser keeps one submission ID for the form. Apps Script appends a `Leads` row only when that ID is new. A repeated ID returns success and does not add another row. The visitor sees success only after Apps Script confirms `leadSaved: true`.

## Documentation

- `google-apps-script/README.md` — sheet, script properties, and deployment
- `docs/DEPLOYMENT.md` — hosting checklist
- `docs/CONVENTION_DAY.md` — manual test checklists
