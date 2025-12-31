import { callClaude, Message, CacheOptions } from '@/lib/claude';
import { retry, logError, formatErrorMessage } from '@/lib/retry';

export interface AgentContext {
  sessionId: string;
  data: Record<string, any>;
}

export interface AgentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

export abstract class BaseAgent<TInput = any, TOutput = any> {
  protected name: string;
  protected systemPrompt: string;

  constructor(name: string, systemPrompt: string) {
    this.name = name;
    this.systemPrompt = systemPrompt;
  }

  abstract process(input: TInput, context: AgentContext): Promise<AgentResult<TOutput>>;

  protected async callLLM(
    userMessage: string,
    previousMessages: Message[] = [],
    cacheOptions?: CacheOptions
  ): Promise<string> {
    try {
      // 재시도 로직 포함
      return await retry(
        async () => {
          return await callClaude(
            this.systemPrompt,
            userMessage,
            previousMessages,
            cacheOptions
          );
        },
        {
          maxAttempts: 3,
          delayMs: 2000,
          backoff: true,
          onRetry: (error, attempt) => {
            console.warn(`[${this.name}] LLM call retry ${attempt}: ${formatErrorMessage(error)}`);
          },
        }
      );
    } catch (error: any) {
      logError(`${this.name} LLM call`, error);
      throw new Error(`LLM call failed: ${formatErrorMessage(error)}`);
    }
  }

  protected success<T>(data: T, metadata?: Record<string, any>): AgentResult<T> {
    return {
      success: true,
      data,
      metadata,
    };
  }

  protected failure(error: string, metadata?: Record<string, any>): AgentResult {
    return {
      success: false,
      error,
      metadata,
    };
  }

  getName(): string {
    return this.name;
  }

  /**
   * Claude Code Skills 호출 헬퍼
   * document-skills 등 설치된 Skill을 호출합니다.
   *
   * Note: 실제 Skills API는 document-skills 문서 확인 필요
   * 현재는 placeholder 구현으로, Skills가 없으면 에러를 throw합니다.
   *
   * @param skillName - Skill 이름 (e.g., 'document-skills:pptx')
   * @param params - Skill에 전달할 파라미터
   * @returns Skill 실행 결과
   */
  protected async callSkill(skillName: string, params: any): Promise<any> {
    try {
      console.log(`[${this.name}] Attempting to call skill: ${skillName}`);

      // TODO: 실제 Claude Code Skills API 구현 필요
      // document-skills 공식 문서를 참조하여 올바른 호출 방식으로 교체

      // Placeholder: Skills API 엔드포인트 호출 시도
      // 실제로는 Claude Code의 Skill 시스템을 통해 호출되어야 함
      throw new Error(
        `Skills API not implemented yet. ` +
        `Skill '${skillName}' cannot be called. ` +
        `Please use fallback method (e.g., pptxgenjs for PPTX generation).`
      );

      // 예상되는 실제 구현 (document-skills 문서 확인 후 수정):
      // const response = await fetch(`/api/skills/${skillName}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(params),
      // });
      //
      // if (!response.ok) {
      //   throw new Error(`Skill ${skillName} failed: ${response.statusText}`);
      // }
      //
      // return await response.json();
    } catch (error: any) {
      console.warn(`[${this.name}] Skill call failed:`, error.message);
      throw error;
    }
  }
}
