[@cere-ddc-sdk/file-storage](../README.md) / FileResponse

# Class: FileResponse

Represents a response from a file read operation.

## Hierarchy

- `PieceResponse`

  ↳ **`FileResponse`**

## Properties

### body

• `Readonly` **body**: `ContentStream`

The content of the piece response as a stream.

#### Inherited from

PieceResponse.body

## Accessors

### cid

• `get` **cid**(): `string`

The content identifier (CID) of the piece.

#### Returns

`string`

#### Inherited from

PieceResponse.cid

___

### hash

• `get` **hash**(): `Uint8Array`

The hash of the piece response content.

#### Returns

`Uint8Array`

#### Inherited from

PieceResponse.hash

___

### range

• `get` **range**(): `undefined` \| `GetFileRequest_Request_Range`

The range of the piece response.

#### Returns

`undefined` \| `GetFileRequest_Request_Range`

#### Inherited from

PieceResponse.range

## Methods

### arrayBuffer

▸ **arrayBuffer**(): `Promise`\<`ArrayBuffer`\>

Converts the body stream of the piece to an `ArrayBuffer`.

#### Returns

`Promise`\<`ArrayBuffer`\>

The piece content as an `ArrayBuffer`.

#### Inherited from

PieceResponse.arrayBuffer

___

### json

▸ **json**(): `Promise`\<`unknown`\>

Converts the body stream of the piece to a JSON object.

#### Returns

`Promise`\<`unknown`\>

The piece content as a JSON object.

#### Inherited from

PieceResponse.json

___

### text

▸ **text**(): `Promise`\<`string`\>

Converts the body stream of the piece to a string.

#### Returns

`Promise`\<`string`\>

The piece content as a string.

#### Inherited from

PieceResponse.text
