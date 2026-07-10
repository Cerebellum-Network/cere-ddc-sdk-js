import { getPolkadotSigner, type PolkadotSigner } from 'polkadot-api/signer';
import { sr25519CreateDerive, ed25519CreateDerive } from '@polkadot-labs/hdkd';
import { entropyToMiniSecret, mnemonicToEntropy, ss58Address, DEV_PHRASE } from '@polkadot-labs/hdkd-helpers';

import type { CereSigner } from './types.js';

/** Cere's ss58 address format. */
const CERE_SS58 = 54;

/**
 * Signs with a keypair derived from a mnemonic/URI (`<phrase>//hard/soft`),
 * mirroring `@polkadot/keyring`'s `addFromUri` derivation-path convention —
 * an empty phrase (e.g. a bare `//Alice`) falls back to the well-known dev
 * phrase, same as the legacy keyring does for well-known dev/test accounts.
 *
 * Wraps the hdkd-derived keypair as a papi `PolkadotSigner` via
 * `getPolkadotSigner()`, so it can be passed directly to any papi
 * `.signAndSubmit()` / `.sign()` call.
 */
export class MnemonicSigner implements CereSigner {
  readonly address: string;
  private readonly signer: PolkadotSigner;

  constructor(uri: string, opts: { type?: 'sr25519' | 'ed25519' } = {}) {
    // Split `//hard/soft` derivation off the phrase, mirroring keyring URIs.
    const [phrase, ...paths] = uri.split('//');
    const mini = entropyToMiniSecret(mnemonicToEntropy(phrase.trim() || DEV_PHRASE));
    const derive = (opts.type === 'ed25519' ? ed25519CreateDerive : sr25519CreateDerive)(mini);
    const kp = derive(paths.length ? '//' + paths.join('//') : '');
    const scheme = opts.type === 'ed25519' ? 'Ed25519' : 'Sr25519';

    this.signer = getPolkadotSigner(kp.publicKey, scheme, kp.sign);
    this.address = ss58Address(kp.publicKey, CERE_SS58);
  }

  getPolkadotSigner(): PolkadotSigner {
    return this.signer;
  }
}
