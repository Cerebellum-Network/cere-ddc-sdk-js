[@cere-ddc-sdk/ddc](../README.md) / PieceResponse

# Class: PieceResponse

The `PieceResponse` class represents a response for a piece content.

## Accessors

### cid

• `get` **cid**(): `string`

The content identifier (CID) of the piece.

#### Returns

`string`

___

### hash

• `get` **hash**(): `Uint8Array`

The hash of the piece response content.

#### Returns

`Uint8Array`

___

### range

• `get` **range**(): `undefined` \| `GetFileRequest_Request_Range`

The range of the piece response.

#### Returns

`undefined` \| `GetFileRequest_Request_Range`

## Methods

### arrayBuffer

▸ **arrayBuffer**(): `Promise`\<`ArrayBuffer`\>

Converts the body stream of the piece to an `ArrayBuffer`.

#### Returns

`Promise`\<`ArrayBuffer`\>

The piece content as an `ArrayBuffer`.

___

### json

▸ **json**(): `Promise`\<`unknown`\>

Converts the body stream of the piece to a JSON object.

#### Returns

`Promise`\<`unknown`\>

The piece content as a JSON object.

___

### text

▸ **text**(): `Promise`\<`string`\>

Converts the body stream of the piece to a string.

#### Returns

`Promise`\<`string`\>

The piece content as a string.

## Properties

### body

• `Readonly` **body**: `ContentStream`

The content of the piece response as a stream.
