# Playbook 04: Backend Implementation & Tests

**Agents:** 07-backend-engineer, 08-backend-test-engineer  
**Output:** `backend/`

## Implementation (parallel)

For each service in `services[]` (max 4 concurrent):

1. Copy `templates/backend/service/` → `backend/{service}/`
2. Implement per `docs/{service}/api.yaml` and `db.md`
3. SQL migrations in `migrations/`
4. Dockerfile, `.env.example`, README

## Docker Compose

After all services:

1. Task → Backend Engineer: `backend/docker-compose.yaml`
2. One PostgreSQL container per service
3. API Gateway service routing to all backends
4. Shared network, health checks

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
curl http://localhost:8080/api/v1/... # sample endpoints
```

Update `state.tests.backend = "passed"` when all green.

## Reference

`templates/backend/service/` — Express skeleton, migrations, vitest setup
