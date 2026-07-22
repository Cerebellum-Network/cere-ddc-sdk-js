import type { CereApi } from '../api-types.js';
import type { Sendable, Event } from '../tx.js';
import type { AccountId, Bucket, BucketId, BucketParams, ClusterId, StakingInfo } from '../../types.js';
import { toBucket, toStakingInfo } from './mapping.js';
import { createCustomerDepositContract, type CustomerDepositContract } from '../contracts/customerDeposit.js';

// Placeholder caller for gas-sizing dry runs on payable/non-payable deposit
// messages where the real signer is not yet known at build time (the dry run
// only needs a valid AccountId, not funds — the estimateGas generous-ceiling
// fallback covers the case where the placeholder can't afford `value`).
const accountPlaceholder = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

export interface CustomersPallet {
  /** Balance for an account in a cluster: the contract balance if the cluster has a deposit contract, else the pallet ledger. */
  getStackingInfo(clusterId: ClusterId, accountId: AccountId): Promise<StakingInfo | undefined>;
  // Buckets (Task 2) and deposit/withdraw (Task 3) are added here.
  getBucket(bucketId: BucketId): Promise<Bucket | undefined>;
  getBucketsCount(): Promise<number>;
  listBuckets(): Promise<Bucket[]>;
  createBucket(clusterId: ClusterId, params: BucketParams): Sendable;
  setBucketParams(bucketId: BucketId, params: BucketParams): Sendable;
  removeBuckets(...bucketIds: BucketId[]): Sendable;
  extractCreatedBucketIds(events: Event[]): bigint[];
  extractRemovedBucketIds(events: Event[]): bigint[];
  /** Lock up `value` from the signer's own balance as a new/topped-up deposit for a cluster. Contract-first (falls back to the pallet). */
  deposit(clusterId: ClusterId, value: bigint): Promise<Sendable>;
  /** Add `maxAdditional` on top of an existing deposit. Contract-first (falls back to the pallet). */
  depositExtra(clusterId: ClusterId, maxAdditional: bigint): Promise<Sendable>;
  /** Lock up `amount` from the signer's balance on behalf of `targetAddress`. Contract-first (falls back to the pallet). */
  depositFor(targetAddress: AccountId, clusterId: ClusterId, amount: bigint): Promise<Sendable>;
  /** Schedule `value` of the signer's deposit to unlock. Contract-first (falls back to the pallet). */
  unlockDeposit(clusterId: ClusterId, value: bigint): Promise<Sendable>;
  /** Withdraw funds already unlocked (past the unlock period) for the signer. Contract-first (falls back to the pallet). */
  withdrawUnlockedDeposit(clusterId: ClusterId): Promise<Sendable>;
}

