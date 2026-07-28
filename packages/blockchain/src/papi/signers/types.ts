/** Key/curve type. Matches `@cef-ai/signer`'s `SignerType` by value (chain-free seam). */
export type SignerType = 'ed25519' | 'sr25519' | 'ecdsa' | 'ethereum';

/** What the signed bytes are for; wallets may key consent UI on this. Advisory. */
export type SignIntent = 'data' | 'token' | 'extrinsic';

/**
 * A chain-free signer: a key identity plus a raw byte-signing primitive.
 * Structurally identical to `@cef-ai/signer`'s `Signer`, so a signer from
 * either repo (or a CEF wallet) satisfies this interface. Chain use is via
 * `toPolkadotSigner(signer)` — deliberately NOT a method here, to keep the
 * interface free of any chain-library type.
 */
export interface Signer {
  readonly type: SignerType;
  readonly address: string;
  readonly publicKey: Uint8Array;
  isReady(): Promise<boolean>;
  sign(bytes: Uint8Array, intent?: SignIntent): Promise<Uint8Array>;
}

/** Structural guard: validates the full shape (chain-free — does not require any chain method). */
export function isSigner(value: unknown): value is Signer {
  if (!value || typeof value !== 'object') return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.type === 'string' &&
    typeof c.address === 'string' &&
    c.publicKey instanceof Uint8Array &&
    typeof c.isReady === 'function' &&
    typeof c.sign === 'function'
  );
}
