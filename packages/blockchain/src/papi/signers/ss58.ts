import { ss58Address, ss58Decode } from '@polkadot-labs/hdkd-helpers';
import { CERE_SS58 } from './KeyringSigner.js';

/**
 * Encode a public key (or re-encode an address) to a Cere ss58 address.
 * papi-native replacement for `@polkadot/util-crypto`'s `encodeAddress`.
 */
export function encodeAddress(publicKeyOrAddress: Uint8Array | string, ss58Format: number = CERE_SS58): string {
  const publicKey = typeof publicKeyOrAddress === 'string' ? ss58Decode(publicKeyOrAddress)[0] : publicKeyOrAddress;
  return ss58Address(publicKey, ss58Format);
}

/** Decode an ss58 address to its raw public key. papi-native `decodeAddress`. */
export function decodeAddress(address: string): Uint8Array {
  return ss58Decode(address)[0];
}
