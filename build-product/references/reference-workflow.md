# Reference Workflow

Proven pipeline for `/build-product`: from requirements to deployed microservices.

## Sequence

1. **Design → Frontend** (optional Figma)
2. **Frontend → DB structure** — entities from prototype
3. **Architecture document** — `docs/architecture.md`
4. **Per-service API + DB docs**
5. **Parallel microservice creation** (when platform supports it)
6. **API Gateway consolidation**
7. **Frontend-backend integration**
8. **Tests and deploy**

See [orchestrator-playbook.md](../orchestrator-playbook.md) for full 14-phase state machine.

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
