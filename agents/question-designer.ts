import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { BrandingQuestions } from '@/types/brand';
import { ParsedResume } from '@/types/resume';
import { PortfolioAnalysis } from '@/types/portfolio';
import { BriefAnalysis, CategoryLabels } from '@/types/survey';
import {
  getSoulQuestionsByIds,
  getExpertisePoolForBrief,
  getEdgePoolForBrief,
  getVariantForBrief,
} from '@/lib/soul-questions/matching-logic';
import { SoulQuestion, QuestionTemplate } from '@/types/soul-questions';

export interface QuestionDesignerInput {
  resume: ParsedResume;
  portfolio: PortfolioAnalysis;
  briefAnalysis?: BriefAnalysis; // PSA 분석 결과 (선택적)
}

export class QuestionDesignerAgent extends BaseAgent<QuestionDesignerInput, BrandingQuestions[]> {
  constructor() {
    super(
      'QuestionDesignerAgent',
      `맞춤 질문 설계. 9문항 구조 (PSA 있음) 또는 15-20개 (PSA 없음):

**PSA 있음**: 고정 9문항 = Philosophy(3) + Expertise(4) + Edge(2)
- Philosophy: Soul Questions (사전 정의, 자동 선택)
- Expertise (4문항): PSA 강점과 구체적 경험 연결
- Edge (2문항): 차별화와 비전

Expertise 예시:
- PSA 1순위 강점이 결정적이었던 프로젝트 순간
- PSA 2순위 강점으로 예상치 못한 성과
- 수치로 표현되지 않는 보이지 않는 기여
- 낮은 지표를 보완하는 나만의 일하는 방식

Edge 예시:
- "이것만큼은 내가 최고다"라고 자부하는 포인트
- 5년 뒤 시장에서 어떤 이름으로 불리고 싶은가

**PSA 없음**: 15-20개 (5개 카테고리)
→ values, goals, uniqueness, story, vision

원칙: 구체적 프로젝트 언급, PSA 점수 반영. 한글, 유효 JSON. Expertise와 Edge만 생성 (Philosophy는 자동).`
    );
  }

