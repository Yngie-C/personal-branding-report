/**
 * 재시도 유틸리티
 * API 호출 실패 시 자동으로 재시도
 */

export interface RetryOptions {
  maxAttempts?: number; // 최대 재시도 횟수
  delayMs?: number; // 재시도 간격 (밀리초)
  backoff?: boolean; // 지수 백오프 사용 여부
  onRetry?: (error: Error, attempt: number) => void; // 재시도 시 콜백
}

/**
 * 비동기 함수를 재시도와 함께 실행
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = true,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (attempt < maxAttempts) {
        const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;

        console.warn(
          `[Retry] Attempt ${attempt}/${maxAttempts} failed: ${error.message}. Retrying in ${delay}ms...`
        );

        if (onRetry) {
          onRetry(error, attempt);
        }

        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Sleep 유틸리티
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 에러 타입에 따라 재시도 여부 결정
 */
export function isRetryableError(error: any): boolean {
  // 네트워크 에러
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // HTTP 상태 코드 기반
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  if (error.response && retryableStatusCodes.includes(error.response.status)) {
    return true;
  }

  // Claude API rate limit
  if (error.message?.includes('rate limit') || error.message?.includes('overloaded')) {
    return true;
  }

  return false;
}

/**
 * 조건부 재시도 (재시도 가능한 에러만)
 */
export async function retryIfNeeded<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (isRetryableError(error)) {
      console.log(`[Retry] Retryable error detected: ${error.message}`);
      return retry(fn, options);
    }
    throw error;
  }
}

/**
 * 에러 메시지 정제
 */
export function formatErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 에러 로깅
 */
export function logError(context: string, error: any, additionalInfo?: any): void {
  console.error(`[Error] ${context}:`, {
    message: formatErrorMessage(error),
    stack: error.stack,
    ...additionalInfo,
  });
}
