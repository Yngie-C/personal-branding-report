/**
 * Answer Analyzer Module
 *
 * Analyzes user answers for completion quality based on:
 * - Length score (0-70): Based on character count relative to min/recommended
 * - Keyword score (0-30): Based on matching relevant keywords
 *
 * Total score determines grade:
 * - basic: 0-50
 * - good: 51-70
 * - excellent: 71-90
 * - outstanding: 91-100
 */

export interface AnalysisResult {
  lengthScore: number; // 0-70 (character count based)
  keywordScore: number; // 0-30 (keyword matching)
  totalScore: number; // 0-100
  grade: 'basic' | 'good' | 'excellent' | 'outstanding';
  matchedKeywords: string[];
}

export interface QuestionConfig {
  minCharacters?: number;
  recommendedCharacters?: number;
  keywords?: string[];
}

/**
 * Analyzes an answer and returns a detailed analysis result
 *
 * @param answer - The user's answer text
 * @param question - Question configuration with character limits and keywords
 * @returns AnalysisResult with scores and matched keywords
 */
export function analyzeAnswer(
  answer: string,
  question: QuestionConfig
): AnalysisResult {
  const trimmedAnswer = answer.trim();
  const minChars = question.minCharacters || 50;
  const recommendedChars = question.recommendedCharacters || 150;
  const keywords = question.keywords || [];

  // Calculate length score (0-70)
  const lengthScore = calculateLengthScore(
    trimmedAnswer.length,
    minChars,
    recommendedChars
  );

  // Calculate keyword score (0-30)
  const { score: keywordScore, matchedKeywords } = calculateKeywordScore(
    trimmedAnswer,
    keywords
  );

  // Calculate total score
  const totalScore = Math.min(100, lengthScore + keywordScore);

  // Determine grade
  const grade = determineGrade(totalScore);

  return {
    lengthScore,
    keywordScore,
    totalScore,
    grade,
    matchedKeywords,
  };
}

/**
 * Calculate length score based on character count
 *
 * Scoring logic:
 * - Below min: 0-30 (proportional)
 * - Between min and recommended: 30-60 (proportional)
 * - At or above recommended: 60-70 (bonus for extra content)
 */
function calculateLengthScore(
  length: number,
  minChars: number,
  recommendedChars: number
): number {
  if (length === 0) return 0;

  if (length < minChars) {
    // Below minimum: 0-30 points
    return Math.round((length / minChars) * 30);
  }

  if (length < recommendedChars) {
    // Between min and recommended: 30-60 points
    const progress = (length - minChars) / (recommendedChars - minChars);
    return Math.round(30 + progress * 30);
  }

  // At or above recommended: 60-70 points
  // Bonus for extra content, max at 2x recommended
  const extraProgress = Math.min(
    1,
    (length - recommendedChars) / recommendedChars
  );
  return Math.round(60 + extraProgress * 10);
}

/**
 * Calculate keyword score based on matched keywords
 *
 * Scoring logic:
 * - Each matched keyword contributes proportionally to 30 points
 * - Minimum 3 keywords expected for full score
 */
function calculateKeywordScore(
  text: string,
  keywords: string[]
): { score: number; matchedKeywords: string[] } {
  if (keywords.length === 0) {
    // No keywords defined, give partial score based on text quality
    return {
      score: text.length > 50 ? 15 : Math.round((text.length / 50) * 15),
      matchedKeywords: [],
    };
  }

  const normalizedText = text.toLowerCase();
  const matchedKeywords: string[] = [];

  for (const keyword of keywords) {
    const normalizedKeyword = keyword.toLowerCase();
    if (normalizedText.includes(normalizedKeyword)) {
      matchedKeywords.push(keyword);
    }
  }

  // Calculate score: each keyword contributes to the total
  // Expect at least 3 keywords for full score
  const expectedKeywords = Math.min(3, keywords.length);
  const matchRatio = Math.min(1, matchedKeywords.length / expectedKeywords);
  const score = Math.round(matchRatio * 30);

  return { score, matchedKeywords };
}

/**
 * Determine grade based on total score
 */
function determineGrade(
  score: number
): 'basic' | 'good' | 'excellent' | 'outstanding' {
  if (score > 90) return 'outstanding';
  if (score > 70) return 'excellent';
  if (score > 50) return 'good';
  return 'basic';
}

/**
 * Extract keywords from text using simple heuristics
 *
 * Extracts:
 * - Words longer than 3 characters
 * - Removes common Korean/English stop words
 * - Returns unique keywords
 */
export function extractKeywords(text: string): string[] {
  // Korean stop words (common particles and connectors)
  const koreanStopWords = new Set([
    '그리고',
    '하지만',
    '그러나',
    '그래서',
    '또한',
    '그러면',
    '그러므로',
    '따라서',
    '왜냐하면',
    '그런데',
    '하는',
    '있는',
    '없는',
    '되는',
    '하고',
    '있고',
    '없고',
    '되고',
    '에서',
    '으로',
    '부터',
    '까지',
    '에게',
    '한테',
    '보다',
    '처럼',
    '같은',
    '것은',
    '것이',
    '것을',
    '수가',
    '수는',
    '수를',
    '때문',
    '때는',
    '등의',
    '등을',
    '등이',
  ]);

  // English stop words
  const englishStopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'as',
    'is',
    'was',
    'are',
    'were',
    'been',
    'be',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'shall',
    'can',
    'need',
    'that',
    'this',
    'these',
    'those',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'what',
    'which',
    'who',
    'when',
    'where',
    'why',
    'how',
    'all',
    'each',
    'every',
    'both',
    'few',
    'more',
    'most',
    'other',
    'some',
    'such',
    'no',
    'nor',
    'not',
    'only',
    'own',
    'same',
    'so',
    'than',
    'too',
    'very',
    'just',
  ]);

  // Split text into words (handles both Korean and English)
  const words = text
    .toLowerCase()
    .replace(/[^\w\s\u3131-\u318E\uAC00-\uD7A3]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);

  // Filter out stop words and get unique words
  const keywords = new Set<string>();

  for (const word of words) {
    if (
      word.length > 3 &&
      !koreanStopWords.has(word) &&
      !englishStopWords.has(word)
    ) {
      keywords.add(word);
    }
  }

  return Array.from(keywords).slice(0, 20); // Return top 20 keywords
}

/**
 * Get display text for grade in Korean
 */
export function getGradeDisplayText(
  grade: 'basic' | 'good' | 'excellent' | 'outstanding'
): string {
  const gradeTexts = {
    basic: '기초',
    good: '양호',
    excellent: '우수',
    outstanding: '탁월',
  };
  return gradeTexts[grade];
}

/**
 * Get color class for grade
 */
export function getGradeColorClass(
  grade: 'basic' | 'good' | 'excellent' | 'outstanding'
): string {
  const gradeColors = {
    basic: 'text-red-500',
    good: 'text-yellow-600',
    excellent: 'text-blue-600',
    outstanding: 'text-green-600',
  };
  return gradeColors[grade];
}
