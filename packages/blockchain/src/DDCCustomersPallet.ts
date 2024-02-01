import { ApiPromise } from '@polkadot/api';
import { Sendable, Event } from './Blockchain';
import type { AccountId, Bucket, BucketId, BucketParams, ClusterId, StakingInfo } from './types';

export class DDCCustomersPallet {
  constructor(private apiPromise: ApiPromise) {}

  async getBucket(bucketId: BucketId) {
    const result = await this.apiPromise.query.ddcCustomers.buckets(bucketId);
    const bucket = result.toJSON() as unknown as Bucket | undefined;
    return bucket == null ? undefined : ({ ...bucket, bucketId: BigInt(bucket.bucketId) } as Bucket);
  }

  async getBucketsCount() {
    const result = await this.apiPromise.query.ddcCustomers.bucketsCount();
    return result.toJSON() as number;
  }

  async getStackingInfo(accountId: AccountId) {
    const result = await this.apiPromise.query.ddcCustomers.ledger(accountId);
    return result.toJSON() as unknown as StakingInfo | undefined;
  }

  createBucket(clusterId: ClusterId, params: BucketParams) {
    return this.apiPromise.tx.ddcCustomers.createBucket(clusterId, params) as Sendable;
  }

  setBucketParams(bucketId: BucketId, params: BucketParams) {
    return this.apiPromise.tx.ddcCustomers.setBucketParams(bucketId, params) as Sendable;
  }

  deposit(value: bigint) {
    return this.apiPromise.tx.ddcCustomers.deposit(value) as Sendable;
  }

  depositExtra(maxAdditional: bigint) {
    return this.apiPromise.tx.ddcCustomers.depositExtra(maxAdditional) as Sendable;
  }

  unlockDeposit(value: bigint) {
    return this.apiPromise.tx.ddcCustomers.unlockDeposit(value) as Sendable;
  }

  withdrawUnlockedDeposit() {
    return this.apiPromise.tx.ddcCustomers.withdrawUnlockedDeposit() as Sendable;
  }

  async listBuckets() {
    const entries = (await this.apiPromise.query.ddcCustomers?.buckets.entries()) || [];
    return entries
      .map(([, bucketOption]) => {
        const bucket = bucketOption.toJSON() as unknown as Bucket | undefined;
        return bucket == null ? undefined : ({ ...bucket, bucketId: BigInt(bucket.bucketId) } as Bucket);
      })
      .filter((bucket) => bucket !== undefined) as Bucket[];
  }

  extractCreatedBucketIds(events: Event[]) {
    return events
      .filter((event) => event.section === 'ddcCustomers' && event.method === 'BucketCreated')
      .map((event) => event.data?.[0])
      .filter((bucketId) => bucketId !== undefined && (typeof bucketId === 'number' || typeof bucketId === 'string'))
      .map((bucketId) => BigInt(bucketId) as BucketId);
  }
}
