import { createBLAKE3 } from 'hash-wasm';

import { Logger } from '../logger';
import { Cid } from '../Cid';

export type CidValidatorOptions = {
  logger?: Logger;
  enable?: boolean;
};

export class CidValidator {
  private hasherPromise?: ReturnType<typeof createBLAKE3>;
  private cid: Cid;
  protected logger?: Logger;
  protected readonly enable: boolean;

  constructor(cid: Uint8Array, { logger, enable = true }: CidValidatorOptions = {}) {
    this.cid = new Cid(cid);
    this.logger = logger;
    this.enable = enable;
  }

  protected async getHasher() {
    this.hasherPromise ||= createBLAKE3();

    return this.hasherPromise;
  }

  async update(chunk: Uint8Array) {
    if (!this.enable) {
      return this;
    }

    const hasher = await this.getHasher();

    hasher.update(chunk);

    return this;
  }

  async validate() {
    if (!this.enable) {
      return;
    }

    const hasher = await this.getHasher();

    const receivedHash = hasher.digest('hex');
    const expectedHash = Buffer.from(this.cid.contentHash).toString('hex');

    this.logger?.debug({ expectedHash, receivedHash }, 'Validating content hash');

    if (receivedHash !== expectedHash) {
      throw new Error('Received content is not valid - hash does not match');
    }
  }
}
