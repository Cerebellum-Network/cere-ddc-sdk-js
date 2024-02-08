import type { InjectedAccount } from '@polkadot/extension-inject/types';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { decodeAddress, encodeAddress, cryptoWaitReady } from '@polkadot/util-crypto';
import { web3Enable, web3Accounts, web3FromAddress, web3EnablePromise } from '@polkadot/extension-dapp';

import { Signer } from './Signer';
import { CERE_SS58_PREFIX } from '../constants';

export type Web3SignerOptions = {
  address?: string;
  accountIndex?: number;
  originName?: string;
  autoConnect?: boolean;
  extensions?: string[];
};

/**
 * Signer that uses browser extensions (eg. PolkadotJs) to sign messages.
 *
 * @group Signers
 * @extends Signer
 * @example
 *
 * ```typescript
 * const web3Signer = new Web3Signer({ autoConnect: true });
 * const signature = await web3Signer.sign('data');
 *
 * console.log(signature);
 * ```
 */
export class Web3Signer extends Signer {
  protected accountAddress?: string;
  protected accountIndex: number;
  protected originName: string;
  protected autoConnect: boolean;
  protected injectedAccount?: InjectedAccount;
  protected extensions?: string[];

  constructor({
    address,
    extensions,
    autoConnect = true,
    originName = 'DDC',
    accountIndex = 0,
  }: Web3SignerOptions = {}) {
    super();

    this.accountAddress = address;
    this.originName = originName;
    this.autoConnect = autoConnect;
    this.accountIndex = accountIndex;
    this.extensions = extensions;
  }

  /**
   * @inheritdoc
   */
  get address() {
    return this.accountAddress || encodeAddress(this.account.address, CERE_SS58_PREFIX);
  }

  /**
   * @inheritdoc
   */
  get publicKey() {
    return decodeAddress(this.address, true, CERE_SS58_PREFIX);
  }

  /**
   * @inheritdoc
   */
  get type() {
    return this.account.type || 'sr25519';
  }

  protected get account() {
    if (!this.injectedAccount) {
      throw new Error('Web3Signer account is not ready');
    }

    return this.injectedAccount;
  }

  protected async getInjector() {
    return web3FromAddress(this.address);
  }

  async getSigner() {
    const { signer } = await this.getInjector();

    return signer;
  }

  async sign(message: string | Uint8Array) {
    const injector = await this.getInjector();
    const data = typeof message === 'string' ? message : u8aToHex(message);

    if (!injector.signer.signRaw) {
      throw new Error('Signer does not support signing raw messages');
    }

    const { signature } = await injector.signer.signRaw({ address: this.address, data, type: 'bytes' });

    return hexToU8a(signature);
  }

  /**
   * Connects to the underlying Web3 signer.
   *
   * @returns A promise that resolves to the signer.
   * @throws An error if the signer cannot be detected.
   *
   * @example
   *
   * ```typescript
   * await web3Signer.connect();
   * ```
   */
  async connect() {
    await web3Enable(this.originName);
    const accounts = await web3Accounts({
      extensions: this.extensions,
      accountType: ['ed25519', 'sr25519'],
    });

    this.injectedAccount = this.accountAddress
      ? accounts.find((account) => account.address === this.accountAddress)
      : accounts[this.accountIndex];

    if (!this.injectedAccount) {
      throw new Error('Web3Signer account cannot be detected');
    }

    return this;
  }

  async isReady() {
    await cryptoWaitReady();

    if (this.injectedAccount) {
      return true;
    }

    if (this.autoConnect) {
      await this.connect();
    }

    await web3EnablePromise;

    return true;
  }
}
