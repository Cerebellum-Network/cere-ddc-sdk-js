import { Logger } from './types';

type AnyFunction = (this: object, ...args: unknown[]) => Promise<unknown>;

const loggedErrors = new WeakSet<Error>();

export const bindErrorLogger = <T extends object, M extends keyof T>(obj: T, logger: Logger, methods: M[]) => {
  for (const method of methods.filter((method) => typeof obj[method] === 'function')) {
    const original = obj[method] as AnyFunction;
    const patched = async function (this: object, ...args: unknown[]) {
      try {
        return await original.apply(this, args);
      } catch (err) {
        const error = err as Error;

        if (!loggedErrors.has(error)) {
          loggedErrors.add(error);
          logger.error(error, 'Error in %s', original.name || 'anonymous function');
        }

        throw error;
      }
    };

    obj[method] = patched as T[M];
  }
};
