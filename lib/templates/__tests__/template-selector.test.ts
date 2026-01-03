/**
 * Template Selector Tests
 *
 * Simple test script to verify template selection logic.
 * Run with: npx tsx lib/templates/__tests__/template-selector.test.ts
 */

import {
  selectVariant,
  selectStrengthsSummary,
  selectStrengthsScenarios,
  generateShadowSides,
} from '../template-selector';
import { CategoryScore, SurveyCategory, PersonaType, PersonaMetadata } from '@/types/survey';
import { STRENGTHS_TEMPLATES } from '../persona-templates';
import { SCENARIO_POOL } from '../scenario-pool';

// Test utilities
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

function createMockScores(scores: number[]): CategoryScore[] {
  const categories = [
    SurveyCategory.INNOVATION,
    SurveyCategory.EXECUTION,
    SurveyCategory.INFLUENCE,
    SurveyCategory.COLLABORATION,
    SurveyCategory.RESILIENCE,
  ];

  return scores
    .map((score, index) => ({
      category: categories[index],
      rawScore: (score / 100) * 6 + 1, // Reverse normalize
      normalizedScore: score,
      rank: 0,
    }))
    .sort((a, b) => b.normalizedScore - a.normalizedScore)
    .map((score, index) => ({
      ...score,
      rank: index + 1,
    }));
}

console.log('\n🧪 Running Template Selector Tests...\n');

// ========================================
// Test 1: selectVariant - balanced
// ========================================
{
  const scores = createMockScores([75, 72, 65, 58, 55]);
  const variant = selectVariant(scores);
  assert(
    variant === 'balanced',
    `selectVariant returns 'balanced' for even high scores (got: ${variant})`
  );
}

// ========================================
// Test 2: selectVariant - spiked
// ========================================
{
  const scores = createMockScores([85, 80, 60, 40, 35]);
  const variant = selectVariant(scores);
  assert(
    variant === 'spiked',
    `selectVariant returns 'spiked' for high top + low bottom scores (got: ${variant})`
  );
}

// ========================================
// Test 3: selectVariant - mixed
// ========================================
{
  const scores = createMockScores([65, 60, 55, 50, 45]);
  const variant = selectVariant(scores);
  assert(
    variant === 'mixed',
    `selectVariant returns 'mixed' for moderate scores (got: ${variant})`
  );
}

// ========================================
// Test 4: selectStrengthsSummary - returns 3 points
// ========================================
{
  const scores = createMockScores([75, 72, 65, 58, 55]);
  const summary = selectStrengthsSummary(PersonaType.ARCHITECT, scores);
  const parts = summary.split('\n\n');

  assert(
    parts.length === 3,
    `selectStrengthsSummary returns 3 bullet points (got: ${parts.length})`
  );

  assert(
    parts[0].length >= 100,
    `Each bullet point is >= 100 chars (got: ${parts[0].length})`
  );
}

// ========================================
// Test 5: selectStrengthsSummary - all 10 personas have templates
// ========================================
{
  const scores = createMockScores([75, 72, 65, 58, 55]);
  const personas = Object.values(PersonaType);

  personas.forEach((persona) => {
    try {
      const summary = selectStrengthsSummary(persona, scores);
      assert(
        summary.length > 0,
        `Persona ${persona} has template (balanced variant)`
      );
    } catch (error: any) {
      console.error(`❌ FAIL: Persona ${persona} missing template - ${error.message}`);
      process.exit(1);
    }
  });

  console.log(`✅ PASS: All 10 personas have templates`);
}

// ========================================
// Test 6: selectStrengthsScenarios - returns 2-3 scenarios
// ========================================
{
  const topCategories = [SurveyCategory.INNOVATION, SurveyCategory.EXECUTION];
  const scenarios = selectStrengthsScenarios(topCategories);

  assert(
    scenarios.length >= 2 && scenarios.length <= 3,
    `selectStrengthsScenarios returns 2-3 scenarios (got: ${scenarios.length})`
  );

  assert(
    scenarios[0].title.length > 0 && scenarios[0].description.length > 0,
    `Scenarios have title and description`
  );
}

// ========================================
// Test 7: generateShadowSides - with low scores
// ========================================
{
  const mockPersona: PersonaMetadata = {
    type: PersonaType.ARCHITECT,
    title: '전략적 설계자',
    tagline: 'Test tagline',
    description: 'Test description',
    strengths: ['전략', '실행'],
    shadowSides: ['과도한 완벽주의', '대인 관계 소홀 가능성'],
    brandingKeywords: ['전략', '실행력'],
  };

  const lowScores = [
    {
      category: SurveyCategory.COLLABORATION,
      reframedLabel: '독립적 해결사',
      reframedDescription: 'Test description',
    },
  ];

  const shadowSides = generateShadowSides(mockPersona, lowScores);

  assert(
    shadowSides.includes('과도한 완벽주의'),
    `generateShadowSides includes persona shadowSides`
  );

  assert(
    shadowSides.includes('독립적 해결사'),
    `generateShadowSides includes reframed labels`
  );
}

// ========================================
// Test 8: generateShadowSides - without low scores
// ========================================
{
  const mockPersona: PersonaMetadata = {
    type: PersonaType.ARCHITECT,
    title: '전략적 설계자',
    tagline: 'Test tagline',
    description: 'Test description',
    strengths: ['전략', '실행'],
    shadowSides: ['과도한 완벽주의', '대인 관계 소홀 가능성'],
    brandingKeywords: ['전략', '실행력'],
  };

  const shadowSides = generateShadowSides(mockPersona, []);

  assert(
    shadowSides.includes('과도한 완벽주의'),
    `generateShadowSides works without low scores`
  );
}

// ========================================
// Test 9: Template data validation
// ========================================
{
  const templateCount = STRENGTHS_TEMPLATES.length;
  assert(
    templateCount === 30,
    `STRENGTHS_TEMPLATES has 30 templates (10 personas × 3 variants) (got: ${templateCount})`
  );

  const scenarioCount = SCENARIO_POOL.length;
  assert(
    scenarioCount >= 15 && scenarioCount <= 25,
    `SCENARIO_POOL has 15-25 scenarios (got: ${scenarioCount})`
  );
}

// ========================================
// Test 10: Each persona has 3 variants
// ========================================
{
  const personas = Object.values(PersonaType);
  const variants = ['balanced', 'spiked', 'mixed'];

  personas.forEach((persona) => {
    variants.forEach((variant) => {
      const template = STRENGTHS_TEMPLATES.find(
        (t) => t.personaType === persona && t.variant === variant
      );

      assert(
        template !== undefined,
        `Persona ${persona} has ${variant} variant`
      );

      if (template) {
        assert(
          template.summaryPoints.length === 3,
          `${persona}-${variant} has 3 summary points`
        );
      }
    });
  });

  console.log(`✅ PASS: All personas have all 3 variants`);
}

console.log('\n🎉 All tests passed!\n');
