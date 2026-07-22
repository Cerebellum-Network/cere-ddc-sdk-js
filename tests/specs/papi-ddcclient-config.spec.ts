import { DdcClient } from '@cere-ddc-sdk/ddc-client';

// A well-known test mnemonic (same one used across the other offline signer specs) —
// no network access is involved: `DdcClient` validates `clusterId`/`storageUrl` before
// it ever touches the blockchain client.
const seed = 'bottom drive obey lake curtain smoke basket hold race lonely fit walk';

describe('DdcClient config validation (unit, offline)', () => {
  it('throws when clusterId is missing', () => {
    expect(
      () =>
        new DdcClient(seed, {
          blockchain: 'devnet',
          storageUrl: 'https://storage.example',
        } as any),
    ).toThrow(/clusterId/);
  });

  it('throws when storageUrl is missing', () => {
    expect(
      () =>
        new DdcClient(seed, {
          blockchain: 'devnet',
          clusterId: '0x0000000000000000000000000000000000000000000000000000000000000000',
        } as any),
    ).toThrow(/storageUrl/);
  });
});
