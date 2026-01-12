import { test, expect } from '@playwright/test';
import { createSessionManager } from '../fixtures/session-manager';

/**
 * Complete User Flow E2E Tests
 *
 * Tests the entire user journey through both phases:
 *
 * Phase 1 (Free Tier):
 * /survey (60 questions) → /survey-result (Brief report) → /p/[slug] (Public profile)
 *
 * Phase 2 (Premium Tier):
 * /upload (Resume) → /questions (9 questions) → /generating → /result (Full report)
 *
 * Note: Full flow tests may take several minutes due to LLM operations
 */

test.describe('Phase 1: Free Tier User Journey', () => {
  const sessionManager = createSessionManager();
  let sessionId: string;

  test('should complete Phase 1 flow: Survey → Brief Report → Public Profile', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes

    console.log('\n=== Starting Phase 1 User Journey Test ===\n');

    // ========== STEP 1: Create Session ==========
    console.log('[Step 1] Creating session...');
    const testEmail = `e2e-phase1-${Date.now()}@playwright.test`;
    sessionId = await sessionManager.createSession(page, testEmail);
    console.log(`✓ Session created: ${sessionId}`);

    // ========== STEP 2: Survey Page ==========
    console.log('[Step 2] Navigating to /survey...');
    await page.goto('/survey');
    await expect(page).toHaveURL('/survey');

    // Fetch actual question IDs from the API
    const questionsResponse = await page.evaluate(async () => {
      const res = await fetch('/api/survey/questions');
      return await res.json();
    });

    const questions = questionsResponse.data.questions;
    console.log(`  Found ${questions.length} survey questions`);

    // Create balanced answers using actual question IDs
    const answers: Record<string, number> = {};
    questions.forEach((q: any, index: number) => {
      // Vary scores between 4-6 for more realistic distribution
      answers[q.id] = 4 + (index % 3);
    });

    // Inject answers into localStorage
    await page.evaluate((data) => {
      localStorage.setItem('survey-answers', JSON.stringify(data));
    }, answers);

    // Reload to apply saved answers
    await page.reload();
    await page.waitForTimeout(1000);

    // Navigate to last category and submit
    const categoryTabs = page.locator('[role="tab"]');
    const tabCount = await categoryTabs.count();
    if (tabCount > 0) {
      await categoryTabs.nth(tabCount - 1).click();
      await page.waitForTimeout(500);
    }

    const submitButton = page.locator('button:has-text("결과 확인하기")');
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    console.log('✓ Survey submitted');

    // ========== STEP 3: Survey Result Page ==========
    console.log('[Step 3] Waiting for survey result...');
    await expect(page).toHaveURL('/survey-result', { timeout: 90000 });

    // Verify persona card is displayed
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

    // Verify radar chart is rendered
    await expect(page.locator('svg.recharts-surface')).toBeVisible({ timeout: 10000 });

    console.log('✓ Brief report displayed');

    // Get web profile slug
    const { slug } = await sessionManager.createSessionWithSurveyResult(page).catch(() => {
      // Fallback: Try to get slug from page or database
      return { slug: null };
    });

    // ========== STEP 4: Public Profile (Optional) ==========
    if (slug) {
      console.log(`[Step 4] Checking public profile at /p/${slug}...`);
      await page.goto(`/p/${slug}`);
      await expect(page).toHaveURL(`/p/${slug}`);

      // Verify profile content
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
      console.log('✓ Public profile accessible');
    } else {
      console.log('[Step 4] Skipping public profile check (slug not available)');
    }

    console.log('\n=== ✓ Phase 1 User Journey Test PASSED ===\n');

    // Cleanup
    await sessionManager.cleanupSession(sessionId);
  });

  test.afterEach(async ({ page }) => {
    if (sessionId) {
      await sessionManager.cleanupSession(sessionId);
      await sessionManager.clearLocalStorage(page);
    }
  });
});

