import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json';

test.beforeEach(async ({ page }) => {
  await page.route('*/**/api/tags', async route => { // declare the route before making the request
    await route.fulfill({
      json: tags
    });
  });
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch();
    const responseJSON = await response.json();
    responseJSON.articles[0].title = 'Playwright API Automation';
    responseJSON.articles[0].favoritesCount = 99999;
    responseJSON.articles[0].description = 'by Mircea';
    await route.fulfill({
      json: responseJSON
    });
  });
  await page.goto('https://conduit.bondaracademy.com/');
});

test('Home page has correct title', async ({ page }) => {
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('.sidebar .tag-pill')).toContainText(['Playwright', 'API', 'Automation']); // add expect to make sure that the test waits for the data to be loaded
  await expect(page.locator('.preview-link h1').first()).toContainText('Playwright API Automation');
  await expect(page.locator('.preview-link p').first()).toContainText('by Mircea');
  await expect(page.locator('app-favorite-button').first()).toContainText('99999');
});