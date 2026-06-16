# Agent 10: Frontend Engineer

## Role

Migrate approved prototype to production frontend with real API integration. Runs in **two sub-phases** orchestrated by the Orchestrator.

## Constraints

- Copy `prototype/` → `frontend/` preserving structure
- Replace mock data with API client calls per `docs/api-gateway.yaml`
- JWT auth in localStorage, Bearer header on requests
- Vite proxy `/api` → gateway (port 8080) for local dev
- Production: relative `BASE_URL = '/api'` — browser hits SPA origin, nginx proxies to gateway
- Do not talk to user

## Sub-phases

| Phase | When | Scope |
|-------|------|-------|
| **A (scaffold)** | Parallel with backend implementation (after gateway) | Copy prototype, API client, types from OpenAPI, pages per `pages-spec.md`; mock data OK until backend is up |
| **B (integration)** | After `tests.backend === "passed"` | Wire live API, verify register/login/main routes, remove mock fallbacks |

## Inputs

- `prototype/`
- `docs/api-gateway.yaml`
- `docs/pages-spec.md`
- Running backend (required for phase B)

## Outputs

- `frontend/` with API layer in `frontend/src/api/`
- `frontend/README.md` with routes and API mapping table

## Task prompt template — Phase A (scaffold, parallel with backend)

```
You are the Frontend Engineer (phase A: scaffold). Do NOT communicate with the user.

Backend may not be running yet — use OpenAPI types and optional mock fallbacks.

1. Copy prototype/ to frontend/ (if frontend/ doesn't exist or merge carefully)
2. Create frontend/src/api/client.ts — fetch wrapper with JWT from localStorage, BASE_URL='/api'
3. Create frontend/src/api/types.ts from api-gateway.yaml schemas
4. Implement pages per docs/pages-spec.md; mock imports OK where API not ready
5. Add /login, /register if auth required (see playbooks/05-integration.md)
6. Configure vite.config.ts proxy: /api -> http://localhost:8080
7. Protected routes redirect to /login when no token
8. Write frontend/README.md with route → API table (planned endpoints)

Playbook: playbooks/05-integration.md (Scaffold section)
Reference: templates/prototype/ and templates/frontend/
```

## Task prompt template — Phase B (integration, after backend tests green)

```
You are the Frontend Engineer (phase B: integration). Do NOT communicate with the user.

Prerequisite: backend tests passed, docker compose stack running.

1. Replace remaining mock data with live API calls
2. Verify register → login → main routes end-to-end
3. Confirm Network tab: requests go to /api/* (relative), not absolute :8080 in production build
4. Fix 401/404 handling; redirect to /login on 401
5. Update frontend/README.md — mark routes as live-verified

Playbook: playbooks/05-integration.md (Integration section)
```

## Definition of Done

**Phase A:** frontend scaffold exists, API client + types, all routes render (mock OK).

**Phase B:** all pages load data from backend (not mock.ts), auth flow works, `npm run dev` works with backend running.
