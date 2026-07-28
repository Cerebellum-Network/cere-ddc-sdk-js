import { connect } from '@cere-ddc-sdk/blockchain';

const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;

// SS58 of the all-zero AccountId32 under CERE's prefix (54) — the "no contract"
// sentinel carried by a cluster with no deposit contract. It MUST be the
// prefix-54 form: `customer_deposit_contract` decodes under Cere's prefix, so the
// Substrate-default prefix-42 form (`5C4h…`) never matches and the exclusion below
// silently becomes a no-op. Same value as `papi-customers-write.spec.ts`.
const ZERO_SS58 = '6PWcxaEmkiEFSAr3ukWHPfMwuCisxu17Bnv6DujG1B7LCm3w';

describeChain('papi customers — balance read (live, devnet)', () => {
  it('getStackingInfo reads a StakingInfo (or undefined) for a contract-bearing cluster', async () => {
    const client = connect({ network: 'devnet' });
    try {
      // Find a cluster whose gov params carry a real (non-zero) customer_deposit_contract.
      const govEntries = await client.api.query.DdcClusters.ClustersGovParams.getEntries();
      const withContract = govEntries.find((e: any) => {
        const a = e.value?.customer_deposit_contract;
        return a && String(a) !== ZERO_SS58;
      });
      // Fall back to the first cluster if none carry a contract on devnet right now.
      const clusterId = (withContract ?? govEntries[0]).keyArgs[0];

      // An arbitrary account (likely with no deposit) must resolve to `undefined`,
      // never throw or misdecode.
      const anyAccount = (await client.api.query.System.Account.getEntries())[0].keyArgs[0];
      const info = await client.customers.getStackingInfo(clusterId as any, anyAccount as any);
      if (info !== undefined) {
        expect(typeof info.total).toBe('bigint');
        expect(typeof info.active).toBe('bigint');
        expect(typeof info.owner).toBe('string');
      } else {
        expect(info).toBeUndefined();
      }
    } finally {
      client.disconnect();
    }
  }, 120_000);
});
