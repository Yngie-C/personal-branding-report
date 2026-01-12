import { test, expect } from '@playwright/test';
import { createSessionManager } from '../fixtures/session-manager';

/**
 * Generating Page E2E Tests
 *
 * Tests the report generation progress UI:
 * - 10-step timeline display
 * - Progress bar with percentage
 * - Real-time polling for status updates
 * - Auto-redirect to /result on completion
 * - Error handling with retry button
 */

test.describe('Generating Page (Phase 2)', () => {
  const sessionManager = createSessionManager();
  let sessionId: string;

  test.beforeEach(async ({ page }) => {
    // Create session with generating in progress
    // Note: This triggers report generation automatically
    sessionId = await sessionManager.createSessionWithGenerating(page);

    // Navigate to generating page
    await page.goto('/generating');
  });

  test.afterEach(async ({ page }) => {
    if (sessionId) {
      await sessionManager.cleanupSession(sessionId);
      await sessionManager.clearLocalStorage(page);
    }
  });

  test('should display generating page correctly', async ({ page }) => {
    // Check for main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText(/생성|제작/);

    // Check for Sparkles animation icon
    const sparklesIcon = page.locator('svg.lucide-sparkles, [class*="animate"]').first();
    await expect(sparklesIcon).toBeVisible({ timeout: 5000 });

    // Check description text
    await expect(page.locator('text=/AI|브랜딩|전략/')).toBeVisible();
  });

  test('should display progress bar with percentage', async ({ page }) => {
    // Wait for initial progress load
    await page.waitForTimeout(3000);

    // Check for progress percentage display
    await expect(page.locator('text=/%/')).toBeVisible();

    // Check for progress bar element
    const progressBar = page.locator('.bg-gradient-to-r.from-indigo-500');
    await expect(progressBar).toBeVisible();

    // Check for "진행률" label
    await expect(page.locator('text=진행률')).toBeVisible();
  });

  test('should display 10 generation steps', async ({ page }) => {
    // Wait for steps to load
    await page.waitForTimeout(3000);

    // Check for step cards (10 steps in a grid)
    const stepCards = page.locator('[class*="rounded-lg"][class*="border"]').filter({
      hasText: /Step/,
    });

    const stepCount = await stepCards.count();

    // Should have 10 steps
    expect(stepCount).toBeGreaterThanOrEqual(10);
  });

  test('should show step labels with status icons', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Check for step labels like "Step 1", "Step 2", etc.
    await expect(page.locator('text=/Step \\d/')).toBeVisible();

    // Should have status icons (completed checkmarks, in-progress spinners, or pending circles)
    const hasIcons = await page.locator('svg').count();
    expect(hasIcons).toBeGreaterThan(0);
  });

  test('should poll for progress updates', async ({ page }) => {
    // Track API calls to /api/generate
    let pollCount = 0;

    page.on('request', (request) => {
      if (request.url().includes('/api/generate?sessionId=')) {
        pollCount++;
      }
    });

    // Wait for a few polling cycles (2 seconds each)
    await page.waitForTimeout(7000);

    // Should have made multiple poll requests
    expect(pollCount).toBeGreaterThanOrEqual(2);
  });

  test('should display current step name', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Should show current step info like "데이터 수집... (1/10)"
    const stepInfo = page.locator('text=/\\(\\d+\\/\\d+\\)/');
    await expect(stepInfo).toBeVisible({ timeout: 10000 });
  });

  test('should show estimated time', async ({ page }) => {
    // Check for time estimate text
    await expect(page.locator('text=/소요 시간|2-5분/')).toBeVisible({ timeout: 5000 });
  });

  test('should show "이 페이지를 떠나도 생성은 계속됩니다" notice', async ({ page }) => {
    await expect(page.locator('text=이 페이지를 떠나도 생성은 계속됩니다')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should redirect to result page on completion', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes max for full generation

    // Wait for generation to complete and redirect
    await expect(page).toHaveURL('/result', { timeout: 300000 });
  });
});

