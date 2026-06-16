# Карта агентов

Главный skill `/build-product` — единственная точка общения с пользователем. Все остальные агенты вызываются оркестратором через Task tool.

| # | Файл | Роль | Основные артефакты |
|---|------|------|-------------------|
| 00 | [.agents/00-orchestrator.md](.agents/00-orchestrator.md) | Координация, gates | `.project/state.json` |
| 01 | [.agents/01-system-analyst.md](.agents/01-system-analyst.md) | Системный анализ | `docs/requirements.md`, `docs/pages-spec.md` |
| 02 | [.agents/02-tech-advisor.md](.agents/02-tech-advisor.md) | Выбор стека | `docs/tech-stack.md` |
| 03 | [.agents/03-prototype-designer.md](.agents/03-prototype-designer.md) | Прототип UI | `prototype/` |
| 04 | [.agents/04-prototype-reviewer.md](.agents/04-prototype-reviewer.md) | Правки прототипа | обновления `prototype/` |
| 05 | [.agents/05-architect.md](.agents/05-architect.md) | DDD-архитектура | `docs/architecture.md` |
| 06 | [.agents/06-api-designer.md](.agents/06-api-designer.md) | OpenAPI + БД | `docs/{service}/api.yaml`, `db.md` |
| 07 | [.agents/07-backend-engineer.md](.agents/07-backend-engineer.md) | Микросервисы | `backend/{service}/` |
| 08 | [.agents/08-backend-test-engineer.md](.agents/08-backend-test-engineer.md) | Backend-тесты | `backend/*/tests/` |
| 09 | [.agents/09-devops-engineer.md](.agents/09-devops-engineer.md) | Deploy | `backend/docker-compose.yaml` |
| 10 | [.agents/10-frontend-engineer.md](.agents/10-frontend-engineer.md) | Frontend + API | `frontend/` |
| 11 | [.agents/11-frontend-test-engineer.md](.agents/11-frontend-test-engineer.md) | Frontend-тесты | `frontend/tests/`, Playwright |

Подробная документация: [README.md](README.md).
