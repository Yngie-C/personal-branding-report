import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = 'claude-sonnet-4-20250514';

export interface Message {
  role: 'user' | 'assistant';
  content: string | Anthropic.MessageParam['content'];
}

export interface CacheOptions {
  /**
   * System prompt 캐싱 활성화 (기본: true)
   * System prompt가 1024 tokens 이상일 때 효과적
   */
  cacheSystem?: boolean;

  /**
   * User message에서 캐싱할 prefix 텍스트
   * 여러 호출에서 재사용되는 긴 컨텍스트 (이력서, 브랜드 전략 등)
   */
  cacheUserPrefix?: string;
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  previousMessages: Message[] = [],
  cacheOptions: CacheOptions = { cacheSystem: true }
): Promise<string> {
  // System prompt 캐싱 설정
  const systemContent: string | Anthropic.Beta.PromptCaching.PromptCachingBetaTextBlockParam[] =
    cacheOptions.cacheSystem
      ? [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" }
          }
        ]
      : systemPrompt;

  // User message 캐싱 설정
  let userContent: string | Anthropic.Beta.PromptCaching.PromptCachingBetaTextBlockParam[];

  if (cacheOptions.cacheUserPrefix) {
    userContent = [
      {
        type: "text",
        text: cacheOptions.cacheUserPrefix,
        cache_control: { type: "ephemeral" }
      },
      {
        type: "text",
        text: userMessage
      }
    ];
  } else {
    userContent = userMessage;
  }

  const messages: Anthropic.Beta.PromptCaching.PromptCachingBetaMessageParam[] = [
    ...previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user' as const, content: userContent }
  ];

  const response = await anthropic.beta.promptCaching.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemContent,
    messages,
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }

  throw new Error('Unexpected response type from Claude');
}
