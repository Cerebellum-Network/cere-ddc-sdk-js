import { getPolkadotSigner, type PolkadotSigner } from 'polkadot-api/signer';
import type { Signer } from './types.js';

/**
 * A `Signer` that can supply its own papi `PolkadotSigner` for extrinsic
 * signing — e.g. a browser extension or external wallet that signs extrinsics
 * natively via the chain's signed-payload flow.
 *
 * Such signers MUST be used directly rather than bridged by re-signing raw
 * payload bytes: their raw `sign()` applies data-signing semantics (the
 * polkadot.js extension, for instance, wraps the bytes in `<Bytes>…</Bytes>`
 * before signing), so a signature reconstructed from `sign()` would not verify
 * against the extrinsic payload on-chain (`InvalidTransaction::BadProof`).
 */
export interface NativePolkadotSigner {
  getPolkadotSigner(): PolkadotSigner;
}

const hasNativePolkadotSigner = (s: Signer): s is Signer & NativePolkadotSigner =>
  typeof (s as Partial<NativePolkadotSigner>).getPolkadotSigner === 'function';

/**
 * Adapt a chain-free `Signer` to papi's `PolkadotSigner` for extrinsic signing.
 *
 * A signer that natively signs extrinsics (implements `NativePolkadotSigner`,
 * e.g. `Web3Signer` wrapping a browser extension) is used directly. Otherwise
 * a keypair-style signer is bridged via `signer.sign(bytes, 'extrinsic')` —
 * only sr25519/ed25519 map to a substrate MultiSignature; ecdsa/ethereum chain
 * signing is out of scope.
 */
export function toPolkadotSigner(signer: Signer): PolkadotSigner {
  if (hasNativePolkadotSigner(signer)) {
    return signer.getPolkadotSigner();
  }

  const scheme = signer.type === 'ed25519' ? 'Ed25519' : signer.type === 'sr25519' ? 'Sr25519' : null;
  if (!scheme) {
    throw new Error(`toPolkadotSigner: cannot bridge signer type '${signer.type}' to a substrate signer`);
  }
  return getPolkadotSigner(signer.publicKey, scheme, (bytes) => signer.sign(bytes, 'extrinsic'));
}
