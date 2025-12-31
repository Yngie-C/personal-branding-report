import { TestFileData, TestSurveyData, TestQuestionnaireData } from '@/types/e2e-test';

/**
 * E2E 테스트용 샘플 데이터
 */

export function getTestFixtures() {
  return {
    resumeFile: getTestResumeFile(),
    portfolioFile: getTestPortfolioFile(),
    surveyData: getTestSurveyData(),
    questionnaireData: getTestQuestionnaireData(),
  };
}

export function getTestResumeFile(): TestFileData {
  const content = `
김철수 (Kim Chulsoo)
이메일: chulsoo.kim@example.com
전화: 010-1234-5678
GitHub: github.com/chulsoo-kim
LinkedIn: linkedin.com/in/chulsoo-kim

경력 사항
---
시니어 프로덕트 매니저 | 테크스타트업 주식회사 | 2020.03 - 현재
- B2B SaaS 제품 기획 및 로드맵 수립
- 월간 활성 사용자 300% 증가 (3,000명 → 12,000명)
- 크로스펑셔널 팀 리드 (개발 5명, 디자인 2명, 마케팅 3명)
- 데이터 기반 의사결정 프로세스 구축

프로덕트 매니저 | 글로벌테크 코리아 | 2017.06 - 2020.02
- 모바일 앱 신규 기능 기획 및 출시 (15개 이상)
- A/B 테스팅을 통한 전환율 25% 개선
- 고객 인터뷰 및 사용성 테스트 주도 (월 20회 이상)

학력
---
KAIST | 경영공학 석사 | 2015 - 2017
서울대학교 | 산업공학 학사 | 2011 - 2015

기술 스택
---
- PM Tools: Jira, Figma, Amplitude, Mixpanel
- Data Analysis: SQL, Python, Excel
- Communication: Notion, Slack, Confluence

자격증
---
- Product Management Certificate (Stanford, 2019)
- Google Analytics Certified (2018)

언어
---
- 한국어 (원어민)
- 영어 (비즈니스 유창)
- 일본어 (중급)

수상 경력
---
- 올해의 PM 상 (테크스타트업, 2022)
- 혁신상 (글로벌테크 코리아, 2019)
`;

  return {
    filename: 'test-resume.txt',
    content: content.trim(),
    mimeType: 'text/plain',
  };
}

export function getTestPortfolioFile(): TestFileData {
  const content = `
프로덕트 포트폴리오 - 김철수
================================

프로젝트 1: B2B SaaS 대시보드 리뉴얼
---
기간: 2022.01 - 2022.06
역할: Lead PM

배경:
기존 대시보드의 복잡도가 높아 사용자 만족도가 낮았음 (NPS 15점)

목표:
- 사용자 경험 개선
- 핵심 메트릭 가시성 향상
- 모바일 반응형 지원

프로세스:
1. 사용자 리서치 (30명 인터뷰)
2. 정보 아키텍처 재설계
3. 프로토타입 제작 및 사용성 테스트
4. 단계적 출시 (Beta → GA)

성과:
- NPS 15점 → 62점 (4배 향상)
- 일일 활성 사용자 45% 증가
- 고객 이탈률 30% 감소

프로젝트 2: 실시간 협업 기능 개발
---
기간: 2021.03 - 2021.09
역할: Product Owner

배경:
원격 근무 증가로 협업 도구 수요 급증

목표:
- 실시간 문서 공동 편집 기능 구현
- 멀티플레이어 커서 및 댓글 기능
- 버전 히스토리 관리

기술 스택:
- WebSocket (Socket.io)
- Operational Transform
- React, TypeScript

성과:
- 출시 3개월 내 MAU 2배 증가
- 팀 플랜 전환율 40% 향상
- Tech Crunch 소개 기사 게재

프로젝트 3: 데이터 기반 추천 엔진
---
기간: 2020.06 - 2021.02
역할: PM

배경:
사용자들이 방대한 템플릿 중 적합한 것을 찾기 어려움

목표:
- AI 기반 맞춤형 템플릿 추천
- 사용 패턴 분석 및 자동 제안

접근 방법:
- 협업 필터링 알고리즘 적용
- 사용자 행동 데이터 수집 및 분석
- ML 모델 정확도 지속적 개선

성과:
- 템플릿 사용률 55% 증가
- 평균 세션 시간 20% 증가
- 사용자 만족도 4.2/5.0 → 4.7/5.0

수상:
- 2021 Product Innovation Award (사내)
`;

  return {
    filename: 'test-portfolio.txt',
    content: content.trim(),
    mimeType: 'text/plain',
  };
}

