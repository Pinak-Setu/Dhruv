import { test, expect } from '@playwright/test';

test('विवरण column truncates with title containing full text', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const cell = page.locator('td[aria-label="विवरण"]').first();
  const text = await cell.textContent();
  const title = await cell.getAttribute('title');
  expect(text?.length || 0).toBeLessThanOrEqual(80);
  expect((title?.length || 0) >= (text?.length || 0)).toBeTruthy();
});
