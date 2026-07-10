import type { PolkadotSigner } from 'polkadot-api/signer';

/**
 * Common signer interface for the papi surface — wraps a `PolkadotSigner`
 * (papi's low-level signing callback contract) together with the signer's
 * ss58 address. Concrete implementations (mnemonic/URI, wallet extensions,
 * hardware, ...) all converge on this shape.
 */
export interface CereSigner {
  readonly address: string;
  getPolkadotSigner(): PolkadotSigner;
}
