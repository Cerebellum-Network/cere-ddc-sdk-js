import pino, { TransportTargetOptions } from 'pino';
import { Buffer } from 'buffer';

import { LoggerConfig, Logger, LoggerOptions } from './types';

const truncateHex = function (input: string, maxLength = 100, separator = '...') {
  if (input.length <= maxLength) return input;

  const separatorLength = separator.length,
    charsToShow = maxLength - separatorLength,
    frontChars = Math.ceil(charsToShow / 2),
    backChars = Math.floor(charsToShow / 2);

  return input.substring(0, frontChars) + separator + input.substring(input.length - backChars);
};

/**
 * Maps the log object using the provided function.
 */
const mapLog = (fn: (value: any, key: string) => any) => (log: any) => {
  const nextLog = { ...log };
  for (const [key, value] of Object.entries(log)) {
    const isObject = value && typeof value === 'object' && !ArrayBuffer.isView(value);
    const isError = value instanceof Error;

    nextLog[key] = isObject && !isError ? mapLog(fn)(value) : fn(value, key);
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
            sync: true,
          },
  }));

  return pino({
    level: logLevel,
    msgPrefix,
    transport: { targets },
    depthLimit: 3,
    edgeLimit: 10,
    formatters: {
      log: mapLog((value) => {
        if (value instanceof Uint8Array) {
          return '0x' + truncateHex(Buffer.from(value).toString('hex'));
        }

        return value;
      }),
    },
  });
};
