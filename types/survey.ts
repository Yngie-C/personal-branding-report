// ==========================================
// PSA Survey Type Definitions
// ==========================================

/**
 * Survey Categories (5 dimensions)
 */
export enum SurveyCategory {
  INNOVATION = 'innovation',      // 혁신 사고
  EXECUTION = 'execution',        // 철저 실행
  INFLUENCE = 'influence',        // 대인 영향
  COLLABORATION = 'collaboration', // 협업 공감
  RESILIENCE = 'resilience',      // 상황 회복
}

/**
 * Category Labels (Korean)
 */
export const CategoryLabels: Record<SurveyCategory, string> = {
  [SurveyCategory.INNOVATION]: '혁신 사고',
  [SurveyCategory.EXECUTION]: '철저 실행',
  [SurveyCategory.INFLUENCE]: '대인 영향',
  [SurveyCategory.COLLABORATION]: '협업 공감',
  [SurveyCategory.RESILIENCE]: '상황 회복',
};

/**
 * Category Descriptions (Korean)
 */
export const CategoryDescriptions: Record<SurveyCategory, string> = {
  [SurveyCategory.INNOVATION]: '어떤 가치를 창조하는가?',
  [SurveyCategory.EXECUTION]: '어떻게 결과를 만드는가?',
  [SurveyCategory.INFLUENCE]: '어떻게 브랜드를 전파하는가?',
  [SurveyCategory.COLLABORATION]: '어떤 관계를 구축하는가?',
  [SurveyCategory.RESILIENCE]: '위기에 어떻게 대응하는가?',
};

/**
 * Survey Question Interface
 */
export interface SurveyQuestion {
  id: string;
  questionNumber: number;
  category: SurveyCategory;
  questionText: string;
  questionHint?: string;
  version: number;
  isReverseScored?: boolean; // NEW: For reverse-scored questions
}

/**
 * User response to a single question
 */
export interface SurveyAnswer {
  questionId: string;
  questionNumber: number;
  category: SurveyCategory;
  score: number; // 1-7 Likert scale
}

/**
 * Complete survey response from user
 */
export interface SurveyResponse {
  sessionId: string;
  answers: SurveyAnswer[];
  completedAt: Date;
  completionTimeSeconds?: number;
}

/**
 * Category Score (normalized 0-100)
 */
export interface CategoryScore {
  category: SurveyCategory;
  rawScore: number;        // Average of 1-7 scores
  normalizedScore: number; // Converted to 0-100 scale
  rank: number;            // 1-5 ranking
}

/**
 * Persona Types (10 combinations)
 */
export enum PersonaType {
  // Innovation + Execution
  ARCHITECT = 'architect',           // 전략적 설계자

  // Innovation + Influence
  DISRUPTOR = 'disruptor',           // 시장 파괴자

  // Innovation + Collaboration
  CREATIVE_CATALYST = 'creative_catalyst', // 창의적 촉매

  // Innovation + Resilience
  ADAPTIVE_PIONEER = 'adaptive_pioneer',   // 적응형 선구자

  // Execution + Influence
  AUTHORITATIVE_LEADER = 'authoritative_leader', // 권위적 리더

  // Execution + Collaboration
  THE_ANCHOR = 'the_anchor',         // 신뢰의 중추

  // Execution + Resilience
  STEADY_ACHIEVER = 'steady_achiever', // 꾸준한 달성자

  // Influence + Collaboration
  INSPIRATIONAL_CONNECTOR = 'inspirational_connector', // 영감을 주는 연결자

  // Influence + Resilience
  RESILIENT_INFLUENCER = 'resilient_influencer', // 회복력 있는 영향자

  // Collaboration + Resilience
  SUPPORTIVE_BACKBONE = 'supportive_backbone', // 지지적 백본
}

/**
 * Persona Metadata
 */
export interface PersonaMetadata {
  type: PersonaType;
  title: string;          // Korean title
  tagline: string;        // Short description
  description: string;    // Detailed description
  strengths: string[];    // Key strengths
  shadowSides: string[];  // Potential weaknesses
  brandingKeywords: string[]; // Top 3-5 keywords
}

/**
 * Persona Mapping Rules
 */
