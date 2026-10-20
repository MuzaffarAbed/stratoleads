# Google Apps Script

This script writes the private Google Sheet. It does not send email and does not request Gmail permission. The Next.js server calls it with a shared secret. Browsers must never call this URL.

The spreadsheet is selected by the `LEADS_SHEET_URL` script property. The script does not use the active spreadsheet, so a standalone Apps Script project works as long as it runs as the Google account that can edit the sheet.

## 1. Spreadsheet

Use the existing spreadsheet with these tabs and header rows.

`Leads`

`SubmittedAt | SubmissionId | Name | Surname | CompanyName | CellNumber | EmailAddress | ProductInterest | Comment | Source`

`BusinessCards`

`Id | Slug | FirstName | Surname | JobTitle | CompanyName | WorkEmail | MobilePhone | OfficePhone | Website | LinkedInUrl | Location | ProfileImageUrl | IsActive | CreatedAt | UpdatedAt`

`SystemLog`

`Timestamp | Operation | ReferenceId | Status | SafeMessage`

Format the phone columns as Plain text. The script prefixes values that start with `=`, `+`, `-`, or `@` so Sheets stores them as text.

Do not publish the spreadsheet to the web. Share it only with the staff who need the leads.

## 2. Script properties

Project Settings → Script properties. Only these two properties are required:

| Property | Value |
|---|---|
| `SHARED_SECRET` | The same long random string as `GOOGLE_APPS_SCRIPT_SHARED_SECRET` in the Next.js server environment. |
| `LEADS_SHEET_URL` | The spreadsheet URL, including `/spreadsheets/d/{id}`. Copy it from the browser address bar. |

Do not add `LEAD_NOTIFICATION_RECIPIENTS`. The script ignores it.

## 3. Install and deploy

1. Open the spreadsheet and choose Extensions → Apps Script, or create a standalone project owned by the same Google account.
2. Replace the default file with `Code.gs` from this folder.
3. Confirm the two script properties above.
4. Deploy → New deployment → Web app.
5. Execute as: the Google account that can edit the spreadsheet.
6. Who has access: Anyone. Google requires this for a server that does not sign in as a user. The shared secret authorises the request.
7. Authorise the requested permission. It should be access to Google Sheets only. Do not expect a Gmail prompt. If an older deployment already granted Gmail, this version does not use it.
8. Copy the `/exec` URL into `GOOGLE_APPS_SCRIPT_URL`.

## 4. Operations

Every POST body includes `operation` and `secret`. A wrong secret returns `{ "ok": false, "code": "unauthorized" }` and writes nothing.

Lead writes:

- `createLead` validates the lead, including a non-empty comment when the product is `Other`, then appends one `Leads` row.
- The same `submissionId` does not create another row. The response is `{ "ok": true, "leadSaved": true, "duplicate": true }`.
- There is no operation that lists or returns lead rows.

Public card reads return active `BusinessCards` rows only:

- `listPublicCards`
- `getPublicCard`

Admin card changes, called by Next.js only after an administrator session is verified:

- `adminListCards`
- `adminCreateCard`
- `adminUpdateCard`
- `adminDeactivateCard` sets `IsActive` to false and keeps the row.

`doGet` returns an error and no data. Failed responses use a short `code` and do not include the secret, the sheet URL, or lead contents.

## 5. Failure codes

| Situation | Code |
|---|---|
| Wrong or missing secret | `unauthorized` |
| `LEADS_SHEET_URL` missing or not a spreadsheet URL | `sheet_url_missing` |
| `Leads` tab missing | `sheet_missing` |
| Header row does not match | `headers_invalid` |
| `Other` without a comment | `comment_required` |
| Duplicate public slug | `slug_taken` |

The Next.js API shows the visitor a generic message for these failures. It reports success only when the response has `ok: true` and `leadSaved: true`.