export function createCustomersPallet(api: CereApi): CustomersPallet {
  const contract: CustomerDepositContract = createCustomerDepositContract(api);

  // Runtime deposit-model detection (cached). Three models exist across Cere
  // networks: (1) a per-cluster ink! deposit contract (devnet/testnet, on every
  // cluster), (2) the migrated per-cluster pallet `DdcCustomers.ClusterLedger`,
  // and (3) the legacy account-global pallet `DdcCustomers.Ledger` (mainnet,
  // pre-migration). The contract is resolved per-cluster (`contract.resolve`);
  // this flag distinguishes the two *pallet* shapes for a cluster with no
  // contract. It only matters on a runtime with no contracts (mainnet today) —
  // on devnet/testnet every cluster has a contract, so this probe never runs.
  // Detected by whether the account-keyed `Ledger` storage exists on the
  // connected runtime (present only on the legacy runtime; the migrated runtime
  // replaced it with `ClusterLedger`).
  let accountKeyedLedger: boolean | undefined;
  const isAccountKeyedLedger = async (): Promise<boolean> => {
    if (accountKeyedLedger === undefined) {
      try {
        await api.query.DdcCustomers.Ledger.getValue(accountPlaceholder as any);
        accountKeyedLedger = true; // legacy runtime: account-global `Ledger` present
      } catch (e: any) {
        // A missing storage entry (migrated runtime) is the negative signal; any
        // other error (network, decode) must propagate rather than be cached.
        if (!/not found/i.test(String(e?.message ?? e))) throw e;
        accountKeyedLedger = false;
      }
    }
    return accountKeyedLedger;
  };

  // Shared deposit/withdraw scaffold: contract-first (dry-run gas + build the
  // ink call) when the cluster has a live deposit contract, else the pallet
  // fallback thunk. Every one of the 5 deposit/withdraw methods below is this
  // same shape, differing only in ink message/value/args and the pallet call.
  const contractOrPallet = async (
    clusterId: ClusterId,
    message: string,
    value: bigint,
    args: any,
    palletCall: () => Sendable | Promise<Sendable>,
  ): Promise<Sendable> => {
    const addr = await contract.resolve(clusterId);
    if (!addr) return palletCall();
    const gas = await contract.estimateGas(addr, message, accountPlaceholder, value, args);
    return contract.buildContractCall(addr, message, value, args, gas);
  };

  return {
    async getStackingInfo(clusterId, accountId) {
      const addr = await contract.resolve(clusterId);
      if (addr) return contract.readBalance(addr, accountId);
      // Pallet fallback for a cluster with no deposit contract. Two pallet
      // shapes: the legacy account-global `DdcCustomers.Ledger(accountId)`
      // (mainnet) and the migrated `DdcCustomers.ClusterLedger(clusterId,
      // accountId)` (devnet/testnet). `ClusterLedger` is not on the mainnet
      // static baseline type, so reach it through a cast — the established
      // 2a/2b pattern for cross-runtime query access. Both decode to the same
      // `{ owner, total, active }` shape `toStakingInfo` maps for the contract.
      if (await isAccountKeyedLedger()) {
        const legacy: any = await api.query.DdcCustomers.Ledger.getValue(accountId as any);
        return legacy == null ? undefined : toStakingInfo(legacy);
      }
      const value: any = await (api.query.DdcCustomers as any).ClusterLedger.getValue(
        clusterId as any,
        accountId as any,
      );
      // Override `owner` with the queried `accountId` for parity with the contract
      // path (whose decoded `owner` is a known bogus fixed value): the entry is
      // keyed by `accountId`, so the deposit belongs to it regardless of what the
      // storage's `owner` field decodes to.
      return value == null ? undefined : { ...toStakingInfo(value), owner: accountId };
    },
    async getBucket(bucketId) {
      const value = await api.query.DdcCustomers.Buckets.getValue(bucketId as any);
      return value == null ? undefined : toBucket(value);
    },
    async getBucketsCount() {
      return Number(await api.query.DdcCustomers.BucketsCount.getValue());
    },
    async listBuckets() {
      const entries = await api.query.DdcCustomers.Buckets.getEntries();
      return entries.map((e) => toBucket(e.value));
    },
    createBucket(clusterId, params) {
      // NOTE: the descriptor types `create_bucket`'s `bucket_params` arg as a
      // BARE `boolean` (`I83j73amadkgkn`), not the `{ is_public }` struct the
      // task brief guessed — verified live against
      // `packages/blockchain/.papi/descriptors/dist/common-types.d.ts`. Same
      // for `set_bucket_params` below (`I17ct5d1icihem`).
      return api.tx.DdcCustomers.create_bucket({
        cluster_id: clusterId,
        bucket_params: params.isPublic,
      } as any) as Sendable;
    },
    setBucketParams(bucketId, params) {
      return api.tx.DdcCustomers.set_bucket_params({
        bucket_id: bucketId,
        bucket_params: params.isPublic,
      } as any) as Sendable;
    },
    removeBuckets(...bucketIds) {
      if (bucketIds.length === 0) throw new Error('At least one bucket ID must be provided');
      if (bucketIds.length === 1) {
        return api.tx.DdcCustomers.remove_bucket({ bucket_id: bucketIds[0] } as any) as Sendable;
      }
      return api.tx.Utility.batch({
        calls: bucketIds.map((id) => api.tx.DdcCustomers.remove_bucket({ bucket_id: id } as any).decodedCall),
      } as any) as Sendable;
    },
    extractCreatedBucketIds(events) {
      return events
        .filter((e) => e.section === 'DdcCustomers' && e.method === 'BucketCreated')
        .map((e) => e.payload?.bucket_id)
        .filter((id) => id != null)
        .map(BigInt);
    },
    extractRemovedBucketIds(events) {
      return events
        .filter((e) => e.section === 'DdcCustomers' && e.method === 'BucketRemoved')
        .map((e) => e.payload?.bucket_id)
        .filter((id) => id != null)
        .map(BigInt);
    },
    // Deposit/withdraw: contract-first (Task 1's ink! layer) when the cluster
    // carries a live `customer_deposit_contract`, else the new-runtime pallet
    // ledger call. Ink message labels + arg names verified live against
    // `customer_deposit.json` (`spec.messages[].label` / `.args[].label`):
    // `DdcBalancesDepositor::deposit` (no args, payable), `::deposit_for`
    // (arg `owner`), `::unlock_deposit` (arg `value`), `::withdraw_unlocked`
    // (no args) — snake_case labels/args, NOT the camelCase the initial task
    // brief guessed. Pallet arg field names verified live against
    // `cereDevnet.d.ts`'s `DdcCustomers` tx descriptors: `deposit`/
    // `unlock_deposit` take `{ cluster_id, value }`, `deposit_extra` takes
    // `{ cluster_id, max_additional }`, `deposit_for` takes
    // `{ owner, cluster_id, value }` (NOT `{ target, amount }` as guessed),
    // `withdraw_unlocked_deposit` takes `{ cluster_id }` only.
    // Each pallet fallback below builds the shape the connected runtime expects:
    // the legacy account-global calls (mainnet — no cluster id) or the migrated
    // per-cluster calls (devnet/testnet). Legacy arg shapes verified live against
    // the mainnet runtime: `deposit({value})`, `deposit_extra({max_additional})`,
    // `unlock_deposit({value})`, `withdraw_unlocked_deposit()` (no args); the
    // legacy runtime has no `deposit_for`.
    deposit(clusterId, value) {
      return contractOrPallet(clusterId, 'DdcBalancesDepositor::deposit', value, {}, async () =>
        (await isAccountKeyedLedger())
          ? (api.tx.DdcCustomers.deposit({ value } as any) as Sendable)
          : (api.tx.DdcCustomers.deposit({ cluster_id: clusterId, value } as any) as Sendable),
      );
    },
    depositExtra(clusterId, maxAdditional) {
      // The contract has no separate "top up" message — `deposit` (payable)
      // covers both the initial and additional lock-up.
      return contractOrPallet(clusterId, 'DdcBalancesDepositor::deposit', maxAdditional, {}, async () =>
        (await isAccountKeyedLedger())
          ? (api.tx.DdcCustomers.deposit_extra({ max_additional: maxAdditional } as any) as Sendable)
          : (api.tx.DdcCustomers.deposit_extra({
              cluster_id: clusterId,
              max_additional: maxAdditional,
            } as any) as Sendable),
      );
    },
    depositFor(targetAddress, clusterId, amount) {
      return contractOrPallet(
        clusterId,
        'DdcBalancesDepositor::deposit_for',
        amount,
        { owner: targetAddress },
        async () => {
          // `deposit_for` exists only on the migrated runtime; the legacy
          // account-global mainnet pallet has no equivalent.
          if (await isAccountKeyedLedger()) {
            throw new Error('depositFor is not supported by the legacy (account-global) DdcCustomers runtime');
          }
          return (api.tx.DdcCustomers as any).deposit_for({
            owner: targetAddress,
            cluster_id: clusterId,
            value: amount,
          }) as Sendable;
        },
      );
    },
    unlockDeposit(clusterId, value) {
      return contractOrPallet(clusterId, 'DdcBalancesDepositor::unlock_deposit', 0n, { value }, async () =>
        (await isAccountKeyedLedger())
          ? (api.tx.DdcCustomers.unlock_deposit({ value } as any) as Sendable)
          : (api.tx.DdcCustomers.unlock_deposit({ cluster_id: clusterId, value } as any) as Sendable),
      );
    },
    withdrawUnlockedDeposit(clusterId) {
      return contractOrPallet(clusterId, 'DdcBalancesDepositor::withdraw_unlocked', 0n, {}, async () =>
        (await isAccountKeyedLedger())
          ? (api.tx.DdcCustomers.withdraw_unlocked_deposit() as Sendable) // legacy: no cluster id
          : ((api.tx.DdcCustomers as any).withdraw_unlocked_deposit({ cluster_id: clusterId }) as Sendable),
      );
    },
  };
}
