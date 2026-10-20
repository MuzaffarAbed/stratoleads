# Product Requirements

## 1. Purpose
Capture qualified prospects at a STRATO IT Group convention booth and let visitors save a selected STRATO employee's digital business card.

## 2. Audiences
- Convention visitors / prospective customers
- STRATO staff collecting leads
- An authorized STRATO administrator maintaining staff cards

## 3. Visitor journey — lead capture
1. Visitor scans a booth QR code or opens the site.
2. The landing page immediately explains that they can request information about STRATO solutions.
3. Visitor completes the lead form.
4. Choosing `Other` makes Comment required and reveals a clear helper message.
5. Visitor selects Confirm.
6. Client-side validation offers immediate guidance; server validation is authoritative.
7. Server records the lead in the Google Sheets `Leads` tab and sends a notification email.
8. Visitor sees success only when the configured integration reports successful processing. If integration fails, show a helpful retry state and do not falsely claim the lead was saved.

## 4. Lead fields
| Field | Required | Validation / notes |
|---|---|---|
| Name | Yes | Trim; sensible length limit |
| Surname | Yes | Trim; sensible length limit |
| Company Name | Yes | Trim; sensible length limit |
| Cell Number | Yes | Accept `+` and international formats; do not assume South African-only |
| Email Address | Yes | Validate format; normalize surrounding whitespace |
| Product Interest | Yes | Exact list below |
| Comment | Conditional | Optional for product selections; mandatory and non-empty for `Other` |

Dropdown options, in this order:
1. STRATOPOD
2. STRATOPOD GO
3. STRATOWM
4. STRATOOB
5. Other

Store timestamp in ISO format on the server. Optional useful metadata: submission ID, source/campaign name, consent/privacy acknowledgement state, and user-agent only if justified. Do not collect unnecessary personal data.

## 5. Lead success and error states
- Success: thank the visitor; optionally offer a button to view staff digital cards.
- Validation: field-level, accessible messages; focus the first invalid field.
- Integration failure: explain that submission could not be confirmed and invite retry; preserve entered data.
- Pending: disable Confirm and display a progress indicator.
- Double-submit protection: client disabled state plus server-side idempotency/submission key where feasible.

## 6. Digital business cards
### Public
- `/business-cards` provides a simple branded entry/directory page.
- `/business-cards/[slug]` presents one staff member's contact card.
- Card actions: Add to contacts (.vcf download), call, email, open website, open LinkedIn when configured, share/copy link, and display QR code.
- Optional profile image; use initials/avatar fallback.
- Mobile-first and usable when reached from a QR code.
- Only active cards appear publicly.

### Editable fields
- First name (required)
- Surname (required)
- Job title (required)
- Company name (default STRATO IT Group; editable if needed)
- Work email (required)
- Mobile phone (required)
- Office phone (optional)
- Website (optional)
- LinkedIn URL (optional)
- Location (optional)
- Profile image URL (optional)
- Public slug (required and unique)
- Active flag (required)
- Created/updated timestamps

### Admin
- Protected `/admin/business-cards` page.
- Login/logout.
- List/search cards; create/edit; preview; activate/deactivate; copy public URL; view/download QR; validate unique slug.
- Destructive actions should require confirmation. Prefer deactivation over hard deletion.
- Display clear loading, empty, error, and success states.
- The admin must not leak the admin secret or Apps Script secret to the browser.

## 7. Non-functional requirements
- Responsive from small phones to desktop.
- WCAG-minded labels, focus states, keyboard navigation, contrast, and error announcements.
- Fast first load; avoid heavy animation and unnecessary libraries.
- SEO/social metadata for public cards; do not index admin pages.
- Use secure headers and server-side validation.
- Privacy notice link and a concise collection-purpose statement. Obtain STRATO's approved privacy wording before production.
- Do not add marketing subscription consent by default; if STRATO wants future marketing contact, implement a separate explicit opt-in and store it independently.
