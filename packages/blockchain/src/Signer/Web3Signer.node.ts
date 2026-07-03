import { Signer } from './Signer';

// @ts-ignore
export class Web3Signer extends Signer {
  constructor() {
    super();

    throw new Error('Web3Signer in not supported in NodeJS environment');
  }
}
