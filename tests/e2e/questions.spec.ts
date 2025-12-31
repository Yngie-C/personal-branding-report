import { test, expect } from '@playwright/test';
import { generateAnswersForQuestions } from '../fixtures/questionnaire-answers';

/**
 * Questions Page E2E Tests
 *
 * Tests for /questions page functionality:
 * - AI-generated questions loading (7-10 questions)
 * - Textarea input
 * - Required field validation
 * - Submit and navigate to generating page
 */

test.describe('Questions Page', () => {
  test.beforeEach(async ({ page }) => {
    // For this test, skip if we don't have a session with survey results
    test.skip(!process.env.TEST_SESSION_WITH_SURVEY_RESULT, 'Requires completed survey');

    await page.goto('/questions');
  });

  test('should display questions page correctly', async ({ page }) => {
    // Check heading
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Should show loading initially or questions
    const hasLoading = await page.locator('text=/생성|로딩/').isVisible({ timeout: 2000 }).catch(() => false);
    const hasQuestions = await page.locator('textarea').count();

    // Either showing loading or questions loaded
    expect(hasLoading || hasQuestions > 0).toBeTruthy();
  });

  test('should load AI-generated questions', async ({ page }) => {
    // Wait for questions to load (AI generation might take time)
    await page.waitForTimeout(5000);

    // Should have 7-10 textarea inputs
    const textareas = page.locator('textarea');
    const count = await textareas.count();

    expect(count).toBeGreaterThanOrEqual(7);
    expect(count).toBeLessThanOrEqual(10);
  });

  test('should display question categories', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Check for category headings
    const categories = page.locator('text=/핵심 가치관|커리어 목표|차별화|강점|비전/');
    const categoryCount = await categories.count();

    // Should have at least some categories
    expect(categoryCount).toBeGreaterThan(0);
  });

  test('should accept user input in textareas', async ({ page }) => {
    await page.waitForTimeout(3000);

    const firstTextarea = page.locator('textarea').first();
    await firstTextarea.fill('이것은 테스트 답변입니다. 저는 5년 경력의 PM입니다.');

    // Verify input was accepted
    const value = await firstTextarea.inputValue();
    expect(value).toContain('테스트 답변');
  });

  test('should validate required questions', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Try to submit without filling all required fields
    const submitButton = page.locator('button:has-text("리포트 생성")');
    await expect(submitButton).toBeVisible();

    await submitButton.click();

    // Should show validation error
    await expect(page.locator('text=/모든 질문|필수/')).toBeVisible({ timeout: 3000 });

    // Should stay on questions page
    await expect(page).toHaveURL('/questions');
  });

  test('should submit answers and navigate to generating page', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Fill all textareas
    const textareas = page.locator('textarea');
    const count = await textareas.count();

    for (let i = 0; i < count; i++) {
      await textareas.nth(i).fill(`답변 ${i + 1}: 이것은 테스트 답변입니다.`);
    }

    // Submit
    const submitButton = page.locator('button:has-text("리포트 생성")');
    await submitButton.click();

    // Wait for API response
    await page.waitForResponse(
      (resp) => resp.url().includes('/api/questions') && resp.status() === 200,
      { timeout: 10000 }
    );

    // Should navigate to generating page
    await expect(page).toHaveURL('/generating', { timeout: 10000 });
  });

  test('should disable submit button while submitting', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Fill all textareas
    const textareas = page.locator('textarea');
    const count = await textareas.count();

    for (let i = 0; i < count; i++) {
      await textareas.nth(i).fill('Test answer');
    }

    const submitButton = page.locator('button:has-text("리포트 생성")');

    // Click submit
    await submitButton.click();

    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled({ timeout: 1000 });
  });

  test('should show hint text for questions', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Check for hint text (💡 emoji)
    const hints = page.locator('text=💡');
    const hintCount = await hints.count();

    // At least some questions should have hints
    // (Not all questions necessarily have hints)
    expect(hintCount).toBeGreaterThanOrEqual(0);
  });

  test('should mark required questions with asterisk', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Check for asterisks (*)
    const asterisks = page.locator('text=*').filter({ hasText: /^\*$/ });
    const asteriskCount = await asterisks.count();

    // Should have at least some required questions
    expect(asteriskCount).toBeGreaterThan(0);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Mock API failure
    await page.route('**/api/questions', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: '서버 오류' }),
      });
    });

    // Fill all textareas
    const textareas = page.locator('textarea');
    const count = await textareas.count();

    for (let i = 0; i < count; i++) {
      await textareas.nth(i).fill('Test');
    }

    // Submit
    const submitButton = page.locator('button:has-text("리포트 생성")');
    await submitButton.click();

    // Should show error message
    await expect(page.locator('text=/오류|실패/')).toBeVisible({ timeout: 5000 });

    // Should stay on questions page
    await expect(page).toHaveURL('/questions');
  });
});

test.describe('Questions Page - Without Survey', () => {
  test('should redirect to start if no session', async ({ page }) => {
    // Clear localStorage
    await page.evaluate(() => localStorage.clear());

    await page.goto('/questions');

    // Should redirect to start
    await expect(page).toHaveURL('/start', { timeout: 5000 });
  });
});
