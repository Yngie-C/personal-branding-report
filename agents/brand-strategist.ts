import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { BrandStrategy } from '@/types/brand';
import { ParsedResume } from '@/types/resume';
import { PortfolioAnalysis } from '@/types/portfolio';

export interface BrandStrategistInput {
  resume: ParsedResume;
  portfolio: PortfolioAnalysis;
  questionAnswers: Record<string, string>;
}

export class BrandStrategistAgent extends BaseAgent<BrandStrategistInput, BrandStrategy> {
  constructor() {
    super(
      'BrandStrategistAgent',
      `퍼스널 브랜딩 전략가. 이력서/포트폴리오/답변 분석 후 JSON 반환:

{
  "brandEssence": "핵심 메시지 (10자)",
  "uniqueValueProposition": "차별화 가치 (50자)",
  "targetAudience": ["타겟1", "타겟2", "타겟3"],
  "brandPersonality": ["성격1", "성격2", "성격3", "성격4"],
  "keyMessages": ["메시지1", "메시지2", "메시지3"],
  "visualDirection": {
    "colorPalette": ["#색상1", "#색상2", "#색상3", "#색상4"],
    "mood": "modern|professional|creative",
    "style": "minimal|corporate|creative|elegant"
  }
}

원칙: 실제 경험 기반, 차별성 강조, 구체적 전략. 한글 작성, 유효한 JSON만 출력.`
    );
  }

  async process(
    input: BrandStrategistInput,
    context: AgentContext
  ): Promise<AgentResult<BrandStrategy>> {
    try {
      const { resume, portfolio, questionAnswers } = input;

      console.log(`[BrandStrategist] Creating brand strategy for: ${resume.personalInfo.name}`);

      // 캐싱할 prefix: 이력서 + 포트폴리오 (자주 재사용되는 컨텍스트)
      const cachePrefix = `== 이력서 정보 ==
이름: ${resume.personalInfo.name}
요약: ${resume.summary}
경력:
${resume.experiences.map(exp => `- ${exp.company} / ${exp.role} (${exp.duration})
  성과: ${exp.achievements.join(', ')}`).join('\n')}

스킬: ${resume.skills.join(', ')}

== 포트폴리오 ==
프로젝트: ${portfolio.projects.length}개
${portfolio.projects.map(p => `- ${p.name}: ${p.description}`).join('\n')}

강점: ${portfolio.strengths.join(', ')}
독특한 포인트: ${portfolio.uniquePoints.join(', ')}
디자인 스타일: ${portfolio.designStyle}`;

      // 동적으로 변하는 부분: 질문 답변
      const userMessage = `
== 질문 답변 ==
${Object.entries(questionAnswers).map(([key, value]) => `${key}: ${value}`).join('\n')}

위 정보를 종합하여 퍼스널 브랜딩 전략을 수립해주세요.

JSON 출력:`;

      const response = await this.callLLM(userMessage, [], {
        cacheSystem: true,        // System prompt 캐싱
        cacheUserPrefix: cachePrefix  // 이력서+포트폴리오 캐싱
      });

      // JSON 추출
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from LLM');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed: BrandStrategy = JSON.parse(jsonStr);

      // 검증
      if (!parsed.brandEssence || !parsed.uniqueValueProposition) {
        return this.failure('브랜드 전략의 필수 요소가 누락되었습니다.');
      }

      console.log(`[BrandStrategist] Brand essence: ${parsed.brandEssence}`);

      return this.success(parsed, {
        targetAudienceCount: parsed.targetAudience?.length || 0,
        keyMessagesCount: parsed.keyMessages?.length || 0,
      });
    } catch (error: any) {
      console.error(`[BrandStrategist] Error:`, error);
      return this.failure(`브랜드 전략 수립 실패: ${error.message}`);
    }
  }
}
