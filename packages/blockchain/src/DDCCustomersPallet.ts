import { ApiPromise } from '@polkadot/api';

import { Sendable, Event } from './Blockchain';
import type { AccountId, Bucket, BucketId, BucketParams, ClusterId, StakingInfo } from './types';

/**
 * This class provides methods to interact with the DDC Customers pallet on the blockchain.
 *
 * @group Pallets
 * @example
 *
 * ```typescript
 * const bucket = await blockchain.ddcCustomers.getBucket(1n);
 *
 * console.log(bucket);
 * ```
 */
export class DDCCustomersPallet {
  constructor(private apiPromise: ApiPromise) {}

  /**
   * Returns the bucket with the given ID.
   *
   * @param bucketId - The ID of the bucket.
   * @returns A promise that resolves to the bucket.
   *
   * @example
   *
   * ```typescript
   * const bucket = await blockchain.ddcCustomers.getBucket(1n);
   *
   * console.log(bucket);
   * ```
   */
  async getBucket(bucketId: BucketId) {
    const result = await this.apiPromise.query.ddcCustomers.buckets(bucketId);
    const bucket = result.toJSON() as unknown as Bucket | undefined;
    return bucket == null ? undefined : ({ ...bucket, bucketId: BigInt(bucket.bucketId) } as Bucket);
  }

  /**
   * Returns the number of buckets.
   *
   * @returns A promise that resolves to the number of buckets.
   *
   * @example
   *
   * ```typescript
   * const bucketsCount = await blockchain.ddcCustomers.getBucketsCount();
   *
   * console.log(bucketsCount);
   * ```
   */
  async getBucketsCount() {
    const result = await this.apiPromise.query.ddcCustomers.bucketsCount();
    return result.toJSON() as number;
  }

  /**
   * Returns the staking info for the given account in the specified cluster.
   *
   * @param clusterId - The ID of the cluster.
   * @param accountId - The ID of the account.
   * @returns A promise that resolves to the staking info.
   *
   * @example
   *
   * ```typescript
   * const stakingInfo = await blockchain.ddcCustomers.getStackingInfo('0x...', '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu');
   *
   * console.log(stakingInfo);
   * ```
   */
  async getStackingInfo(clusterId: ClusterId, accountId: AccountId) {
    const result = await this.apiPromise.query.ddcCustomers.clusterLedger(clusterId, accountId);
    return result.toJSON() as unknown as StakingInfo | undefined;
  }

  /**
   * Returns the staking info for the given account (legacy method - deprecated).
   * This method is deprecated because the storage has migrated to cluster-based ledger.
   * Use getStackingInfo(clusterId, accountId) instead.
   *
   * @deprecated Use getStackingInfo(clusterId, accountId) instead.
   * @param accountId - The ID of the account.
   * @returns A promise that resolves to the staking info.
   */
  async getStackingInfoLegacy(accountId: AccountId) {
    // For backward compatibility, try to get from the first available cluster
    // This is a fallback and should not be used in new code
    const result = await this.apiPromise.query.ddcCustomers.ledger(accountId);
    return result.toJSON() as unknown as StakingInfo | undefined;
  }

