import { connect } from '@cere-ddc-sdk/blockchain/papi';

// Self-contained gate: this suite runs under the native-ESM jest config
// (jest.papi.config.ts) and must not pull in the legacy `@cere-ddc-sdk/blockchain`
// (@polkadot/api) or the `../helpers` barrel (`internal-ip`), which don't load cleanly
// under jest's ESM VM. `describe` exists in the spec eval context, so this is safe here.
const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;

// devnet implements papi's new JSON-RPC (chainHead_v1) natively. testnet/mainnet public
// RPCs don't yet, and need a version-matched @polkadot-api/polkadot-sdk-compat shim
// (tracked follow-up) — so this suite exercises the papi core against devnet.
describeChain('papi core (live, devnet)', () => {
  it('connects and reads a typed clustersGovParams entry (snake_case fields)', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const entries = await client.api.query.DdcClusters.ClustersGovParams.getEntries();
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].value).toHaveProperty('customer_deposit_contract');
    } finally {
      client.disconnect();
    }
  }, 60_000);

  it('reads the current block number', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const blockNumber = await client.api.query.System.Number.getValue();
      expect(blockNumber).toBeGreaterThan(0);
    } finally {
      client.disconnect();
    }
  }, 60_000);
});
