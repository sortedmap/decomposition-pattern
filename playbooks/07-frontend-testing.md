# Playbook 07: Frontend Testing

**Agent:** 11-frontend-test-engineer  
**Prerequisite:** `state.baseUrl` set, stack running, DevOps API smoke passed

## Test stack

| Layer | Tool |
|-------|------|
| Unit / component | Vitest + @testing-library/react |
| E2E smoke | Playwright |

Templates: `templates/frontend/tests/`

## Setup

```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @playwright/test
npx playwright install chromium
```

Add to `frontend/package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test --config=tests/playwright.config.ts"
  }
}
```

Copy `templates/frontend/tests/vitest.config.ts` and `vitest.setup.ts` to `frontend/tests/` (or project root — match `vitest.config.ts` paths).

## Unit tests

Test key components:
- Forms (validation, submit handler)
- Data tables (renders rows from props)
- Auth guard (redirect when no token)

Location: `frontend/tests/unit/`

## E2E smoke (per route)

For every route in `docs/pages-spec.md`:

```ts
// tests/e2e/routes.spec.ts
test('dashboard loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading')).toBeVisible();
});
```

Use `e2e/fixtures/auth.ts` for login before protected routes.

## Post-deploy (mandatory gate)

E2E **must** run against full `state.baseUrl` (include port if non-80):

```bash
cd frontend
PLAYWRIGHT_BASE_URL="$baseUrl" npm run test:e2e
```

Examples:
- Local dev: `PLAYWRIGHT_BASE_URL=http://localhost:5173`
- Remote nginx: `PLAYWRIGHT_BASE_URL=http://89.223.121.80:8880` — **port required**

Orchestrator must **not** set `tests.frontend = "passed"` unless Playwright exits 0.

Save summary in `docs/deploy-log.md` or `frontend/test-results/.last-run.json`.

## Run

```bash
# Unit
npm test

# E2E (mandatory post-deploy)
PLAYWRIGHT_BASE_URL=http://localhost:5173 npm run test:e2e
```

## Fix loop

1. Run all tests
2. On failure — fix frontend or backend
3. Re-run (max 3 iterations)
4. Set `state.tests.frontend = "passed"` and `e2eLastRun` **only** after Playwright exit 0

## Coverage targets (MVP)

- [ ] Every route: page loads, no console errors
- [ ] Login flow e2e
- [ ] At least one CRUD flow e2e (create → list → detail)
- [ ] Key components have unit tests

## playwright.config.ts

```ts
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
  },
  retries: 1,
});
```

## Definition of Done (orchestrator gate)

- Playwright exit code 0 against `state.baseUrl`
- Results recorded in deploy-log or test-results
- `phase` may advance to `done` only after this
