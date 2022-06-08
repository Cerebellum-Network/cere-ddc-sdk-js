# @cere-ddc-sdk/ddc-client

## Short introduction

DEK is a data encryption key used to encrypt the data.
EDEK is an encrypted data encryption key that is stored in DDC and used to share data (re-encrypt DEK per partner).

DEK path is a hierarchical encryption path (e.g. /photos/friends) that is used to generate DEK recursively and share data on any level. Similar to directory based access.  

## DdcClient API description


### Client interface and methods description

```typescript
export interface DdcClient {
    // Create bucket in smart contract
    createBucket(balance: bigint, bucketParams: string, clusterId: bigint): Promise<BucketCreatedEvent>

    // Grant bucket permission in smart contract
    grantBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionGrantedEvent>

    // Revoke bucket permission in smart contract
    revokeBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionRevokedEvent>

    // 1. generate DEK (recursive blake2b hash of master key and dek path)
    // 2. encrypt data in the piece by DEK
    // 3. encrypt DEK by client public key (so using private key EDEK can be decrypted)
    // 4. upload EDEK as a separate piece using key (bucketId + dekPath + client public key)
    // 5. upload encrypted piece
    // return piece uri (encrypted piece CID + bucketId)
    store(bucketId: bigint, pieceArray: PieceArray, options: StoreOptions): Promise<PieceUri>

    // 1. Read EDEK by 'bucketId + dekPath + client public key'
    // 2. Read piece by uri
    // 3. Verify that passed dekPath fits piece dekPath
    // 4. Decrypt EDEK using client private key and put into DEK cache
    // 5. Calculate final DEK using the rest of the path
    // 6. Decrypt piece using final DEK
    // return piece
    read(pieceUri: PieceUri, options: ReadOptions): Promise<PieceArray>

    search(query: Query): Promise<Array<PieceArray>>

    // 1. Read EDEK by 'bucketId + dekPath + client public key', decrypt and put into DEK cache
    // 2. Decrypt EDEK using client private key and put into DEK cache
    // 3. Encrypt DEK by public key (so partner using his private key decrypted EDEK)
    // 4. Upload EDEK as a separate piece
    shareData(bucketId: bigint, dekPath: string, publicKeyHex: string): Promise<PieceUri>
}
```

### Data model

`PieceArray` - model presents group of pieces which has general logical link (pieces of 1 file, big data splitted to many pieces).


```typescript
type Data = ReadableStream<Uint8Array> | string | Uint8Array

export class PieceArray {
    data: Data;
    tags: Array<Tag>;
    cid?: string;
}
```

### Options

```typescript
export class ClientOptions {
    clusterAddress: string | number; // Cluster ID or CDN URL
    pieceConcurrency?: number = 4;
    chunkSizeInBytes?: number = 5 * MB;
    smartContract?: SmartContractOptions = TESTNET;
    scheme?: SchemeType | SchemeInterface = "sr25519";
    cipher?: CipherInterface;
    cidBuilder?: CidBuilder = new CidBuilder();
}

export class StoreOptions {
    // dekPath - Used to calculate DEK (bucketId + dekPath + client public key). Empty if not passed.
    dekPath?: string;

    // encrypt - If not passed, check 'cipher' parameter (encrypt if cipher configured)
    encrypt?: boolean;
}

export class ReadOptions {
    // dekPath - Used to get a DEK (bucketId + dekPath + client public key). Empty if not passed.
    dekPath?: string;
    // decrypt - If not passed, check 'cipher' parameter (decrypt if cipher configured)
    decrypt?: boolean;
}
```

### Setup client

```typescript
import {mnemonicGenerate} from "@polkadot/util-crypto";

const mnemonic = mnemonicGenerate()
const ddcClient = new DdcClient(mnemonic)
```

### Create bucket

```typescript
const createBucket = async () => {
    const storageClusterId = BigInt(1)
    const bucketCreatedEvent = await ddcClient.createBucket(BigInt(100), `{"replication": 3}`, storageClusterId);
    console.log("Successfully created bucket. Id: " + bucketCreatedEvent.bucketId);
}
```

### Grant bucket permission

