import { getPolkadotSigner, type PolkadotSigner } from 'polkadot-api/signer';

/**
 * Adapts an already-connected signing account (e.g. from `@cere/embed-wallet`)
 * to a papi `PolkadotSigner` provider.
 *
 * This is a pure constructor-injection adapter: it takes the address, public
 * key and a raw `(payload) => signature` callback, and does NOT import
 * `@cere/embed-wallet` at all — `@cere/embed-wallet` is an optional peer
 * dependency of this package, and its `Signer.signMessage(message: string):
 * Promise<string>` API signs a *string* and returns a *string* signature
 * (encoding unspecified/not guaranteed stable), which doesn't line up with
 * the raw-bytes-in/raw-bytes-out callback `getPolkadotSigner()` needs. Rather
 * than bake in an encoding guess, the caller supplies the byte-level `sign`
 * callback (wrapping `EmbedWallet#getSigner().signMessage()` — or any other
 * signer — however their app's encoding requires), keeping this class free of
 * a runtime/type dependency on the embed wallet package.
 *
 * `getPolkadotSigner()` prepends the `MultiSignature` variant byte for
 * `scheme` and hashes payloads over 256 bytes, same as any other papi signer.
 *
 * NOTE: not yet wired to the chain-free `Signer` interface (2d-i Task 1) —
 * this class exposes the raw `getPolkadotSigner()` shape it always has, and
 * is not currently exported from `./index.js`. Left for a later 2d-i task.
 */
export class CereWalletSigner {
  constructor(
    readonly address: string,
    private readonly publicKey: Uint8Array,
    private readonly sign: (input: Uint8Array) => Promise<Uint8Array>,
    private readonly scheme: 'Sr25519' | 'Ed25519' = 'Sr25519',
  ) {}

  getPolkadotSigner(): PolkadotSigner {
    return getPolkadotSigner(this.publicKey, this.scheme, this.sign);
  }
}
