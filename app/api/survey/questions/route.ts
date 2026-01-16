import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { SurveyCategory } from '@/types/survey';

/**
 * GET /api/survey/questions
 * 60개의 PSA 설문 질문을 반환 (각 카테고리당 12문제)
 * 프론트엔드에서 세션별로 랜덤 순서로 셔플하여 표시함
 */
export async function GET() {
  try {
    // 활성 상태의 version 2 질문 60개 조회
    const { data: questions, error } = await supabaseAdmin
      .from('survey_questions')
      .select('*')
      .eq('version', 2)
      .eq('is_active', true)
      .order('question_number', { ascending: true });

    if (error) {
      console.error('[Survey Questions API] Database error:', error);
      return NextResponse.json(
        { error: '질문을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    if (!questions || questions.length === 0) {
      console.error('[Survey Questions API] No questions found');
      return NextResponse.json(
        { error: '설문 질문이 존재하지 않습니다.' },
        { status: 404 }
      );
    }

    // 질문 배열로 변환
    const questionArray = questions.map(q => ({
      id: q.id,
      questionNumber: q.question_number,
      category: q.category,
      questionText: q.question_text,
      questionHint: q.question_hint,
      isReverseScored: q.is_reverse_scored || false, // NEW: Include reverse scoring flag
    }));

    // 카테고리별로 그룹화 (선택적 정보)
    const groupedByCategory = questionArray.reduce((acc, q) => {
      const category = q.category as SurveyCategory;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(q);
      return acc;
    }, {} as Record<SurveyCategory, any[]>);

    // 각 카테고리가 10개씩 있는지 검증
    const categoryCounts = Object.entries(groupedByCategory).map(([cat, qs]) => ({
      category: cat,
      count: qs.length,
    }));

    const totalCount = questionArray.length;

    if (totalCount !== 60) {
      console.warn(
        `[Survey Questions API] Expected 60 questions but found ${totalCount}`
      );
    }

    // Add caching headers - questions rarely change
    // Cache for 1 hour on client, revalidate in background
    return NextResponse.json({
      data: {
        questions: questionArray,  // 배열로 반환
        grouped: groupedByCategory,  // 그룹화된 버전 (선택적)
        totalQuestions: totalCount,
        categories: Object.keys(groupedByCategory),
        categoryCounts,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[Survey Questions API] Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
