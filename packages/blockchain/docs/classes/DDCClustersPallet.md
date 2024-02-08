[@cere-ddc-sdk/blockchain](../README.md) / DDCClustersPallet

# Class: DDCClustersPallet

This class provides methods to interact with the DDC Clusters pallet on the blockchain.

**`Example`**

```typescript
const clusters = await blockchain.ddcClusters.listClusters();

console.log(clusters);
```

## Methods

### addStorageNodeToCluster

▸ **addStorageNodeToCluster**(`clusterId`, `storageNodePublicKey`): `Sendable`

Adds a storage node to a cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `storageNodePublicKey` | `string` | The public key of the storage node. |

#### Returns

`Sendable`

An extrinsic to add the storage node to the cluster.

**`Example`**

```typescript
const clusterId = '0x...';
const storageNodePublicKey = '0x...';

const tx = blockchain.ddcClustersPallet.addStorageNodeToCluster(clusterId, storageNodePublicKey);

await blockchain.send(tx, { account });
```

___

### clusterHasStorageNode

▸ **clusterHasStorageNode**(`clusterId`, `storageNodePublicKey`): `Promise`\<`boolean`\>

Checks if a cluster has a storage node.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `storageNodePublicKey` | `string` | The public key of the storage node. |

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to a boolean indicating whether the cluster has the storage node.

**`Example`**

```typescript
const clusterId = '0x...';
const storageNodePublicKey = '0x...';
const hasStorageNode = await blockchain.ddcClustersPallet.clusterHasStorageNode(clusterId, storageNodePublicKey);

console.log(hasStorageNode);
```

___

### createCluster

▸ **createCluster**(`clusterId`, `clusterManagerId`, `clusterReserveId`, `clusterProps`, `clusterGovernmentParams`): `Sendable`

Creates a new cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `clusterManagerId` | `string` | The ID of the cluster manager. |
| `clusterReserveId` | `string` | The ID of the cluster reserve. |
| `clusterProps` | `ClusterProps` | The properties of the cluster. |
| `clusterGovernmentParams` | `ClusterGovernmentParams` | The government parameters of the cluster. |

#### Returns

`Sendable`

An extrinsic to create the cluster.

**`Example`**

```typescript
const clusterId = '0x...';
const clusterManagerId = '0x...';
const clusterReserveId = '0x...';
const clusterProps = { ... };
const clusterGovernmentParams = { ... };

const tx = blockchain.ddcClustersPallet.createCluster(
  clusterId,
  clusterManagerId,
  clusterReserveId,
  clusterProps,
  clusterGovernmentParams
);

await blockchain.send(tx, { account });
```

___

### filterNodeKeysByClusterId

▸ **filterNodeKeysByClusterId**(`clusterId`): `Promise`\<`string`[]\>

Filters node keys by cluster ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |

#### Returns

`Promise`\<`string`[]\>

A promise that resolves to an array of node keys.

**`Example`**

```typescript
const clusterId = '0x...';
const nodeKeys = await blockchain.ddcClustersPallet.filterNodeKeysByClusterId(clusterId);

console.log(nodeKeys);
```

___

### findClusterById

▸ **findClusterById**(`clusterId`): `Promise`\<`Cluster`\>

Finds a cluster by ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |

#### Returns

`Promise`\<`Cluster`\>

A promise that resolves to the cluster.

**`Example`**

```typescript
const clusterId = '0x...';
const cluster = await blockchain.ddcClustersPallet.findClusterById(clusterId);

console.log(cluster);
```

___

### getClusterGovernmentParams

▸ **getClusterGovernmentParams**(`clusterId`): `Promise`\<`undefined` \| `ClusterGovernmentParams`\>

Gets the government parameters of a cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |

#### Returns

`Promise`\<`undefined` \| `ClusterGovernmentParams`\>

A promise that resolves to the government parameters of the cluster.

**`Example`**

```typescript
const clusterId = '0x...';
const clusterGovernmentParams = await blockchain.ddcClustersPallet.getClusterGovernmentParams(clusterId);

console.log(clusterGovernmentParams);
```

___

### listClusters

▸ **listClusters**(): `Promise`\<`Cluster`[]\>

Lists all clusters.

#### Returns

`Promise`\<`Cluster`[]\>

A promise that resolves to an array of clusters.

**`Example`**

```typescript
const clusters = await blockchain.ddcClustersPallet.listClusters();

console.log(clusters);
```

___

### removeStorageNodeFromCluster

▸ **removeStorageNodeFromCluster**(`clusterId`, `storageNodePublicKey`): `Sendable`

Removes a storage node from a cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `storageNodePublicKey` | `string` | The public key of the storage node. |

#### Returns

`Sendable`

An extrinsic to remove the storage node from the cluster.

**`Example`**

```typescript
const clusterId = '0x...';
const storageNodePublicKey = '0x...';

const tx = blockchain.ddcClustersPallet.removeStorageNodeFromCluster(clusterId, storageNodePublicKey);

await blockchain.send(tx, { account });
```

___

### setClusterParams

▸ **setClusterParams**(`clusterId`, `clusterProps`): `Sendable`

Sets the properties of a cluster.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `clusterProps` | `ClusterProps` | The properties of the cluster. |

#### Returns

`Sendable`

An extrinsic to set the cluster properties.

**`Example`**

```typescript
const clusterId = '0x...';
const clusterProps = { ... };

const tx = blockchain.ddcClustersPallet.setClusterParams(clusterId, clusterProps);

await blockchain.send(tx, { account });
```
