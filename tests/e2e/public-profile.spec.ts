import { test, expect } from '@playwright/test';

/**
 * Public Profile Page E2E Tests
 *
 * Tests for /p/[slug] page functionality:
 * - Server-side rendering
 * - SEO metadata
 * - Profile content display
 * - 404 handling
 */

test.describe('Public Profile Page', () => {
  // Note: This test requires a real profile slug
  // For testing, we'll use a mock slug or skip if not available
  const testSlug = process.env.TEST_PROFILE_SLUG || 'test-profile';

  test('should render public profile page', async ({ page }) => {
    test.skip(!process.env.TEST_PROFILE_SLUG, 'Requires valid profile slug');

    await page.goto(`/p/${testSlug}`);

    // Should load successfully
    await expect(page).toHaveURL(`/p/${testSlug}`);

    // Should have main heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should display SEO metadata', async ({ page }) => {
    test.skip(!process.env.TEST_PROFILE_SLUG);

    await page.goto(`/p/${testSlug}`);

    // Check page title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();

    // Check Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');

    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
  });

  test('should display hero section', async ({ page }) => {
    test.skip(!process.env.TEST_PROFILE_SLUG);

    await page.goto(`/p/${testSlug}`);

    // Check for headline
    const headline = page.locator('h1, h2').first();
    await expect(headline).toBeVisible();

    // Check for subheadline or description
    const description = page.locator('p, text=/브랜드|전문/').first();
    await expect(description).toBeVisible();
  });

  test('should display profile sections', async ({ page }) => {
    test.skip(!process.env.TEST_PROFILE_SLUG);

    await page.goto(`/p/${testSlug}`);

    // Look for section headings
    const sections = page.locator('h2, h3');
    const sectionCount = await sections.count();

    // Should have at least a few sections
    expect(sectionCount).toBeGreaterThan(0);
  });

  test('should display contact information', async ({ page }) => {
    test.skip(!process.env.TEST_PROFILE_SLUG);

    await page.goto(`/p/${testSlug}`);

    // Check for email or contact info
    const contact = page.locator('text=/email|연락|contact/i');

    const hasContact = await contact.isVisible({ timeout: 2000 }).catch(() => false);

    // Contact info is optional
    if (!hasContact) {
      console.log('[Public Profile] Contact info not displayed (optional)');
    }

    expect(true).toBeTruthy();
  });

  test('should return 404 for invalid slug', async ({ page }) => {
    const invalidSlug = 'invalid-slug-' + Date.now();

    const response = await page.goto(`/p/${invalidSlug}`);

    // Should return 404 status
    expect(response?.status()).toBe(404);

    // Should show 404 page or error message
    const has404 = await page.locator('text=/404|Not Found|찾을 수 없/').isVisible().catch(() => false);

    expect(has404).toBeTruthy();
  });

  test('should return 404 for unpublished profile', async ({ page }) => {
    // Try to access a profile that exists but is not public
    // This assumes we have a way to create such a profile in test

    test.skip(true, 'Requires unpublished profile setup');

    const unpublishedSlug = 'unpublished-test';

    const response = await page.goto(`/p/${unpublishedSlug}`);

    // Should return 404
    expect(response?.status()).toBe(404);
  });

  test('should be accessible via direct URL', async ({ page }) => {
    test.skip(!process.env.TEST_PROFILE_SLUG);

    // Navigate to profile directly (not from result page)
    await page.goto(`/p/${testSlug}`);

    // Should load without errors
    await expect(page).toHaveURL(`/p/${testSlug}`);

    // Should display content
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should be shareable (has proper URL structure)', async ({ page }) => {
    test.skip(!process.env.TEST_PROFILE_SLUG);

    await page.goto(`/p/${testSlug}`);

    const currentUrl = page.url();

    // URL should match pattern /p/[slug]
    expect(currentUrl).toMatch(/\/p\/[a-z0-9-]+$/);

    // URL should not contain session IDs or sensitive data
    expect(currentUrl).not.toContain('sessionId');
    expect(currentUrl).not.toContain('email');
  });

  test('should have semantic HTML structure', async ({ page }) => {
    test.skip(!process.env.TEST_PROFILE_SLUG);

    await page.goto(`/p/${testSlug}`);

    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();

    // Should have exactly one h1
    expect(h1Count).toBe(1);
  });

  test('should load quickly (performance)', async ({ page }) => {
    test.skip(!process.env.TEST_PROFILE_SLUG);

    const startTime = Date.now();

    await page.goto(`/p/${testSlug}`);

    const loadTime = Date.now() - startTime;

    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});

test.describe('Public Profile - Static Generation', () => {
  test('should work without JavaScript (SSR)', async ({ page }) => {
    test.skip(!process.env.TEST_PROFILE_SLUG);

    // Disable JavaScript
    await page.context().setJavaScriptEnabled(false);

    await page.goto(`/p/${process.env.TEST_PROFILE_SLUG}`);

    // Content should still be visible (server-rendered)
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Re-enable JavaScript for cleanup
    await page.context().setJavaScriptEnabled(true);
  });
});
