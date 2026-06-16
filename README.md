# Decomposition Pattern — AI Product Factory

Мультиагентный фреймворк для Cursor: от ТЗ заказчика до протестированного и развёрнутого продукта с микросервисной архитектурой.

**Запуск:** в Cursor вызовите skill `/build-product` и опишите продукт.

---

## Quick start

### Требования

- [Cursor IDE](https://cursor.com)
- Node.js 20+
- Docker и Docker Compose
- OpenSpec (опционально, рекомендуется): `npm install -g @fission-ai/openspec`

### Первый запуск

```bash
git clone https://github.com/YOUR_ORG/decomposition-pattern.git my-product
cd my-product
```

В Cursor:

```
/build-product CRM для малого бизнеса
```

Оркестратор последовательно проведёт через 14 фаз: сбор требований → прототип → архитектура → backend → тесты → frontend → deploy → frontend e2e.

### Что получится на выходе

После прохождения всех 14 фаз `/build-product` создаёт полноценный проект: React frontend, N микросервисов с отдельными БД, API Gateway, docker-compose, автотесты backend и frontend e2e. Конкретный набор сервисов определяется вашим ТЗ — типичный CRM может включать identity, clients, deals, tasks, documents и analytics.

---

## Архитектура пайплайна

```mermaid
flowchart LR
    subgraph phase1 [Фаза 1: Продукт]
        TZ[ТЗ и аналитика]
        Pages[Страницы и функционал]
        Proto[Прототип Vite+React]
        Review[Правки прототипа]
    end

    subgraph phase2 [Фаза 2: Архитектура]
        Stack[Выбор стека]
        DB[Схема БД и DDD]
        API[OpenAPI по сервисам]
        Gateway[API Gateway spec]
    end

    subgraph phase3 [Фаза 3: Реализация]
        MS[Параллельные микросервисы]
        BTests[Backend автотесты]
        Compose[docker-compose]
        FE[Frontend engineer]
        Deploy[Запуск локально или сервер]
        FTests[Frontend автотесты]
    end

    TZ --> Pages --> Proto --> Review
    Review --> Stack --> DB --> API --> Gateway
    Gateway --> MS --> BTests --> Compose --> FE --> Deploy --> FTests
```

---

## Оркестрация в Cursor

```mermaid
sequenceDiagram
    participant User
    participant Orchestrator as OrchestratorSkill
    participant SA as SystemAnalyst
    participant Proto as PrototypeDesigner
    participant Arch as Architect
    participant BE as BackendEngineer_N
    participant BTest as BackendTestEngineer
    participant FE as FrontendEngineer
    participant DevOps as DevOpsEngineer
    participant FTest as FrontendTestEngineer

    User->>Orchestrator: /build-product
    Orchestrator->>User: Вопросы по ТЗ
    User->>Orchestrator: Ответы
    Orchestrator->>SA: Task: requirements.md + pages-spec.md
    SA-->>Orchestrator: артефакты
    Orchestrator->>User: Утвердить требования?
    User->>Orchestrator: Да
    Orchestrator->>Proto: Task: создать prototype/
    Proto-->>Orchestrator: prototype готов
    Orchestrator->>User: Посмотреть прототип, правки?
    User->>Orchestrator: Утверждаю + batch вопросы
    Orchestrator->>Arch: Task: architecture.md
    Arch-->>Orchestrator: docs/architecture.md
    par Parallel services
        Orchestrator->>BE: Task: identity-service
        Orchestrator->>BE: Task: client-service
    end
    BE-->>Orchestrator: backend/* готов
    Orchestrator->>BTest: Task: backend tests
    BTest-->>Orchestrator: все тесты зелёные
    Orchestrator->>FE: Task: frontend integration
    FE-->>Orchestrator: frontend готов
    Orchestrator->>DevOps: Task: deploy + start
    DevOps-->>Orchestrator: URL / localhost
    Orchestrator->>FTest: Task: frontend tests vs running app
    FTest-->>Orchestrator: все тесты зелёные
    Orchestrator->>User: Готово
```

**Правило:** только оркестратор общается с пользователем. Subagent'ы получают промпты из [`.agents/`](.agents/) через Task tool (max 4 параллельных Task).

---

## Карта агентов

| # | Агент | Роль |
|---|-------|------|
| 00 | Orchestrator | Координация, gates, единственный канал к пользователю |
| 01 | System Analyst | Сбор ТЗ, `requirements.md`, `pages-spec.md` |
| 02 | Tech Advisor | Варианты стека, `tech-stack.md` |
| 03 | Prototype Designer | Vite+React+Tailwind прототип с mock-данными |
| 04 | Prototype Reviewer | Правки прототипа по feedback |
| 05 | Architect | DDD, `docs/architecture.md` |
| 06 | API Designer | OpenAPI + db.md per service, API Gateway |
| 07 | Backend Engineer | Микросервисы в `backend/{service}/` |
| 08 | Backend Test Engineer | Vitest per service, цикл до green |
| 09 | DevOps Engineer | docker-compose, SSH deploy, health checks |
| 10 | Frontend Engineer | `prototype/` → `frontend/`, API client, JWT |
| 11 | Frontend Test Engineer | Тесты после запуска, Playwright e2e |

Детали: [AGENTS.md](AGENTS.md) и файлы в [`.agents/`](.agents/).

---

## Фазы и gate'ы

| Фаза | Агент | Gate |
|------|-------|------|
| 0. Bootstrap | Orchestrator | — |
| 1. Discovery | System Analyst | `requirements.md` утверждён |
| 2. Tech Stack | Tech Advisor | `tech-stack.md` утверждён |
| 3. IA / Pages | System Analyst | `pages-spec.md` утверждён |
| 4. Prototype | Prototype Designer | `npm run dev` работает |
| 5. Prototype Review | Prototype Reviewer | «Прототип утверждён» |
| 6. Batch approvals | Orchestrator | deploy, SSH, CI зафиксированы |
| 7. Architecture | Architect | архитектура утверждена |
| 8. API Design | API Designer | спеки утверждены |
| 9. Gateway | API Designer | `docs/api-gateway.yaml` |
| 10. Backend | Backend Engineer × N | все сервисы + compose |
| 11. Backend Tests | Backend Test Engineer | все backend-тесты green |
| 12. Frontend | Frontend Engineer | FE работает с backend |
| 13. Deploy / Start | DevOps Engineer | система доступна |
| 14. Frontend Tests | Frontend Test Engineer | все frontend-тесты green |

Состояние хранится в `.project/state.json` (схема: [templates/project-state.schema.json](templates/project-state.schema.json)).

---

## OpenSpec

OpenSpec — слой живых требований. Агенты читают и пишут артефакты; OpenSpec их версионирует.

| Задача | OpenSpec |
|--------|----------|
| Системный анализ | `proposal.md` + `specs/` |
| Утверждение перед кодом | Review до `/opsx:apply` |
| Микросервисы | Delta-specs per bounded context |
| Параллельная реализация | Task groups в `tasks.md` |
| Архивация | `/opsx:archive` → `openspec/specs/` |

### Инициализация

При первом `/build-product` оркестратор выполняет:

```bash
openspec init   # если openspec/ ещё нет
```

### Команды (в Cursor)

| Команда | Назначение |
|---------|------------|
| `/opsx:propose` | Создать change с proposal, specs, design, tasks |
| `/opsx:apply` | Реализовать tasks из change |
| `/opsx:archive` | Архивировать завершённый change |

Шаблон change: [openspec/changes/_template/](openspec/changes/_template/).

**Fallback:** без OpenSpec — `docs/requirements.md` + `docs/tasks.md`.

---

## Структура репозитория фреймворка

```
decomposition-pattern/
├── README.md                 ← вы здесь
├── AGENTS.md
├── .cursor/skills/build-product/
├── .agents/                  ← 12 ролей subagent'ов
├── templates/                ← стартеры для генерируемых проектов
├── playbooks/                ← пошаговые инструкции по фазам
└── openspec/
```

---

## Структура генерируемого проекта

После прохождения всех фаз `/build-product` создаёт:

```
my-product/
├── .project/
│   ├── state.json
│   └── deploy.json           # SSH/host (не коммитить ключи)
├── .ssh/                     # SSH-ключи (в .gitignore)
├── docs/
│   ├── requirements.md
│   ├── pages-spec.md
│   ├── tech-stack.md
│   ├── architecture.md
│   ├── api-gateway.yaml
│   └── {service}/
│       ├── api.yaml
│       └── db.md
├── prototype/                # на этапе прототипа
├── frontend/                 # после интеграции
│   └── tests/
├── backend/
│   ├── docker-compose.yaml
│   ├── api-gateway/
│   └── {service}/
└── openspec/changes/         # если OpenSpec включён
```

---

## Стек по умолчанию

| Слой | Default | Альтернатива |
|------|---------|--------------|
| Frontend | React + Vite + TS + Tailwind | Next.js |
| Backend | Node.js + Express + TS | Fastify / NestJS |
| DB | PostgreSQL per service | — |
| Auth | JWT | OAuth2 |
| Backend tests | Vitest + supertest | — |
| Frontend tests | Vitest + Testing Library + Playwright | Cypress |
| Deploy | Docker Compose | K8s |
| Events | In-process / optional RabbitMQ | Redis streams |

---

## Деплой и SSH

1. После утверждения прототипа оркестратор спрашивает: **локально или удалённый сервер?**
2. Для сервера: положите ключ в `.ssh/` проекта, укажите host в `.project/deploy.json`
3. DevOps agent: `docker compose up -d` (локально) или SSH + compose (удалённо)
4. Health check всех `/health` endpoints + frontend доступен
5. Frontend Test Engineer получает `baseUrl` для Playwright

Подробнее: [playbooks/06-deploy.md](playbooks/06-deploy.md).

**Безопасность:** `.ssh/` в `.gitignore` — ключи никогда не коммитятся.

---

## Playbooks

| Playbook | Фаза |
|----------|------|
| [01-discovery.md](playbooks/01-discovery.md) | ТЗ, системный анализ |
| [02-prototype.md](playbooks/02-prototype.md) | Прототип Vite+React |
| [03-architecture.md](playbooks/03-architecture.md) | DDD, микросервисы |
| [04-backend.md](playbooks/04-backend.md) | Параллельная реализация backend |
| [05-integration.md](playbooks/05-integration.md) | Frontend + API |
| [06-deploy.md](playbooks/06-deploy.md) | Docker, SSH |
| [07-frontend-testing.md](playbooks/07-frontend-testing.md) | Playwright e2e |

---

## Ограничения и риски

- **Task tool** не гарантирует полную изоляцию subagent'ов — контракты в `.agents/` должны быть строгими
- **OpenSpec** — опциональная npm-зависимость; есть fallback на markdown
- **Параллельные сервисы** — max 4 concurrent Task
- **Frontend e2e** — только после подтверждённого health check DevOps agent'ом
- **SSH deploy** — только с явного разрешения пользователя
- **Цикл исправлений тестов** — max 3 итерации per phase, затем эскалация пользователю

---

## Лицензия

MIT
