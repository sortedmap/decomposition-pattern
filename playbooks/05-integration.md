# Playbook 05: Frontend Integration

**Agent:** 10-frontend-engineer  
**Output:** `frontend/`

## Scaffold (phase A — parallel with backend)

Run **after gateway**, in parallel with backend implementation:

1. Copy `prototype/` → `frontend/`
2. Add API layer:
   - `src/api/client.ts` — fetch + JWT header, **`BASE_URL = '/api'`** (relative)
   - `src/api/types.ts` — from api-gateway.yaml
   - Per-page: structure for API calls; mock data OK until backend is up
3. Auth pages: `/login`, `/register` if required
4. Protected routes: redirect to `/login` without token
5. Vite proxy in `vite.config.ts` (local dev only):

```ts
server: {
  proxy: { '/api': 'http://localhost:8080' }
}
```

## Integration (phase B — after backend tests green)

1. Replace all `mock.ts` imports with live API calls
2. Backend running (`docker compose up`)
3. `cd frontend && npm install && npm run dev`
4. Register → login → navigate all routes
5. Data loads from API (Network tab — no mock)

### Production client rules

- Use **relative** `/api` — browser requests `{baseUrl}/api/*` (e.g. `http://host:8880/api/auth/me`)
- Do **not** set `VITE_API_URL=http://host:8080` unless cross-origin is explicitly required
- Nginx in frontend container proxies `/api/` → `api-gateway:8080` (see `templates/frontend/nginx.conf`)

## Route → API table (document in frontend/README.md)

Example for an MSA web application:

| Route | API |
|-------|-----|
| `/` | GET /orders/summary, /statistics/overview |
| `/catalog` | GET /products |
| `/orders` | GET /orders |

## Quality checklist (phase B)

- [ ] JWT stored and sent on requests
- [ ] 401 redirects to login
- [ ] All pages-spec routes functional
- [ ] Error states handled (empty list, API error message)
- [ ] Production build uses relative `/api`, not absolute gateway port on host
