# Security and Privacy Requirements

## Lead capture
- Server-side schema validation is mandatory; browser validation is UX only.
- Trim strings, cap lengths, reject unexpected product values, and require a non-empty comment for `Other`.
- Add a hidden honeypot and modest rate limiting. Do not block legitimate convention traffic with aggressive limits.
- Generate a server-side submission ID or use a client-generated idempotency key validated by the server.
- Never log full lead payloads or secrets in application logs.
- Return generic integration errors to visitors; log safe diagnostic metadata server-side.

## Admin
- Admin API authorization is required on every read/write request.
- Use a robust session cookie: `HttpOnly`, `SameSite=Lax` or stricter, `Secure` in production, sensible expiry, and cryptographic signature/verification.
- Hash admin credentials with a suitable password hashing method; never store plaintext credentials in source control.
- Rate-limit failed login attempts and avoid account-existence leaks.
- Protect state-changing actions against CSRF as appropriate for the chosen session design.
- Add `noindex` metadata and `X-Robots-Tag: noindex` for admin pages.
- Do not trust client-provided role, card status, or ID values without server checks.
- Admin secrets and Apps Script shared secret must never be in `NEXT_PUBLIC_*` variables.

## Google Apps Script
- Keep the spreadsheet private.
- Use Script Properties for integration secret and notification recipients.
- Validate the operation allowlist and each input field.
- Avoid returning leads from any public operation.
- Public card operations return active card fields only.
- Admin operations must require a server-held shared secret; do not accept admin operations from the public browser directly.
- Keep a minimal safe operational log without secrets or unnecessary personal data.

## Privacy / South Africa
- Ask STRATO to approve the privacy notice and lawful basis/purpose wording before launch.
- State the purpose clearly (responding to the visitor's product enquiry).
- Collect only fields requested for that purpose.
- Define who can access leads, how long they are retained, and how deletion/correction requests are handled.
- Consider POPIA obligations and consult STRATO's responsible privacy/legal contact. This pack is implementation guidance, not legal advice.
- Do not imply that the visitor has opted into marketing merely by submitting a request.
