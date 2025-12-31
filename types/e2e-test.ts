/**
 * E2E 테스트 관련 타입 정의
 */

export interface E2ETestInput {
  testEmail?: string;
  skipFileUpload?: boolean;
  skipSurvey?: boolean;
  skipQuestionnaire?: boolean;
  cleanupAfterTest?: boolean;
}

export interface TestStepResult {
  stepName: string;
  stepNumber: number;
  success: boolean;
  duration: number; // milliseconds
  data?: any;
  error?: string;
  warnings?: string[];
}

export interface E2ETestOutput {
  testId: string;
  startTime: string;
  endTime: string;
  totalDuration: number; // milliseconds
  success: boolean;
  steps: TestStepResult[];
  summary: {
    totalSteps: number;
    passedSteps: number;
    failedSteps: number;
    warningCount: number;
  };
  sessionData?: {
    sessionId: string;
    email: string;
    reportId?: string;
    pdfUrl?: string;
    webProfileSlug?: string;
  };
  errors?: string[];
}

export interface TestFileData {
  filename: string;
  content: string;
  mimeType: string;
}

export interface TestSurveyData {
  answers: Record<number, number>; // questionId -> answer (1-7)
}

export interface TestQuestionnaireData {
  answers: Record<string, string>; // questionId -> answer text
}

export interface E2ETestConfig {
  email: string;
  resumeFile: TestFileData;
  portfolioFile?: TestFileData;
  surveyData: TestSurveyData;
  questionnaireData: TestQuestionnaireData;
  timeoutMs?: number;
  cleanupAfterTest?: boolean;
}
