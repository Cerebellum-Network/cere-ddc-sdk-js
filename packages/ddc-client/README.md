# @cere-ddc-sdk/ddc-client

> After the major update `v2.0.0` the documentation below is outdated and no longer relevant. It will be updated before the final release.

## Introduction

`DEK` is a data encryption key used to encrypt the data.

`EDEK` is an encrypted data encryption key that is stored in DDC and used to share data (re-encrypt DEK per partner).

`DEK path` is a hierarchical encryption path (e.g. /photos/friends) that is used to generate `DEK` recursively and share
data on any level. Similar to directory based access.

## DdcClient API description

### Data model

`File` - model presents group of pieces which has general logical link (pieces of 1 file, big data splitted to many
pieces).

```typescript
type Data = ReadableStream<Uint8Array> | string | Uint8Array;

export class File {
    data: Data;
    tags: Array<Tag>;
    headCid?: string;
}
```

### Options

#### DDC Client options

DDC Client options with required configuration for connecting to blockchain network, discovering node addresses,
parameters for data splitting by pieces and encryption.

```typescript
export class ClientOptions {
    clusterAddress: string | number; // Cluster ID or CDN URL
    fileOptions?: FileOptions = new FileStorageConfig();
    smartContract?: SmartContractOptions = TESTNET;
    scheme?: SchemeName | SchemeInterface = 'sr25519';
    cipher?: CipherInterface = new NaclCipher();
    cidBuilder?: CidBuilder = new CidBuilder();
}
```

#### DDC Client store options

Options per execution for store data.

```typescript
export class StoreOptions {
    // dekPath - Used to calculate DEK (bucketId + dekPath + client public key). Empty if not passed.
    dekPath?: string;

    // encrypt - If not passed, check 'cipher' parameter (encrypt if cipher configured)
    encrypt?: boolean;
}
```

#### DDC Client read options

Options per execution for download data.

```typescript
export class ReadOptions {
    // dekPath - Used to get a DEK (bucketId + dekPath + client public key). Empty if not passed.
    dekPath?: string;
    // decrypt - If not passed, check 'cipher' parameter (decrypt if cipher configured)
    decrypt?: boolean;
}
```

### Setup client

Initialize DDC client and connect to blockchain.

```typescript
import {mnemonicGenerate} from '@polkadot/util-crypto';
import {DdcClient} from '@cere-ddc-sdk/ddc-client';

const options = {clusterAddress: 2n};
const secretPhrase = mnemonicGenerate();
const ddcClient = DdcClient.buildAndConnect(options, secretPhrase);
```

### Create bucket

Create bucket in storage cluster in required `storageClusterId`, deposit to account and reserve resources.

```typescript
const createBucket = async (balance: bigint, resource: bigint, storageClusterId: bigint) => {
    const bucketCreatedEvent = await ddcClient.createBucket(balance, resource, storageClusterId, {replication: 3});
    console.log('Successfully created bucket. Id: ' + bucketCreatedEvent.bucketId);
};
```

### Account Deposit

Add tokens to account.

```typescript
const accountDeposit = async (balance: bigint) => {
    await ddcClient.accountDeposit(balance);
    console.log('Successfully added tokens to account.');
};
```

### Bucket allocation into cluster

Increase bucket size.

```typescript
const bucketAllocIntoCluster = async (bucketId: bigint, resource: bigint) => {
    await ddcClient.bucketAllocIntoCluster(bucketId, resource);
    console.log(`Successfully increased bucket size to ${resource}.`);
};
```

### Get bucket status

Get bucket status by id from blockchain.

```typescript
const getBucket = async (bucketId: bigint) => {
    const bucketStatus = await ddcClient.bucketGet(bucketId);
    console.log('Successfully got bucket status. Status: ' + bucketStatus);
};
```

### Get bucket status

Get bucket statuses with limitations.

```typescript
const getBucket = async (limit: bigint) => {
    const bucketStatuses = await ddcClient.bucketList(0, limit);
    console.log('Successfully got bucket statuses. Statuses: ' + bucketStatuses);
};
```

