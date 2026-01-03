import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { ReportContent } from '@/types/report';
import { BrandStrategy } from '@/types/brand';
import { ParsedResume } from '@/types/resume';
import { PortfolioAnalysis } from '@/types/portfolio';
import { BriefAnalysis } from '@/types/survey';

export interface ContentWriterInput {
  brandStrategy: BrandStrategy;
  resume: ParsedResume;
  portfolio?: PortfolioAnalysis;
  questionAnswers?: Record<string, string>;
  briefAnalysis?: BriefAnalysis;
}

export class ContentWriterAgent extends BaseAgent<ContentWriterInput, ReportContent> {
  constructor() {
    super(
      'ContentWriterAgent',
      `당신은 프로페셔널 퍼스널 브랜딩 카피라이터입니다.

== 출력 형식 (JSON) ==
{
  "executiveSummary": "강력한 자기소개 (3-4문장, 150-200자)",
  "brandStory": "브랜드 스토리 (4-5문단, 800-1200자)",
  "strengthsSection": ["강점1 (각 50-80자)", "강점2", ..., "강점7"],
  "achievementsSection": ["성과1 (각 60-100자)", ..., "성과8"],
  "futureVision": "미래 비전 (2-3문단, 400-600자)",
  "callToAction": "협업/채용 CTA (2-3문장, 100-150자)"
}

== 작성 원칙 ==
1. **executiveSummary (3-4문장)**:
   - PSA 페르소나 타이틀 반영
   - 가장 임팩트 있는 성과 1개 수치 포함
   - 브랜드 본질(brandEssence) 자연스럽게 녹이기

2. **brandStory (4-5문단)**:
   - 1문단: 커리어 시작점과 전환점 (Soul Questions "에너지 순간" 활용)
   - 2문단: 핵심 가치관 형성 계기 (Soul Questions "가치 지킨 경험" 활용)
   - 3문단: 대표 프로젝트 스토리 (Expertise Questions 활용)
   - 4문단: 일하는 방식과 철학 (PSA 강점 연결)
   - 5문단: 현재와 지향점 (Edge Questions 활용)

3. **strengthsSection (5-7개, 각 50-80자)**:
   - PSA 상위 카테고리 2개를 기반으로 구체적 강점 설명
   - 각 강점에 구체적 프로젝트 사례나 수치 포함
   - "단순 형용사 나열 금지" → 스토리 기반 설명
   예시: "혁신 사고 - A 프로젝트에서 기존 프로세스를 재설계하여 효율 30% 향상"

4. **achievementsSection (5-8개, 각 60-100자)**:
   - 이력서의 achievements 배열에서 가장 임팩트 있는 성과 선별
   - 수치가 있는 성과 우선 (매출, 사용자, 효율, 시간 등)
   - STAR 형식 (Situation-Task-Action-Result) 적용
   - Expertise Questions "보이지 않는 기여" 답변도 포함

5. **futureVision (2-3문단)**:
   - 1문단: Edge Question "이것만큼은 최고" 답변 기반 차별화 포인트
   - 2문단: Edge Question "5년 뒤 브랜드" 답변 기반 비전
   - 3문단: 업계 기여 방향 및 목표

6. **callToAction**:
   - 구체적 협업 분야 명시
   - 연락 방법 및 기대 효과 포함

== 데이터 활용 우선순위 ==
1. Enhanced Questions 답변 (9개) - 가장 개인적이고 깊이 있는 인사이트
2. PSA 분석 결과 - 객관적 강점 데이터
3. 이력서 achievements - 검증된 성과
4. 브랜드 전략 - 일관성 유지

한글 작성, 유효한 JSON만 출력, 전문적이면서도 진정성 있는 톤 유지.`
    );
  }

  async process(
    input: ContentWriterInput,
    context: AgentContext
  ): Promise<AgentResult<ReportContent>> {
    try {
      const { brandStrategy, resume, portfolio, questionAnswers, briefAnalysis } = input;

      console.log(`[ContentWriter] Writing content for brand: ${brandStrategy.brandEssence}`);

      // 캐싱할 prefix: 브랜드 전략 (BrandStrategist의 출력, 여러 에이전트가 재사용)
      const cachePrefix = `== 브랜드 전략 ==
핵심 메시지: ${brandStrategy.brandEssence}
가치 제안: ${brandStrategy.uniqueValueProposition}
브랜드 성격: ${brandStrategy.brandPersonality.join(', ')}
핵심 메시지들:
${brandStrategy.keyMessages.map(m => `- ${m}`).join('\n')}
${briefAnalysis ? `
== PSA 분석 ==
페르소나: ${briefAnalysis.persona.title}
페르소나 설명: ${briefAnalysis.persona.description}
강점 분석: ${briefAnalysis.strengthsSummary}
` : ''}`;

      // 동적으로 변하는 부분: 이력서 요약
      const userMessage = `
== 이력서 요약 ==
이름: ${resume.personalInfo.name}
요약: ${resume.summary}
주요 경력:
${resume.experiences.slice(0, 3).map(exp => `- ${exp.company} / ${exp.role}`).join('\n')}

주요 성과 (전체):
${resume.experiences.flatMap(exp => exp.achievements).slice(0, 10).join('\n')}

${portfolio ? `
== 포트폴리오 ==
프로젝트: ${portfolio.projects.map(p => `- ${p.name}: ${p.description}${p.impact ? ` (임팩트: ${p.impact})` : ''}`).join('\n')}
독특한 포인트: ${portfolio.uniquePoints.join(', ')}
` : ''}

${questionAnswers ? `
== Enhanced Questions 답변 ==
${Object.entries(questionAnswers).map(([key, value]) => `${key}: ${value}`).join('\n')}
` : ''}

위 모든 정보를 종합하여 풍부하고 구체적인 리포트 콘텐츠를 JSON 형식으로 작성해주세요.
특히 Enhanced Questions 답변을 brandStory와 futureVision에 적극 활용하세요.

JSON 출력:`;

      const response = await this.callLLM(userMessage, [], {
        cacheSystem: true,        // System prompt 캐싱
        cacheUserPrefix: cachePrefix  // 브랜드 전략 캐싱
      });

      // JSON 추출
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from LLM');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed: ReportContent = JSON.parse(jsonStr);

      // 검증
      if (!parsed.executiveSummary || !parsed.brandStory) {
        return this.failure('콘텐츠의 필수 요소가 누락되었습니다.');
      }

      console.log(`[ContentWriter] Content created successfully`);

      return this.success(parsed, {
        executiveSummaryLength: parsed.executiveSummary.length,
        brandStoryLength: parsed.brandStory.length,
      });
    } catch (error: any) {
      console.error(`[ContentWriter] Error:`, error);
      return this.failure(`콘텐츠 작성 실패: ${error.message}`);
    }
  }
}
