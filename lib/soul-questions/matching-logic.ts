import { SOUL_QUESTIONS_BANK, EXPERTISE_TEMPLATES, EDGE_TEMPLATES } from './questions-bank';
import { SoulQuestion, TemplateVariant, QuestionTemplate } from '@/types/soul-questions';
import { BriefAnalysis, CategoryScore } from '@/types/survey';
import { findMapping, CategoryQuestionMapping } from './category-mapping';
import { selectVariant } from '@/lib/templates/template-selector';

/**
 * Variant별 질문 override 적용
 */
function applyVariantOverride(question: SoulQuestion, variant: TemplateVariant): SoulQuestion {
  if (!question.variantOverrides || question.variantOverrides.length === 0) {
    return question;
  }

  const override = question.variantOverrides.find(v => v.variant === variant);
  if (!override) {
    return question;
  }

  return {
    ...question,
    question: override.question || question.question,
    hint: override.hint || question.hint,
  };
}

/**
 * PSA 분석 결과를 바탕으로 3개의 Soul Questions 선택 (Phase 2-1 고도화)
 *
 * 규칙:
 * 1. 매핑 테이블에서 페르소나 조합 + variant에 맞는 질문 ID 조회
 * 2. variant별 override 적용
 * 3. 매핑이 없으면 fallback 로직 사용
 *
 * @param briefAnalysis - PSA 분석 결과
 * @returns 선택된 3개의 Soul Questions (variant override 적용됨)
 */
export function selectSoulQuestions(briefAnalysis: BriefAnalysis): SoulQuestion[] {
  // 1. Variant 결정
  const variant = selectVariant(briefAnalysis.categoryScores);
  console.log(`[SoulQuestions] Determined variant: ${variant}`);

  // 2. 카테고리 조합 생성
  const topCategories = briefAnalysis.topCategories;
  if (!topCategories || topCategories.length < 2) {
    console.warn('[SoulQuestions] Top categories not available, using fallback questions');
    return selectFallbackQuestions([]);
  }

  const categoryCombo = `${topCategories[0]}-${topCategories[1]}`;
  console.log(`[SoulQuestions] Category combo: ${categoryCombo}`);

  // 3. 매핑 테이블에서 찾기
  const mapping = findMapping(categoryCombo, variant);

  if (mapping) {
    // 매핑 테이블 기반 선택
    const questions = mapping.philosophyIds
      .map(id => SOUL_QUESTIONS_BANK.find(q => q.id === id))
      .filter((q): q is SoulQuestion => q !== undefined)
      .map(q => applyVariantOverride(q, variant));

    if (questions.length >= 3) {
      console.log(
        `[SoulQuestions] Selected from mapping table:`,
        questions.map(q => `${q.id} (${variant})`)
      );
      return questions.slice(0, 3);
    }
  }

  // 4. Fallback: 기존 로직 사용
  console.warn(`[SoulQuestions] Mapping not found for ${categoryCombo}/${variant}, using legacy logic`);
  return selectSoulQuestionsLegacy(briefAnalysis);
}

/**
 * 레거시 매칭 로직 (기존 호환성 유지)
 */
function selectSoulQuestionsLegacy(briefAnalysis: BriefAnalysis): SoulQuestion[] {
  const selected: SoulQuestion[] = [];

  // 1. 고정 질문 (나를 나답게 만드는 단어)
  const fixedQuestion = SOUL_QUESTIONS_BANK.find(q => q.id === 'soul_identity_1');
  if (fixedQuestion) {
    selected.push(fixedQuestion);
  }

  // 2. 상위 2개 카테고리
  const topCategories = briefAnalysis.topCategories;

  if (!topCategories || topCategories.length < 2) {
    return selectFallbackQuestions(selected);
  }

  // 3. 매칭되는 질문 후보 찾기
  const candidates = SOUL_QUESTIONS_BANK.filter(q => {
    if (selected.some(s => s.id === q.id)) return false;
    if (!q.matchedCategories || q.matchedCategories.length === 0) return false;
    return q.matchedCategories.some(cat => topCategories.includes(cat));
  });

  // 4. 우선순위 정렬
  const prioritized = candidates.sort((a, b) => {
    const aMatchesFirst = a.matchedCategories?.includes(topCategories[0]);
    const bMatchesFirst = b.matchedCategories?.includes(topCategories[0]);

    if (aMatchesFirst && !bMatchesFirst) return -1;
    if (!aMatchesFirst && bMatchesFirst) return 1;
    return 0;
  });

  // 5. 상위 2개 선택
  selected.push(...prioritized.slice(0, 2));

  // 6. 부족하면 fallback
  if (selected.length < 3) {
    return selectFallbackQuestions(selected);
  }

  return selected.slice(0, 3);
}

