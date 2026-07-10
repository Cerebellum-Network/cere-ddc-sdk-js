[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / DDCStakingPallet

# Class: DDCStakingPallet

This class provides methods to interact with the DDC Staking pallet on the blockchain.

## Example

```typescript
const storageNodePublicKey = '0x...';
const stashAccountId = await blockchain.ddcStaking.findStashAccountIdByStorageNodePublicKey(storageNodePublicKey);

console.log(stashAccountId);
```

## Methods

### bondCluster()

> **bondCluster**(`clusterId`): `Sendable`

Bonds the cluster.

#### Parameters

##### clusterId

`` `0x${string}` ``

The cluster ID to bond

#### Returns

`Sendable`

An extrinsic to bond the cluster.

#### Example

```typescript
const clusterId = '0x...';
const tx = blockchain.ddcStaking.bondCluster(clusterId);

await blockchain.send(tx, { account });
```

***

### bondStorageNode()

> **bondStorageNode**(`controller`, `storageNodePublicKey`, `bondAmount`): `Sendable`

Binds the storage node.

#### Parameters

##### controller

`string`

The account that will control the storage node.

##### storageNodePublicKey

`string`

The public key of the storage node.

##### bondAmount

`bigint`

The amount to bond.

#### Returns

`Sendable`

An extrinsic to bind the storage node.

#### Example

```typescript
const controller = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const storageNodePublicKey = '0x...';
const bondAmount = 100n;
const tx = blockchain.ddcStaking.bondStorageNode(controller, storageNodePublicKey, bondAmount);

await blockchain.send(tx, { account });
```

***

### chill()

> **chill**(): `Sendable`

Chills the controller.

#### Returns

`Sendable`

An extrinsic to chill the controller.

#### Example

```typescript
const tx = blockchain.ddcStaking.chill();

await blockchain.send(tx, { account });
```

***

### fastChillStorage()

> **fastChillStorage**(): `Sendable`

Initiates a fast chill of storage.

#### Returns

`Sendable`

An extrinsic to initiate a fast chill of storage.

Example usage:
```typescript
const tx = blockchain.ddcStaking.fastChillStorage();

await blockchain.send(tx, { account });
```

***

### findControllerAccountByStashAccountId()

> **findControllerAccountByStashAccountId**(`stashAccountId`): `Promise`\<`string` \| `undefined`\>

Finds the controller account associated with a given stash account ID.

#### Parameters

##### stashAccountId

`string`

The account ID of the stash.

#### Returns

`Promise`\<`string` \| `undefined`\>

A promise that resolves to the controller account ID, or undefined if no controller account is found.

#### Example

```typescript
const stashAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const controllerAccountId = await blockchain.ddcStaking.findControllerAccountByStashAccountId(stashAccountId);

console.log(controllerAccountId);
```

***

### findNodePublicKeyByStashAccountId()

> **findNodePublicKeyByStashAccountId**(`stashAccountId`): `Promise`\<\{ `storagePubKey`: `string`; \} \| `undefined`\>

Finds the node public key associated with a given stash account ID.

#### Parameters

##### stashAccountId

`string`

The account ID of the stash.

#### Returns

`Promise`\<\{ `storagePubKey`: `string`; \} \| `undefined`\>

A promise that resolves to the node public key, or undefined if no node public key is found.

#### Example

```typescript
const stashAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const nodePublicKey = await blockchain.ddcStaking.findNodePublicKeyByStashAccountId(stashAccountId);

console.log(nodePublicKey);
```

***

### findStakedClusterIdByCdnNodeStashAccountId()

> **findStakedClusterIdByCdnNodeStashAccountId**(`stashAccountId`): `Promise`\<`` `0x${string}` `` \| `undefined`\>

Finds the cluster ID associated with a given CDN node stash account ID.

#### Parameters

##### stashAccountId

`string`

The stash account ID of the CDN node.

#### Returns

`Promise`\<`` `0x${string}` `` \| `undefined`\>

A promise that resolves to the cluster ID, or undefined if no cluster is found.

#### Example

```typescript
const stashAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const clusterId = await blockchain.ddcStaking.findStakedClusterIdByCdnNodeStashAccountId(stashAccountId);

console.log(clusterId);
```

***

### findStakedClusterIdByStorageNodeStashAccountId()

> **findStakedClusterIdByStorageNodeStashAccountId**(`stashAccountId`): `Promise`\<`` `0x${string}` `` \| `undefined`\>

Finds the cluster ID associated with a given storage node stash account ID.

#### Parameters

##### stashAccountId

`string`

The stash account ID of the storage node.

#### Returns

`Promise`\<`` `0x${string}` `` \| `undefined`\>

A promise that resolves to the cluster ID, or undefined if no cluster is found.

#### Example

```typescript
const stashAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const clusterId = await blockchain.ddcStaking.findStakedClusterIdByStorageNodeStashAccountId(stashAccountId);

console.log(clusterId);
```

***

### findStakingLedgerByControllerAccountId()

> **findStakingLedgerByControllerAccountId**(`controllerAccountId`): `Promise`\<`StakingLedger` \| `undefined`\>

Finds the staking ledger associated with a given controller account ID.

#### Parameters

##### controllerAccountId

`string`

The account ID of the controller.

#### Returns

`Promise`\<`StakingLedger` \| `undefined`\>

A promise that resolves to the staking ledger, or undefined if no staking ledger is found.

#### Example

```typescript
const controllerAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const stakingLedger = await blockchain.ddcStaking.findStakingLedgerByControllerAccountId(controllerAccountId);

console.log(stakingLedger);
```

***

### findStashAccountIdByStorageNodePublicKey()

> **findStashAccountIdByStorageNodePublicKey**(`storageNodePublicKey`): `Promise`\<`string` \| `undefined`\>

Finds the stash account ID associated with a given storage node public key.

#### Parameters

##### storageNodePublicKey

`string`

The public key of the storage node.

#### Returns

`Promise`\<`string` \| `undefined`\>

A promise that resolves to the stash account ID, or undefined if no stash account is found.

#### Example

```typescript
const storageNodePublicKey = '0x...';
const stashAccountId = await blockchain.ddcStaking.findStashAccountIdByStorageNodePublicKey(storageNodePublicKey);

console.log(stashAccountId);
```

***

### listStakedCdnNodesStashAccountsAndClusterIds()

> **listStakedCdnNodesStashAccountsAndClusterIds**(): `Promise`\<`object`[]\>

Returns the list of staked CDN nodes, their stash accounts, and their cluster IDs.

#### Returns

`Promise`\<`object`[]\>

A promise that resolves to the list of staked CDN nodes, their stash accounts, and their cluster IDs.

#### Example

```typescript
const stakedCdnNodes = await blockchain.ddcStaking.listStakedCdnNodesStashAccountsAndClusterIds();

console.log(stakedCdnNodes);
```

***

### listStakedStorageNodesStashAccountsAndClusterIds()

> **listStakedStorageNodesStashAccountsAndClusterIds**(): `Promise`\<`object`[]\>

Returns the list of staked storage nodes, their stash accounts, and their cluster IDs.

#### Returns

`Promise`\<`object`[]\>

A promise that resolves to the list of staked storage nodes, their stash accounts, and their cluster IDs.

#### Example

```typescript
const stakedStorageNodes = await blockchain.ddcStaking.listStakedStorageNodesStashAccountsAndClusterIds();

console.log(stakedStorageNodes);
```

***

### setController()

> **setController**(`accountId`): `Sendable`

Sets the controller account for the stash account.

#### Parameters

##### accountId

`string`

The account ID of the new controller.

#### Returns

`Sendable`

An extrinsic to set the controller account.

#### Example

```typescript
const newControllerAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const tx = blockchain.ddcStaking.setController(newControllerAccountId);

await blockchain.send(tx, { account });
```

***

### setStorageNode()

> **setStorageNode**(`storageNodePublicKey`): `Sendable`

Sets the storage node for the stash account.

#### Parameters

##### storageNodePublicKey

`string`

The public key of the storage node.

#### Returns

`Sendable`

An extrinsic to set the storage node.

#### Example

```typescript
const storageNodePublicKey = '0x...';
const tx = blockchain.ddcStaking.setStorageNode(storageNodePublicKey);

await blockchain.send(tx, { account });
```

***

### store()

> **store**(`clusterId`): `Sendable`

Stores the cluster ID.

#### Parameters

##### clusterId

`` `0x${string}` ``

The ID of the cluster.

#### Returns

`Sendable`

An extrinsic to store the cluster ID.

#### Example

```typescript
const clusterId = '0x...';
const tx = blockchain.ddcStaking.store(clusterId);

await blockchain.send(tx, { account });
```

***

### unbond()

> **unbond**(`amount`): `Sendable`

Unbonds the amount.

#### Parameters

##### amount

`bigint`

The amount to unbond.

#### Returns

`Sendable`

An extrinsic to unbond the amount.

#### Example

```typescript
const amount = 100n;
const tx = blockchain.ddcStaking.unbond(amount);

await blockchain.send(tx, { account });
```

***

### unbondCluster()

> **unbondCluster**(`clusterId`): `Sendable`

Unbonds the cluster.

#### Parameters

##### clusterId

`` `0x${string}` ``

The cluster ID to bond

#### Returns

`Sendable`

An extrinsic to unbond the cluster.

#### Example

```typescript
const clusterId = '0x...';
const tx = blockchain.ddcStaking.unbondCluster(clusterId);

await blockchain.send(tx, { account });
```

***

### withdrawUnbonded()

> **withdrawUnbonded**(): `Sendable`

Withdraws unbonded funds.

#### Returns

`Sendable`

An extrinsic to withdraw unbonded funds.

#### Example

```typescript
const tx = blockchain.ddcStaking.withdrawUnbonded();

await blockchain.send(tx, { account });
```

***

### withdrawUnbondedCluster()

> **withdrawUnbondedCluster**(`clusterId`): `Sendable`

Withdraws unbonded cluster funds.

#### Parameters

##### clusterId

`` `0x${string}` ``

The cluster ID to withdraw

#### Returns

`Sendable`

An extrinsic to withdraw the cluster funds.

#### Example

```typescript
const clusterId = '0x...';
const tx = blockchain.ddcStaking.withdrawUnbondedCluster(clusterId);

await blockchain.send(tx, { account });
```
