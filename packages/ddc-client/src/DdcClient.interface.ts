import {Piece, Query} from "@cere-ddc-sdk/content-addressable-storage";
import {BucketCreatedEvent, BucketStatus, BucketStatusList} from "@cere-ddc-sdk/smart-contract";
import {StoreOptions} from "./options/StoreOptions.js";
import {ReadOptions} from "./options/ReadOptions.js";
import {File} from "./model/File.js";
import {BucketParams} from "@cere-ddc-sdk/smart-contract";
import {DdcUri} from "@cere-ddc-sdk/core";

export interface DdcClientInterface {

    createBucket(balance: bigint, clusterId: bigint, bucketParams?: BucketParams): Promise<BucketCreatedEvent>

    /*    grantBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionGrantedEvent>

        revokeBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionRevokedEvent>*/

    bucketGet(bucketId: bigint): Promise<BucketStatus>

    bucketList(offset: bigint, limit: bigint, filterOwnerId?: string): Promise<BucketStatusList>

    store(bucketId: bigint, piece: Piece, options?: StoreOptions): Promise<DdcUri>

    store(bucketId: bigint, file: File, options?: StoreOptions): Promise<DdcUri>

    read(ddcUri: DdcUri, options?: ReadOptions): Promise<File | Piece>

    search(query: Query): Promise<Array<Piece>>

    shareData(bucketId: bigint, dekPath: string, publicKeyHex: string): Promise<DdcUri>
}
