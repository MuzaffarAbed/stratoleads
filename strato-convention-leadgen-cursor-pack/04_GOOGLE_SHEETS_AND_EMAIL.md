# Google Sheets + Email Integration (No Paid API Required)

## Recommended approach
Use a Google Apps Script Web App as a small server-side integration service. It can append to a Google Sheet and send email using the Google account's authorized Apps Script permissions. This avoids putting Google credentials in Next.js and avoids a separate paid email API.

## Google Sheet
Create a spreadsheet owned by an approved STRATO-managed Google Workspace account. Create tabs with these exact names:

### `Leads`
Recommended header row:
`SubmittedAt | SubmissionId | Name | Surname | CompanyName | CellNumber | EmailAddress | ProductInterest | Comment | Source`

### `BusinessCards`
Recommended header row:
`Id | Slug | FirstName | Surname | JobTitle | CompanyName | WorkEmail | MobilePhone | OfficePhone | Website | LinkedInUrl | Location | ProfileImageUrl | IsActive | CreatedAt | UpdatedAt`

Optional `SystemLog`:
`Timestamp | Operation | ReferenceId | Status | SafeMessage`

Restrict spreadsheet sharing to the minimum set of STRATO staff. Do not publish the spreadsheet to the web.

## Apps Script operations
Implement one `doPost(e)` handler with a JSON body and explicit operation names:
- `createLead`
- `listPublicCards`
- `getPublicCard`
- `adminListCards`
- `adminCreateCard`
- `adminUpdateCard`
- `adminDeactivateCard`

Every request must include a shared secret in the request body or a header supported by the implementation. Compare secrets server-side in constant time where practical. Since Apps Script deployment options and request headers have limitations, choose a reliable documented mechanism and never log the secret. Keep the shared secret only in Next.js server environment variables and Script Properties. Do not embed it in client-side code.

## Lead submission operation
1. Validate operation and shared secret.
2. Validate required fields and exact product option.
3. Enforce conditional comment rule for `Other`.
4. Generate or validate a submission ID to reduce duplicate rows on retries.
5. Append a row to `Leads`.
6. Send notification email to configured STRATO recipients.
7. Return a small JSON result with success/partial-failure status.

Email content should include:
- Subject: `New Convention Lead — {ProductInterest} — {CompanyName}`
- Name and surname
- Company
- Cell number
- Email
- Product interest
- Comment
- Submission timestamp and source
- Link to the internal Google Sheet only if appropriate for recipients

Treat all lead fields as untrusted input. Escape HTML in HTML emails and also provide a plain-text body. Never render user-submitted content as raw HTML.

## Email configuration
Set recipients in Apps Script Script Properties (e.g. `LEAD_NOTIFICATION_RECIPIENTS`, comma-separated, approved addresses). Do not hardcode personal employee addresses in source control. The Apps Script account must be authorized to send email, and quotas should be checked before the convention.

## Next.js environment
Example `.env.example`:
```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GOOGLE_APPS_SCRIPT_URL=
GOOGLE_APPS_SCRIPT_SHARED_SECRET=
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_SECRET=
LEAD_SOURCE=STRATO Convention
```
Use a password hash, not a plaintext admin password, if implementing password-based admin login. Use a long random session secret. Do not prefix private values with `NEXT_PUBLIC_`.

## Deployment checklist
- Deploy Apps Script as a Web App with the correct execution identity and access policy.
- Configure Script Properties and approve requested scopes.
- Test with a disposable test sheet before connecting production.
- Test lead append and email independently.
- Test failure cases: invalid secret, malformed JSON, missing required field, Other without comment, Sheets unavailable, email quota/failure, repeated submission ID.
- Verify the Apps Script URL and shared secret are only referenced by server code.
- Verify sheet access is restricted and the public web app cannot list leads.
- Set recipient email(s) before production.
- Run a real-device test using the deployed domain.
