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
import { getReframedLowScores, generateReframingContext } from '@/lib/soul-questions/reframing-strategy';
import { selectSoulQuestions } from '@/lib/soul-questions/matching-logic';

export class SurveyAnalyzerAgent extends BaseAgent<SurveyResponse, BriefAnalysis> {
  constructor() {
    super(
      'SurveyAnalyzerAgent',
      `PSA 설문 분석가. 60개 응답(1-7, 역질문 포함) → 5개 카테고리 강점 JSON:

{
  "strengthsSummary": "강점 분석 (2-3단락, 페르소나 반영)",
  "shadowSides": "주의점 (1-2단락)",
  "brandingKeywords": ["키워드1~5"]
}

5 카테고리: 혁신사고, 철저실행, 대인영향, 협업공감, 상황회복

원칙: 데이터 기반, 페르소나 구체적 언급, 브랜딩 활용 가능. 한글, 유효 JSON, 키워드 3-5개.`
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

      // 8. Call LLM for strengths analysis and keywords
      // 낮은 점수 리프레이밍
      const lowScoreReframing = getReframedLowScores(categoryScores);
      const reframingContext = generateReframingContext(categoryScores);

      // 캐싱할 prefix: 페르소나와 카테고리 점수 (재사용 가능한 컨텍스트)
      const cachePrefix = `== 페르소나 ==
타입: ${persona.title}
슬로건: ${persona.tagline}
설명: ${persona.description}

== 카테고리별 점수 (0-100) ==
${categoryScores
  .map(
    (s) =>
      `${s.rank}위. ${CategoryLabels[s.category]}: ${s.normalizedScore.toFixed(1)}점 (원점수: ${s.rawScore.toFixed(2)}/7)`
  )
  .join('\n')}

== 페르소나 강점 ==
${persona.strengths.join(', ')}

== 페르소나 주의점 ==
${persona.shadowSides.join(', ')}

== 페르소나 추천 키워드 ==
${persona.brandingKeywords.join(', ')}

== 리프레이밍 가이드 (낮은 점수 해석) ==
${reframingContext}
`;

      // 동적 요청 부분
      const userMessage = `
위 PSA 분석 정보를 바탕으로:
1. **강점 분석**: 이 사람의 핵심 강점을 2-3 단락으로 서술 (페르소나 특성과 점수를 반영)
2. **보완적 스타일**: 낮은 점수를 "결핍"이 아닌 "일하는 스타일의 차이"로 해석 (1-2 단락)
   - 위 "리프레이밍 가이드"를 참고하여 긍정적으로 재해석하세요
   - "주의점"이라는 단어 대신 "보완적 스타일" 또는 "독특한 특성"으로 표현하세요
3. **브랜딩 키워드**: 페르소나와 점수에 맞는 3-5개 키워드

JSON 출력:`;

      const response = await this.callLLM(userMessage, [], {
        cacheSystem: true,        // System prompt 캐싱
        cacheUserPrefix: cachePrefix  // 페르소나+점수 캐싱
      });

      // JSON 추출
      const jsonMatch =
        response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from LLM');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const llmOutput = JSON.parse(jsonStr);

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
        strengthsSummary: llmOutput.strengthsSummary,
        shadowSides: llmOutput.shadowSides,
        brandingKeywords: llmOutput.brandingKeywords,
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
