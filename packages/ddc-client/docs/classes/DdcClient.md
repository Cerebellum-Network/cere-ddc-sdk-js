[@cere-ddc-sdk/ddc-client](../README.md) / DdcClient

# Class: DdcClient

`DdcClient` is a class that provides methods to interact with the DDC.

It provides methods to manage buckets, grant access, and store and read files and DAG nodes.

## Methods

### bucketGet

▸ **bucketGet**(`bucketId`): `Promise`\<`undefined` \| `Bucket`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `bucketId` | `bigint` |

#### Returns

`Promise`\<`undefined` \| `Bucket`\>

**`Deprecated`**

Use `getBucket` instead

___

### bucketList

▸ **bucketList**(): `Promise`\<`Bucket`[]\>

#### Returns

`Promise`\<`Bucket`[]\>

**`Deprecated`**

Use `getBucketList` instead

___

### createBucket

▸ **createBucket**(`clusterId`, `params?`): `Promise`\<`bigint`\>

Creates a new bucket on a specified cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster where the bucket will be created. |
| `params` | `Partial`\<`BucketParams`\> | Optional parameters for the new bucket. Defaults to an empty object. Currently, the only parameter is `isPublic`, which defaults to `false`. |

#### Returns

`Promise`\<`bigint`\>

A promise that resolves to the ID of the newly created bucket.

**`Example`**

```typescript
const clusterId: ClusterId = '0x...';
const bucketId: BucketId = await ddcClient.createBucket(clusterId, {
  isPublic: true,
});
```

___

### depositBalance

▸ **depositBalance**(`clusterId`, `amount`, `options?`): `Promise`\<`SendResult`\>

Deposits a specified amount of tokens to the account for a specific cluster. The account must have enough tokens to cover the deposit.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster to deposit tokens for. |
| `amount` | `bigint` | The amount of tokens to deposit. |
| `options` | `DepositBalanceOptions` | Additional options for the deposit. |

#### Returns

`Promise`\<`SendResult`\>

A promise that resolves to the transaction hash of the deposit.

**`Example`**

```typescript
const clusterId: ClusterId = '0x...';
const amount = 100n;
const txHash = await ddcClient.depositBalance(clusterId, amount);

console.log(txHash);
```

___

### depositBalanceFor

▸ **depositBalanceFor**(`targetAddress`, `clusterId`, `amount`): `Promise`\<`SendResult`\>

Deposits a specified amount of tokens to the target address for a specific cluster.
This allows depositing funds on behalf of another address.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `targetAddress` | `string` | The target address to deposit funds for. |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster to deposit tokens for. |
| `amount` | `bigint` | The amount of tokens to deposit. |

#### Returns

`Promise`\<`SendResult`\>

A promise that resolves to the transaction hash of the deposit.

**`Example`**

```typescript
const targetAddress = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const clusterId: ClusterId = '0x...';
const amount = 100n;
const txHash = await ddcClient.depositBalanceFor(targetAddress, clusterId, amount);

console.log(txHash);
```

___

### getBalance

▸ **getBalance**(): `Promise`\<`bigint`\>

Retrieves the current free balance of the account.

#### Returns

`Promise`\<`bigint`\>

A promise that resolves to the current balance of the account.

**`Example`**

```typescript
const balance = await ddcClient.getBalance();

console.log(balance);
```

___

### getBucket

▸ **getBucket**(`bucketId`): `Promise`\<`undefined` \| `Bucket`\>

Retrieves information about a specific bucket by its ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucketId` | `bigint` | The ID of the bucket to retrieve. |

#### Returns

`Promise`\<`undefined` \| `Bucket`\>

A promise that resolves to the bucket information.

**`Example`**

```typescript
const bucketId: BucketId = 1n;
const bucket = await ddcClient.getBucket(bucketId);

console.log(bucket);
```

___

### getBucketList

▸ **getBucketList**(): `Promise`\<`Bucket`[]\>

Retrieves a list of all available buckets.

#### Returns

`Promise`\<`Bucket`[]\>

A promise that resolves to an array of buckets.

**`Example`**

```typescript
const buckets = await ddcClient.getBucketList();

console.log(buckets);
```

___

### getDeposit

▸ **getDeposit**(`clusterId`, `accountId?`): `Promise`\<`bigint`\>

Retrieves the current active deposit of the account for a specific cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster to get deposit for. |
| `accountId?` | `string` | Optional account ID. If not provided, uses the signer's address. |

#### Returns

`Promise`\<`bigint`\>

A promise that resolves to the current active deposit of the account.

**`Example`**

```typescript
const clusterId: ClusterId = '0x...';
const deposit = await ddcClient.getDeposit(clusterId);

