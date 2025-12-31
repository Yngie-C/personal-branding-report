import { Page } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * SessionManager - Manages test session lifecycle
 *
 * Responsible for:
 * - Creating test sessions via UI interaction
 * - Cleaning up test data from Supabase
 * - Managing test isolation
 */
export class SessionManager {
  private supabase: SupabaseClient | null = null;

  constructor() {
    // Initialize Supabase client for cleanup operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.NEXT_SUPABASE_SECRET_KEY;

    if (supabaseUrl && supabaseSecretKey) {
      this.supabase = createClient(supabaseUrl, supabaseSecretKey);
    } else {
      console.warn('[SessionManager] Supabase credentials not found. Cleanup will be skipped.');
    }
  }

  /**
   * Create a new session by filling out the start page
   * @param page - Playwright page object
   * @param email - Email address to use (defaults to unique test email)
   * @returns Session ID from localStorage
   */
  async createSession(page: Page, email?: string): Promise<string> {
    const testEmail = email || `test-${Date.now()}@playwright.test`;

    // Navigate to start page
    await page.goto('/start');

    // Fill email input
    const emailInput = page.locator('input#email');
    await emailInput.fill(testEmail);

    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for API response
    await page.waitForResponse(
      (resp) => resp.url().includes('/api/session') && resp.status() === 200,
      { timeout: 10000 }
    );

    // Wait for redirect to upload page
    await page.waitForURL('/upload', { timeout: 10000 });

    // Extract sessionId from localStorage
    const sessionId = await page.evaluate(() => localStorage.getItem('sessionId'));

    if (!sessionId) {
      throw new Error('Session ID not found in localStorage after session creation');
    }

    console.log(`[SessionManager] Created session: ${sessionId}`);
    return sessionId;
  }

  /**
   * Clean up all test data associated with a session
   * @param sessionId - Session ID to clean up
   */
  async cleanupSession(sessionId: string): Promise<void> {
    if (!this.supabase) {
      console.warn(`[SessionManager] Skipping cleanup for session ${sessionId} (no Supabase client)`);
      return;
    }

    try {
      console.log(`[SessionManager] Cleaning up session: ${sessionId}`);

      // Delete in correct order due to foreign key constraints
      // 1. Social assets
      await this.supabase
        .from('social_assets')
        .delete()
        .eq('session_id', sessionId);

      // 2. Web profiles
      await this.supabase
        .from('web_profiles')
        .delete()
        .eq('session_id', sessionId);

      // 3. Reports
      await this.supabase
        .from('reports')
        .delete()
        .eq('session_id', sessionId);

      // 4. Brief reports
      await this.supabase
        .from('brief_reports')
        .delete()
        .eq('session_id', sessionId);

      // 5. Survey responses
      await this.supabase
        .from('survey_responses')
        .delete()
        .eq('session_id', sessionId);

      // 6. Question answers
      await this.supabase
        .from('question_answers')
        .delete()
        .eq('session_id', sessionId);

      // 7. Uploads
      await this.supabase
        .from('uploads')
        .delete()
        .eq('session_id', sessionId);

      // 8. Report sessions (main table)
      const { error } = await this.supabase
        .from('report_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error(`[SessionManager] Error during cleanup: ${error.message}`);
      } else {
        console.log(`[SessionManager] Successfully cleaned up session: ${sessionId}`);
      }
    } catch (error: any) {
      console.error(`[SessionManager] Failed to cleanup session ${sessionId}:`, error.message);
    }
  }

  /**
   * Clean up multiple sessions at once
   * @param sessionIds - Array of session IDs to clean up
   */
  async cleanupSessions(sessionIds: string[]): Promise<void> {
    for (const sessionId of sessionIds) {
      await this.cleanupSession(sessionId);
    }
  }

  /**
   * Clear localStorage for the current page
   * @param page - Playwright page object
   */
  async clearLocalStorage(page: Page): Promise<void> {
    await page.evaluate(() => localStorage.clear());
    console.log('[SessionManager] Cleared localStorage');
  }

  /**
   * Get session ID from localStorage
   * @param page - Playwright page object
   * @returns Session ID or null
   */
  async getSessionId(page: Page): Promise<string | null> {
    return await page.evaluate(() => localStorage.getItem('sessionId'));
  }
}

/**
 * Create a SessionManager instance for use in tests
 */
export function createSessionManager(): SessionManager {
  return new SessionManager();
}
