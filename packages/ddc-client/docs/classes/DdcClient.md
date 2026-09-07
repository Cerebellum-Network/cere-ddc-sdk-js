[**@cere-ddc-sdk/ddc-client**](../README.md)

***

[@cere-ddc-sdk/ddc-client](../README.md) / DdcClient

# Class: DdcClient

`DdcClient` is a class that provides methods to interact with the DDC.

It provides methods to manage buckets, grant access, and store and read files and DAG nodes.

## Methods

### ~~bucketGet()~~

> **bucketGet**(`bucketId`): `Promise`\<`Bucket` \| `undefined`\>

#### Parameters

##### bucketId

`bigint`

#### Returns

`Promise`\<`Bucket` \| `undefined`\>

#### Deprecated

Use `getBucket` instead

***

### ~~bucketList()~~

> **bucketList**(): `Promise`\<`Bucket`[]\>

#### Returns

`Promise`\<`Bucket`[]\>

#### Deprecated

Use `getBucketList` instead

***

### createBucket()

> **createBucket**(`params?`): `Promise`\<`bigint`\>

Creates a new bucket on the configured cluster.

#### Parameters

##### params?

`Partial`\<`BucketParams`\> = `{}`

Optional parameters for the new bucket. Defaults to an empty object.
                Currently, the only parameter is `isPublic`, which defaults to `false`.

#### Returns

`Promise`\<`bigint`\>

A promise that resolves to the ID of the newly created bucket.

#### Example

```typescript
const bucketId: BucketId = await ddcClient.createBucket({
  isPublic: true,
});
```

***

### depositBalance()

> **depositBalance**(`amount`, `options?`): `Promise`\<`SendResult`\>

Deposits a specified amount of tokens to the account for the configured cluster. The account must have enough tokens to cover the deposit.

#### Parameters

##### amount

`bigint`

The amount of tokens to deposit.

##### options?

`DepositBalanceOptions` = `{}`

Additional options for the deposit.

#### Returns

`Promise`\<`SendResult`\>

A promise that resolves to the transaction hash of the deposit.

#### Example

```typescript
const amount = 100n;
const txHash = await ddcClient.depositBalance(amount);

console.log(txHash);
```

***

### depositBalanceFor()

> **depositBalanceFor**(`targetAddress`, `amount`): `Promise`\<`SendResult`\>

Deposits a specified amount of tokens to the target address for the configured cluster.
This allows depositing funds on behalf of another address.

#### Parameters

##### targetAddress

`string`

The target address to deposit funds for.

##### amount

`bigint`

The amount of tokens to deposit.

#### Returns

`Promise`\<`SendResult`\>

A promise that resolves to the transaction hash of the deposit.

#### Example

```typescript
const targetAddress = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const amount = 100n;
const txHash = await ddcClient.depositBalanceFor(targetAddress, amount);

console.log(txHash);
```

***

### getBalance()

> **getBalance**(): `Promise`\<`bigint`\>

Retrieves the current free balance of the account.

#### Returns

`Promise`\<`bigint`\>

A promise that resolves to the current balance of the account.

#### Example

```typescript
const balance = await ddcClient.getBalance();

console.log(balance);
```

***

### getBucket()

> **getBucket**(`bucketId`): `Promise`\<`Bucket` \| `undefined`\>

Retrieves information about a specific bucket by its ID.

#### Parameters

##### bucketId

`bigint`

The ID of the bucket to retrieve.

#### Returns

`Promise`\<`Bucket` \| `undefined`\>

A promise that resolves to the bucket information.

#### Example

```typescript
const bucketId: BucketId = 1n;
const bucket = await ddcClient.getBucket(bucketId);

console.log(bucket);
```

***

### getBucketList()

> **getBucketList**(): `Promise`\<`Bucket`[]\>

Retrieves a list of all available buckets.

#### Returns

`Promise`\<`Bucket`[]\>

A promise that resolves to an array of buckets.

#### Example

```typescript
const buckets = await ddcClient.getBucketList();

console.log(buckets);
```

***

### getDeposit()

> **getDeposit**(`accountId?`): `Promise`\<`bigint`\>

Retrieves the current active deposit of the account for the configured cluster.

#### Parameters

##### accountId?

`string`

Optional account ID. If not provided, uses the signer's address.

#### Returns

`Promise`\<`bigint`\>

A promise that resolves to the current active deposit of the account.

#### Example

```typescript
const deposit = await ddcClient.getDeposit();

console.log(deposit);
```

***

### grantAccess()

> **grantAccess**(`subject`, `params`): `Promise`\<[`AuthToken`](AuthToken.md)\>

Grants access to a bucket to a specific account.

#### Parameters

##### subject

`string`

The account ID to grant access to.

##### params

`Omit`\<`AuthTokenParams`, `"subject"`\>

The parameters for the access being granted.

#### Returns

`Promise`\<[`AuthToken`](AuthToken.md)\>

A new AuthToken that the subject account can use to access the bucket.

#### Example

```typescript
const subject: AccountId = '0x...';
const authToken = await ddcClient.grantAccess(subject, {
  bucketId: 1n,
  operations: [AuthTokenOperation.GET],
});

console.log(authToken.toString());
```

***

### read()

#### Call Signature

> **read**(`uri`, `options?`): `Promise`\<[`FileResponse`](FileResponse.md)\>

Reads a file or DAG node from a specific URI.

##### Parameters

###### uri

[`FileUri`](FileUri.md)

The URI of the file or DAG node to read.

###### options?

`PieceReadOptions`

Optional parameters for reading the entity.

##### Returns

`Promise`\<[`FileResponse`](FileResponse.md)\>

