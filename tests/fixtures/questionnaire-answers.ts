/**
 * Questionnaire Answers Fixtures
 *
 * Provides pre-defined answers for the enhanced questionnaire (7-10 questions)
 * that follows the PSA survey
 */

/**
 * Questionnaire answer set interface
 */
export interface QuestionnaireAnswerSet {
  name: string;
  description: string;
  answers: Record<string, string>; // questionId -> answer text
}

/**
 * Strategic Architect (전략적 설계자) questionnaire answers
 * Focused on innovation and execution strengths
 */
export function getStrategicArchitectQuestionnaireAnswers(): QuestionnaireAnswerSet {
  return {
    name: '전략적 설계자 답변',
    description: '혁신과 실행력을 강조하는 답변',
    answers: {
      // Strength proof questions
      'strength-1':
        '신규 AI 추천 시스템을 기획하고 런칭하여 사용자 참여도를 2배 증가시켰습니다. 데이터 분석을 통해 사용자 니즈를 파악하고, 엔지니어링 팀과 협업하여 MVP를 3개월 만에 출시했습니다.',
      'strength-2':
        '프로젝트 초기 단계에서 명확한 로드맵을 수립하고, 주간 단위 스프린트로 실행 계획을 세분화합니다. OKR을 활용해 팀원들과 목표를 정렬하고, 진행 상황을 투명하게 공유합니다.',

      // Differentiation questions
      'diff-1':
        '데이터 기반 의사결정과 빠른 실행력의 조합이 저만의 차별점입니다. 단순히 아이디어만 제시하는 것이 아니라, A/B 테스트와 데이터 분석을 통해 가설을 검증하고 즉시 실행에 옮깁니다.',
      'diff-2':
        '기술적 백그라운드를 가진 PM으로서, 엔지니어링 팀과 깊이 있는 기술 논의가 가능합니다. 이를 통해 실현 가능성과 비즈니스 임팩트를 동시에 고려한 제품 결정을 내립니다.',

      // Vision questions
      'vision-1':
        '3년 내에 AI/ML 제품 분야의 전문가로 성장하여, 사용자 경험을 혁신하는 제품을 리드하고 싶습니다. 특히 개인화 기술을 활용해 사용자마다 최적화된 경험을 제공하는 플랫폼을 만들고자 합니다.',
      'vision-2':
        '다양한 산업 분야에서 제품 경험을 쌓아, 궁극적으로는 CPO(Chief Product Officer)로서 제품 조직 전체를 이끌고 싶습니다. 특히 데이터와 기술을 활용한 제품 혁신 문화를 구축하는 것이 목표입니다.',
    },
  };
}

/**
 * Market Disruptor (시장 파괴자) questionnaire answers
 * Focused on innovation and influence
 */
export function getMarketDisruptorQuestionnaireAnswers(): QuestionnaireAnswerSet {
  return {
    name: '시장 파괴자 답변',
    description: '혁신과 영향력을 강조하는 답변',
    answers: {
      'strength-1':
        '기존에 없던 신규 비즈니스 모델을 제안하여 회사의 새로운 수익원을 창출했습니다. 시장 조사와 고객 인터뷰를 통해 언밋 니즈를 발견하고, 이를 해결하는 혁신적인 솔루션을 설계했습니다.',
      'strength-2':
        '크로스 펑셔널 팀을 설득하여 리스크가 있는 새로운 시도를 이끌어냈습니다. 명확한 비전 제시와 데이터 기반 논리로 경영진과 팀원들의 신뢰를 얻었습니다.',
      'diff-1':
        '업계 트렌드를 빠르게 캐치하고 이를 제품에 적용하는 능력이 차별점입니다. 경쟁사 분석, 테크 컨퍼런스 참석, 최신 논문 리뷰 등을 통해 항상 한 발 앞서 움직입니다.',
      'diff-2':
        '아이디어를 현실로 만드는 실행력과 스토리텔링 능력의 조합입니다. 복잡한 기술을 누구나 이해할 수 있는 언어로 풀어내며, 이를 통해 다양한 이해관계자들의 지지를 이끌어냅니다.',
      'vision-1':
        '산업 전반의 디지털 전환을 리드하는 혁신가가 되고 싶습니다. 특히 AI와 데이터를 활용해 기존 비즈니스를 혁신하고, 새로운 가치를 창출하는 프로덕트를 만들고자 합니다.',
    },
  };
}

