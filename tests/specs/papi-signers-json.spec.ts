import { JsonSigner, UriSigner } from '@cere-ddc-sdk/blockchain/papi';
import { sr25519 } from '@polkadot-labs/hdkd-helpers';

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

  it('wrong passphrase throws', () => {
    expect(() => new JsonSigner(KEYSTORE, 'wrong')).toThrow();
  });
});
