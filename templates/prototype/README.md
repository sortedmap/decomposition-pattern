# Prototype — локальный запуск

Интерактивный UI-прототип (Vite + React + Tailwind v4). Mock-данные, без backend.

## Требования

- Node.js **≥ 20.19**

## Запуск (обязательно)

```bash
cd prototype
npm install
npm run dev
```

Откройте **только** URL из вывода Vite (обычно `http://localhost:5173`).

Если порт 5173 занят, Vite выберет следующий (5174, …) — используйте URL из stdout.

## Не делайте так

Tailwind v4 генерирует CSS **только** через Vite dev/build pipeline (`@tailwindcss/vite`).

**Не работает** (страница без стилей):

- Live Preview / «Open in Browser» на `index.html`
- Открытие `index.html` через `file://`
- Статический HTTP-сервер без Vite

## Сборка (опционально)

```bash
npm run build
npm run preview   # http://localhost:4173
```

Preview тоже требует `npm run preview`, не открывайте `dist/index.html` напрямую.

## Troubleshooting: страница без стилей

1. Запускаете из **`prototype/`**, не из корня репозитория?
2. Выполнили **`npm install`** в `prototype/`? (корневой `npm install` не ставит зависимости прототипа)
3. Открыли URL из **`npm run dev`**, а не Live Preview?
4. Проверьте цепочку Tailwind v4 (не удаляйте):
   - `vite.config.ts` — plugin `tailwindcss()` из `@tailwindcss/vite`
   - `src/main.tsx` — `import './index.css'`
   - `src/index.css` — `@import "tailwindcss"`

## Стек

| Слой | Технология |
|------|------------|
| UI | React 19 + TypeScript |
| Сборка | Vite 6 |
| Стили | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Роутинг | React Router |
