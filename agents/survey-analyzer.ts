import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import {
  SurveyResponse,
  BriefAnalysis,
  CategoryScore,
  SurveyCategory,
  PersonaMetadata,
  SurveyQuestion,
  calculateCategoryScore,
  normalizeScore,
  getPersonaByCategories,
  CategoryLabels,
} from '@/types/survey';
import { getReframedLowScores } from '@/lib/soul-questions/reframing-strategy';
import { selectSoulQuestions } from '@/lib/soul-questions/matching-logic';
import {
  selectStrengthsSummary,
  selectStrengthsScenarios,
  generateShadowSides,
} from '@/lib/templates';

export class SurveyAnalyzerAgent extends BaseAgent<SurveyResponse, BriefAnalysis> {
  constructor() {
    super(
      'SurveyAnalyzerAgent',
      `PSA 설문 분석가 (Template-based). 60개 응답(1-7, 역질문 포함) → 5개 카테고리 분석 → 템플릿 선택

템플릿 시스템:
- 30개 strengthsSummary 템플릿 (10 페르소나 × 3 variants: balanced/spiked/mixed)
- 22개 시나리오 템플릿 (5 카테고리 기반)
- 페르소나 메타데이터 기반 키워드 및 shadowSides

처리: <1초, 비용: $0, AI 호출: 없음`
    );
  }

  async process(
    input: SurveyResponse,
    context: AgentContext
  ): Promise<AgentResult<BriefAnalysis>> {
    try {
      const { sessionId, answers, completedAt, completionTimeSeconds } = input;

      console.log(`[SurveyAnalyzer] Analyzing survey for session: ${sessionId}`);
      console.log(`[SurveyAnalyzer] Total answers: ${answers.length}`);

      // 1. Validate 60 answers
      if (answers.length !== 60) {
        return this.failure(`설문 응답이 60개가 아닙니다 (${answers.length}개)`);
      }

      // 1.5. Get question metadata from context (for reverse scoring)
      const questions = context.data.questions as SurveyQuestion[];
      if (!questions || questions.length !== 60) {
        return this.failure('질문 메타데이터가 누락되었습니다');
      }

      // 2. Calculate category scores (with reverse scoring)
      const categoryScores: CategoryScore[] = Object.values(SurveyCategory).map(
        (category, index) => {
          const rawScore = calculateCategoryScore(answers, category, questions);
          const normalizedScore = normalizeScore(rawScore);

          return {
            category,
            rawScore,
            normalizedScore,
            rank: 0, // Will be set after sorting
          };
        }
      );

      // 3. Sort by normalized score and assign ranks
      categoryScores.sort((a, b) => b.normalizedScore - a.normalizedScore);
      categoryScores.forEach((score, index) => {
        score.rank = index + 1;
      });

      console.log(`[SurveyAnalyzer] Category scores:`, categoryScores);

      // 4. Get top 2 categories
      const topCategories = categoryScores.slice(0, 2).map((s) => s.category);

      // 5. Map to persona
      const persona: PersonaMetadata = getPersonaByCategories(topCategories);

      console.log(`[SurveyAnalyzer] Persona: ${persona.title} (${persona.type})`);

      // 6. Calculate total score (average of all categories)
      const totalScore =
        categoryScores.reduce((sum, s) => sum + s.normalizedScore, 0) /
        categoryScores.length;

      // 7. Prepare radar chart data
      const radarData = categoryScores.map((s) => ({
        category: CategoryLabels[s.category],
        score: Math.round(s.normalizedScore),
      }));

      // 8. Generate analysis using template system
      const lowScoreReframing = getReframedLowScores(categoryScores);

      console.log('[SurveyAnalyzer] Using TEMPLATE system (100%)');

      // Template-based generation (fast, consistent, $0 cost)
      const strengthsSummary = selectStrengthsSummary(persona.type, categoryScores);
      const strengthsScenarios = selectStrengthsScenarios(topCategories);
      const shadowSides = generateShadowSides(persona, lowScoreReframing);
      const brandingKeywords = persona.brandingKeywords;

      // 9. Select Soul Questions for later use
      const tempBriefAnalysis: BriefAnalysis = {
        sessionId,
        categoryScores,
        totalScore: Math.round(totalScore * 100) / 100,
        persona,
        topCategories,
        strengthsSummary: '',  // 임시
        brandingKeywords: [],
        radarData,
        analyzedAt: new Date(),
      };
      const soulQuestions = selectSoulQuestions(tempBriefAnalysis);
      const soulQuestionIds = soulQuestions.map(q => q.id);

      console.log(`[SurveyAnalyzer] Selected Soul Questions:`, soulQuestionIds);

      // 10. Construct final result
      const result: BriefAnalysis = {
        sessionId,
        categoryScores,
        totalScore: Math.round(totalScore * 100) / 100,
        persona,
        topCategories,
        strengthsSummary,
        shadowSides,
        brandingKeywords,
        strengthsScenarios,
        radarData,
        lowScoreCategories: lowScoreReframing,  // NEW: 리프레이밍된 낮은 점수
        selectedSoulQuestions: soulQuestionIds, // NEW: 선택된 Soul Questions
        completionTimeSeconds,
        analyzedAt: new Date(),
      };

      // 10. Validation
      if (!result.strengthsSummary || result.brandingKeywords.length < 3) {
        return this.failure('분석 결과가 불완전합니다.');
      }

      console.log(`[SurveyAnalyzer] Analysis completed. Total score: ${totalScore.toFixed(1)}`);

      return this.success(result, {
        personaType: persona.type,
        totalScore: result.totalScore,
        topCategories: topCategories.join(', '),
      });
    } catch (error: any) {
      console.error(`[SurveyAnalyzer] Error:`, error);
      return this.failure(`설문 분석 실패: ${error.message}`);
    }
  }
}
