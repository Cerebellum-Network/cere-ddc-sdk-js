import format from 'format-util';
import { LogFn, Level, levels } from 'pino';
import { Logger, LoggerOptions } from './types';

const globalConsole = globalThis.console;

const getLogFn =
  (
    level: Exclude<Level, 'fatal'>,
    defaultPrefix: string,
    { logLevel = 'warn', logOptions = {} }: LoggerOptions,
  ): LogFn =>
  (...rawArgs: any[]) => {
    if (logLevel === 'silent' || levels.values[level] < levels.values[logLevel!]) {
      return;
    }

    const msgPrefix = logOptions.prefix ?? `[${defaultPrefix}] `;
    const args = rawArgs.filter((arg) => arg !== undefined);
    const log = globalConsole[level];
    const [debug, message, ...rest] = args;

    if (typeof debug === 'string') {
      const [message, ...rest] = args;

      return log(format(`${msgPrefix}${message}`, ...rest));
    }

    return log(format(`${msgPrefix}${message}`, ...rest), debug);
  };

export const createLogger = (prefix: string, options: LoggerOptions = {}): Logger => ({
  level: options.logLevel || 'warn',
  debug: getLogFn('debug', prefix, options),
  info: getLogFn('info', prefix, options),
  warn: getLogFn('warn', prefix, options),
  error: getLogFn('error', prefix, options),
  fatal: getLogFn('error', prefix, options),
  trace: getLogFn('trace', prefix, options),
  silent: () => {},
});
