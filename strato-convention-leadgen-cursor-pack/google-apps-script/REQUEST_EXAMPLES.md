# Integration Request Examples

These are shape examples only; Cursor must implement schemas and secret verification.

## Create lead
```json
{
  "operation": "createLead",
  "secret": "<server-only-shared-secret>",
  "submissionId": "server-generated-unique-id",
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

## Public cards
```json
{
  "operation": "listPublicCards",
  "secret": "<server-only-shared-secret>"
}
```

The browser must never call Apps Script directly. The Next.js server is the only integration client.
