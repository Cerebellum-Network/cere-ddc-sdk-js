[**@cere-ddc-sdk/ddc**](../README.md)

***

[@cere-ddc-sdk/ddc](../README.md) / NodeInterface

# Interface: NodeInterface

The `NodeInterface` interface defines the methods to interact with DDC storage nodes.

## Methods

### getCnsRecord()

> **getCnsRecord**(`bucketId`, `name`, `options?`): `Promise`\<[`CnsRecordResponse`](../classes/CnsRecordResponse.md) \| `undefined`\>

Retrieves a CNS record from a specific bucket.

#### Parameters

##### bucketId

`bigint`

##### name

`string`

##### options?

`CnsRecordGetOptions`

#### Returns

`Promise`\<[`CnsRecordResponse`](../classes/CnsRecordResponse.md) \| `undefined`\>

A promise that resolves to the retrieved CNS record.

***

### getDagNode()

> **getDagNode**(`bucketId`, `cidOrName`, `options?`): `Promise`\<[`DagNodeResponse`](../classes/DagNodeResponse.md) \| `undefined`\>

Retrieves a DAG node from a specific bucket.

#### Parameters

##### bucketId

`bigint`

##### cidOrName

`string`

##### options?

`DagNodeGetOptions`

#### Returns

`Promise`\<[`DagNodeResponse`](../classes/DagNodeResponse.md) \| `undefined`\>

A promise that resolves to a DagNodeResponse instance.

***

### readPiece()

> **readPiece**(`bucketId`, `cidOrName`, `options?`): `Promise`\<[`PieceResponse`](../classes/PieceResponse.md)\>

Reads a piece from a specific bucket.

#### Parameters

##### bucketId

`bigint`

##### cidOrName

`string`

##### options?

`PieceReadOptions`

#### Returns

`Promise`\<[`PieceResponse`](../classes/PieceResponse.md)\>

A promise that resolves to a PieceResponse instance.

***

### resolveName()

> **resolveName**(`bucketId`, `cidOrName`, `options?`): `Promise`\<`Cid`\>

Resolves a name to a CID in the CNS.

#### Parameters

##### bucketId

`bigint`

##### cidOrName

`string`

##### options?

`CnsRecordGetOptions`

#### Returns

`Promise`\<`Cid`\>

A promise that resolves to the CID corresponding to the CNS name.

***

### storeCnsRecord()

> **storeCnsRecord**(`bucketId`, `record`, `options?`): `Promise`\<`Record`\>

Stores a CNS record in a specific bucket.

#### Parameters

##### bucketId

`bigint`

##### record

[`CnsRecord`](../classes/CnsRecord.md)

##### options?

`CnsRecordStoreOptions`

#### Returns

`Promise`\<`Record`\>

A promise that resolves to the stored CNS record.

***

### storeDagNode()

> **storeDagNode**(`bucketId`, `node`, `options?`): `Promise`\<`string`\>

Stores a DAG node in a specific bucket.

#### Parameters

##### bucketId

`bigint`

##### node

[`DagNode`](../classes/DagNode.md)

##### options?

`DagNodeStoreOptions`

#### Returns

`Promise`\<`string`\>

A promise that resolves to the CID of the stored DAG node.

***

### storePiece()

> **storePiece**(`bucketId`, `piece`, `options?`): `Promise`\<`string`\>

Stores a piece in a specific bucket.

#### Parameters

##### bucketId

`bigint`

##### piece

[`Piece`](../classes/Piece.md) \| [`MultipartPiece`](../classes/MultipartPiece.md)

##### options?

`PieceStoreOptions`

#### Returns

`Promise`\<`string`\>

A promise that resolves to the CID of the stored piece.

## Properties

### displayName

> `readonly` **displayName**: `string`

The display name of the node.

***

### nodeId

> `readonly` **nodeId**: `string`

The identifier of the node.
