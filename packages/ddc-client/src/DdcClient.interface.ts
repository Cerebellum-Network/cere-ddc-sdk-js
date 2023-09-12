import {Piece, Query, SearchOptions} from '@cere-ddc-sdk/content-addressable-storage';
import {DdcUri} from '@cere-ddc-sdk/core';
import {
    BucketParams,
    BucketStatus,
    ClusterId,
    Balance,
    Resource,
    BucketId,
    AccountId,
    Offset,
} from '@cere-ddc-sdk/smart-contract/types';

import {StoreOptions} from './options/StoreOptions';
import {ReadOptions} from './options/ReadOptions';
import {File} from './model/File';

export interface DdcClientInterface {
    createBucket(
        balance: Balance,
        resource: Resource,
        clusterId: ClusterId,
        bucketParams?: BucketParams,
    ): Promise<Pick<BucketStatus, 'bucketId'>>;

    accountDeposit(balance: Balance): Promise<void>;

    bucketAllocIntoCluster(bucketId: BucketId, resource: Resource): Promise<void>;

    bucketGet(bucketId: BucketId): Promise<BucketStatus>;

    bucketList(offset?: Offset, limit?: Offset, filterOwnerId?: AccountId): Promise<readonly [BucketStatus[], Offset]>;

    store(bucketId: BucketId, piece: Piece, options?: StoreOptions): Promise<DdcUri>;

    store(bucketId: BucketId, file: File, options?: StoreOptions): Promise<DdcUri>;

    read(ddcUri: DdcUri, options?: ReadOptions): Promise<File | Piece>;

    search(query: Query, options?: SearchOptions): Promise<Array<Piece>>;

    shareData(bucketId: BucketId, dekPath: string, publicKeyHex: string, options?: StoreOptions): Promise<DdcUri>;
}
