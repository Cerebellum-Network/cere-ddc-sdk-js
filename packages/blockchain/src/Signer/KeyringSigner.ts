import { Signer as BcSigner, SignerPayloadRaw } from '@polkadot/types/types';
import { KeyringPair } from '@polkadot/keyring/types';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

import { Signer } from './Signer';

/**
 * Signer that uses a keyring pair to sign data.
 *
 * @group Signers
 * @extends Signer
 * @example
 *
 * ```typescript
 * const pair = new Keyring().addFromUri('//Alice');
 * const keyringSigner = new KeyringSigner(pair);
 * const signature = await keyringSigner.sign('data');
 *
 * console.log(signature);
 * ```
 */
export class KeyringSigner extends Signer {
  constructor(private pair?: KeyringPair) {
    super();

    this.isReady();
  }

  get isLocked() {
    if (!this.pair) {
      throw new Error('Key pair is not ready!');
    }

    return this.pair.isLocked;
  }

  async unlock(passphrase?: string) {
    await this.isReady();

    if (!this.pair) {
      throw new Error('Key pair is not ready!');
    }

    if (this.pair.isLocked) {
      this.pair.unlock(passphrase);
    }
  }

  protected createPair() {
    if (!this.pair) {
      throw new Error('Key pair is not provided!');
    }

    return this.pair;
  }

  async isReady() {
    if (this.pair) {
      return true;
    }

    const isCryptoReady = await cryptoWaitReady();

    if (!isCryptoReady) {
      return false;
    }

    this.pair = this.createPair();

    return true;
  }

  private getPair() {
    if (this.pair) {
      return this.pair;
    }

    throw new Error('Signer is not ready');
  }

  get type() {
    return this.getPair().type;
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
}
