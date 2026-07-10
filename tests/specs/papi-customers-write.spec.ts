import * as fs from 'fs';
import { Binary } from 'polkadot-api';
import { connect, MnemonicSigner } from '@cere-ddc-sdk/blockchain/papi';

const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;

// The all-zero AccountId32, SS58-encoded under Cere's ss58 prefix (54) — the
// "no contract" sentinel `customerDeposit.ts`'s `isNoContract` checks (there,
// via `getSs58AddressInfo`; hardcoded here to avoid adding a new test-package
// dependency). Confirmed live: one of this devnet's 3 clusters carries
// exactly this address as its `customer_deposit_contract`. NOTE: a naive
// `/^0x0+$/` string check (an earlier draft of this helper used) never
// matches — `customer_deposit_contract` decodes to an SS58 string like this,
// never a `0x...` hex string — and silently treated that cluster as "has a
// contract", corrupting cluster selection below.
const ZERO_SS58_CERE = '6PWcxaEmkiEFSAr3ukWHPfMwuCisxu17Bnv6DujG1B7LCm3w';
function isZeroSs58(addr: string): boolean {
  return addr === ZERO_SS58_CERE;
}

function fundedSeed(): string | undefined {
  let seed = process.env.CERE_FUNDED_SEED;
  if (!seed) {
    try {
      seed = fs.readFileSync(process.env.HOME + '/.cef/models-seed', 'utf8').trim();
    } catch {
      /* no funded seed available */
    }
  }
  return seed;
}

interface DepositTarget {
  clusterId: string;
  /** Whether the signer already has a deposit at this cluster (top up via depositExtra) or not (first deposit via deposit). */
  alreadyPaired: boolean;
}

// Picks a cluster with a live (non-zero) customer_deposit_contract, so the
// round-trip exercises the ink! contract path (Task 1) rather than silently
// falling back to the pallet ledger. Prefers a cluster the signer isn't yet
// paired to (exercises `deposit()`'s first-time path); if the funded seed is
// already paired everywhere (e.g. a prior run of this same test), falls back
// to topping up via `depositExtra()` so the test stays green on reruns —
// verified live: the ink `deposit` message's underlying pallet call rejects a
// second `deposit` on an already-paired account with `DdcCustomers.AlreadyPaired`,
// while `depositExtra` succeeds either way.
async function pickDepositTarget(client: any, address: string): Promise<DepositTarget | undefined> {
  const entries = await client.api.query.DdcClusters.ClustersGovParams.getEntries();
  const withContract = entries
    .map((e: any) => ({ clusterId: e.keyArgs[0] as string, addr: e.value?.customer_deposit_contract }))
    .filter((e: any) => e.addr && !isZeroSs58(String(e.addr)));
  if (withContract.length === 0) return undefined;
  for (const c of withContract) {
    const info = await client.customers.getStackingInfo(c.clusterId as any, address);
    if (!info) return { clusterId: c.clusterId, alreadyPaired: false };
  }
  return { clusterId: withContract[0].clusterId, alreadyPaired: true };
}

describeChain('papi customers — deposit writes (live, devnet)', () => {
  it('real deposit round-trip increases the contract balance', async () => {
    const seed = fundedSeed();
    if (!seed) return;
    const client = connect({ network: 'devnet' });
    try {
      const target = await pickDepositTarget(client, new MnemonicSigner(seed).address);
      if (!target) return; // no contract-bearing cluster on devnet right now — skip
      const { clusterId, alreadyPaired } = target;
      const signer = new MnemonicSigner(seed);
      const before = await client.customers.getStackingInfo(clusterId as any, signer.address);
      // Must clear the chain's ExistentialDeposit (10_000_000_000 on devnet) —
      // the contract's deposit message rejects a value at or below the
      // minimum balance for a new/topped-up deposit account (verified live:
      // a 10_000_000 "tiny" deposit reverted `DdcCustomers.InsufficientDeposit`).
      const amount = 20_000_000_000n;
      const tx = alreadyPaired
        ? await client.customers.depositExtra(clusterId as any, amount)
        : await client.customers.deposit(clusterId as any, amount);
      const res = await client.tx.send(tx, { signer });
      expect(res.txHash).toMatch(/^0x/);
      const after = await client.customers.getStackingInfo(clusterId as any, signer.address);
      const beforeTotal = before?.total ?? 0n;
      expect(after).toBeDefined();
      expect(after!.total).toBeGreaterThanOrEqual(beforeTotal + amount);
    } finally {
      client.disconnect();
    }
  }, 180_000);

  it('pallet-fallback deposit builder encodes + is runtime-compatible', async () => {
    const client = connect({ network: 'devnet' });
    try {
      // A made-up cluster id has no gov params → `resolve()` returns `undefined`
      // → `deposit()` falls back to the pallet path. That's the intended path
      // for this encode test (the contract-path round-trip above already
      // proves the contract call itself is live and effective).
      const clusterId = ('0x' + '11'.repeat(20)) as any;
      const tx = await client.customers.deposit(clusterId, 1n);
      expect(Binary.toHex(await tx.getEncodedData())).toMatch(/^0x/);
      await client.assertCompatible('DdcCustomers', 'deposit');
      await client.assertCompatible('DdcCustomers', 'deposit_extra');
      await client.assertCompatible('DdcCustomers', 'unlock_deposit');
      await client.assertCompatible('DdcCustomers', 'withdraw_unlocked_deposit');
    } finally {
      client.disconnect();
    }
  }, 60_000);
});
