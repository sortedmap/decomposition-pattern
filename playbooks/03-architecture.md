# Playbook 03: Architecture & API Design

**Agents:** 05-architect, 06-api-designer  
**Outputs:** `docs/architecture.md`, `docs/{service}/`, `docs/api-gateway.yaml`

## Architecture

1. Task → Architect: analyze prototype pages + mock data
2. Write `docs/architecture.md`:
   - DDD bounded contexts
   - Mermaid service diagram
   - Service table with DB names, aggregates, pages
   - Domain events
3. Update `.project/state.json` → `services[]`
4. Gate: user approves architecture

## Per-service docs (parallel)

For each service in `services[]` (max 4 parallel Tasks):

1. Task → API Designer: `docs/{service}/api.yaml` + `db.md`
2. Cover all frontend actions for that bounded context

## Gateway

1. Task → API Designer: merge into `docs/api-gateway.yaml`
2. Single `/api/v1/*` entry, JWT security scheme
3. Gate: user approves API specs

## DB conventions

- PostgreSQL 15+ per service
- UUID primary keys
- `snake_case` tables and columns
- `created_at`, `updated_at` on all tables
- Cross-service refs: UUID without FK

## Типичный mapping (CRM-подобный проект)

| Frontend area | Likely service |
|---------------|----------------|
| Auth, profile | identity-service |
| Clients, companies | client-service |
| Deals, pipeline | deal-service |
| Tasks, calendar | task-service |
| Documents | document-service |
| Dashboard stats | analytics-service |
| Mailings | marketing-service |
| Knowledge base | knowledge-service |

Adjust based on actual requirements — not every project needs all 8.
