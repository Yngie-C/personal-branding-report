/**
 * Template System Exports
 *
 * Rule-based template system for PSA brief report generation.
 * Replaces AI-based content generation with fast, consistent templates.
 */

// Template data
export { STRENGTHS_TEMPLATES } from './persona-templates';
export { SCENARIO_POOL } from './scenario-pool';

// Template selection logic
export {
  selectVariant,
  selectStrengthsSummary,
  selectStrengthsScenarios,
  generateShadowSides,
} from './template-selector';

// Types
export type { TemplateVariant } from './template-selector';
export type { StrengthsTemplate } from './persona-templates';
export type { ScenarioTemplate } from './scenario-pool';
