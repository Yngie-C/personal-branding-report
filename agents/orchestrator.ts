import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ProgressTracker } from '@/lib/progress-tracker';
import { ResumeParserAgent } from './resume-parser';
import { PortfolioAnalyzerAgent } from './portfolio-analyzer';
import { BrandStrategistAgent } from './brand-strategist';
import { ContentWriterAgent } from './content-writer';
import { KeywordExtractorAgent } from './keyword-extractor';
import { ReportAssemblerAgent } from './report-assembler';
import { TextPdfGeneratorAgent } from './text-pdf-generator';
import { SlideDeckGeneratorAgent } from './slide-deck-generator';
import { StorageUploader } from '@/lib/storage-uploader';
import { PersonaMap } from '@/types/survey';
// WebProfileGeneratorAgent 제거 - 웹 프로필은 약식 리포트에서만 생성

export interface OrchestratorInput {
  sessionId: string;
}

export interface OrchestratorOutput {
  reportId: string;
  webProfileSlug?: string;
}

export class OrchestratorAgent extends BaseAgent<OrchestratorInput, OrchestratorOutput> {
  constructor() {
    super(
      'OrchestratorAgent',
      `당신은 퍼스널 브랜딩 리포트 생성을 총괄하는 오케스트레이터입니다.
전체 워크플로우를 관리하고 각 단계의 진행 상황을 추적합니다.`
    );
  }

