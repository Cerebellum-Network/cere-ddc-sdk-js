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

▸ **deposit**(`value`): `Sendable`

Deposits funds to the account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `bigint` | The amount to deposit. |

#### Returns

`Sendable`

An extrinsic to deposit funds.

**`Example`**

```typescript
const tx = blockchain.ddcCustomers.deposit(100n);

await blockchain.send(tx, { account });
```

___

### depositExtra

▸ **depositExtra**(`maxAdditional`): `Sendable`

Deposits additional funds to the account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `maxAdditional` | `bigint` | The maximum amount to deposit. |

#### Returns

`Sendable`

An extrinsic to deposit additional funds.

**`Example`**

```typescript
const tx = blockchain.ddcCustomers.depositExtra(100n);

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

▸ **getStackingInfo**(`accountId`): `Promise`\<`undefined` \| `StakingInfo`\>

Returns the staking info for the given account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accountId` | `string` | The ID of the account. |

#### Returns

`Promise`\<`undefined` \| `StakingInfo`\>

A promise that resolves to the staking info.

**`Example`**

```typescript
const stakingInfo = await blockchain.ddcCustomers.getStackingInfo('5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu');

console.log(stakingInfo);
```

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

▸ **unlockDeposit**(`value`): `Sendable`

Withdraws funds from the account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `bigint` | The amount to withdraw. |

#### Returns

`Sendable`

An extrinsic to withdraw funds.

**`Example`**

```typescript
const tx = blockchain.ddcCustomers.withdraw(100n);

await blockchain.send(tx, { account });
```

___

### withdrawUnlockedDeposit

▸ **withdrawUnlockedDeposit**(): `Sendable`

Withdraws unlocked funds from the account.

#### Returns

`Sendable`

An extrinsic to withdraw unlocked funds.

**`Example`**

```typescript
const tx = blockchain.ddcCustomers.withdrawUnlockedDeposit();

await blockchain.send(tx, { account });
```
