import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { ReportContent } from '@/types/report';
import { BrandStrategy } from '@/types/brand';
import { ParsedResume } from '@/types/resume';

export interface ContentWriterInput {
  brandStrategy: BrandStrategy;
  resume: ParsedResume;
}

export class ContentWriterAgent extends BaseAgent<ContentWriterInput, ReportContent> {
  constructor() {
    super(
      'ContentWriterAgent',
      `퍼스널 브랜딩 카피라이터. 브랜드 전략 기반 JSON 반환:

{
  "executiveSummary": "강력한 자기소개 (2문장)",
  "brandStory": "브랜드 스토리 (여정, 가치관, 목표 / 2-3문단)",
  "strengthsSection": ["강점1", "강점2", "강점3"],
  "achievementsSection": ["성과1", "성과2"],
  "futureVision": "미래 비전 (1-2문단)",
  "callToAction": "협업/채용 CTA"
}

원칙: 사실 기반, 스토리텔링, 구체적 예시, 전문적·친근한 톤. 한글, 유효한 JSON 출력.`
    );
  }

  async process(
    input: ContentWriterInput,
    context: AgentContext
  ): Promise<AgentResult<ReportContent>> {
    try {
      const { brandStrategy, resume } = input;

      console.log(`[ContentWriter] Writing content for brand: ${brandStrategy.brandEssence}`);

      // 캐싱할 prefix: 브랜드 전략 (BrandStrategist의 출력, 여러 에이전트가 재사용)
      const cachePrefix = `== 브랜드 전략 ==
핵심 메시지: ${brandStrategy.brandEssence}
가치 제안: ${brandStrategy.uniqueValueProposition}
브랜드 성격: ${brandStrategy.brandPersonality.join(', ')}
핵심 메시지들:
${brandStrategy.keyMessages.map(m => `- ${m}`).join('\n')}`;

      // 동적으로 변하는 부분: 이력서 요약
      const userMessage = `
== 이력서 요약 ==
이름: ${resume.personalInfo.name}
요약: ${resume.summary}
주요 경력:
${resume.experiences.slice(0, 3).map(exp => `- ${exp.company} / ${exp.role}`).join('\n')}

주요 성과:
${resume.experiences.flatMap(exp => exp.achievements).slice(0, 5).join('\n')}

위 브랜드 전략과 이력서 정보를 바탕으로 매력적인 리포트 콘텐츠를 JSON 형식으로 작성해주세요.

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
