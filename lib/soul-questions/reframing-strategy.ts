import { SurveyCategory, CategoryLabels } from '@/types/survey';
import { ReframingStrategy, LowScoreReframing } from '@/types/soul-questions';
import { CategoryScore } from '@/types/survey';

/**
 * 5개 카테고리별 리프레이밍 전략
 *
 * 낮은 점수를 "결핍"이 아닌 "독특한 스타일"로 재해석
 */
export const REFRAMING_STRATEGIES: Record<SurveyCategory, ReframingStrategy> = {
  [SurveyCategory.INNOVATION]: {
    category: SurveyCategory.INNOVATION,
    lowScoreLabel: '현실 안착형 (Realist)',
    lowScoreDescription:
      '당신은 검증된 방법론을 선호하며, 안정성을 바탕으로 신뢰를 구축합니다. 뜬구름 잡는 이야기보다 지금 당장 가능한 최선의 답을 찾습니다. 트렌드에 휘둘리지 않는 진중함은 강력한 브랜드 자산입니다.',
    visualTone: 'neutral',
  },
  [SurveyCategory.EXECUTION]: {
    category: SurveyCategory.EXECUTION,
    lowScoreLabel: '유연한 탐험가 (Agile Explorer)',
    lowScoreDescription:
      '당신은 계획에 얽매이지 않고 상황에 맞춰 방향을 조정합니다. 매뉴얼에 갇히지 않고 상황에 따라 최적의 경로를 변경합니다. 빠른 적응력은 변화하는 시장에서 강점이 됩니다.',
    visualTone: 'pastel',
  },
  [SurveyCategory.INFLUENCE]: {
    category: SurveyCategory.INFLUENCE,
    lowScoreLabel: '내실 있는 전문가 (Deep Specialist)',
    lowScoreDescription:
      '당신은 에너지를 외부로 발산하기보다 내부의 전문성을 다지는 데 집중합니다. 말의 화려함보다 실력의 깊이로 조용히 존재감을 증명합니다. "말뿐인 전문가"가 넘쳐나는 시장에서, 당신의 진중함은 강력한 신뢰의 무기가 됩니다.',
    visualTone: 'muted',
  },
  [SurveyCategory.COLLABORATION]: {
    category: SurveyCategory.COLLABORATION,
    lowScoreLabel: '독립적 해결사 (Independent Solver)',
    lowScoreDescription:
      '당신은 혼자서 문제를 해결하는 데 강점이 있습니다. 관계의 눈치를 보지 않고 오직 목표와 본질에만 집중합니다. 자율성과 집중력은 깊이 있는 성과를 만듭니다.',
    visualTone: 'neutral',
  },
  [SurveyCategory.RESILIENCE]: {
    category: SurveyCategory.RESILIENCE,
    lowScoreLabel: '신중한 설계자 (Prudent Planner)',
    lowScoreDescription:
      '당신은 위험을 최소화하고 체계적으로 접근합니다. 위기를 이겨내기보다, 위기 자체가 오지 않도록 철저히 대비합니다. 안정적인 결과물을 만드는 데 강점이 있습니다.',
    visualTone: 'pastel',
  },
};

/**
 * 낮은 점수(하위 2-3개 카테고리)를 리프레이밍
 *
 * @param categoryScores - 5개 카테고리 점수 배열 (이미 랭킹 정렬됨)
 * @returns 리프레이밍된 낮은 점수 카테고리들
 */
export function getReframedLowScores(categoryScores: CategoryScore[]): LowScoreReframing[] {
  // 점수가 낮은 카테고리 필터링 (4위, 5위)
  const lowScores = categoryScores.filter(s => s.rank >= 4);

  // 리프레이밍 전략 적용
  const reframed: LowScoreReframing[] = lowScores.map(score => {
    const strategy = REFRAMING_STRATEGIES[score.category];
    return {
      category: score.category,
      reframedLabel: strategy.lowScoreLabel,
      reframedDescription: strategy.lowScoreDescription,
    };
  });

  console.log(
    `[Reframing] Low scores reframed:`,
    reframed.map(r => `${CategoryLabels[r.category]} → ${r.reframedLabel}`)
  );

  return reframed;
}

/**
 * 특정 카테고리의 리프레이밍 전략 가져오기
 *
 * @param category - Survey 카테고리
 * @returns 리프레이밍 전략
 */
export function getReframingStrategy(category: SurveyCategory): ReframingStrategy {
  return REFRAMING_STRATEGIES[category];
}

/**
 * 리프레이밍 컨텍스트 생성 (LLM 프롬프트용)
 *
 * @param lowScores - 낮은 점수 카테고리들
 * @returns 리프레이밍 가이드 문자열
 */
export function generateReframingContext(lowScores: CategoryScore[]): string {
  const reframed = getReframedLowScores(lowScores);

  const context = reframed
    .map(
      r =>
        `${CategoryLabels[r.category]} (낮은 점수): "${r.reframedLabel}" - ${r.reframedDescription}`
    )
    .join('\n\n');

  return context;
}
