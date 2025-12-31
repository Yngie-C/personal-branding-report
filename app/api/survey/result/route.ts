import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { PersonaMap, getPersonaByCategories, SurveyCategory } from '@/types/survey';

/**
 * GET /api/survey/result?sessionId=xxx
 * PSA 약식 리포트 결과 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    // 1. 입력 검증
    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 2. Brief report 조회
    const { data: briefReport, error: briefError } = await supabaseAdmin
      .from('brief_reports')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (briefError || !briefReport) {
      console.error('[Survey Result API] Brief report not found:', briefError);
      return NextResponse.json(
        { error: '분석 결과를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 3. 페르소나 메타데이터 조회 (역순 매핑 지원)
    const persona = getPersonaByCategories(
      briefReport.top_categories as SurveyCategory[]
    );

    // 4. 응답 데이터 포맷팅
    return NextResponse.json({
      data: {
        sessionId,
        persona: {
          type: persona.type,
          title: persona.title,
          tagline: persona.tagline,
          description: persona.description,
          strengths: persona.strengths,
          shadowSides: persona.shadowSides,
          brandingKeywords: persona.brandingKeywords,
        },
        categoryScores: briefReport.scores.byCategory,
        totalScore: briefReport.total_score,
        topCategories: briefReport.top_categories,
        strengthsSummary: briefReport.strengths_summary,
        shadowSides: briefReport.shadow_sides,
        brandingKeywords: briefReport.branding_keywords,
        radarData: briefReport.radar_data,
        completionTimeSeconds: briefReport.completion_time_seconds,
        analyzedAt: briefReport.created_at,
      },
    });
  } catch (error) {
    console.error('[Survey Result API] Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
