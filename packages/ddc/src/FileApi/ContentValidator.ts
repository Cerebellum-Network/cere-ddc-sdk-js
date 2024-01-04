import { createBLAKE3 } from 'hash-wasm';

import { GetFileResponse_Proof } from '../grpc/file_api';
import { Logger } from '../Logger';
import { Cid } from '../Cid';
import type { ReadFileRange } from './FileApi';

export type ContentValidatorOptions = {
  range?: ReadFileRange;
  logger?: Logger;
};

export class ContentValidator {
  private hasherPromise = createBLAKE3();
  private cid: Cid;
  private logger?: Logger;
  private range?: ReadFileRange;
  private isProved = false;

  constructor(cid: Uint8Array, { logger, range }: ContentValidatorOptions = {}) {
    this.cid = new Cid(cid);
    this.logger = logger;
    this.range = range;
  }

  async update(chunk: Uint8Array) {
    const hasher = await this.hasherPromise;

    hasher.update(chunk);
  }

  /**
   * TODO: Implement proof verification
   */
  async prove({ proof }: GetFileResponse_Proof) {
    this.isProved = proof.length > 0;
  }

  async validate() {
    if (this.isProved || this.range) {
      return;
    }

    const hasher = await this.hasherPromise;
    const receivedHash = hasher.digest('hex');
    const expectedHash = Buffer.from(this.cid.contentHash).toString('hex');

    this.logger?.debug({ expectedHash, receivedHash }, 'Validating stream content hash');

    if (receivedHash !== expectedHash) {
      throw new Error('Received content is not valid - hash does not match');
    }
  }
}
