import type { EmbedWallet } from '@cere/embed-wallet';
import { inject } from '@cere/embed-wallet-inject';

import { Web3Signer } from './Web3Signer';

const CERE_WALLET_EXTENSION = 'Cere Wallet';

export class CereWalletSigner extends Web3Signer {
  protected wallet: EmbedWallet;

  constructor(wallet: EmbedWallet) {
    super({ extensions: [CERE_WALLET_EXTENSION] });

    this.wallet = wallet;
  }

  async connect() {
    await inject(this.wallet, { name: CERE_WALLET_EXTENSION, autoConnect: true });

    await super.connect();

    return this;
  }

  async sign(message: string | Uint8Array) {
    const typedSignature = await super.sign(message);

    /**
     * Cere Wallet returns a typed signature with the first byte indicating the signature type (Ed25519).
     * Right now we need to remove this byte to get the raw signature. But this solution is not ideal.
     * We need to change the signature logic on ther Cere Wallet side, to make it compatible with other Web3 extensions.
     *
     * TODO: Change the signature logic on the Cere Wallet side and remove this hack.
     */
    return typedSignature.slice(1);
  }
}
