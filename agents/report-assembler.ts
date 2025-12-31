import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { AssembledReport, ReportContent } from '@/types/report';

export interface ReportAssemblerInput {
  content: ReportContent;
}

export class ReportAssemblerAgent extends BaseAgent<ReportAssemblerInput, AssembledReport> {
  constructor() {
    super('ReportAssemblerAgent', 'Report assembler for branding reports');
  }

  async process(
    input: ReportAssemblerInput,
    context: AgentContext
  ): Promise<AgentResult<AssembledReport>> {
    try {
      const { content } = input;

      const report: AssembledReport = {
        pages: [
          {
            pageNumber: 1,
            sections: [
              { type: 'header', content: '퍼스널 브랜딩 리포트', style: {} },
              { type: 'text', content: content.executiveSummary, style: {} },
            ],
          },
          {
            pageNumber: 2,
            sections: [
              { type: 'header', content: '브랜드 스토리', style: {} },
              { type: 'text', content: content.brandStory, style: {} },
            ],
          },
          {
            pageNumber: 3,
            sections: [
              { type: 'header', content: '강점', style: {} },
              { type: 'list', content: content.strengthsSection, style: {} },
            ],
          },
        ],
        metadata: {
          title: '퍼스널 브랜딩 리포트',
          author: 'AI Generated',
          createdAt: new Date(),
        },
      };

      return this.success(report);
    } catch (error: any) {
      return this.failure(`리포트 조립 실패: ${error.message}`);
    }
  }
}
