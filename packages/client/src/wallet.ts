import { CereWalletSigner, UriSigner } from '@cere-activity-sdk/signers';
import type { JsonSigner } from '@cere-activity-sdk/signers';
import type { SignedWallet } from './types';
import { EmbedWallet } from '@cere/embed-wallet';

class Wallet {
  public wallet: SignedWallet;

  constructor(signer: JsonSigner | string | EmbedWallet) {
    if (!signer) {
      throw new Error('Signer is required');
    }
    if (typeof signer === 'string') {
      this.wallet = new UriSigner(signer);
      return;
    }

    // Treat objects with a 'sign' function as JsonSigner-like
    if (typeof (signer as JsonSigner).sign === 'function') {
      this.wallet = signer as JsonSigner;
      return;
    }

    if (typeof (signer as EmbedWallet).getSigner === 'function') {
      this.wallet = new CereWalletSigner(signer as EmbedWallet);
      return;
    }

    throw new Error('Unsupported signer type');
  }
}

export default Wallet;
