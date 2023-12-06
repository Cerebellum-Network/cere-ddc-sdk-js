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
  prefix?: string;
  output?: LogOutput | LogOutput[];
};

export type LoggerOptions = {
  logLevel?: LogLevel;
  logOptions?: LoggerConfig;
  logger?: Logger;
};

export type { Logger };