A promise that resolves to the file or DAG node response.

##### Example

```typescript
const fileUri = new FileUri(bucketId, cid);
const fileResponse = await ddcClient.read(fileUri);
const textContent = await fileResponse.text();

console.log(textContent);
```

#### Call Signature

> **read**(`uri`, `options?`): `Promise`\<[`DagNodeResponse`](DagNodeResponse.md)\>

Reads a file or DAG node from a specific URI.

##### Parameters

###### uri

[`DagNodeUri`](DagNodeUri.md)

The URI of the file or DAG node to read.

###### options?

`DagNodeGetOptions`

Optional parameters for reading the entity.

##### Returns

`Promise`\<[`DagNodeResponse`](DagNodeResponse.md)\>

A promise that resolves to the file or DAG node response.

##### Example

```typescript
const fileUri = new FileUri(bucketId, cid);
const fileResponse = await ddcClient.read(fileUri);
const textContent = await fileResponse.text();

console.log(textContent);
```

***

### removeBuckets()

> **removeBuckets**(...`bucketIds`): `Promise`\<`bigint`[]\>

Mark existing buckets with specified bucket ids as removed.

#### Parameters

##### bucketIds

...`bigint`[]

The IDs of the buckets to remove.

#### Returns

`Promise`\<`bigint`[]\>

A promise that resolves to the IDs of the removed buckets.

#### Example

```typescript
const removedBucketIds = await ddcClient.removeBucket(1, 2, 3);
```

***

### resolveName()

> **resolveName**(`bucketId`, `cnsName`, `options?`): `Promise`\<`Cid`\>

Resolves a CNS name to a specific CID.

#### Parameters

##### bucketId

`bigint`

The ID of the bucket to resolve the CNS name in.

##### cnsName

`string`

The CNS name to resolve.

##### options?

`CnsRecordGetOptions`

#### Returns

`Promise`\<`Cid`\>

A promise that resolves to the CID of the CNS name.

#### Example

```typescript
const bucketId: BucketId = 1n;
const cnsName = 'my-file';
const cid = await ddcClient.resolveName(bucketId, cnsName);

console.log(cid);
```

***

### store()

#### Call Signature

> **store**(`bucketId`, `entity`, `options?`): `Promise`\<[`FileUri`](FileUri.md)\>

Stores a file or DAG node in a specific bucket.

##### Parameters

###### bucketId

`bigint`

The ID of the bucket to store the entity in.

###### entity

[`File`](File.md)

The file or DAG node to store.

###### options?

`FileStoreOptions`

Optional parameters for storing the entity.

##### Returns

`Promise`\<[`FileUri`](FileUri.md)\>

A promise that resolves to a URI for the stored entity.

##### Throws

Will throw an error if the `entity` argument is neither a File nor a DagNode.

##### Example

```typescript
const bucketId: BucketId = 1n;
const fileContent = ...;
const file: File = new File(fileContent, { size: 1000 });
const fileUri = await ddcClient.store(bucketId, file);

console.log(fileUri);
```

#### Call Signature

> **store**(`bucketId`, `entity`, `options?`): `Promise`\<[`DagNodeUri`](DagNodeUri.md)\>

Stores a file or DAG node in a specific bucket.

##### Parameters

###### bucketId

`bigint`

The ID of the bucket to store the entity in.

###### entity

[`DagNode`](DagNode.md)

The file or DAG node to store.

###### options?

`DagNodeStoreOptions`

Optional parameters for storing the entity.

##### Returns

`Promise`\<[`DagNodeUri`](DagNodeUri.md)\>

A promise that resolves to a URI for the stored entity.

##### Throws

Will throw an error if the `entity` argument is neither a File nor a DagNode.

##### Example

```typescript
const bucketId: BucketId = 1n;
const fileContent = ...;
const file: File = new File(fileContent, { size: 1000 });
const fileUri = await ddcClient.store(bucketId, file);

console.log(fileUri);
```

***

### unlockDeposit()

> **unlockDeposit**(`amount`): `Promise`\<`SendResult`\>

Unlocks deposit funds from the account for the configured cluster.

#### Parameters

##### amount

`bigint`

The amount to unlock.

#### Returns

`Promise`\<`SendResult`\>

A promise that resolves to the transaction hash.

#### Example

```typescript
const amount = 100n;
const txHash = await ddcClient.unlockDeposit(amount);

console.log(txHash);
```

***

### withdrawUnlockedDeposit()

> **withdrawUnlockedDeposit**(): `Promise`\<`SendResult`\>

Withdraws unlocked funds from the account for the configured cluster.

#### Returns

`Promise`\<`SendResult`\>

A promise that resolves to the transaction hash.

#### Example

```typescript
const txHash = await ddcClient.withdrawUnlockedDeposit();

console.log(txHash);
```

***

### create()

> `static` **create**(`uriOrSigner`, `config`): `Promise`\<`DdcClient`\>

Creates a new instance of the DdcClient.

#### Parameters

##### uriOrSigner

`string` \| [`Signer`](../interfaces/Signer.md)

A Signer instance or a [substrate URI](https://polkadot.js.org/docs/keyring/start/suri).

##### config

`DdcClientConfig`

Configuration options for the DdcClient. `clusterId` and `storageUrl` are required.

#### Returns

`Promise`\<`DdcClient`\>

A promise that resolves to a new instance of the DdcClient.

#### Example

```typescript
const ddcClient = await DdcClient.create('bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice', {
  blockchain: 'wss://devnet.cere.network',
  clusterId: '0x...',
  storageUrl: 'https://storage.example',
  retries: 3,
});
```
