import {ApiPromise} from '@polkadot/api';
import {ClusterId} from './DDCClustersPallet';
import {Sendable, Event} from './Blockchain';

export class DDCCustomersPallet {
    constructor(private apiPromise: ApiPromise) {}

    async getBucket(bucketId: BucketId) {
        const result = await this.apiPromise.query.ddcCustomers.buckets(bucketId);
        return result.unwrapOr(undefined)?.toJSON() as unknown as Bucket | undefined;
    }

    async getBucketsCount() {
        const result = await this.apiPromise.query.ddcCustomers.bucketsCount();
        return result.toJSON();
    }

    async getStackingInfo(accountId: AccountId) {
        const result = await this.apiPromise.query.ddcCustomers.ledger(accountId);
        return result.unwrapOr(undefined)?.toJSON() as unknown as StakingInfo;
    }

    createBucket(clusterId: ClusterId) {
        return this.apiPromise.tx.ddcCustomers.createBucket(clusterId) as Sendable;
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

    extractCreatedBucketIds(events: Event[]) {
        return events
            .filter((event) => event.section === 'ddcCustomers' && event.method === 'BucketCreated')
            .map((event) => event.data?.[0] as BucketId | undefined)
            .filter((bucketId) => bucketId !== undefined) as BucketId[];
    }
}

export type BucketId = number;
export type Bucket = /*PalletDdcCustomersBucket;*/ {
    readonly bucketId: BucketId;
    readonly ownerId: AccountId;
    readonly clusterId: ClusterId | null | undefined;
    readonly publicAvailability: boolean;
    readonly resourcesReserved: bigint;
};
export type AccountId = string;
export type StakingInfo = /*PalletDdcCustomersAccountsLedger;*/ {
    readonly owner: AccountId;
    readonly total: bigint;
    readonly active: bigint;
};
