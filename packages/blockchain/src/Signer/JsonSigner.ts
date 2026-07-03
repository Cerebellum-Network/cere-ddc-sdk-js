import { KeyringPair, KeyringPair$Json } from '@polkadot/keyring/types';
import { Keyring } from '@polkadot/keyring';

import { KeyringSigner } from './KeyringSigner';
import { CERE_SS58_PREFIX } from '../constants';

type JsonSignerOptions = {
  passphrase?: string;
};

/**
 * Signer that uses a JSON object to create a keypair.
 *
 * @group Signers
 * @extends Signer
 * @example
 *
 * ```typescript
 * const accountDataJson = {}; // Exported from Cere Wallet or other wallets
 * const jsonSigner = new JsonSigner(accountDataJson, { passphrase: '1234' });
 * const signature = await jsonSigner.sign('data');
 *
 * console.log(signature);
 * ```
 */
export class JsonSigner extends KeyringSigner {
  constructor(
    private account: KeyringPair$Json,
    private options: JsonSignerOptions = {},
  ) {
    super();
  }

  protected createPair(): KeyringPair {
    const keyPair = new Keyring({ ss58Format: CERE_SS58_PREFIX }).addFromJson(this.account);

    if (this.options.passphrase) {
      keyPair.unlock(this.options.passphrase);
    }

    return keyPair;
  }

  static async create(account: KeyringPair$Json) {
    const signer = new JsonSigner(account);
    await signer.isReady();

    return signer;
  }
}
