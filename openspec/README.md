# OpenSpec — Decomposition Pattern

OpenSpec хранит живые требования и change-артефакты для `/build-product`.

## Setup

```bash
npm install -g @fission-ai/openspec
openspec init --tools cursor    # same tool IDs as decomposition-pattern
npm run init:platforms -- --tools cursor
```

Use the **same `--tools` list** for OpenSpec and `init:platforms`.

## Структура

```
openspec/
├── specs/              # Постоянные спеки (после archive)
└── changes/
    └── _template/      # Шаблон нового change
```

## Workflow с агентами

| Фаза | OpenSpec |
|------|----------|
| Discovery | `/opsx:propose "{projectName}"` |
| Architecture | Обновить design.md в active change |
| Backend | `/opsx:apply` |
| Done | `/opsx:archive` |

## Fallback

Если OpenSpec CLI недоступен — оркестратор использует `docs/requirements.md` и `docs/tasks.md`.
