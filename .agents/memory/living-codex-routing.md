---
name: Living Codex routing zones
description: How the living-codex web app separates the public marketing site from the product dashboard, and where the dashboard lives.
---

The living-codex web app (React + Vite + wouter) serves two zones from one artifact at `/`:

- **Public marketing site** (no dashboard chrome): routes `/`, `/founder`, `/about`, `/mission`, `/platform`. These render bare marketing pages under `src/pages/marketing/` wrapped only in `MarketingLayout` (its own nav + footer). Visual style is intentionally black `#050505` + gold `#d4af37` with Cormorant Garamond serif — distinct from the product's orange `#FF6600` brand.
- **Product app** (with `AppLayout` sidebar): everything else, delegated to `AppRouter` via a catch-all `<Route component={AppRouter} />` in `App.tsx`.

**Key fact:** the dashboard is at `/dashboard`, NOT `/`. The marketing home owns `/`.

**Why:** the user wanted a public-facing marketing presence at the root URL while keeping the existing product app reachable.

**How to apply:** when adding a public marketing page, add a `<Route>` in `App.tsx` BEFORE the `AppRouter` catch-all and build it under `src/pages/marketing/`. When adding a product page, add it inside `AppRouter`'s Switch. Cross-zone links to the app should use `/dashboard` (and wouter `<Link>` so the base path is applied). The `app-layout.tsx` logo links back to `/` (marketing home); its Dashboard nav entries point to `/dashboard`.
