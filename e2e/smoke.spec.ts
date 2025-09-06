import { test, expect } from '@playwright/test';

test('homepage shows table and metrics', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.getByRole('table', { name: 'गतिविधि सारणी' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'स्थान सारांश' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'गतिविधि सारांश' })).toBeVisible();
});

