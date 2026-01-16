import { SoulQuestion, SoulQuestionCategory, QuestionTemplate } from '@/types/soul-questions';
import { SurveyCategory } from '@/types/survey';

/**
 * Soul Questions 은행 (Phase 2-1 확장)
 *
 * Philosophy (6개) - PSA 기반 선택
 * - Identity (본질): 2개
 * - Value (가치관): 2개
 * - Impact (지향점): 2개
 *
 * 각 질문은 PSA 카테고리와 매칭되며, 사용자의 Top 2 카테고리와 variant에 따라 선택됩니다.
 */
export const SOUL_QUESTIONS_BANK: SoulQuestion[] = [
  // ========================================
  // Identity (본질) - 2개
  // ========================================
  {
    id: 'soul_identity_1',
    category: SoulQuestionCategory.IDENTITY,
    question: '나를 가장 "나답게" 만드는 단 하나의 단어는 무엇인가요?',
    hint: '직업, 역할이 아닌 당신의 본질을 표현하는 단어를 생각해보세요.',
    exampleAnswer: '예: "연결" - 저는 다양한 관점을 연결해 새로운 가치를 만드는 것에서 에너지를 얻습니다. 사람과 사람, 아이디어와 아이디어 사이의 다리가 되는 것이 제 본질입니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
    matchedCategories: [],  // 고정 질문 (모든 페르소나에 공통)
  },
  {
    id: 'soul_identity_2',
    category: SoulQuestionCategory.IDENTITY,
    question: '타인이 나에 대해 오해하고 있는 것 중, 꼭 바로잡고 싶은 진실은?',
    hint: '겉으로 보이는 모습과 실제 당신의 차이를 말해주세요.',
    exampleAnswer: '예: 조용해 보여서 소극적이라고 생각하지만, 실제로는 깊이 있는 관찰을 통해 핵심을 파악하고 있습니다. 말수가 적을 뿐 생각이 없는 것이 아닙니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
    matchedCategories: [SurveyCategory.INFLUENCE, SurveyCategory.COLLABORATION],
    variantOverrides: [
      {
        variant: 'spiked',
        question: '당신의 강점이 너무 강해서 생기는 오해가 있다면 무엇인가요?',
        hint: '뾰족한 강점이 때로는 오해를 불러일으킬 수 있습니다.',
      },
    ],
  },

  // ========================================
  // Value (가치관) - 2개
  // ========================================
  {
    id: 'soul_value_1',
    category: SoulQuestionCategory.VALUE,
    question: '일과 삶에서 어떤 가치를 지키기 위해 손해를 감수해 본 적이 있나요?',
    hint: '돈, 승진, 인기보다 중요했던 가치를 이야기해주세요.',
    exampleAnswer: '예: 팀원의 아이디어가 더 좋다고 판단되어 제 공로를 양보한 적이 있습니다. 당장의 인정보다 올바른 결정을 내리는 것이 더 중요했기 때문입니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
    matchedCategories: [SurveyCategory.COLLABORATION, SurveyCategory.RESILIENCE],
  },
  {
    id: 'soul_value_2',
    category: SoulQuestionCategory.VALUE,
    question: '내가 정의하는 "성공"이란 무엇인가요?',
    hint: '세상의 기준이 아닌, 당신만의 성공 기준을 말해주세요.',
    exampleAnswer: '예: 매일 조금씩 어제의 나보다 성장하는 것. 외부의 인정이나 결과물보다 과정에서 배우고 발전하는 것이 제게는 진정한 성공입니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
    matchedCategories: [SurveyCategory.EXECUTION, SurveyCategory.INNOVATION],
    variantOverrides: [
      {
        variant: 'balanced',
        question: '당신의 다양한 강점 중, 성공을 정의하는 데 가장 중요한 것은 무엇인가요?',
        hint: '균형 잡힌 능력 중에서 핵심을 찾아보세요.',
      },
    ],
  },

  // ========================================
  // Impact (지향점) - 2개
  // ========================================
  {
    id: 'soul_impact_1',
    category: SoulQuestionCategory.IMPACT,
    question: '내가 떠난 뒤, 세상(혹은 동료)이 나를 어떤 사람으로 기억하길 바라나요?',
    hint: '당신의 레거시는 무엇일까요?',
    exampleAnswer: '예: "그 사람과 일하면 불가능해 보이는 것도 가능해진다"는 믿음을 주는 사람. 함께한 사람들이 자신감을 얻고 성장했다고 느끼는 촉매 같은 존재로 기억되고 싶습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
    matchedCategories: [SurveyCategory.INFLUENCE, SurveyCategory.COLLABORATION],
  },
  {
    id: 'soul_impact_2',
    category: SoulQuestionCategory.IMPACT,
    question: '세상을 긍정적으로 변화시키는 가장 강력한 힘은 무엇이라고 믿나요?',
    hint: '기술, 예술, 연결, 교육 등 당신이 믿는 변화의 동력을 말해주세요.',
    exampleAnswer: '예: 작은 친절의 연쇄 반응. 한 사람의 진심 어린 도움이 다른 사람에게 영감을 주고, 그것이 퍼져나가 세상을 바꾼다고 믿습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
    matchedCategories: [SurveyCategory.INNOVATION, SurveyCategory.RESILIENCE],
  },
];

