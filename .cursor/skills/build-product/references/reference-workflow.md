# Reference Workflow

Proven pipeline for `/build-product`: from requirements to deployed microservices.

## Sequence

1. **Design → Frontend** (optional Figma)
   - Implement UI from Figma or description
   - Pages in `src/pages/`, mock data in `src/data/mock.ts`

2. **Frontend → DB structure**
   - Analyze prototype pages and mock data for entities
   - Output: entity list → later split per bounded context

3. **Architecture document**
   - DDD decomposition, mermaid diagram, service table
   - Output: `docs/architecture.md`

4. **Per-service API + DB docs**
   - OpenAPI and database schema for each microservice
   - Output: `docs/{service}/api.yaml`, `docs/{service}/db.md`

5. **Parallel microservice creation**
   - One Task per service → `backend/{service}/`
   - Final: `backend/docker-compose.yaml`

6. **API Gateway consolidation**
   - Merge all service APIs → `docs/api-gateway.yaml`

7. **Frontend-backend integration**
   - API client, JWT, replace mocks with real endpoints

8. **Tests and deploy**
   - Backend tests per service, frontend integration, deploy, frontend e2e

## Illustrative CRM service map

A typical CRM-like project may include:

| Service | Pages |
|---------|-------|
| identity-service | /register, /settings |
| client-service | /clients |
| deal-service | /deals, /deals/:id |
| task-service | /, /calendar, /tasks/new |
| document-service | /documents, /documents/new |
| analytics-service | dashboard widgets |
| marketing-service | /mailings, /landings |
| knowledge-service | knowledge base link |

Actual services depend on `docs/requirements.md` — not every project needs all of the above.

## Key conventions

- PostgreSQL 15+, UUID PKs, snake_case
- Express + TypeScript + vitest + supertest
- API Gateway on port 8080, frontend dev on 5173
- JWT in localStorage
- Docker compose with one DB container per service

Templates: `templates/backend/service/`, `templates/docs/`, `templates/prototype/`

## Mapping to agents

| Pipeline step | Agent |
|---------------|-------|
| Figma/UI | 03-prototype-designer |
| DB from frontend | 05-architect + 06-api-designer |
| Parallel services | 07-backend-engineer |
| Gateway merge | 06-api-designer |
| FE integration | 10-frontend-engineer |
| Backend tests | 08-backend-test-engineer |
| Deploy | 09-devops-engineer |
| Frontend tests | 11-frontend-test-engineer |
