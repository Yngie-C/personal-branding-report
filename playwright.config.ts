import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Personal Branding Report E2E Tests
 *
 * See https://playwright.dev/docs/test-configuration.
 */

// Load environment variables from .env.local
// Note: Environment variables should be set in .env.local or GitHub Secrets
// DO NOT hardcode sensitive values here

export default defineConfig({
  testDir: './tests/e2e',

  /* Run tests in files in parallel */
  fullyParallel: true, // Enable parallel execution for faster CI runs

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Workers for parallel execution */
  // CI uses sharding (--shard flag), so we can use multiple workers per shard
  // Local development uses 1 worker to avoid session conflicts
  workers: process.env.CI ? 2 : 1,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'tests/reports/test-results.json' }],
    ['list'],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Custom header for test identification */
    extraHTTPHeaders: {
      'X-Test-Mode': 'true',
    },
  },

  /* Configure timeout */
  timeout: 120000, // 2 minutes (to account for LLM calls)

  /* Configure expect timeout */
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes to start server
  },

  /* Global setup/teardown scripts */
  // globalSetup: require.resolve('./playwright-global-setup'),
  // globalTeardown: require.resolve('./playwright-global-teardown'),
});