  async process(
    input: OrchestratorInput,
    context: AgentContext
  ): Promise<AgentResult<OrchestratorOutput>> {
    const { sessionId } = input;

    // 프로그레스 트래커 초기화
    const progress = new ProgressTracker(sessionId);
    await progress.initialize();

    try {
      console.log(`[Orchestrator] Starting workflow for session: ${sessionId}`);

      // 1. 세션 데이터 로드
      const sessionData = await this.loadSessionData(sessionId);
      if (!sessionData.success) {
        return this.failure(sessionData.error || 'Failed to load session data');
      }

      // 2. 데이터 수집 단계 - Resume Parser + Portfolio Analyzer (병렬 실행)
      await progress.startStep(1, '이력서와 포트폴리오를 분석하고 있습니다...');
      console.log(`[Orchestrator] Step: Data Collection (Parallel)`);

      const [resumeResult, portfolioResult] = await Promise.allSettled([
        new ResumeParserAgent().process(
          {
            fileUrl: sessionData.data.uploads.resume.file_url,
            fileContent: sessionData.data.uploads.resume.text,
            source: sessionData.data.uploads.resume.source,
            formData: sessionData.data.uploads.resume.formData,
          },
          context
        ),
        new PortfolioAnalyzerAgent().process(
          {
            fileUrl: sessionData.data.uploads.portfolio.file_url,
            fileContent: sessionData.data.uploads.portfolio.text,
          },
          context
        ),
      ]);

      // Resume 결과 처리
      if (resumeResult.status === 'rejected' || !resumeResult.value.success) {
        const error = resumeResult.status === 'rejected'
          ? resumeResult.reason.message
          : resumeResult.value.error;
        await progress.failStep(1, error || 'Resume parsing failed');
        return this.failure(error || 'Resume parsing failed');
      }
      const parsedResume = resumeResult.value.data!;

      // Portfolio 결과 처리 (실패해도 계속 진행)
      let portfolioAnalysis = null;
      if (portfolioResult.status === 'fulfilled' && portfolioResult.value.success) {
        portfolioAnalysis = portfolioResult.value.data!;
      } else {
        console.warn(`[Orchestrator] Portfolio analysis failed, continuing with empty data`);
      }

      await progress.completeStep(1);

      // 3. 브랜드 전략 수립
      await progress.startStep(2, '브랜드 전략을 수립하고 있습니다...');
      console.log(`[Orchestrator] Step: Brand Strategy`);
      const brandStrategist = new BrandStrategistAgent();
      const brandResult = await brandStrategist.process(
        {
          resume: parsedResume,
          portfolio: portfolioAnalysis || { projects: [], strengths: [], designStyle: '', uniquePoints: [] },
          questionAnswers: sessionData.data.questionAnswers,
        },
        context
      );

      if (!brandResult.success) {
        await progress.failStep(2, brandResult.error || 'Brand strategy failed');
        return this.failure(brandResult.error || 'Brand strategy failed');
      }

      await progress.completeStep(2);
      const brandStrategy = brandResult.data!;

      // 3. 콘텐츠/키워드 병렬 생성
      await progress.startStep(3, '콘텐츠를 생성하고 있습니다...');
      console.log(`[Orchestrator] Step: Content, Keywords (Parallel)`);

      const [contentResult, keywordResult] = await Promise.allSettled([
        new ContentWriterAgent().process(
          {
            brandStrategy,
            resume: parsedResume,
            portfolio: portfolioAnalysis ?? undefined,
            questionAnswers: sessionData.data.questionAnswers,
            briefAnalysis: sessionData.data.briefAnalysis,
          },
          context
        ),
        new KeywordExtractorAgent().process(
          { brandStrategy, resume: parsedResume },
          context
        ),
      ]);

      // Content 결과 처리
      if (contentResult.status === 'rejected' || !contentResult.value.success) {
        const error = contentResult.status === 'rejected'
          ? contentResult.reason.message
          : contentResult.value.error;
        await progress.failStep(3, error || 'Content writing failed');
        return this.failure(error || 'Content writing failed');
      }
      const content = contentResult.value.data!;

      // Keyword 결과 처리 (실패해도 계속 진행)
      let keywords: { primary: string[]; secondary: string[]; hashtags: string[]; searchTerms: string[] } = {
        primary: [],
        secondary: [],
        hashtags: [],
        searchTerms: []
      };
      if (keywordResult.status === 'fulfilled' && keywordResult.value.success) {
        keywords = keywordResult.value.data!;
      } else {
        console.warn(`[Orchestrator] Keyword extraction failed, continuing with empty keywords`);
      }

      await progress.completeStep(3);

      // 4. 리포트 조립
      await progress.startStep(4, '리포트를 조립하고 있습니다...');
      console.log(`[Orchestrator] Step: Report Assembly`);
      const reportAssembler = new ReportAssemblerAgent();
      const reportResult = await reportAssembler.process(
        { content },
        context
      );

      if (!reportResult.success) {
        await progress.failStep(4, reportResult.error || 'Report assembly failed');
        return this.failure(reportResult.error || 'Report assembly failed');
      }

      const assembledReport = reportResult.data!;
      await progress.completeStep(4);

      // 5. Text PDF 생성 (Step 9 in progress tracker)
      await progress.startStep(9, '상세 텍스트 보고서를 생성하고 있습니다...');
      console.log(`[Orchestrator] Step 5: Text PDF Generation`);

      const textPdfAgent = new TextPdfGeneratorAgent();
      const textPdfResult = await textPdfAgent.process(
        {
          report: assembledReport,
          brandStrategy,
          resume: parsedResume,
        },
        context
      );

      let textPdfUrl: string | null = null;
      if (textPdfResult.success) {
        const uploader = new StorageUploader();
        textPdfUrl = await uploader.uploadPdf(sessionId, textPdfResult.data!.pdfBuffer, 'text');
        await progress.completeStep(9);
        console.log(`[Orchestrator] Text PDF uploaded: ${textPdfUrl}`);
      } else {
        console.warn(`[Orchestrator] Text PDF generation failed, continuing...`);
        await progress.failStep(9, textPdfResult.error || 'Text PDF generation failed');
      }

      // 6. Slide Deck 생성 (Step 10 in progress tracker)
      await progress.startStep(10, '슬라이드 프레젠테이션을 생성하고 있습니다...');
      console.log(`[Orchestrator] Step 6: Slide Deck Generation`);

      // briefAnalysis 검증 (PSA 설문 결과 필수)
      if (!sessionData.data.briefAnalysis) {
        const error = 'PSA 설문 결과가 없습니다. 약식 리포트를 먼저 생성해주세요.';
        await progress.failStep(10, error);
        return this.failure(error);
      }

      const slideDeckAgent = new SlideDeckGeneratorAgent();
      const slideDeckResult = await slideDeckAgent.process(
        {
          report: assembledReport,
          content,  // Added: pass the full content object with executiveSummary, strengthsSection, etc.
          brandStrategy,
          resume: parsedResume,
          portfolioAnalysis: portfolioAnalysis ?? undefined,
          briefAnalysis: sessionData.data.briefAnalysis,
        },
        context
      );

      let slidesPdfUrl: string | null = null;
      let pptxUrl: string | null = null;

      if (slideDeckResult.success) {
        const uploader = new StorageUploader();
        slidesPdfUrl = await uploader.uploadPdf(sessionId, slideDeckResult.data!.pdfBuffer, 'slides');
        pptxUrl = await uploader.uploadPdf(sessionId, slideDeckResult.data!.pptxBuffer, 'pptx');
        await progress.completeStep(10);
        console.log(`[Orchestrator] Slide Deck uploaded: PDF=${slidesPdfUrl}, PPTX=${pptxUrl}`);
      } else {
        await progress.failStep(10, slideDeckResult.error || 'Slide deck generation failed');
        return this.failure(slideDeckResult.error || 'Slide deck generation failed');
      }

      // 7. 최종 완료
      await progress.completeStep(5);

      const outputs = {
        webProfileSlug: undefined,  // 웹 프로필은 약식 리포트에서만 생성됨
      };

      // 6. 결과 저장 (웹 프로필 제외)
      console.log(`[Orchestrator] Saving results...`);
      const result = await this.saveResults(
        sessionId,
        outputs,
        brandStrategy,
        content,
        textPdfUrl,
        slidesPdfUrl,
        pptxUrl
      );

      // 7. 세션 상태 업데이트 및 프로그레스 완료
      await progress.complete();
      await supabaseAdmin
        .from('report_sessions')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      console.log(`[Orchestrator] ✅ Workflow completed successfully for session: ${sessionId}`);
      return this.success(result);
    } catch (error: any) {
      console.error(`[Orchestrator] Error:`, error);

      // 프로그레스 실패 표시
      await progress.failStep(progress['steps'].findIndex(s => s.status === 'in_progress') + 1 || 0, error.message);

      // 세션 상태를 failed로 업데이트
      await supabaseAdmin
        .from('report_sessions')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      return this.failure(error.message);
    }
  }

