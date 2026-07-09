import { Blockchain, cryptoWaitReady, decodeAddress, CustomerDepositContracts } from '@cere-ddc-sdk/blockchain';

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
        costPerMbStored: 0n, costPerMbStreamed: 0n, costPerPutRequest: 0n, costPerGetRequest: 0n,
      }),
    ).not.toThrow();
  });

  it('confirms ddcStaking.serve was removed from the runtime', () => {
    expect(blockchain.api.tx.ddcStaking.serve).toBeUndefined();
  });

  it('decodes gov params via the typed getter with defined costPer* fees', async () => {
    const entries = await blockchain.api.query.ddcClusters.clustersGovParams.entries();
    if (entries.length === 0) return;
    const clusterId = entries[0][0].args[0].toHex() as `0x${string}`;
    const params = await blockchain.ddcClusters.getClusterGovernmentParams(clusterId);
    expect(params).toBeDefined();
    // The renamed fee fields must decode to real values, not undefined.
    expect(typeof params!.costPerMbStored).not.toBe('undefined');
    expect(typeof params!.costPerGetRequest).not.toBe('undefined');
    expect(params).toHaveProperty('customerDepositContract');
  });

  it('encodes createCluster gov params under the costPer* field names', () => {
    const clusterId = '0x0000000000000000000000000000000000000001';
    const acct = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const tx = blockchain.ddcClusters.createCluster(clusterId, acct, {}, {
      treasuryShare: 0, validatorsShare: 0, clusterReserveShare: 0,
      storageBondSize: 0n, storageChillDelay: 0, storageUnbondingDelay: 0,
      costPerMbStored: 7n, costPerMbStreamed: 0n, costPerPutRequest: 0n, costPerGetRequest: 0n,
    });
    // The gov-params arg is the 4th (index 3). If the field name were wrong, encoding
    // would silently drop it and this would read 0.
    const govArg = tx.args[3].toJSON() as Record<string, unknown>;
    expect(BigInt(govArg.costPerMbStored as number)).toBe(7n);
  });

  it('resolves a per-cluster deposit contract and reads a balance without throwing', async () => {
    const clusterId = await findContractCluster(blockchain);
    if (!clusterId) return; // no contract-backed cluster on this network — skip cleanly

    const contracts = new CustomerDepositContracts(blockchain.api);
    const contract = await contracts.resolve(clusterId);
    expect(contract).toBeDefined();

    const info = await CustomerDepositContracts.readBalance(contract!, ALICE_PUBLIC);
    // Either a decoded StakingInfo or undefined (account with no deposit) — must not throw.
    expect(info === undefined || typeof info.active === 'bigint').toBe(true);
  });

  it('getStackingInfo routes through the contract for a contract-backed cluster', async () => {
    const clusterId = await findContractCluster(blockchain);
    if (!clusterId) return; // no contract-backed cluster on this network — skip cleanly
    const info = await blockchain.ddcCustomers.getStackingInfo(clusterId, ALICE_PUBLIC);
    expect(info === undefined || typeof info.active === 'bigint').toBe(true);
  });

  // Cases from Tasks 3, 4/5 are added here.
});
