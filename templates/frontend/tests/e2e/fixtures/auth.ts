import { test as base, expect, type Page } from '@playwright/test';

/**
 * Log in before protected route tests. Adjust selectors to match your auth UI.
 */
export async function loginAsTestUser(page: Page, baseURL: string): Promise<void> {
  await page.goto(`${baseURL}/login`);
  await page.getByLabel(/email/i).fill('test@example.com');
  await page.getByLabel(/password/i).fill('password');
  await page.getByRole('button', { name: /sign in|login|войти/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'));
}

export const test = base.extend({
  authenticatedPage: async ({ page, baseURL }, use) => {
    if (baseURL) {
      await loginAsTestUser(page, baseURL);
    }
    await use(page);
  },
});

export { expect };
