import type { InjectedAccount } from '@polkadot/extension-inject/types';
import { SignOptions } from '@polkadot/keyring/types';
import { hexToU8a } from '@polkadot/util';
import { decodeAddress, encodeAddress, cryptoWaitReady } from '@polkadot/util-crypto';
import { web3Enable, web3Accounts, isWeb3Injected, web3FromAddress, web3EnablePromise } from '@polkadot/extension-dapp';

import { Signer } from './Signer';
import { CERE_SS58_PREFIX } from '../constants';

export type Web3SignerOptions = {
  address?: string;
  accountIndex?: number;
  originName?: string;
  autoConnect?: boolean;
};

export class Web3Signer extends Signer {
  protected accountAddress?: string;
  protected accountIndex: number;
  protected originName: string;
  protected autoConnect: boolean;
  protected injectedAccount?: InjectedAccount;

  constructor({ address, autoConnect = true, originName = 'DDC', accountIndex = 0 }: Web3SignerOptions = {}) {
    super();

    this.accountAddress = address;
    this.originName = originName;
    this.autoConnect = autoConnect;
    this.accountIndex = accountIndex;
  }

  get address() {
    return this.accountAddress || encodeAddress(this.account.address, CERE_SS58_PREFIX);
  }

  get publicKey() {
    return decodeAddress(this.address, true, CERE_SS58_PREFIX);
  }

  get type() {
    return this.account.type || 'sr25519';
  }

  get isAvailable() {
    return isWeb3Injected;
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

  async sign(message: string | Uint8Array, options?: SignOptions | undefined) {
    const injector = await this.getInjector();
    const data = typeof message === 'string' ? message : message.toString();

    if (!injector.signer.signRaw) {
      throw new Error('Signer does not support signing raw messages');
    }

    const { signature } = await injector.signer.signRaw({ address: this.address, data, type: 'bytes' });

    return hexToU8a(signature);
  }

  async connect() {
    if (!isWeb3Injected) {
      throw new Error('Web3 is not injected');
    }

    await web3Enable(this.originName);
    const accounts = await web3Accounts({
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
