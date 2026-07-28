import * as fs from 'fs';
import { DdcClient } from '@cere-ddc-sdk/ddc-client';
import { connect, type ClusterId } from '@cere-ddc-sdk/blockchain';

const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;

const STORAGE_URL = 'https://storage.devnet.dragon-1.xyz';
const CDN_URL = 'https://cdn.devnet.dragon-1.xyz';

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

/**
 * Discovers the first devnet cluster id via a short-lived papi client, so the tests
 * below don't hardcode a cluster id that could drift/disappear on the live devnet.
 */
async function discoverClusterId(): Promise<ClusterId> {
  const probe = connect({ network: 'devnet' });
  try {
    const [first] = await probe.clusters.listClusters();

    return first.clusterId;
  } finally {
    probe.disconnect();
  }
}

describeChain('DdcClient chain path (live, devnet)', () => {
  it('constructs over the papi client and reads balance', async () => {
    const seed = fundedSeed();
    if (!seed) return;

    const clusterId = await discoverClusterId();
    const ddc = await DdcClient.create(seed, {
      blockchain: 'devnet',
      clusterId,
      storageUrl: STORAGE_URL,
      cdnUrl: CDN_URL,
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

    const clusterId = await discoverClusterId();
    const ddc = await DdcClient.create(seed, {
      blockchain: 'devnet',
      clusterId,
      storageUrl: STORAGE_URL,
      cdnUrl: CDN_URL,
    });
    try {
      const deposit = await ddc.getDeposit();
      expect(typeof deposit).toBe('bigint');
    } finally {
      await ddc.disconnect();
    }
  }, 120_000);
});
