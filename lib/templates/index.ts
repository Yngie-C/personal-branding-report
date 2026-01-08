/**
 * Template System Exports
 *
 * Rule-based template system for PSA brief report generation.
 * Replaces AI-based content generation with fast, consistent templates.
 */

// Template data
export { STRENGTHS_TEMPLATES } from './persona-templates';
export { SCENARIO_POOL } from './scenario-pool';
export { STRENGTH_TIPS_TEMPLATES } from './strength-extensions/strength-tips';
export { BRANDING_MESSAGE_TEMPLATES } from './strength-extensions/branding-messages';

// Template selection logic
export {
  selectVariant,
  selectStrengthsSummary,
  selectStrengthsScenarios,
  generateShadowSides,  // @deprecated
  // NEW: Strength-focused selectors
  selectStrengthTips,
  selectBrandingMessages,
} from './template-selector';

// Types
export type { TemplateVariant } from './template-selector';
export type { StrengthsTemplate } from './persona-templates';
export type { ScenarioTemplate } from './scenario-pool';
export type { StrengthTip, StrengthTipsTemplate } from './strength-extensions/strength-tips';
export type { BrandingMessages, BrandingMessageTemplate } from './strength-extensions/branding-messages';