export function getTestSurveyData(): TestSurveyData {
  // 100개 질문에 대한 답변 (1-7 척도)
  // 혁신 사고: 높음 (평균 6)
  // 철저 실행: 매우 높음 (평균 6.5)
  // 대인 영향: 중간 (평균 5)
  // 협업 공감: 높음 (평균 6)
  // 상황 회복: 중간-높음 (평균 5.5)

  const answers: Record<number, number> = {};

  // 질문 1-20: 혁신 사고 (Innovation & Vision)
  for (let i = 1; i <= 20; i++) {
    answers[i] = Math.floor(Math.random() * 2) + 5; // 5-6
  }

  // 질문 21-40: 철저 실행 (Execution & Discipline)
  for (let i = 21; i <= 40; i++) {
    answers[i] = Math.floor(Math.random() * 2) + 6; // 6-7
  }

  // 질문 41-60: 대인 영향 (Influence & Impact)
  for (let i = 41; i <= 60; i++) {
    answers[i] = Math.floor(Math.random() * 2) + 4; // 4-5
  }

  // 질문 61-80: 협업 공감 (Collaboration & Synergy)
  for (let i = 61; i <= 80; i++) {
    answers[i] = Math.floor(Math.random() * 2) + 5; // 5-6
  }

  // 질문 81-100: 상황 회복 (Resilience & Adaptability)
  for (let i = 81; i <= 100; i++) {
    answers[i] = Math.floor(Math.random() * 2) + 5; // 5-6
  }

  return { answers };
}

export function getTestQuestionnaireData(): TestQuestionnaireData {
  return {
    answers: {
      q1: `제 가장 큰 성취는 B2B SaaS 제품의 사용자 만족도를 4배 향상시킨 것입니다.
           NPS 점수를 15점에서 62점으로 끌어올리면서 동시에 일일 활성 사용자를 45% 증가시켰습니다.
           이 과정에서 30명 이상의 사용자 인터뷰를 진행하고, 데이터 기반으로 의사결정하며,
           크로스펑셔널 팀을 리드한 경험이 가장 보람찼습니다.`,

      q2: `5년 후에는 글로벌 시장에서 인정받는 프로덕트 리더가 되고 싶습니다.
           현재 B2B SaaS 분야에서의 전문성을 더욱 깊게 발전시키고,
           여러 프로덕트를 성공적으로 론칭하며, 후배 PM들을 멘토링하는 역할을 하고 싶습니다.
           또한 데이터와 AI를 활용한 의사결정 프로세스를 조직 전반에 정착시키고 싶습니다.`,

      q3: `제 핵심 강점은 '데이터 기반 의사결정'과 '사용자 중심 사고'입니다.
           복잡한 데이터를 분석하여 인사이트를 도출하고, 이를 실행 가능한 전략으로 전환하는 능력이 뛰어납니다.
           동시에 사용자와의 직접적인 소통을 통해 진짜 문제를 파악하고,
           팀원들과 협업하여 최적의 솔루션을 찾아내는 것을 잘합니다.`,

      q4: `제 브랜드를 한 문장으로 표현하면 '데이터와 공감으로 혁신을 만드는 프로덕트 리더'입니다.
           숫자와 감성, 논리와 직관을 모두 활용하여 사용자에게 진정한 가치를 제공하는 제품을 만듭니다.`,

      q5: `저의 타겟 오디언스는 혁신적인 B2B 스타트업과 성장 중인 테크 기업입니다.
           데이터 기반 의사결정과 사용자 중심 제품 개발을 중요하게 생각하며,
           크로스펑셔널 협업과 빠른 실행력을 갖춘 조직과 함께 일하고 싶습니다.`,

      q6: `차별화 포인트는 '실행력'과 '전략적 사고'의 균형입니다.
           많은 PM들이 전략이나 실행 중 한쪽에 치우치는 반면,
           저는 장기 비전을 세우면서도 빠르게 실행하고 검증하는 능력을 갖추고 있습니다.
           또한 데이터 분석 역량이 뛰어나 SQL과 Python을 활용한 자체적인 분석이 가능합니다.`,

      q7: `제가 전하고 싶은 메시지는 '올바른 질문이 올바른 제품을 만든다'입니다.
           사용자의 말을 경청하되, 표면적인 요구사항에 머무르지 않고
           진짜 문제를 찾아내는 것이 PM의 핵심 역량이라고 믿습니다.
           데이터와 직관, 분석과 공감을 모두 활용하여 최고의 제품을 만들어갑니다.`,
    },
  };
}

/**
 * 최소한의 테스트 데이터 (빠른 테스트용)
 */
export function getMinimalTestFixtures() {
  return {
    resumeFile: {
      filename: 'minimal-resume.txt',
      content: '김철수\n프로덕트 매니저\n5년 경력\nB2B SaaS 전문',
      mimeType: 'text/plain',
    },
    surveyData: {
      answers: Object.fromEntries(
        Array.from({ length: 100 }, (_, i) => [i + 1, 5])
      ),
    },
    questionnaireData: {
      answers: {
        q1: '테스트 답변 1',
        q2: '테스트 답변 2',
        q3: '테스트 답변 3',
      },
    },
  };
}
