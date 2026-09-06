import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json';

test('Mock API responses', async ({ page }) => {
  await page.route('*/**/api/tags', async route => { // declare the route before making the request
    await route.fulfill({
      json: tags
    });
  });
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch();
    const responseJSON = await response.json();
    responseJSON.articles[0].title = 'Playwright API Automation';
    responseJSON.articles[0].description = 'by Mircea';
    responseJSON.articles[0].favoritesCount = 99999;
    await route.fulfill({
      json: responseJSON
    });
  });
  await page.goto('https://conduit.bondaracademy.com/');
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('.sidebar .tag-pill')).toContainText(['Playwright', 'API', 'Automation']); // add expect to make sure that the test waits for the data to be loaded
  await expect(page.locator('.preview-link h1').first()).toContainText('Playwright API Automation');
  await expect(page.locator('.preview-link p').first()).toContainText('by Mircea');
  await expect(page.locator('app-favorite-button').first()).toContainText('99999');
});

test('Delete an article', async ({ page, request }) => {
  const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user": {
        "email": "mircea.alexandru.vi.raducanu@gmail.com",
        "password": "Testing123!"
      }
    }
  });
  expect(loginResponse.status()).toEqual(200); // always verify responses to make sure that the request was successful
  const responseLoginJSON = await loginResponse.json();
  const token = responseLoginJSON.user.token;
  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {
        "title": "Playwright API Automation",
        "description": "by Mircea",
        "body": "I enjoy Playwright API Automation",
        "tagList": [
          "Playwright",
          "API",
          "Automation"
        ]
      }
    },
    headers: {
      Authorization: `Token ${token}`
    }
  });
  expect(newArticleResponse.status()).toEqual(201);
  await page.goto('https://conduit.bondaracademy.com/');
  await expect(page.locator('.preview-link h1').first()).toContainText('Playwright API Automation');
  await page.getByRole('link', { name: 'Playwright API Automation' }).click();
  await page.getByRole('button', { name: 'Delete Article' }).first().click();
  await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0') // wait for the response to make sure that assertion is made when the application is in the loaded state
  await expect(page.locator('.preview-link h1').first()).not.toContainText('Playwright API Automation');
});

test('Create an article', async ({ page, request }) => {
  await page.goto('https://conduit.bondaracademy.com/');
  await page.getByRole('link', { name: 'New Article' }).click();
  await page.getByRole('textbox', { name: 'Article Title' }).fill('Playwright API Automation');
  await page.getByRole('textbox', { name: `What's this article about?` }).fill('How to automate APIs with Playwright');
  await page.getByRole('textbox', { name: 'Write your article (in markdown)' }).fill('I like automating APIs with Playwright');
  await page.getByRole('button', { name: 'Publish Article' }).click();
  const createArticleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponseJSON = await createArticleResponse.json();
  const slugId = articleResponseJSON.article.slug;
  await expect(page.locator('.article-page h1').first()).toContainText('Playwright API Automation');
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.locator('.article-preview h1').first()).toContainText('Playwright API Automation');
  const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user": {
        "email": "mircea.alexandru.vi.raducanu@gmail.com",
        "password": "Testing123!"
      }
    }
  });
  expect(loginResponse.status()).toEqual(200);
  const responseLoginJSON = await loginResponse.json();
  const token = responseLoginJSON.user.token;
  const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  expect(deleteResponse.status()).toEqual(204);
});