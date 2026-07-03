import { KeyringPair, KeyringOptions } from '@polkadot/keyring/types';
import { Keyring } from '@polkadot/keyring';

import { CERE_SS58_PREFIX } from '../constants';
import { KeyringSigner } from './KeyringSigner';

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
export class UriSigner extends KeyringSigner {
  constructor(
    private uri: string,
    private options: UriSignerOptions = {},
  ) {
    super();
  }

  protected createPair(): KeyringPair {
    return new Keyring({ ss58Format: CERE_SS58_PREFIX, type: this.type }).addFromUri(this.uri);
  }

  get type() {
    return this.options.type || 'sr25519';
  }

  static async create(uri: string, options: UriSignerOptions = {}) {
    const signer = new UriSigner(uri, options);
    await signer.isReady();

    return signer;
  }
}
