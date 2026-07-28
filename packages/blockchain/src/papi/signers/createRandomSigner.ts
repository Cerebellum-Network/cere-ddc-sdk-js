import { generateMnemonic } from '@polkadot-labs/hdkd-helpers';
import { UriSigner } from './UriSigner.js';

/** A `UriSigner` from a freshly generated mnemonic (used by ddc's sdkToken). */
export function createRandomSigner(opts: { type?: 'sr25519' | 'ed25519' } = {}): UriSigner {
  return new UriSigner(generateMnemonic(), opts);
}
