[@cere-ddc-sdk/blockchain](../README.md) / DDCCustomersPallet

# Class: DDCCustomersPallet

This class provides methods to interact with the DDC Customers pallet on the blockchain.

**`Example`**

```typescript
const bucket = await blockchain.ddcCustomers.getBucket(1n);

console.log(bucket);
```

## Methods

### createBucket

▸ **createBucket**(`clusterId`, `params`): `Sendable`

Creates a new bucket.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `params` | `BucketParams` | The bucket parameters. |

#### Returns

`Sendable`

An extrinsic to create the bucket.

**`Example`**

```typescript
const tx = blockchain.ddcCustomers.createBucket('0x...', { isPublic: true });

await blockchain.send(tx, { account });
```

___

### deposit

▸ **deposit**(`clusterId`, `value`): `Sendable`

Deposits funds to the account for the specified cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `value` | `bigint` | The amount to deposit. |

#### Returns

`Sendable`

An extrinsic to deposit funds.

**`Example`**

```typescript
const tx = blockchain.ddcCustomers.deposit('0x...', 100n);

await blockchain.send(tx, { account });
```

___

### depositExtra

▸ **depositExtra**(`clusterId`, `maxAdditional`): `Sendable`

Deposits additional funds to the account for the specified cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `maxAdditional` | `bigint` | The maximum amount to deposit. |

#### Returns

`Sendable`

An extrinsic to deposit additional funds.

**`Example`**

```typescript
const tx = blockchain.ddcCustomers.depositExtra('0x...', 100n);

await blockchain.send(tx, { account });
```

___

### depositFor

▸ **depositFor**(`targetAddress`, `clusterId`, `amount`): `Sendable`

Deposits funds to the target address for the specified cluster.
This allows a third party to deposit funds on behalf of another address.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `targetAddress` | `string` | The target address to deposit funds for. |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `amount` | `bigint` | The amount to deposit. |

#### Returns

`Sendable`

An extrinsic to deposit funds for the target address.

**`Example`**

```typescript
const tx = blockchain.ddcCustomers.depositFor('5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu', '0x...', 100n);

await blockchain.send(tx, { account });
```

___

### extractCreatedBucketIds

▸ **extractCreatedBucketIds**(`events`): `bigint`[]

Extracts the IDs of the created buckets from the given events.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `events` | `Event`[] | The events to extract the bucket IDs from. |

#### Returns

`bigint`[]

The IDs of the created buckets.

**`Example`**

```typescript
const bucketIds = blockchain.ddcCustomers.extractCreatedBucketIds(events);

console.log(bucketIds);
```

___

### extractRemovedBucketIds

▸ **extractRemovedBucketIds**(`events`): `bigint`[]

Extracts the IDs of the removed buckets from the given events.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `events` | `Event`[] | The events to extract the bucket IDs from. |

#### Returns

`bigint`[]

The IDs of the removed buckets.

**`Example`**

```typescript
const bucketIds = blockchain.ddcCustomers.extractRemovedBucketIds(events);

console.log(bucketIds);
```

___

### getBucket

▸ **getBucket**(`bucketId`): `Promise`\<`undefined` \| `Bucket`\>

Returns the bucket with the given ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucketId` | `bigint` | The ID of the bucket. |

#### Returns

`Promise`\<`undefined` \| `Bucket`\>

A promise that resolves to the bucket.

**`Example`**

```typescript
const bucket = await blockchain.ddcCustomers.getBucket(1n);

console.log(bucket);
```

___

### getBucketsCount

▸ **getBucketsCount**(): `Promise`\<`number`\>

Returns the number of buckets.

#### Returns

`Promise`\<`number`\>

A promise that resolves to the number of buckets.

**`Example`**

```typescript
const bucketsCount = await blockchain.ddcCustomers.getBucketsCount();

console.log(bucketsCount);
```

___

### getStackingInfo

▸ **getStackingInfo**(`clusterId`, `accountId`): `Promise`\<`undefined` \| `StakingInfo`\>

Returns the staking info for the given account in the specified cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `accountId` | `string` | The ID of the account. |

#### Returns

`Promise`\<`undefined` \| `StakingInfo`\>

A promise that resolves to the staking info.

**`Example`**

```typescript
const stakingInfo = await blockchain.ddcCustomers.getStackingInfo('0x...', '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu');

console.log(stakingInfo);
```

___

### getStackingInfoLegacy

▸ **getStackingInfoLegacy**(`accountId`): `Promise`\<`undefined` \| `StakingInfo`\>

Returns the staking info for the given account (legacy method - deprecated).
This method is deprecated because the storage has migrated to cluster-based ledger.
Use getStackingInfo(clusterId, accountId) instead.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accountId` | `string` | The ID of the account. |

#### Returns

`Promise`\<`undefined` \| `StakingInfo`\>

A promise that resolves to the staking info.

**`Deprecated`**

Use getStackingInfo(clusterId, accountId) instead.

___

### listBuckets

▸ **listBuckets**(): `Promise`\<`Bucket`[]\>

Returns the list of buckets.

#### Returns

`Promise`\<`Bucket`[]\>

A promise that resolves to the list of buckets.

**`Example`**

```typescript
const buckets = await blockchain.ddcCustomers.listBuckets();

console.log(buckets);
```

___

### removeBuckets

▸ **removeBuckets**(`...bucketIds`): `Sendable`

Mark existing buckets with specified bucket ids as removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...bucketIds` | `bigint`[] | The IDs of the buckets to remove. |

#### Returns

`Sendable`

An extrinsic to remove the buckets.

**`Example`**

```typescript
const tx = blockchain.ddcCustomers.removeBuckets(1n, 2n);

await blockchain.send(tx, { account });
```

___

### setBucketParams

▸ **setBucketParams**(`bucketId`, `params`): `Sendable`

Sets the parameters of the bucket with the given ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucketId` | `bigint` | The ID of the bucket. |
| `params` | `BucketParams` | The bucket parameters. |

#### Returns

`Sendable`

An extrinsic to set the bucket parameters.

**`Example`**

```typescript
const tx = blockchain.ddcCustomers.setBucketParams(1n, { isPublic: true });

await blockchain.send(tx, { account });
```

___

### unlockDeposit

▸ **unlockDeposit**(`clusterId`, `value`): `Sendable`

Unlocks deposit funds from the account for the specified cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `value` | `bigint` | The amount to unlock. |

#### Returns

`Sendable`

An extrinsic to unlock deposit funds.

**`Example`**

```typescript
const tx = blockchain.ddcCustomers.unlockDeposit('0x...', 100n);

await blockchain.send(tx, { account });
```

___

### withdrawUnlockedDeposit

▸ **withdrawUnlockedDeposit**(`clusterId`): `Sendable`

Withdraws unlocked funds from the account for the specified cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |

#### Returns

`Sendable`

An extrinsic to withdraw unlocked funds.

**`Example`**

```typescript
const tx = blockchain.ddcCustomers.withdrawUnlockedDeposit('0x...');

await blockchain.send(tx, { account });
```
