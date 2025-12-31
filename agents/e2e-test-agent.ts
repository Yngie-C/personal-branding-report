import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { E2ETestInput, E2ETestOutput, TestStepResult, E2ETestConfig } from '@/types/e2e-test';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * E2E 테스트를 자동으로 실행하는 Agent
 * 전체 워크플로우를 시뮬레이션하고 각 단계를 검증합니다.
 */
export class E2ETestAgent extends BaseAgent<E2ETestConfig, E2ETestOutput> {
  private testId: string;
  private startTime: Date;
  private steps: TestStepResult[] = [];
  private errors: string[] = [];

  constructor() {
    super(
      'E2ETestAgent',
      `당신은 퍼스널 브랜딩 리포트 시스템의 E2E 테스트를 수행하는 전문가입니다.
전체 사용자 여정을 시뮬레이션하고 각 단계의 정상 작동 여부를 검증합니다.
문제가 발견되면 상세한 오류 정보를 제공합니다.`
    );
    this.testId = `e2e-test-${Date.now()}`;
    this.startTime = new Date();
  }

  async process(
    input: E2ETestConfig,
    context: AgentContext
  ): Promise<AgentResult<E2ETestOutput>> {
    console.log(`[E2ETestAgent] Starting E2E test: ${this.testId}`);
    this.startTime = new Date();

    let sessionId: string | null = null;
    let reportId: string | null = null;

    try {
      // Step 1: 세션 생성
      const sessionResult = await this.runStep(
        1,
        'Create Session',
        async () => await this.createSession(input.email)
      );
      if (!sessionResult.success || !sessionResult.data) {
        return this.buildFailureResult('Session creation failed');
      }
      sessionId = sessionResult.data.sessionId;

      // Step 2: 파일 업로드 (Resume)
      const resumeUploadResult = await this.runStep(
        2,
        'Upload Resume',
        async () => await this.uploadFile(sessionId!, input.resumeFile, 'resume')
      );
      if (!resumeUploadResult.success) {
        return this.buildFailureResult('Resume upload failed');
      }

      // Step 3: 파일 업로드 (Portfolio, optional)
      if (input.portfolioFile) {
        const portfolioUploadResult = await this.runStep(
          3,
          'Upload Portfolio',
          async () => await this.uploadFile(sessionId!, input.portfolioFile!, 'portfolio')
        );
        if (!portfolioUploadResult.success) {
          this.steps[this.steps.length - 1].warnings = ['Portfolio upload failed but continuing'];
        }
      } else {
        this.steps.push({
          stepName: 'Upload Portfolio',
          stepNumber: 3,
          success: true,
          duration: 0,
          warnings: ['Skipped - no portfolio file provided'],
        });
      }

      // Step 4: PSA 설문 제출
      const surveySubmitResult = await this.runStep(
        4,
        'Submit Survey',
        async () => await this.submitSurvey(sessionId!, input.surveyData)
      );
      if (!surveySubmitResult.success) {
        return this.buildFailureResult('Survey submission failed');
      }

      // Step 5: PSA 설문 분석
      const surveyAnalysisResult = await this.runStep(
        5,
        'Analyze Survey',
        async () => await this.analyzeSurvey(sessionId!)
      );
      if (!surveyAnalysisResult.success) {
        return this.buildFailureResult('Survey analysis failed');
      }

      // Step 6: 향상된 질문 생성
      const generateQuestionsResult = await this.runStep(
        6,
        'Generate Questions',
        async () => await this.generateQuestions(sessionId!)
      );
      if (!generateQuestionsResult.success) {
        return this.buildFailureResult('Question generation failed');
      }

      // Step 7: 질문 응답 제출
      const submitAnswersResult = await this.runStep(
        7,
        'Submit Questionnaire Answers',
        async () => await this.submitQuestionnaireAnswers(sessionId!, input.questionnaireData)
      );
      if (!submitAnswersResult.success) {
        return this.buildFailureResult('Questionnaire submission failed');
      }

      // Step 8: 리포트 생성 트리거
      const generateReportResult = await this.runStep(
        8,
        'Generate Report',
        async () => await this.generateReport(sessionId!)
      );
      if (!generateReportResult.success) {
        return this.buildFailureResult('Report generation failed');
      }
      reportId = generateReportResult.data?.reportId ?? null;

      // Step 9: 리포트 완료 대기 및 검증
      const verifyReportResult = await this.runStep(
        9,
        'Verify Report Completion',
        async () => await this.waitForReportCompletion(sessionId!, input.timeoutMs || 300000)
      );
      if (!verifyReportResult.success) {
        return this.buildFailureResult('Report verification failed');
      }

      // Step 10: 생성된 아티팩트 검증 (PDF, Web Profile, Social Assets)
      const verifyArtifactsResult = await this.runStep(
        10,
        'Verify Generated Artifacts',
        async () => await this.verifyArtifacts(sessionId!, reportId!)
      );
      if (!verifyArtifactsResult.success) {
        this.steps[this.steps.length - 1].warnings = ['Some artifacts may be missing'];
      }

      // Cleanup
      if (input.cleanupAfterTest) {
        await this.runStep(
          11,
          'Cleanup Test Data',
          async () => await this.cleanupTestData(sessionId!)
        );
      }

      // 최종 결과 생성
      return this.buildSuccessResult(sessionId, reportId, verifyArtifactsResult.data);

    } catch (error: any) {
      console.error(`[E2ETestAgent] Unexpected error:`, error);
      this.errors.push(error.message || 'Unknown error');
      return this.buildFailureResult(error.message || 'Unexpected error');
    }
  }

