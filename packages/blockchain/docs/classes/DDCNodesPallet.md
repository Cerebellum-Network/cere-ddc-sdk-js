[@cere-ddc-sdk/blockchain](../README.md) / DDCNodesPallet

# Class: DDCNodesPallet

This class provides methods to interact with the DDC Nodes pallet on the blockchain.

**`Example`**

```typescript
const storageNodePublicKey = '0x...';
const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNodePublicKey);

console.log(storageNode);
```

## Methods

### createStorageNode

▸ **createStorageNode**(`storageNodePublicKey`, `storageNodeProps`): `Sendable`

Creates a new storage node.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storageNodePublicKey` | `string` | The public key of the storage node. |
| `storageNodeProps` | `StorageNodeProps` | The properties of the storage node. |

#### Returns

`Sendable`

An extrinsic to create the storage node.

**`Example`**

```typescript
const storageNodePublicKey = '0x...';
const storageNodeProps = { ... };
const tx = blockchain.ddcNodes.createStorageNode(storageNodePublicKey, storageNodeProps);

await blockchain.send(tx, { account });
```

___

### deleteStorageNode

▸ **deleteStorageNode**(`storageNodePublicKey`): `Sendable`

Deletes a storage node.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storageNodePublicKey` | `string` | The public key of the storage node. |

#### Returns

`Sendable`

An extrinsic to delete the storage node.

**`Example`**

```typescript
const storageNodePublicKey = '0x...';
const tx = blockchain.ddcNodes.deleteStorageNode(storageNodePublicKey);

await blockchain.send(tx, { account });
```

___

### findStorageNodeByPublicKey

▸ **findStorageNodeByPublicKey**(`storageNodePublicKey`): `Promise`\<`undefined` \| `StorageNode`\>

Finds a storage node by public key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storageNodePublicKey` | `string` | The public key of the storage node. |

#### Returns

`Promise`\<`undefined` \| `StorageNode`\>

A promise that resolves to the storage node.

**`Example`**

```typescript
const storageNodePublicKey = '0x...';
const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNodePublicKey);

console.log(storageNode);
```

___

### listStorageNodes

▸ **listStorageNodes**(): `Promise`\<`StorageNode`[]\>

Returns a list of storage nodes.

#### Returns

`Promise`\<`StorageNode`[]\>

A promise that resolves to a list of storage nodes.

**`Example`**

```typescript
const storageNodes = await blockchain.ddcNodes.listStorageNodes();

console.log(storageNodes);
```

___

### setStorageNodeProps

▸ **setStorageNodeProps**(`storageNodePublicKey`, `storageNodeProps`): `Sendable`

Sets the properties of a storage node.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storageNodePublicKey` | `string` | The public key of the storage node. |
| `storageNodeProps` | `StorageNodeProps` | The properties of the storage node. |

#### Returns

`Sendable`

An extrinsic to set the storage node properties.

**`Example`**

```typescript
const storageNodePublicKey = '0x...';
const storageNodeProps = { ... };
const tx = blockchain.ddcNodes.setStorageNodeProps(storageNodePublicKey, storageNodeProps);

await blockchain.send(tx, { account });
```
