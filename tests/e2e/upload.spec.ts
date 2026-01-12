import { test, expect } from '@playwright/test';
import { createSessionManager } from '../fixtures/session-manager';
import { createMockResumePDF, getMockResumeFormData } from '../fixtures/test-files';

/**
 * Upload Page E2E Tests
 *
 * STATUS: Phase 2 - Implemented
 * Tests for resume upload and form input functionality
 */

test.describe('Upload Page (Phase 2)', () => {
  const sessionManager = createSessionManager();
  let sessionId: string;

  test.beforeEach(async ({ page }) => {
    // Create session
    sessionId = await sessionManager.createSession(page);

    // Navigate to upload page
    await page.goto('/upload');
  });

  test.afterEach(async ({ page }) => {
    // Cleanup session
    if (sessionId) {
      await sessionManager.cleanupSession(sessionId);
      await sessionManager.clearLocalStorage(page);
    }
  });

  test('should display upload page correctly', async ({ page }) => {
    // Check page heading
    await expect(page.locator('h1')).toContainText('정보 입력');

    // Check tab options exist
    const formTab = page.locator('button:has-text("직접 입력")');
    const fileTab = page.locator('button:has-text("파일 업로드")');

    await expect(formTab).toBeVisible();
    await expect(fileTab).toBeVisible();

    // Check "다음 단계" button exists but is disabled initially
    const nextButton = page.locator('button:has-text("다음 단계")');
    await expect(nextButton).toBeVisible();
    await expect(nextButton).toBeDisabled();
  });

  test('should submit resume via form input', async ({ page }) => {
    // Form input tab should be selected by default
    await page.waitForTimeout(1000);

    const formData = getMockResumeFormData();

    // Fill basic information (name is optional, using placeholder)
    await page.getByPlaceholder('브랜딩 보고서에 표시할 이름').fill(formData.name);

    // Fill first experience (using placeholders)
    const firstExp = formData.experience[0];
    await page.getByPlaceholder('회사명 *').first().fill(firstExp.company);
    await page.getByPlaceholder('직책 *').first().fill(firstExp.role);

    // Fill dates using type="month" inputs
    const startDateInputs = page.locator('input[type="month"]');
    await startDateInputs.first().fill(firstExp.startDate);

    if (firstExp.current) {
      await page.click('button:has-text("재직중")');
    }

    // Fill achievements (first achievement is pre-filled)
    const firstAchievement = page.getByPlaceholder(/성과 1/).first();
    await firstAchievement.fill(firstExp.achievements[0]);

    // Fill skills (first skill input is pre-filled)
    await page.getByPlaceholder(/기술 1/).first().fill(formData.skills[0]);

    // Fill first project
    const firstProject = formData.projects[0];
    await page.getByPlaceholder('프로젝트명 *').first().fill(firstProject.name);
    await page.getByPlaceholder(/프로젝트 설명/).first().fill(firstProject.description);
    await page.getByPlaceholder(/성과\/임팩트/).first().fill(firstProject.impact);

    // Submit form
    const saveButton = page.locator('button:has-text("이력서 정보 저장")');
    await saveButton.click();

    // Wait for API response
    const response = await page.waitForResponse((resp) =>
      resp.url().includes('/api/resume-form') && resp.status() === 200
    );

    expect(response.status()).toBe(200);

    // Check success message
    await expect(page.locator('text=정보가 저장되었습니다')).toBeVisible({ timeout: 5000 });

    // Verify "다음 단계" button is now enabled
    const nextButton = page.locator('button:has-text("다음 단계")');
    await expect(nextButton).toBeEnabled({ timeout: 5000 });
  });

  test('should upload resume via file upload', async ({ page }) => {
    // Select file upload tab
    await page.click('button:has-text("파일 업로드")');
    await page.waitForTimeout(500);

    // Get mock PDF file
    const mockPDF = createMockResumePDF();

    // Find file input
    const fileInput = page.locator('input[type="file"]').first();

    // Upload file
    await fileInput.setInputFiles({
      name: mockPDF.name,
      mimeType: mockPDF.mimeType,
      buffer: mockPDF.buffer,
    });

    // Click upload button
    const uploadButton = page.locator('button:has-text("이력서 업로드 및 분석")');
    await uploadButton.click();

    // Wait for loading state (upload or parsing)
    await expect(page.locator('text=업로드')).toBeVisible();

    // Wait for API response (upload phase)
    const response = await page.waitForResponse(
      (resp) => resp.url().includes('/api/upload') && resp.status() === 200,
      { timeout: 15000 }
    );

    expect(response.status()).toBe(200);

    // Wait for parsing to complete or preview modal to appear
    // (parsing may take 10-20 seconds)
    await page.waitForTimeout(3000);

    // Check that either preview modal appears or parsing completes
    const previewModalVisible = await page.locator('text=이력서 분석 완료').isVisible().catch(() => false);
    const completedVisible = await page.locator('text=분석이 완료되었습니다').isVisible().catch(() => false);

    // Either parsing succeeded (preview modal) or completed status shown
    expect(previewModalVisible || completedVisible).toBeTruthy();
  });

  test('should proceed to questions page after form completion', async ({ page }) => {
    // Complete resume via form (default tab)
    await page.waitForTimeout(2000);

    await page.getByPlaceholder('브랜딩 보고서에 표시할 이름').fill('테스트 사용자');
    await page.getByPlaceholder('회사명 *').first().fill('Test Company');
    await page.getByPlaceholder('직책 *').first().fill('PM');
    await page.locator('input[type="month"]').first().fill('2020-01');
    await page.click('button:has-text("재직중")');
    await page.getByPlaceholder(/성과 1/).first().fill('성과 1');
    await page.getByPlaceholder(/기술 1/).first().fill('Skill 1');
    await page.getByPlaceholder('프로젝트명 *').first().fill('Project 1');
    await page.getByPlaceholder(/프로젝트 설명/).first().fill('Description');
    await page.getByPlaceholder(/성과\/임팩트/).first().fill('Impact');

    const saveButton = page.locator('button:has-text("이력서 정보 저장")');
    await saveButton.click();

    // Wait for API response and success
    const response = await page.waitForResponse((resp) => resp.url().includes('/api/resume-form'), { timeout: 15000 });
    expect(response.status()).toBe(200);

    // Wait for button to be enabled (indicates success)
    const nextButton = page.locator('button:has-text("다음 단계")');
    await expect(nextButton).toBeEnabled({ timeout: 15000 });

    // Click to navigate
    await nextButton.click();

    // Should navigate to questions page
    await expect(page).toHaveURL('/questions', { timeout: 10000 });
  });

  test('should allow skipping resume input', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForTimeout(1000);

    // Find the skip link
    const skipLink = page.locator('button:has-text("정보 없이 진행하기")');
    await expect(skipLink).toBeVisible();

    // Click skip link
    await skipLink.click();

    // Should navigate to questions page
    await expect(page).toHaveURL('/questions', { timeout: 10000 });
  });

  test('should switch between tabs', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Initially form tab should show form fields
    await expect(page.getByPlaceholder('브랜딩 보고서에 표시할 이름')).toBeVisible();

    // Click file upload tab
    await page.click('button:has-text("파일 업로드")');
    await page.waitForTimeout(500);

    // File upload area should be visible
    await expect(page.locator('text=파일을 드래그하거나 클릭하세요')).toBeVisible();

    // Click form tab again
    await page.click('button:has-text("직접 입력")');
    await page.waitForTimeout(500);

    // Form fields should be visible again
    await expect(page.getByPlaceholder('브랜딩 보고서에 표시할 이름')).toBeVisible();
  });

  test('should handle file upload errors', async ({ page }) => {
    await page.click('button:has-text("파일 업로드")');
    await page.waitForTimeout(500);

    // Mock API failure
    await page.route('**/api/upload', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: '파일 업로드 실패' }),
      });
    });

    const mockPDF = createMockResumePDF();
    const fileInput = page.locator('input[type="file"]').first();

    await fileInput.setInputFiles({
      name: mockPDF.name,
      mimeType: mockPDF.mimeType,
      buffer: mockPDF.buffer,
    });

    const uploadButton = page.locator('button:has-text("이력서 업로드 및 분석")');
    await uploadButton.click();

    // Should show error message
    await expect(page.locator('text=오류 발생')).toBeVisible({ timeout: 10000 });
  });

  test('should show back button that navigates to survey-result', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Find the back button
    const backButton = page.locator('button:has-text("이전")');
    await expect(backButton).toBeVisible();

    // Click back button
    await backButton.click();

    // Should navigate to survey-result page
    await expect(page).toHaveURL('/survey-result', { timeout: 10000 });
  });

  test('should redirect to survey-result page if no session', async ({ page }) => {
    // Clear localStorage to simulate no session
    await page.evaluate(() => localStorage.clear());

    // Try to access upload page directly
    await page.goto('/upload');

    // Should redirect to survey-result page
    await expect(page).toHaveURL('/survey-result', { timeout: 5000 });
  });
});