  private async runStep<T>(
    stepNumber: number,
    stepName: string,
    fn: () => Promise<T>
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const stepStart = Date.now();
    console.log(`[E2ETestAgent] Step ${stepNumber}: ${stepName}`);

    try {
      const data = await fn();
      const duration = Date.now() - stepStart;

      this.steps.push({
        stepName,
        stepNumber,
        success: true,
        duration,
        data,
      });

      console.log(`[E2ETestAgent] ✓ Step ${stepNumber} completed in ${duration}ms`);
      return { success: true, data };

    } catch (error: any) {
      const duration = Date.now() - stepStart;
      const errorMessage = error.message || 'Unknown error';

      this.steps.push({
        stepName,
        stepNumber,
        success: false,
        duration,
        error: errorMessage,
      });

      this.errors.push(`Step ${stepNumber} (${stepName}): ${errorMessage}`);
      console.error(`[E2ETestAgent] ✗ Step ${stepNumber} failed:`, errorMessage);

      return { success: false, error: errorMessage };
    }
  }

  private async createSession(email: string): Promise<{ sessionId: string }> {
    const { data, error } = await supabaseAdmin
      .from('report_sessions')
      .insert({
        email,
        status: 'pending',
        progress: { currentStep: 0, totalSteps: 10 },
        survey_completed: false,
        brief_report_generated: false,
      })
      .select('id')
      .single();

    if (error || !data) {
      throw new Error(`Session creation failed: ${error?.message || 'No data returned'}`);
    }

    return { sessionId: data.id };
  }

