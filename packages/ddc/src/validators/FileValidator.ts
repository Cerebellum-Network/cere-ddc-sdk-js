import { GetFileResponse_Proof } from '../grpc/file_api';
import type { ReadFileRange } from '../FileApi';
import { CidValidator, CidValidatorOptions } from './CidValidator';

export type FileValidatorOptions = CidValidatorOptions & {
  range?: ReadFileRange;
};

export class FileValidator extends CidValidator {
  private range?: ReadFileRange;
  private isProved = false;

  constructor(cid: Uint8Array, { range, ...options }: FileValidatorOptions = {}) {
    super(cid, options);

    this.range = range;
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

    await super.validate();
  }
}
