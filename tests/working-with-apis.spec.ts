import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://conduit.bondaracademy.com/api/');
});

test('Home page has correct title', async ({ page }) => {
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
});