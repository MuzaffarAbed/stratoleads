# Deployment

The site needs a Node.js host that can run Next.js route handlers. Vercel is a suitable option. Any host that supports `next build` and `next start` is also suitable.

## Before the production build

Set these in the host's environment, not in the repository:

- `NEXT_PUBLIC_SITE_URL` — the public `https` origin visitors and QR codes will use. Change it and rebuild before printing QR codes. The admin screen warns when this value is still a local address.
- `LEAD_CAPTURE_ENABLED=true` — only on the deployment that should write real leads.
- `GOOGLE_APPS_SCRIPT_URL` — the Apps Script `/exec` URL.
- `GOOGLE_APPS_SCRIPT_SHARED_SECRET` — the same value as the script property `SHARED_SECRET`.
- `ADMIN_PASSWORD_HASH` — from `npm run hash-admin-password`.
- `ADMIN_SESSION_SECRET` — at least 32 random characters.
- `LEAD_SOURCE` — for example `STRATO Convention`.

Preview deployments must use a different sheet, secret, and recipient list, or leave `LEAD_CAPTURE_ENABLED` unset. `NEXT_PUBLIC_*` variables are visible in the browser. Do not put secrets in them.

## Release checks

1. `npm run lint`
2. `npm run typecheck`
3. `npm test`
4. `npm run build`
5. Open the deployed home page on a phone-width browser.
6. Submit one disposable lead and confirm one new row in the `Leads` tab. Confirm that no email is sent.
7. Sign in to `/admin/business-cards`, publish two cards, and open each public URL.
8. Download a vCard and a QR code. Confirm the QR opens the public card URL, not localhost.
9. Deactivate one card and confirm it disappears from `/business-cards` and its direct URL.
10. Sign out and confirm `GET /api/business-cards` returns 401.
11. Replace the draft privacy notice with STRATO-approved wording before the booth opens.
12. Confirm the Google Sheet is still private.

Security headers are set in `next.config.ts`. The production build also sends a content security policy. Administrator pages send `X-Robots-Tag: noindex`.

## Brand assets

The header is a text wordmark, and `app/icon.svg` is a placeholder monogram. Replace both with approved STRATO logo files when they are supplied. Do not add customer logos, testimonials, or statistics that are not on the approved site.
