import pino, { Level, Logger } from 'pino';

export type LogLevel = Level;
export type LoggerOptions = {
  logLevel?: LogLevel;
};

export type { Logger };

export const createLogger = (options: LoggerOptions = {}) => pino({ level: options.logLevel || 'warn' });
