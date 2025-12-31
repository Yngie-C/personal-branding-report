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
 * Soul Question 인터페이스
 */
export interface SoulQuestion {
  id: string;                  // "soul_identity_1"
  category: SoulQuestionCategory;
  question: string;
  hint?: string;
  // PSA 매칭에 사용될 카테고리들
  matchedCategories?: SurveyCategory[];  // 이 질문이 어떤 PSA 카테고리와 매칭되는지
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
