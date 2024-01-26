[@cere-ddc-sdk/ddc](../README.md) / StorageNode

# Class: StorageNode

The `StorageNode` class provides methods for communicating with a DDC storage node.

**`Example`**

```typescript
const signer = new UriSigner('hybrid label reunion ...');

const storageNode = new StorageNode(signer, {
  mode: StorageNodeMode.Storage,
});
```

## Implements

- [`NodeInterface`](../interfaces/NodeInterface.md)

## Methods

### getCnsRecord

▸ **getCnsRecord**(`bucketId`, `name`, `options?`): `Promise`\<`undefined` \| [`CnsRecordResponse`](CnsRecordResponse.md)\>

Retrieves a Content Name System (CNS) record from a specific bucket.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucketId` | `bigint` | The ID of the bucket to retrieve the CNS record from. |
| `name` | `string` | The name of the CNS record to retrieve. |
| `options?` | `CnsRecordGetOptions` | Optional parameters for retrieving the CNS record. |

#### Returns

`Promise`\<`undefined` \| [`CnsRecordResponse`](CnsRecordResponse.md)\>

A promise that resolves to CnsRecordResponse штыефтсу.

**`Example`**

```typescript
const bucketId = 1n;
const name = 'record-name';
const cnsRecord = await storageNode.getCnsRecord(bucketId, name);

console.log(cnsRecord);
```

#### Implementation of

[NodeInterface](../interfaces/NodeInterface.md).[getCnsRecord](../interfaces/NodeInterface.md#getcnsrecord)

___

### getDagNode

▸ **getDagNode**(`bucketId`, `cidOrName`, `options?`): `Promise`\<`undefined` \| [`DagNodeResponse`](DagNodeResponse.md)\>

Retrieves a DAG node from a specific bucket.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucketId` | `bigint` | The ID of the bucket to retrieve the DAG node from. |
| `cidOrName` | `string` | The CID or CNS name of the DAG node to retrieve. |
| `options?` | `DagNodeGetOptions` | Optional parameters for retrieving the DAG node. |

#### Returns

`Promise`\<`undefined` \| [`DagNodeResponse`](DagNodeResponse.md)\>

A promise that resolves to a DagNodeResponse instance.

**`Example`**

```typescript
const bucketId: bigint = 1n;
const cidOrName = '...'; // CID or CNS name of the DAG node
const dagNode = await storageNode.getDagNode(bucketId, cidOrName);

console.log(dagNode);
```

#### Implementation of

[NodeInterface](../interfaces/NodeInterface.md).[getDagNode](../interfaces/NodeInterface.md#getdagnode)

___

### readPiece

▸ **readPiece**(`bucketId`, `cidOrName`, `options?`): `Promise`\<[`PieceResponse`](PieceResponse.md)\>

Reads a piece of data from a specific bucket.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucketId` | `bigint` | The ID of the bucket to read the piece from. |
| `cidOrName` | `string` | The CID or CNS name of the piece to read. |
| `options?` | `PieceReadOptions` | Optional parameters for reading the piece. |

#### Returns

`Promise`\<[`PieceResponse`](PieceResponse.md)\>

A promise that resolves to a PieceResponse instance.

**`Example`**

```typescript
const bucketId: BucketId = 1n;
const cidOrName = '...'; // CID or CNS name of the piece
const piece = await storageNode.readPiece(bucketId, cidOrName);

console.log(piece);
```

#### Implementation of

[NodeInterface](../interfaces/NodeInterface.md).[readPiece](../interfaces/NodeInterface.md#readpiece)

___

### resolveName

▸ **resolveName**(`bucketId`, `cidOrName`, `options?`): `Promise`\<`Cid`\>

Resolves a name to a CID in the Content Name System (CNS).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucketId` | `bigint` | - |
| `cidOrName` | `string` | - |
| `options?` | `CnsRecordGetOptions` | Optional parameters for resolving the name. |

#### Returns

`Promise`\<`Cid`\>

A promise that resolves to the CID corresponding to the CNS name.

**`Example`**

```typescript
const name: string = 'record-name';
const cid = await storageNode.resolveName(name, options);

console.log(cid);
```

#### Implementation of

[NodeInterface](../interfaces/NodeInterface.md).[resolveName](../interfaces/NodeInterface.md#resolvename)

___

### storeCnsRecord

▸ **storeCnsRecord**(`bucketId`, `record`, `options?`): `Promise`\<`Record`\>

Stores a Content Name System (CNS) record in a specific bucket.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucketId` | `bigint` | The ID of the bucket to store the CNS record in. |
| `record` | [`CnsRecord`](CnsRecord.md) | The CNS record to store. |
| `options?` | `OperationAuthOptions` | Optional parameters for storing the CNS record. |

#### Returns

`Promise`\<`Record`\>

A promise that resolves to the CID of the stored CNS record.

**`Example`**

```typescript
const bucketId: bigint = 1n;
const record: CnsRecord = new CnsRecord('CID', 'record-name');
const recordCid = await storageNode.storeCnsRecord(bucketId, record);

console.log(recordCid);
```

#### Implementation of

[NodeInterface](../interfaces/NodeInterface.md).[storeCnsRecord](../interfaces/NodeInterface.md#storecnsrecord)

___

### storeDagNode

▸ **storeDagNode**(`bucketId`, `node`, `options?`): `Promise`\<`string`\>

Stores a DAG node in a specific bucket.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucketId` | `bigint` | The ID of the bucket to store the DAG node in. |
| `node` | [`DagNode`](DagNode.md) | The DAGNode instance to store. |
| `options?` | `DagNodeStoreOptions` | Optional parameters for storing the DAG node. |

#### Returns

`Promise`\<`string`\>

A promise that resolves to the CID of the stored DAG node.

**`Example`**

```typescript
const bucketId: BucketId = 1n;
const firstLink = new Link('CID', 10, 'first-link');
const node: DagNode = new DagNode('node content', [firstLink]);
const nodeCid = await storageNode.storeDagNode(bucketId, node, {
 name: 'node-name', // CNS name for the DAG node
});

console.log(nodeCid);
```

#### Implementation of

[NodeInterface](../interfaces/NodeInterface.md).[storeDagNode](../interfaces/NodeInterface.md#storedagnode)

___

### storePiece

▸ **storePiece**(`bucketId`, `piece`, `options?`): `Promise`\<`string`\>

Stores a piece (raw or multipart) of data in a specific bucket.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucketId` | `bigint` | The ID of the bucket to store the piece in. |
| `piece` | [`Piece`](Piece.md) \| [`MultipartPiece`](MultipartPiece.md) | The instance of Piece or MultipartPiece. |
| `options?` | `PieceStoreOptions` | Optional parameters for storing the piece. |

#### Returns

`Promise`\<`string`\>

A promise that resolves to the CID of the stored piece.

**`Example`**

```typescript
const bucketId: BucketId = 1n;
const piece: Piece = new Piece(new Uint8Array([1, 2, 3]));
const pieceCid = await storageNode.storePiece(bucketId, piece);

console.log(pieceCid);
```

```typescript
const bucketId: BucketId = 1n;
const piece: MultipartPiece = new MultipartPiece(['CID1', 'CID2'], {
 partSize: 1024,
 totalSize: 2048,
});

const pieceCid = await storageNode.storePiece(bucketId, piece);

console.log(pieceCid);
```

#### Implementation of

[NodeInterface](../interfaces/NodeInterface.md).[storePiece](../interfaces/NodeInterface.md#storepiece)
