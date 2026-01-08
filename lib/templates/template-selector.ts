import {
  CategoryScore,
  SurveyCategory,
  PersonaType,
  PersonaMetadata,
} from '@/types/survey';
import { LowScoreReframing } from '@/types/soul-questions';
import { STRENGTHS_TEMPLATES } from './persona-templates';
import { SCENARIO_POOL } from './scenario-pool';
import {
  STRENGTH_TIPS_TEMPLATES,
  StrengthTip,
} from './strength-extensions/strength-tips';
import {
  BRANDING_MESSAGE_TEMPLATES,
  BrandingMessages,
} from './strength-extensions/branding-messages';

/**
 * Template variant types based on score patterns
 */
export type TemplateVariant = 'balanced' | 'spiked' | 'mixed';

/**
 * Determine score pattern variant
 *
 * @param categoryScores - 5 category scores (already ranked)
 * @returns variant type
 */
export function selectVariant(categoryScores: CategoryScore[]): TemplateVariant {
  const top2Scores = categoryScores.slice(0, 2).map((s) => s.normalizedScore);
  const bottom2Scores = categoryScores.slice(3, 5).map((s) => s.normalizedScore);

  // Balanced: All scores relatively high and even
  if (top2Scores.every((s) => s > 70) && bottom2Scores.every((s) => s > 50)) {
    return 'balanced';
  }

  // Spiked: Very high top scores, low bottom scores (clear trade-offs)
  if (top2Scores.every((s) => s > 75) && bottom2Scores.some((s) => s < 50)) {
    return 'spiked';
  }

  // Mixed: Default for all other patterns
  return 'mixed';
}

/**
 * Select strengthsSummary template based on persona and score pattern
 *
 * @param personaType - User's persona type
 * @param categoryScores - 5 category scores
 * @returns strengthsSummary string (3 bullet points joined by \n\n)
 */
export function selectStrengthsSummary(
  personaType: PersonaType,
  categoryScores: CategoryScore[]
): string {
  const variant = selectVariant(categoryScores);

  const template = STRENGTHS_TEMPLATES.find(
    (t) => t.personaType === personaType && t.variant === variant
  );

  if (!template) {
    throw new Error(
      `Template not found for persona: ${personaType}, variant: ${variant}`
    );
  }

  console.log(
    `[TemplateSelector] Selected template: ${personaType} (${variant})`
  );

  return template.summaryPoints.join('\n\n');
}

/**
 * Select strengthsScenarios from pool based on top categories
 *
 * @param topCategories - Top 2 categories
 * @returns Array of 2-3 scenario objects
 */
export function selectStrengthsScenarios(
  topCategories: SurveyCategory[]
): Array<{ title: string; description: string }> {
  if (topCategories.length < 2) {
    throw new Error('Need at least 2 top categories for scenario selection');
  }

  // Find scenarios that match top categories
  const matching = SCENARIO_POOL.filter((s) =>
    s.relatedCategories.some((cat) => topCategories.includes(cat))
  );

  if (matching.length === 0) {
    throw new Error(
      `No scenarios found for categories: ${topCategories.join(', ')}`
    );
  }

  // Prioritize scenarios matching 1st category
  const prioritized = matching.sort((a, b) => {
    const aFirst = a.relatedCategories.includes(topCategories[0]);
    const bFirst = b.relatedCategories.includes(topCategories[0]);

    if (aFirst && !bFirst) return -1;
    if (!aFirst && bFirst) return 1;
    return 0;
  });

  // Select top 3 scenarios (or 2 if pool is small)
  const selectedCount = Math.min(3, prioritized.length);
  const selected = prioritized.slice(0, selectedCount);

  console.log(
    `[TemplateSelector] Selected ${selected.length} scenarios for categories: ${topCategories.join(', ')}`
  );

  return selected.map((s) => ({
    title: s.title,
    description: s.description,
  }));
}

/**
 * @deprecated Use selectStrengthTips and selectBrandingMessages instead
 * Generate shadowSides text combining persona metadata and reframing
 *
 * @param persona - User's persona metadata
 * @param lowScoreCategories - Reframed low score categories (optional)
 * @returns shadowSides paragraph
 */
export function generateShadowSides(
  persona: PersonaMetadata,
  lowScoreCategories?: LowScoreReframing[]
): string {
  const partners = persona.shadowSides.join(', ');

  // If no low scores, just mention complementary partners
  if (!lowScoreCategories || lowScoreCategories.length === 0) {
    return `당신의 강점을 보완할 수 있는 파트너는: ${partners}입니다.`;
  }

  const reframedLabels = lowScoreCategories
    .map((c) => c.reframedLabel)
    .join(', ');

  return `당신의 강점을 보완할 수 있는 파트너는: ${partners}입니다.\n\n특히 "${reframedLabels}" 스타일과 상반되는 강점을 가진 동료와 협업하면 시너지가 극대화됩니다.`;
}

// ==========================================
// NEW: Strength-focused template selectors
// ==========================================

/**
 * Select strength tips based on persona type
 *
 * @param personaType - User's persona type
 * @returns Array of strength tips (3-5 tips)
 */
export function selectStrengthTips(personaType: PersonaType): StrengthTip[] {
  const template = STRENGTH_TIPS_TEMPLATES.find(
    (t) => t.personaType === personaType
  );

  if (!template) {
    console.warn(
      `[TemplateSelector] Strength tips not found for persona: ${personaType}, using fallback`
    );
    // Fallback to ARCHITECT
    const fallback = STRENGTH_TIPS_TEMPLATES.find(
      (t) => t.personaType === PersonaType.ARCHITECT
    );
    return fallback?.tips || [];
  }

  console.log(
    `[TemplateSelector] Selected ${template.tips.length} strength tips for: ${personaType}`
  );

  return template.tips;
}

/**
 * Select branding messages based on persona type and score pattern
 *
 * @param personaType - User's persona type
 * @param categoryScores - 5 category scores (for variant selection)
 * @returns Branding messages object
 */
export function selectBrandingMessages(
  personaType: PersonaType,
  categoryScores: CategoryScore[]
): BrandingMessages {
  const variant = selectVariant(categoryScores);

  const template = BRANDING_MESSAGE_TEMPLATES.find(
    (t) => t.personaType === personaType && t.variant === variant
  );

  if (!template) {
    console.warn(
      `[TemplateSelector] Branding messages not found for: ${personaType} (${variant}), using fallback`
    );
    // Fallback to same persona with 'mixed' variant
    const fallback = BRANDING_MESSAGE_TEMPLATES.find(
      (t) => t.personaType === personaType && t.variant === 'mixed'
    );
    if (fallback) {
      return {
        selfIntro: fallback.selfIntro,
        linkedinHeadline: fallback.linkedinHeadline,
        elevatorPitch: fallback.elevatorPitch,
        hashtags: fallback.hashtags,
      };
    }
    // Ultimate fallback to ARCHITECT mixed
    const ultimate = BRANDING_MESSAGE_TEMPLATES.find(
      (t) => t.personaType === PersonaType.ARCHITECT && t.variant === 'mixed'
    );
    return {
      selfIntro: ultimate?.selfIntro || '',
      linkedinHeadline: ultimate?.linkedinHeadline || '',
      elevatorPitch: ultimate?.elevatorPitch || '',
      hashtags: ultimate?.hashtags || [],
    };
  }

  console.log(
    `[TemplateSelector] Selected branding messages for: ${personaType} (${variant})`
  );

  return {
    selfIntro: template.selfIntro,
    linkedinHeadline: template.linkedinHeadline,
    elevatorPitch: template.elevatorPitch,
    hashtags: template.hashtags,
  };
}