/**
 * Fallback: 매칭 실패 시 기본 질문 선택
 */
function selectFallbackQuestions(alreadySelected: SoulQuestion[]): SoulQuestion[] {
  const result = [...alreadySelected];

  // 고정 질문이 없으면 추가
  if (!result.some(q => q.id === 'soul_identity_1')) {
    const fixedQuestion = SOUL_QUESTIONS_BANK.find(q => q.id === 'soul_identity_1');
    if (fixedQuestion) {
      result.push(fixedQuestion);
    }
  }

  // 나머지 질문 중 앞에서부터 선택
  const remaining = SOUL_QUESTIONS_BANK.filter(
    q => !result.some(s => s.id === q.id)
  );

  const needed = 3 - result.length;
  result.push(...remaining.slice(0, needed));

  console.log('[SoulQuestions] Using fallback questions:', result.map(q => q.id));

  return result.slice(0, 3);
}

/**
 * Soul Question ID 목록으로 질문들 가져오기
 */
export function getSoulQuestionsByIds(questionIds: string[]): SoulQuestion[] {
  return questionIds
    .map(id => SOUL_QUESTIONS_BANK.find(q => q.id === id))
    .filter((q): q is SoulQuestion => q !== undefined);
}

/**
 * 매핑 테이블에서 Expertise 템플릿 풀 가져오기
 *
 * @param briefAnalysis - PSA 분석 결과
 * @returns Expertise 템플릿 배열 (4개)
 */
export function getExpertisePoolForBrief(briefAnalysis: BriefAnalysis): QuestionTemplate[] {
  const variant = selectVariant(briefAnalysis.categoryScores);
  const categoryCombo = `${briefAnalysis.topCategories[0]}-${briefAnalysis.topCategories[1]}`;

  const mapping = findMapping(categoryCombo, variant);

  if (mapping) {
    return mapping.expertisePoolIds
      .map(id => EXPERTISE_TEMPLATES.find(t => t.id === id))
      .filter((t): t is QuestionTemplate => t !== undefined);
  }

  // Fallback: 기본 4개 반환
  console.warn(`[SoulQuestions] Expertise pool mapping not found, using defaults`);
  return EXPERTISE_TEMPLATES.slice(0, 4);
}

/**
 * 매핑 테이블에서 Edge 템플릿 풀 가져오기
 *
 * @param briefAnalysis - PSA 분석 결과
 * @returns Edge 템플릿 배열 (2개)
 */
export function getEdgePoolForBrief(briefAnalysis: BriefAnalysis): QuestionTemplate[] {
  const variant = selectVariant(briefAnalysis.categoryScores);
  const categoryCombo = `${briefAnalysis.topCategories[0]}-${briefAnalysis.topCategories[1]}`;

  const mapping = findMapping(categoryCombo, variant);

  if (mapping) {
    return mapping.edgePoolIds
      .map(id => EDGE_TEMPLATES.find(t => t.id === id))
      .filter((t): t is QuestionTemplate => t !== undefined);
  }

  // Fallback: 기본 2개 반환
  console.warn(`[SoulQuestions] Edge pool mapping not found, using defaults`);
  return EDGE_TEMPLATES.slice(0, 2);
}

/**
 * BriefAnalysis에서 현재 variant 조회
 */
export function getVariantForBrief(briefAnalysis: BriefAnalysis): TemplateVariant {
  return selectVariant(briefAnalysis.categoryScores);
}

/**
 * 카테고리 조합으로 전체 매핑 정보 가져오기 (디버깅용)
 */
export function getMappingInfo(briefAnalysis: BriefAnalysis): CategoryQuestionMapping | null {
  const variant = selectVariant(briefAnalysis.categoryScores);
  const categoryCombo = `${briefAnalysis.topCategories[0]}-${briefAnalysis.topCategories[1]}`;

  const mapping = findMapping(categoryCombo, variant);
  return mapping || null;
}
