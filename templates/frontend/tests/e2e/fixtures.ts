import { test as base } from '@playwright/test';

export const test = base.extend({
  // Extend with authenticated page if needed
});

export { expect } from '@playwright/test';