export const PersonaMap: Record<string, PersonaMetadata> = {
  'innovation-execution': {
    type: PersonaType.ARCHITECT,
    title: '전략적 설계자',
    tagline: '상상을 현실 가능한 시스템으로 설계합니다',
    description: '새로운 아이디어를 체계적으로 실행하여 결과를 만들어내는 사람입니다. 혁신적 사고와 철저한 실행력을 결합하여 비전을 구체적인 성과로 전환합니다.',
    strengths: ['전략 수립', '체계적 실행', '혁신 구현', '프로세스 설계', '효율 극대화'],
    shadowSides: ['과도한 완벽주의', '대인 관계 소홀 가능성', '유연성 부족'],
    brandingKeywords: ['전략', '혁신', '실행력', '시스템', '효율'],
  },
  'innovation-influence': {
    type: PersonaType.DISRUPTOR,
    title: '시장 파괴자',
    tagline: '새로운 관점으로 판을 흔들고 설득합니다',
    description: '새로운 패러다임을 제시하고 사람들을 설득하여 변화를 이끄는 사람입니다. 혁신적 아이디어와 강력한 영향력으로 업계의 룰을 바꿉니다.',
    strengths: ['시장 통찰', '설득력', '영향력', '변화 주도', '비전 제시'],
    shadowSides: ['실행 디테일 부족', '지속성 약화', '조직 내 마찰'],
    brandingKeywords: ['혁신', '영향력', '변화', '파괴', '비전'],
  },
  'innovation-collaboration': {
    type: PersonaType.CREATIVE_CATALYST,
    title: '창의적 촉매',
    tagline: '모두의 아이디어를 모아 최선의 답을 찾습니다',
    description: '팀의 창의성을 끌어올리고 협업을 통해 혁신적 결과를 만드는 사람입니다. 집단지성을 활용하여 breakthrough를 만들어냅니다.',
    strengths: ['아이디어 생성', '협업 촉진', '창의적 문제해결', '팀 시너지', '통찰'],
    shadowSides: ['실행력 부족', '일관성 저하', '결정 지연'],
    brandingKeywords: ['창의성', '협업', '혁신', '시너지', '집단지성'],
  },
  'innovation-resilience': {
    type: PersonaType.ADAPTIVE_PIONEER,
    title: '적응형 선구자',
    tagline: '불확실성 속에서도 새로운 길을 찾아냅니다',
    description: '변화에 빠르게 적응하며 새로운 시도를 두려워하지 않는 사람입니다. 위기를 기회로 전환하는 혁신가입니다.',
    strengths: ['변화 적응', '위기 대응', '혁신 시도', '유연함', '탐사'],
    shadowSides: ['일관성 부족', '조직 적응 어려움', '안정성 저하'],
    brandingKeywords: ['적응력', '혁신', '회복력', '선구자', '도전'],
  },
  'execution-influence': {
    type: PersonaType.AUTHORITATIVE_LEADER,
    title: '퍼포먼스 드라이버',
    tagline: '압도적인 결과물로 스스로를 증명합니다',
    description: '명확한 목표와 체계적 실행으로 조직에 강력한 영향을 미치는 사람입니다. 탁월한 성과로 신뢰와 권위를 구축합니다.',
    strengths: ['목표 달성', '리더십', '조직 관리', '성과 창출', '주도성'],
    shadowSides: ['경직성', '혁신 저항', '권위적 태도'],
    brandingKeywords: ['리더십', '실행력', '영향력', '성과', '주도'],
  },
  'execution-collaboration': {
    type: PersonaType.THE_ANCHOR,
    title: '신뢰의 중추',
    tagline: '탁월한 실무력으로 조직의 안정을 만듭니다',
    description: '철저한 실행과 협업으로 팀을 안정적으로 이끄는 사람입니다. 신뢰를 바탕으로 조직의 기반을 다집니다.',
    strengths: ['안정성', '신뢰', '팀워크', '체계', '서포트'],
    shadowSides: ['변화 저항', '혁신 부족', '보수적 성향'],
    brandingKeywords: ['신뢰', '협업', '안정성', '실행력', '체계'],
  },
  'execution-resilience': {
    type: PersonaType.STEADY_ACHIEVER,
    title: '강철의 완결자',
    tagline: '어떤 역경에도 약속한 결과물을 끝내 가져옵니다',
    description: '인내심과 끈기로 목표를 꾸준히 달성하는 사람입니다. 어려움 속에서도 흔들리지 않고 완수합니다.',
    strengths: ['끈기', '목표 달성', '위기 극복', '책임감', '디테일'],
    shadowSides: ['유연성 부족', '대인 관계 소홀', '번아웃 위험'],
    brandingKeywords: ['끈기', '달성', '실행력', '회복력', '완결'],
  },
  'influence-collaboration': {
    type: PersonaType.INSPIRATIONAL_CONNECTOR,
    title: '공감형 리더',
    tagline: '사람의 마음을 움직여 함께 승리합니다',
    description: '탁월한 소통과 협업으로 사람들에게 영감을 주는 사람입니다. 관계를 통해 조직을 하나로 만듭니다.',
    strengths: ['네트워킹', '영감 제공', '관계 구축', '소통', '조화'],
    shadowSides: ['실행력 부족', '디테일 소홀', '결정 회피'],
    brandingKeywords: ['영향력', '협업', '네트워킹', '영감', '소통'],
  },
  'influence-resilience': {
    type: PersonaType.RESILIENT_INFLUENCER,
    title: '흔들리지 않는 대변인',
    tagline: '위기 상황에서 더욱 빛나는 설득력을 발휘합니다',
    description: '어려움을 극복하며 지속적으로 영향력을 발휘하는 사람입니다. 역경 속에서도 사람들을 이끕니다.',
    strengths: ['회복력', '영향력', '위기 리더십', '자신감', '대담함'],
    shadowSides: ['일관성 부족', '계획성 저하', '충동적 결정'],
    brandingKeywords: ['회복력', '영향력', '리더십', '극복', '전달력'],
  },
  'collaboration-resilience': {
    type: PersonaType.SUPPORTIVE_BACKBONE,
    title: '회복탄력적 중재자',
    tagline: '무너진 팀을 재건하고 관계의 가치를 지킵니다',
    description: '팀을 든든하게 지지하며 어려움 속에서도 함께하는 사람입니다. 관계를 통해 조직의 회복력을 높입니다.',
    strengths: ['지지', '팀워크', '안정성', '포용', '위기관리'],
    shadowSides: ['주도성 부족', '혁신 저항', '의존성'],
    brandingKeywords: ['지지', '협업', '안정성', '신뢰', '화합'],
  },
};