/**
 * Empathetic Leader (공감형 리더) questionnaire answers
 * Focused on influence and collaboration
 */
export function getEmpatheticLeaderQuestionnaireAnswers(): QuestionnaireAnswerSet {
  return {
    name: '공감형 리더 답변',
    description: '영향력과 협업을 강조하는 답변',
    answers: {
      'strength-1':
        '팀원들의 강점을 파악하고 이를 최대한 활용하여 팀 성과를 향상시켰습니다. 정기적인 1:1 미팅을 통해 각자의 커리어 목표를 이해하고, 이에 맞는 역할과 기회를 제공합니다.',
      'strength-2':
        '이해관계자 간 갈등 상황에서 중재자 역할을 수행하며 합의점을 도출합니다. 각 팀의 입장을 경청하고, 공통 목표를 중심으로 해결책을 찾아냅니다.',
      'diff-1':
        '높은 공감 능력과 커뮤니케이션 스킬이 차별점입니다. 사용자 인터뷰, 팀 미팅, 경영진 보고 등 다양한 상황에서 상대방의 니즈를 정확히 파악하고 효과적으로 메시지를 전달합니다.',
      'vision-1':
        '사람 중심의 제품 문화를 만드는 리더가 되고 싶습니다. 팀원들이 성장하고, 사용자가 행복하며, 비즈니스가 성공하는 선순환 구조를 만들고자 합니다.',
    },
  };
}

/**
 * Generic/balanced questionnaire answers
 * Can be used for quick testing
 */
export function getGenericQuestionnaireAnswers(): QuestionnaireAnswerSet {
  return {
    name: '일반 답변',
    description: '테스트용 기본 답변',
    answers: {
      'q-1': '저는 5년 경력의 프로덕트 매니저로서, 데이터 분석과 사용자 중심 사고를 바탕으로 제품을 기획하고 실행합니다.',
      'q-2': '사용자 피드백을 적극적으로 수집하고 이를 제품 개선에 반영하는 것을 중요하게 생각합니다.',
      'q-3': '팀원들과의 원활한 커뮤니케이션을 통해 목표를 달성하는 것이 제 강점입니다.',
      'q-4': '빠르게 변화하는 시장 환경에 유연하게 대응하며, 실패를 두려워하지 않고 계속 도전합니다.',
      'q-5': '3년 내에 시니어 PM으로 성장하여 더 큰 임팩트를 만들고 싶습니다.',
      'q-6': 'AI와 머신러닝 기술을 활용한 혁신적인 제품을 만들고자 합니다.',
      'q-7': '사용자에게 실질적인 가치를 제공하는 제품을 만드는 것이 저의 목표입니다.',
    },
  };
}

/**
 * Get all predefined answer sets
 */
export function getAllQuestionnaireAnswerSets(): QuestionnaireAnswerSet[] {
  return [
    getStrategicArchitectQuestionnaireAnswers(),
    getMarketDisruptorQuestionnaireAnswers(),
    getEmpatheticLeaderQuestionnaireAnswers(),
    getGenericQuestionnaireAnswers(),
  ];
}

/**
 * Generate answers for a specific number of questions
 * @param questionCount - Number of questions to generate answers for (7-10)
 * @returns Answers object
 */
export function generateAnswersForQuestions(questionCount: number = 7): Record<string, string> {
  const baseAnswers = getGenericQuestionnaireAnswers().answers;
  const answers: Record<string, string> = {};

  for (let i = 1; i <= questionCount; i++) {
    const key = `q-${i}`;
    answers[key] = baseAnswers[key] || `답변 ${i}: 이것은 테스트 답변입니다.`;
  }

  return answers;
}

/**
 * Get compact answers (shorter text for quick tests)
 */
export function getCompactQuestionnaireAnswers(): Record<string, string> {
  return {
    'q-1': '5년 경력 PM, 데이터 기반 의사결정',
    'q-2': '사용자 중심 제품 기획',
    'q-3': '팀 협업 및 커뮤니케이션',
    'q-4': '빠른 실행력과 적응력',
    'q-5': '시니어 PM으로 성장',
    'q-6': 'AI 제품 전문가',
    'q-7': '사용자 가치 창출',
  };
}
