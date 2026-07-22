import * as fs from 'fs';
import { DdcClient } from '@cere-ddc-sdk/ddc-client';

const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;

function fundedSeed(): string | undefined {
  let s = process.env.CERE_FUNDED_SEED;
  if (!s) {
    try {
      s = fs.readFileSync(process.env.HOME + '/.cef/models-seed', 'utf8').trim();
    } catch {
      /* no funded seed available — the tests below no-op */
    }
  }
  return s;
}

describeChain('DdcClient chain path (live, devnet)', () => {
  it('constructs over the papi client and reads balance', async () => {
    const seed = fundedSeed();
    if (!seed) return;

    // TODO(Task 4): `clusterId`/`storageUrl` are placeholders here just to satisfy the
    // new single-cluster `DdcClientConfig` at compile time; update this chain spec to
    // use real values once Task 4 wires up the chain-test fixtures.
    const ddc = await DdcClient.create(seed, {
      blockchain: 'devnet',
      clusterId: '0x0000000000000000000000000000000000000000000000000000000000000000',
      storageUrl: 'https://storage.devnet.cere.network',
    });
    try {
      const balance = await ddc.getBalance();
      expect(balance).toBeGreaterThan(0n);
    } finally {
      await ddc.disconnect();
    }
  }, 120_000);

  it('reads a deposit for a contract-bearing cluster', async () => {
    const seed = fundedSeed();
    if (!seed) return;

    // TODO(Task 4): `clusterId`/`storageUrl` are placeholders here just to satisfy the
    // new single-cluster `DdcClientConfig` at compile time; update this chain spec to
    // use real values once Task 4 wires up the chain-test fixtures.
    const ddc = await DdcClient.create(seed, {
      blockchain: 'devnet',
      clusterId: '0x0000000000000000000000000000000000000000000000000000000000000000',
      storageUrl: 'https://storage.devnet.cere.network',
    });
    try {
      // Discover a cluster id from chain via a fresh papi client.
      const { connect } = await import('@cere-ddc-sdk/blockchain');
      const probe = connect({ network: 'devnet' });
      const clusterId = (await probe.clusters.listClusters())[0].clusterId;
      probe.disconnect();

      const deposit = await ddc.getDeposit(clusterId);
      expect(typeof deposit).toBe('bigint');
    } finally {
      await ddc.disconnect();
    }
  }, 120_000);
});
