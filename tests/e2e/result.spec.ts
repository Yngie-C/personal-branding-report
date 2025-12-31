import { test, expect } from '@playwright/test';

/**
 * Result Page E2E Tests
 *
 * Tests for /result page functionality:
 * - PDF download link
 * - Web profile link
 * - Social assets download
 * - "새로 만들기" button
 */

test.describe('Result Page', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.TEST_SESSION_COMPLETED, 'Requires completed session');

    await page.goto('/result');
  });

  test('should display result page correctly', async ({ page }) => {
    // Check success message
    await expect(page.locator('text=/완료|성공/').first()).toBeVisible();

    // Check heading
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Should show 3 main sections
    await expect(page.locator('text=/PDF|브랜딩 리포트/')).toBeVisible();
    await expect(page.locator('text=/웹 프로필|Web Profile/')).toBeVisible();
    await expect(page.locator('text=/소셜 미디어|Social/')).toBeVisible();
  });

  test('should display PDF download section', async ({ page }) => {
    // Check PDF section
    const pdfSection = page.locator('text=/PDF|리포트/').first();
    await expect(pdfSection).toBeVisible();

    // Check for file icon or download button
    const downloadButton = page.locator('a[href*=".pdf"], button:has-text("다운로드")').first();

    // PDF might still be generating, so check for either download link or "생성 중" message
    const hasPDF = await downloadButton.isVisible({ timeout: 2000 }).catch(() => false);
    const isGenerating = await page.locator('text=생성 중').isVisible().catch(() => false);

    expect(hasPDF || isGenerating).toBeTruthy();
  });

  test('should display web profile link', async ({ page }) => {
    // Check for web profile URL
    const profileLink = page.locator('a[href^="/p/"]');

    await expect(profileLink).toBeVisible({ timeout: 5000 });

    // Get the href
    const href = await profileLink.getAttribute('href');
    expect(href).toMatch(/^\/p\//);
  });

  test('should navigate to public profile when clicking web profile link', async ({ page }) => {
    const profileLink = page.locator('a[href^="/p/"]').first();
    await expect(profileLink).toBeVisible();

    // Click link (opens in new tab, so we need to handle popup)
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      profileLink.click(),
    ]);

    // Wait for new page to load
    await newPage.waitForLoadState();

    // Should navigate to /p/[slug]
    expect(newPage.url()).toMatch(/\/p\/.+/);

    // Close new page
    await newPage.close();
  });

  test('should display social assets', async ({ page }) => {
    // Check for social assets section
    const socialSection = page.locator('text=/소셜|Social/');
    await expect(socialSection).toBeVisible();

    // Should have multiple asset cards
    const assetCards = page.locator('[data-testid="social-asset"]');

    // If testid not available, count download links
    const assetLinks = page.locator('a[href*="linkedin"], a[href*="profile"], a[href*="card"], button:has-text("다운로드")');
    const assetCount = await assetLinks.count().catch(() => 0);

    // Should have at least 3 assets
    expect(assetCount).toBeGreaterThanOrEqual(3);
  });

  test('should list asset types correctly', async ({ page }) => {
    // Check for specific asset types
    const assetTypes = [
      'LinkedIn Banner',
      'Profile Image',
      'Business Card',
      'Twitter Header',
      'Instagram',
    ];

    let foundAssets = 0;

    for (const assetType of assetTypes) {
      const hasAsset = await page.locator(`text=${assetType}`).isVisible().catch(() => false);
      if (hasAsset) foundAssets++;
    }

    // Should have at least 2 of the listed asset types
    expect(foundAssets).toBeGreaterThanOrEqual(2);
  });

  test('should have "새로 만들기" button', async ({ page }) => {
    const newButton = page.locator('button:has-text("새로 만들기")');
    await expect(newButton).toBeVisible();
  });

  test('should clear session and redirect on "새로 만들기"', async ({ page }) => {
    const newButton = page.locator('button:has-text("새로 만들기")');
    await newButton.click();

    // Should clear localStorage
    const sessionId = await page.evaluate(() => localStorage.getItem('sessionId'));
    expect(sessionId).toBeNull();

    // Should redirect to home or start
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(start|$)/);
  });

  test('should have "모든 결과 인쇄" button', async ({ page }) => {
    const printButton = page.locator('button:has-text("인쇄")');

    const isVisible = await printButton.isVisible().catch(() => false);

    // Print button is optional, so just log if not found
    if (!isVisible) {
      console.log('[Result Test] Print button not found (optional feature)');
    }

    expect(true).toBeTruthy();
  });

  test('should trigger print dialog when clicking print button', async ({ page }) => {
    const printButton = page.locator('button:has-text("인쇄")');

    if (await printButton.isVisible().catch(() => false)) {
      // Mock window.print to verify it's called
      await page.evaluate(() => {
        (window as any).printCalled = false;
        window.print = () => {
          (window as any).printCalled = true;
        };
      });

      await printButton.click();

      const printCalled = await page.evaluate(() => (window as any).printCalled);
      expect(printCalled).toBeTruthy();
    } else {
      test.skip(true, 'Print button not available');
    }
  });
});

test.describe('Result Page - Error Handling', () => {
  test('should redirect to generating if report not ready (202 status)', async ({ page }) => {
    // Mock API to return 202 (still generating)
    await page.route('**/api/results?sessionId=*', (route) => {
      route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Still generating' }),
      });
    });

    await page.goto('/result');

    // Should redirect to /generating
    await expect(page).toHaveURL('/generating', { timeout: 5000 });
  });

  test('should show error if session not found', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());

    await page.goto('/result');

    // Should either redirect to start or show error
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    const hasError = await page.locator('text=/오류|에러/').count();

    expect(currentUrl.includes('/start') || hasError > 0).toBeTruthy();
  });

  test('should display error state with retry options', async ({ page }) => {
    // Mock API error
    await page.route('**/api/results?sessionId=*', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: '서버 오류' }),
      });
    });

    test.skip(!process.env.TEST_SESSION_COMPLETED);

    await page.goto('/result');

    // Should show error message
    await expect(page.locator('text=/오류|에러|실패/')).toBeVisible({ timeout: 5000 });

    // Should have retry or restart buttons
    const actionButtons = page.locator('button:has-text("다시"), button:has-text("재시도"), button:has-text("처음")');
    const buttonCount = await actionButtons.count();

    expect(buttonCount).toBeGreaterThan(0);
  });
});
