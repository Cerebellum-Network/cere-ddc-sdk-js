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

  // Cases from Tasks 2, 3, 4/5 are added here.
});
