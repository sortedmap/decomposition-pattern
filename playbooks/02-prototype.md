# Playbook 02: Prototype

**Agents:** 03-prototype-designer, 04-prototype-reviewer  
**Output:** `prototype/`

## Steps

1. Copy `templates/prototype/` → `prototype/`
2. Task → Prototype Designer: implement all pages from `pages-spec.md`
3. Orchestrator: `cd prototype && npm install && npm run dev`
4. Orchestrator shows user how to open http://localhost:5173
5. Gate: user reviews, sends feedback
6. Loop: Task → Prototype Reviewer (max 5 iterations)
7. Gate: user says «Прототип утверждён»

## Prototype rules

- Mock data only — `src/data/mock.ts`
- Tailwind classes — no CSS Modules
- Shared layout: header + optional sidebar
- React Router for all routes

## Optional: Figma import

If user provides Figma URL:
- Use figma-implement-design skill on `prototype/` instead of template
- Document link in `docs/design-source.md`

## Quality checklist

- [ ] All routes from pages-spec.md work
- [ ] Navigation between pages works
- [ ] Mock data is realistic (names, dates, statuses)
- [ ] No console errors on navigation
