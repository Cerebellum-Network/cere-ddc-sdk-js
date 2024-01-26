[@cere-ddc-sdk/ddc](../README.md) / PieceResponse

# Class: PieceResponse

The `PieceResponse` class represents a response for a piece content.

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