console.log(deposit);
```

___

### grantAccess

▸ **grantAccess**(`subject`, `params`): `Promise`\<[`AuthToken`](AuthToken.md)\>

Grants access to a bucket to a specific account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `subject` | `string` | The account ID to grant access to. |
| `params` | `Omit`\<`AuthTokenParams`, ``"subject"``\> | The parameters for the access being granted. |

#### Returns

`Promise`\<[`AuthToken`](AuthToken.md)\>

A new AuthToken that the subject account can use to access the bucket.

**`Example`**

```typescript
const subject: AccountId = '0x...';
const authToken = await ddcClient.grantAccess(subject, {
  bucketId: 1n,
  operations: [AuthTokenOperation.GET],
});

console.log(authToken.toString());
```

___

### read

▸ **read**(`uri`, `options?`): `Promise`\<[`FileResponse`](FileResponse.md)\>

Reads a file or DAG node from a specific URI.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uri` | [`FileUri`](FileUri.md) | The URI of the file or DAG node to read. |
| `options?` | `PieceReadOptions` | Optional parameters for reading the entity. |

#### Returns

`Promise`\<[`FileResponse`](FileResponse.md)\>

A promise that resolves to the file or DAG node response.

**`Example`**

```typescript
const fileUri = new FileUri(bucketId, cid);
const fileResponse = await ddcClient.read(fileUri);
const textContent = await fileResponse.text();

console.log(textContent);
```

___

### removeBuckets

▸ **removeBuckets**(`...bucketIds`): `Promise`\<`bigint`[]\>

Mark existing buckets with specified bucket ids as removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...bucketIds` | `bigint`[] | The IDs of the buckets to remove. |

#### Returns

`Promise`\<`bigint`[]\>

A promise that resolves to the IDs of the removed buckets.

**`Example`**

```typescript
const removedBucketIds = await ddcClient.removeBucket(1, 2, 3);
```

___

### resolveName

▸ **resolveName**(`bucketId`, `cnsName`, `options?`): `Promise`\<`Cid`\>

Resolves a CNS name to a specific CID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucketId` | `bigint` | The ID of the bucket to resolve the CNS name in. |
| `cnsName` | `string` | The CNS name to resolve. |
| `options?` | `CnsRecordGetOptions` | - |

#### Returns

`Promise`\<`Cid`\>

A promise that resolves to the CID of the CNS name.

**`Example`**

```typescript
const bucketId: BucketId = 1n;
const cnsName = 'my-file';
const cid = await ddcClient.resolveName(bucketId, cnsName);

console.log(cid);
```

___

### store

▸ **store**(`bucketId`, `entity`, `options?`): `Promise`\<[`FileUri`](FileUri.md)\>

Stores a file or DAG node in a specific bucket.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucketId` | `bigint` | The ID of the bucket to store the entity in. |
| `entity` | [`File`](File.md) | The file or DAG node to store. |
| `options?` | `FileStoreOptions` | Optional parameters for storing the entity. |

#### Returns

`Promise`\<[`FileUri`](FileUri.md)\>

A promise that resolves to a URI for the stored entity.

**`Throws`**

Will throw an error if the `entity` argument is neither a File nor a DagNode.

**`Example`**

```typescript
const bucketId: BucketId = 1n;
const fileContent = '...';
const file: File = new File(fileContent, { size: 1000 });
const fileUri = await ddcClient.store(bucketId, file);

console.log(fileUri);
```

___

### unlockDeposit

▸ **unlockDeposit**(`clusterId`, `amount`): `Promise`\<`SendResult`\>

Unlocks deposit funds from the account for the specified cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `amount` | `bigint` | The amount to unlock. |

#### Returns

`Promise`\<`SendResult`\>

A promise that resolves to the transaction hash.

**`Example`**

```typescript
const clusterId: ClusterId = '0x...';
const amount = 100n;
const txHash = await ddcClient.unlockDeposit(clusterId, amount);

console.log(txHash);
```

___

### withdrawUnlockedDeposit

▸ **withdrawUnlockedDeposit**(`clusterId`): `Promise`\<`SendResult`\>

Withdraws unlocked funds from the account for the specified cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |

#### Returns

`Promise`\<`SendResult`\>

A promise that resolves to the transaction hash.

**`Example`**

```typescript
const clusterId: ClusterId = '0x...';
const txHash = await ddcClient.withdrawUnlockedDeposit(clusterId);

console.log(txHash);
```

___

### create

▸ **create**(`uriOrSigner`, `config?`): `Promise`\<[`DdcClient`](DdcClient.md)\>

Creates a new instance of the DdcClient.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `uriOrSigner` | `string` \| [`Signer`](Signer.md) | `undefined` | A Signer instance or a [substrate URI](https://polkadot.js.org/docs/keyring/start/suri). |
| `config` | `DdcClientConfig` | `DEFAULT_PRESET` | Configuration options for the DdcClient. Defaults to TESTNET. |

#### Returns

`Promise`\<[`DdcClient`](DdcClient.md)\>

A promise that resolves to a new instance of the DdcClient.

**`Example`**

```typescript
const ddcClient = await DdcClient.create('//Alice', DEVNET);
```

```typescript
const ddcClient = await DdcClient.create('//Alice', {
  blockchain: 'wss://devnet.cere.network',
  retries: 3,
});
```
