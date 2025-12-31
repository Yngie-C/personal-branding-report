import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { PortfolioAnalysis } from '@/types/portfolio';

export interface PortfolioAnalyzerInput {
  fileUrl?: string;
  fileContent?: string;
  websiteUrl?: string;
}

export class PortfolioAnalyzerAgent extends BaseAgent<PortfolioAnalyzerInput, PortfolioAnalysis> {
  constructor() {
    super(
      'PortfolioAnalyzerAgent',
      `당신은 포트폴리오를 분석하고 인사이트를 도출하는 전문가입니다.

역할:
- 포트폴리오에서 프로젝트, 작업물, 성과를 분석
- 디자인 스타일과 시각적 방향성 파악
- 강점과 독특한 포인트 식별
- 사용된 기술 스택과 도구 추출

출력 형식:
JSON 형식으로 다음 구조를 따라야 합니다:
{
  "projects": [
    {
      "name": "프로젝트명",
      "description": "프로젝트 설명",
      "technologies": ["기술1", "기술2"],
      "impact": "프로젝트의 영향이나 결과"
    }
  ],
  "designStyle": "전반적인 디자인 스타일 설명 (예: 미니멀, 모던, 컬러풀 등)",
  "strengths": ["강점1", "강점2", "강점3"],
  "uniquePoints": ["독특한 점1", "독특한 점2"]
}

중요:
- 반드시 유효한 JSON만 출력
- 포트폴리오가 없으면 빈 배열과 기본값 사용
- 한글과 영어 모두 처리 가능`
    );
  }

  async process(
    input: PortfolioAnalyzerInput,
    context: AgentContext
  ): Promise<AgentResult<PortfolioAnalysis>> {
    try {
      const { fileContent, websiteUrl } = input;

      if (!fileContent && !websiteUrl) {
        // 포트폴리오가 없는 경우 기본값 반환
        return this.success({
          projects: [],
          designStyle: 'not available',
          strengths: [],
          uniquePoints: [],
        }, { hasPortfolio: false });
      }

      console.log(`[PortfolioAnalyzer] Analyzing portfolio...`);

      let userMessage = '';
      if (fileContent) {
        userMessage = `다음 포트폴리오 내용을 분석하여 JSON 형식으로 변환해주세요:

${fileContent}

JSON 출력:`;
      } else if (websiteUrl) {
        userMessage = `포트폴리오 URL이 제공되었습니다: ${websiteUrl}

URL을 기반으로 예상되는 포트폴리오 분석 결과를 JSON 형식으로 제공해주세요:

JSON 출력:`;
      }

      const response = await this.callLLM(userMessage);

      // JSON 추출
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from LLM');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed: PortfolioAnalysis = JSON.parse(jsonStr);

      console.log(`[PortfolioAnalyzer] Successfully analyzed portfolio: ${parsed.projects.length} projects found`);

      return this.success(parsed, {
        projectCount: parsed.projects?.length || 0,
        hasPortfolio: true,
      });
    } catch (error: any) {
      console.error(`[PortfolioAnalyzer] Error:`, error);
      return this.failure(`포트폴리오 분석 실패: ${error.message}`);
    }
  }
}
