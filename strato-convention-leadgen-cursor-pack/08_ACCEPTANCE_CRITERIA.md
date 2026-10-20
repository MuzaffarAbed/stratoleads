# Acceptance Criteria

## Lead form
- [ ] All six base fields are present: Name, Surname, Company Name, Cell Number, Email Address, Product Interest.
- [ ] Product options are exactly STRATOPOD, STRATOPOD GO, STRATOWM, STRATOOB, Other.
- [ ] Comment is optional for the four named products.
- [ ] Comment is required for Other, including whitespace-only values being rejected.
- [ ] Valid submission reaches server API and server revalidates every field.
- [ ] One accepted submission creates one lead row with timestamp and submission ID.
- [ ] Configured STRATO recipient(s) receive the notification email.
- [ ] Double click cannot create duplicate submissions under normal conditions.
- [ ] Integration errors do not display false success.
- [ ] Form is usable on a narrow phone without horizontal scrolling.

## Digital cards
- [ ] Separate `/business-cards` page exists.
- [ ] Each active employee has a distinct slug and public page.
- [ ] Add to contacts downloads a valid `.vcf` with the correct employee details.
- [ ] QR code encodes the canonical public URL.
- [ ] Missing optional details do not create empty buttons.
- [ ] Inactive cards are hidden from the directory and direct route.
- [ ] Admin can create/edit/publish/deactivate cards without editing code.
- [ ] Admin endpoints reject unauthenticated calls.

## Quality/security
- [ ] No secrets in client bundle or public API responses.
- [ ] Google Sheet remains private.
- [ ] Server-side validation, rate limiting, and basic abuse protection are present.
- [ ] Privacy notice is linked and approved before production.
- [ ] Lint, typecheck, tests, and production build pass.
- [ ] Setup, integration, deployment, and convention-day test instructions are complete.
