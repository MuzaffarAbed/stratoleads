# Cursor Implementation Phases

Implement one phase at a time. After each phase, run lint, typecheck, tests, and inspect the app in a browser. Keep changes focused and avoid rewriting completed phases without a reason.

## Phase 1 — Project foundation
- Create Next.js App Router TypeScript project.
- Configure Tailwind, strict TypeScript, linting, test runner, global styles, and design tokens.
- Add `.env.example`, README setup, and initial shared components.
- Confirm app starts locally and routes render.

**Done when:** clean install, lint, typecheck, and build pass.

## Phase 2 — Lead capture UI
- Build responsive branded landing page and accessible form.
- Add exact product options and conditional Comment requirement for `Other`.
- Add validation, error summary/focus behaviour, pending state, success state, and retry state.
- Add hidden honeypot and client double-submit guard.
- At this phase, use a typed mock server response only if clearly marked development-only; never claim real leads are being saved.

**Done when:** desktop/mobile design is polished and all form states are testable.

## Phase 3 — Apps Script integration
- Implement `/api/leads`, server schema validation, idempotency handling, and server-only Apps Script client.
- Write Apps Script source and setup instructions in a separate `google-apps-script/` directory.
- Implement `createLead`, append to `Leads`, and email notification.
- Ensure API returns success only when processing outcome is known.

**Done when:** end-to-end test adds one row and sends an email; failure cases are handled without exposing secrets.

## Phase 4 — Public digital cards
- Build `/business-cards` and `/business-cards/[slug]`.
- Implement typed card model, safe public endpoints/server helpers, valid vCard generation/download, QR code, copy/share, and optional contact actions.
- Hide inactive cards from public routes.
- Add good empty/unavailable states.

**Done when:** two test employees can have different cards and each vCard contains the correct details.

## Phase 5 — Protected card administration
- Implement secure login/session, admin guard, and authorized API proxy.
- Add list, create, edit, preview, activate/deactivate, copy link, QR download, and validation.
- Persist records to `BusinessCards` through Apps Script.
- Verify every API operation rejects unauthenticated requests.

**Done when:** staff cards can be configured without code edits, and unauthorized access is denied server-side.

## Phase 6 — Hardening and release
- Add security headers, rate limiting, CSRF protection where applicable, metadata, privacy notice placeholder, and robots rules.
- Add unit/integration tests.
- Test keyboard and screen-reader basics.
- Test Android Chrome and iOS Safari on actual phones.
- Verify production URL is used in QR codes.
- Run deployment checklist and convention-day checklist.

**Done when:** lint, typecheck, tests, and production build pass; live sheet/email tested; admin secrets not exposed.

## Convention-day manual test
- [ ] Open the QR URL on iOS and Android.
- [ ] Submit each product option once.
- [ ] Submit `Other` with empty comment (must fail).
- [ ] Submit `Other` with comment (must succeed).
- [ ] Confirm a row appears in the correct sheet and email reaches recipients.
- [ ] Simulate network failure and confirm the visitor sees an error and can retry.
- [ ] Open each staff card from its QR code.
- [ ] Add each staff member to phone contacts and inspect the saved values.
- [ ] Confirm inactive cards do not appear publicly.
- [ ] Try opening admin endpoints while signed out (must be denied).
- [ ] Confirm no secrets appear in browser devtools/network responses.
