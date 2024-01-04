import { createBLAKE3 } from 'hash-wasm';
import { Buffer } from 'buffer';
import { Deferred } from '@protobuf-ts/runtime-rpc';

import { TransformStream } from './streams';

export class StreamValidator extends TransformStream {
  private hasherPromise = createBLAKE3();
  private defIsEnded = new Deferred<boolean>();

  constructor() {
    super({
      transform: async (chunk, controller) => {
        const hasher = await this.hasherPromise;

        controller.enqueue(chunk);
        hasher.update(chunk);
      },

      flush: async () => {
        this.defIsEnded.resolve(true);
      },
    });
  }

  async validate(hash: Uint8Array) {
    await this.defIsEnded.promise;

    const hasher = await this.hasherPromise;
    const streamContentHash = hasher.digest('hex');
    const cidContentHash = Buffer.from(hash).toString('hex');

    return streamContentHash === cidContentHash;
  }
}
