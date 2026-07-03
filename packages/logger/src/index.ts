export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface LoggerOptions {
  level?: LogLevel;
  debug?: boolean;
  name?: string;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class Logger {
  private readonly level: LogLevel;
  private readonly debugMode: boolean;
  private readonly name: string;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? (process.env.LOG_LEVEL as LogLevel) ?? 'info';
    this.debugMode = options.debug ?? process.env.DEBUG === 'true';
    this.name = options.name ?? 'kortex';
  }

  child(context: LogContext): Logger {
    const child = new Logger({
      level: this.level,
      debug: this.debugMode,
      name: this.name,
    });
    const originalLog = child.log.bind(child);
    child.log = (level, message, ctx) => originalLog(level, message, { ...context, ...ctx });
    return child;
  }

  debug(message: string, context?: LogContext): void {
    if (this.debugMode) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    const errorContext: LogContext = { ...context };
    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error !== undefined) {
      errorContext.error = error;
    }
    this.log('error', message, errorContext);
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.level]) {
      return;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      name: this.name,
      message,
      ...context,
    };

    const output = JSON.stringify(entry);
    if (level === 'error') {
      console.error(output);
    } else if (level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }
}

export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}

export const logger = createLogger();
