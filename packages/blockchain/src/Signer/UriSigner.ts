import { SignOptions, KeyringPair, KeyringOptions } from '@polkadot/keyring/types';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';

import { Signer } from './Signer';

export type UriSignerOptions = Pick<KeyringOptions, 'type'>;

export class UriSigner implements Signer {
  private pair?: KeyringPair;

  constructor(
    private uri: string,
    private options: UriSignerOptions = {},
  ) {
    this.isReady();
  }

  async isReady() {
    if (this.pair) {
      return true;
    }

    const isCryptoReady = await cryptoWaitReady();

    if (!isCryptoReady) {
      return false;
    }

    this.pair = new Keyring({ ss58Format: 54, type: this.type }).addFromUri(this.uri);

    return true;
  }

  private getPair() {
    if (this.pair) {
      return this.pair;
    }

    throw new Error('Signer is not ready');
  }

  get type() {
    return this.options.type || 'ed25519';
  }

  get address() {
    return this.getPair().address;
  }

  get publicKey() {
    return this.getPair().publicKey;
  }

  get addressRaw() {
    return this.getPair().addressRaw;
  }

  sign(data: Uint8Array, options?: SignOptions) {
    return this.getPair().sign(data, options);
  }

  static async create(uri: string, options: UriSignerOptions = {}) {
    const signer = new UriSigner(uri, options);
    await signer.isReady();

    return signer;
  }
}
