import { Page } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * SessionManager - Manages test session lifecycle
 *
 * Responsible for:
 * - Creating test sessions via UI interaction
 * - Advancing sessions to specific workflow states
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
   * Create a new test session via API
   * Note: User flow changed - email is now collected AFTER survey completion
   * So we create session directly via API instead of using UI
   * @param page - Playwright page object (for localStorage access)
   * @param email - Email address to use (defaults to unique test email)
   * @returns Session ID
   */
  async createSession(page: Page, email?: string): Promise<string> {
    const testEmail = email || `test-${Date.now()}@playwright.test`;

    // Navigate to any page first to establish base URL
    await page.goto('/');

    // Create session via API
    const sessionData = await page.evaluate(async (email) => {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return { status: res.status, data: await res.json() };
    }, testEmail);

    if (sessionData.status !== 200 || !sessionData.data.session?.id) {
      throw new Error(`Failed to create session: ${JSON.stringify(sessionData)}`);
    }

    const sessionId = sessionData.data.session.id;

    // Store sessionId in localStorage (mimic app behavior)
    await page.evaluate((id) => {
      localStorage.setItem('sessionId', id);
    }, sessionId);

    console.log(`[SessionManager] Created session: ${sessionId} (${testEmail})`);
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

  // ========================================
  // State-Specific Session Creators
  // ========================================

  /**
   * Create session with resume completed
   * State: Resume form submitted, ready for survey
   * @param page - Playwright page object
   * @returns Session ID
   */
  async createSessionWithResume(page: Page): Promise<string> {
    const sessionId = await this.createSession(page);
    console.log(`[SessionManager] Advancing session to 'resume completed' state...`);

    // Submit resume form via API with properly formatted data
    const response = await page.evaluate(
      async ({ sessionId }) => {
        const res = await fetch('/api/resume-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            formData: {
              personalInfo: { name: '테스트 사용자' },
              experiences: [
                {
                  company: 'Test Company',
                  role: 'Product Manager',
                  startDate: '2020-01',
                  endDate: 'current', // API expects 'current' not boolean
                  achievements: ['사용자 증가 2배 달성', 'AI 추천 시스템 구축'],
                },
              ],
              skills: ['Product Management', 'Data Analysis', 'UX/UI Design'],
              projects: [
                {
                  name: 'AI 추천 시스템',
                  description: 'AI 기반 맞춤형 콘텐츠 추천 시스템 구축',
                  impact: '클릭률 40% 증가',
                  technologies: ['Python', 'TensorFlow'],
                },
              ],
            },
          }),
        });
        return { status: res.status, data: await res.json() };
      },
      { sessionId }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to submit resume: ${JSON.stringify(response.data)}`);
    }

    console.log(`[SessionManager] ✓ Resume completed for session ${sessionId}`);
    return sessionId;
  }

  /**
   * Create session with survey completed (brief report generated)
   * State: Survey submitted, brief analysis done, web profile created
   * @param page - Playwright page object
   * @returns Session ID and web profile slug
   */
  async createSessionWithSurveyResult(page: Page): Promise<{ sessionId: string; slug: string }> {
    const sessionId = await this.createSessionWithResume(page);
    console.log(`[SessionManager] Advancing session to 'survey completed' state...`);

    // Submit survey via API with properly formatted data
    // API expects answers as an array of SurveyAnswer objects
    const submitResponse = await page.evaluate(
      async ({ sessionId }) => {
        // Fetch actual question IDs from the API
        const questionsRes = await fetch('/api/survey/questions');
        const questionData = await questionsRes.json();

        if (!questionData.data?.questions || questionData.data.questions.length === 0) {
          return { status: 400, data: { error: 'No survey questions found' } };
        }

        // Build answers array with proper structure (SurveyAnswer format)
        const answers = questionData.data.questions.map((q: any) => ({
          questionId: q.id,
          questionNumber: q.questionNumber,
          category: q.category,
          score: 5, // Balanced score
        }));

        const res = await fetch('/api/survey/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            answers,
            completionTimeSeconds: 180, // 3 minutes
          }),
        });
        return { status: res.status, data: await res.json() };
      },
      { sessionId }
    );

    if (submitResponse.status !== 200) {
      throw new Error(`Failed to submit survey: ${JSON.stringify(submitResponse.data)}`);
    }

    // Trigger analysis (generates brief report + web profile)
    const analyzeResponse = await page.evaluate(async ({ sessionId }) => {
      const res = await fetch('/api/survey/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      return { status: res.status, data: await res.json() };
    }, { sessionId });

    if (analyzeResponse.status !== 200) {
      throw new Error(`Failed to analyze survey: ${JSON.stringify(analyzeResponse.data)}`);
    }

    // webProfileSlug may be undefined if web profile generation failed (non-blocking)
    const slug = analyzeResponse.data.webProfileSlug || '';

    console.log(`[SessionManager] ✓ Survey completed, brief report generated${slug ? ` (slug: ${slug})` : ''}`);
    return { sessionId, slug };
  }

  /**
   * Create session with questions generated
   * State: Enhanced questions generated, ready for user answers
   * @param page - Playwright page object
   * @returns Session ID
   */
  async createSessionWithQuestions(page: Page): Promise<string> {
    const { sessionId } = await this.createSessionWithSurveyResult(page);
    console.log(`[SessionManager] Advancing session to 'questions generated' state...`);

    // Trigger question generation
    const response = await page.evaluate(async ({ sessionId }) => {
      const res = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      return { status: res.status, data: await res.json() };
    }, { sessionId });

    if (response.status !== 200) {
      throw new Error(`Failed to generate questions: ${JSON.stringify(response.data)}`);
    }

    console.log(`[SessionManager] ✓ Questions generated for session ${sessionId}`);
    return sessionId;
  }

  /**
   * Create session with full report generation in progress
   * State: Question answers submitted, report generation started
   * @param page - Playwright page object
   * @returns Session ID
   */
  async createSessionWithGenerating(page: Page): Promise<string> {
    const sessionId = await this.createSessionWithQuestions(page);
    console.log(`[SessionManager] Advancing session to 'generating' state...`);

    // Submit question answers
    const answersResponse = await page.evaluate(async ({ sessionId }) => {
      // First, get the generated questions to use real IDs
      const questionsRes = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const questionsData = await questionsRes.json();
      const questions = questionsData.data || [];

      // Build answers object from real question IDs
      const answers: Record<string, string> = {};
      let answerIndex = 1;
      for (const category of questions) {
        for (const q of category.questions || []) {
          answers[q.id] = `테스트 답변 ${answerIndex}: 저는 데이터 기반 의사결정을 중시하며, 사용자 중심 제품을 만드는 것을 목표로 합니다.`;
          answerIndex++;
        }
      }

      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questions,
          answers,
        }),
      });
      return { status: res.status, data: await res.json() };
    }, { sessionId });

    if (answersResponse.status !== 200) {
      throw new Error(`Failed to submit question answers: ${JSON.stringify(answersResponse.data)}`);
    }

    // Trigger report generation (don't wait for completion)
    await page.evaluate(async ({ sessionId }) => {
      fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {
        // Ignore errors, just trigger generation
      });
    }, { sessionId });

    console.log(`[SessionManager] ✓ Report generation started for session ${sessionId}`);
    return sessionId;
  }

  /**
   * Create session with full report completed
   * State: Full branding report generated, all assets ready
   * @param page - Playwright page object
   * @returns Session ID
   * Note: This method waits for full report generation (may take 2-5 minutes)
   */
  async createSessionWithCompleted(page: Page): Promise<string> {
    const sessionId = await this.createSessionWithQuestions(page);
    console.log(`[SessionManager] Advancing session to 'completed' state (this may take 2-5 minutes)...`);

    // Submit question answers
    await page.evaluate(async ({ sessionId }) => {
      // First, get the generated questions to use real IDs
      const questionsRes = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const questionsData = await questionsRes.json();
      const questions = questionsData.data || [];

      // Build answers object from real question IDs with detailed responses
      const detailedAnswers = [
        '5년 경력의 프로덕트 매니저로서 데이터 기반 의사결정을 중시합니다.',
        '사용자 피드백을 제품 개선에 반영하는 것을 강점으로 생각합니다.',
        '팀원들과의 원활한 커뮤니케이션을 통해 목표를 달성합니다.',
        '빠르게 변화하는 시장에 유연하게 대응하며 도전을 두려워하지 않습니다.',
        '3년 내에 시니어 PM으로 성장하여 더 큰 임팩트를 만들고 싶습니다.',
        'AI와 머신러닝 기술을 활용한 혁신적인 제품을 만들고자 합니다.',
        '사용자에게 실질적인 가치를 제공하는 제품을 만드는 것이 목표입니다.',
        '스타트업에서 대기업까지 다양한 환경에서의 경험을 보유하고 있습니다.',
        '복잡한 문제를 단순화하고 명확한 로드맵을 제시하는 능력이 있습니다.',
      ];

      const answers: Record<string, string> = {};
      let answerIndex = 0;
      for (const category of questions) {
        for (const q of category.questions || []) {
          answers[q.id] = detailedAnswers[answerIndex % detailedAnswers.length];
          answerIndex++;
        }
      }

      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questions,
          answers,
        }),
      });
    }, { sessionId });

    // Trigger report generation
    await page.evaluate(async ({ sessionId }) => {
      await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    }, { sessionId });

    // Poll for completion (timeout after 5 minutes)
    const startTime = Date.now();
    const timeout = 300000; // 5 minutes

    while (Date.now() - startTime < timeout) {
      const statusResponse = await page.evaluate(async ({ sessionId }) => {
        const res = await fetch(`/api/generate?sessionId=${sessionId}`);
        return await res.json();
      }, { sessionId });

      if (statusResponse.status === 'completed') {
        console.log(`[SessionManager] ✓ Report generation completed for session ${sessionId}`);
        return sessionId;
      }

      if (statusResponse.status === 'failed') {
        throw new Error(`Report generation failed: ${statusResponse.error}`);
      }

      // Wait 3 seconds before next poll
      await page.waitForTimeout(3000);
    }

    throw new Error('Report generation timed out after 5 minutes');
  }

  /**
   * Get web profile slug for a session
   * @param sessionId - Session ID
   * @returns Web profile slug or null
   */
  async getWebProfileSlug(sessionId: string): Promise<string | null> {
    if (!this.supabase) {
      console.warn('[SessionManager] Cannot get web profile slug (no Supabase client)');
      return null;
    }

    const { data, error } = await this.supabase
      .from('web_profiles')
      .select('slug')
      .eq('session_id', sessionId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.slug;
  }
}

/**
 * Create a SessionManager instance for use in tests
 */
export function createSessionManager(): SessionManager {
  return new SessionManager();
}
