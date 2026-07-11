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

    const ddc = await DdcClient.create(seed, { blockchain: 'devnet' });
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

    const ddc = await DdcClient.create(seed, { blockchain: 'devnet' });
    try {
      // Discover a cluster id from chain via a fresh papi client.
      const { connect } = await import('@cere-ddc-sdk/blockchain/papi');
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
