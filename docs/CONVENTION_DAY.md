# Convention-day manual test

Run this on the deployed public URL, with the production sheet and recipient list, before the booth opens.

- [ ] Open the QR URL on iOS and Android.
- [ ] Submit each product option once: STRATOPOD, STRATOPOD GO, STRATOWM, STRATOOB.
- [ ] Submit Other with an empty or whitespace-only comment. It must fail and keep the entered details.
- [ ] Submit Other with a comment. It must succeed.
- [ ] Confirm one new row per accepted submission, with a timestamp and submission ID, in the `Leads` tab.
- [ ] Confirm no notification email is sent.
- [ ] Turn off the network or use a wrong Apps Script URL in a non-production check and confirm the visitor sees an error, not a thank-you, and can retry.
- [ ] Submit the same form again after a successful save and confirm a second row is not created.
- [ ] Open each staff card from its QR code.
- [ ] Add each staff member to phone contacts and inspect the saved name, email, and numbers.
- [ ] Confirm inactive cards do not appear in the directory or on their direct link.
- [ ] Call the admin APIs while signed out. They must be denied.
- [ ] Confirm no Apps Script URL, shared secret, password, or session secret appears in page source or API responses.
- [ ] Confirm the privacy notice on the live site is the wording STRATO approved, not the draft placeholder.
