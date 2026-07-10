import { cryptoWaitReady } from '@cere-ddc-sdk/blockchain';
import { connect } from '@cere-ddc-sdk/blockchain/papi';

import { describeChain } from '../helpers';

describeChain('papi core (live)', () => {
  beforeAll(async () => {
    await cryptoWaitReady();
  });

  it('connects to devnet and reads a typed clustersGovParams entry (snake_case fields)', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const entries = await client.api.query.DdcClusters.ClustersGovParams.getEntries();
      if (entries.length) expect(entries[0].value).toHaveProperty('customer_deposit_contract');
    } finally {
      client.disconnect();
    }
  }, 60_000);

  it.each(['testnet', 'mainnet'] as const)(
    'connects to %s and reads the current block number',
    async (network) => {
      const client = connect({ network });
      try {
        const blockNumber = await client.api.query.System.Number.getValue();
        expect(blockNumber).toBeGreaterThan(0);
      } finally {
        client.disconnect();
      }
    },
    60_000,
  );
});
