[**@cere-ddc-sdk/ddc**](../README.md)

***

[@cere-ddc-sdk/ddc](../README.md) / PieceResponse

# Class: PieceResponse

The `PieceResponse` class represents a response for a piece content.

## Accessors

### cid

#### Get Signature

> **get** **cid**(): `string`

The content identifier (CID) of the piece.

##### Returns

`string`

***

### hash

#### Get Signature

> **get** **hash**(): `Uint8Array`\<`ArrayBuffer`\>

The hash of the piece response content.

##### Returns

`Uint8Array`\<`ArrayBuffer`\>

***

### range

#### Get Signature

> **get** **range**(): `GetFileRequest_Request_Range` \| `undefined`

The range of the piece response.

##### Returns

`GetFileRequest_Request_Range` \| `undefined`

## Methods

### arrayBuffer()

> **arrayBuffer**(): `Promise`\<`ArrayBuffer`\>

Converts the body stream of the piece to an `ArrayBuffer`.

#### Returns

`Promise`\<`ArrayBuffer`\>

The piece content as an `ArrayBuffer`.

***

### json()

> **json**(): `Promise`\<`unknown`\>

Converts the body stream of the piece to a JSON object.

#### Returns

`Promise`\<`unknown`\>

The piece content as a JSON object.

***

### text()

> **text**(): `Promise`\<`string`\>

Converts the body stream of the piece to a string.

#### Returns

`Promise`\<`string`\>

The piece content as a string.

## Properties

### body

> `readonly` **body**: `ContentStream`

The content of the piece response as a stream.