  private async loadSessionData(sessionId: string): Promise<AgentResult<any>> {
    try {
      // 업로드 파일 로드
      const { data: uploads } = await supabaseAdmin
        .from('uploads')
        .select('*')
        .eq('session_id', sessionId);

      // 질문 답변 로드
      const { data: questionAnswers } = await supabaseAdmin
        .from('question_answers')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      // PSA 설문 결과 로드 (PDF 슬라이드 생성에 필요)
      const { data: briefReport } = await supabaseAdmin
        .from('brief_reports')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      const resumeUpload = uploads?.find((u) => u.file_type === 'resume');
      const portfolioUpload = uploads?.find((u) => u.file_type === 'portfolio');

      const uploadsMap = {
        resume: {
          ...resumeUpload,
          // 데이터 소스 및 폼 입력 데이터 추가 (parsed_data JSONB 내부에서 가져옴)
          source: resumeUpload?.parsed_data?.source || 'file',
          formData: resumeUpload?.parsed_data?.formData || null,
          // 파싱된 텍스트 데이터 추출
          text: resumeUpload?.parsed_data?.text || '',
          metadata: resumeUpload?.parsed_data?.metadata || {},
        },
        portfolio: {
          ...portfolioUpload,
          text: portfolioUpload?.parsed_data?.text || '',
          metadata: portfolioUpload?.parsed_data?.metadata || {},
        },
      };

      // BriefAnalysis 형식으로 변환
      let briefAnalysis = null;
      if (briefReport) {
        // PersonaMap에서 전체 persona 정보 가져오기
        const personaKey = briefReport.top_categories?.join('-') || '';
        const personaMetadata = PersonaMap[personaKey] || {
          type: briefReport.persona_type,
          title: briefReport.persona_title,
          tagline: briefReport.persona_tagline || '',
          description: '',
          strengths: [],
          shadowSides: [],
          brandingKeywords: briefReport.branding_keywords || []
        };

        briefAnalysis = {
          sessionId,
          categoryScores: briefReport.scores?.byCategory || [],
          totalScore: briefReport.total_score || 0,
          persona: personaMetadata,
          topCategories: briefReport.top_categories || [],
          strengthsSummary: briefReport.strengths_summary || '',
          shadowSides: briefReport.shadow_sides,
          brandingKeywords: briefReport.branding_keywords || [],
          radarData: briefReport.radar_data || [],
          lowScoreCategories: briefReport.low_score_reframing ? JSON.parse(JSON.stringify(briefReport.low_score_reframing)) : undefined,
          selectedSoulQuestions: briefReport.selected_soul_questions,
          completionTimeSeconds: briefReport.completion_time_seconds,
          analyzedAt: new Date(briefReport.created_at)
        };
      }

      return this.success({
        uploads: uploadsMap,
        questionAnswers: questionAnswers?.answers || {},
        briefAnalysis,  // PSA 결과 추가
      });
    } catch (error: any) {
      return this.failure(`Failed to load session data: ${error.message}`);
    }
  }

  private async saveResults(
    sessionId: string,
    outputs: any,
    brandStrategy: any,
    content: any,
    textPdfUrl: string | null,
    slidesPdfUrl: string | null,
    pptxUrl: string | null
  ): Promise<OrchestratorOutput> {
    // 기존 리포트 삭제 (중복 방지)
    await supabaseAdmin.from('reports').delete().eq('session_id', sessionId);

    // 리포트 저장
    const { data: report } = await supabaseAdmin
      .from('reports')
      .insert({
        session_id: sessionId,
        brand_strategy: brandStrategy,
        content: content,
        text_pdf_url: textPdfUrl,
        slides_pdf_url: slidesPdfUrl,
        pptx_url: pptxUrl,
        pdf_url: slidesPdfUrl || textPdfUrl,  // Backward compatibility
        pdf_generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    // 웹 프로필 저장 제거 (약식 리포트에서 이미 생성됨)
    // Brief 프로필은 survey/analyze API에서 생성되므로 여기서는 생성하지 않음

    return {
      reportId: report?.id || '',
      webProfileSlug: undefined,  // 정식 리포트는 웹 프로필 생성 안 함
    };
  }
}
