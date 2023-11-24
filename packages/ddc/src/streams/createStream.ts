import { Buffer } from 'buffer';
import { ReadableStream, TransformStream, ReadableStreamDefaultReader } from 'stream/web';

import { CONTENT_CHUNK_SIZE } from '../constants';

type InputStream = {
  /**
   * Browser's ReadableStream provides overloads to `getReader` which breaks types, so have to use `any` here and later cast the type
   */
  getReader: () => any;
};

export type Content = Uint8Array | Iterable<Uint8Array> | AsyncIterable<Uint8Array> | InputStream;
export type ContentStream = ReadableStream<Uint8Array>;

const withChunkSize = (chunkSize: number) => {
  let buffer = Buffer.from([]);

  return new TransformStream<Uint8Array>({
    transform(data, controller) {
      buffer = Buffer.concat([buffer, data]);

      while (buffer.byteLength >= chunkSize) {
        controller.enqueue(buffer.slice(0, chunkSize));
        buffer = buffer.slice(chunkSize);
      }
    },

    flush(controller) {
      if (buffer.byteLength) {
        controller.enqueue(buffer.slice());
      }
    },
  });
};

/**
 * Not all browsers support async iterators on ReadableStream, so we need to convert it manualy in some cases
 */
const isInputStream = (input: Content | InputStream): input is InputStream => {
  return 'getReader' in input;
};

async function* toIterable(input: Content | ContentStream) {
  if (!isInputStream(input)) {
    return yield* input;
  }

  const reader: ReadableStreamDefaultReader<Uint8Array> = input.getReader();

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
}

export const getContentSize = (content: Content, defaultSize?: number) => {
  return 'byteLength' in content ? content.byteLength : defaultSize;
};

export const createContentStream = (input: Content | ContentStream, chunkSize = CONTENT_CHUNK_SIZE): ContentStream => {
  const asyncIterator = toIterable(input instanceof Uint8Array ? [input] : input);

  const stream: ContentStream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await asyncIterator.next();

      if (value) {
        controller.enqueue(value);
      }

      if (done) {
        controller.close();
      }
    },
  });

  return stream.pipeThrough(withChunkSize(chunkSize));
};
