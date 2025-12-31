import { supabaseAdmin } from './supabase/server';

export interface ProgressStep {
  step: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message?: string;
  timestamp?: string;
}

export interface GenerationProgress {
  sessionId: string;
  currentStep: number;
  totalSteps: number;
  steps: ProgressStep[];
  overallStatus: 'started' | 'processing' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export class ProgressTracker {
  private sessionId: string;
  private steps: ProgressStep[];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.steps = [
      { step: 1, name: '이력서 분석', status: 'pending' },
      { step: 2, name: '포트폴리오 분석', status: 'pending' },
      { step: 3, name: '브랜드 전략 수립', status: 'pending' },
      { step: 4, name: '콘텐츠 작성', status: 'pending' },
      { step: 5, name: '비주얼 디자인', status: 'pending' },
      { step: 6, name: '키워드 추출', status: 'pending' },
      { step: 7, name: '리포트 조립', status: 'pending' },
      { step: 8, name: '웹 프로필 생성', status: 'pending' },
      { step: 9, name: '텍스트 PDF 생성', status: 'pending' },  // 업데이트
      { step: 10, name: '슬라이드 덱 생성', status: 'pending' },  // 업데이트
    ];
  }

  /**
   * 진행 상태 초기화
   */
  async initialize(): Promise<void> {
    await this.updateDatabase({
      currentStep: 0,
      totalSteps: this.steps.length,
      steps: this.steps,
      overallStatus: 'started',
      startedAt: new Date().toISOString(),
    });
  }

  /**
   * 특정 단계 시작
   */
  async startStep(stepNumber: number, message?: string): Promise<void> {
    const step = this.steps.find((s) => s.step === stepNumber);
    if (step) {
      step.status = 'in_progress';
      step.message = message;
      step.timestamp = new Date().toISOString();

      await this.updateDatabase({
        currentStep: stepNumber,
        totalSteps: this.steps.length,
        steps: this.steps,
        overallStatus: 'processing',
        startedAt: this.steps[0].timestamp || new Date().toISOString(),
      });

      console.log(`[ProgressTracker] Step ${stepNumber} started: ${step.name}`);
    }
  }

  /**
   * 특정 단계 완료
   */
  async completeStep(stepNumber: number, message?: string): Promise<void> {
    const step = this.steps.find((s) => s.step === stepNumber);
    if (step) {
      step.status = 'completed';
      step.message = message || `${step.name} 완료`;
      step.timestamp = new Date().toISOString();

      await this.updateDatabase({
        currentStep: stepNumber,
        totalSteps: this.steps.length,
        steps: this.steps,
        overallStatus: 'processing',
        startedAt: this.steps[0].timestamp || new Date().toISOString(),
      });

      console.log(`[ProgressTracker] Step ${stepNumber} completed: ${step.name}`);
    }
  }

  /**
   * 특정 단계 실패
   */
  async failStep(stepNumber: number, error: string): Promise<void> {
    const step = this.steps.find((s) => s.step === stepNumber);
    if (step) {
      step.status = 'failed';
      step.message = error;
      step.timestamp = new Date().toISOString();

      await this.updateDatabase({
        currentStep: stepNumber,
        totalSteps: this.steps.length,
        steps: this.steps,
        overallStatus: 'failed',
        startedAt: this.steps[0].timestamp || new Date().toISOString(),
        completedAt: new Date().toISOString(),
        error,
      });

      console.error(`[ProgressTracker] Step ${stepNumber} failed: ${error}`);
    }
  }

  /**
   * 전체 작업 완료
   */
  async complete(): Promise<void> {
    await this.updateDatabase({
      currentStep: this.steps.length,
      totalSteps: this.steps.length,
      steps: this.steps,
      overallStatus: 'completed',
      startedAt: this.steps[0].timestamp || new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    console.log('[ProgressTracker] All steps completed');
  }

  /**
   * 데이터베이스에 진행 상태 저장
   */
  private async updateDatabase(progress: Omit<GenerationProgress, 'sessionId'>): Promise<void> {
    try {
      await supabaseAdmin
        .from('report_sessions')
        .update({
          status: progress.overallStatus,
          progress: {
            currentStep: progress.currentStep,
            totalSteps: progress.totalSteps,
            steps: progress.steps,
            overallStatus: progress.overallStatus,
            startedAt: progress.startedAt,
            completedAt: progress.completedAt,
            error: progress.error,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.sessionId);
    } catch (error) {
      console.error('[ProgressTracker] Failed to update database:', error);
    }
  }

  /**
   * 현재 진행 상태 조회
   */
  static async getProgress(sessionId: string): Promise<GenerationProgress | null> {
    try {
      const { data: session } = await supabaseAdmin
        .from('report_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) {
        return null;
      }

      // progress 데이터가 있으면 반환, 없으면 기본값 반환
      if (session.progress) {
        return {
          sessionId,
          ...session.progress,
        };
      }

      // progress 데이터가 없는 경우 (아직 생성이 시작되지 않음)
      return {
        sessionId,
        currentStep: 0,
        totalSteps: 10,
        steps: [],
        overallStatus: session.status as any,
        startedAt: session.created_at,
        completedAt: session.status === 'completed' ? session.updated_at : undefined,
      };
    } catch (error) {
      console.error('[ProgressTracker] Failed to get progress:', error);
      return null;
    }
  }
}
