import type { PolkadotSigner } from 'polkadot-api/signer';
import { getInjectedExtensions, connectInjectedExtension, type InjectedPolkadotAccount } from 'polkadot-api/pjs-signer';

/**
 * Wraps a papi-injected browser extension account (PolkadotJs, Talisman, ...).
 * The extension itself does the signing — this class is a thin adapter over
 * the account papi's `pjs-signer` hands back.
 *
 * Extension discovery/connection (`getInjectedExtensions`/`connectInjectedExtension`)
 * reads `window.injectedWeb3`, so it only works in a browser with the
 * extension installed. Unlike the legacy `Web3Signer`/`CereWalletSigner`
 * split, the `./papi` build (`tsc -p tsconfig.papi.json`) does not do
 * `.node` module substitution, so this file is what ships for both browser
 * and Node — `fromExtension()` guards against `window` being undefined and
 * throws a clear error instead of a bare `ReferenceError` from Node.
 *
 * NOTE: not yet wired to the chain-free `Signer` interface (2d-i Task 1) —
 * this class exposes the raw `getPolkadotSigner()` shape it always has, and
 * is not currently exported from `./index.js`. Left for a later 2d-i task.
 */
export class ExtensionSigner {
  constructor(private readonly account: InjectedPolkadotAccount) {}

  get address(): string {
    return this.account.address;
  }

  getPolkadotSigner(): PolkadotSigner {
    return this.account.polkadotSigner;
  }

  /**
   * Connects to a named browser extension (e.g. `'polkadot-js'`) and returns
   * one `ExtensionSigner` per account it exposes.
   */
  static async fromExtension(name: string): Promise<ExtensionSigner[]> {
    if (typeof window === 'undefined') {
      throw new Error('ExtensionSigner requires a browser environment');
    }

    const available = getInjectedExtensions();

    if (!available.includes(name)) {
      throw new Error(`Extension "${name}" is not available (found: ${available.join(', ') || 'none'})`);
    }

    const extension = await connectInjectedExtension(name);

    return extension.getAccounts().map((account) => new ExtensionSigner(account));
  }
}
