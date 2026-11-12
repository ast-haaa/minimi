type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[this.level];
  }

  private format(level: LogLevel, message: string, data?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    if (data) {
      // Redact sensitive fields
      const safe = { ...data };
      for (const key of ['apiKey', 'api_key', 'token', 'password', 'secret', 'OPENAI_API_KEY', 'TAVILY_API_KEY']) {
        if (key in safe) safe[key] = '[REDACTED]';
      }
      return `${base} ${JSON.stringify(safe)}`;
    }
    return base;
  }

  debug(message: string, data?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) console.debug(this.format('debug', message, data));
  }

  info(message: string, data?: Record<string, unknown>): void {
    if (this.shouldLog('info')) console.info(this.format('info', message, data));
  }

  warn(message: string, data?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) console.warn(this.format('warn', message, data));
  }

  error(message: string, error?: unknown, data?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      const errorData = error instanceof Error
        ? { errorMessage: error.message, stack: error.stack?.split('\n').slice(0, 3).join('\n') }
        : { errorMessage: String(error) };
      console.error(this.format('error', message, { ...errorData, ...data }));
    }
  }
}

export const logger = new Logger();
