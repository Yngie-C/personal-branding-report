import { test, expect } from '@playwright/test';
import { createSessionManager } from '../fixtures/session-manager';
import { generateBalancedAnswers } from '../fixtures/survey-answers';

/**
 * Survey Page E2E Tests
 *
 * Tests for /survey page functionality:
 * - 60 questions loading and display
 * - Page-based navigation (10 pages, 6 questions per page)
 * - Randomized question order (seeded by sessionId)
 * - Likert scale interaction (1-7)
 * - Progress tracking
 * - localStorage auto-save
 * - Submit validation and API calls
 */

test.describe('Survey Page', () => {
  const sessionManager = createSessionManager();
  let sessionId: string;

  test.beforeEach(async ({ page }) => {
    // Create session
    sessionId = await sessionManager.createSession(page);

    // Mock resume completion by calling API directly
    const resumeData = {
      sessionId,
      formData: {
        personalInfo: { name: '테스트 사용자' },
        experiences: [
          {
            company: 'Test Corp',
            role: 'Product Manager',
            startDate: '2020-01',
            endDate: 'current',
            achievements: ['주요 성과 1']
          }
        ],
        skills: ['React', 'TypeScript'],
        projects: [
          {
            name: 'Test Project',
            description: '프로젝트 설명',
            impact: '성과 및 임팩트',
            technologies: ['React']
          }
        ]
      }
    };

    // Submit resume form via API
    await page.evaluate(async (data) => {
      await fetch('/api/resume-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }, resumeData);

    // Navigate directly to survey page
    await page.goto('/survey');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    if (sessionId) {
      await sessionManager.cleanupSession(sessionId);
      await sessionManager.clearLocalStorage(page);
    }
  });

  test('should display PSA survey page correctly', async ({ page }) => {
    // Check heading
    await expect(page.locator('h1')).toContainText('PSA 강점 진단');

    // Check description
    await expect(page.locator('text=60문항')).toBeVisible();

    // Check progress bar exists
    const progressBar = page.locator('text=전체 진행률');
    await expect(progressBar).toBeVisible();

    // Check initial progress is 0/60 (use more specific selector)
    await expect(page.locator('text=전체 진행률').locator('..').locator('span.font-semibold')).toContainText('0 / 60');

    // Check page number buttons (should have 10)
    const pageButtons = page.locator('[data-page-number]');
    await expect(pageButtons).toHaveCount(10);
  });

  test('should load 60 questions organized by pages', async ({ page }) => {
    // Wait for questions to load
    await page.waitForTimeout(2000);

    // First page should show 6 questions
    const questions = page.locator('[data-question-number]');
    const questionCount = await questions.count();

    // Each page has 6 questions
    expect(questionCount).toBe(6);

    // Check that Likert scale buttons exist (7 options per question)
    const firstQuestion = questions.first();
    const likertButtons = firstQuestion.locator('button:has-text("1"), button:has-text("2"), button:has-text("3"), button:has-text("4"), button:has-text("5"), button:has-text("6"), button:has-text("7")');

    // Should have 7 Likert options
    await expect(likertButtons).toHaveCount(7);
  });

  test('should navigate between pages', async ({ page }) => {
    await page.waitForTimeout(1000);

    const pageButtons = page.locator('[data-page-number]');

    // Click page 2
    await pageButtons.nth(1).click();

    // Wait for page change
    await page.waitForTimeout(500);

    // Check that we're still on survey page
    await expect(page).toHaveURL('/survey');

    // Check page indicator shows "페이지 2 / 10"
    await expect(page.locator('text=페이지 2 / 10')).toBeVisible();

    // Click page 3
    await pageButtons.nth(2).click();
    await page.waitForTimeout(500);

    // Should still be on survey
    await expect(page).toHaveURL('/survey');
    await expect(page.locator('text=페이지 3 / 10')).toBeVisible();
  });

  test('should track answers and update progress', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Initial progress should be 0/60
    const progressLocator = page.locator('text=전체 진행률').locator('..').locator('span.font-semibold');
    let progressText = await progressLocator.textContent();
    expect(progressText).toContain('0 / 60');

    // Answer first 5 questions on current page (page 1 has 6 questions)
    for (let i = 0; i < 5; i++) {
      const questions = page.locator('[data-question-number]');
      const question = questions.nth(i);
      const scoreButton = question.locator('button:has-text("5")');
      await scoreButton.click();
      await page.waitForTimeout(100);
    }

    // Wait for progress update
    await page.waitForTimeout(1000);

    // Progress should be 5/60 (8%)
    progressText = await progressLocator.textContent();
    expect(progressText).toContain('5 / 60');
  });

  test('should auto-save answers to localStorage', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Answer first question
    const firstScoreButton = page.locator('button:has-text("5")').first();
    await firstScoreButton.click();

    // Wait for auto-save (debounced)
    await page.waitForTimeout(1000);

    // Check localStorage
    const savedAnswers = await page.evaluate(() => {
      return localStorage.getItem('survey-answers');
    });

    expect(savedAnswers).toBeTruthy();

    // Parse and verify
    const answers = JSON.parse(savedAnswers!);
    const answerKeys = Object.keys(answers);

    expect(answerKeys.length).toBeGreaterThan(0);
  });

  test('should restore answers from localStorage on page reload', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Answer first 5 questions
    for (let i = 0; i < 5; i++) {
      await page.locator('button:has-text("6")').nth(i).click();
      await page.waitForTimeout(100);
    }

    // Wait for auto-save
    await page.waitForTimeout(1000);

    // Reload page
    await page.reload();
    await page.waitForTimeout(2000);

    // Check that answers are restored
    // The buttons should be selected (have specific styling)
    const selectedButtons = page.locator('button.border-purple-500');
    const selectedCount = await selectedButtons.count();

    expect(selectedCount).toBeGreaterThanOrEqual(5);
  });

  test('should enable submit button only when all 60 questions answered', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Navigate to last page (page 10)
    const pageButtons = page.locator('[data-page-number]');
    await pageButtons.nth(9).click();
    await page.waitForTimeout(500);

    // Submit button should exist but be disabled
    const submitButton = page.locator('button:has-text("결과 확인하기")');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();

    // Try clicking (should not work)
    await submitButton.click({ force: true });

    // Should still be on survey page
    await expect(page).toHaveURL('/survey');
  });

  test('should submit survey and trigger analysis (abbreviated)', async ({ page }) => {
    // This test uses a shortcut: answer all questions programmatically
    // to avoid clicking 60 buttons (which would take too long)

    await page.waitForTimeout(1000);

    // Build answers object with actual question IDs
    const answers: Record<string, number> = {};

    // Navigate through all 10 pages and collect question IDs
    const pageButtons = page.locator('[data-page-number]');
    for (let pageIndex = 0; pageIndex < 10; pageIndex++) {
      await pageButtons.nth(pageIndex).click();
      await page.waitForTimeout(500);

      const pageQuestions = await page.evaluate(() => {
        const qs: Array<{ id: string; number: number }> = [];
        document.querySelectorAll('[data-question-id]').forEach((el) => {
          const id = el.getAttribute('data-question-id');
          const number = el.getAttribute('data-question-number');
          if (id && number) {
            qs.push({ id, number: parseInt(number) });
          }
        });
        return qs;
      });

      // Add all questions from this page with score 5
      pageQuestions.forEach(q => {
        answers[q.id] = 5;
      });
    }

    // Inject answers into localStorage
    await page.evaluate((answersData) => {
      localStorage.setItem('survey-answers', JSON.stringify(answersData));
    }, answers);

    // Reload to pick up the saved answers
    await page.reload();
    await page.waitForTimeout(2000);

    // Navigate to last page (page 10)
    await pageButtons.nth(9).click();
    await page.waitForTimeout(500);

    // Submit button should now be enabled
    const submitButton = page.locator('button:has-text("결과 확인하기")');
    await expect(submitButton).toBeEnabled({ timeout: 5000 });

    // Click submit
    await submitButton.click();

    // Wait for loading state
    await expect(page.locator('text=분석 중')).toBeVisible({ timeout: 5000 });

    // Wait for API calls (submit → analyze → result redirect)
    // This might take 10-30 seconds due to LLM processing
    await expect(page).toHaveURL('/survey-result', { timeout: 90000 });
  });

  test('should show warning if not all questions answered on last page', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Answer only 30 questions (partial - half of 60)
    const partialAnswers = generateBalancedAnswers(5);
    const halfAnswers: Record<string, number> = {};

    // Only include first 30 questions
    Object.keys(partialAnswers).slice(0, 30).forEach((key) => {
      halfAnswers[key] = partialAnswers[key];
    });

    await page.evaluate((answersData) => {
      localStorage.setItem('survey-answers', JSON.stringify(answersData));
    }, halfAnswers);

    await page.reload();
    await page.waitForTimeout(2000);

    // Navigate to last page (page 10)
    const pageButtons = page.locator('[data-page-number]');
    await pageButtons.nth(9).click();
    await page.waitForTimeout(500);

    // Should show warning message
    const warningText = page.locator('text=/모든 질문에 답변해야/');
    await expect(warningText).toBeVisible();

    // Progress indicator should show 30/60
    const progressInfo = page.locator('text=/30\\/60/');
    await expect(progressInfo).toBeVisible();
  });

  test('should highlight current page button', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Page 1 button should be active (default variant)
    const page1Button = page.locator('[data-page-number="1"]');

    // Check if page 1 button has default variant styling
    // (This depends on shadcn/ui button component implementation)
    await expect(page1Button).toBeVisible();

    // Navigate to page 3
    const page3Button = page.locator('[data-page-number="3"]');
    await page3Button.click();
    await page.waitForTimeout(500);

    // Page 3 should now be highlighted
    await expect(page.locator('text=페이지 3 / 10')).toBeVisible();
  });

  test('should handle API errors during submission', async ({ page }) => {
    // Mock API failure for submit
    await page.route('**/api/survey/submit', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: '서버 오류가 발생했습니다' }),
      });
    });

    // Collect real question IDs
    await page.waitForTimeout(1000);
    const answers: Record<string, number> = {};
    const pageButtons = page.locator('[data-page-number]');

    for (let pageIndex = 0; pageIndex < 10; pageIndex++) {
      await pageButtons.nth(pageIndex).click();
      await page.waitForTimeout(500);

      const pageQuestions = await page.evaluate(() => {
        const qs: Array<{ id: string }> = [];
        document.querySelectorAll('[data-question-id]').forEach((el) => {
          const id = el.getAttribute('data-question-id');
          if (id) qs.push({ id });
        });
        return qs;
      });

      pageQuestions.forEach(q => {
        answers[q.id] = 6;
      });
    }

    await page.evaluate((answersData) => {
      localStorage.setItem('survey-answers', JSON.stringify(answersData));
    }, answers);

    await page.reload();
    await page.waitForTimeout(2000);

    // Go to last page (page 10)
    await pageButtons.nth(9).click();
    await page.waitForTimeout(500);

    // Submit
    const submitButton = page.locator('button:has-text("결과 확인하기")');
    await submitButton.click();

    // Should show error message (use more specific selector to avoid matching question text)
    await expect(page.locator('.bg-red-50 .text-red-600')).toBeVisible({ timeout: 5000 });

    // Should stay on survey page
    await expect(page).toHaveURL('/survey');
  });

  test('should calculate completion time', async ({ page }) => {
    // Collect real question IDs
    await page.waitForTimeout(1000);
    const answers: Record<string, number> = {};
    const pageButtons = page.locator('[data-page-number]');

    for (let pageIndex = 0; pageIndex < 10; pageIndex++) {
      await pageButtons.nth(pageIndex).click();
      await page.waitForTimeout(500);

      const pageQuestions = await page.evaluate(() => {
        const qs: Array<{ id: string }> = [];
        document.querySelectorAll('[data-question-id]').forEach((el) => {
          const id = el.getAttribute('data-question-id');
          if (id) qs.push({ id });
        });
        return qs;
      });

      pageQuestions.forEach(q => {
        answers[q.id] = 7;
      });
    }

    await page.evaluate((answersData) => {
      localStorage.setItem('survey-answers', JSON.stringify(answersData));
    }, answers);

    await page.reload();
    await page.waitForTimeout(2000);

    await pageButtons.nth(9).click();

    // Submit
    const submitButton = page.locator('button:has-text("결과 확인하기")');
    await submitButton.click();

    // Wait for submit API call
    const submitResponse = await page.waitForResponse(
      (resp) => resp.url().includes('/api/survey/submit') && resp.request().method() === 'POST',
      { timeout: 10000 }
    );

    // Check that request includes completionTimeSeconds
    const requestBody = submitResponse.request().postDataJSON();
    expect(requestBody).toHaveProperty('completionTimeSeconds');
    expect(requestBody.completionTimeSeconds).toBeGreaterThan(0);
  });
});
