import { BaseLogger as Logger, LevelWithSilent, Logger as FullLogger } from 'pino';

export type LogLevel = LevelWithSilent;
export type LoggerConfig = {
  format: 'pretty' | 'json';
};

export type LoggerOptions = {
  logLevel?: LogLevel;
  logger?: LoggerConfig | Logger;
};

export const isLogger = (logger: unknown): logger is FullLogger => {
  return !!logger && typeof logger === 'object' && 'child' in logger && typeof logger.child === 'function';
};

export type { Logger };
