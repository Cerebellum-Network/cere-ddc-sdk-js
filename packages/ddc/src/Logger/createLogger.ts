import pino from 'pino';
import { Logger, LoggerOptions } from './types';

export const createLogger = (prefix: string, options: LoggerOptions = {}): Logger =>
  pino({
    level: options.logLevel || 'warn',
    msgPrefix: `[${prefix}] `,
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