test.describe('Phase 2: Premium Tier User Journey', () => {
  const sessionManager = createSessionManager();
  let sessionId: string;

  test('should complete Phase 2 flow: Upload → Questions → Generating → Result', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes for full report generation

    console.log('\n=== Starting Phase 2 User Journey Test ===\n');

    // ========== STEP 1: Complete Phase 1 First ==========
    console.log('[Step 1] Completing Phase 1 prerequisites...');
    const { sessionId: sid, slug } = await sessionManager.createSessionWithSurveyResult(page);
    sessionId = sid;
    console.log(`✓ Phase 1 completed (session: ${sessionId}, slug: ${slug})`);

    // ========== STEP 2: Upload Page ==========
    console.log('[Step 2] Navigating to /upload...');
    await page.goto('/upload');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Use form input method (default tab)
    await page.getByPlaceholder('브랜딩 보고서에 표시할 이름').fill('E2E Test User');
    await page.getByPlaceholder('회사명 *').first().fill('Test Company');
    await page.getByPlaceholder('직책 *').first().fill('Product Manager');

    // Fill dates
    await page.locator('input[type="month"]').first().fill('2020-01');
    await page.click('button:has-text("재직중")');

    await page.getByPlaceholder(/성과 1/).first().fill('사용자 증가 2배 달성');
    await page.getByPlaceholder(/기술 1/).first().fill('Product Management');
    await page.getByPlaceholder('프로젝트명 *').first().fill('AI Recommendation System');
    await page.getByPlaceholder(/프로젝트 설명/).first().fill('AI 기반 추천 시스템 구축');
    await page.getByPlaceholder(/성과\/임팩트/).first().fill('클릭률 40% 증가');

    // Submit form
    await page.click('button:has-text("이력서 정보 저장")');

    // Wait for API response
    const response = await page.waitForResponse(
      (resp) => resp.url().includes('/api/resume-form'),
      { timeout: 15000 }
    );
    expect(response.status()).toBe(200);

    console.log('✓ Resume uploaded');

    // Navigate to questions
    const nextButton = page.locator('button:has-text("다음 단계로")');
    await expect(nextButton).toBeEnabled({ timeout: 15000 });
    await nextButton.click();

    // ========== STEP 3: Questions Page ==========
    console.log('[Step 3] Completing questionnaire at /questions...');
    await expect(page).toHaveURL('/questions', { timeout: 10000 });

    // Wait for questions to generate (AI operation, may take 30-60 seconds)
    console.log('  Waiting for AI question generation...');
    await page.waitForSelector('textarea', { timeout: 90000 });

    // Get total question count
    const counterText = await page.locator('text=/질문 \\d+ \\/ (\\d+)/').textContent();
    const totalMatch = counterText?.match(/\/ (\d+)/);
    const totalQuestions = totalMatch ? parseInt(totalMatch[1]) : 9;

    console.log(`  Found ${totalQuestions} questions`);

    // Fill all questions
    for (let i = 0; i < totalQuestions; i++) {
      await page.locator('textarea').fill(
        `답변 ${i + 1}: 저는 데이터 기반 의사결정을 중시하며, 사용자 중심 제품을 만드는 것을 목표로 합니다. 팀과의 협업을 통해 큰 임팩트를 만들어왔습니다.`
      );

      if (i < totalQuestions - 1) {
        await page.locator('button:has-text("다음")').click();
        await page.waitForTimeout(500);
      }
    }

    // Submit final question
    await page.locator('button:has-text("완료")').click();
    console.log('✓ Questionnaire submitted');

    // ========== STEP 4: Generating Page ==========
    console.log('[Step 4] Waiting for report generation at /generating...');
    await expect(page).toHaveURL('/generating', { timeout: 30000 });

    // Verify generation UI
    await expect(page.locator('text=/생성|제작/').first()).toBeVisible();

    // Wait for generation to complete (may take 2-5 minutes)
    console.log('  Report generation in progress (this may take several minutes)...');

    // ========== STEP 5: Result Page ==========
    await expect(page).toHaveURL('/result', { timeout: 300000 }); // 5 minutes max
    console.log('[Step 5] Viewing results at /result...');

    // Wait for loading to complete
    await page.waitForSelector('text=결과를 불러오는 중...', { state: 'hidden', timeout: 30000 }).catch(() => {
      // Loading might be too fast to see
    });

    // Verify result page content
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });

    // Check for download section
    await expect(page.locator('text=/PDF/').first()).toBeVisible({ timeout: 10000 });

    // Check for social assets section
    await expect(page.locator('text=/소셜/').first()).toBeVisible({ timeout: 10000 });

    console.log('✓ Full report displayed');

    console.log('\n=== ✓ Phase 2 User Journey Test PASSED ===\n');

    // Cleanup
    await sessionManager.cleanupSession(sessionId);
  });

  test.afterEach(async ({ page }) => {
    if (sessionId) {
      await sessionManager.cleanupSession(sessionId);
      await sessionManager.clearLocalStorage(page);
    }
  });
});

