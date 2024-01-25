import { Buffer } from 'buffer';
import { ReadableStream, TransformStream, ReadableStreamDefaultReader } from './streams';

import { CONTENT_CHUNK_SIZE } from '../constants';

type InputStream = Omit<ReadableStream<Uint8Array>, 'getReader'> & {
  /**
   * Browser's ReadableStream provides overloads to `getReader` which breaks types, so have to use `any` here and later cast the type
   */
  getReader: () => any;
};

/**
 * The `Content` type represents the content of a file or a piece.
 *
 * It can be a `Uint8Array`, an iterable of `Uint8Array`, an async iterable of `Uint8Array`, or an `InputStream`.
 */
export type Content = Uint8Array | Iterable<Uint8Array> | AsyncIterable<Uint8Array> | InputStream;

/**
 * The `ContentStream` type represents a stream of content.
 */
export type ContentStream = ReadableStream<Uint8Array> & {
  [ContentStreamSymbol]?: true;
};

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

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    yield value;
  }
}

export const getContentSize = (content: Content, defaultSize?: number) => {
  return 'byteLength' in content ? content.byteLength : defaultSize;
};

const ContentStreamSymbol = Symbol('ContentStream');
export const isContentStream = (input: unknown): input is ContentStream => {
  return !!input && typeof input === 'object' && ContentStreamSymbol in input;
};

export const createContentStream = (input: Content | ContentStream, chunkSize = CONTENT_CHUNK_SIZE): ContentStream => {
  const asyncIterator = toIterable(input instanceof Uint8Array ? [input] : input);

  const stream = new ReadableStream({
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

  const contentStream: ContentStream = stream.pipeThrough(withChunkSize(chunkSize));
  contentStream[ContentStreamSymbol] = true;

  return contentStream;
};
