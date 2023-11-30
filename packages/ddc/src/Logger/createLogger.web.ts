import { Logger, LoggerOptions } from './types';

const globalConsole = globalThis.console;
const withPrefix = (log: (...args: any[]) => void, prefix?: string) => (prefix ? log.bind(null, `[${prefix}]`) : log);

export const createLogger = (options: LoggerOptions): Logger => ({
  level: options.logLevel || 'warn',
  debug: withPrefix(globalConsole.debug, options.prefix),
  info: withPrefix(globalConsole.info, options.prefix),
  warn: withPrefix(globalConsole.warn, options.prefix),
  error: withPrefix(globalConsole.error, options.prefix),
  fatal: withPrefix(globalConsole.error, options.prefix),
  trace: withPrefix(globalConsole.trace, options.prefix),
  silent: () => {},
});
