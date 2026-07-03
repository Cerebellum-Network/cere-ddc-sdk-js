[@cere-ddc-sdk/ddc](../README.md) / NodeInterface

# Interface: NodeInterface

The `NodeInterface` interface defines the methods to interact with DDC storage nodes.

## Implemented by

- [`BalancedNode`](../classes/BalancedNode.md)
- [`StorageNode`](../classes/StorageNode.md)

## Methods

### getCnsRecord

▸ **getCnsRecord**(`bucketId`, `name`, `options?`): `Promise`\<`undefined` \| [`CnsRecordResponse`](../classes/CnsRecordResponse.md)\>

Retrieves a CNS record from a specific bucket.

#### Parameters

| Name | Type |
| :------ | :------ |
| `bucketId` | `bigint` |
| `name` | `string` |
| `options?` | `CnsRecordGetOptions` |

#### Returns

`Promise`\<`undefined` \| [`CnsRecordResponse`](../classes/CnsRecordResponse.md)\>

A promise that resolves to the retrieved CNS record.

___

### getDagNode

▸ **getDagNode**(`bucketId`, `cidOrName`, `options?`): `Promise`\<`undefined` \| [`DagNodeResponse`](../classes/DagNodeResponse.md)\>

Retrieves a DAG node from a specific bucket.

#### Parameters

| Name | Type |
| :------ | :------ |
| `bucketId` | `bigint` |
| `cidOrName` | `string` |
| `options?` | `DagNodeGetOptions` |

#### Returns

`Promise`\<`undefined` \| [`DagNodeResponse`](../classes/DagNodeResponse.md)\>

A promise that resolves to a DagNodeResponse instance.

___

### readPiece

▸ **readPiece**(`bucketId`, `cidOrName`, `options?`): `Promise`\<[`PieceResponse`](../classes/PieceResponse.md)\>

Reads a piece from a specific bucket.

#### Parameters

| Name | Type |
| :------ | :------ |
| `bucketId` | `bigint` |
| `cidOrName` | `string` |
| `options?` | `PieceReadOptions` |

#### Returns

`Promise`\<[`PieceResponse`](../classes/PieceResponse.md)\>

A promise that resolves to a PieceResponse instance.

___

### resolveName

▸ **resolveName**(`bucketId`, `cidOrName`, `options?`): `Promise`\<`Cid`\>

Resolves a name to a CID in the CNS.

#### Parameters

| Name | Type |
| :------ | :------ |
| `bucketId` | `bigint` |
| `cidOrName` | `string` |
| `options?` | `CnsRecordGetOptions` |

#### Returns

`Promise`\<`Cid`\>

A promise that resolves to the CID corresponding to the CNS name.

___

### storeCnsRecord

▸ **storeCnsRecord**(`bucketId`, `record`, `options?`): `Promise`\<`Record`\>

Stores a CNS record in a specific bucket.

#### Parameters

| Name | Type |
| :------ | :------ |
| `bucketId` | `bigint` |
| `record` | [`CnsRecord`](../classes/CnsRecord.md) |
| `options?` | `OperationAuthOptions` |

#### Returns

`Promise`\<`Record`\>

A promise that resolves to the stored CNS record.

___

### storeDagNode

▸ **storeDagNode**(`bucketId`, `node`, `options?`): `Promise`\<`string`\>

Stores a DAG node in a specific bucket.

#### Parameters

| Name | Type |
| :------ | :------ |
| `bucketId` | `bigint` |
| `node` | [`DagNode`](../classes/DagNode.md) |
| `options?` | `DagNodeStoreOptions` |

#### Returns

`Promise`\<`string`\>

A promise that resolves to the CID of the stored DAG node.

___

### storePiece

▸ **storePiece**(`bucketId`, `piece`, `options?`): `Promise`\<`string`\>

Stores a piece in a specific bucket.

#### Parameters

| Name | Type |
| :------ | :------ |
| `bucketId` | `bigint` |
| `piece` | [`Piece`](../classes/Piece.md) \| [`MultipartPiece`](../classes/MultipartPiece.md) |
| `options?` | `PieceStoreOptions` |

#### Returns

`Promise`\<`string`\>

A promise that resolves to the CID of the stored piece.

## Properties

### nodeId

• `Readonly` **nodeId**: `string`

The identifier of the node.
