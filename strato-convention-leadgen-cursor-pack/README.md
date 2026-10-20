# STRATO Convention Lead Generation — Cursor Pack

A build-ready specification pack for a polished Next.js convention lead-capture site and configurable digital business cards.

## Start here
1. Open this folder as the project root in Cursor.
2. Read `00_MASTER_PROMPT.md` and paste it into Cursor Agent.
3. Follow `06_IMPLEMENTATION_PHASES.md` in order. Do not skip the security and integration phases.
4. Configure the environment variables in `.env.example`.
5. Deploy to Vercel or another Node-compatible host; configure the Google Apps Script web app described in `04_GOOGLE_SHEETS_AND_EMAIL.md`.

## Pack contents
- Product requirements and user journeys
- UI/UX design system inspired by the supplied STRATO website
- Next.js architecture and route/API contract
- Google Sheets + email integration plan using Google Apps Script
- Security, privacy, validation, deployment, and testing requirements
- Cursor rules and phased implementation plan

## Important implementation decisions
- Next.js App Router + TypeScript.
- Leads are submitted to a server-side route, validated server-side, then forwarded to Google Apps Script.
- Google Apps Script appends each lead to a Google Sheets `Leads` tab and emails the STRATO team.
- Business cards are managed on a separate protected admin page and persisted in a `BusinessCards` sheet/tab through Apps Script operations.
- No service-account private key or integration secret may be shipped to the browser.
- Do not invent STRATO logo files. Reuse approved assets supplied by STRATO if available; otherwise use a text wordmark placeholder that is easy to replace.
