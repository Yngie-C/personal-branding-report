import { test, expect } from '@playwright/test';

/**
 * Questions Page E2E Tests (Phase 2)
 *
 * Tests the Focus Mode questionnaire UI using Dev Mode (?dev=true):
 * - 9 questions displayed one at a time (3 Philosophy + 4 Expertise + 2 Edge)
 * - Phase header with completion percentage
 * - CompletionScore component showing answer quality
 * - Previous/Next navigation
 * - Character count and minimum requirements
 * - Final submission to /generating
 *
 * Dev Mode bypasses session validation and uses mock questions,
 * enabling fast testing without API dependencies.
 */

test.describe('Questions Page - Dev Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to questions page in Dev Mode
    await page.goto('/questions?dev=true');

    // Wait for questions to load (dev mode loads mock data instantly)
    await page.waitForSelector('textarea', { timeout: 10000 });
  });

  test('should display questions page with Focus Mode UI', async ({ page }) => {
    // Check for Dev Mode banner
    await expect(page.locator('text=[Dev Mode]')).toBeVisible();

    // Check for phase header (Philosophy first)
    await expect(page.locator('h2:has-text("Philosophy")')).toBeVisible();

    // Check for question counter
    await expect(page.locator('text=/질문 1 \\/ \\d+/')).toBeVisible();

    // Check for completion percentage in header
    await expect(page.locator('text=/브랜드 완성도/')).toBeVisible();
    await expect(page.locator('text=/%/')).toBeVisible();

    // Check for textarea
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('should show CompletionScore component', async ({ page }) => {
    // CompletionScore should be visible in the question card
    // It shows a circular gauge with score
    const completionScore = page.locator('svg circle').first();
    await expect(completionScore).toBeVisible();

    // Check for grade badge (will show "기초" initially since no answer)
    await expect(page.locator('text=/기초|양호|우수|탁월/')).toBeVisible();
  });

  test('should update CompletionScore when answering', async ({ page }) => {
    const textarea = page.locator('textarea');

    // Type a short answer (below minimum)
    await textarea.fill('짧은 답변');

    // Should show basic grade for short answer
    await expect(page.locator('text=/기초/')).toBeVisible({ timeout: 3000 });

    // Type a longer, better answer
    await textarea.fill(
      '저는 팀의 성장과 발전을 위해 끊임없이 노력하고 있습니다. 데이터 기반 의사결정을 통해 효율적인 결과를 도출하고, 협업을 통해 시너지를 창출합니다.'
    );

    // Score should improve (wait for animation)
    await page.waitForTimeout(500);

    // Grade should improve to good or higher
    await expect(page.locator('text=/양호|우수|탁월/')).toBeVisible({ timeout: 3000 });
  });

  test('should show one question at a time', async ({ page }) => {
    // Should have exactly one textarea visible
    const textareas = page.locator('textarea:visible');
    await expect(textareas).toHaveCount(1);

    // Should have question text
    const questionCard = page.locator('.bg-white\\/70, [class*="backdrop-blur"]');
    await expect(questionCard.first()).toBeVisible();
  });

  test('should display character count and guidelines', async ({ page }) => {
    const textarea = page.locator('textarea');
    const testAnswer = '이것은 테스트 답변입니다.';

    await textarea.fill(testAnswer);

    // Check character count display
    await expect(page.locator(`text=${testAnswer.length}자`)).toBeVisible();

    // Check for minimum/recommended guidelines (최소 50자 | 권장 150자)
    await expect(page.locator('text=/최소.*자|권장.*자/')).toBeVisible();
  });

  test('should show warning when below minimum characters', async ({ page }) => {
    const textarea = page.locator('textarea');

    // Type short answer (below 50 chars minimum)
    await textarea.fill('짧은 테스트');

    // Warning should appear
    await expect(page.locator('text=/최소.*자 이상 작성/')).toBeVisible();
    await expect(page.locator('text=/자 부족/')).toBeVisible();
  });

  test('should show hint section with lightbulb icon', async ({ page }) => {
    // Hints are displayed in a blue box
    const hintSection = page.locator('.bg-blue-50');
    await expect(hintSection).toBeVisible();

    // Should have lightbulb icon
    await expect(page.locator('svg.lucide-lightbulb')).toBeVisible();
  });

  test('should navigate between questions with Previous/Next buttons', async ({ page }) => {
    // Fill first question with sufficient length
    await page.locator('textarea').fill(
      '테스트 답변입니다. 충분한 길이의 답변을 작성합니다. 최소 50자 이상이어야 다음으로 넘어갈 수 있습니다.'
    );

    // Click Next
    const nextButton = page.locator('button:has-text("다음")');
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    // Should now show question 2
    await expect(page.locator('text=/질문 2 \\/ \\d+/')).toBeVisible({ timeout: 5000 });

    // Click Previous
    const prevButton = page.locator('button:has-text("이전")');
    await expect(prevButton).toBeEnabled();
    await prevButton.click();

    // Should be back to question 1
    await expect(page.locator('text=/질문 1 \\/ \\d+/')).toBeVisible({ timeout: 5000 });
  });

  test('should disable Previous button on first question', async ({ page }) => {
    // On first question, Previous should be disabled
    await expect(page.locator('text=/질문 1 \\/ \\d+/')).toBeVisible();

    const prevButton = page.locator('button:has-text("이전")');
    await expect(prevButton).toBeDisabled();
  });

  test('should disable Next button when below minimum characters', async ({ page }) => {
    // Short answer (less than 50 chars)
    await page.locator('textarea').fill('짧은답');

    // Next button should be disabled
    const nextButton = page.locator('button:has-text("다음")');
    await expect(nextButton).toBeDisabled();

    // Add more text to reach minimum
    await page.locator('textarea').fill(
      '이것은 충분히 긴 테스트 답변입니다. 50자 이상의 텍스트를 작성해야 다음 질문으로 넘어갈 수 있습니다.'
    );

    // Next button should now be enabled
    await expect(nextButton).toBeEnabled();
  });

  test('should display phase categories correctly', async ({ page }) => {
    // Philosophy should be first phase
    await expect(page.locator('h2:has-text("Philosophy")')).toBeVisible();
    await expect(page.locator('text=/본질과 가치관/')).toBeVisible();

    // Fill questions to reach Expertise phase (after 3 Philosophy questions)
    for (let i = 0; i < 3; i++) {
      await page.locator('textarea').fill(
        `테스트 답변 ${i + 1}: 충분히 긴 답변입니다. 최소 50자 이상을 맞추기 위해 더 많은 텍스트를 작성합니다.`
      );
      await page.locator('button:has-text("다음")').click();
      await page.waitForTimeout(300);
    }

    // Should now be in Expertise phase
    await expect(page.locator('h2:has-text("Expertise")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/전문성과 경험/')).toBeVisible();
  });

  test('should show question type badge', async ({ page }) => {
    // Philosophy questions should have "철학" badge
    await expect(page.locator('text=철학')).toBeVisible();
  });

  test('should persist answers across navigation', async ({ page }) => {
    const firstAnswer =
      '첫 번째 답변입니다. 데이터 기반 의사결정을 중시합니다. 충분한 길이의 답변을 작성합니다.';

    // Fill first question
    await page.locator('textarea').fill(firstAnswer);

    // Go to next
    await page.locator('button:has-text("다음")').click();
    await page.waitForTimeout(500);

    // Go back
    await page.locator('button:has-text("이전")').click();
    await page.waitForTimeout(500);

    // Answer should be preserved
    const value = await page.locator('textarea').inputValue();
    expect(value).toBe(firstAnswer);
  });

  test('should show 완료 button on last question', async ({ page }) => {
    // Get total question count from the UI
    const counterText = await page.locator('text=/질문 \\d+ \\/ (\\d+)/').textContent();
    const totalMatch = counterText?.match(/\/ (\d+)/);
    const totalQuestions = totalMatch ? parseInt(totalMatch[1]) : 9;

    // Navigate to last question by filling and clicking next
    for (let i = 0; i < totalQuestions - 1; i++) {
      await page.locator('textarea').fill(
        `테스트 답변 ${i + 1}: 충분히 긴 답변입니다. 최소 50자 이상을 맞추기 위해 텍스트를 작성합니다.`
      );
      await page.locator('button:has-text("다음")').click();
      await page.waitForTimeout(300);
    }

    // On last question, button should say "완료" instead of "다음"
    await expect(
      page.locator(`text=/질문 ${totalQuestions} \\/ ${totalQuestions}/`)
    ).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("완료")')).toBeVisible();
  });

  test('should navigate to generating page on completion', async ({ page }) => {
    // Get total question count
    const counterText = await page.locator('text=/질문 \\d+ \\/ (\\d+)/').textContent();
    const totalMatch = counterText?.match(/\/ (\d+)/);
    const totalQuestions = totalMatch ? parseInt(totalMatch[1]) : 9;

    // Fill all questions
    for (let i = 0; i < totalQuestions; i++) {
      await page.locator('textarea').fill(
        `답변 ${i + 1}: 저는 데이터 기반 의사결정을 중시하며, 사용자 중심 제품을 만드는 것을 목표로 합니다. 팀과의 협업을 통해 큰 임팩트를 만들어왔습니다.`
      );

      if (i < totalQuestions - 1) {
        await page.locator('button:has-text("다음")').click();
        await page.waitForTimeout(300);
      }
    }

    // Click 완료 button on last question
    await page.locator('button:has-text("완료")').click();

    // Should navigate to generating page (with dev mode)
    await expect(page).toHaveURL(/\/generating\?dev=true/, { timeout: 10000 });
  });

  test('should show progress bar in phase header', async ({ page }) => {
    // Progress bar should be visible in the phase header
    const progressBar = page.locator('.bg-white\\/20.rounded-full.h-2');
    await expect(progressBar).toBeVisible();

    // Progress should animate as we answer questions
    await page.locator('textarea').fill(
      '충분히 긴 테스트 답변입니다. 50자 이상 작성해야 합니다.'
    );
    await page.locator('button:has-text("다음")').click();

    // Completion percentage should increase
    await expect(page.locator('text=/브랜드 완성도/')).toBeVisible();
  });

  test('should show auto-save message', async ({ page }) => {
    // Help text about auto-save should be visible
    await expect(page.locator('text=/자동 저장/')).toBeVisible();
  });
});

