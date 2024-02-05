[@cere-ddc-sdk/ddc-client](../README.md) / FileResponse

# Class: FileResponse

Represents a response from a file read operation.

## Hierarchy

- `PieceResponse`

  ↳ **`FileResponse`**

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