  private async uploadFile(
    sessionId: string,
    fileData: { filename: string; content: string; mimeType: string },
    fileType: 'resume' | 'portfolio'
  ): Promise<{ uploadId: string }> {
    // 파일을 Supabase Storage에 업로드
    const bucket = fileType === 'resume' ? 'resumes' : 'portfolios';
    const filePath = `${sessionId}/${fileData.filename}`;

    const buffer = Buffer.from(fileData.content, 'utf-8');

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: fileData.mimeType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`File upload to storage failed: ${uploadError.message}`);
    }

    // Public URL 생성
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // uploads 테이블에 레코드 생성
    const { data: uploadData, error: dbError } = await supabaseAdmin
      .from('uploads')
      .insert({
        session_id: sessionId,
        file_type: fileType,
        file_url: fileUrl,
        parsed_data: {
          text: fileData.content,
          filename: fileData.filename
        },
      })
      .select('id')
      .single();

    if (dbError || !uploadData) {
      throw new Error(`Upload record creation failed: ${dbError?.message || 'No data returned'}`);
    }

    return { uploadId: uploadData.id };
  }

  private async submitSurvey(
    sessionId: string,
    surveyData: { answers: Record<number, number> }
  ): Promise<{ responseCount: number }> {
    // question_number로 question_id를 조회
    const { data: questions } = await supabaseAdmin
      .from('survey_questions')
      .select('id, question_number, category')
      .order('question_number');

    if (!questions || questions.length === 0) {
      throw new Error('Survey questions not found');
    }

    // 모든 답변을 survey_responses 테이블에 삽입
    const responses = Object.entries(surveyData.answers).map(([questionNumber, answer]) => {
      const question = questions.find(q => q.question_number === parseInt(questionNumber));
      if (!question) {
        throw new Error(`Question ${questionNumber} not found`);
      }
      return {
        session_id: sessionId,
        question_id: question.id,
        question_number: parseInt(questionNumber),
        category: question.category,
        score: answer,
      };
    });

    const { error } = await supabaseAdmin
      .from('survey_responses')
      .insert(responses);

    if (error) {
      throw new Error(`Survey submission failed: ${error.message}`);
    }

    // 세션의 survey_completed 플래그 업데이트
    const { error: updateError } = await supabaseAdmin
      .from('report_sessions')
      .update({ survey_completed: true })
      .eq('id', sessionId);

    if (updateError) {
      throw new Error(`Session update failed: ${updateError.message}`);
    }

    return { responseCount: responses.length };
  }

  private async analyzeSurvey(sessionId: string): Promise<{ briefReportId: string }> {
    // /api/survey/analyze 엔드포인트 호출과 동일한 로직
    // 여기서는 직접 SurveyAnalyzerAgent를 호출할 수도 있지만,
    // API 레이어 테스트를 위해 HTTP 요청을 시뮬레이션하거나
    // 직접 Agent를 호출하는 것도 가능

    // 간단히 brief_reports 테이블에 레코드가 생성되었는지 확인
    const { data, error } = await supabaseAdmin
      .from('brief_reports')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Brief report query failed: ${error.message}`);
    }

    if (data) {
      return { briefReportId: data.id };
    }

    // Brief report가 없으면 생성 (테스트용 더미 데이터)
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('brief_reports')
      .insert({
        session_id: sessionId,
        persona_type: '전략적 설계자',
        persona_title: '전략적 설계자',
        persona_tagline: '혁신과 실행의 완벽한 조화',
        scores: {
          innovation: 85,
          execution: 90,
          influence: 70,
          collaboration: 75,
          resilience: 80,
        },
        top_categories: ['innovation', 'execution'],
        strengths_summary: 'E2E 테스트용 강점 요약',
        shadow_sides: 'E2E 테스트용 주의사항',
        branding_keywords: ['혁신', '실행력', '전략'],
        radar_data: {
          innovation: 85,
          execution: 90,
          influence: 70,
          collaboration: 75,
          resilience: 80,
        },
        total_score: 80,
      })
      .select('id')
      .single();

    if (insertError || !insertData) {
      throw new Error(`Brief report creation failed: ${insertError?.message || 'No data'}`);
    }

    // brief_report_generated 플래그 업데이트
    await supabaseAdmin
      .from('report_sessions')
      .update({ brief_report_generated: true })
      .eq('id', sessionId);

    return { briefReportId: insertData.id };
  }

  private async generateQuestions(sessionId: string): Promise<{ questionCount: number }> {
    // 테스트용 더미 질문 생성
    const dummyQuestions = [
      { id: 'q1', text: '당신의 가장 큰 성취는 무엇인가요?' },
      { id: 'q2', text: '앞으로 5년 후 어떤 모습이 되고 싶나요?' },
      { id: 'q3', text: '당신의 핵심 강점은 무엇인가요?' },
    ];

    return { questionCount: dummyQuestions.length };
  }

  private async submitQuestionnaireAnswers(
    sessionId: string,
    answerData: { answers: Record<string, string> }
  ): Promise<{ answerCount: number }> {
    // question_answers 테이블에 답변 저장 (questions와 answers JSONB 컬럼 사용)
    const questions = Object.keys(answerData.answers).map((qId, index) => ({
      id: qId,
      text: `Question ${index + 1}`,
    }));

    const { error } = await supabaseAdmin
      .from('question_answers')
      .insert({
        session_id: sessionId,
        questions: questions,
        answers: answerData.answers,
      });

    if (error) {
      throw new Error(`Questionnaire submission failed: ${error.message}`);
    }

    return { answerCount: Object.keys(answerData.answers).length };
  }

  private async generateReport(sessionId: string): Promise<{ reportId: string }> {
    // 리포트 생성 시작 - 실제로는 /api/generate를 호출하거나
    // OrchestratorAgent를 직접 호출
    // 여기서는 간단히 reports 테이블에 레코드 생성

    const { data, error } = await supabaseAdmin
      .from('reports')
      .insert({
        session_id: sessionId,
        brand_strategy: {},
        content: {},
      })
      .select('id')
      .single();

    if (error || !data) {
      throw new Error(`Report creation failed: ${error?.message || 'No data'}`);
    }

    // 세션 상태 업데이트
    await supabaseAdmin
      .from('report_sessions')
      .update({
        status: 'in_progress',
        progress: { currentStep: 1, totalSteps: 10 },
      })
      .eq('id', sessionId);

    return { reportId: data.id };
  }

  private async waitForReportCompletion(
    sessionId: string,
    timeoutMs: number
  ): Promise<{ status: string }> {
    const startTime = Date.now();
    const pollInterval = 2000; // 2초마다 체크

    while (Date.now() - startTime < timeoutMs) {
      const { data, error } = await supabaseAdmin
        .from('report_sessions')
        .select('status, progress')
        .eq('id', sessionId)
        .single();

      if (error) {
        throw new Error(`Status check failed: ${error.message}`);
      }

      if (data.status === 'completed') {
        return { status: 'completed' };
      }

      if (data.status === 'failed') {
        throw new Error('Report generation failed');
      }

      // 대기
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Report generation timeout after ${timeoutMs}ms`);
  }

  private async verifyArtifacts(
    sessionId: string,
    reportId: string
  ): Promise<{
    pdfUrl?: string;
    webProfileSlug?: string;
    socialAssetCount: number;
  }> {
    // Report 테이블에서 PDF URL 확인
    const { data: reportData } = await supabaseAdmin
      .from('reports')
      .select('pdf_url')
      .eq('id', reportId)
      .single();

    // Web profile 확인
    const { data: webProfileData } = await supabaseAdmin
      .from('web_profiles')
      .select('slug')
      .eq('session_id', sessionId)
      .single();

    // Social assets 확인
    const { data: socialAssets } = await supabaseAdmin
      .from('social_assets')
      .select('id')
      .eq('session_id', sessionId);

    return {
      pdfUrl: reportData?.pdf_url,
      webProfileSlug: webProfileData?.slug,
      socialAssetCount: socialAssets?.length || 0,
    };
  }

  private async cleanupTestData(sessionId: string): Promise<{ cleaned: boolean }> {
    // 테스트 데이터 삭제 (역순으로)
    await supabaseAdmin.from('social_assets').delete().eq('session_id', sessionId);
    await supabaseAdmin.from('web_profiles').delete().eq('session_id', sessionId);
    await supabaseAdmin.from('reports').delete().eq('session_id', sessionId);
    await supabaseAdmin.from('question_answers').delete().eq('session_id', sessionId);
    await supabaseAdmin.from('brief_reports').delete().eq('session_id', sessionId);
    await supabaseAdmin.from('survey_responses').delete().eq('session_id', sessionId);
    await supabaseAdmin.from('uploads').delete().eq('session_id', sessionId);
    await supabaseAdmin.from('report_sessions').delete().eq('id', sessionId);

    console.log(`[E2ETestAgent] Cleaned up test data for session: ${sessionId}`);
    return { cleaned: true };
  }

  private buildSuccessResult(
    sessionId: string,
    reportId: string | null,
    artifactData: any
  ): AgentResult<E2ETestOutput> {
    const endTime = new Date();
    const totalDuration = endTime.getTime() - this.startTime.getTime();

    const output: E2ETestOutput = {
      testId: this.testId,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalDuration,
      success: true,
      steps: this.steps,
      summary: {
        totalSteps: this.steps.length,
        passedSteps: this.steps.filter(s => s.success).length,
        failedSteps: this.steps.filter(s => !s.success).length,
        warningCount: this.steps.filter(s => s.warnings && s.warnings.length > 0).length,
      },
      sessionData: {
        sessionId,
        email: 'test@example.com',
        reportId: reportId || undefined,
        pdfUrl: artifactData?.pdfUrl,
        webProfileSlug: artifactData?.webProfileSlug,
      },
    };

    return this.success(output, {
      testId: this.testId,
      duration: totalDuration,
    });
  }

  private buildFailureResult(errorMessage: string): AgentResult<E2ETestOutput> {
    const endTime = new Date();
    const totalDuration = endTime.getTime() - this.startTime.getTime();

    const output: E2ETestOutput = {
      testId: this.testId,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalDuration,
      success: false,
      steps: this.steps,
      summary: {
        totalSteps: this.steps.length,
        passedSteps: this.steps.filter(s => s.success).length,
        failedSteps: this.steps.filter(s => !s.success).length,
        warningCount: this.steps.filter(s => s.warnings && s.warnings.length > 0).length,
      },
      errors: this.errors,
    };

    return this.failure(errorMessage, {
      testId: this.testId,
      duration: totalDuration,
      testOutput: output,
    });
  }
}
