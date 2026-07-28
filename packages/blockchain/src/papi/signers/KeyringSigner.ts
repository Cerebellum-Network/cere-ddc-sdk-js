import { ss58Address } from '@polkadot-labs/hdkd-helpers';
import type { Signer, SignIntent } from './types.js';

/** Cere's ss58 address format. */
export const CERE_SS58 = 54;

/** An hdkd-style keypair: a public key and a raw byte-signing function. */
export interface KeyPair {
  readonly publicKey: Uint8Array;
  sign(message: Uint8Array): Uint8Array;
}

/**
 * A `Signer` backed by an in-memory sr25519/ed25519 keypair. Base for
 * `UriSigner`/`JsonSigner`; can also be constructed directly from a keypair.
 */
export class KeyringSigner implements Signer {
  readonly address: string;
  constructor(
    protected readonly keypair: KeyPair,
    readonly type: 'sr25519' | 'ed25519',
  ) {
    this.address = ss58Address(keypair.publicKey, CERE_SS58);
  }
  get publicKey(): Uint8Array {
    return this.keypair.publicKey;
  }
  async isReady(): Promise<boolean> {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sign(bytes: Uint8Array, _intent?: SignIntent): Promise<Uint8Array> {
    return this.keypair.sign(bytes);
  }
}
