import {Piece, PieceUri, Query} from "@cere-ddc-sdk/content-addressable-storage";
import {
    BucketCreatedEvent,
    BucketPermissionGrantedEvent,
    BucketPermissionRevokedEvent,
} from "@cere-ddc-sdk/smart-contract";
import {StoreOptions} from "./options/StoreOptions";
import {ReadOptions} from "./options/ReadOptions";
import {SearchOptions} from "./options/SearchOptions";

export interface DdcClientInterface {
    createBucket(balance: bigint, bucketParams: string, clusterId: bigint): Promise<BucketCreatedEvent>

    grantBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionGrantedEvent>

    revokeBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionRevokedEvent>

    store(bucketId: bigint, piece: Piece, options: StoreOptions): Promise<PieceUri>

    read(pieceUri: PieceUri, options: ReadOptions): Promise<Piece>

    search(query: Query, options: SearchOptions): Promise<Array<Piece>>


    shareData(bucketId: bigint, dekPath: string, publicKeyHex: string): Promise<PieceUri>
}

export enum Permission {
    READ,
    WRITE
}
