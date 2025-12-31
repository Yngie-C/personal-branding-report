import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { NetworkLog } from '../helpers/network-logger';
import { ConsoleLog } from '../helpers/console-logger';

/**
 * Test Failure Data Interface
 */
export interface TestFailureData {
  testName: string;
  error: string;
  screenshotPath?: string;
  networkLogs?: NetworkLog[];
  consoleLogs?: ConsoleLog[];
  pageURL?: string;
  pageHTML?: string;
}

/**
 * AI Analysis Result Interface
 */
export interface AIAnalysisResult {
  rootCause: string;
  impactedComponents: string[];
  suggestedFixes: string[];
  relatedIssues: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  reportMarkdown: string;
}

/**
 * QA Analyzer Agent
 *
 * Analyzes test failures using Claude's multimodal capabilities:
 * - Screenshots (visual inspection)
 * - Network logs (API errors, timing issues)
 * - Console logs (JavaScript errors)
 * - Error messages (stack traces)
 *
 * Outputs a comprehensive analysis with root cause and fix suggestions.
 */
export class QAAnalyzerAgent {
  private anthropic: Anthropic;
  private model: string = 'claude-sonnet-4-5-20250929';

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;

    if (!key) {
      throw new Error('ANTHROPIC_API_KEY is required for QA Analyzer Agent');
    }

