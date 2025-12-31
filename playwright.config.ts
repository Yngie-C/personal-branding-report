import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Personal Branding Report E2E Tests
 *
 * See https://playwright.dev/docs/test-configuration.
 */

// Set environment variables for tests (from .env.local)
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://ujzwvaafodsvduehdvom.supabase.co';
process.env.NEXT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_oLV3AjbxLbh5vCeE02divA_oJ9fM_37';
process.env.NEXT_SUPABASE_SECRET_KEY = 'sb_secret_e5tpZKIpSShtZmCjExkGUw_w85vswWY';

export default defineConfig({
  testDir: './tests/e2e',

  /* Run tests in files in parallel */
  fullyParallel: false, // Disable parallel to avoid localStorage/session conflicts

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : 1, // Single worker to prevent session conflicts

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
