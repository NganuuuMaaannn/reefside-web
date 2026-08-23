import { test, expect } from '@playwright/test';

test.describe('Reefside homepage cross-device smoke test', () => {
  test('loads page and key assets on desktop', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
    });

    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    await expect(page.locator('body')).toBeVisible();
    await page.waitForFunction(() => document.querySelectorAll('img, video').length > 0, { timeout: 20000 });
    await expect(page.locator('img, video').first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('text=Scroll down to explore')).toBeVisible({ timeout: 20000 });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);

    expect(errors).toEqual([]);
  });

  test('handles mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    await expect(page.locator('body')).toBeVisible();
    await page.waitForFunction(() => document.querySelectorAll('img, video').length > 0, { timeout: 20000 });
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
  });
});
