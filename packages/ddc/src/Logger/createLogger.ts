import { inspect } from 'util';
import pino from 'pino';
import { Logger, LoggerOptions } from './types';

export const createLogger = (options: LoggerOptions = {}): Logger =>
  pino({
    level: options.logLevel || 'warn',

    hooks: {
      logMethod([message, ...args], method) {
        const notEmptyArgs = args.filter(Boolean);

        if (!notEmptyArgs.length) {
          return method.apply(this, [message]);
        }

        const newMessage = [message, '', notEmptyArgs.map(() => '%s'), ''].join('\n');
        const newArgs = notEmptyArgs.map((arg) => inspect(arg, { depth: 3 }));

        method.apply(this, [newMessage, ...newArgs]);
      },
    },

    msgPrefix: options.prefix ? `[${options.prefix}] ` : undefined,

    transport: {
      target: 'pino-pretty',
      options: {
        levelFirst: true,
        colorize: true,
        ignore: 'hostname,pid',
      },
    },
  });
