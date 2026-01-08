import { PersonaType } from '@/types/survey';
import { TemplateVariant } from '../template-selector';

/**
 * 브랜딩 메시지 인터페이스
 */
export interface BrandingMessages {
  selfIntro: string;         // 한 줄 자기소개 (30-50자)
  linkedinHeadline: string;  // LinkedIn 헤드라인 (60-80자)
  elevatorPitch: string;     // 2문장 소개 (80-120자)
  hashtags: string[];        // 3-5개
}

export interface BrandingMessageTemplate extends BrandingMessages {
  personaType: PersonaType;
  variant: TemplateVariant;
}

/**
 * 30개 브랜딩 메시지 템플릿 (10 페르소나 × 3 variants)
 *
 * Variant 설명:
 * - balanced: 균형잡힌 톤, 전반적으로 강점이 고른 경우
 * - spiked: 뾰족한 톤, 특정 강점이 두드러지는 경우
 * - mixed: 보통 톤, 일반적인 경우
 */
export const BRANDING_MESSAGE_TEMPLATES: BrandingMessageTemplate[] = [
  // ========================================
  // 1. ARCHITECT (전략적 설계자)
  // ========================================
  {
    personaType: PersonaType.ARCHITECT,
    variant: 'balanced',
    selfIntro: '아이디어를 시스템으로 만드는 전략 실행가',
    linkedinHeadline: '전략적 설계자 | 비전을 현실로 만드는 시스템 빌더',
    elevatorPitch: '저는 새로운 아이디어를 실행 가능한 시스템으로 설계합니다. 전략적 사고와 체계적 실행력으로 조직의 목표를 현실로 만듭니다.',
    hashtags: ['전략실행', '시스템설계', '혁신실현', '프로젝트리더십', '프로세스혁신'],
  },
  {
    personaType: PersonaType.ARCHITECT,
    variant: 'spiked',
    selfIntro: '복잡한 것을 단순하게, 불가능을 가능하게',
    linkedinHeadline: '전략적 설계자 | 비전에서 시스템까지 End-to-End 설계',
    elevatorPitch: '다른 사람들이 "복잡하다"고 말할 때, 저는 구조를 봅니다. 혁신적 아이디어를 체계적 시스템으로 전환해 실제 성과를 만들어냅니다.',
    hashtags: ['시스템아키텍트', '전략기획', '혁신설계', '복잡성해결'],
  },
  {
    personaType: PersonaType.ARCHITECT,
    variant: 'mixed',
    selfIntro: '전략과 실행을 연결하는 기획자',
    linkedinHeadline: '전략적 설계자 | 아이디어를 실행으로 연결합니다',
    elevatorPitch: '비전을 구체적인 실행 계획으로 전환하는 것이 제 역할입니다. 체계적인 접근으로 프로젝트의 성공 확률을 높입니다.',
    hashtags: ['전략기획', '실행력', '프로젝트관리', '시스템사고'],
  },

  // ========================================
  // 2. DISRUPTOR (시장 파괴자)
  // ========================================
  {
    personaType: PersonaType.DISRUPTOR,
    variant: 'balanced',
    selfIntro: '시장의 틀을 바꾸는 변화 주도자',
    linkedinHeadline: '시장 파괴자 | 새로운 관점으로 산업의 룰을 재정의합니다',
    elevatorPitch: '기존의 방식에 질문을 던지고 새로운 패러다임을 제시합니다. 변화를 이끌고 사람들을 설득해 혁신을 현실로 만듭니다.',
    hashtags: ['혁신가', '변화주도', '시장개척', '비전리더십', '디스럽터'],
  },
  {
    personaType: PersonaType.DISRUPTOR,
    variant: 'spiked',
    selfIntro: '불가능이라는 말이 싫은 혁신가',
    linkedinHeadline: '시장 파괴자 | 업계의 "불가능"을 "당연"으로 바꿉니다',
    elevatorPitch: '"원래 그렇게 하는 거야"라는 말을 듣지 않습니다. 시장의 관성을 깨고 새로운 표준을 만드는 것이 제가 하는 일입니다.',
    hashtags: ['게임체인저', '혁신주도', '파괴적혁신', '트렌드세터'],
  },
  {
    personaType: PersonaType.DISRUPTOR,
    variant: 'mixed',
    selfIntro: '새로운 관점을 전달하는 커뮤니케이터',
    linkedinHeadline: '시장 파괴자 | 혁신적 아이디어를 설득력 있게 전달합니다',
    elevatorPitch: '새로운 아이디어를 발굴하고, 이를 효과적으로 전달해 변화를 이끕니다. 시장의 흐름을 읽고 기회를 만듭니다.',
    hashtags: ['혁신기획', '영향력', '변화관리', '설득력'],
  },

  // ========================================
  // 3. CREATIVE_CATALYST (창의적 촉매)
  // ========================================
  {
    personaType: PersonaType.CREATIVE_CATALYST,
    variant: 'balanced',
    selfIntro: '팀의 아이디어를 폭발시키는 촉매',
    linkedinHeadline: '창의적 촉매 | 집단지성을 활용해 최고의 답을 찾습니다',
    elevatorPitch: '혼자보다 함께가 더 좋은 답을 만든다고 믿습니다. 팀의 다양한 관점을 연결해 혁신적인 해결책을 이끌어냅니다.',
    hashtags: ['창의성', '팀시너지', '협업혁신', '브레인스토밍', '집단지성'],
  },
  {
    personaType: PersonaType.CREATIVE_CATALYST,
    variant: 'spiked',
    selfIntro: '평범한 팀을 창의적 팀으로 바꾸는 사람',
    linkedinHeadline: '창의적 촉매 | 팀의 숨겨진 창의성을 끌어냅니다',
    elevatorPitch: '저와 함께하면 회의가 달라집니다. 모든 팀원의 아이디어를 끌어내고 연결해서 아무도 예상 못한 답을 만들어냅니다.',
    hashtags: ['창의적문제해결', '아이디어촉진', '팀빌딩', '브레이크스루'],
  },
  {
    personaType: PersonaType.CREATIVE_CATALYST,
    variant: 'mixed',
    selfIntro: '아이디어를 연결하고 발전시키는 기획자',
    linkedinHeadline: '창의적 촉매 | 협업을 통해 혁신적 결과를 만듭니다',
    elevatorPitch: '다양한 의견을 종합하고 발전시켜 더 나은 해결책을 찾습니다. 팀의 창의성을 이끌어내는 것이 제 강점입니다.',
    hashtags: ['협업', '창의력', '아이디어기획', '팀워크'],
  },

  // ========================================
  // 4. ADAPTIVE_PIONEER (적응형 선구자)
  // ========================================
  {
    personaType: PersonaType.ADAPTIVE_PIONEER,
    variant: 'balanced',
    selfIntro: '불확실성 속에서 길을 찾는 탐험가',
    linkedinHeadline: '적응형 선구자 | 변화를 기회로 만드는 혁신가',
    elevatorPitch: '변화를 두려워하지 않습니다. 불확실한 환경에서 빠르게 학습하고 적응하며, 새로운 기회를 만들어냅니다.',
    hashtags: ['변화적응', '혁신탐색', '애자일마인드', '선구자', '기회포착'],
  },
  {
    personaType: PersonaType.ADAPTIVE_PIONEER,
    variant: 'spiked',
    selfIntro: '위기를 기회로, 변화를 성장으로',
    linkedinHeadline: '적응형 선구자 | 다른 사람이 멈출 때 앞으로 나아갑니다',
    elevatorPitch: '위기 상황에서 저의 진가가 발휘됩니다. 빠른 적응력과 혁신적 사고로 남들이 보지 못하는 기회를 포착합니다.',
    hashtags: ['위기극복', '기회창출', '변화선도', '레질리언스'],
  },
  {
    personaType: PersonaType.ADAPTIVE_PIONEER,
    variant: 'mixed',
    selfIntro: '새로운 시도를 두려워하지 않는 도전자',
    linkedinHeadline: '적응형 선구자 | 변화에 유연하게 대응합니다',
    elevatorPitch: '새로운 환경에서 빠르게 적응하고, 혁신적인 방법을 시도합니다. 변화를 성장의 기회로 만듭니다.',
    hashtags: ['유연성', '도전정신', '적응력', '혁신시도'],
  },

  // ========================================
  // 5. AUTHORITATIVE_LEADER (퍼포먼스 드라이버)
  // ========================================
  {
    personaType: PersonaType.AUTHORITATIVE_LEADER,
    variant: 'balanced',
    selfIntro: '결과로 증명하는 성과 중심 리더',
    linkedinHeadline: '퍼포먼스 드라이버 | 목표를 설정하고 반드시 달성합니다',
    elevatorPitch: '명확한 목표와 체계적 실행으로 팀을 이끕니다. 말보다 성과로 신뢰를 쌓고, 조직의 목표를 현실로 만듭니다.',
    hashtags: ['성과주도', '리더십', '목표달성', '실행력', 'KPI관리'],
  },
  {
    personaType: PersonaType.AUTHORITATIVE_LEADER,
    variant: 'spiked',
    selfIntro: '목표를 말하지 않고 달성합니다',
    linkedinHeadline: '퍼포먼스 드라이버 | 압도적인 성과로 스스로를 증명합니다',
    elevatorPitch: '저는 숫자로 이야기합니다. 목표를 설정하면 반드시 달성하고, 그 과정에서 팀의 역량까지 끌어올립니다.',
    hashtags: ['성과창출', '실적주도', '목표초과달성', '하이퍼포머'],
  },
  {
    personaType: PersonaType.AUTHORITATIVE_LEADER,
    variant: 'mixed',
    selfIntro: '목표 달성에 집중하는 추진력 있는 리더',
    linkedinHeadline: '퍼포먼스 드라이버 | 실행력으로 성과를 만듭니다',
    elevatorPitch: '명확한 방향을 제시하고 팀과 함께 목표를 달성합니다. 체계적인 관리와 추진력으로 결과를 만들어냅니다.',
    hashtags: ['목표관리', '팀리더십', '성과관리', '추진력'],
  },

  // ========================================
  // 6. THE_ANCHOR (신뢰의 중추)
  // ========================================
  {
    personaType: PersonaType.THE_ANCHOR,
    variant: 'balanced',
    selfIntro: '팀의 안정과 신뢰를 만드는 든든한 중심',
    linkedinHeadline: '신뢰의 중추 | 일관된 품질과 협업으로 조직을 지탱합니다',
    elevatorPitch: '맡은 일은 반드시 약속한 품질로 완수합니다. 안정적인 실행력과 협업 능력으로 팀에 신뢰를 제공합니다.',
    hashtags: ['신뢰', '협업', '안정성', '팀서포트', '품질관리'],
  },
  {
    personaType: PersonaType.THE_ANCHOR,
    variant: 'spiked',
    selfIntro: '흔들릴 때 더 단단해지는 팀의 닻',
    linkedinHeadline: '신뢰의 중추 | 팀이 가장 힘들 때 빛나는 서포터',
    elevatorPitch: '화려한 스포트라이트보다 팀의 성공을 만드는 든든한 기반이 되고 싶습니다. 묵묵히 일하고, 결과로 증명합니다.',
    hashtags: ['팀앵커', '신뢰구축', '조직안정', '서포터십'],
  },
  {
    personaType: PersonaType.THE_ANCHOR,
    variant: 'mixed',
    selfIntro: '팀과 함께 성장하는 협업 전문가',
    linkedinHeadline: '신뢰의 중추 | 체계적 실행과 팀워크로 기여합니다',
    elevatorPitch: '팀원들과 협력하여 목표를 달성합니다. 안정적인 업무 처리와 신뢰 관계 구축이 제 강점입니다.',
    hashtags: ['팀워크', '안정성', '협업', '신뢰관계'],
  },

  // ========================================
  // 7. STEADY_ACHIEVER (강철의 완결자)
  // ========================================
  {
    personaType: PersonaType.STEADY_ACHIEVER,
    variant: 'balanced',
    selfIntro: '시작한 일은 반드시 끝내는 완결자',
    linkedinHeadline: '강철의 완결자 | 어떤 역경에도 약속한 결과를 가져옵니다',
    elevatorPitch: '맡은 일은 반드시 완수합니다. 끈기와 책임감으로 어려운 상황에서도 흔들리지 않고 목표를 달성합니다.',
    hashtags: ['완결력', '책임감', '끈기', '신뢰', '목표달성'],
  },
  {
    personaType: PersonaType.STEADY_ACHIEVER,
    variant: 'spiked',
    selfIntro: '포기라는 단어를 모르는 완수자',
    linkedinHeadline: '강철의 완결자 | 불가능해 보여도 끝내는 사람입니다',
    elevatorPitch: '남들이 포기할 때 저는 방법을 찾습니다. 어떤 난관도 끈기와 집중력으로 돌파하고 반드시 결과를 만들어냅니다.',
    hashtags: ['불굴의의지', '완수력', '난관돌파', '끈기왕'],
  },
  {
    personaType: PersonaType.STEADY_ACHIEVER,
    variant: 'mixed',
    selfIntro: '꾸준함으로 목표를 달성하는 실행가',
    linkedinHeadline: '강철의 완결자 | 끈기 있게 목표를 향해 나아갑니다',
    elevatorPitch: '하루하루 꾸준히 진전을 만들며 목표를 향해 나아갑니다. 책임감 있게 맡은 일을 완수합니다.',
    hashtags: ['꾸준함', '실행력', '책임감', '목표지향'],
  },

  // ========================================
  // 8. INSPIRATIONAL_CONNECTOR (공감형 리더)
  // ========================================
  {
    personaType: PersonaType.INSPIRATIONAL_CONNECTOR,
    variant: 'balanced',
    selfIntro: '사람을 연결하고 영감을 주는 리더',
    linkedinHeadline: '공감형 리더 | 관계를 통해 팀과 조직을 하나로 만듭니다',
    elevatorPitch: '사람의 마음을 이해하고 연결하는 것이 제 강점입니다. 진심 어린 소통과 협업으로 팀의 시너지를 만듭니다.',
    hashtags: ['공감리더십', '네트워킹', '관계구축', '팀빌딩', '영감'],
  },
  {
    personaType: PersonaType.INSPIRATIONAL_CONNECTOR,
    variant: 'spiked',
    selfIntro: '사람을 움직이는 힘, 공감',
    linkedinHeadline: '공감형 리더 | 마음을 얻어 함께 승리합니다',
    elevatorPitch: '저와 이야기하면 마음이 열립니다. 진정성 있는 관계를 바탕으로 팀원들의 잠재력을 끌어내고 함께 성장합니다.',
    hashtags: ['인플루언서', '공감능력', '관계의달인', '팀스피릿'],
  },
  {
    personaType: PersonaType.INSPIRATIONAL_CONNECTOR,
    variant: 'mixed',
    selfIntro: '소통으로 팀을 이끄는 협업 리더',
    linkedinHeadline: '공감형 리더 | 소통과 협업으로 성과를 만듭니다',
    elevatorPitch: '팀원들과의 열린 소통을 통해 협업을 촉진합니다. 관계를 기반으로 팀의 목표 달성을 이끕니다.',
    hashtags: ['소통', '협업리더', '관계형성', '팀매니지먼트'],
  },

  // ========================================
  // 9. RESILIENT_INFLUENCER (흔들리지 않는 대변인)
  // ========================================
  {
    personaType: PersonaType.RESILIENT_INFLUENCER,
    variant: 'balanced',
    selfIntro: '위기에서 더 빛나는 커뮤니케이터',
    linkedinHeadline: '흔들리지 않는 대변인 | 어려운 상황에서도 메시지를 전달합니다',
    elevatorPitch: '위기 상황에서 침착하게 메시지를 전달하는 것이 제 역할입니다. 역경 속에서도 흔들리지 않고 사람들을 이끕니다.',
    hashtags: ['위기커뮤니케이션', '회복력', '영향력', '침착함', '리더십'],
  },
  {
    personaType: PersonaType.RESILIENT_INFLUENCER,
    variant: 'spiked',
    selfIntro: '폭풍 속에서도 목소리를 내는 사람',
    linkedinHeadline: '흔들리지 않는 대변인 | 위기가 클수록 더 담대해집니다',
    elevatorPitch: '모두가 당황할 때 저는 마이크를 잡습니다. 위기 상황에서 명확한 메시지로 팀을 안정시키고 방향을 제시합니다.',
    hashtags: ['위기리더십', '담대함', '스포크스퍼슨', '침착한영향력'],
  },
  {
    personaType: PersonaType.RESILIENT_INFLUENCER,
    variant: 'mixed',
    selfIntro: '역경을 딛고 메시지를 전하는 전달자',
    linkedinHeadline: '흔들리지 않는 대변인 | 회복력과 영향력을 겸비합니다',
    elevatorPitch: '어려운 상황에서도 포기하지 않고 메시지를 전달합니다. 회복력을 바탕으로 지속적인 영향력을 발휘합니다.',
    hashtags: ['회복력', '영향력', '메시지전달', '지속성'],
  },

  // ========================================
  // 10. SUPPORTIVE_BACKBONE (회복탄력적 중재자)
  // ========================================
  {
    personaType: PersonaType.SUPPORTIVE_BACKBONE,
    variant: 'balanced',
    selfIntro: '팀을 지지하고 갈등을 풀어내는 중재자',
    linkedinHeadline: '회복탄력적 중재자 | 어려울 때 팀을 하나로 묶습니다',
    elevatorPitch: '팀이 힘들 때 옆에서 지지하고, 갈등이 생기면 중재합니다. 회복력과 포용력으로 팀의 결속을 만듭니다.',
    hashtags: ['중재자', '팀서포터', '회복력', '포용', '갈등해결'],
  },
  {
    personaType: PersonaType.SUPPORTIVE_BACKBONE,
    variant: 'spiked',
    selfIntro: '무너진 팀을 다시 일으켜 세우는 사람',
    linkedinHeadline: '회복탄력적 중재자 | 팀의 위기를 극복하고 관계를 재건합니다',
    elevatorPitch: '팀이 가장 어려울 때 저의 역할이 시작됩니다. 흩어진 마음을 모으고, 다시 함께 나아갈 수 있도록 돕습니다.',
    hashtags: ['팀재건', '갈등중재', '관계회복', '위기극복'],
  },
  {
    personaType: PersonaType.SUPPORTIVE_BACKBONE,
    variant: 'mixed',
    selfIntro: '팀의 화합을 이끄는 서포터',
    linkedinHeadline: '회복탄력적 중재자 | 협업과 회복력으로 팀을 지원합니다',
    elevatorPitch: '팀원들을 지지하고 협업을 촉진합니다. 어려운 상황에서도 긍정적인 분위기를 유지하며 팀의 화합을 이끕니다.',
    hashtags: ['팀화합', '서포터', '협업', '긍정에너지'],
  },
];
