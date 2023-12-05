import { BaseLogger as Logger, LevelWithSilent } from 'pino';

export type LogLevel = LevelWithSilent;
export type LoggerOptions = {
  logLevel?: LogLevel;
  prefix?: string;
};

export type { Logger };
