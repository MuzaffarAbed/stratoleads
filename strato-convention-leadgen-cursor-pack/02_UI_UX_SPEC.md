# UI/UX Design Specification

## 1. Visual reference and design intent
Reference: `https://stratoitgroup.ahvashen.com/`

The reference communicates enterprise technology, SAP consulting, systems integration, and practical mobile products. The convention site should feel like a focused extension of that corporate brand, not a generic marketing template or a consumer app.

## 2. Design principles
- Enterprise credibility: restrained typography, alignment, strong contrast, no gimmicks.
- Fast capture: one primary task per page and minimal navigation.
- Mobile-first: design at 360px width first; test on current iOS and Android browsers.
- Booth-friendly: large controls and readable text in bright exhibition lighting.
- Accessible: visible focus, semantic labels, error text, keyboard operation, sufficient contrast.
- No unverified claims, fake client logos, fake metrics, or invented employee content.

## 3. Suggested tokens
Treat these as starting tokens, then inspect available approved brand assets and align to them:
- `--color-ink: #10131C` (near-black navy)
- `--color-navy: #111827` (primary dark)
- `--color-gold: #E1B787` (warm gold accent)
- `--color-gold-muted: #AA8E70` (muted gold for headings/secondary accents)
- `--color-surface: #FFFFFF`
- `--color-page: #F5F6F8`
- `--color-border: #D9DDE4`
- `--color-text: #171A21`
- `--color-muted: #626A76`
- Font: Saira where licensed/available; otherwise a modern system sans-serif fallback.
Do not use gold as body text on white if contrast is insufficient. Keep accent usage deliberate.

## 4. Lead landing page (`/`)
### Layout
- Top bar: STRATO wordmark/logo at left; compact “Convention enquiry” label at right.
- Hero region: dark navy surface or restrained navy-on-light composition; headline such as “Let’s connect your business to what’s next.” Keep copy short.
- Supporting text: “Tell us what you’re interested in and the STRATO team will follow up.”
- Main form in a clear card with generous spacing.
- Product-interest select and conditional comment are easy to locate.
- Footer: STRATO IT Group, privacy link, and optionally approved contact details.
- Secondary text link to “Explore digital business cards”.
### Form arrangement
Desktop: two-column fields where sensible (Name/Surname, Cell/Email); Company and Product Interest full width; Comment full width; Confirm full width or visually dominant.
Mobile: one column, 44px minimum control height (prefer 48–52px), sticky CTA only if it does not obscure fields.
### Interaction details
- Labels above controls; placeholders are examples only, not labels.
- Required indicator explained accessibly.
- Selecting `Other` reveals Comment with `required` indicator and helper text.
- If user switches away from `Other`, comment remains populated but becomes optional.
- Errors appear next to fields and summarized/focused accessibly.
- Confirm has idle/loading/success states and cannot be repeatedly clicked while submitting.
- Success view is warm, concise, and gives the visitor a clear next action.

## 5. Business card directory (`/business-cards`)
- Same top bar/brand.
- Short intro: “Connect with the STRATO team.”
- Staff cards displayed as clean responsive tiles with initials/avatar, name, role, and a “View digital card” action.
- Search only if the staff directory grows large enough; do not add filters that serve no purpose.
- Empty state if no active cards have been configured: tell the administrator to publish cards; do not expose admin controls to visitors.
- Keep the lead capture route easy to return to.

## 6. Individual digital card (`/business-cards/[slug]`)
- Compact centered card on a calm neutral background.
- Logo/wordmark, optional headshot, full name, role, STRATO IT Group.
- Clear primary button: “Add to contacts”.
- Secondary actions: Call, Email, Website, LinkedIn if supplied, Share/Copy link.
- QR code with label “Scan to open this card” where practical.
- Use native `.vcf` download with correct vCard escaping and UTF-8 support.
- Avoid rendering blank action buttons for missing optional values.
- Include a compact STRATO brand footer.

## 7. Admin card manager (`/admin/business-cards`)
- Distinctly administrative, but still on-brand.
- Sign-in screen first; no card data loaded before authorization.
- Table/list columns: Name, Role, Slug, Status, Updated, Actions.
- Form grouped into “Contact details”, “Public profile”, and “Publishing”.
- Preview panel should match the public card.
- QR actions: open preview, copy link, download QR image.
- Clear save/cancel states and confirmation for deactivation.
- Mobile admin support is useful but desktop-first is acceptable.

## 8. Components
Build reusable components:
- `BrandHeader`, `BrandFooter`
- `LeadCaptureForm`, `FormField`, `ProductInterestSelect`
- `SubmitButton`, `InlineError`, `SuccessPanel`
- `BusinessCardPreview`, `BusinessCardTile`, `ContactAction`
- `AdminCardTable`, `BusinessCardEditor`, `QrCodePanel`
- `LoadingState`, `EmptyState`, `ErrorState`, `ConfirmDialog`

## 9. Motion and imagery
- Motion should be subtle (short opacity/translate transitions) and respect reduced-motion preferences.
- Do not use stock imagery as decoration unless it is genuinely relevant and licensed. The form itself is the focus.
- Prefer approved STRATO logo assets and product imagery if supplied.
