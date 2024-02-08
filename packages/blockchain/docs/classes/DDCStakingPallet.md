[@cere-ddc-sdk/blockchain](../README.md) / DDCStakingPallet

# Class: DDCStakingPallet

This class provides methods to interact with the DDC Staking pallet on the blockchain.

**`Example`**

```typescript
const storageNodePublicKey = '0x...';
const stashAccountId = await blockchain.ddcStaking.findStashAccountIdByStorageNodePublicKey(storageNodePublicKey);

console.log(stashAccountId);
```

## Methods

### bondStorageNode

▸ **bondStorageNode**(`controller`, `storageNodePublicKey`, `bondAmount`): `Sendable`

Binds the storage node.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `controller` | `string` | The account that will control the storage node. |
| `storageNodePublicKey` | `string` | The public key of the storage node. |
| `bondAmount` | `bigint` | The amount to bond. |

#### Returns

`Sendable`

An extrinsic to bind the storage node.

**`Example`**

```typescript
const controller = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const storageNodePublicKey = '0x...';
const bondAmount = 100n;
const tx = blockchain.ddcStaking.bondStorageNode(controller, storageNodePublicKey, bondAmount);

await blockchain.send(tx, { account });
```

___

### chill

▸ **chill**(): `Sendable`

Chills the controller.

#### Returns

`Sendable`

An extrinsic to chill the controller.

**`Example`**

```typescript
const tx = blockchain.ddcStaking.chill();

await blockchain.send(tx, { account });
```

___

### fastChillStorage

▸ **fastChillStorage**(): `Sendable`

Initiates a fast chill of storage.

#### Returns

`Sendable`

An extrinsic to initiate a fast chill of storage.

Example usage:
```typescript
const tx = blockchain.ddcStaking.fastChillStorage();

await blockchain.send(tx, { account });
```

___

### findControllerAccountByStashAccountId

▸ **findControllerAccountByStashAccountId**(`stashAccountId`): `Promise`\<`undefined` \| `string`\>

Finds the controller account associated with a given stash account ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `stashAccountId` | `string` | The account ID of the stash. |

#### Returns

`Promise`\<`undefined` \| `string`\>

A promise that resolves to the controller account ID, or undefined if no controller account is found.

**`Example`**

```typescript
const stashAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const controllerAccountId = await blockchain.ddcStaking.findControllerAccountByStashAccountId(stashAccountId);

console.log(controllerAccountId);
```

___

### findNodePublicKeyByStashAccountId

▸ **findNodePublicKeyByStashAccountId**(`stashAccountId`): `Promise`\<`undefined` \| \{ `storagePubKey`: `string`  }\>

Finds the node public key associated with a given stash account ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `stashAccountId` | `string` | The account ID of the stash. |

#### Returns

`Promise`\<`undefined` \| \{ `storagePubKey`: `string`  }\>

A promise that resolves to the node public key, or undefined if no node public key is found.

**`Example`**

```typescript
const stashAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const nodePublicKey = await blockchain.ddcStaking.findNodePublicKeyByStashAccountId(stashAccountId);

console.log(nodePublicKey);
```

___

### findStakedClusterIdByCdnNodeStashAccountId

▸ **findStakedClusterIdByCdnNodeStashAccountId**(`stashAccountId`): `Promise`\<`undefined` \| \`0x$\{string}\`\>

Finds the cluster ID associated with a given CDN node stash account ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `stashAccountId` | `string` | The stash account ID of the CDN node. |

#### Returns

`Promise`\<`undefined` \| \`0x$\{string}\`\>

A promise that resolves to the cluster ID, or undefined if no cluster is found.

**`Example`**

```typescript
const stashAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const clusterId = await blockchain.ddcStaking.findStakedClusterIdByCdnNodeStashAccountId(stashAccountId);

console.log(clusterId);
```

___

### findStakedClusterIdByStorageNodeStashAccountId

▸ **findStakedClusterIdByStorageNodeStashAccountId**(`stashAccountId`): `Promise`\<`undefined` \| \`0x$\{string}\`\>

Finds the cluster ID associated with a given storage node stash account ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `stashAccountId` | `string` | The stash account ID of the storage node. |

#### Returns

`Promise`\<`undefined` \| \`0x$\{string}\`\>

A promise that resolves to the cluster ID, or undefined if no cluster is found.

**`Example`**

```typescript
const stashAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const clusterId = await blockchain.ddcStaking.findStakedClusterIdByStorageNodeStashAccountId(stashAccountId);

console.log(clusterId);
```

___

### findStakingLedgerByControllerAccountId

▸ **findStakingLedgerByControllerAccountId**(`controllerAccountId`): `Promise`\<`undefined` \| `StakingLedger`\>

Finds the staking ledger associated with a given controller account ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `controllerAccountId` | `string` | The account ID of the controller. |

#### Returns

`Promise`\<`undefined` \| `StakingLedger`\>

A promise that resolves to the staking ledger, or undefined if no staking ledger is found.

**`Example`**

```typescript
const controllerAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const stakingLedger = await blockchain.ddcStaking.findStakingLedgerByControllerAccountId(controllerAccountId);

