# CLAUDE.md

Guidance for Claude Code (and other AI agents) working in this repository.

## What this is

**Autonomous Revenue OS™** — an autonomous venture operating system. AI "agent teams"
discover leads, run outreach (SMS/email), manage a deal pipeline, generate proposals, and
log proof-of-work. A background **autopilot** cycle runs every 2 hours to generate leads
(OpenAI) and send SMS (Twilio).

## Monorepo layout (pnpm workspace)

```
artifacts/
  api-server/        Express 5 API. Bundled with esbuild → dist/index.mjs. Serves /api
                     AND the built web UI (single origin) in production.
  living-codex/      React + Vite + Tailwind web app (the product UI + marketing site).
  living-codex-mobile/  Expo mobile app.
  mockup-sandbox/, pitch-deck/   Static/demo artifacts.
lib/
  db/                Drizzle ORM schema + Postgres client (@workspace/db).
  api-spec/          OpenAPI spec — source of truth for API contracts.
  api-zod/           Generated Zod schemas (do NOT hand-edit).
  api-client-react/  Generated React Query hooks (do NOT hand-edit).
api/index.ts         Thin re-export of the api-server app.
```

## Commands

Package manager is **pnpm only** (an npm/yarn install is blocked by a preinstall guard).

| Task | Command |
|---|---|
| Install | `pnpm install` |
| Build web UI | `pnpm run build:web` |
| Build API bundle | `pnpm run build:api` |
| Build both | `pnpm run build:app` |
| Start server (prod, single port) | `pnpm start` (loads `.env`, serves API + UI on `:8080`) |
| Push DB schema | `pnpm run db:push` (needs `DATABASE_URL` in the shell env — see below) |
| Typecheck everything | `pnpm run typecheck` |
| Full build (typecheck + all) | `pnpm run build` |

Regenerate API hooks/schemas after editing `lib/api-spec/openapi.yaml`:
`pnpm --filter @workspace/api-spec run codegen` (then rebuild).

## How it runs locally (single-port, production-style)

The API server serves the compiled React app from `artifacts/living-codex/dist/public` on the
same origin as `/api` (see [artifacts/api-server/src/app.ts](artifacts/api-server/src/app.ts)).
So the whole app is reachable at **one URL**: `http://localhost:8080`.

Order: `pnpm run db:push` → `pnpm run build:app` → `pnpm start`.

The API server runs the **compiled bundle**, not TypeScript. After editing anything under
`artifacts/api-server/`, rebuild (`pnpm run build:api`) and restart before changes take effect.

## Environment

Copy `.env.example` → `.env`. Only two vars are required to boot:

- `DATABASE_URL` — Postgres connection string (Neon recommended). The server throws on boot
  without it ([lib/db/src/index.ts](lib/db/src/index.ts)).
- `PORT` — defaults to `8080` in our setup.

Optional (features degrade gracefully if unset): `GEMINI_API_KEY` (AI lead gen + email drafting
+ autopilot — Google Gemini via the Vercel AI SDK; `GOOGLE_GENERATIVE_AI_API_KEY` also works, and
`GEMINI_MODEL` overrides the default `gemini-2.0-flash`), `STRIPE_SECRET_KEY` /
`STRIPE_WEBHOOK_SECRET` (billing/subscription gate), `TWILIO_*` (SMS), `RESEND_API_KEY` (email),
`APP_URL`.

AI calls go through one helper — [artifacts/api-server/src/lib/ai.ts](artifacts/api-server/src/lib/ai.ts)
(`generateAIText`). To switch providers (e.g. back to OpenAI), change only the `model` line there.

`.env` is gitignored — never commit real secrets.

## ⚠️ Autopilot & live SMS

`startAutopilot()` runs a cycle 30s after boot, then every 2h. It only sends **real** SMS once
BOTH a company profile exists (created via `/setup`) AND `GEMINI_API_KEY` is set (needed to
generate leads with phone numbers). Twilio creds in `.env` are live — be deliberate before
enabling both. See [artifacts/api-server/src/autopilot.ts](artifacts/api-server/src/autopilot.ts).

## Windows gotchas (already fixed in this repo)

The lockfile was generated on Linux, so a few things need platform binaries / path fixes on
Windows. These are already handled but worth knowing:

- **Native binaries**: `rollup`, `lightningcss`, and `@tailwindcss/oxide` need their
  `*-win32-x64-msvc` packages. They're added as optional deps in `living-codex/package.json`
  (Linux skips them via os/cpu constraints). If `vite build` fails with "Cannot find module
  ...win32...", add the matching `<pkg>-win32-x64-msvc@<version>`.
- **Glob paths**: `drizzle.config.ts` uses forward slashes for the schema path (backslashes
  break drizzle-kit's glob matcher on Windows).
- **File URLs**: `app.ts` uses `fileURLToPath(import.meta.url)`, not `URL.pathname` (the latter
  yields a malformed `/D:/...` path on Windows).

To set `DATABASE_URL` for a one-off `db:push` on Windows PowerShell:
`$env:DATABASE_URL="postgres://..."; pnpm run db:push`  (bash: `DATABASE_URL="..." pnpm run db:push`).

## Conventions

- **OpenAPI-first**: `lib/api-spec/openapi.yaml` is the contract; types flow from codegen.
  Never hand-edit files under `*/generated/`.
- **Rebuild the API** after backend edits (it runs the bundle, not source).
- Validation via Zod (`zod/v4`) + `drizzle-zod`. Proof-of-work: every agent action is logged
  to the `activities` table.
