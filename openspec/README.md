# OpenSpec — Decomposition Pattern

OpenSpec хранит живые требования и change-артефакты для `/build-product`.

## Setup

```bash
npm install
npm run setup -- --tool cursor --clean
```

OpenSpec установлен **локально** (`devDependencies`), без `-g`.

`npm run setup` вызывает `openspec init --tools <id>` из `node_modules/.bin/`.

Вручную:

```bash
npm run openspec -- init --tools cursor
npm run openspec -- --version
```

Перегенерация skill без полного setup:

```bash
npm run init:platforms -- --tools cursor
```

## Структура

```
openspec/
├── specs/              # Постоянные спеки (после archive)
└── changes/
    └── _template/      # Шаблон нового change
        └── specs/      # Delta-specs per capability
```

## Workflow с агентами

| Фаза | OpenSpec |
|------|----------|
| Discovery | `/opsx:propose "{projectName}"` |
| Architecture | Обновить design.md в active change |
| Backend | `/opsx:apply` |
| Done | `/opsx:archive` |

## Fallback

Если `npm install` не выполнен — оркестратор использует `docs/requirements.md` и `docs/tasks.md`.