```typescript
const bucketId = BigInt(1);

const grantBucketPermission = async () => {
    const partnerPublicKeyHex = "0xkldaf3a8as2109..."
    const permissionGrantedEvent = await ddcClient.grantBucketPermission(bucketId, partnerPublicKeyHex, Permission.READ)
    console.log("Successfully granted read permission to the bucket. Event: " + permissionGrantedEvent);
}
```

### Revoke bucket permission

```typescript
const bucketId = BigInt(1);

const revokeBucketPermission = async () => {
    const partnerPublicKeyHex = "0xkldaf3a8as2109..."
    const permissionRevokedEvent = await ddcClient.revokeBucketPermission(bucketId, partnerPublicKeyHex, Permission.READ)
    console.log("Successfully revoked read permission to the bucket. Event: " + permissionRevokedEvent);
}
```

### Store unencrypted data

```typescript
const bucketId = BigInt(1);

const storeUnencryptedData = async () => {
    const pieceArray = new PieceArray(new Uint8Array([1,2,3,4,5]), [new Tag("some-key", "some-value")]);
    const pieceUri = await ddcClient.store(bucketId, pieceArray, {encrypt: false});
    console.log("Successfully uploaded unencrypted piece. CID: " + pieceUri.cid);
}
```

### Store encrypted data

```typescript
const bucketId = BigInt(1);

const storeUnencryptedData = async () => {
    const pieceArray = new PieceArray(new Uint8Array([1,2,3,4,5]), [new Tag("some-key", "some-value")]);
    const pieceUri = await ddcClient.store(bucketId, pieceArray, {encrypt: true});
    console.log("Successfully uploaded encrypted piece. CID: " + pieceUri.cid);
}
```

### Share data

```typescript
const bucketId = BigInt(1);

const shareData = async () => {
    const partnerPublicKeyHex = "0xkldaf3a8as2109..."

    const edekUri = await ddcClient.shareData(bucketId, "/photos", partnerPublicKeyHex);
    console.log("Successfully shared data (uploaded EDEK). CID: " + edekUri.cid);
}
```

### Read data

```typescript
const readData = async () => {
    const pieceUri = new PieceUri(bucketId, "0xdaf3a8as2109kl...")

    const pieceArray = await ddcClient.read(pieceUri);
    console.log("Successfully read data.");
}
```

### Search pieces (metadata only)

```typescript
const searchDataMetadataOnly = async () => {
    const skipData = true;
    const pieceArrays = await ddcClient.search(new Query(bucketId, [new Tag("some-key", "some-value")], skipData));
    console.log("Successfully executed search.");
}
```

### Search pieces (load data)

```typescript
const searchDataLoadData = async () => {
    const skipData = false;
    const pieceArrays = await ddcClient.search(new Query(bucketId, [new Tag("some-key", "some-value")]), false);
    console.log("Successfully executed search.");
}
```

## File sharing platform example

