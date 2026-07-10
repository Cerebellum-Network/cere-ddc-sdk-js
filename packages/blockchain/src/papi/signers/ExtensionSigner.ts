import type { PolkadotSigner } from 'polkadot-api/signer';
import { getInjectedExtensions, connectInjectedExtension, type InjectedPolkadotAccount } from 'polkadot-api/pjs-signer';

import type { CereSigner } from './types.js';

/**
 * Wraps a papi-injected browser extension account (PolkadotJs, Talisman, ...)
 * as a `CereSigner`. The extension itself does the signing — this class is a
 * thin adapter over the account papi's `pjs-signer` hands back.
 *
 * Extension discovery/connection (`getInjectedExtensions`/`connectInjectedExtension`)
 * reads `window.injectedWeb3`, so it only works in a browser with the
 * extension installed; see `ExtensionSigner.node.ts` for the Node stub that
 * throws with a clear message instead of a bare `window is not defined`.
 */
export class ExtensionSigner implements CereSigner {
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
    const available = getInjectedExtensions();

    if (!available.includes(name)) {
      throw new Error(`Extension "${name}" is not available (found: ${available.join(', ') || 'none'})`);
    }

    const extension = await connectInjectedExtension(name);

    return extension.getAccounts().map((account) => new ExtensionSigner(account));
  }
}
