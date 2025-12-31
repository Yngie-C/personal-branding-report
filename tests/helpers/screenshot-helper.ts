import { Page, Locator } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Screenshot Helper - Captures screenshots during test execution
 *
 * Features:
 * - Full page screenshots
 * - Element-specific screenshots
 * - Automatic directory creation
 * - Timestamp-based naming
 */

const SCREENSHOTS_DIR = 'tests/reports/screenshots';

/**
 * Ensure screenshots directory exists
 */
function ensureScreenshotsDir(): void {
  try {
    mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

/**
 * Capture full page screenshot
 * @param page - Playwright page object
 * @param testName - Name of the test (for filename)
 * @returns Path to the screenshot file
 */
export async function captureFullPageScreenshot(
  page: Page,
  testName: string
): Promise<string> {
  ensureScreenshotsDir();

  const sanitizedName = testName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const timestamp = Date.now();
  const filename = `full-${sanitizedName}-${timestamp}.png`;
  const path = join(SCREENSHOTS_DIR, filename);

  await page.screenshot({
    path,
    fullPage: true,
    animations: 'disabled', // Disable animations for consistent screenshots
  });

  console.log(`[Screenshot] Captured full page: ${path}`);
  return path;
}

/**
 * Capture screenshot of specific element
 * @param page - Playwright page object
 * @param selector - CSS selector or locator
 * @param testName - Name of the test
 * @returns Path to the screenshot file
 */
export async function captureElementScreenshot(
  page: Page,
  selector: string | Locator,
  testName: string
): Promise<string> {
  ensureScreenshotsDir();

  const sanitizedName = testName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const timestamp = Date.now();
  const filename = `element-${sanitizedName}-${timestamp}.png`;
  const path = join(SCREENSHOTS_DIR, filename);

  const element = typeof selector === 'string' ? page.locator(selector) : selector;

  await element.screenshot({
    path,
    animations: 'disabled',
  });

  console.log(`[Screenshot] Captured element: ${path}`);
  return path;
}

/**
 * Capture screenshot on test failure
 * Designed to be called from test.afterEach or catch blocks
 * @param page - Playwright page object
 * @param testName - Name of the failed test
 * @returns Path to the screenshot file
 */
export async function captureFailureScreenshot(
  page: Page,
  testName: string
): Promise<string> {
  ensureScreenshotsDir();

  const sanitizedName = testName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const timestamp = Date.now();
  const filename = `failure-${sanitizedName}-${timestamp}.png`;
  const path = join(SCREENSHOTS_DIR, filename);

  await page.screenshot({
    path,
    fullPage: true,
    animations: 'disabled',
  });

  console.log(`[Screenshot] Captured failure screenshot: ${path}`);
  return path;
}

/**
 * Capture screenshot with custom filename
 * @param page - Playwright page object
 * @param filename - Custom filename (without extension)
 * @param options - Screenshot options
 * @returns Path to the screenshot file
 */
export async function captureScreenshot(
  page: Page,
  filename: string,
  options?: {
    fullPage?: boolean;
    clip?: { x: number; y: number; width: number; height: number };
  }
): Promise<string> {
  ensureScreenshotsDir();

  const sanitizedFilename = filename.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const timestamp = Date.now();
  const fullFilename = `${sanitizedFilename}-${timestamp}.png`;
  const path = join(SCREENSHOTS_DIR, fullFilename);

  await page.screenshot({
    path,
    fullPage: options?.fullPage ?? false,
    clip: options?.clip,
    animations: 'disabled',
  });

  console.log(`[Screenshot] Captured: ${path}`);
  return path;
}

/**
 * Capture multiple screenshots in sequence
 * Useful for comparing state before/after an action
 * @param page - Playwright page object
 * @param testName - Base name for screenshots
 * @param count - Number of screenshots to take
 * @returns Array of screenshot paths
 */
export async function captureSequence(
  page: Page,
  testName: string,
  count: number = 2
): Promise<string[]> {
  const paths: string[] = [];

  for (let i = 0; i < count; i++) {
    const path = await captureScreenshot(page, `${testName}-seq-${i + 1}`);
    paths.push(path);

    // Small delay between captures
    await page.waitForTimeout(500);
  }

  return paths;
}
