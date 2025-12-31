/**
 * Seeded Random Number Generator (Linear Congruential Generator)
 * Returns a deterministic random value between 0 and 1 based on a seed
 *
 * @param seed - Numeric seed value
 * @returns Random number between 0 and 1
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Convert string seed to numeric seed
 * Uses a simple hash function to convert string to number
 *
 * @param str - String seed (e.g., sessionId)
 * @returns Numeric seed value
 */
function stringToSeed(str: string): number {
  let seed = 0;
  for (let i = 0; i < str.length; i++) {
    seed = ((seed << 5) - seed) + str.charCodeAt(i);
    seed = seed & seed; // Convert to 32bit integer
  }
  return Math.abs(seed);
}

/**
 * Seeded Fisher-Yates Shuffle
 * Guarantees the same shuffle result for the same seed
 *
 * This ensures that:
 * - Users get a consistent randomized question order throughout their session
 * - Refreshing the page doesn't change the order
 * - Different sessions get different random orders
 *
 * @param array - Array to shuffle
 * @param seedString - Seed string (e.g., sessionId)
 * @returns Shuffled array (new copy, original unchanged)
 *
 * @example
 * const questions = [q1, q2, q3, q4, q5];
 * const shuffled = seededShuffle(questions, "session-abc-123");
 * // Always returns the same order for "session-abc-123"
 */
export function seededShuffle<T>(array: T[], seedString: string): T[] {
  const shuffled = [...array]; // Create a copy
  const seed = stringToSeed(seedString);

  // Fisher-Yates shuffle with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
