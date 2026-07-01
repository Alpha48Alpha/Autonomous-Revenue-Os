---
name: Expo port binding
description: Replit workflow health check only detects ports listed in .replit [[ports]]; expo artifacts need a port from that list.
---

## The Rule
The Replit workflow health check (`restart_workflow` / `DIDNT_OPEN_A_PORT` error) only detects a port as "open" if that localPort is listed in `.replit [[ports]]`. Ports NOT in that list (e.g. 23668) are never detected as open, even if a process is genuinely bound to them.

**Why:** Replit's "river service" monitors a specific allowlist of ports. Any port outside that list is ignored by the health check.

**How to apply:**
- When an Expo (or any) artifact is created with a dynamically assigned port (e.g. 23668), check if that port is in `.replit [[ports]]`.
- If NOT, change the artifact.toml `localPort` + `[services.env] PORT` to an already-mapped port (e.g. 8082, which maps to externalPort 3002).
- Use `verifyAndReplaceArtifactToml()` in code_execution to update artifact.toml — never edit it directly.
- `.replit` cannot be edited directly; work within the existing port mappings.

## Current port map (as of this session)
- 8080 → external 8080 (api-server)
- 8081 → external 80  (mockup-sandbox)
- 8082 → external 3002 (living-codex-mobile — changed from 23668)
- 24006 → external 3000 (living-codex web)

## Expo-specific extra: dev proxy needed
Metro's web server opens its port lazily. The solution used here:
- `artifacts/living-codex-mobile/scripts/dev-proxy.js` — an HTTP proxy that binds $PORT immediately (passes health check) and forwards all traffic to Metro running on port 9091.
- Dev script in package.json: `"dev": "exec node scripts/dev-proxy.js"`
- Using `exec` makes node the direct child of the workflow runner (important for signal handling).
