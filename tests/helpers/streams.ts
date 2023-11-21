import { randomBytes } from 'crypto';
import { arrayBuffer } from 'stream/consumers';
import { ReadableStream } from 'stream/web';

import { KB } from './constants';

type DataStreamOptions = {
  chunkSize?: number;
  chunkDelay?: number;
};

export const createDataStream = (contentSize: number, options?: DataStreamOptions) => {
  const chunkSize = options?.chunkSize || 64 * KB;
  const chunkDelay = options?.chunkDelay || 0;

  let remainingDataSize = contentSize;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      await new Promise((resolve) => setTimeout(resolve, chunkDelay));

      if (remainingDataSize > 0) {
        controller.enqueue(new Uint8Array(randomBytes(Math.min(chunkSize, remainingDataSize))));
      } else {
        controller.close();
      }

      remainingDataSize -= chunkSize;
    },
  });
};

export const streamToU8a = async (stream: ReadableStream<Uint8Array>) => {
  return new Uint8Array(await arrayBuffer(stream));
};
