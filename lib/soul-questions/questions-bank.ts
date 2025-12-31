import { SoulQuestion, SoulQuestionCategory } from '@/types/soul-questions';
import { SurveyCategory } from '@/types/survey';

/**
 * Soul Questions 은행
 *
 * 9개의 철학적 질문으로 구성:
 * - Identity (본질): 3개
 * - Value (가치관): 3개
 * - Impact (지향점): 3개
 *
 * 각 질문은 PSA 카테고리와 매칭되며, 사용자의 Top 2 카테고리에 따라 선택됩니다.
 */
export const SOUL_QUESTIONS_BANK: SoulQuestion[] = [
  // ========================================
  // Identity (본질) - 3개
  // ========================================
  {
    id: 'soul_identity_1',
    category: SoulQuestionCategory.IDENTITY,
    question: '나를 가장 "나답게" 만드는 단 하나의 단어는 무엇인가요?',
    hint: '직업, 역할이 아닌 당신의 본질을 표현하는 단어를 생각해보세요.',
    matchedCategories: [],  // 고정 질문 (모든 페르소나에 공통)
  },
  {
    id: 'soul_identity_2',
    category: SoulQuestionCategory.IDENTITY,
    question: '타인이 나에 대해 오해하고 있는 것 중, 꼭 바로잡고 싶은 진실은?',
    hint: '겉으로 보이는 모습과 실제 당신의 차이를 말해주세요.',
    matchedCategories: [SurveyCategory.INFLUENCE],  // 대인 영향력 높을 때
  },
  {
    id: 'soul_identity_3',
    category: SoulQuestionCategory.IDENTITY,
    question: '내가 가장 행복하고 살아있음을 느끼는 순간은 언제인가요?',
    hint: '일과 삶에서 에너지가 충전되는 순간을 떠올려보세요.',
    matchedCategories: [SurveyCategory.COLLABORATION],  // 협업 공감 높을 때
  },

  // ========================================
  // Value (가치관) - 3개
  // ========================================
  {
    id: 'soul_value_1',
    category: SoulQuestionCategory.VALUE,
    question: '일과 삶에서 어떤 가치를 지키기 위해 손해를 감수해 본 적이 있나요?',
    hint: '돈, 승진, 인기보다 중요했던 가치를 이야기해주세요.',
    matchedCategories: [SurveyCategory.COLLABORATION, SurveyCategory.RESILIENCE],
  },
  {
    id: 'soul_value_2',
    category: SoulQuestionCategory.VALUE,
    question: '내가 정의하는 "성공"이란 무엇인가요?',
    hint: '세상의 기준이 아닌, 당신만의 성공 기준을 말해주세요.',
    matchedCategories: [SurveyCategory.EXECUTION],  // 철저 실행 높을 때
  },
  {
    id: 'soul_value_3',
    category: SoulQuestionCategory.VALUE,
    question: '일을 선택할 때 절대 타협할 수 없는 나만의 기준은 무엇인가요?',
    hint: '프로젝트, 회사, 협업자를 선택할 때의 레드라인을 정의해주세요.',
    matchedCategories: [SurveyCategory.EXECUTION, SurveyCategory.INFLUENCE],
  },

  // ========================================
  // Impact (지향점) - 3개
  // ========================================
  {
    id: 'soul_impact_1',
    category: SoulQuestionCategory.IMPACT,
    question: '내가 떠난 뒤, 세상(혹은 동료)이 나를 어떤 사람으로 기억하길 바라나요?',
    hint: '당신의 레거시는 무엇일까요?',
    matchedCategories: [SurveyCategory.INFLUENCE],
  },
  {
    id: 'soul_impact_2',
    category: SoulQuestionCategory.IMPACT,
    question: '세상을 긍정적으로 변화시키는 가장 강력한 힘은 무엇이라고 믿나요?',
    hint: '기술, 예술, 연결, 교육 등 당신이 믿는 변화의 동력을 말해주세요.',
    matchedCategories: [SurveyCategory.INNOVATION],  // 혁신 사고 높을 때
  },
  {
    id: 'soul_impact_3',
    category: SoulQuestionCategory.IMPACT,
    question: '내 인생을 관통하는 "단 하나의 질문"을 만든다면 무엇인가요?',
    hint: '당신이 평생 답을 찾고자 하는 질문을 작성해주세요.',
    matchedCategories: [SurveyCategory.INNOVATION],
  },
];

/**
 * Soul Question ID로 질문 찾기
 */
export function getSoulQuestionById(id: string): SoulQuestion | undefined {
  return SOUL_QUESTIONS_BANK.find(q => q.id === id);
}

/**
 * 카테고리별 Soul Questions 가져오기
 */
export function getSoulQuestionsByCategory(category: SoulQuestionCategory): SoulQuestion[] {
  return SOUL_QUESTIONS_BANK.filter(q => q.category === category);
}
