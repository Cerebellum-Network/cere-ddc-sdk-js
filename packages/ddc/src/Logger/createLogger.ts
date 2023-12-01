import pino from 'pino';
import { Logger, LoggerOptions } from './types';

export const createLogger = (options: LoggerOptions = {}): Logger =>
  pino({
    level: options.logLevel || 'warn',
    msgPrefix: options.prefix ? `[${options.prefix}] ` : undefined,
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