```typescript

const fileSharingPlatform = async () => {
    const mnemonicBob = mnemonicGenerate();
    const bob = await createDdcClient(mnemonicBob);

    const clusterId = BigInt(1);

    /* Create Bob bucket */
    const bucketCreatedEvent = await bob.createBucket(BigInt(100 * CERE), `{"replication": 3}`, clusterId);
    const bucketId = bucketCreatedEvent.bucketId;

    /* Create photos folder */
    const photosFolder: PieceArray = {
        data: stringToU8a(`{"description":"My photos"}`),
        tags: [{key: "Type", value: "Folder"}, {key: "Path", value: "/"}, {key: "Name", value: "Photos"}]
    };
    const photosFolderUri = await bob.store(bucketId, photosFolder, {encrypt: true, dekPath: "/Photos"});
    console.log("Successfully created photos folder. CID: " + photosFolderUri.cid);

    /* Create friends folder */
    const friendsFolder: PieceArray = {
        data: stringToU8a(`{"description":"Photos that I want to share with my friends"}`),
        tags: [{key: "Type", value: "Folder"}, {key: "Path", value: "/Photos"}, {key: "Name", value: "Friends"}]
    };
    const friendsFolderUri = await bob.store(bucketId, friendsFolder, {encode: true, dekPath: "/Photos/Friends"});
    console.log("Successfully created friends folder. CID: " + friendsFolderUri.cid);

    /* Create Peter's folder */
    const peterFolder: PieceArray = {
        data: stringToU8a(`{"description":"Photos of my friend Peter"}`),
        tags: [{key: "Type", value: "Folder"}, {key: "Path", value: "/Photos/Friends"}, {key: "Name", value: "Peter"}]
    };
    const peterFolderUri = await bob.store(bucketId, peterFolder, {dekPath: "/Photos/Friends/Peter"});
    console.log("Successfully created Peter's folder. CID: " + peterFolderUri.cid);

    /* Upload Peter's Photo from his birthday */
    const peterPhoto: PieceArray = {
        data: stringToU8a("PHOTO AS BYTE ARRAY"),
        tags: [{key: "Type", value: "Folder"}, {key: "Path", value: "/Photos/Friends/Peter"}, {
            key: "Name",
            value: "photo.png"
        }]
    };
    const peterPhotoUri = await bob.store(bucketId, peterPhoto, {encode: true, dekPath: "/Photos/Friends/Peter/photo.png"});
    console.log("Successfully stored Peter's photo. CID: " + peterPhotoUri.cid);

    /* Create Jack's folder */
    const jackFolder: PieceArray = {
        data: stringToU8a(`{"description":"Photos of my friend Jack"}`),
        tags: [{key: "Type", value: "Folder"}, {key: "Path", value: "/Photos/Friends"}, {key: "Name", value: "Jack"}]
    };
    const jackFolderUri = await bob.store(bucketId, jackFolder, {dekPath: "/Photos/Friends/Jack"});
    console.log("Successfully created Jack's folder. CID: " + jackFolderUri.cid);

    /* Upload Peter's Photo from his birthday */
    const jackPhoto: PieceArray = {
        data: stringToU8a("PHOTO AS BYTE ARRAY"),
        tags: [{key: "Type", value: "Folder"}, {key: "Path", value: "/Photos/Friends/Jack"}, {
            key: "Name",
            value: "photo.png"
        }]
    };
    const jackPhotoUri = await bob.store(bucketId, jackPhoto, {dekPath: "/Photos/Friends/Jack/photo.png"});
    console.log("Successfully stored Jack's photo. CID: " + jackPhotoUri.cid);

    /* Grant Peter read permission to the bucket */
    const peterPublicKeyHex = "0xdaf21093a8askl..."
    const peterPermissionGrantedEvent = await bob.grantBucketPermission(bucketId, peterPublicKeyHex, Permission.READ)
    console.log("Successfully granted Peter read permission to the bucket. Event: " + peterPermissionGrantedEvent);

    /* Grant Jack read permission to the bucket */
    const jackPublicKeyHex = "0x3a8askldaf2109..."
    const jackPermissionGrantedEvent = await bob.grantBucketPermission(bucketId, jackPublicKeyHex, Permission.READ)
    console.log("Successfully granted Jack read permission to the bucket. Event: " + jackPermissionGrantedEvent);

    /* Share Peter's photos with Peter */
    await bob.shareData(bucketId, "/Photos/Friends/Peter", peterPublicKeyHex /* or crypto key is different? */);

    /* Share all friends photos with Jack (Jack is the best friend so Bob shares everything with him) */
    await bob.shareData(bucketId, "/Photos/Friends", jackPublicKeyHex /* or crypto key is different? */);

    /* Jack reads Peter's photo */
    const mnemonicJack = mnemonicGenerate();
    const jack = await createDdcClient(mnemonicJack);

    const peterPhotoReadByJack = await jack.read(peterPhotoUri, {decode: true, dekPath: "/Photos/Friends"});
    const jackPhotoReadByJack = await jack.read(jackPhotoUri, {decode: true, dekPath: "/Photos/Friends"});

    /* Peter reads Peter's photo */
    const mnemonicPeter = mnemonicGenerate();
    const peter = await createDdcClient(mnemonicPeter);

    const peterPhotoReadByPeter = await peter.read(peterPhotoUri, {decode: true, dekPath: "/Photos/Friends/Peter"});
}
```
