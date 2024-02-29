import type { EmbedWallet, PermissionRequest } from '@cere/embed-wallet';
import { inject } from '@cere/embed-wallet-inject';

import { Web3Signer } from './Web3Signer';

const CERE_WALLET_EXTENSION = 'Cere Wallet';

export type CereWalletSignerOptions = {
  permissions?: PermissionRequest;
};

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

  constructor(
    wallet: EmbedWallet,
    private options: CereWalletSignerOptions = {},
  ) {
    super({ extensions: [CERE_WALLET_EXTENSION] });

    this.wallet = wallet;
  }

  async connect() {
    await inject(this.wallet, {
      name: CERE_WALLET_EXTENSION,
      autoConnect: true,
      permissions: this.options.permissions || {
        ed25519_signRaw: {}, // Request permission to sign messages in the login process
      },
    });

    await super.connect();

    return this;
  }
}
