import { PersonaType } from '@/types/survey';

/**
 * 강점 활용 팁 인터페이스
 */
export interface StrengthTip {
  strength: string;    // 강점명
  tip: string;         // 실무 활용 팁 (50-80자)
  scenario: string;    // 적용 상황 (40-60자)
}

export interface StrengthTipsTemplate {
  personaType: PersonaType;
  tips: StrengthTip[];
}

/**
 * 10개 페르소나별 강점 활용 팁 템플릿
 */
export const STRENGTH_TIPS_TEMPLATES: StrengthTipsTemplate[] = [
  // ========================================
  // 1. ARCHITECT (전략적 설계자)
  // Innovation + Execution
  // ========================================
  {
    personaType: PersonaType.ARCHITECT,
    tips: [
      {
        strength: '전략 수립',
        tip: '큰 그림을 먼저 그리고, 역순으로 마일스톤을 설계하세요. 목표에서 현재로 되짚어오면 놓치는 단계가 없습니다.',
        scenario: '신규 프로젝트 기획 시',
      },
      {
        strength: '체계적 실행',
        tip: '프로세스를 문서화하고 체크리스트를 팀에 공유하세요. 당신의 체계가 팀 전체의 효율을 높입니다.',
        scenario: '협업 프로젝트 진행 시',
      },
      {
        strength: '효율 극대화',
        tip: '반복 작업은 템플릿화하고 자동화 포인트를 찾으세요. 시간을 아끼면 더 큰 가치에 집중할 수 있습니다.',
        scenario: '업무 프로세스 개선 시',
      },
    ],
  },

  // ========================================
  // 2. DISRUPTOR (시장 파괴자)
  // Innovation + Influence
  // ========================================
  {
    personaType: PersonaType.DISRUPTOR,
    tips: [
      {
        strength: '시장 통찰',
        tip: '업계 트렌드를 먼저 읽고, "왜 아무도 이걸 안 하지?"라는 질문을 던지세요. 그 답이 기회입니다.',
        scenario: '새로운 기회 탐색 시',
      },
      {
        strength: '설득력',
        tip: '데이터와 스토리를 결합하세요. 숫자는 논리를, 이야기는 감정을 움직입니다.',
        scenario: '경영진 설득 또는 프레젠테이션 시',
      },
      {
        strength: '변화 주도',
        tip: '작은 성공 사례를 먼저 만드세요. 실제 결과가 있으면 저항이 줄어듭니다.',
        scenario: '조직 변화 추진 시',
      },
    ],
  },

  // ========================================
  // 3. CREATIVE_CATALYST (창의적 촉매)
  // Innovation + Collaboration
  // ========================================
  {
    personaType: PersonaType.CREATIVE_CATALYST,
    tips: [
      {
        strength: '아이디어 생성',
        tip: '아이디어 발산 시간과 수렴 시간을 분리하세요. 판단을 미루면 더 다양한 가능성이 나옵니다.',
        scenario: '브레인스토밍 회의 시',
      },
      {
        strength: '협업 촉진',
        tip: '조용한 팀원에게 먼저 의견을 물어보세요. 숨겨진 통찰이 최고의 아이디어일 때가 많습니다.',
        scenario: '팀 회의 진행 시',
      },
      {
        strength: '창의적 문제해결',
        tip: '문제를 재정의해보세요. "어떻게"보다 "왜"를 먼저 질문하면 새로운 해결책이 보입니다.',
        scenario: '복잡한 문제 직면 시',
      },
    ],
  },

  // ========================================
  // 4. ADAPTIVE_PIONEER (적응형 선구자)
  // Innovation + Resilience
  // ========================================
  {
    personaType: PersonaType.ADAPTIVE_PIONEER,
    tips: [
      {
        strength: '변화 적응',
        tip: '변화를 "위협"이 아닌 "데이터"로 보세요. 빠르게 학습하고 조정하는 것이 당신의 무기입니다.',
        scenario: '예상치 못한 상황 발생 시',
      },
      {
        strength: '위기 대응',
        tip: '위기 상황에서 "지금 할 수 있는 가장 작은 행동"에 집중하세요. 작은 진전이 모멘텀을 만듭니다.',
        scenario: '프로젝트 위기 시',
      },
      {
        strength: '혁신 시도',
        tip: '작은 실험을 자주 하세요. 실패해도 배움이 되고, 성공하면 혁신이 됩니다.',
        scenario: '새로운 방법 시도 시',
      },
    ],
  },

  // ========================================
  // 5. AUTHORITATIVE_LEADER (퍼포먼스 드라이버)
  // Execution + Influence
  // ========================================
  {
    personaType: PersonaType.AUTHORITATIVE_LEADER,
    tips: [
      {
        strength: '목표 달성',
        tip: '목표를 구체적인 숫자로 정의하세요. "더 좋게"가 아닌 "20% 개선"이 팀을 움직입니다.',
        scenario: 'KPI 설정 및 관리 시',
      },
      {
        strength: '리더십',
        tip: '기대치를 명확히 전달하고, 그 이유도 함께 설명하세요. 이해한 팀이 더 잘 실행합니다.',
        scenario: '팀 지시 및 위임 시',
      },
      {
        strength: '성과 창출',
        tip: '성과를 가시화하고 팀과 공유하세요. 진전을 보여주면 동기부여가 됩니다.',
        scenario: '프로젝트 진행 중',
      },
    ],
  },

  // ========================================
  // 6. THE_ANCHOR (신뢰의 중추)
  // Execution + Collaboration
  // ========================================
  {
    personaType: PersonaType.THE_ANCHOR,
    tips: [
      {
        strength: '안정성',
        tip: '일관된 품질과 마감을 유지하세요. 예측 가능함이 당신에 대한 신뢰를 만듭니다.',
        scenario: '반복 업무 수행 시',
      },
      {
        strength: '신뢰',
        tip: '약속한 것은 반드시 지키고, 못 지킬 것은 미리 말하세요. 투명함이 신뢰를 쌓습니다.',
        scenario: '팀원 및 이해관계자와 협업 시',
      },
      {
        strength: '팀워크',
        tip: '동료가 어려울 때 먼저 도움을 제안하세요. 당신의 서포트가 팀의 결속력을 높입니다.',
        scenario: '팀 협업 시',
      },
    ],
  },

  // ========================================
  // 7. STEADY_ACHIEVER (강철의 완결자)
  // Execution + Resilience
  // ========================================
  {
    personaType: PersonaType.STEADY_ACHIEVER,
    tips: [
      {
        strength: '끈기',
        tip: '장기 목표를 작은 단계로 쪼개세요. 매일 조금씩 진전하면 어떤 목표도 도달합니다.',
        scenario: '장기 프로젝트 수행 시',
      },
      {
        strength: '위기 극복',
        tip: '어려움을 "해결할 문제"로 정의하세요. 감정이 아닌 행동에 집중하면 돌파구가 보입니다.',
        scenario: '난관 봉착 시',
      },
      {
        strength: '책임감',
        tip: '맡은 일은 끝까지 책임지되, 혼자 안고 있지 마세요. 공유하면서 완수하세요.',
        scenario: '복잡한 업무 담당 시',
      },
    ],
  },

  // ========================================
  // 8. INSPIRATIONAL_CONNECTOR (공감형 리더)
  // Influence + Collaboration
  // ========================================
  {
    personaType: PersonaType.INSPIRATIONAL_CONNECTOR,
    tips: [
      {
        strength: '네트워킹',
        tip: '관계를 "거래"가 아닌 "연결"로 보세요. 먼저 도움을 주면 자연스럽게 네트워크가 확장됩니다.',
        scenario: '새로운 사람 만날 때',
      },
      {
        strength: '영감 제공',
        tip: '팀원의 성장 가능성을 언급하세요. "이걸 할 수 있을 것 같아"라는 말이 동기를 부여합니다.',
        scenario: '팀 피드백 시',
      },
      {
        strength: '관계 구축',
        tip: '1:1 대화 시간을 정기적으로 가지세요. 깊은 대화가 신뢰 관계를 만듭니다.',
        scenario: '팀 관계 강화 시',
      },
    ],
  },

  // ========================================
  // 9. RESILIENT_INFLUENCER (흔들리지 않는 대변인)
  // Influence + Resilience
  // ========================================
  {
    personaType: PersonaType.RESILIENT_INFLUENCER,
    tips: [
      {
        strength: '회복력',
        tip: '실패 후 "무엇을 배웠는가"에 집중하세요. 그 학습이 다음 성공의 기반이 됩니다.',
        scenario: '실패 경험 후',
      },
      {
        strength: '영향력',
        tip: '어려운 상황에서도 차분하게 메시지를 전달하세요. 위기 속 침착함이 신뢰를 얻습니다.',
        scenario: '위기 커뮤니케이션 시',
      },
      {
        strength: '자신감',
        tip: '모르는 것은 인정하되, 해결하겠다는 의지를 보여주세요. 솔직함과 추진력의 조합이 설득력입니다.',
        scenario: '어려운 질문에 답할 때',
      },
    ],
  },

  // ========================================
  // 10. SUPPORTIVE_BACKBONE (회복탄력적 중재자)
  // Collaboration + Resilience
  // ========================================
  {
    personaType: PersonaType.SUPPORTIVE_BACKBONE,
    tips: [
      {
        strength: '지지',
        tip: '팀원의 노력을 구체적으로 인정하세요. "잘했어"보다 "이 부분이 좋았어"가 더 힘이 됩니다.',
        scenario: '팀원 피드백 시',
      },
      {
        strength: '포용',
        tip: '다른 의견을 "반대"가 아닌 "다른 관점"으로 받아들이세요. 다양성이 더 나은 답을 만듭니다.',
        scenario: '의견 충돌 시',
      },
      {
        strength: '위기관리',
        tip: '갈등 상황에서 양측의 이야기를 먼저 들으세요. 중립적 청취가 해결의 첫걸음입니다.',
        scenario: '팀 내 갈등 발생 시',
      },
    ],
  },
];
