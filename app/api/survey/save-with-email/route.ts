import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { SurveyAnswer } from '@/types/survey';
import { BriefAnalysis } from '@/types/survey';
import { BriefWebProfileGeneratorAgent } from '@/agents/brief-web-profile-generator';

/**
 * POST /api/survey/save-with-email
 * 1. Create session with email
 * 2. Save survey responses to database
 * 3. Save brief analysis
 * 4. Generate web profile
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, answers, analysis } = body;

    // 1. Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '유효한 이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(answers) || answers.length !== 60) {
      return NextResponse.json(
        { error: '60개의 응답이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!analysis || !analysis.persona) {
      return NextResponse.json(
        { error: '분석 결과가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log(`[Save With Email API] Processing email: ${email}`);

    // 2. Create session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('report_sessions')
      .insert({
        email,
        status: 'draft',
        survey_completed: true,
        brief_report_generated: false, // Will be set to true after saving brief report
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error('[Save With Email API] Session creation error:', sessionError);
      return NextResponse.json(
        { error: '세션 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    const sessionId = session.id;
    console.log(`[Save With Email API] Created session: ${sessionId}`);

    // 3. Save survey responses
    const responsesToInsert = (answers as SurveyAnswer[]).map((answer) => ({
      session_id: sessionId,
      question_id: answer.questionId,
      question_number: answer.questionNumber,
      category: answer.category,
      score: answer.score,
    }));

    const { error: insertError } = await supabaseAdmin
      .from('survey_responses')
      .insert(responsesToInsert);

    if (insertError) {
      console.error('[Save With Email API] Survey responses insert error:', insertError);
      // Rollback session creation
      await supabaseAdmin.from('report_sessions').delete().eq('id', sessionId);
      return NextResponse.json(
        { error: '응답 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log(`[Save With Email API] Saved 60 survey responses`);

    // 4. Save brief report
    const briefAnalysis = analysis as BriefAnalysis;
    const { error: briefError } = await supabaseAdmin
      .from('brief_reports')
      .insert({
        session_id: sessionId,
        persona_type: briefAnalysis.persona.type,
        persona_title: briefAnalysis.persona.title,
        persona_tagline: briefAnalysis.persona.tagline,
        scores: { byCategory: briefAnalysis.categoryScores },
        top_categories: briefAnalysis.topCategories,
        strengths_summary: briefAnalysis.strengthsSummary,
        shadow_sides: briefAnalysis.shadowSides || null,
        branding_keywords: briefAnalysis.brandingKeywords,
        radar_data: briefAnalysis.radarData,
        total_score: briefAnalysis.totalScore,
        completion_time_seconds: briefAnalysis.completionTimeSeconds || null,
        low_score_reframing: briefAnalysis.lowScoreCategories || null,
        selected_soul_questions: briefAnalysis.selectedSoulQuestions || null,
      });

    if (briefError) {
      console.error('[Save With Email API] Brief report insert error:', briefError);
      // Non-blocking - continue even if brief report save fails
    } else {
      console.log(`[Save With Email API] Brief report saved successfully`);
    }

    // 5. Update session to mark brief report generated
    await supabaseAdmin
      .from('report_sessions')
      .update({ brief_report_generated: true })
      .eq('id', sessionId);

    // 6. Generate web profile
    let webProfileSlug: string | undefined;
    let webProfileUrl: string | undefined;

    try {
      const briefWebProfileAgent = new BriefWebProfileGeneratorAgent();

      const profileResult = await briefWebProfileAgent.process(
        { analysis: briefAnalysis, email },
        { sessionId, data: {} }
      );

      if (profileResult.success && profileResult.data) {
        const briefProfile = profileResult.data;

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
          console.error('[Save With Email API] Web profile insert error:', profileInsertError);
        } else {
          webProfileSlug = briefProfile.slug;
          webProfileUrl = `/p/${briefProfile.slug}`;
          console.log(`[Save With Email API] Web profile created: ${briefProfile.slug}`);
        }
      }
    } catch (error: any) {
      console.error('[Save With Email API] Web profile generation error:', error);
      // Non-blocking - continue even if web profile generation fails
    }

    // 7. Return session and profile info
    return NextResponse.json({
      data: {
        sessionId,
        email,
        webProfileSlug,
        webProfileUrl,
        message: '설문 결과가 저장되었습니다.',
      },
    });
  } catch (error: any) {
    console.error('[Save With Email API] Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
