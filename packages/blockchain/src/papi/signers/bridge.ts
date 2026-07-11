import { getPolkadotSigner, type PolkadotSigner } from 'polkadot-api/signer';
import type { Signer } from './types.js';

/**
 * Adapt a chain-free `Signer` to papi's `PolkadotSigner` for extrinsic signing.
 * Delegates to `signer.sign(bytes, 'extrinsic')`. Only sr25519/ed25519 map to a
 * substrate MultiSignature; ecdsa/ethereum chain signing is out of scope.
 */
export function toPolkadotSigner(signer: Signer): PolkadotSigner {
  const scheme = signer.type === 'ed25519' ? 'Ed25519' : signer.type === 'sr25519' ? 'Sr25519' : null;
  if (!scheme) {
    throw new Error(`toPolkadotSigner: cannot bridge signer type '${signer.type}' to a substrate signer`);
  }
  return getPolkadotSigner(signer.publicKey, scheme, (bytes) => signer.sign(bytes, 'extrinsic'));
}
