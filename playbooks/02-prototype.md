# Playbook 02: Prototype

**Agents:** 03-prototype-designer, 04-prototype-reviewer  
**Output:** `prototype/`

## Steps

1. Copy `templates/prototype/` → `prototype/` (`rsync -a templates/prototype/ prototype/`)
2. Task → Prototype Designer: implement all pages from `pages-spec.md`
3. Orchestrator (after agent 03):
   - `cd prototype && npm install`
   - `npm run dev` in **background** (or verify build + Tailwind in `dist/assets/*.css`)
4. Orchestrator tells user the **full launch block** (see below) + warning about Live Preview
5. Gate: user reviews styled UI, sends feedback
6. Loop: Task → Prototype Reviewer (max 5 iterations)
7. Gate: user says «Прототип утверждён»

## Orchestrator message to user (template)

```
Прототип готов. Запуск:

cd prototype
npm install
npm run dev

→ откройте URL из вывода Vite (обычно http://localhost:5173)

⚠️ Не используйте Live Preview и не открывайте index.html напрямую —
   Tailwind CSS работает только через Vite dev server.
```

If orchestrator started dev server in background — include the actual URL from Vite stdout (port may differ from 5173).

## Prototype rules

- Mock data only — `src/data/mock.ts`
- Tailwind utility classes only — no CSS Modules
- Shared layout: header + optional sidebar
- React Router for all routes
- **Preserve Tailwind v4 chain** from template (see agent 03)

## Optional: Figma import

If user provides Figma URL:
- Use figma-implement-design skill on `prototype/` instead of template
- Document link in `docs/design-source.md`

## Quality checklist

- [ ] All routes from pages-spec.md work
- [ ] Navigation between pages works
- [ ] Mock data is realistic (names, dates, statuses)
- [ ] No console errors on navigation
- [ ] **Styled UI** — Tailwind layout/colors visible, not unstyled HTML
- [ ] Dev server running from `prototype/` after `npm install`
- [ ] Browser opened at Vite URL, not `file://` or Live Preview

## Troubleshooting: page without styles

| Symptom | Cause | Fix |
|---------|-------|-----|
| HTML renders, no colors/layout | Opened `index.html` via Live Preview or `file://` | Use `npm run dev` in `prototype/` |
| `npm run dev` fails | No `npm install` in `prototype/` | `cd prototype && npm install` |
| Classes in DOM but no styling | Tailwind chain broken by agent | Restore `vite.config.ts`, `main.tsx`, `index.css` from template |
| Wrong port | 5173 busy | Use URL from Vite stdout |

See also `prototype/README.md` (copied from template).
