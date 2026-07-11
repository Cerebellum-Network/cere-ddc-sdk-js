import { JsonSigner, UriSigner } from '@cere-ddc-sdk/blockchain/papi';
import { sr25519, ed25519 } from '@polkadot-labs/hdkd-helpers';

// A keystore JSON exported (via `Keyring#toJson`) for the well-known dev mnemonic
// ('bottom drive obey lake curtain smoke basket hold race lonely fit walk') at
// passphrase 'pass', so the address + signature verification are deterministic.
const KEYSTORE = {
  encoded:
    'W8K5Vp7vVZ+e07pLNWqrU5rjKsHrQtpZqiJYn3yK2LAAAAIAAQAAAAgAAACY2FtXtK23wuXdI7AXzM1+55OlOJ5lmr7SwwPUfHtRm7Z4d8Zr2awKXIDY5JpaNOqDKU+WnraeLxndYrRwPx6X27Zd9RvKg2ewdxXDCcwI68eYZJbEe/M2HuTDbiZWFzcBLiA7gO18Ou7qSzu9Jv0UV+4Y/1dUBk7nGX3tyvSCqZUhe0YzqVIIoVKRNcEBdbRkCtxhwTxWw07ydteo',
  encoding: { content: ['pkcs8', 'sr25519'], type: ['scrypt', 'xsalsa20-poly1305'], version: '3' },
  address: '6R7cNsuTsJ63DqESPJnvh8wAzE8DCqhREvKsW44neV96DHfv',
  meta: {},
};
const PASSPHRASE = 'pass';
const MNEMONIC = 'bottom drive obey lake curtain smoke basket hold race lonely fit walk';

// An ed25519 keystore JSON for the same well-known dev mnemonic + passphrase, generated
// via `@polkadot/keyring`'s `Keyring({ type: 'ed25519' }).addFromSeed(...).toJson('pass')`
// from the mini-secret derived the same way `UriSigner`/hdkd does (empty derivation path).
// Regenerate with a throwaway script if this mnemonic/passphrase ever changes; verify the
// round-trip (decrypt + sign + `ed25519.verify`) before pasting a new fixture.
const ED25519_KEYSTORE = {
  encoded:
    'wGmba4olS195Z+2Fy5X/ps79Q2dT8cq8aFRFsvHK02MAAAIAAQAAAAgAAADOFLGic8lPljiGAh6dNbXvyOhYX6Sy4ra4SR4xEkTy/dHyoPI7ebUIy5PROyZ7X8W7JfHO9A+MMGjIEO07+izynuov+d9Y4TUyHTolHpreXETpSPfmUtXOS+sLMMFqENC6CKsGRuAh9NFWNoO1dUDoAoNiHR8SZ7ZpUT4pSky82cjm8Jfk8P0sgThFGcFbXl7bLwbtteaVtZ0MvNHK',
  encoding: { content: ['pkcs8', 'ed25519'], type: ['scrypt', 'xsalsa20-poly1305'], version: '3' },
  address: '6QhDM2PNg6KKhKAxAzjjwPWzx2wus2HEPk5KCy4G2A5WDRXj',
  meta: {},
};

describe('papi JsonSigner (unit)', () => {
  it('decrypts a keystore and signs verifiably; address matches', async () => {
    const s = new JsonSigner(KEYSTORE, PASSPHRASE);
    expect(s.type).toBe('sr25519');
    expect(s.address).toBe(KEYSTORE.address);
    expect(s.address).toBe(new UriSigner(MNEMONIC).address);
    const msg = new Uint8Array([1, 2, 3]);
    const sig = await s.sign(msg);
    expect(sr25519.verify(sig, msg, s.publicKey)).toBe(true);
  });

  it('decrypts an ed25519 keystore and signs verifiably; address matches', async () => {
    const s = new JsonSigner(ED25519_KEYSTORE, PASSPHRASE);
    expect(s.type).toBe('ed25519');
    expect(s.address).toBe(ED25519_KEYSTORE.address);
    expect(s.address).toBe(new UriSigner(MNEMONIC, { type: 'ed25519' }).address);
    const msg = new Uint8Array([1, 2, 3]);
    const sig = await s.sign(msg);
    // ed25519.verify's arg order is (signature, message, publicKey).
    expect(ed25519.verify(sig, msg, s.publicKey)).toBe(true);
  });

  it('wrong passphrase throws', () => {
    expect(() => new JsonSigner(KEYSTORE, 'wrong')).toThrow();
  });
});
