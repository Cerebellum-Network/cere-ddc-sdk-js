import * as fs from 'fs';
import { connect, MnemonicSigner } from '@cere-ddc-sdk/blockchain/papi';

const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;

describeChain('papi chain helpers (live, devnet)', () => {
  it('getCurrentBlockNumber() > 0', async () => {
    const client = connect({ network: 'devnet' });
    try {
      expect(await client.chain.getCurrentBlockNumber()).toBeGreaterThan(0);
    } finally {
      client.disconnect();
    }
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
    const client = connect({ network: 'devnet' });
    try {
      const { address } = new MnemonicSigner(seed);
      expect(await client.chain.getAccountFreeBalance(address)).toBeGreaterThan(0n);
      expect(await client.chain.getNextNonce(address)).toBeGreaterThanOrEqual(0);
    } finally {
      client.disconnect();
    }
  }, 60_000);

  it('getChainDecimals() === 10 and formatBalance formats accordingly', async () => {
    const client = connect({ network: 'devnet' });
    try {
      expect(await client.chain.getChainDecimals()).toBe(10);
      expect(await client.chain.formatBalance(10_000_000_000n)).toBe('1 CERE');
      expect(await client.chain.formatBalance(15_000_000_000n, false)).toBe('1.5');
    } finally {
      client.disconnect();
    }
  }, 60_000);
});
