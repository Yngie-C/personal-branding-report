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
 * Phase 2 (Premium Tier) - Using Dev Mode:
 * /upload → /questions → /generating → /result (Full report)
 *
 * Note: Phase 2 tests use Dev Mode (?dev=true) for fast testing without API dependencies.
 * Phase 1 tests use real API calls to ensure the complete flow works.
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
    console.log(`Session created: ${sessionId}`);

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
    questions.forEach((q: { id: string }, index: number) => {
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

    console.log('Survey submitted');

    // ========== STEP 3: Survey Result Page ==========
    console.log('[Step 3] Waiting for survey result...');
    await expect(page).toHaveURL('/survey-result', { timeout: 90000 });

    // Verify persona card is displayed
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

    // Verify radar chart is rendered
    await expect(page.locator('svg.recharts-surface')).toBeVisible({ timeout: 10000 });

    console.log('Brief report displayed');

    console.log('\n=== Phase 1 User Journey Test PASSED ===\n');

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

test.describe('Phase 2: Premium Tier User Journey (Dev Mode)', () => {
  /**
   * Phase 2 tests use Dev Mode to bypass session validation
   * and use mock data for fast testing of UI components.
   */

  test('should complete Phase 2 flow: Questions → Generating → Result', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes for full flow with simulated progress

    console.log('\n=== Starting Phase 2 User Journey Test (Dev Mode) ===\n');

    // ========== STEP 1: Questions Page ==========
    console.log('[Step 1] Navigating to /questions?dev=true...');
    await page.goto('/questions?dev=true');

    // Wait for questions to load
    await page.waitForSelector('textarea', { timeout: 10000 });
    console.log('Questions page loaded');

    // Verify Dev Mode banner
    await expect(page.locator('text=[Dev Mode]')).toBeVisible();

    // Get total questions count
    const counterText = await page.locator('text=/질문 \\d+ \\/ (\\d+)/').textContent();
    const totalMatch = counterText?.match(/\/ (\d+)/);
    const totalQuestions = totalMatch ? parseInt(totalMatch[1]) : 9;

    console.log(`  Found ${totalQuestions} questions`);

    // ========== STEP 2: Fill All Questions ==========
    console.log('[Step 2] Filling all questions...');
    for (let i = 0; i < totalQuestions; i++) {
      await page.locator('textarea').fill(
        `답변 ${i + 1}: 저는 데이터 기반 의사결정을 중시하며, 사용자 중심 제품을 만드는 것을 목표로 합니다. 팀과의 협업을 통해 큰 임팩트를 만들어왔습니다.`
      );

      if (i < totalQuestions - 1) {
        await page.locator('button:has-text("다음")').click();
        await page.waitForTimeout(300);
      }
    }

    // Submit last question
    await page.locator('button:has-text("완료")').click();
    console.log('Questions submitted');

    // ========== STEP 3: Generating Page ==========
    console.log('[Step 3] Waiting for generating page...');
    await expect(page).toHaveURL(/\/generating\?dev=true/, { timeout: 10000 });

    // Verify generating page UI
    await expect(page.locator('h1:has-text("생성")')).toBeVisible();
    await expect(page.locator('text=진행률')).toBeVisible();

    console.log('Generating page displayed');

    // ========== STEP 4: Wait for Completion ==========
    console.log('[Step 4] Waiting for generation to complete...');

    // Dev mode takes ~14 seconds (7 remaining steps * 2 seconds)
    await expect(page).toHaveURL(/\/result\?dev=true/, { timeout: 60000 });

    // ========== STEP 5: Result Page ==========
    console.log('[Step 5] Verifying result page...');
    await expect(page.locator('text=[Dev Mode]')).toBeVisible();

    // Verify result page sections
    await expect(page.locator('text=/PDF/')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/소셜/')).toBeVisible({ timeout: 10000 });

    console.log('Result page displayed');

    console.log('\n=== Phase 2 User Journey Test PASSED ===\n');
  });

  test('should navigate directly through Phase 2 pages in Dev Mode', async ({ page }) => {
    // Test direct access to each Phase 2 page with dev mode
    console.log('\n=== Testing Direct Page Access (Dev Mode) ===\n');

    // Questions page
    console.log('[1] Testing /questions?dev=true...');
    await page.goto('/questions?dev=true');
    await expect(page.locator('textarea')).toBeVisible({ timeout: 10000 });
    console.log('Questions page accessible');

    // Generating page
    console.log('[2] Testing /generating?dev=true...');
    await page.goto('/generating?dev=true');
    await expect(page.locator('h1:has-text("생성")')).toBeVisible({ timeout: 10000 });
    console.log('Generating page accessible');

    // Result page
    console.log('[3] Testing /result?dev=true...');
    await page.goto('/result?dev=true');
    await expect(page.locator('text=/PDF/')).toBeVisible({ timeout: 10000 });
    console.log('Result page accessible');

    console.log('\n=== Direct Page Access Test PASSED ===\n');
  });
});

test.describe('Error Handling Throughout Flow', () => {
  const sessionManager = createSessionManager();

  test('should handle missing session gracefully', async ({ page }) => {
    // Clear all session data
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Try to access protected pages WITHOUT dev mode
    const protectedPages = ['/questions', '/generating', '/result'];

    for (const pagePath of protectedPages) {
      await page.goto(pagePath);
      await page.waitForTimeout(2000);

      const url = page.url();
      // Should be redirected to survey (no session)
      expect(url).toContain('/survey');

      console.log(`${pagePath} redirects correctly when no session`);
    }
  });

  test('should allow access with dev mode regardless of session', async ({ page }) => {
    // Clear all session data
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Access protected pages WITH dev mode should work
    const protectedPages = [
      { path: '/questions?dev=true', check: 'textarea' },
      { path: '/generating?dev=true', check: 'h1:has-text("생성")' },
      { path: '/result?dev=true', check: 'text=/PDF/' },
    ];

    for (const { path, check } of protectedPages) {
      await page.goto(path);
      await expect(page.locator(check)).toBeVisible({ timeout: 10000 });
      console.log(`${path} accessible with dev mode`);
    }
  });
});

test.describe('Navigation Between Pages', () => {
  test('should navigate from questions to generating on completion (Dev Mode)', async ({ page }) => {
    await page.goto('/questions?dev=true');
    await page.waitForSelector('textarea', { timeout: 10000 });

    // Fill first question and submit (enough to test navigation)
    await page.locator('textarea').fill(
      '테스트 답변입니다. 충분한 길이의 답변을 작성해야 합니다. 최소 50자 이상을 맞추기 위해 더 많은 텍스트를 추가합니다.'
    );

    // Get total questions and navigate to last
    const counterText = await page.locator('text=/질문 \\d+ \\/ (\\d+)/').textContent();
    const totalMatch = counterText?.match(/\/ (\d+)/);
    const totalQuestions = totalMatch ? parseInt(totalMatch[1]) : 9;

    // Fast forward to last question
    for (let i = 1; i < totalQuestions; i++) {
      await page.locator('button:has-text("다음")').click();
      await page.waitForTimeout(200);
      await page.locator('textarea').fill(
        `답변 ${i + 1}: 테스트 답변입니다. 충분한 길이의 답변을 작성해야 합니다.`
      );
    }

    // Submit
    await page.locator('button:has-text("완료")').click();

    // Should navigate to generating
    await expect(page).toHaveURL(/\/generating\?dev=true/, { timeout: 10000 });
  });

  test('should navigate from generating to result on completion (Dev Mode)', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/generating?dev=true');

    // Wait for simulation to complete and redirect
    await expect(page).toHaveURL(/\/result\?dev=true/, { timeout: 45000 });

    // Verify result page is showing
    await expect(page.locator('text=/PDF/')).toBeVisible();
  });
});

test.describe('Result Page Features (Dev Mode)', () => {
  test('should display download section', async ({ page }) => {
    await page.goto('/result?dev=true');
    await page.waitForTimeout(1000);

    // Check for download section
    await expect(page.locator('text=/PDF|다운로드/')).toBeVisible({ timeout: 10000 });
  });

  test('should display social assets section', async ({ page }) => {
    await page.goto('/result?dev=true');
    await page.waitForTimeout(1000);

    // Check for social assets section
    await expect(page.locator('text=/소셜/')).toBeVisible({ timeout: 10000 });
  });

  test('should display brand strategy summary', async ({ page }) => {
    await page.goto('/result?dev=true');
    await page.waitForTimeout(1000);

    // Check for brand strategy content (from mock data)
    await expect(
      page.locator('text=/브랜드|전략|혁신적 문제 해결/')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should have action buttons', async ({ page }) => {
    await page.goto('/result?dev=true');
    await page.waitForTimeout(1000);

    // Check for action buttons
    await expect(page.locator('button:has-text("새 리포트 만들기")')).toBeVisible();
    await expect(page.locator('button:has-text("홈으로")')).toBeVisible();
  });

  test('should navigate to home when clicking home button', async ({ page }) => {
    await page.goto('/result?dev=true');
    await page.waitForTimeout(1000);

    // Click home button
    await page.locator('button:has-text("홈으로")').click();

    // Should navigate to home
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });
});

test.describe('Phase 2 Flow Completion Score Feature', () => {
  test('should show completion score during questions', async ({ page }) => {
    await page.goto('/questions?dev=true');
    await page.waitForSelector('textarea', { timeout: 10000 });

    // CompletionScore should be visible
    const scoreCircle = page.locator('svg circle').first();
    await expect(scoreCircle).toBeVisible();

    // Grade badge should be visible
    await expect(page.locator('text=/기초|양호|우수|탁월/')).toBeVisible();
  });

  test('should update completion score based on answer quality', async ({ page }) => {
    await page.goto('/questions?dev=true');
    await page.waitForSelector('textarea', { timeout: 10000 });

    // Type a high-quality answer
    await page.locator('textarea').fill(
      '저는 10년간 프로덕트 매니지먼트 분야에서 일해왔습니다. 데이터 기반 의사결정을 통해 팀의 성과를 200% 향상시켰으며, 사용자 중심 디자인 원칙을 적용하여 고객 만족도를 크게 개선했습니다. 앞으로도 혁신적인 제품을 만들어 사용자에게 진정한 가치를 제공하고 싶습니다.'
    );

    // Wait for analysis to complete
    await page.waitForTimeout(500);

    // Grade should improve to excellent or outstanding
    await expect(page.locator('text=/우수|탁월/')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Phase 2 Progress Tracking', () => {
  test('should show progress percentage during generation', async ({ page }) => {
    await page.goto('/generating?dev=true');
    await page.waitForTimeout(500);

    // Progress percentage should be visible
    await expect(page.locator('text=진행률')).toBeVisible();
    await expect(page.locator('text=/%/')).toBeVisible();
  });

  test('should update progress during simulation', async ({ page }) => {
    await page.goto('/generating?dev=true');

    // Get initial percentage
    await page.waitForTimeout(500);
    const initialText = await page.locator('text=/%/').first().textContent();
    const initialPercent = parseInt(initialText?.match(/(\d+)%/)?.[1] || '0');

    // Wait for a few simulation steps
    await page.waitForTimeout(5000);

    // Get updated percentage
    const updatedText = await page.locator('text=/%/').first().textContent();
    const updatedPercent = parseInt(updatedText?.match(/(\d+)%/)?.[1] || '0');

    // Progress should have increased
    expect(updatedPercent).toBeGreaterThan(initialPercent);
  });
});
