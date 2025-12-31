import { test, expect } from '@playwright/test';
import { createSessionManager } from '../fixtures/session-manager';

/**
 * Complete User Flow E2E Test
 *
 * Tests the entire user journey from start to finish:
 * 1. /start - Email entry
 * 2. /upload - Resume/portfolio upload
 * 3. /survey - 100-question PSA survey
 * 4. /survey-result - Brief analysis
 * 5. /questions - Enhanced questionnaire
 * 6. /generating - Report generation
 * 7. /result - Final output
 * 8. /p/[slug] - Public profile
 *
 * Note: This is a comprehensive test that may take several minutes
 */

test.describe('Complete User Journey', () => {
  const sessionManager = createSessionManager();
  let sessionId: string;

  test('should complete full branding report generation flow', async ({ page }) => {
    // Set longer timeout for this comprehensive test
    test.setTimeout(600000); // 10 minutes

    console.log('\n=== Starting Complete User Journey Test ===\n');

    // ========== STEP 1: Start Page ==========
    console.log('[Step 1/8] Creating session at /start...');

    await page.goto('/start');
    const testEmail = `e2e-test-${Date.now()}@playwright.test`;

    await page.fill('input#email', testEmail);
    await page.click('button[type="submit"]');

    await page.waitForURL('/upload', { timeout: 10000 });
    sessionId = await page.evaluate(() => localStorage.getItem('sessionId'));

    expect(sessionId).toBeTruthy();
    console.log(`✓ Session created: ${sessionId}`);

    // ========== STEP 2: Upload Page ==========
    console.log('[Step 2/8] Completing resume upload at /upload...');

    await expect(page).toHaveURL('/upload');

    // Wait for form to load (default tab is "폼 입력 (추천)")
    await page.waitForTimeout(1000);

    // Use form input method for speed - using placeholder selectors
    await page.getByPlaceholder('브랜딩 보고서에 표시할 이름').fill('E2E Test User');
    await page.getByPlaceholder('회사명 *').first().fill('Test Company');
    await page.getByPlaceholder('직책 *').first().fill('Product Manager');

    // Fill dates
    await page.locator('input[type="month"]').first().fill('2020-01');
    // Click "재직중" button to set endDate as 'current'
    await page.click('button:has-text("재직중")');

    await page.getByPlaceholder(/성과 1/).first().fill('사용자 증가 2배 달성');
    await page.getByPlaceholder(/기술 1/).first().fill('Product Management');
    await page.getByPlaceholder('프로젝트명 *').first().fill('AI Recommendation System');
    await page.getByPlaceholder(/프로젝트 설명/).first().fill('AI 기반 추천 시스템 구축');
    await page.getByPlaceholder(/성과\/임팩트/).first().fill('클릭률 40% 증가');

    await page.click('button:has-text("이력서 정보 저장")');

    // Wait for API response and verify success
    const response = await page.waitForResponse((resp) => resp.url().includes('/api/resume-form'), { timeout: 15000 });
    expect(response.status()).toBe(200);

    // Wait for button to be enabled (indicates success)
    const nextButton = page.locator('button:has-text("다음 단계로")');
    await expect(nextButton).toBeEnabled({ timeout: 15000 });

    // Navigate to survey
    await nextButton.click();
    await expect(page).toHaveURL('/survey');

    console.log('✓ Resume uploaded');

    // ========== STEP 3: Survey Page ==========
    console.log('[Step 3/8] Completing PSA survey at /survey...');

    await page.waitForTimeout(2000);

    // Fetch actual question IDs from the API
    const questionsResponse = await page.evaluate(async () => {
      const res = await fetch('/api/survey/questions');
      return await res.json();
    });

    // Create answers using actual question IDs
    const realAnswers: Record<string, number> = {};
    questionsResponse.data.questions.forEach((q: any) => {
      realAnswers[q.id] = 5; // Use score of 5 for all questions
    });

    // Inject answers into localStorage
    await page.evaluate((answers) => {
      localStorage.setItem('survey-answers', JSON.stringify(answers));
    }, realAnswers);

    await page.reload();
    await page.waitForTimeout(2000);

    // Navigate to last category and submit
    const categoryTabs = page.locator('[role="tab"]');
    await categoryTabs.nth(4).click();
    await page.waitForTimeout(500);

    const submitButton = page.locator('button:has-text("결과 확인하기")');
    await expect(submitButton).toBeEnabled({ timeout: 5000 });

    await submitButton.click();

    console.log('✓ Survey submitted, waiting for analysis...');

    // ========== STEP 4: Survey Result Page ==========
    console.log('[Step 4/8] Viewing survey result at /survey-result...');

    // Wait for redirect to survey-result (LLM analysis may take time)
    await expect(page).toHaveURL('/survey-result', { timeout: 90000 });

    // Verify persona and scores are displayed
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('svg.recharts-surface')).toBeVisible({ timeout: 5000 });

    console.log('✓ Survey result displayed');

    // Navigate to questions
    await page.waitForTimeout(2000);
    const continueButton = page.locator('button').filter({ hasText: /다음|질문/ }).first();
    await continueButton.click();

    await expect(page).toHaveURL('/questions');

    // ========== STEP 5: Questions Page ==========
    console.log('[Step 5/8] Answering questionnaire at /questions...');

    // Wait for AI to finish generating questions (LLM operation, may take 30-60 seconds)
    console.log('  Waiting for AI question generation...');

    // Wait for loading spinner to disappear (loading state shows: "AI가 맞춤형 질문을 생성하는 중...")
    await page.waitForSelector('text=AI가 맞춤형 질문을 생성하는 중...', { state: 'hidden', timeout: 90000 });

    // Wait for questions to appear
    await page.waitForSelector('textarea', { timeout: 10000 });

    // Fill all textareas
    const textareas = page.locator('textarea');
    const questionCount = await textareas.count();

    console.log(`  Found ${questionCount} questions`);

    for (let i = 0; i < questionCount; i++) {
      await textareas.nth(i).fill(
        `답변 ${i + 1}: 저는 데이터 기반 의사결정을 중시하며, 사용자 중심 제품을 만드는 것을 목표로 합니다.`
      );
    }

    // Submit questionnaire
    const generateButton = page.locator('button:has-text("리포트 생성")');
    await generateButton.click();

    console.log('✓ Questionnaire submitted');

    // ========== STEP 6: Generating Page ==========
    console.log('[Step 6/8] Waiting for report generation at /generating...');

    await expect(page).toHaveURL('/generating', { timeout: 10000 });

    // Verify progress display (use .first() to avoid strict mode violation)
    await expect(page.locator('text=/생성|제작/').first()).toBeVisible();

    // Wait for generation to complete (this may take 2-5 minutes)
    console.log('  Report generation in progress (this may take several minutes)...');

    await expect(page).toHaveURL('/result', { timeout: 300000 }); // 5 minutes max

    console.log('✓ Report generation completed');

    // ========== STEP 7: Result Page ==========
    console.log('[Step 7/8] Viewing results at /result...');

    // Wait for loading to complete ("결과를 불러오는 중..." → main content)
    await page.waitForSelector('text=결과를 불러오는 중...', { state: 'hidden', timeout: 15000 });

    // Verify main heading is displayed
    await expect(page.locator('h1:has-text("완료")')).toBeVisible({ timeout: 10000 });

    // Verify result sections are present (use .first() to avoid strict mode violations)
    await expect(page.locator('text=/PDF/').first()).toBeVisible();
    await expect(page.locator('text=/소셜/').first()).toBeVisible();

    // Verify action buttons
    await expect(page.locator('button:has-text("새로 만들기")')).toBeVisible();
    await expect(page.locator('button:has-text("인쇄")')).toBeVisible();

    console.log('✓ Results displayed successfully');

    console.log('\n=== ✓ Complete User Journey Test PASSED ===\n');

    // Note: Steps 1-7 completed successfully
    // Step 8 (Public Profile) skipped as web profile link is not displayed in result page UI

    // Cleanup
    console.log('Cleaning up test data...');
    await sessionManager.cleanupSession(sessionId!);
    await sessionManager.clearLocalStorage(page);
    console.log('✓ Cleanup complete');
  });

  test('should handle errors gracefully throughout the flow', async ({ page }) => {
    test.setTimeout(60000);

    console.log('\n=== Testing Error Handling ===\n');

    // Test 1: Invalid email
    await page.goto('/start');
    await page.fill('input#email', 'invalid-email');
    await page.click('button[type="submit"]');

    const validationMessage = await page.locator('input#email').evaluate((input: HTMLInputElement) => {
      return input.validationMessage;
    });

    expect(validationMessage).toBeTruthy();
    console.log('✓ Email validation works');

    // Test 2: Accessing protected pages without session
    await page.evaluate(() => localStorage.clear());

    await page.goto('/upload');
    await expect(page).toHaveURL('/start', { timeout: 5000 });
    console.log('✓ Upload page redirects when no session');

    await page.goto('/survey');
    await expect(page).toHaveURL('/start', { timeout: 5000 });
    console.log('✓ Survey page redirects when no session');

    console.log('\n=== Error Handling Test PASSED ===\n');
  });

  test.afterEach(async ({ page }) => {
    // Final cleanup
    if (sessionId) {
      await sessionManager.cleanupSession(sessionId);
      await sessionManager.clearLocalStorage(page);
    }
  });
});
