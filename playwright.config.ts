import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1,
  workers: undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  globalSetup: require.resolve('./global-setup.ts'),
  globalTeardown: require.resolve('./global-teardown.ts'),

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'teardown',
      testMatch: /.*\.teardown\.ts/,
    },
    {
      name: 'smoke',
      testMatch: 'smoke.spec.ts',
      teardown: 'teardown',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: 'playwright/.auth/user.json'
      },
      dependencies: ['setup']
    },
    {
      name: 'regression',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: 'playwright/.auth/user.json'
      },
      dependencies: ['setup', 'smoke']
    },
  ],
});
