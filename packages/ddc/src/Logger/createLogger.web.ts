import format from 'format-util';
import type { LogFn } from 'pino';
import { Logger, LoggerOptions } from './types';

const globalConsole = globalThis.console;

const formatMessage = ({ prefix }: LoggerOptions, message: string, ...args: any[]) => {
  return format(prefix ? `[${prefix}] ${message}` : message, ...args);
};

const wrapLog =
  (log: LogFn, options: LoggerOptions): LogFn =>
  (...rawArgs: any[]) => {
    const args = rawArgs.filter((arg) => arg !== undefined);
    const [debug, message, ...rest] = args;

    if (typeof debug === 'string') {
      const [message, ...rest] = args;

      return log(formatMessage(options, message, ...rest));
    }

    return log(formatMessage(options, message, ...rest), debug);
  };

export const createLogger = (options: LoggerOptions): Logger => ({
  level: options.logLevel || 'warn',
  debug: wrapLog(globalConsole.debug, options),
  info: wrapLog(globalConsole.info, options),
  warn: wrapLog(globalConsole.warn, options),
  error: wrapLog(globalConsole.error, options),
  fatal: wrapLog(globalConsole.error, options),
  trace: wrapLog(globalConsole.trace, options),
  silent: () => {},
});
