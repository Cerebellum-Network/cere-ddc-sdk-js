import { Blockchain, cryptoWaitReady, decodeAddress } from '@cere-ddc-sdk/blockchain';

import { describeChain, connectChain } from '../helpers';

const ALICE_PUBLIC = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

/** First clusterId whose customerDepositContract is a real (non-zero) address, else undefined. */
async function findContractCluster(blockchain: Blockchain): Promise<`0x${string}` | undefined> {
  const entries = await blockchain.api.query.ddcClusters.clustersGovParams.entries();
  for (const [key, val] of entries) {
    const addr = (val.toJSON() as { customerDepositContract?: string } | null)?.customerDepositContract;
    if (addr && !decodeAddress(addr).every((b) => b === 0)) {
      return key.args[0].toHex() as `0x${string}`;
    }
  }
  return undefined;
}

describeChain('Chain compatibility (live)', () => {
  let blockchain: Blockchain;

  beforeAll(async () => {
    await cryptoWaitReady();
    blockchain = await connectChain();
  }, 60_000);

  afterAll(async () => {
    await blockchain?.disconnect();
  });

  it('connects and reads the current block number', async () => {
    expect(await blockchain.getCurrentBlockNumber()).toBeGreaterThan(0);
  });

  it('builds a ddcClustersGov proposal against live metadata without throwing', () => {
    const clusterId = '0x0000000000000000000000000000000000000001';
    expect(() =>
      blockchain.ddcClustersGov.proposeActivateClusterProtocol(clusterId, {
        treasuryShare: 0, validatorsShare: 0, clusterReserveShare: 0,
        storageBondSize: 0n, storageChillDelay: 0, storageUnbondingDelay: 0,
        unitPerMbStored: 0n, unitPerMbStreamed: 0n, unitPerPutRequest: 0n, unitPerGetRequest: 0n,
      }),
    ).not.toThrow();
  });

  it('confirms ddcStaking.serve was removed from the runtime', () => {
    expect(blockchain.api.tx.ddcStaking.serve).toBeUndefined();
  });

  it('decodes clustersGovParams into ClusterProtocolParams including customerDepositContract', async () => {
    const entries = await blockchain.api.query.ddcClusters.clustersGovParams.entries();
    // Skip cleanly on a chain with no clusters configured yet.
    if (entries.length === 0) return;
    const params = entries[0][1].toJSON() as Record<string, unknown>;
    expect(params).toHaveProperty('customerDepositContract');
  });

  // Cases from Tasks 3, 4/5 are added here.
});
