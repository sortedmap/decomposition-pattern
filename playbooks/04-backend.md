# Playbook 04: Backend Implementation & Tests

**Agents:** 07-backend-engineer, 08-backend-test-engineer, 10-frontend-engineer (phase A, parallel)  
**Output:** `backend/`, `frontend/` scaffold

## Implementation (parallel with frontend scaffold)

After `docs/api-gateway.yaml` exists, launch **in parallel** (max 4 concurrent):

- **07-backend-engineer** × N — one Task per service in `services[]`
- **10-frontend-engineer phase A** — copy prototype, API client, pages (mock OK)

For each backend service:

1. Copy `templates/backend/service/` → `backend/{service}/`
2. Implement per `docs/{service}/api.yaml` and `db.md`
3. SQL migrations in `migrations/`
4. Dockerfile, `.env.example`, README

## Docker Compose

After all services (sequential Task if not in same parallel batch):

1. Task → Backend Engineer: `backend/docker-compose.yaml`
2. One PostgreSQL container per service
3. API Gateway service routing to all backends
4. Shared network, health checks
5. **Production:** publish only frontend nginx (SPA + `/api/` proxy). Gateway host port `8080:8080` is **optional** (`profiles: [debug]`) — API for browser goes through `$baseUrl/api/*`, not host `:8080`

## Backend tests

For each service (parallel, max 4):

1. Task → Backend Test Engineer
2. Vitest + supertest + pg-mem
3. Test every endpoint from api.yaml
4. Fix loop: max 3 iterations

```bash
cd backend/{service} && npm test
```

## Verify locally

```bash
cd backend && docker compose up -d --build
curl http://localhost:8080/health
curl http://localhost:8080/api/... # sample endpoints (gateway prefix /api/)
```

Update `state.tests.backend = "passed"` when all green.

Then delegate **10-frontend-engineer phase B** for live API integration.

## Reference

`templates/backend/service/` — Express skeleton, migrations, vitest setup
