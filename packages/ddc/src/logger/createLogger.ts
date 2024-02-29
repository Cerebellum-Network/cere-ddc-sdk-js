import pino, { TransportTargetOptions } from 'pino';
import { Buffer } from 'buffer';

import { LoggerConfig, Logger, LoggerOptions } from './types';

/**
 * Maps the log object using the provided function.
 */
const mapLog = (fn: (value: any, key: string) => any) => (log: any) => {
  const nextLog = { ...log };
  for (const [key, value] of Object.entries(log)) {
    const isObject = value && typeof value === 'object' && !ArrayBuffer.isView(value);

    nextLog[key] = isObject ? mapLog(fn)(value) : fn(value, key);
  }

  return nextLog;
};

export const createLogger = (defaultPrefix: string, options: LoggerOptions = {}): Logger => {
  const { logger, logOptions = {}, logLevel = 'warn' } = options;
  const msgPrefix = logOptions.msgPrefix ?? `[${defaultPrefix}] `;

  /**
   * If the provided logger is already a pino logger, we just add a child logger to it.
   */
  if (logger) {
    const pinologger = logger as pino.Logger;

    return pinologger.child({});
  }

  const output: LoggerConfig['output'] = logOptions.output || { type: 'console', format: 'pretty' };
  const outputs = Array.isArray(output) ? output : [output];
  const targets: TransportTargetOptions[] = outputs.map((output) => ({
    target: output.format === 'json' ? 'pino/file' : 'pino-pretty',
    level: output.level || logLevel,
    options:
      output.type === 'file'
        ? {
            destination: output.path,
            append: output.append ?? false,
            colorize: false,
            mkdir: true,
          }
        : {
            destination: 1, // stdout
            colorize: true,
            colorizeObjects: true,
            levelFirst: true,
            ignore: 'hostname,pid',
          },
  }));

  return pino({
    level: logLevel,
    msgPrefix,
    transport: { targets },
    formatters: {
      log: mapLog((value) => {
        return value instanceof Uint8Array ? '0x' + Buffer.from(value).toString('hex') : value;
      }),
    },
  });
};
