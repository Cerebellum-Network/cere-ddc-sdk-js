import {Piece, Query, Session} from "@cere-ddc-sdk/content-addressable-storage";
import {BucketCreatedEvent, BucketStatus, BucketStatusList} from "@cere-ddc-sdk/smart-contract";
import {BucketParams} from "@cere-ddc-sdk/smart-contract";
import {DdcUri} from "@cere-ddc-sdk/core";
import {StoreOptions} from "./options/StoreOptions";
import {ReadOptions} from "./options/ReadOptions";
import {File} from "./model/File";

export interface DdcClientInterface {

    createBucket(balance: bigint, resource: bigint, clusterId: bigint, bucketParams?: BucketParams): Promise<BucketCreatedEvent>

    accountDeposit(balance: bigint): Promise<void>

    bucketAllocIntoCluster(bucketId: bigint, resource: bigint): Promise<void>

    /*    grantBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionGrantedEvent>

        revokeBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionRevokedEvent>*/

    bucketGet(bucketId: bigint): Promise<BucketStatus>

    bucketList(offset: bigint, limit: bigint, filterOwnerId?: string): Promise<BucketStatusList>

    store(bucketId: bigint, session: Session, piece: Piece, options?: StoreOptions): Promise<DdcUri>

    store(bucketId: bigint, session: Session, file: File, options?: StoreOptions): Promise<DdcUri>

    read(ddcUri: DdcUri, session: Session, options?: ReadOptions): Promise<File | Piece>

    search(query: Query, session: Session): Promise<Array<Piece>>

    shareData(bucketId: bigint, dekPath: string, publicKeyHex: string, session: Session): Promise<DdcUri>
}
