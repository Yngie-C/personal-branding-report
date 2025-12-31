import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { Keywords, BrandStrategy } from '@/types/brand';
import { ParsedResume } from '@/types/resume';

export interface KeywordExtractorInput {
  brandStrategy: BrandStrategy;
  resume: ParsedResume;
}

export class KeywordExtractorAgent extends BaseAgent<KeywordExtractorInput, Keywords> {
  constructor() {
    super(
      'KeywordExtractorAgent',
      `당신은 SEO 및 브랜딩용 키워드를 추출하는 전문가입니다.

역할:
- 이력서와 브랜드 전략에서 핵심 키워드 추출
- SEO에 효과적인 검색 용어 식별
- 소셜미디어용 해시태그 생성

출력 JSON:
{
  "primary": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "secondary": ["보조키워드1", "보조키워드2", ...],
  "hashtags": ["#태그1", "#태그2", ...],
  "searchTerms": ["검색용어1", "검색용어2", ...]
}`
    );
  }

  async process(
    input: KeywordExtractorInput,
    context: AgentContext
  ): Promise<AgentResult<Keywords>> {
    try {
      const { brandStrategy, resume } = input;

      const userMessage = `다음 정보에서 키워드를 추출해주세요:

브랜드: ${brandStrategy.brandEssence}
스킬: ${resume.skills.join(', ')}
역할: ${resume.experiences.map(e => e.role).join(', ')}

JSON 출력:`;

      const response = await this.callLLM(userMessage);
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch?.[1] || jsonMatch?.[0] || '{}';
      const parsed: Keywords = JSON.parse(jsonStr);

      return this.success(parsed);
    } catch (error: any) {
      return this.failure(`키워드 추출 실패: ${error.message}`);
    }
  }
}
