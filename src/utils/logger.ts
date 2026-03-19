type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';
  private readonly logLevel: LogLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info';

  private shouldLog(level: LogLevel): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment && this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment && this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: any, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorInfo = error instanceof Error ? error.stack : error;
      const contextWithError = context ? { ...context, error: errorInfo } : { error: errorInfo };
      console.error(this.formatMessage('error', message, contextWithError));
    }
  }

  // Production-safe API logging
  apiRequest(method: string, url: string, context?: LogContext): void {
    this.debug(`API Request: ${method} ${url}`, context);
  }

  apiResponse(status: number, url: string, context?: LogContext): void {
    const level = status >= 400 ? 'warn' : 'debug';
    this[level](`API Response: ${status} - ${url}`, context);
  }
}

export const logger = new Logger();