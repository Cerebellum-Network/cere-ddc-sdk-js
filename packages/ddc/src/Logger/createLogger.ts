import pino, { TransportTargetOptions } from 'pino';
import { LoggerConfig, Logger, LoggerOptions } from './types';

export const createLogger = (prefix: string, options: LoggerOptions = {}): Logger => {
  const { logger, logOptions = {}, logLevel = 'warn' } = options;
  const msgPrefix = `[${prefix}] `;

  /**
   * If the provided logger is already a pino logger, we just add a child logger to it.
   */
  if (logger) {
    const pinologger = logger as pino.Logger;

    return pinologger.child({}, { msgPrefix });
  }

  const output: LoggerConfig['output'] = logOptions.output || { type: 'console' };
  const outputs = Array.isArray(output) ? output : [output];
  const targets: TransportTargetOptions[] = outputs.map((output) =>
    output.type === 'console'
      ? {
          target: 'pino-pretty',
          level: output.level || logLevel,
          options: {
            levelFirst: true,
            colorize: true,
            colorizeObjects: true,
            ignore: 'hostname,pid',
          },
        }
      : {
          target: 'pino/file',
          level: output.level || logLevel,
          options: {
            destination: output.path,
            append: output.append ?? false,
            mkdir: true,
          },
        },
  );

  return pino({
    level: logLevel,
    msgPrefix,
    transport: { targets },
  });
};
