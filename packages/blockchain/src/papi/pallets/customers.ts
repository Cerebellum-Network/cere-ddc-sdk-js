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
  return {
    async getStackingInfo(clusterId, accountId) {
      const addr = await contract.resolve(clusterId);
      if (addr) return contract.readBalance(addr, accountId);
      // Pallet fallback for a cluster with no deposit contract. The migrated
      // devnet/testnet runtime keys this by `(clusterId, accountId)` under
      // `DdcCustomers.ClusterLedger` (verified live in the 2c spike). That
      // storage item is NOT on the mainnet static baseline type (mainnet still
      // has the account-keyed `DdcCustomers.Ledger`), so reach it through a cast
      // — the established 2a/2b pattern for cross-runtime query access. The
      // value decodes to the same `{ owner, total, active }` shape `toStakingInfo`
      // maps for the contract path.
      const value: any = await (api.query.DdcCustomers as any).ClusterLedger.getValue(
        clusterId as any,
        accountId as any,
      );
      return value == null ? undefined : toStakingInfo(value);
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
    async deposit(clusterId, value) {
      const addr = await contract.resolve(clusterId);
      if (addr) {
        const gas = await contract.estimateGas(addr, 'DdcBalancesDepositor::deposit', accountPlaceholder, value, {});
        return contract.buildContractCall(addr, 'DdcBalancesDepositor::deposit', value, {}, gas);
      }
      return api.tx.DdcCustomers.deposit({ cluster_id: clusterId, value } as any) as Sendable;
    },
    async depositExtra(clusterId, maxAdditional) {
      const addr = await contract.resolve(clusterId);
      if (addr) {
        // The contract has no separate "top up" message — `deposit` (payable)
        // covers both the initial and additional lock-up.
        const gas = await contract.estimateGas(
          addr,
          'DdcBalancesDepositor::deposit',
          accountPlaceholder,
          maxAdditional,
          {},
        );
        return contract.buildContractCall(addr, 'DdcBalancesDepositor::deposit', maxAdditional, {}, gas);
      }
      return api.tx.DdcCustomers.deposit_extra({
        cluster_id: clusterId,
        max_additional: maxAdditional,
      } as any) as Sendable;
    },
    async depositFor(targetAddress, clusterId, amount) {
      const addr = await contract.resolve(clusterId);
      if (addr) {
        const args = { owner: targetAddress };
        const gas = await contract.estimateGas(
          addr,
          'DdcBalancesDepositor::deposit_for',
          accountPlaceholder,
          amount,
          args,
        );
        return contract.buildContractCall(addr, 'DdcBalancesDepositor::deposit_for', amount, args, gas);
      }
      // `deposit_for` is not on the mainnet static baseline (mainnet's
      // DdcCustomers lacks it entirely — only devnet/testnet's migrated
      // runtime has it), so reach it through a cast, same as the
      // `ClusterLedger` query above.
      return (api.tx.DdcCustomers as any).deposit_for({
        owner: targetAddress,
        cluster_id: clusterId,
        value: amount,
      }) as Sendable;
    },
    async unlockDeposit(clusterId, value) {
      const addr = await contract.resolve(clusterId);
      if (addr) {
        const args = { value };
        const gas = await contract.estimateGas(
          addr,
          'DdcBalancesDepositor::unlock_deposit',
          accountPlaceholder,
          0n,
          args,
        );
        return contract.buildContractCall(addr, 'DdcBalancesDepositor::unlock_deposit', 0n, args, gas);
      }
      return api.tx.DdcCustomers.unlock_deposit({ cluster_id: clusterId, value } as any) as Sendable;
    },
    async withdrawUnlockedDeposit(clusterId) {
      const addr = await contract.resolve(clusterId);
      if (addr) {
        const gas = await contract.estimateGas(
          addr,
          'DdcBalancesDepositor::withdraw_unlocked',
          accountPlaceholder,
          0n,
          {},
        );
        return contract.buildContractCall(addr, 'DdcBalancesDepositor::withdraw_unlocked', 0n, {}, gas);
      }
      // The mainnet static baseline types `withdraw_unlocked_deposit` as a
      // no-arg call (mainnet's account-keyed ledger needs no cluster id);
      // the migrated devnet/testnet runtime requires `{ cluster_id }` — cast
      // to reach the shape the connected (devnet/testnet) chain actually
      // expects, same rationale as `deposit_for` above.
      return (api.tx.DdcCustomers as any).withdraw_unlocked_deposit({ cluster_id: clusterId }) as Sendable;
    },
  };
}
