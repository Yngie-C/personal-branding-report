import { Page, ConsoleMessage } from '@playwright/test';

/**
 * Console Log Entry
 */
export interface ConsoleLog {
  timestamp: number;
  type: 'log' | 'error' | 'warn' | 'info' | 'debug';
  text: string;
  location?: string;
  args?: any[];
}

/**
 * ConsoleLogger - Captures console messages from the browser
 *
 * Features:
 * - Records all console.log, console.error, console.warn, etc.
 * - Captures stack traces for errors
 * - Filters by log level
 * - Exports to JSON
 */
export class ConsoleLogger {
  private logs: ConsoleLog[] = [];

  /**
   * Start logging console messages
   * @param page - Playwright page object
   */
  start(page: Page): void {
    page.on('console', this.handleConsole.bind(this));
    page.on('pageerror', this.handlePageError.bind(this));

    console.log('[ConsoleLogger] Started logging console messages');
  }

  /**
   * Stop logging
   */
  stop(): void {
    console.log(`[ConsoleLogger] Stopped logging. Total messages: ${this.logs.length}`);
  }

  /**
   * Handle console message
   */
  private handleConsole(msg: ConsoleMessage): void {
    const log: ConsoleLog = {
      timestamp: Date.now(),
      type: msg.type() as ConsoleLog['type'],
      text: msg.text(),
      location: msg.location().url,
    };

    // Try to extract arguments
    try {
      const args = msg.args();
      if (args.length > 0) {
        log.args = args.map((arg) => arg.toString());
      }
    } catch (error) {
      // Arguments might not be serializable
    }

    this.logs.push(log);

    // Echo errors to test console
    if (msg.type() === 'error') {
      console.error(`[Browser Error] ${msg.text()}`);
    }
  }

  /**
   * Handle uncaught page errors
   */
  private handlePageError(error: Error): void {
    const log: ConsoleLog = {
      timestamp: Date.now(),
      type: 'error',
      text: `Uncaught Error: ${error.message}\n${error.stack || ''}`,
    };

    this.logs.push(log);
    console.error(`[Browser Uncaught Error] ${error.message}`);
  }

  /**
   * Get all logs
   */
  getLogs(): ConsoleLog[] {
    return this.logs;
  }

  /**
   * Get logs by type
   */
  getLogsByType(type: ConsoleLog['type']): ConsoleLog[] {
    return this.logs.filter((log) => log.type === type);
  }

  /**
   * Get error logs only
   */
  getErrors(): ConsoleLog[] {
    return this.getLogsByType('error');
  }

  /**
   * Get warning logs only
   */
  getWarnings(): ConsoleLog[] {
    return this.getLogsByType('warn');
  }

  /**
   * Check if any errors occurred
   */
  hasErrors(): boolean {
    return this.getErrors().length > 0;
  }

  /**
   * Get logs matching a text pattern
   */
  getLogsByPattern(pattern: string | RegExp): ConsoleLog[] {
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    return this.logs.filter((log) => regex.test(log.text));
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    total: number;
    errors: number;
    warnings: number;
    info: number;
    debug: number;
    logs: number;
  } {
    return {
      total: this.logs.length,
      errors: this.getLogsByType('error').length,
      warnings: this.getLogsByType('warn').length,
      info: this.getLogsByType('info').length,
      debug: this.getLogsByType('debug').length,
      logs: this.getLogsByType('log').length,
    };
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
    console.log('[ConsoleLogger] Cleared all logs');
  }

  /**
   * Export logs as JSON string
   */
  toJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Export errors as formatted string
   */
  formatErrors(): string {
    const errors = this.getErrors();

    if (errors.length === 0) {
      return 'No errors recorded';
    }

    return errors
      .map((error, index) => {
        const timestamp = new Date(error.timestamp).toISOString();
        return `${index + 1}. [${timestamp}] ${error.text}`;
      })
      .join('\n\n');
  }
}

/**
 * Create a ConsoleLogger instance
 */
export function createConsoleLogger(): ConsoleLogger {
  return new ConsoleLogger();
}
