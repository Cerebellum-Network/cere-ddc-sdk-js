import { Signer as BcSigner, SignerPayloadRaw } from '@polkadot/types/types';
import { KeyringPair, KeyringOptions } from '@polkadot/keyring/types';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { Keyring } from '@polkadot/keyring';

import { Signer } from './Signer';
import { CERE_SS58_PREFIX } from '../constants';

export type UriSignerOptions = Pick<KeyringOptions, 'type'>;

/**
 * Signer that uses a Substrate URI to create a keypair.
 *
 * @group Signers
 * @extends Signer
 * @example
 *
 * ```typescript
 * const uriSigner = new UriSigner('//Alice', );
 * const signature = await uriSigner.sign('data');
 *
 * console.log(signature);
 * ```
 */
export class UriSigner extends Signer {
  private pair?: KeyringPair;

  constructor(
    private uri: string,
    private options: UriSignerOptions = {},
  ) {
    super();

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

    this.pair = new Keyring({ ss58Format: CERE_SS58_PREFIX, type: this.type }).addFromUri(this.uri);

    return true;
  }

  private getPair() {
    if (this.pair) {
      return this.pair;
    }

    throw new Error('Signer is not ready');
  }

  get type() {
    return this.options.type || 'sr25519';
  }

  get address() {
    return this.getPair().address;
  }

  get publicKey() {
    return this.getPair().publicKey;
  }

  async sign(data: Uint8Array | string) {
    return this.getPair().sign(data);
  }

  async getSigner(): Promise<BcSigner> {
    return {
      signRaw: async ({ data }: SignerPayloadRaw) => {
        const signature = this.getPair().sign(data, { withType: true });

        return {
          id: 0,
          signature: u8aToHex(signature),
        };
      },
    };
  }

  static async create(uri: string, options: UriSignerOptions = {}) {
    const signer = new UriSigner(uri, options);
    await signer.isReady();

    return signer;
  }
}
