export enum LogLevel {
  VERBOSE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

export class Logger {
  constructor(
    private context: string,
    private logLevel = LogLevel.WARN,
  ) {}

  verbose(...args: unknown[]) {
    if (this.logLevel > LogLevel.VERBOSE) return
    console.log(`[VERBOSE][${this.context}]`, ...args)
  }

  debug(...args: unknown[]) {
    if (this.logLevel > LogLevel.DEBUG) return
    console.debug(`[DEBUG][${this.context}]`, ...args)
  }

  log(...args: unknown[]) {
    if (this.logLevel > LogLevel.INFO) return
    console.log(`[INFO][${this.context}]`, ...args)
  }

  info(...args: unknown[]) {
    if (this.logLevel > LogLevel.INFO) return
    console.info(`[INFO][${this.context}]`, ...args)
  }

  warn(...args: unknown[]) {
    if (this.logLevel > LogLevel.WARN) return
    console.warn(`[WARN][${this.context}]`, ...args)
  }

  error(...args: unknown[]) {
    // Always log errors regardless of log level
    // This ensures that critical issues are always reported
    console.error(`[ERROR][${this.context}]`, ...args)
  }
}
