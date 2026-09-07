
import { test, expect } from '@playwright/test';

test('Smoke test', async ({ page }) => {
  await page.goto('https://conduit.bondaracademy.com/');
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('.preview-link h1').first()).toContainText('Bondar Academy');
});