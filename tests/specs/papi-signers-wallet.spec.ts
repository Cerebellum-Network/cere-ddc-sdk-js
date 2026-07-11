import { CereWalletSigner, isSigner, toPolkadotSigner } from '@cere-ddc-sdk/blockchain/papi';

describe('papi wallet signers (unit)', () => {
  it('CereWalletSigner surfaces address/publicKey/type and delegates sign()', async () => {
    const calls: Uint8Array[] = [];
    const signFn = async (b: Uint8Array) => {
      calls.push(b);
      return new Uint8Array([9, 9]);
    };
    const s = new CereWalletSigner('6Cere...addr', new Uint8Array(32).fill(7), signFn, 'sr25519');
    expect(isSigner(s)).toBe(true);
    expect(s.type).toBe('sr25519');
    expect(Array.from(s.publicKey)).toEqual(Array(32).fill(7));
    const msg = new Uint8Array([1, 2, 3]);
    expect(Array.from(await s.sign(msg))).toEqual([9, 9]);
    expect(calls).toHaveLength(1);
    expect(Array.from(calls[0])).toEqual([1, 2, 3]);
  });

  it('CereWalletSigner bridges to a PolkadotSigner (sr25519)', () => {
    const s = new CereWalletSigner(
      '6Cere...addr',
      new Uint8Array(32).fill(7),
      async () => new Uint8Array(64),
      'sr25519',
    );
    const ps = toPolkadotSigner(s);
    expect(ps.publicKey).toBeInstanceOf(Uint8Array);
  });

  it('Web3Signer.fromExtension throws outside a browser', async () => {
    const { Web3Signer } = await import('@cere-ddc-sdk/blockchain/papi');
    await expect(Web3Signer.fromExtension('polkadot-js')).rejects.toThrow(/browser/);
  });
});
