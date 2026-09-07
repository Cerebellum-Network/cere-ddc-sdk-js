import { getInjectedExtensions, connectInjectedExtension, type InjectedPolkadotAccount } from 'polkadot-api/pjs-signer';
import type { PolkadotSigner } from 'polkadot-api/signer';
import type { Signer, SignIntent, SignerType } from './types.js';
import type { NativePolkadotSigner } from './bridge.js';

/**
 * Wraps a papi-injected browser-extension account (PolkadotJs, Talisman, ...)
 * as a chain-free `Signer`. The extension itself does the signing — `sign()`
 * delegates to the account's papi signer `signBytes`.
 *
 * Extension discovery/connection (`getInjectedExtensions`/`connectInjectedExtension`)
 * reads `window.injectedWeb3`, so it only works in a browser with the
 * extension installed. The `./papi` build (`tsc -p tsconfig.papi.json`) does
 * not do `.node` module substitution, so this file is what ships for both
 * browser and Node — `fromExtension()` guards against `window` being
 * undefined and throws a clear error instead of a bare `ReferenceError`.
 */
export class Web3Signer implements Signer, NativePolkadotSigner {
  constructor(private readonly account: InjectedPolkadotAccount) {}

  get address(): string {
    return this.account.address;
  }
  get publicKey(): Uint8Array {
    return this.account.polkadotSigner.publicKey;
  }
  get type(): SignerType {
    // InjectedPolkadotAccount.type is the optional keypair type ('ed25519' |
    // 'sr25519' | 'ecdsa') the extension reports; default to sr25519 if absent.
    return this.account.type ?? 'sr25519';
  }
  async isReady(): Promise<boolean> {
    return true;
  }
  // Data signing (auth tokens / payloads). Uses the extension's raw
  // `signBytes` — NOT for extrinsics: extrinsics are signed natively via
  // `getPolkadotSigner()` below (see the BadProof note there).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sign(bytes: Uint8Array, _intent?: SignIntent): Promise<Uint8Array> {
    return this.account.polkadotSigner.signBytes(bytes);
  }

  /**
   * The extension account's native papi signer, used for extrinsic signing.
   * The extension signs extrinsics via its signed-payload flow; reconstructing
   * an extrinsic signature from `sign()`/`signBytes` (data signing, which the
   * extension wraps in `<Bytes>…</Bytes>`) would fail on-chain with BadProof.
   */
  getPolkadotSigner(): PolkadotSigner {
    return this.account.polkadotSigner;
  }

  /**
   * Connects to a named browser extension (e.g. `'polkadot-js'`) and returns
   * one `Web3Signer` per account it exposes.
   */
  static async fromExtension(name: string): Promise<Web3Signer[]> {
    if (typeof window === 'undefined') {
      throw new Error('Web3Signer requires a browser environment');
    }

    const available = getInjectedExtensions();

    if (!available.includes(name)) {
      throw new Error(`Extension "${name}" is not available (found: ${available.join(', ') || 'none'})`);
    }

    const extension = await connectInjectedExtension(name);

    return extension.getAccounts().map((account) => new Web3Signer(account));
  }
}