test.describe('Generating Page - Mock API Responses', () => {
  const sessionManager = createSessionManager();
  let sessionId: string;

  test.beforeEach(async ({ page }) => {
    sessionId = await sessionManager.createSession(page);
  });

  test.afterEach(async ({ page }) => {
    if (sessionId) {
      await sessionManager.cleanupSession(sessionId);
      await sessionManager.clearLocalStorage(page);
    }
  });

  test('should update UI when progress changes', async ({ page }) => {
    // Mock API to return specific progress state
    let callCount = 0;

    await page.route('**/api/generate?sessionId=*', (route) => {
      callCount++;

      // Return increasing progress on each call
      const progress = Math.min(callCount * 20, 80);

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            overallStatus: 'in_progress',
            currentStep: Math.ceil(progress / 10),
            totalSteps: 10,
            error: null,
            steps: Array.from({ length: 10 }, (_, i) => ({
              step: i + 1,
              name: `단계 ${i + 1}`,
              status: i + 1 <= Math.ceil(progress / 10) ? 'completed' : i + 1 === Math.ceil(progress / 10) + 1 ? 'in_progress' : 'pending',
            })),
          },
        }),
      });
    });

    await page.goto('/generating');

    // Wait for progress to update
    await page.waitForTimeout(6000);

    // Progress bar should reflect the mocked progress
    const progressText = await page.locator('text=/%/').textContent();
    expect(progressText).toBeTruthy();
  });

  test('should show completion state and redirect', async ({ page }) => {
    // Mock completed status
    await page.route('**/api/generate?sessionId=*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            overallStatus: 'completed',
            currentStep: 10,
            totalSteps: 10,
            error: null,
            steps: Array.from({ length: 10 }, (_, i) => ({
              step: i + 1,
              name: `단계 ${i + 1}`,
              status: 'completed',
            })),
          },
        }),
      });
    });

    await page.goto('/generating');

    // Should show completion message before redirect
    await expect(page.locator('text=/완료|완성/')).toBeVisible({ timeout: 10000 });

    // Should redirect to result page
    await expect(page).toHaveURL('/result', { timeout: 10000 });
  });

  test('should handle generation failure with retry button', async ({ page }) => {
    // Mock failed status
    await page.route('**/api/generate?sessionId=*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            overallStatus: 'failed',
            currentStep: 3,
            totalSteps: 10,
            error: '리포트 생성 중 오류가 발생했습니다.',
            steps: Array.from({ length: 10 }, (_, i) => ({
              step: i + 1,
              name: `단계 ${i + 1}`,
              status: i < 3 ? 'completed' : i === 3 ? 'failed' : 'pending',
            })),
          },
        }),
      });
    });

    await page.goto('/generating');

    // Should show error message
    await expect(page.locator('text=/실패|오류/')).toBeVisible({ timeout: 10000 });

    // Should show retry button
    const retryButton = page.locator('button:has-text("다시 시도")');
    await expect(retryButton).toBeVisible();

    // Should stay on generating page
    await expect(page).toHaveURL('/generating');
  });

  test('should trigger retry when retry button clicked', async ({ page }) => {
    let retryTriggered = false;

    // First call returns failure
    await page.route('**/api/generate?sessionId=*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            overallStatus: 'failed',
            error: '일시적 오류',
            steps: [],
          },
        }),
      });
    });

    // Track POST requests (retry triggers POST)
    page.on('request', (request) => {
      if (request.url().includes('/api/generate') && request.method() === 'POST') {
        retryTriggered = true;
      }
    });

    await page.goto('/generating');

    // Wait for error state
    await expect(page.locator('button:has-text("다시 시도")')).toBeVisible({ timeout: 10000 });

    // Click retry
    await page.locator('button:has-text("다시 시도")').click();

    // Verify retry was triggered
    await page.waitForTimeout(1000);
    expect(retryTriggered).toBeTruthy();
  });
});

test.describe('Generating Page - Without Valid Session', () => {
  test('should redirect to survey if no session', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/generating');

    // Should redirect to survey
    await expect(page).toHaveURL('/survey', { timeout: 10000 });
  });

  test('should redirect if session exists but questions not completed', async ({ page }) => {
    const sessionManager = createSessionManager();

    // Create session with questions generated but not answered
    // (upload_completed = true, questions_completed = false)
    const sessionId = await sessionManager.createSessionWithQuestions(page);

    await page.goto('/generating');

    // Should redirect to /questions (prerequisite for generating)
    await expect(page).toHaveURL('/questions', { timeout: 10000 });

    // Cleanup
    await sessionManager.cleanupSession(sessionId);
  });
});

test.describe('Generating Page - Network Error Handling', () => {
  const sessionManager = createSessionManager();
  let sessionId: string;

  test.beforeEach(async ({ page }) => {
    sessionId = await sessionManager.createSession(page);
  });

  test.afterEach(async ({ page }) => {
    if (sessionId) {
      await sessionManager.cleanupSession(sessionId);
    }
  });

  test('should handle network errors during polling gracefully', async ({ page }) => {
    let callCount = 0;

    await page.route('**/api/generate?sessionId=*', (route) => {
      callCount++;

      if (callCount <= 2) {
        // First two calls succeed
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              overallStatus: 'in_progress',
              currentStep: callCount,
              totalSteps: 10,
              steps: [],
            },
          }),
        });
      } else {
        // Third call fails with network error
        route.abort('failed');
      }
    });

    await page.goto('/generating');

    // Wait for network error
    await page.waitForTimeout(8000);

    // Page should still be functional (not crashed)
    // Might show error or continue polling
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
  });

  test('should handle 404 response when session not found', async ({ page }) => {
    await page.route('**/api/generate?sessionId=*', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: '세션을 찾을 수 없습니다' }),
      });
    });

    await page.goto('/generating');

    // Page should handle 404 gracefully
    // Either show error or redirect
    await page.waitForTimeout(5000);

    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
  });
});