test.describe('Questions Page - Without Dev Mode (Redirect Test)', () => {
  test('should redirect to survey if no session and no dev mode', async ({ page }) => {
    // Clear localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Navigate without dev mode
    await page.goto('/questions');

    // Should redirect to survey (session validation redirects to /survey)
    await expect(page).toHaveURL('/survey', { timeout: 10000 });
  });
});

test.describe('Questions Page - Edge Phase', () => {
  test('should reach Edge phase after Philosophy and Expertise', async ({ page }) => {
    await page.goto('/questions?dev=true');
    await page.waitForSelector('textarea', { timeout: 10000 });

    // Get total question count (should be 9: 3 + 4 + 2)
    const counterText = await page.locator('text=/질문 \\d+ \\/ (\\d+)/').textContent();
    const totalMatch = counterText?.match(/\/ (\d+)/);
    const totalQuestions = totalMatch ? parseInt(totalMatch[1]) : 9;

    // Navigate through all Philosophy (3) and Expertise (4) questions = 7 questions
    for (let i = 0; i < 7; i++) {
      await page.locator('textarea').fill(
        `테스트 답변 ${i + 1}: 충분히 긴 답변입니다. 최소 50자 이상을 맞추기 위해 텍스트를 작성합니다.`
      );
      await page.locator('button:has-text("다음")').click();
      await page.waitForTimeout(300);
    }

    // Should now be in Edge phase (questions 8-9)
    await expect(page.locator('h2:has-text("Edge")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/차별화 포인트/')).toBeVisible();

    // Edge badge should be visible
    await expect(page.locator('span:has-text("차별화")')).toBeVisible();
  });
});