[### Grant bucket permission Give write access to bucket for user by public key. ```typescript const grantBucketPermission = async (bucketId: bigint) => { const partnerPublicKeyHex = "0xkldaf3a8as2109..." const permissionGrantedEvent = await ddcClient.grantBucketPermission(bucketId, partnerPublicKeyHex, Permission.WRITE) console.log("Successfully granted read permission to the bucket. Event: " + permissionGrantedEvent); } ``` ### Revoke bucket permission Revoke write to bucket permissions for user by public key. ```typescript import {Permission} from "@cere-ddc-sdk/smart-contract"; const revokeBucketPermission = async (bucketId: bigint) => { const partnerPublicKeyHex = "0xkldaf3a8as2109..."; const permissionRevokedEvent = await ddcClient.revokeBucketPermission(bucketId, partnerPublicKeyHex, Permission.WRITE) console.log("Successfully revoked read permission to the bucket. Event: " + permissionRevokedEvent); } ```]: #

### Store unencrypted data

Store data as piece in DDC so anyone can read it nad able to search by tag `type=photo`.

```typescript
import {Tag, Piece} from '@cere-ddc-sdk/core';

const storeUnencryptedData = async (bucketId: bigint, data: Uint8Array) => {
    const pieceArray = new Piece(data, [new Tag('type', 'photo')]);
    const ddcUri = await ddcClient.store(bucketId, pieceArray, {encrypt: false});
    console.log('Successfully uploaded unencrypted piece. DDC URI: ' + ddcUri.toString());
};
```

Store data as group of pieces(file) in DDC so anyone can read it nad able to search by tag `type=photo`.

```typescript
import {File} from '@cere-ddc-sdk/ddc-client';
import {Tag} from '@cere-ddc-sdk/core';

const storeUnencryptedData = async (bucketId: bigint, data: Uint8Array) => {
    const pieceArray = new File(data, [new Tag('type', 'photo')]);
    const ddcUri = await ddcClient.store(bucketId, pieceArray, {encrypt: false});
    console.log('Successfully uploaded unencrypted piece. DDC URI: ' + ddcUri.toString());
};
```

### Store encrypted data

Store encrypted data as piece in DDC, so only users with DEK can read it.

```typescript
import {Tag, Piece} from '@cere-ddc-sdk/core';

const storeUnencryptedData = async (bucketId: bigint, data: Uint8Array) => {
    const pieceArray = new Piece(data, [new Tag('type', 'photo')]);
    const ddcUri = await ddcClient.store(bucketId, pieceArray, {encrypt: true});
    console.log('Successfully uploaded encrypted piece. DDC URI: ' + ddcUri.toString());
};
```

### Share data

Give DEK to encrypted data for other user by encryption public key.

```typescript
const shareData = async (bucketId: bigint) => {
    const partnerPublicKeyHex = '0xkldaf3a8as2109...';

    const edekUri = await ddcClient.shareData(bucketId, '/photos', partnerPublicKeyHex);
    console.log('Successfully shared data (uploaded EDEK). CID: ' + edekUri.cid);
};
```

### Read data

Download data from DDC storage. Downloads File or Piece, depends on `protocol` in DDC Uri.

```typescript
import {Piece} from '@cere-ddc-sdk/content-addressable-storage';
import {DdcUri, File} from '@cere-ddc-sdk/ddc-client';

const readData = async (ddcUri: DdcUri) => {
    const pieceOrFile: Piece | File = await ddcClient.read(ddcUri);
    console.log('Successfully read data. CID: ' + pieceOrFile.cid || pieceOrFile.headCid);
};
```

### Search pieces (metadata only)

Search data by tags without loading data.

```typescript
const searchDataMetadataOnly = async (bucketId: bigint) => {
    const skipData = true;
    const pieces = await ddcClient.search(new Query(bucketId, [new Tag('type', 'photo')], skipData));
    console.log('Successfully searched metadata. CIDS: ' + pieces.map((e) => e.cid));
};
```

### Search pieces (load data)

Search data by required tags with loading data.

```typescript
const searchDataLoadData = async () => {
    const skipData = false;
    const pieces = await ddcClient.search(new Query(bucketId, [new Tag('type', 'video')]), skipData);
    console.log('Successfully searched pieces. CIDS: ' + pieces.map((e) => e.cid));
};
```

### Disconnect

Disconnect DDC Client from blockchain

```typescript
await ddcClient.disconnect();
```