console.log(stakingLedger);
```

___

### findStashAccountIdByStorageNodePublicKey

▸ **findStashAccountIdByStorageNodePublicKey**(`storageNodePublicKey`): `Promise`\<`undefined` \| `string`\>

Finds the stash account ID associated with a given storage node public key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storageNodePublicKey` | `string` | The public key of the storage node. |

#### Returns

`Promise`\<`undefined` \| `string`\>

A promise that resolves to the stash account ID, or undefined if no stash account is found.

**`Example`**

```typescript
const storageNodePublicKey = '0x...';
const stashAccountId = await blockchain.ddcStaking.findStashAccountIdByStorageNodePublicKey(storageNodePublicKey);

console.log(stashAccountId);
```

___

### listStakedCdnNodesStashAccountsAndClusterIds

▸ **listStakedCdnNodesStashAccountsAndClusterIds**(): `Promise`\<\{ `clusterId`: \`0x$\{string}\` ; `stashAccountId`: `string`  }[]\>

Returns the list of staked CDN nodes, their stash accounts, and their cluster IDs.

#### Returns

`Promise`\<\{ `clusterId`: \`0x$\{string}\` ; `stashAccountId`: `string`  }[]\>

A promise that resolves to the list of staked CDN nodes, their stash accounts, and their cluster IDs.

**`Example`**

```typescript
const stakedCdnNodes = await blockchain.ddcStaking.listStakedCdnNodesStashAccountsAndClusterIds();

console.log(stakedCdnNodes);
```

___

### listStakedStorageNodesStashAccountsAndClusterIds

▸ **listStakedStorageNodesStashAccountsAndClusterIds**(): `Promise`\<\{ `clusterId`: \`0x$\{string}\` ; `stashAccountId`: `string`  }[]\>

Returns the list of staked storage nodes, their stash accounts, and their cluster IDs.

#### Returns

`Promise`\<\{ `clusterId`: \`0x$\{string}\` ; `stashAccountId`: `string`  }[]\>

A promise that resolves to the list of staked storage nodes, their stash accounts, and their cluster IDs.

**`Example`**

```typescript
const stakedStorageNodes = await blockchain.ddcStaking.listStakedStorageNodesStashAccountsAndClusterIds();

console.log(stakedStorageNodes);
```

___

### serve

▸ **serve**(`clusterId`): `Sendable`

Serves the cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |

#### Returns

`Sendable`

An extrinsic to serve the cluster.

**`Example`**

```typescript
const clusterId = '0x...';
const tx = blockchain.ddcStaking.serve(clusterId);

await blockchain.send(tx, { account });
```

___

### setController

▸ **setController**(`accountId`): `Sendable`

Sets the controller account for the stash account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accountId` | `string` | The account ID of the new controller. |

#### Returns

`Sendable`

An extrinsic to set the controller account.

**`Example`**

```typescript
const newControllerAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const tx = blockchain.ddcStaking.setController(newControllerAccountId);

await blockchain.send(tx, { account });
```

___

### setStorageNode

▸ **setStorageNode**(`storageNodePublicKey`): `Sendable`

Sets the storage node for the stash account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storageNodePublicKey` | `string` | The public key of the storage node. |

#### Returns

`Sendable`

An extrinsic to set the storage node.

**`Example`**

```typescript
const storageNodePublicKey = '0x...';
const tx = blockchain.ddcStaking.setStorageNode(storageNodePublicKey);

await blockchain.send(tx, { account });
```

___

### store

▸ **store**(`clusterId`): `Sendable`

Stores the cluster ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |

#### Returns

`Sendable`

An extrinsic to store the cluster ID.

**`Example`**

```typescript
const clusterId = '0x...';
const tx = blockchain.ddcStaking.store(clusterId);

await blockchain.send(tx, { account });
```

___

### unbond

▸ **unbond**(`amount`): `Sendable`

Unbonds the amount.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `amount` | `bigint` | The amount to unbond. |

#### Returns

`Sendable`

An extrinsic to unbond the amount.

**`Example`**

```typescript
const amount = 100n;
const tx = blockchain.ddcStaking.unbond(amount);

await blockchain.send(tx, { account });
```

___

### withdrawUnbonded

▸ **withdrawUnbonded**(): `Sendable`

Withdraws unbonded funds.

#### Returns

`Sendable`

An extrinsic to withdraw unbonded funds.

**`Example`**

```typescript
const tx = blockchain.ddcStaking.withdrawUnbonded();

await blockchain.send(tx, { account });
```
