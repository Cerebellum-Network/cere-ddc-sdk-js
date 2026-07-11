import { sr25519CreateDerive, ed25519CreateDerive } from '@polkadot-labs/hdkd';
import { entropyToMiniSecret, mnemonicToEntropy } from '@polkadot-labs/hdkd-helpers';
import { KeyringSigner, type KeyPair } from './KeyringSigner.js';

/**
 * A `Signer` from a mnemonic/seed with an optional `//hard/soft` derivation
 * path (keyring URI convention). An empty phrase is rejected (no silent dev
 * phrase). sr25519 by default; pass `{ type: 'ed25519' }` for ed25519.
 */
export class UriSigner extends KeyringSigner {
  constructor(uri: string, opts: { type?: 'sr25519' | 'ed25519' } = {}) {
    const [phrase, ...paths] = uri.split('//');
    const trimmed = phrase.trim();
    if (!trimmed) throw new Error('UriSigner: empty mnemonic/URI');

    const mini = entropyToMiniSecret(mnemonicToEntropy(trimmed));
    const type = opts.type ?? 'sr25519';
    const derive = (type === 'ed25519' ? ed25519CreateDerive : sr25519CreateDerive)(mini);
    const kp = derive(paths.length ? '//' + paths.join('//') : '') as KeyPair;
    super(kp, type);
  }
}