/**
 * Expertise 템플릿 풀 (12개)
 * LLM이 이 템플릿을 참조하여 맞춤형 질문을 생성합니다.
 */
export const EXPERTISE_TEMPLATES: QuestionTemplate[] = [
  // ========================================
  // Primary Strength (1순위 강점) - 4개
  // ========================================
  {
    id: 'exp_primary_1',
    type: 'expertise',
    promptTemplate: '{category1}이(가) 결정적이었던 프로젝트나 순간을 구체적으로 설명해주세요.',
    hint: '당신의 1순위 강점이 빛났던 순간을 떠올려보세요.',
    exampleAnswer: '예: 팀이 방향을 잃었을 때, 저의 체계적인 분석으로 핵심 문제를 파악하고 우선순위를 재정립했습니다. 결과적으로 프로젝트를 정상 궤도에 올려놓았습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'exp_primary_2',
    type: 'expertise',
    promptTemplate: '{category1} 역량을 키우게 된 결정적인 경험이나 계기는 무엇인가요?',
    hint: '이 강점이 어떻게 형성되었는지 배경을 설명해주세요.',
    exampleAnswer: '예: 첫 직장에서 선배 없이 프로젝트를 맡으면서 스스로 모든 것을 체계화해야 했습니다. 그 경험이 제 실행력의 기반이 되었습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'exp_primary_3',
    type: 'expertise',
    promptTemplate: '{category1}을(를) 발휘할 때 당신만의 독특한 방식이나 접근법이 있다면?',
    hint: '같은 강점도 사람마다 발휘하는 방식이 다릅니다.',
    exampleAnswer: '예: 저는 항상 "왜?"라는 질문으로 시작합니다. 근본 원인을 이해해야 올바른 해결책이 나온다고 믿기 때문입니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'exp_primary_4',
    type: 'expertise',
    promptTemplate: '{category1} 강점으로 동료나 팀에게 어떤 가치를 제공하나요?',
    hint: '당신의 강점이 주변에 미치는 영향을 생각해보세요.',
    exampleAnswer: '예: 복잡한 상황에서 팀원들에게 명확한 방향성을 제시합니다. "뭘 해야 할지 모르겠을 때 그 사람에게 물어보면 된다"는 신뢰를 얻었습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },

  // ========================================
  // Secondary Strength (2순위 강점) - 4개
  // ========================================
  {
    id: 'exp_secondary_1',
    type: 'expertise',
    promptTemplate: '{category2}로 예상치 못한 성과를 낸 경험이 있다면 공유해주세요.',
    hint: '2순위 강점이 의외의 상황에서 빛났던 순간을 말해주세요.',
    exampleAnswer: '예: 기술적 문제 해결 중에 오히려 제 공감 능력이 빛났습니다. 사용자의 불편함을 깊이 이해하고 있었기에 진짜 문제를 발견할 수 있었습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'exp_secondary_2',
    type: 'expertise',
    promptTemplate: '{category2}이(가) {category1}과(와) 시너지를 낸 순간은 언제인가요?',
    hint: '두 강점이 결합되었을 때 더 큰 효과를 낸 경험을 설명해주세요.',
    exampleAnswer: '예: 혁신적인 아이디어(Innovation)를 체계적인 실행 계획(Execution)으로 구체화했을 때, 팀원들이 "이건 정말 될 것 같다"고 확신을 가졌습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'exp_secondary_3',
    type: 'expertise',
    promptTemplate: '{category2} 강점을 더 발전시키기 위해 의도적으로 노력한 것이 있나요?',
    hint: '이 강점을 키우기 위한 당신만의 방법을 공유해주세요.',
    exampleAnswer: '예: 협업 능력을 키우기 위해 다양한 부서와 협업 프로젝트에 자원했습니다. 불편한 상황에서도 배우려는 자세가 성장의 원동력이었습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'exp_secondary_4',
    type: 'expertise',
    promptTemplate: '{category2}을(를) 활용해 위기를 기회로 바꾼 경험이 있나요?',
    hint: '어려운 상황에서 이 강점이 해결책이 된 순간을 말해주세요.',
    exampleAnswer: '예: 프로젝트 실패 후 팀 분위기가 침체되었을 때, 저의 회복탄력성으로 팀원들에게 다시 도전할 용기를 불어넣었습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },

  // ========================================
  // Hidden Contribution (보이지 않는 기여) - 4개
  // ========================================
  {
    id: 'exp_hidden_1',
    type: 'expertise',
    promptTemplate: '수치로 표현되지 않는 당신의 "보이지 않는 기여"는 무엇인가요?',
    hint: 'KPI에 잡히지 않지만 팀에 중요한 당신의 역할을 설명해주세요.',
    exampleAnswer: '예: 팀 내 갈등이 생기기 전에 미리 감지하고 조용히 중재합니다. 공식적인 역할은 아니지만, 팀 분위기를 건강하게 유지하는 데 기여합니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'exp_hidden_2',
    type: 'expertise',
    promptTemplate: '팀 성과에 기여했지만 드러나지 않았던 당신의 역할은 무엇인가요?',
    hint: '뒤에서 묵묵히 해낸 일들을 떠올려보세요.',
    exampleAnswer: '예: 큰 프레젠테이션 전에 항상 발표자의 자료를 검토하고 피드백을 드립니다. 제 이름은 나오지 않지만 팀의 품질 관리에 기여하고 있습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'exp_hidden_3',
    type: 'expertise',
    promptTemplate: '낮은 {category_low} 지표를 보완하기 위한 당신만의 방식은 무엇인가요?',
    hint: '약점을 극복하기 위해 개발한 나만의 전략을 공유해주세요.',
    exampleAnswer: '예: 대인 영향력이 낮아서 대신 철저한 데이터와 논리로 설득합니다. 화려한 말보다 팩트로 신뢰를 얻는 방식이 제 스타일입니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'exp_hidden_4',
    type: 'expertise',
    promptTemplate: '당신이 없으면 팀에서 무엇이 달라질까요?',
    hint: '당신의 존재가 만드는 차이를 구체적으로 설명해주세요.',
    exampleAnswer: '예: 아마 회의가 2배는 길어질 겁니다. 저는 핵심을 빠르게 정리하고 결론으로 이끄는 역할을 합니다. 없으면 논의가 산으로 갈 때가 많습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
];

/**
 * Edge 템플릿 풀 (8개)
 * LLM이 이 템플릿을 참조하여 맞춤형 질문을 생성합니다.
 */
export const EDGE_TEMPLATES: QuestionTemplate[] = [
  // ========================================
  // Differentiation (차별화) - 4개
  // ========================================
  {
    id: 'edge_diff_1',
    type: 'edge',
    promptTemplate: '"이것만큼은 내가 최고다"라고 자부하는 포인트는 무엇인가요?',
    hint: '겸손하지 않아도 됩니다. 진짜 자신 있는 것을 말해주세요.',
    exampleAnswer: '예: 복잡한 문제를 단순하게 설명하는 능력입니다. 어려운 개념을 누구나 이해할 수 있게 풀어내는 데 자신 있습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'edge_diff_2',
    type: 'edge',
    promptTemplate: '경쟁자와 다른 당신만의 독특한 접근법이나 관점은 무엇인가요?',
    hint: '같은 일을 해도 당신만의 방식이 있을 겁니다.',
    exampleAnswer: '예: 대부분 결과물에 집중할 때 저는 과정의 효율성에 집중합니다. 한 번 잘 만든 프로세스가 열 번의 결과물보다 가치 있다고 믿습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'edge_diff_3',
    type: 'edge',
    promptTemplate: '"이 일은 꼭 당신에게 맡기고 싶다"는 말을 들었던 순간은 언제인가요?',
    hint: '사람들이 당신을 찾는 특별한 이유가 있을 겁니다.',
    exampleAnswer: '예: 위기 상황에서 팀장님이 "이건 네가 맡아줘"라고 하셨습니다. 압박 속에서도 침착하게 문제를 해결하는 것이 제 강점이기 때문입니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'edge_diff_4',
    type: 'edge',
    promptTemplate: '당신의 일하는 방식에서 "이건 절대 안 한다"는 원칙이 있나요?',
    hint: '하지 않는 것도 차별화의 요소입니다.',
    exampleAnswer: '예: 절대 대충 끝내지 않습니다. 시간이 더 걸려도 제가 납득할 수 있는 품질이 아니면 제출하지 않습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },

  // ========================================
  // Vision (비전) - 4개
  // ========================================
  {
    id: 'edge_vision_1',
    type: 'edge',
    promptTemplate: '5년 뒤 시장에서 어떤 이름(브랜드)으로 불리고 싶은가요?',
    hint: '미래에 당신을 정의할 한 문장을 만들어보세요.',
    exampleAnswer: '예: "복잡한 문제를 단순하게 만드는 사람". 어떤 분야에서든 핵심을 꿰뚫고 명쾌한 해결책을 제시하는 전문가로 인정받고 싶습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'edge_vision_2',
    type: 'edge',
    promptTemplate: '시장에서 인정받고 싶은 단 하나의 것은 무엇인가요?',
    hint: '모든 것을 잘할 필요는 없습니다. 딱 하나를 선택해주세요.',
    exampleAnswer: '예: 신뢰. "그 사람이 말했으면 믿어도 된다"는 평판을 얻고 싶습니다. 전문성보다 신뢰가 더 오래가는 자산이라고 생각합니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'edge_vision_3',
    type: 'edge',
    promptTemplate: '당신이 업계에 만들고 싶은 변화는 무엇인가요?',
    hint: '작은 변화라도 좋습니다. 당신이 추구하는 방향을 말해주세요.',
    exampleAnswer: '예: 주니어도 의견을 낼 수 있는 문화. 경력보다 아이디어의 가치로 평가받는 환경을 만들고 싶습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
  },
  {
    id: 'edge_vision_4',
    type: 'edge',
    promptTemplate: '당신의 커리어가 성공했다고 느낄 수 있는 구체적인 장면을 묘사해주세요.',
    hint: '추상적인 목표보다 구체적인 장면이 더 강력합니다.',
    exampleAnswer: '예: 제가 멘토링한 후배가 저보다 더 큰 성과를 내고, 그 후배가 또 다른 후배를 키우는 모습. 그때 제 커리어가 의미 있었다고 느낄 것 같습니다.',
    minCharacters: 50,
    recommendedCharacters: 150,
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

/**
 * Expertise 템플릿 ID로 찾기
 */
export function getExpertiseTemplateById(id: string): QuestionTemplate | undefined {
  return EXPERTISE_TEMPLATES.find(t => t.id === id);
}

/**
 * Edge 템플릿 ID로 찾기
 */
export function getEdgeTemplateById(id: string): QuestionTemplate | undefined {
  return EDGE_TEMPLATES.find(t => t.id === id);
}

/**
 * 전체 템플릿 개수 반환 (검증용)
 */
export function getQuestionBankStats() {
  return {
    philosophyCount: SOUL_QUESTIONS_BANK.length,
    expertisePoolCount: EXPERTISE_TEMPLATES.length,
    edgePoolCount: EDGE_TEMPLATES.length,
    totalCount: SOUL_QUESTIONS_BANK.length + EXPERTISE_TEMPLATES.length + EDGE_TEMPLATES.length,
  };
}
