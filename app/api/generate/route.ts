import { NextResponse } from 'next/server';
import { OrchestratorAgent } from '@/agents/orchestrator';
import { ProgressTracker } from '@/lib/progress-tracker';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Orchestrator Agent 실행
    const orchestrator = new OrchestratorAgent();
    const result = await orchestrator.process(
      { sessionId },
      { sessionId, data: {} }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '리포트 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 생성 진행 상황 조회
    const progress = await ProgressTracker.getProgress(sessionId);

    if (!progress) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    console.error('Generate GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
