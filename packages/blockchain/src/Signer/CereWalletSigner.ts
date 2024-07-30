import type { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types';
import { enable } from '@cere/embed-wallet-inject';
import type { EmbedWallet, WalletConnectOptions } from '@cere/embed-wallet';

import { Web3Signer, Web3SignerOptions } from './Web3Signer';
import { cryptoWaitReady } from '../utils';

const CERE_WALLET_EXTENSION = 'Cere Wallet';

export type CereWalletSignerOptions = Pick<Web3SignerOptions, 'autoConnect'> & {
  connectOptions?: WalletConnectOptions;
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
  private extensionPromise: Promise<InjectedExtension>;

  constructor(
    private wallet: EmbedWallet,
    private options: CereWalletSignerOptions = {},
  ) {
    super(options);

    this.extensionPromise = enable(this.wallet, { autoConnect: false }).then((injected) => {
      injected.accounts.get().then(this.setAccount);
      injected.accounts.subscribe(this.setAccount);

      return { ...injected, name: CERE_WALLET_EXTENSION, version: '0.20.0' };
    });
  }

  private setAccount = ([account]: InjectedAccount[]) => {
    this.injectedAccount = account;
  };

  private async syncAccount() {
    const { accounts } = await this.extensionPromise;

    await accounts.get().then(this.setAccount);
  }

  protected async getInjector() {
    return this.extensionPromise;
  }

  /**
   * @inheritdoc
   */
  async isReady() {
    await Promise.all([this.extensionPromise, cryptoWaitReady()]);

    if (this.injectedAccount) {
      return true;
    }

    if (this.autoConnect) {
      await this.connect(this.options.connectOptions);
    }

    /**
     * Make sure the account is synced with the extension.
     */
    await this.syncAccount();

    return true;
  }

  async connect(options?: WalletConnectOptions) {
    await this.wallet.connect(options);

    /**
     * Make sure the account is synced with the extension after connecting the wallet.
     */
    await this.syncAccount();

    return this;
  }
}
