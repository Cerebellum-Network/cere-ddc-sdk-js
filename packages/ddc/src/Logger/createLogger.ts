import pino from 'pino';
import { Logger, LoggerOptions, isLogger } from './types';

export const createLogger = (prefix: string, options: LoggerOptions = {}): Logger => {
  const { logger } = options;
  const msgPrefix = `[${prefix}] `;

  /**
   * If the provided logger is already a pino logger, we just add a child logger to it.
   */
  if (isLogger(logger)) {
    return logger.child({}, { msgPrefix });
  }

  return pino({
    level: options.logLevel || 'warn',
    msgPrefix,
    transport: {
      target: 'pino-pretty',
      options: {
        levelFirst: true,
        colorize: true,
        colorizeObjects: true,
        ignore: 'hostname,pid',
      },
    },
  });
};
