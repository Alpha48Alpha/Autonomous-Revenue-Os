# Autonomous Revenue OS™

An autonomous venture operating system (AVOS) built by Blackman-Whatley AI Lab. AI agent teams discover leads, send outreach, manage the deal pipeline, generate proposals, and report proof-of-work — all through in-house infrastructure with no third-party dependencies (no Twilio, no Twitter/X).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at `/api`)
- `pnpm --filter @workspace/living-codex run dev` — run the frontend (port 24006, served at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, Framer Motion, Recharts, Wouter, React Query
- API: Express 5, served at `/api`
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (companies, leads, deals, messages, proposals, activities)
- `artifacts/api-server/src/routes/` — Express route handlers (leads, companies, deals, messages, proposals, activities, dashboard)
- `artifacts/living-codex/src/` — React frontend (pages, components, hooks)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not hand-edit)
- `lib/api-zod/src/generated/` — generated Zod validation schemas (do not hand-edit)

## Architecture decisions

- **OpenAPI-first**: `lib/api-spec/openapi.yaml` is the contract. All types flow from codegen — never hand-write types that codegen produces.
- **Body schema naming**: Request body schemas use entity-shaped names (`LeadInput`, `LeadUpdate`) not operation-shaped (`CreateLeadBody`) to avoid TS2308 collisions in Orval output.
- **In-house messaging**: No Twilio/Twitter dependency. All outreach messages are stored and tracked in the `messages` table with channel tagging.
- **Proof-of-Work architecture**: Every agent action is logged to the `activities` table with agent team, type, and optional monetary value — enabling real-time POW dashboards.
- **Governance levels**: Agent teams are categorized Level 0 (auto-execute), Level 1 (human review), Level 2 (human authorization) — encoded in the frontend Agent Command page.

## Product

**Executive Command Center** (`/`) — Live revenue metrics, pipeline value, proof-of-work summary per agent team, and a real-time activity feed.

**Agent Teams:** Research, Opportunity, Outreach, Sales, CRM, Strategy, Revenue Ops — each mapped to KPIs and governance level.

**Core entities:** Leads (scored 0-100, hot/warm/cold), Companies, Deals (6-stage pipeline), Messages (in-house outreach), Proposals, Activities (agent POW log).

**Execution phases:**
- Phase 1 (30 days): First revenue — Research + Opportunity + Outreach agents
- Phase 2 (60 days): Repeatable sales — CRM intelligence + follow-up + proposals
- Phase 3 (90 days): Autonomous growth engine — retention loops + executive dashboards

## User preferences

- No third-party messaging infrastructure (Twilio, Twitter/X) — everything in-house
- Every agent must demonstrate proof-of-work with measurable business outcomes
- Humans act as governors/approvers, not operators — agents do the execution

## Gotchas

- After any change to `lib/api-spec/openapi.yaml`, always re-run codegen before touching backend or frontend code
- Orval body schema naming: use entity names (`NoteInput`) not operation names (`CreateNoteBody`) — see `lib/api-spec` references
- The API server must be rebuilt (`pnpm run build`) before changes take effect — it runs the compiled bundle, not TypeScript directly

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- OpenAPI + codegen conventions: `.local/skills/pnpm-workspace/references/openapi.md`
- Server route conventions: `.local/skills/pnpm-workspace/references/server.md`
