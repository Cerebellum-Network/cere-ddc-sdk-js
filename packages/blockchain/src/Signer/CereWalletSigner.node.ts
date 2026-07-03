import { Signer } from './Signer';

// @ts-ignore
export class CereWalletSigner extends Signer {
  constructor() {
    super();

    throw new Error('CereWalletSigner in not supported in NodeJS environment');
  }
}
