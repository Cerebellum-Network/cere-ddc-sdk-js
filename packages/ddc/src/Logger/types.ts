import { BaseLogger as Logger, LevelWithSilent } from 'pino';

export type LogLevel = LevelWithSilent;
export type LoggerConfig = {
  format: 'pretty' | 'json';
};

export type LoggerOptions = {
  logLevel?: LogLevel;
  logger?: LoggerConfig;
};

export type { Logger };
