import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { QuestionDesignerAgent } from '@/agents/question-designer';
import { ResumeParserAgent } from '@/agents/resume-parser';
import { PortfolioAnalyzerAgent } from '@/agents/portfolio-analyzer';
import { BriefAnalysis, PersonaMap, SurveyCategory } from '@/types/survey';

/**
 * POST /api/questions/generate
 *
 * 이력서와 포트폴리오를 기반으로 맞춤형 질문을 생성합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log(`[Questions/Generate] Generating questions for session: ${sessionId}`);

    // 1. 업로드된 파일 조회
    const { data: uploads, error: uploadsError } = await supabaseAdmin
      .from('uploads')
      .select('*')
      .eq('session_id', sessionId);

    if (uploadsError || !uploads || uploads.length === 0) {
      return NextResponse.json(
        { error: '업로드된 파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const resumeUpload = uploads.find((u) => u.file_type === 'resume');
    const portfolioUpload = uploads.find((u) => u.file_type === 'portfolio');

    if (!resumeUpload) {
      return NextResponse.json(
        { error: '이력서가 업로드되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 2. 이력서 파싱
    console.log(`[Questions/Generate] Parsing resume...`);
    const resumeParser = new ResumeParserAgent();
    const resumeResult = await resumeParser.process(
      {
        fileUrl: resumeUpload.file_url,
        fileContent: resumeUpload.parsed_data?.text || '',
      },
      { sessionId, data: {} }
    );

    if (!resumeResult.success) {
      return NextResponse.json(
        { error: `이력서 분석 실패: ${resumeResult.error}` },
        { status: 500 }
      );
    }

    const parsedResume = resumeResult.data!;

    // 3. 포트폴리오 분석 (선택사항)
    console.log(`[Questions/Generate] Analyzing portfolio...`);
    let portfolioAnalysis;

    if (portfolioUpload) {
      const portfolioAnalyzer = new PortfolioAnalyzerAgent();
      const portfolioResult = await portfolioAnalyzer.process(
        {
          fileUrl: portfolioUpload.file_url,
          fileContent: portfolioUpload.parsed_data?.text || '',
        },
        { sessionId, data: {} }
      );

      if (portfolioResult.success) {
        portfolioAnalysis = portfolioResult.data!;
      } else {
        console.warn(`[Questions/Generate] Portfolio analysis failed, using defaults`);
        // 기본값 사용
        portfolioAnalysis = {
          projects: [],
          designStyle: '일반적인',
          strengths: [],
          uniquePoints: [],
        };
      }
    } else {
      // 포트폴리오가 없는 경우 기본값
      portfolioAnalysis = {
        projects: [],
        designStyle: '일반적인',
        strengths: [],
        uniquePoints: [],
      };
    }

    // 4. PSA 분석 결과 조회 (optional)
    console.log(`[Questions/Generate] Checking for PSA analysis...`);
    let briefAnalysis: BriefAnalysis | undefined;

    const { data: briefReport, error: briefError } = await supabaseAdmin
      .from('brief_reports')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (briefReport && !briefError) {
      console.log(
        `[Questions/Generate] PSA analysis found: ${briefReport.persona_title}`
      );

      // Brief report를 BriefAnalysis 형식으로 변환
      const personaKey = `${briefReport.top_categories[0]}-${briefReport.top_categories[1]}`;
      const persona = PersonaMap[personaKey];

      if (persona) {
        briefAnalysis = {
          sessionId,
          categoryScores: briefReport.scores.byCategory,
          totalScore: briefReport.total_score,
          persona,
          topCategories: briefReport.top_categories as SurveyCategory[],
          strengthsSummary: briefReport.strengths_summary,
          shadowSides: briefReport.shadow_sides,
          brandingKeywords: briefReport.branding_keywords,
          radarData: briefReport.radar_data,
          selectedSoulQuestions: briefReport.selected_soul_questions || [],
          completionTimeSeconds: briefReport.completion_time_seconds,
          analyzedAt: new Date(briefReport.created_at),
        };
      }
    } else {
      console.log(`[Questions/Generate] No PSA analysis found, using standard question generation`);
    }

    // 5. 질문 생성
    console.log(`[Questions/Generate] Generating custom questions...`);
    const questionDesigner = new QuestionDesignerAgent();
    const questionsResult = await questionDesigner.process(
      {
        resume: parsedResume,
        portfolio: portfolioAnalysis,
        briefAnalysis, // PSA 분석 결과 전달 (없으면 undefined)
      },
      { sessionId, data: {} }
    );

    if (!questionsResult.success) {
      return NextResponse.json(
        { error: `질문 생성 실패: ${questionsResult.error}` },
        { status: 500 }
      );
    }

    const questions = questionsResult.data!;

    // 6. 생성된 질문을 데이터베이스에 임시 저장 (선택사항)
    // 이미 question_answers 테이블이 있다면 questions 필드에 저장
    const { error: saveError } = await supabaseAdmin
      .from('question_answers')
      .upsert({
        session_id: sessionId,
        questions: questions,
        answers: {}, // 빈 답변 객체
      });

    if (saveError) {
      console.warn(`[Questions/Generate] Failed to save questions:`, saveError);
      // 저장 실패해도 질문은 반환
    }

    const totalQuestions = questionsResult.metadata?.totalQuestions || 0;
    const psaEnhanced = questionsResult.metadata?.psaEnhanced || false;

    console.log(
      `[Questions/Generate] Successfully generated ${totalQuestions} questions (PSA-enhanced: ${psaEnhanced})`
    );

    return NextResponse.json({
      data: questions,
      message: '맞춤형 질문이 생성되었습니다.',
      metadata: {
        totalQuestions,
        psaEnhanced,
      },
    });
  } catch (error: any) {
    console.error(`[Questions/Generate] Error:`, error);
    return NextResponse.json(
      { error: `질문 생성 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    );
  }
}