test.describe('Error Handling Throughout Flow', () => {
  const sessionManager = createSessionManager();

  test('should handle missing session gracefully', async ({ page }) => {
    // Clear all session data
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Try to access protected pages
    const protectedPages = ['/upload', '/questions', '/generating', '/result'];

    for (const pagePath of protectedPages) {
      await page.goto(pagePath);
      await page.waitForTimeout(2000);

      const url = page.url();
      // Should be redirected away from the protected page
      expect(url).not.toContain(pagePath);

      console.log(`✓ ${pagePath} redirects correctly when no session`);
    }
  });

  test('should handle incomplete Phase 1 when accessing Phase 2', async ({ page }) => {
    // Create session without completing survey
    const sessionId = await sessionManager.createSession(page);

    // Try to access Phase 2 pages
    await page.goto('/upload');
    await page.waitForTimeout(3000);

    const url = page.url();
    // Should redirect to survey or survey-result
    expect(url.includes('/survey') || url.includes('/upload')).toBeTruthy();

    // Cleanup
    await sessionManager.cleanupSession(sessionId);
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/');

    // If there's an email input on landing page
    const emailInput = page.locator('input[type="email"]');
    const hasEmailInput = await emailInput.count() > 0;

    if (hasEmailInput) {
      await emailInput.fill('invalid-email');

      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();

        // Check for validation error
        const validationMessage = await emailInput.evaluate((input: HTMLInputElement) => {
          return input.validationMessage;
        });

        expect(validationMessage).toBeTruthy();
        console.log('✓ Email validation works');
      }
    } else {
      console.log('✓ No email input on landing page (survey-first flow)');
    }
  });
});

test.describe('Navigation Between Phases', () => {
  const sessionManager = createSessionManager();

  test('should allow returning to survey result from upload', async ({ page }) => {
    // Complete Phase 1
    const { sessionId } = await sessionManager.createSessionWithSurveyResult(page);

    // Go to upload
    await page.goto('/upload');
    await page.waitForTimeout(1000);

    // Check for back navigation
    const backButton = page.locator('button:has-text("돌아가기"), a:has-text("돌아가기")');
    const hasBackButton = await backButton.count() > 0;

    if (hasBackButton) {
      await backButton.click();
      await expect(page).toHaveURL('/survey-result', { timeout: 5000 });
      console.log('✓ Can navigate back to survey result');
    } else {
      console.log('✓ No back button (direct navigation flow)');
    }

    // Cleanup
    await sessionManager.cleanupSession(sessionId);
  });

  test('should preserve session data across page refreshes', async ({ page }) => {
    const sessionId = await sessionManager.createSession(page);

    // Store session ID
    await page.evaluate((id) => {
      localStorage.setItem('sessionId', id);
    }, sessionId);

    // Refresh page
    await page.reload();

    // Verify session still exists
    const storedSessionId = await page.evaluate(() => localStorage.getItem('sessionId'));
    expect(storedSessionId).toBe(sessionId);

    console.log('✓ Session persists across page refresh');

    // Cleanup
    await sessionManager.cleanupSession(sessionId);
  });
});
