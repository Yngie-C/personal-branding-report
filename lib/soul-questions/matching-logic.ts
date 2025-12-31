import { SOUL_QUESTIONS_BANK } from './questions-bank';
import { SoulQuestion } from '@/types/soul-questions';
import { BriefAnalysis } from '@/types/survey';

/**
 * PSA 분석 결과를 바탕으로 3개의 Soul Questions 선택
 *
 * 규칙:
 * 1. soul_identity_1 (나를 나답게 만드는 단어) - 항상 고정
 * 2. 상위 2개 카테고리에 매칭되는 질문 중 2개 선택
 *
 * @param briefAnalysis - PSA 분석 결과
 * @returns 선택된 3개의 Soul Questions
 */
export function selectSoulQuestions(briefAnalysis: BriefAnalysis): SoulQuestion[] {
  const selected: SoulQuestion[] = [];

  // 1. 고정 질문 (나를 나답게 만드는 단어)
  const fixedQuestion = SOUL_QUESTIONS_BANK.find(q => q.id === 'soul_identity_1');
  if (fixedQuestion) {
    selected.push(fixedQuestion);
  }

  // 2. 상위 2개 카테고리
  const topCategories = briefAnalysis.topCategories;

  if (!topCategories || topCategories.length < 2) {
    console.warn('[SoulQuestions] Top categories not available, using fallback questions');
    return selectFallbackQuestions(selected);
  }

  // 3. 매칭되는 질문 후보 찾기
  const candidates = SOUL_QUESTIONS_BANK.filter(q => {
    // 이미 선택된 질문 제외
    if (selected.some(s => s.id === q.id)) return false;

    // 매칭 카테고리가 없으면 제외 (고정 질문 제외)
    if (!q.matchedCategories || q.matchedCategories.length === 0) return false;

    // 상위 카테고리와 교집합이 있는지 확인
    return q.matchedCategories.some(cat => topCategories.includes(cat));
  });

  // 4. 우선순위 정렬 (1순위 카테고리 매칭 > 2순위 카테고리 매칭)
  const prioritized = candidates.sort((a, b) => {
    const aMatchesFirst = a.matchedCategories?.includes(topCategories[0]);
    const bMatchesFirst = b.matchedCategories?.includes(topCategories[0]);

    if (aMatchesFirst && !bMatchesFirst) return -1;
    if (!aMatchesFirst && bMatchesFirst) return 1;
    return 0;
  });

  // 5. 상위 2개 선택
  selected.push(...prioritized.slice(0, 2));

  // 6. 만약 매칭이 부족하면 fallback 질문으로 채우기
  if (selected.length < 3) {
    console.warn(`[SoulQuestions] Only ${selected.length} questions matched, adding fallback questions`);
    const fallbackQuestions = selectFallbackQuestions(selected);
    return fallbackQuestions;
  }

  console.log('[SoulQuestions] Selected questions:', selected.map(q => `${q.id} (${q.question.substring(0, 20)}...)`));

  return selected.slice(0, 3);  // 최대 3개
}

/**
 * Fallback: 매칭 실패 시 기본 질문 선택
 *
 * @param alreadySelected - 이미 선택된 질문들
 * @returns 3개의 Soul Questions
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
 *
 * @param questionIds - Soul Question ID 배열
 * @returns Soul Questions 배열
 */
export function getSoulQuestionsByIds(questionIds: string[]): SoulQuestion[] {
  return questionIds
    .map(id => SOUL_QUESTIONS_BANK.find(q => q.id === id))
    .filter((q): q is SoulQuestion => q !== undefined);
}