  async process(
    input: QuestionDesignerInput,
    context: AgentContext
  ): Promise<AgentResult<BrandingQuestions[]>> {
    try {
      const { resume, portfolio, briefAnalysis } = input;

      console.log(`[QuestionDesigner] Generating questions for: ${resume.personalInfo.name}`);
      console.log(`[QuestionDesigner] PSA analysis provided: ${!!briefAnalysis}`);

      let userMessage: string;
      let requiredCategories: string[];
      let expectedQuestionCount: { min: number; max: number };

      if (briefAnalysis) {
        // PSA 기반 질문 생성 (고정 9개: Philosophy 3 + Expertise 4 + Edge 2)
        console.log(`[QuestionDesigner] Generating 9-question structure with Soul Questions`);

        // 1. Soul Questions 가져오기 (Philosophy 3개)
        const soulQuestionIds = briefAnalysis.selectedSoulQuestions || [];
        const soulQuestions = getSoulQuestionsByIds(soulQuestionIds);

        if (soulQuestions.length === 0) {
          console.warn('[QuestionDesigner] No Soul Questions selected, using fallback');
          // Fallback: PSA 없을 때의 로직으로 대체
          return this.generateFallbackQuestions(resume, portfolio, context);
        }

        console.log(`[QuestionDesigner] Soul Questions:`, soulQuestions.map(q => q.id));

        // 2. 매핑 테이블에서 Expertise/Edge 템플릿 풀 가져오기
        const variant = getVariantForBrief(briefAnalysis);
        const expertisePool = getExpertisePoolForBrief(briefAnalysis);
        const edgePool = getEdgePoolForBrief(briefAnalysis);

        console.log(`[QuestionDesigner] Variant: ${variant}`);
        console.log(`[QuestionDesigner] Expertise pool:`, expertisePool.map(t => t.id));
        console.log(`[QuestionDesigner] Edge pool:`, edgePool.map(t => t.id));

        // 3. LLM으로 Expertise(4) + Edge(2) 생성
        const topCategoriesStr = briefAnalysis.topCategories
          .map((c) => CategoryLabels[c])
          .join(', ');

        const categoryScoresStr = briefAnalysis.categoryScores
          .map(
            (s) =>
              `${s.rank}위. ${CategoryLabels[s.category]}: ${s.normalizedScore.toFixed(1)}점`
          )
          .join('\n');

        // 템플릿 기반 프롬프트 구성
        const expertiseTemplatesStr = expertisePool
          .map((t, i) => `   - 질문 ${i + 1}: ${t.promptTemplate.replace('{category1}', CategoryLabels[briefAnalysis.topCategories[0]]).replace('{category2}', CategoryLabels[briefAnalysis.topCategories[1]]).replace('{category_low}', CategoryLabels[briefAnalysis.categoryScores[4]?.category] || '낮은 지표')}`)
          .join('\n');

        const edgeTemplatesStr = edgePool
          .map((t, i) => `   - 질문 ${i + 1}: ${t.promptTemplate}`)
          .join('\n');

        userMessage = `다음 정보를 종합하여 **Expertise 4문항 + Edge 2문항**을 생성해주세요:

== PSA 분석 결과 ==
페르소나: ${briefAnalysis.persona.title}
슬로건: ${briefAnalysis.persona.tagline}
상위 강점: ${topCategoriesStr}
점수 패턴: ${variant} (balanced=균형형, spiked=뾰족형, mixed=혼합형)

카테고리별 점수:
${categoryScoresStr}

강점 분석:
${briefAnalysis.strengthsSummary}

== 이력서 정보 ==
이름: ${resume.personalInfo.name}
주요 프로젝트/성과:
${resume.experiences
  .slice(0, 3)
  .map((exp) => `- ${exp.company} / ${exp.role}: ${exp.achievements.slice(0, 2).join(', ')}`)
  .join('\n')}

== 포트폴리오 ==
프로젝트: ${portfolio.projects.slice(0, 3).map((p) => `- ${p.name}: ${p.description}`).join('\n')}

** 생성 요청 (템플릿 기반) **
1. **Expertise (4문항)**: PSA 강점과 구체적 경험을 연결
${expertiseTemplatesStr}

2. **Edge (2문항)**: 차별화와 비전
${edgeTemplatesStr}

** 각 질문 구성 요소 **
- question: 질문 텍스트 (템플릿을 참고하되 이력서/포트폴리오에 맞게 구체화)
- hint: 답변 힌트 (50자 내외)
- exampleAnswer: 예시 답변 (80-100자, "예: "로 시작)
- minCharacters: 50
- recommendedCharacters: 150
- aiGuidance: 답변 완료 시 격려 멘트

JSON 출력 형식:
[
  {
    "category": "expertise",
    "questions": [
      {"id": "exp_1", "question": "...", "hint": "...", "exampleAnswer": "예: ...", "minCharacters": 50, "recommendedCharacters": 150, "required": true, "aiGuidance": "훌륭한 답변입니다..."}
    ]
  },
  {
    "category": "edge",
    "questions": [
      {"id": "edge_1", "question": "...", "hint": "...", "exampleAnswer": "예: ...", "minCharacters": 50, "recommendedCharacters": 150, "required": true, "aiGuidance": "..."}
    ]
  }
]`;

        requiredCategories = ['expertise', 'edge'];
        expectedQuestionCount = { min: 6, max: 6 };  // Expertise 4 + Edge 2

        // 3. LLM 호출
        const response = await this.callLLM(userMessage);

        // JSON 추출
        const jsonMatch =
          response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('Invalid JSON response from LLM');
        }

        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const llmQuestions = JSON.parse(jsonStr);

        // 배열 검증
        if (!Array.isArray(llmQuestions)) {
          console.error('[QuestionDesigner] PSA - LLM returned non-array:', llmQuestions);
          throw new Error('LLM이 배열 형식의 질문을 반환하지 않았습니다.');
        }

        // 4. Soul Questions를 philosophy 카테고리로 추가 (Phase 2-1 필드 포함)
        const philosophyQuestions: BrandingQuestions = {
          category: 'philosophy',
          questions: soulQuestions.map(q => ({
            id: q.id,
            question: q.question,
            hint: q.hint || '',
            required: true,
            questionType: 'soul',
            aiGuidance: this.generateSoulQuestionGuidance(q),
            exampleAnswer: q.exampleAnswer,
            minCharacters: q.minCharacters || 50,
            recommendedCharacters: q.recommendedCharacters || 150,
          })),
        };

        // 5. questionType 필드 추가
        const expertiseQuestions = llmQuestions.find(q => q.category === 'expertise');
        const edgeQuestions = llmQuestions.find(q => q.category === 'edge');

        if (expertiseQuestions) {
          expertiseQuestions.questions.forEach((q: any) => { q.questionType = 'expertise'; });
        }
        if (edgeQuestions) {
          edgeQuestions.questions.forEach((q: any) => { q.questionType = 'edge'; });
        }

        // 6. 최종 결과 (Philosophy → Expertise → Edge 순서)
        const finalQuestions: BrandingQuestions[] = [
          philosophyQuestions,
          expertiseQuestions!,
          edgeQuestions!,
        ].filter(Boolean);

        const totalQuestions = finalQuestions.reduce((sum, cat) => sum + cat.questions.length, 0);

        console.log(
          `[QuestionDesigner] Generated ${totalQuestions} questions: Philosophy(3) + Expertise(4) + Edge(2)`
        );

        return this.success(finalQuestions, {
          totalQuestions,
          psaEnhanced: true,
          structure: 'soul-expertise-edge',
        });
      } else {
        // 기본 질문 생성 (15-20개, 5개 카테고리)
        userMessage = `다음 정보를 바탕으로 맞춤형 브랜딩 질문을 생성해주세요:

== 이력서 요약 ==
이름: ${resume.personalInfo.name}
경력: ${resume.experiences.length}개
주요 역할: ${resume.experiences.map((e) => e.role).join(', ')}
스킬: ${resume.skills.join(', ')}

== 포트폴리오 요약 ==
프로젝트: ${portfolio.projects.length}개
강점: ${portfolio.strengths.join(', ')}
디자인 스타일: ${portfolio.designStyle}

위 정보를 바탕으로 5개 카테고리(values, goals, uniqueness, story, vision)의 맞춤형 질문을 15-20개 생성해주세요.

JSON 출력:`;

        requiredCategories = ['values', 'goals', 'uniqueness', 'story', 'vision'];
        expectedQuestionCount = { min: 15, max: 20 };
      }

      const response = await this.callLLM(userMessage);

      // JSON 추출
      const jsonMatch =
        response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from LLM');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // 배열 검증
      if (!Array.isArray(parsed)) {
        console.error('[QuestionDesigner] LLM returned non-array:', parsed);
        throw new Error('LLM이 배열 형식의 질문을 반환하지 않았습니다.');
      }

      // 검증
      const foundCategories = parsed.map((p) => p.category);
      const missingCategories = requiredCategories.filter(
        (c) => !foundCategories.includes(c as any)
      );

      if (missingCategories.length > 0) {
        return this.failure(`Missing categories: ${missingCategories.join(', ')}`);
      }

      const totalQuestions = parsed.reduce((sum, cat) => sum + cat.questions.length, 0);

      // 질문 개수 검증
      if (
        totalQuestions < expectedQuestionCount.min ||
        totalQuestions > expectedQuestionCount.max
      ) {
        console.warn(
          `[QuestionDesigner] Question count out of range: ${totalQuestions} (expected ${expectedQuestionCount.min}-${expectedQuestionCount.max})`
        );
      }

      console.log(
        `[QuestionDesigner] Generated ${totalQuestions} questions across ${parsed.length} categories`
      );

      return this.success(parsed, {
        totalQuestions,
        categoriesCount: parsed.length,
        psaEnhanced: !!briefAnalysis,
      });
    } catch (error: any) {
      console.error(`[QuestionDesigner] Error:`, error);
      return this.failure(`질문 생성 실패: ${error.message}`);
    }
  }

  /**
   * Soul Question별 AI 가이드 멘트 생성
   */
  private generateSoulQuestionGuidance(question: SoulQuestion): string {
    const guidanceMap: Record<string, string> = {
      soul_identity_1: '훌륭한 답변입니다. 이 단어가 리포트의 브랜드 에센스가 될 것입니다.',
      soul_identity_2: '진실된 고백이네요. 이 차이가 당신의 차별화 포인트가 될 것입니다.',
      soul_identity_3: '에너지의 원천을 찾으셨네요. 이 순간이 브랜드 스토리의 핵심이 됩니다.',
      soul_value_1: '가치를 지킨 경험이 당신의 브랜드 신뢰를 만듭니다.',
      soul_value_2: '당신만의 성공 정의가 명확하네요. 이것이 비전의 출발점입니다.',
      soul_value_3: '명확한 기준은 강력한 브랜드를 만듭니다. 잘 정리하셨습니다.',
      soul_impact_1: '레거시에 대한 생각이 인상적입니다. 이것이 브랜드 메시지가 될 것입니다.',
      soul_impact_2: '당신이 믿는 변화의 힘이 분명하네요. 이것이 미션이 될 것입니다.',
      soul_impact_3: '평생의 질문을 찾으셨습니다. 이 질문이 브랜드의 여정을 안내할 것입니다.',
    };

    return guidanceMap[question.id] || '좋은 답변입니다. 다음 질문으로 넘어가세요.';
  }

  /**
   * Fallback: PSA 없을 때의 질문 생성 로직
   */
  private async generateFallbackQuestions(
    resume: ParsedResume,
    portfolio: PortfolioAnalysis,
    context: AgentContext
  ): Promise<AgentResult<BrandingQuestions[]>> {
    try {
      console.log('[QuestionDesigner] Using fallback question generation (15-20 questions)');

      const userMessage = `다음 정보를 바탕으로 맞춤형 브랜딩 질문을 생성해주세요:

== 이력서 요약 ==
이름: ${resume.personalInfo.name}
경력: ${resume.experiences.length}개
주요 역할: ${resume.experiences.map((e) => e.role).join(', ')}
스킬: ${resume.skills.join(', ')}

== 포트폴리오 요약 ==
프로젝트: ${portfolio.projects.length}개
강점: ${portfolio.strengths.join(', ')}
디자인 스타일: ${portfolio.designStyle}

위 정보를 바탕으로 5개 카테고리(values, goals, uniqueness, story, vision)의 맞춤형 질문을 15-20개 생성해주세요.

JSON 출력:`;

      const response = await this.callLLM(userMessage);

      // JSON 추출
      const jsonMatch =
        response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from LLM');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // 배열 검증
      if (!Array.isArray(parsed)) {
        console.error('[QuestionDesigner] Fallback - LLM returned non-array:', parsed);
        throw new Error('LLM이 배열 형식의 질문을 반환하지 않았습니다.');
      }

      const totalQuestions = parsed.reduce((sum, cat) => sum + cat.questions.length, 0);

      console.log(`[QuestionDesigner] Fallback generated ${totalQuestions} questions`);

      return this.success(parsed, {
        totalQuestions,
        categoriesCount: parsed.length,
        psaEnhanced: false,
      });
    } catch (error: any) {
      console.error(`[QuestionDesigner] Fallback error:`, error);
      return this.failure(`Fallback 질문 생성 실패: ${error.message}`);
    }
  }
}