  /**
   * Creates a new bucket.
   *
   * @param clusterId - The ID of the cluster.
   * @param params - The bucket parameters.
   * @returns An extrinsic to create the bucket.
   *
   * @example
   *
   * ```typescript
   * const tx = blockchain.ddcCustomers.createBucket('0x...', { isPublic: true });
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  createBucket(clusterId: ClusterId, params: BucketParams) {
    return this.apiPromise.tx.ddcCustomers.createBucket(clusterId, params) as unknown as Sendable;
  }

  /**
   * Sets the parameters of the bucket with the given ID.
   *
   * @param bucketId - The ID of the bucket.
   * @param params - The bucket parameters.
   * @returns An extrinsic to set the bucket parameters.
   *
   * @example
   *
   * ```typescript
   * const tx = blockchain.ddcCustomers.setBucketParams(1n, { isPublic: true });
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  setBucketParams(bucketId: BucketId, params: BucketParams) {
    return this.apiPromise.tx.ddcCustomers.setBucketParams(bucketId, params) as unknown as Sendable;
  }

  /**
   * Deposits funds to the account for the specified cluster.
   *
   * @param clusterId - The ID of the cluster.
   * @param value - The amount to deposit.
   * @returns An extrinsic to deposit funds.
   *
   * @example
   *
   * ```typescript
   * const tx = blockchain.ddcCustomers.deposit('0x...', 100n);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  deposit(clusterId: ClusterId, value: bigint) {
    return this.apiPromise.tx.ddcCustomers.deposit(clusterId, value) as unknown as Sendable;
  }

  /**
   * Deposits additional funds to the account for the specified cluster.
   *
   * @param clusterId - The ID of the cluster.
   * @param maxAdditional - The maximum amount to deposit.
   * @returns An extrinsic to deposit additional funds.
   *
   * @example
   *
   * ```typescript
   * const tx = blockchain.ddcCustomers.depositExtra('0x...', 100n);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  depositExtra(clusterId: ClusterId, maxAdditional: bigint) {
    return this.apiPromise.tx.ddcCustomers.depositExtra(clusterId, maxAdditional) as unknown as Sendable;
  }

  /**
   * Deposits funds to the target address for the specified cluster.
   * This allows a third party to deposit funds on behalf of another address.
   *
   * @param targetAddress - The target address to deposit funds for.
   * @param clusterId - The ID of the cluster.
   * @param amount - The amount to deposit.
   * @returns An extrinsic to deposit funds for the target address.
   *
   * @example
   *
   * ```typescript
   * const tx = blockchain.ddcCustomers.depositFor('5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu', '0x...', 100n);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  depositFor(targetAddress: AccountId, clusterId: ClusterId, amount: bigint) {
    return this.apiPromise.tx.ddcCustomers.depositFor(targetAddress, clusterId, amount) as unknown as Sendable;
  }

  /**
   * Unlocks deposit funds from the account for the specified cluster.
   *
   * @param clusterId - The ID of the cluster.
   * @param value - The amount to unlock.
   * @returns An extrinsic to unlock deposit funds.
   *
   * @example
   *
   * ```typescript
   * const tx = blockchain.ddcCustomers.unlockDeposit('0x...', 100n);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  unlockDeposit(clusterId: ClusterId, value: bigint) {
    return this.apiPromise.tx.ddcCustomers.unlockDeposit(clusterId, value) as unknown as Sendable;
  }

  /**
   * Withdraws unlocked funds from the account for the specified cluster.
   *
   * @param clusterId - The ID of the cluster.
   * @returns An extrinsic to withdraw unlocked funds.
   *
   * @example
   *
   * ```typescript
   * const tx = blockchain.ddcCustomers.withdrawUnlockedDeposit('0x...');
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  withdrawUnlockedDeposit(clusterId: ClusterId) {
    return this.apiPromise.tx.ddcCustomers.withdrawUnlockedDeposit(clusterId) as unknown as Sendable;
  }

  /**
   * Returns the list of buckets.
   *
   * @returns A promise that resolves to the list of buckets.
   *
   * @example
   *
   * ```typescript
   * const buckets = await blockchain.ddcCustomers.listBuckets();
   *
   * console.log(buckets);
   * ```
   */
  async listBuckets() {
    const entries = (await this.apiPromise.query.ddcCustomers?.buckets.entries()) || [];
    return entries
      .map(([, bucketOption]) => {
        const bucket = bucketOption.toJSON() as unknown as Bucket | undefined;
        return bucket == null ? undefined : ({ ...bucket, bucketId: BigInt(bucket.bucketId) } as Bucket);
      })
      .filter((bucket) => bucket !== undefined) as Bucket[];
  }

  /**
   * Extracts the IDs of the created buckets from the given events.
   *
   * @param events - The events to extract the bucket IDs from.
   * @returns The IDs of the created buckets.
   *
   * @example
   *
   * ```typescript
   * const bucketIds = blockchain.ddcCustomers.extractCreatedBucketIds(events);
   *
   * console.log(bucketIds);
   * ```
   */
  extractCreatedBucketIds(events: Event[]) {
    return events
      .filter((event) => event.section === 'ddcCustomers' && event.method === 'BucketCreated')
      .map((event) => event.payload?.bucket_id)
      .filter(Boolean)
      .map(BigInt);
  }

  /**
   * Mark existing buckets with specified bucket ids as removed.
   *
   * @param bucketIds - The IDs of the buckets to remove.
   * @returns An extrinsic to remove the buckets.
   *
   * @example
   *
   * ```typescript
   * const tx = blockchain.ddcCustomers.removeBuckets(1n, 2n);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  removeBuckets(...bucketIds: BucketId[]) {
    if (bucketIds.length === 0) {
      throw new Error('At least one bucket ID must be provided');
    } else if (bucketIds.length === 1) {
      return this.apiPromise.tx.ddcCustomers.removeBucket(bucketIds[0]) as unknown as Sendable;
    }

    return this.apiPromise.tx.utility.batch(
      bucketIds.map((bucketId) => this.apiPromise.tx.ddcCustomers.removeBucket(bucketId)),
    ) as unknown as Sendable;
  }

  /**
   * Extracts the IDs of the removed buckets from the given events.
   *
   * @param events - The events to extract the bucket IDs from.
   * @returns The IDs of the removed buckets.
   *
   * @example
   *
   * ```typescript
   * const bucketIds = blockchain.ddcCustomers.extractRemovedBucketIds(events);
   *
   * console.log(bucketIds);
   * ```
   */
  extractRemovedBucketIds(events: Event[]) {
    return events
      .filter((event) => event.section === 'ddcCustomers' && event.method === 'BucketRemoved')
      .map((event) => event.payload?.bucket_id)
      .filter(Boolean)
      .map(BigInt);
  }
}
