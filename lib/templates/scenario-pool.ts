import { SurveyCategory } from '@/types/survey';

/**
 * Scenario template structure
 */
export interface ScenarioTemplate {
  id: string;
  relatedCategories: SurveyCategory[]; // Categories this scenario relates to
  title: string; // Scenario title (20-40 chars)
  description: string; // Specific description (100-150 chars)
}

/**
 * Scenario pool (15-20 templates)
 *
 * Each scenario is mapped to 1-2 related categories.
 * Templates are selected based on user's top 2 categories.
 */
export const SCENARIO_POOL: ScenarioTemplate[] = [
  // ========================================
  // INNOVATION (혁신 사고) - 4개
  // ========================================
  {
    id: 'innovation_1',
    relatedCategories: [SurveyCategory.INNOVATION],
    title: '신규 프로젝트 기획 시',
    description:
      '기존의 틀을 벗어난 새로운 접근법을 제시하여 팀에 신선한 관점을 제공합니다. 당신의 혁신적 사고는 프로젝트의 차별점을 만들어냅니다.',
  },
  {
    id: 'innovation_2',
    relatedCategories: [SurveyCategory.INNOVATION],
    title: '문제 해결 브레인스토밍',
    description:
      '복잡한 문제를 새로운 각도로 바라보며, 창의적인 해결책을 제안합니다. 당신의 통찰력은 팀이 돌파구를 찾는 데 핵심 역할을 합니다.',
  },
  {
    id: 'innovation_3',
    relatedCategories: [SurveyCategory.INNOVATION],
    title: '시장 트렌드 선도',
    description:
      '업계 흐름을 빠르게 파악하고 새로운 기회를 포착합니다. 당신의 선견지명은 조직이 시장을 앞서가도록 만듭니다.',
  },
  {
    id: 'innovation_4',
    relatedCategories: [SurveyCategory.INNOVATION],
    title: '비즈니스 모델 혁신',
    description:
      '기존 시스템을 재설계하여 새로운 가치를 창출합니다. 당신의 혁신 능력은 조직의 경쟁력을 한 단계 높입니다.',
  },

  // ========================================
  // EXECUTION (철저 실행) - 4개
  // ========================================
  {
    id: 'execution_1',
    relatedCategories: [SurveyCategory.EXECUTION],
    title: '프로젝트 마감 임박 상황',
    description:
      '체계적인 계획과 철저한 실행으로 데드라인을 반드시 지킵니다. 당신의 완결 능력은 팀의 신뢰를 확보합니다.',
  },
  {
    id: 'execution_2',
    relatedCategories: [SurveyCategory.EXECUTION],
    title: '복잡한 업무 프로세스 설계',
    description:
      '세부 사항까지 빈틈없이 계획하여 효율적인 시스템을 구축합니다. 당신의 체계적 접근은 프로젝트 성공률을 높입니다.',
  },
  {
    id: 'execution_3',
    relatedCategories: [SurveyCategory.EXECUTION],
    title: '품질 관리 및 검수',
    description:
      '디테일에 집중하여 완벽한 결과물을 만들어냅니다. 당신의 꼼꼼함은 조직의 품질 기준을 유지합니다.',
  },
  {
    id: 'execution_4',
    relatedCategories: [SurveyCategory.EXECUTION],
    title: '목표 달성 전략 수립',
    description:
      '명확한 목표와 실행 계획을 수립하여 팀을 성과로 이끕니다. 당신의 실행력은 조직의 핵심 자산입니다.',
  },

  // ========================================
  // INFLUENCE (대인 영향) - 4개
  // ========================================
  {
    id: 'influence_1',
    relatedCategories: [SurveyCategory.INFLUENCE],
    title: '이해관계자 설득',
    description:
      '강력한 메시지와 논리적 근거로 주요 이해관계자를 설득합니다. 당신의 영향력은 프로젝트 승인을 이끌어냅니다.',
  },
  {
    id: 'influence_2',
    relatedCategories: [SurveyCategory.INFLUENCE],
    title: '조직 문화 변화 주도',
    description:
      '비전을 제시하고 사람들의 행동을 변화시킵니다. 당신의 리더십은 조직의 새로운 문화를 만듭니다.',
  },
  {
    id: 'influence_3',
    relatedCategories: [SurveyCategory.INFLUENCE],
    title: '프레젠테이션 및 발표',
    description:
      '명확하고 설득력 있게 아이디어를 전달하여 청중을 사로잡습니다. 당신의 전달력은 메시지에 힘을 실어줍니다.',
  },
  {
    id: 'influence_4',
    relatedCategories: [SurveyCategory.INFLUENCE],
    title: '브랜드 홍보 및 마케팅',
    description:
      '효과적인 메시지로 브랜드의 가치를 전파합니다. 당신의 영향력은 시장에서 조직의 인지도를 높입니다.',
  },

  // ========================================
  // COLLABORATION (협업 공감) - 4개
  // ========================================
  {
    id: 'collaboration_1',
    relatedCategories: [SurveyCategory.COLLABORATION],
    title: '팀 갈등 조정',
    description:
      '서로 다른 의견을 조율하여 팀의 합의를 이끌어냅니다. 당신의 중재 능력은 팀의 조화를 만듭니다.',
  },
  {
    id: 'collaboration_2',
    relatedCategories: [SurveyCategory.COLLABORATION],
    title: '크로스 팀 협업 프로젝트',
    description:
      '여러 팀의 강점을 결합하여 시너지를 만들어냅니다. 당신의 협업 능력은 프로젝트의 성공을 이끕니다.',
  },
  {
    id: 'collaboration_3',
    relatedCategories: [SurveyCategory.COLLABORATION],
    title: '팀 빌딩 및 관계 구축',
    description:
      '팀원 간의 신뢰를 쌓고 긍정적인 분위기를 조성합니다. 당신의 공감 능력은 팀의 결속력을 높입니다.',
  },
  {
    id: 'collaboration_4',
    relatedCategories: [SurveyCategory.COLLABORATION],
    title: '고객 및 파트너사 협의',
    description:
      '상대방의 니즈를 이해하고 win-win 솔루션을 찾아냅니다. 당신의 소통 능력은 장기적 파트너십을 만듭니다.',
  },

  // ========================================
  // RESILIENCE (상황 회복) - 4개
  // ========================================
  {
    id: 'resilience_1',
    relatedCategories: [SurveyCategory.RESILIENCE],
    title: '위기 상황 대응',
    description:
      '예상치 못한 문제에 빠르게 대처하여 피해를 최소화합니다. 당신의 회복력은 팀이 위기를 극복하도록 돕습니다.',
  },
  {
    id: 'resilience_2',
    relatedCategories: [SurveyCategory.RESILIENCE],
    title: '실패 후 재기',
    description:
      '실패를 학습 기회로 삼아 더 나은 방향으로 나아갑니다. 당신의 탄력성은 조직의 지속 가능한 성장을 만듭니다.',
  },
  {
    id: 'resilience_3',
    relatedCategories: [SurveyCategory.RESILIENCE],
    title: '장기 프로젝트 지속',
    description:
      '긴 호흡의 프로젝트에서도 꾸준히 에너지를 유지합니다. 당신의 인내심은 팀의 완수율을 높입니다.',
  },
  {
    id: 'resilience_4',
    relatedCategories: [SurveyCategory.RESILIENCE],
    title: '불확실성 속 의사결정',
    description:
      '정보가 부족한 상황에서도 침착하게 판단하여 최선의 선택을 합니다. 당신의 안정성은 팀에 신뢰를 줍니다.',
  },

  // ========================================
  // COMBINED SCENARIOS (복합) - 추가 시나리오
  // ========================================
  {
    id: 'combined_innovation_execution',
    relatedCategories: [SurveyCategory.INNOVATION, SurveyCategory.EXECUTION],
    title: '신규 시스템 런칭',
    description:
      '혁신적인 아이디어를 체계적으로 실행하여 새로운 시스템을 성공적으로 런칭합니다. 전략과 실행의 균형이 빛나는 순간입니다.',
  },
  {
    id: 'combined_influence_collaboration',
    relatedCategories: [SurveyCategory.INFLUENCE, SurveyCategory.COLLABORATION],
    title: '조직 변화 관리',
    description:
      '팀을 설득하고 협력을 이끌어내어 조직의 큰 변화를 성공적으로 안착시킵니다. 영향력과 협업의 시너지가 발휘됩니다.',
  },
];
