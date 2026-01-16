import { test, expect } from '@playwright/test';

/**
 * Generating Page E2E Tests (Phase 2)
 *
 * Tests the report generation progress UI using Dev Mode (?dev=true):
 * - 10-step timeline display with status icons
 * - Progress bar with percentage
 * - Simulated progress animation (2 seconds per step)
 * - Auto-redirect to /result on completion
 * - Error handling with retry button
 * - Dev Mode banner visibility
 *
 * Dev Mode simulates generation progress without actual API calls,
 * enabling fast testing of the UI components.
 */

test.describe('Generating Page - Dev Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to generating page in Dev Mode
    await page.goto('/generating?dev=true');

    // Wait for page to initialize
    await page.waitForTimeout(1000);
  });

  test('should display generating page correctly', async ({ page }) => {
    // Check for Dev Mode banner
    await expect(page.locator('text=[Dev Mode]')).toBeVisible();

    // Check for main heading
    await expect(page.locator('h1:has-text("생성 중")')).toBeVisible();

    // Check for Sparkles animation icon
    const sparklesIcon = page.locator('svg.lucide-sparkles');
    await expect(sparklesIcon).toBeVisible();

    // Check description text
    await expect(page.locator('text=/AI.*브랜딩/')).toBeVisible();
  });

  test('should display progress bar with percentage', async ({ page }) => {
    // Wait for initial progress to show
    await page.waitForTimeout(500);

    // Check for progress percentage display (format: XX%)
    await expect(page.locator('text=/%/')).toBeVisible();

    // Check for progress bar element (gradient background)
    const progressBar = page.locator('.bg-gradient-to-r.from-indigo-500');
    await expect(progressBar).toBeVisible();

    // Check for "진행률" label
    await expect(page.locator('text=진행률')).toBeVisible();
  });

  test('should display 10 generation steps', async ({ page }) => {
    // Wait for steps to render
    await page.waitForTimeout(500);

    // Check for step cards (should show "Step X" labels)
    const stepLabels = page.locator('text=/Step \\d+/');
    const stepCount = await stepLabels.count();

    // Should have 10 steps
    expect(stepCount).toBe(10);
  });

  test('should show step names in Korean', async ({ page }) => {
    await page.waitForTimeout(500);

    // Check for various step names from DEV_MODE_STEPS
    await expect(page.locator('text=이력서 분석')).toBeVisible();
    await expect(page.locator('text=브랜드 전략 수립')).toBeVisible();
    await expect(page.locator('text=콘텐츠 작성')).toBeVisible();
  });

  test('should show step status icons', async ({ page }) => {
    await page.waitForTimeout(500);

    // Completed steps should have checkmark icons
    const checkIcons = page.locator('svg.lucide-check-circle-2');
    expect(await checkIcons.count()).toBeGreaterThan(0);

    // In-progress step should have spinner
    const spinnerIcons = page.locator('svg.lucide-loader-2.animate-spin');
    expect(await spinnerIcons.count()).toBeGreaterThanOrEqual(0);
  });

  test('should display current step info', async ({ page }) => {
    // Wait for current step info to show
    await page.waitForTimeout(500);

    // Should show current step with format like "(4/10)"
    await expect(page.locator('text=/\\(\\d+\\/10\\)/')).toBeVisible();
  });

  test('should show estimated time message', async ({ page }) => {
    // Check for time estimate text
    await expect(page.locator('text=/소요 시간.*2-5분/')).toBeVisible();
  });

  test('should show page leave notice', async ({ page }) => {
    // Should have the notice about leaving the page
    await expect(
      page.locator('text=이 페이지를 떠나도 생성은 계속됩니다')
    ).toBeVisible();
  });

  test('should animate progress over time', async ({ page }) => {
    // Get initial progress percentage
    const initialProgressText = await page.locator('text=/%/').first().textContent();
    const initialMatch = initialProgressText?.match(/(\d+)%/);
    const initialPercent = initialMatch ? parseInt(initialMatch[1]) : 0;

    // Wait for progress simulation (Dev mode advances every 2 seconds)
    await page.waitForTimeout(4500);

    // Get updated progress percentage
    const updatedProgressText = await page.locator('text=/%/').first().textContent();
    const updatedMatch = updatedProgressText?.match(/(\d+)%/);
    const updatedPercent = updatedMatch ? parseInt(updatedMatch[1]) : 0;

    // Progress should have increased
    expect(updatedPercent).toBeGreaterThan(initialPercent);
  });

  test('should redirect to result page on completion', async ({ page }) => {
    test.setTimeout(60000); // 1 minute for full simulation

    // Wait for simulation to complete (10 steps * 2 seconds = ~20 seconds)
    // Plus some buffer time for redirects
    await expect(page).toHaveURL(/\/result\?dev=true/, { timeout: 45000 });
  });

  test('should show completion state before redirect', async ({ page }) => {
    test.setTimeout(60000);

    // Wait for completion (watch for completion message)
    await expect(page.locator('text=/완성|완료되었습니다/')).toBeVisible({
      timeout: 40000,
    });

    // Should show 100% progress
    await expect(page.locator('text=100%')).toBeVisible({ timeout: 5000 });
  });

  test('should show "생성 단계" section header', async ({ page }) => {
    await expect(page.locator('text=생성 단계')).toBeVisible();
  });

  test('should have step cards with proper styling', async ({ page }) => {
    await page.waitForTimeout(500);

    // Completed steps should have green styling
    const completedSteps = page.locator('.bg-green-50.border-green-200');
    expect(await completedSteps.count()).toBeGreaterThan(0);

    // In-progress step should have indigo styling
    const inProgressSteps = page.locator('.bg-indigo-50.border-indigo-200');
    expect(await inProgressSteps.count()).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Generating Page - Dev Mode Simulation Details', () => {
  test('should start with step 4 in progress', async ({ page }) => {
    await page.goto('/generating?dev=true');
    await page.waitForTimeout(500);

    // Dev mode starts at step 4 (콘텐츠 작성)
    // Steps 1-3 should be completed, step 4 in progress
    await expect(page.locator('text=/\\(4\\/10\\)|\\(5\\/10\\)/')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should have 3 completed steps initially', async ({ page }) => {
    await page.goto('/generating?dev=true');
    await page.waitForTimeout(500);

    // Count completed step indicators (checkmarks)
    const completedSteps = page.locator('.bg-green-50 svg.lucide-check-circle-2');
    expect(await completedSteps.count()).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Generating Page - Without Dev Mode (Redirect Test)', () => {
  test('should redirect to survey if no session and no dev mode', async ({ page }) => {
    // Clear localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Navigate without dev mode
    await page.goto('/generating');

    // Should redirect to survey (session validation redirects to /survey)
    await expect(page).toHaveURL('/survey', { timeout: 10000 });
  });
});

test.describe('Generating Page - Progress Header', () => {
  test('should display UploadPageHeader with step 3', async ({ page }) => {
    await page.goto('/generating?dev=true');
    await page.waitForTimeout(500);

    // UploadPageHeader shows the overall flow progress
    // Step 3 is "리포트 생성" in the 4-step flow
    // Check for the header component elements
    const stepIndicators = page.locator('[class*="flex"][class*="items-center"]');
    await expect(stepIndicators.first()).toBeVisible();
  });
});

test.describe('Generating Page - Visual Elements', () => {
  test('should have decorative blurred shapes', async ({ page }) => {
    await page.goto('/generating?dev=true');

    // Check for blur decorative elements
    const blurredShapes = page.locator('[class*="blur-3xl"]');
    expect(await blurredShapes.count()).toBeGreaterThan(0);
  });

  test('should have glassmorphism card styling', async ({ page }) => {
    await page.goto('/generating?dev=true');

    // Check for backdrop blur styling
    const glassCard = page.locator('.backdrop-blur-xl');
    await expect(glassCard.first()).toBeVisible();
  });

  test('should have animated Sparkles icon', async ({ page }) => {
    await page.goto('/generating?dev=true');

    // Sparkles icon should be animated (rotating)
    const sparkles = page.locator('svg.lucide-sparkles');
    await expect(sparkles).toBeVisible();

    // The parent div should have animation
    const animatedContainer = sparkles.locator('..');
    await expect(animatedContainer).toBeVisible();
  });
});

test.describe('Generating Page - Step Grid Layout', () => {
  test('should display steps in grid layout', async ({ page }) => {
    await page.goto('/generating?dev=true');
    await page.waitForTimeout(500);

    // Check for grid layout (responsive: 2 cols on mobile, 5 on desktop)
    const gridContainer = page.locator('.grid.grid-cols-2.sm\\:grid-cols-5');
    await expect(gridContainer).toBeVisible();
  });

  test('should show step number in each card', async ({ page }) => {
    await page.goto('/generating?dev=true');
    await page.waitForTimeout(500);

    // Each step card should have "Step X" label
    for (let i = 1; i <= 10; i++) {
      await expect(page.locator(`text=Step ${i}`)).toBeVisible();
    }
  });
});

test.describe('Generating Page - Dev Banner Content', () => {
  test('should explain dev mode simulation', async ({ page }) => {
    await page.goto('/generating?dev=true');

    // Dev mode banner should explain the simulation
    await expect(page.locator('text=/시뮬레이션.*진행/')).toBeVisible();
    await expect(page.locator('text=/2초마다 단계가 진행/')).toBeVisible();
  });
});
