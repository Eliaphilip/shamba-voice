# Shamba Voice

Voice-first Kiswahili farm-recording and decision-support system for smallholder
farmers in Tanzania. This is a real, runnable full-stack application: Next.js
frontend + API routes, a SQL database, real authentication, a Kiswahili
extraction engine, and a deterministic financial calculation engine — built to
match the product requirements in the original PRD.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript) | Frontend + API routes in one codebase |
| Styling | Tailwind CSS v4 | Matches the design system tokens below |
| Database | SQLite via **Drizzle ORM** (`better-sqlite3`) | Zero-config for local dev; swap to Postgres for production (see below) |
| Auth | Cookie sessions, `bcryptjs` password hashing | Simple, real, no third-party auth dependency |
| Voice input | Browser **Web Speech API** (`sw-TZ`), typed-text fallback | Works today in Chrome/Edge with zero cost; see "Going further" for production ASR |
| AI extraction | Rule-based Kiswahili parser, optional OpenAI escalation via Vercel AI SDK | Works with **zero configuration**; add `OPENAI_API_KEY` to handle harder phrasings |
| Financial math | Plain TypeScript, `src/lib/calc.ts` | Never delegated to the LLM — see "Architecture rules" |

## Getting started

```bash
npm install
npm run db:reset   # creates the SQLite schema + demo data
npm run dev
```

Open http://localhost:3000.

### Demo accounts (created by `npm run db:reset`)

| Role | Phone | Password |
|---|---|---|
| Farmer (Eliya Mushi, seeded with real transaction history) | `0712345678` | `eliya123` |
| Admin | `0700000000` | `admin123` |

Register your own farmer account any time from the landing page.

## Project structure

```
src/
  app/
    page.tsx                  Public landing page
    login/, register/         Auth pages
    dashboard/                Farmer app (protected — layout.tsx checks the session)
      page.tsx                Home: mic, metrics, quick actions, recent records
      records/                Filterable transaction timeline
      farm/                   Farm profile
      ai/                     Full AI assistant chat
    admin/                    Admin app (protected — role must be "admin")
      page.tsx                Platform overview + AI monitoring
      farmers/                Farmer management (search, suspend, delete)
    api/                      All backend endpoints (see below)
  components/
    voice/VoiceProvider.tsx   The core voice-capture flow (see "How voice works")
    DashboardFrame.tsx        Shell: top bar, bottom nav, mounts VoiceProvider
  db/
    schema.ts                 Full data model (users, farmers, farms, seasons,
                               transactions, voice recordings, AI extractions,
                               consents, audit logs)
  lib/
    auth.ts                   Sessions, password hashing, requireUser/requireAdmin
    extraction.ts             Kiswahili transcript → structured transaction
    calc.ts                   Deterministic financial calculations
    assistant.ts              AI farm assistant (answers grounded in calc.ts output)
    farm.ts, validators.ts    Shared helpers and Zod schemas
scripts/seed.ts                Demo data
```

## API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/register` | POST | Create farmer account + farm + active season |
| `/api/auth/login` / `logout` / `me` | POST/GET | Session management |
| `/api/voice/extract` | POST | Transcript → structured extraction (the AI step) |
| `/api/voice/confirm` | POST | Write the confirmed transaction to the ledger |
| `/api/transactions` | GET/POST | List (with filter) / manually add a transaction |
| `/api/dashboard/summary` | GET | Deterministic season totals |
| `/api/farm` | GET/PATCH | Farm profile |
| `/api/ai/ask` | POST | Farm assistant Q&A |
| `/api/admin/overview` | GET | Platform-wide counts, AI monitoring |
| `/api/admin/farmers` | GET | Search/list farmers |
| `/api/admin/farmers/action` | POST | Suspend / activate / delete a farmer |

## How voice capture works

`src/components/voice/VoiceProvider.tsx` is mounted once in the dashboard shell,
so the mic is reachable from every page (PRD requirement). Flow:

1. Tap the mic → browser's `SpeechRecognition` (`sw-TZ`) starts listening.
   If the browser doesn't support it, a text input is offered instead — same
   pipeline either way, since both just produce a transcript string.
2. Transcript is sent to `POST /api/voice/extract`, which runs
   `src/lib/extraction.ts`.
3. If the amount (or type/category) is missing, the sheet asks for it directly
   — **it never guesses** (PRD Rule 1). Try saying "Nimenunua mbolea" with no
   price to see this.
