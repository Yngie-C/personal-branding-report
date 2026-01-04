import { NextResponse } from 'next/server';
import { SurveyAnalyzerAgent } from '@/agents/survey-analyzer';
import { SurveyResponse, SurveyAnswer } from '@/types/survey';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * POST /api/survey/analyze-temp
 * Analyze survey responses from client (localStorage) without requiring sessionId
 * Returns brief analysis for preview before email submission
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers, completionTimeSeconds } = body; // Array of 60 SurveyAnswer objects + completion time

    // 1. Validation
    if (!Array.isArray(answers) || answers.length !== 60) {
      return NextResponse.json(
        { error: '60개의 응답이 필요합니다.' },
        { status: 400 }
      );
    }

    // Validate answer format and score range
    for (const answer of answers) {
      if (!answer.questionId || !answer.category || typeof answer.score !== 'number') {
        return NextResponse.json(
          { error: '응답 형식이 올바르지 않습니다.' },
          { status: 400 }
        );
      }
      if (answer.score < 1 || answer.score > 7) {
        return NextResponse.json(
          { error: '점수는 1~7 사이여야 합니다.' },
          { status: 400 }
        );
      }
    }

    console.log('[Temp Analyze API] Received 60 survey answers for temporary analysis');

    // 2. Load question metadata for reverse scoring
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('survey_questions')
      .select('id, question_number, category, question_text, is_reverse_scored')
      .eq('version', 2)
      .eq('is_active', true);

    if (questionsError || !questions) {
      console.error('[Temp Analyze API] Failed to load questions:', questionsError);
      return NextResponse.json(
        { error: '질문 메타데이터를 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    if (questions.length !== 60) {
      console.error(`[Temp Analyze API] Expected 60 questions, got ${questions.length}`);
      return NextResponse.json(
        { error: '질문 데이터가 불완전합니다.' },
        { status: 500 }
      );
    }

    // 3. Create temporary survey response (no sessionId yet)
    const tempSessionId = 'temp-' + Date.now();
    const surveyResponse: SurveyResponse = {
      sessionId: tempSessionId,
      answers: answers as SurveyAnswer[],
      completedAt: new Date(),
    };

    // 4. Run SurveyAnalyzerAgent
    console.log(`[Temp Analyze API] Running analysis for temporary session`);
    const analyzer = new SurveyAnalyzerAgent();
    const result = await analyzer.process(surveyResponse, {
      sessionId: tempSessionId,
      data: { questions },
    });

    if (!result.success || !result.data) {
      console.error('[Temp Analyze API] Analysis failed:', result.error);
      return NextResponse.json(
        { error: result.error || '분석에 실패했습니다.' },
        { status: 500 }
      );
    }

    const analysis = result.data;

    console.log(`[Temp Analyze API] Analysis completed: ${analysis.persona.title}`);

    // 5. Return analysis (no database save yet)
    return NextResponse.json({
      data: {
        persona: analysis.persona,
        categoryScores: analysis.categoryScores,
        totalScore: analysis.totalScore,
        topCategories: analysis.topCategories,
        strengthsSummary: analysis.strengthsSummary,
        shadowSides: analysis.shadowSides,
        brandingKeywords: analysis.brandingKeywords,
        radarData: analysis.radarData,
        lowScoreCategories: analysis.lowScoreCategories,
        selectedSoulQuestions: analysis.selectedSoulQuestions,
        completionTimeSeconds: completionTimeSeconds || undefined,
        strengthsScenarios: analysis.strengthsScenarios,
      },
      message: '분석이 완료되었습니다. 이메일을 입력하여 결과를 저장하세요.',
    });
  } catch (error: any) {
    console.error('[Temp Analyze API] Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
