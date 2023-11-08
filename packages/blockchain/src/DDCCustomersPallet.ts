import {ApiPromise} from '@polkadot/api';
import {PalletDdcCustomersUnlockChunk} from '@polkadot/types/lookup';
import {ClusterId} from './DDCClustersPallet';
import {AccountId32} from '@polkadot/types/interfaces/runtime';
import {Vec} from '@polkadot/types-codec';
import {Sendable} from './Blockchain';

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
    readonly unlocking: Vec<PalletDdcCustomersUnlockChunk>;
};
