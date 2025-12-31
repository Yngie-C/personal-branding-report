import { Page, Request, Response } from '@playwright/test';

/**
 * Network Log Entry
 */
export interface NetworkLog {
  timestamp: number;
  method: string;
  url: string;
  status?: number;
  requestHeaders: Record<string, string>;
  requestBody?: any;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  duration?: number;
  error?: string;
}

/**
 * NetworkLogger - Captures and analyzes network traffic during tests
 *
 * Features:
 * - Records all HTTP requests and responses
 * - Captures API payloads
 * - Identifies failed requests
 * - Calculates request durations
 */
export class NetworkLogger {
  private logs: NetworkLog[] = [];
  private requestStartTimes: Map<string, number> = new Map();

  /**
   * Start logging network activity
   * @param page - Playwright page object
   */
  start(page: Page): void {
    page.on('request', this.handleRequest.bind(this));
    page.on('response', this.handleResponse.bind(this));
    page.on('requestfailed', this.handleRequestFailed.bind(this));

    console.log('[NetworkLogger] Started logging network activity');
  }

  /**
   * Stop logging (cleanup event listeners)
   */
  stop(): void {
    console.log(`[NetworkLogger] Stopped logging. Total requests: ${this.logs.length}`);
  }

  /**
   * Handle outgoing request
   */
  private handleRequest(request: Request): void {
    const requestKey = this.getRequestKey(request);
    this.requestStartTimes.set(requestKey, Date.now());

    const log: NetworkLog = {
      timestamp: Date.now(),
      method: request.method(),
      url: request.url(),
      requestHeaders: request.headers(),
    };

    // Capture request body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(request.method())) {
      try {
        const postData = request.postData();
        if (postData) {
          // Try to parse as JSON
          try {
            log.requestBody = JSON.parse(postData);
          } catch {
            log.requestBody = postData;
          }
        }
      } catch (error) {
        // Request body might not be available
      }
    }

    this.logs.push(log);
  }

  /**
   * Handle response
   */
  private async handleResponse(response: Response): Promise<void> {
    const request = response.request();
    const requestKey = this.getRequestKey(request);
    const startTime = this.requestStartTimes.get(requestKey);

    const log = this.logs.find(
      (l) => l.url === response.url() && l.method === request.method()
    );

    if (log) {
      log.status = response.status();
      log.responseHeaders = response.headers();

      if (startTime) {
        log.duration = Date.now() - startTime;
        this.requestStartTimes.delete(requestKey);
      }

      // Capture response body for API calls
      if (response.url().includes('/api/')) {
        try {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('application/json')) {
            log.responseBody = await response.json();
          } else {
            log.responseBody = await response.text();
          }
        } catch (error) {
          // Response body might not be available or already consumed
          log.responseBody = '<body not available>';
        }
      }
    }
  }

  /**
   * Handle failed request
   */
  private handleRequestFailed(request: Request): void {
    const log = this.logs.find(
      (l) => l.url === request.url() && l.method === request.method()
    );

    if (log) {
      const failure = request.failure();
      log.error = failure?.errorText || 'Request failed (unknown reason)';
    }
  }

  /**
   * Get all logs
   */
  getLogs(): NetworkLog[] {
    return this.logs;
  }

  /**
   * Get API logs only (requests to /api/)
   */
  getAPILogs(): NetworkLog[] {
    return this.logs.filter((log) => log.url.includes('/api/'));
  }

  /**
   * Get failed requests
   */
  getFailedRequests(): NetworkLog[] {
    return this.logs.filter((log) => log.error || (log.status && log.status >= 400));
  }

  /**
   * Get logs for a specific URL pattern
   */
  getLogsByURL(pattern: string | RegExp): NetworkLog[] {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return this.logs.filter((log) => regex.test(log.url));
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalRequests: number;
    totalAPIRequests: number;
    failedRequests: number;
    averageDuration: number;
    slowestRequest: NetworkLog | null;
  } {
    const apiLogs = this.getAPILogs();
    const failedLogs = this.getFailedRequests();
    const logsWithDuration = this.logs.filter((log) => log.duration !== undefined);

    const averageDuration =
      logsWithDuration.length > 0
        ? logsWithDuration.reduce((sum, log) => sum + (log.duration || 0), 0) /
          logsWithDuration.length
        : 0;

    const slowestRequest = logsWithDuration.reduce(
      (slowest: NetworkLog | null, log) => {
        if (!slowest || (log.duration || 0) > (slowest.duration || 0)) {
          return log;
        }
        return slowest;
      },
      null
    );

    return {
      totalRequests: this.logs.length,
      totalAPIRequests: apiLogs.length,
      failedRequests: failedLogs.length,
      averageDuration: Math.round(averageDuration),
      slowestRequest,
    };
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
    this.requestStartTimes.clear();
    console.log('[NetworkLogger] Cleared all logs');
  }

  /**
   * Generate a unique key for request tracking
   */
  private getRequestKey(request: Request): string {
    return `${request.method()}-${request.url()}-${Date.now()}`;
  }

  /**
   * Export logs as JSON string
   */
  toJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

/**
 * Create a NetworkLogger instance
 */
export function createNetworkLogger(): NetworkLogger {
  return new NetworkLogger();
}
