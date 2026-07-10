[**@cere-ddc-sdk/ddc**](../README.md)

***

[@cere-ddc-sdk/ddc](../README.md) / BalancedNode

# Class: BalancedNode

The `BalancedNode` class implements the `NodeInterface` and provides methods for interacting with storage nodes.

A balanced node is a node that distributes operations across multiple underlying nodes to balance the load.

## Example

```typescript
const router = new Router(...);
const balancedNode = new BalancedNode({ router });
```

## Implements

- [`NodeInterface`](../interfaces/NodeInterface.md)

## Methods

### getCnsRecord()

> **getCnsRecord**(`bucketId`, `name`, `getOptions?`): `Promise`\<[`CnsRecordResponse`](CnsRecordResponse.md) \| `undefined`\>

Retrieves a CNS record from a specific bucket.

#### Parameters

##### bucketId

`bigint`

##### name

`string`

##### getOptions?

`CnsRecordGetOptions` = `{}`

#### Returns

`Promise`\<[`CnsRecordResponse`](CnsRecordResponse.md) \| `undefined`\>

A promise that resolves to the retrieved CNS record.

#### Implementation of

[`NodeInterface`](../interfaces/NodeInterface.md).[`getCnsRecord`](../interfaces/NodeInterface.md#getcnsrecord)

***

### getDagNode()

> **getDagNode**(`bucketId`, `cidOrName`, `getOptions?`): `Promise`\<[`DagNodeResponse`](DagNodeResponse.md) \| `undefined`\>

Retrieves a DAG node from a specific bucket.

#### Parameters

##### bucketId

`bigint`

##### cidOrName

`string`

##### getOptions?

`DagNodeGetOptions` = `{}`

#### Returns

`Promise`\<[`DagNodeResponse`](DagNodeResponse.md) \| `undefined`\>

A promise that resolves to a DagNodeResponse instance.

#### Implementation of

[`NodeInterface`](../interfaces/NodeInterface.md).[`getDagNode`](../interfaces/NodeInterface.md#getdagnode)

***

### readPiece()

> **readPiece**(`bucketId`, `cidOrName`, `readOptions?`): `Promise`\<[`PieceResponse`](PieceResponse.md)\>

Reads a piece from a specific bucket.

#### Parameters

##### bucketId

`bigint`

##### cidOrName

`string`

##### readOptions?

`PieceReadOptions` = `{}`

#### Returns

`Promise`\<[`PieceResponse`](PieceResponse.md)\>

A promise that resolves to a PieceResponse instance.

#### Implementation of

[`NodeInterface`](../interfaces/NodeInterface.md).[`readPiece`](../interfaces/NodeInterface.md#readpiece)

***

### resolveName()

> **resolveName**(`bucketId`, `cidOrName`, `resolveOptions?`): `Promise`\<`Cid`\>

Resolves a name to a CID in the CNS.

#### Parameters

##### bucketId

`bigint`

##### cidOrName

`string`

##### resolveOptions?

`CnsRecordGetOptions` = `{}`

#### Returns

`Promise`\<`Cid`\>

A promise that resolves to the CID corresponding to the CNS name.

#### Implementation of

[`NodeInterface`](../interfaces/NodeInterface.md).[`resolveName`](../interfaces/NodeInterface.md#resolvename)

***

### storeCnsRecord()

> **storeCnsRecord**(`bucketId`, `record`, `storeOptions?`): `Promise`\<`Record`\>

Stores a CNS record in a specific bucket.

#### Parameters

##### bucketId

`bigint`

##### record

[`CnsRecord`](CnsRecord.md)

##### storeOptions?

`DagNodeStoreOptions` = `{}`

#### Returns

`Promise`\<`Record`\>

A promise that resolves to the stored CNS record.

#### Implementation of

[`NodeInterface`](../interfaces/NodeInterface.md).[`storeCnsRecord`](../interfaces/NodeInterface.md#storecnsrecord)

***

### storeDagNode()

> **storeDagNode**(`bucketId`, `dagNode`, `storeOptions?`): `Promise`\<`string`\>

Stores a DAG node in a specific bucket.

#### Parameters

##### bucketId

`bigint`

##### dagNode

[`DagNode`](DagNode.md)

##### storeOptions?

`DagNodeStoreOptions` = `{}`

#### Returns

`Promise`\<`string`\>

A promise that resolves to the CID of the stored DAG node.

#### Implementation of

[`NodeInterface`](../interfaces/NodeInterface.md).[`storeDagNode`](../interfaces/NodeInterface.md#storedagnode)

***

### storePiece()

> **storePiece**(`bucketId`, `piece`, `storeOptions?`): `Promise`\<`string`\>

Stores a piece in a specific bucket.

#### Parameters

##### bucketId

`bigint`

##### piece

[`Piece`](Piece.md) \| [`MultipartPiece`](MultipartPiece.md)

##### storeOptions?

`PieceStoreOptions` = `{}`

#### Returns

`Promise`\<`string`\>

A promise that resolves to the CID of the stored piece.

#### Implementation of

[`NodeInterface`](../interfaces/NodeInterface.md).[`storePiece`](../interfaces/NodeInterface.md#storepiece)

## Properties

### displayName

> `readonly` **displayName**: `"BalancedNode"` = `'BalancedNode'`

The display name of the node.

#### Implementation of

[`NodeInterface`](../interfaces/NodeInterface.md).[`displayName`](../interfaces/NodeInterface.md#displayname)

***

### nodeId

> `readonly` **nodeId**: `"BalancedNode"` = `'BalancedNode'`

The identifier of the node.

#### Implementation of

[`NodeInterface`](../interfaces/NodeInterface.md).[`nodeId`](../interfaces/NodeInterface.md#nodeid)
