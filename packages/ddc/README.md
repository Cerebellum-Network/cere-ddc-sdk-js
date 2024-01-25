# @cere-ddc-sdk/ddc

> The package is used internally in [@cere-ddc-sdk/ddc-client](/packages/ddc-client)

The package provides API for interacting directly with DDC Storage and CDN nodes.

# Installation

Using `NPM`:

```bash
npm install @cere-ddc-sdk/ddc --save
```

Using `yarn`:

```bash
yarn add @cere-ddc-sdk/ddc
```

# API

- [CnsApi](#cnsapi)
  - [putRecord()](#putrecord)
  - [getRecord()](#getrecord)
- [DagApi](#dagapi)
  - [putNode()](#putnode)
  - [getNode()](#getnode)
- [FileApi](#fileapi)
  - [putMultipartPiece()](#putmultipartpiece)
  - [putRawPiece()](#putrawpiece)
  - [getFile()](#getfile)

## CnsApi

The `CnsApi` provides methods to interact with the DDC CNS API.

### Constructor

Creates a new instance of `CnsApi`.

#### Arguments

- `transport` - An instance of `RpcTransport`.
- `options` - An optional `CnsApiOptions` object.

#### Example

```typescript
import { CnsApi, GrpcTransport } from '@cere-ddc-sdk/ddc';

const transport = new GrpcTransport(...);
const cnsApi = new CnsApi(transport);
```

### putRecord()

Stores a CNS record to DDC.

#### Arguments

- `request` - An object that includes the token, bucket ID, and record to store.

#### Returns

The stored record with its signature.

#### Example

```typescript
const request: PutRequest = {
  token: '...',
  bucketId: '...',
  record: { ... }
};

const record = await cnsApi.putRecord(request);

console.log(record);
```

## DagApi

The `DagApi` provides methods to interact with the DDC DAG API.

### Constructor

Creates a new instance of `DagApi`.

#### Arguments

- `transport` - An instance of `RpcTransport`.
- `options` - An optional `DagApiOptions` object.

#### Example

```typescript
import { DagApi, GrpcTransport } from '@cere-ddc-sdk/ddc';
 
const transport = new GrpcTransport(...);
const dagApi = new DagApi(transport);
```

### putNode()

Stores a node in DDC DAG.

#### Arguments

- `request` - An object that includes the access token and the node to store.

#### Returns

The CID of the stored node as a `Uint8Array`.

#### Example

```typescript
const request: PutRequest = { token: '...', node: { ... } };
const cid = await dagApi.putNode(request);

console.log(cid);
```

### getNode()

Retrieves a DAG node from DDC.

#### Arguments

- `request` - An object that includes the access token and the CID of the node to retrieve.

#### Returns

The retrieved node as a `Node` object, or `undefined` if the node does not exist.

#### Example

```typescript
const request: GetRequest = { token: '...', cid: '...' };
const node = await dagApi.getNode(request);

console.log(node);
```

## FileApi

The `FileApi` provides methods to interact with the DDC File API.

### Constructor

Creates a new instance of `FileApi`.

#### Arguments

- `transport` - An instance of `RpcTransport`.
- `options` - An optional `FileApiOptions` object.

### Example

```typescript
import { FileApi, GrpcTransport } from '@cere-ddc-sdk/ddc';

const transport = new GrpcTransport(...);
const fileApi = new FileApi(transport);
```

### putMultipartPiece()

Stores a multipart piece in DDC.

#### Parameters

- `request`: An object that includes the access token, the part size, and the piece to store.

#### Returns

The CID of the stored piece as a `Uint8Array`.

#### Example

```typescript
const request: PutMultiPartPieceRequest = {
  token: '...',
  partSize: 1024,
  piece: { ... }
};

const cid = await fileApi.putMultipartPiece(request);

console.log(cid);
```

### putRawPiece()

Stores a raw piece in DDC.

#### Parameters

- `metadata` - An object that includes the access token and the metadata for the raw piece.
- `content` - The content of the raw piece as a `Content` object.

#### Returns

The CID of the stored piece as a `Uint8Array`.

#### Throws

Will throw an error if the size of the raw piece cannot be determined, or if it exceeds the maximum size.

#### Example

```typescript
const content: Content = ...;
const metadata: PutRawPieceMetadata = {
  token: '...',
  bucketId: '...',
  ...
};

const cid = await fileApi.putRawPiece(metadata, content);

console.log(cid);
```

### getFile()

Retrieves a file from DDC.

#### Parameters

- `request` - An object that includes the access token, the CID of the file to retrieve, and an optional range.

#### Returns

A stream of the file's content as a `ContentStream`.

#### Example

```typescript
const request: GetFileRequest = { token: '...', cid: '...' };

const contentStream = await fileApi.getFile(request);

for await (const chunk of contentStream) {
  console.log(chunk);
}
```

# Links

- [Tests](/tests/specs/StorageNode.spec.ts)