4. Once complete, the sheet shows "Nimeelewa hivi" with all fields and asks
   for confirmation before anything is saved (PRD Section 6/11).
5. `POST /api/voice/confirm` writes the transaction. The UI refetches via a
   `sv:transaction-saved` browser event — no manual refresh needed anywhere.

### The Kiswahili number parser

Swahili number-words are magnitude-first ("elfu hamsini" = *thousand-fifty* =
50,000 — the reverse of English "fifty thousand"). `parseAmount()` in
`src/lib/extraction.ts` handles this, plus plain digits ("shilingi 80000") and
common phrasings ("nimenunua...", "nimeuza...kwa..."). It's a genuinely useful
piece of code — test it yourself:

```bash
curl -X POST http://localhost:3000/api/voice/extract \
  -H "content-type: application/json" -b <your-session-cookie> \
  -d '{"transcript":"Nimenunua mbolea kwa elfu themanini"}'
```

## Architecture rules actually enforced in code

These are the PRD's non-negotiables, and they're structural here, not just
described in a comment:

- **The LLM never does arithmetic.** `src/lib/calc.ts` computes every total,
  margin, and "who's the largest expense" fact with plain arithmetic over the
  farmer's actual rows. `src/lib/assistant.ts` only asks an LLM (if configured)
  to *rephrase* an already-computed sentence — the prompt explicitly forbids
  changing numbers.
- **Never invent a missing amount.** `extractFromTranscript()` returns
  `missingFields: ["amount"]` rather than a guess; the API and UI both key off
  that field to force a clarifying question.
- **Confirm before saving.** There is no code path that writes a transaction
  from a voice recording without going through `/api/voice/confirm`, which the
  UI only calls after the farmer taps "Ndiyo, hifadhi".

## Enabling the LLM (optional)

Everything works with zero external services. To let OpenAI (via the
[Vercel AI SDK](https://ai-sdk.dev)) assist with harder phrasings the
rule-based parser can't confidently resolve, and to make the AI assistant's
phrasing more natural:

```bash
# .env
OPENAI_API_KEY=sk-...
# Optional, defaults to gpt-4o-mini
OPENAI_MODEL=gpt-4o-mini
```

`extraction.ts` only escalates to OpenAI (`generateObject`) when the
rule-based parser's confidence is below a threshold, and `assistant.ts` only
asks OpenAI (`generateText`) to reword a fact it already computed — see
"Architecture rules" above for why. The model is configured centrally in
`src/lib/ai-model.ts`.

## Going to production

This repo is built to make each of these a small, contained change:

- **Database:** swap SQLite for Postgres — change `drizzle.config.ts` dialect
  to `"postgresql"`, point `src/db/index.ts` at `drizzle-orm/node-postgres` (or
  `postgres-js`) instead of `better-sqlite3`, and run `drizzle-kit push`
  against your Postgres `DATABASE_URL`. The schema in `src/db/schema.ts`
  doesn't use any SQLite-specific types.
- **Real speech-to-text:** the Web Speech API is free and works today in
  Chrome, but isn't available in all browsers (notably not Safari/iOS) and
  needs an internet connection at the moment of speaking. For production,
  swap the client-side recognition in `VoiceProvider.tsx` for: record audio →
  upload to a Kiswahili-capable ASR provider (e.g. Google Cloud
  Speech-to-Text, which supports `sw-TZ`) → send the returned transcript to
  the same `/api/voice/extract` endpoint. The rest of the pipeline doesn't
  change.
- **Text-to-speech for voice answers (PRD Section 15):** not implemented yet.
  Add a TTS call (e.g. Google Cloud TTS `sw-TZ` voices) in `/api/ai/ask` and
  return an audio URL alongside the text answer.
- **Offline queueing (PRD Section 17):** this build requires connectivity to
  reach the API. For true offline support, turn this into a PWA (service
  worker + IndexedDB) that queues `{transcript, timestamp}` locally when
  `/api/voice/extract` fails, and replays the queue on reconnect. The
  `VoiceRecording.status` field already has room for a `"queued"` state to
  support this.
- **Session storage:** sessions are stored in the `sessions` table and checked
  on every request — this is already safe for multiple server instances as
  long as they share one database.

## What's intentionally out of scope (per the PRD)

No crop disease diagnosis, fertilizer recommendations, weather forecasting,
marketplace, mobile money, lending, or general-purpose chat. The AI assistant
only answers from the farmer's own recorded data.
