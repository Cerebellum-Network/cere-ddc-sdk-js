import pino, { TransportTargetOptions } from 'pino';
import { LoggerConfig, Logger, LoggerOptions } from './types';

export const createLogger = (defaultPrefix: string, options: LoggerOptions = {}): Logger => {
  const { logger, logOptions = {}, logLevel = 'warn' } = options;
  const msgPrefix = logOptions.prefix ?? `[${defaultPrefix}] `;

  /**
   * If the provided logger is already a pino logger, we just add a child logger to it.
   */
  if (logger) {
    const pinologger = logger as pino.Logger;

    return pinologger.child({});
  }

  const output: LoggerConfig['output'] = logOptions.output || { type: 'console' };
  const outputs = Array.isArray(output) ? output : [output];
  const targets: TransportTargetOptions[] = outputs.map((output) => ({
    target: output.format === 'pretty' ? 'pino-pretty' : 'pino/file',
    level: output.level || logLevel,
    options:
      output.type === 'console'
        ? {
            destination: 1, // stdout
            colorize: true,
            colorizeObjects: true,
            ignore: 'hostname,pid',
          }
        : {
            destination: output.path,
            append: output.append ?? false,
            colorize: false,
            mkdir: true,
          },
  }));

  return pino({
    level: logLevel,
    msgPrefix,
    transport: { targets },
  });
};
