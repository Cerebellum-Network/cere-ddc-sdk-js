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

export type LogOutput = { level?: LogLevel } & (LogOutputFile | LogOutputConsole);
export type LoggerConfig = {
  output?: LogOutput | LogOutput[];
};

export type LoggerOptions = {
  logLevel?: LogLevel;
  logOptions?: LoggerConfig;
  logger?: Logger;
};

export type { Logger };
