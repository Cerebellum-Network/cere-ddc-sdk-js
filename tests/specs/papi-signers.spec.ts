import * as fs from 'fs';
import { UriSigner, createRandomSigner, isSigner, toPolkadotSigner, connect } from '@cere-ddc-sdk/blockchain';
import { sr25519, ed25519 } from '@polkadot-labs/hdkd-helpers';

describe('papi signers (unit)', () => {
  it('UriSigner (sr25519) exposes type/address/publicKey and signs verifiably', async () => {
    const seed = 'bottom drive obey lake curtain smoke basket hold race lonely fit walk'; // well-known test mnemonic
    const s = new UriSigner(seed);
    expect(s.type).toBe('sr25519');
    expect(typeof s.address).toBe('string');
    expect(s.publicKey).toBeInstanceOf(Uint8Array);
    expect(await s.isReady()).toBe(true);
    const msg = new TextEncoder().encode('hello ddc');
    const sig = await s.sign(msg);
    expect(sig).toBeInstanceOf(Uint8Array);
    // sr25519/ed25519 Curve.verify's arg order is (signature, message, publicKey) —
    // there is no standalone `verify` export from @polkadot-labs/hdkd-helpers.
    expect(sr25519.verify(sig, msg, s.publicKey)).toBe(true);
  });

  it('UriSigner (ed25519) signs verifiably and has type ed25519', async () => {
    const seed = 'bottom drive obey lake curtain smoke basket hold race lonely fit walk';
    const s = new UriSigner(seed, { type: 'ed25519' });
    expect(s.type).toBe('ed25519');
    const msg = new TextEncoder().encode('hello ddc');
    const sig = await s.sign(msg);
    expect(ed25519.verify(sig, msg, s.publicKey)).toBe(true);
  });

  it('empty URI throws', () => {
    expect(() => new UriSigner('   ')).toThrow();
  });

  it('createRandomSigner produces a working sr25519 signer', async () => {
    const s = createRandomSigner();
    const msg = new Uint8Array([1, 2, 3]);
    const sig = await s.sign(msg);
    expect(sr25519.verify(sig, msg, s.publicKey)).toBe(true);
  });

  it('createRandomSigner({ type: "ed25519" }) produces a working ed25519 signer', async () => {
    const s = createRandomSigner({ type: 'ed25519' });
    expect(s.type).toBe('ed25519');
    const msg = new Uint8Array([1, 2, 3]);
    const sig = await s.sign(msg);
    expect(ed25519.verify(sig, msg, s.publicKey)).toBe(true);
  });

  it('isSigner accepts a UriSigner and a plain @cef-ai/signer-shaped object; rejects malformed', () => {
    expect(isSigner(new UriSigner('bottom drive obey lake curtain smoke basket hold race lonely fit walk'))).toBe(true);
    expect(
      isSigner({
        type: 'sr25519',
        address: '5x',
        publicKey: new Uint8Array(32),
        isReady: async () => true,
        sign: async () => new Uint8Array(),
      }),
    ).toBe(true);
    expect(isSigner({ address: '5x' })).toBe(false);
    expect(isSigner(null)).toBe(false);
    // A raw papi PolkadotSigner (publicKey/signTx/signBytes, no type/address/isReady/sign)
    // must NOT be misclassified as a chain-free Signer — resolveSigner (tx.ts) relies on
    // this to pass such objects through unbridged rather than routing them through
    // toPolkadotSigner.
    expect(
      isSigner({
        publicKey: new Uint8Array(32),
        signTx: async () => new Uint8Array(),
        signBytes: async () => new Uint8Array(),
      }),
    ).toBe(false);
  });

  it('toPolkadotSigner throws for an unbridgeable type', () => {
    const fake = {
      type: 'ethereum' as const,
      address: '0x',
      publicKey: new Uint8Array(20),
      isReady: async () => true,
      sign: async () => new Uint8Array(),
    };
    expect(() => toPolkadotSigner(fake)).toThrow();
  });
});

const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;
describeChain('papi signers (live, devnet)', () => {
  it('a UriSigner signs and submits a real System.remark via the bridge', async () => {
    let seed = process.env.CERE_FUNDED_SEED;
    if (!seed) {
      try {
        seed = fs.readFileSync(process.env.HOME + '/.cef/models-seed', 'utf8').trim();
      } catch {
        return;
      }
    }
    const client = connect({ network: 'devnet' });
    try {
      const { Binary } = await import('polkadot-api');
      const signer = new UriSigner(seed);
      const res = await client.tx.send(client.api.tx.System.remark({ remark: Binary.fromText('2d-i') }) as any, {
        signer,
      });
      expect(res.txHash).toMatch(/^0x/);
    } finally {
      client.disconnect();
    }
  }, 120_000);
});
