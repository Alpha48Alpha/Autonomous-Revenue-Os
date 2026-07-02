# Autonomous Revenue OS™

An autonomous venture operating system. AI agent teams discover leads, run outreach, manage a
deal pipeline, generate proposals, and log proof-of-work — with a background **autopilot** that
generates leads and sends SMS on a schedule.

- **Web app + API** — React (Vite) UI served together with an Express API on one port.
- **Database** — PostgreSQL via Drizzle ORM.
- **Monorepo** — pnpm workspace (`artifacts/*` apps, `lib/*` shared packages).

---

## Prerequisites

- **Node.js** 20+ (tested on 23)
- **pnpm** 10+ (`npm i -g pnpm`) — npm/yarn are blocked by design
- A **PostgreSQL** connection string. Free option: [Neon](https://neon.tech) (recommended) or Supabase.

---

## Quick start

From the project root:

```bash
# 1. Install dependencies
pnpm install

# 2. Create your .env  (copy the template, then fill in DATABASE_URL)
cp .env.example .env        # PowerShell: Copy-Item .env.example .env
#   -> set DATABASE_URL to your Postgres URL, keep PORT=8080

# 3. Create the database tables (needs DATABASE_URL in your shell)
#    bash:        DATABASE_URL="postgres://..." pnpm run db:push
#    PowerShell:  $env:DATABASE_URL="postgres://..."; pnpm run db:push

# 4. Build the web UI and the API
pnpm run build:app

# 5. Start it  (loads .env automatically)
pnpm start
```

Then open **http://localhost:8080** 🎉

The first page load talks to the database; if you're on a serverless DB (Neon), the very first
request may take a few seconds while it wakes up, then it's fast.

### Pages
`/` marketing site · `/dashboard` live metrics · `/setup` create your company profile ·
`/leads` · `/deals` · `/comms` · `/transactions` · `/proposals` · `/billing`

---

## Environment variables

Only two are required to boot (`DATABASE_URL`, `PORT`). Everything else is optional and features
degrade gracefully when unset. See [`.env.example`](.env.example) for the full list.

**AI features** (lead generation + email drafting) use **Groq** via the Vercel AI SDK.
Set `GROQ_API_KEY` (free key: https://console.groq.com/keys). Without it, those specific
buttons return a clear "key not configured" message; the rest of the app works normally.

> ⚠️ **Heads-up on the autopilot:** the server runs a lead-gen + SMS cycle every 2 hours. It only
> sends **real** text messages once you (a) create a company profile at `/setup` **and** (b) set
> `GROQ_API_KEY` (needed to generate leads with phone numbers). Twilio keys in `.env` are live —
> add the Groq key only when you're ready for that.

---

## Making changes — do I need to rebuild? (plain English)

This app runs **compiled/built files**, not your source files directly. So after you edit code,
you have to rebuild the part you changed, then restart. Think of it like a document you have to
"Export to PDF" again after editing — the PDF (what's running) doesn't change until you re-export.

**If you edited backend code** (anything in `artifacts/api-server/`):

```bash
pnpm run build:api     # re-compile the API
# stop the running server (Ctrl+C in its terminal), then:
pnpm start             # start it again
```

**If you edited frontend code** (anything in `artifacts/living-codex/`):

```bash
pnpm run build:web     # re-build the UI, then just refresh your browser
```

*(You don't need to restart the API server for a frontend rebuild — it picks up the new files;
just reload the page.)*

> Prefer instant refresh while designing the UI? Ask for **dev mode** (Vite hot-reload on a
> separate port) — changes then appear the moment you save, no rebuild needed. The trade-off is
> it runs on two ports instead of one.

---

## Useful commands

| Command | What it does |
|---|---|
| `pnpm start` | Run the app (API + UI) on port 8080 |
| `pnpm run build:app` | Build both UI and API |
| `pnpm run build:web` | Build the UI only |
| `pnpm run build:api` | Build the API only |
| `pnpm run db:push` | Create/update database tables from the schema |
| `pnpm run typecheck` | Type-check all packages |

---

## Project structure

```
artifacts/
  api-server/     Express API (bundled) — also serves the built web UI
  living-codex/   React + Vite web app (product UI + marketing)
  living-codex-mobile/   Expo mobile app
lib/
  db/             Drizzle schema + Postgres client
  api-spec/       OpenAPI contract (source of truth)
  api-zod/, api-client-react/   Generated code (do not hand-edit)
```

See [CLAUDE.md](CLAUDE.md) for deeper architecture notes and conventions.
