import type { EmbedWallet, WalletConnectOptions } from '@cere/embed-wallet';

import { Signer, SignerType } from './Signer';
import { Signer } from '@polkadot/types/types';

const CERE_WALLET_EXTENSION = 'Cere Wallet';

export type CereWalletSignerOptions = WalletConnectOptions;

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
export class CereWalletSigner extends Signer {
  readonly type = 'ed25519';
  readonly isLocked = false;

  private currentAddress?: string;
  private currentPublicKey?: Uint8Array;

  constructor(
    private wallet: EmbedWallet,
    private options: CereWalletSignerOptions = {},
  ) {
    super();
  }

  get address() {
    if (!this.currentAddress) {
      throw new Error('Cere Wallet signer is not ready');
    }

    return this.currentAddress;
  }

  get publicKey() {
    if (!this.currentPublicKey) {
      throw new Error('Cere Wallet signer is not ready');
    }

    return this.currentPublicKey;
  }

  getSigner(): Promise<Signer> {}

  isReady(): Promise<boolean> {
    return Promise.resolve(true);
  }

  async sign(data: string): Promise<string> {
    return this.wallet.sign(data);
  }

  async unlock(passphrase?: string) {}

  async connect() {
    return this;
  }
}
