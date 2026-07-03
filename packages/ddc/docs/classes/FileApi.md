[@cere-ddc-sdk/ddc](../README.md) / FileApi

# Class: FileApi

The `FileApi` class provides methods to interact with the DDC File API.

**`Example`**

```typescript
import { FileApi, GrpcTransport } from '@cere-ddc-sdk/ddc';

const transport = new GrpcTransport(...);
const fileApi = new FileApi(transport);
```

## Methods

### getFile

▸ **getFile**(`request`): `Promise`\<`ContentStream`\>

Retrieves a file from DDC.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `request` | `GetFileRequest` | An object that includes the access token, the CID of the file to retrieve, and an optional range. |

#### Returns

`Promise`\<`ContentStream`\>

A stream of the file's content as a `ContentStream`.

**`Example`**

```typescript
const request: GetFileRequest = { token: '...', cid: '...' };

const contentStream = await fileApi.getFile(request);

for await (const chunk of contentStream) {
  console.log(chunk);
}
```

___

### putMultipartPiece

▸ **putMultipartPiece**(`request`): `Promise`\<`Uint8Array`\>

Stores a multipart piece in DDC.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `request` | `PutMultiPartPieceRequest` | An object that includes the access token, the part size, and the piece to store. |

#### Returns

`Promise`\<`Uint8Array`\>

The CID of the stored piece as a `Uint8Array`.

**`Example`**

```typescript
const request: PutMultiPartPieceRequest = {
  token: '...',
  partSize: 1024,
  piece: { ... }
};

const cid = await fileApi.putMultipartPiece(request);

console.log(cid);
```

___

### putRawPiece

▸ **putRawPiece**(`metadata`, `content`): `Promise`\<`Uint8Array`\>

Stores a raw piece in DDC.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `metadata` | `PutRawPieceMetadata` | An object that includes the access token and the metadata for the raw piece. |
| `content` | `Content` | The content of the raw piece as a `Content` object. |

#### Returns

`Promise`\<`Uint8Array`\>

The CID of the stored piece as a `Uint8Array`.

**`Throws`**

Will throw an error if the size of the raw piece cannot be determined, or if it exceeds the maximum size.

**`Example`**

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