/**
 * Brief Analysis Output (from SurveyAnalyzerAgent)
 */
export interface BriefAnalysis {
  // Session info
  sessionId: string;

  // Scores
  categoryScores: CategoryScore[];
  totalScore: number; // Average across all categories (0-100)

  // Persona
  persona: PersonaMetadata;
  topCategories: SurveyCategory[]; // Top 2

  // Analysis
  strengthsSummary: string;      // 2-3 paragraphs
  brandingKeywords: string[];    // Top 3-5 keywords

  // Strength scenarios
  strengthsScenarios?: {
    title: string;              // Scenario title
    description: string;        // Specific description (100-150 chars)
  }[];

  // NEW: Strength-focused sections (replaces lowScoreCategories & shadowSides)
  strengthTips?: {
    strength: string;           // 강점명
    tip: string;                // 실무 활용 팁
    scenario: string;           // 적용 상황
  }[];

  brandingMessages?: {
    selfIntro: string;          // 한 줄 자기소개
    linkedinHeadline: string;   // LinkedIn 헤드라인
    elevatorPitch: string;      // 엘리베이터 피치
    hashtags: string[];         // 추천 해시태그
  };

  // Radar chart data
  radarData: {
    category: string;
    score: number;
  }[];

  // @deprecated - 하위 호환용, 새 코드에서는 사용하지 않음
  /** @deprecated Use strengthTips instead */
  lowScoreCategories?: {
    category: SurveyCategory;
    reframedLabel: string;
    reframedDescription: string;
  }[];

  /** @deprecated Use brandingMessages instead */
  shadowSides?: string;

  // NEW: Selected Soul Questions
  selectedSoulQuestions?: string[];  // Soul Question IDs

  // Metadata
  completionTimeSeconds?: number;
  analyzedAt: Date;
}

/**
 * Helper function to get persona by top categories
 */
export function getPersonaByCategories(
  topCategories: SurveyCategory[]
): PersonaMetadata {
  if (topCategories.length < 2) {
    throw new Error('Need at least 2 top categories for persona mapping');
  }

  const key = `${topCategories[0]}-${topCategories[1]}`;
  let persona = PersonaMap[key];

  // Try reverse order if direct mapping not found
  if (!persona) {
    const reverseKey = `${topCategories[1]}-${topCategories[0]}`;
    persona = PersonaMap[reverseKey];
  }

  if (!persona) {
    // Fallback: use first category as primary
    const fallbackKey = Object.keys(PersonaMap).find(k => k.startsWith(topCategories[0]));
    if (fallbackKey) {
      return PersonaMap[fallbackKey];
    }
    // Ultimate fallback
    return PersonaMap['innovation-execution'];
  }

  return persona;
}

/**
 * Helper function to normalize score from 1-7 to 0-100
 */
export function normalizeScore(rawScore: number): number {
  return ((rawScore - 1) / 6) * 100;
}

/**
 * Helper function to calculate category average
 * Applies reverse scoring for reverse-scored questions
 */
export function calculateCategoryScore(
  answers: SurveyAnswer[],
  category: SurveyCategory,
  questions: SurveyQuestion[] // NEW: Need question metadata for reverse scoring
): number {
  const categoryAnswers = answers.filter((a) => a.category === category);
  if (categoryAnswers.length === 0) return 0;

  // Apply reverse scoring before averaging
  const adjustedScores = categoryAnswers.map((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);

    // Reverse score if question is marked as reverse-scored
    if (question?.isReverseScored) {
      return 8 - answer.score; // 7→1, 6→2, ..., 1→7
    }

    return answer.score; // Use original score
  });

  const sum = adjustedScores.reduce((acc, score) => acc + score, 0);
  return sum / adjustedScores.length;
}
