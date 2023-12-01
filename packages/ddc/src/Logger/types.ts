import { BaseLogger as Logger, Level } from 'pino';

export type LogLevel = Level;
export type LoggerOptions = {
  logLevel?: LogLevel;
  prefix?: string;
};

export type { Logger };
