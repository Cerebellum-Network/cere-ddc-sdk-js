import { KB } from '@cere-ddc-sdk/ddc-client';
import { randomBytes } from 'crypto';

type DataStreamOptions = {
  chunkSize?: number;
  chunkDelay?: number;
};

export const createDataStream = (contentSize: number, options?: DataStreamOptions) => {
  const chunkSize = options?.chunkSize || 64 * KB;
  const chunkDelay = options?.chunkDelay || 10;

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
