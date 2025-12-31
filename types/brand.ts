export interface BrandingQuestions {
  category:
    | 'philosophy'        // Soul Questions (3개) - NEW
    | 'expertise'         // Skill Proof (4개) - NEW
    | 'edge'              // Future Edge (2개) - NEW
    | 'values'            // 기존 (PSA 없을 때)
    | 'goals'
    | 'uniqueness'
    | 'story'
    | 'vision'
    | 'strength_proof'
    | 'differentiation';
  questions: {
    id: string;
    question: string;
    hint: string;
    required: boolean;
    questionType?: 'soul' | 'expertise' | 'edge' | 'legacy';  // NEW: 질문 유형 구분
    aiGuidance?: string;  // NEW: 답변 완료 시 AI 가이드 멘트
  }[];
}

/**
 * 질문 단계별 메타데이터
 */
export interface QuestionPhaseMetadata {
  phase: 'philosophy' | 'expertise' | 'edge';
  phaseTitle: string;
  phaseDescription: string;
  completionPercentage: number;  // 브랜드 완성도 (33%, 66%, 100%)
}

export interface BrandStrategy {
  brandEssence: string;
  uniqueValueProposition: string;
  targetAudience: string[];
  brandPersonality: string[];
  keyMessages: string[];
  visualDirection: {
    colorPalette: string[];
    mood: string;
    style: string;
  };
}

export interface Keywords {
  primary: string[];
  secondary: string[];
  hashtags: string[];
  searchTerms: string[];
}
