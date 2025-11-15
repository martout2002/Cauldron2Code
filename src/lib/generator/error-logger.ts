/**
 * Error logging system for scaffold generation
 */

export interface ErrorLog {
  id: string;
  timestamp: number;
  generationId: string;
  step: string;
  errorType: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

/**
 * In-memory error log store
 * In production, this should be replaced with a persistent logging solution
 */
class ErrorLogStore {
  private logs: Map<string, ErrorLog[]> = new Map();
  private readonly MAX_LOGS_PER_GENERATION = 50;
  private readonly TTL = 1000 * 60 * 60; // 1 hour

  /**
   * Log an error
   */
  log(
    generationId: string,
    step: string,
    error: Error,
    context?: Record<string, any>
  ): ErrorLog {
    const errorLog: ErrorLog = {
      id: `${generationId}-${Date.now()}`,
      timestamp: Date.now(),
      generationId,
      step,
      errorType: error.name,
      message: error.message,
      stack: error.stack,
      context,
    };

    const existingLogs = this.logs.get(generationId) || [];
    existingLogs.push(errorLog);

    // Keep only the most recent logs
    if (existingLogs.length > this.MAX_LOGS_PER_GENERATION) {
      existingLogs.shift();
    }

    this.logs.set(generationId, existingLogs);
    this.scheduleCleanup(generationId);

    // Also log to console for debugging
    console.error(
      `[Generation ${generationId}] Error at step "${step}":`,
      error.message,
      context
    );

    return errorLog;
  }

  /**
   * Get logs for a generation
   */
  getLogs(generationId: string): ErrorLog[] {
    return this.logs.get(generationId) || [];
  }

  /**
   * Get the most recent error for a generation
   */
  getLatestError(generationId: string): ErrorLog | undefined {
    const logs = this.logs.get(generationId);
    return logs && logs.length > 0 ? logs[logs.length - 1] : undefined;
  }

  /**
   * Clear logs for a generation
   */
  clear(generationId: string): void {
    this.logs.delete(generationId);
  }

  /**
   * Schedule cleanup after TTL
   */
  private scheduleCleanup(generationId: string): void {
    setTimeout(() => {
      this.clear(generationId);
    }, this.TTL);
  }

  /**
   * Get all logs (for debugging)
   */
  getAllLogs(): Map<string, ErrorLog[]> {
    return new Map(this.logs);
  }
}

// Singleton instance
export const errorLogger = new ErrorLogStore();

/**
 * Error logger helper class
 */
export class GenerationErrorLogger {
  constructor(private generationId: string) {}

  /**
   * Log an error
   */
  log(step: string, error: Error, context?: Record<string, any>): ErrorLog {
    return errorLogger.log(this.generationId, step, error, context);
  }

  /**
   * Get all logs for this generation
   */
  getLogs(): ErrorLog[] {
    return errorLogger.getLogs(this.generationId);
  }

  /**
   * Get the latest error
   */
  getLatestError(): ErrorLog | undefined {
    return errorLogger.getLatestError(this.generationId);
  }

  /**
   * Generate error report
   */
  generateErrorReport(): string {
    const logs = this.getLogs();

    if (logs.length === 0) {
      return 'No errors logged for this generation.';
    }

    let report = '# Generation Error Report\n\n';
    report += `Generation ID: ${this.generationId}\n`;
    report += `Total Errors: ${logs.length}\n\n`;

    logs.forEach((log, index) => {
      report += `## Error ${index + 1}\n\n`;
      report += `- **Timestamp**: ${new Date(log.timestamp).toISOString()}\n`;
      report += `- **Step**: ${log.step}\n`;
      report += `- **Type**: ${log.errorType}\n`;
      report += `- **Message**: ${log.message}\n`;

      if (log.context) {
        report += `- **Context**: ${JSON.stringify(log.context, null, 2)}\n`;
      }

      if (log.stack) {
        report += `\n**Stack Trace**:\n\`\`\`\n${log.stack}\n\`\`\`\n`;
      }

      report += '\n---\n\n';
    });

    return report;
  }
}
