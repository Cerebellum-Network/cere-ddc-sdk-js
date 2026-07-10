[**@cere-ddc-sdk/ddc-client**](../README.md)

***

[@cere-ddc-sdk/ddc-client](../README.md) / FileResponse

# Class: FileResponse

Represents a response from a file read operation.

## Extends

- `PieceResponse`

## Properties

### body

> `readonly` **body**: `ContentStream`

The content of the piece response as a stream.

#### Inherited from

`PieceResponse.body`

## Accessors

### cid

#### Get Signature

> **get** **cid**(): `string`

The content identifier (CID) of the piece.

##### Returns

`string`

#### Inherited from

`PieceResponse.cid`

***

### hash

#### Get Signature

> **get** **hash**(): `Uint8Array`\<`ArrayBuffer`\>

The hash of the piece response content.

##### Returns

`Uint8Array`\<`ArrayBuffer`\>

#### Inherited from

`PieceResponse.hash`

***

### range

#### Get Signature

> **get** **range**(): `GetFileRequest_Request_Range` \| `undefined`

The range of the piece response.

##### Returns

`GetFileRequest_Request_Range` \| `undefined`

#### Inherited from

`PieceResponse.range`

## Methods

### arrayBuffer()

> **arrayBuffer**(): `Promise`\<`ArrayBuffer`\>

Converts the body stream of the piece to an `ArrayBuffer`.

#### Returns

`Promise`\<`ArrayBuffer`\>

The piece content as an `ArrayBuffer`.

#### Inherited from

`PieceResponse.arrayBuffer`

***

### json()

> **json**(): `Promise`\<`unknown`\>

Converts the body stream of the piece to a JSON object.

#### Returns

`Promise`\<`unknown`\>

The piece content as a JSON object.

#### Inherited from

`PieceResponse.json`

***

### text()

> **text**(): `Promise`\<`string`\>

Converts the body stream of the piece to a string.

#### Returns

`Promise`\<`string`\>

The piece content as a string.

#### Inherited from

`PieceResponse.text`
