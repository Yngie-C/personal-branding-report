import { test, expect } from '@playwright/test';
import { createSessionManager } from '../fixtures/session-manager';

/**
 * Result Page E2E Tests
 *
 * STATUS: Phase 2 - Implemented
 * Tests for the final result page with download functionality
 */

test.describe('Result Page (Phase 2)', () => {
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

  test('should display result page header correctly', async ({ page }) => {
    // Check success header with checkmark
    await expect(page.locator('text=브랜딩 리포트 완성!')).toBeVisible({ timeout: 5000 });

    // Check progress header shows step 4
    await expect(page.locator('text=결과확인')).toBeVisible();
  });

  test('should display download section with three options', async ({ page }) => {
    // Check download section title
    await expect(page.locator('text=리포트 다운로드')).toBeVisible({ timeout: 5000 });

    // Check for three download options
    await expect(page.locator('text=텍스트 리포트 (PDF)')).toBeVisible();
    await expect(page.locator('text=슬라이드 덱 (PDF)')).toBeVisible();
    await expect(page.locator('text=프레젠테이션 (PPTX)')).toBeVisible();
  });

  test('should make download cards clickable when URLs are available', async ({ page }) => {
    // Wait for content to load
    await expect(page.locator('text=리포트 다운로드')).toBeVisible({ timeout: 5000 });

    // Check that download cards have cursor-pointer class
    const textPdfCard = page.locator('text=텍스트 리포트 (PDF)').locator('..');
    await expect(textPdfCard).toBeVisible();

    // Check for download icon presence (indicates active state)
    const downloadIcons = page.locator('svg.lucide-download');
    const iconCount = await downloadIcons.count();
    expect(iconCount).toBeGreaterThanOrEqual(3);
  });

  test('should display social assets section (collapsed by default)', async ({ page }) => {
    // Wait for page load
    await expect(page.locator('text=브랜딩 리포트 완성!')).toBeVisible({ timeout: 5000 });

    // Check social assets section exists
    await expect(page.locator('text=소셜 미디어 에셋')).toBeVisible();

    // Check available count text
    await expect(page.locator('text=/\\d+개의 에셋 사용 가능/')).toBeVisible();
  });

  test('should expand social assets section when clicked', async ({ page }) => {
    // Wait for page load
    await expect(page.locator('text=소셜 미디어 에셋')).toBeVisible({ timeout: 5000 });

    // Click to expand
    await page.locator('text=소셜 미디어 에셋').click();

    // Wait for expansion animation
    await page.waitForTimeout(500);

    // Check that asset items are visible
    await expect(page.locator('text=LinkedIn 배너')).toBeVisible();
    await expect(page.locator('text=LinkedIn 프로필')).toBeVisible();
    await expect(page.locator('text=명함 디자인')).toBeVisible();
    await expect(page.locator('text=Twitter/X 헤더')).toBeVisible();
    await expect(page.locator('text=Instagram 하이라이트')).toBeVisible();
  });

  test('should have action buttons at the bottom', async ({ page }) => {
    // Wait for page load
    await expect(page.locator('text=브랜딩 리포트 완성!')).toBeVisible({ timeout: 5000 });

    // Check for action buttons
    await expect(page.locator('button:has-text("새 리포트 만들기")')).toBeVisible();
    await expect(page.locator('button:has-text("홈으로 돌아가기")')).toBeVisible();
  });

  test('should clear session and redirect on "새 리포트 만들기"', async ({ page }) => {
    // Wait for page load
    await expect(page.locator('text=브랜딩 리포트 완성!')).toBeVisible({ timeout: 5000 });

    // Click "새 리포트 만들기" button
    const newReportButton = page.locator('button:has-text("새 리포트 만들기")');
    await newReportButton.click();

    // Wait for navigation
    await page.waitForURL('/', { timeout: 5000 });

    // Check localStorage is cleared
    const storedSessionId = await page.evaluate(() => localStorage.getItem('sessionId'));
    expect(storedSessionId).toBeNull();
  });

  test('should navigate to home on "홈으로 돌아가기"', async ({ page }) => {
    // Wait for page load
    await expect(page.locator('text=브랜딩 리포트 완성!')).toBeVisible({ timeout: 5000 });

    // Click "홈으로 돌아가기" button
    await page.locator('button:has-text("홈으로 돌아가기")').click();

    // Wait for navigation
    await page.waitForURL('/', { timeout: 5000 });
  });
});

