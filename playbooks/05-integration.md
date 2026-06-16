# Playbook 05: Frontend Integration

**Agent:** 10-frontend-engineer  
**Output:** `frontend/`

## Steps

1. Copy `prototype/` → `frontend/`
2. Add API layer:
   - `src/api/client.ts` — fetch + JWT header
   - `src/api/types.ts` — from api-gateway.yaml
   - Per-page: replace `mock.ts` imports with API calls
3. Auth pages: `/login`, `/register` if required
4. Protected routes: redirect to `/login` without token
5. Vite proxy in `vite.config.ts`:

```ts
server: {
  proxy: { '/api': 'http://localhost:8080' }
}
```

## Route → API table (document in frontend/README.md)

Example for a CRM-like project:

| Route | API |
|-------|-----|
| `/` | GET /tasks/overdue, /deals/widget, /statistics/deals |
| `/deals` | GET /deals |
| `/clients` | GET /companies |

## Verify

1. Backend running (`docker compose up`)
2. `cd frontend && npm install && npm run dev`
3. Register → login → navigate all routes
4. Data loads from API (Network tab — no mock)

## Quality checklist

- [ ] JWT stored and sent on requests
- [ ] 401 redirects to login
- [ ] All pages-spec routes functional
- [ ] Error states handled (empty list, API error message)
