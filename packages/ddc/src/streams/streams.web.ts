export class TransformStream<T = any> extends globalThis.TransformStream<T> {}
export class WritableStreamDefaultWriter<T = any> extends globalThis.WritableStreamDefaultWriter<T> {}
export class ReadableStreamDefaultReader<T = any> extends globalThis.ReadableStreamDefaultReader<T> {}
export class ReadableStream<T = any> extends globalThis.ReadableStream<T> {}

/**
 * Apply polyfill for `ReadableStream[Symbol.asyncIterator]`
 * https://bugs.chromium.org/p/chromium/issues/detail?id=929585
 *
 * TODO: Revise it later
 */

declare global {
  interface ReadableStream {
    [Symbol.asyncIterator](): AsyncIterableIterator<any>;
  }
}

globalThis.ReadableStream.prototype[Symbol.asyncIterator] ??= async function* <T = any>(this: ReadableStream<T>) {
  const reader = this.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        return;
      }

      yield value;
    }
  } finally {
    reader.releaseLock();
  }
};
