import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { SurveyAnalyzerAgent } from '@/agents/survey-analyzer';
import { SurveyResponse, SurveyAnswer, SurveyCategory } from '@/types/survey';

/**
 * POST /api/survey/analyze
 * 설문 응답을 분석하여 PSA 약식 리포트 생성
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    // 1. 입력 검증
    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 2. 세션 및 응답 완료 여부 확인
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('report_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('[Survey Analyze API] Session not found:', sessionError);
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!session.survey_completed) {
      return NextResponse.json(
        { error: '설문을 먼저 완료해주세요.' },
        { status: 400 }
      );
    }

    // 3. 응답 데이터 로드
    const { data: responses, error: responsesError } = await supabaseAdmin
      .from('survey_responses')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_number', { ascending: true });

    if (responsesError || !responses) {
      console.error('[Survey Analyze API] Failed to load responses:', responsesError);
      return NextResponse.json(
        { error: '응답 데이터를 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    if (responses.length !== 60) {
      console.error(
        `[Survey Analyze API] Expected 60 responses but found ${responses.length}`
      );
      return NextResponse.json(
        { error: `응답이 60개가 아닙니다 (${responses.length}개)` },
        { status: 400 }
      );
    }

    // 4. 응답 데이터 변환
    const answers: SurveyAnswer[] = responses.map((r) => ({
      questionId: r.question_id,
      questionNumber: r.question_number,
      category: r.category as SurveyCategory,
      score: r.score,
    }));

    const surveyResponse: SurveyResponse = {
      sessionId,
      answers,
      completedAt: new Date(session.updated_at),
      // completionTimeSeconds는 optional이므로 생략 가능
    };

    // 4.5. Fetch question metadata (for reverse scoring)
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('survey_questions')
      .select('id, question_number, category, question_text, is_reverse_scored')
      .eq('version', 2)
      .eq('is_active', true);

    if (questionsError || !questions) {
      console.error('[Survey Analyze API] Failed to load questions:', questionsError);
      return NextResponse.json(
        { error: '질문 메타데이터를 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    // 5. SurveyAnalyzerAgent 실행
    console.log(`[Survey Analyze API] Running SurveyAnalyzerAgent for session ${sessionId}`);

    const analyzer = new SurveyAnalyzerAgent();
    const result = await analyzer.process(surveyResponse, {
      sessionId,
      data: {
        questions, // Pass question metadata for reverse scoring
      },
    });

    if (!result.success || !result.data) {
      console.error('[Survey Analyze API] Analysis failed:', result.error);
      return NextResponse.json(
        { error: result.error || '분석에 실패했습니다.' },
        { status: 500 }
      );
    }

    const analysis = result.data;

    // 6. Brief report 저장 (기존 데이터 삭제 후 삽입)
    const { error: deleteError } = await supabaseAdmin
      .from('brief_reports')
      .delete()
      .eq('session_id', sessionId);

    if (deleteError) {
      console.warn('[Survey Analyze API] Failed to delete existing brief report:', deleteError);
    }

    const { error: insertError } = await supabaseAdmin.from('brief_reports').insert({
      session_id: sessionId,
      persona_type: analysis.persona.type,
      persona_title: analysis.persona.title,
      persona_tagline: analysis.persona.tagline,
      scores: {
        byCategory: analysis.categoryScores,
      },
      top_categories: analysis.topCategories,
      strengths_summary: analysis.strengthsSummary,
      shadow_sides: analysis.shadowSides || null,
      branding_keywords: analysis.brandingKeywords,
      radar_data: analysis.radarData,
      total_score: analysis.totalScore,
      completion_time_seconds: analysis.completionTimeSeconds || null,
      low_score_reframing: analysis.lowScoreCategories || null,
      selected_soul_questions: analysis.selectedSoulQuestions || null,
    });

    if (insertError) {
      console.error('[Survey Analyze API] Failed to save brief report:', insertError);
      return NextResponse.json(
        { error: '분석 결과 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 7. 세션 상태 업데이트
    const { error: updateError } = await supabaseAdmin
      .from('report_sessions')
      .update({
        brief_report_generated: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('[Survey Analyze API] Session update error:', updateError);
    }

    console.log(
      `[Survey Analyze API] Analysis completed: ${analysis.persona.title} (${analysis.totalScore.toFixed(1)}점)`
    );

    // 8. 약식 웹 프로필 생성 (무료 티어)
    console.log('[Survey Analyze API] Generating brief web profile...');

    let webProfileSlug: string | undefined;
    let webProfileUrl: string | undefined;

    try {
      const { BriefWebProfileGeneratorAgent } = await import('@/agents/brief-web-profile-generator');
      const briefWebProfileAgent = new BriefWebProfileGeneratorAgent();

      const profileResult = await briefWebProfileAgent.process(
        { analysis, email: session.email },
        { sessionId, data: {} }
      );

      if (profileResult.success && profileResult.data) {
        const briefProfile = profileResult.data;

        // 웹 프로필을 데이터베이스에 저장
        const { error: profileInsertError } = await supabaseAdmin
          .from('web_profiles')
          .insert({
            session_id: sessionId,
            slug: briefProfile.slug,
            type: 'brief',
            profile_data: briefProfile,
            seo_data: briefProfile.seo,
            is_public: true,
          });

        if (profileInsertError) {
          console.error('[Survey Analyze API] Failed to save brief web profile:', profileInsertError);
          // Non-blocking: 분석 결과는 반환하되, 공유 기능만 비활성화
        } else {
          webProfileSlug = briefProfile.slug;
          webProfileUrl = `/p/${briefProfile.slug}`;
          console.log(`[Survey Analyze API] Brief web profile created: ${briefProfile.slug}`);
        }
      } else {
        console.warn('[Survey Analyze API] Brief web profile generation failed:', profileResult.error);
        // Non-blocking: 분석 결과는 반환
      }
    } catch (error: any) {
      console.error('[Survey Analyze API] Brief web profile error:', error);
      // Non-blocking: 웹 프로필 생성 실패해도 분석 결과는 반환
    }

    // 9. 응답 반환
    return NextResponse.json({
      data: {
        sessionId,
        persona: {
          type: analysis.persona.type,
          title: analysis.persona.title,
          tagline: analysis.persona.tagline,
          description: analysis.persona.description,
        },
        categoryScores: analysis.categoryScores,
        totalScore: analysis.totalScore,
        topCategories: analysis.topCategories,
        strengthsSummary: analysis.strengthsSummary,
        shadowSides: analysis.shadowSides,
        brandingKeywords: analysis.brandingKeywords,
        radarData: analysis.radarData,
        webProfileSlug,      // 웹 프로필 slug (undefined if failed)
        webProfileUrl,       // 웹 프로필 URL (undefined if failed)
        message: '분석이 완료되었습니다.',
      },
    });
  } catch (error) {
    console.error('[Survey Analyze API] Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
