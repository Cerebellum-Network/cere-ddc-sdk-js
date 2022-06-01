import {Piece, PieceUri, Query} from "@cere-ddc-sdk/content-addressable-storage";
import {
    BucketCreatedEvent,
    BucketPermissionGrantedEvent,
    BucketPermissionRevokedEvent,
} from "@cere-ddc-sdk/smart-contract";
import {StoreOptions} from "./options/StoreOptions";
import {ReadOptions} from "./options/ReadOptions";
import {SearchOptions} from "./options/SearchOptions";
import {Object} from "./model/Object";

export interface DdcClientInterface {
    createBucket(balance: bigint, bucketParams: string, clusterId: bigint): Promise<BucketCreatedEvent>

    grantBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionGrantedEvent>

    revokeBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionRevokedEvent>

    // Encrypted flow:
    // 1. generate DEK Blake2b(master + dekPath)
    // 3. encrypt DEK by client public key (so using private key EDEK can be decrypted)
    // 4. upload EDEK as a separate piece using key (bucketId + dekPath + client public key)
    // 4. encrypt data in the piece by DEK
    // 5. upload encrypted piece
    // Unencrypted flow:
    // 1. upload piece
    // return piece uri (encrypted piece CID + bucketId)
    store(bucketId: bigint, record: Object, options: StoreOptions): Promise<PieceUri>

    // 1. Read piece by uri
    // Encrypted flow:
    // 2. Read EDEK by 'bucketId + dekPath + client public key'
    // 3. Verify that passed dekPath fits piece dekPath
    // 4. Decrypt EDEK using client private key and put into DEK cache
    // 5. Calculate final DEK using the rest of the path
    // 6. Decrypt piece using final DEK
    // Decrypted flow:
    // 2. Nothing
    // return piece
    read(pieceUri: PieceUri, options: ReadOptions): Promise<Object>

    search(query: Query, options: SearchOptions): Promise<Array<Object>>

    // 1. Read EDEK by 'bucketId + dekPath + client box public key', decrypt and put into DEK cache
    // 2. Decrypt EDEK using client private key and put into DEK cache
    // 3. Encrypt DEK by partner box public key (so partner using his private key decrypted EDEK)
    // 4. Upload EDEK as a separate piece
    shareData(bucketId: bigint, dekPath: string, publicKeyHex: string): Promise<PieceUri>
}

export enum Permission {
    READ,
    WRITE
}
