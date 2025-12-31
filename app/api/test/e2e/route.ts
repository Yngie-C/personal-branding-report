import { NextRequest, NextResponse } from 'next/server';
import { E2ETestAgent } from '@/agents/e2e-test-agent';
import { E2ETestConfig } from '@/types/e2e-test';
import { getTestFixtures } from '@/test-data/fixtures';

/**
 * E2E 테스트 실행 API
 *
 * POST /api/test/e2e
 *
 * Body (optional):
 * {
 *   email?: string,
 *   useCustomData?: boolean,
 *   cleanupAfterTest?: boolean,
 *   timeoutMs?: number
 * }
 *
 * Response:
 * {
 *   data: E2ETestOutput
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const {
      email = `e2e-test-${Date.now()}@test.com`,
      useCustomData = false,
      cleanupAfterTest = true,
      timeoutMs = 300000, // 5분
    } = body;

    // 테스트 설정 생성
    const testConfig: E2ETestConfig = useCustomData && body.testData
      ? body.testData
      : {
          email,
          resumeFile: getTestFixtures().resumeFile,
          portfolioFile: getTestFixtures().portfolioFile,
          surveyData: getTestFixtures().surveyData,
          questionnaireData: getTestFixtures().questionnaireData,
          cleanupAfterTest,
          timeoutMs,
        };

    // E2E Test Agent 실행
    const agent = new E2ETestAgent();
    const result = await agent.process(testConfig, {
      sessionId: 'e2e-test',
      data: {},
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'E2E test failed',
          details: result.metadata?.testOutput,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: result.data,
      message: 'E2E test completed successfully',
    });

  } catch (error: any) {
    console.error('[E2E Test API] Error:', error);
    return NextResponse.json(
      {
        error: 'E2E test execution failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test/e2e
 *
 * 테스트 가능 여부 확인 및 정보 제공
 */
export async function GET() {
  return NextResponse.json({
    message: 'E2E Test API is ready',
    usage: {
      endpoint: 'POST /api/test/e2e',
      description: 'Run end-to-end test for the entire workflow',
      parameters: {
        email: 'Optional test email (default: auto-generated)',
        useCustomData: 'Use custom test data instead of fixtures (default: false)',
        cleanupAfterTest: 'Clean up test data after completion (default: true)',
        timeoutMs: 'Timeout for report generation in milliseconds (default: 300000)',
      },
      example: {
        method: 'POST',
        body: {
          email: 'test@example.com',
          cleanupAfterTest: true,
          timeoutMs: 300000,
        },
      },
    },
  });
}
