import { BaseLogger as Logger, LevelWithSilent } from 'pino';

export type LogLevel = LevelWithSilent;

type LogOutputFile = {
  type: 'file';
  path: string;
  append?: boolean;
};

type LogOutputConsole = {
  type: 'console';
};

export type LogOutput = (LogOutputFile | LogOutputConsole) & {
  level?: LogLevel;
  format?: 'json' | 'pretty';
};

export type LoggerConfig = {
  msgPrefix?: string;
  output?: LogOutput | LogOutput[];
};

export type LoggerOptions = {
  logLevel?: LogLevel;
  logOptions?: LoggerConfig;
  logger?: Logger;

  /**
   * Wether to log all errors (including caught ones)
   */
  logErrors?: boolean;
};

export type { Logger };
