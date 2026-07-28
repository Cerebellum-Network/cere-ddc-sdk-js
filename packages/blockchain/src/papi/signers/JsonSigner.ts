import { decodePair } from '@polkadot/keyring/pair/decode';
import { base64Decode } from '@polkadot/util-crypto';
import type { EncryptedJsonEncoding } from '@polkadot/util-crypto/types';
import { sr25519, ed25519 } from '@polkadot-labs/hdkd-helpers';
import { KeyringSigner, type KeyPair } from './KeyringSigner.js';

/** The shape of a polkadot keystore JSON (as exported by `Keyring#toJson`/apps/extension). */
export interface KeystoreJson {
  encoded: string;
  encoding: { content: string[]; type: string[]; version: string };
  address: string;
  meta?: Record<string, unknown>;
}

/**
 * A `Signer` unlocked from an encrypted polkadot keystore JSON + passphrase.
 * Uses `@polkadot/util-crypto`/`@polkadot/keyring` for the keystore decrypt
 * only (no `@polkadot/api`). Decryption is eager: a wrong passphrase throws
 * from the constructor.
 */
export class JsonSigner extends KeyringSigner {
  constructor(json: KeystoreJson, passphrase: string) {
    const { keypair, type } = decodeKeystore(json, passphrase);
    super(keypair, type);
  }
}

function decodeKeystore(json: KeystoreJson, passphrase: string): { keypair: KeyPair; type: 'sr25519' | 'ed25519' } {
  // encoding.content is e.g. ['pkcs8', 'sr25519'] or ['pkcs8', 'ed25519'].
  const type: 'sr25519' | 'ed25519' = json.encoding.content[1] === 'ed25519' ? 'ed25519' : 'sr25519';

  let decoded: { publicKey: Uint8Array; secretKey: Uint8Array };
  try {
    decoded = decodePair(passphrase, base64Decode(json.encoded), json.encoding.type as EncryptedJsonEncoding[]);
  } catch (cause) {
    throw new Error('JsonSigner: failed to decrypt keystore (likely a wrong passphrase)', { cause });
  }

  const curve = type === 'ed25519' ? ed25519 : sr25519;
  // decodePair's secretKey is the curve's native expanded secret: for sr25519 the
  // full 64-byte schnorrkel-expanded key (used as-is); for ed25519 the nacl-style
  // seed(32) || publicKey(32) pair (only the 32-byte seed is the signing key).
  const secretKey = type === 'ed25519' ? decoded.secretKey.subarray(0, 32) : decoded.secretKey;

  const keypair: KeyPair = {
    publicKey: decoded.publicKey,
    sign: (message: Uint8Array) => curve.sign(message, secretKey),
  };

  return { keypair, type };
}