test.describe('Result Page - Error Handling', () => {
  const sessionManager = createSessionManager();

  test('should redirect to generating if report not ready (202 status)', async ({ page }) => {
    // Create session
    const sessionId = await sessionManager.createSession(page);

    // Mock API to return 202 (still generating)
    await page.route('**/api/results?sessionId=*', (route) => {
      route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Report generation in progress' }),
      });
    });

    await page.goto('/result');

    // Should show "리포트가 아직 생성 중입니다" message first
    await expect(page.locator('text=리포트가 아직 생성 중입니다')).toBeVisible({ timeout: 5000 });

    // Should redirect to /generating
    await page.waitForURL('/generating', { timeout: 5000 });

    // Cleanup
    await sessionManager.cleanupSession(sessionId);
    await sessionManager.clearLocalStorage(page);
  });

  test('should redirect to survey-result if no session', async ({ page }) => {
    // Clear all localStorage
    await page.evaluate(() => localStorage.clear());

    // Navigate to result page
    await page.goto('/result');

    // Should redirect to survey-result
    await page.waitForURL('/survey-result', { timeout: 5000 });
  });

  test('should display error state with retry button on API error', async ({ page }) => {
    // Create session
    const sessionId = await sessionManager.createSession(page);

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
    await expect(page.locator('text=결과를 불러올 수 없습니다')).toBeVisible({ timeout: 5000 });

    // Should show error details
    await expect(page.locator('text=서버 오류가 발생했습니다')).toBeVisible();

    // Should have retry button
    await expect(page.locator('button:has-text("다시 시도")')).toBeVisible();

    // Should have home button
    await expect(page.locator('button:has-text("홈으로")')).toBeVisible();

    // Cleanup
    await sessionManager.cleanupSession(sessionId);
    await sessionManager.clearLocalStorage(page);
  });

  test('should retry on clicking retry button', async ({ page }) => {
    // Create session
    const sessionId = await sessionManager.createSession(page);

    let callCount = 0;

    // Mock API to fail first, then succeed
    await page.route('**/api/results?sessionId=*', (route) => {
      callCount++;
      if (callCount === 1) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: '일시적 오류' }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              reportId: 'mock-report-id',
              textPdfUrl: 'https://example.com/report.pdf',
              slidesPdfUrl: null,
              pptxUrl: null,
              pdfUrl: 'https://example.com/report.pdf',
              socialAssets: {
                linkedinBanner: '',
                linkedinProfile: '',
                businessCard: '',
                twitterHeader: '',
                instagramHighlight: '',
              },
            },
          }),
        });
      }
    });

    await page.goto('/result');

    // First should show error
    await expect(page.locator('text=결과를 불러올 수 없습니다')).toBeVisible({ timeout: 5000 });

    // Click retry
    await page.locator('button:has-text("다시 시도")').click();

    // Should show success
    await expect(page.locator('text=브랜딩 리포트 완성!')).toBeVisible({ timeout: 5000 });

    // Cleanup
    await sessionManager.cleanupSession(sessionId);
    await sessionManager.clearLocalStorage(page);
  });

  test('should handle partial data (some URLs missing)', async ({ page }) => {
    // Create session
    const sessionId = await sessionManager.createSession(page);

    // Mock API with partial data
    await page.route('**/api/results?sessionId=*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            reportId: 'mock-report-id',
            textPdfUrl: 'https://example.com/report.pdf',
            slidesPdfUrl: null, // Missing
            pptxUrl: null, // Missing
            pdfUrl: 'https://example.com/report.pdf',
            socialAssets: {
              linkedinBanner: '',
              linkedinProfile: '',
              businessCard: '',
              twitterHeader: '',
              instagramHighlight: '',
            },
          },
        }),
      });
    });

    await page.goto('/result');

    // Should still show success page
    await expect(page.locator('text=브랜딩 리포트 완성!')).toBeVisible({ timeout: 5000 });

    // Should show download section
    await expect(page.locator('text=리포트 다운로드')).toBeVisible();

    // Text PDF should be clickable, others should show "준비 중"
    await expect(page.locator('text=텍스트 리포트 (PDF)')).toBeVisible();

    // Check for "파일을 준비 중입니다" messages (for missing URLs)
    const preparingMessages = page.locator('text=파일을 준비 중입니다');
    const messageCount = await preparingMessages.count();
    expect(messageCount).toBeGreaterThanOrEqual(2); // slidesPdf and pptx

    // Cleanup
    await sessionManager.cleanupSession(sessionId);
    await sessionManager.clearLocalStorage(page);
  });
});
