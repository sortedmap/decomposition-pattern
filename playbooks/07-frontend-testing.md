# Playbook 07: Frontend Testing

**Agent:** 11-frontend-test-engineer  
**Prerequisite:** `state.baseUrl` set, stack running

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
  await page.goto(baseURL + '/');
  await expect(page.getByRole('heading')).toBeVisible();
});
```

Use `e2e/fixtures/auth.ts` for login before protected routes.

## Run

```bash
# Unit
npm test

# E2E (app must be running at baseUrl)
PLAYWRIGHT_BASE_URL=http://localhost:5173 npx playwright test
```

## Fix loop

1. Run all tests
2. On failure — fix frontend or backend
3. Re-run (max 3 iterations)
4. Set `state.tests.frontend = "passed"`

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
