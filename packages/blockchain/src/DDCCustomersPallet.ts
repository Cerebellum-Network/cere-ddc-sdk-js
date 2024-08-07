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
   * Returns the staking info for the given account.
   *
   * @param accountId - The ID of the account.
   * @returns A promise that resolves to the staking info.
   *
   * @example
   *
   * ```typescript
   * const stakingInfo = await blockchain.ddcCustomers.getStackingInfo('5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu');
   *
   * console.log(stakingInfo);
   * ```
   */
  async getStackingInfo(accountId: AccountId) {
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
    return this.apiPromise.tx.ddcCustomers.createBucket(clusterId, params) as Sendable;
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
    return this.apiPromise.tx.ddcCustomers.setBucketParams(bucketId, params) as Sendable;
  }

  /**
   * Deposits funds to the account.
   *
   * @param value - The amount to deposit.
   * @returns An extrinsic to deposit funds.
   *
   * @example
   *
   * ```typescript
   * const tx = blockchain.ddcCustomers.deposit(100n);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  deposit(value: bigint) {
    return this.apiPromise.tx.ddcCustomers.deposit(value) as Sendable;
  }

  /**
   * Deposits additional funds to the account.
   *
   * @param maxAdditional - The maximum amount to deposit.
   * @returns An extrinsic to deposit additional funds.
   *
   * @example
   *
   * ```typescript
   * const tx = blockchain.ddcCustomers.depositExtra(100n);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  depositExtra(maxAdditional: bigint) {
    return this.apiPromise.tx.ddcCustomers.depositExtra(maxAdditional) as Sendable;
  }

  /**
   * Withdraws funds from the account.
   *
   * @param value - The amount to withdraw.
   * @returns An extrinsic to withdraw funds.
   *
   * @example
   *
   * ```typescript
   * const tx = blockchain.ddcCustomers.withdraw(100n);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  unlockDeposit(value: bigint) {
    return this.apiPromise.tx.ddcCustomers.unlockDeposit(value) as Sendable;
  }

  /**
   * Withdraws unlocked funds from the account.
   *
   * @returns An extrinsic to withdraw unlocked funds.
   *
   * @example
   *
   * ```typescript
   * const tx = blockchain.ddcCustomers.withdrawUnlockedDeposit();
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  withdrawUnlockedDeposit() {
    return this.apiPromise.tx.ddcCustomers.withdrawUnlockedDeposit() as Sendable;
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
}
