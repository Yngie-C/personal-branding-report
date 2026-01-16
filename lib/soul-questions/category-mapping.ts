import { TemplateVariant } from '@/types/soul-questions';
import { PersonaType } from '@/types/survey';

/**
 * 카테고리 조합별 질문 매핑 인터페이스
 *
 * 10개 페르소나 × 3 variant = 30개 매핑
 */
export interface CategoryQuestionMapping {
  personaType: PersonaType;
  categoryCombo: string;           // "innovation-execution"
  variant: TemplateVariant;        // "balanced" | "spiked" | "mixed"
  philosophyIds: string[];         // 3개 질문 ID
  expertisePoolIds: string[];      // 4개 템플릿 ID (LLM 참조용)
  edgePoolIds: string[];           // 2개 템플릿 ID (LLM 참조용)
}

/**
 * 30개 카테고리 매핑 테이블
 *
 * 각 페르소나(10개) × variant(3개) 조합에 최적화된 질문 구성
 */
export const CATEGORY_QUESTION_MAPPINGS: CategoryQuestionMapping[] = [
  // ========================================
  // ARCHITECT (전략적 설계자): innovation-execution
  // ========================================
  {
    personaType: PersonaType.ARCHITECT,
    categoryCombo: 'innovation-execution',
    variant: 'balanced',
    philosophyIds: ['soul_identity_1', 'soul_value_2', 'soul_impact_2'],
    expertisePoolIds: ['exp_primary_1', 'exp_secondary_1', 'exp_hidden_1', 'exp_hidden_4'],
    edgePoolIds: ['edge_diff_1', 'edge_vision_1'],
  },
  {
    personaType: PersonaType.ARCHITECT,
    categoryCombo: 'innovation-execution',
    variant: 'spiked',
    philosophyIds: ['soul_identity_1', 'soul_identity_2', 'soul_impact_2'],
    expertisePoolIds: ['exp_primary_1', 'exp_primary_3', 'exp_hidden_3', 'exp_hidden_4'],
    edgePoolIds: ['edge_diff_2', 'edge_vision_1'],
  },
  {
    personaType: PersonaType.ARCHITECT,
    categoryCombo: 'innovation-execution',
    variant: 'mixed',
    philosophyIds: ['soul_identity_1', 'soul_value_2', 'soul_impact_1'],
    expertisePoolIds: ['exp_primary_1', 'exp_secondary_2', 'exp_hidden_1', 'exp_hidden_2'],
    edgePoolIds: ['edge_diff_1', 'edge_vision_4'],
  },

  // ========================================
  // DISRUPTOR (시장 파괴자): innovation-influence
  // ========================================
  {
    personaType: PersonaType.DISRUPTOR,
    categoryCombo: 'innovation-influence',
    variant: 'balanced',
    philosophyIds: ['soul_identity_1', 'soul_identity_2', 'soul_impact_2'],
    expertisePoolIds: ['exp_primary_1', 'exp_secondary_1', 'exp_primary_4', 'exp_hidden_1'],
    edgePoolIds: ['edge_diff_2', 'edge_vision_3'],
  },
  {
    personaType: PersonaType.DISRUPTOR,
    categoryCombo: 'innovation-influence',
    variant: 'spiked',
    philosophyIds: ['soul_identity_1', 'soul_identity_2', 'soul_impact_2'],
    expertisePoolIds: ['exp_primary_1', 'exp_primary_2', 'exp_hidden_3', 'exp_hidden_4'],
    edgePoolIds: ['edge_diff_1', 'edge_vision_3'],
  },
  {
    personaType: PersonaType.DISRUPTOR,
    categoryCombo: 'innovation-influence',
    variant: 'mixed',
    philosophyIds: ['soul_identity_1', 'soul_value_2', 'soul_impact_1'],
    expertisePoolIds: ['exp_primary_1', 'exp_secondary_2', 'exp_hidden_2', 'exp_primary_4'],
    edgePoolIds: ['edge_diff_3', 'edge_vision_1'],
  },

  // ========================================
  // CREATIVE_CATALYST (창의적 촉매): innovation-collaboration
  // ========================================
  {
    personaType: PersonaType.CREATIVE_CATALYST,
    categoryCombo: 'innovation-collaboration',
    variant: 'balanced',
    philosophyIds: ['soul_identity_1', 'soul_value_1', 'soul_impact_2'],
    expertisePoolIds: ['exp_primary_1', 'exp_secondary_1', 'exp_secondary_3', 'exp_hidden_1'],
    edgePoolIds: ['edge_diff_2', 'edge_vision_3'],
  },
  {
    personaType: PersonaType.CREATIVE_CATALYST,
    categoryCombo: 'innovation-collaboration',
    variant: 'spiked',
    philosophyIds: ['soul_identity_1', 'soul_identity_2', 'soul_impact_2'],
    expertisePoolIds: ['exp_primary_1', 'exp_primary_3', 'exp_hidden_3', 'exp_hidden_4'],
    edgePoolIds: ['edge_diff_1', 'edge_vision_2'],
  },
  {
    personaType: PersonaType.CREATIVE_CATALYST,
    categoryCombo: 'innovation-collaboration',
    variant: 'mixed',
    philosophyIds: ['soul_identity_1', 'soul_value_1', 'soul_impact_1'],
    expertisePoolIds: ['exp_primary_2', 'exp_secondary_2', 'exp_hidden_1', 'exp_hidden_2'],
    edgePoolIds: ['edge_diff_3', 'edge_vision_4'],
  },

  // ========================================
  // ADAPTIVE_PIONEER (적응형 선구자): innovation-resilience
  // ========================================
  {
    personaType: PersonaType.ADAPTIVE_PIONEER,
    categoryCombo: 'innovation-resilience',
    variant: 'balanced',
    philosophyIds: ['soul_identity_1', 'soul_value_1', 'soul_impact_2'],
    expertisePoolIds: ['exp_primary_1', 'exp_secondary_4', 'exp_hidden_1', 'exp_hidden_3'],
    edgePoolIds: ['edge_diff_2', 'edge_vision_1'],
  },
  {
    personaType: PersonaType.ADAPTIVE_PIONEER,
    categoryCombo: 'innovation-resilience',
    variant: 'spiked',
    philosophyIds: ['soul_identity_1', 'soul_identity_2', 'soul_impact_2'],
    expertisePoolIds: ['exp_primary_1', 'exp_primary_2', 'exp_secondary_4', 'exp_hidden_3'],
    edgePoolIds: ['edge_diff_1', 'edge_vision_3'],
  },
  {
    personaType: PersonaType.ADAPTIVE_PIONEER,
    categoryCombo: 'innovation-resilience',
    variant: 'mixed',
    philosophyIds: ['soul_identity_1', 'soul_value_2', 'soul_impact_1'],
    expertisePoolIds: ['exp_primary_3', 'exp_secondary_1', 'exp_hidden_2', 'exp_hidden_4'],
    edgePoolIds: ['edge_diff_4', 'edge_vision_4'],
  },

  // ========================================
  // AUTHORITATIVE_LEADER (퍼포먼스 드라이버): execution-influence
  // ========================================
  {
    personaType: PersonaType.AUTHORITATIVE_LEADER,
    categoryCombo: 'execution-influence',
    variant: 'balanced',
    philosophyIds: ['soul_identity_1', 'soul_value_2', 'soul_impact_1'],
    expertisePoolIds: ['exp_primary_1', 'exp_secondary_1', 'exp_primary_4', 'exp_hidden_1'],
    edgePoolIds: ['edge_diff_1', 'edge_vision_2'],
  },
  {
    personaType: PersonaType.AUTHORITATIVE_LEADER,
    categoryCombo: 'execution-influence',
    variant: 'spiked',
    philosophyIds: ['soul_identity_1', 'soul_identity_2', 'soul_impact_1'],
    expertisePoolIds: ['exp_primary_1', 'exp_primary_3', 'exp_hidden_3', 'exp_hidden_4'],
    edgePoolIds: ['edge_diff_3', 'edge_vision_1'],
  },
  {
    personaType: PersonaType.AUTHORITATIVE_LEADER,
    categoryCombo: 'execution-influence',
    variant: 'mixed',
    philosophyIds: ['soul_identity_1', 'soul_value_2', 'soul_impact_2'],
    expertisePoolIds: ['exp_primary_2', 'exp_secondary_2', 'exp_hidden_1', 'exp_hidden_2'],
    edgePoolIds: ['edge_diff_2', 'edge_vision_4'],
  },

  // ========================================
  // THE_ANCHOR (신뢰의 중추): execution-collaboration
  // ========================================
  {
    personaType: PersonaType.THE_ANCHOR,
    categoryCombo: 'execution-collaboration',
    variant: 'balanced',
    philosophyIds: ['soul_identity_1', 'soul_value_1', 'soul_impact_1'],
    expertisePoolIds: ['exp_primary_1', 'exp_secondary_1', 'exp_secondary_3', 'exp_hidden_2'],
    edgePoolIds: ['edge_diff_4', 'edge_vision_2'],
  },
  {
    personaType: PersonaType.THE_ANCHOR,
    categoryCombo: 'execution-collaboration',
    variant: 'spiked',
    philosophyIds: ['soul_identity_1', 'soul_identity_2', 'soul_value_1'],
    expertisePoolIds: ['exp_primary_1', 'exp_primary_4', 'exp_hidden_3', 'exp_hidden_4'],
    edgePoolIds: ['edge_diff_1', 'edge_vision_4'],
  },
  {
    personaType: PersonaType.THE_ANCHOR,
    categoryCombo: 'execution-collaboration',
    variant: 'mixed',
    philosophyIds: ['soul_identity_1', 'soul_value_2', 'soul_impact_1'],
    expertisePoolIds: ['exp_primary_2', 'exp_secondary_2', 'exp_hidden_1', 'exp_hidden_2'],
    edgePoolIds: ['edge_diff_3', 'edge_vision_1'],
  },

  // ========================================
  // STEADY_ACHIEVER (강철의 완결자): execution-resilience
  // ========================================
  {
    personaType: PersonaType.STEADY_ACHIEVER,
    categoryCombo: 'execution-resilience',
    variant: 'balanced',
    philosophyIds: ['soul_identity_1', 'soul_value_1', 'soul_value_2'],
    expertisePoolIds: ['exp_primary_1', 'exp_secondary_4', 'exp_hidden_1', 'exp_hidden_3'],
    edgePoolIds: ['edge_diff_4', 'edge_vision_4'],
  },
  {
    personaType: PersonaType.STEADY_ACHIEVER,
    categoryCombo: 'execution-resilience',
    variant: 'spiked',
    philosophyIds: ['soul_identity_1', 'soul_identity_2', 'soul_value_2'],
    expertisePoolIds: ['exp_primary_1', 'exp_primary_3', 'exp_secondary_4', 'exp_hidden_3'],
    edgePoolIds: ['edge_diff_1', 'edge_vision_1'],
  },
  {
    personaType: PersonaType.STEADY_ACHIEVER,
    categoryCombo: 'execution-resilience',
    variant: 'mixed',
    philosophyIds: ['soul_identity_1', 'soul_value_1', 'soul_impact_1'],
    expertisePoolIds: ['exp_primary_2', 'exp_secondary_1', 'exp_hidden_2', 'exp_hidden_4'],
    edgePoolIds: ['edge_diff_2', 'edge_vision_2'],
  },

  // ========================================
  // INSPIRATIONAL_CONNECTOR (공감형 리더): influence-collaboration
  // ========================================
  {
    personaType: PersonaType.INSPIRATIONAL_CONNECTOR,
    categoryCombo: 'influence-collaboration',
    variant: 'balanced',
    philosophyIds: ['soul_identity_1', 'soul_identity_2', 'soul_impact_1'],
    expertisePoolIds: ['exp_primary_1', 'exp_secondary_1', 'exp_primary_4', 'exp_hidden_2'],
    edgePoolIds: ['edge_diff_3', 'edge_vision_2'],
  },
  {
    personaType: PersonaType.INSPIRATIONAL_CONNECTOR,
    categoryCombo: 'influence-collaboration',
    variant: 'spiked',
    philosophyIds: ['soul_identity_1', 'soul_identity_2', 'soul_value_1'],
    expertisePoolIds: ['exp_primary_1', 'exp_primary_4', 'exp_hidden_3', 'exp_hidden_4'],
    edgePoolIds: ['edge_diff_1', 'edge_vision_3'],
  },
  {
    personaType: PersonaType.INSPIRATIONAL_CONNECTOR,
    categoryCombo: 'influence-collaboration',
    variant: 'mixed',
    philosophyIds: ['soul_identity_1', 'soul_value_1', 'soul_impact_1'],
    expertisePoolIds: ['exp_primary_2', 'exp_secondary_3', 'exp_hidden_1', 'exp_hidden_2'],
    edgePoolIds: ['edge_diff_2', 'edge_vision_4'],
  },

  // ========================================
  // RESILIENT_INFLUENCER (흔들리지 않는 대변인): influence-resilience
  // ========================================
  {
    personaType: PersonaType.RESILIENT_INFLUENCER,
    categoryCombo: 'influence-resilience',
    variant: 'balanced',
    philosophyIds: ['soul_identity_1', 'soul_identity_2', 'soul_value_1'],
    expertisePoolIds: ['exp_primary_1', 'exp_secondary_4', 'exp_primary_4', 'exp_hidden_1'],
    edgePoolIds: ['edge_diff_3', 'edge_vision_1'],
  },
  {
    personaType: PersonaType.RESILIENT_INFLUENCER,
    categoryCombo: 'influence-resilience',
    variant: 'spiked',
    philosophyIds: ['soul_identity_1', 'soul_identity_2', 'soul_impact_1'],
    expertisePoolIds: ['exp_primary_1', 'exp_primary_3', 'exp_secondary_4', 'exp_hidden_3'],
    edgePoolIds: ['edge_diff_1', 'edge_vision_2'],
  },
  {
    personaType: PersonaType.RESILIENT_INFLUENCER,
    categoryCombo: 'influence-resilience',
    variant: 'mixed',
    philosophyIds: ['soul_identity_1', 'soul_value_1', 'soul_impact_2'],
    expertisePoolIds: ['exp_primary_2', 'exp_secondary_1', 'exp_hidden_2', 'exp_hidden_4'],
    edgePoolIds: ['edge_diff_4', 'edge_vision_3'],
  },

  // ========================================
  // SUPPORTIVE_BACKBONE (회복탄력적 중재자): collaboration-resilience
  // ========================================
  {
    personaType: PersonaType.SUPPORTIVE_BACKBONE,
    categoryCombo: 'collaboration-resilience',
    variant: 'balanced',
    philosophyIds: ['soul_identity_1', 'soul_value_1', 'soul_impact_1'],
    expertisePoolIds: ['exp_primary_1', 'exp_secondary_4', 'exp_secondary_3', 'exp_hidden_2'],
    edgePoolIds: ['edge_diff_4', 'edge_vision_4'],
  },
  {
    personaType: PersonaType.SUPPORTIVE_BACKBONE,
    categoryCombo: 'collaboration-resilience',
    variant: 'spiked',
    philosophyIds: ['soul_identity_1', 'soul_identity_2', 'soul_value_1'],
    expertisePoolIds: ['exp_primary_1', 'exp_primary_4', 'exp_secondary_4', 'exp_hidden_3'],
    edgePoolIds: ['edge_diff_1', 'edge_vision_2'],
  },
  {
    personaType: PersonaType.SUPPORTIVE_BACKBONE,
    categoryCombo: 'collaboration-resilience',
    variant: 'mixed',
    philosophyIds: ['soul_identity_1', 'soul_value_1', 'soul_impact_2'],
    expertisePoolIds: ['exp_primary_2', 'exp_secondary_1', 'exp_hidden_1', 'exp_hidden_4'],
    edgePoolIds: ['edge_diff_3', 'edge_vision_1'],
  },
];

/**
 * 페르소나 조합과 variant로 매핑 찾기
 */
export function findMapping(
  categoryCombo: string,
  variant: TemplateVariant
): CategoryQuestionMapping | undefined {
  return CATEGORY_QUESTION_MAPPINGS.find(
    m => m.categoryCombo === categoryCombo && m.variant === variant
  );
}

/**
 * 페르소나 타입과 variant로 매핑 찾기
 */
export function findMappingByPersona(
  personaType: PersonaType,
  variant: TemplateVariant
): CategoryQuestionMapping | undefined {
  return CATEGORY_QUESTION_MAPPINGS.find(
    m => m.personaType === personaType && m.variant === variant
  );
}

/**
 * 매핑 테이블 통계 (검증용)
 */
export function getMappingStats() {
  const personas = new Set(CATEGORY_QUESTION_MAPPINGS.map(m => m.personaType));
  const variants = new Set(CATEGORY_QUESTION_MAPPINGS.map(m => m.variant));

  return {
    totalMappings: CATEGORY_QUESTION_MAPPINGS.length,
    uniquePersonas: personas.size,
    uniqueVariants: variants.size,
    expectedMappings: personas.size * variants.size, // Should be 30
  };
}
