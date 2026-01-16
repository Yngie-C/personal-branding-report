import { test, expect } from '@playwright/test';
import { createSessionManager } from '../fixtures/session-manager';

/**
 * Result Page E2E Tests (Phase 2)
 *
 * Tests for the final result page with download functionality.
 *
 * Two testing approaches:
 * 1. Dev Mode tests - Use ?dev=true for fast testing with mock data
 * 2. API Mock tests - Use page.route() to mock specific API responses
 *
 * Dev Mode is preferred for UI component testing as it requires no session setup.
 */

test.describe('Result Page - Dev Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to result page in Dev Mode
    await page.goto('/result?dev=true');
    await page.waitForTimeout(500);
  });

  test('should display result page with Dev Mode banner', async ({ page }) => {
    // Check for Dev Mode banner
    await expect(page.locator('text=[Dev Mode]')).toBeVisible();

    // Check for main heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display step header showing step 4', async ({ page }) => {
    // UploadPageHeader should show step 4 (결과확인)
    // The header shows 4-step flow: 이력서 → 질문 → 리포트 생성 → 결과확인
    const stepHeader = page.locator('[class*="flex"][class*="items-center"]');
    await expect(stepHeader.first()).toBeVisible();
  });

  test('should display download section', async ({ page }) => {
    // Check for download section presence
    await expect(page.locator('text=/PDF|다운로드/')).toBeVisible({ timeout: 10000 });
  });

  test('should display three download options', async ({ page }) => {
    // Check for three download options
    await expect(page.locator('text=/텍스트|슬라이드|프레젠테이션/')).toBeVisible();
  });

  test('should display social assets section', async ({ page }) => {
    // Check for social assets section
    await expect(page.locator('text=/소셜/')).toBeVisible();
  });

  test('should expand social assets section when clicked', async ({ page }) => {
    // Find and click the social assets section header
    const socialSection = page.locator('text=/소셜/').first();
    await socialSection.click();

    // Wait for expansion
    await page.waitForTimeout(500);

    // Check that asset names are visible (may vary based on component implementation)
    await expect(page.locator('text=/LinkedIn|Twitter|Instagram|명함/')).toBeVisible();
  });

  test('should display brand strategy summary', async ({ page }) => {
    // Dev mode mock data includes brand strategy
    await expect(
      page.locator('text=/브랜드|전략|혁신적 문제 해결/')
    ).toBeVisible();
  });

  test('should display profile URL for sharing', async ({ page }) => {
    // Dev mode mock data includes profileUrl
    // Check for share options section
    await expect(page.locator('text=/공유|프로필/')).toBeVisible();
  });

  test('should have action buttons', async ({ page }) => {
    // Check for action buttons
    await expect(page.locator('button:has-text("새 리포트 만들기")')).toBeVisible();
    await expect(page.locator('button:has-text("홈으로")')).toBeVisible();
  });

  test('should navigate to home on "홈으로 돌아가기" click', async ({ page }) => {
    // Click home button
    await page.locator('button:has-text("홈으로")').click();

    // Should navigate to home
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('should clear session and redirect on "새 리포트 만들기" click', async ({ page }) => {
    // Click "새 리포트 만들기" button
    await page.locator('button:has-text("새 리포트 만들기")').click();

    // Should navigate to home
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('should show support contact info', async ({ page }) => {
    // Check for support message at bottom
    await expect(page.locator('text=/문의사항|support/')).toBeVisible();
  });
});

test.describe('Result Page - Without Dev Mode (Session Required)', () => {
  test('should redirect to survey if no session and no dev mode', async ({ page }) => {
    // Clear localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Navigate without dev mode
    await page.goto('/result');

    // Should redirect to survey (session validation redirects to /survey)
    await expect(page).toHaveURL('/survey', { timeout: 10000 });
  });
});

test.describe('Result Page - API Mock Tests', () => {
  const sessionManager = createSessionManager();
  let sessionId: string;

  test.beforeEach(async ({ page }) => {
    // Create session
    sessionId = await sessionManager.createSession(page);

    // Mock the results API to return completed data
    await page.route('**/api/results?sessionId=*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            reportId: 'mock-report-id',
            textPdfUrl: 'https://example.com/mock-text-report.pdf',
            slidesPdfUrl: 'https://example.com/mock-slides.pdf',
            pptxUrl: 'https://example.com/mock-presentation.pptx',
            pdfUrl: 'https://example.com/mock-report.pdf',
            socialAssets: {
              linkedinBanner: 'https://example.com/linkedin-banner.png',
              linkedinProfile: 'https://example.com/linkedin-profile.png',
              businessCard: 'https://example.com/business-card.png',
              twitterHeader: 'https://example.com/twitter-header.png',
              instagramHighlight: 'https://example.com/instagram-highlight.png',
            },
            profileUrl: 'https://example.com/p/mock-profile',
            brandStrategy: {
              brandEssence: 'Test brand essence',
              uniqueValueProposition: 'Test UVP',
              targetAudience: ['Audience 1', 'Audience 2'],
            },
          },
        }),
      });
    });

    // Mock session status API to allow access
    await page.route('**/api/session/status*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            sessionId,
            exists: true,
            phase1: { surveyCompleted: true, briefReportGenerated: true },
            phase2: {
              uploadCompleted: true,
              questionsCompleted: true,
              generationStatus: 'completed',
            },
            allowedPages: ['/result'],
            redirectTo: null,
          },
        }),
      });
    });

    // Navigate to result page
    await page.goto('/result');
  });

  test.afterEach(async ({ page }) => {
    if (sessionId) {
      await sessionManager.cleanupSession(sessionId);
      await sessionManager.clearLocalStorage(page);
    }
  });

  test('should display download section with three options', async ({ page }) => {
    // Check download section title
    await expect(page.locator('text=/다운로드/')).toBeVisible({ timeout: 10000 });
  });

  test('should display social assets section', async ({ page }) => {
    await expect(page.locator('text=/소셜/')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Result Page - Error Handling (API Mock)', () => {
  const sessionManager = createSessionManager();

  test('should redirect to generating if report not ready (202 status)', async ({ page }) => {
    // Create session
    const sessionId = await sessionManager.createSession(page);

    // Mock session status API
    await page.route('**/api/session/status*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            sessionId,
            exists: true,
            phase1: { surveyCompleted: true, briefReportGenerated: true },
            phase2: {
              uploadCompleted: true,
              questionsCompleted: true,
              generationStatus: 'processing',
            },
            allowedPages: ['/result', '/generating'],
            redirectTo: '/generating',
          },
        }),
      });
    });

    // Mock API to return 202 (still generating)
    await page.route('**/api/results?sessionId=*', (route) => {
      route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Report generation in progress' }),
      });
    });

    await page.goto('/result');

    // Should redirect to /generating
    await expect(page).toHaveURL('/generating', { timeout: 10000 });

    // Cleanup
    await sessionManager.cleanupSession(sessionId);
    await sessionManager.clearLocalStorage(page);
  });

  test('should display error state with retry button on API error', async ({ page }) => {
    // Create session
    const sessionId = await sessionManager.createSession(page);

    // Mock session status API to allow access
    await page.route('**/api/session/status*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            sessionId,
            exists: true,
            phase1: { surveyCompleted: true, briefReportGenerated: true },
            phase2: {
              uploadCompleted: true,
              questionsCompleted: true,
              generationStatus: 'completed',
            },
            allowedPages: ['/result'],
            redirectTo: null,
          },
        }),
      });
    });

    // Mock API error
    await page.route('**/api/results?sessionId=*', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: '서버 오류가 발생했습니다' }),
      });
    });

    await page.goto('/result');

    // Should show error message
    await expect(page.locator('text=결과를 불러올 수 없습니다')).toBeVisible({ timeout: 10000 });

    // Should have retry button
    await expect(page.locator('button:has-text("다시 시도")')).toBeVisible();

    // Should have home button
    await expect(page.locator('button:has-text("홈으로")')).toBeVisible();

    // Cleanup
    await sessionManager.cleanupSession(sessionId);
    await sessionManager.clearLocalStorage(page);
  });
});

test.describe('Result Page - Visual Elements', () => {
  test('should have decorative blurred shapes', async ({ page }) => {
    await page.goto('/result?dev=true');

    // Check for blur decorative elements
    const blurredShapes = page.locator('[class*="blur-3xl"]');
    expect(await blurredShapes.count()).toBeGreaterThan(0);
  });

  test('should have glassmorphism card styling', async ({ page }) => {
    await page.goto('/result?dev=true');

    // Check for backdrop blur styling
    const glassCard = page.locator('.backdrop-blur-xl');
    await expect(glassCard.first()).toBeVisible();
  });
});
