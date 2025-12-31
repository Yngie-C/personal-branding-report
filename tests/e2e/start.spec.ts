import { test, expect } from '@playwright/test';

/**
 * Start Page E2E Tests
 *
 * Tests for /start page functionality:
 * - Email validation
 * - Session creation API
 * - localStorage persistence
 * - Redirect to /upload
 */

test.describe('Start Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/start');
  });

  test('should display the start page correctly', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('시작하기');

    // Check description text
    await expect(page.locator('text=이메일 주소를 입력하고')).toBeVisible();

    // Check email input exists
    const emailInput = page.locator('input#email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('required', '');

    // Check submit button exists
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('should validate email format with HTML5 validation', async ({ page }) => {
    const emailInput = page.locator('input#email');
    const submitButton = page.locator('button[type="submit"]');

    // Test invalid email format
    await emailInput.fill('invalid-email');

    // Trigger validation by attempting to submit
    await submitButton.click();

    // Check for HTML5 validation message
    const validationMessage = await emailInput.evaluate((input: HTMLInputElement) => {
      return input.validationMessage;
    });

    expect(validationMessage).toBeTruthy();
  });

  test('should disable submit button when email is empty', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');

    // Button should be disabled when email is empty
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when valid email is entered', async ({ page }) => {
    const emailInput = page.locator('input#email');
    const submitButton = page.locator('button[type="submit"]');

    // Enter valid email
    await emailInput.fill('test@example.com');

    // Button should be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should create session and redirect to upload page', async ({ page }) => {
    const emailInput = page.locator('input#email');
    const submitButton = page.locator('button[type="submit"]');

    // Enter email
    const testEmail = `test-${Date.now()}@example.com`;
    await emailInput.fill(testEmail);

    // Submit form
    await submitButton.click();

    // Wait for loading state
    await expect(submitButton).toContainText('처리 중...');

    // Wait for API call to complete
    const response = await page.waitForResponse(
      (resp) => resp.url().includes('/api/session') && resp.request().method() === 'POST'
    );

    // Verify API response
    expect(response.status()).toBe(200);
    const responseData = await response.json();
    expect(responseData).toHaveProperty('session');
    expect(responseData.session).toHaveProperty('id');
    expect(responseData.session.email).toBe(testEmail);

    // Wait for redirect
    await expect(page).toHaveURL('/upload', { timeout: 10000 });

    // Verify sessionId is stored in localStorage
    const sessionId = await page.evaluate(() => localStorage.getItem('sessionId'));
    expect(sessionId).toBeTruthy();
    expect(sessionId).toBe(responseData.session.id);
  });

  test('should display error message when API fails', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/session', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: '서버 오류가 발생했습니다.' }),
      });
    });

    const emailInput = page.locator('input#email');
    const submitButton = page.locator('button[type="submit"]');

    // Enter email and submit
    await emailInput.fill('test@example.com');
    await submitButton.click();

    // Wait for error message to appear
    await expect(page.locator('text=서버 오류가 발생했습니다.')).toBeVisible();

    // Should stay on start page
    await expect(page).toHaveURL('/start');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/session', (route) => {
      route.abort('failed');
    });

    const emailInput = page.locator('input#email');
    const submitButton = page.locator('button[type="submit"]');

    // Enter email and submit
    await emailInput.fill('test@example.com');
    await submitButton.click();

    // Wait for error message (generic network error)
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 5000 });

    // Submit button should be re-enabled
    await expect(submitButton).toBeEnabled();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Get sessionId from localStorage if exists
    const sessionId = await page.evaluate(() => localStorage.getItem('sessionId'));

    if (sessionId) {
      // TODO: Add cleanup logic to delete session from Supabase
      // This will be implemented in Phase 2 with SessionManager
      console.log(`[Cleanup] Session created: ${sessionId} (cleanup not yet implemented)`);

      // Clear localStorage
      await page.evaluate(() => localStorage.clear());
    }
  });
});
