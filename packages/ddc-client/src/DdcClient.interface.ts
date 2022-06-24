import {PieceUri, Query} from "@cere-ddc-sdk/content-addressable-storage";
import {
    BucketCreatedEvent,
    BucketPermissionGrantedEvent,
    BucketPermissionRevokedEvent, BucketStatus, BucketStatusList,
    Permission
} from "@cere-ddc-sdk/smart-contract";
import {StoreOptions} from "./options/StoreOptions.js";
import {ReadOptions} from "./options/ReadOptions.js";
import {PieceArray} from "./model/PieceArray.js";

export interface DdcClientInterface {
    createBucket(balance:bigint, bucketParams: string, clusterId: bigint): Promise<BucketCreatedEvent>

/*    grantBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionGrantedEvent>

    revokeBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionRevokedEvent>*/

    bucketGet(bucketId: bigint): Promise<BucketStatus>

    bucketList(offset: bigint, limit: bigint, filterOwnerId?: string): Promise<BucketStatusList>

    store(bucketId: bigint, pieceArray: PieceArray, options: StoreOptions): Promise<PieceUri>

    read(pieceUri: PieceUri, options: ReadOptions): Promise<PieceArray>

    search(query: Query): Promise<Array<PieceArray>>

    shareData(bucketId: bigint, dekPath: string, publicKeyHex: string): Promise<PieceUri>
}
