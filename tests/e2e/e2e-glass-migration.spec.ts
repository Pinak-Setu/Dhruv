import { test, expect } from '@playwright/test';

test.describe('Glass Section Card Migration E2E Tests', () => {
  test.describe('Dashboard Tab (/dashboard)', () => {
    test('should display dashboard with glass-section-card components', async ({ page }) => {
      await page.goto('/dashboard');

      // Verify page loads (may redirect based on auth, but should have glass cards)
      await expect(page).toHaveTitle(/Analytics|Dashboard/);

      // Check for glass-section-card usage in dashboard
      const glassCards = page.locator('.glass-section-card');
      await expect(glassCards.first()).toBeVisible();

      // Should have at least 2 glass cards (from performance check validation)
      const cardCount = await glassCards.count();
      expect(cardCount).toBeGreaterThanOrEqual(2);

      // Verify glassmorphic styling on first card
      const firstCard = glassCards.first();
      await expect(firstCard).toHaveCSS('backdrop-filter', /blur\(24px\)/);
      await expect(firstCard).toHaveCSS('background', /rgba\(255, 255, 255, 0\.1\)/);
    });
  });

  test.describe('Legacy Component Prevention', () => {
    test('should not contain any glassmorphic-card legacy components', async ({ page }) => {
      // Test the main dashboard route that has been migrated
      await page.goto('/dashboard');

      // Verify no legacy glassmorphic-card class exists
      const legacyCards = page.locator('.glassmorphic-card');
      await expect(legacyCards).toHaveCount(0);
    });
  });

  test.describe('Responsive Design', () => {
    test('should maintain glass-section-card styling on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/dashboard');

      // Check that glass-section-card components are still properly styled
      const glassCards = page.locator('.glass-section-card');
      await expect(glassCards.first()).toBeVisible();

      // Verify glassmorphic styling is maintained
      const firstCard = glassCards.first();
      await expect(firstCard).toHaveCSS('backdrop-filter', /blur\(24px\)/);
    });
  });
});