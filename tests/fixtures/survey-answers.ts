/**
 * Survey Answers Fixtures
 *
 * Provides pre-defined PSA survey answers for testing
 * - 60 questions across 5 categories (12 questions per category)
 * - Various persona profiles
 * - Consistent and balanced responses
 */

import { SurveyCategory } from '@/types/survey';

/**
 * Survey answer set interface
 */
export interface SurveyAnswerSet {
  name: string;
  description: string;
  answers: Record<string, number>; // questionId -> score (1-7)
}

/**
 * Generate balanced survey answers
 * All answers are set to a specific score (useful for quick tests)
 * @param score - Score to use for all answers (1-7)
 * @returns Answer set
 */
export function generateBalancedAnswers(score: number = 5): Record<string, number> {
  const answers: Record<string, number> = {};

  // Assuming 60 questions with IDs from "q1" to "q60"
  for (let i = 1; i <= 60; i++) {
    answers[`q${i}`] = score;
  }

  return answers;
}

/**
 * Generate persona-specific survey answers
 * Creates answers that will result in a specific persona type
 */

/**
 * 전략적 설계자 (Strategic Architect)
 * High: Innovation (혁신 사고) + Execution (철저 실행)
 */
export function getStrategicArchitectAnswers(): SurveyAnswerSet {
  const answers: Record<string, number> = {};

  for (let i = 1; i <= 60; i++) {
    const category = getCategoryForQuestion(i);

    if (category === SurveyCategory.INNOVATION || category === SurveyCategory.EXECUTION) {
      answers[`q${i}`] = 6 + Math.floor(Math.random() * 2); // 6-7
    } else if (category === SurveyCategory.RESILIENCE) {
      answers[`q${i}`] = 4 + Math.floor(Math.random() * 2); // 4-5
    } else {
      answers[`q${i}`] = 3 + Math.floor(Math.random() * 2); // 3-4
    }
  }

  return {
    name: '전략적 설계자',
    description: '혁신과 실행력이 뛰어난 프로필',
    answers,
  };
}

/**
 * 시장 파괴자 (Market Disruptor)
 * High: Innovation (혁신 사고) + Influence (대인 영향)
 */
export function getMarketDisruptorAnswers(): SurveyAnswerSet {
  const answers: Record<string, number> = {};

  for (let i = 1; i <= 60; i++) {
    const category = getCategoryForQuestion(i);

    if (category === SurveyCategory.INNOVATION || category === SurveyCategory.INFLUENCE) {
      answers[`q${i}`] = 6 + Math.floor(Math.random() * 2); // 6-7
    } else if (category === SurveyCategory.COLLABORATION) {
      answers[`q${i}`] = 4 + Math.floor(Math.random() * 2); // 4-5
    } else {
      answers[`q${i}`] = 3 + Math.floor(Math.random() * 2); // 3-4
    }
  }

  return {
    name: '시장 파괴자',
    description: '혁신과 영향력이 강한 프로필',
    answers,
  };
}

/**
 * 공감형 리더 (Empathetic Leader)
 * High: Influence (대인 영향) + Collaboration (협업 공감)
 */
export function getEmpatheticLeaderAnswers(): SurveyAnswerSet {
  const answers: Record<string, number> = {};

  for (let i = 1; i <= 60; i++) {
    const category = getCategoryForQuestion(i);

    if (category === SurveyCategory.INFLUENCE || category === SurveyCategory.COLLABORATION) {
      answers[`q${i}`] = 6 + Math.floor(Math.random() * 2); // 6-7
    } else if (category === SurveyCategory.RESILIENCE) {
      answers[`q${i}`] = 4 + Math.floor(Math.random() * 2); // 4-5
    } else {
      answers[`q${i}`] = 3 + Math.floor(Math.random() * 2); // 3-4
    }
  }

  return {
    name: '공감형 리더',
    description: '영향력과 협업 능력이 우수한 프로필',
    answers,
  };
}

/**
 * 회복탄력적 중재자 (Resilient Mediator)
 * High: Collaboration (협업 공감) + Resilience (상황 회복)
 */
export function getResilientMediatorAnswers(): SurveyAnswerSet {
  const answers: Record<string, number> = {};

  for (let i = 1; i <= 60; i++) {
    const category = getCategoryForQuestion(i);

    if (category === SurveyCategory.COLLABORATION || category === SurveyCategory.RESILIENCE) {
      answers[`q${i}`] = 6 + Math.floor(Math.random() * 2); // 6-7
    } else if (category === SurveyCategory.INFLUENCE) {
      answers[`q${i}`] = 4 + Math.floor(Math.random() * 2); // 4-5
    } else {
      answers[`q${i}`] = 3 + Math.floor(Math.random() * 2); // 3-4
    }
  }

  return {
    name: '회복탄력적 중재자',
    description: '협업과 회복탄력성이 강한 프로필',
    answers,
  };
}

/**
 * Helper: Determine category for a question number
 * Assumes 12 questions per category:
 * Q1-12: Innovation, Q13-24: Execution, Q25-36: Influence,
 * Q37-48: Collaboration, Q49-60: Resilience
 * Note: This is a simplified mapping for test fixtures.
 * Actual question categorization may vary in the database.
 */
function getCategoryForQuestion(questionNumber: number): SurveyCategory {
  if (questionNumber <= 12) {
    return SurveyCategory.INNOVATION;
  }
  if (questionNumber <= 24) {
    return SurveyCategory.EXECUTION;
  }
  if (questionNumber <= 36) {
    return SurveyCategory.INFLUENCE;
  }
  if (questionNumber <= 48) {
    return SurveyCategory.COLLABORATION;
  }
  return SurveyCategory.RESILIENCE; // Q49-60
}

/**
 * Get all predefined answer sets
 */
export function getAllAnswerSets(): SurveyAnswerSet[] {
  return [
    getStrategicArchitectAnswers(),
    getMarketDisruptorAnswers(),
    getEmpatheticLeaderAnswers(),
    getResilientMediatorAnswers(),
  ];
}

/**
 * Get a random persona answer set
 */
export function getRandomPersonaAnswers(): SurveyAnswerSet {
  const sets = getAllAnswerSets();
  return sets[Math.floor(Math.random() * sets.length)];
}

/**
 * Format answers for API submission
 * Converts from fixture format to API format
 */
export function formatAnswersForAPI(
  answers: Record<string, number>
): Array<{
  questionId: string;
  questionNumber: number;
  category: SurveyCategory;
  score: number;
}> {
  return Object.entries(answers).map(([questionId, score]) => {
    const questionNumber = parseInt(questionId.replace('q', ''));
    const category = getCategoryForQuestion(questionNumber);

    return {
      questionId,
      questionNumber,
      category,
      score,
    };
  });
}
