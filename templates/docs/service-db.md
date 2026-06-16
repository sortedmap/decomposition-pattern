# SERVICE_NAME — Database Schema

**Database:** `app_SERVICE_NAME`  
**СУБД:** PostgreSQL 15+

## Conventions

- UUID primary keys (`gen_random_uuid()`)
- `snake_case` for tables and columns
- `created_at`, `updated_at` TIMESTAMPTZ on all tables

---

## Tables

### `example_table`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| name | VARCHAR(255) | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |

## Migrations

1. `001_init.sql` — example_table

## Cross-service references

Fields like `user_id`, `company_id` in this service are **logical UUID references** without FK to other databases.
