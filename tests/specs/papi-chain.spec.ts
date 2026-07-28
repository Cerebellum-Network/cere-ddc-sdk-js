import * as fs from 'fs';
import { connect, UriSigner, type CereClient } from '@cere-ddc-sdk/blockchain';

const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;

describeChain('papi chain helpers (live, devnet)', () => {
  // One shared client for the suite: connecting/disconnecting per test churns
  // papi's chainHead subscription and surfaces post-disconnect reconnect noise.
  let client: CereClient;

  beforeAll(() => {
    client = connect({ network: 'devnet' });
  });

  afterAll(() => {
    client?.disconnect();
  });

  it('getCurrentBlockNumber() > 0', async () => {
    expect(await client.chain.getCurrentBlockNumber()).toBeGreaterThan(0);
  }, 60_000);

  it('getAccountFreeBalance() and getNextNonce() for the funded seed', async () => {
    let seed = process.env.CERE_FUNDED_SEED;
    if (!seed) {
      try {
        seed = fs.readFileSync(process.env.HOME + '/.cef/models-seed', 'utf8').trim();
      } catch {
        return;
      }
    }
    const { address } = new UriSigner(seed);
    expect(await client.chain.getAccountFreeBalance(address)).toBeGreaterThan(0n);
    expect(await client.chain.getNextNonce(address)).toBeGreaterThanOrEqual(0);
  }, 60_000);

  it('getChainDecimals() === 10 and formatBalance formats accordingly', async () => {
    expect(await client.chain.getChainDecimals()).toBe(10);
    expect(await client.chain.formatBalance(10_000_000_000n)).toBe('1 CERE');
    expect(await client.chain.formatBalance(15_000_000_000n, false)).toBe('1.5');
  }, 60_000);
});