    this.anthropic = new Anthropic({ apiKey: key });
  }

  /**
   * Analyze test failure
   * @param failureData - Data about the failed test
   * @returns AI analysis result with root cause and suggested fixes
   */
  async analyzeFailure(failureData: TestFailureData): Promise<AIAnalysisResult> {
    console.log(`\n[QA Analyzer] Starting analysis for: ${failureData.testName}\n`);

    // 1. Prepare screenshot (if available)
    let screenshotBase64: string | undefined;

    if (failureData.screenshotPath) {
      try {
        const buffer = readFileSync(failureData.screenshotPath);
        screenshotBase64 = buffer.toString('base64');
        console.log('[QA Analyzer] Screenshot loaded and encoded');
      } catch (error) {
        console.warn(`[QA Analyzer] Failed to load screenshot: ${error}`);
      }
    }

    // 2. Build system prompt (Korean)
    const systemPrompt = this.buildSystemPrompt();

    // 3. Build user message
    const userMessage = this.buildUserMessage(failureData);

    // 4. Prepare multimodal content
    const content: Anthropic.MessageParam['content'] = [
      {
        type: 'text',
        text: userMessage,
      },
    ];

    // Add screenshot if available
    if (screenshotBase64) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: screenshotBase64,
        },
      });
    }

    // 5. Call Claude API
    console.log('[QA Analyzer] Calling Claude API for analysis...');

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
      });

      const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';

      console.log('[QA Analyzer] Analysis received from Claude');

      // 6. Parse analysis
      const analysis = this.parseAnalysis(analysisText);

      // 7. Generate markdown report
      const reportMarkdown = this.generateMarkdownReport(failureData, analysis);

      return {
        ...analysis,
        reportMarkdown,
      };
    } catch (error: any) {
      console.error('[QA Analyzer] API call failed:', error.message);

      // Return fallback analysis
      return {
        rootCause: `API 호출 실패: ${error.message}`,
        impactedComponents: [],
        suggestedFixes: ['ANTHROPIC_API_KEY 확인', 'API rate limit 확인'],
        relatedIssues: [],
        severity: 'high',
        reportMarkdown: `# AI 분석 실패\n\nAPI 호출 중 오류 발생: ${error.message}`,
      };
    }
  }

  /**
   * Build system prompt for Claude
   */
  private buildSystemPrompt(): string {
    return `당신은 Next.js 14 기반 웹 애플리케이션의 Playwright E2E 테스트 실패를 분석하는 전문가입니다.

**프로젝트 컨텍스트:**
- Next.js 14 (App Router)
- TypeScript, Tailwind CSS
- Multi-agent AI 시스템 (13개 AI agent 사용)
- Supabase (PostgreSQL, Storage)
- Claude API 사용 (LLM 호출로 인한 비동기 처리)
- 8개 페이지 User Flow: start → upload → survey → survey-result → questions → generating → result → public profile

**테스트 환경:**
- Playwright 브라우저 자동화
- Chromium 브라우저
- localStorage 기반 세션 관리

**분석 시 고려사항:**
1. **네트워크 에러 vs UI 렌더링 에러 vs 로직 에러 구분**
   - API 응답 상태 코드 확인 (200, 400, 500 등)
   - 네트워크 타임아웃 vs 서버 에러
   - CORS 이슈, 인증 실패 등

2. **localStorage 및 sessionId 관리 이슈**
   - sessionId가 localStorage에 없으면 /start로 리다이렉트
   - localStorage.clear() 호출 여부
   - 세션 만료 또는 삭제

3. **API 응답 구조 및 에러 핸들링**
   - 예상된 응답 형식: { data, message } 또는 { error }
   - 필수 필드 누락
   - 데이터 타입 불일치

4. **비동기 타이밍 이슈**
   - LLM 호출은 10-30초 소요 가능
   - 폴링 로직 (2초 간격)
   - race condition
   - waitForResponse 타임아웃

5. **Playwright selector 문제 vs 실제 버그**
   - 요소가 DOM에 없는지 vs 선택자가 잘못되었는지 구분
   - 동적 콘텐츠 로딩 대기 필요 여부
   - 페이지 전환 타이밍

**출력 형식:**
다음 구조로 한글로 분석해주세요:

## 근본 원인 (Root Cause)
[1-2문장으로 핵심 원인 설명]

## 영향받는 컴포넌트 (Impacted Components)
- 컴포넌트 1: 파일명과 간단한 설명
- 컴포넌트 2: ...

## 해결 방법 (Suggested Fixes)
1. **구체적인 수정 사항**: 코드 예시 포함
2. **추가 수정**: ...

## 관련 이슈 (Related Issues)
- 유사한 실패 가능성이 있는 다른 테스트/시나리오

## 심각도 (Severity)
[critical/high/medium/low 중 선택]

**중요:**
- 스크린샷이 제공된 경우, 이미지를 분석하여 UI 상태, 에러 메시지, 로딩 상태 등을 파악하세요.
- 네트워크 로그에서 실패한 API 호출의 상태 코드와 응답 내용을 확인하세요.
- 콘솔 로그에서 JavaScript 에러 메시지와 스택 트레이스를 분석하세요.
- 추측이 아닌 데이터 기반 분석을 하세요.`;
  }

  /**
   * Build user message with test failure details
   */
  private buildUserMessage(failureData: TestFailureData): string {
    let message = `# 테스트 실패 분석 요청\n\n`;
    message += `**테스트명**: ${failureData.testName}\n\n`;
    message += `**페이지 URL**: ${failureData.pageURL || 'N/A'}\n\n`;

    // Error message
    message += `## 에러 메시지\n\`\`\`\n${failureData.error}\n\`\`\`\n\n`;

    // Network logs
    if (failureData.networkLogs && failureData.networkLogs.length > 0) {
      message += `## 네트워크 로그 (API 호출)\n\n`;
      message += `총 ${failureData.networkLogs.length}개 요청\n\n`;

      const apiLogs = failureData.networkLogs.filter((log) => log.url.includes('/api/'));
      const failedRequests = failureData.networkLogs.filter((log) => log.error || (log.status && log.status >= 400));

      if (failedRequests.length > 0) {
        message += `**실패한 요청 (${failedRequests.length}개):**\n`;
        failedRequests.forEach((log) => {
          message += `- ${log.method} ${log.url}\n`;
          message += `  - 상태: ${log.status || 'N/A'}\n`;
          if (log.error) message += `  - 에러: ${log.error}\n`;
          if (log.responseBody) {
            const bodyStr = typeof log.responseBody === 'string'
              ? log.responseBody.substring(0, 200)
              : JSON.stringify(log.responseBody).substring(0, 200);
            message += `  - 응답: ${bodyStr}...\n`;
          }
        });
        message += `\n`;
      }

      if (apiLogs.length > 0) {
        message += `**API 호출 목록:**\n`;
        apiLogs.slice(0, 10).forEach((log) => {
          message += `- ${log.method} ${log.url} → ${log.status || 'pending'} (${log.duration || 'N/A'}ms)\n`;
        });
        message += `\n`;
      }
    }

    // Console logs
    if (failureData.consoleLogs && failureData.consoleLogs.length > 0) {
      const errors = failureData.consoleLogs.filter((log) => log.type === 'error');

      if (errors.length > 0) {
        message += `## 콘솔 에러 (${errors.length}개)\n\n`;
        errors.slice(0, 5).forEach((log, index) => {
          message += `${index + 1}. ${log.text}\n`;
        });
        message += `\n`;
      }
    }

    // Page HTML snippet
    if (failureData.pageHTML) {
      const snippet = failureData.pageHTML.substring(0, 500);
      message += `## 페이지 HTML (일부)\n\`\`\`html\n${snippet}\n...\n\`\`\`\n\n`;
    }

    message += `---\n\n`;
    message += `위 정보를 바탕으로 테스트 실패의 근본 원인을 분석하고, 해결 방법을 제시해주세요.\n`;
    message += `스크린샷이 제공된 경우, 이미지를 먼저 확인하여 UI 상태를 파악해주세요.`;

    return message;
  }

  /**
   * Parse Claude's analysis response
   */
  private parseAnalysis(text: string): Omit<AIAnalysisResult, 'reportMarkdown'> {
    // Extract sections using regex
    const rootCause = this.extractSection(text, '근본 원인');
    const impactedComponents = this.extractList(text, '영향받는 컴포넌트');
    const suggestedFixes = this.extractList(text, '해결 방법');
    const relatedIssues = this.extractList(text, '관련 이슈');
    const severity = this.extractSeverity(text);

    return {
      rootCause: rootCause || '원인 분석 실패',
      impactedComponents: impactedComponents.length > 0 ? impactedComponents : ['알 수 없음'],
      suggestedFixes: suggestedFixes.length > 0 ? suggestedFixes : ['수동 확인 필요'],
      relatedIssues: relatedIssues.length > 0 ? relatedIssues : [],
      severity: severity || 'medium',
    };
  }

  /**
   * Extract a section from the analysis text
   */
  private extractSection(text: string, sectionName: string): string {
    const patterns = [
      new RegExp(`##\\s*${sectionName}[^\\n]*\\n([^#]+)`, 'i'),
      new RegExp(`\\*\\*${sectionName}\\*\\*[:\\s]*([^\\n]+(?:\\n(?!##|\\*\\*)[^\\n]+)*)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }

  /**
   * Extract a list from the analysis text
   */
  private extractList(text: string, sectionName: string): string[] {
    const section = this.extractSection(text, sectionName);

    if (!section) return [];

    // Extract items starting with - or numbers
    const items = section.split('\n')
      .filter((line) => {
        const trimmed = line.trim();
        return trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed);
      })
      .map((line) => {
        return line.replace(/^[-*\d.]+\s*/, '').trim();
      })
      .filter((item) => item.length > 0);

    return items;
  }

  /**
   * Extract severity level
   */
  private extractSeverity(text: string): AIAnalysisResult['severity'] {
    const severityMatch = text.match(/심각도[:\s]*(critical|high|medium|low)/i);

    if (severityMatch) {
      return severityMatch[1].toLowerCase() as AIAnalysisResult['severity'];
    }

    // Fallback: check for keywords
    if (/critical|치명적|긴급/.test(text)) return 'critical';
    if (/high|높음|심각/.test(text)) return 'high';
    if (/low|낮음|경미/.test(text)) return 'low';

    return 'medium';
  }

  /**
   * Generate comprehensive markdown report
   */
  private generateMarkdownReport(
    failureData: TestFailureData,
    analysis: Omit<AIAnalysisResult, 'reportMarkdown'>
  ): string {
    const timestamp = new Date().toISOString();

    return `# E2E Test Failure Analysis

**Generated**: ${timestamp}
**Test**: ${failureData.testName}
**Severity**: ${analysis.severity.toUpperCase()}
**Page**: ${failureData.pageURL || 'N/A'}

---

## 📋 Error Summary

\`\`\`
${failureData.error}
\`\`\`

---

## 🔍 AI Analysis

### Root Cause
${analysis.rootCause}

### Impacted Components
${analysis.impactedComponents.map((c) => `- ${c}`).join('\n')}

### Suggested Fixes
${analysis.suggestedFixes.map((f, i) => `${i + 1}. ${f}`).join('\n\n')}

### Related Issues
${analysis.relatedIssues.length > 0 ? analysis.relatedIssues.map((i) => `- ${i}`).join('\n') : '*None identified*'}

---

## 🌐 Network Activity

${failureData.networkLogs ? this.formatNetworkLogs(failureData.networkLogs) : '*No network logs available*'}

---

## 🖥️ Console Output

${failureData.consoleLogs ? this.formatConsoleLogs(failureData.consoleLogs) : '*No console logs available*'}

---

## 📸 Screenshot

${failureData.screenshotPath ? `![Failure Screenshot](${failureData.screenshotPath})` : '*No screenshot available*'}

---

*Generated by QA Analyzer Agent powered by Claude Sonnet 4.5*
`;
  }

  /**
   * Format network logs for markdown
   */
  private formatNetworkLogs(logs: NetworkLog[]): string {
    const apiLogs = logs.filter((l) => l.url.includes('/api/'));
    const failed = logs.filter((l) => l.error || (l.status && l.status >= 400));

    let output = `**Total Requests**: ${logs.length}  \n`;
    output += `**API Calls**: ${apiLogs.length}  \n`;
    output += `**Failed**: ${failed.length}\n\n`;

    if (failed.length > 0) {
      output += `### Failed Requests\n\n`;
      failed.forEach((log) => {
        output += `- **${log.method} ${log.url}**\n`;
        output += `  - Status: ${log.status || 'N/A'}\n`;
        if (log.error) output += `  - Error: ${log.error}\n`;
        if (log.duration) output += `  - Duration: ${log.duration}ms\n`;
      });
      output += `\n`;
    }

    if (apiLogs.length > 0) {
      output += `### API Calls\n\n`;
      apiLogs.slice(0, 10).forEach((log) => {
        output += `- ${log.method} ${log.url} → ${log.status || 'pending'} (${log.duration || 'N/A'}ms)\n`;
      });
    }

    return output;
  }

  /**
   * Format console logs for markdown
   */
  private formatConsoleLogs(logs: ConsoleLog[]): string {
    const errors = logs.filter((l) => l.type === 'error');
    const warnings = logs.filter((l) => l.type === 'warn');

    let output = `**Total**: ${logs.length}  \n`;
    output += `**Errors**: ${errors.length}  \n`;
    output += `**Warnings**: ${warnings.length}\n\n`;

    if (errors.length > 0) {
      output += `### Errors\n\n`;
      errors.slice(0, 10).forEach((log, i) => {
        output += `${i + 1}. [${new Date(log.timestamp).toISOString()}] ${log.text}\n`;
      });
    }

    return output;
  }
}

/**
 * Create a QA Analyzer Agent instance
 */
export function createQAAnalyzerAgent(apiKey?: string): QAAnalyzerAgent {
  return new QAAnalyzerAgent(apiKey);
}
