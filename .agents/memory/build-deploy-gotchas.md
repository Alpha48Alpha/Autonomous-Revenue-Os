---
name: Build & deploy gotchas
description: Durable build/deploy lessons for this multi-artifact monorepo
---

- **The web app's Vite config requires `PORT` at build time and throws without it.** A bare local build of the web artifact fails with "PORT environment variable is required"; this is NOT a real breakage — production sets PORT via the artifact's service env. To validate the web build locally, provide `PORT` (and `BASE_PATH`).
  **Why:** the config reads `process.env.PORT` eagerly.

- **The root build/typecheck fails on the `mockup-sandbox` artifact** (React 19 ref-type errors), but mockup-sandbox is the internal Canvas/design tool and is NOT part of the published product. Deployment uses each artifact's own production build command, so this does not block publishing.
  **How to apply:** judge deployability by building the actual deployable artifacts (web + api) directly, not the root build.
