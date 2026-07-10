import type { CereApi } from '../api-types.js';
import type { Sendable, Event } from '../tx.js';
import type { AccountId, Bucket, BucketId, BucketParams, ClusterId, StakingInfo } from '../../types.js';
import { toBucket, toStakingInfo } from './mapping.js';
import { createCustomerDepositContract, type CustomerDepositContract } from '../contracts/customerDeposit.js';

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
  };
}
