import { test, expect } from './fixtures/auth';

/**
 * Smoke test template — duplicate per route from docs/pages-spec.md
 */
test.describe('Routes smoke', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
});
