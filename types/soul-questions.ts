import { SurveyCategory } from './survey';

/**
 * Soul Questions 카테고리
 */
export enum SoulQuestionCategory {
  IDENTITY = 'identity',      // 본질 (3개)
  VALUE = 'value',            // 가치관 (3개)
  IMPACT = 'impact',          // 지향점 (3개)
}

/**
 * 템플릿 Variant 타입
 */
export type TemplateVariant = 'balanced' | 'spiked' | 'mixed';

/**
 * Variant별 질문 변형
 */
export interface VariantOverride {
  variant: TemplateVariant;
  question?: string;           // 대체 질문 텍스트
  hint?: string;               // 대체 힌트
}

/**
 * Soul Question 인터페이스
 */
export interface SoulQuestion {
  id: string;                  // "soul_identity_1"
  category: SoulQuestionCategory;
  question: string;
  hint?: string;
  // PSA 매칭에 사용될 카테고리들
  matchedCategories?: SurveyCategory[];  // 이 질문이 어떤 PSA 카테고리와 매칭되는지

  // Phase 2-1 확장 필드
  exampleAnswer?: string;              // 예시 답변 (50-80자)
  minCharacters?: number;              // 최소 글자수 (기본: 50)
  recommendedCharacters?: number;      // 권장 글자수 (기본: 150)
  variantOverrides?: VariantOverride[];  // variant별 질문 변형
}

/**
 * Expertise/Edge 템플릿 (LLM 참조용)
 */
export interface QuestionTemplate {
  id: string;                  // "exp_primary_1", "edge_diff_1"
  type: 'expertise' | 'edge';
  promptTemplate: string;      // LLM 프롬프트에 사용될 템플릿
  hint: string;
  exampleAnswer?: string;
  minCharacters?: number;
  recommendedCharacters?: number;
}

/**
 * 리프레이밍 전략
 */
export interface ReframingStrategy {
  category: SurveyCategory;
  lowScoreLabel: string;       // "현실 안착형"
  lowScoreDescription: string; // 긍정적 재해석 문구
  visualTone: 'muted' | 'pastel' | 'neutral';  // Radar chart 색상 톤
}

/**
 * 낮은 점수 카테고리 리프레이밍 결과
 */
export interface LowScoreReframing {
  category: SurveyCategory;
  reframedLabel: string;
  reframedDescription: string;
}
