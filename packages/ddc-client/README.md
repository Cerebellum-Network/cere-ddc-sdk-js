# @cere-ddc-sdk/ddc-client

## Introduction

`DEK` is a data encryption key used to encrypt the data.

`EDEK` is an encrypted data encryption key that is stored in DDC and used to share data (re-encrypt DEK per partner).

`DEK path` is a hierarchical encryption path (e.g. /photos/friends) that is used to generate `DEK` recursively and share
data on any level. Similar to directory based access.

## DdcClient API description

### Data model

`PieceArray` - model presents group of pieces which has general logical link (pieces of 1 file, big data splitted to
many pieces).

```typescript
type Data = ReadableStream<Uint8Array> | string | Uint8Array

export class PieceArray {
    data: Data;
    tags: Array<Tag>;
    cid?: string;
}
```

### Options

#### DDC Client options

DDC Client options with required configuration for connecting to blockchain network, discovering node addresses,
parameters for data splitting by pieces and encryption.

```typescript
export class ClientOptions {
    clusterAddress: string | number; // Cluster ID or CDN URL
    pieceConcurrency?: number = 4;
    chunkSizeInBytes?: number = 5 * MB;
    smartContract?: SmartContractOptions = TESTNET;
    scheme?: SchemeName | SchemeInterface = "sr25519";
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
import {mnemonicGenerate} from "@polkadot/util-crypto";
import {DdcClient} from "@cere-ddc-sdk/ddc-client";

const options = {clusterAddress: 2n};
const secretPhrase = mnemonicGenerate();
const ddcClient = DdcClient.buildAndConnect(options, secretPhrase);
```

### Create bucket

Create bucket in storage cluster in required `storageClusterId`.

```typescript
const createBucket = async (storageClusterId: bigint) => {
    const bucketCreatedEvent = await ddcClient.createBucket(10n, `{"replication": 3}`, storageClusterId);
    console.log("Successfully created bucket. Id: " + bucketCreatedEvent.bucketId);
}
```

### Get bucket status

Get bucket status by id from blockchain.

```typescript
const getBucket = async (bucketId: bigint) => {
    const bucketStatus = await ddcClient.bucketGet(bucketId);
    console.log("Successfully got bucket status. Status: " + bucketStatus);
}
```

### Get bucket status

Get bucket statuses with limitations.

```typescript
const getBucket = async (limit: bigint) => {
    const bucketStatuses = await ddcClient.bucketList(0, limit);
    console.log("Successfully got bucket statuses. Statuses: " + bucketStatuses);
}
```

### Store unencrypted data

Store data in DDC so anyone can read it nad able to search by tag `type=photo`.

```typescript
import {PieceArray} from "@cere-ddc-sdk/ddc-client";
import {Tag} from "@cere-ddc-sdk/core";

const storeUnencryptedData = async (bucketId: bigint, data: Uint8Array) => {
    const pieceArray = new PieceArray(data, [new Tag("type", "photo")]);
    const pieceUri = await ddcClient.store(bucketId, pieceArray, {encrypt: false});
    console.log("Successfully uploaded unencrypted piece. CID: " + pieceUri.cid);
}
```

### Store encrypted data

Store encrypted data in DDC, so only users with DEK can read it.

```typescript
import {PieceArray} from "@cere-ddc-sdk/ddc-client";
import {Tag} from "@cere-ddc-sdk/core";

const storeUnencryptedData = async (bucketId: bigint, data: Uint8Array) => {
    const pieceArray = new PieceArray(data, [new Tag("type", "photo")]);
    const pieceUri = await ddcClient.store(bucketId, pieceArray, {encrypt: true});
    console.log("Successfully uploaded encrypted piece. CID: " + pieceUri.cid);
}
```

### Share data

Give DEK to encrypted data for other user by encryption public key.

```typescript
const shareData = async (bucketId: bigint) => {
    const partnerPublicKeyHex = "0xkldaf3a8as2109...";

    const edekUri = await ddcClient.shareData(bucketId, "/photos", partnerPublicKeyHex);
    console.log("Successfully shared data (uploaded EDEK). CID: " + edekUri.cid);
}
```

### Read data

Download data from DDC storage

```typescript
import {PieceUri} from "@cere-ddc-sdk/content-addressable-storage";

const readData = async (pieceUri: PieceUri) => {
    const pieceArray = await ddcClient.read(pieceUri);
    console.log("Successfully read data. CID: " + pieceArray.cid);
}
```

### Search pieces (metadata only)

Search data by tags without loading data.

```typescript
const searchDataMetadataOnly = async (bucketId: bigint) => {
    const skipData = true;
    const pieceArrays = await ddcClient.search(new Query(bucketId, [new Tag("type", "photo")], skipData));
    console.log("Successfully searched metadata. CIDS: " + pieceArrays.map(e => e.cid));
}
```

### Search pieces (load data)

Search data by required tags with loading data.

```typescript
const searchDataLoadData = async () => {
    const skipData = false;
    const pieceArrays = await ddcClient.search(new Query(bucketId, [new Tag("type", "video")]), skipData);
    console.log("Successfully searched pieces. CIDS: " + pieceArrays.map(e => e.cid));
}
```

### Disconnect

Disconnect DDC Client from blockchain

```typescript
await ddcClient.disconnect();
```