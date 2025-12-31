import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { NetworkLog } from './network-logger';
import { ConsoleLog } from './console-logger';

/**
 * Report Writer - Saves test failure analysis reports
 *
 * Features:
 * - AI analysis report (Markdown)
 * - Network logs (JSON)
 * - Console logs (JSON/text)
 * - Automatic directory creation
 */

const AI_ANALYSIS_DIR = 'tests/reports/ai-analysis';
const NETWORK_LOGS_DIR = 'tests/reports/network-logs';
const CONSOLE_LOGS_DIR = 'tests/reports/console-logs';

/**
 * Ensure report directories exist
 */
function ensureDirectories(): void {
  [AI_ANALYSIS_DIR, NETWORK_LOGS_DIR, CONSOLE_LOGS_DIR].forEach((dir) => {
    try {
      mkdirSync(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  });
}

/**
 * Sanitize filename (remove special characters)
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

/**
 * Save AI analysis report as Markdown
 * @param testName - Name of the failed test
 * @param markdown - Markdown content from QA Analyzer Agent
 * @returns Path to the saved report
 */
export function saveAIAnalysisReport(testName: string, markdown: string): string {
  ensureDirectories();

  const sanitizedName = sanitizeFilename(testName);
  const timestamp = Date.now();
  const filename = `${sanitizedName}-${timestamp}.md`;
  const path = join(AI_ANALYSIS_DIR, filename);

  writeFileSync(path, markdown, 'utf-8');

  console.log(`[ReportWriter] Saved AI analysis report: ${path}`);
  return path;
}

/**
 * Save network logs as JSON
 * @param testName - Name of the test
 * @param logs - Network logs array
 * @returns Path to the saved file
 */
export function saveNetworkLogs(testName: string, logs: NetworkLog[]): string {
  ensureDirectories();

  const sanitizedName = sanitizeFilename(testName);
  const timestamp = Date.now();
  const filename = `${sanitizedName}-${timestamp}.json`;
  const path = join(NETWORK_LOGS_DIR, filename);

  const content = JSON.stringify(logs, null, 2);
  writeFileSync(path, content, 'utf-8');

  console.log(`[ReportWriter] Saved network logs (${logs.length} requests): ${path}`);
  return path;
}

/**
 * Save console logs as JSON
 * @param testName - Name of the test
 * @param logs - Console logs array
 * @returns Path to the saved file
 */
export function saveConsoleLogs(testName: string, logs: ConsoleLog[]): string {
  ensureDirectories();

  const sanitizedName = sanitizeFilename(testName);
  const timestamp = Date.now();
  const filename = `${sanitizedName}-${timestamp}.json`;
  const path = join(CONSOLE_LOGS_DIR, filename);

  const content = JSON.stringify(logs, null, 2);
  writeFileSync(path, content, 'utf-8');

  console.log(`[ReportWriter] Saved console logs (${logs.length} messages): ${path}`);
  return path;
}

/**
 * Save comprehensive test failure report
 * Combines all diagnostic information into a single Markdown file
 * @param testName - Name of the failed test
 * @param data - Failure data
 * @returns Path to the saved report
 */
export function saveFailureReport(
  testName: string,
  data: {
    error: string;
    screenshotPath?: string;
    networkLogs?: NetworkLog[];
    consoleLogs?: ConsoleLog[];
    pageURL?: string;
    aiAnalysis?: string;
  }
): string {
  ensureDirectories();

  const sanitizedName = sanitizeFilename(testName);
  const timestamp = Date.now();
  const filename = `failure-${sanitizedName}-${timestamp}.md`;
  const path = join(AI_ANALYSIS_DIR, filename);

  const markdown = `# Test Failure Report

**Test Name**: ${testName}
**Timestamp**: ${new Date(timestamp).toISOString()}
**Page URL**: ${data.pageURL || 'N/A'}

---

## Error Summary

\`\`\`
${data.error}
\`\`\`

---

## AI Analysis

${data.aiAnalysis || '*AI analysis not available*'}

---

## Network Activity

${
  data.networkLogs
    ? `
**Total Requests**: ${data.networkLogs.length}
**Failed Requests**: ${data.networkLogs.filter((l) => l.error || (l.status && l.status >= 400)).length}

### API Calls

${data.networkLogs
  .filter((l) => l.url.includes('/api/'))
  .map(
    (log) => `
- **${log.method} ${log.url}**
  - Status: ${log.status || 'pending'}
  - Duration: ${log.duration ? log.duration + 'ms' : 'N/A'}
  ${log.error ? `- Error: ${log.error}` : ''}
  ${log.responseBody ? `- Response: \`${JSON.stringify(log.responseBody).substring(0, 200)}...\`` : ''}
`
  )
  .join('\n')}
`
    : '*Network logs not available*'
}

---

## Console Output

${
  data.consoleLogs
    ? `
**Total Messages**: ${data.consoleLogs.length}
**Errors**: ${data.consoleLogs.filter((l) => l.type === 'error').length}
**Warnings**: ${data.consoleLogs.filter((l) => l.type === 'warn').length}

### Error Messages

${data.consoleLogs
  .filter((l) => l.type === 'error')
  .map((log) => `- [${new Date(log.timestamp).toISOString()}] ${log.text}`)
  .join('\n')}
`
    : '*Console logs not available*'
}

---

## Screenshot

${data.screenshotPath ? `![Screenshot](${data.screenshotPath})` : '*Screenshot not available*'}

---

*Generated by Playwright E2E Test Suite*
`;

  writeFileSync(path, markdown, 'utf-8');

  console.log(`[ReportWriter] Saved comprehensive failure report: ${path}`);
  return path;
}

/**
 * Save test summary report
 * @param summary - Test run summary
 * @returns Path to the saved report
 */
export function saveTestSummary(summary: {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  failures: Array<{ testName: string; error: string }>;
}): string {
  ensureDirectories();

  const timestamp = Date.now();
  const filename = `test-summary-${timestamp}.md`;
  const path = join(AI_ANALYSIS_DIR, filename);

  const markdown = `# E2E Test Run Summary

**Generated**: ${new Date(timestamp).toISOString()}
**Total Duration**: ${summary.duration}ms

---

## Results

- ✅ **Passed**: ${summary.passedTests}/${summary.totalTests}
- ❌ **Failed**: ${summary.failedTests}/${summary.totalTests}
- 📊 **Success Rate**: ${Math.round((summary.passedTests / summary.totalTests) * 100)}%

---

## Failed Tests

${
  summary.failures.length > 0
    ? summary.failures
        .map(
          (f, i) => `
### ${i + 1}. ${f.testName}

\`\`\`
${f.error}
\`\`\`
`
        )
        .join('\n')
    : '*No failures*'
}

---

*Generated by Playwright E2E Test Suite*
`;

  writeFileSync(path, markdown, 'utf-8');

  console.log(`[ReportWriter] Saved test summary: ${path}`);
  return path;
}
