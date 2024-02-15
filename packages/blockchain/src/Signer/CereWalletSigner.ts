import type { EmbedWallet } from '@cere/embed-wallet';
import { inject } from '@cere/embed-wallet-inject';

import { Web3Signer } from './Web3Signer';

const CERE_WALLET_EXTENSION = 'Cere Wallet';

/**
 * Signer that uses Cere Wallet to sign messages.
 *
 * @group Signers
 * @extends Web3Signer
 * @example
 *
 * ```typescript
 * import { EmbedWallet } from '@cere/embed-wallet';
 *
 * const cereWallet = new EmbedWallet({ env: 'dev' });
 * await cereWallet.init();
 *
 * const cereWalletSigner = new CereWalletSigner(cereWallet);
 * const signature = await cereWalletSigner.sign('data');
 *
 * console.log(signature);
 * ```
 */
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
}
