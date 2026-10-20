# Integration request examples

These are shape examples. The Next.js server adds the secret. Do not call the web app from browser code.

## Create lead

```json
{
  "operation": "createLead",
  "secret": "<server-only-shared-secret>",
  "submissionId": "4f6d4f0e-4c1b-4e3a-8f1a-6d0e8c2b9a11",
  "source": "STRATO Convention",
  "lead": {
    "name": "Alex",
    "surname": "Example",
    "companyName": "Example Ltd",
    "cellNumber": "+27 82 000 0000",
    "emailAddress": "alex@example.com",
    "productInterest": "STRATOPOD",
    "comment": ""
  }
}
```

Saved:

```json
{ "ok": true, "leadSaved": true, "duplicate": false }
```

The same submission ID was already stored. No second row is added:

```json
{ "ok": true, "leadSaved": true, "duplicate": true }
```

## Public cards

```json
{ "operation": "listPublicCards", "secret": "<server-only-shared-secret>" }
```

```json
{ "operation": "getPublicCard", "secret": "<server-only-shared-secret>", "slug": "alex-example" }
```

Inactive and unknown slugs return `{ "ok": true, "card": null }`.

## Admin cards

```json
{
  "operation": "adminCreateCard",
  "secret": "<server-only-shared-secret>",
  "card": {
    "id": "generated-by-next",
    "slug": "alex-example",
    "firstName": "Alex",
    "surname": "Example",
    "jobTitle": "Consultant",
    "companyName": "STRATO IT Group",
    "workEmail": "alex@example.com",
    "mobilePhone": "+27 82 000 0000",
    "officePhone": "",
    "website": "",
    "linkedInUrl": "",
    "location": "Johannesburg",
    "profileImageUrl": "",
    "isActive": true
  }
}
```

`adminUpdateCard` uses the same card object. `adminDeactivateCard` sends `{ "operation": "adminDeactivateCard", "secret": "<server-only-shared-secret>", "id": "generated-by-next" }`.

A duplicate slug returns `{ "ok": false, "code": "slug_taken" }`.
